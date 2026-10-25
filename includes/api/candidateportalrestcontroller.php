<?php
/**
 * REST Controller for Candidate Self-Service Portal & Verification.
 *
 * @package WpExam\Api
 */

declare(strict_types=1);

namespace WpExam\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use Throwable;
use WpExam\Database\SqliteDatabase;
use WpExam\Http\EnvelopeBuilder;

class CandidatePortalRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    private const PORTAL_STEPS = [
        [
            'id'          => 'step_welcome',
            'title'       => 'Profile Verification & Welcome',
            'description' => 'Confirm your applicant identity and contact details.',
            'step_number' => 1,
            'is_required' => true,
        ],
        [
            'id'          => 'step_nda',
            'title'       => 'Confidentiality & NDA Agreement',
            'description' => 'Review and sign organizational confidentiality policies.',
            'step_number' => 2,
            'is_required' => true,
        ],
        [
            'id'          => 'step_assessment',
            'title'       => 'Technical Assessment & Skills Verification',
            'description' => 'Complete the interactive timed evaluation module.',
            'step_number' => 3,
            'is_required' => true,
        ],
        [
            'id'          => 'step_submission',
            'title'       => 'Work Sample & Video Introduction',
            'description' => 'Provide introductory video responses or portfolio attachments.',
            'step_number' => 4,
            'is_required' => true,
        ],
        [
            'id'          => 'step_complete',
            'title'       => 'Final Review & Verification Receipt',
            'description' => 'Submit complete verification packet and download confirmation.',
            'step_number' => 5,
            'is_required' => true,
        ],
    ];

    public function register_routes(): void {
        register_rest_route($this->namespace, '/portal/(?P<token>[A-Za-z0-9_-]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getPortalSession'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/portal/(?P<token>[A-Za-z0-9_-]+)/complete-step', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'completePortalStep'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    public function getPortalSession(WP_REST_Request $request): WP_REST_Response {
        $token = trim((string) $request->get_param('token'));
        $hasToken = (strlen($token) > 0);

        if (!$hasToken) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid portal token is required'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $candidateData = $this->resolveCandidate($db, $token);

        $completions = $db->query('SELECT step_id, step_data_json, completed_at FROM portal_step_completions WHERE token = ?', [$token]);
        $completedMap = [];

        foreach ($completions as $c) {
            $stepId = (string) $c['step_id'];
            $completedMap[$stepId] = [
                'completed_at' => $c['completed_at'],
                'data'         => json_decode((string) ($c['step_data_json'] ?? '{}'), true) ?: [],
            ];
        }

        $steps = [];
        $completedCount = 0;

        foreach (self::PORTAL_STEPS as $stepDef) {
            $sId = $stepDef['id'];
            $isStepDone = isset($completedMap[$sId]);

            if ($isStepDone) {
                $completedCount++;
            }

            $steps[] = [
                'id'           => $sId,
                'title'        => $stepDef['title'],
                'description'  => $stepDef['description'],
                'step_number'  => $stepDef['step_number'],
                'is_required'  => $stepDef['is_required'],
                'is_completed' => $isStepDone,
                'completed_at' => $completedMap[$sId]['completed_at'] ?? null,
                'data'         => $completedMap[$sId]['data'] ?? null,
            ];
        }

        $totalSteps = count(self::PORTAL_STEPS);
        $percentage = ($totalSteps > 0) ? (int) round(($completedCount / $totalSteps) * 100) : 0;
        $isAllCompleted = ($completedCount === $totalSteps);

        $gatingMode = $db->getSetting('assessment_gating_mode', 'admin_approval');
        $stageKey = $candidateData['current_stage_key'] ?? '';
        $isAssessmentApproved = ($gatingMode === 'instant_self_service') || in_array($stageKey, ['assessment', 'exam', 'interview', 'offered', 'hired'], true);

        $rawTasksJson = (string) ($candidateData['assigned_tasks_json'] ?? '[]');
        $decodedTasks = json_decode($rawTasksJson, true);
        $assignedTasks = is_array($decodedTasks) ? $decodedTasks : [];

        $hasAssignedTasks = !empty($assignedTasks);

        if (!$hasAssignedTasks) {
            $assignedTasks = [
                [
                    'id'           => 'task_pre_hire_eval',
                    'title'        => 'Technical Assessment & Skills Verification',
                    'type'         => 'assessment',
                    'slug'         => 'technical-assessment',
                    'due_date'     => 'Within 5 days',
                    'notes'        => 'Complete all 5 verification steps including technical evaluation.',
                    'status'       => $isAllCompleted ? 'completed' : ($completedCount > 0 ? 'in_progress' : 'not_started'),
                    'assigned_at'  => $candidateData['created_at'] ?? date('Y-m-d H:i:s'),
                    'completed_at' => $isAllCompleted ? ($candidateData['updated_at'] ?? date('Y-m-d H:i:s')) : null,
                    'score'        => isset($candidateData['score']) ? (float) $candidateData['score'] : null,
                ],
            ];

            $isHired = ($stageKey === 'hired');

            if ($isHired) {
                $assignedTasks[] = [
                    'id'           => 'task_onboarding_chk',
                    'title'        => 'Employee Onboarding & Security Checklist',
                    'type'         => 'checklist',
                    'slug'         => 'onboarding-checklist',
                    'due_date'     => 'Before Day 1',
                    'notes'        => 'Hardware setup, IT security, and compliance verification.',
                    'status'       => 'not_started',
                    'assigned_at'  => date('Y-m-d H:i:s'),
                    'completed_at' => null,
                    'score'        => null,
                ];
            }
        }

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'token'                  => $token,
            'candidate'              => $candidateData,
            'assessment_gating_mode' => $gatingMode,
            'is_assessment_approved' => $isAssessmentApproved,
            'steps'                  => $steps,
            'assigned_tasks'         => $assignedTasks,
            'completed_step_count'  => $completedCount,
            'total_step_count'      => $totalSteps,
            'completion_percentage' => $percentage,
            'is_fully_verified'     => $isAllCompleted,
        ]), 200);
    }

    public function completePortalStep(WP_REST_Request $request): WP_REST_Response {
        $token = trim((string) $request->get_param('token'));
        $body = $request->get_json_params() ?: [];
        $stepId = trim((string) ($body['step_id'] ?? ''));
        $stepData = $body['step_data'] ?? [];

        $hasToken = (strlen($token) > 0);

        if (!$hasToken) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid portal token is required'), 400);
        }

        $hasStepId = (strlen($stepId) > 0);

        if (!$hasStepId) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid step_id is required'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $jsonData = json_encode($stepData);

        $sql = 'INSERT INTO portal_step_completions (token, step_id, step_data_json, completed_at)
                VALUES (?, ?, ?, datetime("now"))
                ON CONFLICT(token, step_id) DO UPDATE SET step_data_json = excluded.step_data_json, completed_at = excluded.completed_at';

        $db->execute($sql, [$token, $stepId, $jsonData]);

        $isAssessmentStep = ($stepId === 'step_assessment');

        if ($isAssessmentStep) {
            $hasScore = isset($stepData['score']);

            if ($hasScore) {
                $scoreVal = (float) $stepData['score'];
                $tabSwitchCount = (int) ($stepData['tab_switch_count'] ?? 0);
                $integrityStatus = sanitize_text_field((string) ($stepData['integrity_status'] ?? 'clean'));

                $db->execute(
                    'UPDATE applicants SET score = ?, tab_switch_count = ?, integrity_status = ?, updated_at = datetime("now") WHERE candidate_email = ? OR candidate_email LIKE ? OR id = ?',
                    [$scoreVal, $tabSwitchCount, $integrityStatus, $token, $token . '@%', (int) $token]
                );
            }
        }

        // If completing final step, advance recruitment stage if matching applicant exists
        $isFinalStep = ($stepId === 'step_complete');

        if ($isFinalStep) {
            $candidate = $this->resolveCandidate($db, $token);
            $applicantId = (int) ($candidate['id'] ?? 0);
            $hasApplicantId = ($applicantId > 0);

            if ($hasApplicantId) {
                $db->execute("UPDATE applicants SET current_stage_key = 'exam', updated_at = datetime('now') WHERE id = ?", [$applicantId]);
                $db->execute('INSERT INTO applicant_transitions (applicant_id, from_stage_key, to_stage_key, moved_by_user_id, notes) VALUES (?, ?, ?, ?, ?)', [
                    $applicantId,
                    'applied',
                    'exam',
                    0,
                    'Applicant completed self-service portal verification steps.',
                ]);
            }
        }

        return $this->getPortalSession($request);
    }

    private function resolveCandidate(SqliteDatabase $db, string $token): array {
        // First check user_invites
        $inviteRows = $db->query('SELECT * FROM user_invites WHERE invite_token = ? LIMIT 1', [$token]);
        $invite = $inviteRows[0] ?? null;
        $hasInvite = ($invite !== null);

        if ($hasInvite) {
            $email = (string) $invite['email'];
            $appRows = $db->query('SELECT * FROM applicants WHERE candidate_email = ? LIMIT 1', [$email]);
            $existingApp = $appRows[0] ?? null;
            $hasApp = ($existingApp !== null);

            if ($hasApp) {
                return $existingApp;
            }

            return [
                'id'                => 0,
                'candidate_name'    => 'Candidate',
                'candidate_email'   => $email,
                'phone'             => '',
                'current_stage_key' => 'applied',
                'notes'             => 'Invited candidate session',
                'score'             => null,
            ];
        }

        // Second check applicants by email, email prefix, or numeric ID
        $appRows = $db->query(
            'SELECT * FROM applicants WHERE candidate_email = ? OR candidate_email LIKE ? OR id = ? LIMIT 1',
            [$token, $token . '@%', (int) $token]
        );
        $directApplicant = $appRows[0] ?? null;
        $hasDirect = ($directApplicant !== null);

        if ($hasDirect) {
            return $directApplicant;
        }

        // Third check latest applicant or default demo
        $applicantRows = $db->query('SELECT * FROM applicants ORDER BY id DESC LIMIT 1');
        $fallbackApplicant = $applicantRows[0] ?? null;
        $hasFallback = ($fallbackApplicant !== null);

        if ($hasFallback) {
            return $fallbackApplicant;
        }

        return [
            'id'                => 1,
            'candidate_name'    => 'Alex Morgan',
            'candidate_email'   => 'alex.morgan@example.com',
            'phone'             => '+1 (555) 345-6789',
            'current_stage_key' => 'applied',
            'notes'             => 'Candidate Self-Service Verification Session',
            'score'             => 100,
        ];
    }
}

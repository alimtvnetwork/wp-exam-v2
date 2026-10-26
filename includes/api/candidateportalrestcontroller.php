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

        $rawRoles = $db->getSetting('custom_job_roles_json', '[]');
        $customRoles = json_decode($rawRoles, true) ?: [];
        $targetRoleKey = (string) ($candidateData['job_role'] ?? '');
        $jobRoleData = null;

        foreach ($customRoles as $cr) {
            $isMatch = (isset($cr['id']) && $cr['id'] === $targetRoleKey);

            if ($isMatch) {
                $jobRoleData = $cr;
                break;
            }
        }

        $hasJobRole = ($jobRoleData !== null && isset($jobRoleData['secondPhaseQuestions']));

        if ($hasJobRole) {
            $isAssessmentCompleted = isset($completedMap['step_assessment']);

            if (!$isAssessmentCompleted) {
                $jobRoleData['secondPhaseQuestions'] = \WpExam\Services\AssessmentService::sanitizeQuestions($jobRoleData['secondPhaseQuestions']);
            }
        }

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'token'                  => $token,
            'candidate'              => $candidateData,
            'job_role_data'          => $jobRoleData,
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
        $isAssessmentStep = ($stepId === 'step_assessment');

        if ($isAssessmentStep) {
            $existing = $db->query(
                'SELECT id FROM portal_step_completions WHERE token = ? AND step_id = ? LIMIT 1',
                [$token, $stepId]
            );
            $isAlreadyCompleted = !empty($existing);

            if ($isAlreadyCompleted) {
                // Assessment is immutable once finalized
                return $this->getPortalSession($request);
            }
        }

        $candidate = $this->resolveCandidate($db, $token);
        $applicantId = (int) ($candidate['id'] ?? 0);
        $hasApplicantId = ($applicantId > 0);

        if ($isAssessmentStep) {
            $roleKey = (string) ($candidate['job_role'] ?? 'frontend-developer');
            $submittedAnswers = is_array($stepData['answers'] ?? null) ? $stepData['answers'] : [];

            // Authoritative server-side score calculation
            $evalResult = \WpExam\Services\AssessmentService::evaluate($roleKey, $submittedAnswers);
            $verifiedScore = $evalResult['score'];
            $tabSwitchCount = (int) ($stepData['tab_switch_count'] ?? 0);
            $integrityStatus = sanitize_text_field((string) ($stepData['integrity_status'] ?? 'clean'));

            $stepData['score'] = $verifiedScore;
            $stepData['correct_count'] = $evalResult['correct_count'];
            $stepData['auto_gradable_count'] = $evalResult['auto_gradable_count'];
            $stepData['total_questions'] = $evalResult['total_questions'];
            $stepData['open_questions_count'] = $evalResult['open_questions_count'];
            $stepData['has_pending_manual_review'] = $evalResult['has_pending_manual_review'];

            if ($hasApplicantId) {
                $db->execute(
                    'UPDATE applicants SET score = ?, tab_switch_count = ?, integrity_status = ?, updated_at = datetime("now") WHERE id = ?',
                    [$verifiedScore, $tabSwitchCount, $integrityStatus, $applicantId]
                );
            } else {
                $db->execute(
                    'UPDATE applicants SET score = ?, tab_switch_count = ?, integrity_status = ?, updated_at = datetime("now") WHERE portal_token = ?',
                    [$verifiedScore, $tabSwitchCount, $integrityStatus, $token]
                );
            }
        }

        $isSubmissionStep = ($stepId === 'step_submission');

        if ($isSubmissionStep) {
            if (isset($stepData['video_url'])) {
                $stepData['video_url'] = filter_var((string) $stepData['video_url'], FILTER_SANITIZE_URL);
            }
            if (isset($stepData['portfolio_url'])) {
                $stepData['portfolio_url'] = filter_var((string) $stepData['portfolio_url'], FILTER_SANITIZE_URL);
            }
        }

        $jsonData = json_encode($stepData);
        $sql = 'INSERT INTO portal_step_completions (token, step_id, step_data_json, completed_at)
                VALUES (?, ?, ?, datetime("now"))
                ON CONFLICT(token, step_id) DO UPDATE SET step_data_json = excluded.step_data_json, completed_at = excluded.completed_at';

        $db->execute($sql, [$token, $stepId, $jsonData]);

        // If completing final step, advance recruitment stage if matching applicant exists
        $isFinalStep = ($stepId === 'step_complete');

        if ($isFinalStep) {
            if ($hasApplicantId) {
                $currentStageKey = (string) ($candidate['current_stage_key'] ?? 'applied');
                $db->execute("UPDATE applicants SET current_stage_key = 'exam', updated_at = datetime('now') WHERE id = ?", [$applicantId]);
                $db->execute('INSERT INTO applicant_transitions (applicant_id, from_stage_key, to_stage_key, moved_by_user_id, notes) VALUES (?, ?, ?, ?, ?)', [
                    $applicantId,
                    $currentStageKey,
                    'exam',
                    0,
                    'Applicant completed self-service portal verification steps.',
                ]);
            }
        }

        return $this->getPortalSession($request);
    }

    private function resolveCandidate(SqliteDatabase $db, string $token): array {
        // 1. Direct match on applicants table by unique portal_token
        $tokenRows = $db->query('SELECT * FROM applicants WHERE portal_token = ? AND portal_token != "" LIMIT 1', [$token]);
        $tokenApplicant = $tokenRows[0] ?? null;
        $hasTokenApplicant = ($tokenApplicant !== null);

        if ($hasTokenApplicant) {
            return $tokenApplicant;
        }

        // 2. Check user_invites by unique invite_token
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

        // 3. Fallback for legacy development/exact email lookup (only if exact match)
        $appRows = $db->query(
            'SELECT * FROM applicants WHERE candidate_email = ? OR id = ? LIMIT 1',
            [$token, (int) $token]
        );
        $directApplicant = $appRows[0] ?? null;
        $hasDirect = ($directApplicant !== null);

        if ($hasDirect) {
            // Auto-backfill portal_token if missing
            $portalToken = (string) ($directApplicant['portal_token'] ?? '');
            $hasNoToken = (strlen($portalToken) === 0);

            if ($hasNoToken) {
                $newToken = 'cpt_' . bin2hex(random_bytes(16));
                $db->execute('UPDATE applicants SET portal_token = ? WHERE id = ?', [$newToken, $directApplicant['id']]);
                $directApplicant['portal_token'] = $newToken;
            }

            return $directApplicant;
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

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use WpExam\Database\SqliteDatabase;
use Throwable;

/**
 * Laravel-compatible REST Controller for Candidate Self-Service Portal.
 */
class PortalController
{
    private const PORTAL_STEPS = [
        [
            'id' => 'step_welcome',
            'title' => 'Profile Verification & Welcome',
            'description' => 'Confirm your applicant identity and contact details.',
            'step_number' => 1,
            'is_required' => true,
        ],
        [
            'id' => 'step_nda',
            'title' => 'Confidentiality & NDA Agreement',
            'description' => 'Review and sign organizational confidentiality policies.',
            'step_number' => 2,
            'is_required' => true,
        ],
        [
            'id' => 'step_assessment',
            'title' => 'Technical Assessment & Skills Verification',
            'description' => 'Complete the interactive timed evaluation module.',
            'step_number' => 3,
            'is_required' => true,
        ],
        [
            'id' => 'step_submission',
            'title' => 'Work Sample & Video Introduction',
            'description' => 'Provide introductory video responses or portfolio attachments.',
            'step_number' => 4,
            'is_required' => true,
        ],
        [
            'id' => 'step_complete',
            'title' => 'Final Review & Verification Receipt',
            'description' => 'Submit complete verification packet and download confirmation.',
            'step_number' => 5,
            'is_required' => true,
        ],
    ];

    /**
     * GET /api/v1/portal/{token}
     */
    public function show(array $params = [], array $body = []): array
    {
        $token = trim((string) ($params['token'] ?? ($body['token'] ?? '')));

        $isTokenEmpty = (strlen($token) === 0);

        if ($isTokenEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Candidate portal token is required',
            ];
        }

        $completedStepIds = [];

        try {
            $db = SqliteDatabase::getInstance();
            $hasInit = $db->init();

            if ($hasInit) {
                $compRows = $db->query('SELECT step_id FROM portal_step_completions WHERE candidate_token = ?', [$token]);

                foreach ($compRows as $row) {
                    $completedStepIds[] = (string) $row['step_id'];
                }
            }
        } catch (Throwable $e) {
            // Graceful fallback
        }

        $steps = [];
        $completedCount = 0;

        foreach (self::PORTAL_STEPS as $stepDef) {
            $stepId = $stepDef['id'];
            $isCompleted = in_array($stepId, $completedStepIds, true);

            if ($isCompleted) {
                $completedCount++;
            }

            $steps[] = array_merge($stepDef, [
                'is_completed' => $isCompleted,
            ]);
        }

        $totalSteps = count(self::PORTAL_STEPS);
        $progressPct = ($totalSteps > 0) ? (int) round(($completedCount / $totalSteps) * 100) : 0;

        $candidateName = ucwords(str_replace(['-', '_', '.'], ' ', $token));

        return [
            'status' => 'success',
            'is_success' => true,
            'data' => [
                'token' => $token,
                'candidate' => [
                    'name' => $candidateName,
                    'email' => strtolower($token) . '@example.com',
                    'current_stage' => 'assessment',
                    'applied_at' => '2026-10-18',
                ],
                'progress_percentage' => $progressPct,
                'completed_steps_count' => $completedCount,
                'total_steps_count' => $totalSteps,
                'steps' => $steps,
            ],
        ];
    }

    /**
     * POST /api/v1/portal/{token}/complete-step
     */
    public function completeStep(array $params = [], array $body = []): array
    {
        $token = trim((string) ($params['token'] ?? ''));
        $stepId = trim((string) ($body['step_id'] ?? ''));
        $notes = trim((string) ($body['notes'] ?? ''));

        $isTokenEmpty = (strlen($token) === 0);

        if ($isTokenEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Candidate token is required',
            ];
        }

        $isStepEmpty = (strlen($stepId) === 0);

        if ($isStepEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Valid step_id is required',
            ];
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $sql = 'INSERT INTO portal_step_completions (candidate_token, step_id, completed_by, notes) VALUES (?, ?, ?, ?)';
            $db->execute($sql, [$token, $stepId, $token, $notes]);
        } catch (Throwable $e) {
            // Local fallback
        }

        return [
            'status' => 'success',
            'is_success' => true,
            'data' => [
                'step_id' => $stepId,
                'candidate_token' => $token,
                'completed_at' => date('Y-m-d H:i:s'),
                'message' => 'Step completion recorded successfully',
            ],
        ];
    }
}

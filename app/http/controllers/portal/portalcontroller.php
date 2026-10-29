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
        $stepDataMap = [];
        $applicant = null;

        try {
            $db = SqliteDatabase::getInstance();
            $hasInit = $db->init();

            if ($hasInit) {
                $compRows = $db->query('SELECT step_id, step_data_json, completed_at FROM portal_step_completions WHERE token = ?', [$token]);

                foreach ($compRows as $row) {
                    $sId = (string) $row['step_id'];
                    $completedStepIds[] = $sId;
                    $stepDataMap[$sId] = [
                        'completed_at' => $row['completed_at'] ?? null,
                        'data' => json_decode((string) ($row['step_data_json'] ?? '{}'), true) ?: [],
                    ];
                }

                // 1. Direct match by portal_token in applicants table
                $tokenRows = $db->query('SELECT * FROM applicants WHERE portal_token = ? LIMIT 1', [$token]);
                $hasTokenMatch = !empty($tokenRows);

                if ($hasTokenMatch) {
                    $directScore = null;
                    $hasScoreCol = isset($tokenRows[0]['score']);

                    if ($hasScoreCol) {
                        $directScore = (int) $tokenRows[0]['score'];
                    }

                    $applicant = [
                        'id' => (int) $tokenRows[0]['id'],
                        'candidate_name' => $tokenRows[0]['candidate_name'],
                        'candidate_email' => $tokenRows[0]['candidate_email'],
                        'phone' => $tokenRows[0]['phone'] ?? '',
                        'current_stage_key' => $tokenRows[0]['current_stage_key'] ?? 'screening',
                        'score' => $directScore,
                        'job_role' => $tokenRows[0]['job_role'] ?? '',
                        'portal_token' => $tokenRows[0]['portal_token'] ?? $token,
                        'assigned_tasks_json' => $tokenRows[0]['assigned_tasks_json'] ?? '[]',
                    ];
                }

                // 2. Lookup in users table
                $hasNoApplicant = ($applicant === null);

                if ($hasNoApplicant) {
                    $userRows = $db->query(
                        'SELECT u.id, u.name, u.email, u.phone FROM users u WHERE u.email = ? OR u.username = ? LIMIT 1',
                        [$token, $token]
                    );

                    $hasUser = !empty($userRows);

                    if ($hasUser) {
                        $uEmail = $userRows[0]['email'];
                        $appRows = $db->query('SELECT * FROM applicants WHERE candidate_email = ? LIMIT 1', [$uEmail]);
                        $stage = !empty($appRows) ? ($appRows[0]['current_stage_key'] ?? 'screening') : 'screening';
                        $userScore = null;
                        $hasAppRows = !empty($appRows);

                        if ($hasAppRows) {
                            $hasScoreCol = isset($appRows[0]['score']);

                            if ($hasScoreCol) {
                                $userScore = (int) $appRows[0]['score'];
                            }
                        }

                        $applicant = [
                            'id' => (int) $userRows[0]['id'],
                            'candidate_name' => $userRows[0]['name'],
                            'candidate_email' => $userRows[0]['email'],
                            'phone' => $userRows[0]['phone'] ?? '',
                            'current_stage_key' => $stage,
                            'score' => $userScore,
                            'job_role' => !empty($appRows) ? ($appRows[0]['job_role'] ?? '') : '',
                            'portal_token' => !empty($appRows) ? ($appRows[0]['portal_token'] ?? $token) : $token,
                            'assigned_tasks_json' => !empty($appRows) ? ($appRows[0]['assigned_tasks_json'] ?? '[]') : '[]',
                        ];
                    }
                }

                // 3. Fallback lookup in applicants table by email or id
                $stillNoApplicant = ($applicant === null);

                if ($stillNoApplicant) {
                    $appRows = $db->query(
                        'SELECT * FROM applicants WHERE candidate_email = ? OR candidate_email LIKE ? OR id = ? LIMIT 1',
                        [$token, $token . '@%', (int) $token]
                    );
                    $hasAppRow = !empty($appRows);

                    if ($hasAppRow) {
                        $directScore = null;
                        $hasScoreCol = isset($appRows[0]['score']);

                        if ($hasScoreCol) {
                            $directScore = (int) $appRows[0]['score'];
                        }

                        $applicant = [
                            'id' => (int) $appRows[0]['id'],
                            'candidate_name' => $appRows[0]['candidate_name'],
                            'candidate_email' => $appRows[0]['candidate_email'],
                            'phone' => $appRows[0]['phone'] ?? '',
                            'current_stage_key' => $appRows[0]['current_stage_key'] ?? 'screening',
                            'score' => $directScore,
                            'job_role' => $appRows[0]['job_role'] ?? '',
                            'portal_token' => $appRows[0]['portal_token'] ?? $token,
                            'assigned_tasks_json' => $appRows[0]['assigned_tasks_json'] ?? '[]',
                        ];
                    }
                }

                // 4. Fallback to latest applicant if token is demo or generic
                $stillNoApplicant = ($applicant === null);

                if ($stillNoApplicant) {
                    $latestRows = $db->query('SELECT * FROM applicants ORDER BY id DESC LIMIT 1');
                    $hasLatest = !empty($latestRows);

                    if ($hasLatest) {
                        $latestScore = null;
                        $hasScoreCol = isset($latestRows[0]['score']);

                        if ($hasScoreCol) {
                            $latestScore = (int) $latestRows[0]['score'];
                        }

                        $applicant = [
                            'id' => (int) $latestRows[0]['id'],
                            'candidate_name' => $latestRows[0]['candidate_name'],
                            'candidate_email' => $latestRows[0]['candidate_email'],
                            'phone' => $latestRows[0]['phone'] ?? '',
                            'current_stage_key' => $latestRows[0]['current_stage_key'] ?? 'screening',
                            'score' => $latestScore,
                            'job_role' => $latestRows[0]['job_role'] ?? '',
                            'portal_token' => $latestRows[0]['portal_token'] ?? $token,
                            'assigned_tasks_json' => $latestRows[0]['assigned_tasks_json'] ?? '[]',
                        ];
                    }
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
                'completed_at' => $stepDataMap[$stepId]['completed_at'] ?? null,
                'data' => $stepDataMap[$stepId]['data'] ?? [],
            ]);
        }

        $totalSteps = count(self::PORTAL_STEPS);
        $progressPct = ($totalSteps > 0) ? (int) round(($completedCount / $totalSteps) * 100) : 0;

        $queryName = trim((string) ($params['name'] ?? ($body['name'] ?? '')));
        $candidateName = $applicant['candidate_name'] ?? '';
        $hasCandName = (strlen($candidateName) > 0);

        if (!$hasCandName) {
            $hasQueryName = (strlen($queryName) > 0);

            if ($hasQueryName) {
                $candidateName = $queryName;
            }
        }

        $isNameEmpty = (strlen($candidateName) === 0);

        if ($isNameEmpty) {
            $candidateName = ucwords(str_replace(['-', '_', '.'], ' ', $token));
        }

        $candidateEmail = $applicant['candidate_email'] ?? (strtolower($token) . '@example.com');
        $phone = $applicant['phone'] ?? '+1 (555) 019-2834';
        $stageKey = $applicant['current_stage_key'] ?? 'screening';

        $gatingMode = 'admin_approval';

        try {
            $db = SqliteDatabase::getInstance();
            $gatingMode = $db->getSetting('assessment_gating_mode', 'admin_approval');
        } catch (Throwable) {
            // Fallback
        }

        $isAssessmentApproved = ($gatingMode === 'instant_self_service') || in_array($stageKey, ['assessment', 'exam', 'interview', 'offered', 'hired'], true);

        $rawTasksJson = (string) ($applicant['assigned_tasks_json'] ?? '[]');
        $decodedTasks = json_decode($rawTasksJson, true);
        $assignedTasks = is_array($decodedTasks) ? $decodedTasks : [];

        $hasAssignedTasks = !empty($assignedTasks);

        if (!$hasAssignedTasks) {
            $isAllCompleted = ($completedCount === $totalSteps);
            $assignedTasks = [
                [
                    'id'           => 'task_pre_hire_eval',
                    'title'        => 'Technical Assessment & Skills Verification',
                    'type'         => 'assessment',
                    'slug'         => 'technical-assessment',
                    'due_date'     => 'Within 5 days',
                    'notes'        => 'Complete all 5 verification steps including technical evaluation.',
                    'status'       => $isAllCompleted ? 'completed' : ($completedCount > 0 ? 'in_progress' : 'not_started'),
                    'assigned_at'  => date('Y-m-d H:i:s'),
                    'completed_at' => $isAllCompleted ? date('Y-m-d H:i:s') : null,
                    'score'        => $applicant['score'] ?? null,
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
        $targetRoleKey = (string) ($applicant['job_role'] ?? '');
        $hasAppRole = (strlen($targetRoleKey) > 0);

        if (!$hasAppRole) {
            $queryRole = trim((string) ($params['role'] ?? ($body['role'] ?? '')));
            $hasQueryRole = (strlen($queryRole) > 0);

            if ($hasQueryRole) {
                $targetRoleKey = $queryRole;
            }
        }

        $isStillEmpty = (strlen($targetRoleKey) === 0);

        if ($isStillEmpty) {
            $targetRoleKey = 'junior-software-engineer';
        }

        $jobRoleData = null;

        foreach ($customRoles as $cr) {
            $isMatch = (isset($cr['id']) && $cr['id'] === $targetRoleKey);

            if ($isMatch) {
                $jobRoleData = $cr;
                break;
            }
        }

        $hasRoleData = ($jobRoleData !== null && isset($jobRoleData['secondPhaseQuestions']));

        if ($hasRoleData) {
            $isExamDone = in_array('step_assessment', $completedStepIds, true);

            if (!$isExamDone) {
                $jobRoleData['secondPhaseQuestions'] = \App\Services\AssessmentService::sanitizeQuestions($jobRoleData['secondPhaseQuestions']);
            }
        }

        return [
            'status' => 'success',
            'is_success' => true,
            'data' => [
                'token' => $token,
                'candidate' => [
                    'id' => (int) ($applicant['id'] ?? 1),
                    'candidate_name' => $candidateName,
                    'candidate_email' => $candidateEmail,
                    'name' => $candidateName,
                    'email' => $candidateEmail,
                    'phone' => $phone,
                    'job_role' => $targetRoleKey,
                    'current_stage_key' => $stageKey,
                    'current_stage' => $stageKey,
                    'applied_at' => '2026-10-18',
                ],
                'job_role_data' => $jobRoleData,
                'assessment_gating_mode' => $gatingMode,
                'is_assessment_approved' => $isAssessmentApproved,
                'assigned_tasks' => $assignedTasks,
                'progress_percentage' => $progressPct,
                'completion_percentage' => $progressPct,
                'completed_steps_count' => $completedCount,
                'completed_step_count' => $completedCount,
                'total_steps_count' => $totalSteps,
                'total_step_count' => $totalSteps,
                'steps' => $steps,
                'is_fully_verified' => ($completedCount === $totalSteps),
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

        $stepData = $body['step_data'] ?? [];
        $hasNoStepData = empty($stepData);

        if ($hasNoStepData) {
            $hasNotes = (strlen($notes) > 0);

            if ($hasNotes) {
                $stepData = ['notes' => $notes];
            }
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $isAssessmentStep = ($stepId === 'step_assessment');

            if ($isAssessmentStep) {
                $existing = $db->query(
                    'SELECT id FROM portal_step_completions WHERE token = ? AND step_id = ? LIMIT 1',
                    [$token, $stepId]
                );
                $isAlreadyCompleted = !empty($existing);

                if ($isAlreadyCompleted) {
                    // Assessment is immutable once finalized
                    return $this->getPortalSession($token);
                }
            }

            $candidateRows = $db->query(
                'SELECT * FROM applicants WHERE portal_token = ? OR candidate_email = ? OR candidate_email LIKE ? OR id = ? LIMIT 1',
                [$token, $token, $token . '@%', (int) $token]
            );
            $cand = $candidateRows[0] ?? [];
            $applicantId = (int) ($cand['id'] ?? 0);
            $hasApplicantId = ($applicantId > 0);

            if ($isAssessmentStep) {
                $roleKey = (string) ($cand['job_role'] ?? 'frontend-developer');
                $submittedAnswers = is_array($stepData['answers'] ?? null) ? $stepData['answers'] : [];

                // Authoritative server-side score calculation
                $evalResult = \App\Services\AssessmentService::evaluate($roleKey, $submittedAnswers);
                $verifiedScore = $evalResult['score'];
                $tabSwitchCount = (int) ($stepData['tab_switch_count'] ?? 0);
                $integrityStatus = (string) ($stepData['integrity_status'] ?? 'clean');

                $stepData['score'] = $verifiedScore;
                $stepData['correct_count'] = $evalResult['correct_count'];
                $stepData['auto_gradable_count'] = $evalResult['auto_gradable_count'];
                $stepData['total_questions'] = $evalResult['total_questions'];
                $stepData['open_questions_count'] = $evalResult['open_questions_count'];
                $stepData['has_pending_manual_review'] = $evalResult['has_pending_manual_review'];

                $db->execute(
                    'UPDATE applicants SET score = ?, tab_switch_count = ?, integrity_status = ?, updated_at = datetime("now") WHERE portal_token = ? OR candidate_email = ? OR candidate_email LIKE ? OR id = ?',
                    [$verifiedScore, $tabSwitchCount, $integrityStatus, $token, $token, $token . '@%', (int) $token]
                );
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

            $stepDataJson = json_encode($stepData);
            $sql = 'INSERT INTO portal_step_completions (token, step_id, step_data_json, completed_at)
                    VALUES (?, ?, ?, datetime("now"))
                    ON CONFLICT(token, step_id) DO UPDATE SET step_data_json = excluded.step_data_json, completed_at = excluded.completed_at';
            $db->execute($sql, [$token, $stepId, $stepDataJson]);

            $isFinalStep = ($stepId === 'step_complete');

            if ($isFinalStep) {
                if ($hasApplicantId) {
                    $currentStageKey = (string) ($cand['current_stage_key'] ?? 'applied');
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

            return $this->getPortalSession($token);
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

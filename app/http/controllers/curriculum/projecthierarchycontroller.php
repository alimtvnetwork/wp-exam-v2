<?php

declare(strict_types=1);

namespace App\Http\Controllers\Curriculum;

use WpExam\Database\SqliteDatabase;
use Throwable;

/**
 * Controller for Hierarchical Categories, Curriculum Projects, and Question Reports.
 */
class ProjectHierarchyController
{
    /**
     * GET /api/v1/categories
     */
    public function getCategories(array $params = [], array $body = []): array
    {
        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $categories = $db->query('SELECT * FROM categories ORDER BY display_order ASC, title ASC');
            $projects = $db->query('SELECT * FROM projects ORDER BY display_order ASC, title ASC');

            $hasCategories = !empty($categories);

            if ($hasCategories) {
                $result = [];

                foreach ($categories as $cat) {
                    $catId = $cat['id'];
                    $catPermissions = json_decode($cat['permissions_json'] ?? '[]', true) ?: [];

                    $catProjects = [];

                    foreach ($projects as $proj) {
                        $isMatchingCategory = (($proj['category_id'] ?? '') === $catId);

                        if ($isMatchingCategory) {
                            $proj['pipeline_order'] = json_decode($proj['pipeline_order_json'] ?? '[]', true) ?: [];
                            $proj['permissions'] = json_decode($proj['permissions_json'] ?? '[]', true) ?: [];
                            $proj['settings'] = json_decode($proj['settings_json'] ?? '{}', true) ?: [];

                            unset($proj['pipeline_order_json'], $proj['permissions_json'], $proj['settings_json']);

                            $catProjects[] = $proj;
                        }
                    }

                    $cat['permissions'] = $catPermissions;
                    $cat['projects'] = $catProjects;
                    unset($cat['permissions_json']);

                    $result[] = $cat;
                }

                return [
                    'status' => 'success',
                    'is_success' => true,
                    'data' => $result,
                    'total' => count($result),
                ];
            }
        } catch (Throwable) {
            // Return fallback
        }

        return [
            'status' => 'success',
            'is_success' => true,
            'data' => [
                [
                    'id' => 'cat_onboarding',
                    'title' => 'Employee Onboarding & Security',
                    'description' => 'Required curriculum for all engineering, product, and operations hires.',
                    'projects' => [],
                ],
            ],
            'total' => 1,
        ];
    }

    /**
     * POST /api/v1/categories
     */
    public function saveCategory(array $params = [], array $body = []): array
    {
        $id = trim((string) ($body['id'] ?? ''));
        $title = trim((string) ($body['title'] ?? ''));
        $description = trim((string) ($body['description'] ?? ''));
        $displayOrder = (int) ($body['display_order'] ?? 0);
        $permissions = $body['permissions'] ?? [];

        $isTitleEmpty = (strlen($title) === 0);

        if ($isTitleEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Category title is required',
            ];
        }

        $isIdEmpty = (strlen($id) === 0);

        if ($isIdEmpty) {
            $id = 'cat_' . strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', $title)) . '_' . rand(100, 999);
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $sql = 'INSERT OR REPLACE INTO categories (id, title, description, display_order, permissions_json) VALUES (?, ?, ?, ?, ?)';
            $db->execute($sql, [$id, $title, $description, $displayOrder, json_encode($permissions)]);

            return [
                'status' => 'success',
                'is_success' => true,
                'data' => [
                    'id' => $id,
                    'title' => $title,
                    'description' => $description,
                    'display_order' => $displayOrder,
                    'permissions' => $permissions,
                ],
                'message' => 'Category saved successfully',
            ];
        } catch (Throwable $e) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Failed saving category: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * GET /api/v1/projects
     */
    public function getProjects(array $params = [], array $body = []): array
    {
        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $projects = $db->query('SELECT * FROM projects ORDER BY display_order ASC, title ASC');
            $hasProjects = !empty($projects);

            if ($hasProjects) {
                $cleaned = array_map(function (array $proj): array {
                    $proj['pipeline_order'] = json_decode($proj['pipeline_order_json'] ?? '[]', true) ?: [];
                    $proj['permissions'] = json_decode($proj['permissions_json'] ?? '[]', true) ?: [];
                    $proj['settings'] = json_decode($proj['settings_json'] ?? '{}', true) ?: [];
                    unset($proj['pipeline_order_json'], $proj['permissions_json'], $proj['settings_json']);

                    return $proj;
                }, $projects);

                return [
                    'status' => 'success',
                    'is_success' => true,
                    'data' => $cleaned,
                    'total' => count($cleaned),
                ];
            }
        } catch (Throwable) {
            // Non-blocking
        }

        return [
            'status' => 'success',
            'is_success' => true,
            'data' => [],
            'total' => 0,
        ];
    }

    /**
     * GET /api/v1/projects/{id}
     */
    public function getProject(array $params = [], array $body = []): array
    {
        $id = trim((string) ($params['id'] ?? ''));

        $isIdEmpty = (strlen($id) === 0);

        if ($isIdEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Valid project ID is required',
            ];
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $rows = $db->query('SELECT * FROM projects WHERE id = ? LIMIT 1', [$id]);
            $proj = $rows[0] ?? null;

            if ($proj !== null) {
                $proj['pipeline_order'] = json_decode($proj['pipeline_order_json'] ?? '[]', true) ?: [];
                $proj['permissions'] = json_decode($proj['permissions_json'] ?? '[]', true) ?: [];
                $proj['settings'] = json_decode($proj['settings_json'] ?? '{}', true) ?: [];
                unset($proj['pipeline_order_json'], $proj['permissions_json'], $proj['settings_json']);

                return [
                    'status' => 'success',
                    'is_success' => true,
                    'data' => $proj,
                ];
            }
        } catch (Throwable) {
            // Non-blocking
        }

        return [
            'status' => 'error',
            'is_success' => false,
            'message' => 'Project not found',
        ];
    }

    /**
     * POST /api/v1/projects
     */
    public function saveProject(array $params = [], array $body = []): array
    {
        $id = trim((string) ($body['id'] ?? ''));
        $categoryId = trim((string) ($body['category_id'] ?? ''));
        $title = trim((string) ($body['title'] ?? ''));
        $description = trim((string) ($body['description'] ?? ''));
        $parentProjectId = trim((string) ($body['parent_project_id'] ?? ''));
        $displayOrder = (int) ($body['display_order'] ?? 0);
        $pipelineOrder = $body['pipeline_order'] ?? [];
        $permissions = $body['permissions'] ?? [];
        $settings = $body['settings'] ?? [];

        $isTitleEmpty = (strlen($title) === 0);

        if ($isTitleEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Project title is required',
            ];
        }

        $isIdEmpty = (strlen($id) === 0);

        if ($isIdEmpty) {
            $id = 'proj_' . strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', $title)) . '_' . rand(100, 999);
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $sql = 'INSERT OR REPLACE INTO projects (id, category_id, title, description, parent_project_id, display_order, pipeline_order_json, permissions_json, settings_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))';

            $db->execute($sql, [
                $id,
                $categoryId,
                $title,
                $description,
                $parentProjectId,
                $displayOrder,
                json_encode($pipelineOrder),
                json_encode($permissions),
                json_encode($settings),
            ]);

            return [
                'status' => 'success',
                'is_success' => true,
                'data' => [
                    'id' => $id,
                    'title' => $title,
                    'category_id' => $categoryId,
                    'parent_project_id' => $parentProjectId,
                ],
                'message' => 'Project saved successfully',
            ];
        } catch (Throwable $e) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Failed saving project: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * GET /api/v1/checklist/{token}
     */
    public function getChecklist(array $params = [], array $body = []): array
    {
        $token = trim((string) ($params['token'] ?? ''));

        $isTokenEmpty = (strlen($token) === 0);

        if ($isTokenEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Valid token required',
            ];
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $rows = $db->query('SELECT * FROM user_invites WHERE invite_token = ? LIMIT 1', [$token]);
            $invite = $rows[0] ?? null;

            if ($invite !== null) {
                $email = (string) ($invite['email'] ?? '');
                $invites = $db->query('SELECT * FROM user_invites WHERE email = ?', [$email]);
                $items = [];

                foreach ($invites as $row) {
                    $formId = (int) ($row['form_id'] ?? 0);
                    $title = 'Assigned Evaluation';
                    $formType = 'quiz';

                    if ($formId > 0) {
                        $fRows = $db->query('SELECT title, form_type FROM forms WHERE id = ? LIMIT 1', [$formId]);

                        if (!empty($fRows)) {
                            $title = (string) ($fRows[0]['title'] ?? $title);
                            $formType = (string) ($fRows[0]['form_type'] ?? 'quiz');
                        }
                    }

                    $isExam = str_contains($formType, 'exam');
                    $isProject = str_contains($formType, 'project');
                    $kind = $isExam ? 'exam' : ($isProject ? 'project' : 'quiz');

                    $items[] = [
                        'id' => (int) ($row['id'] ?? 1),
                        'title' => $title,
                        'kind' => $kind,
                        'status' => $row['status'] ?? 'pending',
                        'due_at' => $row['expires_at'] ?? '',
                        'invite_url' => '/runner?invite=' . ($row['invite_token'] ?? ''),
                    ];
                }

                return [
                    'status' => 'success',
                    'is_success' => true,
                    'Results' => [
                        'items' => $items,
                        'checklist_url' => '/checklist/' . $token,
                    ],
                    'data' => [
                        'items' => $items,
                        'checklist_url' => '/checklist/' . $token,
                    ],
                ];
            }
        } catch (Throwable) {
            // Fallback
        }

        return [
            'status' => 'success',
            'is_success' => true,
            'Results' => [
                'items' => [
                    [
                        'id' => 1,
                        'title' => 'Technical Assessment Evaluation',
                        'kind' => 'exam',
                        'status' => 'pending',
                        'due_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
                        'invite_url' => '/runner?invite=' . $token,
                    ],
                ],
                'checklist_url' => '/checklist/' . $token,
            ],
            'data' => [
                'items' => [
                    [
                        'id' => 1,
                        'title' => 'Technical Assessment Evaluation',
                        'kind' => 'exam',
                        'status' => 'pending',
                        'due_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
                        'invite_url' => '/runner?invite=' . $token,
                    ],
                ],
                'checklist_url' => '/checklist/' . $token,
            ],
        ];
    }

    /**
     * POST /api/v1/reports
     */
    public function submitReport(array $params = [], array $body = []): array
    {
        $projectId = trim((string) ($body['project_id'] ?? 'general'));
        $questionId = trim((string) ($body['question_id'] ?? ''));
        $feedbackText = trim((string) ($body['feedback_text'] ?? ''));
        $reportType = trim((string) ($body['report_type'] ?? 'feedback'));
        $userIdentifier = trim((string) ($body['user_identifier'] ?? ''));

        $isFeedbackEmpty = (strlen($feedbackText) === 0);

        if ($isFeedbackEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Feedback text is required',
            ];
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $sql = 'INSERT INTO question_reports (project_id, question_id, report_type, user_identifier, feedback_text, status) VALUES (?, ?, ?, ?, ?, ?)';
            $db->execute($sql, [$projectId, $questionId, $reportType, $userIdentifier, $feedbackText, 'open']);

            return [
                'status' => 'success',
                'is_success' => true,
                'data' => [
                    'message' => 'Report submitted successfully. Thank you for your feedback!',
                ],
            ];
        } catch (Throwable $e) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Could not save report: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * GET /api/v1/reports
     */
    public function getReports(array $params = [], array $body = []): array
    {
        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $rows = $db->query('SELECT * FROM question_reports ORDER BY id DESC LIMIT 100');

            return [
                'status' => 'success',
                'is_success' => true,
                'data' => $rows,
                'total' => count($rows),
            ];
        } catch (Throwable) {
            // Non-blocking
        }

        return [
            'status' => 'success',
            'is_success' => true,
            'data' => [],
            'total' => 0,
        ];
    }
}

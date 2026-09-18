<?php
/**
 * REST Controller for Hierarchical Categories, Projects, Sub-Projects and History.
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
use WP_Error;
use PDO;
use Throwable;
use WpExam\Database\SqliteDatabase;
use WpExam\Database\ProjectHistoryDatabase;
use WpExam\Http\EnvelopeBuilder;

class ProjectHierarchyRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function register_routes(): void {
        register_rest_route($this->namespace, '/categories', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getCategories'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createOrUpdateCategory'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/projects', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getProjects'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createOrUpdateProject'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/projects/(?P<id>[a-zA-Z0-9_-]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getProjectById'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/projects/(?P<id>[a-zA-Z0-9_-]+)/history', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getProjectHistory'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/projects/(?P<id>[a-zA-Z0-9_-]+)/revert', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'revertProjectHistory'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/reports', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getReports'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'submitReport'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        $hasCap = current_user_can('manage_options');
        return $hasCap;
    }

    public function getCategories(WP_REST_Request $request): WP_REST_Response {
        $db = SqliteDatabase::getInstance();
        $categories = $db->query('SELECT * FROM categories ORDER BY display_order ASC, title ASC');
        $projects = $db->query('SELECT * FROM projects ORDER BY display_order ASC, title ASC');

        $result = [];
        foreach ($categories as $cat) {
            $catId = $cat['id'];
            $cat['permissions'] = json_decode($cat['permissions_json'] ?? '[]', true) ?: [];
            unset($cat['permissions_json']);

            $catProjects = [];
            foreach ($projects as $proj) {
                if (($proj['category_id'] ?? '') === $catId) {
                    $proj['pipeline_order'] = json_decode($proj['pipeline_order_json'] ?? '[]', true) ?: [];
                    $proj['permissions'] = json_decode($proj['permissions_json'] ?? '[]', true) ?: [];
                    $proj['settings'] = json_decode($proj['settings_json'] ?? '{}', true) ?: [];
                    unset($proj['pipeline_order_json'], $proj['permissions_json'], $proj['settings_json']);
                    $catProjects[] = $proj;
                }
            }

            $cat['projects'] = $catProjects;
            $result[] = $cat;
        }

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($result), 200);
    }

    public function createOrUpdateCategory(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params() ?: [];
        $title = trim($params['title'] ?? '');
        $hasTitle = !empty($title);
        if (!$hasTitle) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Category title is required'), 400);
        }

        $id = trim($params['id'] ?? '') ?: sanitize_title($title);
        $description = trim($params['description'] ?? '');
        $displayOrder = (int) ($params['display_order'] ?? 0);
        $permissionsJson = json_encode($params['permissions'] ?? ['all']) ?: '["all"]';

        $db = SqliteDatabase::getInstance();
        $db->execute("
            INSERT INTO categories (id, title, description, display_order, permissions_json)
            VALUES (:id, :title, :description, :display_order, :permissions_json)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                display_order = excluded.display_order,
                permissions_json = excluded.permissions_json
        ", [
            ':id'               => $id,
            ':title'            => $title,
            ':description'      => $description,
            ':display_order'    => $displayOrder,
            ':permissions_json' => $permissionsJson,
        ]);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'id'    => $id,
            'title' => $title,
        ]), 200);
    }

    public function getProjects(WP_REST_Request $request): WP_REST_Response {
        $db = SqliteDatabase::getInstance();
        $projects = $db->query('SELECT * FROM projects ORDER BY display_order ASC, title ASC');

        $result = [];
        foreach ($projects as $proj) {
            $proj['pipeline_order'] = json_decode($proj['pipeline_order_json'] ?? '[]', true) ?: [];
            $proj['permissions'] = json_decode($proj['permissions_json'] ?? '[]', true) ?: [];
            $proj['settings'] = json_decode($proj['settings_json'] ?? '{}', true) ?: [];
            unset($proj['pipeline_order_json'], $proj['permissions_json'], $proj['settings_json']);
            $result[] = $proj;
        }

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($result), 200);
    }

    public function getProjectById(WP_REST_Request $request): WP_REST_Response {
        $id = $request->get_param('id');
        $db = SqliteDatabase::getInstance();
        $projects = $db->query('SELECT * FROM projects WHERE id = :id LIMIT 1', [':id' => $id]);

        $hasProject = !empty($projects);
        if (!$hasProject) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Project not found'), 404);
        }

        $project = $projects[0];
        $project['pipeline_order'] = json_decode($project['pipeline_order_json'] ?? '[]', true) ?: [];
        $project['permissions'] = json_decode($project['permissions_json'] ?? '[]', true) ?: [];
        $project['settings'] = json_decode($project['settings_json'] ?? '{}', true) ?: [];
        unset($project['pipeline_order_json'], $project['permissions_json'], $project['settings_json']);

        // Check split project database for sections
        $projPdo = $db->getProjectDatabase($id);
        $sections = [];
        if ($projPdo !== null) {
            try {
                $stmt = $projPdo->query('SELECT * FROM project_sections ORDER BY display_order ASC');
                $rawSections = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
                foreach ($rawSections as $sec) {
                    $sec['checklist'] = json_decode($sec['checklist_json'] ?? '[]', true) ?: [];
                    $sec['questions'] = json_decode($sec['questions_json'] ?? '[]', true) ?: [];
                    $sec['settings'] = json_decode($sec['settings_json'] ?? '{}', true) ?: [];
                    unset($sec['checklist_json'], $sec['questions_json'], $sec['settings_json']);
                    $sections[] = $sec;
                }
            } catch (Throwable $e) {
                // Fallback
            }
        }
        $project['sections'] = $sections;

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($project), 200);
    }

    public function createOrUpdateProject(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params() ?: [];
        $title = trim($params['title'] ?? '');
        $hasTitle = !empty($title);
        if (!$hasTitle) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Project title is required'), 400);
        }

        $id = trim($params['id'] ?? '') ?: sanitize_title($title);
        $categoryId = trim($params['category_id'] ?? 'default');
        $description = trim($params['description'] ?? '');
        $displayOrder = (int) ($params['display_order'] ?? 0);
        $pipelineOrderJson = json_encode($params['pipeline_order'] ?? []) ?: '[]';
        $permissionsJson = json_encode($params['permissions'] ?? ['all']) ?: '["all"]';
        $settingsJson = json_encode($params['settings'] ?? (object)[]) ?: '{}';
        $sections = is_array($params['sections'] ?? null) ? $params['sections'] : [];

        $db = SqliteDatabase::getInstance();
        $db->execute("
            INSERT INTO projects (id, category_id, title, description, display_order, pipeline_order_json, permissions_json, settings_json, updated_at)
            VALUES (:id, :category_id, :title, :description, :display_order, :pipeline_order_json, :permissions_json, :settings_json, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                category_id = excluded.category_id,
                title = excluded.title,
                description = excluded.description,
                display_order = excluded.display_order,
                pipeline_order_json = excluded.pipeline_order_json,
                permissions_json = excluded.permissions_json,
                settings_json = excluded.settings_json,
                updated_at = datetime('now')
        ", [
            ':id'                  => $id,
            ':category_id'         => $categoryId,
            ':title'               => $title,
            ':description'         => $description,
            ':display_order'       => $displayOrder,
            ':pipeline_order_json' => $pipelineOrderJson,
            ':permissions_json'    => $permissionsJson,
            ':settings_json'       => $settingsJson,
        ]);

        // Sync into project split SQLite database
        $projPdo = $db->getProjectDatabase($id);
        if ($projPdo !== null && !empty($sections)) {
            try {
                $projPdo->exec('DELETE FROM project_sections');
                $stmt = $projPdo->prepare("
                    INSERT INTO project_sections (id, title, display_order, content_type, reading_content, video_url, checklist_json, questions_json, settings_json)
                    VALUES (:id, :title, :display_order, :content_type, :reading_content, :video_url, :checklist_json, :questions_json, :settings_json)
                ");

                $order = 0;
                foreach ($sections as $sec) {
                    $secId = trim($sec['id'] ?? '') ?: 'sec_' . ($order + 1);
                    $stmt->execute([
                        ':id'              => $secId,
                        ':title'           => trim($sec['title'] ?? 'Section ' . ($order + 1)),
                        ':display_order'   => $order,
                        ':content_type'    => trim($sec['content_type'] ?? 'quiz'),
                        ':reading_content' => trim($sec['reading_content'] ?? ''),
                        ':video_url'       => trim($sec['video_url'] ?? ''),
                        ':checklist_json'  => json_encode($sec['checklist'] ?? []) ?: '[]',
                        ':questions_json'  => json_encode($sec['questions'] ?? []) ?: '[]',
                        ':settings_json'   => json_encode($sec['settings'] ?? (object)[]) ?: '{}',
                    ]);
                    $order++;
                }
            } catch (Throwable $e) {
                // Ignore sync errors
            }
        }

        // Record Revision Snapshot in ProjectHistoryDatabase
        $summary = trim($params['change_summary'] ?? 'Updated project configuration');
        $author = wp_get_current_user()->user_login ?: 'admin';
        $revisionId = ProjectHistoryDatabase::getInstance()->recordSnapshot($id, 'update', $summary, $author, $params);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'id'          => $id,
            'title'       => $title,
            'revision_id' => $revisionId,
        ]), 200);
    }

    public function getProjectHistory(WP_REST_Request $request): WP_REST_Response {
        $id = $request->get_param('id');
        $history = ProjectHistoryDatabase::getInstance()->getRevisions($id);
        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($history), 200);
    }

    public function revertProjectHistory(WP_REST_Request $request): WP_REST_Response {
        $id = $request->get_param('id');
        $params = $request->get_json_params() ?: [];
        $revisionId = trim($params['revision_id'] ?? '');

        $hasRevisionId = !empty($revisionId);
        if (!$hasRevisionId) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Revision ID is required'), 400);
        }

        $revision = ProjectHistoryDatabase::getInstance()->getRevision($id, $revisionId);
        $hasRevision = !empty($revision);
        if (!$hasRevision) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Revision not found'), 404);
        }

        $snapshotData = $revision['snapshot_data'] ?? [];
        $snapshotData['change_summary'] = 'Reverted to revision ' . $revisionId;

        // Re-apply snapshot data through update
        $mockRequest = new WP_REST_Request('POST', '/wp-exam/v1/projects');
        $mockRequest->set_body(json_encode($snapshotData));
        return $this->createOrUpdateProject($mockRequest);
    }

    public function getReports(WP_REST_Request $request): WP_REST_Response {
        $db = SqliteDatabase::getInstance();
        $reports = $db->query('SELECT * FROM question_reports ORDER BY id DESC LIMIT 50');
        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($reports), 200);
    }

    public function submitReport(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params() ?: [];
        $projectId = trim($params['project_id'] ?? 'general');
        $questionId = trim($params['question_id'] ?? 'general');
        $reportType = trim($params['report_type'] ?? 'feedback');
        $feedbackText = trim($params['feedback_text'] ?? '');
        $userIdentifier = trim($params['user_identifier'] ?? 'anonymous');

        $hasFeedback = !empty($feedbackText);
        if (!$hasFeedback) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Feedback text is required'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $db->execute("
            INSERT INTO question_reports (project_id, question_id, report_type, user_identifier, feedback_text, status)
            VALUES (:project_id, :question_id, :report_type, :user_identifier, :feedback_text, 'open')
        ", [
            ':project_id'      => $projectId,
            ':question_id'     => $questionId,
            ':report_type'     => $reportType,
            ':user_identifier' => $userIdentifier,
            ':feedback_text'   => $feedbackText,
        ]);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'status'  => 'submitted',
            'message' => 'Thank you for reporting this issue. Our team will review it.',
        ]), 201);
    }
}

<?php
/**
 * REST Controller for Applicant Recruitment Pipeline & Stage Transitions.
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

class ApplicantPipelineRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function register_routes(): void {
        register_rest_route($this->namespace, '/applicants', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getApplicants'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createApplicant'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/applicants/stages', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getStages'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/applicants/stage-transition', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'transitionStage'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/applicants/feedback', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'updateFeedback'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/applicants/settings', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getSettings'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'updateSettings'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/applicants/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'deleteApplicant'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        $hasCap = current_user_can('manage_options');

        return $hasCap;
    }

    public function getStages(WP_REST_Request $request): WP_REST_Response {
        $db = SqliteDatabase::getInstance();
        $stages = $db->query('SELECT * FROM applicant_stages ORDER BY display_order ASC, id ASC');

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($stages), 200);
    }

    public function getApplicants(WP_REST_Request $request): WP_REST_Response {
        $db = SqliteDatabase::getInstance();
        $stageParam = trim((string) $request->get_param('stage'));
        $searchParam = trim((string) $request->get_param('search'));

        $sql = 'SELECT * FROM applicants WHERE 1=1';
        $params = [];

        $hasStageParam = (strlen($stageParam) > 0);

        if ($hasStageParam) {
            $sql .= ' AND current_stage_key = ?';
            $params[] = $stageParam;
        }

        $hasSearchParam = (strlen($searchParam) > 0);

        if ($hasSearchParam) {
            $sql .= ' AND (candidate_name LIKE ? OR candidate_email LIKE ?)';
            $searchWildcard = '%' . $searchParam . '%';
            $params[] = $searchWildcard;
            $params[] = $searchWildcard;
        }

        $sql .= ' ORDER BY updated_at DESC, id DESC';
        $applicants = $db->query($sql, $params);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope($applicants), 200);
    }

    public function createApplicant(WP_REST_Request $request): WP_REST_Response {
        $body = $request->get_json_params() ?: [];
        $name = trim((string) ($body['candidate_name'] ?? ''));
        $email = trim((string) ($body['candidate_email'] ?? ''));
        $phone = trim((string) ($body['phone'] ?? ''));
        $stageKey = trim((string) ($body['stage_key'] ?? 'applied'));
        $formId = (int) ($body['form_id'] ?? 0);
        $notes = trim((string) ($body['notes'] ?? ''));

        $isNameEmpty = (strlen($name) === 0);

        if ($isNameEmpty) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Candidate name is required'), 400);
        }

        $isEmailEmpty = (strlen($email) === 0);

        if ($isEmailEmpty) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Candidate email is required'), 400);
        }

        $isStageEmpty = (strlen($stageKey) === 0);

        if ($isStageEmpty) {
            $stageKey = 'applied';
        }

        $db = SqliteDatabase::getInstance();
        $sql = 'INSERT INTO applicants (candidate_name, candidate_email, phone, current_stage_key, form_id, notes) VALUES (?, ?, ?, ?, ?, ?)';
        $db->execute($sql, [$name, $email, $phone, $stageKey, $formId, $notes]);

        $newApplicantRows = $db->query('SELECT * FROM applicants WHERE candidate_email = ? ORDER BY id DESC LIMIT 1', [$email]);
        $newApplicant = $newApplicantRows[0] ?? null;

        $hasApplicant = ($newApplicant !== null);

        if ($hasApplicant) {
            $applicantId = (int) $newApplicant['id'];
            $currentUserId = function_exists('get_current_user_id') ? get_current_user_id() : 0;
            $transitionSql = 'INSERT INTO applicant_transitions (applicant_id, from_stage_key, to_stage_key, moved_by_user_id, notes) VALUES (?, ?, ?, ?, ?)';
            $db->execute($transitionSql, [$applicantId, null, $stageKey, $currentUserId, 'Initial candidate record created']);
        }

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'applicant' => $newApplicant,
            'message'   => 'Applicant created successfully',
        ]), 201);
    }

    public function transitionStage(WP_REST_Request $request): WP_REST_Response {
        $body = $request->get_json_params() ?: [];
        $applicantId = (int) ($body['applicant_id'] ?? 0);
        $toStageKey = trim((string) ($body['to_stage_key'] ?? ''));
        $notes = trim((string) ($body['notes'] ?? ''));

        $isInvalidApplicantId = ($applicantId <= 0);

        if ($isInvalidApplicantId) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid applicant_id is required'), 400);
        }

        $isInvalidStageKey = (strlen($toStageKey) === 0);

        if ($isInvalidStageKey) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid to_stage_key is required'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $applicantRows = $db->query('SELECT * FROM applicants WHERE id = ?', [$applicantId]);
        $applicant = $applicantRows[0] ?? null;

        $isMissing = ($applicant === null);

        if ($isMissing) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Applicant not found'), 404);
        }

        $fromStageKey = (string) $applicant['current_stage_key'];
        $currentUserId = function_exists('get_current_user_id') ? get_current_user_id() : 0;

        $updateSql = "UPDATE applicants SET current_stage_key = ?, updated_at = datetime('now') WHERE id = ?";
        $db->execute($updateSql, [$toStageKey, $applicantId]);

        $transitionSql = 'INSERT INTO applicant_transitions (applicant_id, from_stage_key, to_stage_key, moved_by_user_id, notes) VALUES (?, ?, ?, ?, ?)';
        $db->execute($transitionSql, [$applicantId, $fromStageKey, $toStageKey, $currentUserId, $notes]);

        $updatedApplicantRows = $db->query('SELECT * FROM applicants WHERE id = ?', [$applicantId]);
        $updatedApplicant = $updatedApplicantRows[0] ?? null;

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'applicant'  => $updatedApplicant,
            'transition' => [
                'from_stage' => $fromStageKey,
                'to_stage'   => $toStageKey,
            ],
            'message'    => 'Stage transition logged successfully',
        ]), 200);
    }

    public function updateFeedback(WP_REST_Request $request): WP_REST_Response {
        $body = $request->get_json_params() ?: [];
        $applicantId = (int) ($body['applicant_id'] ?? 0);
        $rating = isset($body['rating']) ? (int) $body['rating'] : null;
        $notes = isset($body['notes']) ? trim((string) $body['notes']) : null;

        $isInvalidId = ($applicantId <= 0);

        if ($isInvalidId) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid applicant_id is required'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $applicantRows = $db->query('SELECT * FROM applicants WHERE id = ?', [$applicantId]);
        $applicant = $applicantRows[0] ?? null;

        $isMissing = ($applicant === null);

        if ($isMissing) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Applicant not found'), 404);
        }

        $hasRating = ($rating !== null);

        if ($hasRating) {
            $db->execute('UPDATE applicants SET rating = ? WHERE id = ?', [$rating, $applicantId]);
        }

        $hasNotes = ($notes !== null);

        if ($hasNotes) {
            $db->execute('UPDATE applicants SET notes = ? WHERE id = ?', [$notes, $applicantId]);
        }

        $db->execute("UPDATE applicants SET updated_at = datetime('now') WHERE id = ?", [$applicantId]);

        $updatedRows = $db->query('SELECT * FROM applicants WHERE id = ?', [$applicantId]);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'applicant' => $updatedRows[0] ?? null,
            'message'   => 'Applicant feedback updated',
        ]), 200);
    }

    public function deleteApplicant(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $isInvalidId = ($id <= 0);

        if ($isInvalidId) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Invalid applicant ID'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $db->execute('DELETE FROM applicants WHERE id = ?', [$id]);
        $db->execute('DELETE FROM applicant_transitions WHERE applicant_id = ?', [$id]);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'deleted_id' => $id,
            'message'    => 'Applicant and transition history deleted successfully',
        ]), 200);
    }

    public function getSettings(WP_REST_Request $request): WP_REST_Response {
        $db = SqliteDatabase::getInstance();
        $gatingMode = $db->getSetting('assessment_gating_mode', 'admin_approval');

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'assessment_gating_mode' => $gatingMode,
        ]), 200);
    }

    public function updateSettings(WP_REST_Request $request): WP_REST_Response {
        $body = $request->get_json_params() ?: [];
        $rawMode = trim((string) ($body['assessment_gating_mode'] ?? ''));

        $isValid = in_array($rawMode, ['admin_approval', 'instant_self_service'], true);

        if (!$isValid) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Invalid assessment_gating_mode'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $db->setSetting('assessment_gating_mode', $rawMode);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'assessment_gating_mode' => $rawMode,
            'message'                => 'Pipeline assessment gating configuration updated successfully',
        ]), 200);
    }
}

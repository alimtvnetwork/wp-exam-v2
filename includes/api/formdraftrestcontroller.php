<?php
/**
 * REST Controller for Cross-Device Form Drafts & Resume Magic Links.
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

class FormDraftRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function register_routes(): void {
        register_rest_route($this->namespace, '/apply/draft', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'saveDraft'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/apply/resume/(?P<token>[A-Za-z0-9_-]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'resumeDraft'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    public function saveDraft(WP_REST_Request $request): WP_REST_Response {
        $body = $request->get_json_params() ?: [];
        $email = trim((string) ($body['applicant_email'] ?? ''));
        $formSlug = trim((string) ($body['form_slug'] ?? ''));
        $formId = (int) ($body['form_id'] ?? 0);
        $currentStep = (int) ($body['current_step'] ?? 1);
        $payload = $body['payload'] ?? [];

        $isEmailEmpty = (strlen($email) === 0);

        if ($isEmailEmpty) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid applicant email is required to save a draft'), 400);
        }

        $isStepInvalid = ($currentStep < 1);

        if ($isStepInvalid) {
            $currentStep = 1;
        }

        $db = SqliteDatabase::getInstance();
        $token = 'dft_' . bin2hex(random_bytes(12));
        $payloadJson = json_encode($payload);

        // Check if an existing unexpired draft exists for this applicant email & form slug
        $existingRows = $db->query('SELECT id FROM form_drafts WHERE applicant_email = ? AND form_slug = ? LIMIT 1', [$email, $formSlug]);
        $existingDraft = $existingRows[0] ?? null;
        $hasExisting = ($existingDraft !== null);

        if ($hasExisting) {
            $draftId = (int) $existingDraft['id'];
            $updateSql = "UPDATE form_drafts SET resume_token = ?, current_step = ?, payload_json = ?, expires_at = datetime('now', '+30 days') WHERE id = ?";
            $db->execute($updateSql, [$token, $currentStep, $payloadJson, $draftId]);
        } else {
            $insertSql = "INSERT INTO form_drafts (form_id, form_slug, applicant_email, resume_token, current_step, payload_json, expires_at)
                          VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+30 days'))";
            $db->execute($insertSql, [$formId, $formSlug, $email, $token, $currentStep, $payloadJson]);
        }

        $resumeUrl = '/apply/resume/' . $token;

        // Try sending resume email if WordPress mail is configured
        $this->dispatchResumeEmail($email, $resumeUrl);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'resume_token'    => $token,
            'resume_url'      => $resumeUrl,
            'applicant_email' => $email,
            'current_step'    => $currentStep,
            'message'         => 'Application draft saved successfully. Use the magic link to resume from any device.',
        ]), 200);
    }

    public function resumeDraft(WP_REST_Request $request): WP_REST_Response {
        $token = trim((string) $request->get_param('token'));
        $hasToken = (strlen($token) > 0);

        if (!$hasToken) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid resume token is required'), 400);
        }

        $db = SqliteDatabase::getInstance();
        $rows = $db->query("SELECT * FROM form_drafts WHERE resume_token = ? AND expires_at > datetime('now') LIMIT 1", [$token]);
        $draft = $rows[0] ?? null;

        $isMissing = ($draft === null);

        if ($isMissing) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Application draft was not found or the resume link has expired'), 404);
        }

        $payload = json_decode((string) ($draft['payload_json'] ?? '{}'), true) ?: [];

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'resume_token'    => (string) $draft['resume_token'],
            'applicant_email' => (string) $draft['applicant_email'],
            'form_slug'       => (string) $draft['form_slug'],
            'current_step'    => (int) $draft['current_step'],
            'payload'         => $payload,
            'created_at'      => (string) $draft['created_at'],
            'expires_at'      => (string) $draft['expires_at'],
        ]), 200);
    }

    private function dispatchResumeEmail(string $recipientEmail, string $resumeRelativeUrl): void {
        $hasFunction = function_exists('wp_mail');

        if (!$hasFunction) {
            return;
        }

        $siteUrl = function_exists('get_site_url') ? get_site_url() : '';
        $fullResumeUrl = rtrim($siteUrl, '/') . $resumeRelativeUrl;
        $subject = 'Your Application Draft Resume Link - Onboarding Quiz';
        $message = "Hello,

Your application draft has been saved. You can resume your application at any time using the link below:

" . $fullResumeUrl . "

This link is valid for 30 days.

Best regards,
Recruitment Team";

        try {
            @wp_mail($recipientEmail, $subject, $message);
        } catch (Throwable) {
            // Non-blocking email dispatch
        }
    }
}

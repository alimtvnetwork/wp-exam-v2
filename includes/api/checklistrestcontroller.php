<?php
/**
 * REST API Controller for the token-scoped candidate checklist.
 *
 * Candidates have no accounts (no login in this program — see
 * 05-email-checklist-spec.md). The invite token is the capability URL: it
 * identifies and authorizes in one step. When login arrives later, the token
 * lookup below is replaced by a session identity — the dashboard needs no
 * rewrite.
 *
 * Unknown and expired tokens share an identical 404 envelope so the endpoint
 * cannot be used as a token oracle.
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
use WpExam\Database\Orm;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

class ChecklistRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    /**
     * Fallback email templates. Overrides are read from the existing
     * email_settings.templates_json keys — no new settings table.
     */
    private const TEMPLATE_DEFAULTS = [
        'checklist_subject' => 'Your WP Exam checklist: {pending_count} items to complete',
        'checklist_body'    => "Hello {user_name},\n\nYou have {pending_count} items to complete.\nView your checklist here: {checklist_url}\n\nThank you!",
        'reminder_subject'  => 'Reminder: {pending_count} checklist items due soon',
        'reminder_body'     => "Hello {user_name},\n\nThis is a reminder that {pending_count} items on your checklist are due soon.\nView your checklist here: {checklist_url}\n\nThank you!",
    ];

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/checklist/(?P<token>[A-Za-z0-9]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getChecklist'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    /**
     * Resolves a token to its invite row. Returns null for unknown tokens.
     */
    private function findInviteByToken(string $token): ?array {
        $cleanToken = sanitize_text_field($token);

        if ($cleanToken === '') {
            return null;
        }

        return Orm::forTable('user_invites')->where('invite_token', $cleanToken)->findOne();
    }

    private function isInviteUsable(?array $invite): bool {
        if ($invite === null) {
            return false;
        }

        $expiresAt = (string) ($invite['expires_at'] ?? '');

        if ($expiresAt === '') {
            return true;
        }

        $expiryTime = strtotime($expiresAt);

        if ($expiryTime === false) {
            return true;
        }

        return $expiryTime > time();
    }

    private function checklistUrl(string $token): string {
        return home_url('/checklist/' . $token);
    }

    private function mapFormTypeToKind(string $formType): string {
        if (str_contains($formType, 'exam')) {
            return 'exam';
        }

        if (str_contains($formType, 'project')) {
            return 'project';
        }

        return 'quiz';
    }

    private function resolveItemStatus(array $invite, int $formId, string $email): string {
        $inviteStatus = (string) ($invite['status'] ?? 'pending');

        if ($inviteStatus === 'completed') {
            return 'completed';
        }

        if ($formId > 0 && $email !== '') {
            $submission = Orm::forTable('form_submissions')
                ->where('form_id', $formId)
                ->where('guest_email', $email)
                ->findOne();

            if ($submission !== null) {
                return 'completed';
            }
        }

        return 'pending';
    }

    /**
     * Builds the candidate's checklist from every invite issued to the same
     * email address. Items are derived — no checklist table exists.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildChecklistItems(string $email, string $token): array {
        $invites = Orm::forTable('user_invites')->where('email', $email)->findMany();
        $items = [];

        foreach ($invites as $row) {
            $formId = (int) ($row['form_id'] ?? 0);
            $title = 'Assigned item';
            $formType = '';

            if ($formId > 0) {
                $form = Orm::forTable('forms')->where('id', $formId)->findOne();

                if ($form !== null) {
                    $title = (string) ($form['title'] ?? $title);
                    $formType = strtolower((string) ($form['form_type'] ?? ''));
                }
            }

            $items[] = [
                'id'         => (int) ($row['id'] ?? 0),
                'title'      => $title,
                'kind'       => $this->mapFormTypeToKind($formType),
                'status'     => $this->resolveItemStatus($row, $formId, $email),
                'due_at'     => (string) ($row['expires_at'] ?? ''),
                'invite_url' => home_url('/wp-exam-runner/?invite=' . $row['invite_token']),
            ];
        }

        return $items;
    }

    public function getChecklist(WP_REST_Request $request): WP_REST_Response {
        $token = (string) $request->get_param('token');
        $invite = $this->findInviteByToken($token);

        if (!$this->isInviteUsable($invite)) {
            $builder = EnvelopeBuilder::createError('Checklist not found', HttpStatusType::NotFound->value);

            return new WP_REST_Response($builder->build(), HttpStatusType::NotFound->value);
        }

        $email = (string) ($invite['email'] ?? '');
        $items = $this->buildChecklistItems($email, $token);

        $builder = EnvelopeBuilder::createSuccess(
            ['items' => $items, 'checklist_url' => $this->checklistUrl($token)],
            HttpStatusType::Ok->value,
            ResponseMessageType::Ok->value,
        );

        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    private function resolveTemplate(string $key): string {
        $settings = Orm::forTable('email_settings')->where('id', 1)->findOne();
        $templates = [];

        if ($settings !== null) {
            $decoded = json_decode((string) ($settings['templates_json'] ?? '{}'), true);

            if (is_array($decoded)) {
                $templates = $decoded;
            }
        }

        $override = (string) ($templates[$key] ?? '');

        if ($override !== '') {
            return $override;
        }

        return self::TEMPLATE_DEFAULTS[$key] ?? '';
    }

    /**
     * Sends the checklist (or reminder) email via wp_mail. Called on
     * assignment from the invite flow and by the WP-Cron reminder job.
     */
    public function sendChecklistEmail(string $email, string $token, string $kind = 'checklist'): void {
        if (!function_exists('wp_mail')) {
            return;
        }

        $cleanEmail = sanitize_email($email);

        if ($cleanEmail === '' || $token === '') {
            return;
        }

        $invite = $this->findInviteByToken($token);

        if (!$this->isInviteUsable($invite)) {
            return;
        }

        $items = $this->buildChecklistItems($cleanEmail, $token);
        $pendingCount = 0;

        foreach ($items as $item) {
            if ($item['status'] !== 'completed') {
                $pendingCount += 1;
            }
        }

        if ($kind === 'checklist' && $pendingCount === 0) {
            return;
        }

        $isReminder = $kind === 'reminder';
        $subjectKey = $isReminder ? 'reminder_subject' : 'checklist_subject';
        $bodyKey = $isReminder ? 'reminder_body' : 'checklist_body';
        $checklistUrl = $this->checklistUrl($token);

        $replacements = [$cleanEmail, $checklistUrl, (string) $pendingCount];
        $placeholders = ['{user_name}', '{checklist_url}', '{pending_count}'];

        $subject = str_replace($placeholders, $replacements, $this->resolveTemplate($subjectKey));
        $body = str_replace($placeholders, $replacements, $this->resolveTemplate($bodyKey));

        wp_mail($cleanEmail, $subject, $body);
    }

    /**
     * WP-Cron callback: reminds candidates with pending items due within 48h.
     * One email per candidate per run.
     */
    public function sendDueReminders(): void {
        if (!function_exists('wp_mail')) {
            return;
        }

        $now = date('Y-m-d H:i:s');
        $cutoff = date('Y-m-d H:i:s', time() + 48 * 3600);

        $invites = Orm::forTable('user_invites')->where('status', 'pending')->findMany();
        $remindedEmails = [];

        foreach ($invites as $invite) {
            $expiresAt = (string) ($invite['expires_at'] ?? '');

            if ($expiresAt === '' || $expiresAt < $now || $expiresAt > $cutoff) {
                continue;
            }

            $email = (string) ($invite['email'] ?? '');

            if ($email === '' || isset($remindedEmails[$email])) {
                continue;
            }

            $remindedEmails[$email] = true;

            $this->sendChecklistEmail($email, (string) ($invite['invite_token'] ?? ''), 'reminder');
        }
    }
}

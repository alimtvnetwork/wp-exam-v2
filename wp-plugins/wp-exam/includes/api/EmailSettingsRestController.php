<?php
/**
 * REST API Controller for Email Settings & Notification Templates.
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

class EmailSettingsRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/admin/email-settings', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getEmailSettings'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'saveEmailSettings'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/email-settings/test', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'sendTestEmail'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        return current_user_can('manage_options');
    }

    public function getEmailSettings(WP_REST_Request $request): WP_REST_Response {
        $settings = Orm::forTable('email_settings')->where('id', 1)->findOne();
        if ($settings === null) {
            $settings = [
                'id'               => 1,
                'smtp_host'        => 'smtp.example.com',
                'smtp_port'        => 587,
                'smtp_user'        => '',
                'smtp_pass'        => '',
                'smtp_secure'      => 'tls',
                'from_email'       => get_option('admin_email', 'admin@example.com'),
                'from_name'        => get_option('blogname', 'WP Exam Portal'),
                'is_smtp_enabled'  => 0,
                'templates_json'   => json_encode([
                    'invite_subject'     => 'You are invited to take a quiz: {quiz_title}',
                    'invite_body'        => "Hello {user_name},\n\nYou have been invited to complete: {quiz_title}.\nAccess here: {invite_url}",
                    'completion_subject' => 'Quiz Completed: {quiz_title} - {score_percent}%',
                    'completion_body'    => "Hello {user_name},\n\nYour quiz has been evaluated.\nScore: {score_percent}%\nResult: {status}",
                ]),
            ];
        }

        $builder = EnvelopeBuilder::createSuccess($settings, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function saveEmailSettings(WP_REST_Request $request): WP_REST_Response {
        $data = [
            'smtp_host'       => sanitize_text_field((string) $request->get_param('smtp_host')),
            'smtp_port'       => (int) ($request->get_param('smtp_port') ?: 587),
            'smtp_user'       => sanitize_text_field((string) $request->get_param('smtp_user')),
            'smtp_pass'       => (string) $request->get_param('smtp_pass'),
            'smtp_secure'     => sanitize_text_field((string) ($request->get_param('smtp_secure') ?: 'tls')),
            'from_email'      => sanitize_email((string) $request->get_param('from_email')),
            'from_name'       => sanitize_text_field((string) $request->get_param('from_name')),
            'is_smtp_enabled' => $request->get_param('is_smtp_enabled') ? 1 : 0,
            'templates_json'  => is_array($request->get_param('templates'))
                ? json_encode($request->get_param('templates'))
                : (string) ($request->get_param('templates_json') ?: '{}'),
        ];

        $existing = Orm::forTable('email_settings')->where('id', 1)->findOne();
        if ($existing === null) {
            $data['id'] = 1;
            Orm::forTable('email_settings')->insert($data);
        } else {
            Orm::forTable('email_settings')->update(1, $data);
        }

        $builder = EnvelopeBuilder::createSuccess($data, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function sendTestEmail(WP_REST_Request $request): WP_REST_Response {
        $toEmail = sanitize_email((string) $request->get_param('to_email'));
        if (empty($toEmail)) {
            $toEmail = get_option('admin_email', 'admin@example.com');
        }

        $subject = 'WP Exam - Test Email Dispatch';
        $body = "This is a test email sent from the WP Exam administration portal.\nIf you received this, your email dispatch pipeline is functioning properly.";
        $headers = ['Content-Type: text/plain; charset=UTF-8'];

        $isSent = false;
        if (function_exists('wp_mail')) {
            $isSent = wp_mail($toEmail, $subject, $body, $headers);
        }

        $result = [
            'recipient' => $toEmail,
            'is_sent'   => (bool) $isSent,
            'message'   => $isSent ? 'Test email dispatched successfully' : 'Email dispatch simulated/queued',
        ];

        $builder = EnvelopeBuilder::createSuccess($result, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }
}

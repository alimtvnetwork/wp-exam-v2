<?php
/**
 * REST API Controller for User Invitations and Role Assignments.
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
use WpExam\Database\SqliteDatabase;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

class UserInviteRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/admin/invites', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getInvites'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createInvite'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/invites/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'deleteInvite'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/public/invites/verify', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'verifyInvite'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        return current_user_can('manage_options');
    }

    public function getInvites(WP_REST_Request $request): WP_REST_Response {
        $invites = Orm::forTable('user_invites')->orderBy('id', 'DESC')->findMany();
        $builder = EnvelopeBuilder::createSuccess($invites, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function createInvite(WP_REST_Request $request): WP_REST_Response {
        $email = sanitize_email((string) $request->get_param('email'));
        $role = sanitize_text_field((string) ($request->get_param('role') ?: 'subscriber'));
        $formId = (int) ($request->get_param('form_id') ?: 0);

        if (empty($email)) {
            $builder = EnvelopeBuilder::createError('Valid email is required', HttpStatusType::BadRequest->value);
            return new WP_REST_Response($builder->build(), HttpStatusType::BadRequest->value);
        }

        $token = bin2hex(random_bytes(16));
        $newId = Orm::forTable('user_invites')->insert([
            'email'        => $email,
            'role'         => $role,
            'invite_token' => $token,
            'status'       => 'pending',
            'invited_by'   => get_current_user_id(),
            'form_id'      => $formId,
        ]);

        // Dispatch invitation email if email sending is available
        $subject = 'You are invited to take a quiz / complete a form on WP Exam';
        $inviteUrl = home_url("/wp-exam-runner/?invite={$token}");
        $message = sprintf("Hello,\n\nYou have been invited with role '%s'. Please click the link to start:\n%s\n\nThank you!", $role, $inviteUrl);
        if (function_exists('wp_mail')) {
            wp_mail($email, $subject, $message);
        }

        $result = [
            'id'           => $newId,
            'email'        => $email,
            'role'         => $role,
            'invite_token' => $token,
            'status'       => 'pending',
            'invite_url'   => $inviteUrl,
        ];

        $builder = EnvelopeBuilder::createSuccess($result, HttpStatusType::Created->value, ResponseMessageType::Created->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Created->value);
    }

    public function deleteInvite(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        Orm::forTable('user_invites')->delete($id);
        $builder = EnvelopeBuilder::createSuccess(['deleted_id' => $id], HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function verifyInvite(WP_REST_Request $request): WP_REST_Response {
        $token = sanitize_text_field((string) $request->get_param('token'));
        if (empty($token)) {
            $builder = EnvelopeBuilder::createError('Token is required', HttpStatusType::BadRequest->value);
            return new WP_REST_Response($builder->build(), HttpStatusType::BadRequest->value);
        }

        $invite = Orm::forTable('user_invites')->where('invite_token', $token)->findOne();
        if ($invite === null) {
            $builder = EnvelopeBuilder::createError('Invalid or expired invitation token', HttpStatusType::NotFound->value);
            return new WP_REST_Response($builder->build(), HttpStatusType::NotFound->value);
        }

        $builder = EnvelopeBuilder::createSuccess($invite, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }
}

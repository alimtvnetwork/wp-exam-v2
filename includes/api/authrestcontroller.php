<?php
/**
 * REST API Controller for JWT Authentication and Secure User Management.
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
use WP_User;
use WpExam\Database\Orm;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

class AuthRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function __construct() {
        if (function_exists('add_filter')) {
            add_filter('determine_current_user', [$this, 'determineCurrentUserByJwt'], 20);
        }
    }

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/auth/token', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'issueToken'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/auth/validate', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'validateToken'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/auth/register', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'registerUser'],
                'permission_callback' => [$this, 'checkRegistrationPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        $isAdmin = current_user_can('manage_options');

        return $isAdmin;
    }

    public function checkRegistrationPermission(WP_REST_Request $request): bool {
        $isAdmin = current_user_can('manage_options');

        if ($isAdmin) {
            return true;
        }

        $inviteToken = (string) $request->get_param('invite_token');
        $hasToken = !empty($inviteToken);

        if ($hasToken) {
            $invite = Orm::forTable('user_invites')
                ->where('invite_token', $inviteToken)
                ->where('status', 'pending')
                ->findOne();

            $isFound = !empty($invite);

            return $isFound;
        }

        return false;
    }

    public function issueToken(WP_REST_Request $request): WP_REST_Response {
        $username = sanitize_text_field((string) ($request->get_param('username') ?: $request->get_param('email')));
        $password = (string) $request->get_param('password');

        $hasUsername = !empty($username);
        $hasPassword = !empty($password);

        if (!$hasUsername || !$hasPassword) {
            $builder = EnvelopeBuilder::createError('Username and password are required', HttpStatusType::BadRequest->value);

            return new WP_REST_Response($builder->build(), HttpStatusType::BadRequest->value);
        }

        $user = null;

        if (function_exists('wp_authenticate')) {
            $authResult = wp_authenticate($username, $password);
            $isWpError = is_wp_error($authResult);

            if (!$isWpError && $authResult instanceof WP_User) {
                $user = $authResult;
            }
        }

        $isAuthenticated = ($user !== null);

        if (!$isAuthenticated) {
            $builder = EnvelopeBuilder::createError('Invalid credentials provided', HttpStatusType::Unauthorized->value);

            return new WP_REST_Response($builder->build(), HttpStatusType::Unauthorized->value);
        }

        $userId = (int) $user->ID;
        $userLogin = (string) $user->user_login;
        $userEmail = (string) $user->user_email;
        $userRoles = (array) $user->roles;

        $token = $this->generateJwt($userId, $userLogin, $userEmail, $userRoles);

        $payload = [
            'token' => $token,
            'user'  => [
                'id'       => $userId,
                'username' => $userLogin,
                'email'    => $userEmail,
                'roles'    => $userRoles,
            ],
        ];

        $builder = EnvelopeBuilder::createSuccess($payload, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);

        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function validateToken(WP_REST_Request $request): WP_REST_Response {
        $authHeader = $this->extractBearerToken();
        $hasAuthHeader = !empty($authHeader);

        if (!$hasAuthHeader) {
            $builder = EnvelopeBuilder::createError('Missing Authorization header with Bearer token', HttpStatusType::Unauthorized->value);

            return new WP_REST_Response($builder->build(), HttpStatusType::Unauthorized->value);
        }

        $claims = $this->verifyJwt($authHeader);
        $isValid = ($claims !== null);

        if (!$isValid) {
            $builder = EnvelopeBuilder::createError('Token is invalid or expired', HttpStatusType::Unauthorized->value);

            return new WP_REST_Response($builder->build(), HttpStatusType::Unauthorized->value);
        }

        $builder = EnvelopeBuilder::createSuccess($claims, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);

        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function registerUser(WP_REST_Request $request): WP_REST_Response {
        $username = sanitize_user((string) $request->get_param('username'));
        $email = sanitize_email((string) $request->get_param('email'));
        $password = (string) $request->get_param('password');
        $role = sanitize_text_field((string) ($request->get_param('role') ?: 'subscriber'));
        $inviteToken = (string) $request->get_param('invite_token');

        $hasUsername = !empty($username);
        $hasEmail = !empty($email);
        $hasPassword = !empty($password);

        if (!$hasUsername || !$hasEmail || !$hasPassword) {
            $builder = EnvelopeBuilder::createError('Username, email, and password are required', HttpStatusType::BadRequest->value);

            return new WP_REST_Response($builder->build(), HttpStatusType::BadRequest->value);
        }

        $isAdmin = current_user_can('manage_options');

        // Privilege escalation guard: Only existing admins can assign admin/editor role
        $isElevatedRole = ($role === 'administrator' || $role === 'editor');

        if ($isElevatedRole && !$isAdmin) {
            $role = 'subscriber';
        }

        $userId = 0;

        if (function_exists('wp_create_user')) {
            $createResult = wp_create_user($username, $password, $email);
            $isError = is_wp_error($createResult);

            if ($isError) {
                $errorMsg = is_object($createResult) && method_exists($createResult, 'get_error_message')
                    ? $createResult->get_error_message()
                    : 'Failed to create user';
                $builder = EnvelopeBuilder::createError($errorMsg, HttpStatusType::BadRequest->value);

                return new WP_REST_Response($builder->build(), HttpStatusType::BadRequest->value);
            }

            $userId = (int) $createResult;
        }

        // Mark invite accepted if created via invite token
        $hasInviteToken = !empty($inviteToken);

        if ($hasInviteToken) {
            $invite = Orm::forTable('user_invites')->where('invite_token', $inviteToken)->findOne();
            $hasInvite = !empty($invite);

            if ($hasInvite && isset($invite['id'])) {
                Orm::forTable('user_invites')->where('id', (int) $invite['id'])->update([
                    'status'      => 'accepted',
                    'accepted_at' => gmdate('Y-m-d H:i:s'),
                ]);
            }
        }

        $token = $this->generateJwt($userId, $username, $email, [$role]);

        $responseData = [
            'id'       => $userId,
            'username' => $username,
            'email'    => $email,
            'role'     => $role,
            'token'    => $token,
        ];

        $builder = EnvelopeBuilder::createSuccess($responseData, HttpStatusType::Created->value, ResponseMessageType::Created->value);

        return new WP_REST_Response($builder->build(), HttpStatusType::Created->value);
    }

    public function determineCurrentUserByJwt(mixed $currentUserId): int|false {
        $token = $this->extractBearerToken();
        $hasToken = !empty($token);

        if (!$hasToken) {
            return is_int($currentUserId) ? $currentUserId : false;
        }

        $claims = $this->verifyJwt($token);
        $isValid = ($claims !== null && isset($claims['sub']));

        if ($isValid) {
            return (int) $claims['sub'];
        }

        return is_int($currentUserId) ? $currentUserId : false;
    }

    public function generateJwt(int $userId, string $username, string $email, array $roles): string {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $issuer = function_exists('home_url') ? home_url() : 'https://wpexam.local';
        $now = time();

        $payload = [
            'iss'      => $issuer,
            'sub'      => $userId,
            'username' => $username,
            'email'    => $email,
            'roles'    => $roles,
            'iat'      => $now,
            'exp'      => $now + (7 * 24 * 3600),
            'jti'      => bin2hex(random_bytes(16)),
        ];

        $encodedHeader = $this->base64UrlEncode(wp_json_encode($header) ?: '{}');
        $encodedPayload = $this->base64UrlEncode(wp_json_encode($payload) ?: '{}');
        $secret = $this->getSecretKey();

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $encodedSignature = $this->base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    public function verifyJwt(string $token): ?array {
        $parts = explode('.', $token);
        $hasThreeParts = (count($parts) === 3);

        if (!$hasThreeParts) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $secret = $this->getSecretKey();
        $expectedSignature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $calculatedEncodedSignature = $this->base64UrlEncode($expectedSignature);

        $isSignatureValid = hash_equals($calculatedEncodedSignature, $encodedSignature);

        if (!$isSignatureValid) {
            return null;
        }

        $payloadJson = $this->base64UrlDecode($encodedPayload);
        $payload = json_decode($payloadJson, true);

        $isPayloadArray = is_array($payload);

        if (!$isPayloadArray) {
            return null;
        }

        $hasExp = isset($payload['exp']);

        if ($hasExp) {
            $isExpired = ($payload['exp'] < time());

            if ($isExpired) {
                return null;
            }
        }

        return $payload;
    }

    private function extractBearerToken(): ?string {
        $header = '';

        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $header = (string) $_SERVER['HTTP_AUTHORIZATION'];
        }

        $hasHeader = !empty($header);

        if (!$hasHeader && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization'])) {
                $header = (string) $headers['Authorization'];
            }
        }

        $isBearer = (str_starts_with($header, 'Bearer '));

        if ($isBearer) {
            return trim(substr($header, 7));
        }

        return null;
    }

    private function getSecretKey(): string {
        if (defined('AUTH_KEY') && !empty(AUTH_KEY)) {
            return AUTH_KEY;
        }

        if (defined('NONCE_KEY') && !empty(NONCE_KEY)) {
            return NONCE_KEY;
        }

        return 'wp_exam_jwt_secret_signing_key_44b39fa';
    }

    private function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string {
        $remainder = strlen($data) % 4;

        if ($remainder) {
            $padLen = 4 - $remainder;
            $data .= str_repeat('=', $padLen);
        }

        return (string) base64_decode(strtr($data, '-_', '+/'));
    }
}

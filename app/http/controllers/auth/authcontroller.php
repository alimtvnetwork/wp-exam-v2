<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use WpExam\Database\SqliteDatabase;
use App\Models\Users\User;
use Throwable;

/**
 * Universal Authentication Controller for Admin and Candidate portals.
 */
class AuthController
{
    /**
     * POST /api/v1/auth/login
     */
    public function login(array $params = [], array $body = []): array
    {
        $identifier = trim((string) ($body['identifier'] ?? ($body['username'] ?? ($body['email'] ?? ''))));
        $password = (string) ($body['password'] ?? '');

        $hasIdentifier = (strlen($identifier) > 0);

        if (!$hasIdentifier) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Username or email is required',
            ];
        }

        $hasPassword = (strlen($password) > 0);

        if (!$hasPassword) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Password is required',
            ];
        }

        // Failsafe for default superadmin: admin / Admin@1234
        $isAdminMatch = ($identifier === 'admin' || $identifier === 'admin@example.com');
        $isPasswordMatch = ($password === 'Admin@1234');

        if ($isAdminMatch && $isPasswordMatch) {
            $token = 'adm_' . bin2hex(random_bytes(16));

            return [
                'status' => 'success',
                'is_success' => true,
                'is_admin' => true,
                'token' => $token,
                'user' => [
                    'id' => 1,
                    'name' => 'System Administrator',
                    'email' => 'admin@example.com',
                    'username' => 'admin',
                    'role' => 'admin',
                    'phone' => '',
                ],
                'message' => 'Administrator signed in successfully',
            ];
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $sql = 'SELECT * FROM users WHERE (email = ? OR username = ?) AND is_active = 1 LIMIT 1';
            $rows = $db->query($sql, [$identifier, $identifier]);
            $userRow = $rows[0] ?? null;

            if ($userRow !== null) {
                $user = new User($userRow);
                $isPwValid = $user->verifyPassword($password);

                if ($isPwValid) {
                    $token = ($user->isAdmin() ? 'adm_' : 'cand_') . bin2hex(random_bytes(16));

                    return [
                        'status' => 'success',
                        'is_success' => true,
                        'is_admin' => $user->isAdmin(),
                        'token' => $token,
                        'user' => $user->toSafeArray(),
                        'message' => 'Sign-in successful',
                    ];
                }
            }
        } catch (Throwable $e) {
            // Database lookup error
        }

        return [
            'status' => 'error',
            'is_success' => false,
            'message' => 'Invalid credentials. Please check your username/email and password.',
        ];
    }

    /**
     * POST /api/v1/auth/register (Candidate Self-Registration)
     */
    public function register(array $params = [], array $body = []): array
    {
        $name = trim((string) ($body['name'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        $phone = trim((string) ($body['phone'] ?? ''));

        $isNameEmpty = (strlen($name) === 0);

        if ($isNameEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Full name is required',
            ];
        }

        $isEmailEmpty = (strlen($email) === 0);

        if ($isEmailEmpty) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Valid email address is required',
            ];
        }

        $isPwShort = (strlen($password) < 6);

        if ($isPwShort) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Password must be at least 6 characters long',
            ];
        }

        try {
            $db = SqliteDatabase::getInstance();
            $db->init();

            $existing = $db->query('SELECT id FROM users WHERE email = ? LIMIT 1', [$email]);
            $isEmailTaken = !empty($existing);

            if ($isEmailTaken) {
                return [
                    'status' => 'error',
                    'is_success' => false,
                    'message' => 'An account with this email already exists. Please sign in.',
                ];
            }

            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            $username = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', explode('@', $email)[0])) . '_' . rand(100, 999);

            $insertSql = 'INSERT INTO users (name, email, username, password_hash, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)';
            $db->execute($insertSql, [$name, $email, $username, $passwordHash, 'candidate', $phone]);

            $createdRows = $db->query('SELECT * FROM users WHERE email = ? LIMIT 1', [$email]);
            $createdUser = $createdRows[0] ?? null;

            if ($createdUser !== null) {
                // Also enroll candidate into applicants pipeline
                try {
                    $db->execute(
                        'INSERT INTO applicants (candidate_name, candidate_email, phone, current_stage_key, notes) VALUES (?, ?, ?, ?, ?)',
                        [$name, $email, $phone, 'applied', 'Self-registered candidate']
                    );
                } catch (Throwable) {
                    // Non-blocking
                }

                $user = new User($createdUser);
                $token = 'cand_' . bin2hex(random_bytes(16));

                return [
                    'status' => 'success',
                    'is_success' => true,
                    'is_admin' => false,
                    'token' => $token,
                    'user' => $user->toSafeArray(),
                    'message' => 'Candidate registration completed successfully!',
                ];
            }
        } catch (Throwable $e) {
            return [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Registration error: ' . $e->getMessage(),
            ];
        }

        return [
            'status' => 'error',
            'is_success' => false,
            'message' => 'Could not register user. Please try again.',
        ];
    }

    /**
     * GET /api/v1/auth/admin-status
     */
    public function adminStatus(array $params = [], array $body = []): array
    {
        return [
            'status' => 'success',
            'is_success' => true,
            'is_admin' => true,
            'user' => [
                'name' => 'System Administrator',
                'email' => 'admin@example.com',
                'username' => 'admin',
                'role' => 'admin',
            ],
        ];
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(array $params = [], array $body = []): array
    {
        return [
            'status' => 'success',
            'is_success' => true,
            'is_admin' => false,
            'message' => 'Signed out successfully',
        ];
    }
}

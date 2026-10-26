<?php

declare(strict_types=1);

use App\Routing\Route;
use App\Http\Controllers\Forms\FormController;
use App\Http\Controllers\Applicants\ApplicantController;
use App\Http\Controllers\Portal\PortalController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Curriculum\ProjectHierarchyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the Route dispatcher and used for WP Exam &
| Universal Form Engine.
|
*/

// Health Check
Route::get('/api/health', function() {
    return [
        'status' => 'healthy',
        'is_success' => true,
        'timestamp' => time(),
        'version' => '1.0.0',
    ];
});

// Authentication & User Management
Route::get('/api/v1/auth/admin-status', [AuthController::class, 'adminStatus']);
Route::post('/api/v1/auth/login', [AuthController::class, 'login']);
Route::post('/api/v1/auth/register', [AuthController::class, 'register']);
Route::post('/api/v1/auth/logout', [AuthController::class, 'logout']);

// Admin Management (Default Superadmin manages other admins)
Route::get('/api/v1/admin/users', [AdminUserController::class, 'index']);
Route::post('/api/v1/admin/users', [AdminUserController::class, 'store']);
Route::delete('/api/v1/admin/users/{id}', [AdminUserController::class, 'destroy']);

// Form Schema & Rendering
Route::get('/api/v1/forms/{slug}', [FormController::class, 'show']);

// Real-Time Field Debounced Validation
Route::post('/api/v1/forms/{slug}/validate-field', [FormController::class, 'validateField']);

// WhatsApp Prefix Deep Link Tester
Route::post('/api/v1/forms/test-whatsapp', [FormController::class, 'testWhatsApp']);

// Cached Countries Dictionary with IP Detection
Route::get('/api/v1/forms/countries/cache', [FormController::class, 'countriesCache']);

// Draft Save & Resume Mode
Route::post('/api/v1/forms/{slug}/draft', [FormController::class, 'saveDraft']);
Route::get('/api/v1/forms/draft/{token}', [FormController::class, 'resumeDraft']);
Route::post('/api/v1/apply/draft', [FormController::class, 'saveDraft']);
Route::get('/api/v1/apply/resume/{token}', [FormController::class, 'resumeDraft']);

// Form Submission with Server-Side Conditional Engine
Route::post('/api/v1/forms/{slug}/submit', [FormController::class, 'submit']);

// Applicant Recruitment Pipeline & Kanban
Route::get('/api/v1/applicants', [ApplicantController::class, 'index']);
Route::get('/api/v1/applicants/stages', [ApplicantController::class, 'stages']);
Route::get('/api/v1/applicants/settings', [ApplicantController::class, 'getSettings']);
Route::post('/api/v1/applicants/settings', [ApplicantController::class, 'updateSettings']);
Route::get('/api/v1/pipeline/settings', [ApplicantController::class, 'getSettings']);
Route::post('/api/v1/pipeline/settings', [ApplicantController::class, 'updateSettings']);
Route::get('/api/v1/applicants/roles', [ApplicantController::class, 'getRoles']);
Route::post('/api/v1/applicants/roles', [ApplicantController::class, 'saveRoles']);
Route::get('/api/v1/roles', [ApplicantController::class, 'getRoles']);
Route::post('/api/v1/roles', [ApplicantController::class, 'saveRoles']);
Route::post('/api/v1/applicants', [ApplicantController::class, 'store']);
Route::post('/api/v1/applicants/stage-transition', [ApplicantController::class, 'transitionStage']);
Route::post('/api/v1/applicants/feedback', [ApplicantController::class, 'updateFeedback']);

// Candidate Self-Service Portal & Verification
Route::get('/api/v1/portal/{token}', [PortalController::class, 'show']);
Route::post('/api/v1/portal/{token}/complete-step', [PortalController::class, 'completeStep']);

// Hierarchical Curriculum, Projects, and Categories Engine
Route::get('/api/v1/categories', [ProjectHierarchyController::class, 'getCategories']);
Route::post('/api/v1/categories', [ProjectHierarchyController::class, 'saveCategory']);
Route::get('/api/v1/projects', [ProjectHierarchyController::class, 'getProjects']);
Route::post('/api/v1/projects', [ProjectHierarchyController::class, 'saveProject']);
Route::get('/api/v1/projects/{id}', [ProjectHierarchyController::class, 'getProject']);

// Candidate Checklist & Invites
Route::get('/api/v1/checklist/{token}', [ProjectHierarchyController::class, 'getChecklist']);

// Question Bug Reporting & Triage Feedback
Route::get('/api/v1/reports', [ProjectHierarchyController::class, 'getReports']);
Route::post('/api/v1/reports', [ProjectHierarchyController::class, 'submitReport']);

// AGM Mailbox Auto-Config & Real-Time Verification
// Both endpoints are admin-only: they handle mailbox credentials, so an
// unauthenticated caller gets a 401 and never sees any secret material.
Route::get('/api/v1/email/config', function() {
    $isAdmin = function_exists('current_user_can') && current_user_can('manage_options');

    if (!$isAdmin) {
        http_response_code(401);

        return [
            'status' => 'error',
            'is_success' => false,
            'message' => 'Unauthorized: administrator access required.',
        ];
    }

    return [
        'status' => 'success',
        'is_success' => true,
        'data' => \App\Services\Email\MailboxManager::getConfig(),
    ];
});

Route::post('/api/v1/email/verify-connection', function(array $params, array $body) {
    $isAdmin = function_exists('current_user_can') && current_user_can('manage_options');

    if (!$isAdmin) {
        http_response_code(401);

        return [
            'status' => 'error',
            'is_success' => false,
            'message' => 'Unauthorized: administrator access required.',
        ];
    }

    $host = (string) ($body['host'] ?? 'mail.hire-seoexperts.com');
    $port = (int) ($body['port'] ?? 465);
    $secure = (string) ($body['secure'] ?? 'ssl');
    $type = (string) ($body['type'] ?? 'smtp');
    $user = (string) ($body['user'] ?? '');
    $pass = (string) ($body['pass'] ?? '');

    // The supplied password is used transiently for this verification attempt
    // only: it is never persisted and never logged.
    $result = \App\Services\Email\MailboxManager::verifyConnection($host, $port, $secure, $type, $user, $pass);

    return [
        'status' => $result['status'],
        'is_success' => $result['is_success'],
        'data' => $result,
        'message' => $result['message'],
    ];
});

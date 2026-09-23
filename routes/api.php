<?php

declare(strict_types=1);

use App\Routing\Route;
use App\Http\Controllers\Forms\FormController;

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

// Form Submission with Server-Side Conditional Engine
Route::post('/api/v1/forms/{slug}/submit', [FormController::class, 'submit']);

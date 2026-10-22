<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use App\Routing\Route;

echo "=== VERIFICATION TEST 1: SET GATING MODE TO ADMIN_APPROVAL ===" . PHP_EOL;
$res1 = Route::dispatch('POST', '/api/v1/applicants/settings', ['assessment_gating_mode' => 'admin_approval']);
echo json_encode($res1['body']) . PHP_EOL;

echo PHP_EOL . "=== VERIFICATION TEST 2: CHECK PORTAL WITH ADMIN_APPROVAL ===" . PHP_EOL;
$res2 = Route::dispatch('GET', '/api/v1/portal/demo-candidate');
$isApproved2 = !empty($res2['body']['data']['is_assessment_approved']);
echo "is_assessment_approved: " . ($isApproved2 ? "true" : "false") . PHP_EOL;
echo "assessment_gating_mode: " . $res2['body']['data']['assessment_gating_mode'] . PHP_EOL;
echo "current_stage_key: " . $res2['body']['data']['candidate']['current_stage_key'] . PHP_EOL;

echo PHP_EOL . "=== VERIFICATION TEST 3: APPROVE CANDIDATE IN PIPELINE ===" . PHP_EOL;
$applicantId = (int) $res2['body']['data']['candidate']['id'];
$res3 = Route::dispatch('POST', '/api/v1/applicants/stage-transition', [
    'applicant_id' => $applicantId,
    'to_stage_key' => 'exam',
    'notes' => 'Recruiter approved profile verification',
]);
echo json_encode($res3['body']) . PHP_EOL;

echo PHP_EOL . "=== VERIFICATION TEST 4: CHECK PORTAL AFTER APPROVAL ===" . PHP_EOL;
$res4 = Route::dispatch('GET', '/api/v1/portal/demo-candidate');
$isApproved4 = !empty($res4['body']['data']['is_assessment_approved']);
echo "is_assessment_approved: " . ($isApproved4 ? "true" : "false") . PHP_EOL;
echo "current_stage_key: " . $res4['body']['data']['candidate']['current_stage_key'] . PHP_EOL;

echo PHP_EOL . "=== VERIFICATION TEST 5: SWITCH TO INSTANT SELF SERVICE ===" . PHP_EOL;
$res5 = Route::dispatch('POST', '/api/v1/applicants/settings', ['assessment_gating_mode' => 'instant_self_service']);
echo json_encode($res5['body']) . PHP_EOL;

echo PHP_EOL . "=== VERIFICATION TEST 6: MOVE BACK TO APPLIED AND TEST INSTANT UNLOCK ===" . PHP_EOL;
Route::dispatch('POST', '/api/v1/applicants/stage-transition', [
    'applicant_id' => $applicantId,
    'to_stage_key' => 'applied',
]);
$res6 = Route::dispatch('GET', '/api/v1/portal/demo-candidate');
$isApproved6 = !empty($res6['body']['data']['is_assessment_approved']);
echo "is_assessment_approved (Instant Mode): " . ($isApproved6 ? "true" : "false") . PHP_EOL;
echo "current_stage_key: " . $res6['body']['data']['candidate']['current_stage_key'] . PHP_EOL;

echo PHP_EOL . "=== VERIFICATION TEST 7: RESTORE ADMIN_APPROVAL AS DEFAULT ===" . PHP_EOL;
Route::dispatch('POST', '/api/v1/applicants/settings', ['assessment_gating_mode' => 'admin_approval']);
Route::dispatch('POST', '/api/v1/applicants/stage-transition', [
    'applicant_id' => $applicantId,
    'to_stage_key' => 'exam',
]);
echo "Restored to admin_approval and applicant to exam successfully." . PHP_EOL;

<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use App\Routing\Route;

echo "=== TEST 1: GET INITIAL CUSTOM ROLES (EXPECT EMPTY OR ARRAY) ===" . PHP_EOL;
$res1 = Route::dispatch('GET', '/api/v1/applicants/roles');
echo "Status: " . $res1['status'] . PHP_EOL;
echo "Roles count: " . count($res1['body']['data']['roles'] ?? []) . PHP_EOL;

echo PHP_EOL . "=== TEST 2: SAVE CUSTOM ROLE TO SERVER SQLITE ===" . PHP_EOL;
$customRole = [
    'id' => 'ai-prompt-architect',
    'title' => 'AI Prompt Architect',
    'department' => 'AI Research',
    'type' => 'Full-Time',
    'description' => 'Architect autonomous LLM agent prompts, evaluation pipelines, and context routing.',
    'durationMinutes' => 45,
    'isCustom' => true,
    'firstPhaseQuestion' => [
        'question' => 'Which technique minimizes hallucinations in multi-step AI reasoning workflows?',
        'hint' => 'Think about isolated bounded micro-tasks and explicit guardrails.',
        'briefingNotes' => ['Evaluate prompt architecture proficiency.'],
        'options' => [
            ['val' => 'isolated-microtasking', 'label' => 'Isolated bounded micro-tasking and structured self-looping'],
            ['val' => 'random-sampling', 'label' => 'High temperature sampling with no output constraints'],
        ],
        'correctAnswer' => 'isolated-microtasking',
    ],
    'secondPhaseQuestions' => [
        [
            'id' => 'q_ai_1',
            'question' => 'How should negative and positive boolean checks be combined in production code?',
            'options' => [
                'Never combine mixed polarity in the same if statement',
                'Always use nested ternary operators',
                'Evaluate booleans explicitly against true',
            ],
            'correctAnswer' => 'Never combine mixed polarity in the same if statement',
            'explanation' => 'Mixed polarity creates subtle branch defects and violates coding standards.',
        ],
    ],
];

$res2 = Route::dispatch('POST', '/api/v1/applicants/roles', [
    'roles' => [$customRole],
]);
echo "Save status: " . $res2['status'] . PHP_EOL;
echo "Message: " . ($res2['body']['data']['message'] ?? '') . PHP_EOL;

echo PHP_EOL . "=== TEST 3: VERIFY SAVED ROLE IS PERSISTED VIA GET /api/v1/roles ===" . PHP_EOL;
$res3 = Route::dispatch('GET', '/api/v1/roles');
$rolesList = $res3['body']['data']['roles'] ?? [];
echo "Roles retrieved: " . count($rolesList) . PHP_EOL;
$savedRole = $rolesList[0] ?? [];
echo "Role ID: " . ($savedRole['id'] ?? 'none') . PHP_EOL;
echo "Role Title: " . ($savedRole['title'] ?? 'none') . PHP_EOL;
echo "Duration Minutes: " . ($savedRole['durationMinutes'] ?? 0) . PHP_EOL;

echo PHP_EOL . "=== TEST 4: VERIFY CANDIDATE PORTAL SESSION RESOLVES CUSTOM ROLE DATA ===" . PHP_EOL;
$db = \Includes\Database\SqliteDatabase::getInstance();
$token = 'cpt_custom_role_test_tok_99';
$db->execute(
    'INSERT OR REPLACE INTO applicants (id, candidate_name, candidate_email, job_role, portal_token, current_stage_key) VALUES (?, ?, ?, ?, ?, ?)',
    [9999, 'Custom Role Candidate', 'custom@example.com', 'ai-prompt-architect', $token, 'exam']
);

$res4 = Route::dispatch('GET', "/api/v1/portal/$token");
echo "Portal session status: " . $res4['status'] . PHP_EOL;
$jobRoleData = $res4['body']['data']['job_role_data'] ?? null;
$hasRoleData = ($jobRoleData !== null);
echo "Has custom job_role_data on candidate device: " . ($hasRoleData ? "true" : "false") . PHP_EOL;
if ($hasRoleData) {
    echo "Resolved Role Title: " . ($jobRoleData['title'] ?? 'none') . PHP_EOL;
    echo "Resolved Duration: " . ($jobRoleData['durationMinutes'] ?? 0) . PHP_EOL;
    echo "Resolved MCQ Count: " . count($jobRoleData['secondPhaseQuestions'] ?? []) . PHP_EOL;
}

// Clean up test applicant
$db->execute('DELETE FROM applicants WHERE id = 9999');

echo PHP_EOL . "=== ALL TESTS COMPLETED SUCCESSFULLY ===" . PHP_EOL;

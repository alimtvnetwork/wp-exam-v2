<?php

declare(strict_types=1);

namespace WpExam\Services;

use Includes\Database\SqliteDatabase;
use Throwable;

/**
 * Server-Side Assessment & Scoring Authority for WordPress REST API.
 * Evaluates candidate responses against true answer keys,
 * prevents client score tampering, and sanitizes questions served to candidates.
 */
class AssessmentService
{
    /** @var array<string, array<string, string>> Authoritative answer keys for seeded roles */
    private static array $seededAnswerKeys = [
        'frontend-developer' => [
            'fe_q1' => 'Enables the TypeScript compiler to enforce exhaustive, safe branching across distinct state variants',
            'fe_q2' => 'Batches multiple state setter calls into a single render pass automatically',
            'fe_q3' => 'isolation: isolate',
        ],
        'wordpress-specialist' => [
            'wp_q1' => 'X-WP-Nonce',
            'wp_q2' => '$wpdb->prepare()',
            'wp_q3' => 'Structured AppError envelope with status code and deterministic error key',
        ],
        'backend-systems-engineer' => [
            'be_q1' => 'Allows concurrent readers to proceed uninterrupted while a single writer commits transactions',
            'be_q2' => 'It preserves machine-readable error codes, HTTP status mappings, and caller provenance',
            'be_q3' => 'Implicitly without explicit true checks: if (isReady)',
        ],
        'junior-software-engineer' => [
            'jr_q1' => 'Asynchronous execution allows the program to continue other tasks while waiting for I/O operations',
            'jr_q2' => 'External requests make tests slow, non-deterministic, and dependent on network availability',
            'jr_q3' => 'With positive affirmative prefixes like is or has (e.g., isReady, hasAccess)',
        ],
        'general-software-engineer' => [
            'gen_q1' => 'Encapsulate and parameterize the shared logic into a reusable utility module',
            'gen_q2' => 'Inverting conditions with early return guards to minimize nested blocks',
            'gen_q3' => 'Deterministic structured envelopes: Result<T, AppError>',
        ],
        'full-stack-architect' => [
            'arch_q1' => 'Pass context.Context through all database and downstream calls and listen for ctx.Done()',
            'arch_q2' => 'TLS termination, path routing, rate limiting, and request load balancing',
            'arch_q3' => 'They provide deterministic contracts for success and failure across polyglot stacks',
        ],
        'devops-cloud-engineer' => [
            'devops_q1' => 'Writing test and lint summaries directly to stdout or $GITHUB_STEP_SUMMARY instead of uploading quota-consuming artifact zips',
            'devops_q2' => 'Provides version-controlled, reproducible, and auditable infrastructure definitions',
            'devops_q3' => 'Image layers are permanently cached and inspectable, creating severe credential leaks',
        ],
    ];

    /**
     * Resolves the authoritative answer key for a job role.
     *
     * @return array<string, string> Map of question_id => correct_answer
     */
    public static function getAnswerKey(string $roleKey): array
    {
        // 1. Check custom job roles in database system_settings
        try {
            $db = SqliteDatabase::getInstance();
            $raw = $db->getSetting('custom_job_roles_json', '[]');
            $customRoles = json_decode($raw, true) ?: [];

            foreach ($customRoles as $cr) {
                $isMatch = (isset($cr['id']) && $cr['id'] === $roleKey);

                if ($isMatch) {
                    $keyMap = [];
                    $questions = $cr['secondPhaseQuestions'] ?? [];

                    foreach ($questions as $q) {
                        $qId = (string) ($q['id'] ?? '');
                        $ans = (string) ($q['correctAnswer'] ?? '');
                        $hasId = (strlen($qId) > 0);

                        if ($hasId) {
                            $keyMap[$qId] = $ans;
                        }
                    }

                    $hasKeyMap = !empty($keyMap);

                    if ($hasKeyMap) {
                        return $keyMap;
                    }
                }
            }
        } catch (Throwable) {
            // Non-blocking fallback to seeded
        }

        // 2. Fallback to default seeded answer key
        return self::$seededAnswerKeys[$roleKey] ?? self::$seededAnswerKeys['frontend-developer'];
    }

    /**
     * Evaluates submitted answers against the authoritative answer key.
     * Computes verified percentage score on the server.
     *
     * @param string $roleKey Target job role key
     * @param array<string, string> $submittedAnswers Map of question_id => selected_option
     * @return array{score: float, correct_count: int, total_questions: int}
     */
    public static function evaluate(string $roleKey, array $submittedAnswers): array
    {
        $answerKey = self::getAnswerKey($roleKey);
        $totalQuestions = count($answerKey);
        $hasQuestions = ($totalQuestions > 0);

        if (!$hasQuestions) {
            return [
                'score'           => 0.0,
                'correct_count'   => 0,
                'total_questions' => 0,
            ];
        }

        $correctCount = 0;

        foreach ($answerKey as $qId => $expectedAnswer) {
            $candidateAnswer = trim((string) ($submittedAnswers[$qId] ?? ''));
            $isCorrect = (strlen($candidateAnswer) > 0 && $candidateAnswer === $expectedAnswer);

            if ($isCorrect) {
                $correctCount++;
            }
        }

        $score = round(($correctCount / $totalQuestions) * 100, 1);

        return [
            'score'           => $score,
            'correct_count'   => $correctCount,
            'total_questions' => $totalQuestions,
        ];
    }

    /**
     * Sanitizes question array for candidate delivery by removing correctAnswer and explanation,
     * while preserving rich polymorphic question metadata (media, type, playback rules).
     */
    public static function sanitizeQuestions(array $questions): array
    {
        $sanitized = [];

        foreach ($questions as $q) {
            $sanitized[] = [
                'id'            => $q['id'] ?? '',
                'question'      => $q['question'] ?? '',
                'type'          => $q['type'] ?? 'mcq',
                'options'       => $q['options'] ?? [],
                'mediaType'     => $q['mediaType'] ?? null,
                'mediaUrl'      => $q['mediaUrl'] ?? null,
                'isOneTimePlay' => (bool) ($q['isOneTimePlay'] ?? false),
                'placeholder'   => $q['placeholder'] ?? '',
                'maxWordCount'  => isset($q['maxWordCount']) ? (int) $q['maxWordCount'] : null,
            ];
        }

        return $sanitized;
    }
}

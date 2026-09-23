<?php

declare(strict_types=1);

namespace App\Services\Forms;

use App\Models\Forms\Draft;

/**
 * DraftService manages candidate draft persistence and email magic-link resumption.
 */
class DraftService
{
    /** @var array<string, Draft> In-memory fallback draft storage */
    private static array $draftStore = [];

    /**
     * Generates a unique 32-character hexadecimal resume token.
     */
    public function generateToken(): string
    {
        return bin2hex(random_bytes(16));
    }

    /**
     * Creates and stores a draft for candidate resumption.
     *
     * @param array<string, mixed> $payload
     */
    public function saveDraft(int $formId, string $email, int $currentStep, array $payload): Draft
    {
        $token = $this->generateToken();
        $expiresAt = date('Y-m-d H:i:s', time() + (30 * 86400)); // 30 days retention

        $draft = new Draft([
            'FormId' => $formId,
            'ApplicantEmail' => $email,
            'ResumeToken' => $token,
            'CurrentStep' => $currentStep,
            'PayloadJson' => $payload,
            'ExpiresAt' => $expiresAt,
            'CreatedAt' => date('Y-m-d H:i:s'),
        ]);

        self::$draftStore[$token] = $draft;

        return $draft;
    }

    /**
     * Retrieves a draft by resume token, verifying expiration.
     */
    public function resumeDraft(string $token): ?Draft
    {
        $hasToken = array_key_exists($token, self::$draftStore);

        if (!$hasToken) {
            return null;
        }

        $draft = self::$draftStore[$token];
        $isExpired = $draft->isExpired();

        if ($isExpired) {
            return null;
        }

        return $draft;
    }
}

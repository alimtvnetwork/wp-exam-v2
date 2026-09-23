<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * Draft Model for saving and resuming multi-step form state via email magic link.
 */
class Draft extends Model
{
    protected string $primaryKey = 'DraftId';

    public function getResumeToken(): string
    {
        return (string) ($this->getAttribute('ResumeToken') ?? '');
    }

    public function getApplicantEmail(): string
    {
        return (string) ($this->getAttribute('ApplicantEmail') ?? '');
    }

    public function getCurrentStep(): int
    {
        return (int) ($this->getAttribute('CurrentStep') ?? 1);
    }

    /**
     * @return array<string, mixed>
     */
    public function getPayload(): array
    {
        $raw = $this->getAttribute('PayloadJson');

        if (is_array($raw)) {
            return $raw;
        }

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    public function isExpired(): bool
    {
        $expiresAt = $this->getAttribute('ExpiresAt');

        if (!$expiresAt) {
            return false;
        }

        return strtotime((string) $expiresAt) < time();
    }
}

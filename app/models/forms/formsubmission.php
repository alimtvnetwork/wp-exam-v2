<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * FormSubmission Model representing completed candidate applications.
 */
class FormSubmission extends Model
{
    protected string $primaryKey = 'FormSubmissionId';

    public function getApplicantEmail(): string
    {
        return (string) ($this->getAttribute('ApplicantEmail') ?? '');
    }

    public function getApplicantName(): string
    {
        return (string) ($this->getAttribute('ApplicantName') ?? '');
    }

    public function getCurrentStage(): string
    {
        return (string) ($this->getAttribute('CurrentStage') ?? 'submitted');
    }

    public function isCompleted(): bool
    {
        $flag = (int) ($this->getAttribute('IsCompleted') ?? 0);

        return $flag === 1;
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
}

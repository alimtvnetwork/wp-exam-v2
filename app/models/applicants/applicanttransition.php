<?php

declare(strict_types=1);

namespace App\Models\Applicants;

use App\Models\Model;

/**
 * Eloquent-compatible Applicant Transition Audit Log Model.
 */
class ApplicantTransition extends Model
{
    protected string $primaryKey = 'id';

    public function getId(): int
    {
        return (int) ($this->getAttribute('id') ?? 0);
    }

    public function getApplicantId(): int
    {
        return (int) ($this->getAttribute('applicant_id') ?? 0);
    }

    public function getFromStageKey(): ?string
    {
        $val = $this->getAttribute('from_stage_key');

        if ($val === null) {
            return null;
        }

        return (string) $val;
    }

    public function getToStageKey(): string
    {
        return (string) ($this->getAttribute('to_stage_key') ?? '');
    }

    public function getMovedByUserId(): int
    {
        return (int) ($this->getAttribute('moved_by_user_id') ?? 0);
    }

    public function getNotes(): string
    {
        return (string) ($this->getAttribute('notes') ?? '');
    }

    public function getCreatedAt(): string
    {
        return (string) ($this->getAttribute('created_at') ?? '');
    }
}

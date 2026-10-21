<?php

declare(strict_types=1);

namespace App\Models\Applicants;

use App\Models\Model;

/**
 * Eloquent-compatible Applicant Model.
 */
class Applicant extends Model
{
    protected string $primaryKey = 'id';

    public function getId(): int
    {
        return (int) ($this->getAttribute('id') ?? 0);
    }

    public function getCandidateName(): string
    {
        return (string) ($this->getAttribute('candidate_name') ?? '');
    }

    public function getCandidateEmail(): string
    {
        return (string) ($this->getAttribute('candidate_email') ?? '');
    }

    public function getPhone(): string
    {
        return (string) ($this->getAttribute('phone') ?? '');
    }

    public function getCurrentStageKey(): string
    {
        return (string) ($this->getAttribute('current_stage_key') ?? 'applied');
    }

    public function getFormId(): int
    {
        return (int) ($this->getAttribute('form_id') ?? 0);
    }

    public function getRating(): ?int
    {
        $val = $this->getAttribute('rating');

        if ($val === null) {
            return null;
        }

        return (int) $val;
    }

    public function getNotes(): string
    {
        return (string) ($this->getAttribute('notes') ?? '');
    }

    public function getCreatedAt(): string
    {
        return (string) ($this->getAttribute('created_at') ?? '');
    }

    public function getUpdatedAt(): string
    {
        return (string) ($this->getAttribute('updated_at') ?? '');
    }
}

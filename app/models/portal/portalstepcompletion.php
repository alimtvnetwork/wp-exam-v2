<?php

declare(strict_types=1);

namespace App\Models\Portal;

use App\Models\Model;

/**
 * Eloquent-compatible Candidate Portal Step Completion Model.
 */
class PortalStepCompletion extends Model
{
    protected string $primaryKey = 'id';

    public function getId(): int
    {
        return (int) ($this->getAttribute('id') ?? 0);
    }

    public function getCandidateToken(): string
    {
        return (string) ($this->getAttribute('candidate_token') ?? '');
    }

    public function getStepId(): string
    {
        return (string) ($this->getAttribute('step_id') ?? '');
    }

    public function getCompletedBy(): string
    {
        return (string) ($this->getAttribute('completed_by') ?? '');
    }

    public function getNotes(): string
    {
        return (string) ($this->getAttribute('notes') ?? '');
    }

    public function getCompletedAt(): string
    {
        return (string) ($this->getAttribute('completed_at') ?? '');
    }
}

<?php

declare(strict_types=1);

namespace App\Models\Applicants;

use App\Models\Model;

/**
 * Eloquent-compatible Applicant Stage Model.
 */
class ApplicantStage extends Model
{
    protected string $primaryKey = 'id';

    public function getId(): int
    {
        return (int) ($this->getAttribute('id') ?? 0);
    }

    public function getStageKey(): string
    {
        return (string) ($this->getAttribute('stage_key') ?? '');
    }

    public function getTitle(): string
    {
        return (string) ($this->getAttribute('title') ?? '');
    }

    public function getColor(): string
    {
        return (string) ($this->getAttribute('color') ?? '#64748b');
    }

    public function getDisplayOrder(): int
    {
        return (int) ($this->getAttribute('display_order') ?? 0);
    }

    public function isSystemStage(): bool
    {
        $val = (int) ($this->getAttribute('is_system_stage') ?? 0);

        return $val === 1;
    }
}

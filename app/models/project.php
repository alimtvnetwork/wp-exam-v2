<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Project Model in root.db managing isolated project partitions.
 */
class Project extends Model
{
    protected string $primaryKey = 'ProjectId';

    public function getProjectId(): int
    {
        return (int) ($this->getAttribute('ProjectId') ?? 0);
    }

    public function getSlug(): string
    {
        return (string) ($this->getAttribute('Slug') ?? '');
    }

    public function getTitle(): string
    {
        return (string) ($this->getAttribute('Title') ?? '');
    }

    public function getDatabasePath(): string
    {
        $custom = $this->getAttribute('DatabasePath');

        if ($custom) {
            return (string) $custom;
        }

        return "database/projects/project_{$this->getProjectId()}.db";
    }

    public function isActive(): bool
    {
        $flag = (int) ($this->getAttribute('IsActive') ?? 1);

        return $flag === 1;
    }
}

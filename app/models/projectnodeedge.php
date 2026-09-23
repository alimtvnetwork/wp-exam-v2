<?php

declare(strict_types=1);

namespace App\Models;

/**
 * ProjectNodeEdge Model representing directed canvas edges between project nodes.
 */
class ProjectNodeEdge extends Model
{
    protected string $primaryKey = 'ProjectNodeEdgeId';

    public function getSourceProjectId(): int
    {
        return (int) ($this->getAttribute('SourceProjectId') ?? 0);
    }

    public function getTargetProjectId(): int
    {
        return (int) ($this->getAttribute('TargetProjectId') ?? 0);
    }

    public function getEdgeType(): string
    {
        return (string) ($this->getAttribute('EdgeType') ?? 'prerequisite');
    }

    public function isActive(): bool
    {
        $flag = (int) ($this->getAttribute('IsActive') ?? 1);

        return $flag === 1;
    }
}

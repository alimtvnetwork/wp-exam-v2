<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * FormField Model representing an atomic input, slider, or rich assessment question.
 */
class FormField extends Model
{
    protected string $primaryKey = 'FormFieldId';

    /** @var array<int, FieldCondition> */
    protected array $conditions = [];

    public function getFieldKey(): string
    {
        return (string) ($this->getAttribute('FieldKey') ?? '');
    }

    public function getFieldType(): string
    {
        return (string) ($this->getAttribute('FieldType') ?? 'text');
    }

    public function getLabel(): string
    {
        return (string) ($this->getAttribute('Label') ?? '');
    }

    public function isRequired(): bool
    {
        $flag = (int) ($this->getAttribute('IsRequired') ?? 0);

        return $flag === 1;
    }

    public function hasRealtimeValidation(): bool
    {
        $flag = (int) ($this->getAttribute('HasRealtimeValidation') ?? 1);

        return $flag === 1;
    }

    public function addCondition(FieldCondition $condition): self
    {
        $this->conditions[] = $condition;

        return $this;
    }

    /**
     * @return array<int, FieldCondition>
     */
    public function getConditions(): array
    {
        return $this->conditions;
    }
}

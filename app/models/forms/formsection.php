<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * FormSection Model representing a sequential wizard step.
 */
class FormSection extends Model
{
    protected string $primaryKey = 'FormSectionId';

    /** @var array<int, FormField> */
    protected array $fields = [];

    public function getStepOrder(): int
    {
        return (int) ($this->getAttribute('StepOrder') ?? 1);
    }

    public function getTitle(): string
    {
        return (string) ($this->getAttribute('Title') ?? '');
    }

    public function isVisible(): bool
    {
        $flag = (int) ($this->getAttribute('IsVisible') ?? 1);

        return $flag === 1;
    }

    public function addField(FormField $field): self
    {
        $this->fields[] = $field;

        return $this;
    }

    /**
     * @return array<int, FormField>
     */
    public function getFields(): array
    {
        return $this->fields;
    }
}

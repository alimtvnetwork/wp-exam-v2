<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * FormOption Model representing discrete choice options for dropdowns, radios, and checkboxes.
 */
class FormOption extends Model
{
    protected string $primaryKey = 'FormOptionId';

    public function getFormFieldId(): int
    {
        return (int) ($this->getAttribute('FormFieldId') ?? 0);
    }

    public function getOptionKey(): string
    {
        return (string) ($this->getAttribute('OptionKey') ?? '');
    }

    public function getOptionLabel(): string
    {
        return (string) ($this->getAttribute('OptionLabel') ?? '');
    }

    public function getDisplayOrder(): int
    {
        return (int) ($this->getAttribute('DisplayOrder') ?? 0);
    }

    public function isCorrect(): bool
    {
        $flag = (int) ($this->getAttribute('IsCorrect') ?? 0);

        return $flag === 1;
    }

    public function getBranchTargetSectionId(): ?int
    {
        $target = $this->getAttribute('BranchTargetSectionId');

        $hasTarget = ($target !== null && $target !== '');

        if ($hasTarget) {
            return (int) $target;
        }

        return null;
    }
}

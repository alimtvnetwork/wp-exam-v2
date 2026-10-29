<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * FormSubmissionValue Model representing normalized atomic response values per field.
 */
class FormSubmissionValue extends Model
{
    protected string $primaryKey = 'FormSubmissionValueId';

    public function getFormSubmissionId(): int
    {
        return (int) ($this->getAttribute('FormSubmissionId') ?? 0);
    }

    public function getFormFieldId(): int
    {
        return (int) ($this->getAttribute('FormFieldId') ?? 0);
    }

    public function getStringValue(): ?string
    {
        $val = $this->getAttribute('StringValue');

        $hasVal = ($val !== null);

        if ($hasVal) {
            return (string) $val;
        }

        return null;
    }

    public function getNumericValue(): ?float
    {
        $val = $this->getAttribute('NumericValue');

        $hasVal = ($val !== null && is_numeric($val));

        if ($hasVal) {
            return (float) $val;
        }

        return null;
    }

    public function isTrue(): bool
    {
        $flag = (int) ($this->getAttribute('BooleanValue') ?? 0);

        return $flag === 1;
    }

    public function getJsonValue(): ?string
    {
        $val = $this->getAttribute('JsonValue');

        $hasVal = ($val !== null);

        if ($hasVal) {
            return (string) $val;
        }

        return null;
    }
}

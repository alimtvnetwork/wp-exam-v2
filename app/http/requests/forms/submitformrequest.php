<?php

declare(strict_types=1);

namespace App\Http\Requests\Forms;

use App\Models\Forms\Form;
use App\Services\Forms\ConditionalEngine;

/**
 * SubmitFormRequest handling dynamic conditional rule resolution.
 */
class SubmitFormRequest
{
    protected Form $form;

    /** @var array<string, mixed> */
    protected array $data = [];

    protected ConditionalEngine $conditionalEngine;

    public function __construct(Form $form, array $data, ?ConditionalEngine $engine = null)
    {
        $this->form = $form;
        $this->data = $data;
        $this->conditionalEngine = $engine ?? new ConditionalEngine();
    }

    /**
     * Resolves dynamic validation rules based on submitted state.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        $activeFields = $this->conditionalEngine->resolveActiveFields($this->form, $this->data);
        $rules = [];

        foreach ($activeFields as $field) {
            $fieldKey = $field->getFieldKey();
            $fieldRules = [];

            $isRequired = $this->conditionalEngine->isRequired($field, $this->data);

            if ($isRequired) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            $type = $field->getFieldType();

            if ($type === 'email') {
                $fieldRules[] = 'email';
            }

            if ($type === 'url') {
                $fieldRules[] = 'url';
            }

            $rules[$fieldKey] = $fieldRules;
        }

        return $rules;
    }

    /**
     * Executes validation and returns validation error bag.
     *
     * @return array<string, string>
     */
    public function validate(): array
    {
        $rules = $this->rules();
        $errors = [];

        foreach ($rules as $fieldKey => $fieldRules) {
            $value = $this->data[$fieldKey] ?? null;
            $isEmpty = ($value === null || $value === '');

            $isRequired = in_array('required', $fieldRules, true);

            if ($isRequired) {
                if ($isEmpty) {
                    $errors[$fieldKey] = "The {$fieldKey} field is required.";
                    continue;
                }
            }

            if (!$isEmpty) {
                if (in_array('email', $fieldRules, true)) {
                    $isValidEmail = filter_var((string) $value, FILTER_VALIDATE_EMAIL) !== false;

                    if (!$isValidEmail) {
                        $errors[$fieldKey] = "The {$fieldKey} must be a valid email address.";
                    }
                }

                if (in_array('url', $fieldRules, true)) {
                    $isValidUrl = filter_var((string) $value, FILTER_VALIDATE_URL) !== false;

                    if (!$isValidUrl) {
                        $errors[$fieldKey] = "The {$fieldKey} must be a valid URL.";
                    }
                }
            }
        }

        return $errors;
    }

    public function isValid(): bool
    {
        $errors = $this->validate();

        return empty($errors);
    }
}

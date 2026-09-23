<?php

declare(strict_types=1);

namespace App\Services\Forms;

use App\Models\Forms\Form;
use App\Models\Forms\FormField;
use App\Models\Forms\FormSection;

/**
 * Dynamic Conditional Validation Engine.
 * Resolves reactive field visibility and dynamic requiredness based on submitted payload state.
 */
class ConditionalEngine
{
    /**
     * Resolves all active/visible fields for a given form and payload context.
     *
     * @param array<string, mixed> $payload
     * @return array<int, FormField>
     */
    public function resolveActiveFields(Form $form, array $payload): array
    {
        $activeFields = [];

        foreach ($form->getSections() as $section) {
            $isSectionVisible = $this->isSectionVisible($section, $payload);

            if (!$isSectionVisible) {
                continue;
            }

            foreach ($section->getFields() as $field) {
                $isFieldVisible = $this->isFieldVisible($field, $payload);

                if ($isFieldVisible) {
                    $activeFields[] = $field;
                }
            }
        }

        return $activeFields;
    }

    /**
     * Determines whether a section is visible under current payload state.
     *
     * @param array<string, mixed> $payload
     */
    public function isSectionVisible(FormSection $section, array $payload): bool
    {
        return $section->isVisible();
    }

    /**
     * Determines whether a field is visible under current payload state.
     *
     * @param array<string, mixed> $payload
     */
    public function isFieldVisible(FormField $field, array $payload): bool
    {
        $conditions = $field->getConditions();

        if (empty($conditions)) {
            return true;
        }

        $isVisible = true;

        foreach ($conditions as $condition) {
            $isMet = $condition->evaluate($payload);
            $action = $condition->getAction();

            if ($action === 'show') {
                $isVisible = $isMet;
            }

            if ($action === 'hide') {
                if ($isMet) {
                    $isVisible = false;
                }
            }
        }

        return $isVisible;
    }

    /**
     * Computes authoritative requiredness for a field.
     * Hidden fields are NEVER required. Active fields evaluate dynamic requirements.
     *
     * @param array<string, mixed> $payload
     */
    public function isRequired(FormField $field, array $payload): bool
    {
        $isVisible = $this->isFieldVisible($field, $payload);

        if (!$isVisible) {
            return false;
        }

        $isRequired = $field->isRequired();

        foreach ($field->getConditions() as $condition) {
            $isMet = $condition->evaluate($payload);
            $action = $condition->getAction();

            if ($isMet) {
                if ($action === 'require') {
                    $isRequired = true;
                }

                if ($action === 'optional') {
                    $isRequired = false;
                }
            }
        }

        return $isRequired;
    }

    /**
     * In-place debounced validation for a single field.
     *
     * @param array<string, mixed> $formContext
     * @return array{is_valid: bool, feedback_message: string}
     */
    public function validateField(FormField $field, mixed $value, array $formContext): array
    {
        $isRequired = $this->isRequired($field, $formContext);
        $isEmpty = ($value === null || $value === '' || (is_array($value) && empty($value)));

        if ($isRequired) {
            if ($isEmpty) {
                return [
                    'is_valid' => false,
                    'feedback_message' => "{$field->getLabel()} is required.",
                ];
            }
        }

        if ($isEmpty) {
            return [
                'is_valid' => true,
                'feedback_message' => '',
            ];
        }

        $type = $field->getFieldType();

        if ($type === 'email') {
            $isValidEmail = filter_var((string) $value, FILTER_VALIDATE_EMAIL) !== false;

            if (!$isValidEmail) {
                return [
                    'is_valid' => false,
                    'feedback_message' => 'Please provide a valid email address.',
                ];
            }
        }

        if ($type === 'url') {
            $isValidUrl = filter_var((string) $value, FILTER_VALIDATE_URL) !== false;

            if (!$isValidUrl) {
                return [
                    'is_valid' => false,
                    'feedback_message' => 'Please provide a valid web URL.',
                ];
            }
        }

        return [
            'is_valid' => true,
            'feedback_message' => 'Field is valid.',
        ];
    }
}

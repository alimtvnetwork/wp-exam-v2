<?php

declare(strict_types=1);

namespace App\Services\Forms;

use App\Models\Forms\Form;
use App\Models\Forms\FormSection;
use App\Models\Forms\FormField;
use App\Models\Forms\FieldCondition;
use InvalidArgumentException;

/**
 * FormJsonService manages bidirectional lossless serialization between Form models and portable JSON manifests.
 */
class FormJsonService
{
    /**
     * Exports a Form entity tree to a portable JSON string.
     */
    public function exportToJson(Form $form): string
    {
        $sectionsData = [];

        foreach ($form->getSections() as $section) {
            $fieldsData = [];

            foreach ($section->getFields() as $field) {
                $conditionsData = [];

                foreach ($field->getConditions() as $condition) {
                    $conditionsData[] = [
                        'parent_field_key' => $condition->getParentFieldKey(),
                        'operator' => $condition->getOperator(),
                        'expected_value' => $condition->getExpectedValue(),
                        'target_type' => $condition->getTargetType(),
                        'action' => $condition->getAction(),
                    ];
                }

                $fieldsData[] = [
                    'field_key' => $field->getFieldKey(),
                    'field_type' => $field->getFieldType(),
                    'label' => $field->getLabel(),
                    'placeholder' => $field->getAttribute('Placeholder'),
                    'default_value' => $field->getAttribute('DefaultValue'),
                    'is_required' => $field->isRequired(),
                    'has_realtime_validation' => $field->hasRealtimeValidation(),
                    'conditions' => $conditionsData,
                ];
            }

            $sectionsData[] = [
                'step_order' => $section->getStepOrder(),
                'title' => $section->getTitle(),
                'subtitle' => $section->getAttribute('Subtitle'),
                'is_visible' => $section->isVisible(),
                'fields' => $fieldsData,
            ];
        }

        $manifest = [
            'version' => '1.0.0',
            'form' => [
                'slug' => $form->getSlug(),
                'title' => $form->getTitle(),
                'description' => $form->getAttribute('Description'),
                'theme_id' => $form->getThemeId(),
                'is_active' => $form->isActive(),
                'has_draft_mode' => $form->hasDraftMode(),
                'has_captcha' => $form->hasCaptcha(),
                'sections' => $sectionsData,
            ],
        ];

        return (string) json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Imports a portable JSON manifest and reconstructs the Form model tree.
     */
    public function importFromJson(string $json): Form
    {
        $decoded = json_decode($json, true);

        if (!is_array($decoded)) {
            throw new InvalidArgumentException('Malformed JSON: unable to parse form manifest.');
        }

        $formData = $decoded['form'] ?? null;

        if (!is_array($formData)) {
            throw new InvalidArgumentException("Missing required root 'form' object in manifest.");
        }

        $form = new Form([
            'Slug' => $formData['slug'] ?? 'imported-form',
            'Title' => $formData['title'] ?? 'Imported Form',
            'Description' => $formData['description'] ?? null,
            'ThemeId' => $formData['theme_id'] ?? 'riseup-asia',
            'IsActive' => ($formData['is_active'] ?? true) ? 1 : 0,
            'HasDraftMode' => ($formData['has_draft_mode'] ?? true) ? 1 : 0,
            'HasCaptcha' => ($formData['has_captcha'] ?? true) ? 1 : 0,
        ]);

        $sectionsData = $formData['sections'] ?? [];

        foreach ($sectionsData as $sData) {
            $section = new FormSection([
                'StepOrder' => $sData['step_order'] ?? 1,
                'Title' => $sData['title'] ?? '',
                'Subtitle' => $sData['subtitle'] ?? null,
                'IsVisible' => ($sData['is_visible'] ?? true) ? 1 : 0,
            ]);

            $fieldsData = $sData['fields'] ?? [];

            foreach ($fieldsData as $fData) {
                $field = new FormField([
                    'FieldKey' => $fData['field_key'] ?? '',
                    'FieldType' => $fData['field_type'] ?? 'text',
                    'Label' => $fData['label'] ?? '',
                    'Placeholder' => $fData['placeholder'] ?? null,
                    'DefaultValue' => $fData['default_value'] ?? null,
                    'IsRequired' => ($fData['is_required'] ?? false) ? 1 : 0,
                    'HasRealtimeValidation' => ($fData['has_realtime_validation'] ?? true) ? 1 : 0,
                ]);

                $conditionsData = $fData['conditions'] ?? [];

                foreach ($conditionsData as $cData) {
                    $condition = new FieldCondition([
                        'ParentFieldKey' => $cData['parent_field_key'] ?? '',
                        'Operator' => $cData['operator'] ?? 'equals',
                        'ExpectedValue' => $cData['expected_value'] ?? '',
                        'TargetType' => $cData['target_type'] ?? 'field',
                        'Action' => $cData['action'] ?? 'show',
                        'IsActive' => 1,
                    ]);
                    $field->addCondition($condition);
                }

                $section->addField($field);
            }

            $form->addSection($section);
        }

        return $form;
    }
}

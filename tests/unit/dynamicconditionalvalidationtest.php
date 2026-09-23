<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Forms\Form;
use App\Models\Forms\FormSection;
use App\Models\Forms\FormField;
use App\Models\Forms\FieldCondition;
use App\Services\Forms\ConditionalEngine;
use App\Http\Requests\Forms\SubmitFormRequest;

class DynamicConditionalValidationTest extends TestCase
{
    private function buildTestForm(): Form
    {
        $form = new Form([
            'FormId' => 1,
            'Slug' => 'test-careers-form',
            'Title' => 'Test Careers Form',
            'IsActive' => 1,
        ]);

        $section = new FormSection([
            'FormSectionId' => 1,
            'StepOrder' => 1,
            'Title' => 'Basic Info',
            'IsVisible' => 1,
        ]);

        $fieldOpenToWork = new FormField([
            'FormFieldId' => 1,
            'FieldKey' => 'is_open_to_work',
            'FieldType' => 'radio',
            'Label' => 'Open to Work',
            'IsRequired' => 1,
        ]);

        $fieldExp = new FormField([
            'FormFieldId' => 2,
            'FieldKey' => 'years_of_experience',
            'FieldType' => 'number',
            'Label' => 'Years of Experience',
            'IsRequired' => 0,
        ]);

        $condExp = new FieldCondition([
            'FieldConditionId' => 1,
            'ParentFieldKey' => 'is_open_to_work',
            'Operator' => 'equals',
            'ExpectedValue' => 'yes',
            'TargetType' => 'field',
            'TargetKey' => 'years_of_experience',
            'Action' => 'show',
            'IsActive' => 1,
        ]);
        $condReq = new FieldCondition([
            'FieldConditionId' => 2,
            'ParentFieldKey' => 'is_open_to_work',
            'Operator' => 'equals',
            'ExpectedValue' => 'yes',
            'TargetType' => 'field',
            'TargetKey' => 'years_of_experience',
            'Action' => 'require',
            'IsActive' => 1,
        ]);
        $fieldExp->addCondition($condExp);
        $fieldExp->addCondition($condReq);

        $fieldEmail = new FormField([
            'FormFieldId' => 3,
            'FieldKey' => 'applicant_email',
            'FieldType' => 'email',
            'Label' => 'Email Address',
            'IsRequired' => 1,
        ]);

        $section->addField($fieldOpenToWork);
        $section->addField($fieldExp);
        $section->addField($fieldEmail);
        $form->addSection($section);

        return $form;
    }

    public function testHiddenConditionalFieldBypassesRequiredRule(): void
    {
        $form = $this->buildTestForm();
        $payload = [
            'is_open_to_work' => 'no',
            'applicant_email' => 'candidate@example.com',
            // years_of_experience is omitted and hidden
        ];

        $request = new SubmitFormRequest($form, $payload);
        $isValid = $request->isValid();

        $this->assertTrue($isValid);
        $errors = $request->validate();
        $this->assertEmpty($errors);
    }

    public function testVisibleConditionalFieldEnforcesRequiredRule(): void
    {
        $form = $this->buildTestForm();
        $payload = [
            'is_open_to_work' => 'yes',
            'applicant_email' => 'candidate@example.com',
            // years_of_experience is required but missing!
        ];

        $request = new SubmitFormRequest($form, $payload);
        $isValid = $request->isValid();

        $this->assertFalse($isValid);
        $errors = $request->validate();
        $this->assertArrayHasKey('years_of_experience', $errors);
    }

    public function testValidPayloadWithShownFieldPasses(): void
    {
        $form = $this->buildTestForm();
        $payload = [
            'is_open_to_work' => 'yes',
            'years_of_experience' => '3',
            'applicant_email' => 'candidate@example.com',
        ];

        $request = new SubmitFormRequest($form, $payload);
        $isValid = $request->isValid();

        $this->assertTrue($isValid);
        $errors = $request->validate();
        $this->assertEmpty($errors);
    }

    public function testInvalidEmailTriggersValidationError(): void
    {
        $form = $this->buildTestForm();
        $payload = [
            'is_open_to_work' => 'no',
            'applicant_email' => 'not-a-valid-email',
        ];

        $request = new SubmitFormRequest($form, $payload);
        $isValid = $request->isValid();

        $this->assertFalse($isValid);
        $errors = $request->validate();
        $this->assertArrayHasKey('applicant_email', $errors);
    }
}

<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Forms\Form;
use App\Models\Forms\FormSection;
use App\Models\Forms\FormField;
use App\Models\Forms\FieldCondition;
use App\Services\Forms\FormJsonService;
use InvalidArgumentException;

class FormJsonImportExportTest extends TestCase
{
    private function createSampleForm(): Form
    {
        $form = new Form([
            'Slug' => 'intern-programmer',
            'Title' => 'Intern Programmer Application',
            'Description' => 'Engineering recruitment form',
            'ThemeId' => 'riseup-asia',
            'IsActive' => 1,
            'HasDraftMode' => 1,
            'HasCaptcha' => 1,
        ]);

        $section = new FormSection([
            'StepOrder' => 1,
            'Title' => 'Personal Information',
            'IsVisible' => 1,
        ]);

        $fieldOpen = new FormField([
            'FieldKey' => 'is_open_to_work',
            'FieldType' => 'radio',
            'Label' => 'Open to Work',
            'IsRequired' => 1,
        ]);

        $fieldExp = new FormField([
            'FieldKey' => 'years_of_experience',
            'FieldType' => 'number',
            'Label' => 'Years of Experience',
            'IsRequired' => 0,
        ]);

        $cond = new FieldCondition([
            'ParentFieldKey' => 'is_open_to_work',
            'Operator' => 'equals',
            'ExpectedValue' => 'yes',
            'TargetType' => 'field',
            'Action' => 'show',
            'IsActive' => 1,
        ]);
        $fieldExp->addCondition($cond);

        $section->addField($fieldOpen);
        $section->addField($fieldExp);
        $form->addSection($section);

        return $form;
    }

    public function testExportToJsonGeneratesValidJsonStructure(): void
    {
        $form = $this->createSampleForm();
        $service = new FormJsonService();

        $json = $service->exportToJson($form);
        $this->assertNotEmpty($json);

        $decoded = json_decode($json, true);
        $this->assertNotNull($decoded);
        $this->assertArrayHasKey('form', $decoded);
        $this->assertEquals('intern-programmer', $decoded['form']['slug']);
        $this->assertEquals('Intern Programmer Application', $decoded['form']['title']);
        $this->assertCount(1, $decoded['form']['sections']);
        $this->assertCount(2, $decoded['form']['sections'][0]['fields']);
    }

    public function testImportFromJsonReconstructsExactFormTree(): void
    {
        $form = $this->createSampleForm();
        $service = new FormJsonService();

        $json = $service->exportToJson($form);
        $imported = $service->importFromJson($json);

        $this->assertEquals($form->getSlug(), $imported->getSlug());
        $this->assertEquals($form->getTitle(), $imported->getTitle());
        $this->assertTrue($imported->isActive());
        $this->assertTrue($imported->hasDraftMode());

        $sections = $imported->getSections();
        $this->assertCount(1, $sections);

        $fields = $sections[0]->getFields();
        $this->assertCount(2, $fields);

        $this->assertEquals('is_open_to_work', $fields[0]->getFieldKey());
        $this->assertTrue($fields[0]->isRequired());

        $this->assertEquals('years_of_experience', $fields[1]->getFieldKey());
        $this->assertFalse($fields[1]->isRequired());

        $conditions = $fields[1]->getConditions();
        $this->assertCount(1, $conditions);
        $this->assertEquals('is_open_to_work', $conditions[0]->getParentFieldKey());
        $this->assertEquals('yes', $conditions[0]->getExpectedValue());
    }

    public function testMalformedJsonThrowsException(): void
    {
        $service = new FormJsonService();

        $caught = false;
        try {
            $service->importFromJson('{"invalid_json: true}');
        } catch (InvalidArgumentException $e) {
            $caught = true;
        }

        $this->assertTrue($caught);
    }
}

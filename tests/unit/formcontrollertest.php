<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Http\Controllers\Forms\FormController;
use App\Models\Forms\Form;
use App\Models\Forms\FormSection;
use App\Models\Forms\FormField;
use App\Models\Forms\FieldCondition;

class FormControllerTest extends TestCase
{
    private function createSampleForm(): Form
    {
        $form = new Form([
            'FormId' => 10,
            'Slug' => 'intern-programmer',
            'Title' => 'Intern Programmer Application',
            'ThemeId' => 'riseup-asia',
            'IsActive' => 1,
            'HasDraftMode' => 1,
            'HasCaptcha' => 1,
        ]);

        $section = new FormSection([
            'StepOrder' => 1,
            'Title' => 'Basic Info',
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
            'Action' => 'require',
            'IsActive' => 1,
        ]);
        $fieldExp->addCondition($cond);

        $section->addField($fieldOpen);
        $section->addField($fieldExp);
        $form->addSection($section);

        return $form;
    }

    public function testShowReturnsValidFormEnvelope(): void
    {
        $form = $this->createSampleForm();
        $controller = new FormController();

        $res = $controller->show($form);

        $this->assertTrue($res['is_success']);
        $this->assertEquals(200, $res['code']);
        $this->assertEquals('intern-programmer', $res['data']['slug']);
        $this->assertEquals('riseup-asia', $res['data']['theme_id']);
        $this->assertCount(1, $res['data']['sections']);
    }

    public function testValidateFieldReturnsDebouncedFeedback(): void
    {
        $controller = new FormController();
        $field = new FormField([
            'FieldKey' => 'applicant_email',
            'FieldType' => 'email',
            'Label' => 'Email',
            'IsRequired' => 1,
        ]);

        $resValid = $controller->validateField($field, 'applicant@example.com', []);
        $this->assertTrue($resValid['is_success']);
        $this->assertEquals(200, $resValid['code']);

        $resInvalid = $controller->validateField($field, 'invalid-email', []);
        $this->assertFalse($resInvalid['is_success']);
        $this->assertEquals(422, $resInvalid['code']);
    }

    public function testTestWhatsAppEndpoint(): void
    {
        $controller = new FormController();

        $res = $controller->testWhatsApp('+880', '1712345678');
        $this->assertTrue($res['is_success']);
        $this->assertEquals(200, $res['code']);
        $this->assertEquals('https://wa.me/+8801712345678', $res['data']['whatsapp_url']);
    }

    public function testCountriesCacheEndpoint(): void
    {
        $controller = new FormController();

        $res = $controller->countriesCache('8.8.8.8');
        $this->assertTrue($res['is_success']);
        $this->assertEquals(200, $res['code']);
        $this->assertEquals('US', $res['data']['detected_country']);
        $this->assertArrayHasKey('BD', $res['data']['countries']);
    }

    public function testDraftSaveAndResumeLifecycle(): void
    {
        $controller = new FormController();
        $payload = ['first_name' => 'Jane', 'last_name' => 'Smith'];

        $saveRes = $controller->saveDraft(10, 'jane@example.com', 2, $payload);
        $this->assertTrue($saveRes['is_success']);
        $this->assertEquals(200, $saveRes['code']);

        $token = $saveRes['data']['resume_token'];
        $this->assertNotEmpty($token);

        $resumeRes = $controller->resumeDraft($token);
        $this->assertTrue($resumeRes['is_success']);
        $this->assertEquals(200, $resumeRes['code']);
        $this->assertEquals('jane@example.com', $resumeRes['data']['applicant_email']);
        $this->assertEquals('Jane', $resumeRes['data']['payload']['first_name']);

        $missingRes = $controller->resumeDraft('invalid_token');
        $this->assertFalse($missingRes['is_success']);
        $this->assertEquals(404, $missingRes['code']);
    }

    public function testSubmitEndpointValidatesDynamically(): void
    {
        $form = $this->createSampleForm();
        $controller = new FormController();

        // Valid submission when not open to work (years_of_experience is optional)
        $validPayload = [
            'is_open_to_work' => 'no',
        ];
        $resPass = $controller->submit($form, $validPayload);
        $this->assertTrue($resPass['is_success']);
        $this->assertEquals(200, $resPass['code']);

        // Invalid submission when open to work (years_of_experience becomes required!)
        $invalidPayload = [
            'is_open_to_work' => 'yes',
        ];
        $resFail = $controller->submit($form, $invalidPayload);
        $this->assertFalse($resFail['is_success']);
        $this->assertEquals(422, $resFail['code']);
        $this->assertArrayHasKey('years_of_experience', $resFail['data']['errors']);
    }
}

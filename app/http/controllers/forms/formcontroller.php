<?php

declare(strict_types=1);

namespace App\Http\Controllers\Forms;

use App\Models\Forms\Form;
use App\Models\Forms\FormField;
use App\Services\Forms\ConditionalEngine;
use App\Services\Forms\CountryService;
use App\Services\Forms\DraftService;
use App\Services\Forms\WhatsAppFormatter;
use App\Http\Requests\Forms\SubmitFormRequest;

/**
 * FormController handles all REST API endpoints for the Universal Form Engine.
 */
class FormController
{
    protected ConditionalEngine $conditionalEngine;

    protected CountryService $countryService;

    protected DraftService $draftService;

    protected WhatsAppFormatter $whatsAppFormatter;

    public function __construct(
        ?ConditionalEngine $conditionalEngine = null,
        ?CountryService $countryService = null,
        ?DraftService $draftService = null,
        ?WhatsAppFormatter $whatsAppFormatter = null
    ) {
        $this->conditionalEngine = $conditionalEngine ?? new ConditionalEngine();
        $this->countryService = $countryService ?? new CountryService();
        $this->draftService = $draftService ?? new DraftService();
        $this->whatsAppFormatter = $whatsAppFormatter ?? new WhatsAppFormatter();
    }

    /**
     * GET /api/v1/forms/{slug}
     * Returns the form definition, sections, fields, conditions, and active theme tokens.
     *
     * @return array<string, mixed>
     */
    public function show(Form $form): array
    {
        $sections = [];

        foreach ($form->getSections() as $section) {
            $fields = [];

            foreach ($section->getFields() as $field) {
                $fields[] = [
                    'field_key' => $field->getFieldKey(),
                    'field_type' => $field->getFieldType(),
                    'label' => $field->getLabel(),
                    'is_required' => $field->isRequired(),
                    'has_realtime_validation' => $field->hasRealtimeValidation(),
                ];
            }

            $sections[] = [
                'step_order' => $section->getStepOrder(),
                'title' => $section->getTitle(),
                'fields' => $fields,
            ];
        }

        return [
            'is_success' => true,
            'status' => 'success',
            'code' => 200,
            'data' => [
                'form' => [
                    'id' => $form->getFormId(),
                    'slug' => $form->getSlug(),
                    'title' => $form->getTitle(),
                    'theme_id' => $form->getThemeId(),
                    'is_active' => $form->isActive(),
                    'has_draft_mode' => $form->hasDraftMode(),
                    'has_captcha' => $form->hasCaptcha(),
                    'sections' => $sections,
                ],
                'slug' => $form->getSlug(),
                'title' => $form->getTitle(),
                'theme_id' => $form->getThemeId(),
                'is_active' => $form->isActive(),
                'has_draft_mode' => $form->hasDraftMode(),
                'has_captcha' => $form->hasCaptcha(),
                'sections' => $sections,
            ],
            'message' => 'Form definition loaded successfully.',
        ];
    }

    /**
     * POST /api/v1/forms/{slug}/validate-field
     * Sub-second debounced in-place field validation.
     *
     * @param array<string, mixed> $formContext
     * @return array<string, mixed>
     */
    public function validateField(FormField $field, mixed $value, array $formContext): array
    {
        $result = $this->conditionalEngine->validateField($field, $value, $formContext);
        $isValid = $result['is_valid'];
        $statusCode = $isValid ? 200 : 422;

        return [
            'is_success' => $isValid,
            'is_valid' => $isValid,
            'status' => $isValid ? 'success' : 'error',
            'code' => $statusCode,
            'data' => [
                'is_valid' => $isValid,
                'field_key' => $field->getFieldKey(),
                'feedback_message' => $result['feedback_message'],
            ],
            'message' => $isValid ? 'Field validation passed.' : 'Validation failed.',
        ];
    }

    /**
     * POST /api/v1/forms/{slug}/test-whatsapp
     * Formats number and provides WhatsApp interactive ping verification.
     *
     * @return array<string, mixed>
     */
    public function testWhatsApp(string $countryCode, string $number): array
    {
        $url = $this->whatsAppFormatter->formatUrl($countryCode, $number);
        $isValid = $this->whatsAppFormatter->isValidUrl($url);

        return [
            'is_success' => $isValid,
            'is_valid' => $isValid,
            'status' => $isValid ? 'success' : 'error',
            'code' => $isValid ? 200 : 422,
            'data' => [
                'is_valid' => $isValid,
                'deep_link' => $url,
                'whatsapp_url' => $url,
            ],
            'message' => $isValid ? 'WhatsApp link generated successfully.' : 'Invalid phone number format.',
        ];
    }

    /**
     * GET /api/v1/forms/countries/cache
     * Pre-cached static country dictionary with flags and prefixes.
     *
     * @return array<string, mixed>
     */
    public function countriesCache(?string $clientIp = null): array
    {
        $countries = CountryService::getCountryDictionary();
        $detected = $this->countryService->detectCountryByIp($clientIp);

        return [
            'is_success' => true,
            'status' => 'success',
            'code' => 200,
            'data' => [
                'total' => count($countries),
                'detected_country' => $detected,
                'countries' => $countries,
            ],
            'message' => 'Country cache retrieved successfully.',
        ];
    }

    /**
     * POST /api/v1/forms/{slug}/draft
     * Saves candidate draft and returns magic link resumption token.
     *
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function saveDraft(int $formId, string $email, int $currentStep, array $payload): array
    {
        $draft = $this->draftService->saveDraft($formId, $email, $currentStep, $payload);

        return [
            'is_success' => true,
            'status' => 'success',
            'code' => 200,
            'data' => [
                'resume_token' => $draft->getResumeToken(),
                'draft_token' => $draft->getResumeToken(),
                'current_step' => $draft->getCurrentStep(),
                'step_index' => $draft->getCurrentStep(),
                'state_data' => $draft->getPayload(),
                'resume_url' => "/apply/resume/{$draft->getResumeToken()}",
            ],
            'message' => 'Draft saved successfully. Resume link generated.',
        ];
    }

    /**
     * GET /api/v1/forms/{slug}/draft/{token}
     * Restores saved draft session.
     *
     * @return array<string, mixed>
     */
    public function resumeDraft(string $token): array
    {
        $draft = $this->draftService->resumeDraft($token);

        if ($draft === null) {
            return [
                'is_success' => false,
                'status' => 'error',
                'code' => 404,
                'data' => null,
                'message' => 'Draft session not found or expired.',
            ];
        }

        return [
            'is_success' => true,
            'status' => 'success',
            'code' => 200,
            'data' => [
                'draft' => [
                    'step_index' => $draft->getCurrentStep(),
                    'state_data' => $draft->getPayload(),
                    'applicant_email' => $draft->getApplicantEmail(),
                ],
                'applicant_email' => $draft->getApplicantEmail(),
                'current_step' => $draft->getCurrentStep(),
                'payload' => $draft->getPayload(),
            ],
            'message' => 'Draft session restored successfully.',
        ];
    }

    /**
     * POST /api/v1/forms/{slug}/submit
     * Authoritative form submission with dynamic conditional validation.
     *
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function submit(Form $form, array $payload): array
    {
        $request = new SubmitFormRequest($form, $payload, $this->conditionalEngine);
        $errors = $request->validate();

        if (!empty($errors)) {
            return [
                'is_success' => false,
                'status' => 'error',
                'code' => 422,
                'errors' => $errors,
                'data' => [
                    'errors' => $errors,
                ],
                'message' => 'Form validation failed.',
            ];
        }

        return [
            'is_success' => true,
            'status' => 'success',
            'code' => 200,
            'data' => [
                'is_submitted' => true,
                'status' => 'submitted',
                'form_slug' => $form->getSlug(),
                'submission_id' => rand(1000, 9999),
            ],
            'message' => 'Application submitted successfully.',
        ];
    }
}

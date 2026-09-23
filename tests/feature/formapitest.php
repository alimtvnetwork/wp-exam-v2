<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

class FormApiTest extends TestCase
{
    public function testFormSchemaEndpointReturnsStructure(): void
    {
        $response = $this->getJson('/api/v1/forms/job-application');

        $response->assertOk()
            ->assertJson(['status' => 'success'])
            ->assertJsonStructure([
                'status',
                'data' => [
                    'form' => [
                        'id',
                        'title',
                        'slug',
                        'sections',
                    ],
                ],
            ])
            ->assertJsonPath('data.form.slug', 'job-application');
    }

    public function testDebouncedValidationReturnsValidFieldStatus(): void
    {
        $response = $this->postJson('/api/v1/forms/job-application/validate-field', [
            'field_key' => 'email',
            'value' => 'applicant@developers-organism.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'is_valid' => true,
            ]);
    }

    public function testWhatsAppTesterEndpoint(): void
    {
        $response = $this->postJson('/api/v1/forms/test-whatsapp', [
            'phone_code' => '+880',
            'phone_number' => '01712345678',
        ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'is_valid' => true,
            ])
            ->assertJsonPath('data.deep_link', 'https://wa.me/+8801712345678');
    }

    public function testCountriesCacheEndpoint(): void
    {
        $response = $this->getJson('/api/v1/forms/countries/cache');

        $response->assertOk()
            ->assertJson(['status' => 'success'])
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total',
                    'countries',
                ],
            ]);
    }

    public function testDraftSaveAndResumeLifecycle(): void
    {
        $saveResponse = $this->postJson('/api/v1/forms/job-application/draft', [
            'step_index' => 2,
            'state_data' => [
                'full_name' => 'Alice Doe',
                'applied_position' => 'Senior Lead Architect',
            ],
        ]);

        $saveResponse->assertOk()
            ->assertJson(['status' => 'success']);

        $token = $saveResponse->json('data.draft_token');
        $this->assertNotEmpty($token);

        $resumeResponse = $this->getJson("/api/v1/forms/draft/{$token}");

        $resumeResponse->assertOk()
            ->assertJson(['status' => 'success'])
            ->assertJsonPath('data.draft.step_index', 2)
            ->assertJsonPath('data.draft.state_data.full_name', 'Alice Doe');
    }

    public function testSubmissionEndpointFailsWhenRequiredConditionalShown(): void
    {
        $response = $this->postJson('/api/v1/forms/job-application/submit', [
            'full_name' => 'Bob Test',
            'email' => 'invalid-email-string',
        ]);

        $response->assertBadRequest()
            ->assertJson(['status' => 'error'])
            ->assertJsonValidationErrors('email');
    }

    public function testSubmissionEndpointPassesWithCompleteData(): void
    {
        $response = $this->postJson('/api/v1/forms/job-application/submit', [
            'full_name' => 'Charlie Winner',
            'email' => 'charlie@example.com',
            'has_experience' => true,
            'years_of_experience' => 5,
        ]);

        $response->assertOk()
            ->assertJson(['status' => 'success'])
            ->assertJsonPath('data.status', 'submitted');
    }
}

<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Forms\DraftService;

class DraftResumeTest extends TestCase
{
    public function testDraftSaveAndResumption(): void
    {
        $service = new DraftService();
        $payload = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'step_completed' => 2,
        ];

        $draft = $service->saveDraft(1, 'john.doe@example.com', 2, $payload);
        $token = $draft->getResumeToken();

        $this->assertNotEmpty($token);
        $this->assertEquals(32, strlen($token));

        $restored = $service->resumeDraft($token);
        $this->assertNotNull($restored);
        $this->assertEquals(2, $restored->getCurrentStep());
        $this->assertEquals('john.doe@example.com', $restored->getApplicantEmail());

        $restoredPayload = $restored->getPayload();
        $this->assertEquals('John', $restoredPayload['first_name']);
        $this->assertEquals('Doe', $restoredPayload['last_name']);
    }

    public function testNonExistentTokenReturnsNull(): void
    {
        $service = new DraftService();
        $missing = $service->resumeDraft('non_existent_token_12345');

        $this->assertNull($missing);
    }
}

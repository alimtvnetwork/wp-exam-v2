<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Email\MailboxManager;

class MailboxManagerTest extends TestCase
{
    public function testGetConfigReturnsValidStructuredArray(): void
    {
        $config = MailboxManager::getConfig();

        $this->assertIsArray($config);
        $this->assertTrue($config['is_success']);
        $this->assertNotEmpty($config['email']);
        $this->assertStringContainsString('@', $config['email']);
        $this->assertNotEmpty($config['domain']);
        $this->assertStringStartsWith('mail.', $config['smtp_host']);
        $this->assertEquals(465, $config['smtp_port']);
        $this->assertEquals('ssl', $config['smtp_secure']);
        $this->assertStringStartsWith('mail.', $config['imap_host']);
        $this->assertEquals(993, $config['imap_port']);
    }

    public function testVerifyConnectionHandlesUnreachableHostGracefully(): void
    {
        $result = MailboxManager::verifyConnection(
            'invalid.unreachable.domain.test',
            9999,
            'none',
            'smtp'
        );

        $this->assertIsArray($result);
        $this->assertFalse($result['is_success']);
        $this->assertTrue($result['is_fail']);
        $this->assertEquals('error', $result['status']);
        $this->assertStringContainsString('failed', strtolower($result['message']));
    }
}

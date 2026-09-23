<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Forms\WhatsAppFormatter;

class WhatsAppFormatterTest extends TestCase
{
    public function testSanitizeNumberStripsSpecialCharactersAndLeadingZero(): void
    {
        $formatter = new WhatsAppFormatter();

        $result1 = $formatter->sanitizeNumber('01712-345678');
        $this->assertEquals('1712345678', $result1);

        $result2 = $formatter->sanitizeNumber('+880 (171) 234-5678');
        $this->assertEquals('8801712345678', $result2);
    }

    public function testFormatUrlConstructsCorrectDeepLink(): void
    {
        $formatter = new WhatsAppFormatter();

        $url = $formatter->formatUrl('+880', '01712345678');
        $this->assertEquals('https://wa.me/+8801712345678', $url);

        $isValid = $formatter->isValidUrl($url);
        $this->assertTrue($isValid);
    }

    public function testIsValidUrlRejectsMalformedLink(): void
    {
        $formatter = new WhatsAppFormatter();

        $isInvalid = $formatter->isValidUrl('http://invalidsite.com');
        $this->assertFalse($isInvalid);

        $isTooShort = $formatter->isValidUrl('https://wa.me/+123');
        $this->assertFalse($isTooShort);
    }
}

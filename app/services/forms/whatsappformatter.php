<?php

declare(strict_types=1);

namespace App\Services\Forms;

/**
 * WhatsApp Phone Formatter & Link Generator.
 * Automates prefix formatting and provides interactive ping verification links.
 */
class WhatsAppFormatter
{
    /**
     * Sanitizes subscriber number by removing spaces, hyphens, and leading zeros.
     */
    public function sanitizeNumber(string $number): string
    {
        $digitsOnly = preg_replace('/[^\d]/', '', $number) ?? '';

        return ltrim($digitsOnly, '0');
    }

    /**
     * Sanitizes country calling code, ensuring leading plus sign is removed for arithmetic.
     */
    public function sanitizeCountryCode(string $countryCode): string
    {
        return preg_replace('/[^\d]/', '', $countryCode) ?? '';
    }

    /**
     * Formats full international WhatsApp URL: https://wa.me/+{countryCode}{subscriberNumber}
     */
    public function formatUrl(string $countryCode, string $number): string
    {
        $cleanCountry = $this->sanitizeCountryCode($countryCode);
        $cleanNumber = $this->sanitizeNumber($number);

        return "https://wa.me/+{$cleanCountry}{$cleanNumber}";
    }

    /**
     * Verifies if generated link meets WhatsApp deep link specifications.
     */
    public function isValidUrl(string $url): bool
    {
        $pattern = '/^https:\/\/wa\.me\/\+\d{7,15}$/';

        return (bool) preg_match($pattern, $url);
    }
}

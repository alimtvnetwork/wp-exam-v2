<?php

declare(strict_types=1);

namespace App\Services\Forms;

/**
 * Country static dictionary cache & IP-based geolocation resolution service.
 */
class CountryService
{
    /** @var array<string, array{code: string, name: string, dial: string, flag: string}>|null */
    private static ?array $staticCache = null;

    /**
     * Retrieves static country dataset with in-memory caching.
     *
     * @return array<string, array{code: string, name: string, dial: string, flag: string}>
     */
    public static function getCountryDictionary(): array
    {
        if (self::$staticCache !== null) {
            return self::$staticCache;
        }

        self::$staticCache = [
            'BD' => ['code' => 'BD', 'name' => 'Bangladesh', 'dial' => '+880', 'flag' => '🇧🇩'],
            'US' => ['code' => 'US', 'name' => 'United States', 'dial' => '+1', 'flag' => '🇺🇸'],
            'GB' => ['code' => 'GB', 'name' => 'United Kingdom', 'dial' => '+44', 'flag' => '🇬🇧'],
            'IN' => ['code' => 'IN', 'name' => 'India', 'dial' => '+91', 'flag' => '🇮🇳'],
            'PK' => ['code' => 'PK', 'name' => 'Pakistan', 'dial' => '+92', 'flag' => '🇵🇰'],
            'CA' => ['code' => 'CA', 'name' => 'Canada', 'dial' => '+1', 'flag' => '🇨🇦'],
            'AU' => ['code' => 'AU', 'name' => 'Australia', 'dial' => '+61', 'flag' => '🇦🇺'],
            'DE' => ['code' => 'DE', 'name' => 'Germany', 'dial' => '+49', 'flag' => '🇩🇪'],
            'SG' => ['code' => 'SG', 'name' => 'Singapore', 'dial' => '+65', 'flag' => '🇸🇬'],
            'MY' => ['code' => 'MY', 'name' => 'Malaysia', 'dial' => '+60', 'flag' => '🇲🇾'],
        ];

        return self::$staticCache;
    }

    /**
     * Resolves country code by client IP address.
     */
    public function detectCountryByIp(?string $ipAddress = null): string
    {
        if ($ipAddress === null || $ipAddress === '' || $ipAddress === '127.0.0.1') {
            return 'BD'; // Default developer reference country
        }

        if (str_starts_with($ipAddress, '103.')) {
            return 'BD';
        }

        if (str_starts_with($ipAddress, '8.8.') || str_starts_with($ipAddress, '1.1.')) {
            return 'US';
        }

        return 'BD';
    }

    /**
     * Finds country details by ISO code.
     *
     * @return array{code: string, name: string, dial: string, flag: string}|null
     */
    public function findByCode(string $code): ?array
    {
        $countries = self::getCountryDictionary();
        $upper = strtoupper($code);

        $hasCountry = array_key_exists($upper, $countries);

        if ($hasCountry) {
            return $countries[$upper];
        }

        return null;
    }
}

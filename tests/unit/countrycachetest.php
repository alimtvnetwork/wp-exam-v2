<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Forms\CountryService;

class CountryCacheTest extends TestCase
{
    public function testStaticDictionaryReturnsPopulatedDataset(): void
    {
        $countries = CountryService::getCountryDictionary();

        $this->assertArrayHasKey('BD', $countries);
        $this->assertArrayHasKey('US', $countries);
        $this->assertArrayHasKey('GB', $countries);

        $bd = $countries['BD'];
        $this->assertEquals('Bangladesh', $bd['name']);
        $this->assertEquals('+880', $bd['dial']);
        $this->assertEquals('🇧🇩', $bd['flag']);
    }

    public function testFindByCodeReturnsCountryDetails(): void
    {
        $service = new CountryService();

        $us = $service->findByCode('us');
        $this->assertNotNull($us);
        $this->assertEquals('United States', $us['name']);
        $this->assertEquals('+1', $us['dial']);

        $missing = $service->findByCode('ZZ');
        $this->assertNull($missing);
    }

    public function testDetectCountryByIpResolvesCorrectly(): void
    {
        $service = new CountryService();

        $countryDefault = $service->detectCountryByIp('127.0.0.1');
        $this->assertEquals('BD', $countryDefault);

        $countryUS = $service->detectCountryByIp('8.8.8.8');
        $this->assertEquals('US', $countryUS);
    }
}

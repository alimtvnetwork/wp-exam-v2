<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\TestCase as BaseTestCase;
use App\Routing\Route;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Route::loadRoutes();
    }

    public function getJson(string $uri, array $headers = []): TestResponse
    {
        return $this->callRoute('GET', $uri, [], $headers);
    }

    public function postJson(string $uri, array $data = [], array $headers = []): TestResponse
    {
        return $this->callRoute('POST', $uri, $data, $headers);
    }

    public function putJson(string $uri, array $data = [], array $headers = []): TestResponse
    {
        return $this->callRoute('PUT', $uri, $data, $headers);
    }

    public function deleteJson(string $uri, array $headers = []): TestResponse
    {
        return $this->callRoute('DELETE', $uri, [], $headers);
    }

    private function callRoute(string $method, string $uri, array $data, array $headers): TestResponse
    {
        $result = Route::dispatch($method, $uri, $data, $headers);

        return new TestResponse($result['status'], $result['body']);
    }
}

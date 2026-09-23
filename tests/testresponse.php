<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\Assert;

class TestResponse
{
    private int $status;

    private array $data;

    private string $rawBody;

    public function __construct(int $status, array $data, string $rawBody = '')
    {
        $this->status = $status;
        $this->data = $data;
        $this->rawBody = $rawBody ?: json_encode($data, JSON_UNESCAPED_SLASHES);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function json(?string $key = null): mixed
    {
        if ($key === null) {
            return $this->data;
        }

        $segments = explode('.', $key);
        $current = $this->data;

        foreach ($segments as $segment) {
            $hasKey = is_array($current) && array_key_exists($segment, $current);

            if ($hasKey) {
                $current = $current[$segment];
            } else {
                return null;
            }
        }

        return $current;
    }

    public function assertStatus(int $expectedStatus): self
    {
        Assert::assertEquals(
            $expectedStatus,
            $this->status,
            "Expected status {$expectedStatus}, but got {$this->status}. Response body: " . $this->rawBody
        );

        return $this;
    }

    public function assertOk(): self
    {
        return $this->assertStatus(200);
    }

    public function assertBadRequest(): self
    {
        $isClientError = ($this->status >= 400 && $this->status < 500);
        Assert::assertTrue(
            $isClientError,
            "Expected client error status (4xx), but got {$this->status}. Response body: " . $this->rawBody
        );

        return $this;
    }

    public function assertNotFound(): self
    {
        return $this->assertStatus(404);
    }

    public function assertUnprocessable(): self
    {
        return $this->assertStatus(422);
    }

    public function assertJson(array $expected): self
    {
        foreach ($expected as $key => $value) {
            $hasKey = array_key_exists($key, $this->data);
            Assert::assertTrue($hasKey, "Response JSON does not contain key '{$key}'");

            $isEqual = ($this->data[$key] === $value);
            Assert::assertTrue($isEqual, "Key '{$key}' does not match expected value. Expected: " . json_encode($value) . ", Got: " . json_encode($this->data[$key]));
        }

        return $this;
    }

    public function assertJsonPath(string $path, mixed $expectedValue): self
    {
        $actualValue = $this->json($path);
        $isMatch = ($actualValue === $expectedValue);

        Assert::assertTrue(
            $isMatch,
            "Failed asserting that JSON path '{$path}' value " . json_encode($actualValue) . " matches " . json_encode($expectedValue)
        );

        return $this;
    }

    public function assertJsonStructure(array $structure, ?array $currentData = null): self
    {
        $data = $currentData ?? $this->data;

        foreach ($structure as $key => $value) {
            if (is_array($value)) {
                $hasSegment = array_key_exists($key, $data);
                Assert::assertTrue($hasSegment, "Failed asserting that JSON structure contains key '{$key}'");

                $this->assertJsonStructure($value, $data[$key]);
            } else {
                $hasField = array_key_exists($value, $data);
                Assert::assertTrue($hasField, "Failed asserting that JSON structure contains key '{$value}'");
            }
        }

        return $this;
    }

    public function assertJsonValidationErrors(array|string $keys): self
    {
        $expectedKeys = is_array($keys) ? $keys : [$keys];
        $errors = $this->json('errors') ?? ($this->json('data.errors') ?? []);

        foreach ($expectedKeys as $key) {
            $hasError = array_key_exists($key, $errors);
            Assert::assertTrue($hasError, "Failed asserting that validation errors contain key '{$key}'");
        }

        return $this;
    }
}

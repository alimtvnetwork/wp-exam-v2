<?php
/**
 * Standalone TestCase fallback when PHPUnit is not installed locally.
 */

namespace PHPUnit\Framework;

if (!class_exists(TestCase::class)) {
    class TestCase {
        public function assertArrayHasKey(mixed $key, array $array, string $message = ''): void {
            if (!array_key_exists($key, $array)) {
                throw new \AssertionError($message ?: "Failed asserting that array has key '{$key}'");
            }
        }

        public function assertTrue(mixed $condition, string $message = ''): void {
            if ($condition !== true) {
                throw new \AssertionError($message ?: "Failed asserting that value is true");
            }
        }

        public function assertFalse(mixed $condition, string $message = ''): void {
            if ($condition !== false) {
                throw new \AssertionError($message ?: "Failed asserting that value is false");
            }
        }

        public function assertEquals(mixed $expected, mixed $actual, string $message = ''): void {
            if ($expected != $actual) {
                throw new \AssertionError($message ?: "Failed asserting that " . json_encode($actual) . " equals " . json_encode($expected));
            }
        }

        public function assertCount(int $expectedCount, \Countable|iterable $haystack, string $message = ''): void {
            if (count($haystack) !== $expectedCount) {
                throw new \AssertionError($message ?: "Failed asserting count matches " . $expectedCount);
            }
        }

        public function assertNotNull(mixed $actual, string $message = ''): void {
            if ($actual === null) {
                throw new \AssertionError($message ?: "Failed asserting that value is not null");
            }
        }

        public function markTestSkipped(string $message = ''): void {
            // Skipped in standalone mode
        }
    }
}

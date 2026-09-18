<?php
/**
 * DbResult - Single-item query result wrapper.
 *
 * Mirrors Riseup Asia and Go's Result[T] pattern.
 *
 * @package WpExam\Database
 * @template T
 */

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;

final class DbResult {
    /**
     * @param mixed $value
     * @param Throwable|null $error
     * @param string $stackTrace
     * @param bool $isDefined
     */
    private function __construct(
        private readonly mixed $value = null,
        private readonly ?Throwable $error = null,
        private readonly string $stackTrace = '',
        private readonly bool $isDefined = false,
    ) {
    }

    public static function of(mixed $value): self {
        return new self(value: $value, isDefined: true);
    }

    public static function empty(): self {
        return new self();
    }

    public static function error(Throwable $error): self {
        return new self(
            error: $error,
            stackTrace: $error->getTraceAsString(),
            isDefined: false,
        );
    }

    public function isSuccess(): bool {
        $isSuccess = ($this->error === null && $this->isDefined);

        return $isSuccess;
    }

    public function hasError(): bool {
        $hasError = ($this->error !== null);

        return $hasError;
    }

    public function isEmpty(): bool {
        $isEmpty = ($this->error === null && !$this->isDefined);

        return $isEmpty;
    }

    public function getValue(): mixed {
        return $this->value;
    }

    public function getError(): ?Throwable {
        return $this->error;
    }
}

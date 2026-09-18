<?php
/**
 * DbResultSet - Multi-item query result wrapper.
 *
 * @package WpExam\Database
 * @template T
 */

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;

final class DbResultSet {
    /**
     * @param array<int, mixed> $items
     * @param Throwable|null $error
     * @param string $stackTrace
     */
    private function __construct(
        private readonly array $items = [],
        private readonly ?Throwable $error = null,
        private readonly string $stackTrace = '',
    ) {
    }

    /**
     * @param array<int, mixed> $items
     */
    public static function of(array $items): self {
        return new self(items: array_values($items));
    }

    public static function empty(): self {
        return new self();
    }

    public static function error(Throwable $error): self {
        return new self(
            error: $error,
            stackTrace: $error->getTraceAsString(),
        );
    }

    public function isSuccess(): bool {
        $isSuccess = ($this->error === null);

        return $isSuccess;
    }

    public function hasError(): bool {
        $hasError = ($this->error !== null);

        return $hasError;
    }

    /**
     * @return array<int, mixed>
     */
    public function getItems(): array {
        return $this->items;
    }

    public function count(): int {
        return count($this->items);
    }

    public function getError(): ?Throwable {
        return $this->error;
    }
}

<?php
/**
 * BootErrorCollector - Captures early boot-time errors for diagnostics.
 *
 * @package WpExam\ErrorHandling
 */

namespace WpExam\ErrorHandling;

if (!defined('ABSPATH')) {
    exit;
}

use WpExam\Helpers\DateHelper;

final class BootErrorCollector {
    private const COLLECTOR_PREFIX = '[WP Exam] BootErrorCollector: ';

    /** @var array<int, array{context: string, message: string, timestamp: string}> */
    private array $errors = [];

    private static ?self $instance = null;

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct() {}

    /**
     * Record a boot-time error.
     */
    public function addError(string $context, string $message): void {
        $this->errors[] = [
            'context'   => $context,
            'message'   => $message,
            'timestamp' => DateHelper::nowUtc(),
        ];

        error_log(self::COLLECTOR_PREFIX . '[' . $context . '] ' . $message);
    }

    /**
     * @return array<int, array{context: string, message: string, timestamp: string}>
     */
    public function getErrors(): array {
        return $this->errors;
    }

    public function hasAnyErrors(): bool {
        $hasErrors = (count($this->errors) > 0);

        return $hasErrors;
    }
}

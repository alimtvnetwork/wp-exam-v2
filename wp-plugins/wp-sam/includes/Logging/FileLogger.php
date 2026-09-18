<?php
/**
 * FileLogger - Structured logging subsystem.
 *
 * Follows Riseup Asia FileLogger patterns.
 *
 * @package WpExam\Logging
 */

namespace WpExam\Logging;

if (!defined('ABSPATH')) {
    exit;
}

use WpExam\Helpers\DateHelper;

class FileLogger {
    private static ?self $instance = null;
    private ?string $logFile = null;

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct() {
        if (defined('WP_CONTENT_DIR')) {
            $logDir = WP_CONTENT_DIR . '/wp-exam-logs';
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }
            $this->logFile = $logDir . '/wp-exam.log';
        }
    }

    public function info(string $message, array $context = []): void {
        $this->log('INFO', $message, $context);
    }

    public function warning(string $message, array $context = []): void {
        $this->log('WARNING', $message, $context);
    }

    public function error(string $message, array $context = []): void {
        $this->log('ERROR', $message, $context);
    }

    private function log(string $level, string $message, array $context): void {
        $timestamp = DateHelper::nowUtc();
        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        $entry = sprintf("[%s] [%s] %s%s\n", $timestamp, $level, $message, $contextStr);

        error_log('[WP Exam] ' . $entry);

        if ($this->logFile && is_writable(dirname($this->logFile))) {
            @file_put_contents($this->logFile, $entry, FILE_APPEND | LOCK_EX);
        }
    }
}

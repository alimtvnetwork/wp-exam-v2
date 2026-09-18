<?php
/**
 * WpDbQueryWrapper - Safely wraps global $wpdb calls to catch and log errors.
 *
 * @package WpExam\Database
 */

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use wpdb;
use Throwable;
use WpExam\Enums\ResponseMessageType;

class WpDbQueryWrapper {
    /**
     * Executes a $wpdb callable, suppresses unhandled warnings, and logs errors.
     *
     * @template T
     * @param wpdb $wpdb
     * @param callable(wpdb): T $callback
     * @param string $contextSql
     * @return T|false
     */
    public static function execute(wpdb $wpdb, callable $callback, string $contextSql = '') {
        $previousSuppress = $wpdb->suppress_errors(true);

        try {
            $result = $callback($wpdb);

            $hasLastError = !empty($wpdb->last_error);

            if ($hasLastError) {
                error_log(
                    '[WP Exam] DbQueryError: ' . ResponseMessageType::DbQueryFailed->value .
                    ' | SQL: ' . ($contextSql ?: $wpdb->last_query) .
                    ' | Error: ' . $wpdb->last_error
                );
            }

            return $result;
        } catch (Throwable $e) {
            error_log(
                '[WP Exam] DbQueryException: ' . ResponseMessageType::DbQueryFailed->value .
                ' | SQL: ' . ($contextSql ?: $wpdb->last_query) .
                ' | Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString()
            );

            return false;
        } finally {
            $wpdb->suppress_errors($previousSuppress);
        }
    }
}

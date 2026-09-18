<?php
/**
 * Unit Test for WpDbQueryWrapper.
 *
 * @package WpExam\Tests
 */

namespace WpExam\Tests;

use PHPUnit\Framework\TestCase;
use WpExam\Database\WpDbQueryWrapper;

require_once dirname(__DIR__, 2) . '/includes/Autoloader.php';

class WpDbQueryWrapperTest extends TestCase {
    public function testExecuteReturnsCallbackResult(): void {
        global $wpdb;
        $result = WpDbQueryWrapper::execute($wpdb, function ($db) {
            return 'success_payload';
        }, 'SELECT 1');

        $this->assertEquals('success_payload', $result);
    }

    public function testExecuteCatchesExceptionGracefully(): void {
        global $wpdb;
        $result = WpDbQueryWrapper::execute($wpdb, function ($db) {
            throw new \RuntimeException('Database connection lost');
        }, 'SELECT 1');

        $this->assertFalse($result);
    }

    public function testExecuteLogsWpdbLastError(): void {
        global $wpdb;
        $wpdb->last_error = 'Table wp_forms does not exist';
        $result = WpDbQueryWrapper::execute($wpdb, function ($db) {
            return false;
        }, 'SELECT * FROM wp_forms');

        $this->assertFalse($result);
        $wpdb->last_error = '';
    }
}

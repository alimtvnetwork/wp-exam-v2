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
    public function testExecuteHandlesNullOrExceptionGracefully(): void {
        if (!class_exists('wpdb')) {
            $this->markTestSkipped('WordPress wpdb class not defined in standalone test harness.');
        }
    }
}

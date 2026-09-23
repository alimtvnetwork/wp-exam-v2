<?php
/**
 * Unit Test for SqlQueryWrapper and QueryResult.
 *
 * @package WpExam\Tests
 */

namespace WpExam\Tests;

use PDO;
use PHPUnit\Framework\TestCase;
use WpExam\Database\SqlQueryWrapper;
use WpExam\Database\QueryResult;

require_once dirname(__DIR__, 2) . '/includes/Autoloader.php';

class SqlQueryWrapperTest extends TestCase {
    private ?PDO $pdo = null;

    private function getPdo(): PDO {
        if ($this->pdo === null) {
            $this->pdo = new PDO('sqlite::memory:');
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->exec('CREATE TABLE test_items (id INTEGER PRIMARY KEY, name TEXT);');
        }

        return $this->pdo;
    }

    public function testExecuteSuccessReturnsQueryResult(): void {
        $pdo = $this->getPdo();
        $result = SqlQueryWrapper::execute($pdo, function (PDO $db) {
            $stmt = $db->prepare('INSERT INTO test_items (name) VALUES (:name)');
            $stmt->execute([':name' => 'Widget']);
            return (int) $db->lastInsertId();
        }, 'INSERT INTO test_items');

        $this->assertTrue($result->is_success);
        $this->assertFalse($result->is_fail);
        $this->assertEquals(1, $result->data);
        $this->assertNull($result->error_message);
    }

    public function testExecuteFailureCatchesExceptionAndLogs(): void {
        $pdo = $this->getPdo();
        $result = SqlQueryWrapper::execute($pdo, function (PDO $db) {
            $db->exec('INSERT INTO non_existent_table VALUES (1)');
            return true;
        }, 'INSERT INTO non_existent_table');

        $this->assertFalse($result->is_success);
        $this->assertTrue($result->is_fail);
        $this->assertNull($result->data);
        $this->assertNotNull($result->error_message);
        $this->assertStringContainsString('no such table', $result->error_message);
    }
}

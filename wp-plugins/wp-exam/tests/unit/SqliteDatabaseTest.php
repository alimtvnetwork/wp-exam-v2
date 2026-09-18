<?php
/**
 * Unit Test for SqliteDatabase and Orm.
 *
 * @package WpExam\Tests
 */

declare(strict_types=1);

namespace WpExam\Tests;

use PHPUnit\Framework\TestCase;
use WpExam\Database\SqliteDatabase;
use WpExam\Database\Orm;

class SqliteDatabaseTest extends TestCase {
    public function testSqliteDatabaseInstanceAndPath(): void {
        $db = SqliteDatabase::getInstance();
        $this->assertNotNull($db);
        $path = $db->getDbPath();
        $this->assertTrue(str_contains($path, 'wp-exam.sqlite'));
    }

    public function testGetTableCountsReturnsValidArray(): void {
        $db = SqliteDatabase::getInstance();
        $counts = $db->getTableCounts();
        $this->assertArrayHasKey('has_driver', $counts);
        $this->assertArrayHasKey('db_path', $counts);
        $this->assertArrayHasKey('forms', $counts);
    }

    public function testOrmBuilderInstance(): void {
        $orm = Orm::forTable('forms');
        $this->assertNotNull($orm);
        $orm->where('form_type', 'quiz')->limit(5);
        $results = $orm->findMany();
        $this->assertCount(0, $results);
    }
}

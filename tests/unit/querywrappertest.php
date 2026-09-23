<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Database\QueryWrapper;
use App\Services\Database\QueryResult;
use PDO;
use Exception;

class QueryWrapperTest extends TestCase
{
    private PDO $pdo;

    public function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:', null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        $this->pdo->exec('CREATE TABLE TestTable (Id INTEGER PRIMARY KEY, Val TEXT);');
    }

    public function testExecuteSuccessReturnsStructuredResult(): void
    {
        $result = QueryWrapper::execute(
            $this->pdo,
            static function (PDO $db): int {
                $db->exec("INSERT INTO TestTable (Val) VALUES ('Hello')");
                return (int) $db->lastInsertId();
            },
            'INSERT INTO TestTable'
        );

        $this->assertInstanceOf(QueryResult::class, $result);
        $this->assertTrue($result->isSuccess);
        $this->assertTrue($result->is_success);
        $this->assertFalse($result->isFail);
        $this->assertFalse($result->is_fail);
        $this->assertTrue($result->isSuccess());
        $this->assertFalse($result->isFail());
        $this->assertEquals(1, $result->data);
        $this->assertNull($result->errorMessage);
        $this->assertEquals('INSERT INTO TestTable', $result->contextSql);
    }

    public function testExecuteFailureCatchesExceptionAndLogs(): void
    {
        $result = QueryWrapper::execute(
            $this->pdo,
            static function (PDO $db): never {
                throw new Exception('Simulated fatal query exception');
            },
            'CRASHING QUERY'
        );

        $this->assertInstanceOf(QueryResult::class, $result);
        $this->assertFalse($result->isSuccess);
        $this->assertFalse($result->is_success);
        $this->assertTrue($result->isFail);
        $this->assertTrue($result->is_fail);
        $this->assertFalse($result->isSuccess());
        $this->assertTrue($result->isFail());
        $this->assertNull($result->data);
        $this->assertStringContainsString('Simulated fatal query exception', (string) $result->errorMessage);
        $this->assertEquals('CRASHING QUERY', $result->contextSql);
    }
}

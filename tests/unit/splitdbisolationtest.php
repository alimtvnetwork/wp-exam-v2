<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Database\SplitDbManager;

class SplitDbIsolationTest extends TestCase
{
    private string $tempDir;

    public function setUp(): void
    {
        $this->tempDir = sys_get_temp_dir() . '/wpexam_test_dbs_' . uniqid();
        mkdir($this->tempDir, 0755, true);
    }

    public function testDatabaseConnectionsAreIsolatedPerProject(): void
    {
        $this->setUp();

        $manager = new SplitDbManager();
        $pdo1 = $manager->getProjectConnection(101, $this->tempDir);
        $pdo2 = $manager->getProjectConnection(102, $this->tempDir);

        $manager->migrateProjectDb($pdo1);
        $manager->migrateProjectDb($pdo2);

        // Insert into Project 101
        $stmt1 = $pdo1->prepare("INSERT INTO Form (ProjectId, Slug, Title) VALUES (101, 'form-101', 'Form 101')");
        $stmt1->execute();

        // Assert Project 101 has 1 record
        $count1 = (int) $pdo1->query("SELECT count(*) FROM Form WHERE ProjectId = 101")->fetchColumn();
        $this->assertEquals(1, $count1);

        // Assert Project 102 has 0 records (Strict Isolation!)
        $count2 = (int) $pdo2->query("SELECT count(*) FROM Form WHERE ProjectId = 101")->fetchColumn();
        $this->assertEquals(0, $count2);
    }

    public function testWalModePragmaIsEnforced(): void
    {
        $this->setUp();

        $manager = new SplitDbManager();
        $pdo = $manager->getRootConnection($this->tempDir);

        $journalMode = (string) $pdo->query("PRAGMA journal_mode;")->fetchColumn();
        $this->assertEquals('wal', strtolower($journalMode));
    }
}

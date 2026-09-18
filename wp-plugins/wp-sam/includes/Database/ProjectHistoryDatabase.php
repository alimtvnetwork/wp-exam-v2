<?php
/**
 * Project History and Rollback Subsystem for WP Exam.
 * Manages per-project revision history SQLite databases.
 *
 * @package WpExam\Database
 */

declare(strict_types=1);

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use PDO;
use Throwable;
use WpExam\Logging\FileLogger;

class ProjectHistoryDatabase {
    private static ?self $instance = null;
    /** @var array<string, PDO> */
    private array $historyPdos = [];

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct() {}

    private function hasDriver(): bool {
        return extension_loaded('pdo_sqlite') && in_array('sqlite', PDO::getAvailableDrivers(), true);
    }

    public function getHistoryPdo(string $projectId): ?PDO {
        $cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $projectId);
        $hasCleanId = !empty($cleanId);
        if (!$hasCleanId) {
            return null;
        }

        $hasExisting = isset($this->historyPdos[$cleanId]);
        if ($hasExisting) {
            return $this->historyPdos[$cleanId];
        }

        $hasDriverAvailable = $this->hasDriver();
        if (!$hasDriverAvailable) {
            return null;
        }

        $uploadDir = function_exists('wp_upload_dir') ? wp_upload_dir()['basedir'] : sys_get_temp_dir();
        $historyDir = rtrim($uploadDir, '/\\') . '/wp-exam/history';
        $hasDir = is_dir($historyDir);
        if (!$hasDir) {
            @mkdir($historyDir, 0755, true);
        }

        $historyPath = $historyDir . '/' . $cleanId . '_history.sqlite';

        try {
            $pdo = new PDO('sqlite:' . $historyPath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec('PRAGMA journal_mode = WAL;');

            $schema = "
            CREATE TABLE IF NOT EXISTS project_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL,
                revision_id TEXT NOT NULL UNIQUE,
                change_type TEXT NOT NULL DEFAULT 'update',
                summary TEXT NOT NULL DEFAULT '',
                author TEXT NOT NULL DEFAULT 'admin',
                snapshot_json TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
            ";
            $pdo->exec($schema);

            $this->historyPdos[$cleanId] = $pdo;
            return $pdo;
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('History DB init error: ' . $e->getMessage());
            return null;
        }
    }

    public function recordSnapshot(
        string $projectId,
        string $changeType,
        string $summary,
        string $author,
        array $snapshotData
    ): string {
        $cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $projectId);
        $revisionId = 'rev_' . time() . '_' . substr(md5((string) microtime(true)), 0, 8);
        $json = json_encode($snapshotData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';

        $pdo = $this->getHistoryPdo($cleanId);
        if ($pdo !== null) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO project_history (project_id, revision_id, change_type, summary, author, snapshot_json)
                    VALUES (:project_id, :revision_id, :change_type, :summary, :author, :snapshot_json)
                ");
                $stmt->execute([
                    ':project_id'    => $cleanId,
                    ':revision_id'   => $revisionId,
                    ':change_type'   => $changeType,
                    ':summary'       => $summary,
                    ':author'        => $author,
                    ':snapshot_json' => $json,
                ]);
            } catch (Throwable $e) {
                FileLogger::getInstance()->error('Record snapshot error: ' . $e->getMessage());
            }
        }

        return $revisionId;
    }

    public function getRevisions(string $projectId, int $limit = 20): array {
        $cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $projectId);
        $pdo = $this->getHistoryPdo($cleanId);
        if ($pdo === null) {
            return [];
        }

        try {
            $stmt = $pdo->prepare("
                SELECT id, project_id, revision_id, change_type, summary, author, created_at
                FROM project_history
                WHERE project_id = :project_id
                ORDER BY id DESC
                LIMIT :limit
            ");
            $stmt->bindValue(':project_id', $cleanId, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll() ?: [];
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('Get revisions error: ' . $e->getMessage());
            return [];
        }
    }

    public function getRevision(string $projectId, string $revisionId): ?array {
        $cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $projectId);
        $pdo = $this->getHistoryPdo($cleanId);
        if ($pdo === null) {
            return null;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT id, project_id, revision_id, change_type, summary, author, snapshot_json, created_at
                FROM project_history
                WHERE project_id = :project_id AND revision_id = :revision_id
                LIMIT 1
            ");
            $stmt->execute([
                ':project_id'  => $cleanId,
                ':revision_id' => $revisionId,
            ]);

            $row = $stmt->fetch();
            $hasRow = !empty($row);
            if (!$hasRow) {
                return null;
            }

            $decoded = json_decode($row['snapshot_json'] ?? '{}', true);
            $row['snapshot_data'] = is_array($decoded) ? $decoded : [];
            unset($row['snapshot_json']);

            return $row;
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('Get revision error: ' . $e->getMessage());
            return null;
        }
    }
}

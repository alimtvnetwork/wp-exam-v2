<?php
/**
 * SQLite Database Manager for WP Exam.
 * Provides self-contained SQLite storage following riseup-asia-uploader architecture.
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

class SqliteDatabase {
    private static ?self $instance = null;
    private ?PDO $pdo = null;
    private string $dbPath = '';
    private bool $isInitialized = false;

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct() {
        $this->dbPath = $this->resolveDbPath();
    }

    private function resolveDbPath(): string {
        $uploadDir = function_exists('wp_upload_dir') ? wp_upload_dir()['basedir'] : sys_get_temp_dir();
        $targetDir = rtrim($uploadDir, '/\\') . '/wp-exam';

        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        return $targetDir . '/wp-exam.sqlite';
    }

    public function getDbPath(): string {
        return $this->dbPath;
    }

    public function hasDriver(): bool {
        return extension_loaded('pdo_sqlite') && in_array('sqlite', PDO::getAvailableDrivers(), true);
    }

    public function init(): bool {
        if ($this->isInitialized) {
            return true;
        }

        if (!$this->hasDriver()) {
            FileLogger::getInstance()->warning('PDO SQLite driver not loaded in PHP environment; operating in fallback mode.');
            $this->isInitialized = true;
            return false;
        }

        try {
            $this->pdo = new PDO('sqlite:' . $this->dbPath);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->pdo->exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

            $this->runMigrations();
            $this->isInitialized = true;

            return true;
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('SQLite initialization failed: ' . $e->getMessage());
            return false;
        }
    }

    /** @var array<string, PDO> */
    private array $projectPdos = [];

    public function getPdo(): ?PDO {
        if (!$this->isInitialized) {
            $this->init();
        }

        return $this->pdo;
    }

    public function getProjectDatabase(string $projectId): ?PDO {
        $cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $projectId);
        $hasCleanId = !empty($cleanId);
        if (!$hasCleanId) {
            return null;
        }

        $hasExistingPdo = isset($this->projectPdos[$cleanId]);
        if ($hasExistingPdo) {
            return $this->projectPdos[$cleanId];
        }

        $hasDriverAvailable = $this->hasDriver();
        if (!$hasDriverAvailable) {
            return null;
        }

        $uploadDir = function_exists('wp_upload_dir') ? wp_upload_dir()['basedir'] : sys_get_temp_dir();
        $projectDir = rtrim($uploadDir, '/\\') . '/wp-exam/projects';
        $hasDir = is_dir($projectDir);
        if (!$hasDir) {
            @mkdir($projectDir, 0755, true);
        }

        $projectDbPath = $projectDir . '/' . $cleanId . '.sqlite';

        try {
            $pdo = new PDO('sqlite:' . $projectDbPath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

            $schema = "
            CREATE TABLE IF NOT EXISTS project_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS project_sections (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                content_type TEXT NOT NULL DEFAULT 'quiz',
                reading_content TEXT DEFAULT '',
                video_url TEXT DEFAULT '',
                checklist_json TEXT DEFAULT '[]',
                questions_json TEXT DEFAULT '[]',
                settings_json TEXT DEFAULT '{}'
            );
            CREATE TABLE IF NOT EXISTS section_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                section_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'locked',
                checklist_completed INTEGER NOT NULL DEFAULT 0,
                score_percentage REAL DEFAULT 0,
                attempt_count INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT DEFAULT (datetime('now'))
            );
            ";
            $pdo->exec($schema);

            $this->projectPdos[$cleanId] = $pdo;
            return $pdo;
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('Failed opening project SQLite DB for ' . $cleanId . ': ' . $e->getMessage());
            return null;
        }
    }

    private function runMigrations(): void {
        if ($this->pdo === null) {
            return;
        }

        $schema = "
        CREATE TABLE IF NOT EXISTS forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            form_type TEXT NOT NULL DEFAULT 'general_form',
            form_access TEXT NOT NULL DEFAULT 'public',
            is_sequential INTEGER NOT NULL DEFAULT 0,
            is_published INTEGER NOT NULL DEFAULT 1,
            settings_json TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS form_fields (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_id INTEGER NOT NULL,
            field_type TEXT NOT NULL,
            field_label TEXT NOT NULL,
            field_placeholder TEXT DEFAULT '',
            is_required INTEGER NOT NULL DEFAULT 0,
            display_order INTEGER NOT NULL DEFAULT 0,
            options_json TEXT DEFAULT '[]',
            correct_answer TEXT DEFAULT '',
            points INTEGER NOT NULL DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS form_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_id INTEGER NOT NULL,
            user_id INTEGER DEFAULT 0,
            guest_name TEXT DEFAULT '',
            guest_email TEXT DEFAULT '',
            form_type TEXT NOT NULL,
            score REAL DEFAULT 0,
            total_possible_score REAL DEFAULT 0,
            score_percentage REAL DEFAULT 0,
            is_passed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS form_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id INTEGER NOT NULL,
            field_id INTEGER NOT NULL,
            answer_value TEXT DEFAULT '',
            is_correct INTEGER DEFAULT 0,
            points_earned REAL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_invites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'subscriber',
            invite_token TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'pending',
            invited_by INTEGER DEFAULT 0,
            form_id INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            expires_at TEXT DEFAULT (datetime('now', '+7 days'))
        );

        CREATE TABLE IF NOT EXISTS email_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            smtp_host TEXT DEFAULT '',
            smtp_port INTEGER DEFAULT 587,
            smtp_user TEXT DEFAULT '',
            smtp_pass TEXT DEFAULT '',
            smtp_secure TEXT DEFAULT 'tls',
            from_email TEXT DEFAULT '',
            from_name TEXT DEFAULT '',
            is_smtp_enabled INTEGER DEFAULT 0,
            templates_json TEXT DEFAULT '{}',
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            display_order INTEGER NOT NULL DEFAULT 0,
            permissions_json TEXT DEFAULT '[]',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            category_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            display_order INTEGER NOT NULL DEFAULT 0,
            pipeline_order_json TEXT DEFAULT '[]',
            permissions_json TEXT DEFAULT '[]',
            settings_json TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS question_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            report_type TEXT NOT NULL DEFAULT 'feedback',
            user_identifier TEXT DEFAULT '',
            feedback_text TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TEXT DEFAULT (datetime('now'))
        );
        ";

        $this->pdo->exec($schema);
    }

    public function query(string $sql, array $params = []): array {
        if ($this->pdo === null) {
            return [];
        }

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('SQLite query error: ' . $e->getMessage(), ['sql' => $sql]);
            return [];
        }
    }

    public function execute(string $sql, array $params = []): int {
        if ($this->pdo === null) {
            return 0;
        }

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (Throwable $e) {
            FileLogger::getInstance()->error('SQLite execute error: ' . $e->getMessage(), ['sql' => $sql]);
            return 0;
        }
    }

    public function getTableCounts(): array {
        if ($this->pdo === null) {
            return [
                'has_driver' => false,
                'db_path'    => $this->dbPath,
                'forms'      => 0,
                'submissions'=> 0,
                'invites'    => 0,
            ];
        }

        $forms = (int) ($this->pdo->query('SELECT COUNT(*) FROM forms')->fetchColumn() ?: 0);
        $submissions = (int) ($this->pdo->query('SELECT COUNT(*) FROM form_submissions')->fetchColumn() ?: 0);
        $invites = (int) ($this->pdo->query('SELECT COUNT(*) FROM user_invites')->fetchColumn() ?: 0);

        return [
            'has_driver' => true,
            'db_path'    => $this->dbPath,
            'forms'      => $forms,
            'submissions'=> $submissions,
            'invites'    => $invites,
            'file_size'  => file_exists($this->dbPath) ? filesize($this->dbPath) : 0,
        ];
    }
}

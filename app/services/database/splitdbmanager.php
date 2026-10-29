<?php

declare(strict_types=1);

namespace App\Services\Database;

use PDO;

/**
 * SplitDbManager manages partitioned SQLite databases for global root, isolated projects, and telemetry logs.
 */
class SplitDbManager
{
    /** @var array<string, PDO> */
    private array $connections = [];

    /**
     * Creates or retrieves PDO connection to root.db.
     */
    public function getRootConnection(string $storageDir = ''): PDO
    {
        $dir = !empty($storageDir) ? $storageDir : sys_get_temp_dir() . '/wpexam_databases';
        $path = $dir . '/root.db';

        return $this->getConnection('root', $path);
    }

    /**
     * Creates or retrieves isolated PDO connection to project_<id>.db.
     */
    public function getProjectConnection(int $projectId, string $storageDir = ''): PDO
    {
        $dir = !empty($storageDir) ? $storageDir : sys_get_temp_dir() . '/wpexam_databases';
        $path = "{$dir}/project_{$projectId}.db";

        return $this->getConnection("project_{$projectId}", $path);
    }

    /**
     * Creates or retrieves PDO connection to logs.db.
     */
    public function getLogsConnection(string $storageDir = ''): PDO
    {
        $dir = !empty($storageDir) ? $storageDir : sys_get_temp_dir() . '/wpexam_databases';
        $path = $dir . '/logs.db';

        return $this->getConnection('logs', $path);
    }

    private function getConnection(string $key, string $filePath): PDO
    {
        $hasConn = array_key_exists($key, $this->connections);

        if ($hasConn) {
            return $this->connections[$key];
        }

        $dir = dirname($filePath);
        $hasDir = is_dir($dir);

        if (!$hasDir) {
            mkdir($dir, 0755, true);
        }

        $pdo = new PDO("sqlite:{$filePath}", null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $pdo->exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;');
        $pdo->exec('PRAGMA foreign_keys = ON;');

        $this->connections[$key] = $pdo;

        return $pdo;
    }

    /**
     * Migrates isolated project database tables safely via QueryWrapper.
     */
    public function migrateProjectDb(PDO $pdo): QueryResult
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS Form (
            FormId INTEGER PRIMARY KEY AUTOINCREMENT,
            ProjectId INTEGER NOT NULL,
            Slug TEXT NOT NULL UNIQUE,
            Title TEXT NOT NULL,
            Description TEXT,
            ThemeId TEXT NOT NULL DEFAULT 'riseup-asia',
            IsActive INTEGER NOT NULL DEFAULT 1,
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS FormSection (
            FormSectionId INTEGER PRIMARY KEY AUTOINCREMENT,
            FormId INTEGER NOT NULL,
            StepOrder INTEGER NOT NULL,
            Title TEXT NOT NULL,
            IsVisible INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS FormField (
            FormFieldId INTEGER PRIMARY KEY AUTOINCREMENT,
            FormSectionId INTEGER NOT NULL,
            FieldKey TEXT NOT NULL,
            FieldType TEXT NOT NULL,
            Label TEXT NOT NULL,
            IsRequired INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS FormSubmission (
            FormSubmissionId INTEGER PRIMARY KEY AUTOINCREMENT,
            FormId INTEGER NOT NULL,
            ApplicantEmail TEXT NOT NULL,
            ApplicantName TEXT NOT NULL,
            PayloadJson TEXT NOT NULL,
            IsCompleted INTEGER NOT NULL DEFAULT 0,
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS Draft (
            DraftId INTEGER PRIMARY KEY AUTOINCREMENT,
            FormId INTEGER NOT NULL,
            ApplicantEmail TEXT NOT NULL,
            ResumeToken TEXT NOT NULL UNIQUE,
            CurrentStep INTEGER NOT NULL DEFAULT 1,
            PayloadJson TEXT NOT NULL,
            ExpiresAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS FormOption (
            FormOptionId INTEGER PRIMARY KEY AUTOINCREMENT,
            FormFieldId INTEGER NOT NULL,
            OptionKey TEXT NOT NULL,
            OptionLabel TEXT NOT NULL,
            DisplayOrder INTEGER NOT NULL DEFAULT 0,
            IsCorrect INTEGER NOT NULL DEFAULT 0,
            BranchTargetSectionId INTEGER DEFAULT NULL,
            FOREIGN KEY (FormFieldId) REFERENCES FormField(FormFieldId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS FormSubmissionValue (
            FormSubmissionValueId INTEGER PRIMARY KEY AUTOINCREMENT,
            FormSubmissionId INTEGER NOT NULL,
            FormFieldId INTEGER NOT NULL,
            StringValue TEXT,
            NumericValue REAL,
            BooleanValue INTEGER,
            JsonValue TEXT,
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (FormSubmissionId) REFERENCES FormSubmission(FormSubmissionId) ON DELETE CASCADE,
            FOREIGN KEY (FormFieldId) REFERENCES FormField(FormFieldId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ApplicantStage (
            ApplicantStageId INTEGER PRIMARY KEY AUTOINCREMENT,
            StageKey TEXT NOT NULL UNIQUE,
            StageName TEXT NOT NULL,
            DisplayOrder INTEGER NOT NULL DEFAULT 0,
            ColorCode TEXT DEFAULT '#3b82f6',
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS Applicant (
            ApplicantId INTEGER PRIMARY KEY AUTOINCREMENT,
            CandidateName TEXT NOT NULL,
            CandidateEmail TEXT NOT NULL,
            Phone TEXT DEFAULT '',
            CurrentStageKey TEXT NOT NULL DEFAULT 'applied',
            FormId INTEGER DEFAULT 0,
            FormSubmissionId INTEGER DEFAULT 0,
            Score REAL DEFAULT 0,
            Rating INTEGER DEFAULT 0,
            Notes TEXT DEFAULT '',
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
            UpdatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS ApplicantTransition (
            ApplicantTransitionId INTEGER PRIMARY KEY AUTOINCREMENT,
            ApplicantId INTEGER NOT NULL,
            FromStageKey TEXT,
            ToStageKey TEXT NOT NULL,
            MovedByUserId INTEGER DEFAULT 0,
            Notes TEXT DEFAULT '',
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (ApplicantId) REFERENCES Applicant(ApplicantId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS PortalStepCompletion (
            PortalStepCompletionId INTEGER PRIMARY KEY AUTOINCREMENT,
            Token TEXT NOT NULL,
            StepId TEXT NOT NULL,
            StepDataJson TEXT DEFAULT '{}',
            CompletedAt TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(Token, StepId)
        );
        ";

        return QueryWrapper::execute(
            $pdo,
            static function (PDO $db) use ($sql): int|false {
                return $db->exec($sql);
            },
            'migrateProjectDb'
        );
    }
}

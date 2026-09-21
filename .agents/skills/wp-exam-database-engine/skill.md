---
name: wp-exam-database-engine
description: Hybrid database architecture for WP Exam, encompassing WordPress MySQL relational tables, Split SQLite multi-database engine, micro-ORM, and automated backups.
---

# WP Exam: Hybrid Database Engine & Data Conventions

This skill guides the design, schema migrations, query generation, and data modeling for WP Exam's hybrid database system.

## 1. Dual Database Architecture Strategy

The application uses a hybrid storage model:

1. **WordPress Relational MySQL (`dbDelta`)**:
   - Manages core WordPress-integrated entities (forms, fields, answers, submissions).
   - Ensured by `class-wp-exam-activator.php` on plugin activation.
   - Relies on `$wpdb->prefix`.
   - All tables use singular PascalCase naming standards, `{Table}Id` primary keys, and positive boolean flags (`IsActive`, `IsSequential`, `IsPublished`).

2. **Split SQLite Multi-Database Architecture (`wp-exam/*.sqlite`)**:
   - Manages high-frequency telemetry, isolated project curriculum trees, candidate progression, and versioned audit history.
   - Managed by `WpExam\Database\SqliteDatabase` in `wp-plugins/wp-exam/includes/Database/SqliteDatabase.php`.
   - Eliminates cross-tenant lock contention and enables 1-click project state rollbacks.

## 2. MySQL Relational Schemas (`dbDelta`)

- **`{$wpdb->prefix}quiz` (`WpExamForm`)**:
  - `QuizId` (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
  - `Title` (VARCHAR(255), NOT NULL)
  - `Description` (TEXT, NULL)
  - `FormType` (`WpExamFormType`: `'quiz'`, `'employee_signup'`, `'survey'`, `'general_form'`)
  - `FormAccess` (`WpExamFormAccessType`: `'public'`, `'authenticated'`, `'admin_only'`)
  - `IsSequential` (TINYINT(1), DEFAULT 0)
  - `IsPublished` (TINYINT(1), DEFAULT 1)
  - `SettingsJson` (LONGTEXT, NULL)
  - `CreatedAt`, `UpdatedAt` (DATETIME)

- **`{$wpdb->prefix}quiz_question` (`WpExamField`)**:
  - `QuizQuestionId` (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
  - `QuizId` (BIGINT UNSIGNED, FK, NOT NULL)
  - `QuestionText` (TEXT, NOT NULL)
  - `QuestionType` (`WpExamFieldType`: `'multiple_choice'`, `'single_choice'`, `'true_false'`, `'short_answer'`, `'paragraph'`, `'email'`, `'phone'`, `'dropdown'`, `'rating'`, `'file_upload'`)
  - `FieldPlaceholder` (VARCHAR(255), NULL)
  - `IsRequired` (TINYINT(1), DEFAULT 0)
  - `DisplayOrder` (INT, DEFAULT 0)
  - `OptionsJson` (LONGTEXT, NULL)
  - `ValidationJson` (TEXT, NULL)
  - `Points` (INT, DEFAULT 0)
  - `CorrectAnswer` (TEXT, NULL)

- **`{$wpdb->prefix}quiz_result` (`WpExamSubmission`)**:
  - `QuizResultId` (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
  - `QuizId` (BIGINT UNSIGNED, FK, NOT NULL)
  - `UserId` (BIGINT UNSIGNED, DEFAULT NULL / 0)
  - `GuestEmail` (VARCHAR(255), NULL)
  - `GuestName` (VARCHAR(255), NULL)
  - `UserIp` (VARCHAR(45), NULL)
  - `AnswersJson` (LONGTEXT, NOT NULL)
  - `Score` (INT, DEFAULT 0)
  - `TotalPossibleScore` (INT, NULL)
  - `IsPassed` (TINYINT(1), NULL)
  - `CompletedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  - **IMMUTABLE RULE:** Submissions are strictly append-only. NEVER execute `UPDATE` queries against submission records.

## 3. Split SQLite Database Topology

Stored under `wp-content/uploads/wp-exam/`:

1. **Central Root Database (`wp-exam/database.sqlite`)**:
   - Global categories, projects, user invites, email settings, question bug reports, and telemetry logs.
2. **Project-Scoped Database (`wp-exam/projects/{id}.sqlite`)**:
   - Localized project metadata, section layouts (Docs, Video, Checklists, Quizzes), and candidate progress tracking.
3. **Audit History Database (`wp-exam/history/{id}_history.sqlite`)**:
   - Snapshot audit trail storing serialized project states for instant 1-click rollbacks:
   - Columns: `revision_id`, `project_id`, `action`, `change_summary`, `author`, `snapshot_data`, `created_at`.

## 4. Micro-ORM & Query Wrapper Standards

- **`WpExam\Database\Orm`**: Fluent query builder wrapping PDO / SQLite:
  ```php
  $forms = Orm::forTable('forms')
      ->where('is_published', 1)
      ->orderBy('created_at', 'DESC')
      ->findMany();
  ```
- **`WpExam\Database\TypedQuery`**: Parameterized query execution with typed return values:
  - `queryScalar(string $sql, array $params): mixed`
  - `queryRow(string $sql, array $params): ?array`
  - `queryAll(string $sql, array $params): array`
- **Rule:** Parameterized queries only. Never interpolate raw user strings into SQL queries.

## 5. Automated Backup & Archiving

- Managed by `SystemBackupRestController`:
  - Bundles central SQLite and project SQLite files into timestamped ZIP archives (`wp-exam-backup-YYYY-MM-DD-HHmmss.zip`).
  - Automatic retention policy: Retains 7 daily backups, 4 weekly backups, and 3 monthly archives.
  - Dual-dispatch: Saves to local storage disk and optionally transmits encrypted backup to configured administrator email.

# App DB — Quiz Schema & Migrations

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This specification establishes the authoritative database schema and WordPress `dbDelta` SQL migrations for the `wp-exam` plugin.

All table names follow project database conventions:
- Singular PascalCase concept (`Quiz`, `QuizQuestion`, `QuizAnswer`, `QuizResult`).
- Prefixed with WordPress `$wpdb->prefix` (e.g. `wp_quiz`, `wp_quiz_question`).
- Primary Key format: `{Table}Id` (e.g. `QuizId`, `QuizQuestionId`).
- Character set and collation: `$wpdb->get_charset_collate()` (`utf8mb4_unicode_520_ci`).

---

## 1. DDL Migration Statements (`dbDelta` Format)

WordPress `dbDelta()` requires two spaces after `PRIMARY KEY`, specific indexing syntax, and each field on its own line:

```sql
CREATE TABLE {$wpdb->prefix}quiz (
  QuizId bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Title varchar(255) NOT NULL,
  Description text DEFAULT NULL,
  CreatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (QuizId),
  KEY idx_quiz_created (CreatedAt)
) {$charset_collate};

CREATE TABLE {$wpdb->prefix}quiz_question (
  QuizQuestionId bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  QuizId bigint(20) unsigned NOT NULL,
  QuestionText text NOT NULL,
  QuestionType varchar(50) NOT NULL DEFAULT 'multiple_choice',
  DisplayOrder int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY  (QuizQuestionId),
  KEY idx_question_quiz (QuizId),
  KEY idx_question_order (DisplayOrder)
) {$charset_collate};

CREATE TABLE {$wpdb->prefix}quiz_answer (
  QuizAnswerId bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  QuizQuestionId bigint(20) unsigned NOT NULL,
  AnswerText text NOT NULL,
  IsCorrect tinyint(1) NOT NULL DEFAULT 0,
  DisplayOrder int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY  (QuizAnswerId),
  KEY idx_answer_question (QuizQuestionId),
  KEY idx_answer_correct (IsCorrect)
) {$charset_collate};

CREATE TABLE {$wpdb->prefix}quiz_result (
  QuizResultId bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  QuizId bigint(20) unsigned NOT NULL,
  UserId bigint(20) unsigned DEFAULT 0,
  Score int(11) NOT NULL DEFAULT 0,
  CompletedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (QuizResultId),
  KEY idx_result_quiz (QuizId),
  KEY idx_result_user (UserId)
) {$charset_collate};
```

---

## 2. Table Relationships

```text
Quiz (1) ───< (N) QuizQuestion (1) ───< (N) QuizAnswer
  │
  └───< (N) QuizResult
```

### Cascade Rules
- Deleting a `Quiz` cascades to delete related `QuizQuestion` rows, `QuizAnswer` rows, and `QuizResult` rows.
- Handled at PHP application level inside `WP_Exam_REST_API::delete_quiz()` within a database transaction.

---

## 3. Data Integrity & Immutability

- `IsCorrect` boolean is stored as `tinyint(1)` (1 for true, 0 for false).
- `QuizResult` is append-only. No `UPDATE` queries are executed on `{$wpdb->prefix}quiz_result`.

---

## Cross-References

- [Core Database Conventions](../04-database-conventions/01-index.md)
- [Quiz Feature Overview](../21-app/04-quiz-feature/00-overview.md)

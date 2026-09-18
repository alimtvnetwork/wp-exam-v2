# Split SQLite Database & Audit History Specification

## 1. Split SQLite Architecture

To guarantee total data isolation, high concurrency without lock contention, and simple tenant-level backup and restore, WP Exam implements the **Split Database** pattern:

### 1.1 Project SQLite Database
- Every project maintains its own isolated database file located at `wp-exam/projects/{id}.sqlite`.
- Stores project metadata (`project_meta`), localized section configuration (`project_sections`), and candidate progression (`section_progress`).
- Zero data leakage across discrete curriculum subjects or departments.

### 1.2 Revision History Database
- Every project maintains an accompanying audit log database located at `wp-exam/history/{id}_history.sqlite`.
- Managed by `includes/Database/ProjectHistoryDatabase.php`.
- Schema:
  - `revision_id`: Unique timestamped hash (e.g. `rev_1726671234_abc`).
  - `project_id`: Target project slug.
  - `action`: Operation type (`create`, `update`, `revert`).
  - `change_summary`: Human-readable description of what was changed.
  - `author`: Administrator username or system process.
  - `snapshot_data`: Full JSON serialization of the project state at the moment of modification.
  - `created_at`: ISO timestamp.

### 1.3 1-Click Revision Rollback
- Available in `ProjectHierarchyManager` and `HistoryManager`.
- Administrators can review all historical revisions, view exact change summaries, and click **Revert** to roll back the project state instantly.

---

## 2. Global DB Sync & Client IP Tracking

### 2.1 Central SQLite Root Database
- Located at `wp-exam/database.sqlite` (or WordPress upload directory).
- Maintains global tables: `forms`, `form_fields`, `form_submissions`, `form_answers`, `user_invites`, `email_settings`, `categories`, `projects`, and `question_reports`.

### 2.2 Security & Anonymity Tracking
- `form_submissions` table contains:
  - `client_ip`: Client IP address logged for security verification and anti-abuse audit trails.
  - `is_anonymous`: Boolean flag indicating whether the assessment was taken anonymously (survey mode) or via authenticated token.
- Non-destructive `ALTER TABLE` migrations ensure backward compatibility across all plugin versions (`wp-exam` and `wp-sam`).

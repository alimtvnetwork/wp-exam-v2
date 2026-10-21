# Recruitment Pipeline, Applicant Tracking & Candidate Self-Service Portal

> **/goal** Provide an end-to-end applicant tracking pipeline and candidate self-service verification system within WP Exam.
> **/learn** Reference `02-spec/05-split-db-architecture/` for split SQLite database storage and `02-spec/02-coding-guidelines/` for boolean conventions.

---

## 1. Executive Summary

This specification establishes the architecture for two complementary recruitment subsystems in WP Exam:
1. **Admin Applicant Tracking Kanban Pipeline (`src/components/admin/applicant-pipeline-kanban.tsx`)**: An interactive administrative kanban board supporting customizable recruitment stages, candidate evaluation notes, star ratings, and stage transitions.
2. **Candidate Self-Service Portal (`src/components/portal/candidate-portal-runner.tsx`)**: A token-scoped public interface (`/portal/:token`) allowing applicants to independently verify their identity, sign non-disclosure agreements, complete technical skill assessments, upload work samples, and generate verified completion packets.

---

## 2. Database Schema Architecture

The subsystem is implemented across both the central SQLite database (`includes/Database/SqliteDatabase.php`) and the tenant split SQLite database (`app/services/database/splitdbmanager.php`).

### 2.1 `applicant_stages` (Split-DB: `ApplicantStage`)
Defines the sequential stages of the recruitment funnel.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` / `ApplicantStageId` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique stage identifier |
| `stage_key` / `StageKey` | TEXT | NOT NULL UNIQUE | Machine slug (`applied`, `screening`, `exam`, `interview`, `offered`, `hired`, `rejected`) |
| `stage_name` / `StageName` | TEXT | NOT NULL | Human-readable label displayed in UI |
| `display_order` / `DisplayOrder` | INTEGER | NOT NULL DEFAULT 0 | Ordering index in Kanban columns |
| `color_code` / `ColorCode` | TEXT | DEFAULT '#3b82f6' | Hex color token for visual tags |
| `created_at` / `CreatedAt` | TEXT | DEFAULT CURRENT_TIMESTAMP | Audit creation timestamp |

### 2.2 `applicants` (Split-DB: `Applicant`)
Stores candidate metadata and their current position in the recruitment funnel.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` / `ApplicantId` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique candidate identifier |
| `candidate_name` / `CandidateName` | TEXT | NOT NULL | Candidate full name |
| `candidate_email` / `CandidateEmail` | TEXT | NOT NULL | Candidate primary email address |
| `phone` / `Phone` | TEXT | DEFAULT '' | International phone number |
| `current_stage_key` / `CurrentStageKey` | TEXT | NOT NULL DEFAULT 'applied' | Reference to active recruitment stage |
| `form_id` / `FormId` | INTEGER | DEFAULT 0 | Associated assessment form ID |
| `submission_id` / `FormSubmissionId` | INTEGER | DEFAULT 0 | Associated form submission ID |
| `score` / `Score` | REAL | DEFAULT 0 | Cumulative assessment score percentage |
| `rating` / `Rating` | INTEGER | DEFAULT 0 | Evaluator star rating (1 to 5) |
| `notes` / `Notes` | TEXT | DEFAULT '' | Interviewer evaluation notes |
| `created_at` / `CreatedAt` | TEXT | DEFAULT CURRENT_TIMESTAMP | Initial enrollment timestamp |
| `updated_at` / `UpdatedAt` | TEXT | DEFAULT CURRENT_TIMESTAMP | Last stage transition timestamp |

### 2.3 `applicant_transitions` (Split-DB: `ApplicantTransition`)
Immutable audit log tracking every movement across recruitment stages.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` / `ApplicantTransitionId` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique transition event ID |
| `applicant_id` / `ApplicantId` | INTEGER | NOT NULL | Foreign key referencing applicant |
| `from_stage_key` / `FromStageKey` | TEXT | NULLABLE | Previous recruitment stage |
| `to_stage_key` / `ToStageKey` | TEXT | NOT NULL | Target recruitment stage |
| `moved_by_user_id` / `MovedByUserId` | INTEGER | DEFAULT 0 | WordPress User ID of evaluator (0 for system/portal) |
| `notes` / `Notes` | TEXT | DEFAULT '' | Transition reason or milestone commentary |
| `created_at` / `CreatedAt` | TEXT | DEFAULT CURRENT_TIMESTAMP | Timestamp of transition execution |

### 2.4 `portal_step_completions` (Split-DB: `PortalStepCompletion`)
Stores individual milestone completions for public self-service sessions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` / `PortalStepCompletionId` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique step record ID |
| `token` / `Token` | TEXT | NOT NULL | Candidate session/invite token |
| `step_id` / `StepId` | TEXT | NOT NULL | Step key (`step_welcome`, `step_nda`, `step_assessment`, etc.) |
| `step_data_json` / `StepDataJson` | TEXT | DEFAULT '{}' | JSON payload submitted by candidate |
| `completed_at` / `CompletedAt` | TEXT | DEFAULT CURRENT_TIMESTAMP | Timestamp of completion |

---

## 3. REST API Contracts

### 3.1 Applicant Pipeline Endpoints (`includes/api/applicantpipelinerestcontroller.php`)

All administrative endpoints require WordPress `manage_options` capability.

- **`GET /wp-exam/v1/applicants`**:
  - Parameters: `stage` (optional string), `search` (optional string).
  - Response: Array of `Applicant` records sorted by `updated_at DESC`.
- **`POST /wp-exam/v1/applicants`**:
  - Body: `{ candidate_name: string, candidate_email: string, phone?: string, stage_key?: string, notes?: string }`.
  - Action: Inserts candidate and logs initial transition in `applicant_transitions`.
- **`GET /wp-exam/v1/applicants/stages`**:
  - Response: Ordered list of all active recruitment stages with color tags.
- **`POST /wp-exam/v1/applicants/stage-transition`**:
  - Body: `{ applicant_id: number, to_stage_key: string, notes?: string }`.
  - Action: Updates `current_stage_key`, logs audit trail in `applicant_transitions`, returns updated candidate record.
- **`POST /wp-exam/v1/applicants/feedback`**:
  - Body: `{ applicant_id: number, rating?: number, notes?: string }`.
  - Action: Updates evaluator rating and notes.
- **`DELETE /wp-exam/v1/applicants/{id}`**:
  - Action: Cascades deletion of applicant and associated transition history.

### 3.2 Candidate Self-Service Portal Endpoints (`includes/api/candidateportalrestcontroller.php`)

Public token-scoped endpoints that authenticate via capability URL.

- **`GET /wp-exam/v1/portal/{token}`**:
  - Action: Resolves candidate profile from token, aggregates completion status for all 5 milestones, and computes progress percentage.
- **`POST /wp-exam/v1/portal/{token}/complete-step`**:
  - Body: `{ step_id: string, step_data?: object }`.
  - Action: Records step completion. When `step_complete` is submitted, advances applicant to evaluation stage in the hiring pipeline.

### 3.3 Standalone Laravel REST Endpoints (`routes/api.php`)

When running under the standalone Laravel backend (`php artisan serve` or standard Laravel):

- **`GET /api/v1/applicants`**: Handled by `App\Http\Controllers\Applicants\ApplicantController@index`.
- **`GET /api/v1/applicants/stages`**: Handled by `App\Http\Controllers\Applicants\ApplicantController@stages`.
- **`POST /api/v1/applicants`**: Handled by `App\Http\Controllers\Applicants\ApplicantController@store`.
- **`POST /api/v1/applicants/stage-transition`**: Handled by `App\Http\Controllers\Applicants\ApplicantController@transitionStage`.
- **`POST /api/v1/applicants/feedback`**: Handled by `App\Http\Controllers\Applicants\ApplicantController@updateFeedback`.
- **`GET /api/v1/portal/{token}`**: Handled by `App\Http\Controllers\Portal\PortalController@show`.
- **`POST /api/v1/portal/{token}/complete-step`**: Handled by `App\Http\Controllers\Portal\PortalController@completeStep`.
- **`POST /api/v1/apply/draft`**: Handled by `App\Http\Controllers\Forms\FormController@saveDraft`.
- **`GET /api/v1/apply/resume/{token}`**: Handled by `App\Http\Controllers\Forms\FormController@resumeDraft`.

---

## 4. UI Architecture & Navigation

1. **Admin Kanban Board**:
   - Location: `src/components/admin/applicant-pipeline-kanban.tsx`.
   - Admin Sidebar Tab: `'pipeline'` under `Candidate Delivery`.
   - Visual Features: Hairline chrome accent, 10-theme support, column count badges, drag/move dropdowns, rating stars, search, and direct "View Candidate Portal" links.
2. **Candidate Portal Runner**:
   - Location: `src/components/portal/candidate-portal-runner.tsx`.
   - Routes: `/portal/:token` and `/portal` in `src/App.tsx`.
   - 5 Verification Milestones:
     1. Profile & Identity confirmation.
     2. Mutual NDA with digital signature.
     3. Interactive timed skills assessment.
     4. Video introduction & work sample submission.
     5. Verification packet stamp with downloadable receipt.

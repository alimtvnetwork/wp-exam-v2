# Quiz & Dynamic Form Engine - Overview

Version: 2.0.0
Updated: 2026-09-18
AI Confidence: Production-Ready
Ambiguity: None

## 1. WordPress Quiz & Form Plugin UI
The WP Exam engine introduces a versatile, modern system integrated into the WordPress admin and public frontend:
- **Admin Management & Builder SPA**: A React-based SPA for creating, configuring, and analyzing both Quizzes and Custom Forms (such as Employee Onboarding / Sign-Up forms, surveys, and applications). Features drag-and-drop field reordering, real-time live preview, sequential step toggling, and comprehensive response review.
- **Frontend Quiz & Form Runner**: An interactive, accessible, and mobile-responsive UI (Tailwind CSS) supporting:
  - **Sequential Mode**: Step-by-step presentation (one question/field at a time) with progress bars, timers, instant feedback, and branching.
  - **Single-Page Form Mode**: Traditional complete form presentation ideal for Employee Sign-Up forms, feedback surveys, and registration.
- **Polymorphic Access Control**:
  - **Authenticated Users**: Auto-binds submissions to WordPress `wp_users.ID`, enforces role permissions, and maintains user completion history.
  - **General Public (Guests)**: Allows non-authenticated visitors to take quizzes or complete sign-up forms, recording guest email, name, IP, and timestamp.

---

## 2. Database Architecture (PascalCase / Guideline Compliant)

Following repository database guidelines (PascalCase table names, `{Table}Id` PK, strict typing):

### Table: `WpExamForm`
Represents a configured quiz or custom dynamic form.
- `FormId` (BIGINT, PK, Auto Increment)
- `Title` (VARCHAR 255, NOT NULL)
- `Description` (TEXT, NULL)
- `FormType` (`WpExamFormType`: `'quiz'`, `'employee_signup'`, `'survey'`, `'general_form'`)
- `FormAccess` (`WpExamFormAccessType`: `'public'`, `'authenticated'`, `'admin_only'`)
- `IsSequential` (BOOLEAN, DEFAULT FALSE)
- `IsPublished` (BOOLEAN, DEFAULT TRUE)
- `SettingsJson` (LONGTEXT, NULL)
- `CreatedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `UpdatedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### Table: `WpExamField`
Represents an individual question or form input field belonging to a form.
- `FieldId` (BIGINT, PK, Auto Increment)
- `FormId` (BIGINT, FK to `WpExamForm.FormId`, NOT NULL)
- `FieldType` (`WpExamFieldType`: `'multiple_choice'`, `'single_choice'`, `'true_false'`, `'short_answer'`, `'paragraph'`, `'email'`, `'phone'`, `'dropdown'`, `'rating'`, `'file_upload'`)
- `FieldLabel` (TEXT, NOT NULL)
- `FieldPlaceholder` (VARCHAR 255, NULL)
- `IsRequired` (BOOLEAN, DEFAULT FALSE)
- `DisplayOrder` (INT, DEFAULT 0)
- `OptionsJson` (LONGTEXT, NULL)
- `ValidationJson` (TEXT, NULL)
- `Points` (INT, DEFAULT 0)
- `CorrectAnswer` (TEXT, NULL)

### Table: `WpExamSubmission`
Represents a completed response from a user or guest.
- `SubmissionId` (BIGINT, PK, Auto Increment)
- `FormId` (BIGINT, FK to `WpExamForm.FormId`, NOT NULL)
- `UserId` (BIGINT, NULL - FK to `wp_users.ID`; NULL for public guest submissions)
- `GuestEmail` (VARCHAR 255, NULL)
- `GuestName` (VARCHAR 255, NULL)
- `UserIp` (VARCHAR 45, NULL)
- `AnswersJson` (LONGTEXT, NOT NULL)
- `Score` (INT, NULL)
- `TotalPossibleScore` (INT, NULL)
- `IsPassed` (BOOLEAN, NULL)
- `SubmittedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

> **Data Mutation Rule:** `WpExamSubmission` records are strictly append-only and immutable.

---

## 3. REST API Endpoints

Mounted under namespace `wp-exam/v1`:

### Public & Respondent Routes
- `GET /wp-json/wp-exam/v1/forms`: List publicly accessible published forms/quizzes.
- `GET /wp-json/wp-exam/v1/forms/{FormId}`: Retrieve form metadata and fields for runner. For quiz types, `CorrectAnswer` is omitted to prevent client-side inspection.
- `POST /wp-json/wp-exam/v1/forms/{FormId}/submit`: Submit completed quiz or form responses. Accepts authenticated or guest payloads. Returns evaluated score and standardized response envelope.

### Admin Management Routes (Requires `manage_options`)
- `GET /wp-json/wp-exam/v1/admin/forms`: List all forms with submission counts.
- `POST /wp-json/wp-exam/v1/admin/forms`: Create new form or quiz.
- `PUT /wp-json/wp-exam/v1/admin/forms/{FormId}`: Update form details, settings, and fields.
- `DELETE /wp-json/wp-exam/v1/admin/forms/{FormId}`: Soft or hard delete form.
- `GET /wp-json/wp-exam/v1/admin/forms/{FormId}/submissions`: View all submissions and user data for export or evaluation.

---

## 4. Coding Guideline Bindings

| Subsystem | Authority File | Binding Requirement |
|-----------|----------------|---------------------|
| Riseup Asia Autoloader | `02-spec/02-coding-guidelines/04-php/01-index.md` | Standalone PSR-4 autoloader without runtime composer dependency. |
| Database Wrappers | `02-spec/04-database-conventions/01-index.md` | `WpDbQueryWrapper` and `TypedQuery` with `DbResult` containers. |
| Universal Envelopes | `02-spec/03-error-manage/01-index.md` | Universal `EnvelopeBuilder` with `Status`, `Attributes`, and `Results`. |
| Boolean Principles | `02-spec/02-coding-guidelines/01-cross-language/02-boolean-principles/01-index.md` | Strict `is*` and `has*` prefixes, positive evaluation only. |
| React UI | `02-spec/02-coding-guidelines/02-typescript/01-index.md` | Strict TypeScript, Tailwind CSS, `@dnd-kit` reordering, immutable state. |

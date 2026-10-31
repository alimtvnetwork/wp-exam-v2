# WordPress Q&A App - WP Exam & Onboarding Quiz

[![Version](https://img.shields.io/badge/version-v0.4.24-blue.svg)](version.json)
[![License: GPL-2.0](https://img.shields.io/badge/License-GPL--2.0-green.svg)](license.txt)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-purple.svg)](wp-exam.php)
[![React](https://img.shields.io/badge/React-18-blue.svg)](package.json)

A modern, versatile Quiz and Dynamic Form engine (Sequential Quizzes, Employee Sign-up forms, Surveys, and Applicant Tracking) built with React 18, TypeScript, and the standard WordPress REST API with a high-performance SQLite Split-DB storage engine.

Project Workspace: [Lovable Project](https://lovable.dev/projects/68b1fc57-2c73-4e9f-b0be-a286097ad543)

---

## Core Features

- **Drag-and-Drop Form & Quiz Builder**: Intuitive visual authoring for single-choice, multiple-choice, rating scales, file uploads, video answers, and conditional branch jumping.
- **Focus Quiz Studio**: Distraction-free 4-stage sequential examination runner with anti-cheat controls, full-screen modes, and optical balance typography.
- **Applicant Recruitment Pipeline & Kanban**: Comprehensive candidate management board (`/admin/pipeline`) supporting customizable recruitment stages, quick stage advancement, interviewer evaluation notes, and star ratings.
- **Candidate Self-Service Verification Portal**: Token-authenticated applicant portal (`/portal/:token`) featuring 5 verification milestones:
  1. Identity & Contact Information Confirmation.
  2. Confidentiality & Mutual NDA Agreement with digital signature.
  3. Interactive Technical Knowledge & Skills Assessment.
  4. Work Sample, Portfolio URL & Video Introduction link submission.
  5. Verification Packet compilation with downloadable confirmation receipt.
- **Hierarchical Curriculum Projects**: Multi-level organizational learning tracks (`categories` -> `projects` -> `sub-projects`).
- **Universal Multi-Theme Engine**: 10 production themes (Riseup Navy/Gold, Dracula Slate, Sweet Digs Luxury, Modern Dark, Violet Glow, etc.) with real-time palette toggling and hairline chrome accents.
- **SQLite Split-DB Storage**: High-throughput SQLite storage architecture utilizing WAL mode, separating global configurations from tenant project databases with automated snapshot backups.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, TanStack Query.
- **Backend (Dual Architecture)**:
  - **Standalone Laravel API**: Eloquent-style Models (`app/models/`), Controllers (`app/http/controllers/`), REST Routes (`routes/api.php`), CLI Console (`artisan`), and standard Migrations (`database/migrations/`).
  - **WordPress Plugin**: WordPress REST API controllers (`includes/api/`), Hooks, and activation scripts (`wp-exam.php`).
- **Database**: SQLite Split-DB architecture (Main `wp-exam.sqlite` + Project sharded databases).
- **Versioning**: Single source of truth managed via `version.json`.

---

## SQLite Database Architecture

| Table | Engine / Scope | Description |
|---|---|---|
| `forms` | Main & Split SQLite | Assessment and quiz definitions with access rules and metadata |
| `form_fields` | Main & Split SQLite | Form questions and interactive inputs |
| `form_options` | Main & Split SQLite | Normalized choice options for dropdowns, radios, and checkboxes |
| `form_submissions` | Main & Split SQLite | Submission audit records, timestamps, IPs, and passing status |
| `form_submission_values` | Main & Split SQLite | Normalized atomic response values per field |
| `form_answers` | Main & Split SQLite | Scored answer values and earned points |
| `applicant_stages` | Main & Split SQLite | Funnel stages (`applied`, `screening`, `exam`, `interview`, etc.) |
| `applicants` | Main & Split SQLite | Candidate profiles, recruitment stage references, scores, and ratings |
| `applicant_transitions` | Main & Split SQLite | Immutable audit trail of every candidate stage transition |
| `portal_step_completions` | Main & Split SQLite | Token-scoped milestone completion records |
| `user_invites` | Main SQLite | Token-authenticated candidate invitation links |
| `categories` & `projects` | Main SQLite | Hierarchical curriculum tracks and learning pathways |

---

## REST API Endpoints

All endpoints are registered under namespace `wp-exam/v1`:

### Applicant Recruitment Pipeline
- `GET /wp-exam/v1/applicants`: Fetch candidate pool with optional `stage` or `search` parameters.
- `POST /wp-exam/v1/applicants`: Enroll new candidate into the recruitment pipeline.
- `GET /wp-exam/v1/applicants/stages`: Retrieve ordered recruitment funnel stages.
- `POST /wp-exam/v1/applicants/stage-transition`: Execute stage transition with audit logging.
- `POST /wp-exam/v1/applicants/feedback`: Update candidate star rating and evaluation notes.
- `DELETE /wp-exam/v1/applicants/{id}`: Cascade deletion of candidate and transition records.

### Candidate Self-Service Portal
- `GET /wp-exam/v1/portal/{token}`: Retrieve portal session, candidate identity, and milestone progression.
- `POST /wp-exam/v1/portal/{token}/complete-step`: Record step verification and advance candidate pipeline stage.

### Forms & Submissions
- `GET /wp-exam/v1/forms`: Retrieve available forms and quizzes.
- `POST /wp-exam/v1/forms`: Create or update form schema.
- `POST /wp-exam/v1/submit`: Submit form answers and calculate score.
- `GET /wp-exam/v1/history`: Retrieve completion history and audit snapshots.

---

## Getting Started

### Local Development Setup

#### 1. Start React Frontend
```bash
bun install
bun run dev
# or: npm install && npm run dev
```

#### 2. Start Standalone Laravel Backend (Optional)
```bash
php artisan serve
# or: npm run serve:backend
```

The React frontend automatically connects to the Laravel API server via Vite proxy (`/api -> http://127.0.0.1:8080`), falls back to `/wp-json/wp-exam/v1/...` when running inside WordPress, or operates in self-contained offline mode.

### Key Application Routes

- `/admin`: WordPress Admin Studio Dashboard.
- `/admin/pipeline`: Applicant Recruitment Kanban Board.
- `/admin/builder`: Drag-and-drop Form & Quiz Builder.
- `/portal/:token`: Candidate Self-Service Verification Portal.
- `/runner`: Direct live assessment runner.
- `/checklist/:token`: Candidate task checklist dashboard.

---

## One-Line Automated Installer

Prefer an automated setup? The installer checks prerequisites (Node 20+, npm; PHP 8.2+), installs dependencies, runs the build, and prepares the workspace.

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.sh | bash
```

**Windows (PowerShell):**
```powershell
iwr -useb https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.ps1 | iex
```

Flags: `--help`, `--dry-run` (print actions, change nothing), `--skip-build`, `--port <n>` (dev-server port for the next-steps output, default 5174).

---

## Specification & Standards Traceability

All specifications adhere to the repository architecture defined in `02-spec/`:
- `02-spec/21-app/81-recruitment-pipeline-and-candidate-portal.md`: Specification for Applicant Tracking & Candidate Portal.
- `02-spec/05-split-db-architecture/`: Split SQLite Database Architecture.
- `02-spec/02-coding-guidelines/`: Strict Boolean conventions and implicit condition evaluation.
- `version.json`: Canonical repository version manifest.

## What's Next

The project scaffold is ready. The next details to add are:

- Exam / quiz name
- Core features and question types
- WordPress integration details
- Data source for questions and answers

## Memory

- .ai-memory/memory/readme.md
- .ai-memory/memory/learned/01-recent-session-2026-10-29.md
- .ai-memory/plans/readme.md

# Plan 20: Hierarchical Project/Exam Architecture, Multi-Theme Focus UI, Split SQLite DBs, Remote Uploader, and Local Runners (Completed)

> **Task ID:** 20-project-hierarchy-themes-and-remote-sync  
> **Status:** COMPLETED  
> **Initial Budget:** N = 500 Steps  
> **Execution Summary:** Completed in 1 continuous self-loop across Phase 1 (Planning & Spec Generation) and Phase 2 (Parallel Implementation & E2E Verification). Zero test/linter failures.  

---

## 1. Task Origin & Start Context

The user requested a full architectural evolution of the WP Exam application:
1. Local test execution runners (`run.ps1` and `run.sh`) to spin up the local environment and launch the browser for rapid local testing.
2. Remote server uploader mechanism conforming to the `riseup-asia-uploader` REST upload protocol to package and deploy standalone plugins (`wp-exam`, `wp-sam`) to remote WordPress hosts.
3. Hierarchical curriculum architecture: Categories containing Projects, Projects containing recursive Sub-Projects and Sections, with ordered execution pipelines (e.g. Project A -> Project C -> Project D -> Project B) and role-scoped permissions.
4. Step-by-step learning flows: Reading documentation, embedded video lectures, practical verification checklists, and click telemetry.
5. Modern focus-mode quiz runner inspired by Letterly (single item focus, bold highlight keywords, subtitle instructions, large pill cards with icons/emojis, 1-col and 2-col layouts, sticky bottom button, hero transition screens).
6. Expanded question types: Single-choice MCQ, Multi-select checkboxes, Free text paragraph, Mindmap/Workflowy/XMind link submission with URL verification, File upload (PDF, Doc), and question hints.
7. Question feedback and bug reporting modal with email notification and admin logs.
8. Anti-cheat scoring: Wrong answers marked at final completion with "You have done the wrong answer" without revealing correct answers, prompting re-takes.
9. Multi-theme catalog:
   - `letterly`: Deep navy `#0F0E1E`, vivid violet `#5C45FD`, amber highlights `#FBBF24`.
   - `bright-gold`: Rise Up Asia brand signature amber `#FFAD01`, black `#0A0A14`, cream `#FFF1D6` (from `D:\work\global-ppt\src\themes\presets.ts`).
   - `dark`: Obsidian slate `#090D16`, sky blue `#38BDF8`.
   - `white`: Clean paper light `#F8FAFC`.
   - Injectable custom themes via JSON configuration.
10. Split SQLite database architecture:
    - Each project maintains an isolated SQLite database (`data/projects/{id}.sqlite`).
    - Versioned audit history database (`data/history/{id}_history.sqlite`) tracking all modifications with 1-click revert.
11. Full package export/import, rotating backups (daily, weekly, monthly) saved locally and dispatched via email.
12. AI Instruction Studio: Prompt templates and JSON schemas enabling external LLMs (ChatGPT, Claude, Gemini) to generate valid curriculum and exams from documents or screenshots.

---

## 2. Consolidated Subtasks Ledger

### Subtask 01: Local Test Runners and Remote Uploader
- Created `run.ps1` (PowerShell) and `run.sh` (POSIX Bash) for one-click environment startup, theme compilation, Vite server launch, and browser opening.
- Created `scripts/package-plugin.ps1` to produce clean zip archives in `dist/wp-exam.zip` (49.6 KB) and `dist/wp-sam.zip` (50.31 KB).
- Created `scripts/uploader.php` client deploying zip packages to remote WordPress instances via `riseup-asia-uploader` endpoints.

### Subtask 02: Split SQLite DB and Versioned History Subsystem
- Extended `includes/Database/SqliteDatabase.php` with `getProjectDatabase(string $projectId)` routing requests to `wp-exam/projects/{id}.sqlite` with WAL mode and foreign keys.
- Implemented `includes/Database/ProjectHistoryDatabase.php` managing `wp-exam/history/{id}_history.sqlite` with `recordSnapshot()`, `getRevisions()`, and `revertToRevision()`.

### Subtask 03: Hierarchical Project & Category Store
- Implemented `includes/Api/ProjectHierarchyRestController.php` providing `/categories`, `/projects`, `/projects/{id}/history`, `/projects/{id}/revert`, and `/reports`.
- Built `src/components/admin/project-hierarchy-manager.tsx` supporting visual category/project tree management, pipeline ordering, permission assignment, split DB monitoring, and revision rollbacks.

### Subtask 04: Themes Engine and Focus-Mode Quiz Runner
- Implemented `src/themes/theme-definitions.ts` defining Letterly, Rise Up Asia (bright-gold), Obsidian Slate, and Clean Paper Light presets with dynamic CSS variable injection.
- Built `src/components/runner/FocusQuizRunner.tsx` with hero intro cards, bold highlighted typography, 1-col/2-col pill options, media embeds, question hints, bug reporting modal, sticky bottom action button, and anti-cheat grading.

### Subtask 05: AI Instruction Studio & Rotating Backups
- Implemented `includes/Api/AIInstructionRestController.php` and `includes/Api/SystemBackupRestController.php`.
- Built `src/components/admin/ai-instruction-studio.tsx` with prompt templates and live JSON validator.
- Built `src/components/admin/backup-manager.tsx` with full zip archiving, retention rotation policies, and email relay.
- Updated `src/pages/Index.tsx` integrating all new modules into the top navigation.

---

## 3. Verification & Compliance Matrix

| Check | Tool / Engine | Result |
| :--- | :--- | :--- |
| **Playwright E2E Tests** | `npx playwright test` | **9 passed** across 6 spec files (5.1s) |
| **PHP Unit Tests** | `php tests/run-tests.php` | **11 passed**, 0 failed (0.005s) |
| **Plugin WP-Exam Tests** | `php wp-plugins/wp-exam/tests/run-tests.php` | **11 passed**, 0 failed (0.082s) |
| **Plugin WP-Sam Tests** | `php wp-plugins/wp-sam/tests/run-tests.php` | **11 passed**, 0 failed (0.034s) |
| **Vitest Unit Tests** | `npm run test:unit` | **5 passed**, 0 failed (841ms) |
| **ESLint Quality Check** | `npm run lint` | **0 errors** |
| **Less Compilation** | `npm run build:less` | **Clean compilation** |
| **Production Build** | `npm run build` | **Built in 2.53s** (dist/assets/index.js) |
| **Distribution Packages** | `pwsh -File scripts/package-plugin.ps1` | `wp-exam.zip`, `wp-sam.zip` packaged |

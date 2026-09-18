# 15. WP Exam Onboarding & Codebase Ingestion

> **Learned Record:** Repository Identity, Architecture, Git History, and Quiz Feature Specs
> **Date:** 2026-09-18
> **Status:** Active

## 1. Project Context & Ingestion Summary
- **Repository:** alimtvnetwork/wp-exam-v2
- **Application Deliverable:** WordPress Quiz & Exam Plugin (wp-exam.php, includes/, src/quiz/) paired with React SPA builder (src/, Vite, TanStack Query, Tailwind CSS, shadcn/ui).
- **Core Architecture:**
  - Plugin bootstrap in wp-exam.php initializing WP_Exam_REST_API (includes/api/class-wp-exam-rest-api.php) and WP_Exam_Admin (includes/class-wp-exam-admin.php).
  - Schema activation in includes/class-wp-exam-activator.php.
  - Frontend SPA embedded in WP Admin menu via render_admin_page() mounting to #wp-exam-app.
  - Comprehensive specification repository migrated under 02-spec/ (702 canonical spec markdown files).

## 2. Recent Git Commit History (Last 10 Commits)
1. fadaa89: fix(core): real implementation of quiz plugin and spec audit - Added quiz-plugin.php, 02-spec/21-app/04-quiz-feature/00-overview.md, and audit report 02-spec/25-app-spec-audit/01-audit-report.md.
2. c750580: feat(core): migrate AI structure folders and implement quiz feature UI - Migrated .ai-memory/, 01-prompts/, 02-spec/, 03-ai-scripts/, includes/, src/quiz/, wp-exam.php. Deleted old spec/ and .lovable/.
3. 43b7eed: fix: ensure root readme is strictly lowercase readme.md - Auto-renamed README.md to readme.md enforcing strict lowercase convention.
4. 5edc737: feat: setup query wrapper and enforce strict typing - Initialized query-wrapper.ts for centralized error logging and audited typing rules.
5. 67b5535: updated core - Reorganized 423 spec files and consolidated guidelines.
6. 230d1e1: Added project URL to README - Added Lovable project URL.
7. a43c210: Changes - Initial setup docs and local instructions.
8. fb32fbd: gitmap merge-right from wp-exam-v1 - Ingested 816 files from v1 baseline.
9. bdc6319: Created project scaffold - Scaffolded TanStack Start / Vite foundation.
10. f8dd04f: Changes - Added directory .gitkeep markers.

## 3. Database Schema & Domain Model
According to 02-spec/21-app/04-quiz-feature/00-overview.md and 02-spec/04-database-conventions/:
- Quiz (QuizId PK, Title, Description, CreatedAt, UpdatedAt)
- QuizQuestion (QuizQuestionId PK, QuizId FK, QuestionText, QuestionType, DisplayOrder)
- QuizAnswer (QuizAnswerId PK, QuizQuestionId FK, AnswerText, IsCorrect, DisplayOrder)
- QuizResult (QuizResultId PK, QuizId FK, UserId FK, Score, CompletedAt)

## 4. API Endpoints
- GET /wp-json/quiz/v1/quizzes: List quizzes
- GET /wp-json/quiz/v1/quizzes/{QuizId}: Fetch quiz with questions
- POST /wp-json/quiz/v1/quizzes: Create quiz
- PUT /wp-json/quiz/v1/quizzes/{QuizId}: Update quiz
- DELETE /wp-json/quiz/v1/quizzes/{QuizId}: Delete quiz
- POST /wp-json/quiz/v1/quizzes/{QuizId}/submit: Submit completed quiz

## 5. Non-Negotiable CODE RED Rules
1. Never disable CI/CD checks or delete quality gates.
2. Root readme MUST be strictly lowercase readme.md.
3. Never use absolute filesystem paths or file:/// URIs.
4. Booleans MUST use is or has prefixes; total ban on == true or mixed polarity.
5. Zero nested if statements.
6. Functions capped at 15 lines max (8 preferred), React components capped at 100 lines max.
7. String unions banned in TypeScript; use PascalCase Enums ending in Type.
8. Never swallow errors; wrap with context and operation label.

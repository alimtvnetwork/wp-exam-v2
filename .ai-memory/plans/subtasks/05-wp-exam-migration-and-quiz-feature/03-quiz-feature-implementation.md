# Subtasks for 05-wp-exam-migration-and-quiz-feature

## Phase 1: Repository Migration
- [ ] Migrate AI memory folder from `coding-guidelines` to `wp-exam/.ai-memory`.
- [ ] Migrate `02-spec` from `coding-guidelines` into `wp-exam/02-spec`.
- [ ] Update `coding-guidelines.md` and prompts in `wp-exam`.
- [ ] Remove outdated directories (`.lovable`, `spec/`, `AGENTS.md`) from `wp-exam`.

## Phase 2: Codebase and Spec Audit
- [x] Write/Audit the app spec for the Quiz Creation feature in `wp-exam/02-spec/21-app/04-quiz-feature/00-overview.md`.
- [x] Generate initial codebase audit report in `wp-exam/02-spec/25-app-spec-audit/01-audit-report.md`.
- [ ] Perform a deeper component-level audit and update `01-audit-report.md` if necessary.

## Phase 3: Feature Implementation
- [ ] Scaffold WordPress plugin files (e.g. `wp-exam.php`, `includes/api`).
- [ ] Implement quiz database schema and REST API endpoints.
- [ ] Build React frontend shell within WP Admin context.
- [ ] Develop Drag-and-Drop Quiz Editor component.
- [ ] Wire API logic to the React state manager (Zustand/Context).

## Phase 4: Finalization
- [ ] Test blind AI-readiness by having an agent attempt a targeted change based on the spec.
- [ ] Update state reports in `.ai-memory/temp-agents/05-wp-exam-migration-and-quiz-feature/state.md`.

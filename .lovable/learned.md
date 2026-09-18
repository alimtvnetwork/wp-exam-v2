# Learned Memory Summary

- **Memory Files Read**: 69
- **Consolidated Guidelines Read**: 36 (from `02-spec/17-consolidated-guidelines/`)
- **Spec Authoring Files Read**: 17 (from `02-spec/01-spec-authoring-guide/`)
- **Pending Plans**: 4 (`02-slides-system-overhaul`, `04-guideline-prompt-and-installer-upgrade`, `09-update-prompts-and-release`, `11-code-red-refactor-remediation`)
- **Open Ambiguities**: 2 (`01-pluggable-logger-backend-and-uber-zap-migration`, `02-root-version-json-missing`)
- **Resolved Ambiguities**: 0
- **CI/CD Issues Absorbed**: 0 (1 README catalog)

## Key Conventions & Principles
1. **CODE RED Rules**:
   - Total ban on explicit boolean `true` checks (`if isReady == true` forbidden; must use `if isReady`).
   - Single polarity conditionals (never mix positive and negative boolean checks in one condition).
   - Never disable CI/CD, GitHub Actions, or verification workflows.
   - Total ban on absolute filesystem paths or literal `file:///` URIs.
   - Go functions must return `*appfault.AppError` or `Result[T]` (no bare void/unhandled errors).
2. **Naming Conventions**:
   - Strictly lowercase filenames (`readme.md`, `*.py`, `*.ts`, `*.md`).
   - PascalCase for database tables (singular) and enum variants.
   - `{Table}Id` for primary keys.
   - camelCase for columns and API fields.
   - Boolean prefixes: `is*` and `has*` only.
   - Go interfaces must end with `-er`.
   - PHP enums must end with `Type`.
3. **Error Handling Philosophy**:
   - Never swallow errors; wrap failures preserving cause via `*appfault.AppError` / typed wrappers and return standard Universal Response Envelopes (`Status`, `Attributes`, `Results`, `Errors`).
4. **Active DB Schemas & Contracts**:
   - WordPress MySQL relational tables (`{$wpdb->prefix}quiz` / `WpExamForm`, `quiz_question` / `WpExamField`, `quiz_answer`, `quiz_result` / `WpExamSubmission` with immutable append-only constraints).
   - Isolated Split SQLite databases (`wp-exam/projects/{id}.sqlite`, `wp-exam/history/{id}_history.sqlite`, and `wp-exam/database.sqlite`).

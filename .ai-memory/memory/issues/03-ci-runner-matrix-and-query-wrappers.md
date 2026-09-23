# RCA: CI/CD Runner Matrix Mismatch & Universal Query Wrapper Pattern

> **Target File:** `.ai-memory/memory/issues/03-ci-runner-matrix-and-query-wrappers.md`  
> **Status:** ACTIVE  
> **Category:** CI/CD & Database Reliability  
> **Traceability:** Rule AC-AI-001 / Bounded Single-Step Self-Loop

---

## 1. Why it happened

During previous repository synchronization from a meta-repository (`coding-guidelines-v24`), `03-ai-scripts/02-shared-engine.py` was imported with a static `CI_JOBS_MATRIX` configured for an external Go/Node codebase (referencing nonexistent scripts in `04-code/golang`, `linters-cicd/`, and `linter-scripts/check-tunable-constants.py`). Consequently, when running `python 03-ai-scripts/06-cicd-local-runner.py`, 29 out of 36 jobs failed with `[Errno 2] No such file or directory` or missing module errors.

Additionally, database operations across the repository lacked a universal query wrapper that encapsulates execution, automatically logs failures to eliminate boilerplate duplication, and explicitly returns structured success/failure state indicators (`isSuccess`, `isFail`).

---

## 2. How it happened

1. **Matrix Drift:** The central dictionary `CI_JOBS_MATRIX` in `03-ai-scripts/02-shared-engine.py` contained hardcoded job commands tailored for a foreign project rather than dynamically matching `wp-exam` (PHP, WordPress, Python, React/TS).
2. **Missing GitHub Workflow:** No `.github/workflows/ci.yml` existed in the repository to establish the canonical ground truth for automated gates.
3. **Broken Relative Links in Documentation:** `21-sequence-integrity-linter.py` failed because `.ai-memory/plans/01-index.md` referenced historical folders (`05-changes-history/...`) and external scripts (`scripts/sync-guidelines.mjs`) from the donor repo.
4. **Unhandled Query Error Logging:** PHP SQLite and WPDB queries were calling `PDO` or `$wpdb` directly or using partial handlers that returned loose booleans (`false`) without structured `isSuccess` / `isFail` result envelopes or automated file logging.

---

## 3. Root Cause

1. **Central Matrix Drift:** `03-ai-scripts/02-shared-engine.py:242` defined 36 jobs, over half of which pointed to paths that do not exist in `wp-exam`.
2. **Absence of Standard Query Result Pattern:** No polyglot query result contract existed for PHP, Python, and TypeScript returning uniform `{ isSuccess: bool, isFail: bool, data: Any, error: Optional[str] }` containers.
3. **Stale Index Pointers:** `.ai-memory/plans/01-index.md` lines 71-90 retained broken links to non-existent transaction logs.

---

## 4. Code Fix

1. **Calibrate `CI_JOBS_MATRIX` in `03-ai-scripts/02-shared-engine.py`:**
   Configure the matrix to execute all legitimate quality gates and test suites native to `wp-exam`:
   - PHP Unit & Feature Tests (`php tests/run-tests.php`)
   - Python E2E Integration Suite (`python scripts/e2e-integration-tester.py`)
   - Fast File Scanner (`python 03-ai-scripts/11-fast-file-scanner.py --check`)
   - File Size Guard (`python 03-ai-scripts/13-file-size-guard.py`)
   - Version Sync Check (`python 03-ai-scripts/14-version-sync-checker.py`)
   - Sequence & Title Check (`python 03-ai-scripts/15-sequence-and-title-auditor.py`)
   - Sequence Integrity Linter (`python 03-ai-scripts/21-sequence-integrity-linter.py`)
   - Misspell Auditor (`python 03-ai-scripts/27-misspell-auditor.py`)
   - Boolean Naming Auditor (`python 03-ai-scripts/08-naming-autofixer.py`)
   - Markdown Gap Check (`python 03-ai-scripts/31-md-gap-fixer.py`)
   - Guideline Linter (`python linter-scripts/validate-guidelines.py`)
   - Codebase Topology Discovery (`python 03-ai-scripts/18-codebase-topology-discoverer.py --summary`)

2. **Implement Universal Query Wrappers:**
   - **PHP:** `includes/Database/QueryResult.php` and `includes/Database/SqlQueryWrapper.php` with `is_success`, `is_fail`, `data`, and automated `FileLogger` dispatch.
   - **Python:** `scripts/db_query_wrapper.py` with `@dataclass class QueryResult` and safe executor.
   - **TypeScript:** `src/utils/query-wrapper.ts` with `interface QueryResult<T>` and safe executor.

3. **Remediate Broken Links & Gaps:**
   - Sanitize `.ai-memory/plans/01-index.md` to reference existing completed plans.
   - Run `31-md-gap-fixer.py --fix` to normalize whitespace across markdown specs.
   - Create `.github/workflows/ci.yml` adhering strictly to zero-storage guidelines.

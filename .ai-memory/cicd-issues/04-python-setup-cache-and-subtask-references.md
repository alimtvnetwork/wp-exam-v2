# RCA: Python Setup Cache Failure & Subtask Spec Reference Paths

> **Target File:** `.ai-memory/cicd-issues/04-python-setup-cache-and-subtask-references.md`  
> **Status:** RESOLVED  
> **Category:** CI/CD & Pipeline Diagnostics  
> **Traceability:** Rule AC-AI-001 / GitMap PE Diagnostic Protocol

---

## 1. Symptoms & Error Signature

Running `gitmap pe` reported a failure in the remote GitHub Actions pipeline (`CI/CD Pipeline #36059206902`):

```text
Job: Quality Gates & Test Execution | Step: Set up Python 3.12
Error: No file in /home/runner/work/wp-exam-v2/wp-exam-v2 matched to [**/requirements.txt or **/pyproject.toml], make sure you have checked out the target repository
```

Additionally, running the local CI runner (`python 03-ai-scripts/06-cicd-local-runner.py --all`) detected 5 broken sequential references during the `Sequence Integrity Check`:

```text
[FAIL] .ai-memory/plans/subtasks/46-live-url-preview-and-branching-ux/01-routing-and-live-preview-fixes.md (1 broken reference(s)):
  Line 3: '../../../02-spec/21-app/46-live-url-preview-and-branching-ux/02-routing-and-live-preview-contracts.md' -> not found in repository
```

---

## 2. How and Why It Happened

1. **Missing Manifest with `cache: 'pip'` in Actions:** In `.github/workflows/ci.yml`, the step `Set up Python 3.12` was configured with `cache: 'pip'`. GitHub's `actions/setup-python@v5` action strictly requires a dependency lockfile (`requirements.txt`, `pyproject.toml`, or `Pipfile.lock`) when pip caching is enabled. Because the repository's automation scripts in `03-ai-scripts/` rely solely on the Python 3.12 standard library, no `requirements.txt` existed, causing `setup-python@v5` to abort with a fatal exit code.
2. **Directory Traversal Depth Discrepancy:** In `.ai-memory/plans/subtasks/46-live-url-preview-and-branching-ux/`, subtask spec links were written as `../../../02-spec/...` (3 levels up) instead of repository-root relative paths (`02-spec/...`). From `subtasks/46-.../`, 3 levels up resolved to `.ai-memory/02-spec/...` rather than the repository root.

---

## 3. Root Cause Analysis

1. **Remote CI Action Parameterization:** `actions/setup-python@v5` had `cache: 'pip'` enabled without a corresponding dependency manifest file in repository root.
2. **Relative Path Resolution Standard:** Subtask templates used relative parent directory traversals (`../../../`) instead of root-relative paths required by AGENTS.md Rule 5 and verified by `03-ai-scripts/21-sequence-integrity-linter.py`.

---

## 4. Applied Solution & Prevention Invariant

1. **Workflow Action Calibration:**
   - Removed `cache: 'pip'` from `.github/workflows/ci.yml` under `Set up Python 3.12` since all runner scripts use standard library modules.
   - Created a root `requirements.txt` manifest explaining dependency architecture to satisfy external tools and linters.
2. **Path Reference Normalization:**
   - Updated all 5 subtask files in `.ai-memory/plans/subtasks/46-live-url-preview-and-branching-ux/` to use root-relative markdown links (`[02-spec/...](02-spec/...)`).
3. **Verification:**
   - `python 03-ai-scripts/06-cicd-local-runner.py --all` passed all 11/11 quality gates (Sequence Integrity, Markdown Gaps, PHP tests, Python E2E suites).
   - `php artisan test` passed 51/51 tests.
   - `npx vitest run` passed 34/34 tests.
   - `npm run lint` reported 0 errors.

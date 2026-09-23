---
name: temp-end-to-end-tests
description: Autonomously design, implement, and execute temporary end-to-end integration tests combining complete subsystem flows locally, strictly isolating them with skip-by-default tags and environment guards so they NEVER execute in automated CI/CD pipelines or standard local test suites.
---

# Temporary End-to-End Tests & Isolated On-Demand Validation

Autonomously design, implement, and execute temporary end-to-end integration tests combining complete subsystem flows locally, strictly isolating them with skip-by-default tags and environment guards so they NEVER execute in automated CI/CD pipelines or standard local test suites.

## Core Directives

1. **Zero-CI Quarantine Standard (TOTAL BAN on Running in CI/CD):**
   - Temporary E2E tests MUST NEVER execute in GitHub Actions workflows (`.github/workflows/*.yml`), automated pull request checks, or deployment pipelines.
   - CI/CD runners must stay lightweight, ultra-fast (<2 minutes), and strictly zero-storage.

2. **Skip-by-Default Everywhere:**
   - Standard test runs (`go test ./...`, `pytest`, `npm test`, or `06-cicd-local-runner.py`) MUST skip temporary E2E tests automatically when run without explicit opt-in flags.

3. **Polyglot Isolation Standard:**
   - **Go:** `//go:build tempe2e` and `if os.Getenv("RUN_TEMP_E2E") != "1" { t.Skip(...) }`
   - **Python:** `@pytest.mark.temp_e2e` and `if os.getenv("RUN_TEMP_E2E") != "1": pytest.skip(...)`
   - **TypeScript / Vitest:** Pattern `*.tempe2e.test.ts` and `describe.skipIf(process.env.RUN_TEMP_E2E !== '1')`
   - **PHP:** `@group temp_e2e` docblock annotation, excluded in `phpunit.xml` default testsuite.

4. **On-Demand Local Execution Command Protocol:**
   - Python: `RUN_TEMP_E2E=1 pytest -v -m temp_e2e tests/tempe2e/test_*.py`
   - TypeScript: `RUN_TEMP_E2E=1 npx vitest run tests/tempe2e/*.tempe2e.test.ts`

5. **Local Teardown & Hygiene:**
   - Clean up temporary SQLite databases, sockets, port listeners, and scratch files upon completion.

---
name: wp-exam-e2e-testing
description: End-to-End and integration testing guidelines for WP Exam, covering the 43-suite Python E2E integration runner, Playwright browser tests, and verification workflows.
---

# WP Exam: Comprehensive E2E & Integration Testing

This skill guides the execution, authoring, and verification of automated tests across the WP Exam polyglot stack (Python, TypeScript/Playwright, Vitest, PHPUnit).

## 1. Test Architecture Overview

The repository enforces multi-layered verification:

1. **Comprehensive Python E2E Integration Runner (`scripts/e2e-integration-tester.py`)**:
   - 43 standalone test suites validating all subsystem contracts in sub-second execution without external server dependencies.
   - Run command: `python scripts/e2e-integration-tester.py`
   - Validates:
     - Suite 1: Top-notch JWT / Bearer authentication & privilege escalation defense.
     - Suite 2: SQL injection neutralization & parameterized query verification.
     - Suite 3: Split SQLite database isolation & transaction rollbacks.
     - Suite 4: JSON curriculum import/export & conditional branching schema integrity.
     - Suite 5: Rich media URL parsing & live client-side validation rules.
     - Suite 6: WordPress Elementor widget structure & output contract.
     - Suite 7: Multi-project hierarchy & recursive sub-project tree resolution.
     - Suite 8: Multi-theme tokens & Rise Up Asia color palette.
     - Suite 9: REST API route registration contracts.
     - Suite 10: Candidate telemetry & anonymity verification.
     - Suite 11: Question reporting & bug triage workflow.
     - Suite 12: Backup & archive zip generation & retention logic.
     - Suite 13: Email notification routing & cadence dispatch strategy.
     - Suite 14: Execution pipeline sequencing & prerequisite gating.
     - Suite 15: Diverse question submission & external verification handlers.
     - Suite 16: Project revision history & 1-click rollback state machine.
     - Suite 17: Public analytics dashboard & high-failure alert aggregator.
     - Suite 18: Social media OpenGraph & Twitter Card SEO meta generator.
     - Suite 19: Question hints & contextual resource linking.
     - Suite 20: Dynamic JSON theme injection & asset compilation.
     - Suite 21: AI Instruction Studio theme & UI modification prompts.
     - Suite 22: Multi-tier hierarchy permission scopes & inheritance.
     - Suite 23: Complex form multi-field instant live validation matrix.
     - Suite 24: AI Instruction Studio full curriculum generation & synthesis.
     - Suite 25: Project & question progress calculation & sub-project transition.
     - Suite 26: End-of-day & end-of-week batch email notification digest queue.
     - Suite 27: Automated split DB backup email transmission & storage dual-dispatch.
     - Suite 28: Social share URL attribution & UTM parameter tracking.
     - Suite 29: Question & option deterministic randomization & seeded shuffle.
     - Suite 30: Pipeline sequencing topological validation & cycle detection.
     - Suite 31: Candidate quiz retake & attempt boundary limits.
     - Suite 32: Multi-language / i18n localization & RTL layout tokens.
     - Suite 33: Mind map & hierarchical concept node schema verification.
     - Suite 34: Offline storage & local sync engine.
     - Suite 35: Weighted scoring & grading threshold engine.
     - Suite 36: Elementor shortcode dynamic parameter extraction & sanitization.
     - Suite 37: Real-time exam countdown timer & auto-submission engine.
     - Suite 38: Candidate certificate generation & verification digest.
     - Suite 39: Multi-format JSON curriculum migration & adapter.
     - Suite 40: Candidate feedback & post-quiz rating survey pipeline.
     - Suite 41: Media asset pre-flight availability & broken link detection.
     - Suite 42: Admin audit log streaming & security threat event flagging.
     - Suite 43: Full PHP unit test suite execution.

2. **Playwright Browser E2E Tests (`wp-plugins/wp-exam/tests/e2e/`)**:
   - `sequential-quiz.spec.ts`: Step-by-step quiz navigation, answer selection, and submission.
   - `form-builder-dnd.spec.ts`: Drag-and-drop form field reordering with `@dnd-kit`.
   - `employee-signup-form.spec.ts`: Single-page form submission and validation.

3. **Frontend Unit Tests (Vitest)**:
   - `src/test/form-runner.test.ts`: Form state evaluation and client-side validation rules.
   - Run command: `npm run test:unit`

4. **PHP Unit Tests (PHPUnit / CLI)**:
   - `wp-plugins/wp-exam/tests/unit/`: `EnvelopeBuilderTest.php`, `SqliteDatabaseTest.php`, `WpDbQueryWrapperTest.php`.
   - Run command: `npm run test:php` or `php wp-plugins/wp-exam/tests/run-tests.php`

## 2. Strict Testing Guardrails

- **Zero Unprompted Test Execution:** During routine guideline audits and code edits, DO NOT run full test suites unless explicitly commanded by the user or required for release verification.
- **Zero CI Artifact Uploads:** NEVER configure GitHub Actions or test scripts to upload routine build artifacts, trace files, or test videos to Actions storage. Reports MUST render directly to console stdout or `$GITHUB_STEP_SUMMARY`.
- **Mock OS Calls:** Unit tests must NEVER trigger real OS shutdown, reboots, or heavy unmocked network requests (`02-spec/02-coding-guidelines/01-cross-language/08-test-isolation.md`).

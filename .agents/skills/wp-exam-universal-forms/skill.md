---
name: wp-exam-universal-forms
description: Universal Form Engine, Visual Node Tree, and Standalone Laravel 11 Application Architecture with Split SQLite databases, DAG cycle detection, dynamic conditional validation, and WhatsApp verification.
---

# WP Exam & Universal Form Engine

## Overview

The **WP Exam & Universal Form Engine** is architected first as a standalone **Laravel 11.x enterprise application** featuring Split SQLite databases, Directed Acyclic Graph (DAG) cycle detection, dynamic conditional branching, sub-second debounced validation, and international WhatsApp verification. The engine is designed for subsequent packaging as a WordPress plugin.

## Core Architectural Pillars

1. **Standalone Laravel 11 Backend:**
   - Command runner via `artisan` (`php artisan test`, `php artisan route:list`, `php artisan forms:export`).
   - REST API routing registered in `routes/api.php` via `App\Routing\Route`.
   - REST Controller `App\Http\Controllers\Forms\FormController` handling 7 endpoints:
     - `GET /api/v1/forms/{slug}` (Schema & layout)
     - `POST /api/v1/forms/{slug}/validate-field` (Real-time debounced feedback)
     - `POST /api/v1/forms/test-whatsapp` (Deep link generation)
     - `GET /api/v1/forms/countries/cache` (Cached countries with IP detection)
     - `POST /api/v1/forms/{slug}/draft` (Draft save with magic-link token)
     - `GET /api/v1/forms/draft/{token}` (Draft resumption)
     - `POST /api/v1/forms/{slug}/submit` (Authoritative submission with dynamic conditional engine)

2. **Visual Project Node Canvas:**
   - Visual drag-and-drop sequencing between curriculum projects and sub-projects (`src/components/forms/visual-node-canvas.tsx`).
   - Automated DAG topological cycle detection via `App\Services\Forms\CycleDetector` preventing circular dependencies.

3. **Dynamic 4-Step Form Wizard Runner:**
   - Reference application modeled after `careers.developers-organism.com/apply/?job=Intern+Programmer` (`src/components/forms/wizard-runner.tsx`).
   - **Step 1:** Personal details, pre-cached country selector with flag icons, dial prefix formatting, and interactive WhatsApp ping link (`https://wa.me/+...`).
   - **Step 2:** Experience & conditional branching: selecting "Open to Work" dynamically triggers required fields with smooth accordion disclosure.
   - **Step 3:** Technical screening, video briefing embed, rich MCQ selectors (image/SVG/voice), and mandatory FAQ acknowledgment gating.
   - **Step 4:** Review summary, draft persistence, and authoritative submission.

4. **Split SQLite Database Engine:**
   - `root.db`: Global users, tenant routing, and system configurations.
   - `project_<id>.db`: Isolated per-project relational database running in WAL mode with foreign key pragmas enforced.
   - `logs.db`: Security audit logs and high-failure event stream.

5. **Authoritative Conditional Validation (`SubmitFormRequest`):**
   - Dynamic server-side validation recalculates requiredness based on active payload state. Hidden or skipped conditional fields are automatically bypassed from required rules.

6. **Draft Mode & Resumption:**
   - One-click draft persistence issuing 32-character cryptographic resumption tokens (`/apply/resume/{token}`).

7. **Multi-Theme Tokens & Lossless JSON Engine:**
   - 4-theme token switcher (Riseup Asia, Dracula, VS Code, Microsoft Blue).
   - Lossless JSON import/export via `App\Services\Forms\FormJsonService` and standalone LLM Instruction Studio.

## Verification & Testing Standards

- **Laravel Test Runner:** `php artisan test` runs all PHPUnit feature and unit tests with 100% pass rate.
- **Standalone PHP Runner:** `php tests/run-tests.php` runs unit and feature test suites without external dependencies.
- **Python E2E Orchestrator:** `python scripts/e2e-integration-tester.py` verifies all 43 suites across the polyglot stack.

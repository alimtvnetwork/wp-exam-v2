# Plan 57: Universal Form Engine, Visual Project Tree, and Laravel Application Architecture

> **Status:** Pending  
> **Slug:** `57-forms-spec-and-laravel-architecture`  
> **Target Release:** v6.42.0  
> **Stack:** Laravel 11.x Backend (First-Class), Split SQLite Multi-Database Engine, React/Vue Visual Node Canvas, WordPress Plugin Target (Subsequent Packaging)

---

## 1. Intent & Executive Scope

Build and document the complete architectural specification and execution roadmap for the **WP Exam & Universal Form Engine**. The engine is developed **first as a standalone, production-ready Laravel 11 application** (featuring project hierarchy management, automated backups, JSON export/import, and an interactive drag-and-drop visual project node tree), designed for subsequent packaging as a WordPress plugin.

The application models its candidate application flow on real-world reference forms (`https://careers.developers-organism.com/apply/?job=Intern+Programmer`) and provides:
1. Dynamic conditional form branching with sub-second debounced client validation.
2. Split SQLite database architecture (`root.db`, `project_<id>.db`, `logs.db`).
3. Visual project node tree drag-and-drop canvas with cycle detection.
4. Rich multi-media question and answer assessments (video, voice, image, SVG, sliders).
5. Automated prefix formatters (WhatsApp URL builder `https://wa.me/+...` with interactive ping test).
6. Multi-stage applicant pipelines with AGM markdown email notifications.
7. External cloud sync (Google Drive & Excel) and pluggable payment gateways (Wise & Stripe).

---

## 2. Execution Task Breakdown

### Task 01: Modular Specifications Authoring (`02-spec/21-app/21f-forms-spec/`)
- [x] `01-overview.md`: Executive summary, core pillars, Mermaid system topology, and feature inventory.
- [x] `02-data-contracts.md`: Eloquent models, dynamic validation matrix, JSON schemas, and REST route contracts.
- [x] `03-visual-and-ux.md`: Visual node tree canvas, multi-step wizard, dynamic branching transitions, and theme token engine.
- [x] `04-verification-gates.md`: Acceptance criteria, debounced timing checks, security gates, and quality verification matrix.
- [x] Register specifications in `02-spec/21-app/01-index.md`.

### Task 02: Split SQLite Database Schema (`02-spec/23-app-db/`)
- [x] `02-forms-and-project-tree-schema.md`: Complete DDL, indexes, and Mermaid ER diagrams for `root.db`, `project_<id>.db`, and `logs.db`.
- [x] Register database specification in `02-spec/23-app-db/01-index.md`.

### Task 03: Asset Ingestion & Live Reference Scraping
- [x] Ingest screenshots into `assets/screenshots/` (`form-reference-upload-01.png`, `02.png`, `03.png`, `job-form.png`, `job-form-v2.png`).
- [x] Scrape and parse live form fields from `https://careers.developers-organism.com/apply/?job=Intern+Programmer` via `scratch/parse_form.py`.

### Task 04: Ambiguity Resolution Documentation
- [x] Document payment gateway trade-offs and Riseup Asia theme tokens in `.ai-memory/ambiguous-questions/01-new-ambiguity/03-wise-stripe-and-theme-tokens.md`.

### Task 05: Laravel 11 Application Scaffolding & Dynamic Validation Engine
- [ ] Scaffold Laravel 11 project structure with split SQLite multi-database connections.
- [ ] Implement Eloquent models: `Form`, `FormSection`, `FormField`, `FieldCondition`, `FormSubmission`, `Draft`.
- [ ] Implement `ConditionalEngine` service resolving dynamic requiredness and branch visibility.
- [ ] Implement `SubmitFormRequest` with dynamic conditional rule generation.
- [ ] Implement static country dictionary cache with IP geolocation detection.
- [ ] Implement draft saving and one-click magic link resumption (`/apply/resume/{token}`).

### Task 06: Visual Node Canvas & Multi-Step Wizard Frontend
- [ ] Implement drag-and-drop Visual Project Node Canvas with connection anchors and Tarjan cycle detection.
- [ ] Implement multi-step wizard runner with animated step tickers and progress bar.
- [ ] Implement debounced client validation (300ms–500ms) with in-place error badges.
- [ ] Implement WhatsApp international number formatter with interactive ping test verification.
- [ ] Implement rich MCQ option cards (video prompts, audio waveforms, SVG icons).
- [ ] Implement JSON theme token engine with 6 built-in presets.

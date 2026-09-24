# App

> **/goal** Master and enforce the architectural standards, specifications, and CI/CD validation rules for 21 App.
> **/learn** Read the sequentially ordered specification files in this directory, follow the actionable CI/CD checklist, and apply mandatory rules before generating code.

## 🎯 Actionable CI/CD & Agent Checklist

- [ ] `/goal` Read and understand all numbered specifications under `21-app/`.
- [ ] `/learn` Adhere strictly to `.ai-memory/folder-structure.md` and `.ai-memory/strictly-avoid.md`.
- [ ] `/goal` Verify zero explicit `true` boolean evaluations and no mixed-polarity conditionals.
- [ ] `/learn` Run all local verification linters via `python 03-ai-scripts/06-cicd-local-runner.py`.

. **CRITICAL AI INSTRUCTION:** This `01-index.md` file is the primary entry point for this directory. AI agents MUST read this file first before exploring other files in this folder.

**Version:** 3.3.0
**Updated:** 2026-09-18
**AI Confidence:** Production-Ready
**Ambiguity:** None

---

## Overview

App-specific specification content for the WP Exam plugin. This engine provides a modern, versatile system for both Quizzes (standard & sequential) and dynamic Custom Forms (e.g. Employee Sign-Up forms, onboarding workflows, and public surveys) integrated with the WordPress REST API and React UI.

---

## Document Inventory

| # | File | Purpose | Status |
|---|------|---------|--------|
| 04 | [04-quiz-feature/00-overview.md](./04-quiz-feature/00-overview.md) | Dynamic Quiz & Form Engine Architecture, Schemas & Access Controls | Complete |
| 04 | [04-quiz-feature/01-file-topology.md](./04-quiz-feature/01-file-topology.md) | PSR-4 Backend & React SPA File Topology | Complete |
| 04 | [04-quiz-feature/02-rest-api-contracts.md](./04-quiz-feature/02-rest-api-contracts.md) | REST API Request/Response Schemas, Envelopes & Submission Contracts | Complete |
| 04 | [04-quiz-feature/03-test-specifications.md](./04-quiz-feature/03-test-specifications.md) | Playwright E2E and PHPUnit Integration Test Specifications | Complete |
| 05 | [05-hierarchical-learning-and-exam-system/00-verbatim-and-overview.md](./05-hierarchical-learning-and-exam-system/00-verbatim-and-overview.md) | Verbatim User Request, Overview & Focus UI References | Complete |
| 05 | [05-hierarchical-learning-and-exam-system/01-architecture-and-runners.md](./05-hierarchical-learning-and-exam-system/01-architecture-and-runners.md) | Local Test Runners & Remote Deployment Uploader Protocol | Complete |
| 05 | [05-hierarchical-learning-and-exam-system/02-hierarchical-curriculum-engine.md](./05-hierarchical-learning-and-exam-system/02-hierarchical-curriculum-engine.md) | Categories, Recursive Sub-Projects, Pipelines & JSON Import/Export | Complete |
| 05 | [05-hierarchical-learning-and-exam-system/03-learning-stages-and-verification.md](./05-hierarchical-learning-and-exam-system/03-learning-stages-and-verification.md) | 4-Stage Learning State Machine, Docs, Checklists & Anti-Cheat | Complete |
| 05 | [05-hierarchical-learning-and-exam-system/04-split-db-and-audit-history.md](./05-hierarchical-learning-and-exam-system/04-split-db-and-audit-history.md) | Split SQLite DB Architecture, Audit Logs & 1-Click Rollback | Complete |
| 05 | [05-hierarchical-learning-and-exam-system/05-question-types-and-reporting.md](./05-hierarchical-learning-and-exam-system/05-question-types-and-reporting.md) | Question Types, Live URL Verification, Bug Triage & AI Studio | Complete |
| 06 | [06-agm-mailbox-and-temp-e2e.md](./06-agm-mailbox-and-temp-e2e.md) | AGM Mailbox Auto-Configuration, Organic Navigation & Temp E2E Test Suite | Complete |
| 21f | [21f-forms-spec/01-overview.md](./21f-forms-spec/01-overview.md) | Universal Form & Exam Engine Overview, Architecture & Feature Inventory | Complete |
| 21f | [21f-forms-spec/02-data-contracts.md](./21f-forms-spec/02-data-contracts.md) | Eloquent Models, Dynamic Validation Matrix, JSON Schemas & REST Routes | Complete |
| 21f | [21f-forms-spec/03-visual-and-ux.md](./21f-forms-spec/03-visual-and-ux.md) | Visual Project Node Canvas, Wizard Runner, Accordion UX & JSON Themes | Complete |
| 21f | [21f-forms-spec/04-verification-gates.md](./21f-forms-spec/04-verification-gates.md) | Acceptance Criteria, Debounce Testing, Security Gates & Test Matrix | Complete |
| 21f | [21f-forms-spec/05-llm-instruction-set.md](./21f-forms-spec/05-llm-instruction-set.md) | LLM Instruction Studio, Universal JSON Manifest & Import/Export Spec | Complete |
| 45 | [45-admin-wordpress-layout-and-form-builder-ux/01-overview.md](./45-admin-wordpress-layout-and-form-builder-ux/01-overview.md) | WordPress Admin Left Sidebar, Layout Architecture & Drag-and-Drop Form Builder UX | Complete |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| App Issues | [../22-app-issues/01-index.md](../22-app-issues/01-index.md) |
| App Database | [../23-app-db/01-index.md](../23-app-db/01-index.md) |
| App UI Design System | [../24-app-ui-design-system/01-index.md](../24-app-ui-design-system/01-index.md) |
| Acceptance Criteria | [./97-acceptance-criteria.md](./97-acceptance-criteria.md) |

---

## Verification

### AC-APP-001: App-level conformance: Index

**Given** Run the application's test suite.  
**When** Run the verification command shown below.  
**Then** Boot sequence completes; health endpoint returns 200; no unhandled promise rejections appear in the log.

```bash
npm run test
```

**Expected:** exit 0. Any non-zero exit is a hard fail and blocks merge.

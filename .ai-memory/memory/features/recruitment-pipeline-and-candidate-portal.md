# Feature: Recruitment Pipeline, Applicant Tracking & Candidate Self-Service Portal

**Date:** 2026-10-20
**Status:** Implemented & Verified
**Category:** Core Business Feature

---

## 1. Overview

WP Exam now includes a dual-facet recruitment and applicant verification system:
1. **Administrative Kanban Pipeline**: Full candidate lifecycle management across sequential hiring stages (`applied`, `screening`, `exam`, `interview`, `offered`, `hired`, `rejected`).
2. **Candidate Self-Service Portal (`/portal/:token`)**: Token-authenticated milestone completion interface allowing applicants to verify identity, sign non-disclosure agreements, complete technical skill assessments, upload work samples, and generate verified completion packets.

---

## 2. Key Components

- **Database Schemas**:
  - `applicant_stages`: Stage definitions, ordering, and theme color tags.
  - `applicants`: Candidate metadata, active stage reference, score, star ratings, and interview notes.
  - `applicant_transitions`: Immutable audit history of stage progression.
  - `portal_step_completions`: Token-scoped milestone completion records.
  - `form_options` & `form_submission_values`: Normalized relational tables for discrete field choices and individual submission values.
- **REST API Endpoints**:
  - `/wp-exam/v1/applicants` (GET, POST)
  - `/wp-exam/v1/applicants/stages` (GET)
  - `/wp-exam/v1/applicants/stage-transition` (POST)
  - `/wp-exam/v1/applicants/feedback` (POST)
  - `/wp-exam/v1/applicants/{id}` (DELETE)
  - `/wp-exam/v1/portal/{token}` (GET)
  - `/wp-exam/v1/portal/{token}/complete-step` (POST)
- **UI Components**:
  - `src/components/admin/applicant-pipeline-kanban.tsx`: Administrative Kanban board with card actions and direct portal links.
  - `src/components/portal/candidate-portal-runner.tsx`: Multi-step candidate verification portal.

---

## 3. Specifications & Traceability

- Specification Document: `02-spec/21-app/81-recruitment-pipeline-and-candidate-portal.md`
- Master Manifest: `version.json` (v0.4.17)

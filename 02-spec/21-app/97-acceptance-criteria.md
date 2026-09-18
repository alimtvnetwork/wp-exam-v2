# App — Acceptance Criteria Index

Version: 2.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

Master index of acceptance criteria for the `21-app` specification directory.

---

## Acceptance Criteria Registry

### AC-APP-001: Application Build & Conformance
- **Given:** The workspace is initialized with dependencies installed.
- **When:** Running the application smoke and unit test suite.
- **Then:** All frontend Vitest tests and lint checks exit with code 0.

### AC-APP-002: Quiz & Dynamic Form Plugin Feature Activation
- **Given:** WordPress environment with `wp-exam` plugin active.
- **When:** Administrator navigates to WP Admin -> WP Exam.
- **Then:** `#wp-exam-app` mounts successfully and displays the Form/Quiz builder UI without console errors.

### AC-APP-003: Sequential Quiz Runner & Scoring Conformance
- **Given:** A published quiz configured with `IsSequential = true`.
- **When:** A user or guest progresses through questions sequentially and submits responses.
- **Then:** Server evaluates answers against `CorrectAnswer`, calculates percentage score, returns standard `EnvelopeBuilder` response with `IsPassed` flag, and stores submission in `WpExamSubmission`.

### AC-APP-004: Public Guest Employee Sign-Up Form Submission
- **Given:** A published form configured with `FormType = 'employee_signup'` and `FormAccess = 'public'`.
- **When:** An unauthenticated visitor submits name, email, department, and custom fields.
- **Then:** Server validates inputs, records guest details with null `UserId`, returns HTTP 200 envelope with confirmation message, and logs submission timestamp.

### AC-APP-005: Riseup Asia PSR-4 Autoloading and Envelope Verification
- **Given:** The PHP backend running with `WpExam\Autoloader`.
- **When:** Any API route under `wp-exam/v1` is invoked.
- **Then:** Classes resolve automatically via `includes/Autoloader.php`, queries execute via `WpDbQueryWrapper`, and response returns standard `Status`, `Attributes`, and `Results` envelope.

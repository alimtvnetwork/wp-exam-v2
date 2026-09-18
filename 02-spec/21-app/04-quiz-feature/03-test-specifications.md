# Quiz & Dynamic Form Engine — Test Specifications

Version: 2.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This document specifies the authoritative test suite for the WP Exam plugin across both E2E tests (Playwright) and unit/integration tests (PHPUnit and Vitest).

---

## 1. End-to-End (E2E) Test Suite (Playwright)

Located in `tests/e2e/`:

### 1.1. `tests/e2e/sequential-quiz.spec.ts`
- **Scenario:** Sequential Multi-Question Quiz Execution
- **Steps:**
  1. Open published sequential quiz URL `/quiz/sequential-sample`.
  2. Verify Question 1 is visible and Question 2 is hidden.
  3. Select option "HyperText Markup Language" and click "Next".
  4. Verify Question 2 appears with smooth transition, progress indicator advances from 50% to 100%.
  5. Select option "Cascading Style Sheets" and click "Submit".
  6. Verify results modal displays: Score 100%, Passed badge, and total duration.

### 1.2. `tests/e2e/employee-signup-form.spec.ts`
- **Scenario:** Public Employee Sign-Up Form Submission
- **Steps:**
  1. Navigate to `/form/employee-onboarding` as an unauthenticated guest.
  2. Confirm fields: Legal Name, Work Email, Department dropdown, Start Date picker.
  3. Attempt submission with empty email; verify inline validation error appears without page reload.
  4. Fill valid inputs:
     - Name: "Alex Mercer"
     - Email: "alex.mercer@company.org"
     - Department: "Engineering"
  5. Click "Submit Application".
  6. Verify success message displayed: "Welcome aboard! Your employee sign-up has been recorded."
  7. Verify API call returned HTTP 200 with `IsSuccess: true` envelope.

### 1.3. `tests/e2e/form-builder-dnd.spec.ts`
- **Scenario:** Admin Form Builder Drag-and-Drop & Mode Toggle
- **Steps:**
  1. Log in to WordPress Admin with `manage_options`.
  2. Navigate to WP Exam menu.
  3. Click "Create New Form", select "Quiz" mode, toggle "Sequential Mode" to ON.
  4. Add 3 questions (Multiple Choice, True/False, Short Answer).
  5. Drag Question 3 to position 1 using `@dnd-kit` handle.
  6. Click "Live Preview"; test sequential navigation inside preview modal.
  7. Click "Save Form"; verify persistence and success toast.

---

## 2. PHPUnit Backend Integration Test Suite

Located in `tests/unit/`:

### 2.1. `tests/unit/WpDbQueryWrapperTest.php`
- Tests `WpDbQueryWrapper::execute` for query success.
- Tests query error suppression and automatic logging into `FileLogger`.
- Tests transaction rollback on thrown exceptions.

### 2.2. `tests/unit/EnvelopeBuilderTest.php`
- Tests `EnvelopeBuilder::createSuccess()` returns proper `Status`, `Attributes`, and `Results` keys.
- Tests `EnvelopeBuilder::createError()` with status code 400 and structured error arrays.
- Tests `toRestResponse()` produces valid `WP_REST_Response`.

### 2.3. `tests/unit/FormRestControllerTest.php`
- Tests permission checks (`checkAdminPermission` vs `checkPublicPermission`).
- Tests public quiz fetch omits `CorrectAnswer` properties.
- Tests quiz submission scoring algorithm and pass/fail evaluation.
- Tests guest employee sign-up persists correctly with null `UserId`.

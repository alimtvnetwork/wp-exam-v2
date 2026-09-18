# Quiz Feature — Test Specifications

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This specification establishes the automated test suite requirements for the WordPress Quiz Plugin (`wp-exam`), covering backend PHPUnit suites and frontend Vitest component suites.

---

## 1. Backend PHPUnit Test Suite

Backend tests run in WordPress integration environment via `phpunit`.

### 1.1. Schema & Activation Tests
- **File:** `tests/test-class-wp-exam-activator.php`
- **Class:** `WP_Exam_Activator_Test extends WP_UnitTestCase`
- **Methods:**
  - `test_activate_creates_required_tables()`: Asserts `$wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}quiz'")` is truthy.
  - `test_activate_creates_correct_columns()`: Checks columns for `Quiz`, `QuizQuestion`, `QuizAnswer`, `QuizResult`.
  - `test_activate_is_idempotent()`: Runs activation twice and asserts zero SQL errors or duplicate tables.

### 1.2. REST API Controller Tests
- **File:** `tests/test-class-wp-exam-rest-api.php`
- **Class:** `WP_Exam_REST_API_Test extends WP_UnitTestCase`
- **Methods:**
  - `test_get_quizzes_requires_manage_options()`: Unauthenticated request returns HTTP 401/403.
  - `test_create_quiz_with_valid_data()`: Admin user posts `{ "title": "Math" }`, asserts HTTP 201 and `success: true`.
  - `test_create_quiz_rejects_empty_title()`: Posts `{ "title": "" }`, asserts HTTP 400 and `code: "QuizInvalidPayload"`.
  - `test_submit_quiz_evaluates_correct_score()`: Submits correct answer from `quiz-sample.json`, asserts score 100%.
  - `test_submit_quiz_prevents_result_mutation()`: Attempts `PUT` on result endpoint, asserts HTTP 405 Method Not Allowed.

---

## 2. Frontend Vitest Component Suite

Frontend tests run via `npm run test` using Vitest, `@testing-library/react`, and mock handlers.

### 2.1. Quiz List View
- **File:** `src/features/quiz-list/__tests__/QuizList.test.tsx`
- **Tests:**
  - `renders quiz list successfully with title and question count`
  - `shows empty state when no quizzes exist`
  - `opens delete confirmation modal when delete button clicked`

### 2.2. Drag-and-Drop Quiz Editor
- **File:** `src/features/quiz-editor/__tests__/QuizEditor.test.tsx`
- **Tests:**
  - `renders question form with title input and add question button`
  - `adds new question item on button click`
  - `toggles IsCorrect checkbox on answer option row`
  - `disallows form submission when title is empty`

---

## 3. Test Fixtures Reference

All sample payload data for mock API responses and seed data MUST be imported from:
`02-spec/21-app/fixtures/quiz-sample.json`

---

## 4. Verification Commands

```bash
# Frontend Unit & Component Tests
npm run test

# Backend Tests (Local Docker / WP Environment)
composer test
```

# Quiz Feature Overview

## 1. WordPress Quiz Plugin UI
The Quiz Feature introduces a modern, responsive UI integrated seamlessly into the WordPress admin and frontend.
- **Admin Dashboard**: A React-based SPA (Single Page Application) for managing quizzes, questions, and viewing results. Features drag-and-drop question reordering, real-time preview, and bulk imports.
- **Frontend Quiz Interface**: An engaging, interactive, and mobile-friendly UI using modern styling (Tailwind CSS). Includes progress bars, immediate feedback (if configured), and smooth transitions between questions.

## 2. Database Schema
Following the project coding guidelines (PascalCase table names, `{Table}Id` as primary keys):

### Table: `Quiz`
- `QuizId` (BIGINT, PK, Auto Increment)
- `Title` (VARCHAR)
- `Description` (TEXT)
- `CreatedAt` (DATETIME)
- `UpdatedAt` (DATETIME)

### Table: `QuizQuestion`
- `QuizQuestionId` (BIGINT, PK, Auto Increment)
- `QuizId` (BIGINT, FK to `Quiz.QuizId`)
- `QuestionText` (TEXT)
- `QuestionType` (`QuizQuestionType`: `'multiple_choice'`, `'true_false'`, `'open_ended'`)
- `DisplayOrder` (INT)

### Table: `QuizAnswer`
- `QuizAnswerId` (BIGINT, PK, Auto Increment)
- `QuizQuestionId` (BIGINT, FK to `QuizQuestion.QuizQuestionId`)
- `AnswerText` (TEXT)
- `IsCorrect` (BOOLEAN)
- `DisplayOrder` (INT)

### Table: `QuizResult`
- `QuizResultId` (BIGINT, PK, Auto Increment)
- `QuizId` (BIGINT, FK to `Quiz.QuizId`)
- `UserId` (BIGINT, FK to WordPress `wp_users.ID`)
- `Score` (INT)
- `CompletedAt` (DATETIME)

> **Data Mutation Rule:** `QuizResult` records are strictly append-only and immutable. Once submitted, results cannot be updated or modified via REST or UI.

## 3. REST API Endpoints
The backend provides a RESTful API for interacting with the quiz data under the `/wp-json/quiz/v1` namespace.

- `GET /wp-json/quiz/v1/quizzes`: List all quizzes (Requires `manage_options` capability).
- `GET /wp-json/quiz/v1/quizzes/{QuizId}`: Get details of a specific quiz, including questions.
- `POST /wp-json/quiz/v1/quizzes`: Create a new quiz (Requires `manage_options`).
- `PUT /wp-json/quiz/v1/quizzes/{QuizId}`: Update an existing quiz (Requires `manage_options`).
- `DELETE /wp-json/quiz/v1/quizzes/{QuizId}`: Delete a quiz (Requires `manage_options`).
- `POST /wp-json/quiz/v1/quizzes/{QuizId}/submit`: Submit completed quiz answers and compute score.
- `GET /wp-json/quiz/v1/results`: Get quiz results (Filtered by authenticated user, or all results for `manage_options`).

See [02-rest-api-contracts.md](./02-rest-api-contracts.md) for detailed JSON payload contracts and HTTP status codes.

---

## 4. Coding Guideline Bindings

| Subsystem | Authority File | Binding Requirement |
|-----------|----------------|---------------------|
| WordPress Backend | [`02-spec/02-coding-guidelines/04-php/01-index.md`](../../02-coding-guidelines/04-php/01-index.md) | WordPress Coding Standards (WPCS), snake_case functions, PascalCase classes. |
| React Frontend | [`02-spec/02-coding-guidelines/02-typescript/01-index.md`](../../02-coding-guidelines/02-typescript/01-index.md) | Strict TypeScript typing, no `any`, PascalCase component names, immutable state updates. |
| Database Conventions | [`02-spec/04-database-conventions/01-index.md`](../../04-database-conventions/01-index.md) | PascalCase table names (`Quiz`), `{Table}Id` PKs, camelCase properties. |
| Error Handling | [`02-spec/03-error-manage/01-index.md`](../../03-error-manage/01-index.md) | Structured WP_Error responses with typed error codes and HTTP status codes. |
| Boolean Principles | [`02-spec/02-coding-guidelines/01-cross-language/02-boolean-principles/01-index.md`](../../02-coding-guidelines/01-cross-language/02-boolean-principles/01-index.md) | Strict `is*` and `has*` prefixes (e.g. `IsCorrect`), positive evaluation only. |

---

## 5. Acceptance Criteria

### AC-QF-001: Quiz Plugin Activation & DB Schema Creation
**Given** WordPress environment with `wp-exam` plugin installed.  
**When** Plugin is activated via `wp plugin activate wp-exam`.  
**Then** Tables `wp_quiz`, `wp_quiz_question`, `wp_quiz_answer`, `wp_quiz_result` are created with correct columns and primary keys.

### AC-QF-002: REST API CRUD Determinism
**Given** Authenticated user with `manage_options` capability.  
**When** Sending `POST /wp-json/quiz/v1/quizzes` with valid payload `{ "title": "Math 101" }`.  
**Then** Server responds with HTTP 201 and JSON `{ "success": true, "quizId": 1 }`.

### AC-QF-003: Frontend React SPA Mount
**Given** Administrator navigates to WP Admin -> Quizzes.  
**When** Page loads `#wp-exam-app` container.  
**Then** React SPA successfully initializes and renders quiz dashboard without console errors.

**Verification Commands:**

```bash
npm run test
npm run lint
```

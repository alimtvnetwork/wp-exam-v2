# Quiz Feature — REST API Contracts

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This specification establishes the authoritative REST API contracts for the WordPress Quiz Plugin (`wp-exam`). All endpoints are mounted under the WordPress REST namespace `quiz/v1`. All endpoints enforce capability checks and structured JSON response envelopes.

---

## 1. Authentication & Security Headers

Every write request (`POST`, `PUT`, `DELETE`) requires WordPress nonce verification:
- Header: `X-WP-Nonce: <wp_create_nonce('wp_rest')>`
- Cookie: Standard WordPress authentication session cookie (for logged-in users).

---

## 2. Universal Response Envelope (`Result[T]`)

Following the project's error management standards, all API responses return the standard envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "QuizNotFound",
    "message": "The requested quiz does not exist.",
    "status": 404
  }
}
```

---

## 3. Endpoint Specifications

### 3.1. `GET /wp-json/quiz/v1/quizzes`

- **Purpose:** List all quizzes with summary counts.
- **Permission:** `manage_options` capability required.
- **Query Parameters:**
  - `page` (optional integer, default 1): Page number.
  - `per_page` (optional integer, default 20): Items per page.
- **HTTP Status:** `200 OK`
- **Response Schema:**
  ```json
  {
    "success": true,
    "data": [
      {
        "quizId": 1,
        "title": "General Science",
        "description": "Basic biology and chemistry quiz.",
        "questionCount": 10,
        "createdAt": "2026-09-18T12:00:00Z",
        "updatedAt": "2026-09-18T12:00:00Z"
      }
    ],
    "error": null
  }
  ```

---

### 3.2. `GET /wp-json/quiz/v1/quizzes/{QuizId}`

- **Purpose:** Fetch a single quiz with its full list of questions and answers.
- **Permission:** Public for active published quizzes; `manage_options` for drafts.
- **HTTP Status:** `200 OK` / `404 Not Found`
- **Response Schema:**
  ```json
  {
    "success": true,
    "data": {
      "quizId": 1,
      "title": "General Science",
      "description": "Basic biology and chemistry quiz.",
      "questions": [
        {
          "quizQuestionId": 101,
          "questionText": "What is the powerhouse of the cell?",
          "questionType": "multiple_choice",
          "displayOrder": 1,
          "answers": [
            { "quizAnswerId": 201, "answerText": "Mitochondria", "displayOrder": 1 },
            { "quizAnswerId": 202, "answerText": "Ribosome", "displayOrder": 2 }
          ]
        }
      ]
    },
    "error": null
  }
  ```
  *(Note: `IsCorrect` is omitted from public responses to prevent cheat inspection).*

---

### 3.3. `POST /wp-json/quiz/v1/quizzes`

- **Purpose:** Create a new quiz with optional questions.
- **Permission:** `manage_options` capability required.
- **Request Body Schema:**
  ```json
  {
    "title": "World History",
    "description": "Comprehensive history quiz."
  }
  ```
- **Validation Rules:**
  - `title`: required, non-empty string, max 255 chars.
  - `description`: optional string.
- **HTTP Status:** `201 Created`
- **Response Schema:**
  ```json
  {
    "success": true,
    "data": {
      "quizId": 2,
      "title": "World History",
      "description": "Comprehensive history quiz.",
      "createdAt": "2026-09-18T12:00:00Z"
    },
    "error": null
  }
  ```

---

### 3.4. `PUT /wp-json/quiz/v1/quizzes/{QuizId}`

- **Purpose:** Update quiz title, description, or question ordering.
- **Permission:** `manage_options` capability required.
- **Request Body Schema:**
  ```json
  {
    "title": "Updated World History",
    "description": "Revised questions."
  }
  ```
- **HTTP Status:** `200 OK` / `404 Not Found`

---

### 3.5. `DELETE /wp-json/quiz/v1/quizzes/{QuizId}`

- **Purpose:** Delete a quiz and cascade delete its questions, answers, and results.
- **Permission:** `manage_options` capability required.
- **HTTP Status:** `200 OK`
- **Response Schema:**
  ```json
  {
    "success": true,
    "data": { "deleted": true, "quizId": 2 },
    "error": null
  }
  ```

---

### 3.6. `POST /wp-json/quiz/v1/quizzes/{QuizId}/submit`

- **Purpose:** Submit user answers, evaluate score on the server, and record result.
- **Permission:** Logged-in user (`is_user_logged_in()`) or guest session.
- **Request Body Schema:**
  ```json
  {
    "answers": [
      {
        "quizQuestionId": 101,
        "selectedAnswerId": 201
      }
    ]
  }
  ```
- **Evaluation Rule:** The server calculates the score by querying `QuizAnswer` where `IsCorrect = true`. The client never evaluates its own score.
- **HTTP Status:** `200 OK`
- **Response Schema:**
  ```json
  {
    "success": true,
    "data": {
      "quizResultId": 501,
      "quizId": 1,
      "score": 100,
      "totalQuestions": 1,
      "correctAnswers": 1,
      "completedAt": "2026-09-18T12:05:00Z"
    },
    "error": null
  }
  ```

---

### 3.7. `GET /wp-json/quiz/v1/results`

- **Purpose:** Retrieve user's past quiz submissions or all submissions for admins.
- **Permission:** `manage_options` sees all; standard users see only their own `userId` records.
- **HTTP Status:** `200 OK`

---

## 4. Error Codes Registry

| Error Code | HTTP Status | Meaning |
|------------|-------------|---------|
| `QuizNotFound` | 404 | Specified `QuizId` does not exist in the database. |
| `QuizInvalidPayload` | 400 | Title is missing or malformed. |
| `QuizUnauthorized` | 401 | Missing or invalid nonce/session. |
| `QuizForbidden` | 403 | User lacks `manage_options` permission. |
| `QuizSubmissionFailed` | 500 | Database error writing `QuizResult` record. |

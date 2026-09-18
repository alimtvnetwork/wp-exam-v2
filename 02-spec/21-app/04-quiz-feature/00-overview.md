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
- `QuestionType` (VARCHAR - e.g., 'multiple_choice', 'true_false')
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

## 3. REST API Endpoints
The backend provides a RESTful API for interacting with the quiz data.

- `GET /wp-json/quiz/v1/quizzes`: List all quizzes (Admin).
- `GET /wp-json/quiz/v1/quizzes/{QuizId}`: Get details of a specific quiz, including questions (Public/Admin depending on settings).
- `POST /wp-json/quiz/v1/quizzes`: Create a new quiz (Admin).
- `PUT /wp-json/quiz/v1/quizzes/{QuizId}`: Update an existing quiz (Admin).
- `DELETE /wp-json/quiz/v1/quizzes/{QuizId}`: Delete a quiz (Admin).

- `POST /wp-json/quiz/v1/quizzes/{QuizId}/submit`: Submit a completed quiz and get results (Public/Logged-in User).
- `GET /wp-json/quiz/v1/results`: Get quiz results (Admin or self).

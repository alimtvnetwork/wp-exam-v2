# Quiz Feature — File Topology & Module Layout

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This specification establishes the authoritative, repo-relative file topology for the WordPress Quiz Plugin (`wp-exam`). Any AI agent or developer implementing the Quiz Feature MUST follow this exact directory structure and file naming convention.

---

## 1. Backend PHP File Topology

All WordPress PHP files live in root and `includes/`:

```text
wp-exam/
├── wp-exam.php                                # Plugin bootstrap, activation/deactivation hooks
├── includes/
│   ├── class-wp-exam.php                     # Core plugin coordinator and hook loader
│   ├── class-wp-exam-activator.php           # Database table migration execution via dbDelta()
│   ├── class-wp-exam-deactivator.php         # Deactivation lifecycle handling
│   ├── class-wp-exam-admin.php               # Admin menu registration, SPA mounting markup, script enqueue
│   ├── api/
│   │   └── class-wp-exam-rest-api.php        # WP_REST_Controller implementing /wp-json/quiz/v1/ routes
│   └── models/
│       ├── class-wp-exam-quiz.php            # Data model for Quiz entity
│       ├── class-wp-exam-question.php        # Data model for QuizQuestion entity
│       ├── class-wp-exam-answer.php          # Data model for QuizAnswer entity
│       └── class-wp-exam-result.php          # Data model for QuizResult entity
```

### Backend File Responsibilities

| File Path | Primary Class | Responsibility |
|-----------|---------------|----------------|
| `wp-exam.php` | N/A | Plugin metadata header, constant declarations (`WP_EXAM_VERSION`, `WP_EXAM_PLUGIN_DIR`), activation/deactivation registration. |
| `includes/class-wp-exam-activator.php` | `WP_Exam_Activator` | Executes SQL `dbDelta` statements on `Quiz`, `QuizQuestion`, `QuizAnswer`, `QuizResult` tables. |
| `includes/class-wp-exam-admin.php` | `WP_Exam_Admin` | Adds `quizzes` submenu page under WordPress Admin, renders `<div id="wp-exam-app"></div>`, and enqueues bundled React assets with `wp_localize_script`. |
| `includes/api/class-wp-exam-rest-api.php` | `WP_Exam_REST_API` | Registers REST routes under namespace `quiz/v1`, validates request permissions (`manage_options`), handles CRUD, and returns responses. |

---

## 2. Frontend React File Topology

The frontend is a modern React Single Page Application (SPA) built with Vite, TypeScript, and Tailwind CSS located in `src/`:

```text
src/
├── main.tsx                                   # React entry point mounting to #wp-exam-app
├── App.tsx                                    # Top-level view router (Quiz List, Editor, Results)
├── index.css                                  # Global Tailwind styles & design tokens
├── api/
│   └── quizApiClient.ts                       # Typed REST API client fetching from /wp-json/quiz/v1/
├── components/
│   ├── ui/                                    # Reusable shadcn/ui primitives (button, dialog, card, badge)
│   ├── Header.tsx                             # Admin header with quiz stats and navigation
│   └── ConfirmDialog.tsx                      # Destructive action confirmation modal
├── features/
│   ├── quiz-list/
│   │   ├── QuizList.tsx                       # Data table listing all quizzes with delete/edit actions
│   │   └── QuizCard.tsx                       # Card summary for single quiz
│   ├── quiz-editor/
│   │   ├── QuizEditor.tsx                     # Main editor with metadata form and drag-drop container
│   │   ├── QuestionList.tsx                   # Dnd-kit sortable container for questions
│   │   ├── QuestionItem.tsx                   # Sortable question row with type selector
│   │   └── AnswerOptionRow.tsx                # Answer input with IsCorrect radio/checkbox toggle
│   └── quiz-results/
│       ├── QuizResults.tsx                    # Score analytics and student submissions viewer
│       └── ResultRow.tsx                      # Single user result entry
├── store/
│   └── quizStore.ts                           # Zustand store managing active quiz editor state
└── types/
    └── quiz.ts                                # TypeScript interfaces and QuizQuestionType enum
```

---

## 3. Test Suites & Fixtures Topology

```text
tests/
├── bootstrap.php                              # WordPress test suite loader
├── test-class-wp-exam-activator.php           # Schema creation and migration tests
└── test-class-wp-exam-rest-api.php            # REST endpoint CRUD and permission tests

02-spec/21-app/fixtures/
└── quiz-sample.json                           # Canonical test fixture with multi-choice and true-false quizzes
```

---

## Cross-References

- [Quiz Feature Overview](./00-overview.md)
- [REST API Contracts](./02-rest-api-contracts.md)
- [Test Specifications](./03-test-specifications.md)
- [App DB Schema](../../23-app-db/01-schema.md)

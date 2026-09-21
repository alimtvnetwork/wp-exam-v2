---
name: wp-exam-quiz-runner
description: Frontend quiz and form runner architecture in React/TypeScript, including the 4-stage learning pipeline, distraction-free focus mode, dynamic branching, and theme tokens.
---

# WP Exam: Quiz & Dynamic Form Runner Architecture

This skill guides the design, implementation, debugging, and modification of the frontend quiz runner and dynamic form engine in `src/components/runner/` and related React/TypeScript components.

## 1. Core Architecture & Runners

The frontend runner system provides two primary modes of execution:

1. **`FocusQuizRunner.tsx` (`src/components/runner/FocusQuizRunner.tsx`)**:
   - Distraction-free, Letterly-inspired 4-stage sequential learning and examination experience.
   - Operates as a finite state machine through 5 sequential states:
     - **Stage 0 (Hero Intro)**: Motivational overview screen with start trigger and config summary.
     - **Stage 1 (Study Docs & Video)**: Multi-page documentation viewer (up to 10 pages) with embedded video (YouTube, Vimeo, direct MP4) and reading telemetry.
     - **Stage 2 (Practical Checklist)**: Mandatory interactive gatekeeping checklist; candidate must check all mandatory items before proceeding to the quiz.
     - **Stage 3 (Single-Item Focus Quiz)**: Distraction-free single question presentation. Features bold emphasized typography (`**keyword**`), large selectable pill cards with icons/emojis, 1-column or 2-column responsive layouts, timer countdowns, and instant validation feedback.
     - **Stage 4 (Anti-Cheat Grading & Results)**: Score computation, passing/failing status badge, wrong answer review (with correct answers concealed for security), retake boundary enforcement, candidate CSAT feedback survey, and email notification dispatch.

2. **`FormRunner.tsx` (`src/components/runner/FormRunner.tsx`)**:
   - Traditional single-page form runner designed for employee onboarding, multi-field registrations, surveys, and comprehensive evaluations.
   - Renders all fields simultaneously with client-side validation, error summaries, and direct submission handling.

## 2. Question Types & Capabilities

The quiz runner supports polymorphic question types defined in `FocusQuestion` interface:

- `mcq`: Single-choice multiple choice question.
- `multiselect`: Multi-select checkbox questions with custom point allocations.
- `paragraph`: Open-ended textarea with min/max character count validation.
- `url_submission`: Live external URL submission with domain verification for:
  - `google_docs` (validates `docs.google.com`)
  - `workflowy` (validates `workflowy.com`)
  - `xmind` (validates `xmind.app` / `xmind.net`)
  - `figma` (validates `figma.com`)
  - `url` / `any` (general URL format)
- `file_upload`: Candidate file attachment (PDF, DOCX, ZIP up to 25MB).
- `mindmap`: Hierarchical concept node diagram review and interactive node responses.

## 3. Dynamic Branching & Conditional Logic

- Each option in `FocusQuestion` can define a `branchTarget?: string`.
- When selected, the runner navigates dynamically to the specified target question ID instead of the default sequential next index.
- If no branch target is specified, the runner advances linearly (`currentIndex + 1`).

## 4. Multi-Theme Styling & Design Tokens

- Container isolation: All runner styles MUST be wrapped in `#wp-exam-app.wp-exam-theme`.
- Semantic CSS variables defined in `src/styles/theme.less` and `src/themes/theme-definitions.ts`:
  - `--wp-exam-primary`: Brand accent color.
  - `--wp-exam-background`: Container canvas background.
  - `--wp-exam-card-bg`: Pill card background.
  - `--wp-exam-text`: High-contrast body text.
- Built-in theme presets:
  - **Letterly Dark** (`#0F0E1E` canvas, `#1F1D36` cards, vibrant violet accents).
  - **Rise Up Asia Gold** (`#0A0A0A` canvas, `#FFAD01` gold accents, `#1A1A1A` cards).
  - **Dark Slate** & **Light Clean**.

## 5. Coding & Immutability Rules

- **Component Sizing:** Keep components bounded. Decompose sub-views (e.g. `ReadingViewer`, `ChecklistGate`, `QuestionCard`, `ResultModal`) into dedicated modular files.
- **Hook Returns:** Custom hooks MUST return named property objects (`{ data, isPending, onSubmit }`), NEVER bare tuples `[state, setState]`.
- **State Immutability:** Never mutate answer maps or question arrays in place; use `structuredClone` or spread operators.
- **Boolean Standard:** Explicit positive booleans only (`isSequential`, `hasIntro`, `isMandatory`, `isPassed`, `isFail`). Never compare `=== true` or invert negative checks (`!isEmpty`).

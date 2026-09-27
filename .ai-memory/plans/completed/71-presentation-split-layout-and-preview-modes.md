# Completed Plan: Presentation Split Layout, Question Display Modes & Best UI/UX Preview

> **/goal** Implement a presentation-grade 2-column split question preview & runner, dual form-level and question-level layout configuration, interactive reference cards and mandatory checklist to-dos, and real-time Quiz vs Presentation preview modes.
> **/learn** Synthesized presentation slide principles from `presentations-repos` (`flat-slide-show`, `slides-spec`) and world-class UI benchmarks (Typeform, Linear, Pitch, Slido). Adheres strictly to positive booleans, strict relative git paths, and standard typography (Ubuntu headings, Poppins body).

## Plan Metadata
- **Spec**: [02-spec/21-app/17-presentation-split-layout-and-preview-modes.md](../../../02-spec/21-app/17-presentation-split-layout-and-preview-modes.md)
- **Status**: Completed
- **Created**: 2026-09-27
- **Completed**: 2026-09-27

---

## Verbatim Requirement Ingestion

```text
What are the best UI/UX projects that you know of? Can you get some ideas and improve the spec inside our project? That's the first thing. Second, I want you to improve the UI/UX better if you can. Especially, I want you to focus on the preview item of the question. So that could be somewhere like a presentation. The left-hand side, there will be question, right-hand side, there will be choice of question answers or writing, things like that. I want that flavor as well. So user can pick how they will present to the user, how the user sees it. And a question will also have a way. So on top of the question, there will be a default setup. And also inside a question, there will be a setup like how it will be displayed. So let's say a question can be displayed as a quiz, as a presentation, left-hand side, bigger question, a little bit of description, and right-hand side, the inputs to fill, and if any reference, it would be in the left-hand side and the check mark or two means that they have to do. Think like that. Like a presentation. And you can get some presentation ideas from the presentation owner. We have a presentation repos inside the work directory. Check those out, get some ideas. It's a long process. I want you to first write the spec and then improve it. It's not going to happen overnight, so you need to understand these aspects, create this presentation over BU preview segments, then it would be happening. Okay? So spend some time, then do it. Present here.
```

---

## Completed Tasks Breakdown

- [x] **Subtask 01: Types & Data Contracts (`src/lib/types/form.ts`)**:
  - Added `QuestionLayoutMode = 'standard' | 'presentation_split'`.
  - Added `QuestionActionChecklistItem` (`id`, `label`, `isRequired`).
  - Added `QuestionReferenceLinkItem` (`id`, `title`, `url`, `description`).
  - Extended `FormField` with `layoutMode?: QuestionLayoutMode`, `kickerText?: string`, `actionChecklist?: QuestionActionChecklistItem[]`, `referenceLinks?: QuestionReferenceLinkItem[]`.
  - Extended `FormSettings` with `defaultQuestionLayout?: QuestionLayoutMode`.

- [x] **Subtask 02: FormBuilder & Question Card Layout Controls (`src/components/forms/FormBuilder.tsx`, `src/components/forms/sortable-field-card.tsx`)**:
  - In `FormBuilder.tsx` inspector Settings/Config tab: added "Default Question Layout" selector allowing authors to choose between `Standard Quiz Card` and `Presentation Split (2-Column)`.
  - In `sortable-field-card.tsx`:
    - Added "Presentation Split Layout" toggle in the Actions dropdown menu and "Add Context" menu.
    - Added eyebrow kicker text input with "Presentation Mode" badge above the title when split mode is active.
    - Updated citations, references, and to-dos management to synchronize with the presentation split architecture.

- [x] **Subtask 03: Presentation Runner 2-Column Split Layout (`src/components/runner/FormRunner.tsx`, `src/lib/presentation-layout.ts`)**:
  - Implemented `src/lib/presentation-layout.ts`:
    - `resolveQuestionLayoutMode`: resolves priority between runtime override, question-level override, form-level default, and standard fallback.
    - `extractQuestionReferences`: extracts and deduplicates external links from `referenceLinks` and `citations`.
    - `extractQuestionChecklist`: extracts action checklist items and mandatory citations.
    - `verifyChecklistCompletion`: verifies mandatory checklist items before question progression or form submission.
  - In `src/components/runner/FormRunner.tsx`:
    - Added `effectiveLayoutMode` resolution and `completedChecks` tracking.
    - Left Column (55% width):
      - Kicker pill with question numbering and mandatory red asterisk (`*`).
      - Commanding bold Ubuntu headline (`text-2xl sm:text-3xl font-bold`).
      - Poppins formatted description and instructional guidance.
      - Media illustration/video container.
      - Reference resources cards linking to external documentation.
      - Interactive action checklist ("Must-Do Before Answering") with interactive checkboxes.
    - Right Column (45% width):
      - Elevated glassmorphic interactive card container.
      - Full interactive field input integration (`renderFieldInput`).
      - Previous and Next/Submit buttons with keyboard hint (`Enter ↵`).
    - Added global `Enter ↵` keyboard listener to advance questions seamlessly.

- [x] **Subtask 04: Real-Time Preview Switcher & Test Suite (`src/components/runner/FormRunner.tsx`, `src/test/spec17-presentation-split-layout.test.ts`)**:
  - In `FormRunner.tsx` header toolbar: added segmented switcher `[Quiz View]` $\leftrightarrow$ `[Presentation View]` allowing immediate real-time preview switching.
  - Created `src/test/spec17-presentation-split-layout.test.ts` with 9 passing unit tests covering:
    - Layout resolution priority hierarchy.
    - Reference resources extraction and deduplication.
    - Action checklist extraction and mandatory verification.
    - Form model contract serialization.
  - Full test suite: 16 test files, 139 tests passed (0 failures).
  - Production build: `npm run build` completed cleanly in 3.64s.

# Subtask 05: Question Citations, Reference Links & Actionable To-Dos

> **/goal** Support prefix/suffix citations, references, and to-do checklists on questions (e.g. read docs/watch video with "I have done it" verification).
> **/learn** Grounded on user request and `02-spec/21-app/13-question-card-and-exam-intelligence.md`.

## Target Files
- `src/lib/types/form.ts`
- `src/components/forms/sortable-field-card.tsx`
- `src/components/runner/FormRunner.tsx`

## Requirements
1. **Model**:
   - `QuestionCitation` array in `FormField` with title, url, description, position (`prefix` | `suffix`), and `isRequiredCheck` boolean.
2. **Editor UI (`sortable-field-card.tsx`)**:
   - Section to add/edit citations and to-dos via the unified `[+] Add` menu.
3. **Runner UI (`FormRunner.tsx`)**:
   - Render interactive reference cards / checklist items before or after the question.
   - For required checklists, candidate must check "I have done/visited this" before submitting or progressing.

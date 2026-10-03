# Parent Plan: 78-indexeddb-answers-riseup-yellow-hints

## User Request (Verbatim)
```text
Task 78: IndexedDB Answer Persistence & Hint Popover
1. Write 02-spec/21-app/78-indexeddb-answers-riseup-yellow-hints/01-architecture-spec.md:
   - Detail the Native IndexedDB Draft Persistence Architecture (src/lib/indexeddb-answers.ts): schema (formSlug, answers, otherTexts, currentStep, stepHistory, updatedAt), auto-hydration, immediate save on keystroke / selection, and draft clearing on submission.
   - Detail the 'Other:' field typing retention: Dedicated otherTexts: Record<string, string> dictionary mapping fieldId -> customText, so unchecking 'Other' or selecting a different radio NEVER discards the candidate's typed text. When re-checking, the text is restored. Remove .trim() from <Input value={currentOtherText} /> to enable space-bar typing.
   - Detail the Right-Hand Interactive Hint Popover: Replacing the left-side static guidance pill with an interactive popover button in the Candidate Response header (<Sparkles ... /> <Popover> ... <Lightbulb /> Need a Hint? </Popover>).

2. Write .ai-memory/plans/subtasks/78-indexeddb-answers-riseup-yellow-hints/01-indexeddb-and-other-text.md:
   - Detailed implementation brief for creating src/lib/indexeddb-answers.ts and wiring it into src/components/runner/FormRunner.tsx (otherTexts state, persistDraft, renderFieldInput signature and calls for MCQ and single choice).
3. Write .ai-memory/plans/subtasks/78-indexeddb-answers-riseup-yellow-hints/02-hint-popover.md:
   - Detailed implementation brief for adding the Hint popover in the Candidate Response header in FormRunner.tsx and removing the static guidance box.
```

---

## Architecture & Subtask Decomposition
- **Architecture Spec**: `02-spec/21-app/78-indexeddb-answers-riseup-yellow-hints/01-architecture-spec.md`
- **Subtask 01 (`01-indexeddb-and-other-text.md`)**: Standalone Native IndexedDB module (`src/lib/indexeddb-answers.ts`), wiring into `FormRunner.tsx` with auto-hydration, immediate async save, `otherTexts: Record<string, string>` dictionary mapping, removal of `.trim()` on custom input values to fix the spacebar freeze, and draft clearing upon submission.
- **Subtask 02 (`02-hint-popover.md`)**: Removal of the static left-side "Candidate Guidance" pill and implementation of an interactive Radix UI Popover (`Need a Hint?`) in the Candidate Response header in `FormRunner.tsx` with multi-theme contrast and responsive controls.
- **Subtask 03 (Verification & Push)**: Vitest suite execution, TypeScript compilation check, GitMap hyphen-separated atomic commit.

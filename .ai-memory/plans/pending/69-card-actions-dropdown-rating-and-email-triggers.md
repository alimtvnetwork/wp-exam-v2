# Master Plan: Card Actions, Enhanced Dropdowns, Multi-Mode Rating & Notification Triggers

> **/goal** Implement ergonomic card action buttons, high-contrast selectable item hover states, advanced searchable dropdowns with display vs value mapping, multi-mode rating with conditional feedback and Google Maps reviews, and a sanitized multi-channel notification trigger engine.
> **/learn** Adhere strictly to `.ai-memory/folder-structure.md`, positive booleans only, zero explicit true checks, and strict relative git paths.

## Plan Metadata
- **Spec**: `02-spec/21-app/15-card-actions-dropdown-rating-and-email-triggers.md`
- **Status**: Completed
- **Created**: 2026-09-27
- **Completed**: 2026-09-27

---

## Subtask Inventory

| # | Subtask File | Description | Target Files | Status |
|---|--------------|-------------|--------------|--------|
| 01 | [.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/01-types-and-store-trash.md](.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/01-types-and-store-trash.md) | Extend FormField types & implement store trash ledger with Toast Undo | `src/lib/types/form.ts`, `src/quiz/store/useQuizStore.ts` | Completed |
| 02 | [.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/02-card-actions-reorder-and-compact.md](.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/02-card-actions-reorder-and-compact.md) | Reorder card footer (Delete/Duplicate/Save), responsive properties dropdown, high-contrast option hover | `src/components/forms/sortable-field-card.tsx` | Completed |
| 03 | [.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/03-enhanced-dropdown-runner.md](.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/03-enhanced-dropdown-runner.md) | Searchable dropdown with sequenced letters, label vs value mapping, and custom "Other" typing | `src/components/runner/FormRunner.tsx` | Completed |
| 04 | [.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/04-multi-mode-rating-and-triggers.md](.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/04-multi-mode-rating-and-triggers.md) | Multi-mode rating (Numbers, IMDB Stars, 5-Stage Sentiment Emojis) + conditional feedback & Google review CTA | `src/components/runner/FormRunner.tsx`, `src/components/forms/sortable-field-card.tsx` | Completed |
| 05 | [.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/05-notification-triggers-and-preview.md](.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/05-notification-triggers-and-preview.md) | Multi-channel trigger configuration modal & sanitized email live preview dock | `src/components/forms/notification-trigger-modal.tsx`, `src/components/forms/FormBuilder.tsx` | Completed |
| 06 | [.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/06-verification-and-tests.md](.ai-memory/plans/subtasks/69-card-actions-dropdown-rating-and-email-triggers/06-verification-and-tests.md) | Author comprehensive test suite and verify Vitest + build gates | `src/test/spec15-card-enhancements-and-email-triggers.test.ts` | Completed |

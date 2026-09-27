# Consolidated Plan: Card Actions, Enhanced Dropdowns, Multi-Mode Rating & Notification Triggers

> **Canonical Spec**: [02-spec/21-app/15-card-actions-dropdown-rating-and-email-triggers.md](../../../02-spec/21-app/15-card-actions-dropdown-rating-and-email-triggers.md)
> **Status**: Completed (100% Verified)
> **Execution Duration**: 1 Autonomous Batch Loop (6 granular subtasks consolidated)
> **Zero PII**: Canonical template sanitized into `assets/templates/email-template.html`

---

## Executive Summary & Provenance

This task initiated from the user's requirement to overhaul form building and examination runner ergonomics:
1. **Card Action Button Reordering**: Strictly enforce `[Delete - Red]` on LEFT, `[Duplicate - Blue]` in CENTER, and `[Save - Green]` on RIGHT.
2. **Store Trash Ledger & Toast Undo**: Deleted questions are preserved in a persistent Zustand store `trashFields` ledger with an instant Toast "Undo" action and a top-toolbar restore popover.
3. **Low-Resolution Monitor Optimization**: On screens `< 640px` (`sm:hidden`), collapse field properties (Required, Allow Other, Points Tier) into a unified `SlidersHorizontal` dropdown menu.
4. **Enhanced Searchable Dropdown**: Support sequenced letters `[A]`, `[B]`, `[C]`, display label vs stored value mapping (`DropdownOptionItem`), search filter bar, and active typing `<Input>` for "Other" responses.
5. **Multi-Mode Rating System**: Configurable as Numbers, IMDB Stars, or 5-stage feelings emojis (`😢`, `🙁`, `😐`, `😊`, `😍`), with score $\le 3$ feedback prompt and score $\ge 4$ Google Maps review CTA + appreciation tags.
6. **Question & Form Notification Triggers**: Support Email, WhatsApp, and Telegram alert triggers configured per-question or globally.

---

## Consolidated Subtasks & Outcomes

### Subtask 01: Types & Store Trash Ledger
- **Target Files**: `src/lib/types/form.ts`, `src/quiz/store/useQuizStore.ts`
- **Accomplished**:
  - Added `DropdownOptionItem`, `RatingDisplayMode`, `NotificationTrigger`, `NotificationChannel`, `NotificationTriggerEvent` interfaces.
  - Implemented `trashFields` state array in `useQuizStore` storing deleted fields with original index and timestamp.
  - Added `restoreField(id)` and `clearTrash()` store actions.

### Subtask 02: Card Actions Reorder, Responsive Properties Menu & High-Contrast Options
- **Target Files**: `src/components/forms/sortable-field-card.tsx`
- **Accomplished**:
  - Reordered card footer action toolbar: Delete (red) on LEFT, Duplicate (blue) in CENTER, Save (green) on RIGHT.
  - Integrated 1-click Toast Undo triggering `useQuizStore.getState().restoreField(id)`.
  - Added `< 640px` responsive "Field Settings" `DropdownMenu` collapsing settings cleanly.
  - Standardized option typography (`text-sm sm:text-base`) and high-contrast emerald hover states (`hover:border-primary hover:bg-primary/10`).

### Subtask 03: Enhanced Dropdown Engine (Runner & Builder)
- **Target Files**: `src/components/runner/FormRunner.tsx`, `src/components/forms/sortable-field-card.tsx`
- **Accomplished**:
  - Implemented `RunnerDropdownSelect` with sequenced letter badges (`[A]`, `[B]`, `[C]`).
  - Added search input filtering option labels and values.
  - Separated UI display labels from stored data values (`DropdownOptionItem`).
  - Added interactive inline `<Input>` for "Other" custom response typing.

### Subtask 04: Multi-Mode Rating & Conditional Feedback Triggers
- **Target Files**: `src/components/runner/FormRunner.tsx`, `src/components/forms/sortable-field-card.tsx`
- **Accomplished**:
  - Implemented 3 rating modes: Numbers (`1 - N`), IMDB Stars, and 5-stage sentiment emojis (`😢`, `🙁`, `😐`, `😊`, `😍`).
  - Added score $\le 3$ conditional feedback textarea.
  - Added score $\ge 4$ Google Maps review CTA button and appreciation tag pills.

### Subtask 05: Notification Trigger Modal & Sanitized Email Template Live Preview
- **Target Files**: `src/components/forms/notification-trigger-modal.tsx`, `src/components/forms/FormBuilder.tsx`
- **Accomplished**:
  - Created 3-tab `NotificationTriggerModal` with Triggers & Routing, Email Designer, and Multi-Screen Preview.
  - Integrated with FormBuilder top action toolbar and per-question card triggers.

### Subtask 06: Verification & Test Suite
- **Target Files**: `src/test/spec15-card-enhancements-and-email-triggers.test.ts`
- **Accomplished**:
  - 10 comprehensive unit tests validating card action order, trash restoration, dropdown display/value, rating modes, and zero PII.
  - All tests passing with `exit code 0`.

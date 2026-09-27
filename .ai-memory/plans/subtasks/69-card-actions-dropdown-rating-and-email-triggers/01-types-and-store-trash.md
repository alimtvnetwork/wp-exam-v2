# Subtask 01: Types & Store Trash Ledger

> **/goal** Extend FormField type definitions and implement the deleted question trash ledger with restore and undo capability.
> **/learn** Positive booleans only, zero explicit true checks, strict relative paths.

## Target Files
- `src/lib/types/form.ts`
- `src/quiz/store/useQuizStore.ts`

## Tasks
1. In `src/lib/types/form.ts`:
   - Add `DropdownOptionItem` interface:
     ```ts
     export interface DropdownOptionItem {
       label: string;
       value: string;
     }
     ```
   - Extend `FormField`:
     - `dropdownOptions?: DropdownOptionItem[];`
     - `dropdownAllowSearch?: boolean;`
     - `ratingDisplayMode?: 'numbers' | 'stars' | 'emojis';`
     - `ratingReviewUrl?: string;`
     - `ratingAppreciationTags?: string[];`
     - `ratingFeedbackThreshold?: number;`
     - `ratingReviewThreshold?: number;`
     - `notificationTriggers?: NotificationTrigger[];`
   - Define `NotificationTrigger`, `NotificationChannel`, `NotificationTriggerEvent`.
2. In `src/quiz/store/useQuizStore.ts`:
   - Add `trashFields: Array<{ field: FormField; originalIndex: number; deletedAt: string }>;` to `QuizState`.
   - Implement `removeFieldWithTrash(id: string)`:
     - Removes field from `fields` and `questions`.
     - Pushes field and original index into `trashFields`.
   - Implement `restoreField(id: string)`:
     - Finds entry in `trashFields`.
     - Reinserts it back into `fields` at original index (or end).
     - Removes from `trashFields`.
   - Implement `clearTrash()`.

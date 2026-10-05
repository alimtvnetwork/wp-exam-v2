# Subtask 17.01: Reorder Hooks Before Early Return in FormRunner

- **Status:** Completed
- **Owned File:** `src/components/runner/FormRunner.tsx`
- **Objective:** Move `handleHUDUpdateSettings`, `handleHUDUpdateLayout`, `handleToggleSlideNumbers`, and `renderSidebarInner` to precede `if (isSubmitted)` early return.

---

## Step-by-Step Instructions

1. Locate lines in `src/components/runner/FormRunner.tsx` where:
   - `handleHUDUpdateSettings`
   - `handleHUDUpdateLayout`
   - `handleToggleSlideNumbers`
   are declared.
2. Cut these three callbacks and paste them directly above `if (isSubmitted) {`.
3. Verified that `FormRunner` has zero hooks after any `return` statement.
4. Static validation confirms invariant hook count before and after submission.

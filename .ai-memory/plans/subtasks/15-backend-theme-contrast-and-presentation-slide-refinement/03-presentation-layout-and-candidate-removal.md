# Subtask 03: Presentation Centering & Zero Candidate Response

**Status:** Queued  
**Parent Plan:** `.ai-memory/plans/80-backend-theme-contrast-and-presentation-slide-refinement.md`  
**Spec Reference:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/03-presentation-layout-and-candidate-removal.md`  

---

## 1. Objectives

1. Refine presentation slide layout in `src/components/runner/FormRunner.tsx`:
   - 2-column presentation grid uses `items-center w-full my-auto` for optical vertical balance.
   - Left column (question title, subtitle, hint) vertically centers via `lg:self-center`.
   - Right column (choices and navigation) applies a gentle, controlled downward offset (`pt-2 lg:pt-6 xl:pt-8`), avoiding both flush-top crowding and excessive downward displacement.
2. Verify zero instances of `Candidate Response` across `FormRunner.tsx`, `FocusQuizRunner.tsx`, and all rendered views.

## 2. Target Files

- `src/components/runner/FormRunner.tsx`
- `src/components/runner/FocusQuizRunner.tsx`

## 3. Acceptance Verification

- Question title is vertically centered in the presentation slide.
- Right-hand options column is nudged slightly downward (`pt-2 lg:pt-6 xl:pt-8`).
- Zero instances of `Candidate Response` exist in the DOM or JSX.

# Subtask 04: Option Hover Motion & Theme Palettes Compliance

**Status:** Queued  
**Parent Plan:** `.ai-memory/plans/80-backend-theme-contrast-and-presentation-slide-refinement.md`  
**Spec Reference:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/04-hover-animations-and-theme-palettes.md`  

---

## 1. Objectives

1. Refine option choice card animations in `src/styles/theme.css` and `src/components/runner/FormRunner.tsx`:
   - Resting semi-transparency (`opacity: 0.82`, `bg-card/75`).
   - Smooth slide-right hover transition (`transform: translate3d(6px, 0, 0)`).
   - Opacity fade-in to `1.0` on hover.
   - Text shadow hover spread (`--option-text-shadow-hover`).
2. Enforce Riseup brand theme compliance:
   - In `renderHighlightedQuestionTitle`, technical acronyms (e.g. `HTML`, `CSS`) render in brand cream `#F7F1E6` with `font-extrabold`.
   - Gold `#E8C547` is strictly reserved for active indicator marks (active radio dot, selected checkmark, progress bar pulse).
3. Ensure Purple theme contrast:
   - White text `#FFFFFF` against `#0F0E1E` deep violet background.
   - Luminous borders `#3A3568` and vivid electric indigo buttons `#5C45FD`.

## 2. Target Files

- `src/styles/theme.css`
- `src/styles/theme.less`
- `src/components/runner/FormRunner.tsx`
- `src/lib/themes.ts`

## 3. Acceptance Verification

- Option cards exhibit smooth sliding animation, opacity change, and text shadow on hover across all themes.
- Acronyms in Riseup theme display in cream `#F7F1E6` (not gold).
- Gold appears only on active indicator marks.

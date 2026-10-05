# Plan 80: Backend Theme Contrast, Option Hover Motion, and Presentation Slide Refinement

**Status:** In Progress  
**Spec Reference:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  
**Subtasks Directory:** `.ai-memory/plans/subtasks/15-backend-theme-contrast-and-presentation-slide-refinement/`  

---

## 1. High-Level Objectives

1. **Subtask 01:** Upgrade Antigravity Dracula theme tokens across CSS, LESS, and TypeScript catalogs to achieve >7:1 accessible contrast against `#282A36` surfaces.
2. **Subtask 02:** Refine WordPress Admin Sidebar navigation contrast and implement interactive hover feedback on the assessment quiz title in `FormBuilder.tsx`.
3. **Subtask 03:** Optimize presentation slide layout in `FormRunner.tsx` with vertical question title centering and balanced downward offset (`pt-2 lg:pt-6 xl:pt-8`) on the right options column, enforcing permanent zero-tolerance elimination of `Candidate Response`.
4. **Subtask 04:** Implement semi-transparent resting states (`opacity: 0.82`), smooth sliding animations (`translate3d(6px, 0, 0)`), text-shadow hover spread across all themes, and enforce Riseup cream acronym coloring and Purple theme contrast.
5. **Subtask 05:** Verify all changes against test suites and guidelines, ensuring zero regressions.

---

## 2. Subtask Breakdown

| Subtask File | Scope | Status |
| :--- | :--- | :--- |
| `subtasks/15-backend-theme-contrast-and-presentation-slide-refinement/01-dracula-theme-and-admin-contrast.md` | Dracula tokens in theme.css, theme.less, themes.ts, theme-definitions.ts, theme-context.tsx | PENDING |
| `subtasks/15-backend-theme-contrast-and-presentation-slide-refinement/02-quiz-title-and-backend-hover-effects.md` | Sidebar contrast in wp-admin-sidebar.tsx & title hover in FormBuilder.tsx | PENDING |
| `subtasks/15-backend-theme-contrast-and-presentation-slide-refinement/03-presentation-layout-and-candidate-removal.md` | Layout centering, right offset tuning, zero Candidate Response in FormRunner.tsx | PENDING |
| `subtasks/15-backend-theme-contrast-and-presentation-slide-refinement/04-option-hover-animations-and-theme-palettes.md` | Option slide hover motion, text-shadow, Riseup cream acronyms, Purple contrast | PENDING |
| `subtasks/15-backend-theme-contrast-and-presentation-slide-refinement/05-verification-and-regression-testing.md` | Regression testing & acceptance criteria sign-off | PENDING |

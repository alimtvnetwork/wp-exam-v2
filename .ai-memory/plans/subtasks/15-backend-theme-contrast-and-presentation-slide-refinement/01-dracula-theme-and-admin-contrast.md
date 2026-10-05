# Subtask 01: Dracula Theme & Admin Console Contrast Upgrade

**Status:** In Progress  
**Parent Plan:** `.ai-memory/plans/80-backend-theme-contrast-and-presentation-slide-refinement.md`  
**Spec Reference:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/02-dracula-and-backend-admin-styling.md`  

---

## 1. Objectives

1. Upgrade `--muted-foreground` for Dracula from `225 27% 51%` (`#6272A4`) to `225 25% 76%` (`#BAC7E8`) across all style files and theme definition dictionaries.
2. Upgrade `textSecondary` from `#6272A4` to `#BAC7E8` in `src/lib/themes.ts`.
3. Verify that contrast against `#282A36` and `#191A21` exceeds 7:1 WCAG AAA standards.

## 2. Target Files

- `src/styles/theme.css`
- `src/styles/theme.less`
- `src/lib/themes.ts`
- `src/themes/theme-definitions.ts`
- `src/lib/theme-context.tsx`

## 3. Acceptance Verification

- Static file search confirms no lingering `225 27% 51%` under Dracula presets.
- Theme switching to Dracula displays readable secondary text across admin console.

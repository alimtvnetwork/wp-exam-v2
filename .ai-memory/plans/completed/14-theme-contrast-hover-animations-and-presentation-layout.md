# Plan: Theme Contrast, Hover Animations, and Presentation Layout Overhaul

**ID:** `14-theme-contrast-hover-animations-and-presentation-layout`  
**Status:** completed  
**Spec References:**  
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/01-overview.md`  
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/02-dracula-and-backend-admin-styling.md`  
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/03-presentation-layout-and-candidate-removal.md`  
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/04-hover-animations-and-theme-palettes.md`  

---

## Subtasks

- [x] `01-theme-palettes-and-dracula-contrast.md` — Upgrade Dracula `--muted-foreground` and text-secondary across CSS, LESS, and theme-definitions. Fix Riseup theme `highlightWord` to cream `#F7F1E6`.
- [x] `02-admin-sidebar-and-quiz-title-hover.md` — Enhance `wp-admin-sidebar.tsx` contrast and hover slide animation. Implement interactive title hover in `FormBuilder.tsx`.
- [x] `03-presentation-layout-and-candidate-removal.md` — Vertically center presentation title in left column, adjust right column down slightly for visual balance, ensure zero Candidate Response labels exist.
- [x] `04-option-hover-animations.md` — Implement blended opacity resting state, smooth sliding hover animation (`translateX(6px)`), theme-specific border/background highlights, and text sharpening in `FormRunner.tsx` and `theme.css`.
- [x] `05-verification-and-regression-testing.md` — Run linters, test suite, and verify across Dracula, Riseup, and Purple themes.

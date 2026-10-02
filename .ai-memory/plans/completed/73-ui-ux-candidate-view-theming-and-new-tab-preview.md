# Plan: 73-ui-ux-candidate-view-theming-and-new-tab-preview

> **Status:** COMPLETED  
> **Slug:** `ui-ux-candidate-view-theming-and-new-tab-preview`  
> **Parent Task ID:** 1  
> **Completed At:** 2026-10-02  
> **Spec References:**
> - [02-spec/24-app-ui-design-system/02-theming-and-color-palettes.md](../../../02-spec/24-app-ui-design-system/02-theming-and-color-palettes.md)
> - [02-spec/24-app-ui-design-system/03-css3-animations-and-motion.md](../../../02-spec/24-app-ui-design-system/03-css3-animations-and-motion.md)
> - [02-spec/24-app-ui-design-system/04-candidate-view-and-preview-runner.md](../../../02-spec/24-app-ui-design-system/04-candidate-view-and-preview-runner.md)
> - [02-spec/21-app/73-ui-ux-candidate-view-theming-and-new-tab-preview.md](../../../02-spec/21-app/73-ui-ux-candidate-view-theming-and-new-tab-preview.md)

---

## 1. Executive Summary

Executed comprehensive overhaul of the candidate exam view, new-tab preview architecture, CSS3 motion and theming systems, and coding guideline conformance across the WP Exam & Universal Form Engine.

Key Accomplishments:
1. **Design System & App Specifications Authoring:**
   - Authored `02-spec/24-app-ui-design-system/02-theming-and-color-palettes.md` defining all 8 theme palettes, HSL token mappings, and dark mode contrast standards.
   - Authored `02-spec/24-app-ui-design-system/03-css3-animations-and-motion.md` establishing keyframes (`cardEntrance`, `pulseGlow`, `sweetDigsPulseGlow`, `sweetDigsFloat`), `.animate-card-entrance`, `.theme-transition`, and Zero Hover Scale compliance.
   - Authored `02-spec/24-app-ui-design-system/04-candidate-view-and-preview-runner.md` detailing distraction-free layout, sequential question hierarchy, accessible input sizes, and the new-tab preview architecture.
   - Authored canonical application spec `02-spec/21-app/73-ui-ux-candidate-view-theming-and-new-tab-preview.md`.
   - Updated `02-spec/24-app-ui-design-system/01-index.md` and `97-acceptance-criteria.md`.

2. **Preview System Overhaul (Dismantled Modal -> New Tab):**
   - In `src/components/forms/FormBuilder.tsx`, dismantled the Dialog modal and removed `isRunnerPreviewModalOpen` state.
   - Connected the primary header Preview button directly to `window.open('/preview/' + activeSlug, '_blank')` with draft persistence via `handleSyncDraft()`.
   - Removed `<Dialog>` modal markup, eliminating dead DOM elements and preventing container clipping.

3. **Candidate View Ergonomics & Contrast in FormRunner:**
   - Removed administrative and developer clutter (`[⚡ Auto | 🛠️ Debug | ✕ Exit]` and project pickers) from candidate / preview view.
   - Removed out-of-context degree suggestion pills from generic multiple-choice questions.
   - Upgraded question textarea styling from `text-xs` (12px) to accessible `text-sm sm:text-base` with generous padding and comfortable line-height.
   - Elevated option selection states: replaced washed-out `bg-primary/20` with clear `border-primary` border, crisp `bg-primary/10` background, and high-visibility check indicator.
   - Added `key={currentField.id}` on the question card wrapper so `.animate-card-entrance` / CSS3 transitions run smoothly on step advancement.

4. **CSS3 Animations, Theming & Coding Guideline Corrections:**
   - Modernized keyframes `pulseGlow` and `sweetDigsPulseGlow` in `src/styles/theme.css` and `src/styles/theme.less` to use dynamic CSS variable `hsl(var(--primary) / 0.4)` instead of hardcoded hex/rgba.
   - Added `.theme-transition` class: `transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;`.
   - Fixed explicit `={true}` boolean checks in `src/App.tsx` routes.
   - Fixed explicit `=== true` check in `src/server.ts:41`.
   - Decomposed mixed-polarity conditions in `src/components/runner/FormRunner.tsx`, `src/components/forms/wizard-runner.tsx`, and `src/lib/design-validation-engine.ts`.

---

## 2. Completed Subtasks

- **Task-01:** Author design system specifications for theming, CSS3 motion, and candidate view — `[DONE]` (Evidence: Specs created and indexed).
- **Task-02:** Dismantle preview modal and implement new-tab preview in FormBuilder — `[DONE]` (Evidence: Dialog removed, `window.open` implemented with draft sync).
- **Task-03:** Overhaul candidate view in FormRunner for contrast, typography, and card focus — `[DONE]` (Evidence: Clutter removed, textarea 14px/16px, option contrast elevated, `key` transition added, mixed polarities fixed).
- **Task-04:** Upgrade CSS3 animations, theming contracts, and fix code guideline violations — `[DONE]` (Evidence: Dynamic HSL keyframes, `.theme-transition`, clean boolean props, mixed-polarity decomposed).

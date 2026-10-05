# Specification 07: Fullscreen and Responsive Presentation Layout Overhaul

**Status:** Draft  
**Priority:** High  
**Parent Epic:** Onboarding Quiz Presentation & Runner Modernization  
**Specification Root:** `02-spec/21-app/07-fullscreen-and-responsive-presentation-layout/`  
**Related Specs:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  

---

## User Request (Verbatim)

```text
Fix the design issues in the full screen and other modes using responsive design concepts please
make text bigger and highlight current question please
```

---

## Visual Critique & Annotations Analysis

Visual analysis of the candidate feedback artifact (`media_1791209093699.png`) reveals four key structural, typography, and layout deficiencies across presentation and fullscreen modes:

1. **Question Step Tag Typography & Contrast Deficit:**
   - **User Annotation:** A clear instruction stating `"make text bigger and highlight current question please"` directly targets the `Question 1 of 2` indicator badge.
   - **Current Flaw:** The question indicator tag renders in small, subdued typography (`text-xs font-mono font-medium text-muted-foreground bg-muted/40`). The active question number `1` is identical in weight, size, and color to the surrounding label text `Question` and `of 2`. It lacks distinct elevation, visual hierarchy, and prominent indicator styling.
   - **Target Experience:** Overhaul the tag into an elevated, high-contrast indicator (`text-xs sm:text-sm font-semibold text-foreground/90`) featuring an isolated active index badge or pill (`px-2 py-0.5 rounded-md font-mono font-bold text-xs sm:text-sm bg-primary text-primary-foreground` in standard themes, and `bg-[#E8C547] text-[#0A0A14]` in the Riseup theme per Rule 9).

2. **Excessive Left Margin Indentation & Viewport Inefficiency:**
   - **User Annotation:** Prominent left-pointing horizontal arrows extend from `Question 1 of 2` and the question title `What does HTML stand for?*` all the way to the left viewport boundary.
   - **Current Flaw:** The outer presentation container is artificially capped at a narrow desktop width (`max-w-6xl`, 1152px). Compounding this constraint, triple-layered cumulative padding is applied across the layout hierarchy: root runner wrapper (`p-3 sm:p-6 lg:p-8`), presentation container (`px-4 sm:px-6 lg:px-8`), and slide canvas (`px-4 sm:px-8 lg:px-12`). This produces an excessive cumulative left inset (>112px) on standard 1080p, 1440p, and ultrawide displays, causing the question column to feel displaced inward rather than anchored to the widescreen presentation canvas.
   - **Target Experience:** Expand the outer presentation container in presentation modes (`effectiveLayoutMode !== 'standard'`) from `max-w-6xl` to widescreen `max-w-7xl xl:max-w-[92rem] w-full px-3 sm:px-6 lg:px-8`. De-layer internal canvas padding to establish optical equilibrium between the left viewport edge and the presentation grid.

3. **Misplaced Circular Exit Button & Redundant Top-Center Floating Pill:**
   - **User Annotation:** A dark circular `X` close button floats misplaced near the top center directly beneath the `1 / 2` counter pill.
   - **Current Flaw:** A redundant top-center fixed pill (`fixed top-2.5 left-1/2 -translate-x-1/2 z-40`) renders in presentation mode even though the in-canvas question badge already communicates question step progress. Below this pill, an unanchored floating circular close button creates visual clutter and collides with top-center content.
   - **Target Experience:** Eliminate the redundant top-center fixed pill during presentation modes. Eradicate any stray top-center floating exit buttons. Consolidate executive controls (fullscreen toggle, session timer, and optional exit trigger) strictly into the top-right anchored cluster (`fixed top-3 right-4 sm:top-4 sm:right-6 z-40`).

4. **Options Column Baseline Anchoring & Action Button Balance:**
   - **User Annotation:** Downward arrows point toward the bottom of the options stack and navigation action cluster (`Auto Fill`, `Next Question`).
   - **Current Flaw:** On viewports with short question prompts or few choices, the choice options and action buttons float high in the vertical center of the right column, disconnecting from the baseline established by the slide container.
   - **Target Experience:** Ensure the right-hand options column employs structured vertical distribution (`flex flex-col justify-between`) so the interactive choices breathe naturally while the action footer (`Auto Fill` + `Next Question`) firmly anchors to the bottom margin of the slide canvas (`mt-auto pt-6 sm:pt-8`).

---

## Core Architectural Pillars

### Pillar 1: Widescreen Presentation Canvas Expansion (`max-w-[92rem]`)
- Expand outer container from narrow `max-w-6xl` (1152px) to wide-format `max-w-7xl xl:max-w-[92rem] w-full px-3 sm:px-6 lg:px-8` when presentation mode is active (`effectiveLayoutMode !== 'standard'`).
- Provide dedicated fluid handling during fullscreen mode (`isFullscreen`), ensuring content utilizes available canvas width without cramped horizontal boundaries.

### Pillar 2: Elevated Question Step Badge & Active Index Pill Highlighting
- Transform the muted question step indicator into an elevated badge (`text-xs sm:text-sm font-semibold`) with distinct background tint, border definition, and backdrop blur.
- Wrap the active question number in an isolated high-contrast pill:
  - Standard / Dark themes: `bg-primary text-primary-foreground font-mono font-bold px-2 py-0.5 rounded-md`.
  - Riseup theme: `bg-[#E8C547] text-[#0A0A14] font-mono font-bold px-2 py-0.5 rounded-md` (strictly using gold `#E8C547` as an active indicator mark per Rule 9).
  - Purple / Letterly theme: `bg-[#5C45FD] text-white font-mono font-bold px-2 py-0.5 rounded-md`.

### Pillar 3: Executive Control Anchoring & Top-Center De-cluttering
- Suppress the redundant fixed top-center slide numbering pill (`fixed top-2.5 left-1/2`) when in presentation mode, allowing the in-canvas elevated badge to serve as the single source of step truth.
- Eradicate stray floating exit buttons from top-center coordinates. Unify all executive actions (Timer, Fullscreen toggle, and Exit) within the top-right floating cluster (`fixed top-3 right-4 sm:top-4 sm:right-6 z-40`).

### Pillar 4: Left Margin Equilibrium & Cumulative Padding De-layering
- Eliminate triple-nested padding by streamlining the inner presentation canvas from `px-4 sm:px-8 lg:px-12` down to flush `px-0 sm:px-2 lg:px-4`.
- Maintain clean root wrapper margins (`px-3 sm:px-6 lg:px-8`) so question titles align naturally with the widescreen presentation grid edge.

---

## Acceptance Criteria

### 1. Canvas Width & Widescreen Responsiveness
- [ ] On viewports $\ge 1280\text{px}$ (XL) and $\ge 1536\text{px}$ (2XL), the presentation container in presentation mode expands up to `max-w-[92rem]` (1472px).
- [ ] In standard mode (`effectiveLayoutMode === 'standard'`), admin forms remain bounded to `max-w-6xl` (or `max-w-7xl` for clean-wide theme) to preserve form readability.
- [ ] In fullscreen mode (`isFullscreen`), the layout fluidly expands without cramped horizontal clipping or lateral overflow scrollbars.

### 2. Elevated Question Step Tag & Active Highlighting
- [ ] The question tag renders with font size `text-xs sm:text-sm font-semibold` and an elevated pill container.
- [ ] The current question index is enclosed in an active accent pill with distinct background and foreground colors.
- [ ] In Riseup theme, the active index pill renders with `bg-[#E8C547] text-[#0A0A14]` and font-bold.
- [ ] In Purple / Letterly theme, the active index pill renders with `bg-[#5C45FD] text-white`.
- [ ] In default themes, the active index pill renders with `bg-primary text-primary-foreground`.
- [ ] The total count segment (`of {visibleFields.length}`) renders in legible muted monospace (`font-mono text-muted-foreground font-medium`).

### 3. Top-Center Element Cleanup & Floating Control Anchoring
- [ ] When `effectiveLayoutMode !== 'standard'`, the top-center pill `fixed top-2.5 left-1/2` is omitted from the DOM.
- [ ] Zero loose, unanchored, or circular `X` close buttons exist near top-center coordinates under the header.
- [ ] The top-right cluster (`fixed top-3 right-4 sm:top-4 sm:right-6 z-40`) hosts the timer and fullscreen toggle cleanly, with optional exit button integration when `onClose` is provided.

### 4. Left Margin Alignment & Padding Reduction
- [ ] Cumulative left padding is reduced by stripping inner canvas horizontal padding (`px-0 sm:px-2 lg:px-4`), allowing question titles to align with the presentation grid margin.
- [ ] No double-padding artifact occurs between the root runner wrapper and the presentation slide canvas.

### 5. Options Column Baseline Anchoring
- [ ] The options column maintains vertical balance with options positioned at resting transparency (`opacity: 0.82`) and action buttons (`Auto Fill`, `Next Question`) anchored at the bottom baseline (`mt-auto pt-6 sm:pt-8`).
- [ ] The layout adapts smoothly across mobile (<640px), tablet (640px-1024px), desktop (1024px-1440px), and ultrawide (>1440px) screen sizes.
- [ ] Zero instances of `Candidate Response` or related labels exist anywhere in runner views or DOM nodes.

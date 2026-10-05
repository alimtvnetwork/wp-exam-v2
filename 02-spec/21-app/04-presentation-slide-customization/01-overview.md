# Presentation Slide Customization — Overview

## User Request (Verbatim)

```text
the title and the MCQ, everything needs to be in center
it feels like the animation and things are not proper. It's actually slowing down. Please check, are we using the CSS3 animation?
the line that we have, it needs to go up very close to the top level. It will feel like the line is close to the top level.
if the text is bigger, then we make the title a bit of reduced text. If the text is more, remember that.
```

---

## Problem Statement

The presentation mode in the quiz runner (`src/components/runner/FormRunner.tsx`) exhibits four distinct UI, UX, and architectural deficiencies reported during user testing:

1. **Uncentered Presentation Canvas Layout:**
   The presentation mode currently defaults to a 2-column split grid (`grid-cols-1 lg:grid-cols-2`), separating the question title on the left and the MCQ option list on the right. When presenting standalone assessment slides, this lateral fragmentation breaks visual flow. Users require a unified, cohesive layout where question title, subtitle, and option cards flow seamlessly down the vertical center axis with balanced maximum widths (`max-w-3xl` container, `max-w-2xl` title, and `max-w-xl` options stack).

2. **Subpixel Jitter and Sluggish Animation Pipeline:**
   The animation pipeline suffers from subpixel rasterization issues, excessive stagger delays, and CSS rule conflicts:
   - In `src/styles/theme.css`, `@keyframes cardEntrance` applies `transform: translateY(12px) scale(0.98)`. Scaling text elements by non-integer factors (`0.98`) triggers subpixel glyph recalculations and rasterization blur on every frame.
   - `@keyframes slideInUpSoft` utilizes prolonged stagger delays (up to 360ms delay + 450ms duration = 810ms total latency), making question transitions feel unresponsive.
   - In `src/components/runner/FormRunner.tsx`, option cards combine `.presentation-option-card` with `hover:translate-x-2`. This Tailwind class directly clashes with the GPU-accelerated CSS rule `.presentation-option-card:hover { transform: translate3d(6px, 0, 0); }`.
   - In `src/index.css`, a universal selector rule `* { transition: ... 250ms }` applies transitions to all properties across all DOM nodes, forcing style recalcs during slide transitions.

3. **Trapped and Re-Mounting Top Progress Line:**
   The top progress indicator bar was placed inside the animated slide container (`<div key={currentField.id} className="... animate-card-entrance relative">`). Because `.animate-card-entrance` utilizes `transform` and `will-change: transform`, it creates a CSS containing block trap for fixed elements according to CSS Transforms Module Level 1. Consequently, `fixed top-0 left-0 right-0` does not anchor to the viewport ceiling. Furthermore, being keyed to `currentField.id` causes the DOM element to unmount and re-mount on every question change, preventing smooth continuous width transitions.

4. **Static Heading Typography Causing Awkward Wraps:**
   Question titles currently render at a rigid size (`text-3xl sm:text-4xl lg:text-5xl`). When a question title contains more than 80 characters, it consumes excessive vertical height and pushes answer options below the initial viewport fold. Conversely, short titles (under 45 characters) appear underemphasized. Headings require dynamic scaling based on string length.

---

## Architecture & Scope

This specification defines the architectural boundaries, component restructuring, CSS3 hardware acceleration, and responsive constraints across the following files:

| File | Purpose | Scope of Changes |
|---|---|---|
| `src/components/runner/FormRunner.tsx` | Main quiz and presentation runner component | Implement centered presentation layout, hoist progress line to viewport root, apply dynamic title typography class, and clean hover classes |
| `src/styles/theme.css` | Global theme animations and keyframes | Replace `scale(0.98)` with pure 3D translate in `cardEntrance`, tighten `slideInUpSoft` stagger delays to 30ms increments, optimize hover transform |
| `src/index.css` | Base stylesheet and typography rules | Eliminate universal `* { transition: ... 250ms }` overhead to prevent DOM-wide transition churn |
| `src/lib/presentation-layout.ts` | Presentation layout and formatting utilities | Introduce `getDynamicTitleTypographyClass(title)` helper function with character-count thresholds |
| `src/test/spec17-presentation-split-layout.test.ts` | Vitest regression test suite | Add unit test coverage for dynamic typography scaling and centered layout mode invariants |

---

## Acceptance Criteria

1. **Centered Vertical Axis Flow:**
   In presentation mode, all content blocks (meta bar, question title, subtitle, description, hint button, and MCQ option cards) flow down the vertical center axis (`items-center text-center mx-auto`).
2. **Balanced Container Constraints:**
   - The outer presentation slide container is constrained to `max-w-3xl` (`mx-auto`).
   - The question title and subtitle container is constrained to `max-w-2xl` (`mx-auto`).
   - The MCQ option card stack is constrained to `max-w-xl` (`mx-auto`).
3. **Dynamic Title Typography Scaling:**
   The question title element applies `getDynamicTitleTypographyClass(title)` with the following tiers:
   - Greater than 80 characters: `text-2xl sm:text-3xl lg:text-4xl leading-snug`
   - Greater than 45 characters (46–80): `text-3xl sm:text-4xl lg:text-5xl leading-[1.2]`
   - 45 characters or fewer: `text-4xl sm:text-5xl lg:text-6xl leading-[1.15]`
4. **Pure CSS3 GPU-Accelerated Entrance:**
   `@keyframes cardEntrance` removes `scale(0.98)` and executes pure 3D translation:
   - `0% { opacity: 0; transform: translate3d(0, 10px, 0); }`
   - `100% { opacity: 1; transform: translate3d(0, 0, 0); }`
   - Duration: `0.2s cubic-bezier(0.16, 1, 0.3, 1)` with `will-change: transform, opacity`.
5. **Tightened Slide Stagger Pipeline:**
   `@keyframes slideInUpSoft` duration is reduced to `0.2s cubic-bezier(0.16, 1, 0.3, 1)`. Micro-stagger classes use 30ms offsets:
   - `stagger-1`: `0.03s`
   - `stagger-2`: `0.06s`
   - `stagger-3`: `0.09s`
   - `stagger-4`: `0.12s`
   - `stagger-5`: `0.15s`
   - `stagger-6`: `0.18s`
   Total transition latency for 6 options is capped under 380ms.
6. **Elimination of Hover Class Conflicts:**
   The redundant `hover:translate-x-2` class is removed from `choiceMotionClass` in `FormRunner.tsx`, leaving `.presentation-option-card:hover` (`translate3d(4px, 0, 0)` or `translate3d(6px, 0, 0)`) as the single source of truth for hover translation.
7. **Elimination of Universal Transition Overhead:**
   The universal selector rule `* { transition-property: color, background-color, border-color, box-shadow; transition-duration: 250ms; }` in `src/index.css` is removed or scoped strictly to interactive form controls (`button, input, select, textarea, a`), eliminating transition recalculations on static DOM nodes.
8. **Ceiling-Flush Top Progress Line:**
   The progress line `<Progress />` is hoisted outside the animated `<div key={currentField.id}>` container to the root viewport top level (`fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5`). It maintains continuous presence across question navigation without re-mounting.
9. **Accessibility & Reduced Motion:**
   All animations respect `@media (prefers-reduced-motion: reduce)`, immediately displaying elements with `animation-duration: 0.01ms` and `transform: none`.

---

## Non-Negotiable Constraints

1. **SPEC AUTHORING ONLY:**
   This specification phase creates documentation and architectural specifications only. No source code edits or file modifications outside the owned spec files are permitted during this phase.
2. **Strict Relative Git Paths:**
   All file references, citations, and links must use relative paths starting from the repository root (e.g. `src/components/runner/FormRunner.tsx`, `02-spec/21-app/04-presentation-slide-customization/02-centered-layout-and-animations.md`). Absolute filesystem paths and absolute protocol URIs are strictly prohibited.
3. **Strict Lowercase File Naming:**
   All files generated must follow lowercase naming conventions without exceptions.
4. **No Test or Build Execution:**
   No automated builds (`npm run build`) or test commands (`npm test`, `vitest`) are permitted during the specification phase.
5. **No Git History Rewrites:**
   No git status, checkout, add, commit, or push commands may be executed during this step.

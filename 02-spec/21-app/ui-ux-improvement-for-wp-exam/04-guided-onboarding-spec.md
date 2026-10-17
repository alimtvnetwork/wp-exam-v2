# Spec 04 — Guided Step-by-Step Onboarding

Parent program: `ui-ux-improvement-for-wp-exam` (task 69)
Sibling specs: `01-focus-minimalism-spec.md`, `02-animated-theme-controls-spec.md` (Spec Agent 1)

## User Request (Verbatim)

> "They would see how the story needs to be, or quiz needs to be created, how it's going to behave every section. So they will be guided on every step, like they will be learning and how they would send this to the user."

## Current-state summary

- No guided onboarding walkthrough exists. New admins land in the admin panel with no orientation.
- Run 68 rebranded the landing surface to "Onboarding Quiz" and reduced metric cards 4 → 3.
- The admin sidebar (`src/components/admin/wp-admin-sidebar.tsx`) has 12 tabs; the quiz creation flow spans builder → branching → preview → invite/send. There is no connective tissue explaining that order.
- The simulation spec (03) covers candidate-facing demos; this spec covers **author-facing** guided learning.

## Definitions

- **Guided tour:** an ordered sequence of spotlight steps. Each step highlights one UI region (with a dimmed backdrop over the rest), shows a single instructional card (title + one or two sentences + Next/Back/Skip), and advances only on user action. One focus at a time — the backdrop dimming is what enforces it.
- **Tour completion:** reaching the final step or pressing Skip. Completion is recorded in `localStorage` (`wp_exam_onboarding_tour_completed`) so the tour runs once; a "Replay tour" affordance in the admin header re-triggers it.

## Change plan

1. New component `src/components/onboarding/guided-tour.tsx`:
   - Props: `{ steps: TourStep[], onDone: () => void }`. `TourStep = { targetSelector: string; title: string; body: string; position: 'above' | 'below' | 'left' | 'right' }`.
   - Spotlight implementation: fixed-position backdrop with a cutout over the target element (computed via `getBoundingClientRect`, re-measured on scroll/resize). No new libraries — plain DOM + CSS.
   - Card motion: enter with `--ease-out-editorial`, 200ms, transform/opacity only. Backdrop fades 150ms. `prefers-reduced-motion` → instant.
   - Keyboard: `Escape` skips the tour; focus is moved into the card on each step for screen-reader users.
2. New tour content file `src/components/onboarding/admin-tour-steps.ts`:
   - 6 steps: (1) builder — create questions; (2) branching — add conditional rules; (3) preview — see it as a candidate; (4) simulation — try the demo; (5) invite — send to users; (6) checklist — track completion. Each step's `targetSelector` points at the real sidebar tab or button.
   - If a target selector is missing from the DOM (e.g., a tab renamed), the tour skips that step gracefully and continues — never a blank spotlight.
3. Wiring in the admin shell: on first admin-panel visit (`localStorage` flag absent), auto-start the tour after a 600ms settle delay. "Replay tour" button in the admin header.
4. Copy rules: Poppins body, one idea per card, "Section" never "Module", no micro-text (controls `text-sm` minimum per spec 09).

## Acceptance criteria

- AC-O1: First visit shows the dimmed backdrop with exactly one highlighted region and one card; advancing through all 6 steps lands on the invite step; completion sets the `localStorage` flag and the tour does not reappear on reload. Evidence: manual click-through in a dev browser.
- AC-O2: Removing a sidebar tab from the DOM does not break the tour — the step is skipped and the tour completes. Evidence: temporary DOM edit in devtools, tour still reaches Done.
- AC-O3: `Escape` at any step ends the tour and sets the completion flag. Evidence: keyboard test.
- AC-O4: No new dependencies in `package.json`. Evidence: `git diff package.json` shows zero changes.

## Non-goals

- No video tutorials (video-as-question-content is spec 06; recorded walkthroughs are a future program).
- No candidate-facing tour in this spec (candidate guidance is spec 03's simulation).
- No analytics/tracking of tour progress beyond the local completion flag.

## For future AI

**Why spotlight + backdrop instead of a help sidebar or docs page:** the user's topmost principle is single focus — one thing on screen at a time. A docs page competes with the UI it describes; a spotlight removes everything except the one region being taught. The backdrop dim *is* the focus mechanism, not decoration.

**Why target selectors with graceful skip:** the admin UI evolves (tabs get renamed — spec 45 documents the sidebar's history). Hard-coding steps to exact DOM would make the tour brittle; the skip-on-missing rule keeps it self-healing. If you rename a sidebar tab, check `admin-tour-steps.ts` and update the selector — the tour will not warn you, it will just skip.

**Why `localStorage` and not the database:** tour state is per-browser chrome preference, not user data. Storing it server-side would require identity (candidates have none — invite tokens only) and a migration for zero benefit. The replay button covers the "I skipped by accident" case.

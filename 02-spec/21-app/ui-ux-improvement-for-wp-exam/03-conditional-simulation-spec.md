# Spec 03 — Candidate-Facing Conditional Simulation

Parent program: `ui-ux-improvement-for-wp-exam` (task 69)
Sibling specs: `01-focus-minimalism-spec.md`, `02-animated-theme-controls-spec.md` (Spec Agent 1)

## User Request (Verbatim)

> "I want you to create complex conditional quizzes so that I could have a seeding value, I could test it, and also add some simulation. Simulation, that means I could have some demo which we can try, and also I could have a simulation section. That means it would follow story points, React story points or feature, like onboarding a user, something like this. They would see how the story needs to be, or quiz needs to be created, how it's going to behave every section."

## Current-state summary

- Conditional engine exists and is sound: `src/lib/branching-engine.ts` (`evaluateConditionRule`, `evaluateFieldVisibility`, `evaluateFieldRequired`, `getNextStepIndex`, `getPreviousStepIndex`, `rewindStep`, `formatRuleDescription`, `detectBranchingCycles`).
- Run 67 added three preview helpers: `previewBranchOutcomes` (ordered step indices an answer set visits), `describeSkippedSteps` (human-readable skipped-step labels), `validateConditionalFixture` (cycle + target-step checks).
- An **author-side** simulator exists inside `src/components/forms/branching-flow-modal.tsx` (predicted-next-step preview for the form author).
- Seeds exist: 5 fixtures from run 67 plus `branching-onboarding`, `branching-cycle-guard`, `conditional-visibility-demo` from run 68 (`src/quiz/store/exam-store.ts`, `PRESET_PROJECTS` in `src/components/runner/FormRunner.tsx`).
- **Missing:** a **candidate-facing** simulation section — a place where anyone (not just the author) can try a demo quiz, answer questions, and watch the story unfold section by section with narration of what just happened and why.

## Definitions

- **Story point:** one narrated beat of a guided walkthrough — a title, a body line explaining what the candidate just experienced, and the UI state it maps to. Story points are ordered; the candidate advances one at a time (single-focus principle: one beat on screen, never a wall of text).
- **Simulation:** an interactive demo quiz run where every section transition is accompanied by its story point, so the candidate learns how conditional quizzes behave while taking one.

## Change plan

1. New component `src/components/simulation/quiz-simulator.tsx`:
   - Props: `{ fixtureSlug: string }`. Loads the fixture from the seed store (`src/quiz/store/exam-store.ts`).
   - Renders one question at a time (single focus). On answer, calls `getNextStepIndex` from `src/lib/branching-engine.ts` to resolve the next step — the same hot path the real runner uses, so the simulation is truthful, not a mock.
   - After each transition, shows the story point for the section just entered: what the section is for, which rule fired (via `formatRuleDescription`), and which steps were skipped (via `describeSkippedSteps`).
   - Branch-map strip: a horizontal step indicator driven by `previewBranchOutcomes`, highlighting visited / current / skipped steps. Skipped steps render dimmed with a "skipped by rule" tooltip.
2. New story-point content file `src/components/simulation/simulation-stories.ts`:
   - One exported story per demo fixture: ordered `{ title, body, stepIndex }` entries. Content is plain data (no secrets, no PII).
   - Stories written in plain instructional language; terminology uses "Section", never "Module".
3. Demo entry point: a "Try a demo" affordance on the candidate-facing surface that opens the simulator with the `branching-onboarding` fixture. No login required — demos are public and stateless (answers kept in component state only, never persisted).
4. Motion: section transitions reuse the existing direction-aware classes (`animate-ppt-slide-forward` / `animate-ppt-slide-backward`, 340ms) — transform/opacity only, `prefers-reduced-motion` falls back to a 120ms fade. Story-point cards enter with `--ease-out-editorial` and 60–80ms stagger. No `zoom-in-95`, no hover scale, hover ≤ 0.3s.
5. New complex seed fixture `simulation-showcase` in `src/quiz/store/exam-store.ts`: a 7-step quiz exercising nested conditions (a visibility rule inside a jump-rule branch), a multi-select routing rule, and a deliberate dead-end guard that `validateConditionalFixture` must flag when mutated. Declares `theme` in settings.

## Acceptance criteria

- AC-S1: Opening the simulator with `branching-onboarding` and answering the Role question as "Engineer" visits steps `[0,1,2,4]` and the branch-map strip shows step 3 dimmed as skipped. Evidence: scripted answer run in a dev browser; DOM shows the story point for the entered section citing the fired rule text.
- AC-S2: The author-side simulator in `src/components/forms/branching-flow-modal.tsx` is untouched (its behavior is the reference implementation). Evidence: `git diff --stat` shows zero changes to that file.
- AC-S3: `simulation-showcase` loads with zero console errors and `validateConditionalFixture` returns `isValid=true`; flipping one rule to create a cycle returns `isValid=false`. Evidence: node driver output.
- AC-S4: No new animation library; all motion is transform/opacity. Evidence: `gitmap aum search "framer-motion" src/components/simulation` → 0 hits; `gitmap aum search "zoom-in-95" src/components/simulation` → 0 hits.

## Non-goals

- No changes to `src/lib/branching-engine.ts` signatures (additive-only rule stands; new helpers are unnecessary — reuse the run-67 helpers).
- No persistence of demo answers (stateless by design; persistence is a future program).
- No candidate login for demos (login remains a morning decision per the checklist spec).
- No changes to the author-side `branching-flow-modal.tsx` simulator.

## For future AI

**Why a separate candidate-facing simulator instead of reusing the author modal:** the author modal (`branching-flow-modal.tsx`) is built for editing — it shows rule JSON, predicted targets, and editing affordances. Candidates need the opposite: zero editing chrome, one question at a time, and narration of *why* something happened. Reusing the modal would leak author complexity into the candidate experience and violate the single-focus principle, so the simulator is a new component that shares only the pure engine functions.

**Why the simulation must call the real `getNextStepIndex`:** a mock would drift from the runner's behavior and teach candidates the wrong mental model. The engine is pure and cheap (O(rules)), so calling it directly costs nothing and guarantees the demo is truthful.

**Why demos are stateless:** invite-token identity exists for real assignments; demos are marketing/learning tools. Persisting demo answers would create orphan rows and a GDPR surface for zero benefit. If persistence is ever wanted, it belongs behind the checklist program, not here.

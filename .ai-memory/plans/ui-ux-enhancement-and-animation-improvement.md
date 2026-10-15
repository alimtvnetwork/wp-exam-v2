# Plan: ui-ux-enhancement-and-animation-improvement

Status: COMPLETED 2026-10-15 — all Task-IDs DONE, verified, atomically committed + pushed (see commit SHA in ledger).
Run: `.ai-memory/temp-agents/67-ui-ux-enhancement-and-animation-improvement/`

## Completion Evidence
- Task-02/03 (Worker A): `src/styles/theme.css` +102 (motion tokens, 5 keyframes, 6 utilities, reduced-motion extension); `src/components/admin/wp-admin-sidebar.tsx` 235 changed lines (0 instant mounts remain, single sliding `.admin-active-indicator`, explicit transition properties). AC1/AC2 PASS (independently verified by lead via `gitmap aum search`).
- Task-04/05 (Worker A): `src/pages/Index.tsx` tab-content enter/exit wrapper (`isLeaving`, 150ms exit, `key={activeTab}` enter, reduced-motion instant path). eslint exit 0; 0 tsc errors in touched files (13 pre-existing errors elsewhere, untouched).
- Task-06/07 (Worker B): `src/components/runner/FormRunner.tsx` preview chrome (banner/badge/exit button/canvas tint, `isPreviewRoute`-gated) + step transitions in standard card view + option-card motion; NEW `src/styles/quiz-preview.css` (entrance choreography, reduced-motion fallback). eslint exit 0; 0 `transition-all` hits on option cards; tsc errors at FormRunner 1575/1635/1660 confirmed pre-existing (no diff-hunk overlap).
- Task-08/09 (Worker B): 3 additive helpers in `src/lib/branching-engine.ts` (`previewBranchOutcomes`, `describeSkippedSteps`, `validateConditionalFixture`); 5 seed fixtures (`preview-chrome-demo`, `preview-presentation-demo`, `branching-onboarding`, `branching-cycle-guard`, `conditional-visibility-demo`) across `PRESET_PROJECTS` + `src/quiz/store/exam-store.ts`. AC6 PASS (cycle guard flagged `isValid=false`; onboarding routes Engineer->[0,1,2,4], Designer->[0,1,3,4], Other->[0,1,4]).
- Secrets gate: 0 hits across all 6 changed dirs. No absolute paths. No `zoom-in-95`, no hover scale.

## Follow-ups (out of scope for this run — do NOT fix here)
- F1: `src/components/runner/FormRunner.tsx` ~2563 — presentation-layout option button hardcodes `transition-all duration-200` and bypasses `choiceMotionClass`/`presentation-option-card` (flagged by Worker B, left untouched as out of surgical scope).
- F2: 13 pre-existing tsc errors repo-wide (FormBuilder, notification-trigger-modal, sortable-field-card, FormRunner 1575/1635/1660, google-forms-importer, useQuizStore, 2 test files) — pre-existing, unrelated to this change.
- F3: `gitmap task` in gitmap v6.552.0 is now file-sync watch tasks; the skill's agent SQLite task manager (`init`/`add`/`claim`/`complete`) only partially exists — this run used the legacy `03-ai-scripts/46-agent-sqlite-task-manager.py` for add/claim/log/complete. Skill template references `linter-scripts/check-forbidden-strings.py`, `check-relative-paths.py`, `check-prompts-loaded.py`, `check-sequence-integrity.py` — none exist in this repo (R16 regex gate substituted).

## User Request (Verbatim)
UI/UX Enhancement and Animation Improvement: high priority instruction, non-negotiable task. The UI looks a little bit better, but the left-hand side, when I go to the admin panel, just moves here to there. Make sure you have more decent animation. Read the coding guideline to have the design system design spec and try to improve the UIs. Especially the quiz mode preview is not good, so think of many different ways to enhance the UI/UX. Also, add more conditional steps, seeding values so that we can test it later on.

Slug: `ui-ux-enhancement-and-animation-improvement`
Run: `.ai-memory/temp-agents/67-ui-ux-enhancement-and-animation-improvement/`

## Discrete Task IDs
- Task-01: Spec + plan first (spec dir `02-spec/21-app/ui-ux-enhancement-and-animation-improvement/`, this plan, subtasks in `.ai-memory/plans/subtasks/ui-ux-enhancement-and-animation-improvement/`)
- Task-02: Admin sidebar collapse animation — replace instant `{!isCollapsed &&}` mounts with opacity/translate transitions synced to the width ease
- Task-03: Sliding active nav indicator between sidebar items (no instant accent-bar pop)
- Task-04: Admin tab content enter/exit transitions on `activeTab` change (currently instant mount/unmount)
- Task-05: Sidebar/admin keyframes + utilities in `src/styles/theme.css`
- Task-06: Quiz preview chrome — visible preview banner/badge + exit-preview affordance (preview currently renders identically to candidate view)
- Task-07: Quiz step-transition polish for standard card view + option-card motion alignment
- Task-08: Additive conditional-step helpers in `src/lib/branching-engine.ts` (no signature changes)
- Task-09: Extended seed values covering new UI states (`src/quiz/store/exam-store.ts`, `PRESET_PROJECTS` in FormRunner)
- Task-10: Atomic `gitmap cpf` commit + push (lead only)

## Architecture decisions (from Research 01 + 02)
- No framer-motion in the codebase (0 hits) — all motion stays Tailwind transitions + `tailwindcss-animate` + hand-rolled keyframes. Do not introduce new animation libraries.
- Root cause of the sidebar "moves here to there": `<aside>` eases width `w-16 <-> w-64` (`transition-all duration-300`) while every inner element conditionally mounts instantly. Fix = fade/slide inner content in sync with the width transition (transform/opacity only — never animate width of inner elements).
- Worker A owns `src/styles/theme.css` exclusively; Worker B gets a NEW `src/styles/quiz-preview.css` for preview keyframes (no collision).
- `FormRunner.tsx` is 4435 lines — Worker B edits stay surgical and narrowly scoped.
- `src/components/ui/*` (shadcn primitives), `src/lib/theme-context.tsx`, `src/lib/themes.ts`, `src/lib/presentation-layout.ts` are high-ripple — do not touch.

## Motion tokens (binding, from coding-guidelines-v24 design system)
- Transform/opacity ONLY. Hover <= 0.3s. transform shifts 0.15s ease; color/bg/border/opacity 0.2s ease; shadow/filter 0.3s ease.
- Easings: `--ease-out-editorial: cubic-bezier(0.16,1,0.3,1)` (entrances), `--ease-state: cubic-bezier(0.4,0,0.2,1)` (micro-interactions).
- Durations: instant 120ms, fast 200ms, base 320ms (drawers), slow 520ms (entrance choreography); stagger 60-80ms.
- `prefers-reduced-motion` = instant zero-travel fallback everywhere.

## Hard bans (auto-reject on violation)
- `zoom-in-95` anywhere (user hates it) — dropdowns use `fade-in-0` + `duration-150`.
- Hover scale (`scale()`, `hover:scale-105`) on cards/buttons/options — use bg/border/shadow paradigm.
- No `transition-all duration-200` on `.presentation-option-card` labels.
- Dracula muted text `#BAC7E8`, never `#6272A4`. Riseup gold `#E8C547` = active indicator mark only.
- Poppins body + Ubuntu headings. "Section" terminology, never "Module". Positive booleans (`is`/`has`) only, never `== true`, never mixed polarity.
- Relative git-root paths only, lowercase filenames, blank lines before `if` / after `}` / before `return`.
- Theme changes via `ThemeProvider` + `localStorage` -> document CSS vars, never local state.
- No "Candidate Response" labels in runner/presentation views.

## File ownership (disjoint, no overlap)
Worker A (admin shell motion):
- `src/components/admin/wp-admin-sidebar.tsx` (Task-02, Task-03)
- `src/pages/Index.tsx` — tab-content transition wrapper ONLY (Task-04)
- `src/styles/theme.css` — sidebar/admin keyframes ONLY (Task-05)

Worker B (quiz preview + conditional steps + seeds):
- `src/components/runner/FormRunner.tsx` — preview chrome + step transitions (Task-06, Task-07)
- `src/styles/quiz-preview.css` — NEW file, preview keyframes (Task-06, Task-07)
- `src/components/runner/floating-controls.tsx` — PresenterHUD polish, optional (Task-06)
- `src/lib/branching-engine.ts` — additive helpers only (Task-08)
- `src/quiz/store/exam-store.ts` — extended seeds (Task-09)

Lead-owned shared files: `02-spec/21-app/readme.md`, `.ai-memory/plans/readme.md`, ledger, this plan.

## Execution waves
- Wave 1: Worker A <- Task-02 + Task-03; Worker B <- Task-06 + Task-07
- Wave 2: Worker A <- Task-04 + Task-05; Worker B <- Task-08 + Task-09
- Then lead: targeted verification, secrets gate, atomic `gitmap cpf "ui-ux - enhancement and animation improvement"` (hyphen, no colon), push.

## Acceptance criteria
- AC1: Sidebar collapse/expand shows no instant text pop — labels fade/slide in sync with width.
- AC2: Active nav indicator slides between items on tab change.
- AC3: Admin tab switches animate content in/out (no snap).
- AC4: Preview mode shows unmistakable preview chrome (banner/badge + exit affordance).
- AC5: Quiz step transitions play in standard card view; option-card motion matches the presentation system.
- AC6: New conditional-step helpers are additive (existing exports untouched); seeds render the new UI states.
- AC7: All motion within token budgets; `prefers-reduced-motion` respected; `npx tsc --noEmit -p tsconfig.app.json` exit 0; eslint exit 0 on touched files; guideline autofixer check-only exit 0; secrets gate clean.

## Assumptions
- No new animation libraries; Tailwind + tailwindcss-animate + hand keyframes suffice.
- Preview chrome design follows the repo's existing preview patterns (specs 14/18/73), not a modal.

## Conflicts (resolved)
- C1: zoom-in-95 ban wins over spec 04's dropdown prescription.
- C2: translateY(-2px) lift permitted by design-system Lift+Glow, but bg/border/shadow paradigm preferred; no scale.

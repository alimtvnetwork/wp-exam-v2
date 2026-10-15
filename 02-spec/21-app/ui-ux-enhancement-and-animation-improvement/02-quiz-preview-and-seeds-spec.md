# 67 — Quiz Preview UI/UX Enhancement & Conditional-Step Seeds Spec

> **Parent task:** 67-ui-ux-enhancement-and-animation-improvement
> **This module:** quiz mode preview chrome, step transitions in standard card view,
> option-card motion alignment, entrance choreography, conditional-step helpers,
> seed fixtures. Companion: `01-admin-panel-animation-spec.md` (Worker A —
> admin sidebar/nav motion, `src/styles/theme.css` keyframes, theme engine).

---

## User Request (Verbatim)

> Especially the quiz mode preview is not good, so think of many different
> ways to enhance the UI/UX. Also, add more conditional steps, seeding values
> so that we can test it later on.

*(Admin-panel sidebar animation is covered by Spec Agent 1's spec; this file
covers the quiz-preview, conditional-step, and seed portions only.)*

---

## 1. Problem Statement

`src/components/runner/FormRunner.tsx` (4435 lines) routes `/preview` and
`/preview/:slug` to `<FormRunner isPreviewRoute />`, and the admin
"Live Form Runner" tab renders the same component directly. Today preview
mode has **no distinct chrome**: it renders identically to the candidate
view, so authors cannot tell at a glance they are authoring, not taking, the
assessment. Specific gaps:

1. **No preview identity** — no banner/badge marking the tab as preview;
   no exit-preview affordance to return to the builder/admin.
2. **Dead step transitions in standard card view** — `activeTransitionClass`
   (line 926) honors `slideTransition` only for presentation layouts; the
   standard card path reuses `animate-card-entrance` regardless of author
   settings.
3. **Option-card motion asymmetry** — presentation slides get
   `slide-up-anim presentation-option-card` with the sanctioned hover system,
   while standard card view falls back to
   `presentation-option-card transition-all duration-200` (line 3824), which
   violates the no-`transition-all` rule and misses the translate3d
   slide + opacity fade-in specified in repo AGENTS.md section 9.
4. **No entrance choreography** — header, question card, and options appear
   as one flat block instead of a sequenced entrance.
5. **Conditional steps are under-instrumented** — `src/lib/branching-engine.ts`
   exposes pure helpers (`evaluateConditionRule`, `evaluateFieldVisibility`,
   `evaluateFieldRequired`, `getNextStepIndex`, `getPreviousStepIndex`,
   `rewindStep`, `formatRuleDescription`, `detectBranchingCycles`) with types
   in `src/lib/types/form.ts` (`FieldConditionRule` at line 130,
   `FormField.conditions`/`branchingRules` at lines 178–179), but authors have
   no runtime helpers to preview which branches a given answer set triggers,
   and there are no seeded fixtures exercising multi-branch forms.
6. **Seed coverage gap** — `PRESET_PROJECTS` (FormRunner.tsx line 121),
   `seedInvites`/`seedSubmissions` (`src/quiz/store/exam-store.ts` lines
   62–103), and the persisted builder store (`src/quiz/store/useQuizStore.ts`)
   contain no fixtures for preview chrome variants, conditional-step chains,
   or theme states needed to test this work.

---

## 2. Preview Chrome Design

### Direction A — Preview identity chrome (chosen primary)

- **Banner:** fixed top hairline strip (`h-0.5` accent edge + `shadow-md`,
  per repo AGENTS.md hairline rule) above the runner header, rendered only
  when `isPreviewRoute` is true. Label: `PREVIEW MODE` in uppercase mono
  tracking-wider, no heavier than hairline — never a solid/gradient banner.
- **Badge:** pill badge adjacent to the assessment title: `PREVIEW` with the
  theme's active-indicator mark. Riseup: gold (`#E8C547`) ring only, cream
  (`#F7F1E6`) surface. Dracula: muted text in crisp lilac-slate `#BAC7E8`.
- **Exit-preview affordance:** button in the runner header (preview routes
  only): `Exit Preview` → `window.close()` when opened via new tab, else
  history back to the builder. Must be keyboard-reachable and labeled.
- **Distinct background tint:** preview routes render the canvas with a
  `5%` theme-tint overlay (`bg-primary/5`) so the authoring surface is
  visually separated from the candidate surface without changing the card
  components themselves.

### Direction B — Step transitions in standard card view

- Extend `activeTransitionClass` so the `slideTransition` setting
  (`fade` / `slide_horizontal`) also applies to the standard card path:
  `animate-ppt-slide-forward` / `animate-ppt-slide-backward` (340ms,
  direction-aware) or `animate-ppt-fade` (280ms), replacing the unconditional
  `animate-card-entrance` fallback.
- Direction source: existing `slideDirection` state; no new state machines.

### Direction C — Option-card motion alignment (standard card view)

- Replace `transition-all duration-200` with the sanctioned hover system:
  `transform: translate3d(6px, 0, 0)`, opacity `0.82 → 1.0`, duration
  `≤ 0.3s`, `--ease-state` timing, theme-aware gradient tint and border glow
  per repo AGENTS.md section 9. Transform/opacity only — no scale, no zoom.
- **Hard bans:** no `transition-all` on `.presentation-option-card`;
  no `zoom-in-95`; no hover scale anywhere.

### Direction D — Entrance choreography

- Sequenced entrance on step advance: header/title (0ms) → question card
  (60–80ms stagger) → options cascade (60–80ms each) using
  `--ease-out-editorial: cubic-bezier(0.16, 1, 0.3, 1)`.
- Keyframes live in NEW `src/styles/quiz-preview.css` (Worker B owns this
  file; `src/styles/theme.css` belongs to Worker A and must not be touched).
- `prefers-reduced-motion` fallback: all choreography collapses to a single
  120ms opacity fade.

---

## 3. Conditional-Step Additions (`src/lib/branching-engine.ts`)

Additive helpers only — no signature changes to existing exports.

| Helper | Purpose |
|---|---|
| `previewBranchOutcomes(rules, answers)` | Returns the ordered list of step indices a given answer set would visit. Lets preview mode render a "branch map" chip strip showing where each answer leads. |
| `describeSkippedSteps(rules, answers)` | Returns human-readable labels of steps that will be skipped (`formatRuleDescription` already exists — reuse it, do not duplicate its formatting logic). |
| `validateConditionalFixture(form)` | Runs `detectBranchingCycles` plus checks that every rule's target step exists; returns `{ isValid, issues }` for the seed-validation harness. |

**Hot-path constraint:** `getNextStepIndex` stays O(rules) with no
allocation beyond the returned index. The new helpers are for preview/debug
surfaces only and must never be called inside the render loop.

---

## 4. Seed Plan

### 4a. Preview chrome fixtures (`PRESET_PROJECTS`, FormRunner.tsx)

- `preview-chrome-demo`: `slideTransition: 'slide_horizontal'`,
  `defaultQuestionLayout: 'standard'` — exercises banner/badge/exit in
  standard card view.
- `preview-presentation-demo`: `slideTransition: 'fade'`,
  `defaultQuestionLayout: 'presentation_split'` — exercises chrome in
  presentation layout.

### 4b. Conditional-step fixtures (`src/quiz/store/exam-store.ts`)

- `branching-onboarding`: 5 steps; step 2 multiple-choice ("Role") with
  `FieldConditionRule`s routing engineers → step 3 (technical), designers →
  step 4 (portfolio), others → step 5 (general). Exercises
  `previewBranchOutcomes` and the branch-map strip.
- `branching-cycle-guard`: deliberately cyclic rule set, consumed only by
  `validateConditionalFixture` to prove `detectBranchingCycles` fires.
- `conditional-visibility-demo`: field-level `conditions` hiding a long-text
  field unless a prior checkbox is selected; exercises
  `evaluateFieldVisibility`/`describeSkippedSteps`.

### 4c. Theme-state seeds

- Each fixture above declares `theme` in settings so preview chrome can be
  smoke-tested in Dracula (`#BAC7E8` muted text) and Riseup (gold
  active-mark only, cream buttons) without hand-building forms.

All seed values are plain data — no credentials, tokens, or secrets
(R16 gate applies at push time).

---

## 5. Binding Motion Tokens (non-negotiable)

- Transform + opacity only. No layout-property animation.
- Hover/micro-interaction duration ≤ 0.3s.
- `--ease-out-editorial: cubic-bezier(0.16, 1, 0.3, 1)` — entrances.
- `--ease-state: cubic-bezier(0.4, 0, 0.2, 1)` — micro-interactions.
- Stagger 60–80ms between sequenced elements.
- `prefers-reduced-motion`: collapse to 120ms opacity fade.
- Typography: Poppins body, Ubuntu headings.
- Repo AGENTS.md section 9 governs option hover, Riseup/Dracula palettes,
  hairline chrome, and the zero "Candidate Response" label rule.

## 6. Coding Constraints (non-negotiable)

- Positive booleans only (`is`/`has` prefixes); never evaluate `== true`;
  never mix positive and negative checks in one condition.
- Blank lines before `if`, after `}`, and before `return`.
- Strictly relative git paths in all files; all filenames lowercase.
- Surgical edits to `src/components/runner/FormRunner.tsx` (4435 lines) —
  touch only preview chrome, transition class, and option-card motion
  call sites.

---

## 7. Acceptance Criteria

- **AC4 — Preview identity is unmistakable:** opening `/preview/:slug` in a
  new tab shows the hairline preview banner, the `PREVIEW` badge next to the
  assessment title, and an `Exit Preview` button; the candidate route
  (`/f/:slug`) shows none of these.
  *Evidence:* DOM dump of the preview route containing the banner node and
  badge text; candidate route dump lacking them.
- **AC5 — Step transitions and option motion in standard card view:**
  advancing steps with `slideTransition: 'slide_horizontal'` applies
  `animate-ppt-slide-forward`/`animate-ppt-slide-backward` (340ms) to the
  standard card; hovering an option slides it `translate3d(6px, 0, 0)` with
  opacity `0.82 → 1.0` in ≤ 0.3s; no `transition-all` remains on
  `.presentation-option-card`.
  *Evidence:* `gitmap aum search "transition-all" src/components/runner`
  returns zero hits on option-card class strings; targeted eslint exit 0.
- **AC6 — Conditional steps and seeds are testable:** the
  `branching-onboarding` seed renders its branch-map strip in preview;
  `validateConditionalFixture` flags the `branching-cycle-guard` seed;
  all new seeds load without console errors.
  *Evidence:* `npx tsc --noEmit -p tsconfig.app.json` exit 0;
  guideline autofixer `--check-only` exit 0 on touched folders.

## 8. Non-Goals

- No changes to the theme engine or `src/styles/theme.css` (Worker A's
  domain; its keyframes and tokens are shared).
- No modal previews — spec 73
  (`02-spec/21-app/73-ui-ux-candidate-view-theming-and-new-tab-preview.md`)
  mandates new-tab previews; this spec extends that surface only.
- No changes to candidate submission, grading, or invite flows.
- No version bumps, changelog edits, or release activity.

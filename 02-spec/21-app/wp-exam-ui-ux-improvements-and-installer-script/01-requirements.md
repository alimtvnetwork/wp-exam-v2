# Requirements — WP Exam UI/UX Improvements and Installer Script

## Task-02: Professional-polish UI/UX improvements

Objective: make the app look professional across all surfaces.

- R-2.1: Apply the repo theme standards from `AGENTS.md` §9 consistently:
  - Onboarding Quiz branding with `src/assets/onboarding-quiz-logo.svg`.
  - Riseup theme: dark navy `#0A0A14` background + cream `#F7F1E6` primary; gold
    `#E8C547` only as active indicator mark, never dominant surface or text.
  - Purple theme: white `#FFFFFF` text on deep violet `#0F0E1E`, luminous borders
    `#3A3568`, electric violet buttons `#5C45FD`.
  - Dracula admin surfaces: muted text in lilac-slate `#BAC7E8` (7.2:1), never
    comment slate `#6272A4`.
- R-2.2: Presentation option motion + all-theme hover system: options rest at
  `opacity: 0.82` / `bg-card/75 backdrop-blur-xs`; hover triggers rightward slide
  `translate3d(6px, 0, 0)`, opacity to `1.0`, theme-aware tint gradient, luminous
  border glow, crisp text-shadow. Do not let Tailwind utilities suppress
  `.presentation-option-card:hover`.
- R-2.3: Headers `h1`–`h6` use Ubuntu font family.
- R-2.4: Standardize button `sm`/`md`/`lg` size variants; remove irregular sizing.
- R-2.5: Polish shadcn primitives in `src/components/ui/` (focus rings, disabled
  states, consistent radius) without forking them.
- R-2.6: Boolean rules: no explicit `== true` checks; no mixed-polarity
  conditionals; boolean names use is/has prefixes.
- Out of scope for Task-02: `LandingPage.tsx`, `src/pages/`, runner views,
  `FormBuilder.tsx` (owned by Tasks 06/07).

## Task-03: GitMap/AGM-style one-liner installer script

- R-3.1: `scripts/install.sh` (bash) and `scripts/install.ps1` (PowerShell):
  detect OS/arch, check prerequisites (node 20+, npm, php 8.3 optional), install
  npm dependencies, build theme styles (`npm run build:less`), run `vite build`,
  and print next steps.
- R-3.2: Support flags `--help`, `--dry-run`, `--skip-build`, `--port`.
- R-3.3: Idempotent: safe to re-run; skips steps already satisfied.
- R-3.4: Document the one-liner in `readme.md` (curl/iwr invocation pattern).
- R-3.5: Zero-storage mandate: installer must not upload anything anywhere.

## Task-04: Scoped E2E + CI/CD green check

- R-4.1: Add scoped Playwright specs in `tests/e2e/` covering: landing page
  renders, onboarding flow start, theme-builder opens (Task-05 surface), video
  answer recorder mounts (Task-07 surface). Keep to smoke-level assertions.
- R-4.2: CI workflow changes are ADDITIVE only (new job or new steps). Never
  disable, comment out, or bypass existing checks (AGENTS.md §2).
- R-4.3: Zero-storage mandate: no `actions/upload-artifact`; diagnostics go to
  `$GITHUB_STEP_SUMMARY` and `::error::`/`::warning::` annotations.
- R-4.4: Verify: `npx playwright test` passes locally (chromium) OR document the
  exact blocker; run the repo's quality gates
  (`python 03-ai-scripts/06-cicd-local-runner.py`) and report results.

## Task-05: Live HTML theme-builder (Awansoft builder-mode style)

- R-5.1: New `src/components/theme-builder/` module: a live preview canvas with a
  side inspector. Editing a token (colors, radius, fonts, spacing) updates the
  preview instantly via CSS variables — no page reload.
- R-5.2: Model on the awansoft-v10 builder reference (`src/builder/`): draft
  state, apply/activate semantics, and per-area editors (text, image, menu, icon
  analogues for theme tokens).
- R-5.3: Persist drafts to localStorage; "Apply" writes the active theme;
  "Reset" restores defaults. Export theme as JSON.
- R-5.4: Expose the builder behind the existing admin/settings surface; do not
  create a new top-level route unless the admin sidebar pattern requires it.

## Task-06: Employee onboarding flow improvements

- R-6.1: Follow `AGENTS.md` §9 onboarding standard: title cards use 2px hairline
  accent edge (`h-0.5`) with `shadow-md`, never heavy solid/gradient banners.
- R-6.2: Consolidate secondary builder tools (Health, Config, Triggers,
  Import/Export, Flow, Share) into a single `SlidersHorizontal` dropdown menu.
- R-6.3: Streamline `src/components/public/LandingPage.tsx` and
  `src/pages/Index.tsx`: clear hero, single primary CTA, reduced text density,
  Ubuntu headers, consistent button sizing (per R-2.4).
- R-6.4: Brand consistency: "Onboarding Quiz" name + logo asset; Riseup theme
  rules from R-2.1.

## Task-07: Candidate video-answer submission flow

- R-7.1: In the quiz runner (`src/components/runner/`), add a video-answer
  question mode: candidate records via `getUserMedia`, previews the clip, can
  re-record, then submits. Handle permission-denied and no-camera states with
  clear messaging and a fallback (skip with note).
- R-7.2: Show recording indicator + elapsed timer; cap duration (default 120s,
  configurable per question).
- R-7.3: Additive TypeScript types in `src/lib/types/form.ts` for video answers
  (blob reference, duration, mime type). No breaking changes to existing types.
- R-7.4: Presentation slides: question titles vertically centered
  (`items-center w-full my-auto`, `lg:self-center`); answer column offset
  downward (`pt-2 lg:pt-6 xl:pt-8`). Zero `Candidate Response` strings in runner
  views/DOM.
- R-7.5: Boolean rules (R-2.6) apply.

## Cross-task acceptance criteria

- AC-1: `npx tsc --noEmit` passes (or `npm run compile` succeeds).
- AC-2: `npm run lint` introduces no new errors in touched files.
- AC-3: Existing vitest suite still passes (`npm run test:unit`).
- AC-4: Scoped Playwright specs (R-4.1) pass.
- AC-5: No deleted files; `git status` shows only intended additions/modifications.
- AC-6: No absolute filesystem paths in any repo file (AGENTS.md §5).
- AC-7: All new files use strictly lowercase names (AGENTS.md §4).

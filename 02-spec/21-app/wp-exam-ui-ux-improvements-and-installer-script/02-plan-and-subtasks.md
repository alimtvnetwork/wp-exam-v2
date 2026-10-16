# Plan and Subtasks — WP Exam UI/UX Improvements and Installer Script

## Execution model

- Coordinator (this program) owns Task-01 and Task-08.
- Tasks 02–07 run in PARALLEL via dedicated workers, each with a DISJOINT file
  scope (table in `00-overview.md` §4). Workers must not leave their scope.
- Workers do NOT commit. The coordinator performs one atomic commit + push
  (Task-08) after verifying AC-1..AC-7.
- If any worker hits a blocker it cannot resolve, it REPORTS it (no-silent-errors
  rule) — the coordinator decides: re-scope, re-dispatch, or carry as an open item.

## Subtasks

### Task-01: Spec + plan + subtasks — DONE (this spec)

- [x] `00-overview.md` — goal, scope, conventions, disjoint file scopes
- [x] `01-requirements.md` — R-2.1..R-7.5, AC-1..AC-7
- [x] `02-plan-and-subtasks.md` — this file

### Task-02: Professional-polish UI/UX (worker A)

Scope: `src/index.css`, `src/styles.css`, `src/App.css`, `src/styles/`,
`src/themes/`, `tailwind.config.ts`, `src/components/ui/*`.

- [ ] Audit current theme tokens vs `AGENTS.md` §9 (Riseup, purple, Dracula rules)
- [ ] Apply R-2.1 theme corrections (contrast, brand colors, muted text)
- [ ] Apply R-2.2 option motion + hover system (presentation + runner options)
- [ ] Ubuntu headers (R-2.3); button size variants (R-2.4)
- [ ] Polish `src/components/ui/` primitives (R-2.5); boolean rules (R-2.6)
- [ ] Verify: `npx tsc --noEmit`, `npm run lint` on touched files

### Task-03: One-liner installer (worker B)

Scope: `scripts/install.sh`, `scripts/install.ps1` (new), `readme.md` (docs section).

- [ ] `install.sh`: OS/arch detect, prereq checks, npm install, build steps,
      flags `--help --dry-run --skip-build --port`
- [ ] `install.ps1`: same behavior in PowerShell
- [ ] Idempotency (R-3.3); readme one-liner docs (R-3.4)
- [ ] Verify: `bash -n scripts/install.sh` clean; dry-run executes without changes

### Task-04: Scoped E2E + CI/CD (worker C)

Scope: `tests/e2e/` (new specs), `.github/workflows/ci.yml` (additive),
`playwright.config.ts` (only if needed).

- [ ] Smoke specs: landing renders, onboarding start, theme-builder opens,
      video recorder mounts (R-4.1)
- [ ] Additive CI job/steps only (R-4.2); zero-storage diagnostics (R-4.3)
- [ ] Run `npx playwright test` (chromium); report pass/fail + exact blocker if any
- [ ] Run `python 03-ai-scripts/06-cicd-local-runner.py`; report gate results

### Task-05: Live HTML theme-builder (worker D)

Scope: `src/components/theme-builder/` (new).

- [ ] Study `src/builder/` in the awansoft-v10 reference (draft/apply/activate,
      per-area editors)
- [ ] Preview canvas + side inspector; live CSS-variable updates (R-5.1)
- [ ] Draft/apply/reset/export semantics (R-5.2, R-5.3)
- [ ] Wire into existing admin/settings surface (R-5.4)
- [ ] Verify: `npx tsc --noEmit`, `npm run lint` on new files

### Task-06: Employee onboarding flow (worker E)

Scope: `src/components/public/LandingPage.tsx`, `src/pages/Index.tsx`.

- [ ] Hairline chrome accent on title cards (R-6.1)
- [ ] Consolidated `SlidersHorizontal` tools menu (R-6.2)
- [ ] Streamlined hero + CTA, reduced text density (R-6.3)
- [ ] Brand consistency (R-6.4)
- [ ] Verify: `npx tsc --noEmit`, `npm run lint` on touched files

### Task-07: Candidate video-answer flow (worker F)

Scope: `src/components/runner/` (video-answer sections), `src/lib/types/form.ts`
(additive).

- [ ] Video-answer question mode: record/preview/re-record/submit (R-7.1)
- [ ] Permission-denied + no-camera states with fallback (R-7.1)
- [ ] Recording indicator + timer; 120s default cap, per-question config (R-7.2)
- [ ] Additive video-answer types (R-7.3)
- [ ] Slide layout rules; zero `Candidate Response` strings (R-7.4)
- [ ] Verify: `npx tsc --noEmit`, `npm run lint`; add/extend vitest cases where
      practical

### Task-08: Atomic commit + push (coordinator)

- [ ] `git status` review: only intended changes, no deletions (AC-5)
- [ ] AC-1..AC-7 verification pass
- [ ] One atomic commit + push to `origin/main`
- [ ] Report: per-task summary, commit SHA, CI status

## Risk register

- Parallel workers editing shared config (`tailwind.config.ts` is Task-02 only —
  no other worker touches it).
- Playwright browsers may not be installed in this environment → Task-04 worker
  reports the blocker instead of failing silently; CI remains the backstop.
- `npm run compile`/`tsc` may surface pre-existing errors → workers report;
  coordinator decides whether they are in-scope.

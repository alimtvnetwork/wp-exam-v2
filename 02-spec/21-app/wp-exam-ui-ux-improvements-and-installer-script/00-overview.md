# WP Exam UI/UX Improvements and Installer Script — Overview

## 1. Goal

Raise the WP Exam plugin's perceived quality to professional product standard, add a
GitMap/AGM-style one-liner installer, verify quality gates (scoped E2E + CI/CD), and
ship three user-facing flows: a live HTML theme-builder (modeled on Awansoft's builder
mode), an improved employee onboarding flow, and a candidate video-answer submission
flow. All work lands as one atomic commit + push.

## 2. Background

- Repo: `wp-exam-v2` (React 18 + Vite 5 + TypeScript SPA in `src/`, PHP/WordPress
  backend, shadcn-style UI in `src/components/ui/`).
- This program is a RESTART: the overnight coordinator died silently after the task
  breakdown with nothing executed. All groundwork below is verified done — do not redo.
- Groundwork (verified): `git pull` completed; backup branch
  `backup/2026-10-16-before-ui-ux-improvements-installer` pushed to origin;
  the awansoft-v10 reference checkout (the Awansoft reference the user picked —
  `AGENTS.md`, `README.md`, `src/`, `components.json` present) is available
  alongside the workspace.

## 3. Standing orders (user)

- "You don't need to confirm anything" — work without asking.
- Spec-first: this spec + plan + subtasks exist before any code.
- One atomic commit + push at the end of the program.
- Strict hard rule: never delete files unless explicitly asked.
- Everything committed into Git; no work outside Git.
- No-silent-errors rule: a coordinator that is about to fail or stall must REPORT
  it — never die silently.

## 4. Scope

| Task | Work | File scope |
|------|------|------------|
| Task-01 | Spec + plan + subtasks (this spec) | `02-spec/21-app/wp-exam-ui-ux-improvements-and-installer-script/` |
| Task-02 | Professional-polish UI/UX | Global styles (`src/index.css`, `src/styles.css`, `src/App.css`, `src/styles/`), `src/themes/`, `tailwind.config.ts`, `src/components/ui/*` polish |
| Task-03 | GitMap/AGM-style one-liner installer | `scripts/install.sh`, `scripts/install.ps1` (new) |
| Task-04 | Scoped E2E + CI/CD green check | `tests/e2e/` (new specs), `.github/workflows/ci.yml` (additive), `playwright.config.ts` if needed |
| Task-05 | Live HTML theme-builder (Awansoft builder-mode style) | `src/components/theme-builder/` (new) |
| Task-06 | Employee onboarding flow improvements | `src/components/public/LandingPage.tsx`, `src/pages/Index.tsx` |
| Task-07 | Candidate video-answer submission flow | `src/components/runner/` (video-answer sections), `src/lib/types/form.ts` (additive types) |

File scopes are DISJOINT by design so parallel workers never collide. Workers must
stay inside their assigned scope.

## 5. Repo conventions (mandatory for all tasks)

- Headers `h1`–`h6` use the Ubuntu font family (established in spec
  `03-ui-ux-routing-fixes.md` §2.3).
- Zero explicit `true` boolean evaluations; no mixed-polarity conditionals
  (`21-app/01-index.md` checklist).
- shadcn-style primitives live in `src/components/ui/`; compose, don't fork.
- Tailwind CSS for styling; design tokens in `tailwind.config.ts` + theme CSS.
- Never delete files. Additive changes only, unless the spec says otherwise.
- Workers do NOT commit — the coordinator performs the single atomic commit + push
  at the end (Task-08).

## 6. Out of scope

- Spec/19 main-worker-service implementation (TOTAL BAN per `.ai-memory/strictly-avoid.md`).
- readme.txt timestamp generators (TOTAL BAN per `.ai-memory/strictly-avoid.md`).
- Backend PHP changes beyond what the flows strictly require.
- Full E2E suite run (scoped E2E only — see Task-04).

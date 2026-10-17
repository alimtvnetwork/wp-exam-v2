# UI/UX Improvement for WP Exam — Overview

Slug: `ui-ux-improvement-for-wp-exam`
Run: task 69

## Goal

Make WP Exam UI/UX friendly around one governing principle from the user:
**minimalism — one focus at a time per view; never overload the brain.**
On top of that: theme controls that are good *and* animated, complex
conditional quizzes with seeds and a simulation section, guided onboarding
via story points, an email checklist for users, and hardened password
security. UI/UX is the highest priority of this program.

## Background (verified done — do not redo)

- **Run 67** (`02-spec/21-app/ui-ux-enhancement-and-animation-improvement/`):
  admin sidebar motion (synced collapse, sliding active indicator),
  tab-content transitions, quiz preview chrome (banner/badge/exit),
  direction-aware step transitions, 3 additive conditional-step helpers,
  5 seed fixtures.
- **Run 68** (`02-spec/21-app/wp-exam-ui-ux-improvements-and-installer-script/`):
  visual polish pass, one-liner installer (`scripts/install.sh`,
  `scripts/install.ps1`), 4 Playwright E2E smoke specs + `playwright-smoke`
  CI job, 12-file theme-builder (`src/components/theme-builder/`:
  preview canvas, 4 token editors, draft/apply/reset/export, localStorage,
  CSS-variable engine, modeled on awansoft-v10 builder semantics),
  onboarding polish, video-answer recorder (`getUserMedia`/`MediaRecorder`).

This program builds on those foundations. It does not re-spec them.

## Scope table (disjoint per worker)

| Track | Spec file | Worker | Owned files (exclusive) |
|---|---|---|---|
| Focus/minimalism pass | `01-focus-minimalism-spec.md` | Worker A | `src/pages/Index.tsx`, `src/components/forms/FormBuilder.tsx`, `src/components/runner/FormRunner.tsx` (surgical: HUD + header focus only) |
| Animated theme controls | `02-animated-theme-controls-spec.md` | Worker A | `src/lib/theme-context.tsx` (ThemeSwitcher), `src/components/theme-builder/` (editors + activation) |
| Conditional quizzes + seeds + simulation | Spec Agent 2 | Worker B | (see Spec Agent 2 files) |
| Guided onboarding story points | Spec Agent 2 | Worker B | (see Spec Agent 2 files) |
| Email checklist | Spec Agent 2 | Worker B | (see Spec Agent 2 files) |
| Password/security hardening | Spec Agent 2 | Worker B | (see Spec Agent 2 files) |

Shared/lead-owned: `02-spec/21-app/01-index.md`,
`.ai-memory/plans/01-index.md`, `.ai-memory/plans/ui-ux-improvement-for-wp-exam.md`,
run ledger. No worker touches another worker's files.

## Conventions (binding)

- Motion: transform/opacity ONLY; hover ≤ 0.3s;
  `--ease-out-editorial: cubic-bezier(0.16,1,0.3,1)`,
  `--ease-state: cubic-bezier(0.4,0,0.2,1)`;
  `prefers-reduced-motion` = instant zero-travel fallback.
- Bans: no `zoom-in-95`; no hover scale; no `transition-all` on
  `.presentation-option-card`; Dracula muted text `#BAC7E8` (never `#6272A4`);
  Riseup gold `#E8C547` = active indicator mark only; Poppins body + Ubuntu
  headings; "Section" never "Module".
- Code: positive booleans (`is`/`has`) only, never `== true`, never mixed
  polarity; blank line before every `if`, after every `}`, before every
  `return`; relative repo-root paths only; lowercase filenames.
- No new animation libraries. Do not touch `src/components/ui/*`,
  `src/lib/themes.ts`, `src/lib/presentation-layout.ts`, or global keyframes
  in `src/styles/theme.css` (append additive sections only where the spec
  allows; Worker A owns no global keyframe edits in this program — new
  keyframes go in component-scoped CSS or the files listed above).

## Out of scope

- Rewriting run 67/68 deliverables; version bumps; changelogs; releases.
- Backend auth redesign beyond the password-hardening audit (Spec Agent 2).
- New third-party UI/animation dependencies.

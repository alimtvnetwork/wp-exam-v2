# Subtask 01 — Focus/Minimalism + Animated Theme Controls (Worker A)

Parent: task 69-ui-ux-improvement-for-wp-exam
Specs:
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/01-focus-minimalism-spec.md`
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/02-animated-theme-controls-spec.md`
Owner: **Worker A**
Status: PENDING

Disjoint from Spec Agent 2 / Worker B tracks (conditional quizzes +
simulation, guided onboarding, email checklist, password hardening).

## Owned files (Worker A only)

- `src/pages/Index.tsx` — Task-02 (admin focus: top-bar overflow, login card)
- `src/components/forms/FormBuilder.tsx` — Task-02 (header consolidation, toast save banner, collapsible rails, active-card elevation)
- `src/components/runner/FormRunner.tsx` — Task-02 surgical ONLY: PresenterHUD auto-collapse + header condense blocks (do not touch preview chrome, transitions, seeds from runs 67/68)
- `src/lib/theme-context.tsx` — Task-03 (animated ThemeSwitcher, crossfade-on-apply in setTheme, import of theme-transition.css)
- `src/components/theme-builder/` — Task-03 (editors/color-editor.tsx, editors/font-editor.tsx, editors/radius-editor.tsx, editors/spacing-editor.tsx, activation.ts)
- `src/styles/theme-transition.css` — NEW file, Task-03 (overlay + transition utilities)

Do NOT touch: `src/components/ui/*`, `src/lib/themes.ts`,
`src/lib/presentation-layout.ts`, global keyframes in `src/styles/theme.css`,
`src/main.tsx`.

## Task-02 — Focus/minimalism pass

- [ ] Read `01-focus-minimalism-spec.md` §Per-view focus audit in full first.
- [ ] `src/pages/Index.tsx`: move secondary top-bar actions into a single
  overflow menu (keep ≤3 primary items); login screen → one centered card,
  one primary action, remove test-credential advertising copy.
- [ ] `src/components/forms/FormBuilder.tsx`: collapse the ~6 header toggle
  clusters into one "View" segmented control + one overflow menu; convert
  the save banner to an auto-dismiss toast (transform/opacity only, no
  layout shift); make palette/inspector rails collapsible with persisted
  state; active question card gets elevation, inactive cards `opacity-60`
  until hovered.
- [ ] `src/components/runner/FormRunner.tsx` (HUD + header only): HUD
  auto-collapses to one floating button after 3s idle (timer cleared on
  unmount/interaction), expands on hover/focus; header condenses to
  progress + timer while answering; layout switcher + sidebar toggle move
  into HUD overflow.
- [ ] Preview route: banner collapses to slim hairline strip + badge after
  2s idle, re-expands on hover (HUD follows runner rule).
- [ ] Results view: secondary stats into a "Details" disclosure; one
  primary CTA.
- [ ] All dimming/collapsing: opacity/transform only, `0.2s var(--ease-state)`;
  `prefers-reduced-motion` → instant; focus-owner region gets
  `aria-live="polite"` where content swaps without user initiation.

## Task-03 — Animated theme controls

- [ ] Read `02-animated-theme-controls-spec.md` in full first.
- [ ] Create `src/styles/theme-transition.css` (overlay styles, transition
  utilities, reduced-motion block); import it once from
  `src/lib/theme-context.tsx`.
- [ ] `src/lib/theme-context.tsx`: ThemeSwitcher menu opens with
  `fade-in-0` 150ms; 9 rows stagger 60ms (`--ease-out-editorial`,
  translateY(4px)→0 + opacity); rows show live mini-swatches from
  `THEME_CONFIGS`; active row animated checkmark; selection triggers
  crossfade-on-apply then menu `fade-out-0` 120ms.
- [ ] Crossfade-on-apply in `setTheme`: fixed overlay
  (`inset:0, z-index:9999, aria-hidden`), fade 0→1 in 180ms
  (`--ease-state`), swap `theme-*` class + localStorage write, fade 1→0
  in 280ms (`--ease-out-editorial`), remove node; single overlay node
  reused on rapid re-select; boot restore stays instant; reduced-motion
  skips overlay.
- [ ] `src/components/theme-builder/editors/`: color-editor swatch ring
  animation + checkmark fade; spacing/radius slider fill `0.15s
  var(--ease-state)` + readout opacity crossfade; font-editor preview line
  150ms opacity crossfade; apply → 200ms canvas confirmation pulse;
  reset → crossfade overlay.
- [ ] Never `zoom-in-95`, never hover scale; theme colors unchanged (motion
  only).

## Verification (both tasks)

- [ ] `npx tsc --noEmit -p tsconfig.app.json` — zero errors in touched files
  (repo has pre-existing errors elsewhere; assert none in touched lines).
- [ ] `npx eslint` on each touched file — exit 0.
- [ ] `python3 03-ai-scripts/05-guideline-autofixer.py src/pages --check-only`,
  `... src/components/forms --check-only`,
  `... src/components/runner --check-only`,
  `... src/lib --check-only`,
  `... src/components/theme-builder --check-only` — zero violations on
  touched files.
- [ ] Secrets gate on touched dirs:
  `~/.local/bin/gitmap aum search -r "(BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,})" <dir>` — 0 hits.
- [ ] AC1/AC2 evidence per parent specs (DOM checks listed there).
- [ ] Report DONE per subtask with `filesChanged`, check exit codes,
  acceptance evidence. Do NOT run git commands. Do NOT commit or push.

## Worker rules reminder

- NEVER run git commands (index-lock collisions crash parallel workers).
- NEVER run builds or test suites (`npm run build`, `vitest`, `playwright`).
- Search only via `gitmap aum search` / `gitmap find` / `gitmap cat` —
  total ban on `rg`, `grep`, `git grep`, `Select-String`.
- Positive booleans only; blank lines before `if`, after `}`, before `return`.
- After the tool-call budget, stop and report; twice-failing tool →
  `STATUS: BLOCKED` with exact error.

# Focus & Minimalism Spec

Slug: `ui-ux-improvement-for-wp-exam`
Parent: `02-spec/21-app/ui-ux-improvement-for-wp-exam/00-overview.md`

## User Request (Verbatim)

"In the WP exam, what can we improve in the UI level so that it's UI/UX
friendly? User can focus on only one stuff. Remember that. Okay, topmost
UI/UX principles I want you to implement. Go with the visualization, check
it. [...] So try to make a focus. Focus is like only one focus at a time.
Do not give too many things to the brain, so that brain cannot focus. That
is the minimalistic concept that we need to pull on every page or every
preview or job submission."

## Principle

Every view has exactly one **focus owner** — the single element the user's
brain should be on. Everything else recedes: lower contrast, smaller,
collapsed, or hidden until needed. If two elements compete for attention,
the design is wrong.

## Per-view focus audit

| View | Competing elements today | Focus owner | Concrete declutter actions |
|---|---|---|---|
| Admin index (`src/pages/Index.tsx`) | 13-item sidebar + top bar + dense tab content + login screen advertising test credentials | Active tab's working content | Sidebar already animates (run 67); dim non-active tab chrome — tab content wrapper gets `focus-dim` on siblings (there are none visible, so: reduce top-bar item count — move secondary actions into a single overflow menu); login screen: remove test-credential advertising, single centered card, one primary action |
| Builder (`src/components/forms/FormBuilder.tsx`) | Header with ~6 toggle clusters + Preview/Save + save banner; palette left; inspector right | The question card being edited | Collapse the ~6 header toggle clusters into one "View" segmented control + one overflow menu; save banner becomes a transient toast (auto-dismiss, transform/opacity only), never a layout-shifting banner; palette and inspector panels get collapsible rails that remember state; the active question card gets the elevation treatment, inactive cards drop to `opacity-60` until hovered |
| Runner (`src/components/runner/FormRunner.tsx`) | PresenterHUD overlay (theme, view/layout mode, sidebar, timer, slide numbers, save — all live) + header | Current question | HUD auto-collapses to a single floating button after 3s idle, expands on hover/focus; header condenses to progress + timer only during answering; secondary controls (layout switcher, sidebar toggle) move into the HUD overflow |
| Preview (`/preview/:slug`) | Banner + badge + exit + tint + HUD | Quiz under preview | Chrome recedes: banner collapses to a slim 2px hairline strip with the badge after 2s (re-expands on hover); HUD follows the runner auto-collapse rule |
| Results | Secondary noise around the score card | Score card | Move secondary stats into a "Details" disclosure; one primary CTA (Retake / Back to dashboard) |

## Visualization improvements

- Every focus owner gets exactly one visual emphasis device: elevated
  surface + hairline accent (`h-0.5`, per repo standard). Never two
  (no accent + glow + scale combos).
- Progress visualization: single thin progress track per flow
  (onboarding, quiz, submission) — no competing percentage texts.
- Empty states: one illustration-free centered block (icon + one line +
  one action). No multi-card empty dashboards.
- Numbers that matter (score, progress, counts) use tabular numerals and
  one size step above body — never micro-text.

## Implementation notes

- All dimming/collapsing uses opacity and transform only
  (`transition: opacity 0.2s var(--ease-state), transform 0.2s var(--ease-state)`).
- Idle-collapse timers must clear on unmount and on user interaction;
  `prefers-reduced-motion` disables auto-collapse animation (instant hide).
- Focus changes must be announced via `aria-live="polite"` on the focus
  owner region where the content swap is not user-initiated.
- Surgical edits only: no reflow of surrounding lines in large files;
  `FormRunner.tsx` changes limited to HUD + header blocks.

## AC1 — acceptance criteria (observable evidence)

- AC1.1: In each of the 5 audited views, a DOM/AX-tree inspection shows
  at most one element with the focus-elevation treatment; no view shows
  two competing primary CTAs.
- AC1.2: Builder header toggle clusters reduce from ~6 visible groups to
  ≤2 (segmented control + overflow); save banner no longer shifts layout
  (no height change on save).
- AC1.3: Runner HUD collapses to one floating button after idle; expands
  on hover; header shows progress + timer only while answering.
- AC1.4: Login screen shows one card, one primary action, zero credential
  hints.
- AC1.5: `npx tsc --noEmit -p tsconfig.app.json` shows zero errors in
  touched files; `npx eslint` on touched files exits 0;
  `python3 03-ai-scripts/05-guideline-autofixer.py <folder> --check-only`
  reports zero violations on touched files.

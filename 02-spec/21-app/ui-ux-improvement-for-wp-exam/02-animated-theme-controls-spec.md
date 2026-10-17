# Animated Theme Controls Spec

Slug: `ui-ux-improvement-for-wp-exam`
Parent: `02-spec/21-app/ui-ux-improvement-for-wp-exam/00-overview.md`

## Problem

`ThemeProvider.setTheme` (`src/lib/theme-context.tsx`) persists to
localStorage and swaps the `theme-*` class on the document root
**instantly** — zero transition. The `ThemeSwitcher` dropdown
(`src/lib/theme-context.tsx:413+`, Palette button, 9 theme rows) opens and
selects with no motion. The theme-builder editors
(`src/components/theme-builder/editors/`: color, font, radius, spacing)
repaint drafts instantly, and activation (`activation.ts`) snaps. The user
asked for theme controls that are good *and* animated.

Themes (9): green-choice, sweet-digs, clean-wide, riseup, dracula,
purple, obsidian, vscode-navy-gold, clean.

## Design

### 1. Animated ThemeSwitcher dropdown

- Menu opens with `fade-in-0` + `duration-150` (never `zoom-in-95`).
- Theme rows enter with a stagger cascade (60ms steps, `--ease-out-editorial`,
  translateY(4px)→0 + opacity) — capped so the 9th row lands ≤ 600ms.
- Each row gets a live mini-swatch: three dots sampling the theme's
  `--primary`, `--card`, `--background` (read from `THEME_CONFIGS`, no new
  data plumbing).
- Active theme row shows the checkmark with a scale-free pop
  (opacity + translate, 150ms `--ease-state`).
- Selecting a row triggers the crossfade-on-apply (§2), then closes the
  menu with `fade-out-0` 120ms.

### 2. Crossfade-on-apply mechanism

The instant class swap becomes animated via a **dip-through-background
crossfade** — transform/opacity only, no layout animation, cross-browser
(no View Transitions API dependency):

1. `setTheme` (and builder `activation.ts` apply path) creates a fixed
   overlay div: `position:fixed; inset:0; z-index:9999;
   background:<current theme surface>; opacity:0; pointer-events:none;
   aria-hidden="true"`.
2. Overlay fades to `opacity:1` over 180ms (`--ease-state`).
3. On transition end (or 180ms timeout fallback), the `theme-*` class on
   the document root is swapped; localStorage write happens here (unchanged).
4. Overlay fades back to `opacity:0` over 280ms (`--ease-out-editorial`),
   then the node is removed.
5. `prefers-reduced-motion`: skip the overlay entirely — instant swap
   (current behavior).

Styles live in the NEW `src/styles/theme-transition.css`
(Worker A owned; imported once from `src/lib/theme-context.tsx` —
do not touch `src/styles/theme.css` or `main.tsx`).
Overlay timing constants live next to `THEME_CONFIGS` as plain constants
(no new dependencies).

Edge cases: rapid double-select — reuse the single overlay node, restart
the fade; never stack overlays. Theme applied on boot (stored theme) —
no overlay, instant (avoids flash on load).

### 3. Animated theme-builder editor controls

- `color-editor.tsx`: swatch select animates the selection ring
  (`box-shadow` 0.2s `--ease-state`) and checkmark fade-in; custom hex
  input commits on blur/Enter with a 150ms tint pulse on the preview.
- `spacing-editor.tsx` / `radius-editor.tsx`: slider fills animate via
  `transition: width 0.15s var(--ease-state)` on the fill bar; numeric
  readout crossfades on change (opacity 120ms).
- `font-editor.tsx`: family change crossfades the preview line
  (opacity 150ms) instead of snapping glyphs.
- Draft → Apply: preview canvas plays a 200ms confirmation pulse
  (`box-shadow` ring, `--ease-state`) on apply; Reset plays the
  crossfade-on-apply overlay (§2).
- All editor animations respect `prefers-reduced-motion`.

## Implementation notes

- Positive booleans only; blank lines before `if`, after `}`, before
  `return`; relative paths in comments.
- Do not touch `src/lib/themes.ts`, `src/lib/presentation-layout.ts`,
  `src/components/ui/*`.
- The 9 theme definitions are data — this spec changes motion only,
  never theme colors.

## AC2 — acceptance criteria (observable evidence)

- AC2.1: Selecting a theme plays the overlay dip (DOM shows the overlay
  node with `opacity` transitioning 0→1→0; computed `background-color`
  of body changes only while overlay is opaque — no unstyled flash frame).
- AC2.2: ThemeSwitcher menu rows stagger in on open; active row shows an
  animated checkmark; menu never uses `zoom-in-95` or scale.
- AC2.3: Builder editor interactions (swatch select, slider drag, font
  change, apply/reset) all animate per §3; `prefers-reduced-motion`
  reduces each to instant.
- AC2.4: Rapid double theme-select never stacks overlays (at most one
  overlay node in DOM); boot-time theme restore stays instant.
- AC2.5: `npx tsc --noEmit -p tsconfig.app.json` zero errors in touched
  files; `npx eslint` on touched files exits 0;
  `python3 03-ai-scripts/05-guideline-autofixer.py <folder> --check-only`
  zero violations on touched files.

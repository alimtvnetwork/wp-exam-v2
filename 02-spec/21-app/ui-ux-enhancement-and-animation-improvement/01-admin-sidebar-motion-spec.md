# Spec 01 — Admin Sidebar Motion System
`02-spec/21-app/ui-ux-enhancement-and-animation-improvement/01-admin-sidebar-motion-spec.md`

Slug: `ui-ux-enhancement-and-animation-improvement`
Workstream: admin sidebar + tab-content motion (Worker A)
Owned files: `src/components/admin/wp-admin-sidebar.tsx`, `src/pages/Index.tsx` (tab-content wrapper only), `src/styles/theme.css` (sidebar/admin keyframes only)

## User Request (Verbatim)

> The UI looks a little bit better, but the left-hand side, when I go to the admin panel, just moves here to there. Make sure you have more decent animation.

## Problem statement

`src/components/admin/wp-admin-sidebar.tsx` eases the `<aside>` width (`w-16` <-> `w-64`) with `transition-all duration-300`, but every inner text element (brand label block, section headers, nav labels, badges, footer row, header collapse button) is conditionally mounted via `{!isCollapsed && (...)}`. The width glides; the text snaps — that is the "moves here to there" complaint. The active accent bar (`w-1 bg-primary` span) and `border-l-2` on the active button toggle instantly on tab change with no travel. `src/pages/Index.tsx` swaps tab panels via instant conditional mounts (`{activeTab === 'builder' && <QuizEditor />}`) with zero transition, so content snaps in.

## Binding motion tokens (non-negotiable)

- Transform/opacity ONLY for motion. Never animate width/height/margin/padding except the aside width glide itself.
- Hover feedback <= 0.3s. Transform shifts 0.15s ease. Color/bg/border/opacity 0.2s ease. Shadow 0.3s ease.
- `--ease-out-editorial: cubic-bezier(0.16, 1, 0.3, 1)` — entrances.
- `--ease-state: cubic-bezier(0.4, 0, 0.2, 1)` — micro-interactions (hover, active, collapse).
- Stagger 60ms steps (reuse existing `.stagger-1`..`.stagger-6` utilities in `src/styles/theme.css`).
- `prefers-reduced-motion: reduce` — zero-travel fallback: durations collapse to 0.01ms, transforms forced to none.

## Hard bans (this workstream)

- No `zoom-in-95` anywhere. No hover scale on any element (existing `.presentation-option-card:hover .option-badge` scale is out of scope — do not touch it here).
- No `transition-all` introduced; remove the existing `transition-all` instances on the aside and nav buttons (see change plan).
- Dracula muted text stays `#BAC7E8`, never `#6272A4`.
- Riseup gold `#E8C547` is an active indicator mark only — never a surface or text color.
- Poppins body, Ubuntu headings. Sidebar section headers keep `font-mono` uppercase per repo `AGENTS.md` section 9.
- Say "Section", never "Module" (code already uses `NAV_SECTIONS` — keep).
- Positive booleans only (`isCollapsed`, `isActive`, `isExpanded`); never `== true`; never mixed polarity in one condition (`isActive && !isCollapsed` is banned — restructure).
- Blank line before every `if`, after every `}`, before every `return`.
- Theming stays via `ThemeProvider` + localStorage (`src/lib/theme-context`) — do not touch it.

---

## Change plan

### File A — `src/styles/theme.css` (additive only; sidebar/admin motion section)

Current: motion tokens do not exist; no sidebar keyframes; two `prefers-reduced-motion` blocks cover unrelated classes.

Target: append a clearly delimited `/* Admin sidebar motion — ui-ux-enhancement-and-animation-improvement */` section containing:

1. Tokens on `:root`:
   `--ease-out-editorial: cubic-bezier(0.16, 1, 0.3, 1);`
   `--ease-state: cubic-bezier(0.4, 0, 0.2, 1);`
2. Keyframes:
   - `sidebar-label-in`: `from { opacity: 0; transform: translateX(-6px); }` `to { opacity: 1; transform: translateX(0); }` — 0.25s `var(--ease-out-editorial)` both. Used when the sidebar expands.
   - `sidebar-label-out`: `from { opacity: 1; transform: translateX(0); }` `to { opacity: 0; transform: translateX(-4px); }` — 0.15s `var(--ease-state)` forwards. Used when collapsing (labels vanish before the width finishes).
   - `sidebar-item-in`: `from { opacity: 0; transform: translateX(-8px); }` `to { opacity: 1; transform: translateX(0); }` — 0.25s `var(--ease-out-editorial)` both. Applied per nav button on expand, combined with existing `.stagger-1`..`.stagger-6`.
   - `tab-panel-in`: `from { opacity: 0; transform: translateY(10px); }` `to { opacity: 1; transform: translateY(0); }` — 0.3s `var(--ease-out-editorial)` both.
   - `tab-panel-out`: `from { opacity: 1; transform: translateY(0); }` `to { opacity: 0; transform: translateY(6px); }` — 0.15s `var(--ease-state)` forwards.
3. Utility classes:
   - `.animate-sidebar-label-in`, `.animate-sidebar-item-in`, `.animate-tab-panel-in`, `.animate-tab-panel-out` — each `will-change: transform, opacity`.
   - `.sidebar-label` — the persistent label wrapper: `transition: opacity 0.2s var(--ease-state), transform 0.2s var(--ease-state); white-space: nowrap;` plus `.is-collapsed` modifier state (`opacity: 0; transform: translateX(-8px); pointer-events: none;`) driven by the `isCollapsed` prop via className, not conditional mount.
   - `.admin-active-indicator` — the sliding accent bar: `position: absolute; left: 0; width: 4px; border-radius: 0 4px 4px 0; background: hsl(var(--primary)); transition: transform 0.25s var(--ease-state), opacity 0.2s var(--ease-state); will-change: transform;`
4. Extend the existing `@media (prefers-reduced-motion: reduce)` block: add all new classes with `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; transform: none !important;`.

### File B — `src/components/admin/wp-admin-sidebar.tsx`

**B1. Aside width glide.** Current: `transition-all duration-300` + `w-16`/`w-64`. Target: `transition-[width] duration-300` with `var(--ease-out-editorial)`, add `overflow-hidden` so fading labels clip cleanly inside the shrinking panel instead of overflowing.

**B2. Instant mounts -> opacity/translate transitions.** Current: brand text block, header collapse button, section headers, collapsed dividers, nav label+badge wrapper, and footer content are mounted/unmounted via `{!isCollapsed && (...)}` / ternaries — text pops. Target: keep them mounted and drive visibility through the `.sidebar-label` class + `isCollapsed`:
- Brand text block: always rendered; wrapper gets `sidebar-label` + collapsed modifier; add `aria-hidden={isCollapsed}`.
- Section headers: same treatment; on expand they replay `.animate-sidebar-label-in` with `.stagger-N` per section index (cap stagger at 6).
- Nav label+badge `div.flex-1`: same treatment per item; on expand also add `.animate-sidebar-item-in` with stagger by item index within section.
- Collapsed divider (`{isCollapsed && sectionIdx > 0 && ...}`): invert to always-rendered with opacity transition, or keep conditional but add `.animate-sidebar-label-in` on the expanding side only — simplest: render always, toggle `opacity-0`/`opacity-100` with 0.2s state ease.
- Header collapse button + footer swap: crossfade — render both states, toggle opacity/translate (0.2s), `pointer-events-none` + `aria-hidden` on the hidden one. Never unmount mid-animation.
- Collapse sequencing: on collapse, labels play `sidebar-label-out` (0.15s) while the width glides over 0.3s — text is gone before the panel finishes shrinking, so no frame shows full text at `w-16`. On expand, width glides 0.3s and labels play `sidebar-label-in` staggered 60ms — text arrives as space opens.

**B3. Sliding active indicator.** Current: `{isActive && (<span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />)}` mounts instantly per button; `border-l-2 border-primary` toggles instantly in the button className. Target:
- Remove the per-button accent span and the `border-l-2 border-primary` active class (keep `bg-primary/15`, `ring-1 ring-primary/40`, `text-foreground font-semibold`).
- Render ONE `.admin-active-indicator` span inside the nav scroll container. Worker A measures the active button's `offsetTop`/`offsetHeight` via a refs map on tab change and sets `style={{ transform: translateY(offset), height }}`; the 0.25s transform transition slides it between items. On first mount set position without transition (initial flag) to avoid a fly-in from top.
- If measurement fails (ref missing), fall back to `opacity: 0` — never crash, never misplace.

**B4. Nav button transitions.** Current: `transition-all duration-200` on every button (animates everything, including layout-adjacent props). Target: `transition-[background-color,color,border-color,transform,box-shadow] duration-200 var(--ease-state)`; keep the repo-mandated `hover:translate-x-1 hover:border-l-2 hover:border-primary/60 hover:bg-primary/10` slide, now at 0.15s state ease for the transform portion. Icon `transition-colors duration-200` stays.

**B5. Boolean/style hygiene.** Replace any `!isCollapsed` conditional mounts per B2; where a boolean is still needed prefer positive form (`isExpanded`). No `== true`. No mixed-polarity conditions. Blank lines before `if` / after `}` / before `return`.

### File C — `src/pages/Index.tsx` (tab-content wrapper ONLY — do not touch header, login screen, theme map, or handlers)

Current: `{activeTab === 'builder' && <QuizEditor />}` (and eleven siblings) mount instantly — content snaps.

Target: introduce a minimal tab-transition wrapper around the panel block:
- Keep a `previousTab`/`isLeaving` pair in component state. On `activeTab` change: set `isLeaving` true, render the outgoing panel inside a div with `.animate-tab-panel-out`; after 150ms (one `setTimeout`, cleared on unmount / rapid re-click), swap content and clear `isLeaving`.
- The incoming panel wrapper uses `key={activeTab}` + `.animate-tab-panel-in` so the enter animation replays on every switch.
- Reduced-motion path: if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, skip the timeout and swap instantly.
- Scope fence: only the `<div className="p-0">` panel block and its immediate wrapper may change. Login screen, top admin bar, `themeClassMap`, `handleSelectTab`, and all auth logic are untouched.

---

## Acceptance criteria

- **AC1 — No text pop on collapse/expand.** Observable evidence: toggle the sidebar collapse control; brand text, section headers, nav labels/badges, and footer content fade and slide (opacity + translateX) in sync with the 300ms width glide. No frame shows fully-visible text at `w-16`, and no frame shows fully-hidden text at `w-64`. DevTools check: label wrappers never toggle `display: none` mid-animation; they carry transitioning `opacity`/`transform`.
- **AC2 — Sliding active indicator.** Observable evidence: clicking through nav items moves a single accent bar with a visible 0.25s slide between items; the bar never flashes in/out per item. DevTools check: exactly one `.admin-active-indicator` node exists in the nav container; its `transform: translateY(...)` updates on tab change; no `border-l-2` class remains on nav buttons.
- **AC3 — Animated tab switches.** Observable evidence: switching admin tabs fades the outgoing panel out over 0.15s, then the incoming panel enters with a 0.3s opacity + 10px rise. Rapid double-clicking tabs never leaves a stuck or duplicated panel (timeout cleared on unmount). DevTools check: panel wrapper carries `key={activeTab}` and the enter/exit animation classes.

## Explicit non-goals

- Do not touch `src/components/ui/*` (shared primitives).
- Do not touch the theme context (`src/lib/theme-context`) or `ThemeSwitcher`.
- Do not touch presentation-layout / runner / quiz-mode preview components (Spec Agent 2's workstream).
- No new libraries (no framer-motion; Tailwind + `tailwindcss-animate` + hand keyframes only).
- No version bumps, changelog edits, or release notes changes.
- No changes to login screen, top admin bar, or data/auth logic in `Index.tsx`.

# Presentation & Theming Agent Rules

> Authoritative presentation, layout, motion, and theming standards for all AI agents.

## 1. Presentation Slide Layout & Optical Equilibrium
- In 2-column presentation slides, question titles must be vertically centered in the slide canvas (`items-center w-full my-auto lg:self-center`) to establish optical equilibrium.
- The right-hand answer column must be slightly offset downward (`pt-2 lg:pt-6 xl:pt-8`), avoiding both flush-top crowding and excessive downward displacement.
- TOTAL BAN on any `Candidate Response` section, label, or DOM wrapper in runner and presentation views.

## 2. Option Motion & All-Theme Hover System
- Options in presentation and runner modes must rest at semi-transparency (`opacity: 0.82`, `bg-card/75`).
- Hovering an option must trigger:
  - Smooth rightward sliding animation (`transform: translate3d(6px, 0, 0)`).
  - Opacity fade-in to `1.0`.
  - Theme-aware border glow (`border-primary/60`, ambient primary box-shadow).
  - Crisp text-shadow illumination (`rgb(0 0 0) 1px 0.7px 0px` in dark themes; `rgba(0, 0, 0, 0.3) 1px 0.7px 0px` in light themes).

## 3. Backend Admin Console Contrast & Interactivity
- In dark themes (specifically Dracula), admin surfaces must render muted text in crisp lilac-slate (`#BAC7E8`, 7.2:1 contrast ratio) rather than muted comment slate (`#6272A4`).
- Admin sidebar navigation items must feature an active accent bar, high-contrast text (`text-foreground/80`), and an interactive slide hover state (`hover:translate-x-1 hover:border-primary/40`).
- Assessment title inputs in `FormBuilder.tsx` must feature a blended background tint, luminous border accent, and an interactive pencil cue on hover (`group/title`).

## 4. Riseup Brand & Theme Rules
- Brand name must be written as one word (`Riseup`).
- Palette: Dark navy background (`#0A0A14`) paired with cream primary (`#F7F1E6`).
- In Riseup theme, acronyms and technical terms in question titles MUST be highlighted in cream (`#F7F1E6`) with `font-extrabold`.
- Gold (`#E8C547`) is strictly an active indicator mark (selected radio, checkmark, progress pip), never a dominant surface or text color.

## 5. Purple Theme Contrast Standards
- White text (`#FFFFFF`) on deep violet background (`#0F0E1E`) with luminous borders (`#3A3568`).
- Primary action buttons: vivid electric indigo (`#5C45FD`) with hover state (`#4F35F5`) and tactile scale transition (`active:scale-[0.98]`).

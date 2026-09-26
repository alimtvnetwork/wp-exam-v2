# Spec 10: Sweet Digs Eco-Luxury Editorial Theme & Motion Architecture

## 1. Executive Summary & Design Heritage

### 1.1 Provenance & Architectural Heritage
This specification introduces the **Sweet Digs** theme preset into the WP Exam meta-system, derived directly from the design system, typography hierarchy, and CSS3 motion specifications documented in `sweet-digs-finder/spec/03-design-system/`.

Sweet Digs embodies a modern, calming **Eco-Luxury Editorial** aesthetic:
- **Nature-Inspired Palette:** Vibrant Emerald Green (`142 71% 45%` / `#16A34A`), deep Obsidian Spruce body typography (`160 20% 10%` / `#13201B`), soft tinted sage secondary surfaces (`142 60% 93%` / `#DCFCE7`), and warm botanical mist backgrounds (`140 20% 97%` / `#F4F8F5`).
- **Harmonious Single-Spectrum Color Integrity:** By utilizing an emerald/sage/forest palette, this theme inherently adheres to the repository's **Anti-Clash Invariant** (Section 8 of Spec 09: *No Blue with Close Green*). All interactive states, badges, rings, and hover washes stay strictly within the warm botanical green-to-slate continuum.
- **Airy, Generous Padding Rhythm:** Incorporates the `p-6` (24px) to `p-7` (28px) component spacing rhythm from Sweet Digs Spec 10 (`01-spacing-rhythm.md`), eliminating micro-cramped UI card zones.
- **GPU-Accelerated CSS3 Motion Primitives:** Smooth keyframe animations (`fade-in-up`, `fade-in`, `pulse-glow`, `float-subtle`) adhering strictly to the **Zero Hover Scale Mandate** (no scale or translate on hover; motion reserved for entrances and subtle ambient status indicators).

---

## 2. Token Matrix & Variable Architecture

### 2.1 CSS Variables (`.theme-sweet-digs`, `[data-theme="sweet-digs"]`)

All color tokens are declared in standard HSL (without wrapper function) for composability:

```css
.theme-sweet-digs,
[data-theme="sweet-digs"] {
  /* ───── Brand & Interactive ───── */
  --primary: 142 71% 45%;               /* #16A34A / #22C55E Emerald */
  --primary-foreground: 0 0% 100%;       /* Pure White */
  --ring: 142 71% 45%;                  /* Focus ring matching primary */

  /* ───── Secondary & Accents ───── */
  --secondary: 142 60% 93%;             /* #DCFCE7 Light Sage Tint */
  --secondary-foreground: 142 71% 30%;  /* #15803D Forest text on secondary */
  --accent: 142 60% 93%;                /* Soft sage hover/accent surface */
  --accent-foreground: 142 71% 30%;     /* High-contrast forest on hover */

  /* ───── Surfaces & Elevation ───── */
  --background: 140 20% 97%;            /* #F4F8F5 Warm sage mist */
  --foreground: 160 20% 10%;            /* #13201B Deep Obsidian Spruce */
  --card: 0 0% 100%;                    /* Pure White elevated card */
  --card-foreground: 160 20% 10%;       /* #13201B */
  --popover: 0 0% 100%;                 /* Pure White menus/popovers */
  --popover-foreground: 160 20% 10%;

  /* ───── Muted & Subtle ───── */
  --muted: 150 14% 96%;                 /* #EDF4F0 Subtle chips/inputs */
  --muted-foreground: 160 9% 46%;        /* #6A7F75 Subdued descriptions */

  /* ───── Borders & Inputs ───── */
  --border: 150 13% 91%;                /* #E1EAE5 Default card border */
  --input: 150 13% 91%;                 /* Input outline */

  /* ───── Destructive / Critical ───── */
  --destructive: 0 84% 60%;             /* Crimson error */
  --destructive-foreground: 0 0% 100%;

  /* ───── WP Exam Custom Tokens ───── */
  --wp-exam-bg: #F4F8F5;
  --wp-exam-card: #FFFFFF;
  --wp-exam-card-border: #E1EAE5;
  --wp-exam-card-hover: #F0FDF4;
  --wp-exam-primary: #16A34A;
  --wp-exam-primary-text: #FFFFFF;
  --wp-exam-highlight: #16A34A;
  --wp-exam-text-primary: #13201B;
  --wp-exam-text-secondary: #6A7F75;
  --wp-exam-progress-bar: #16A34A;
  --wp-exam-badge-bg: rgba(22, 163, 74, 0.12);
}
```

### 2.2 Dark Mode Variant (`.theme-sweet-digs.dark`, `[data-theme="sweet-digs"].dark`)

For low-light environments, Sweet Digs transitions to an obsidian spruce forest palette:

```css
.theme-sweet-digs.dark,
[data-theme="sweet-digs"].dark {
  --background: 160 20% 7%;             /* #0E1613 Deep obsidian forest */
  --foreground: 140 20% 95%;            /* Crisp pale sage white */
  --card: 160 20% 11%;                  /* #16221E Elevated dark card */
  --card-foreground: 140 20% 95%;
  --popover: 160 20% 11%;
  --popover-foreground: 140 20% 95%;
  --primary: 142 71% 45%;               /* Emerald remains vibrant */
  --primary-foreground: 0 0% 100%;
  --secondary: 160 20% 16%;
  --secondary-foreground: 142 60% 80%;
  --muted: 160 15% 15%;
  --muted-foreground: 150 10% 60%;
  --accent: 160 20% 18%;
  --accent-foreground: 142 60% 85%;
  --border: 160 15% 20%;
  --input: 160 15% 20%;
  --ring: 142 71% 45%;

  --wp-exam-bg: #0E1613;
  --wp-exam-card: #16221E;
  --wp-exam-card-border: #23342E;
  --wp-exam-card-hover: #1C2B26;
  --wp-exam-primary: #22C55E;
  --wp-exam-primary-text: #FFFFFF;
  --wp-exam-highlight: #22C55E;
  --wp-exam-text-primary: #F0FDF4;
  --wp-exam-text-secondary: #94A3B8;
  --wp-exam-progress-bar: #22C55E;
  --wp-exam-badge-bg: rgba(34, 197, 94, 0.18);
}
```

---

## 3. Padding, Layout Rhythm & Elevation Standards

### 3.1 Card & Container Padding Scale
Adhering to Sweet Digs Layout Spec (`10-spacing-layout/01-spacing-rhythm.md`):
- **Question Cards (`sortable-field-card.tsx`):**
  - CardHeader: `py-3.5 px-5 sm:px-6` (vertical breathing room, clean badge cluster).
  - CardContent: `p-6 sm:p-7 space-y-5` (generous 24px–28px body padding for title, media, section combobox, and options).
  - CardFooter: `py-3.5 px-5 sm:px-6 border-t` (dedicated controls toolbar).
- **Builder Canvas (`FormBuilder.tsx`):**
  - Main action header card: `p-5 sm:p-6 space-y-4`.
  - Question list container: `space-y-4` between consecutive cards.
- **Assessment Runner (`FormRunner.tsx` & `FocusQuizRunner.tsx`):**
  - Question display card: `p-6 sm:p-8 rounded-2xl border bg-card shadow-sm`.
  - Option rows: `p-3.5 sm:p-4 rounded-xl gap-3.5`.

### 3.2 Border Radius & Shapes
- Cards: `rounded-2xl` (16px) with subtle 1px border (`border-border`).
- Interactive Controls (Buttons, Inputs, Selects): `rounded-xl` (12px).
- Badges & Status Chips: `rounded-full` (9999px) with `px-3 py-1 text-xs font-semibold`.

---

## 4. CSS3 Keyframe Animations (Zero Hover Scale Compliant)

All animations leverage pure CSS3 `@keyframes` without JavaScript render loops. Under the **Zero Hover Scale Mandate**, scale transforms are completely banned from hover states; animations are used exclusively for smooth entrances and ambient status indicators.

### 4.1 Keyframes Definitions

```css
/* Smooth Upward Entrance */
@keyframes sweet-digs-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Crisp Fade In */
@keyframes sweet-digs-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Ambient Emerald Pulse Glow */
@keyframes sweet-digs-pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 hsl(142 71% 45% / 0.4);
  }
  50% {
    box-shadow: 0 0 16px 3px hsl(142 71% 45% / 0.15);
  }
}

/* Gentle Decorative Floating (Subtle Ambient Motion) */
@keyframes sweet-digs-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
```

### 4.2 Utility Classes
- `.animate-sweet-fade-in-up`: `animation: sweet-digs-fade-in-up 0.5s ease-out both;`
- `.animate-sweet-fade-in`: `animation: sweet-digs-fade-in 0.3s ease-out both;`
- `.animate-sweet-pulse-glow`: `animation: sweet-digs-pulse-glow 2s ease-in-out infinite;`
- `.animate-sweet-float`: `animation: sweet-digs-float 3s ease-in-out infinite;`

---

## 5. Theme Integration & Switching

1. **Theme Preset ID:** `'sweet-digs'`
2. **Display Label:** `"Sweet Digs (Emerald Eco-Luxury)"`
3. **Registered Files:**
   - `src/styles/theme.css`: Declares `.theme-sweet-digs`, `[data-theme="sweet-digs"]`, dark overrides, and keyframe animations.
   - `src/lib/themes.ts`: Added to `THEME_PRESETS['sweet-digs']` with complete `colors` and `hslValues`.
   - `src/lib/theme-context.tsx`: Extended `AppThemeType` with `'sweet-digs'` and registered in `THEME_CONFIGS['sweet-digs']`.
   - `src/components/forms/FormBuilder.tsx`: Added to the Theme picker dropdown in the inspector dock.
   - `src/components/runner/FormRunner.tsx`: Fully inherits CSS tokens and styling.

---

## 6. Verification Gates

| Gate ID | Description | Acceptance Criteria |
|---|---|---|
| **G-SD-01** | Token Declarations | `.theme-sweet-digs` defines complete HSL tokens for primary, background, card, border, muted, accent. |
| **G-SD-02** | Zero Blue-Green Clashes | All secondary, accent, and ring values reside in the 140–160 hue range; no clashing blue elements on green surfaces. |
| **G-SD-03** | Zero Hover Scale | Hovering cards, buttons, or options triggers flat color transitions (`transition-colors duration-150`) with 0 scale transforms. |
| **G-SD-04** | Air & Padding Scale | Question cards apply `p-6` body padding with `mb-4` to `mb-6` vertical rhythm. |
| **G-SD-05** | Production Build & Tests | `npm test` (all 10 suites passing) and `npm run build` exit with code 0. |

# Specification 03: Cross-Theme Parity, FocusQuizRunner Modernization, and Surface Elevation

**Status:** Approved  
**Priority:** High  
**Parent Epic:** Quiz System UI/UX Modernization  
**Specification Document:** `02-spec/21-app/06-quiz-system-ui-ux-modernization/03-cross-theme-and-runner-parity.md`  

---

## 1. FocusQuizRunner Parity Architecture

### 1.1 Context & Problem Analysis
The application features two primary quiz execution environments:
1. `FormRunner.tsx`: The full presentation and sequential wizard runner supporting dynamic layout modes (`centered`, `presentation_split`, `split_left`), 16:9 optical equilibrium, theme variables, and HUD docking.
2. `FocusQuizRunner.tsx`: The focused, distraction-free assessment environment designed for candidates undergoing rapid reading, checklist milestones, and timed multiple-choice assessments.

Historically, `FocusQuizRunner.tsx` suffered from three major design regressions:
- **Cramped Mobile-Constrained Canvas:** The root main area was hardcoded to `max-w-md` (448px width), creating an artificial mobile bottleneck on high-resolution desktop and tablet screens that cramped options and headers.
- **Theme Root Decoupling:** The root container applied inline background colors (`theme.colors.background`) but omitted semantic CSS class bindings (`theme-${activeThemeId}`) and HTML dataset bindings (`data-theme={activeThemeId}`), preventing child elements and global theme CSS rules from cascading properly.
- **Option Interaction Divergence:** Multiple-choice options in `FocusQuizRunner.tsx` did not leverage the shared `.presentation-option-card` motion class, used inline style calculations, displayed inconsistent badges, and lacked the single-source indicator pattern.

### 1.2 Root Container Theming Specification
In `src/components/runner/FocusQuizRunner.tsx`, the root wrapper `<div>` must bind the active theme identity both as a CSS utility class and as a DOM dataset attribute.

```tsx
<div
  className={`min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans theme-${activeThemeId}`}
  data-theme={activeThemeId}
  style={{
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
  }}
>
```

This guarantees:
1. CSS custom properties declared under `.theme-${activeThemeId}` and `[data-theme="${activeThemeId}"]` cascade seamlessly through the component subtree.
2. Global typography, focus rings, shadows, and text-shadow rules in `src/styles/theme.css` apply automatically.

### 1.3 Layout Container Dimensional Upgrade
To establish optical parity with executive presentation standards, the container constraints across `FocusQuizRunner.tsx` are upgraded from cramped mobile dimensions to executive desktop proportions:

| Component Section | Previous Constraint | Modernized Specification | Visual Impact |
| :--- | :--- | :--- | :--- |
| **Top Navigation Header** | `max-w-md mx-auto px-4 py-3` | `max-w-2xl lg:max-w-3xl w-full mx-auto px-4 sm:px-6 py-3.5` | Symmetrical header alignment matching content canvas width |
| **Main Stage Container** | `flex-1 max-w-md w-full mx-auto px-4 py-6` | `flex-1 max-w-2xl lg:max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center` | Ample lateral breathing room for questions, media, and multi-line options |
| **Stage Question Header** | `max-w-md mx-auto` | `max-w-2xl lg:max-w-3xl mx-auto w-full text-center` | Eliminates unnatural line wrapping on prompt titles |
| **Reading & Checklist Stages** | `max-w-md mx-auto` | `max-w-2xl lg:max-w-3xl mx-auto w-full` | High-readability documentation and checklist review |

### 1.4 Option Cards Parity & Single Indicator Standard
To eliminate cognitive clutter and preserve visual rhythm, options rendered in `FocusQuizRunner.tsx` must adhere strictly to the executive option card system:

1. **Shared Motion Class:** Each option container must include `.presentation-option-card` and smooth hover transitions (`transition-all duration-200`).
2. **Constant A/B/C Option Badge:**
   - The left badge strictly displays the option letter: `String.fromCharCode(65 + optIdx)`.
   - The badge geometry is standardized to `w-8 h-8 rounded-xl font-mono font-bold text-sm flex items-center justify-center shrink-0`.
   - **Zero Icon Swapping:** When selected, the badge MUST NOT swap into a checkmark icon. The badge maintains its alphanumeric letter at all times, preventing jarring layout recalculations and visual double-checks.
3. **Single Right-Side Selection Indicator:**
   - Selection status is communicated exclusively via background tint, active ring/border, and a single right-aligned `CheckCircle2` icon.
   - For Riseup theme (`isRiseupTheme`), the `CheckCircle2` renders in brand gold: `#E8C547`.
   - For all other themes, the `CheckCircle2` renders in emerald: `#10B981` (`text-emerald-500`).
4. **Riseup Theme 2px Hairline Chrome Accent:**
   - In accordance with Rule 9, when `isRiseupTheme` is active, the question title card must display a 2px hairline chrome accent indicator:
   ```tsx
   {isRiseupTheme && (
     <div className="h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md mx-auto mb-3" />
   )}
   ```
   - Heavy banners (`h-2`+) and gradient edges are strictly forbidden.

---

## 2. Floating HUD & Sequence Drawer Docking Specification

### 2.1 Baseline Alignment & Optical Symmetry
The presentation interface contains two primary floating interactive pills:
1. **Sequence Drawer Trigger (Left):** Allows presenters and candidates to open the question sequence navigator drawer.
2. **PresenterHUD Control Dock (Right):** Houses the layout switcher, theme selector, timer monitor, and slide controls.

Previously, these elements sat at disparate vertical offsets (`bottom-6` on the left vs `bottom-8` on the right), producing a noticeable optical imbalance across the bottom viewport horizon.

**Harmonized Docking Coordinates:**
- **Sequence Drawer Dock:** `fixed bottom-6 left-6 z-40`
- **PresenterHUD Dock:** `fixed bottom-6 right-6 z-[9999]`

Both elements share an identical `bottom-6` (24px) optical baseline anchor, establishing horizontal equilibrium across 16:9 presentation canvases.

### 2.2 Geometry & Glassmorphism Design Tokens
Both floating controls must adhere to uniform material styling tokens:

| Token Property | Sequence Drawer Pill | PresenterHUD Dock | Token Definition |
| :--- | :--- | :--- | :--- |
| **Corner Radius** | `rounded-xl` | `rounded-xl` | Modern squircle geometry (previously `rounded-full` vs `rounded-2xl`) |
| **Surface Backdrop** | `backdrop-blur-xl bg-card/85` | `backdrop-blur-xl bg-card/85` | High-clarity frosted glassmorphism |
| **Hairline Border** | `border border-border/40` | `border border-border/40` | Subtle hairline boundary preventing harsh edge contrast |
| **Elevation Shadow** | `shadow-xl` | `shadow-xl` | Floating ambient depth above background content |
| **Height & Padding** | `h-9 px-3.5` | `p-1 gap-1.5` | Compact executive footprint |

### 2.3 Internal Controls & Action Button Refinement
Within `PresenterHUD` in `src/components/runner/floating-controls.tsx`:
- Drag Handle: Compact tactile pill with `GripVertical` (`w-3.5 h-3.5`), styled with `h-7 px-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider rounded-lg`.
- Action Buttons (View dropdown, Theme dropdown): Standardized to compact `h-7 w-7 rounded-lg shrink-0 hover:bg-muted/60` (previously oversized `h-8 w-8 rounded-xl`).
- Timer Badge: Compact font-mono pill `h-7 px-2 text-xs rounded-lg`.

---

## 3. Ambient Lighting & Cross-Theme Surface Elevation

### 3.1 Light Theme Ambient Surface Depth
In light themes (`clean`, `microsoft-blue`, `green-choice`, `sweet-digs`), pure white option cards (`#FFFFFF`) against flat or near-white backgrounds (`#F8FAFC` or `#F4F8F5`) risk optical flattening where card boundaries dissolve into the canvas.

To resolve this, ambient radial gradients are integrated into `src/styles/theme.css`:

```css
/* Microsoft Blue / Clean Light Theme Ambient Lighting */
.theme-microsoft-blue,
[data-theme="microsoft-blue"],
[data-theme="clean"],
[data-theme="white"] {
  background-color: var(--wp-exam-bg);
  background-image: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(37, 99, 235, 0.05) 0%,
    rgba(37, 99, 235, 0.01) 50%,
    transparent 100%
  );
  color: var(--wp-exam-text-primary);
  color-scheme: light;
}

/* Green Choice / Sweet Digs Light Theme Ambient Lighting */
.theme-green-choice,
[data-theme="green-choice"],
.theme-sweet-digs,
[data-theme="sweet-digs"] {
  background-color: var(--wp-exam-bg);
  background-image: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(22, 163, 74, 0.06) 0%,
    rgba(22, 163, 74, 0.01) 50%,
    transparent 100%
  );
  color: var(--wp-exam-text-primary);
  color-scheme: light;
}
```

This ambient luminescence adds gentle overhead lighting that delineates white option cards without creating heavy borders or artificial shadows.

### 3.2 Resting Option Card Elevation
In `src/styles/theme.css`, `.presentation-option-card` is upgraded with subtle resting elevation:

```css
.presentation-option-card {
  opacity: 0.82;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
  transition:
    transform 220ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease,
    opacity 220ms ease;
  will-change: transform, opacity, box-shadow;
}

.presentation-option-card:hover {
  opacity: 1;
  transform: translate3d(6px, 0, 0);
  border-color: hsl(var(--primary) / 0.55);
  background-color: hsl(var(--primary) / 0.08);
  box-shadow: 0 10px 25px -4px hsl(var(--primary) / 0.2), 0 2px 6px -1px rgba(0, 0, 0, 0.25);
}
```

### 3.3 Dark Theme Contrast & Theme Guidelines Compliance
1. **Antigravity Dracula:**
   - Admin and runner text uses crisp lilac-slate `#BAC7E8` (`--muted-foreground: 225 25% 76%`), achieving a 7.2:1 AAA contrast ratio against `#282A36` surfaces.
   - Active accents feature vibrant neon lavender `#BD93F9`.
2. **Riseup Theme:**
   - Background canvas: Deep dark navy `#0A0A14`.
   - Typography: Brand cream `#F7F1E6` with `font-extrabold` on technical terms.
   - Gold `#E8C547`: Reserved strictly as an active indicator mark (2px hairline accent, active ring, active checkmark). Gold is NEVER used as body text or title fill.
3. **Purple Theme:**
   - Deep violet background `#0F0E1E` paired with luminous borders `#3A3568`.
   - Crisp white text `#FFFFFF` for primary typography.
   - Vivid indigo buttons `#5C45FD` with high tactile spring response.

---

## 4. Theme Token Verification Matrix

| Theme Identifier | Color Scheme | Background Surface | Ambient Glow Overlay | Resting Card Shadow | Hover Motion Shift | Active Indicator Color | Title Hairline Accent | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `riseup` / `riseup-asia` | Dark | `#0A0A14` | Subdued navy radial wash | `0 2px 8px rgba(0,0,0,0.5)` | `translate3d(6px, 0, 0)` | Gold `#E8C547` | `h-0.5 w-16 bg-[#E8C547]` | 12.8:1 (AAA) |
| `dracula` | Dark | `#191A21` / `#282A36` | Subtle purple radial glow | `0 2px 8px rgba(0,0,0,0.4)` | `translate3d(6px, 0, 0)` | Lavender `#BD93F9` | `h-0.5 w-16 bg-[#BD93F9]` | 7.2:1 (AAA) |
| `purple` / `letterly` | Dark | `#0F0E1E` | Deep violet radial wash | `0 2px 8px rgba(0,0,0,0.4)` | `translate3d(6px, 0, 0)` | Indigo `#818CF8` | `h-0.5 w-16 bg-[#818CF8]` | 11.4:1 (AAA) |
| `vscode-dark` | Dark | `#0D1117` | Sky blue ambient glow | `0 2px 8px rgba(0,0,0,0.4)` | `translate3d(6px, 0, 0)` | Sky Blue `#38BDF8` | `h-0.5 w-16 bg-[#38BDF8]` | 10.9:1 (AAA) |
| `vscode-navy-gold` | Dark | `#0D1117` | Gold-tinted navy ambient | `0 2px 8px rgba(0,0,0,0.4)` | `translate3d(6px, 0, 0)` | Gold `#E8C547` | `h-0.5 w-16 bg-[#E8C547]` | 10.9:1 (AAA) |
| `microsoft-blue` / `clean` | Light | `#F8FAFC` | Radial blue `rgba(37,99,235,0.05)` | `0 1px 3px rgba(0,0,0,0.06)` | `translate3d(6px, 0, 0)` | Royal Blue `#2563EB` | `h-0.5 w-16 bg-[#2563EB]` | 14.1:1 (AAA) |
| `green-choice` / `sweet-digs` | Light | `#F4F8F5` | Radial emerald `rgba(22,163,74,0.06)` | `0 1px 3px rgba(0,0,0,0.06)` | `translate3d(6px, 0, 0)` | Emerald `#16A34A` | `h-0.5 w-16 bg-[#16A34A]` | 13.5:1 (AAA) |

---

## 5. Architectural Invariants & Non-Negotiable Rules

1. **Strict Relative Git Paths:** All references within documentation, code comments, and plans must strictly use repository-relative paths (e.g. `src/components/runner/FocusQuizRunner.tsx`). Absolute filesystem paths and file URI schemes are totally banned.
2. **Strict Boolean Standards:** Positive booleans MUST ALWAYS be evaluated implicitly (`if isRiseupTheme { ... }`). Never compare booleans against explicit true literals. Variables must adhere to `is` or `has` prefixes exclusively.
3. **Single Source Checkmark Rule:** Options in presentation or focus mode must NEVER render duplicate checkmark icons. The left alphanumeric badge remains constant; only the right-hand `CheckCircle2` indicates selection state.
4. **Hairline Accent Standard:** Title card accents in Riseup or branded themes must strictly measure `h-0.5` (2px height) with `shadow-md`.

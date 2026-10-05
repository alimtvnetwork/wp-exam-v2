# Specification 80: Component Spec 04 — Hover Animations, Option Motion & Theme Palettes

**Parent Spec:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  
**Area:** Option Motion, Hover Interactions, Riseup & Purple Theme Guidelines, Buttons  

---

## 1. Problem Statement: Motion & Theme Guidelines Alignment

1. **Option Choice Interactivity Across All Themes:** Choice cards previously lacked rich hover feedback. The user requested:
   - Options should rest slightly blended in with semi-transparency (`opacity: 0.82`, `bg-card/75`).
   - On hover, a smooth sliding animation on top (`transform: translate3d(6px, 0, 0)`), opacity fade-in to `1.0`, colorful border glow, and text brightening with spread text-shadow.
2. **Riseup Brand Palette Alignment (Visual Artifact 5):**
   - In `assets/screenshots/user-feedback-riseup-html-coloring.png`, "HTML" was highlighted in yellow/gold (`#E8C547`).
   - RULE 9 explicitly mandates: "Riseup Brand & Theme Rules: Brand name must be written as one word (`Riseup`). Dark navy background (`#0A0A14`) paired with cream primary (`#F7F1E6`). Gold (`#E8C547`) is strictly an active indicator mark, never a dominant surface or text color."
   - Acronyms in Riseup theme must therefore render in cream `#F7F1E6` with `font-extrabold`; `#E8C547` is strictly reserved for active indicator marks.
3. **Purple Theme Contrast & Buttons:**
   - In presentation mode, purple theme elements must render crisp white text (`#FFFFFF`) on deep violet (`#0F0E1E`) with luminous borders (`#3A3568`) and tactile action buttons.

---

## 2. Multi-Theme Option Motion & Hover System

### 2.1 CSS Utility Specification (`src/styles/theme.css`)
```css
/* Presentation Choice Card Resting & Hover State */
.presentation-option-card {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 200ms ease,
              background-color 200ms ease,
              border-color 200ms ease,
              box-shadow 220ms ease;
  will-change: transform, opacity, box-shadow;
  opacity: 0.82;
}

.presentation-option-card:hover {
  transform: translate3d(6px, 0, 0);
  opacity: 1;
  background-color: hsl(var(--card) / 0.95);
  border-color: hsl(var(--primary) / 0.6);
  box-shadow: 0 8px 24px -4px hsl(var(--primary) / 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.25);
}

.presentation-option-card:hover .option-text,
.presentation-option-card:hover .option-text-shadow {
  text-shadow: var(--option-text-shadow-hover);
  color: hsl(var(--foreground));
  font-weight: 600;
}

.presentation-option-card:hover .option-badge {
  border-color: hsl(var(--primary) / 0.6);
  background-color: hsl(var(--primary) / 0.15);
  color: hsl(var(--primary));
}
```

### 2.2 Text-Shadow Variables Across Themes
```css
:root {
  --option-text-shadow-rest: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  --option-text-shadow-hover: rgba(0, 0, 0, 0.35) 1px 0.7px 0px;
}

.dark,
[data-theme="riseup-asia"],
[data-theme="riseup"],
[data-theme="purple"],
[data-theme="dracula"],
[data-theme="vscode-dark"],
[data-theme="obsidian"],
[data-theme="vscode-navy-gold"] {
  --option-text-shadow-rest: 0 1px 4px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25);
  --option-text-shadow-hover: rgb(0 0 0) 1px 0.7px 0px;
}

.light,
[data-theme="clean"],
[data-theme="clean-wide"],
[data-theme="green-choice"],
[data-theme="sweet-digs"] {
  --option-text-shadow-rest: 0 1px 2px rgba(0, 0, 0, 0.06);
  --option-text-shadow-hover: rgba(0, 0, 0, 0.3) 1px 0.7px 0px;
}
```

---

## 3. Riseup Theme Guidelines Parity

1. **Title Acronym Highlighting:**
   In `renderHighlightedQuestionTitle(title, customHighlight, isRiseupTheme)`:
   - When `isRiseupTheme` is true:
     - Acronyms (e.g. `HTML`, `CSS`) and custom highlight words render in `text-[#F7F1E6] font-extrabold tracking-wide drop-shadow-xs` (brand cream).
     - Base non-highlighted text renders in `text-[#FFF1D6] font-bold`.
   - When `isRiseupTheme` is false:
     - Highlight terms render in `text-primary font-extrabold`.
     - Base text renders in `text-foreground`.
2. **Active Indicator Marks Only:**
   - Gold (`#E8C547`) is strictly applied to:
     - Active radio selection circle (`border-[#E8C547] text-[#E8C547]`)
     - Selected checkmark icon (`<CheckCircle2 className="w-5 h-5 text-[#E8C547]" />`)
     - Active progress bar pip / hairline accent edge (`h-0.5 bg-[#E8C547]`)
   - Gold is **never** applied as dominant text color or title highlight.

---

## 4. Purple Theme Contrast & Presentation Parity

1. **Luminous Border & Canvas:**
   - Background: `#0F0E1E` (deep violet)
   - Surface: `#18162F` with luminous border `#3A3568`
   - Active card border: `#818CF8` with tint `rgba(92, 69, 253, 0.20)`
2. **Typography Contrast:**
   - Pure white text `#FFFFFF` against `#0F0E1E` (13.5:1 AAA contrast)
   - Secondary text `#BAC7E8` (7.2:1 AAA contrast)
3. **Buttons & Controls:**
   - Primary action buttons: vivid electric indigo `#5C45FD` with hover state `#4F35F5` and tactile scale transition `active:scale-[0.98]`.

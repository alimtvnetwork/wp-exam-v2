# Specification 80: Component Spec 04 — Hover Animations, Option Motion & Theme Palettes

**Parent Spec:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  
**Area:** Option Motion, Hover Interactions, Riseup & Purple Theme Guidelines, Buttons  

---

## 1. Problem Statement: Motion & Theme Guidelines Alignment

1. **Option Choice Interactivity Across All Themes:** Choice cards previously lacked rich hover feedback. The user requested:
   - Options should rest slightly blended in with semi-transparency (`opacity: 0.82`, `bg-card/75`).
   - On hover, a smooth sliding animation on top (`transform: translate3d(6px, 0, 0)`), opacity fade-in to `1.0`, colorful border glow, theme tinting, and text brightening with spread text-shadow.
2. **Riseup Brand Palette Alignment (Visual Artifact 5):**
   - In `assets/screenshots/user-feedback-riseup-html-coloring.png` (`media_1791184575662.png`), "HTML" was highlighted in yellow/gold (`#E8C547`).
   - RULE 9 explicitly mandates: "Riseup Brand & Theme Rules: Brand name must be written as one word (`Riseup`). Dark navy background (`#0A0A14`) paired with cream primary (`#F7F1E6`). Gold (`#E8C547`) is strictly an active indicator mark, never a dominant surface or text color."
   - Acronyms in Riseup theme must therefore render in cream `#F7F1E6` with `font-extrabold`; `#E8C547` is strictly reserved for active indicator marks.
   - Buttons in Riseup theme must use cream primary (`#F7F1E6`) with dark navy text (`#0A0A14 font-bold`) and subtle gold active rings.
3. **Purple Theme Contrast & Buttons:**
   - In presentation mode, purple theme elements must render crisp white text (`#FFFFFF`) on deep violet (`#0F0E1E`) with luminous borders (`#3A3568`) and electric violet buttons (`#5C45FD`).

---

## 2. Multi-Theme Option Motion & Hover System

### 2.1 CSS Utility Specification (`src/styles/theme.css` & `src/styles/theme.less`)
```css
/* Presentation Choice Card Resting & Hover State */
.presentation-option-card {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 200ms ease,
              background-color 200ms ease,
              background 200ms ease,
              border-color 200ms ease,
              box-shadow 220ms ease;
  will-change: transform, opacity, box-shadow;
  opacity: 0.82;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03);
}

.presentation-option-card:hover {
  opacity: 1 !important;
  transform: translate3d(6px, 0, 0) !important;
  border-color: hsl(var(--primary) / 0.75) !important;
  background: linear-gradient(90deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--card) / 0.92) 100%) !important;
  box-shadow: 0 10px 30px -4px hsl(var(--primary) / 0.28), 0 2px 8px -1px rgba(0, 0, 0, 0.35) !important;
}

.presentation-option-card:hover .option-text,
.presentation-option-card:hover .option-text-shadow {
  text-shadow: var(--option-text-shadow-hover) !important;
  color: hsl(var(--foreground)) !important;
  font-weight: 600 !important;
}

.presentation-option-card:hover .option-badge {
  border-color: hsl(var(--primary) / 0.75) !important;
  background-color: hsl(var(--primary) / 0.22) !important;
  color: hsl(var(--primary)) !important;
  transform: scale(1.05);
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
   - Gold (`#E8C547`) is strictly an active indicator mark (selected radio indicator, active ring, question number badge).
   - Gold MUST NEVER be applied to title highlights or dominant text.
3. **Button Styling in Riseup Theme:**
   - Next/Submit action button: Cream primary (`bg-[#F7F1E6] hover:bg-[#F7F1E6]/90 text-[#0A0A14] font-bold`) with dark navy text and subtle gold active ring (`active:ring-2 active:ring-[#E8C547]`).

---

## 4. Purple Theme Presentation Enhancements

1. **Background & Cards:** Deep violet background (`#0F0E1E`) paired with card surface (`#18162F`) and luminous border (`#3A3568`).
2. **Action Buttons:** Electric violet (`bg-[#5C45FD] text-white hover:bg-[#5C45FD]/90 shadow-indigo-500/25 border border-[#818CF8]/40`).
3. **Contrast:** Crisp white typography (`#FFFFFF`) with 13.5:1 AAA contrast against deep violet cards.

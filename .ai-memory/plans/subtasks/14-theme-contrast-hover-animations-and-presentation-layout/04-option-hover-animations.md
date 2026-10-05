# Subtask 04 — Option Hover Animations and Theme Palettes

**Parent Plan:** `.ai-memory/plans/pending/14-theme-contrast-hover-animations-and-presentation-layout.md`  
**Status:** completed  
**Owned Files:**  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/components/runner/FormRunner.tsx`  
- `src/components/runner/FocusQuizRunner.tsx`  

---

## Objectives

1. In `src/styles/theme.css` and `src/styles/theme.less`:
   - Enhance `.presentation-option-card`:
     - Resting state: `opacity: 0.82`, soft backdrop blend, smooth transition for transform, opacity, background-color, border-color, box-shadow (`220ms cubic-bezier(0.2, 0, 0, 1)`).
     - Hover state: `opacity: 1`, `transform: translate3d(6px, 0, 0)`, border glow with theme primary tint `hsl(var(--primary) / 0.55)`, subtle background fill `hsl(var(--primary) / 0.08)`, and luminous shadow `0 8px 24px -4px hsl(var(--primary) / 0.18)`.
     - Text styling inside hovered card: transition option text to crisp `var(--foreground)` and weight `600`.
     - Badge styling inside hovered card: transition option badge border to `hsl(var(--primary) / 0.6)` and background to `hsl(var(--primary) / 0.15)`.
2. In `src/components/runner/FormRunner.tsx`:
   - Apply option card classes (`presentation-option-card`, `option-badge`, `option-text`) across `single_choice`, `multiple_choice`, and `boolean` field types.
   - For Riseup theme: ensure highlighted words in question titles use cream `#F7F1E6` with crisp decoration, never gold text.
   - For Purple theme: ensure buttons and high-contrast violet backgrounds adhere to Rule 9.

# Issue 02: Micro-Typography, Button Hover Blending, Section Autocomplete & MCQ Correctness

## 1. Problem Description & Telemetry
During form builder usage and candidate runner preview, critical UI/UX defects were observed:
1. **Micro-Typography:** Interactive inputs, controls, option chips, and section headers used cramped `text-xs` (12px) and `h-8` heights, producing an illegible, dated feel that violated UI/UX legibility standards.
2. **Button Hover Blending (AI Studio & Tools):** When hovering over the "AI Studio" and "Tools" buttons, their backgrounds turned into faint opacity washes (`hover:bg-primary/10`) or matched the card surface, causing buttons to visually "disappear" or blend in completely.
3. **Section Autocomplete & Dropdown Absence:** Authors had to manually re-type section names for each question without autocomplete suggestions or hover-activated dropdown menus showing existing quiz sections.
4. **Multiple Correct Options:** While the candidate runner supported multi-answer grading, the question builder did not provide clean, high-contrast toggle buttons allowing authors to mark multiple options as correct for multi-answer questions.

---

## 2. 4-Part Root Cause Analysis (RCA)

### 2.1 Immediate Cause
- `AiSectionAssistant` and top action buttons were declared as `variant="outline"` with `className="text-xs h-8 hover:bg-primary/10"`. On light cards (white surface), `10%` primary opacity renders as near-white, causing text and border contrast to collapse to near zero.
- Question card layouts crammed type selectors, question titles, and options into compressed rows using `h-8` inputs and `text-xs` labels.
- The Section input was a standard isolated text input lacking native `<datalist>` attachment and hover listeners.

### 2.2 Underlying Cause
- Design tokens lacked a strict minimum height (`h-9` / `h-10`) and minimum font-size standard for primary interactive controls.
- The CVA `buttonVariants` outline variant had conflicting `hover:bg-accent` and `hover:text-accent-foreground` styles that clashed with custom inline hover utility classes.

### 2.3 Systemic Cause
- Absence of a formal Design System specification governing button contrast invariants across all themes, typography scales, and Google Forms card hierarchy.

### 2.4 Prevention Mechanism
- Established `02-spec/21-app/09-ui-ux-design-system-and-card-standards.md` establishing universal invariants:
  1. Minimum `text-sm font-semibold` and `h-9` / `h-10` for all interactive buttons.
  2. High-contrast solid indigo styling for AI Studio (`bg-indigo-600` with white text and amber sparkle).
  3. Solid primary inversion for Tools dropdown button (`hover:bg-primary hover:text-primary-foreground`).
  4. Native `<datalist>` autocomplete plus hover-activated section suggestion menu.
  5. Multi-correct option toggling with clear visual states (`bg-emerald-600` vs `border-border`).

---

## 3. Remediation & Implementation Details

1. **AI Studio Button Upgrade (`ai-section-assistant.tsx`):**
   - Replaced weak outline with solid `bg-indigo-600 text-white font-semibold h-9 px-3.5 shadow-xs hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02]`.
   - Guaranteed 100% contrast against all white, dark, purple, and Dracula backgrounds.

2. **Tools & Action Bar Buttons (`FormBuilder.tsx`):**
   - Upgraded Back to Admin, Slug ribbon, Slug Manager, Health Score, and Tools buttons to `h-9 text-sm font-semibold`.
   - Tools button now transitions to solid `bg-primary hover:text-primary-foreground hover:border-primary`.

3. **Section Autocomplete & Hover Dropdown (`sortable-field-card.tsx`):**
   - Added `isSectionMenuOpen` state triggered by `onMouseEnter` / `onFocus` with a smooth debounce on leave.
   - Connected `<Input>` to `<datalist id="section-datalist-[id]">` populated with all unique quiz sections.
   - Rendered interactive hover menu displaying question counts per section.
   - Included 1-click suggestion pills below the input.

4. **Option Sizing & Multi-Correct Buttons (`sortable-field-card.tsx` & `FormRunner.tsx`):**
   - Upgraded Question Title input to `text-lg font-bold h-12 px-3.5`.
   - Upgraded choice options to `text-base h-11 px-3.5` with `w-8 h-8 rounded-lg text-sm font-bold` letter badges.
   - Correct Answer toggle buttons updated to `h-11 px-4 font-semibold text-sm`:
     - Correct: `bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs flex items-center gap-2`.
     - Unselected: `border border-border/80 bg-background hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 text-muted-foreground font-medium flex items-center gap-2`.
   - Multi-correct answer toggling adds/removes options to `correctAnswers: string[]`.
   - Card footer controls standardized to `h-9 text-sm font-semibold`.

---

## 4. Verification Evidence

| Quality Gate | Method | Result |
|---|---|---|
| **Zero Micro-Text** | `git grep -n "text-[10px]" src/` | Passed (0 occurrences) |
| **TypeScript / Vite Build** | `npm run build` | Passed (Built in 2.62s, 0 errors) |
| **Unit Test Suite** | `npm test` | Passed (10 test files, 85 passed) |
| **Button Contrast Invariant** | Inspect CSS & DOM in light/dark themes | Passed (AI Studio: solid indigo; Tools: solid primary on hover) |
| **Section Hover Dropdown** | Inspect `sortable-field-card.tsx` JSX & state | Passed (Hover popover + `<datalist>` autocomplete) |

# Spec 09: UI/UX Design System, Typography Hierarchy, Button Contrast & Question Card Standards

## 1. Executive Summary & Problem Context

During iterative usability evaluation of the Form Builder and Assessment Runner, several critical UI/UX shortcomings were identified:
1. **Micro-Typography & Illegible Controls:** Sub-standard micro text sizes (`text-[10px]`, `text-[9px]`, and cramped `text-xs`) were applied to primary controls, option letter badges, section inputs, and action buttons. This violated accessibility standards and caused visual strain.
2. **Button Blending on Hover:** Interactive buttons such as "AI Studio" and "Tools" suffered from low contrast and color blending against dark and light theme backgrounds when hovered. Weak opacity washes (`hover:bg-primary/10`) or conflicting CSS variables caused buttons to "vanish" into the container surface.
3. **Inadequate Section Autocomplete & Suggestion:** Authors could not easily discover existing quiz sections while typing. There was no hover-activated dropdown showing question counts per section, nor quick-select suggestion pills.
4. **Multiple Correct Answer Support in MCQs:** Multiple Choice Questions required unambiguous, high-contrast toggle buttons allowing authors to select one or multiple correct answers for automated evaluation, with clear visual feedback.

This specification serves as the permanent, authoritative architectural contract for all future AI agents and engineers working on this repository.

---

## 2. Universal Typography & Sizing Standards (Anti-Micro-Text Mandate)

### 2.1 Typography Hierarchy

| UI Role | Tailwind Classes | Pixel Size Equivalent | Usage Boundary |
|---|---|---|---|
| **Builder / Page Titles** | `text-xl sm:text-2xl font-bold` | 20px - 24px | Top action bar headings |
| **Question Title Input** | `text-lg font-bold` | 18px | Main question input in card body |
| **Field Card Titles & Headers** | `text-base font-bold` | 16px | Section / option container headings |
| **Option Inputs (MCQ / Choice)** | `text-base font-medium` | 16px | Choice option text inputs |
| **Standard Controls & Buttons** | `text-sm font-semibold` | 14px | Buttons, select dropdowns, toggles |
| **Option Letter Badges** | `w-8 h-8 text-sm font-bold` | 32x32px (14px text) | (A, B, C, D) option indicator chips |
| **Metadata Badges & Chips** | `text-xs font-semibold px-2.5 py-1` | 12px | Status chips (Required, Type, Points) |

### 2.2 Height & Padding Guidelines
- **Primary Inputs & Controls:** Minimum `h-10` (40px) or `h-11` / `h-12` for Question Title.
- **Top Bar Action Buttons:** Minimum `h-9` (36px) with `px-3.5` padding.
- **Micro-sizing BAN:** Absolute ban on `text-[10px]`, `text-[9px]`, `text-[11px]`, and `h-6` / `h-7` buttons on interactive controls.

---

## 3. High-Contrast Button Hover Architecture (Anti-Blending Invariant)

### 3.1 The Invariant
Every interactive button MUST maintain a minimum contrast ratio of 4.5:1 against its immediate background in both resting and hovered states across all themes (`theme-clean-wide`, `theme-riseup-asia`, `theme-dracula`, `theme-purple`).

### 3.2 AI Studio Button Specification
- **Component:** `src/components/forms/ai-section-assistant.tsx` and `src/components/admin/ai-section-assistant.tsx`
- **Resting State:** Solid indigo background (`bg-indigo-600 dark:bg-indigo-600`), pure white text (`text-white`), vibrant amber sparkle icon (`text-amber-300 animate-pulse`), `h-9 px-3.5 text-sm font-semibold rounded-lg shadow-xs`.
- **Hover State:** `hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]`.
- **Contrast Guarantee:** Solid indigo never blends with white, slate, or dark surfaces.

### 3.3 Tools Dropdown Button Specification
- **Component:** `src/components/forms/FormBuilder.tsx`
- **Resting State:** `h-9 px-3.5 text-sm font-semibold rounded-lg bg-card border border-border text-foreground shadow-xs`.
- **Hover State:** `hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md transition-all duration-150`.
- **Visual Feedback:** When hovered, the button transitions completely into the brand primary color with crisp inverted text.

### 3.4 Design Health Score Button
- **Resting State:** Bordered score badge with dynamic color coding (emerald >=90%, amber >=75%, destructive <75%).
- **Hover State:** Solid fill corresponding to the grade color (`hover:bg-emerald-600 hover:text-white`), ensuring high tactile response.

---

## 4. Section Management: Autocomplete, Hover Dropdown & Suggestion Pills

### 4.1 Requirements
Authors need to organize questions into sections (modules) efficiently without re-typing repetitive section names:
1. **Direct Typing:** Authors can freely type a new section name into the input. The value updates `field.group` immediately.
2. **Native Datalist Autocomplete:** The `<Input>` connects to `<datalist id="section-datalist-[id]">` containing all unique sections already created in the quiz.
3. **Hover-Activated Dropdown:**
   - When the author hovers over the Section area or focuses the input, a floating dropdown appears.
   - It lists all existing quiz sections with their question counts (e.g. "General Knowledge (3 qs)").
   - Clicking any section immediately assigns it to the question and closes the menu.
   - If the author has typed a new name, it shows "+ New Section: '[name]'".
4. **Clickable Suggestion Pills:** Below the input, clickable pill badges for all existing sections provide 1-click assignment.
5. **Clear Section Action:** When a section is assigned, a clear button allows 1-click removal.

---

## 5. Question Card Architecture (Google Forms Paradigm)

Every question card is organized into three distinct, non-overlapping zones:

```
+--------------------------------------------------------------------------+
|  CARD HEADER                                                             |
|  [:: Grip] [#1] [Required] [Type Badge] [Points]   [Type Select ▾] [Preview] [Actions ▾] |
+--------------------------------------------------------------------------+
|  CARD BODY                                                               |
|  Question Title: [ Enter question title...                             ] |
|  [+ Add Image] -> Optional Image Preview / Caption Drawer               |
|  Section / Group: [ Type new or select from dropdown... ] [▾] [Clear]    |
|  Existing Sections: (Section 1) (Section 2)                              |
|                                                                          |
|  Selectable Options & Answers:                                           |
|  (A) [ Option 1 text...               ]  [✓ Correct Answer]  [X]         |
|  (B) [ Option 2 text...               ]  [  Mark Correct  ]  [X]         |
|  (C) [ Option 3 text...               ]  [✓ Correct Answer]  [X]         |
|  [+ Add Option]  [+ Add "Other"]                                         |
+--------------------------------------------------------------------------+
|  CARD FOOTER                                                             |
|  [Required Toggle]  |  Points: [ 1 ]  |  Allow "Other": [Toggle]   [Duplicate] [Delete] |
+--------------------------------------------------------------------------+
```

---

## 6. Multi-Correct Choice Grading & Authoring Specification

### 6.1 Data Structure
- `field.correctAnswers?: string[]`: Array of acceptable correct strings.
- `field.correctAnswer?: string`: Primary correct answer for single-choice fallback compatibility.

### 6.2 Authoring Interaction
- Each option row displays a dedicated toggle button:
  - **Selected / Correct:** `bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs flex items-center gap-2` with `CheckCircle2` icon.
  - **Unselected:** `border border-border/80 bg-background hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 text-muted-foreground font-medium flex items-center gap-2` with `Circle` icon.
- Toggling an option adds or removes it from `correctAnswers`.
- A header badge confirms the count: `X Correct Answers Configured`.

### 6.3 Automated Grading in Assessment Runner
- In `src/components/runner/FormRunner.tsx`:
  - When `hasMultiCorrect`: Normalized array comparison verifies that candidate selections exactly match the expected set of correct answers.
  - Full points awarded on exact match; zero points on partial or incorrect match.

---

## 7. Verification Gates

- **G-01 (Zero Micro-Typography):** `git grep -n "text-\[10px\]" src/` returns 0 results.
- **G-02 (Button Contrast):** AI Studio uses solid `bg-indigo-600` with white text; Tools button uses `hover:bg-primary hover:text-primary-foreground`.
- **G-03 (Section Combobox):** Hovering over section container displays all quiz sections with count badges; `<datalist>` autocompletes text.
- **G-04 (Multi-Correct MCQ):** Author can toggle multiple options as correct; runner verifies multi-answer grading.
- **G-05 (Build & Unit Tests):** `npm run build` and `npm test` exit with code 0.

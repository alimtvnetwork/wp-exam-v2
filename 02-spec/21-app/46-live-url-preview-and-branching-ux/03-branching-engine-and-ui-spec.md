# Spec [46]: Branching Engine & UI Specification

## 1. Engine Logic Contracts (`src/lib/branching-engine.ts`)

### A. Value Evaluation (`evaluateConditionRule`)
- **Array-awareness:** If `actualValue` is an array (e.g. multi-select checkboxes), `hasValue` evaluates to `true` if and only if `actualValue.length > 0`.
- **Empty operators:**
  - `is_empty`: Returns `!hasValue`.
  - `is_not_empty`: Returns `hasValue`.
- **String & Option matching:**
  - If `actualValue` is an array, `equals` checks for single-element match; `contains` checks if array contains expected value.
  - If `actualValue` is scalar, lowercase trimmed strings are compared.
- **Numeric comparison operators:**
  - `greater_than`: `actualNum > expectedNum`
  - `less_than`: `actualNum < expectedNum`
  - `greater_than_or_equal`: `actualNum >= expectedNum`
  - `less_than_or_equal`: `actualNum <= expectedNum`

### B. Navigation Traversal & Step History
- **Navigation History Stack:**
  - `FormRunner.tsx` maintains `stepHistory: number[]`.
  - Advancing forward pushes `currentStep` to `stepHistory`.
  - Clicking "Previous" pops from `stepHistory`, returning to the exact step the user came from.
- **Jump Target Validation in `getNextStepIndex`:**
  - `jump_to` in condition rules and `optionBranching` must verify `evaluateFieldVisibility` on target questions before jumping.
  - If target is hidden or cycle detected, advances to the next visible step.

---

## 2. Authoring UI/UX Contracts

### A. Absolute Question Numbering
- In `BranchingRuleEditor.tsx`, all question references must compute their 1-based index from `allFields`:
  `const questionNumber = allFields.findIndex(f => f.id === targetId) + 1;`
  Question 4 is always displayed as `#4`, eliminating relative index discrepancies.

### B. Split Configuration Sections
1. **Section 1: Question Visibility & Requirement**:
   - Explicit radio choice: "Show this question if..." / "Hide this question if...".
   - Rule condition builder with "AND (All)" / "OR (Any)" toggle.
2. **Section 2: Direct Option Routing Table**:
   - For choice and true/false fields, an intuitive table maps each selectable option to its target question.
   - Defaults to "Next Question (Default)".
   - Warns if jump target points backwards.

### C. Visual Status on Question Cards (`SortableFieldCard.tsx`)
- Card header displays informative rule summary badges:
  - `⚡ Depends on Q1 = "Yes"`
  - `➔ Routes to Q4 on "React"`
- One-click button to open the Branching drawer.

### D. Interactive Simulation (`BranchingFlowModal.tsx`)
- Includes an interactive Step-by-Step Wizard Test Simulator (Next / Previous buttons) alongside the single-page visibility checker.
- Audit diagnostic banner reporting total questions, branching points, and cycle status.

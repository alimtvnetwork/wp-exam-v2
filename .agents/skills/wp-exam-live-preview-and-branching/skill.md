---
name: wp-exam-live-preview-and-branching
description: Live URL routing contracts, live form preview mechanics, and Directed Acyclic Graph (DAG) branching engine architecture for WP Exam forms and quizzes.
---

# WP Exam: Live Preview & Branching Engine Architecture

This skill governs the routing architecture, public live URL synchronization, and the conditional branching engine across WP Exam.

## 1. Live Preview & URL Routing Contracts

### A. The "Same URL" Prevention Rules
- The application must NEVER leave the browser location static when switching between admin tabs or running live quizzes.
- All admin tabs in `src/pages/Index.tsx` synchronize two-way with search params (`?tab=builder`, `?tab=projects`, `?tab=focus-runner`, `?tab=results`, `?tab=invites`, `?tab=logs`).
- Public candidate URLs must NEVER route to or contain `/admin`.
- Public quiz links generated in `src/components/runner/FocusQuizRunner.tsx` use the canonical route:
  `${origin}/runner?quiz=${config.id}&q=${questionIndex + 1}`
- Public candidate invite links generated in `src/components/admin/invites-manager.tsx` route directly to:
  `${origin}/runner?invite=${token}`

### B. Live Form Preview Precedence
- In `src/components/runner/FormRunner.tsx`, active form resolution follows strict priority order:
  1. `initialForm` (passed directly from FormBuilder or parent preview modal).
  2. Active form from `useQuizStore` (hydrated when visiting `/preview` or `?preview=true`).
  3. `PRESET_PROJECTS[selectedProjectId]` fallback.
- Forms edited in FormBuilder are automatically saved to `useQuizStore.activeForm` on every modification, ensuring full-screen `/preview` tabs render the latest changes in real-time.

---

## 2. Branching Engine Architecture (`src/lib/branching-engine.ts`)

The branching engine handles both runtime execution during quizzes and author-time graph validation.

### A. Condition Rule Evaluation (`evaluateConditionRule`)
- **Array-awareness:** Evaluates multi-select arrays (`actualValue: string[]`) properly:
  - `is_empty`: Evaluates to `true` if array has length 0.
  - `is_not_empty`: Evaluates to `true` if array has length > 0.
  - `contains`: Checks if array includes expected choice.
  - `equals`: Checks if single-element array equals expected choice.
- **Numeric Comparisons:**
  - `greater_than` (`>`), `less_than` (`<`), `greater_than_or_equal` (`>=`), `less_than_or_equal` (`<=`).
- **Case-insensitivity:** All string comparisons are trimmed and lowercased.

### B. Navigation Traversal & Step History Stack
- Sequential progression maintains a traversal history stack: `stepHistory: number[]`.
- Advancing forward pushes the current step index: `stepHistory.push(currentStep)`.
- Reversing backward calls `rewindStep(fields, { currentStep, history }, answers)`:
  - Pops the previous step from `history`.
  - Re-evaluates field visibility to ensure the user does not land on a field that was hidden by prior answer changes.
- Jump target validation in `getNextStepIndex`:
  - When evaluating `jump_to` rules or `optionBranching`, `evaluateFieldVisibility` is checked on the destination question.
  - If the target question is hidden, execution falls back safely to the next visible step.

### C. Cycle Detection & Graph Safety (`detectBranchingCycles`)
- Evaluates the entire form as a directed graph where nodes are question IDs and edges are jump rules (`conditions.jump_to`, `optionBranching`, `branchTarget`).
- Runs depth-first search (DFS) with recursion stack tracking to detect cycles.
- Returns a `BranchingCycleReport`:
  - `hasCycles: boolean`
  - `cycleNodes: string[]`
  - `description: string`

---

## 3. FormBuilder UI/UX Best Practices

1. **Absolute Question Numbering:**
   - Always resolve question display numbers from `allFields.findIndex(f => f.id === targetId) + 1`.
   - Never rely on filtered `otherFields` indices which shift question numbers.
2. **Author Feedback Badges:**
   - Display informative rule summaries on `SortableFieldCard` badges (e.g. `Depends on #1`, `2 Choice Jump(s)`).
3. **Interactive Simulation:**
   - `BranchingFlowModal` provides two complementary views:
     - **Architecture View:** Complete list of fields with incoming rules, outgoing routes, and real-time visibility calculation.
     - **Step Simulator:** Interactive wizard allowing form creators to step forward and backward through the candidate journey with dynamic jump destination alerts.

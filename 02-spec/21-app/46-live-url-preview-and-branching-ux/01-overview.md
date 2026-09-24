# Spec [46]: Live URL, Live Preview & Branching Engine UX Overhaul

## 1. Verbatim User Request
> "Live URL , Live preview doesn't work properly??
> Same url why ??
> branching needs to fix and also make the UI and UX better pelase it is not yet
> Read the whole codebase properly, please.
> And understand everything please so that you can make future changes easily.
> Is it possible for you to create skills set for this codebase please.
> Also read properly the last 20 commits changes to understand the code base, please
> Do the learning with multiple agents parallelly
> Do a git pull first."

---

## 2. Problem Statement & Root Cause Diagnosis

### A. Live Preview & "Same URL" Defect
1. **Live Preview Ignored Custom Form:** In `src/components/runner/FormRunner.tsx`, `getInitialProjectId()` returned `'intern-programmer'` by default. The active form resolution evaluated `PRESET_PROJECTS[selectedProjectId]` before `initialForm`. As a result, opening Live Preview in FormBuilder or Live Runner in admin always rendered the static "Intern Programmer" preset with SQL injection questions rather than the user's active form.
2. **Static Admin URL ("Same URL"):** In `src/pages/Index.tsx`, all admin tabs (`builder`, `projects`, `focus-runner`, `runner`, `invites`, etc.) were controlled by local React state without URL query synchronization. The browser URL stayed at `/admin` across all views.
3. **Admin URL Leakage in Public Share Links:** `FocusQuizRunner.tsx` built share links using `window.location.pathname`. When opened from `/admin`, it generated `${origin}/admin?quiz=...&q=...`, which forced unauthenticated candidates into the admin login screen.
4. **Dropped Project in Hierarchy Runner:** `ProjectHierarchyManager` passed `project` to `onLaunchFocusRunner(project)`, but `Index.tsx` discarded the parameter, causing `FocusQuizRunner` to always load `DEFAULT_SAMPLE_CONFIG` (`letterly-sample`) and generate the identical URL.
5. **Broken Invite Links:** `invites-manager.tsx` copied links to `/wp-exam-runner/?invite=...`, which did not exist in `App.tsx` routes and returned 404.

### B. Branching Engine & UX Defects
1. **Relative Numbering Skew:** `BranchingRuleEditor` displayed question indices using `otherFields.map((of, ofIdx) => ...)` (`#ofIdx + 1`), which was off by 1 or more from the actual question number in the form.
2. **Broken Sequential Backward Navigation:** `getPreviousStepIndex` scanned linearly backwards (`currentStep - 1`). If a candidate jumped from Q1 to Q5 via branching, clicking "Previous" dumped them into Q4 (a question in the skipped branch) instead of returning to Q1.
3. **Empty Array Evaluation:** In `evaluateConditionRule`, `[]` evaluated as non-empty in JavaScript, breaking `is_empty` and `is_not_empty` for multi-select choice fields.
4. **Missing Numeric Comparisons:** Rating and scored fields could not evaluate `greater_than` or `less_than`.
5. **Jump Target Visibility:** `jump_to` in condition rules did not check whether the target question was visible.
6. **Visual and UX Clutter:** Lack of a dedicated Option Routing table, lack of step-by-step simulator in `BranchingFlowModal`, and lack of distinct rule badges on `SortableFieldCard`.

---

## 3. Architecture Blueprint

```
+-----------------------------------------------------------------------------------------+
|                                    USER INTERACTION                                     |
|  - FormBuilder: Edits fields, configures branching, clicks "Live Preview" or "Copy URL"|
|  - WpAdminSidebar: Clicks tabs -> URL updates to /admin?tab=<tab_id>                     |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                          URL ROUTING & LIVE PREVIEW ENGINE                              |
|  - /admin?tab=<tab_id> : Synchronized with activeTab in Index.tsx                       |
|  - /preview             : Dedicated full-screen live preview of active builder form      |
|  - /runner?preview=true : Dynamic preview of useQuizStore form                          |
|  - /runner?invite=<tok> : Auto-authenticates candidate token                            |
|  - /wp-exam-runner      : Alias route redirecting cleanly to /runner                     |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                   BRANCHING ENGINE                                      |
|  - evaluateConditionRule: Array-aware, numeric comparison operators (>, <, >=, <=)     |
|  - Step History Stack: [Q0, Q4] -> "Previous" pops stack, correctly returns to Q0        |
|  - Target Visibility Verification: jump_to targets verified visible before jumping      |
|  - Absolute Question Numbering: allFields.findIndex(f => f.id === targetId) + 1         |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                BRANCHING UI/UX SYSTEM                                   |
|  - SortableFieldCard: Rule summary pills (⚡ Depends on Q1 = "Yes", ➔ Routes to Q4)     |
|  - BranchingRuleEditor: Split into "Visibility Rules" and "Direct Option Routing Table" |
|  - BranchingFlowModal: Dual-mode with Step-by-Step Interactive Wizard Simulator         |
+-----------------------------------------------------------------------------------------+
```

# Spec [46]: Verification Gates

## Acceptance Criteria

### Gate 1: Live Preview & URL Resolution Conformance
- [ ] **AC-01:** Opening Live Preview in `FormBuilder` displays the active form created by the author, NOT the preset "Intern Programmer".
- [ ] **AC-02:** Opening `/preview` or `/runner?preview=true` directly in the browser loads the current active builder form from the store.
- [ ] **AC-03:** Switching tabs in `/admin` updates the URL query string (e.g. `/admin?tab=projects`, `/admin?tab=focus-runner`), and refreshing the browser preserves the active tab.
- [ ] **AC-04:** Public share links in `FocusQuizRunner` never contain `/admin`.
- [ ] **AC-05:** Candidate invite links in `invites-manager` point to `/runner?invite=...`, and `/wp-exam-runner` routes cleanly without 404.

### Gate 2: Branching Engine & Navigation Conformance
- [ ] **AC-06:** In sequential mode, jumping forward via option branching or `jump_to` records the step in `stepHistory`. Clicking "Previous" returns directly to the originating question.
- [ ] **AC-07:** Empty arrays `[]` evaluate as empty in `is_empty` and non-empty in `is_not_empty`.
- [ ] **AC-08:** Numeric comparison operators (`greater_than`, `less_than`, etc.) function correctly for rating and point fields.
- [ ] **AC-09:** `jump_to` verifies target field visibility and does not jump to hidden questions.

### Gate 3: UI & Authoring Conformance
- [ ] **AC-10:** Question indices in `BranchingRuleEditor` match the real 1-based question numbers in the form (`allFields`).
- [ ] **AC-11:** FormBuilder provides a dedicated Live URL toolbar with real-time URL display, "Copy Live URL", and "Open in New Tab" buttons.
- [ ] **AC-12:** `SortableFieldCard` renders distinct badges summarizing active incoming conditions and outgoing routes.

### Gate 4: Quality & Test Conformance
- [ ] **AC-13:** ESLint reports 0 errors.
- [ ] **AC-14:** Vitest passes 100% of unit tests.
- [ ] **AC-15:** Vite production build succeeds.

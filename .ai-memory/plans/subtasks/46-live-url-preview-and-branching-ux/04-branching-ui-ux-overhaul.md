# Subtask [04]: Branching UI/UX Overhaul & Absolute Question Numbering
Traceability ID: Task-04
Spec Reference: [02-spec/21-app/46-live-url-preview-and-branching-ux/03-branching-engine-and-ui-spec.md](02-spec/21-app/46-live-url-preview-and-branching-ux/03-branching-engine-and-ui-spec.md)
Target Files: src/components/forms/branching-rule-editor.tsx, src/components/forms/sortable-field-card.tsx, src/components/forms/branching-flow-modal.tsx
Action: Replace relative index numbering with authoritative `allFields` 1-based index; separate visibility rules from option routing table; add informative branching pills to `SortableFieldCard`; add Step-by-Step interactive wizard simulator to `BranchingFlowModal`.
Acceptance Criteria:
- Question numbers in dropdowns always match the question number in the form.
- Option routing table provides clear dropdown per option.
- Simulator allows clicking through sequential steps with live feedback.
Targeted Verification: npm run lint

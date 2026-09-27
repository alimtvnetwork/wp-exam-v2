# Subtask 03: Citations Modal Auto-Expansion, Poppins Header & Single Left Delete
Traceability ID: Task-05
Spec Reference: [02-spec/21-app/18-presentation-ui-ux-and-links-parser.md](../../../02-spec/21-app/18-presentation-ui-ux-and-links-parser.md)
Target Files: src/components/forms/sortable-field-card.tsx
Action: In citations / reference links modal: ensure Item #1 header uses Poppins font (`font-sans text-xs font-semibold`), implement auto-expanding rows so filling out the current row automatically appends the next empty row, remove redundant "Add Citation" button, place the delete icon cleanly on the left-hand side of each row, remove redundant second cross icon, expand modal to `max-w-2xl sm:max-w-3xl` with generous padding, and integrate Quick Paste supporting all 5 citation formats with sample preview tabs.
Acceptance Criteria:
- Item #N headers strictly render in Poppins font (`font-sans`).
- Filling an item automatically adds an empty row for next entry.
- Delete button is positioned on the left side of the row.
- Quick Paste auto-detects and parses all 5 formats.
Targeted Verification: TypeScript compile check.

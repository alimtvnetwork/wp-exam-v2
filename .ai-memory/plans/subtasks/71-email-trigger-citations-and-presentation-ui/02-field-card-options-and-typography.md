# Subtask 02: Field Card MCQ Checkmark, Option Row Dimensions & Typography REM
Traceability ID: Task-02, Task-03, Task-04
Spec Reference: [02-spec/21-app/18-presentation-ui-ux-and-links-parser.md](../../../02-spec/21-app/18-presentation-ui-ux-and-links-parser.md)
Target Files: src/components/forms/sortable-field-card.tsx
Action: Standardize option row elements to exact `h-10 rounded-lg` across Letter Badge (`w-10 h-10`), Option Input (`h-10`), Checkmark button (`w-10 h-10` with single `<Check>` icon and hover indicator), and Delete button (`w-10 h-10`). Ensure "Other" option row matches exact `w-10 h-10` and `h-10`. Reduce question title font size to `text-[0.95rem] sm:text-base` using REM units. Group footer secondary actions into a compact overflow dropdown on reduced widths.
Acceptance Criteria:
- Single clean checkmark button with tooltip for correct answer.
- Zero duplicate correct answer badges or configure buttons.
- All option rows, badges, and buttons have identical `h-10` height.
- Card footer secondary actions collapse gracefully on small screens.
Targeted Verification: TypeScript compile check.

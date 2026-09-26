# Subtask 02: Compact Health Score Badge with Rich HoverCard

> **/goal** Convert the wide Health Score button in `FormBuilder.tsx` into a compact badge trigger with a rich Radix `HoverCard` breakdown popover.
> **/learn** Grounded on `assets/screenshots/65-wpexam-header-layout-02.png` and `02-spec/21-app/12-formbuilder-header-streamlining.md`.

## Target Files
- `src/components/forms/FormBuilder.tsx`

## Mandatory Requirements
1. **Compact Health Trigger**:
   - Replace verbose `Health: 100% [A+]` button with compact `<Button variant="outline" size="sm" className="h-9 px-2.5 gap-1.5 font-bold rounded-xl">`.
   - Displays `<Shield className="w-4 h-4 text-emerald-500" />`, score (e.g. `100%`), and grade badge (e.g. `A+`).
2. **Rich HoverCard Popover**:
   - Wrap trigger in `<HoverCard openDelay={200} closeDelay={150}>`.
   - On hover, reveal `<HoverCardContent align="end" className="w-80 p-3.5 space-y-3 rounded-xl border border-border bg-popover shadow-xl">`.
   - Shows: Score %, Grade, Issues/Warnings count, Total Questions, Required Fields, Grading Points, and an "Open Full Health Inspector" button linking to the audit dock tab.
3. **Responsive Aesthetics**:
   - Clean transitions (`duration-150`), solid contrast, zero layout jumps.

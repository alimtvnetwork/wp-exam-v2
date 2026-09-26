# Subtask 02: Consolidate Alignment Controls & Icon-Only Duplicate/Delete Actions

> **/goal** Eliminate the 3x repeated alignment buttons, consolidate into a single dedicated toggle, and convert wide Duplicate and Delete text buttons into sleek icon buttons with tooltips.
> **/learn** Grounded on `assets/screenshots/66-question-card-redesign-01.png` and `02-spec/21-app/13-question-card-and-exam-intelligence.md`.

## Target Files
- `src/components/forms/sortable-field-card.tsx`

## Requirements
1. **Consolidated Alignment**:
   - Remove repeated `Left | Center | Right` buttons from Preview header, options body, and footer.
   - Keep a single clean alignment segment in the field options bar.
2. **Icon-Only Actions in Footer**:
   - Replace bulky `[Duplicate]` and `[Delete]` buttons with `<Button variant="outline" size="icon"><Copy /></Button>` and `<Button variant="ghost" size="icon"><Trash2 /></Button>` with rich tooltips.
3. **Streamlined Preview Button in Card Header**:
   - Combine Preview and Actions into compact, high-contrast controls without washed-out text.

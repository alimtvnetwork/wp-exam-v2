# Subtask 03: Enhanced Dropdown Engine (Runner & Builder)

> **/goal** Implement searchable dropdowns with sequenced letters A, B, C, display label vs stored internal value mapping, and custom "Other" inline typing support.
> **/learn** Positive booleans only, zero explicit true checks, strict relative paths.

## Target Files
- `src/components/runner/FormRunner.tsx`
- `src/components/forms/sortable-field-card.tsx`

## Tasks
1. Searchable Dropdown with Sequenced Badges:
   - In `FormRunner.tsx`, replace raw `<select>` with a modern interactive Popover / Command / Searchable Select.
   - Each option displays `[A]`, `[B]`, `[C]` sequence indicator.
   - Built-in search filtering input allows quick filtering of long lists.
2. Display Label vs Stored Value Mapping:
   - Support `field.dropdownOptions: { label: string; value: string }[]`.
   - If user selects an item, `value` is stored in `answers[field.id]`, while `label` is rendered in the UI.
   - Backwards compatible with legacy string `options`.
3. Custom "Other" Typing Support:
   - When `field.allowOtherOption` is enabled (or "Other" is selected in dropdown), expose an editable `<Input>` field immediately.
   - User can type custom text, which is stored cleanly as `__other__:<text>`.

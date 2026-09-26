# Subtask 03: Universal Boolean Field Type & Display Presets

> **/goal** Transition `true_false` into a flexible `boolean` field type with configurable display presets (`True/False`, `Yes/No`, `Enable/Disable`, `Agree/Disagree`).
> **/learn** Grounded on user request and `02-spec/21-app/13-question-card-and-exam-intelligence.md`.

## Target Files
- `src/lib/types/form.ts`
- `src/components/forms/sortable-field-card.tsx`
- `src/components/runner/FormRunner.tsx`

## Requirements
1. **Model Types**:
   - Add `boolean` field type and `BooleanDisplayPreset` (`true_false`, `yes_no`, `enable_disable`, `agree_disagree`).
   - Preserve backward compatibility with legacy `true_false` string value.
2. **Editor UI (`sortable-field-card.tsx`)**:
   - Provide display preset dropdown/segment allowing quiz creator to choose button labels.
   - Set correct answer to positive or negative state corresponding to the chosen preset.
3. **Runner UI (`FormRunner.tsx`)**:
   - Render the chosen preset labels (`Yes/No`, `Enable/Disable`, `Agree/Disagree`, `True/False`) with proper contrast and alignment.

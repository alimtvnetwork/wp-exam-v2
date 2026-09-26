# Subtask 01: FormBuilder Single-Line Header & Icon-Only Action Buttons

> **/goal** Streamline `FormBuilder.tsx` top action bar into a single horizontal row, replace text buttons with icon-only action controls, and remove the redundant `Access:` dropdown from the question card body.
> **/learn** Grounded on `assets/screenshots/65-wpexam-header-layout-02.png` and `02-spec/21-app/12-formbuilder-header-streamlining.md`.

## Target Files
- `src/components/forms/FormBuilder.tsx`

## Mandatory Requirements
1. **Single-Line Header**:
   - Merge `[ArrowLeft]`, `[Title: Form & Assessment Builder]`, `[Studio Badge]`, `[/f/{slug} Chip]`, and `[Public Link Button]` into one responsive `flex items-center gap-2.5 flex-wrap` container.
   - Eliminate the 2-row vertical stacking.
2. **Icon-Only Buttons**:
   - Preview button: `<Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" title="Preview Form (opens in new tab)"><Eye className="w-4 h-4 text-primary" /></Button>`.
   - Save Form button: `<Button size="icon" className="h-9 w-9 rounded-xl" title="Save Form"><Save className="w-4 h-4" /></Button>`.
3. **Remove Redundant Access Select**:
   - Remove `<Select value={formAccess}>` from the form card configuration row above questions.
   - Access configuration remains strictly managed in the Inspector Dock `Config` / `Settings` tab.
4. **Positive Booleans**:
   - Implicit evaluations only (`if isReady`), zero `== true`.

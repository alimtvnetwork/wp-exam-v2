# Subtask 01: Question Card Noise Reduction, Floating Title & Direct Number Reorder

> **/goal** Eliminate static "Question Title" label, add animated floating placeholder, provide section/group disclosure arrow without empty right space, and support direct-type index jumping on question number badge.
> **/learn** Grounded on `assets/screenshots/66-question-card-redesign-01.png` and `02-spec/21-app/13-question-card-and-exam-intelligence.md`.

## Target Files
- `src/components/forms/sortable-field-card.tsx`

## Requirements
1. **Title Animated Floating Placeholder**:
   - Remove redundant `Question Title *` static text label above input.
   - When field is empty, show `Question title...` on left; when typing or active, animate label softly to the right/above (`text-xs text-muted-foreground duration-200`).
2. **Section / Group Disclosure**:
   - Provide clean inline button/disclosure `[→ Section / Group]` right under title.
   - When opened, renders full-width datalist input spanning 100% width, eliminating right-hand empty space.
3. **Direct-Type Question Number Badge**:
   - Clicking or double-clicking `#<N>` badge opens inline number input to directly jump this question's order index.
4. **Unified Add Popover**:
   - Plus icon `[+] Add` dropdown/popover to add Image, Description, or Citation/Link.

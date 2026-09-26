# Subtask 04: Difficulty Tiers & Automatic Points Hierarchy

> **/goal** Support question difficulty tiers (`easy`, `medium`, `hard`) with default points and expandable custom points override.
> **/learn** Grounded on user request and `02-spec/21-app/13-question-card-and-exam-intelligence.md`.

## Target Files
- `src/lib/types/form.ts`
- `src/quiz/store/useQuizStore.ts`
- `src/components/forms/sortable-field-card.tsx`

## Requirements
1. **Difficulty Tier Model**:
   - `difficulty?: 'easy' | 'medium' | 'hard'` in `FormField`.
   - Global default points per tier in `FormSettings`: Easy: 5, Medium: 10, Hard: 20.
2. **Editor UI (`sortable-field-card.tsx`)**:
   - Tier selector in footer toolbar (`Easy [5pt]`, `Medium [10pt]`, `Hard [20pt]`).
   - "Custom Points" toggle button to show custom point input for exceptions.
3. **Store & Calculation**:
   - Automatically assign tier points unless custom override is set.

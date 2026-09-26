# Subtask 06: Flexible Exam Timers, Fullscreen Anti-Cheat & List-of-Items Suggestions

> **/goal** Support global and per-question/tier timers, enforce fullscreen lock with tab-switch alert, and implement `list_items` question type with suggestion autocompletion and learning memory.
> **/learn** Grounded on user request and `02-spec/21-app/13-question-card-and-exam-intelligence.md`.

## Target Files
- `src/lib/types/form.ts`
- `src/quiz/store/useQuizStore.ts`
- `src/components/forms/FormBuilder.tsx`
- `src/components/runner/FormRunner.tsx`

## Requirements
1. **Flexible Timers**:
   - Support `global` timer (fixed time e.g. 30m) or `per_question` timer (+5m per question / easy: 2m, medium: 5m, hard: 10m).
   - Display countdown badge in `FormRunner.tsx`.
2. **Fullscreen Anti-Cheat Proctoring**:
   - If enabled in `FormSettings.enableFullscreenLock`, prompt candidate to enter fullscreen.
   - If user exits fullscreen or leaves tab, trigger blackout/warning alert.
3. **List of Items Question Type (`list_items`)**:
   - User can input multiple items or title+link pairs.
   - Render suggestion autocomplete pills from preset list/CSV/JSON.
   - Learn new inputs into runtime suggestions pool.

# Specification 08.2: Hooks Ordering & Early Return Architectural Architecture

## 1. Component Lifecycle & Hook Placement Protocol

Under React's Rules of Hooks:
1. Don't call Hooks inside loops, conditions, or nested functions.
2. Don't call Hooks after an early return statement.

In `src/components/runner/FormRunner.tsx`, the component structure must strictly follow this order:

```text
[1. Props & Router Hooks]
  - useParams, useNavigate, useExamAppStore, useQuizStore

[2. State Hooks]
  - useState (selectedProjectId, activeThemeId, currentStep, answers, isSubmitted, etc.)

[3. Effects & Memos]
  - useMemo (activeForm, fields, visibleFields, dynamicTitleTypography, etc.)
  - useEffect (theme sync, session restore, timer, shortcuts)

[4. Component Action Callbacks (useCallback & Functions)]
  - handleAnswerChange, handleNextStep, handlePreviousStep, handleSubmit
  - handleHUDUpdateSettings (useCallback)
  - handleHUDUpdateLayout (useCallback)
  - handleToggleSlideNumbers (useCallback)
  - renderSidebarInner (helper)

[5. Terminal Rendering Logic]
  - if (isSubmitted) { return (<SubmissionCompletedCard />); }
  - return (<MainRunnerContainer />);
```

---

## 2. Code Movement Blueprint

Move lines 1771–1886 (`handleHUDUpdateSettings`, `handleHUDUpdateLayout`, `handleToggleSlideNumbers`) directly before line 1698 (`if (isSubmitted)`).

This guarantees that:
- When `isSubmitted === false`: 53 hooks run, component renders active quiz.
- When `isSubmitted === true`: exactly the same 53 hooks run, component renders submission card.
- React hook graph remains invariant across all stage transitions.

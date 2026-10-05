# Specification 08: React Rules of Hooks Order & Runner Submission Remediation

## 1. User Request (Verbatim)

```text
Fix
[Attached Screenshot: media_1791209171048.png showing:
"Application Notice
The assessment or preview encountered a loading issue.
Rendered fewer hooks than expected. This may be caused by an accidental early return statement.
Reload Page"]
```

---

## 2. Root Cause Analysis (RCA)

### 2.1 The Defect
When a candidate or presenter completes an assessment, clicks "Submit Assessment", or completes the auto-fill sequence, `isSubmitted` state transitions from `false` to `true`.
The component triggers a re-render. During re-render, React runs through the top-level hooks until line 1698 in `src/components/runner/FormRunner.tsx`:

```tsx
if (isSubmitted) {
  return (
    <Card className="...">
       ...
    </Card>
  );
}
```

Because of this early return, lines 1771–1885 are bypassed:
1. `handleHUDUpdateSettings = useCallback(...)`
2. `handleHUDUpdateLayout = useCallback(...)`
3. `handleToggleSlideNumbers = useCallback(...)`

### 2.2 React Rules of Hooks Violation
On initial render (when `isSubmitted === false`), React records 53 hooks.
On subsequent render upon submission (when `isSubmitted === true`), the component returns at line 1698, executing only 50 hooks.
React asserts hook list parity and detects 3 missing hooks, throwing:
`Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`
The top-level `ErrorBoundary` in `src/App.tsx` catches this error and renders the "Application Notice" error card shown in the user's screenshot.

---

## 3. Remediation Strategy

1. **Move All Hooks Above Early Returns:**
   Relocate `handleHUDUpdateSettings`, `handleHUDUpdateLayout`, `handleToggleSlideNumbers`, and `renderSidebarInner` directly above `if (isSubmitted)`.
2. **Deterministic Hook Execution Count:**
   Every single hook (`useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`) in `FormRunner` is executed unconditionally on every render cycle before any conditional or terminal JSX return.
3. **Zero Early Return Before Hooks:**
   Ensure `if (isSubmitted)` occurs strictly after the last hook in the component.

---

## 4. Acceptance Criteria

- [ ] All `useCallback` hooks (`handleHUDUpdateSettings`, `handleHUDUpdateLayout`, `handleToggleSlideNumbers`) are located before `if (isSubmitted)`.
- [ ] No hook is bypassed when `isSubmitted === true`.
- [ ] Submitting an assessment, completing the quiz, or auto-filling and advancing renders the assessment completion score card cleanly without crashing to `Application Notice`.
- [ ] Coding guideline autofixer reports 0 boolean and formatting errors.
- [ ] Strict relative paths hygiene and zero secret leaks.

# Spec 51: Verification Gates & Quality Assurance

## 1. Automated Verification Checks
1. **Type Safety:** `npx tsc --noEmit` must complete with 0 errors.
2. **ESLint Audit:** `npm run lint` must pass with 0 errors.
3. **Unit Tests:** `npx vitest run` must pass 100% of test suites.

## 2. Invariant Gates
- **G-01:** Segmented tab header in right dock contains 4 tabs: `Fields`, `Outline`, `Audit`, and `Config`.
- **G-02:** When issues exist, `Audit` tab displays active indicator badge.
- **G-03:** Clicking "Jump" on an audit issue smoothly scrolls to the canvas card.
- **G-04:** Clicking "1-Click Fix" or "Fix All" mutates the fields state and immediately recalculates the health score.
- **G-05:** Zero horizontal overflow or double scrollbars in the right-hand sidebar.

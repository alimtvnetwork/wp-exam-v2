# Specification: Visual Hierarchy & UX Guidelines for Design Validation

Spec Reference: [01-overview.md](01-overview.md)

## 1. Top Bar Design Health Indicator

- Placed prominently in `FormBuilder.tsx` top action bar next to Live Preview and Save buttons.
- Display format:
  - If score >= 90: `bg-emerald-500/10 text-emerald-500 border-emerald-500/30` with `ShieldCheck` icon.
  - If score 70-89: `bg-amber-500/10 text-amber-500 border-amber-500/30` with `AlertTriangle` icon.
  - If score < 70: `bg-rose-500/10 text-rose-500 border-rose-500/30` with `AlertCircle` icon.
- Hover shows quick tooltip, click triggers the **Design Health Inspector Drawer**.

## 2. Design Health Inspector Panel / Drawer

- Slide-over sheet or modal showing:
  - Overall health score gauge (radial circular progress or bold score pill `95/100 • Grade A+`).
  - Breakdown by dimension: Structure, Choices, Scoring, Logic, Accessibility.
  - Filter tabs: `All Issues`, `Errors`, `Warnings`, `A11y`.
  - Issue list item:
    - Severity badge (`Error`, `Warning`, `Tip`).
    - Title & detailed explanation.
    - Affected question link (`Jump to Question #3`).
    - 1-Click Auto-Fix button (e.g. `Auto-generate 2 options`, `Set default 10 pts`, `Fix placeholder`).

## 3. Inline Question Card Visual Feedback

- In `sortable-field-card.tsx`, if the field has validation issues:
  - Small amber or rose warning icon in the card header next to `#1`.
  - Clicking badge opens the issue tooltip with 1-click fix.

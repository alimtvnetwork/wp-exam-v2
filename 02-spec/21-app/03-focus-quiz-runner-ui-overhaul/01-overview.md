# Focus Quiz Runner UI Overhaul — Overview

## Overview

This specification covers a targeted UI overhaul of the Focus Quiz Runner and Form Runner components in the WordPress exam/quiz React frontend. The goal is to improve visual polish, interaction quality, and accessibility across quiz presentation, MCQ option rendering, and form response labeling.

The overhaul is scoped to **four discrete UI concerns** identified by user-reported issues. No data model changes, API changes, or backend modifications are in scope.

---

## Problem Statement

The following issues have been identified in the current UI:

- **CANDIDATE RESPONSE label is redundant and clutters the form runner UI.** A `<span>Candidate Response</span>` element (with optional sparkle icon) appears in a section header at `src/components/runner/FormRunner.tsx` line ~2385. It provides no informational value and should be removed entirely.

- **MCQ answer option cards lack visual hierarchy and interaction feedback.** Option cards in `src/components/runner/FocusQuizRunner.tsx` (lines 1164–1221) are rendered as flat list items with a circular checkbox and no letter-based badge. There is no hover animation, no opacity transition, and no sliding accent effect. Users cannot quickly identify options by letter (A/B/C) as expected on standard quiz UIs.

- **Presentation title centering is unreliable at Stage 3.** The `<h2>` title rendered at quiz stage 3 (`FocusQuizRunner.tsx` line ~1064) relies on `text-center` applied to a parent `div` with `space-y-2`. This indirect centering approach is fragile and may not produce centered output in all viewport widths or SSR contexts.

- **Hover effects are absent or inconsistent on interactive elements.** Quiz name links lack underline and color-shift effects on hover. Option cards have no slide-fade animation, making the UI feel static and unresponsive.

---

## Files In Scope

| File | Purpose |
|---|---|
| `src/components/runner/FocusQuizRunner.tsx` | MCQ option cards, presentation title, quiz name hover |
| `src/components/runner/FormRunner.tsx` | CANDIDATE RESPONSE label removal |

---

## Acceptance Criteria

1. The `<span>Candidate Response</span>` label and its surrounding header block (including any sparkle icon) are fully removed from `FormRunner.tsx`. No empty container element remains.
2. Every MCQ option card displays an A/B/C pill badge derived from `String.fromCharCode(65 + optionIndex)`.
3. At rest, option cards render at `opacity: 0.75` with a transparent left border accent.
4. On hover, option cards transition to `opacity: 1.0` within 200ms and display a 3px left border accent with a `translateX(2px)` shift on the badge.
5. On selection, option cards render with the active background, active border, a 16px glow shadow, a filled primary-color badge, and a Lucide `<Check>` icon in green (`#10B981`) on the right side.
6. The presentation stage 3 `<h2>` title is explicitly centered via direct `text-center` on its own element, not inherited from a parent container.
7. Quiz name links gain `hover:underline` and a color-shift CSS transition on hover.
8. All changes pass TypeScript compilation without errors.
9. No existing test files are modified or removed.

---

## Out of Scope

- Backend API or WordPress plugin changes
- Database schema modifications
- Changes to quiz scoring or result calculation logic
- Changes to any component outside `FocusQuizRunner.tsx` and `FormRunner.tsx`
- New route additions or navigation changes
- Admin panel restructuring beyond the sidebar contrast fix tracked in subtask 12-04

# Spec 50: Senior-Grade Fluid FormBuilder UX & Unified Inspector Dock

## 1. Executive Summary

This specification establishes the architectural and visual standards for the WP Exam FormBuilder header, command toolbar, and right-hand inspector dock. It resolves button sprawl and cognitive clutter by introducing a unified command hierarchy, a real Radix `DropdownMenu` for secondary builder tools, a streamlined Live URL ribbon, and a fluid, senior-grade control rail (`FieldPalette`, `OutlineTree`, and `FormConfig`).

## 2. User Request (Verbatim)

```text
is it done?

please add design validation system??

https://prnt.sc/e53IZKChkVu4

Fix these buttons. Do not add too many buttons. Try to compact the buttons with a drop-down. And the idea here is that we can preview it and make sure the buttons does have the proper alignment everywhere, and try to integrate a code to import Google Forms. Okay, so if we have the Google Form account access authentication, we should be able to import a whole Google Form to our system. That is a priority. Okay, and on top of this, we can actually customize the logic. So please make a big plan and implement this and try to fix this UI/UX and make sure the UI is fluid. Currently, if we go into the right-hand side also, it looks terrible. It looks like a junior or someone who does not have any design conscious, they have done it. So please based on this
```

---

## 3. Visual Reference

- Screenshot asset: [assets/screenshots/google-forms-import-and-card-compact-01.png](../../../assets/screenshots/google-forms-import-and-card-compact-01.png)

---

## 4. Key Architectural Pillars

### 4.1. Consolidated Command Header & DropdownMenu
- **Problem:** Loose sprawl of 6 distinct top buttons (`Actions ▾`, `Import Google Form`, `Health Badge`, `Branching Flow`, `Modal Preview`, `Save Form`) plus a bulky secondary card below created visual disarray and alignment fatigue.
- **Solution:**
  - **Primary Row:**
    - Form Title & Breadcrumb (`FormBuilder / [Title]`)
    - Dynamic Health Score Pill (`Health: {score}% ({grade})`)
    - Consolidated `Tools ▾` Radix DropdownMenu (`Import Google Form`, `Branching Logic DAG`, `JSON Schema Studio`, `AI Assistant`, `Copy Live URL`)
    - Split/Grouped Live Preview button (`Modal Preview` & `Open in New Tab`)
    - High-contrast primary `Save Form` button
  - **Inline Live URL Pill:** Integrated directly into the header bar with subtle border, 1-click clipboard copy, and visual feedback, eliminating redundant stacked cards.

### 4.2. Fluid Senior-Grade Right-Hand Inspector Dock
- **Problem:** Junior-looking stacked layout with harsh borders, arbitrary height cutoffs, mismatched button padding, and lack of visual polish in the component palette, outline tree, and configuration panels.
- **Solution:**
  - Modern sticky dock (`sticky top-6 flex flex-col h-[calc(100vh-5rem)]`) with subtle borders, backdrop blur, and refined padding.
  - Three distinct tabs:
    1. **Components (`Fields`):** Curated catalog organized into logical sections (Choice & Selection, Text & Responses, Media & Verification), with category pill filtering, instant search (`Filter components...`), modern icon containers, and interactive hover states.
    2. **Outline (`Structure`):** Visual question tree with question numbering, type badges, points, required indicators, smooth scroll triggers, and keyboard accessible reorder triggers.
    3. **Settings (`Config`):** Fluid access policy (Public / Token / Invite), assessment mode (Quiz / Survey / Poll), sequential pacing toggle, passing grade threshold, and countdown timers.

---

## 5. System Invariants & Non-Negotiables

1. **Alignment & Grid Rhythm:** All header buttons and toolbar items must maintain uniform 32px (`h-8`) height, vertical center alignment, and consistent `gap-2` spacing.
2. **Zero Button Sprawl:** Secondary tools must never be rendered as standalone buttons in the top header. They must reside within the `Tools ▾` dropdown menu.
3. **No Mixed Polarity Booleans:** All UI flags must use positive semantics (`is`, `has`).
4. **No Build/Test Invocation During Routine Coding:** Only targeted linting and vitest checks executed during verification gates.

# Canonical Spec: WordPress Admin Layout & Drag-Drop Form Builder UI/UX

Version: 1.0.0
Updated: 2026-09-25
Status: Active
Category: Application UI/UX & Layout Architecture

---

## User Request (Verbatim)

```text
Based on the coding guideline and let's say Rise Up Asia website, the presentations, and also in the coding guideline, especially the design systems. Look into this and improve your design UI UX, and for the admin panel, keep a left-hand panel like WordPress, okay? So that every menu is there and right inside. Again, drag, drop item. Make the components much more user-friendly. It's very trash right now. Okay, so I will give you, let's say, 300 steps to improve it further. Can you please do that for me? Make sure you analysis before doing any UI changes. Is it clear? Can you please do that for me properly?
```

---

## 1. Executive Summary & Design System Analysis

### 1.1 Aesthetic Foundations: Rise Up Asia & WordPress Hybrid
The application serves two interrelated audiences:
1. **Administrative Curriculum Authors (WordPress Admin Experience):**
   - Must mirror the familiar WordPress left-hand navigation taxonomy: dark contrast sidebar (`#1D2327` / `#0A0A14`), slim top utility bar with site link and user profile, grouped collapsible menus, and clear active state indicators.
   - Submenus and tools must reside inside a dedicated right-hand main content canvas that scales responsively without awkward horizontal clusters.
2. **Candidates & Respondents (Rise Up Asia & Focus Runner):**
   - High-contrast, brand-aligned visual design featuring Rise Up Asia deep dark `#0A0A14`, rich card surfaces `#141422`, crisp borders `#292942`, and vivid amber accents `#FFAD01` with cream typography `#FFF1D6`.

### 1.2 Identified UI/UX Deficiencies ("Trash" State Audit)
1. **Disjointed Horizontal Top Bar Navigation:**
   Previously, 11 different administrative sections were crowded into a horizontal wrap bar (`Organic Enterprise Navigation Bar`), making navigation noisy, hard to scan, and inconsistent with WordPress admin ergonomics.
2. **Unstyled & Cluttered Drag-and-Drop Cards:**
   The `SortableFieldItem` component had cluttered input rows, unstyled labels, difficult-to-target drag handles, and no visual hierarchy between the question title and secondary parameters.
3. **Hidden / Bottom-Locked Component Palette:**
   Adding new fields required scrolling to the bottom of the page to find an unorganized list of buttons. There was no categorized palette (Choice, Text, Media, Verification).
4. **Weak Feedback on Drag & Drop:**
   No clear drop placeholder indicators, no smooth hover states, and minimal drag elevation cues.

---

## 2. Architectural Blueprint & Component Decomposition

```text
+-----------------------------------------------------------------------------------+
|  WordPress Admin Top Utility Bar (WP Logo, Console Title, Public Link, User/Theme)|
+-------------------+---------------------------------------------------------------+
|  Left-Hand Admin  |  Right-Hand Main Content Area                                 |
|  Sidebar (250px)  |                                                               |
|  - Curriculum     |  [ Breadcrumbs / Top Actions Toolbar ]                        |
|    * Form Builder |  +---------------------------------------------------------+  |
|    * Project Tree |  | Form Configuration Header (Title, Type, Sequential)    |  |
|    * AI Studio    |  +---------------------------------------------------------+  |
|  - Delivery       |  | Categorized Field Palette (Choice, Input, Media, Regex) |  |
|    * Focus Runner |  +---------------------------------------------------------+  |
|    * Live Runner  |  | Drag-and-Drop Question Canvas (DndContext)              |  |
|    * Invites      |  |  +---------------------------------------------------+  |  |
|  - Operations     |  |  | [::] #1 Multiple Choice Question Card             |  |  |
|    * Analytics    |  |  |      - Question text, options, answer key, points |  |  |
|    * Audit Log    |  |  |      - Quick Action Floater (Branch, Duplicate, X)|  |  |
|    * Email        |  |  +---------------------------------------------------+  |  |
|  - System         |  |  | [::] #2 True / False Question Card                |  |  |
|    * Backups      |  |  +---------------------------------------------------+  |  |
|    * Split SQLite |  +---------------------------------------------------------+  |
+-------------------+---------------------------------------------------------------+
```

---

## 3. Deliverables & Tracing Matrix

| Task ID | Deliverable | Spec Section | Implementation Target |
|---------|-------------|--------------|-----------------------|
| Task-01 | Design System Analysis | `01-overview.md` | Tokens, Theme Presets, CSS variables |
| Task-02 | WordPress Admin Left Sidebar | `02-data-contracts.md`, `03-visual-and-ux.md` | `src/components/admin/wp-admin-sidebar.tsx`, `Index.tsx` |
| Task-03 | Drag-and-Drop Card UX Overhaul | `03-visual-and-ux.md` | `src/components/forms/FormBuilder.tsx`, `sortable-field-card.tsx` |
| Task-04 | Categorized Palette & Toolbars | `03-visual-and-ux.md` | `src/components/forms/field-type-palette.tsx` |
| Task-05 | Verification & Quality Gates | `04-verification-gates.md` | Vitest, ESLint, Git Commit & Push |

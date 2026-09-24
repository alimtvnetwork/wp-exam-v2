# Spec [47] Part 4: Admin Invites, Audit Restyling & Focus Quiz Studio Specification

## 1. Modern Select Component Overhaul

### 1.1 Problem Statement
The application contained raw, unstyled HTML `<select>` elements with default browser drop-downs and rigid styling in:
- `src/components/runner/FormRunner.tsx` (`Active Curriculum Project`)
- `src/components/admin/invites-manager.tsx` (`Assigned Role`)
- `src/components/runner/FocusQuizRunner.tsx` (`Theme Selector`)
- `src/components/forms/wizard-runner.tsx` (`Theme Selector`, `Country Selector`)

### 1.2 Target Select Component Architecture
All dropdowns must utilize styled Radix UI Select primitives or high-polish custom dark dropdowns:
- Styled with dark background (`var(--wp-exam-card)` or `bg-slate-900`), subtle border (`border-border`), hover highlights, and chevron icons.
- Fully accessible via keyboard arrow keys, Tab, Enter, and Escape.
- No jarring white background popups on dark canvases.

---

## 2. Admin Contrast & Invites Overhaul

### 2.1 Candidate Invites (`src/components/admin/invites-manager.tsx`)
- Eliminate ugly light-gray container backgrounds (`bg-muted/30` / `bg-[#B0B7C3]`) that clash with white text.
- Standardize on dark glassmorphism card surfaces (`bg-card/80 border-border/80`).
- Refine the Invitation Dispatch form:
  - Input field styled with dark background, crisp focus ring, and clear placeholder.
  - Assigned Role dropdown using styled Radix Select.
  - Primary dispatch button with high-contrast amber/gold styling (`bg-primary text-primary-foreground font-semibold shadow-md`).
- Redesign the Active Invitations table/list:
  - Role pills using semantic badges (`subscriber`, `editor`, `admin`).
  - Copy link action with animated feedback toast and checkmark.
  - Revoke button with destructive outline styling.

### 2.2 Audit Trail (`src/components/admin/audit-logs-view.tsx`)
- Dark table surface with subtle alternating row striping.
- High-contrast timestamp, actor, action, and target columns.
- Event badges color-coded by event severity (success green, warning amber, error rose).

---

## 3. Focus Quiz Authoring Studio in Admin Panel

### 3.1 Need & Objective
The Focus Quiz runner (`FocusQuizRunner.tsx`) delivers an engaging Letterly-style sequential quiz experience. However, admins had no editing studio in the admin panel to create or customize focus quizzes.

### 3.2 Focus Quiz Studio (`src/components/admin/focus-quiz-editor.tsx`)
- Accessible directly from `WpAdminSidebar.tsx` under **Focus Quiz Editor** (or tab switch).
- Provides comprehensive authoring capabilities:
  - Quiz Title, Tagline, Category, and Description.
  - Stage Architecture: Configure Stage 1 (Warmup), Stage 2 (Core), Stage 3 (Challenge) with custom thresholds and point multipliers.
  - Anti-cheat settings: Tab switch tolerance, blur warnings, full-screen lock.
  - Question List: Add, reorder, edit sequential questions, options, code snippets, and explanations.
  - 1-Click Launch: "Save & Preview in Focus Runner" seamlessly opens `FocusQuizRunner` with the freshly edited quiz configuration.

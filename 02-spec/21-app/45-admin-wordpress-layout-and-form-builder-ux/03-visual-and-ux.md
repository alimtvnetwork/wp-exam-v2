# Visual & UX Architecture

Version: 1.0.0
Updated: 2026-09-25
Category: Specification Visual & UX

---

## 1. WordPress Admin Left Sidebar Standards

### 1.1 Dimensional & Layout Tokens
- **Expanded Width:** `250px` (or `w-64`) fixed to viewport left, full viewport height (`min-h-screen`).
- **Collapsed Width:** `64px` (or `w-16`) icon-only with tooltip hovers.
- **Background Color:** Dark charcoal `#1D2327` (standard WP Admin) or `#0E0E18` in Rise Up Asia mode with `#292942` right border.
- **Menu Item Spacing:** `h-10 px-3 my-0.5 rounded-lg flex items-center gap-3 transition-colors`.
- **Active State Indicator:** Left border bar in Rise Up Gold `#FFAD01` (`w-1 h-6 rounded-r bg-[#FFAD01]`), accompanied by high contrast typography `#FFF1D6` and background highlight `bg-[#FFAD01]/10`.

### 1.2 WordPress Top Bar (Utility Bar)
- **Height:** `36px` to `48px`, fixed top with `z-50`.
- **Items:** WP Exam Icon (`#FFAD01`), Site title link, Public portal launcher with external link icon, active theme badge, user status and logout button.

---

## 2. Drag-and-Drop Question Canvas & Card Overhaul

### 2.1 Drag Affordances
- **Handle:** Dedicated, high-contrast grip icon (`GripVertical`) positioned at card left edge with `cursor-grab active:cursor-grabbing`.
- **Elevation on Drag:** `shadow-2xl scale-[1.01] border-primary/60 ring-2 ring-primary/20`.
- **Drop Line Indicator:** Subtle animated emerald/primary boundary bar indicating target index during drag operations.

### 2.2 Question Card Interior Hierarchy
- **Header:**
  - Index Pill: `#1`, `#2` in font-mono badge.
  - Category / Type Badge: Color-coded (Choice: Indigo, Text: Sky, Verification: Amber, Media: Purple).
  - Label Input: Bold, prominent text input with clean focus ring.
  - Action Floater: Branching Rules badge (with rule count), Advanced Settings toggle, Duplicate button, Remove button.
- **Card Body:**
  - Option Editor for Choices: Radio button or check indicators, reorder buttons, clear "Correct Answer" indicator.
  - True/False: Crisp segmented buttons (`True` vs `False`).
  - Regex Input: Live test area that checks pattern validity in real-time.
  - URL / Link: Validated URL input with 1-click test link.
- **Collapsible Drawers:**
  - `BranchingRuleEditor`: High contrast, natural language rule summaries.
  - `AdvancedSettings`: Placeholder, Help text tooltip, custom points, required toggle.

---

## 3. Categorized Field Palette (Quick Add)

- Positioned above the question canvas or as a collapsible dock.
- Categorized tabs/sections:
  1. **Choice & Survey:** Multiple Choice, Single Choice, True / False, Dropdown Select, Rating Scale (1-5)
  2. **Text & Input:** Short Answer, Paragraph Text, Email Address, Phone Number
  3. **Verification & Media:** Regex Verified Code, Reference Link, File Upload
- Each button features a distinct icon, field name, and 1-line description.

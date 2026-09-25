# Specification: Visual Hierarchy & UX Modernization

Spec Reference: [01-overview.md](01-overview.md)

## 1. Field Card Header Compact Actions Architecture

In `src/components/forms/sortable-field-card.tsx`, the card header previously had a cluttered row of 6 loose buttons (`Test Preview`, `Validation`, `Triggers`, `Branching`, `Duplicate`, `Delete`).

### New Header Layout Specifications:
1. **Left Side (Identifier & Type Badge):**
   - Drag handle icon (`GripVertical`)
   - Question sequence badge (e.g. `#1`, `#2`)
   - Refined Field Type Pill:
     - No squished or truncated uppercase text.
     - Styled with subtle rounded border, dark glassmorphism background, and icon indicator (`CheckSquare`, `CircleDot`, etc.).
   - Points badge (e.g. `10 pts`) with inline quick editor or display.
2. **Right Side (Compact Action Bar):**
   - **Primary Action:** `Live Preview` toggle button with eye icon.
   - **Compact Actions Dropdown (`Actions ▾`):**
     - `Validation Rules` (opens compound validation drawer, shows active count badge if rules exist).
     - `Notification Triggers` (opens webhook/email triggers drawer, shows active indicator).
     - `Branching Logic` (opens branching rules drawer, shows target indicator).
     - Divider line.
     - `Duplicate Question` (quick clone).
     - `Delete Question` (destructive item with trash icon).

---

## 2. Right-Hand Field Palette & Sidebar Fluidity

The right-hand palette previously displayed oversized, bulky cards that felt disjointed and unpolished.

### Design System Improvements:
1. **Compact 2-Column or Sleek List Grid:**
   - Slim card height with 12px padding.
   - Distinct colored icon boxes (24x24px rounded-md).
   - High-contrast typography: 12px font-semibold title, 10px muted description.
   - Subtle hover transition (`hover:border-primary/50 hover:bg-primary/5`).
2. **Filter Pills:**
   - Category switcher (`All`, `Choice`, `Text`, `Media & Verification`) with active glowing pill indicator.
3. **Quick Drag & Click Feedback:**
   - Click adds immediately to the bottom of the active form with sound or toast notification.
   - Drag handle supports direct drop onto the sortable canvas.

---

## 3. Google Forms Import Modal UX

Integrated into `FormBuilder.tsx` via a prominent `Import from Google Forms` button in the top action bar.

### Modal Tabs:
- **Tab 1: Public Google Form Link:** Enter any published Google Form URL (e.g., `https://docs.google.com/forms/d/e/.../viewform`). Automatically scrapes and imports all fields.
- **Tab 2: Google Forms API / OAuth:** Enter Google OAuth2 Access Token / API Key and Form ID. Fetches directly via official Google Forms v1 REST API.
- **Tab 3: JSON Import:** Paste raw Google Forms API schema JSON. Validates and converts immediately with preview of detected questions count.

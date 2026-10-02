# Subtask 01: Builder Header Chrome, Config Dropdown, Branding & Control Toolbars

> **/goal** Modernize the Onboarding Quiz Form & Quiz Builder chrome: implement a 2px hairline edge accent (`h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60`), section card shadows (`shadow-md`), a consolidated Config dropdown (`SlidersHorizontal` with tooltip "Configuration & Tools"), vector brand identity (`src/assets/onboarding-quiz-logo.svg`), high-contrast sidebar active navigation (`bg-muted text-foreground` with left primary indicator), icon-first right rail dock tabs, single-row field palette category pills, and a streamlined question card header toolbar with constrained type selector (`w-[9rem] sm:w-[11rem] [&>span]:truncate`).  
> **/learn** Architecture Specification: [02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/01-architecture-spec.md](../../../02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/01-architecture-spec.md) | Parent Plan: [.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md](../../../.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md).

---

## Target Files

| Target File Relative Path | Scope & Role in Subtask |
|---------------------------|-------------------------|
| `src/components/forms/FormBuilder.tsx` | Header chrome hairline edge, card `shadow-md`, consolidated Config dropdown menu, right rail segmented dock tabs |
| `src/components/forms/field-palette.tsx` | Single-row `flex-nowrap` category icon pills with tooltips, unclipped 2-row component cards |
| `src/components/forms/sortable-field-card.tsx` | Standardized `h-8` toolbar controls, constrained type selector, emerald dirty-state Save button |
| `src/components/admin/wp-admin-sidebar.tsx` | Vector logo integration, "Onboarding Quiz v2.5", high-contrast active state (`bg-muted text-foreground` + left primary bar) |
| `src/assets/onboarding-quiz-logo.svg` | Canonical vector brand SVG asset (32x32 viewbox, navy base, cream document card, emerald checkmark) |
| `src/pages/Index.tsx` | Admin login console rebranding ("Onboarding Quiz Console"), top admin bar branding, theme map container |

---

## Step-by-Step Implementation Plan

### Step 1: Builder Header Chrome Hairline Edge & Card Elevation (`FormBuilder.tsx`)
- **Target Line Range:** `src/components/forms/FormBuilder.tsx` lines ~708–725.
- **Actions:**
  1. Update title Card container to include `shadow-md rounded-2xl border border-border/80 bg-card overflow-hidden animate-sweet-fade-in`.
  2. Implement top accent ribbon with exact 2px height: `<div className="h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full" />`.
  3. Ensure form title `<input>` utilizes `flex-1 min-w-0` to grant full horizontal space, preventing clipping against trailing utility buttons.

### Step 2: Consolidated Config Dropdown Menu (`FormBuilder.tsx`)
- **Target Line Range:** `src/components/forms/FormBuilder.tsx` lines ~726–825.
- **Actions:**
  1. Trigger button: `<Button variant="outline" size="sm" aria-label="Configuration & Tools" className="h-8 w-8 p-0 border-border hover:bg-accent rounded-lg cursor-pointer shrink-0">`.
  2. Trigger icon: `<SlidersHorizontal className="w-4 h-4 text-primary" />`.
  3. Tooltip: `<TooltipContent>Configuration & Tools</TooltipContent>`.
  4. Dropdown content menu items in exact architectural order:
     - Health Score: `<Shield className="w-3.5 h-3.5 text-emerald-500" />` &rarr; `Health Score: {grade} ({score}%)` (`setInspectorTab('audit'); setIsDesignPanelOpen(true)`).
     - Quiz Config: `<Settings className="w-3.5 h-3.5 text-primary" />` &rarr; `Quiz Config` (`setIsCentralConfigOpen(true)`).
     - Triggers: `<Bell className="w-3.5 h-3.5 text-primary" />` &rarr; `Triggers` with badge count if `notificationTriggers.length > 0` (`setIsNotificationModalOpen(true)`).
     - Separator: `<DropdownMenuSeparator className="my-1 border-border/60" />`.
     - JSON Import / Export: `<FileJson className="w-3.5 h-3.5 text-primary" />` (`setIsJsonModalOpen(true)`).
     - Import Google Forms: `<FileSpreadsheet className="w-3.5 h-3.5 text-primary" />` (`setIsGoogleModalOpen(true)`).
     - Visual Branching Flow: `<GitBranch className="w-3.5 h-3.5 text-primary" />` (`setIsFlowModalOpen(true)`).
     - Separator: `<DropdownMenuSeparator className="my-1 border-border/60" />`.
     - Share / Copy Live URL: `<Share2 className="w-3.5 h-3.5 text-primary" />` (`handleCopyLiveUrl`).
  5. Retain adjacent Trash recovery popover button conditionally when `trashFields.length > 0`.

### Step 3: Onboarding Quiz Brand Assets & Sidebar Active Contrast (`wp-admin-sidebar.tsx`, `Index.tsx`)
- **Target Line Range:** `src/components/admin/wp-admin-sidebar.tsx` lines ~182–210 and ~250–265.
- **Actions:**
  1. Verify brand vector logo at `src/assets/onboarding-quiz-logo.svg` is imported and rendered with `w-8 h-8 rounded-lg shrink-0 shadow-xs ring-1 ring-border/50`.
  2. Brand title block: "Onboarding Quiz", badge "v2.5" (`bg-muted text-primary font-mono border border-border`), subtitle "Admin Console".
  3. Sidebar active navigation row styling:
     - `isActive ? 'bg-muted text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'`.
     - Active accent bar: `<span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />`.
     - Prevent yellow-on-yellow fills in Riseup theme; ensure foreground text is crisp against `bg-muted`.
  4. In `src/pages/Index.tsx` lines ~101–120: Rebrand login screen to "Onboarding Quiz Console" with logo and clear admin instructions.

### Step 4: Right Rail Dock Segmented Tabs (`FormBuilder.tsx`)
- **Target Line Range:** `src/components/forms/FormBuilder.tsx` lines ~1091–1151.
- **Actions:**
  1. Dock header: `<TabsList className="grid grid-cols-4 h-10 p-1 bg-muted/60 rounded-xl">`.
  2. Tab 1 (`palette`): `<Layers className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Fields"`, Tooltip `"Fields ({fields.length})"`.
  3. Tab 2 (`outline`): `<ListOrdered className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Outline"`, Tooltip `"Outline ({fields.length})"`.
  4. Tab 3 (`audit`): `<ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Audit"`, Tooltip `"Audit ({grade})"`.
  5. Tab 4 (`settings`): `<Settings className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Config"`, Tooltip `"Config"`.
  6. Label responsiveness: `hidden sm:inline-block text-[11px] truncate` so narrow rails fall back cleanly to icon-only.

### Step 5: Field Palette Category Pills & Component Cards (`field-palette.tsx`)
- **Target Line Range:** `src/components/forms/field-palette.tsx` lines ~253–285 and ~314–346.
- **Actions:**
  1. Category pill container: `<div className="flex flex-nowrap items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/60 min-w-0 overflow-x-auto no-scrollbar">`.
  2. Category items: `all` (`Layers`), `choice` (`CheckSquare`), `text` (`Type`), `media` (`Video`), `layout` (`Heading`).
  3. Tooltip overlay on each pill: `<TooltipContent side="top">{cat.label} ({cat.count})</TooltipContent>`.
  4. Component card layout: 2 rows with `line-clamp-2` descriptions, category color tiles (`w-8 h-8 rounded-lg`), hover `Plus` button, no title truncation.

### Step 6: Question Card Header Toolbar (`sortable-field-card.tsx`)
- **Target Line Range:** `src/components/forms/sortable-field-card.tsx` lines ~541–820.
- **Actions:**
  1. Drag handle: `title="Drag to reposition question"`.
  2. Order index button: `title="Click or double-click to type new order index"`.
  3. Dirty-State Save button: `h-8 w-8` icon button with Tooltip. Highlights in emerald (`bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20`) when `isQuestionDirty`.
  4. Constrained type selector: `SelectTrigger` with `h-8 text-xs bg-background text-foreground border border-input rounded-lg font-semibold min-w-0 w-[9rem] sm:w-[11rem] shrink overflow-hidden [&>span]:min-w-0 [&>span]:truncate shadow-2xs cursor-pointer`.
  5. Layout mode toggle: Segmented `h-8` button with `LayoutTemplate` (Quiz Format) and `Columns` (Presentation Slide) with tooltips.
  6. Answer placement toggle: Segmented `h-8` button with `PanelRight` (Answers Right) and `PanelLeft` (Answers Left) with tooltips when in presentation split mode.
  7. Preview & Actions segmented control: `h-8` with `Eye` (Preview) and `SlidersHorizontal` (Actions) with tooltips.

---

## Verifiable Acceptance Criteria

| Criteria ID | Verification Method / Assertion | Expected Value | Status |
|-------------|---------------------------------|----------------|--------|
| **CRIT-01** | Inspect `FormBuilder.tsx` line ~711 | Contains `h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60` | PASS |
| **CRIT-02** | Inspect `FormBuilder.tsx` line ~709 | Contains `shadow-md rounded-2xl` | PASS |
| **CRIT-03** | Inspect `FormBuilder.tsx` line ~737 | Uses `<SlidersHorizontal className="w-4 h-4 text-primary" />` | PASS |
| **CRIT-04** | Inspect `FormBuilder.tsx` line ~741 | Contains `<TooltipContent>Configuration & Tools</TooltipContent>` | PASS |
| **CRIT-05** | Inspect `FormBuilder.tsx` lines ~744–804 | Contains all 7 menu items: Health Score, Quiz Config, Triggers, JSON, Google Forms, Visual Branching, Share | PASS |
| **CRIT-06** | Inspect `wp-admin-sidebar.tsx` lines ~182–209 | Displays logo, "Onboarding Quiz", badge "v2.5", "Admin Console" | PASS |
| **CRIT-07** | Inspect `wp-admin-sidebar.tsx` lines ~250–260 | Selected row uses `bg-muted text-foreground` + `absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary` | PASS |
| **CRIT-08** | Inspect `FormBuilder.tsx` lines ~1096–1150 | `TabsList` has `grid-cols-4 h-10` with Tooltips on Fields, Outline, Audit, Config | PASS |
| **CRIT-09** | Inspect `field-palette.tsx` lines ~254–284 | Category pills use single-row `flex-nowrap` with Tooltip overlays | PASS |
| **CRIT-10** | Inspect `sortable-field-card.tsx` line ~688 | `SelectTrigger` has `w-[9rem] sm:w-[11rem] [&>span]:truncate` | PASS |
| **CRIT-11** | Inspect `sortable-field-card.tsx` lines ~603–619 | Save button has `h-8 w-8`, emerald dirty-state, and tooltip | PASS |
| **CRIT-12** | Inspect `sortable-field-card.tsx` lines ~710–820 | Format mode, answer placement, preview, and actions all share `h-8` baseline | PASS |

---

## Coding Guidelines Enforced

- **Positive Booleans Only:** Always evaluate `if isQuestionDirty` or `if isActive`. Never compare explicitly against `true` (`== true`).
- **Relative Markdown Links:** All citations and references point directly to workspace relative paths without `file:///` URIs.
- **Whitespace Discipline:** Consistent single blank lines before conditionals and after closing braces.

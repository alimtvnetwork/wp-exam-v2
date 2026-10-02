# 75 Onboarding Quiz Presentation Modernization — Architecture Specification

**Version:** 1.0.0  
**Updated:** 2026-10-02  
**AI Confidence:** Verified  
**Ambiguity:** None  
**Module:** `02-spec/21-app/75-onboarding-quiz-presentation-modernization`  
**Parent Plan:** [.ai-memory/plans/pending/75-onboarding-quiz-presentation-modernization.md](../../../.ai-memory/plans/pending/75-onboarding-quiz-presentation-modernization.md)  
**Implementation Subtask:** [.ai-memory/plans/subtasks/75-onboarding-quiz-presentation-modernization/01-builder-chrome-and-branding.md](../../../.ai-memory/plans/subtasks/75-onboarding-quiz-presentation-modernization/01-builder-chrome-and-branding.md)

---

## Keywords

`onboarding-quiz` · `builder-chrome` · `ribbon-restraint` · `config-dropdown` · `field-palette` · `sortable-field-card` · `branding` · `wordmark` · `shadcn-tooltips`

---

## Scoring

| Criterion | Status | Notes |
|-----------|--------|-------|
| Architectural Overview & Scope | ✅ Pass | Full boundary definition for FormBuilder, FieldPalette, SortableFieldCard, and Admin Sidebar |
| Ribbon Restraint & Shadows | ✅ Pass | Subtle 2px gradient (`h-0.5`) + card `shadow-md` section elevation |
| Unified Expandable Config Menu | ✅ Pass | Collapses 5 scattered title buttons into a single icon dropdown with tooltips |
| Field Palette Overhaul | ✅ Pass | Unclipped two-row layout (`line-clamp-2`), non-breaking category pills, no truncation |
| SortableFieldCard Header Streamline | ✅ Pass | Uniform `h-8` icon buttons, tooltips, dirty-state Save button, constrained type selector |
| Onboarding Quiz Branding | ✅ Pass | Dedicated SVG logo, sidebar title ('Onboarding Quiz v2.5'), and login screen alignment |
| Verification Checklist | ✅ Pass | Grounded acceptance criteria matching real DOM structure and theme tokens |

---

## 1. System Overview & Architectural Goals

The Onboarding Quiz platform (`wp-exam`) serves as the central curriculum authoring and assessment execution engine. In previous iterations, the builder interface accumulated visual clutter, heavy colored bands, and fragmented action toolbars that obscured the primary form title and overcrowded the right-hand inspector rail.

This specification modernizes the builder console chrome and brand identity across four primary UI components:

1. **Title Card & Accent Ribbon (`FormBuilder.tsx`):** Replace disproportionate colored bands with a restrained 2px top gradient accent and balanced card drop shadows (`shadow-md`).
2. **Unified Expandable Config Dropdown (`FormBuilder.tsx`):** Consolidate five inline utility buttons (`Health`, `Quiz Config`, `Triggers`, `Tools`, `Share`) into a single expandable `DropdownMenu`, freeing canvas space for the form title.
3. **Field Palette Overhaul (`field-palette.tsx`):** Eliminate text truncation on component cards by transitioning to an unclipped two-row card structure with `line-clamp-2` descriptions and compact category filters.
4. **SortableFieldCard Header Streamlining (`sortable-field-card.tsx`):** Standardize all header actions to compact `h-8` icon buttons equipped with Shadcn `Tooltip` overlays, a distinct dirty-state `Save` indicator, and a width-constrained type selector.
5. **Brand Identity & Wordmark Modernization (`wp-admin-sidebar.tsx`, `Index.tsx`, `onboarding-quiz-logo.svg`):** Establish the product name **"Onboarding Quiz"** (version **v2.5**), retiring legacy letter tiles and outdated console titles across the sidebar, header, and login portals.

```
+---------------------------------------------------------------------------------------------------+
|  [Logo] Onboarding Quiz v2.5                               [Theme]  [Preview (Icon)] [Save (Icon)] |
+---------------------------------------------------------------------------------------------------+
| [Form Title Input]                                      [Config Dropdown] [Trash Ledger Popover] |
| Top 2px Gradient Accent (h-0.5) -- Card Elevation: shadow-md                                      |
+-------------------------------------------------------------+-------------------------------------+
|  Main Question Canvas (lg:col-span-8)                       | Right Inspector Rail (lg:col-span-4)|
|  +-------------------------------------------------------+  | +---------------------------------+ |
|  | SortableFieldCard (#1)                                |  | | Tabs: [Fields] [Outline] [Audit]| |
|  | Header: [::] [#1*] [Save (h-8)]  [Select] [Eye] [Opts]|  | +---------------------------------+ |
|  | Body: Label, Inputs, Options, Validation Rules        |  | | FieldPalette                    | |
|  +-------------------------------------------------------+  | | Filter: [All][Choice][Text]...  | |
|                                                             | | Cards: Title + line-clamp-2 desc| |
|                                                             | +---------------------------------+ |
+-------------------------------------------------------------+-------------------------------------+
```

---

## 2. Title Card Ribbon Restraint & Elevation

### 2.1 Problem Analysis
In previous builds, the title card at the top of the Google Forms canvas rendered with a heavy `h-2.5` colored band (`bg-gradient-to-r from-primary via-primary/80 to-primary/60`). Under themes with strong primary colors such as **Green Choice** (`#16A34A`) or **Riseup** (`#FFAD01`), this thick bar dominated the viewport, creating harsh visual contrast and fatigue.

### 2.2 Specification Requirements
1. **Subtle Accent Ribbon:** The ribbon height is reduced to exactly `h-0.5` (2px) positioned along the top edge of the card.
2. **Dynamic Tint Preservation:** The top accent retains the CSS gradient `bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full` so it reflects the active theme without overwhelming the viewport.
3. **Card Shadow Elevation:** The container `Card` class in `FormBuilder.tsx` is updated from flat borders or `shadow-sm` to `shadow-md rounded-2xl border border-border/80 bg-card overflow-hidden`.
4. **Section Elevation Parity:** Each individual question card in `SortableFieldCard.tsx` carries the identical `shadow-md rounded-2xl` elevation, creating consistent visual rhythm throughout the canvas.

```tsx
/* FormBuilder.tsx - Title Card Container */
<Card className="border border-border/80 bg-card shadow-md rounded-2xl overflow-hidden animate-sweet-fade-in">
  {/* Top Accent Ribbon (Subtle 2px Theme Tint) */}
  <div className="h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full" />
  
  <CardContent className="p-5 sm:p-6 space-y-4">
    {/* Form Title & Config Dropdown */}
  </CardContent>
</Card>
```

---

## 3. Unified Expandable Config DropdownMenu

### 3.1 Problem Analysis
The title card row previously rendered multiple individual buttons side-by-side:
- Health score pill (`bg-emerald-500/10 text-emerald-600 ...`)
- Quiz Config button (`setIsCentralConfigOpen(true)`)
- Triggers button (`setIsNotificationModalOpen(true)`)
- Tools dropdown (`JsonModal`, `GoogleFormsImportModal`, `BranchingFlowModal`)
- Share button (`handleCopyLiveUrl`)

At viewports below 1440px, this horizontal cluster squeezed the form title input, causing title truncation or multi-line overflow.

### 3.2 Specification Requirements
All utility operations are consolidated into a single expandable `DropdownMenu` from `@/components/ui/dropdown-menu`:

1. **Trigger Element:**
   - Single `Button` with `variant="outline"`, size `sm`, dimensions `h-7 w-7` or `h-8 w-8`.
   - Uses `SlidersHorizontal` icon (`w-3.5 h-3.5 text-primary`).
   - Wrapped in a Shadcn `Tooltip` with text `"Config"`.
   - `aria-label="Config"`.
2. **Item Ordering & Action Handlers:**
   - **Item 1: Health & Audit:** Displays grade and percentage score (`Health: A+ (100%)`). Icon: `Shield` (emerald). Triggers `setInspectorTab('audit')` and `setIsDesignPanelOpen(true)`.
   - **Item 2: Quiz Config:** Icon: `Settings`. Triggers `setIsCentralConfigOpen(true)`.
   - **Item 3: Triggers:** Icon: `Bell`. Triggers `setIsNotificationModalOpen(true)`. When `settings.notificationTriggers.length > 0`, renders a count badge (`Badge variant="secondary"`).
   - **Separator:** `<DropdownMenuSeparator className="my-1 border-border/60" />`
   - **Item 4: JSON Import / Export:** Icon: `FileJson`. Triggers `setIsJsonModalOpen(true)`.
   - **Item 5: Import Google Forms:** Icon: `FileSpreadsheet`. Triggers `setIsGoogleModalOpen(true)`.
   - **Item 6: Visual Branching Flow:** Icon: `GitBranch`. Triggers `setIsFlowModalOpen(true)`.
   - **Separator:** `<DropdownMenuSeparator className="my-1 border-border/60" />`
   - **Item 7: Share:** Icon: `Share2`. Triggers `handleCopyLiveUrl` to copy public quiz URL to clipboard.
3. **Excluded Surfaces:**
   - **Preview & Save:** Remain in the separate top right segmented control above the canvas. Both are icon-first with Tooltips (`Eye` for Preview, `Save` / `Loader2` for Save).
   - **Trash Ledger Popover:** Remains an independent `Popover` triggered only when `trashFields.length > 0`, positioned adjacent to the Config button.

```tsx
/* FormBuilder.tsx - Unified Config Dropdown Structure */
<div className="flex items-center gap-1.5 shrink-0">
  <DropdownMenu>
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Config"
            className="h-8 w-8 p-0 border-border hover:bg-accent rounded-lg cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent>Config</TooltipContent>
    </Tooltip>

    <DropdownMenuContent align="end" className="w-60 bg-popover border border-border shadow-xl p-1 text-xs">
      <DropdownMenuItem
        onClick={() => {
          setInspectorTab('audit');
          setIsDesignPanelOpen(true);
        }}
        className="gap-2 cursor-pointer py-1.5"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Health: {designReport.grade || 'A+'} ({designReport.score}%)</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsCentralConfigOpen(true)}
        className="gap-2 cursor-pointer py-1.5"
      >
        <Settings className="w-3.5 h-3.5 text-primary" />
        <span>Quiz Config</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsNotificationModalOpen(true)}
        className="gap-2 cursor-pointer py-1.5"
      >
        <Bell className="w-3.5 h-3.5 text-primary" />
        <span>Triggers</span>
        {(settings.notificationTriggers?.length ?? 0) > 0 && (
          <Badge variant="secondary" className="h-4 px-1 text-[10px] font-bold bg-primary/15 text-primary ml-auto">
            {settings.notificationTriggers?.length}
          </Badge>
        )}
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1 border-border/60" />

      <DropdownMenuItem
        onClick={() => setIsJsonModalOpen(true)}
        className="gap-2 cursor-pointer py-1.5"
      >
        <FileJson className="w-3.5 h-3.5 text-primary" />
        <span>JSON Import / Export</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsGoogleModalOpen(true)}
        className="gap-2 cursor-pointer py-1.5"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
        <span>Import Google Forms</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsFlowModalOpen(true)}
        className="gap-2 cursor-pointer py-1.5"
      >
        <GitBranch className="w-3.5 h-3.5 text-primary" />
        <span>Visual Branching Flow</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1 border-border/60" />

      <DropdownMenuItem
        onClick={handleCopyLiveUrl}
        className="gap-2 cursor-pointer py-1.5"
      >
        <Share2 className="w-3.5 h-3.5 text-primary" />
        <span>Share</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Trash Popover (Rendered conditionally when trash has items) */}
  {trashFields && trashFields.length > 0 && (
    <Popover> ... </Popover>
  )}
</div>
```

---

## 4. Field Palette Overhaul & Unclipped Two-Row Layout

### 4.1 Problem Analysis
In `src/components/forms/field-palette.tsx`, the item option buttons rendered with single-line `truncate` classes on both the title and description. In narrow sidebars (`lg:col-span-4`), titles like `Section Header / Title` or `Video Briefing / Walkthrough` were clipped into unreadable fragments (e.g., `Section Head...`, `Video Briefi...`), while descriptions were cut off halfway. Furthermore, the category filter tabs overflowed horizontally.

### 4.2 Specification Requirements
1. **Unclipped Two-Row Card Layout:**
   - **Row 1 (Header):** Component label rendered with `font-semibold text-xs text-foreground group-hover:text-primary transition-colors`. No ellipsis truncating full titles unless viewport is below 200px. Adjacent monospace category badge (`text-[10px] uppercase font-mono text-muted-foreground/70`).
   - **Row 2 (Description):** Multi-line explanation styled with `text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2`. This ensures 2 full lines of context are visible without horizontal text clipping.
2. **Left Icon Tile:**
   - Fixed `w-8 h-8 rounded-lg` container with category color accents (`text-indigo-600`, `text-blue-600`, etc.), transitioning smoothly to primary fill on hover (`group-hover:bg-primary group-hover:text-primary-foreground`).
3. **Category Filtering System:**
   - Five standard categories preserved: `all` (All), `choice` (Choice), `text` (Text), `media` (Media), and `layout` (Page Elements).
   - Rendered in a single responsive row container (`flex flex-nowrap items-center gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60 min-w-0`).
   - Category buttons provide icon-first presentation with Shadcn `Tooltip` overlays showing `Label (Count)`, preventing rail blowout.
4. **Search and Quick Add Integration:**
   - Integrated search bar with instant substring filtering across `label`, `shortLabel`, and `description`.
   - Hover `Plus` icon appears on the right edge to indicate direct canvas insertion.

```tsx
/* field-palette.tsx - Unclipped Two-Row Component Card */
<button
  key={opt.type}
  type="button"
  onClick={() => onAddField(opt.type)}
  title={`${opt.label}: ${opt.description}`}
  className="flex items-center justify-between p-2 rounded-xl border border-border bg-card hover:bg-accent/60 hover:border-primary/50 transition-colors text-left group shadow-2xs hover:shadow-xs cursor-pointer min-w-0 w-full"
>
  <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${opt.colorClass} group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-150 mt-0.5`}
    >
      <IconComp className="w-4 h-4 transition-colors" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {opt.label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono opacity-60 shrink-0">
          {opt.category}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
        {opt.description}
      </p>
    </div>
  </div>

  <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
    <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-2xs">
      <Plus className="w-3.5 h-3.5" />
    </div>
  </div>
</button>
```

---

## 5. SortableFieldCard Header Streamlining

### 5.1 Problem Analysis
In `src/components/forms/sortable-field-card.tsx`, `CardHeader` suffered from inconsistent button sizes (mix of `h-8`, `h-10`, and unconstrained widths) and verbose text labels:
- `SelectTrigger` had variable sizing that expanded across narrow containers, colliding with question numbers.
- Per-question Save button lacked unified button dimensions and clear tooltip assistance.
- Layout Mode (Quiz vs Slide) and placement buttons took up excessive horizontal width.

### 5.2 Specification Requirements
1. **Standardized `h-8` Icon Buttons:** All action buttons in the header toolbar are aligned to an exact `h-8` height (e.g., `h-8 w-8` icon buttons) for visual consistency.
2. **Tooltips on All Header Controls:**
   - Drag handle: `title="Drag to reposition question"`
   - Question Order Index: `title="Click or double-click to type new order index"`
   - Quick Save Button: Shadcn `Tooltip` label `"Save Question"`
   - Format Mode Toggle: `Tooltip` label `"Quiz Format"` / `"Presentation Slide"`
   - Answer Placement: `Tooltip` label `"Answers Left"` / `"Answers Right"`
   - Live Preview Toggle: `Tooltip` label `"Preview Question"`
   - Actions Dropdown: `Tooltip` label `"Actions"`
3. **Distinct Dirty-State Save Button:**
   - When question data is modified (`isQuestionDirty === true`): Renders with `bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20` and white `Save` icon.
   - When question is in clean/saved state (`isQuestionDirty === false`): Renders cleanly as `bg-card border-border text-foreground hover:bg-accent` with muted emerald `Save` icon.
4. **Constrained Field Type Selector:**
   - `SelectTrigger` is constrained to `h-8 min-w-0 w-[9.5rem] sm:w-[11.5rem] text-xs font-semibold bg-background border border-input rounded-lg shadow-2xs`.
   - Text values are truncated gracefully with `[&>span]:truncate [&>span]:min-w-0` to avoid pushing right-aligned tools off-screen.

```tsx
/* sortable-field-card.tsx - Streamlined CardHeader Toolbar */
<CardHeader className="py-2.5 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-border/60 bg-muted/15 space-y-0 gap-2 rounded-t-2xl">
  {/* Left: Drag Handle, Question Index, Dirty-State Save, Issue Badges */}
  <div className="flex items-center gap-2 flex-wrap min-w-0">
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors shrink-0"
      title="Drag to reposition question"
    >
      <GripVertical className="w-4 h-4" />
    </div>

    <button
      type="button"
      onClick={() => setIsEditingIndex(true)}
      className="font-mono text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all cursor-pointer"
      title="Click or double-click to type new order index"
    >
      <span>#{index + 1}</span>
      {field.isRequired && <span className="text-destructive font-bold ml-0.5">*</span>}
    </button>

    {/* Standardized h-8 Dirty-State Save Button */}
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleSaveQuestion}
          className={`h-8 w-8 p-0 rounded-lg border text-xs font-semibold inline-flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isQuestionDirty
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
              : 'bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          aria-label="Save Question"
        >
          <Save className={`w-3.5 h-3.5 ${isQuestionDirty ? 'text-white' : 'text-emerald-500'}`} />
        </button>
      </TooltipTrigger>
      <TooltipContent>Save Question</TooltipContent>
    </Tooltip>

    {field.group && (
      <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/80 font-medium flex items-center gap-1 shrink-0">
        <Layers className="w-3 h-3 text-primary" /> {field.group}
      </span>
    )}
  </div>

  {/* Right: Constrained Type Select + Format Toggles + Preview + Actions */}
  <div className="flex items-center gap-1.5 shrink-0 justify-end">
    <Select
      value={field.type === 'true_false' ? 'boolean' : field.type}
      onValueChange={(val) => onUpdate(id, { type: val as FieldType })}
    >
      <SelectTrigger className="h-8 text-xs bg-background text-foreground border border-input rounded-lg font-semibold min-w-0 w-[9rem] sm:w-[11rem] shrink overflow-hidden [&>span]:min-w-0 [&>span]:truncate shadow-2xs cursor-pointer">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border max-h-72">
        {/* Field Type Select Items */}
      </SelectContent>
    </Select>

    {/* Compact Layout Toggle (Quiz vs Slide) */}
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5 h-8 shrink-0 shadow-2xs">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onUpdate(id, { layoutMode: 'standard' })}
            className={`inline-flex items-center justify-center h-full w-7 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              field.layoutMode !== 'presentation_split'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Quiz Format</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onUpdate(id, { layoutMode: 'presentation_split' })}
            className={`inline-flex items-center justify-center h-full w-7 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              field.layoutMode === 'presentation_split'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Presentation Slide</TooltipContent>
      </Tooltip>
    </div>

    {/* Preview & Actions Group */}
    <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-2xs overflow-hidden h-8 shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`inline-flex items-center justify-center h-full w-8 text-xs font-semibold transition-all cursor-pointer ${
              showLivePreview
                ? 'bg-primary text-primary-foreground shadow-inner'
                : 'text-foreground hover:bg-accent/80 hover:text-foreground'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Preview</TooltipContent>
      </Tooltip>

      <div className="w-px h-4 bg-border shrink-0" />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-full w-8 text-xs font-semibold transition-all cursor-pointer text-foreground hover:bg-accent/80"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56 p-1 bg-popover border border-border shadow-lg">
          {/* Actions Dropdown Content */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</CardHeader>
```

---

## 6. Onboarding Quiz Branding Standards

### 6.1 Brand Identity Definition
- **Product Name:** `Onboarding Quiz` (replaces `WP Exam`, `WP Exam Console`, and generic WordPress references in consumer-facing text).
- **Current Version:** `v2.5`
- **Application Role:** Enterprise curriculum authoring, sequential skill assessments, and candidate screening engine.
- **Brand SVG Assets:**
  - `src/assets/onboarding-quiz-logo.svg` (Canonical primary brand asset).
  - Clean geometry: 32x32 viewbox, rounded navy base `#152033` (rx="8"), cream quiz document card `#F7F4EC` (rx="2.5"), assessment checklist rules, and vibrant emerald check circle badge (`#1F8A4C`).

### 6.2 Sidebar & Top Bar Branding
In `src/components/admin/wp-admin-sidebar.tsx`:
1. **Brand Header:**
   - Display `onboardingQuizLogo` (or imported SVG mark) with `w-8 h-8 rounded-lg shrink-0`.
   - Title: `Onboarding Quiz` (`font-bold text-xs tracking-tight text-foreground truncate`).
   - Version badge: `v2.5` (`text-xs px-1 rounded bg-muted text-primary font-mono border border-border`).
   - Subtitle: `Admin Console` (`text-xs text-muted-foreground font-mono truncate`).
2. **Selected Navigation Row Contrast:**
   - Selected sidebar items use `bg-muted text-foreground font-semibold shadow-xs`.
   - Active accent bar: `absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary`.
   - Under the **Riseup** theme, the row must NEVER use `bg-primary/15` or yellow-on-yellow fills. Gold remains exclusively on the thin left accent bar.

### 6.3 Login Screen Alignment (`Index.tsx`)
In `src/pages/Index.tsx`:
1. **Unauthenticated Portal Header:**
   - Update title from legacy `WP Exam Console` to `Onboarding Quiz Console`.
   - Subtitle: `Restricted administrative portal for onboarding curriculum authoring and candidate scoring.`
   - Display the new brand logo asset in the top portal card.

---

## 7. Acceptance Criteria & Verification Checklist

| Area | Verification Check | Expected Outcome | Status |
|------|--------------------|------------------|--------|
| **Ribbon Restraint** | Inspect top of title card in `FormBuilder` | Top accent edge is exactly `h-0.5` (2px), no thick green bands | [ ] |
| **Card Elevation** | Inspect title card and sortable question cards | All cards carry `shadow-md rounded-2xl border-border/80` | [ ] |
| **Config Dropdown** | Open title card toolbar | Single `Config` icon button (`SlidersHorizontal`), opens dropdown with Health, Quiz Config, Triggers, JSON, Google Forms, Branching, Share | [ ] |
| **Title Input** | View title row at desktop and tablet widths | Title text input remains completely unclipped and visible | [ ] |
| **Palette Layout** | View `FieldPalette` in right rail | Cards render in two rows with `line-clamp-2` descriptions, no clipped titles | [ ] |
| **Palette Categories** | Click category filters (`All`, `Choice`, `Text`, `Media`, `Layout`) | Filter pills fit neatly in one row with tooltips, no horizontal blowout | [ ] |
| **SortableCard Header** | Inspect question card toolbar | Save, preview, format toggles, and actions are standardized to `h-8` with tooltips | [ ] |
| **Dirty Save State** | Edit a question label or option | Save button highlights in emerald (`bg-emerald-600 ring-2 ring-emerald-500/20`), reverts after save | [ ] |
| **Type Selector** | Check field type dropdown on question card | Constrained width (`w-[9rem] sm:w-[11rem]`) with graceful text truncation | [ ] |
| **Sidebar Branding** | Inspect sidebar top left brand block | Renders SVG logo, `Onboarding Quiz`, `v2.5`, and `Admin Console` | [ ] |
| **Sidebar Contrast** | Switch to Riseup theme, inspect active tab | Selected tab is `bg-muted text-foreground` with thin gold bar; no yellow-on-yellow | [ ] |
| **Login Portal** | Log out or view unauthenticated `Index.tsx` | Portal reads `Onboarding Quiz Console` with logo and clear credentials guide | [ ] |

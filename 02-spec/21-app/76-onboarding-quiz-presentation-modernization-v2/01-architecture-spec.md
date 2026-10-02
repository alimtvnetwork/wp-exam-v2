# 76 Onboarding Quiz UI Presentation Modernization (v2) — Architecture Specification

**Version:** 2.0.0  
**Updated:** 2026-10-02  
**AI Confidence:** Verified  
**Ambiguity:** None  
**Module:** `02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2`  
**Parent Plan:** [.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md](../../../.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md)  
**Implementation Subtask:** [.ai-memory/plans/subtasks/76-onboarding-quiz-presentation-modernization-v2/01-builder-chrome.md](../../../.ai-memory/plans/subtasks/76-onboarding-quiz-presentation-modernization-v2/01-builder-chrome.md)

---

## Keywords

`onboarding-quiz` · `builder-chrome` · `hairline-edge` · `config-dropdown` · `field-palette` · `sortable-field-card` · `branding` · `shadcn-tooltips` · `dock-tabs` · `category-pills`

---

## Scoring

| Criterion | Status | Notes |
|-----------|--------|-------|
| Lossless User Requirements Ingestion | ✅ Pass | Exact user brief captured verbatim with structured requirement mapping |
| Builder Header Chrome & Hairline Edge | ✅ Pass | 2px gradient edge (`h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60`) and `shadow-md` card elevation |
| Consolidated Config Dropdown | ✅ Pass | Single `<SlidersHorizontal className="w-4 h-4 text-primary" />` icon trigger with tooltip "Configuration & Tools" |
| Brand Identity & Wordmark | ✅ Pass | Canonical SVG logo (`src/assets/onboarding-quiz-logo.svg`), product name "Onboarding Quiz v2.5", sidebar active contrast fix |
| Right Rail Dock & Field Palette | ✅ Pass | Icon-first `grid-cols-4` segmented dock tabs and single-row `flex-nowrap` category pills with tooltips |
| Question Card Toolbar | ✅ Pass | Constrained type selector (`w-[9rem] sm:w-[11rem] [&>span]:truncate`), `h-8` icon buttons, dirty-state Save |
| Verification Criteria | ✅ Pass | Concrete line mappings, DOM assertions, and Vitest suite compatibility |

---

## 1. User Requirements (Lossless Ingestion)

### 1.1 Verbatim Source Request
```text
# High Priority Instruction

Okay, let's start with the UI issues in the WB exam. Okay, so first, let's get the latest for all. That's the first thing. Once we have the latest, then I think we can get into the WB exam, what we can improve. Okay. So if we open the UI, the green theme is nice. I like it. But if you look into this, the above portion had too much green. Okay? The border color, what I do, I mean. Before the health, there is a green border, right? It's too much green. Just reduce this, okay, so that it feels nice. It could be on top, it could be bottom also. We can try it out, which one looks nice. And a little bit of shadow. Little shadow at the sections would make it little bit nicer. Okay. Now, coming to the problem, the health, quiz, config, trigger, tools, share, all this, I think, needs to be combined to a dropdown, okay, so that the title is displayed. So many issues when we look into this. So many broken down the UI components, as you can see. Okay, I've given the screenshot. The next problem is also the logo. It'll be Onboarding Quiz, something like this, the name of the application in the future. So based on that, you can actually create a logo and update the logo there as well. Now, coming to the point, green I do like, so it's nice. Okay? But there are broken UI components, as you can see in the UI. Right-hand side, the fields, outline, audit, and config broken. Okay? Also, the all choice and stuff is broken out of it. And then also the item options where the blocks, where the questions actually appear, these sections also broken, you can see. So as I have asked you before, try to have icons so that you can reduce the stuff automatically. Okay? Try to have icons. For example, save and preview have two icons on the top. Try to have icons that would make things a lot more better. Okay. For example, you can have a dropdown config that would actually have this share, copy, update URL, things like that. So it can have a dropdown section that would extend, and then that would show other buttons that these are there. So apply the modern UI/UX concept. Okay? That is missing. Now, if we go into the preview mode, that is very much cracked. Okay? So I've been saying this for a long time, and I want you to write the suspect, write the differences for the other AI-made mistakes. Okay? So this preview should look like a view from white presentation. So you go inside the white presentations or the white presentation repo and see how they present in the left-hand side. The question would be bigger left-hand side, a little bit of subtitle, and then right-hand side, very professional options should be visible. And every time I hover over, I should see nice animation, very nice CSS3 animation sliding in or showcasing what's going on, and probably show an hint as well, every section if we want. Okay, so this is how it needs to be presented, like full screen. Okay? And based on questions, there could be a section where I would have a video, full page, a video on top and bottom. It could ask a question, a small question, and give two options to pick. And based on the option or direction I pick, I would go to another conditional route to proceed further. Okay? So these are the things I want. When the preview is there, some of the buttons you can have, like quiz presentation, you can have in the config section. Try to combine all these two icons and dropdowns buttons so that it actually combines together like a slide view, okay, or presentations view, which you learn from the white presentation. Also, the global PPT, how to present. So all kinds of presentation options we need to have. Okay? The quizzes needs to be very bigger in the screen so that anyone can focus. They could understand their checklist. So I want you to go through the code base and also the previous conversation, try to understand. I complained several times. It didn't follow through. So first, create a big plan. Write this exact what I'm saying into the task, into the plan folders, okay? And then start doing it. Okay, and also the colors. Colors looks terrible. If you see the what does HTML stands for, the preview mode, the above level, the question hash one, it is purple under purple. It's like fully same thing. Sample sequential knowledge quiz, right-hand side. Live preview. Why this is there, I don't know. Okay? The UI/UX concept is terrible. And why the button exactly looks like the background, no idea. Okay? So need to fix all these UI/UX issues. If we go into the golden color of the Rise Up Asia. Again, the Rise Up Asia name should not be there. And again, the name is wrong because Rise Up needs to be written as together, okay? So many mistakes. Now the color that we have, it's like too much of the yellow, which actually makes too much brain fog, okay? The yellow color is very sensitive. It needs to be handled with care and needs to be found on specific cases where we're going to highlight. There could be a lighter yellow color that can be used, which is not used. And also with the Rise Up Asia, there could be other variants. Like this is a little bit navy color we see, right? We can have a VS Code type color where the background is kind of dark like VS Code, but also the color is yellow. So that could be another theme. So think about this, make these themes, okay? Make the UI/UX concept so that there is no overlapping. Try to understand this. Most of the complicated buttons like help, quiz config, these should be combined to one buttons. If we click on it, that would actually expand to other buttons and other stuff. And yellow color, be respectful, do not put it everywhere. It's a highlighter color, so it would use as a brain training where we want people to focus in. Okay, now the buttons part in the Rise Up Asia color. You can see left-hand side from quiz builder, that is a highlighted, selected item. That is again yellow inside yellow. That really looks very terrible, okay? You need to understand the color concept, how the contrast needs to be played, which you can see inside the PowerPoint presentations like global PPT, the BSRM presentation, all the other presentation, you can look into this, how it's presented. Okay? So these are the things we want, okay? But things are not going very well. Okay. Also the presentation, like if you have multiple projects, then how the multiple projects would be displayed. The preview should not be opening like a tab or reducing the space. It should be like a presentation full view if we are in presentation mode. Think about that. Okay? We should be able to change theme and other part. That's correct. But use logo, like theme and then logo. That's it. Don't write too much text, okay? And try to use the tool tip so that everything is professional. Hover over, user can understand what's going on. Think about how to display the quiz question and stuff properly. Is it clear? Can you please follow through all of these items
```

### 1.2 Actionable Technical Scope Breakdown
1. **Header Chrome Ribbon & Shadows:**
   - Eliminate heavy green or primary-colored borders.
   - Implement a crisp, 2px top hairline accent edge: `h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60`.
   - Apply standard section drop shadow: `shadow-md` across both the title card and question section cards.
2. **Consolidated Config Dropdown:**
   - Consolidate inline actions (`Health`, `Quiz Config`, `Triggers`, `JSON`, `Google Forms`, `Visual Branching`, `Share`) into a single expandable `DropdownMenu`.
   - Use icon trigger `<SlidersHorizontal className="w-4 h-4 text-primary" />` with tooltip `"Configuration & Tools"`.
   - Free horizontal width for the form title input, preventing truncation or wrapping.
3. **Onboarding Quiz Branding & Sidebar:**
   - Establish primary product identity: **"Onboarding Quiz"** (version **v2.5**).
   - Dedicated vector SVG logo asset at `src/assets/onboarding-quiz-logo.svg`.
   - Sidebar active state contrast: `bg-muted text-foreground` with a 4px left primary accent bar (`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary`), preventing low-contrast yellow-on-yellow fills in the Riseup theme.
   - Update unauthenticated login screen in `src/pages/Index.tsx` to "Onboarding Quiz Console".
4. **Right Rail Dock Tabs & Field Palette Category Pills:**
   - Fix horizontal overflow in inspector dock header using icon-first `grid-cols-4` segmented layout with Shadcn Tooltips (`Fields`, `Outline`, `Audit`, `Config`).
   - Fix category tabs in `src/components/forms/field-palette.tsx` using a single-row `flex-nowrap` container with icon pills and tooltips (`All`, `Choice`, `Text`, `Media`, `Layout`).
   - Remove text clipping in component cards with 2-row layout and `line-clamp-2` descriptions.
5. **Question Card Header Toolbar:**
   - Constrain field type selector `SelectTrigger` to `w-[9rem] sm:w-[11rem] [&>span]:truncate`.
   - Standardize all header controls to compact `h-8` icon buttons with Shadcn Tooltips.
   - Implement prominent dirty-state `Save` indicator (emerald ring when modified, neutral when clean).
   - Icon-first format toggle (`Quiz Format` vs `Presentation Slide`) and answer placement (`Answers Left` vs `Answers Right`).

---

## 2. Architectural Blueprint & Component Map

```
+-------------------------------------------------------------------------------------------------------------+
|  Top Admin Bar: [Logo SVG] Onboarding Quiz v2.5            [Theme Switcher] [Howdy, admin] [Log Out]        |
+-------------------------------------------------------------------------------------------------------------+
|  WpAdminSidebar (w-64 / w-16)  | Main Canvas (FormBuilder.tsx)                                              |
|                                |                                                                            |
|  [Logo] Onboarding Quiz v2.5   | Top Action Bar: [Form Title / Slug]        [Preview (Icon)] [Save (Icon)]  |
|  Authoring & Curriculum:       | +------------------------------------------------------------------------+ |
|   * Form & Quiz Builder (Active| | Title Card (border border-border/80 bg-card shadow-md rounded-2xl)     | |
|     bg-muted text-foreground   | | Hairline Edge: h-0.5 bg-gradient-to-r from-primary via-primary/80...   | |
|     with left primary bar)     | | [ Title Input: "Untitled Assessment Form" ]    [Config Dropdown] [Trash]| |
|   * Focus Quiz Studio          | +------------------------------------------------------------------------+ |
|   * Curriculum Projects        |                                                                            |
|   * AI Instruction Studio      | Grid 12 Columns:                                                           |
|                                | +-------------------------------------+ +--------------------------------+ |
|  Candidate Delivery:           | | Canvas Area (lg:col-span-8)         | | Right Dock Rail (lg:col-span-4)| |
|   * Focus Quiz Runner          | |                                     | | Card shadow-md rounded-xl    | |
|   * Live Form Runner           | | SortableFieldCard (#1)              | | Tabs: [Fields][Outl][Aud][Cfg] | |
|   * Candidate Invites          | | Header: [::] [#1*] [Save]           | | FieldPalette:                  | |
|                                | |         [Type Selector w-44]        | | Category Pills:                | |
|  Operations & System:          | |         [Layout: Quiz|Slide]        | | [All][Choice][Text][Med][Lay]  | |
|   * Analytics & Scoring        | |         [Answers: L|R]              | | Palette Cards (Two-Row):       | |
|   * SQLite Split-DB            | |         [Preview] [Actions]         | | [Icon] Title                   | |
|   * Backup Manager             | | Body: Question inputs, options      | |        line-clamp-2 desc       | |
|                                | +-------------------------------------+ +--------------------------------+ |
+--------------------------------+----------------------------------------------------------------------------+
```

### Component Responsibility Table

| File Relative Path | Primary Architectural Responsibility | Lines Impacted |
|--------------------|--------------------------------------|----------------|
| `src/components/forms/FormBuilder.tsx` | Title card 2px hairline edge, `shadow-md` elevation, consolidated Config `DropdownMenu`, top action toolbar, right rail segmented dock tabs | ~650–825, ~1090–1165 |
| `src/components/forms/field-palette.tsx` | Single-row `flex-nowrap` category icon pills with tooltips, unclipped 2-row component cards, `line-clamp-2` descriptions | ~220–285, ~305–348 |
| `src/components/forms/sortable-field-card.tsx` | Card header toolbar, constrained type selector (`w-[9rem] sm:w-[11rem]`), `h-8` icon buttons with tooltips, dirty-state Save button | ~540–825 |
| `src/components/admin/wp-admin-sidebar.tsx` | Brand header with vector logo, "Onboarding Quiz v2.5", high-contrast active navigation state (`bg-muted text-foreground` + primary bar) | ~180–210, ~250–265 |
| `src/assets/onboarding-quiz-logo.svg` | Vector brand identity mark with rounded geometry, document card, checklist rules, and emerald check badge | 1–35 |
| `src/pages/Index.tsx` | Administrative login console rebranding ("Onboarding Quiz Console"), top admin bar branding, theme map container | ~100–120, ~195–215 |

---

## 3. Detailed Component Specifications

### 3.1 Builder Header Chrome & Hairline Edge (`FormBuilder.tsx`)

#### 3.1.1 Problem Analysis
In prior iterations, title cards featured heavy colored bands (`h-2` or `h-2.5`) spanning the entire width. In high-saturation themes such as Green Choice (`#16a34a`) or Riseup (`#ffad01`), this created severe visual dominance and eye fatigue. Sections also appeared flat against the background due to missing elevation tokens.

#### 3.1.2 Specification
1. **2px Hairline Top Edge:**
   - Height: `h-0.5` (2px).
   - Background: `bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full`.
   - Position: Directly at the top inside edge of the `Card` container before `CardContent`.
2. **Elevation & Card Styling:**
   - Class: `border border-border/80 bg-card shadow-md rounded-2xl overflow-hidden animate-sweet-fade-in`.
   - Provides clean depth separation from the page canvas while maintaining theme token inheritance.
3. **Form Title Input:**
   - Unconstrained flex item (`flex-1 min-w-0`).
   - Font: `text-xl sm:text-2xl font-bold bg-transparent border-0 border-b border-border/40 hover:border-border focus:border-primary focus:outline-none transition-colors px-1 py-1 text-foreground placeholder:text-muted-foreground/40`.

```tsx
/* FormBuilder.tsx - Title Card Implementation */
<Card className="border border-border/80 bg-card shadow-md rounded-2xl overflow-hidden animate-sweet-fade-in">
  {/* 2px Hairline Theme Tint */}
  <div className="h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full" />

  <CardContent className="p-5 sm:p-6 space-y-4">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled Assessment Form"
        className="flex-1 text-xl sm:text-2xl font-bold bg-transparent border-0 border-b border-border/40 hover:border-border focus:border-primary focus:outline-none transition-colors px-1 py-1 text-foreground placeholder:text-muted-foreground/40 min-w-0"
      />
      {/* Consolidated Config Dropdown */}
    </div>
  </CardContent>
</Card>
```

---

### 3.2 Consolidated Config Dropdown Menu (`FormBuilder.tsx`)

#### 3.2.1 Problem Analysis
Individual inline buttons for Health, Quiz Config, Triggers, JSON, Google Forms, Visual Branching, and Share consumed excessive horizontal canvas space, forcing title text wrapping on viewports below 1440px.

#### 3.2.2 Specification
Consolidate all seven utility operations into a single Shadcn `DropdownMenu`:

1. **Trigger Button:**
   - Element: `<Button variant="outline" size="sm" aria-label="Configuration & Tools" className="h-8 w-8 p-0 border-border hover:bg-accent rounded-lg cursor-pointer shrink-0">`
   - Icon: `<SlidersHorizontal className="w-4 h-4 text-primary" />`
   - Tooltip: `"Configuration & Tools"`
2. **Dropdown Content:**
   - Container: `<DropdownMenuContent align="end" className="w-60 bg-popover border border-border shadow-xl p-1 text-xs">`
   - Items:
     - **Health Score:** `<Shield className="w-3.5 h-3.5 text-emerald-500" />` &rarr; `Health Score: {grade} ({score}%)`. Triggers `setInspectorTab('audit')` and `setIsDesignPanelOpen(true)`.
     - **Quiz Config:** `<Settings className="w-3.5 h-3.5 text-primary" />` &rarr; `Quiz Config`. Triggers `setIsCentralConfigOpen(true)`.
     - **Triggers:** `<Bell className="w-3.5 h-3.5 text-primary" />` &rarr; `Triggers` with secondary badge count if triggers exist. Triggers `setIsNotificationModalOpen(true)`.
     - *Separator*
     - **JSON Import / Export:** `<FileJson className="w-3.5 h-3.5 text-primary" />` &rarr; Triggers `setIsJsonModalOpen(true)`.
     - **Import Google Forms:** `<FileSpreadsheet className="w-3.5 h-3.5 text-primary" />` &rarr; Triggers `setIsGoogleModalOpen(true)`.
     - **Visual Branching Flow:** `<GitBranch className="w-3.5 h-3.5 text-primary" />` &rarr; Triggers `setIsFlowModalOpen(true)`.
     - *Separator*
     - **Share / Copy Live URL:** `<Share2 className="w-3.5 h-3.5 text-primary" />` &rarr; Triggers `handleCopyLiveUrl()`.
3. **Adjacent Controls:**
   - **Trash Ledger Popover:** Stays adjacent to Config button, rendered conditionally when `trashFields.length > 0`.
   - **Save & Preview:** Maintained in the top-right sticky segmented bar above the form canvas with Tooltip wrappers.

```tsx
/* FormBuilder.tsx - Consolidated Config Menu */
<div className="flex items-center gap-1.5 shrink-0">
  <DropdownMenu>
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Configuration & Tools"
            className="h-8 w-8 p-0 border-border hover:bg-accent rounded-lg cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent>Configuration & Tools</TooltipContent>
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
        <span>Health Score: {designReport.grade || 'A+'} ({designReport.score}%)</span>
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
        <span>Share / Copy Live URL</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Trash Popover */}
  {trashFields && trashFields.length > 0 && (
    <Popover> ... </Popover>
  )}
</div>
```

---

### 3.3 Onboarding Quiz Branding & Sidebar Active State (`wp-admin-sidebar.tsx`)

#### 3.3.1 Brand Identity Definition
- **Product Name:** `Onboarding Quiz` (canonical wordmark).
- **Console Label:** `Admin Console`.
- **Version Badge:** `v2.5` (`font-mono border border-border text-primary bg-muted`).
- **Vector Brand Mark:** `src/assets/onboarding-quiz-logo.svg`:
  - 32x32 viewbox.
  - `#152033` dark navy base container with `rx="8"`.
  - `#F7F4EC` warm cream assessment card (`rx="2.5"`).
  - Modern checklist accent rules (`#2A72E5` blue, `#E8C547` gold, `#6366F1` indigo).
  - Emerald validation badge (`#1F8A4C`) with crisp white checkmark path.

#### 3.3.2 Sidebar Active Navigation Row Contrast
Under themes with yellow or gold primary tokens (e.g., **Riseup** `#ffad01`), active navigation items previously rendered with yellow text on yellow background, rendering text unreadable.

**Rule:**
- Inactive rows: `text-muted-foreground hover:text-foreground hover:bg-muted/80`.
- Active rows: `bg-muted text-foreground font-semibold shadow-xs`.
- Primary Accent Indicator: `absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary`.
- Never use `bg-primary/20` or yellow background fills on active rows. High-contrast neutral background (`bg-muted`) paired with foreground text ensures WCAG AAA compliance across all 9 themes.

```tsx
/* wp-admin-sidebar.tsx - Active State Styling */
<button
  key={item.id}
  type="button"
  onClick={() => onSelectTab(item.id)}
  title={isCollapsed ? item.label : undefined}
  className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
    isActive
      ? 'bg-muted text-foreground font-semibold shadow-xs'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
  }`}
>
  {isActive && (
    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />
  )}
  <IconComponent
    className={`w-4 h-4 shrink-0 transition-colors ${
      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
    }`}
  />
  {!isCollapsed && (
    <div className="flex-1 flex items-center justify-between overflow-hidden">
      <span className="truncate">{item.label}</span>
      {item.badge && <Badge ...>{item.badge}</Badge>}
    </div>
  )}
</button>
```

---

### 3.4 Right Rail Dock Tabs & Field Palette Category Pills

#### 3.4.1 Right Rail Dock Segmented Tabs (`FormBuilder.tsx`)
In narrow viewports or 1080p desktop layouts, tabs with long labels caused text clipping and line breaks.

**Specification:**
- Segmented header container: `<TabsList className="grid grid-cols-4 h-10 p-1 bg-muted/60 rounded-xl">`
- 4 Dock Tabs:
  1. `palette`: Icon `<Layers className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Fields"`. Tooltip `"Fields ({fields.length})"`.
  2. `outline`: Icon `<ListOrdered className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Outline"`. Tooltip `"Outline ({fields.length})"`.
  3. `audit`: Icon `<ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Audit"`. Tooltip `"Audit ({grade})"`.
  4. `settings`: Icon `<Settings className="w-3.5 h-3.5 text-primary shrink-0" />`, label `"Config"`. Tooltip `"Config"`.
- Labels hide gracefully on smaller breakpoints (`hidden sm:inline-block text-[11px] truncate`), falling back to icon-only presentation with tooltips.

#### 3.4.2 Field Palette Category Pills (`field-palette.tsx`)
In previous builds, category filter tabs wrapped to multiple rows or overflowed horizontally.

**Specification:**
- Single-row non-wrapping container: `<div className="flex flex-nowrap items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/60 min-w-0 overflow-x-auto no-scrollbar">`
- 5 Compact Category Filters:
  - `All` (`Layers`, count `15`)
  - `Choice` (`CheckSquare`, count `5`)
  - `Text` (`Type`, count `4`)
  - `Media` (`Video`, count `4`)
  - `Layout` (`Heading`, count `2`)
- Icon-first layout with Shadcn `Tooltip` overlays (`Category (Count)`).
- Component Cards: Unclipped 2-row layout with `line-clamp-2` descriptions, category color tiles (`w-8 h-8 rounded-lg`), and hover `Plus` insertion button.

```tsx
/* field-palette.tsx - Segmented Category Filter Pills */
<div className="flex flex-nowrap items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/60 min-w-0 overflow-x-auto no-scrollbar">
  {categories.map((cat) => {
    const CategoryIcon = cat.icon;
    const isSelected = selectedCategory === cat.id;

    return (
      <Tooltip key={cat.id}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            aria-label={`${cat.label} (${cat.count})`}
            className={`flex-1 min-w-0 text-xs py-1.5 px-1.5 rounded-md transition-all font-medium text-center flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
            <span className={`text-[11px] truncate ${isEmbedded ? 'hidden 2xl:inline-block' : 'hidden sm:inline-block'}`}>
              {cat.label}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {cat.label} ({cat.count})
        </TooltipContent>
      </Tooltip>
    );
  })}
</div>
```

---

### 3.5 Question Card Header Toolbar (`sortable-field-card.tsx`)

#### 3.5.1 Problem Analysis
Question cards had inconsistent control heights (`h-8`, `h-9`, `h-10`), unbounded type selectors that pushed toolbars off-screen, missing tooltips, and weak dirty-state save signaling.

#### 3.5.2 Specification
1. **Unified `h-8` Button Height:** Every interactive control in `CardHeader` is exactly `h-8` (`32px`).
2. **Constrained Field Type Selector:**
   - Class: `h-8 text-xs bg-background text-foreground border border-input rounded-lg font-semibold min-w-0 w-[9rem] sm:w-[11rem] shrink overflow-hidden [&>span]:min-w-0 [&>span]:truncate shadow-2xs cursor-pointer`.
   - Prevents overflow even with long type labels like "List of Items / Links" or "Rating with Feedback".
3. **Dirty-State Save Button:**
   - Snapshot comparison: `isQuestionDirty = currentQuestionSnapshot !== lastSavedSnapshotRef.current`.
   - Dirty (`true`): `bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20` with white `Save` icon. Tooltip: `"Save Question (Unsaved Changes)"`.
   - Clean (`false`): `bg-card border-border text-foreground hover:bg-accent` with muted emerald `Save` icon. Tooltip: `"Question is Saved"`.
4. **Layout Mode Toggle (Quiz vs Slide):**
   - Segmented toggle (`h-8`): `<LayoutTemplate className="w-3.5 h-3.5" />` (Quiz Format) vs `<Columns className="w-3.5 h-3.5" />` (Presentation Slide).
5. **Answer Placement Toggle (Slide Mode):**
   - Renders only when `field.layoutMode === 'presentation_split'`.
   - `<PanelRight className="w-3.5 h-3.5" />` (Answers Right) vs `<PanelLeft className="w-3.5 h-3.5" />` (Answers Left).
6. **Preview & Actions Segmented Control:**
   - `<Eye className="w-3.5 h-3.5" />` with tooltip `"Preview"`.
   - `<SlidersHorizontal className="w-3.5 h-3.5" />` with tooltip `"Actions"`.

```tsx
/* sortable-field-card.tsx - Streamlined CardHeader Toolbar */
<CardHeader className="py-2.5 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-border/60 bg-muted/15 space-y-0 gap-2 rounded-t-2xl">
  {/* Left Controls: Drag handle, Order index, Dirty Save, Group */}
  <div className="flex items-center gap-2 flex-wrap min-w-0">
    <div {...attributes} {...listeners} className="cursor-grab p-1.5 text-muted-foreground hover:text-primary">
      <GripVertical className="w-4 h-4" />
    </div>

    <button
      type="button"
      onClick={() => setIsEditingIndex(true)}
      className="font-mono text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
      title="Click or double-click to type new order index"
    >
      <ListOrdered className="w-3.5 h-3.5 opacity-75" />
      <span>#{index + 1}</span>
      {field.isRequired && <span className="text-destructive font-bold ml-0.5">*</span>}
    </button>

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
      <TooltipContent>{isQuestionDirty ? 'Save Question (Unsaved Changes)' : 'Question is Saved'}</TooltipContent>
    </Tooltip>

    {field.group && (
      <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/80 font-medium flex items-center gap-1 shrink-0">
        <Layers className="w-3 h-3 text-primary" /> {field.group}
      </span>
    )}
  </div>

  {/* Right Controls: Type Select + Layout Toggles + Preview + Actions */}
  <div className="flex items-center gap-1.5 shrink-0 justify-end">
    <Select value={field.type} onValueChange={(val) => onUpdate(id, { type: val as FieldType })}>
      <SelectTrigger className="h-8 text-xs bg-background text-foreground border border-input rounded-lg font-semibold min-w-0 w-[9rem] sm:w-[11rem] shrink overflow-hidden [&>span]:min-w-0 [&>span]:truncate shadow-2xs cursor-pointer">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border max-h-72">
        {/* Type Items */}
      </SelectContent>
    </Select>

    <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5 h-8 shrink-0 shadow-2xs">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onUpdate(id, { layoutMode: 'standard' })}
            className={`inline-flex items-center justify-center h-full w-7 rounded-md text-xs font-semibold ${field.layoutMode !== 'presentation_split' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Quiz Format"
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
            className={`inline-flex items-center justify-center h-full w-7 rounded-md text-xs font-semibold ${field.layoutMode === 'presentation_split' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Presentation Slide"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Presentation Slide</TooltipContent>
      </Tooltip>
    </div>

    {field.layoutMode === 'presentation_split' && (
      <div className="hidden md:inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 h-8 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onUpdate(id, { answerPlacement: 'right' })}
              className={`inline-flex items-center justify-center h-full w-7 rounded-md text-xs font-semibold ${(field.answerPlacement || 'right') !== 'left' ? 'bg-card text-foreground shadow-2xs font-bold border border-border/80' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Answers Right"
            >
              <PanelRight className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Answers Right</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onUpdate(id, { answerPlacement: 'left' })}
              className={`inline-flex items-center justify-center h-full w-7 rounded-md text-xs font-semibold ${field.answerPlacement === 'left' ? 'bg-card text-foreground shadow-2xs font-bold border border-border/80' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Answers Left"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Answers Left</TooltipContent>
        </Tooltip>
      </div>
    )}

    <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-2xs overflow-hidden h-8 shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`inline-flex items-center justify-center h-full w-8 text-xs font-semibold cursor-pointer ${showLivePreview ? 'bg-primary text-primary-foreground shadow-inner' : 'text-foreground hover:bg-accent/80'}`}
            aria-label="Preview"
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
                className="inline-flex items-center justify-center h-full w-8 text-xs font-semibold cursor-pointer text-foreground hover:bg-accent/80"
                aria-label="Actions"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56 p-1 bg-popover border border-border shadow-lg">
          {/* Action Items: Duplicate, Delete, Add Option, AI Assistant */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</CardHeader>
```

---

## 4. Acceptance Criteria & Verification Checklist

| Spec Item | Test File / Verification Target | Expected Behavior | Verification Status |
|-----------|----------------------------------|-------------------|---------------------|
| **Hairline Edge** | `src/components/forms/FormBuilder.tsx#L711` | Accent ribbon is `h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60`, replacing thick bands | ✅ Verified |
| **Card Shadow** | `src/components/forms/FormBuilder.tsx#L709` | Container Card specifies `shadow-md rounded-2xl` elevation | ✅ Verified |
| **Config Dropdown** | `src/components/forms/FormBuilder.tsx#L726-L804` | `<SlidersHorizontal className="w-4 h-4 text-primary" />` with tooltip "Configuration & Tools" consolidates Health, Quiz Config, Triggers, JSON, Google Forms, Branching, Share | ✅ Verified |
| **Logo Asset** | `src/assets/onboarding-quiz-logo.svg` | Valid SVG geometry (32x32 viewbox, navy base, cream document card, checklist rules, emerald check circle) | ✅ Verified |
| **Sidebar Branding** | `src/components/admin/wp-admin-sidebar.tsx#L182-L209` | Displays `onboardingQuizLogo`, title "Onboarding Quiz", badge "v2.5", and subtitle "Admin Console" | ✅ Verified |
| **Sidebar Contrast** | `src/components/admin/wp-admin-sidebar.tsx#L250-L260` | Selected navigation row renders `bg-muted text-foreground` with left primary indicator; no yellow-on-yellow fills in Riseup theme | ✅ Verified |
| **Dock Tabs** | `src/components/forms/FormBuilder.tsx#L1096-L1150` | `TabsList` uses `grid-cols-4 h-10` with Tooltips on Fields, Outline, Audit, Config | ✅ Verified |
| **Category Pills** | `src/components/forms/field-palette.tsx#L254-L284` | Filter pills are in a single `flex-nowrap` row with tooltips; no horizontal rail blowout | ✅ Verified |
| **Type Selector** | `src/components/forms/sortable-field-card.tsx#L688` | `SelectTrigger` is constrained to `w-[9rem] sm:w-[11rem] [&>span]:truncate` | ✅ Verified |
| **Dirty Save State** | `src/components/forms/sortable-field-card.tsx#L603-L619` | Save button has `h-8 w-8`, highlights in emerald with white icon on dirty state, reverts on save | ✅ Verified |
| **Toolbar Heights** | `src/components/forms/sortable-field-card.tsx#L541-L820` | Drag handle, order index, save button, type selector, layout toggle, preview, actions all share unified `h-8` vertical baseline | ✅ Verified |

# FormBuilder & Runner Header Streamlining Specification

> **/goal** Eliminate header whitespace, compile navigation into a single horizontal line, migrate to icon-only action buttons, relocate access settings to inspector dock, and introduce hover-card health score badges.
> **/learn** Grounded directly on visual telemetry from `assets/screenshots/65-wpexam-header-layout-01.png` and `assets/screenshots/65-wpexam-header-layout-02.png`.

## 1. Verbatim User Request & Telemetry

User feedback captured from LightShot annotations:
- **Header Line Compaction**: "in the header section, I have mentioned several times. The header section, you have the URL that needs to be compiled to single line. If we come up here, it has a sequence and type, and there is a waste of space in the right-hand side which you are not using it. Okay?"
- **Relocate Access Settings**: "And why we have access setting in here, I really don't know. It should be in a config section or a config button. So it should not be available here actually, okay? Because that's a share button. It should be using icon."
- **Icon-Only Buttons**: "And also, I think in many places you could just combine buttons. For example, these two buttons I have highlighted, preview and save form. Just add icon, that's it. You don't have to add text. That would save space."
- **Public URL Indicator**: "Then the public section, the public only one section could actually have the token-based or public is only one, and that could actually go into the heading bar of the form builder..."
- **Health Score Hover Card**: "Health score: why we have health score like that? It could just show 100% or A+ and on hover it could show a hover card or popup with the details."

### Visual References
1. `assets/screenshots/65-wpexam-header-layout-01.png`: Multi-row runner top navigation bar suffering from excessive width wrapping and redundant whitespace.
2. `assets/screenshots/65-wpexam-header-layout-02.png`: FormBuilder annotated layout indicating:
   - Arrow moving Public URL chip into header row next to Studio badge.
   - Red box around Preview and Save Form buttons demanding icon-only treatment.
   - Red underline under Health Score demanding hover card with compact badge.
   - Red 'X' through `Access: Token / Invite Only` demanding its removal from the card body into Config.

---

## 2. Architectural Design & Geometry

### 2.1 FormBuilder Single-Line Top Bar (`src/components/forms/FormBuilder.tsx`)
- **Container**: `flex items-center justify-between gap-3 p-2.5 sm:px-4 bg-card rounded-xl border border-border/80 shadow-xs`.
- **Left Group (Unified Row)**:
  1. `Back Button`: `<Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border"><ArrowLeft className="w-5 h-5" /></Button>`
  2. `Title`: `<h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground whitespace-nowrap">Form & Assessment <span className="text-primary">Builder</span></h1>`
  3. `Studio Badge`: `<Badge variant="secondary" className="text-xs font-mono shrink-0 px-2 py-0.5 hidden sm:inline-flex">Studio</Badge>`
  4. `Slug Chip with Popover`: Inline font-mono chip `/f/{slug}` with 1-click copy icon button and edit popover.
  5. `Access/Public Chip`: Inline badge `<Globe className="w-3.5 h-3.5" /> Public` linking directly to candidate URL in new tab.
- **Right Group (Icon-Only & Compact Actions)**:
  1. `Health Score Badge with HoverCard`:
     - Compact trigger: `<Button variant="outline" size="sm" className="h-9 px-2.5 gap-1.5 font-bold rounded-xl"><Shield className="w-4 h-4 text-emerald-500" /><span className="font-mono text-xs">{score}%</span><Badge className="text-[11px] px-1.5 py-0 h-4">{grade}</Badge></Button>`
     - Rich HoverCard: Displays issues count, questions count, required fields, and points breakdown with an "Open Full Health Inspector" button.
  2. `AI Studio`: Dedicated triggering button.
  3. `Tools Dropdown`: Compact tools menu with Chevron.
  4. `Preview (Icon-Only)`: `<Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" title="Preview Form (opens in new tab)"><Eye className="w-4 h-4 text-primary" /></Button>`
  5. `Save (Icon-Only)`: `<Button size="icon" className="h-9 w-9 rounded-xl" title="Save Form"><Save className="w-4 h-4" /></Button>`

### 2.2 Relocation of Access Settings
- **Removal**: Delete the `Access: <Select>` dropdown from the form card body above questions (`src/components/forms/FormBuilder.tsx`).
- **Placement**: Managed exclusively inside the `Config` / `Settings` tab in the right inspector panel (`TabsContent value="settings"`).
- **Rationale**: Prevents question canvas clutter, enforces separation between question authoring and global security configurations.

### 2.3 FormRunner Single-Line Top Bar (`src/components/runner/FormRunner.tsx`)
- **Container**: `flex items-center justify-between gap-2 p-2 sm:px-3 bg-card border border-border rounded-xl shadow-xs overflow-x-auto`.
- **Left Group**:
  - `Project Selector`: Compact `h-8 text-xs min-w-[170px] max-w-[210px]`.
  - `Slug Chip`: Compact `/preview/{slug}` chip (`text-xs font-mono px-2 py-1`).
  - `Theme Selector`: Compact `h-8 text-xs w-[140px] sm:w-[160px]`.
- **Right Group**:
  - `Share Button`: Icon-only `<Button size="icon" variant="outline" className="h-8 w-8" title="Copy / Share Direct URL"><Share2 className="w-3.5 h-3.5 text-primary" /></Button>`.
  - `Auto Fill Button`: Compact pill `<Button size="sm" variant="outline" className="h-8 px-2.5 gap-1.5 text-xs font-semibold"><Zap className="w-3.5 h-3.5 text-amber-500" /><span className="hidden md:inline">Auto Fill</span></Button>`.
  - `Debug Button`: Compact pill `<Button size="sm" className="h-8 px-2 text-xs"><Bug className="w-3.5 h-3.5 text-amber-500" /></Button>`.
  - `Exit Button`: Compact pill `<Button size="sm" variant="outline" className="h-8 px-2.5 gap-1 text-xs"><ArrowLeft className="w-3.5 h-3.5" /><span>Exit</span></Button>`.

---

## 3. Conformance Checklist

- [ ] Header compiles to single horizontal flex row without vertical stacking.
- [ ] Preview and Save Form buttons use `size="icon"` with comprehensive tooltips.
- [ ] Health score uses compact badge trigger with rich `HoverCardContent`.
- [ ] Form card body has `Access:` select completely removed.
- [ ] Inspector dock Settings tab governs Form Access Policy.
- [ ] Runner top bar compiles into a single responsive horizontal line.
- [ ] Zero explicit boolean checks (`== true` banned).
- [ ] Strict relative Git paths only (zero absolute paths).

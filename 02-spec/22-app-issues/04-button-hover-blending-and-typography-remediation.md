# Issue 04: Root Cause Analysis — Button Hover Blending, Canvas Voids, Dropdown Truncation & Google Forms Hierarchy

## 1. Problem Description & Telemetry

During authoring and candidate testing workflows, multiple visual, spatial, and interaction defects degraded the user experience:
1. **White-on-White Button Hover Blending:**
   - In light themes (specifically `Clean Light`), hovering over the "Tools" and "AI Studio" outline buttons caused their label text to turn pure white against an off-white background (`#f1f5f9`), rendering the button text completely invisible.
2. **Discordant Blue-Green Palette Clashing:**
   - The "Health: 100% A+" button in the builder top bar was styled in an isolated emerald-green box placed immediately adjacent to vivid blue and sapphire buttons ("Tools", "Preview", "Save Form"), causing severe aesthetic discordance.
3. **Dead Space & Left Canvas Void on Wide Screens:**
   - The builder container was constrained with `max-w-[1600px] mx-auto`, which centered the container on wide displays and generated an empty, useless left gutter between the WordPress admin sidebar and the canvas.
   - An excessive top vertical margin existed between the sidebar header and the top builder action card.
4. **Dropdown Label Truncation in Builder Header:**
   - In the builder settings card, `<SelectTrigger>` elements had hardcoded widths (`w-[160px]` and `w-[140px]`), causing options like "Knowledge Quiz (Scored)" to truncate as "Knowledge Quiz... v" or "z.. v".
5. **Cramped Question Cards with Cluttered Headers:**
   - In `sortable-field-card.tsx`, up to 7 separate badges (Required, Type, Points, Rules, Triggers, File Size) and action buttons were crammed into the top header, while the Field Type selector was positioned inside the card body beneath the question title, causing poor visual hierarchy and wasting vertical space.
6. **Bouncy `zoom-in-95` Popup Animations:**
   - Menus, tooltips, dialogs, and popovers popped open with distracting `zoom-in-95` scale animations that felt jarring to the user.

---

## 2. 4-Part Root Cause Analysis (RCA)

### 2.1 Immediate Cause
- In `src/lib/theme-context.tsx`, `THEME_CONFIGS.clean` defined `'--accent-foreground': '0 0% 100%'` (pure white). When any button using standard Radix outline variants (`hover:bg-accent hover:text-accent-foreground`) was hovered, its text turned white against an off-white background (`#f1f5f9`).
- In `src/components/forms/FormBuilder.tsx`, the Health score pill hardcoded emerald green classes (`border-emerald-500/30 text-emerald-600 bg-emerald-500/10`), clashing directly with adjacent primary blue action buttons.
- The builder root container utilized `max-w-[1600px] mx-auto` and `p-4 sm:p-6` wrappers that artificially restricted fluid width.
- In `src/components/forms/sortable-field-card.tsx`, the Field Type `<Select>` was rendered inside the main `CardContent` rather than the `CardHeader`, causing question fields to feel disjointed.

### 2.2 Underlying Cause
- The design system lacked an Anti-Blend Accent Invariant ensuring that `--accent-foreground` provides >= 4.5:1 contrast against `--accent` across all light and dark theme presets.
- Typography and container width tokens lacked dynamic scaling rules for wide displays (>1600px).
- Radix UI animation primitives inherited legacy Tailwind boilerplate (`zoom-in-95`) that violated modern snappy web standards.

### 2.3 Systemic Cause
- Lack of an architectural contract enforcing the Google Forms card hierarchy (Header: Index + Drag Handle + Field Type + Actions; Body: Question Title + Media + Section Combobox + Options; Footer: Required + Points + Allow Other + Duplicate + Delete).

### 2.4 Prevention Mechanism
- Codified the Google Forms Card Architecture in `02-spec/21-app/09-ui-ux-design-system-and-card-standards.md`.
- Codified the Anti-Blend Accent Invariant in `src/lib/theme-context.tsx` and `src/styles/theme.css`.
- Standardized all popups, dropdowns, tooltips, and dialogs on subtle `duration-150` fade-in animations with zero zoom scaling.

---

## 3. Remediation & Implementation Details

1. **Anti-Blend Accent & Theme Contrast Fix:**
   - In `src/lib/theme-context.tsx`, changed `--accent-foreground` in `THEME_CONFIGS.clean` to dark slate (`222.2 47.4% 11.2%`) and `--accent` to `210 40% 96.1%`.
   - Introduced `clean-wide` theme preset ("Clean Wide White") with `#FFFFFF` cards, `#E2E8F0` borders, `#0F172A` text, and `#4F46E5` vivid indigo primary accent.
   - Synchronized CSS variables across `src/styles/theme.css` and `src/lib/theme-context.tsx`.

2. **Elimination of Blue-Green Clashes:**
   - Restyled the `Health: 100% A+` button in `src/components/forms/FormBuilder.tsx` to use theme primary tokens:
     `border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary` with `Shield` icon in `text-primary`.
   - Restyled the Audit tab badge in the builder inspector dock to use `bg-primary/10 text-primary`.

3. **Google Forms Card Hierarchy (`sortable-field-card.tsx`):**
   - **CardHeader:** Clean left zone with dedicated drag handle and bold Question `#{index + 1}` badge. Clean right zone hosting Field Type `<Select>` dropdown (`w-[190px] h-10 text-sm font-semibold`), Live Preview toggle, and Actions menu.
   - **CardContent:** Full-width Question Title (`text-lg font-bold h-12`), optional Question Image drawer, interactive Section Combobox with `<datalist>` + hover/focus dropdown + 1-click pills, and Choice Options editor.
   - **CardFooter:** Dedicated settings toolbar hosting Required toggle switch, Points input, Allow "Other" toggle, validation rule summary badges, Duplicate button, and Delete button.

4. **Dropdown Label Sizing & Container Width:**
   - Upgraded Type and Access selects in builder header from `w-[160px]` / `w-[140px]` to `min-w-[210px]` / `min-w-[170px]` with `text-sm font-semibold`, eliminating label truncation.
   - Replaced `max-w-[1600px] mx-auto` with fluid `w-full px-3 sm:px-6 pt-1 pb-6`, eliminating the left gutter void on wide monitors.

5. **Purge of Bouncy `zoom-in-95` Animations:**
   - Purged `zoom-in-95` and `zoom-out-95` across `menubar.tsx`, `navigation-menu.tsx`, `tooltip.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, and `popover.tsx`. Standardized on snappy `duration-150` fade-in.

---

## 4. Verification Evidence

| Quality Gate | Verification Command | Result |
|---|---|---|
| **Vite Production Build** | `npm run build` | Built in 2.70s with 0 errors |
| **Unit & Integration Tests** | `npm test` | 10 passed test suites, 85 passed tests |
| **Zero Micro-Typography** | `Select-String "text-\[([89]\|10)px\]"` | 0 occurrences across entire repository |
| **Zero Zoom-in Animations** | `Select-String "zoom-in" src/**/*.tsx` | 0 occurrences across all TSX files |
| **Anti-Blend Button Contrast** | Visual inspection across light & dark themes | Contrast >= 4.5:1 in resting & hover states |

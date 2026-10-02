# 74 Builder chrome architecture

Slug: onboarding-quiz-presentation-ui
Parent plan: [.ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md](.ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md)
Implementation boundary: [.ai-memory/plans/subtasks/74-onboarding-quiz-presentation-ui/01-builder-chrome.md](.ai-memory/plans/subtasks/74-onboarding-quiz-presentation-ui/01-builder-chrome.md)

This document specifies the console builder chrome a reviewer can check in the browser. It does not specify the full-canvas presentation runner, a new theme token file, or any code under `02-spec/19-main-worker-service`.

## Evidence

| Screenshot | What it shows |
|---|---|
| [assets/screenshots/74-builder-green-overflow.png](assets/screenshots/74-builder-green-overflow.png) | Thick green title stripe and a title row crowded by Health, Quiz Config, Triggers, Tools, and Share |
| [assets/screenshots/74-health-toolbar-overflow.png](assets/screenshots/74-health-toolbar-overflow.png) | The same utility cluster covering the form title |
| [assets/screenshots/74-sidebar-yellow-on-yellow.png](assets/screenshots/74-sidebar-yellow-on-yellow.png) | Selected nav item drawn as yellow text on a yellow wash under the Riseup theme |
| [assets/screenshots/74-builder-riseup-yellow.png](assets/screenshots/74-builder-riseup-yellow.png) | Gold used as a fill across the builder, including the selected rail and controls |

## Current code (do not invent extra surfaces)

### Title accent and utility cluster

`src/components/forms/FormBuilder.tsx` draws the title-card stripe as:

`h-2.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60`

Under Green Choice, `.theme-green-choice` in `src/styles/theme.css` sets `--primary` to `142 71% 45%` (`#16A34A`). The Health control is not that token. It is a hardcoded emerald pill (`bg-emerald-500/10`, `text-emerald-600`, `dark:text-emerald-400`, `border-emerald-500/20`) in the same file.

That pill and the buttons beside it sit in one inline cluster on the title card:

| Control | Handler |
|---|---|
| Health | `setInspectorTab('audit')` and `setIsDesignPanelOpen(true)` |
| Quiz Config | `setIsCentralConfigOpen(true)` |
| Triggers | `setIsNotificationModalOpen(true)` |
| Tools | existing `DropdownMenu` items |
| Share | `handleCopyLiveUrl` |

The Tools menu items today are Centralized Quiz Config (`setIsCentralConfigOpen(true)`), JSON Import / Export (`setIsJsonModalOpen(true)`), Import Google Forms (`setIsGoogleModalOpen(true)`), Visual Branching Flow (`setIsFlowModalOpen(true)`), and Form Health & Audit Dock (`setInspectorTab('audit')` and `setIsDesignPanelOpen(true)`).

Preview (`window.open` of the preview route) and Save (`handleSave`) already sit in a separate segmented control above that cluster. They stay there.

The trash ledger is a separate `Popover` and only renders when `trashFields.length > 0`. It is not one of the five controls that collapse.

### Right rail

The dock is `FormBuilder` `Tabs` bound to `inspectorTab`. Trigger values stay `palette`, `outline`, `audit`, and `settings`. Visible labels are Fields, Outline, Audit, and Config. `TabsTrigger` in `src/components/ui/tabs.tsx` includes `whitespace-nowrap`, so the label plus the Outline count badge and the Audit grade badge clip the rail. Do not edit `tabs.tsx`. Override the trigger from `FormBuilder` class names.

Category filters live in `src/components/forms/field-palette.tsx`. The ids and labels are `all` / All, `choice` / Choice, `text` / Text, `media` / Media, and `layout` / Page Elements. The text row is what spills out of the rail.

### Question card header

`src/components/forms/sortable-field-card.tsx` `CardHeader` holds Save (`handleSaveQuestion`), the field-type `Select` (trigger width `w-[155px] sm:w-[175px]`), Preview (`setShowLivePreview`), and Actions (the existing `DropdownMenu`). Quiz / Slide and Answers Left / Right sit in that same header and add to the overflow. Edit only this header/toolbar region, plus the card root class if that is what carries the section shadow. Do not edit the Actions menu body.

### Wordmark

`src/components/admin/wp-admin-sidebar.tsx` uses a tile whose text is `WP`, then the words `WP Exam` and `Admin Console`. The brand group title is `WP Exam Console`.

`src/pages/Index.tsx` authenticated header uses a tile whose text is `W` and the words `WP Exam Console`. Change only that wordmark. Leave the login screen, `ThemeSwitcher`, and the rest of the page alone.

### Selected navigation

Active items in `wp-admin-sidebar.tsx` use `bg-primary/15 text-primary`. A `w-1` `bg-primary` bar is already drawn on the left edge.

On the Riseup theme, `.theme-riseup-asia` sets `--primary` to `41 100% 50%` (`#FFAD01`). `--primary-foreground` and `--background` are both `240 33% 6%`. Yellow text on a yellow wash is the selected-row defect. Gold stays a highlighter, not the fill of the selected row.

The visible theme registry name is still the two-word string `Rise Up Asia` on `riseup.name` in `src/lib/theme-context.tsx`. `ThemeSwitcher` prints `config.name` in the header. That file is not owned by the builder-chrome subtask.

## Requirements

### 1. Thin title accent and light shadow

Replace the `h-2.5` stripe with a top edge about 2px tall (`h-0.5`). Keep it on the top of the title card. Keep the Green Choice tint by continuing to use `from-primary via-primary/80 to-primary/60`, so the edge is `#16A34A` under Green Choice and gold only as that thin edge under Riseup.

Put a light shadow on the title card (stronger than the current `shadow-sm`, still a soft card shadow such as `shadow-md`) and the same light shadow on each question section card. Do not paint a thick green or gold band on the bottom.

### 2. One Config menu

Remove the inline Health, Quiz Config, Triggers, Tools, and Share controls from the title row.

Replace them with one `DropdownMenu` from `src/components/ui/dropdown-menu.tsx`. Do not edit that component. The trigger is an icon button. Its tooltip text is `Config`. The trigger must not print Health, Quiz Config, Triggers, Tools, or Share, so the form title input stays visible on the title row.

Menu items, in this order, keep the current handlers:

1. Health opens the audit dock: `setInspectorTab('audit')` and `setIsDesignPanelOpen(true)`. The item may show the current grade and score as short item text. The emerald pill leaves the title row. Do not recolor the pill by editing `theme.css`.
2. Quiz Config opens the central studio: `setIsCentralConfigOpen(true)`.
3. Triggers opens the notification studio: `setIsNotificationModalOpen(true)`. When `settings.notificationTriggers.length > 0`, keep the count badge on this item.
4. The Tools entries that are not already items 1 and 2: JSON Import / Export (`setIsJsonModalOpen(true)`), Import Google Forms (`setIsGoogleModalOpen(true)`), Visual Branching Flow (`setIsFlowModalOpen(true)`).
5. Share copies the live URL: `handleCopyLiveUrl`.

Do not duplicate Quiz Config or Health inside the Tools group. Do not edit the modal bodies those handlers open.

Preview and Save stay icon buttons with tooltips. Keep their current click handlers, the saving spinner, and the disabled state while `isSaving` is set. Remove the visible words Preview and Save from those buttons.

Leave the trash `Popover` out of the Config menu. When the ledger is non-empty, its trigger is an icon button with a tooltip so it does not cover the title.

### 3. Onboarding Quiz mark

The product name shown in the console wordmark is `Onboarding Quiz`.

Add one lowercase SVG mark at `src/assets/onboarding-quiz-mark.svg` (or the same filename under `public/` if the app already serves static files from there). The mark is a simple logo, not a letter tile reading `WP` or `W`.

Use that file in `wp-admin-sidebar.tsx` and in the `Index.tsx` header wordmark. Tooltip on the mark is `Onboarding Quiz`. The sidebar may keep a short secondary line, and it must not be a theme name. Do not write a long theme name in the header. The version badge may stay.

When the sidebar is collapsed, the mark remains and keeps the tooltip. The words `Onboarding Quiz` hide with the existing collapse flag.

### 4. Right rail does not overflow

Fields, Outline, Audit, and Config are icon-first tabs. Each trigger shows its existing icon (`Layers`, `ListOrdered`, `ShieldCheck`, `Settings`) and a tooltip with the name. Put the outline count and the audit grade in the tooltip (`Outline (N)`, `Audit (grade)`), not in a badge that widens the trigger.

Because `TabsTrigger` is `whitespace-nowrap`, the `FormBuilder` trigger class must not add a text label, and it must pass classes `tailwind-merge` can apply (`min-w-0`, tighter horizontal padding) so four triggers fit inside `lg:col-span-4`. Tab values stay `palette`, `outline`, `audit`, and `settings`.

In `field-palette.tsx`, All, Choice, Text, Media, and Page Elements are icon-first. Each control keeps its category id and the same filter behavior. The visible name moves to the tooltip, including the count. The five controls stay on one row inside the rail. Do not drop Page Elements and do not rename the categories.

### 5. Question card header

In the `CardHeader` toolbar of `sortable-field-card.tsx`:

- Save, Preview, and Actions are icon buttons with tooltips `Save`, `Preview`, and `Actions`. Dirty and saved Save states stay visually distinct. Preview still toggles `showLivePreview`. Actions still opens the existing menu. Do not edit the menu items.
- Quiz / Slide and Answers Left / Right in that header become icon buttons that keep their current `title` tooltips and `onUpdate` calls, so their words do not widen the row.
- The type `SelectTrigger` uses `min-w-0`, a max width, and truncated text. A long type name such as `List of Items / Links` stays inside the card padding and does not paint past the card edge.

### 6. Selected sidebar item

The selected item uses a contrasting surface and readable text. Use `bg-muted` or the existing navy surface token (`bg-secondary` / the Riseup card navy) with `text-foreground`. The active icon uses `text-foreground`.

Gold is only the existing thin left indicator (`w-1`, `bg-primary`). On Riseup that indicator is `#FFAD01`. The row must not use `bg-primary/15` or `text-primary`. Do not set the row background to `--primary`, because `--primary-foreground` matches `--background` (`240 33% 6%`) and the label would disappear into the gold fill.

Unselected items keep `text-muted-foreground` and `hover:bg-muted/80`.

### 7. Riseup spelling

The brand spelling is `Riseup` (one word) wherever a visible theme name is shown in the console. `Rise Up` is a mistake.

This subtask does not edit `src/styles/theme.css`, `src/lib/theme-context.tsx`, `src/lib/themes.ts`, `src/themes/theme-definitions.ts`, or `FormRunner`. It must not introduce the two-word form in any owned file, and the wordmark must not print a theme name. The registry string `Rise Up Asia` stays where it is until a later subtask owns those files. Do not implement anything under `02-spec/19-main-worker-service`.

## Out of scope

- `src/styles/theme.css` and any new VS Code navy theme tokens
- `FormRunner` and the full-canvas presentation preview
- Modal bodies for quiz config, triggers, JSON, Google Forms import, and branching
- `src/components/ui/dropdown-menu.tsx` and `src/components/ui/tabs.tsx`
- `ThemeSwitcher` and the theme name registry
- The unauthenticated login block in `src/pages/Index.tsx`
- Question card body, options, and the Actions menu contents

## Browser acceptance

Review on the quiz builder at a desktop width where the right rail is `lg:col-span-4`, once under Green Choice and once under Riseup.

1. The title card accent is a top edge about 2px tall. It is not the old `h-2.5` band. Under Green Choice the edge reads as `#16A34A`. The title card and each question section show a light shadow.
2. The title row shows the form title, one icon button whose tooltip is `Config`, and icon buttons whose tooltips are Preview and Save. Health, Quiz Config, Triggers, Tools, and Share are not separate buttons on that row. Opening Config runs the five handlers above: audit dock, central quiz config, notification triggers, JSON import/export, Google Forms import, visual branching, and copy live URL. Modal contents are unchanged.
3. The sidebar and the top bar show the SVG mark and the words `Onboarding Quiz`. The mark has a tooltip `Onboarding Quiz`. The letters `WP` and `W` are gone from those two wordmarks. The header wordmark does not include a long theme name.
4. Fields, Outline, Audit, and Config fit inside the right rail as icons with tooltips. They do not clip. All, Choice, Text, Media, and Page Elements fit inside the rail as icons with tooltips, and each filter still limits the palette.
5. On a question card, Save, Preview, and Actions are icon buttons with those tooltips. The type select stays inside the card.
6. Under Riseup, the selected sidebar item is navy or muted with readable text. Gold appears only as the thin left indicator. The row is not yellow text on a yellow wash.
7. Owned chrome does not display the words `Rise Up`. The wordmark reads `Onboarding Quiz`.

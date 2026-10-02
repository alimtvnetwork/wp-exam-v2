# Subtask 01: Builder chrome

Traceability: Task-03, Task-04, Task-05, Task-06, Task-08, and the selected-nav contrast from the parent yellow-restraint note.
Spec: [02-spec/21-app/74-onboarding-quiz-presentation-ui/01-architecture-spec.md](../../../02-spec/21-app/74-onboarding-quiz-presentation-ui/01-architecture-spec.md)
Parent plan: [.ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md](../../pending/74-onboarding-quiz-presentation-ui.md)

## Owned files

Edit only these:

- `src/components/forms/FormBuilder.tsx`
- `src/components/forms/sortable-field-card.tsx` (header/toolbar region, plus the card root class that carries the section shadow)
- `src/components/forms/field-palette.tsx`
- `src/components/admin/wp-admin-sidebar.tsx`
- `src/pages/Index.tsx` (authenticated header wordmark only)
- a new lowercase SVG: `src/assets/onboarding-quiz-mark.svg` (or `public/onboarding-quiz-mark.svg` if that is how this app serves a static mark)

Do not assign `src/styles/theme.css` or `FormRunner` to this subtask. Do not edit `src/components/ui/dropdown-menu.tsx`, `src/components/ui/tabs.tsx`, `src/lib/theme-context.tsx`, modal bodies, or anything under `02-spec/19-main-worker-service`.

## Action

Follow the architecture spec. In short:

1. In `FormBuilder.tsx`, replace the title-card `h-2.5` gradient stripe with an approximately 2px top edge (`h-0.5`) that still uses `from-primary via-primary/80 to-primary/60`. Add a light shadow on that title card.
2. Collapse Health, Quiz Config, Triggers, Tools, and Share into one `DropdownMenu`. The trigger is an icon with tooltip `Config`. Menu items call `setInspectorTab('audit')` plus `setIsDesignPanelOpen(true)`, `setIsCentralConfigOpen(true)`, `setIsNotificationModalOpen(true)`, the existing Tools handlers `setIsJsonModalOpen(true)`, `setIsGoogleModalOpen(true)`, and `setIsFlowModalOpen(true)`, and `handleCopyLiveUrl`. Do not duplicate Health or Quiz Config. Preview and Save stay icon buttons with tooltips and their current handlers. The trash popover stays out of the menu and becomes an icon with a tooltip when it is visible.
3. Draw the Onboarding Quiz SVG and use it in the sidebar and the `Index.tsx` header wordmark in place of the `WP` and `W` tiles. Visible name: `Onboarding Quiz`. Tooltip on the mark: `Onboarding Quiz`. Do not write a long theme name in the header wordmark.
4. Make the inspector tabs icon-first (Fields, Outline, Audit, Config) without editing `tabs.tsx`. Keep values `palette`, `outline`, `audit`, and `settings`. Move the outline count and audit grade into the tooltips. Make All, Choice, Text, Media, and Page Elements icon-first in `field-palette.tsx` so they stay inside the rail. Keep the category ids.
5. In the question card header, make Save, Preview, and Actions icon buttons with those tooltips. Keep `handleSaveQuestion`, `setShowLivePreview`, and the existing Actions menu. Do not edit the menu body. Make Quiz / Slide and Answers Left / Right in that header icon buttons with their current tooltips. Constrain the type `Select` so it truncates inside the card. Add the light section shadow on the card root.
6. In `wp-admin-sidebar.tsx`, stop using `bg-primary/15 text-primary` for the selected item. Use a muted or navy surface with `text-foreground`. Leave gold only on the existing thin left indicator.

Do not type the visible string `Rise Up` in any owned file. The registry name in `theme-context.tsx` is out of scope.

## Acceptance

A reviewer checks the quiz builder in the browser, under Green Choice and under Riseup, at a width where the right rail is the four-column dock:

- Title accent is about 2px on the top edge, and the title card plus question sections have a light shadow.
- The title is visible. One Config icon opens the combined menu and each item still runs the handler listed above. Preview and Save are icon buttons with tooltips.
- Sidebar and top bar show the new mark and `Onboarding Quiz`, with a tooltip on the mark.
- Rail tabs and the All / Choice / Text / Media / Page Elements filters stay inside the rail and still switch tabs and filters.
- Question-card Save, Preview, and Actions are icon buttons with tooltips, and the type select does not leave the card.
- The selected sidebar row is not yellow text on a yellow wash. Gold is only the thin indicator.
- Owned chrome does not show `Rise Up`.

## Out of scope

`theme.css`, `FormRunner`, presentation preview, theme registry spelling, `ThemeSwitcher`, login screen copy, dropdown-menu and tabs primitives, and modal bodies.

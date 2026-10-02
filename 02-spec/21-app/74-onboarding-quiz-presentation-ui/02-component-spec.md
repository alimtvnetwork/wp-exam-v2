# 74 — Preview presentation, contrast, and themes

Parent plan: [.ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md](.ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md)

Evidence: [assets/screenshots/74-preview-purple-contrast.png](assets/screenshots/74-preview-purple-contrast.png), [assets/screenshots/74-preview-riseup-theme.png](assets/screenshots/74-preview-riseup-theme.png)

This spec covers Task-07: the full-canvas presentation preview, purple contrast, gold used only as a highlighter, the Riseup brand string, and the `vscode-navy-gold` preset.

## 1. Route and ownership

`/preview/:slug` in `src/App.tsx` already renders `FormRunner` with `isPreviewRoute`. The builder opens that route with `window.open('/preview/' + slug)`. The page is already the viewport. The defect is the inner chrome: a crowded bar, violet chips on a violet page, and gold used as fill.

All presentation JSX stays in `src/components/runner/FormRunner.tsx`. Layout resolution stays in `src/lib/presentation-layout.ts` (`resolveQuestionLayoutMode`, `resolveAnswerPlacement`). Do not move that math.

Branching stays in `src/lib/branching-engine.ts`. `getNextStepIndex` already resolves, in order:

1. `field.optionBranching[String(answer)]`
2. `conditions` whose `action` is `jump_to`
3. `field.branchTarget`

Video already exists: `FormField.videoUrl` and `RunnerVideoPlayer` in `FormRunner.tsx`. This spec does not add a second branching engine and does not add a field type.

`FormRunner` theme state defaults to `'purple'` when no `?theme=` query and no saved `wpexam_active_theme` match a preset. Keep that default.

### Owned files

- `src/components/runner/FormRunner.tsx`
- `src/lib/themes.ts`
- `src/lib/theme-context.tsx`
- `src/styles/theme.css`
- `src/styles/theme.less`
- `src/components/forms/wizard-runner.tsx` (visible theme name string only)
- `src/components/admin/focus-quiz-editor.tsx` (visible theme name string only)
- `src/components/admin/backup-manager.tsx` (visible Riseup spelling only)

### Out of scope

- `src/components/forms/FormBuilder.tsx`
- `src/components/admin/wp-admin-sidebar.tsx`
- `src/lib/branching-engine.ts`
- `src/lib/presentation-layout.ts`
- `src/lib/types/form.ts`
- `src/themes/theme-definitions.ts`
- `02-spec/19-main-worker-service`
- Builder green bar, health/tools dropdown, and the Onboarding Quiz logo (other tasks in the parent plan)

The runner dropdown reads `THEME_PRESETS` and shows `t.name.split(' (')[0]`. The builder header reads `THEME_CONFIGS` from `src/lib/theme-context.tsx`. Changing those name strings updates both surfaces. Do not open `FormBuilder.tsx` to do it.

## 2. Preview bar

The candidate/preview bar is one compact row: form title, then icon buttons. The title stays `activeForm.title`.

| Control | Behavior |
|---|---|
| Live Preview badge | Absent when `isPreviewRoute` is set. The badge at the title (`border-primary/40 text-primary bg-primary/10`, text `Live Preview`) is removed on this route. |
| Copy link | Icon button. Tooltip `Copy link`. Same `handleCopyProjectLink`. |
| View | One icon button. Tooltip `View`. Menu items: Quiz format, Presentation slide, Questions. |
| Theme | Palette icon button. Tooltip is the active short name (`name.split(' (')[0]`). Menu lists presets. The bar does not render `Theme:` or the theme name as a label. |

Quiz format sets `runnerViewMode` to `'standard'`. Presentation slide sets `runnerViewMode` to `'presentation_split'`. Questions toggles `isSidebarVisible`. Those three controls leave the segmented pill that currently sits beside the title (`Quiz Format`, `Presentation Slide`, `Questions`).

The selected menu row uses `bg-accent text-foreground`. It does not use `bg-primary` when that token is gold or violet-on-violet.

When `effectiveLayoutMode` is `presentation_split`, the question-sequence aside starts collapsed so the slide uses the width. The Questions item opens it again.

Dev Auto / Debug / Exit stay behind the existing `isDevActionPillVisible` gate.

## 3. Presentation slide

`resolveQuestionLayoutMode` still decides `standard` versus `presentation_split`. In `presentation_split` the slide fills the viewport under the bar (`min-h` about `100dvh` minus the bar).

Desktop (`lg` and up):

- Left: question `label` at `text-4xl` / `lg:text-5xl`, foreground color, tight leading.
- Under it, one short subtitle: `currentField.subtitle` when that string is non-empty; otherwise `currentField.description` clamped to two lines. Do not stack kicker, group, description, references, and checklist into a second essay column on this slide.
- Right: the existing answer control from `renderFieldInput`. `resolveAnswerPlacement` still swaps columns when placement is `left`.

Below `lg`, the same blocks stack: question, then options.

Choice rows in this mode use a CSS transition of about 180ms on `transform` and `opacity`. Hover translates the row about `8px` on the x-axis and raises opacity to `1`. Resting opacity is about `0.92`. No animation library.

Optional hint: when `currentField.placeholder` is a non-empty string, show it once under the subtitle in `text-muted-foreground`. Omit it when empty. `subtitle` and `placeholder` already exist on `FormField`. Do not add a property in `src/lib/types/form.ts`.

The eyebrow and question kicker stop using `border-primary/40 text-primary bg-primary/10`. They use `text-foreground` on `bg-card` with `border-border`.

The non-urgent timer uses `text-foreground` and `border-border`. Under 60 seconds it stays the destructive treatment.

### Video, then two choices

When `currentField.videoUrl` is set, `RunnerVideoPlayer` is the first block of the slide, full width, above the question and the options. The question under the video stays the short `label`. Options stay in the right column (stacked under the question on small screens).

A branching slide is ordinary field data:

- `videoUrl` optional
- short `label`
- `options` of two strings (more options still render; this layout is not limited to two)
- `optionBranching` keyed by the option string

Choosing an option writes the answer through the existing answer handler and then advances with `getNextStepIndex(fields, currentStep, answers)`. The `answers` object passed into that call includes the option chosen in the same turn. Do not copy the branch rules into `FormRunner.tsx`.

## 4. Purple contrast

Active purple tokens today: background `#0F0E1E`, primary `#5C45FD` (`src/lib/themes.ts`, `src/styles/theme.css`). The screenshot chips use primary-colored text on a primary wash, so the kicker and the Live Preview badge disappear into the page.

On the purple theme:

- Body text and the question headline are `#FFFFFF` / `text-foreground` on `#0F0E1E`.
- Chips and kickers are foreground on `bg-card`, or solid primary with `text-primary-foreground` (white on `#5C45FD`).
- The current sequence row, when the aside is open, is a lifted card surface with foreground text, or solid primary with white text. It is not violet text on a violet wash.

## 5. Gold is one highlighter

`riseup-asia` is navy `#0A0A14` with gold `#FFAD01` on primary, progress, active border, highlight, and badge. The preview then paints the mode button, the sequence row (`bg-primary`), the progress, the kicker, and the timer in gold together.

Split the tokens in `src/lib/themes.ts`, `THEME_CONFIGS.riseup` in `src/lib/theme-context.tsx`, `.theme-riseup-asia` / `[data-theme="riseup-asia"]` / `[data-theme="riseup"]` in `src/styles/theme.css`, and the matching block in `src/styles/theme.less`:

| Token | Value | Role |
|---|---|---|
| Background | `#0A0A14` | Unchanged navy |
| Card / border | `#141424` / `#2A2A44` | Unchanged neutral chrome |
| Foreground | `#FFF1D6` | Question and body text |
| `--primary` | `40 43% 92%` (`#F7F1E6`) | Buttons and selected controls. Cream on navy. |
| `--primary-foreground` | `240 33% 6%` | Text on those cream controls |
| `--wp-exam-highlight` / `highlightWord` | `#E8C547` (`47 78% 59%`) | The single highlighter. Lighter than `#FFAD01`. |
| Progress | `#3A3A55` | Muted. Not gold. |

Gold `#E8C547` appears on one focus mark: the hovered or focused choice row (a 2px start border or equivalent mark using the highlight token). Sequence selection, mode menu, progress, timer, kicker, and card borders use the cream/navy tokens above. A selected row is never gold text on a gold fill.

`vscode-dark` stays `#0D1117` with cyan `#38BDF8`. Do not repaint it gold.

## 6. Preset `vscode-navy-gold`

Add a new preset. Do not alias it to `vscode-dark`.

| Field | Value |
|---|---|
| id | `vscode-navy-gold` |
| name | `Navy Gold` |
| appearance | `dark` |
| background | `#0D1117` |
| card | `#161B22` |
| border | `#30363D` |
| foreground | `#F0F6FC` |
| muted text | `#8B949E` |
| primary | `#F0F6FC` with primary text `#0D1117` |
| highlight | `#E8C547` only, same single-mark rule as section 5 |
| cyan `#38BDF8` | Not used |

Short name `Navy Gold` is the tooltip and the menu item. A longer description may live on the preset object. It must not render in the preview bar.

Wire the same id in:

- `THEME_PRESETS` in `src/lib/themes.ts`
- `AppThemeType`, `THEME_CONFIGS`, `ORDERED_THEME_KEYS`, and the theme class list in `src/lib/theme-context.tsx`
- `.theme-vscode-navy-gold` and `[data-theme="vscode-navy-gold"]` in `src/styles/theme.css` and `src/styles/theme.less`

Applying this theme adds `theme-vscode-navy-gold` only. It does not also add `theme-vscode-dark`.

`FormRunner` already accepts a preset id from `?theme=` when `THEME_PRESETS[id]` exists. After the preset is added, `?theme=vscode-navy-gold` selects it. `data-theme` on the document element is `vscode-navy-gold`.

## 7. Visible brand string

The brand string is `Riseup`, one word. The runner menu shows the substring before ` (`.

| File | Change |
|---|---|
| `src/lib/themes.ts` | `riseup-asia` `name` becomes `Riseup (Bright Gold & Navy)`. Description uses `Riseup`. |
| `src/lib/theme-context.tsx` | `THEME_CONFIGS.riseup.name` becomes `Riseup`. |
| `src/components/forms/wizard-runner.tsx` | `THEME_OPTIONS` entry whose id is `riseup`: visible name becomes `Riseup (Warm Gold & Navy)`. |
| `src/components/admin/focus-quiz-editor.tsx` | The `riseup-asia` `SelectItem` label becomes `Riseup (Gold & Modern Dark)`. |
| `src/components/admin/backup-manager.tsx` | Rendered heading becomes `Remote WordPress Server Uploader & Deployer (Riseup Protocol)`. Deploy log line becomes `Endpoint reachable (Riseup Uploader protocol v2.5 verified)`. No other edits in that file. |

## 8. Browser acceptance

Check on `/preview/sample-sequential-knowledge-quiz` at desktop width (about 1280px) and a narrow width (about 390px). Default theme is purple unless the URL sets `?theme=`.

1. The bar shows the quiz title. The string `Live Preview` is absent. The strings `Theme:`, `Quiz Format`, and `Presentation Slide` are absent until the View menu is open.
2. The theme control is a palette icon. Hover shows a short tooltip (`Purple Theme` on the default theme). The open menu lists preset short names, including `Riseup` and `Navy Gold`. The closed bar does not show those names.
3. The View menu contains Quiz format, Presentation slide, and Questions. Choosing Presentation slide shows the large question on the left and the options on the right. Choosing Quiz format returns to the stacked card. On a 390px width the presentation blocks stack, question then options, without horizontal overflow of the bar.
4. Hovering a choice row runs a CSS transform and opacity transition of about 180ms (computed `transition-duration` near `0.18s`) and the row shifts on the x-axis. A non-empty `placeholder` renders as hint text under the subtitle; an empty one does not.
5. On purple, the question headline is white on `#0F0E1E`. Kickers are white or foreground on a card surface, or white text on solid `#5C45FD`. They are not violet text on a violet wash. DevTools contrast of headline against the page background is at least 4.5:1.
6. On `riseup-asia`, the tooltip and menu say `Riseup`. The page background is `#0A0A14`. The selected sequence row (Questions opened) is cream or a lifted navy with cream text. Gold `#E8C547` or `#FFAD01` is limited to the hovered choice mark. Progress, timer, kicker, and the View selection are not gold fills.
7. Choosing `Navy Gold` sets `data-theme` to `vscode-navy-gold` and the page background to `#0D1117`. The primary control color is `#F0F6FC`, not cyan `#38BDF8`. Gold appears only on the choice hover mark. `vscode-dark` still uses cyan when selected on its own.
8. On a field that has `videoUrl`, the player is above the question. Choosing an option and advancing lands on the field id stored in `optionBranching` for that option, via `getNextStepIndex`. A field with no `optionBranching` still advances to the next visible step.

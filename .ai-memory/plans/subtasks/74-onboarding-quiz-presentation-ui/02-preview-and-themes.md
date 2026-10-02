# Subtask 02: Preview presentation, contrast, and themes

Traceability: Task-07 in [.ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md](../../pending/74-onboarding-quiz-presentation-ui.md)

Spec: [02-spec/21-app/74-onboarding-quiz-presentation-ui/02-component-spec.md](../../../02-spec/21-app/74-onboarding-quiz-presentation-ui/02-component-spec.md)

Screenshots: [assets/screenshots/74-preview-purple-contrast.png](../../../assets/screenshots/74-preview-purple-contrast.png), [assets/screenshots/74-preview-riseup-theme.png](../../../assets/screenshots/74-preview-riseup-theme.png)

## Action

Make `/preview/:slug` a full-canvas presentation inside `FormRunner`. The route is already the viewport. Fix the cramped bar, the violet-on-violet chips, the gold-as-fill theme, the `Rise Up` brand string, and add preset `vscode-navy-gold`.

Keep layout math in `src/lib/presentation-layout.ts`. Keep branching in `getNextStepIndex` (`optionBranching`, then `jump_to`, then `branchTarget`). A video slide uses the existing `RunnerVideoPlayer` above a short question and the existing options. Do not add a second engine.

## Owned files

- `src/components/runner/FormRunner.tsx`
- `src/lib/themes.ts`
- `src/lib/theme-context.tsx`
- `src/styles/theme.css`
- `src/styles/theme.less`
- `src/components/forms/wizard-runner.tsx` (visible theme name string only)
- `src/components/admin/focus-quiz-editor.tsx` (visible theme name string only)
- `src/components/admin/backup-manager.tsx` (visible Riseup spelling only)

Do not edit `FormBuilder.tsx`, `wp-admin-sidebar.tsx`, `branching-engine.ts`, `presentation-layout.ts`, `types/form.ts`, or `02-spec/19-main-worker-service`.

## Implement

1. Preview bar: drop the `Live Preview` badge on `isPreviewRoute`. Copy link is an icon with tooltip `Copy link`. One View icon (tooltip `View`) holds Quiz format, Presentation slide, and Questions. Theme is a palette icon whose tooltip is the short preset name. The closed bar does not show `Theme:` or a long theme name.
2. Presentation slide: large question on the left, short subtitle (`subtitle`, else `description` clamped to two lines), options on the right. Hover transition about 180ms on transform and opacity. Optional hint from a non-empty `placeholder`. Sequence aside starts collapsed in this mode.
3. When `videoUrl` is set, `RunnerVideoPlayer` sits full width above that slide. Option choice advances through `getNextStepIndex` with the chosen option already in `answers`.
4. Purple chips: foreground on card, or white on solid `#5C45FD`. Remove `text-primary` + `bg-primary/10` kickers on `#0F0E1E`.
5. `riseup-asia`: navy `#0A0A14` stays. `--primary` becomes cream `#F7F1E6`. Highlight `#E8C547` is only the hovered choice mark. Progress, borders, sequence selection, and menu selection are not gold. Mirror tokens in `themes.ts`, `theme-context.tsx`, `theme.css`, and `theme.less`.
6. Add `vscode-navy-gold` / visible name `Navy Gold`: background `#0D1117`, primary `#F0F6FC`, highlight `#E8C547`. Do not use cyan `#38BDF8` and do not alias to `vscode-dark`. Register the id in `THEME_PRESETS`, `AppThemeType`, `THEME_CONFIGS`, `ORDERED_THEME_KEYS`, and both style files.
7. Visible brand string `Riseup` in the five owned name sites listed in the spec. `backup-manager.tsx` changes only the heading and the deploy log line.

## Browser acceptance

On `/preview/sample-sequential-knowledge-quiz`, desktop ~1280px and narrow ~390px:

1. Title is visible. `Live Preview`, `Theme:`, `Quiz Format`, and `Presentation Slide` are absent until View is opened.
2. Palette tooltip is the short theme name. The menu includes `Riseup` and `Navy Gold`.
3. View switches Quiz format and Presentation slide. Presentation is question left, options right. Narrow width stacks them with no bar overflow.
4. Choice hover transition is about 180ms and translates the row. Hint text follows a non-empty `placeholder`.
5. Purple headline is white on `#0F0E1E` at 4.5:1 or better. Kickers are not violet on violet.
6. Riseup background stays `#0A0A14`. Gold is only the choice hover mark. The menu says `Riseup`.
7. Navy Gold sets `data-theme="vscode-navy-gold"` and background `#0D1117`. It is not the cyan `vscode-dark` theme.
8. A `videoUrl` field shows the player above the question. `optionBranching` still decides the next step through `getNextStepIndex`.

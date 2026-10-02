# Onboarding Quiz presentation decisions

Status: Active
Spec: 02-spec/21-app/74-onboarding-quiz-presentation-ui/01-architecture-spec.md
Companion: 02-spec/21-app/74-onboarding-quiz-presentation-ui/02-component-spec.md
Plan: .ai-memory/plans/pending/74-onboarding-quiz-presentation-ui.md

## Decisions

1. The console wordmark is Onboarding Quiz. The mark is `src/assets/onboarding-quiz-mark.svg`. The tooltip on the mark is `Onboarding Quiz`.
2. Health, Quiz Config, Triggers, Tools, and Share are one Config menu. Preview and Save stay icon buttons.
3. The title-card accent is a 2px top edge (`h-0.5`) using `from-primary`. The title card and question cards use `shadow-md`.
4. Selected sidebar rows use `bg-muted text-foreground`. The thin `bg-primary` bar is the only theme-colored indicator.
5. The visible brand string is Riseup, one word.
6. Riseup background stays `#0A0A14`. Primary is cream `#F7F1E6` (`40 43% 92%`). Gold `#E8C547` is the choice highlight, not a fill for nav, borders, or buttons.
7. Navy Gold is preset id `vscode-navy-gold`. Background `#0D1117`, primary `#F0F6FC`, highlight `#E8C547`. It is not an alias of `vscode-dark`.
8. Preview drops the Live Preview badge. Theme, quiz format, and presentation slide are icon controls with tooltips. Presentation is a full view: question on the left, options on the right, about 180ms hover motion, optional hint from `placeholder`.
9. Video stays on `RunnerVideoPlayer`. The next step still comes from `getNextStepIndex`.
10. `src/themes/theme-definitions.ts` must match `src/lib/themes.ts` for Riseup and Navy Gold because `FocusQuizRunner` reads the definitions catalog.

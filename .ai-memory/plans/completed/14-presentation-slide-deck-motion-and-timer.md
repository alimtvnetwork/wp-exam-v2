# Plan: Presentation Slide Deck Motion, Default Text-Shadow, Layout Centering & Dynamic Timer

**ID:** `14-presentation-slide-deck-motion-and-timer`  
**Status:** completed  
**Priority:** High  
**Parent Epic:** Onboarding Quiz Presentation & Admin UI Modernization  
**Spec References:**  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/01-overview.md`  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/02-slide-motion-and-text-shadow.md`  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/03-executive-timer-and-urgency.md`  

---

## Completed Subtasks

- [x] `01-canonical-text-shadow-and-hover-spread.md` — Registered canonical `text-shadow: rgb(0 0 0) 1px 0.7px 0px;` token in `src/styles/theme.css`. Configured resting diffused spread (`--option-text-shadow-rest`) and smooth 200ms CSS3 hover transition wired into `.option-text` and `.option-text-shadow`.
- [x] `02-question-canvas-centering-and-downward-offset.md` — In `src/components/runner/FormRunner.tsx`, anchored presentation canvas to full viewport height (`min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-3rem)] flex flex-col justify-center`), aligned left question column to vertical center (`lg:self-center`), and pushed right options column downward (`pt-3 lg:pt-16 xl:pt-20`).
- [x] `03-global-ppt-dsrm-slide-deck-motion.md` — Added direction-aware slide deck keyframes (`@keyframes pptSlideRight`, `@keyframes pptSlideLeft`, `@keyframes pptFade`) and tracked `slideDirection` state in `FormRunner.tsx` for seamless executive slide deck motion.
- [x] `04-top-right-timer-urgency-and-fullscreen-header.md` — Repositioned timer and fullscreen controls to fixed top-right corner (`fixed top-3 right-4 sm:top-4 sm:right-6 z-40`). Implemented enlarged clock typography (`text-sm sm:text-base font-mono font-bold`), configurable urgent timer threshold (default `< 5 mins`), warning red color shift (`.timer-urgency-glow`), and 1-minute boundary pulse transition animation (`@keyframes timerMinutePulse`).
- [x] `05-riseup-asia-ppt-deck-polish.md` — Aligned Riseup theme with AGENTS.md §9: `#0A0A14` deep navy background, `#F7F1E6` cream text, `#E8C547` gold checkmark icons (`text-[#E8C547]`) and gold active option card borders (`border-[#E8C547] ring-1 ring-[#E8C547]/40`), plus 2px hairline chrome accent indicator (`h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md`).

---

## Target Codebase Files

- `src/styles/theme.css`
- `src/components/runner/FormRunner.tsx`
- `src/lib/types/form.ts`
- `src/themes/theme-definitions.ts`
- `src/lib/themes.ts`

---

## Verification Gates Passed

1. **Text Shadow Verification:** Verified canonical `default text shadow` resolves to `text-shadow: rgb(0 0 0) 1px 0.7px 0px;` on hover with resting diffused spread.
2. **Layout Balance Verification:** Verified question prompt is vertically centered on desktop viewports and options start at `pt-3 lg:pt-16 xl:pt-20`.
3. **Motion Verification:** Verified forward navigation slides from right and backward navigation slides from left with smooth easing.
4. **Timer Verification:** Verified timer docks to top-right corner, shows red color in last 5 minutes, and triggers pulse animation every minute tick.
5. **Path Hygiene:** Verified 100% relative Git paths with zero absolute paths or `file:///` URIs.

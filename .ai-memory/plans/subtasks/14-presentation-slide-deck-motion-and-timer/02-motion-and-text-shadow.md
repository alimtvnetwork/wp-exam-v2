# Subtask 02 — Motion Transitions, Text-Shadow Spread & Riseup Theme Polish

**Parent Plan:** `.ai-memory/plans/pending/64-presentation-slide-deck-motion-and-timer.md`  
**Status:** pending  
**Spec References:**  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/01-overview.md`  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/02-slide-motion-and-text-shadow.md`  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/03-executive-timer-and-urgency.md`  
**Owned Files:**  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/components/runner/FormRunner.tsx`  
- `src/themes/theme-definitions.ts`  
- `src/lib/theme-context.tsx`  

---

## Objectives & Detailed Steps for Worker 02

### 1. Register Canonical Default Text-Shadow & Spread Tokens (`src/styles/theme.css` & `src/styles/theme.less`)
- In `:root`, register the canonical text-shadow tokens:
  ```css
  :root {
    /* Canonical Default Text Shadow (Focused Hover State) */
    --wp-exam-text-shadow-default: rgb(0 0 0) 1px 0.7px 0px;
    --option-text-shadow-hover: rgb(0 0 0) 1px 0.7px 0px;

    /* Resting State: Diffused, Softer Spread Behavior */
    --option-text-shadow-rest: 0 1px 4px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25);
  }

  /* Light Theme Adjustments */
  [data-theme='light'],
  .theme-light {
    --wp-exam-text-shadow-default: rgba(0, 0, 0, 0.12) 1px 0.7px 0px;
    --option-text-shadow-hover: rgba(0, 0, 0, 0.12) 1px 0.7px 0px;
    --option-text-shadow-rest: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  ```

- Update `.presentation-option-card` rules around lines 62–87 of `src/styles/theme.css`:
  ```css
  .presentation-option-card {
    opacity: 0.85;
    transition:
      transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 220ms ease,
      border-color 220ms ease,
      background-color 220ms ease,
      opacity 220ms ease;
    will-change: transform, opacity, box-shadow;
  }

  .presentation-option-card .option-text {
    text-shadow: var(--option-text-shadow-rest);
    transition: text-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease, opacity 180ms ease;
    will-change: text-shadow;
  }

  .presentation-option-card:hover {
    opacity: 1;
    transform: translate3d(6px, 0, 0);
    border-color: hsl(var(--primary) / 0.55);
    background-color: hsl(var(--primary) / 0.08);
    box-shadow: 0 8px 24px -4px hsl(var(--primary) / 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.25);
  }

  .presentation-option-card:hover .option-text {
    text-shadow: var(--option-text-shadow-hover);
    color: hsl(var(--foreground));
    font-weight: 600;
  }
  ```

- Mirror all CSS rules inside `src/styles/theme.less`.

### 2. Implement Global PPT / DSRM Slide Motion Keyframes (`src/styles/theme.css` & `src/styles/theme.less`)
- In `src/styles/theme.css` and `src/styles/theme.less`, define directional slide transitions:
  ```css
  /* Global PPT / DSRM Slide Deck Transitions */
  @keyframes pptSlideForward {
    0% {
      opacity: 0;
      transform: translate3d(64px, 0, 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes pptSlideBackward {
    0% {
      opacity: 0;
      transform: translate3d(-64px, 0, 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  .animate-ppt-slide-forward {
    animation: pptSlideForward 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: transform, opacity;
  }

  .animate-ppt-slide-backward {
    animation: pptSlideBackward 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: transform, opacity;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-ppt-slide-forward,
    .animate-ppt-slide-backward {
      animation: none !important;
      transform: none !important;
    }
  }
  ```

### 3. Wire Direction-Aware Slide Deck Navigation (`src/components/runner/FormRunner.tsx`)
- Add `slideDirection` state:
  ```typescript
  type SlideDirection = 'forward' | 'backward';
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('forward');
  ```
- In `handleNextStep`: set `setSlideDirection('forward')` prior to changing step index.
- In `handlePreviousStep`: set `setSlideDirection('backward')` prior to changing step index.
- Attach the motion class dynamically to the presentation question slide container:
  ```tsx
  const slideAnimationClass = slideDirection === 'forward'
    ? 'animate-ppt-slide-forward'
    : 'animate-ppt-slide-backward';
  ```
  And apply `slideAnimationClass` to the slide container `key={currentField.id}`.

### 4. Polish Riseup Asia Theme Presentation (AGENTS.md §9)
- **Eliminate Emerald Green Checkmarks:**
  In `renderFieldInput` for `multiple_choice`, `single_choice`, `boolean`, and `true_false`:
  Replace hardcoded `text-emerald-500` with theme-conditional styling:
  ```tsx
  {isSelected && (
    <CheckCircle2
      className={`w-5 h-5 shrink-0 ml-auto transition-transform duration-200 ${
        isRiseupTheme ? 'text-[#E8C547]' : 'text-emerald-500'
      }`}
    />
  )}
  ```
- **Selected Option Border & Gold Atmospheric Glow:**
  In Riseup theme, selected option cards must apply `#E8C547` border with soft gold glow:
  ```tsx
  const isSelectedStyle = isSelected
    ? isRiseupTheme
      ? 'bg-[#E8C547]/12 border-[#E8C547] text-[#FFF1D6] font-semibold shadow-[0_0_18px_-2px_rgba(232,197,71,0.18)] ring-1 ring-[#E8C547]/40 opacity-100'
      : 'bg-primary/15 border-primary text-foreground font-semibold shadow-xs ring-1 ring-primary/40 opacity-100'
    : 'bg-card/75 border-border/80 text-foreground/80 hover:text-foreground';
  ```
  And the badge when selected in Riseup theme:
  ```tsx
  const isSelectedBadgeStyle = isSelected
    ? isRiseupTheme
      ? 'bg-[#E8C547] text-[#0A0A14] border-[#E8C547]'
      : 'bg-primary text-primary-foreground border-primary'
    : 'bg-muted/70 text-muted-foreground border-border/70';
  ```
- **2px Hairline Chrome Accent Indicator:**
  In `case 'section_header'` of `renderFieldInput` and on presentation title cards:
  Replace `h-1 w-16 bg-primary rounded-full mt-3` with 2px hairline chrome accent:
  ```tsx
  <div className={`h-0.5 w-16 rounded-full shadow-md mt-3 ${
    isRiseupTheme ? 'bg-[#E8C547]' : 'bg-primary'
  } ${
    field.choiceAlignment === 'center'
      ? 'mx-auto'
      : field.choiceAlignment === 'right'
      ? 'ml-auto'
      : ''
  }`} />
  ```

### 5. Harmonize Theme Definitions & Context (`src/themes/theme-definitions.ts` & `src/lib/theme-context.tsx`)
- In `src/themes/theme-definitions.ts`:
  Verify Riseup theme has:
  ```typescript
  background: '#0A0A14',
  textPrimary: '#FFF1D6',
  textSecondary: '#94A3B8',
  highlightWord: '#F7F1E6', // Cream primary text per Rule 9
  primary: '#F7F1E6',
  accent: '#E8C547', // Gold reserved strictly as active indicator
  ```
- In `src/lib/theme-context.tsx`:
  Sync tokens to guarantee `#0A0A14` background, cream primary, and gold active indicators.

---

## Verification Criteria
- [ ] Canonical token `default text shadow: rgb(0 0 0) 1px 0.7px 0px;` is registered in `src/styles/theme.css` and `src/styles/theme.less`.
- [ ] Option cards display diffused spread text shadow at rest and transition smoothly into canonical default text shadow on hover.
- [ ] Directional slide transitions (`animate-ppt-slide-forward` and `animate-ppt-slide-backward`) trigger upon question navigation.
- [ ] Selected checkmarks in Riseup theme render in `#E8C547` gold with zero emerald green.
- [ ] Selected option cards in Riseup theme feature `#E8C547` border with subtle gold glow.
- [ ] Title cards and section headers use a 2px hairline chrome accent line (`h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md`).
- [ ] All file references adhere strictly to relative git paths.

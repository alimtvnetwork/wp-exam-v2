# Subtask 01 — Timer Relocation, Canvas Centering & Dynamic Minute Pulse

**Parent Plan:** `.ai-memory/plans/pending/64-presentation-slide-deck-motion-and-timer.md`  
**Status:** pending  
**Spec References:**  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/01-overview.md`  
- `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/03-executive-timer-and-urgency.md`  
**Owned Files:**  
- `src/lib/types/form.ts`  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/components/runner/FormRunner.tsx`  

---

## Objectives & Detailed Steps for Worker 01

### 1. Extend `FormSettings` Schema (`src/lib/types/form.ts`)
- Locate the `FormSettings` interface (around lines 238–255).
- Add `urgencyThresholdSeconds?: number;` to the interface.
- Add descriptive JSDoc comment clarifying that it defaults to 300 seconds (5 minutes) if unset.

```typescript
export interface FormSettings {
  timeLimitSeconds?: number;
  timerMode?: 'none' | 'global' | 'per_question' | 'per_difficulty' | 'per_tier';
  perQuestionSeconds?: number;
  difficultyTimers?: { easy: number; medium: number; hard: number };
  difficultyPoints?: { easy: number; medium: number; hard: number };
  enableFullscreenLock?: boolean;
  defaultQuestionsRequired?: boolean;
  passingScore?: number;
  notificationEmail?: string;
  successMessage?: string;
  notificationTriggers?: NotificationTrigger[];
  emailCustomization?: EmailCustomizationConfig;

  /** Configurable threshold in seconds for urgency state (defaults to 300s / 5 minutes) */
  urgencyThresholdSeconds?: number;
  showSlideNumbers?: boolean;
  defaultQuestionLayout?: QuestionLayoutMode;
}
```

### 2. Implement CSS3 Urgency Glow & Minute Pulse Animations (`src/styles/theme.css` & `src/styles/theme.less`)
- Register the continuous ambient urgency animation and the 60-second boundary minute-rollover pulse keyframes:

```css
/* Continuous Ambient Urgency Glow */
@keyframes timerUrgencyAmbient {
  0%, 100% {
    box-shadow: 0 0 10px 1px rgba(239, 68, 68, 0.25), 0 4px 12px -2px rgba(0, 0, 0, 0.4);
    border-color: rgba(239, 68, 68, 0.45);
  }
  50% {
    box-shadow: 0 0 18px 3px rgba(239, 68, 68, 0.45), 0 4px 16px -2px rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.75);
  }
}

.timer-urgency-glow {
  animation: timerUrgencyAmbient 2.2s ease-in-out infinite;
  will-change: box-shadow, border-color;
}

/* Dynamic Minute-Rollover Pulse Animation */
@keyframes timerMinutePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8);
    background-color: rgba(239, 68, 68, 0.15);
  }
  25% {
    transform: scale(1.12);
    box-shadow: 0 0 24px 6px rgba(239, 68, 68, 0.7);
    background-color: rgba(239, 68, 68, 0.3);
    color: #FF3B30;
  }
  60% {
    transform: scale(1.04);
    box-shadow: 0 0 14px 3px rgba(239, 68, 68, 0.4);
    background-color: rgba(239, 68, 68, 0.22);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px 1px rgba(239, 68, 68, 0.25);
    background-color: rgba(239, 68, 68, 0.15);
  }
}

.animate-timer-minute-pulse {
  animation: timerMinutePulse 0.95s cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: transform, box-shadow, background-color;
}

@media (prefers-reduced-motion: reduce) {
  .timer-urgency-glow {
    animation: none !important;
    border-color: #EF4444 !important;
  }
  .animate-timer-minute-pulse {
    animation: none !important;
    transform: none !important;
  }
}
```

- In `src/styles/theme.less`, mirror the exact keyframes and mixin rules.

### 3. Relocate Timer & Fullscreen HUD to Top-Right Dock (`src/components/runner/FormRunner.tsx`)
- Remove the inline timer pill and fullscreen button from the internal presentation meta bar (`<div className="flex items-center justify-between text-xs text-muted-foreground pb-2">`).
- Render the executive control cluster fixed at the top-right corner of the runner viewport:
  ```tsx
  {/* Top-Right Executive Timer & Fullscreen Viewport Dock */}
  <div className="fixed top-3 right-4 sm:top-4 sm:right-6 z-40 flex items-center gap-2 select-none">
    {timeLeftSeconds !== null && (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-md backdrop-blur-md transition-all duration-300 ${
          isUrgent
            ? 'timer-urgency-glow bg-destructive/15 border-destructive/40 text-destructive'
            : 'bg-card/90 border-border/50 text-foreground'
        } ${isMinutePulsing ? 'animate-timer-minute-pulse' : ''}`}
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining: ${formatTimerDisplay(timeLeftSeconds)}`}
      >
        <Clock className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${isUrgent ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
        <span className="font-mono font-bold text-sm sm:text-base tracking-tight tabular-nums">
          {formatTimerDisplay(timeLeftSeconds)}
        </span>
      </div>
    )}

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleFullscreen}
          className="h-9 w-9 rounded-full bg-card/90 border border-border/50 shadow-md backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        {isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen Exam'}
      </TooltipContent>
    </Tooltip>
  </div>
  ```

### 4. Dynamic Minute Rollover & Urgency State Management (`src/components/runner/FormRunner.tsx`)
- Resolve urgency threshold:
  ```typescript
  const urgencyThreshold = activeForm.settings?.urgencyThresholdSeconds && activeForm.settings.urgencyThresholdSeconds > 0
    ? activeForm.settings.urgencyThresholdSeconds
    : 300; // Default 5 minutes
  const isUrgent = timeLeftSeconds !== null && timeLeftSeconds > 0 && timeLeftSeconds <= urgencyThreshold;
  ```
- Implement minute rollover state and timeout:
  ```typescript
  const [isMinutePulsing, setIsMinutePulsing] = useState(false);

  useEffect(() => {
    if (timeLeftSeconds === null || timeLeftSeconds <= 0 || isSubmitted) {
      return;
    }

    const isRolloverTick = timeLeftSeconds % 60 === 0;
    if (isUrgent && isRolloverTick) {
      setIsMinutePulsing(true);
      const timer = setTimeout(() => {
        setIsMinutePulsing(false);
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [timeLeftSeconds, isUrgent, isSubmitted]);
  ```

### 5. Vertical Centering & Right Options Downward Offset (`src/components/runner/FormRunner.tsx`)
- Update outer presentation canvas container around line 2428:
  ```tsx
  <div
    key={currentField.id}
    className="w-full min-h-[calc(100dvh-4rem)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8 animate-card-entrance relative"
  >
  ```
- Update 2-column grid layout around line 2642:
  ```tsx
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start w-full max-w-7xl mx-auto min-h-[55vh] lg:min-h-[62vh]">
    {/* Left Column: Question Prompt Vertically Centered */}
    <div className={`w-full space-y-6 flex flex-col justify-center lg:self-center ${
      effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-2' : 'lg:order-1'
    }`}>
      {/* Question Header & Prompt Elements */}
    </div>

    {/* Right Column: Choices Pushed Downward for Optical Balance */}
    <div className={`w-full space-y-6 flex flex-col justify-start pt-3 lg:pt-16 xl:pt-20 ${
      effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
    }`}>
      {/* Options Stack & Advance Actions */}
    </div>
  </div>
  ```

---

## Verification Criteria
- [ ] `FormSettings.urgencyThresholdSeconds` is declared in `src/lib/types/form.ts`.
- [ ] Top-right timer and fullscreen HUD are positioned fixed at `fixed top-3 right-4 sm:top-4 sm:right-6 z-40`.
- [ ] Clock font renders at `text-sm sm:text-base font-mono font-bold tabular-nums`.
- [ ] Clock icon is scaled to `w-4 h-4 sm:w-4.5 sm:h-4.5`.
- [ ] When `timeLeftSeconds <= urgencyThresholdSeconds` (default 300), styling switches to red `.timer-urgency-glow`.
- [ ] Every 60-second boundary tick triggers `.animate-timer-minute-pulse` for 0.95s.
- [ ] Left question prompt is vertically centered in the presentation row.
- [ ] Right options column has downward offset `pt-3 lg:pt-16 xl:pt-20`.
- [ ] Zero instances of `Candidate Response` label exist in the runner.

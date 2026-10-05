# Specification 05: Component 03 — Executive Timer, Urgency Pulse Pipeline & Riseup Presentation Architecture

**Parent Spec:** `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/01-overview.md`  
**Related Spec:** `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/02-slide-motion-and-text-shadow.md`  
**Target Files:**  
- `src/lib/types/form.ts`  
- `src/components/runner/FormRunner.tsx`  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/themes/theme-definitions.ts`  

---

## 1. Top-Right Anchored Timer & Fullscreen HUD Architecture

### 1.1 Problem & Layout Analysis
In prior iterations of the presentation runner, the countdown timer badge and fullscreen action button were placed inside the content flow of the question meta bar (`<div className="flex items-center justify-between text-xs text-muted-foreground pb-2">`). This created three severe architectural and UX defects:
1. **Vertical Space Contention:** The timer occupied valuable vertical real estate directly above the question title, pushing the question downward and interfering with vertical screen centering.
2. **Visual Clutter & Disconnect:** Grouping the timer with step progress pills (`Question X of Y`) and difficulty tags created cognitive noise, distracting candidates from the actual question context.
3. **Inconsistent Positioning Across Layouts:** In centered layouts versus 2-column split layouts, the timer shifted position horizontally depending on content width, violating executive presentation standards where system telemetry must remain docked to a predictable anchor.

### 1.2 Viewport-Anchored Fixed Toolbar Architecture
The timer badge and fullscreen button are relocated from the document flow into a persistent viewport-anchored executive cluster docked in the upper-right corner:

```tsx
{/* Executive Timer & Fullscreen Viewport Dock */}
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

### 1.3 Architectural Invariants
- **Layer Stacking (`z-40`):** Docked at `z-40`, positioning it safely above presentation slide elements (`z-10`) and below anti-cheat blackout modals or fullscreen alerts (`z-50`).
- **Clearing Viewport Ceiling:** Sits below the 2px ceiling-flush progress bar (`h-1 sm:h-1.5 z-50`) with `top-3 sm:top-4`, preventing visual overlap.
- **Zero Interference with Step Indicator:** The centered slide numbering pill (`1 / 10`) remains horizontally centered at `left-1/2 -translate-x-1/2`, guaranteeing zero collision with the top-right cluster on any viewport width `>= 320px`.
- **Backdrop Blur & Pill Aesthetic:** Both the timer pill and the fullscreen toggle share identical styling tokens (`rounded-full bg-card/90 border border-border/50 shadow-md backdrop-blur-md`), presenting a cohesive executive HUD.

---

## 2. Enlarged Clock Typography & Icon Specification

### 2.1 Dimensional & Typographic Upgrade Matrix

| Parameter | Previous Cramped State | Upgraded Executive Standard | Visual Rationale |
| :--- | :--- | :--- | :--- |
| **Typography Size** | `text-xs` (12px / 0.75rem) | `text-sm sm:text-base` (14px mobile, 16px desktop) | Eliminates squinting; ensures instant legibility from presentation distance and across laptop displays. |
| **Font Family** | Standard mono (`font-mono`) | `font-mono tabular-nums` | Monospace numbers prevent layout jitter as digits alternate between wide (e.g., `8`) and narrow (e.g., `1`) characters. |
| **Font Weight** | Semibold (`font-semibold` / 600) | Bold (`font-bold` / 700) | Enhances typographic density and authority against high-contrast presentation backgrounds. |
| **Clock Icon Dimensions** | `w-3.5 h-3.5` (14px × 14px) | `w-4 h-4 sm:w-4.5 sm:h-4.5` (16px mobile, 18px desktop) | Proportional scaling prevents the icon from appearing swallowed by the enlarged typography. |
| **Pill Padding** | `px-2.5 py-1` (10px H, 4px V) | `px-3.5 py-1.5` (14px H, 6px V) | Generous internal breathing room prevents numeric glyphs from crowding pill border radii. |
| **Shadow & Elevation** | `shadow-none` / flat | `shadow-md` | Floating elevation separates the executive telemetry cleanly from slide content moving beneath. |

### 2.2 Numerical Formatting Logic
Timer formatting uses zero-padded seconds and unpadded minutes (`M:SS`), or dual-padded hours when timer limit exceeds 60 minutes (`H:MM:SS`):

```typescript
export const formatTimerDisplay = (seconds: number): string => {
  if (seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    const padMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const padSec = secs < 10 ? `0${secs}` : `${secs}`;
    return `${hours}:${padMin}:${padSec}`;
  }

  const padSec = secs < 10 ? `0${secs}` : `${secs}`;
  return `${minutes}:${padSec}`;
};
```

---

## 3. Configurable Urgency Window (< 5 min default)

### 3.1 Schema Extension (`src/lib/types/form.ts`)
To allow per-quiz customization while maintaining enterprise defaults, `FormSettings` is extended with `urgencyThresholdSeconds`:

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

  // Presentation Deck Motion & Urgency Configuration
  urgencyThresholdSeconds?: number; // Defaults to 300 (5 minutes) if unset
  showSlideNumbers?: boolean;
  defaultQuestionLayout?: QuestionLayoutMode;
}
```

### 3.2 Threshold Evaluation & Fallback Semantics
In `FormRunner.tsx`, the active threshold is resolved using deterministic fallbacks:
1. If author configured `activeForm.settings?.urgencyThresholdSeconds` with a positive integer, that value is utilized.
2. If unset, null, or zero, the system enforces the canonical default: `300` seconds (5 minutes).
3. For fast quizzes with total time limit `<= 300` seconds, the threshold automatically scales down to `Math.floor(totalTimeLimit / 3)` or `60` seconds, ensuring the quiz does not start in a permanent panic state.

```typescript
const resolveUrgencyThreshold = (settings?: FormSettings): number => {
  if (settings?.urgencyThresholdSeconds !== undefined && settings.urgencyThresholdSeconds > 0) {
    return settings.urgencyThresholdSeconds;
  }

  const totalLimit = settings?.timeLimitSeconds;
  if (totalLimit !== undefined && totalLimit > 0 && totalLimit <= 300) {
    return Math.max(Math.floor(totalLimit / 3), 30);
  }

  return 300; // Default 5 minutes
};
```

### 3.3 Urgency State Activation
Urgency state is evaluated implicitly following repository Boolean principles:

```typescript
const urgencyThreshold = resolveUrgencyThreshold(activeForm.settings);
const isUrgent = timeLeftSeconds !== null && timeLeftSeconds > 0 && timeLeftSeconds <= urgencyThreshold;
```

---

## 4. CSS3 Minute-Rollover Pulse Keyframe Animation Pipeline

### 4.1 Keyframe Mechanics & Timing Architecture
The user directed:
> "Every time a minute passes, the font should be bigger in red color and then smooth into the current segment. This animation should indicate that one minute has passed and will start happening when there are last five minutes or three minutes... By default, for the system, it would be less than five minutes."

The animation pipeline consists of two distinct CSS layers:
1. **Continuous Baseline Urgency Glow (`.timer-urgency-glow`):** A soft, ambient pulsating red aura that stays active throughout the entire urgency window (`timeLeftSeconds <= 300`).
2. **Dynamic Minute-Rollover Pulse (`@keyframes timerMinutePulse`):** A pronounced, energetic scale-up and luminous shockwave triggered precisely on the 60-second boundary (e.g., `4:00`, `3:00`, `2:00`, `1:00`), expanding the pill to `1.12` scale and radiating an intense red glow before easing smoothly back to baseline over `950ms`.

### 4.2 CSS Keyframe Definitions (`src/styles/theme.css` & `src/styles/theme.less`)

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

/* Reduced Motion Compensation */
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

### 4.3 React Lifecycle & State Coordination
In `FormRunner.tsx`:

```tsx
const [isMinutePulsing, setIsMinutePulsing] = useState(false);

useEffect(() => {
  if (timeLeftSeconds === null || timeLeftSeconds <= 0 || isSubmitted) {
    return;
  }

  // Trigger pulse on minute rollover during urgent window
  const isRolloverSecond = timeLeftSeconds % 60 === 0;
  if (isUrgent && isRolloverSecond) {
    setIsMinutePulsing(true);
    const timeout = setTimeout(() => {
      setIsMinutePulsing(false);
    }, 950);

    return () => clearTimeout(timeout);
  }
}, [timeLeftSeconds, isUrgent, isSubmitted]);
```

---

## 5. Riseup Asia Theme Global PPT Slide Design Architecture

### 5.1 Adherence to AGENTS.md §9 Core Standard
The application enforces strict brand parameters for Riseup:
- **Brand Orthography:** Written as one word: `Riseup` (never `Rise Up`, `Rise-Up`, or `RiseUp`).
- **Color Dominance:**
  - Canvas / Background: `#0A0A14` (deep, immersive dark navy).
  - Primary Text: `#F7F1E6` (warm cream, providing supreme optical comfort without harsh pure white glare).
  - Secondary / Editorial Muted: `#94A3B8` / `#A1A1B5` (crisp slate-cream).
  - Active Indicator Mark: `#E8C547` (warm gold). **Strictly reserved as an active indicator mark, never a dominant surface or text color.**

### 5.2 Elimination of Erroneous Green Accents
In previous versions, multiple-choice option cards rendered a green checkmark (`text-emerald-500` / `#10B981`) upon selection, clashing with the Riseup corporate identity.
- In Riseup theme, the checkmark icon and check badge must render in `#E8C547` gold:

```tsx
{/* Riseup-Aware Selected Checkmark Icon */}
{isSelected && (
  <CheckCircle2
    className={`w-5 h-5 shrink-0 ml-auto transition-transform duration-200 ${
      isRiseupTheme ? 'text-[#E8C547]' : 'text-emerald-500'
    }`}
  />
)}
```

### 5.3 Option Border & Glow Token Architecture
When an option is selected in Riseup theme:
- The border transitions from subtle slate (`#2A2A44`) to gold (`#E8C547`).
- A delicate gold atmospheric glow wraps the card: `box-shadow: 0 0 16px -2px rgba(232, 197, 71, 0.16)`.
- The option letter badge (`A`, `B`, `C`) flips to gold background with dark navy text (`bg-[#E8C547] text-[#0A0A14] font-bold`).

```css
/* Riseup Selected Option Architecture */
[data-theme='riseup'] .presentation-option-card.is-selected,
.theme-riseup-asia .presentation-option-card.is-selected {
  border-color: #E8C547 !important;
  background-color: rgba(232, 197, 71, 0.12) !important;
  box-shadow: 0 0 18px -2px rgba(232, 197, 71, 0.18), 0 4px 12px rgba(0, 0, 0, 0.35) !important;
  opacity: 1 !important;
}

[data-theme='riseup'] .presentation-option-card.is-selected .option-badge,
.theme-riseup-asia .presentation-option-card.is-selected .option-badge {
  background-color: #E8C547 !important;
  color: #0A0A14 !important;
  border-color: #E8C547 !important;
}
```

### 5.4 2px Hairline Chrome Accent Indicator
Chunky solid color blocks or 4px–8px gradient ribbons distract from presentation typography. In accordance with AGENTS.md §9:
- Presentation title cards and section headers must utilize a 2px hairline chrome accent indicator:

```tsx
{/* 2px Hairline Chrome Accent Indicator */}
<div
  className={`h-0.5 w-16 rounded-full shadow-md mb-3 transition-colors ${
    isRiseupTheme ? 'bg-[#E8C547]' : 'bg-primary'
  }`}
/>
```

This hairline accent anchors the eye to the question title while preserving the minimalist, modern aesthetic of global slide decks (Keynote, DSRM, Riseup Asia global PPT).

---

## 6. Verification & Quality Gates

### 6.1 Timer & Urgency Checklist
- [ ] Timer and fullscreen buttons are rendered fixed at `fixed top-3 right-4 sm:top-4 sm:right-6 z-40`.
- [ ] Clock typography renders at `text-sm sm:text-base font-mono font-bold tabular-nums`.
- [ ] Clock icon scaled to `w-4 h-4 sm:w-4.5 sm:h-4.5`.
- [ ] `FormSettings.urgencyThresholdSeconds` is supported with default `300s` (5 minutes).
- [ ] Urgency mode activates when `timeLeftSeconds <= thresholdSeconds`, applying `.timer-urgency-glow`.
- [ ] Crossing every minute boundary (`timeLeftSeconds % 60 === 0`) triggers `@keyframes timerMinutePulse` for 0.95s.

### 6.2 Riseup Theme Checklist
- [ ] Canvas background is verified `#0A0A14`.
- [ ] Primary text is verified `#F7F1E6` cream.
- [ ] Selected checkmarks in option cards use `#E8C547` gold (zero emerald green).
- [ ] Selected option cards apply gold border `#E8C547` with soft atmospheric glow.
- [ ] Title card accent uses 2px hairline chrome line (`h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md`).
- [ ] Strictly zero absolute filesystem paths or remote file URI prefixes in any specification or code.

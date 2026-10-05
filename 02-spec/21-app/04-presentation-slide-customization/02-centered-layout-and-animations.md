# Presentation Slide Customization — Centered Layout & Animations Spec

This technical specification details the visual architecture, CSS3 GPU-accelerated motion pipeline, dynamic typography scaling, and ceiling-flush progress line for the presentation slide mode.

---

## 1. Centered Presentation Canvas Layout Specification

### 1.1 Architectural Overview

The presentation mode transforms the quiz runner into a focused, distraction-free slide deck experience. Unlike standard form runners that stack fields sequentially or use lateral split columns, the centered presentation slide establishes a single vertical visual axis where the candidate's gaze remains centered from question title down through answer options to navigation controls.

```
+---------------------------------------------------------------------------------------+
| [========== Fixed Ceiling-Flush Progress Bar (top: 0, left: 0, right: 0) ===========] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|                       Question Meta (Question 3 of 10 • 10 pt) • Timer                 |
|                                                                                       |
|                         [ Dynamic Question Title (max-w-2xl) ]                        |
|                                                                                       |
|                          Subtitle / Description / [Need a Hint?]                       |
|                                                                                       |
|                         +-----------------------------------+                         |
|                         | [A] Option Card 1                 |                         |
|                         +-----------------------------------+                         |
|                         | [B] Option Card 2                 |  (max-w-xl)             |
|                         +-----------------------------------+                         |
|                         | [C] Option Card 3                 |                         |
|                         +-----------------------------------+                         |
|                                                                                       |
|                             [ Previous ]      [ Next Question Enter ↵ ]               |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 1.2 Layout Hierarchy & Width Boundaries

The centered layout enforces a three-tier width hierarchy to maintain typographic readability and aesthetic balance:

1. **Outer Presentation Container (`max-w-3xl`):**
   - Centered horizontally via `mx-auto`.
   - Vertical padding: `py-8 sm:py-12 lg:py-16 px-4 sm:px-8`.
   - Flex structure: `w-full min-h-[calc(100dvh-3rem)] flex flex-col items-center justify-center space-y-8 animate-card-entrance`.

2. **Question Header & Title Block (`max-w-2xl`):**
   - Centered horizontally via `mx-auto text-center`.
   - Contains Question Meta (counter, difficulty, timer), Title heading, and optional Subtitle/Description.
   - Constrained to `max-w-2xl` (672px) so that question stems wrap naturally between 2 and 4 lines without straining horizontal eye tracking.

3. **Option Cards Stack (`max-w-xl`):**
   - Centered horizontally via `mx-auto`.
   - Constrained to `max-w-xl` (576px) to maintain a compact, punchy card width where option text and selection indicators are immediately scannable.
   - Inner card alignment: Option text aligns to the left (`text-left`) while the cards themselves are centered within the stack.

### 1.3 JSX Component Structure

The following JSX structure defines the centered presentation canvas in `src/components/runner/FormRunner.tsx`:

```tsx
<div
  key={currentField.id}
  className="w-full min-h-[calc(100dvh-3rem)] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 animate-card-entrance"
>
  <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8">
    {/* Question Context Meta Bar */}
    <div className="w-full max-w-2xl flex items-center justify-between text-xs text-muted-foreground pb-1">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-xs font-mono font-medium text-muted-foreground">
          <span>Question {currentStep + 1} of {visibleFields.length}</span>
        </div>
        {currentField.difficulty ? (
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
            currentField.difficulty === 'hard'
              ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
              : currentField.difficulty === 'medium'
              ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
              : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
          }`}>
            <span>{currentField.difficulty}</span>
            <span>•</span>
            <span>{currentField.customPointsOverride ?? (currentField.difficulty === 'hard' ? 20 : currentField.difficulty === 'medium' ? 10 : 5)} pt</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {timeLeftSeconds !== null ? (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
            timeLeftSeconds < 60
              ? 'bg-destructive/10 text-destructive animate-pulse'
              : 'bg-muted/40 text-muted-foreground'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimerDisplay(timeLeftSeconds)}</span>
          </div>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggleFullscreen}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/40 cursor-pointer"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}</TooltipContent>
        </Tooltip>
      </div>
    </div>

    {/* Video Block (If Present) */}
    {hasSlideVideo ? (
      <div className="w-full max-w-2xl mx-auto space-y-3">
        <div className="w-full max-h-[340px] aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80 mx-auto">
          <RunnerVideoPlayer
            videoUrl={currentField.videoUrl}
            videoCaption={currentField.videoCaption}
            title={currentField.label}
            bare
          />
        </div>
      </div>
    ) : null}

    {/* Centered Question Heading Block */}
    <div className="w-full max-w-2xl mx-auto space-y-3 text-center">
      <h2 className={`font-heading font-bold text-foreground tracking-tight ${getDynamicTitleTypographyClass(currentField.label)}`}>
        {renderHighlightedQuestionTitle(
          currentField.label,
          (currentField as FormField & { highlightWord?: string }).highlightWord,
          isRiseupTheme
        )}
        {isCurrentFieldRequired ? (
          <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
        ) : null}
      </h2>

      {hasFieldSubtitle ? (
        <p className="font-sans text-base sm:text-lg text-foreground/80 leading-relaxed font-normal text-center max-w-xl mx-auto">
          {currentField.subtitle}
        </p>
      ) : null}

      {hasFieldDescription ? (
        <div className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line text-center max-w-xl mx-auto">
          {currentField.description}
        </div>
      ) : null}

      {hasPlaceholderHint ? (
        <div className="pt-1 flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300 transition-all cursor-pointer text-xs font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Need a Hint?</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="center"
              className="w-80 p-3.5 text-xs bg-popover/95 backdrop-blur-md border border-border/40 shadow-xl rounded-xl space-y-1.5 text-left"
            >
              <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-semibold">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Question Hint</span>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs font-sans">
                {currentField.placeholder}
              </p>
            </PopoverContent>
          </Popover>
        </div>
      ) : null}
    </div>

    {/* MCQ Options Stack (Centered Container, Left-Aligned Option Text) */}
    <div className="w-full max-w-xl mx-auto space-y-4">
      {renderFieldInput(
        currentField,
        answers[currentField.id],
        (val) => handleAnswerChange(currentField.id, val),
        true,
        otherTexts,
        handleOtherTextChange
      )}

      {/* Navigation Controls Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={currentStep === 0}
          onClick={handlePreviousStep}
          className="btn-tactile-spring text-xs h-10 px-4 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer w-full sm:w-auto rounded-xl transition-all"
        >
          Previous
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleTestAutoFill}
                className="btn-tactile-spring text-xs h-10 px-3.5 font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
              >
                ⚡ Auto Fill
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fill valid answer and advance</TooltipContent>
          </Tooltip>

          {isLastVisibleStep ? (
            <Button
              type="button"
              size="sm"
              onClick={handleNextStep}
              className="btn-tactile-spring text-xs h-10 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center gap-2 flex-1 sm:flex-initial justify-center rounded-xl"
            >
              <span>Submit Assessment</span>
              <span className="text-[10px] opacity-75 font-mono">Enter ↵</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleNextStep}
              className="btn-tactile-spring text-xs h-10 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center gap-2 flex-1 sm:flex-initial justify-center rounded-xl"
            >
              <span>Next Question</span>
              <span className="text-[10px] opacity-75 font-mono">Enter ↵</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 2. Dynamic Typography Scaling Specification

### 2.1 Rationale & Problem

In slide presentations, question titles range from single-phrase queries ("What is DNS?") to detailed scenarios ("You are migrating an existing monolithic application to a microservices architecture on AWS. Which strategy minimizes database sync latency while maintaining consistency?").

Applying a fixed `text-5xl` class causes long titles (> 80 characters) to consume up to 400px of vertical space, pushing options below the viewport fold and forcing candidate scrolling. Conversely, short titles appear undersized relative to the expansive slide canvas.

### 2.2 Threshold Matrix

| Character Count | Tier Name | Tailwind Font Size Classes | Line Height | Visual Target |
|---|---|---|---|---|
| `<= 45` chars | Compact / Short | `text-4xl sm:text-5xl lg:text-6xl` | `leading-[1.15]` | Bold, cinematic impact for punchy questions |
| `46 – 80` chars | Standard / Medium | `text-3xl sm:text-4xl lg:text-5xl` | `leading-[1.2]` | Balanced proportion for standard 2-line questions |
| `> 80` chars | Extended / Long | `text-2xl sm:text-3xl lg:text-4xl` | `leading-snug` | Compact, readable multi-line layout preventing overflow |

### 2.3 Implementation Specification

The helper function is defined in `src/lib/presentation-layout.ts`:

```typescript
/**
 * Calculates dynamic typography classes for presentation question titles
 * based on string length to prevent overflow while preserving typographic hierarchy.
 *
 * @param title - The raw question title or label text
 * @returns Tailwind CSS class string for font size and line height
 */
export function getDynamicTitleTypographyClass(title?: string): string {
  const textLength = title ? title.trim().length : 0;

  if (textLength > 80) {
    return 'text-2xl sm:text-3xl lg:text-4xl leading-snug';
  }

  if (textLength > 45) {
    return 'text-3xl sm:text-4xl lg:text-5xl leading-[1.2]';
  }

  return 'text-4xl sm:text-5xl lg:text-6xl leading-[1.15]';
}
```

### 2.4 Vitest Test Cases

Unit tests in `src/test/spec17-presentation-split-layout.test.ts` must verify the boundaries:

```typescript
describe('getDynamicTitleTypographyClass', () => {
  it('returns large typography classes for titles <= 45 characters', () => {
    expect(getDynamicTitleTypographyClass('What is DNS?')).toBe('text-4xl sm:text-5xl lg:text-6xl leading-[1.15]');
    expect(getDynamicTitleTypographyClass('A'.repeat(45))).toBe('text-4xl sm:text-5xl lg:text-6xl leading-[1.15]');
    expect(getDynamicTitleTypographyClass('')).toBe('text-4xl sm:text-5xl lg:text-6xl leading-[1.15]');
    expect(getDynamicTitleTypographyClass(undefined)).toBe('text-4xl sm:text-5xl lg:text-6xl leading-[1.15]');
  });

  it('returns medium typography classes for titles between 46 and 80 characters', () => {
    expect(getDynamicTitleTypographyClass('A'.repeat(46))).toBe('text-3xl sm:text-4xl lg:text-5xl leading-[1.2]');
    expect(getDynamicTitleTypographyClass('A'.repeat(80))).toBe('text-3xl sm:text-4xl lg:text-5xl leading-[1.2]');
  });

  it('returns reduced typography classes for titles exceeding 80 characters', () => {
    expect(getDynamicTitleTypographyClass('A'.repeat(81))).toBe('text-2xl sm:text-3xl lg:text-4xl leading-snug');
    expect(getDynamicTitleTypographyClass('A'.repeat(200))).toBe('text-2xl sm:text-3xl lg:text-4xl leading-snug');
  });
});
```

---

## 3. CSS3 GPU-Accelerated Animation Pipeline Specification

### 3.1 Performance Bottleneck Analysis

Profiling identified three distinct animation performance regressions:
1. **Subpixel Layout Recalculation:** `cardEntrance` used `scale(0.98)` alongside `translateY(12px)`. Non-integer scaling of elements containing text forces browser engines (Chromium/Gecko/WebKit) to re-rasterize font glyphs at fractional coordinates on every animation tick, causing 40–80ms frame drops on lower-spec hardware.
2. **Excessive Stagger Latency:** `@keyframes slideInUpSoft` had delays up to 360ms with a 450ms duration. The 6th option card took 810ms to settle, inducing perceived UI unresponsiveness.
3. **Transform Collision:** In `FormRunner.tsx`, option cards had both `presentation-option-card` (which specifies `transform: translate3d(6px, 0, 0)` on hover) and Tailwind `hover:translate-x-2` (`transform: translateX(0.5rem)`). These two rules fight for specificity on the CSS `transform` property, resulting in jarring snaps.
4. **Universal Transition Churn:** In `src/index.css`, `* { transition: ... 250ms }` caused every DOM mutation (including hover states, tooltip renders, and progress updates) to compute transitions across all child nodes.

### 3.2 CSS3 Keyframe & Transition Definitions (`src/styles/theme.css`)

Replace existing definitions in `src/styles/theme.css` with pure 3D hardware-accelerated transforms:

```css
/* Card Entrance Animation - Pure 3D Translation Without Scale Recalculations */
@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-card-entrance {
  animation: cardEntrance 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

/* Option Card Stagger Animation - Snappy Micro-Staggers (30ms increments) */
@keyframes slideInUpSoft {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.slide-up-anim {
  animation: slideInUpSoft 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}

.stagger-1 { animation-delay: 0.03s; }
.stagger-2 { animation-delay: 0.06s; }
.stagger-3 { animation-delay: 0.09s; }
.stagger-4 { animation-delay: 0.12s; }
.stagger-5 { animation-delay: 0.15s; }
.stagger-6 { animation-delay: 0.18s; }

/* GPU-Accelerated Option Card Hover Glide */
.presentation-option-card {
  transition: transform 150ms cubic-bezier(0.2, 0, 0, 1),
              box-shadow 150ms ease,
              border-color 150ms ease,
              background-color 150ms ease,
              opacity 150ms ease;
  will-change: transform, opacity;
}

.presentation-option-card:hover {
  transform: translate3d(4px, 0, 0);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.25);
}

/* Reduced Motion Compliance */
@media (prefers-reduced-motion: reduce) {
  .slide-up-anim,
  .presentation-option-card,
  .animate-card-entrance {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}
```

### 3.3 Option Card Class Cleansing (`src/components/runner/FormRunner.tsx`)

In `src/components/runner/FormRunner.tsx` (around line 3455):

```typescript
// BEFORE: Conflicting Tailwind class
const choiceMotionClass = isPresentationSlide
  ? 'slide-up-anim presentation-option-card hover:translate-x-2'
  : 'transition-all duration-200';

// AFTER: Clean GPU-accelerated motion class
const choiceMotionClass = isPresentationSlide
  ? 'slide-up-anim presentation-option-card'
  : 'transition-all duration-200';
```

### 3.4 Elimination of Universal Transition (`src/index.css`)

In `src/index.css`, modify the `@layer base` section:

```css
/* BEFORE: Costly universal transition on all DOM nodes */
@layer base {
  * {
    @apply border-border;
    transition-property: color, background-color, border-color, box-shadow;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 250ms;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
}

/* AFTER: Scoped transitions on interactive elements only */
@layer base {
  * {
    @apply border-border;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }

  button, input, select, textarea, a {
    transition-property: color, background-color, border-color, box-shadow;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }
}
```

---

## 4. Ceiling-Flush Top Progress Line Architecture

### 4.1 The CSS Containing Block Trap

In the legacy implementation, the progress bar was rendered within the card element:

```tsx
<div
  key={currentField.id}
  className="... animate-card-entrance relative"
>
  <div className="fixed top-0 left-0 right-0 w-full h-1 z-50 pointer-events-none">
    <Progress ... />
  </div>
```

Under W3C CSS Transforms Module Level 1 (Section 6), any ancestor with a non-none `transform` property becomes the containing block for all descendants, including those with `position: fixed`. Because `.animate-card-entrance` initiates at `translateY(12px)` (or `translate3d(0, 10px, 0)`), the "fixed" progress bar is trapped within that element's coordinate space. As a result:
1. The line is visually offset by the container's margins and padding, floating 10–20px below the actual browser viewport ceiling.
2. The progress bar slides downward and upward with the question card on every step change.
3. Because it is nested inside an element with `key={currentField.id}`, React unmounts the `<Progress />` component and mounts a new one on every question transition, resetting CSS transitions and destroying the fluid width animation between progress values.

### 4.2 Hoisting Solution Architecture

The progress line must be hoisted to the root container level of `FormRunner.tsx`, placed outside of any transformed, animated, or keyed element.

```tsx
export const FormRunner: React.FC<FormRunnerProps> = ({ ... }) => {
  // ... state and logic ...

  const progressPercentage = Math.round(
    ((stepHistory.length + 1) / Math.max(visibleFields.length, 1)) * 100
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Viewport Ceiling-Flush Progress Line (Persists across step transitions) */}
      <div
        className="fixed top-0 left-0 right-0 w-full h-1 sm:h-1.5 z-[100] pointer-events-none"
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <Progress
          value={progressPercentage}
          className={`h-full rounded-none transition-all duration-300 ${
            isRiseupTheme
              ? 'bg-black/40 [&>div]:bg-[#E8C547]'
              : 'bg-secondary [&>div]:bg-primary'
          }`}
        />
      </div>

      {/* Main Runner Layout Wrapper */}
      <div className="...">
        {/* Step-based presentation mode renders here with key={currentField.id} */}
      </div>
    </div>
  );
};
```

### 4.3 Key Technical Advantages

1. **True Ceiling Alignment:** Positioned at `fixed top-0 left-0 right-0`, flush with pixel 0 of the browser viewport.
2. **Persistent Component Lifecycle:** The `<Progress />` element remains mounted throughout the entire assessment session. When `progressPercentage` updates from 20% to 30%, the underlying CSS transition (`transition-all duration-300`) smoothly interpolates the progress bar width without flashes or jumps.
3. **Zero Subpixel Interference:** Independent of card entrance transformations, preventing any jitter or blur during question navigation.

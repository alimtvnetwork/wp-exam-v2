# Specification 05: Component 02 — Slide Motion, Default Text-Shadow, Canvas Centering & Downward Offset

**Parent Spec:** `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/01-overview.md`  
**Target Files:**  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/components/runner/FormRunner.tsx`  
- `src/components/runner/FocusQuizRunner.tsx`  

---

## 1. Canonical Default Text-Shadow Specification

### 1.1 Canonical CSS Declaration
Whenever the term **default text shadow** is referenced in specifications, design notes, or code directives, it represents the following exact CSS declaration:

```css
text-shadow: rgb(0 0 0) 1px 0.7px 0px;
```

This specific declaration establishes a sharp, directional drop shadow (`X: 1px`, `Y: 0.7px`, `Blur: 0px`) with total solid black opacity (`rgb(0 0 0)`). This produces high-definition edge contrast for white or high-key text against dark and semi-translucent presentation backgrounds without creating muddy halos.

### 1.2 Design Token Architecture
In `src/styles/theme.css` and `src/styles/theme.less`, register the canonical text-shadow variables inside the root and theme scopes:

```css
:root {
  /* Canonical Default Text Shadow (Focused Hover State) */
  --wp-exam-text-shadow-default: rgb(0 0 0) 1px 0.7px 0px;
  --option-text-shadow-hover: rgb(0 0 0) 1px 0.7px 0px;

  /* Rest State: Lighter, Diffused Spread Behavior */
  --option-text-shadow-rest: 0 1px 4px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* Light Mode Overrides */
[data-theme='light'],
.theme-light {
  --wp-exam-text-shadow-default: rgba(0, 0, 0, 0.12) 1px 0.7px 0px;
  --option-text-shadow-hover: rgba(0, 0, 0, 0.12) 1px 0.7px 0px;
  --option-text-shadow-rest: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* Dark Themes (Riseup, Purple, Dracula, Midnight, Slate) */
[data-theme='riseup'],
[data-theme='purple'],
[data-theme='dracula'],
[data-theme='dark'],
.dark {
  --wp-exam-text-shadow-default: rgb(0 0 0) 1px 0.7px 0px;
  --option-text-shadow-hover: rgb(0 0 0) 1px 0.7px 0px;
  --option-text-shadow-rest: 0 1px 4px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25);
}
```

---

## 2. Text-Shadow Hover Spread Animation Architecture

### 2.1 Resting vs. Hover State Mechanics
The user specifically directed:
> "With the white, it would be nice to have a little bit of text shadow. I'm sharing a text shadow sample. Try to put this as a default text shadow example in the spec... By default, this is not the color. Usually, this would be the hover color, but when not hovering, it should have a lighter and spreaded behavior. When hovering, the spread behavior, CSS3 animation goes to this text shadow."

The state model operates as follows:
1. **At Rest (`:not(:hover)`):**
   - The choice option text renders with a diffused, softer spread (`var(--option-text-shadow-rest)`).
   - This prevents harsh visual edges while maintaining readability against background surfaces.
   - Rest opacity is set to `0.85` to `0.92`.
2. **On Hover (`:hover`):**
   - The text shadow animates smoothly into the canonical default text shadow (`rgb(0 0 0) 1px 0.7px 0px`).
   - The option card slides horizontally by `6px` (`transform: translate3d(6px, 0, 0)`).
   - Text opacity sharpens to `1.0` and border glow illuminates with the theme active accent.

### 2.2 CSS Transition Rules
```css
/* Option Card Choice Label Transition */
.quiz-option-card {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
              background-color 200ms ease,
              border-color 200ms ease,
              box-shadow 220ms ease;
  will-change: transform, box-shadow;
}

.quiz-option-card .quiz-option-label {
  text-shadow: var(--option-text-shadow-rest);
  transition: text-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1),
              color 180ms ease,
              opacity 180ms ease;
  will-change: text-shadow;
}

.quiz-option-card:hover {
  transform: translate3d(6px, 0, 0);
}

.quiz-option-card:hover .quiz-option-label {
  text-shadow: var(--option-text-shadow-hover);
  opacity: 1;
}
```

---

## 3. Global PPT / DSRM Slide Deck Transitions Specification

### 3.1 Background & Presentation Deck Flow
In enterprise slide deck systems (Rise Up Asia PPT, DSRM decks, executive Keynote presentations), slide advancement is never an instantaneous flash. Navigating between questions represents turning or advancing a slide deck:
- Advancing to the next question enters from the right (`slide-forward`).
- Navigating back enters from the left (`slide-backward`).
- Transitions combine subtle translation, depth opacity ramping, and easing without layout shifts.

### 3.2 Keyframe Definitions
In `src/styles/theme.css` and `src/styles/theme.less`:

```css
/* Global PPT Slide Deck Transitions */
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

@keyframes pptFade {
  0% {
    opacity: 0;
    transform: scale(0.985);
  }
  100% {
    opacity: 1;
    transform: scale(1);
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

.animate-ppt-fade {
  animation: pptFade 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: transform, opacity;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .animate-ppt-slide-forward,
  .animate-ppt-slide-backward,
  .animate-ppt-fade {
    animation: none !important;
    transform: none !important;
  }
}
```

### 3.3 State Management in Runner Components
In `src/components/runner/FormRunner.tsx`:

```tsx
// Slide Direction Tracking State
type SlideDirection = 'forward' | 'backward';
const [slideDirection, setSlideDirection] = useState<SlideDirection>('forward');

// Navigation Handlers
const handleNextQuestion = () => {
  setSlideDirection('forward');
  setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
};

const handlePrevQuestion = () => {
  setSlideDirection('backward');
  setCurrentStep((prev) => Math.max(prev - 1, 0));
};

// Motion Class Resolution
const slideAnimationClass = slideDirection === 'forward'
  ? 'animate-ppt-slide-forward'
  : 'animate-ppt-slide-backward';
```

---

## 4. Question Canvas Vertical Centering & Downward Offset Architecture

### 4.1 Full-Viewport Centering Specification
The user specifically directed:
> "The text needs to be in the center of the screen, and the options on the right-hand side need to go down."

To achieve optimal optical balance:
1. **Outer Canvas Container:**
   - Instead of a fixed small `min-h-[55vh]` or `min-h-[62vh]`, the container must occupy full available viewport height:
     ```tsx
     className="w-full min-h-[calc(100dvh-4rem)] flex flex-col justify-center py-6 lg:py-10"
     ```
2. **Two-Column Grid Alignment:**
   - The grid container utilizes `items-start` on desktop:
     ```tsx
     className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-start w-full max-w-7xl mx-auto"
     ```
3. **Left Column (Question Title & Guidance):**
   - Vertically centered within the grid row:
     ```tsx
     className="w-full space-y-6 flex flex-col justify-center lg:self-center"
     ```
   - This ensures the question statement rests exactly in the vertical center of the candidate's viewport.
4. **Right Column (Options & Answers):**
   - Pushed downward intentionally:
     ```tsx
     className="w-full space-y-6 flex flex-col justify-start pt-3 lg:pt-16 xl:pt-20"
     ```
   - On desktop screens (`lg` and `xl`), the choices start below the upper baseline of the title, creating a relaxed, staggered reading hierarchy.
   - On mobile screens (`< lg`), `pt-3` prevents unnecessary vertical gaps.

### 4.2 FormRunner JSX Reference Architecture
```tsx
{/* Presentation Canvas Container */}
<div className={`w-full min-h-[calc(100dvh-4rem)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-10 ${slideAnimationClass}`} key={currentField.id}>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-start w-full max-w-7xl mx-auto">
    
    {/* Left Column: Question Prompt Vertically Centered */}
    <div className={`w-full space-y-6 flex flex-col justify-center lg:self-center ${
      effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-2' : 'lg:order-1'
    }`}>
      <div className="space-y-4">
        {/* Step indicator badge */}
        <div className="inline-flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold tracking-wider uppercase border-primary/30 bg-primary/5 text-primary">
            Question {currentStepIndex + 1} of {totalQuestions}
          </Badge>
        </div>

        {/* Question Title */}
        <h2 className={`font-heading font-bold ${dynamicTitleTypography} text-foreground tracking-tight leading-tight`}>
          {renderHighlightedQuestionTitle(
            currentField.label,
            (currentField as FormField & { highlightWord?: string }).highlightWord,
            isRiseupTheme
          )}
          {isCurrentFieldRequired && (
            <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
          )}
        </h2>

        {/* Subtitle & Editorial Description */}
        {hasFieldSubtitle && (
          <p className="font-sans text-base sm:text-lg text-foreground/80 leading-relaxed font-normal">
            {currentField.subtitle}
          </p>
        )}
        {hasFieldDescription && (
          <div className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
            {currentField.description}
          </div>
        )}
      </div>

      {/* Helpful Guidance Popover */}
      {hasPlaceholderHint && (
        <div className="pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Need a Hint?</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 text-sm bg-popover/95 backdrop-blur-md border border-border shadow-xl">
              <p className="text-foreground leading-relaxed">{currentField.placeholder}</p>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>

    {/* Right Column: Choices Offset Downward */}
    <div className={`w-full space-y-6 flex flex-col justify-start pt-3 lg:pt-16 xl:pt-20 ${
      effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
    }`}>
      <div className="w-full space-y-6 relative">
        {/* Interactive Field Input Options */}
        <div className="space-y-4">
          {renderFieldInput(
            currentField,
            answers[currentField.id],
            (val) => handleAnswerChange(currentField.id, val),
            true,
            otherTexts,
            handleOtherTextChange
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border/40">
          <Button
            variant="outline"
            size="default"
            onClick={handlePrevQuestion}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={handleNextQuestion}
            className="gap-2"
          >
            <span>{isLastStep ? 'Submit Assessment' : 'Next Question'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

  </div>
</div>
```

---

## 5. Verification Checklist
- [ ] Canonical token `default text shadow`: `text-shadow: rgb(0 0 0) 1px 0.7px 0px;` is declared across CSS and LESS.
- [ ] Option cards animate text shadow smoothly from resting spread to canonical focused hover state.
- [ ] Slide deck transitions trigger directional animations (`animate-ppt-slide-forward` vs `animate-ppt-slide-backward`).
- [ ] Question canvas occupies `min-h-[calc(100dvh-4rem)]` with left column centered vertically and right column offset with `pt-3 lg:pt-16 xl:pt-20`.
- [ ] Zero instances of `Candidate Response` exist in the DOM or components.

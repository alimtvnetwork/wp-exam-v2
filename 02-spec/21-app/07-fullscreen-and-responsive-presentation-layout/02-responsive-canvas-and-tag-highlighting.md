# Specification 07: Component Spec 02 — Widescreen Canvas, Question Tag Highlighting & Controls Architecture

**Parent Spec:** `02-spec/21-app/07-fullscreen-and-responsive-presentation-layout/`  
**Area:** Presentation Mode Layout, FormRunner.tsx, Responsive Canvas, Question Step Tag, Controls Cluster  
**Target Components:** `src/components/runner/FormRunner.tsx`, `src/lib/presentation-layout.ts`  

---

## 1. Widescreen Presentation Canvas Expansion (`max-w-[92rem]`)

### 1.1 Structural Limitations of the Legacy Canvas
In legacy implementations, presentation slides were contained within an artificial width ceiling of `max-w-6xl` (1152px). On standard full HD (1920×1080), 2K (2560×1440), and modern widescreen displays, this created large swaths of unused horizontal margins on both flanks of the screen.

```text
[Viewport: 1920px Wide]
|-------- 384px Dead Space --------| [max-w-6xl: 1152px] |-------- 384px Dead Space --------|
                                   | [Left Col] | [Right Col] |
```

Furthermore, in fullscreen mode (`isFullscreen`), the layout remained confined to this narrow boundary, severely compressing the 2-column layout and squeezing choice option text and code blocks into narrow vertical columns.

### 1.2 Widescreen Container Architecture (`max-w-7xl xl:max-w-[92rem]`)
In the updated architecture, presentation slides dynamically expand to widescreen proportions while standard admin forms remain safely bounded for editorial comfort:

```tsx
/* Dynamic Presentation Container Width in FormRunner.tsx */
<div
  className={`mx-auto ${
    effectiveLayoutMode !== 'standard'
      ? 'space-y-0 w-full max-w-7xl xl:max-w-[92rem] px-3 sm:px-6 lg:px-8'
      : activeThemeId === 'clean-wide'
      ? 'space-y-5 max-w-7xl px-4 sm:px-6 lg:px-8'
      : 'space-y-5 max-w-6xl px-4 sm:px-6 lg:px-8'
  }`}
>
```

### 1.3 Viewport Breakpoint & Grid Geometry
The 2-column presentation grid expands fluidly according to the following viewport matrix:

| Breakpoint | Viewport Width | Max Container Width | Column Layout | Grid Gap | Vertical Canvas Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Fluid ($100\%$) | $100\%$ | 1 Column (Stacked) | `gap-6` | Fluid auto height |
| **Tablet (`640px - 1023px`)** | Fluid ($100\%$) | $100\%$ | 1 Column (Stacked) | `gap-8` | `min-h-[70vh]` |
| **Desktop (`1024px - 1279px`)**| LG ($\ge 1024\text{px}$) | `max-w-7xl` ($1280\text{px}$) | 2 Columns ($50\% / 50\%$) | `gap-12` | `min-h-[68vh]` |
| **Widescreen (`\ge 1280px`)** | XL ($\ge 1280\text{px}$) | `max-w-[92rem]` ($1472\text{px}$) | 2 Columns ($50\% / 50\%$) | `gap-16` | `min-h-[72vh]` |
| **Ultra-wide (`\ge 1536px`)** | 2XL ($\ge 1536\text{px}$) | `max-w-[92rem]` ($1472\text{px}$) | 2 Columns ($50\% / 50\%$) | `gap-16` | `min-h-[75vh]` |

### 1.4 Downward Baseline Anchoring of Options Column
To address the downward arrows indicated in the user annotation, the right-hand options column utilizes a flex column layout with structured separation:

```tsx
/* Right-Hand Column: Choice Options with Baseline-Anchored Action Footer */
<div
  className={`w-full h-full flex flex-col justify-between pt-2 lg:pt-6 xl:pt-8 ${
    effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left'
      ? 'lg:order-1'
      : 'lg:order-2'
  }`}
>
  {/* Interactive Field Options */}
  <div className="w-full space-y-6 relative">
    <div className="space-y-3.5">
      {renderFieldInput(...)}
    </div>
  </div>

  {/* Baseline Action Navigation Footer */}
  <div className="mt-auto pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
    {/* Left: Previous Button */}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={currentStep === 0}
      onClick={handlePreviousStep}
      className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-sans font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto ${
        currentStep === 0 ? 'invisible sm:opacity-0 sm:pointer-events-none' : 'opacity-100'
      }`}
    >
      <ChevronLeft className="w-4 h-4 shrink-0" />
      <span>Previous</span>
    </Button>

    {/* Right: Auto Fill + Next Question Primary Action */}
    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
      {/* Auto Fill Button */}
      ...
      {/* Next Question / Submit Primary Button */}
      ...
    </div>
  </div>
</div>
```

---

## 2. Elevated Question Step Tag & Active Index Highlighting Specification

### 2.1 Problem Analysis
In the legacy presentation canvas, the step indicator was rendered as a small, muted pill:

```tsx
/* Legacy Subdued Question Tag */
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-xs font-mono font-medium text-muted-foreground">
  <span>Question {currentStep + 1} of {visibleFields.length}</span>
</div>
```

Deficiencies:
- **Small Font Size:** `text-xs` (12px) caused the tag to be overlooked during presentation mode.
- **Lack of Contrast:** The active step index `1` was visually indistinguishable from `Question` and `of 2`.
- **Theme Disconnect:** In Riseup theme, the active step lacked the signature brand active indicator mark.

### 2.2 Elevated Badge & Active Pill Architecture
The modernized question step tag elevates the container and provides an isolated, high-contrast active index pill:

```tsx
{/* Elevated Question Step Indicator Badge */}
<div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-border/60 bg-card/85 backdrop-blur-md text-xs sm:text-sm font-sans font-semibold text-foreground/90 shadow-xs select-none">
  <span className="text-foreground/80 font-medium">Question</span>
  
  {/* Active Question Index Accent Pill */}
  <span
    className={`inline-flex items-center justify-center min-w-[22px] sm:min-w-[26px] h-6 sm:h-7 px-2 py-0.5 rounded-lg font-mono font-bold text-xs sm:text-sm shadow-xs transition-all ${
      isRiseupTheme
        ? 'bg-[#E8C547] text-[#0A0A14] font-black border border-[#E8C547]/80'
        : activeThemeId === 'purple' || activeThemeId === 'letterly'
        ? 'bg-[#5C45FD] text-white font-bold border border-[#818CF8]/40 shadow-indigo-500/25'
        : activeThemeId === 'dracula'
        ? 'bg-[#BD93F9] text-[#282A36] font-bold border border-[#BD93F9]/40'
        : 'bg-primary text-primary-foreground font-bold border border-primary/20'
    }`}
  >
    {currentStep + 1}
  </span>
  
  <span className="text-muted-foreground/70 font-normal">of</span>
  <span className="font-mono font-semibold text-muted-foreground">{visibleFields.length}</span>
</div>
```

### 2.3 Theme-Specific Active Index Pill Specifications

| Theme | Pill Background | Pill Text Color | Border Accent | Compliance Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Riseup Theme** | `#E8C547` (Brand Gold) | `#0A0A14` (Deep Navy) | `#E8C547`/80 | Strictly an active indicator mark per Rule 9. |
| **Purple / Letterly Theme** | `#5C45FD` (Indigo Violet) | `#FFFFFF` (Pure White) | `#818CF8`/40 | Accessible high-contrast against `#0F0E1E`. |
| **Antigravity Dracula Theme** | `#BD93F9` (Lilac Purple) | `#282A36` (Dracula Charcoal) | `#BD93F9`/40 | Accessible active token against `#282A36`. |
| **Default / Clean / Minimal** | `var(--primary)` | `var(--primary-foreground)` | `var(--primary)`/20 | Consistent with design system primary tone. |

### 2.4 Left Column Placement & Alignment
The elevated question step tag is positioned at the top of the left column directly above the hairline chrome accent and question title:

```tsx
{/* Left Column in 2-Column Presentation Grid */}
<div className={`w-full space-y-6 flex flex-col justify-center lg:self-center ${...}`}>
  {/* Question Metadata & Elevated Step Tag */}
  <div className="flex items-center gap-2 flex-wrap">
    {(activeForm.settings?.showSlideNumbers ?? true) && (
      /* Elevated Question Step Indicator Badge */
      <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 ...">
        ...
      </div>
    )}

    {/* Optional Difficulty & Points Badge */}
    {currentField.difficulty && (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ...`}>
        <span>{currentField.difficulty}</span>
        <span>•</span>
        <span>{currentField.customPointsOverride ?? (...)} pt</span>
      </div>
    )}
  </div>

  {/* Hairline Chrome Accent (2px) */}
  {isRiseupTheme && (
    <div className="h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md" />
  )}

  {/* Question Title */}
  <h2 className={`font-heading font-bold ${dynamicTitleTypography} text-foreground tracking-tight`}>
    {renderHighlightedQuestionTitle(currentField.label, currentField.highlightWord, isRiseupTheme)}
    {isCurrentFieldRequired && (
      <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
    )}
  </h2>
  ...
</div>
```

---

## 3. Top-Center Element Cleanup & Floating Cluster Integration

### 3.1 Identification of Visual Conflicts
In previous versions, two conflicting elements appeared in the top-center viewport zone:
1. **Redundant Fixed Slide Pill:**
   `fixed top-2.5 left-1/2 -translate-x-1/2 z-40` displayed `{currentStep + 1} / {visibleFields.length}`. In presentation mode, this was redundant with the in-canvas question badge and created vertical clutter.
2. **Misplaced Circular `X` Exit Button:**
   A dark circular `X` close button appeared floating near top center under `1 / 2`, disrupting slide aesthetics and violating executive control ergonomics.

### 3.2 Conditional Suppression of Top-Center Pill
The fixed top-center slide numbering pill is conditionally suppressed during presentation mode:

```tsx
{/* Top Slide Numbering Pill: Suppressed in Presentation Modes */}
{(activeForm.settings?.showSlideNumbers ?? true) && effectiveLayoutMode === 'standard' && (
  <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card/90 backdrop-blur-md border border-border/40 text-[11px] font-mono font-semibold text-foreground shadow-xs pointer-events-none select-none">
    <span>{currentStep + 1} / {visibleFields.length}</span>
  </div>
)}
```

### 3.3 Executive Controls Cluster Consolidation (`fixed top-3 right-4 sm:top-4 sm:right-6 z-40`)
All persistent overlay controls are strictly anchored to the top-right viewport corner:

```tsx
{/* Floating Top-Right Executive Controls Cluster */}
<div className="fixed top-3 right-4 sm:top-4 sm:right-6 z-40 flex items-center gap-2 select-none">
  {/* Session Timer */}
  {timeLeftSeconds !== null && (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm sm:text-base font-mono font-bold tracking-tight shadow-sm transition-all duration-300 ${
        isUrgent
          ? isMinuteRollover
            ? 'timer-urgency-glow animate-timer-minute-pulse'
            : 'timer-urgency-glow'
          : 'bg-card/90 backdrop-blur-md border-border/70 text-foreground'
      }`}
    >
      <Clock className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isUrgent ? 'text-destructive animate-pulse' : 'text-primary'}`} />
      <span>{formatTimerDisplay(timeLeftSeconds)}</span>
    </div>
  )}

  {/* Fullscreen Toggle Button */}
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggleFullscreen}
        className="h-9 w-9 bg-card/90 backdrop-blur-md border border-border/70 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-all shadow-sm cursor-pointer"
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}</TooltipContent>
  </Tooltip>

  {/* Executive Exit Action (When onClose is provided or in standalone runner view) */}
  {(onClose || isPreviewRoute) && (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              navigate('/');
            }
          }}
          className="h-9 w-9 bg-card/90 backdrop-blur-md border border-border/70 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all shadow-sm cursor-pointer"
          aria-label="Exit Assessment"
        >
          <X className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Exit Assessment</TooltipContent>
    </Tooltip>
  )}
</div>
```

---

## 4. Left Margin Equilibrium Architecture

### 4.1 Audit of Cumulative Padding Inset
An analysis of the layout hierarchy revealed three additive padding layers:

1. **Root Runner Container:** `p-3 sm:p-6 lg:p-8` (or `p-4 sm:p-8` in fullscreen) = $32\text{px}$ left padding on desktop.
2. **Presentation Outer Wrapper:** `px-4 sm:px-6 lg:px-8` = $32\text{px}$ left padding on desktop.
3. **Presentation Slide Canvas:** `px-4 sm:px-8 lg:px-12` = $48\text{px}$ left padding on desktop.

**Cumulative Desktop Left Padding:** $32\text{px} + 32\text{px} + 48\text{px} = 112\text{px}$.

This created excessive dead space between the viewport edge and the question prompt, causing the title to look pushed inward, as illustrated by the user's leftward arrows.

### 4.2 Streamlined Single-Tier Margin Hierarchy
To restore optical equilibrium, internal padding is de-layered:

```text
[Viewport Left Edge]
   | (24px - 32px Outer Root Padding)
   v
[Widescreen Grid Left Margin]
   |--> Elevated Question Tag [Question 1 of 2]
   |--> Hairline Accent Line (64px)
   |--> Question Title (What does HTML stand for?*)
   |--> Subtitle / Description
```

### 4.3 Concrete JSX Implementation
1. **Root Runner Container (`FormRunner.tsx`):**
   ```tsx
   <div
     className={`min-h-screen w-full transition-colors duration-300 font-sans theme-${activeThemeId} ${
       isFullscreen
         ? 'fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 lg:p-8'
         : 'p-3 sm:p-6 lg:p-8'
     }`}
     style={{ ... }}
   >
   ```

2. **Presentation Outer Wrapper (`FormRunner.tsx`):**
   ```tsx
   <div
     className={`mx-auto ${
       effectiveLayoutMode !== 'standard'
         ? 'space-y-0 w-full max-w-7xl xl:max-w-[92rem] px-2 sm:px-4 lg:px-6'
         : ...
     }`}
   >
   ```

3. **Presentation Slide Canvas (`FormRunner.tsx`):**
   ```tsx
   <div
     key={currentField.id}
     className={`w-full min-h-[82vh] lg:min-h-[85vh] xl:min-h-[88vh] flex flex-col justify-center bg-transparent border-0 rounded-none shadow-none px-0 sm:px-2 lg:px-4 py-2 sm:py-4 relative ${activeTransitionClass}`}
   >
   ```

### 4.4 Resulting Optical Equilibrium
- The cumulative desktop left inset is reduced from $112\text{px}$ down to $48\text{px} - 56\text{px}$, naturally expanding the slide canvas toward the left viewport margin.
- The question title aligns with the presentation grid margin while preserving protective gutters across mobile, tablet, and widescreen viewports.
- The right-hand answer column gains additional horizontal breathing room, preventing multiline option wrapping and maintaining optical balance.

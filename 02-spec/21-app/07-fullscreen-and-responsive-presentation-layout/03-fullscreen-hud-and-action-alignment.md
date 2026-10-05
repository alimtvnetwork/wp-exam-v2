# Specification 07: Component Spec 03 — Fullscreen Presentation HUD, Options Column Downward Push & Responsive Parity

**Status:** Approved  
**Priority:** High  
**Parent Epic:** Fullscreen & Responsive Presentation Layout (`66-fullscreen-and-responsive-presentation-layout`)  
**Specification Document:** `02-spec/21-app/07-fullscreen-and-responsive-presentation-layout/03-fullscreen-hud-and-action-alignment.md`  
**Target Systems:**  
- `src/components/runner/FormRunner.tsx` (Presentation Layout, 2-Column Grid, Downward Action Alignment)  
- `src/lib/presentation-layout.ts` (Fluid 5-Breakpoint Dynamic Typography)  
- `src/components/runner/FocusQuizRunner.tsx` (Wide Container Alignment, Elevated Badges & Standardized Options)  

---

## 1. Options Column Flex Distribution & Downward Push Architecture

### 1.1 Root Problem Analysis: The Intrinsic Track Collapse & Stranded Action Bar
In `src/components/runner/FormRunner.tsx`, the 2-column split presentation layout (`presentation_split`, `split_right`, `split_left`) was previously configured on the parent grid with:
```tsx
/* Problematic Configuration */
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full min-h-[60vh] lg:min-h-[68vh] xl:min-h-[72vh] my-auto">
```

When CSS Grid uses `items-center`, each grid column element defaults to `align-self: center`. Consequently:
1. **Lack of Track Stretching:** The right-hand column collapses vertically to its own content's intrinsic height rather than stretching to fill the full height of the parent grid track.
2. **Zero Headroom for `mt-auto`:** The navigation footer container inside the right column utilizes `mt-auto`. Because the column container's height matches its children's intrinsic height (`h-full` without `align-self: stretch`), `margin-top: auto` resolves to `0px`.
3. **Stranded Floating Actions:** The navigation controls ("Previous", "Auto Fill", "Next Question") float awkwardly immediately beneath the last multiple-choice option card, creating an unsightly gap between the action buttons and the bottom of the presentation slide container.

### 1.2 Grid Viewport Expansion Specification
The parent grid container must expand to fill the immersive presentation canvas across high-definition displays:

```tsx
/* Modernized 2-Column Presentation Grid */
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 w-full min-h-[70vh] lg:min-h-[78vh] xl:min-h-[82vh] my-auto">
```

Key Architectural Metrics:
- **Minimum Viewport Target:** `min-h-[70vh]` on mobile/tablet, expanding to `lg:min-h-[78vh]` on desktops and `xl:min-h-[82vh]` on widescreen monitors.
- **Vertical Centering in Slide Canvas:** `my-auto` ensures the entire grid remains optically balanced within the presentation slide envelope.

### 1.3 Asymmetric Self-Alignment Architecture
To satisfy both optical equilibrium for question prompts and anchored downward alignment for interactive response controls, the grid columns employ deliberate asymmetric self-alignment:

```tsx
{/* Left Column: Vertically Centered Question Title & Context */}
<div
  className={`w-full space-y-6 flex flex-col justify-center lg:self-center ${
    effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-2' : 'lg:order-1'
  }`}
>
  {...}
</div>

{/* Right Column: Full-Height Stretched Column with Downward Push */}
<div
  className={`w-full h-full lg:self-stretch flex flex-col justify-between pt-4 sm:pt-6 lg:pt-10 xl:pt-14 ${
    effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
  }`}
>
  {/* Upper Container: Interactive Fields */}
  <div className="w-full space-y-6 relative">
    <div className="space-y-4">
      {renderFieldInput(...)}
    </div>
  </div>

  {/* Lower Container: Anchored Slide Floor Navigation */}
  <div className="mt-auto pt-6 sm:pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
    {...}
  </div>
</div>
```

### 1.4 Downward Offset Tuning
The top padding of the right column is upgraded from `pt-2 lg:pt-6 xl:pt-8` to `pt-4 sm:pt-6 lg:pt-10 xl:pt-14`:
- **Desktop Separation:** On desktop (`lg` and `xl`), this creates a deliberate optical offset that avoids flush-top crowding against the question prompt.
- **Optical Equilibrium:** The question prompt sits commanding in the left center, while the right column cascades downward, leading the eye naturally through choices into the anchored action bar.

---

## 2. Anchored Action Bar Baseline Specification

### 2.1 The Anchored Action Bar Architecture
The action bar at the foot of the options column must feel permanent, grounded, and structurally anchored to the slide floor, rather than drifting as an afterthought.

```tsx
<div className="mt-auto pt-6 sm:pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
  {/* Left: Previous Navigation Button */}
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

  {/* Right: Action Button Cluster */}
  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTestAutoFill}
          className="h-9 px-3 text-xs font-mono font-medium rounded-lg border-border bg-card/80 text-foreground/80 hover:text-foreground hover:bg-accent/60 hover:border-primary/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Auto Fill</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Fill valid answer and advance</TooltipContent>
    </Tooltip>

    <Button
      type="button"
      size="default"
      onClick={handleNextStep}
      className={`h-11 px-6 sm:px-7 rounded-xl font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 flex-1 sm:flex-initial ${
        isRiseupTheme
          ? 'bg-[#F7F1E6] text-[#0A0A14] hover:bg-[#F7F1E6]/90 border border-[#F7F1E6]/50 active:ring-2 active:ring-[#E8C547]'
          : activeThemeId === 'purple' || activeThemeId === 'letterly'
          ? 'bg-[#5C45FD] text-white hover:bg-[#5C45FD]/90 shadow-indigo-500/25 border border-[#818CF8]/40'
          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
      }`}
    >
      <span>{isLastVisibleStep ? 'Submit Assessment' : 'Next Question'}</span>
      <kbd className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-[11px] font-mono font-bold rounded border shadow-2xs ${
        isRiseupTheme
          ? 'bg-[#0A0A14]/15 text-[#0A0A14] border-[#0A0A14]/20'
          : 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
      }`}>
        ↵
      </kbd>
    </Button>
  </div>
</div>
```

### 2.2 Hairline Baseline Divider Token
- **Token:** `border-t border-border/20`
- **Purpose:** Establishes a subtle hairline visual datum separating the interactive choice field from the execution controls.
- **Spacing:** `pt-6 sm:pt-8` padding pushes the buttons cleanly below the hairline, giving the footer an intentional, grounded footprint.

### 2.3 Flex Stretch vs Absolute Positioning Comparison
| Attribute | Absolute Positioning (`absolute bottom-0`) | Flex Stretch (`lg:self-stretch h-full mt-auto`) |
| :--- | :--- | :--- |
| **Overflow Safety** | High risk of colliding with multi-line options or long text | 100% collision-free; flex box naturally flows and extends height |
| **Responsiveness** | Requires brittle manual padding-bottom compensation | Automatically accommodates varying option counts dynamically |
| **Cross-Device Parity**| Prone to overlapping on smaller vertical viewports | Gracefully shifts downwards when content exceeds viewport bounds |
| **DOM Hierarchy** | Breaks natural tab sequence and accessibility focus tree | Preserves natural DOM focus flow from options to actions |

---

## 3. Fluid Responsive Typography & Breakpoints Matrix

### 3.1 Motivation & Multi-Breakpoint Scaling
In `src/lib/presentation-layout.ts`, the `getDynamicTitleTypographyClass` function determines the headline typography scale based on character count. Previously, it lacked granular intermediate breakpoints (`md`, `xl`, `2xl`), resulting in sudden text-size jumps on standard 13-inch and 15-inch laptop displays.

### 3.2 5-Breakpoint Responsive Matrix Specification
The updated implementation provides continuous fluid scaling across 5 explicit breakpoints: `base (<640px)`, `sm (640px+)`, `md (768px+)`, `lg (1024px+)`, `xl (1280px+)`, and `2xl (1536px+)`.

```ts
/**
 * Computes dynamic Tailwind typography classes based on question title length
 * to ensure optimal visual balance across slide presentation viewports.
 * Enforces smooth 5-breakpoint responsiveness and authoritative line-heights.
 */
export function getDynamicTitleTypographyClass(title?: string): string {
  const charCount = title?.trim().length || 0;

  if (charCount > 80) {
    return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl leading-snug font-bold';
  }

  if (charCount > 45) {
    return 'text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl leading-[1.2] font-bold';
  }

  return 'text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl leading-[1.12] font-black';
}
```

### 3.3 Typography Token Calibration Matrix
| Title Character Count | Tier Name | Base (`<640px`) | `sm` (`≥640px`) | `md` (`≥768px`) | `lg` (`≥1024px`) | `xl` (`≥1280px`) | `2xl` (`≥1536px`) | Line Height | Font Weight |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **> 80 Chars** | Long Prompt / Paragraph | `text-xl` (20px) | `text-2xl` (24px) | `text-3xl` (30px) | `text-4xl` (36px) | `text-4xl` (36px) | `text-4xl` (36px) | `leading-snug` (1.375) | `font-bold` (700) |
| **46–80 Chars** | Medium Prompt / Standard | `text-2xl` (24px) | `text-3xl` (30px) | `text-4xl` (36px) | `text-4xl` (36px) | `text-5xl` (48px) | `text-5xl` (48px) | `leading-[1.2]` (1.2) | `font-bold` (700) |
| **1–45 Chars** | Short / Executive Title | `text-3xl` (30px) | `text-4xl` (36px) | `text-5xl` (48px) | `text-5xl` (48px) | `text-6xl` (60px) | `text-7xl` (72px) | `leading-[1.12]` (1.12)| `font-black` (900) |

### 3.4 Presentation Slide Typography Rules
1. **No Orphan Words:** With `leading-[1.12]` and `leading-[1.2]`, line wrapping is compact and avoids single-word dangle.
2. **Riseup Theme Word Highlighting:** In accordance with Rule 9, technical keywords and acronyms highlighted via `renderHighlightedQuestionTitle` retain `font-extrabold` and cream `#F7F1E6` color, never gold.
3. **No Mixed Polarity or Explicit True:** Typography helpers must evaluate boolean conditions implicitly without `== true`.

---

## 4. FocusQuizRunner Parity Specification

### 4.1 Unified Container Geometry (`max-w-4xl`)
In `src/components/runner/FocusQuizRunner.tsx`, stages previously used mixed widths ranging from `max-w-md` to `max-w-3xl`. All executive focus stages are upgraded to a unified, balanced container width hierarchy: `max-w-2xl lg:max-w-3xl xl:max-w-4xl`.

```tsx
/* Standardized Header */
<header
  className="sticky top-0 z-20 backdrop-blur-md bg-opacity-90"
  style={{ borderBottom: `1px solid ${theme.colors.cardBorder}40` }}
>
  <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
    {...}
  </div>
</header>

/* Standardized Main Stage */
<main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
  {...}
</main>

/* Standardized Question Header */
<div className="space-y-3 text-center max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full">
  {...}
</div>

/* Standardized Sticky Bottom Footer */
<footer
  className="sticky bottom-0 z-20 backdrop-blur-md bg-opacity-95 p-4 border-t"
  style={{ borderColor: theme.colors.cardBorder }}
>
  <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto space-y-2">
    {...}
  </div>
</footer>
```

### 4.2 Elevated Highlighted Question Step Badge
In `FocusQuizRunner.tsx`, the current step counter is elevated from a plain monochrome badge into an elevated highlighted pill matching `FormRunner`:

```tsx
<div className="flex items-center justify-between gap-2 pb-1">
  <div className="flex items-center gap-2">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/80 backdrop-blur-md text-xs font-mono font-semibold shadow-xs">
      <span className="text-primary font-bold">
        Question {currentQuestionIndex + 1}
      </span>
      <span className="text-muted-foreground/60">•</span>
      <span className="text-muted-foreground">
        {totalQuestions} Total
      </span>
    </div>
    {isRandomized && (
      <Badge variant="secondary" className="text-xs font-sans rounded-full">
        🔀 Shuffled
      </Badge>
    )}
  </div>
  ...
</div>
```

### 4.3 Standardized Option Badges (`w-9 h-9 sm:w-10 sm:h-10 rounded-xl`)
Option cards in `FocusQuizRunner.tsx` must align with the executive option badge token established in `FormRunner.tsx`:
- **Legacy Size:** `w-8 h-8 rounded-lg`
- **Modernized Standard:** `w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono font-bold text-xs sm:text-sm shrink-0 flex items-center justify-center`
- **Constant Alphanumeric Identity:** Strictly renders `String.fromCharCode(65 + optIdx)`. Never replaced with checkmarks on selection.
- **Single Right-Side Indicator:** Selection is confirmed via a single `CheckCircle2` icon on the right margin (`#E8C547` for Riseup theme, emerald `#10B981` for other themes).

```tsx
<span
  className={`option-badge w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center font-mono text-xs sm:text-sm font-bold shrink-0 transition-all duration-200 ${
    isSelected
      ? isRiseupTheme
        ? 'bg-[#E8C547] text-[#0A0A14] border-[#E8C547]'
        : 'bg-primary text-primary-foreground border-primary'
      : 'bg-muted/70 text-muted-foreground border-border/70 group-hover:border-foreground/30'
  }`}
>
  {String.fromCharCode(65 + optIdx)}
</span>
```

---

## 5. Architectural Compliance & Validation Checklist

- [x] Strict relative Git paths used across all specification links and references.
- [x] Zero absolute filesystem paths or `file:///` URIs.
- [x] Implicit boolean evaluations enforced (`isRiseupTheme`, `isSelected`).
- [x] No mixed polarity conditions.
- [x] 2px hairline chrome accent indicator (`h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md`) maintained for Riseup theme.
- [x] Complete parity across `FormRunner.tsx` and `FocusQuizRunner.tsx`.

# Component Specification: Riseup Yellow Palette, Title Acronym Highlighting, Flush Top Progress & Tactile Button Animations

## 1. Executive Summary & Architectural Motivation

In presentation slide mode and standard candidate quiz sessions within `src/components/runner/FormRunner.tsx`, visual hierarchy and user feedback drive candidate engagement, reading comprehension, and interface responsiveness.

This component specification details four critical frontend enhancements for Task 78:
1. **Riseup Theme Color Palette Standards:** Rigorous alignment of the Riseup theme in `src/styles/theme.css` and `src/lib/themes.ts`. In accordance with design standards, the background is deep midnight navy (`#0A0A14`), surfaces and cards are dark charcoal violet (`#141424`), and question titles render in crisp pure white (`#FFFFFF`) with vivid gold/yellow (`#E8C547`) highlights. This eliminates dull low-contrast text and elevates readability.
2. **Automatic Acronym & All-Caps Highlighting Engine (`renderHighlightedQuestionTitle`):** An intelligent typography parsing function that automatically scans question titles with regular expressions to detect all-caps technical acronyms (e.g. `HTML`, `CSS`, `PHP`, `SQL`, `API`, `SEO`, `JSON`, `WYSIWYG`, `REST`, `GraphQL`, `DOM`, `URL`) or explicit `highlightWord` parameters. In the Riseup theme, detected terms are highlighted in vivid gold (`#E8C547`) with `font-extrabold`, while base title text renders in pure white (`#FFFFFF`). In other themes, terms highlight in the theme's active primary color (`text-primary font-extrabold`) while base text uses `text-foreground`.
3. **Flush Top Edge Progress Line:** Modernizing the session progress indicator from an inset relative card bar to a full-bleed, window-flush progress bar container positioned at `fixed top-0 left-0 right-0 w-full h-1 z-50 pointer-events-none`. This gives candidate assessments a sleek, continuous horizon indicator across presentation slides and standard viewports with zero padding above it.
4. **Button CSS3 Hover Micro-Interactions & Spring Physics:** Elevating interactive ergonomics across navigation actions (`Previous`, `⚡ Auto Fill` / `⚡ Test Fill & Next`, and `Next Question` / `Submit Assessment`). Tactile classes (`transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]`) impart physical weight and spring responsiveness while maintaining strict disabled state guards.

---

## 2. Target Files & Architectural Responsibilities

| Relative File Path | Target Component / Area | Scope & Responsibility |
|--------------------|-------------------------|------------------------|
| `src/styles/theme.css` | `.theme-riseup-asia`, `[data-theme="riseup-asia"]`, `[data-theme="riseup"]` | Clarify Riseup CSS variables, ensure title contrast variables (`--wp-exam-title-text: #FFFFFF`, `--wp-exam-highlight: #E8C547`), and declare reusable button micro-interaction utility tokens. |
| `src/lib/themes.ts` | `riseup-asia` Theme Definition | Ensure metadata, `highlightWord: '#E8C547'`, `textPrimary: '#FFF1D6'`, and contrast standards are preserved and documented across the catalog. |
| `src/components/runner/FormRunner.tsx` | Presentation Slide & Quiz Card Renderers | Implement `renderHighlightedQuestionTitle`, mount the fixed flush top edge `<Progress />` container, and apply tactile micro-interaction classes to `Previous`, `Auto Fill`, and `Next Question` buttons. |

---

## 3. Riseup Theme Color Palette Standards

### 3.1 Design System Color Tokens

The Riseup theme (`riseup-asia` / alias `riseup`) represents the signature brand theme. Under RULE 9, the brand name is written as one word (`Riseup`). Its primary surface is dark navy paired with cream controls, while gold is strictly an active indicator mark and title highlight:

| Token Name | Hex / CSS Variable Value | Architectural Usage & Role |
|------------|--------------------------|----------------------------|
| Canvas Background | `#0A0A14` (`--wp-exam-bg`) | Global runner background, deep midnight navy providing infinite depth |
| Card Surface | `#141424` (`--wp-exam-card`) | Elevated quiz cards, presentation content backdrops, and HUD container |
| Card Border | `#2A2A44` (`--wp-exam-card-border`) | Crisp subtle boundaries separating card surfaces from canvas |
| Primary Control Fill | `#F7F1E6` (`--wp-exam-primary`) | Primary call-to-action buttons (Submit, Next) with `#0A0A14` text |
| Question Title Text | `#FFFFFF` (`text-white`) | Pure white foreground for high-authority reading contrast against `#0A0A14` |
| Title Acronym Highlight | `#E8C547` (`--wp-exam-highlight`) | Vivid gold/yellow mark for technical acronyms and key keywords |
| Choice Active Border | `#E8C547` (`--wp-exam-card-active-border`) | Selected radio/checkbox indicator border |
| Choice Active Background | `rgba(232, 197, 71, 0.12)` | Subtle luminous gold wash behind selected options |
| Secondary Text | `#94A3B8` (`--wp-exam-text-secondary`) | Explanations, subheadings, and metadata timestamps |
| Progress Bar Horizon | `#E8C547` (Indicator) / `#1C1C30` (Track) | Continuous horizontal progress line anchored to window top edge |

### 3.2 Contrast Verification

- **White on Dark Navy (`#FFFFFF` on `#0A0A14`):** Contrast ratio > 18:1 (exceeds WCAG AAA standard of 7:1 for normal and large text).
- **Gold Highlight on Dark Navy (`#E8C547` on `#0A0A14`):** Contrast ratio > 11.2:1 (exceeds WCAG AAA standard).
- **Gold Highlight next to White (`#E8C547` adjacent to `#FFFFFF`):** High chromatic differentiation, immediately drawing the candidate's eye to acronyms and core subject matter without causing visual vibration.

---

## 4. Automatic Acronym & All-Caps Highlighting Engine

### 4.1 Functional Specification

Questions in technical assessments frequently contain uppercase industry acronyms and technologies such as `HTML`, `CSS`, `PHP`, `SQL`, `API`, `SEO`, `JSON`, `WYSIWYG`, `REST`, `GraphQL`, `DOM`, `URL`, `HTTP`, `HTTPS`, `DNS`, `UI`, `UX`, and `IDE`.

The `renderHighlightedQuestionTitle` function parses any raw title string into an array of React nodes:
1. It splits the title using a boundary regex that captures words in all-caps of 2 or more characters (`/\b([A-Z0-9]{2,})\b/g`) or an explicit `highlightWord` provided by the question configuration.
2. If an acronym token or explicit highlight word matches, it wraps the token in a styled `<span>` with prominent emphasis.
3. If the active theme is Riseup, the highlight uses vivid yellow/gold (`text-[#E8C547] font-extrabold`) while normal non-highlighted text renders in pure white (`text-white`).
4. If another theme is active (e.g. Clean Wide, Purple, Dracula), the highlight uses `text-primary font-extrabold` while normal text uses standard `text-foreground`.

### 4.2 Algorithm & Implementation Blueprint

```tsx
/**
 * Renders question title with automatic technical acronym and explicit keyword highlighting.
 * In Riseup theme, acronyms are rendered in gold (#E8C547) and base text in pure white (#FFFFFF).
 * In other themes, acronyms use theme primary and base text uses standard foreground.
 */
export const renderHighlightedQuestionTitle = (
  title: string,
  highlightWord?: string,
  isRiseupTheme?: boolean
): React.ReactNode => {
  if (!title) {
    return null;
  }

  // Common technical acronyms whitelist or pattern for 2+ uppercase letters/digits
  // Pattern captures all-caps tokens of 2+ characters
  const acronymPattern = '\\b[A-Z0-9]{2,}\\b';
  
  let combinedRegex: RegExp;
  if (highlightWord && highlightWord.trim()) {
    const escapedWord = highlightWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    combinedRegex = new RegExp(`(${escapedWord}|${acronymPattern})`, 'g');
  } else {
    combinedRegex = new RegExp(`(${acronymPattern})`, 'g');
  }

  const parts = title.split(combinedRegex);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    // Determine if this part matches the highlight criteria
    const isAcronym = /^[A-Z0-9]{2,}$/.test(part);
    const isExplicitMatch = Boolean(
      highlightWord && highlightWord.trim() && part.toLowerCase() === highlightWord.trim().toLowerCase()
    );

    const isMatch = isAcronym || isExplicitMatch;

    if (isMatch) {
      const highlightClasses = isRiseupTheme
        ? 'text-[#E8C547] font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
        : 'text-primary font-extrabold';

      return (
        <span key={`hl-${index}`} className={highlightClasses}>
          {part}
        </span>
      );
    }

    const textClasses = isRiseupTheme ? 'text-white' : 'text-foreground';

    return (
      <span key={`txt-${index}`} className={textClasses}>
        {part}
      </span>
    );
  });
};
```

### 4.3 Component Integration Call Sites

#### Presentation Slide Mode (2-Column Grid)
```tsx
// src/components/runner/FormRunner.tsx (Presentation Slide Mode)
<h2 className="font-heading font-bold text-5xl lg:text-6xl leading-tight tracking-tight">
  {renderHighlightedQuestionTitle(currentField.label, currentField.highlightWord, isRiseupTheme)}
  {isCurrentFieldRequired ? (
    <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
  ) : null}
</h2>
```

#### Standard Quiz Card Mode
```tsx
// src/components/runner/FormRunner.tsx (Quiz Card Mode)
<CardTitle className="font-sans font-medium text-lg sm:text-xl tracking-normal leading-relaxed">
  {renderHighlightedQuestionTitle(currentField.label, currentField.highlightWord, isRiseupTheme)}
  {isCurrentFieldRequired ? (
    <span className="text-destructive text-red-500 font-bold ml-1.5" title="Required">*</span>
  ) : null}
</CardTitle>
```

---

## 5. Flush Top Edge Progress Line Architecture

### 5.1 Pre-Refactor vs Post-Refactor Layout Comparison

#### Defect State (Pre-Refactor)
In prior implementations, the progress bar was either embedded within the padded outer runner container or nested inside the slide `<Card>`:
```tsx
// Pre-refactor: Trapped inside padded card with inset margins
<Card className="w-full min-h-[calc(100dvh-3rem)] ... p-4 sm:p-8 lg:p-12 space-y-8 relative">
  <div className="absolute top-0 left-0 w-full h-1">
    <Progress value={progressPercent} className="h-full bg-secondary rounded-none" />
  </div>
  ...
</Card>
```
*Consequences:* The bar did not touch the top edge of the browser viewport; outer wrapper paddings (`p-3 sm:p-6` or `p-4 sm:p-8`) created a disorienting gap between the browser chrome and the progress line.

#### Target State (Post-Refactor)
The progress bar container is elevated to a viewport-fixed horizon element rendered at the very root level of `FormRunner.tsx`:
```tsx
// Post-refactor: Flush to window top edge across all view modes
<div
  className="fixed top-0 left-0 right-0 w-full h-1 z-50 pointer-events-none overflow-hidden"
  aria-hidden="true"
>
  <Progress
    value={progressPercent}
    className={`h-full w-full rounded-none border-none bg-transparent ${
      isRiseupTheme
        ? '[&>div]:bg-[#E8C547] [&>div]:shadow-[0_0_8px_rgba(232,197,71,0.6)]'
        : '[&>div]:bg-primary'
    } [&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out`}
  />
</div>
```

### 5.2 Attributes & Responsive Behavior

- **`fixed top-0 left-0 right-0 w-full`:** Glues the progress bar seamlessly to the top of the browser screen with 0 pixel gap.
- **`h-1` (4px height):** Hairline proportion that remains visible without obstructing view or consuming content real estate.
- **`z-50`:** Above normal card layers and slug navigation, while safely below fullscreen modals or elevated HUD dropdowns (`z-[10000]`).
- **`pointer-events-none`:** Ensures the bar is completely click-transparent, never intercepting mouse clicks, touch gestures, or keyboard focus from buttons situated near the top.
- **Riseup Gold Glow:** In Riseup theme, the progress bar indicator uses `[&>div]:bg-[#E8C547]` with a subtle neon luminous glow `shadow-[0_0_8px_rgba(232,197,71,0.6)]`.

---

## 6. Button CSS3 Hover Micro-Interactions & Spring Physics

### 6.1 Micro-Interaction Physics Specification

To transform navigation from flat, unresponsive controls into tactile, polished interactions, all primary action buttons receive CSS3 physics transforms:

| State | CSS Classes | Physical Effect |
|-------|-------------|-----------------|
| Base | `transition-all duration-300 ease-out` | Smooth interpolation for transform, shadow, and color transitions |
| Hover | `hover:-translate-y-0.5 hover:shadow-lg` | Lifts button upward by 2px (`-0.5` Tailwind unit) with expanded soft shadow |
| Active (Mouse Down) | `active:translate-y-0 active:scale-[0.98]` | Compresses button slightly down to origin with 98% scale for tactile click feel |
| Disabled | `disabled:pointer-events-none disabled:opacity-50 disabled:transform-none disabled:shadow-none` | Freezes transforms and prevents hover elevation when button is inactive |

### 6.2 Button Call-Site Enhancements

#### 1. "Previous" Step Button
```tsx
<Button
  type="button"
  variant="outline"
  size="sm"
  disabled={currentStep === 0}
  onClick={handlePreviousStep}
  className="text-xs sm:text-sm h-9 px-4 font-medium border-border hover:bg-accent cursor-pointer rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:transform-none disabled:shadow-none"
>
  Previous
</Button>
```

#### 2. "Auto Fill" / "⚡ Test Fill & Next" Button
```tsx
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={handleTestAutoFill}
  className="text-xs h-9 px-3.5 font-bold rounded-xl border border-border bg-card text-foreground hover:bg-accent cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
  title="Fill valid answer and advance immediately"
>
  ⚡ Auto Fill
</Button>
```

#### 3. "Next Question" / "Submit Assessment" Button
```tsx
<Button
  type="button"
  size="sm"
  onClick={handleNextStep}
  className="text-xs sm:text-sm h-9 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center gap-1.5 rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
>
  <span>{isLastVisibleStep ? 'Submit Assessment' : 'Next Question'}</span>
  <span className="text-[10px] opacity-75 font-mono">Enter ↵</span>
</Button>
```

---

## 7. Verification Criteria & Visual Quality Gates

1. **Relative Path Hygiene:** Zero instances of `file:///` or absolute filesystem paths in specs, plans, and source files.
2. **Boolean Strictness:** Implicit positive boolean evaluations (`if (isRiseupTheme)`) with no explicit true checks and no mixed polarities.
3. **Contrast Verification:** In Riseup theme, question titles render in `#FFFFFF` with acronyms in `#E8C547` against `#0A0A14`.
4. **Acronym Detection:** Words like `HTML`, `CSS`, `PHP`, `SQL`, `API`, `SEO`, `JSON`, and `WYSIWYG` automatically highlight without manual tagging.
5. **Flush Progress Positioning:** Progress bar adheres strictly to `top-0 left-0 right-0` with 0 padding above it.
6. **Button Micro-Interactions:** Previous, Auto Fill, and Next Question buttons exhibit tactile `-translate-y-0.5` lift on hover and `scale-[0.98]` compression on click.

# Specification 79: Component 03 — Presentation Layout Alignment & Candidate Removal

**Parent Spec:** `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/01-overview.md`  
**Target Files:**  
- `src/components/runner/FormRunner.tsx`  
- `src/components/runner/FocusQuizRunner.tsx`  

---

## 1. Problem Definition: Presentation Alignment & Unwanted Candidate Section

In the current 2-column split presentation mode (`FormRunner.tsx`), two layout issues exist:
1. **Vertical Imbalance:** The question title sits at the very top edge of the column (`items-start pt-2`), while the right column contains multiple option cards. When the title has only 1–2 lines, the left side appears stranded near the ceiling while the right side dominates.
   The user explicitly requested:
   > "When we are in the presentation mode for the quizzes, try to take the title in the middle so that it looks nice, and the right-hand side should go a little bit down, but not too much, a little bit so that it remains as it is."
2. **Unwanted Candidate Response Section:**
   The user requested:
   > "Do not use the candidates response section. I asked you to remove this several times."
   Any leftover headers, metadata tags, or `Candidate Response` titles must be strictly eradicated.

---

## 2. Presentation Grid Layout Architecture

### 2.1 Two-Column Grid Setup

In `FormRunner.tsx` (around line 2642), update the presentation layout container:

```tsx
/* 2-Column Presentation Grid (50% / 50% on Desktop, Vertically Centered Left Column) */
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center min-h-[55vh] lg:min-h-[62vh] pt-2">
  {/* Left Column: Vertically Centered Question & Editorial Guidance */}
  <div className={`w-full space-y-6 flex flex-col justify-center ${
    effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-2' : 'lg:order-1'
  }`}>
    <h2 className={`font-heading font-bold ${dynamicTitleTypography} text-foreground tracking-tight`}>
      {renderHighlightedQuestionTitle(
        currentField.label,
        (currentField as FormField & { highlightWord?: string }).highlightWord,
        isRiseupTheme
      )}
      {isCurrentFieldRequired && (
        <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
      )}
    </h2>

    <div className="space-y-3">
      {hasFieldSubtitle && (
        <p className="font-sans text-base sm:text-lg text-foreground/80 leading-relaxed font-normal">
          {currentField.subtitle}
        </p>
      )}
      {hasFieldDescription && (
        <div className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line pl-0 py-0.5">
          {currentField.description}
        </div>
      )}
    </div>

    {hasPlaceholderHint && (
      <div className="pt-2">
        <Popover>
          {/* Popover trigger */}
        </Popover>
      </div>
    )}
  </div>

  {/* Right Column: Answer Options Nudged Slightly Downward for Perfect Balance */}
  <div className={`w-full space-y-6 flex flex-col justify-center pt-4 lg:pt-8 ${
    effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
  }`}>
    <div className="w-full space-y-6 relative">
      {/* Interactive Field Input */}
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

      {/* Navigation Footer */}
      ...
    </div>
  </div>
</div>
```

---

## 3. Strict Elimination of "Candidate Response"

1. **Rule:** No element with text `Candidate Response` or uppercase `CANDIDATE RESPONSE` may exist above the option choices or within the runner columns.
2. The interactive hint popover (`Need a Hint?`) remains attached to the question context block on the left side, keeping the right-hand options area completely unboxed and free from clutter.
3. Verify across both `FormRunner.tsx` and `FocusQuizRunner.tsx` that no `Candidate Response` string is rendered in user-facing JSX.

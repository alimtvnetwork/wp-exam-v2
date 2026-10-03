# 77 Presentation Slide Box Blending & Header Removal — Architecture Specification

**Version:** 1.0.0  
**Updated:** 2026-10-04  
**AI Confidence:** Verified  
**Ambiguity:** None  
**Module:** `02-spec/21-app/77-presentation-slide-blend-and-draggable`  
**Parent Plan:** [.ai-memory/plans/77-presentation-slide-blend-and-draggable.md](../../../.ai-memory/plans/77-presentation-slide-blend-and-draggable.md)  
**Implementation Subtask:** [.ai-memory/plans/subtasks/77-presentation-slide-blend-and-draggable/01-slide-box-blend-and-header.md](../../../.ai-memory/plans/subtasks/77-presentation-slide-blend-and-draggable/01-slide-box-blend-and-header.md)

---

## Keywords

`presentation-slide` · `zero-box-immersion` · `unboxed-canvas` · `header-removal` · `box-blending` · `guidance-debox` · `right-column-blend` · `divider-elimination` · `floating-hud` · `fluid-typography`

---

## Scoring & Compliance Matrix

| Criterion | Target Status | Architectural Implementation Strategy |
|-----------|---------------|----------------------------------------|
| **Lossless User Requirements Ingestion** | ✅ Pass | Exact verbatim capture of user request with 4-part architectural translation |
| **Zero-Box Slide Immersion** | ✅ Pass | Full-bleed unboxed slide canvas eliminating `bg-card`, `border border-border`, `rounded-3xl`, `shadow-md` |
| **Top Header Bar Suppression** | ✅ Pass | Conditional suppression of header bar (`Sample Sequential Knowledge Quiz`, copy link, dev action pill) in `presentation_split` |
| **Right-Hand Column Card Blending** | ✅ Pass | Complete unboxing of nested right column card: removing `bg-card`, `border border-border/80`, `rounded-2xl`, `shadow-lg`, `backdrop-blur-md` |
| **Inner Dividing Line Elimination** | ✅ Pass | Removal of horizontal separating borders (`border-b border-border/80`, `border-t border-border`) |
| **Guidance Pill De-Boxing** | ✅ Pass | Transforming boxed container (`bg-muted/60 border border-border rounded-xl shadow-2xs`) into fluid inline guidance typography |
| **Standard Mode Isolation** | ✅ Pass | Zero regression or visual alteration in `standard` quiz view or default form runner mode |

---

## 1. User Requirements (Lossless Ingestion)

### 1.1 Verbatim Source Request
```text
Here you do see that the boxes are not gone, especially when you are in the section why there is a box in the right-hand side. I ask you to blend all these boxes. And do not need to have this above section as well. Okay, take it out. I've been saying this several times, and make sure the controller is movable, draggable anywhere. Is it clear?
```

### 1.2 Core UX Deficiencies Identified
1. **Double-Box / Nested Card Artifacts:**  
   The presentation mode currently renders an outer container styled as a card (`bg-card border border-border rounded-3xl shadow-md`), and then nests another elevated card on the right-hand side (`bg-card border border-border/80 rounded-2xl shadow-lg backdrop-blur-md`). This nested framing contradicts presentation slide design principles where content breathes across the canvas.
2. **Above Section Clutter (Top Header Bar):**  
   The top navigation and dev actions bar (`Sample Sequential Knowledge Quiz`, project selector, copy link button, and auto/debug/exit buttons) persists above the slide, consuming ~64px of prime viewport vertical height and breaking cinematic immersion.
3. **Inner Box Lines & Compartmentalization:**  
   Horizontal rule lines (`border-b border-border/80` under the top meta bar, `border-b border-border/80` under Candidate Response, and `border-t border-border` above footer navigation) segment the presentation slide into rigid micro-boxes.
4. **Boxed Candidate Guidance Pill:**  
   The candidate guidance hint in the left column is wrapped in an explicit bordered pill container (`bg-muted/60 border border-border rounded-xl shadow-2xs`), looking like an alert dialog rather than harmonious slide body copy.

---

## 2. Zero-Box Slide Immersion Architecture

### 2.1 The Architectural Paradigm: Boxed Card vs. Immersive Slide
Traditional form runners encapsulate questions within bounded, rounded `Card` components with drop shadows (`shadow-md`) to visually lift forms from a desktop background. In contrast, modern keynote presentation systems (such as Slide Decks, Apple Keynotes, and pitch-grade presentations) employ **Zero-Box Immersion**:
- The slide surface is congruent with the ambient viewport background (`themeVars` / `currentTheme.colors.background`).
- Content floats cleanly on the canvas without visual container bounding lines, card fills, or rectangular drop shadows.
- Visual hierarchy is established via **spatial typography**, fluid grid columns, and high-contrast interactive answer tiles, not container boxes.

### 2.2 Container Transformation (`src/components/runner/FormRunner.tsx`)
In `src/components/runner/FormRunner.tsx`, the presentation canvas container (line ~2114) must be stripped of all card and box styling classes:

```tsx
// BEFORE (Boxed Presentation Container):
<div
  key={currentField.id}
  className="w-full min-h-[calc(100dvh-5.5rem)] bg-card border border-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md space-y-8 animate-card-entrance relative overflow-hidden"
>

// AFTER (Zero-Box Immersive Slide Canvas):
<div
  key={currentField.id}
  className="w-full min-h-[calc(100dvh-2.5rem)] p-4 sm:p-8 lg:p-12 space-y-8 animate-card-entrance relative"
>
```

#### Eliminated Classes:
- `bg-card`: Removed. Slide canvas uses seamless ambient background.
- `border border-border`: Removed. No rectangular bounding line around the slide.
- `rounded-3xl`: Removed. Full-bleed immersion without arbitrary card rounding.
- `shadow-md`: Removed. No card elevation shadow.
- `overflow-hidden`: Replaced or scoped to prevent unwanted clipping of focus rings or tooltips while preserving layout containment.

---

## 3. Top Header Bar Suppression Architecture

### 3.1 Targeted Suppression Logic
In `src/components/runner/FormRunner.tsx` (lines ~1729–1860), the top bar contains:
1. Project Selector dropdown / Assessment title display (`activeForm.title`).
2. Copy project link button.
3. Grouped action pill: `Auto`, `Debug`, `Exit`.

When `effectiveLayoutMode === 'presentation_split'`, presentation mode requires the entire top bar to be hidden. The presentation view already provides:
- Fullscreen toggle in the slide meta bar.
- Floating Presenter HUD (`PresenterHUD`) for theme switching, layout switching, and timer display.
- Built-in slide navigation (`Previous`, `Auto Fill`, `Next Question` / `Submit Assessment`).

### 3.2 Implementation Mechanism
The top header bar wrapper must be conditionally rendered only when the layout is NOT presentation split:

```tsx
{/* Streamlined Single-Line Project Selector, Slug & Actions Bar — Suppressed in presentation split mode */}
{effectiveLayoutMode !== 'presentation_split' ? (
  <div
    className="p-2.5 sm:px-4 border border-border bg-card text-card-foreground rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
  >
    {/* Project selector, title, copy link, dev action pill */}
  </div>
) : null}
```

#### Layout Spacing Optimization
At line ~1727, the outer container applies `space-y-5 mx-auto`. When the header bar is suppressed in `presentation_split`, we ensure no unwanted dead top margin or layout shift occurs:

```tsx
<div className={`mx-auto ${
  effectiveLayoutMode === 'presentation_split'
    ? 'w-full max-w-[1440px] px-2 sm:px-6'
    : activeThemeId === 'clean-wide'
    ? 'space-y-5 max-w-7xl'
    : 'space-y-5 max-w-6xl'
}`}>
```

---

## 4. Right-Hand Column & Guidance Box Blending

### 4.1 Right-Hand Column Unboxing
In `src/components/runner/FormRunner.tsx` (lines ~2246–2314), the right-hand column currently wraps interactive inputs inside a heavy card:
`bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden backdrop-blur-md`.

This container creates the prominent "box on the right-hand side" identified in the user brief. It must be unboxed completely:

```tsx
// BEFORE (Boxed Right-Hand Answer Card):
<div className={`w-full space-y-5 ${effectiveAnswerPlacement === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
  <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden backdrop-blur-md">
    ...
  </div>
</div>

// AFTER (Seamless Unboxed Right-Hand Canvas Column):
<div className={`w-full space-y-6 ${effectiveAnswerPlacement === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
  <div className="w-full space-y-6 relative">
    ...
  </div>
</div>
```

#### Eliminated Outer Properties:
- `bg-card`: Removed.
- `border border-border/80`: Removed.
- `rounded-2xl`: Removed.
- `shadow-lg`: Removed.
- `backdrop-blur-md`: Removed.

### 4.2 Inner Dividing Line Elimination
Within both the presentation slide canvas and the right-hand column, multiple horizontal lines currently partition the space:

1. **Top Meta Bar Divider (line ~2176):**
   - Current: `<div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border/80">`
   - Remediated: `<div className="flex items-center justify-between text-xs text-muted-foreground pb-2">` (removes `border-b border-border/80`).
2. **Candidate Response Header Divider (line ~2248):**
   - Current: `<div className="flex items-center justify-between pb-3.5 border-b border-border/80">`
   - Remediated: `<div className="flex items-center justify-between pb-1">` (removes `border-b border-border/80`).
3. **Footer Navigation Divider (line ~2261):**
   - Current: `<div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">`
   - Remediated: `<div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">` (removes `border-t border-border`).

### 4.3 Direct Slide Canvas Interaction
With the outer right card removed:
- Interactive multiple choice options, single choice options, and boolean choice tiles (rendered via `renderFieldInput(..., true)`) sit directly on the seamless slide canvas.
- Staggered entry animations (`slide-up-anim`, `stagger-1`, etc.) and hover transformations (`translate-x-2`, `presentation-option-card`) animate crisply without clipping inside a container card.
- The action buttons (`Previous`, `⚡ Auto Fill`, `Next Question` / `Submit Assessment`) form a clean floating action dock beneath the options.

### 4.4 Guidance Box Blending (Left Column)
In `src/components/runner/FormRunner.tsx` (lines ~2230–2242), the candidate guidance is wrapped inside a bounded pill box:

```tsx
// BEFORE (Boxed Guidance Pill):
{hasPlaceholderHint ? (
  <div className="pt-2">
    <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm font-sans font-medium shadow-2xs">
      <span className="p-1 rounded-md bg-accent text-accent-foreground shrink-0">
        <Lightbulb className="w-4 h-4 text-primary" />
      </span>
      <div className="space-y-0.5">
        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block">Candidate Guidance</span>
        <span className="font-sans leading-normal">{currentField.placeholder}</span>
      </div>
    </div>
  </div>
) : null}

// AFTER (Blended Seamless Guidance Typography):
{hasPlaceholderHint ? (
  <div className="pt-2 flex items-start gap-2.5 text-muted-foreground">
    <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
      <Lightbulb className="w-4 h-4 text-primary" />
    </span>
    <div className="space-y-0.5 text-xs sm:text-sm">
      <span className="font-semibold text-xs text-foreground/80 uppercase tracking-wider block">Candidate Guidance</span>
      <span className="font-sans leading-relaxed text-foreground/90">{currentField.placeholder}</span>
    </div>
  </div>
) : null}
```

#### Eliminated Guidance Box Properties:
- `p-3 rounded-xl bg-muted/60 border border-border shadow-2xs`: Removed.
- Sits as clean typographic marginalia directly under question description without an enclosing box.

---

## 5. Architectural Blueprint & DOM Hierarchy

```
+----------------------------------------------------------------------------------------------------+
| Ambient Runner Viewport Canvas (themeVars, bg-background, textPrimary)                              |
|                                                                                                    |
|  [ TOP HEADER BAR SUPPRESSED WHEN effectiveLayoutMode === 'presentation_split' ]                   |
|                                                                                                    |
|  Slide Canvas Area (w-full max-w-[1440px] px-2 sm:px-6 mx-auto):                                   |
|  +----------------------------------------------------------------------------------------------+  |
|  | [Hairline Progress Indicator: absolute top-0 left-0 w-full h-1 bg-secondary]                 |  |
|  |                                                                                              |  |
|  | Meta Bar (No divider line): [Clock Timer] [Fullscreen Toggle Button]                         |  |
|  |                                                                                              |  |
|  | 2-Column Presentation Grid (grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14):                      |  |
|  |                                                                                              |  |
|  | Left Column (Prompt & Guidance):          Right Column (Candidate Response - UNBOXED):       |  |
|  |  * Question Heading (text-5xl lg:text-6xl)  * Header: [Sparkles] Candidate Response         |  |
|  |  * Subtitle (text-base lg:text-lg)          (No bottom dividing line)                        |  |
|  |  * Description Quote (border-l-2 pl-3.5)                                                     |  |
|  |  * Blended Guidance (No box/border):        * Interactive Options Direct on Canvas:          |  |
|  |    [Lightbulb Icon]                         [A] Option 1 (Tile with hover translate)        |  |
|  |    "Candidate Guidance: ..."                [B] Option 2 (Tile with hover translate)        |  |
|  |                                             [C] Option 3 (Tile with hover translate)        |  |
|  |                                                                                              |  |
|  |                                             * Navigation Footer (No top dividing line):      |  |
|  |                                               [Previous]      [⚡ Auto Fill] [Next Question] |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  Floating Elements (Unconstrained Viewport):                                                       |
|   - Question Sequence Trigger (fixed bottom-6 left-6, when closed)                                  |
|   - Draggable Presenter HUD (fixed bottom-8 right-8, drag enabled)                                  |
+----------------------------------------------------------------------------------------------------+
```

---

## 6. Component Responsibility & Line Impact Mapping

| File Relative Path | Target Line Range | Architectural Modification |
|--------------------|-------------------|----------------------------|
| `src/components/runner/FormRunner.tsx` | Lines ~1727–1731 | Add responsive width & margin class logic for `presentation_split` without outer spacing collapse |
| `src/components/runner/FormRunner.tsx` | Lines ~1729–1861 | Wrap top header bar in `{effectiveLayoutMode !== 'presentation_split' ? ( ... ) : null}` |
| `src/components/runner/FormRunner.tsx` | Lines ~2112–2116 | Remove `bg-card border border-border rounded-3xl shadow-md` from presentation slide canvas container |
| `src/components/runner/FormRunner.tsx` | Line ~2176 | Remove `border-b border-border/80` from slide top meta bar |
| `src/components/runner/FormRunner.tsx` | Lines ~2230–2242 | Debox Candidate Guidance pill: remove `p-3 rounded-xl bg-muted/60 border border-border shadow-2xs` |
| `src/components/runner/FormRunner.tsx` | Lines ~2246–2248 | Remove `bg-card border border-border/80 rounded-2xl shadow-lg backdrop-blur-md` and `border-b border-border/80` from right-hand response column |
| `src/components/runner/FormRunner.tsx` | Line ~2261 | Remove `border-t border-border` from navigation footer |

---

## 7. Verifiable Acceptance Criteria

| ID | Verification Target | Expected Behavioral Outcome |
|----|---------------------|-----------------------------|
| **CRIT-77-01** | `effectiveLayoutMode === 'presentation_split'` | Top header bar (project selector, assessment title, copy link, dev action pill) is NOT rendered in DOM |
| **CRIT-77-02** | `effectiveLayoutMode === 'standard'` | Top header bar is fully rendered with all original actions intact |
| **CRIT-77-03** | Presentation slide container DOM | Does NOT contain `bg-card`, `border border-border`, `rounded-3xl`, or `shadow-md` |
| **CRIT-77-04** | Right-hand response container DOM | Does NOT contain `bg-card`, `border-border/80`, `rounded-2xl`, `shadow-lg`, or `backdrop-blur-md` |
| **CRIT-77-05** | Slide meta bar & column dividers | Does NOT contain separating border lines `border-b border-border/80` or `border-t border-border` |
| **CRIT-77-06** | Candidate guidance element | Styled as fluid inline typography without bordered pill card container |
| **CRIT-77-07** | Option tile interactivity | Options hover smoothly, select cleanly, and advance steps without layout breaking |

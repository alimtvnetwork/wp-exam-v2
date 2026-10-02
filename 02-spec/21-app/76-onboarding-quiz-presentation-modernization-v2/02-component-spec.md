# Component Specification: White Presentation Slide Mode, CSS3 Motion & High-Contrast Themes

- **Feature**: 76-onboarding-quiz-presentation-modernization-v2
- **Specification**: 02-component-spec.md
- **Status**: Final / Execution-Ready
- **Parent Plan**: [.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md](../../../.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md)
- **Architecture Spec**: [02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/01-architecture-spec.md](01-architecture-spec.md)
- **Subtask Plan**: [.ai-memory/plans/subtasks/76-onboarding-quiz-presentation-modernization-v2/02-presentation-themes.md](../../../.ai-memory/plans/subtasks/76-onboarding-quiz-presentation-modernization-v2/02-presentation-themes.md)
- **Reference Architecture**: White Presentation Slide Architecture (`white-presentation-v1`)

---

## 1. Executive Summary & Design System Rationale

The Onboarding Quiz candidate runner provides assessment, knowledge validation, and interactive decision tree workflows. During user audits, several visual hierarchy and contrast defects were identified across preview and live candidate execution modes:

1. **Presentation Slide Canvas Degradation**: In previous revisions, opening the question navigation sidebar rendered an in-flow `<aside>` element that compressed the central presentation canvas, degrading the two-column slide layout into a squished, cramped view. Candidate instruction descriptions were abruptly cut off with `line-clamp-2`, and placeholder guidance lacked dedicated callout visual hierarchy.
2. **Unconstrained Video Question Sizing**: Video-based questions rendered unconstrained viewports that pushed candidate response options below the fold. Two-choice branching paths lacked clear, prominent action buttons beneath the video player for conditional routing.
3. **Absence of Hardware-Accelerated Motion**: Choice options rendered as static buttons without entry staging or tactile feedback, falling short of presentation-grade UX standards which mandate soft upward slide reveals (`slideInUpSoft`), staggered entry delays, and smooth horizontal glide hover dynamics.
4. **Purple Theme Contrast Defects**: The purple theme exhibited "purple-under-purple" mudiness where kicker badges (`bg-primary/10 text-primary`) and outline buttons (`bg-background` / `bg-card` with dark `#2C2852` borders) blended invisibly into the `#0F0E1E` canvas.
5. **Riseup Theme Saturated Yellow & Cognitive Fatigue**: Saturated amber gold `#FFAD01` was overused as fills across buttons, progress bars, and sidebar rows, causing cognitive fatigue ("brain fog"). Text was painted yellow-on-yellow, and the brand was inconsistently named ("Rise Up Asia" vs "Riseup").
6. **VS Code Navy Gold Preset Integration**: The high-contrast dark slate/navy theme with crisp white text and discrete gold choice indicators (`vscode-navy-gold`) must be cleanly selectable and prominent across runner controls.

This component specification establishes the exact architectural geometry, CSS3 motion keyframes, component props, and color contrast tokens required to implement White Presentation slide mode and modernized theme palettes.

---

## 2. File Ownership & Boundary Isolation

### 2.1 Owned Target Files (Subtask 02)

| File Path | Primary Responsibility |
|---|---|
| `src/components/runner/FormRunner.tsx` | Presentation split grid layout, floating HUD sidebar overlay, constrained video player container, 2-choice route buttons, hint callout chip, and response card animation classes. |
| `src/styles/theme.css` | CSS3 keyframe animations (`slideInUpSoft`), stagger delay utility classes, floating HUD backdrop blur styles, and theme contrast class overrides. |
| `src/lib/themes.ts` | Multi-theme catalog, HSL variables for Purple, Riseup, and VS Code Navy Gold presets, and alias dictionary mappings. |
| `src/themes/theme-definitions.ts` | Theme definitions catalog synchronized with `themes.ts` for consistent preview and runner theming. |

### 2.2 Boundary Files (Owned by Subtask 01 / Worker 01)

| File Path | Subtask 01 Scope |
|---|---|
| `src/components/forms/FormBuilder.tsx` | FormBuilder header chrome, 2px dynamic accent edge, section card shadows, Config dropdown consolidation. |
| `src/components/admin/wp-admin-sidebar.tsx` | Admin navigation, Onboarding Quiz logo integration, and brand mark. |
| `src/components/forms/field-palette.tsx` | Right rail icon dock tabs and unclipped component grid. |
| `src/components/forms/sortable-field-card.tsx` | Question card header toolbars and action icons (Save, Duplicate, Delete, Preview, Reorder). |
| `src/assets/onboarding-quiz-logo.svg` | Vector brand mark asset. |

---

## 3. White Presentation Slide Mode Specification (`FormRunner.tsx`)

Modeled after high-authority slide deck design systems, the presentation layout transforms the question view into a full-screen, high-focus slide deck.

### 3.1 50/50 Two-Column Grid Geometry

- **Container Constraint**: `w-full max-w-[98vw] px-2 sm:px-4 mx-auto min-h-[calc(100dvh-5.5rem)]`
- **Grid Layout**: `grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start`
- **Breakpoint Dynamics**:
  - `lg` and above: Strict 50% Left Column (Question & Context) and 50% Right Column (Elevated Candidate Response Card). Column ordering respects `effectiveAnswerPlacement` (`lg:order-1` / `lg:order-2`).
  - Below `lg`: Natural vertical stacking (Question block on top, Response Card directly below) with zero horizontal overflow.

### 3.2 Left Column: Question & Rich Context

The left column delivers clear, uncluttered question presentation without artificial content truncation:

```tsx
<div className={`w-full space-y-5 ${effectiveAnswerPlacement === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
  {/* Question Eyebrow / Kicker */}
  <div className="flex items-center gap-2 flex-wrap">
    <Badge
      variant="outline"
      className="px-3 py-1 rounded-full text-xs font-mono font-semibold border-border text-foreground bg-muted/60 dark:bg-white/10 dark:text-white dark:border-indigo-400/40 tracking-wide shadow-2xs"
    >
      {currentField.kickerText || `Question #${currentStep + 1} • ${currentField.group || activeForm.title}`}
    </Badge>
    {currentField.difficulty && (
      <Badge
        variant="outline"
        className={`px-2.5 py-0.5 rounded-full text-[11px] uppercase font-mono font-semibold border ${
          currentField.difficulty === 'hard'
            ? 'border-rose-500/40 text-rose-500 bg-rose-500/10'
            : currentField.difficulty === 'medium'
            ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
            : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
        }`}
      >
        {currentField.difficulty} ({currentField.customPointsOverride ?? (currentField.difficulty === 'hard' ? 20 : currentField.difficulty === 'medium' ? 10 : 5)} pt)
      </Badge>
    )}
  </div>

  {/* 5XL Bold Headline */}
  <h2 className="font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight tracking-tight">
    {currentField.label}
    {isCurrentFieldRequired && (
      <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
    )}
  </h2>

  {/* Full Subtitle & Description (Zero line-clamp truncation) */}
  <div className="space-y-3 pt-1">
    {hasFieldSubtitle && (
      <p className="font-sans text-base lg:text-lg text-foreground/85 leading-relaxed font-normal">
        {currentField.subtitle}
      </p>
    )}
    {hasFieldDescription && (
      <div className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line border-l-2 border-border pl-3.5 py-0.5">
        {currentField.description}
      </div>
    )}
  </div>

  {/* Candidate Guidance / Lightbulb Hint Chip */}
  {hasPlaceholderHint && (
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
  )}
</div>
```

### 3.3 Right Column: Elevated Candidate Response Card

The candidate response column encapsulates the active field controls in a high-elevation surface:

```tsx
<div className={`w-full space-y-5 ${effectiveAnswerPlacement === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
  <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden backdrop-blur-md">
    {/* Card Header Indicator */}
    <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-foreground" />
        <span>Candidate Response</span>
      </span>
      <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
        Question {currentStep + 1} of {visibleFields.length}
      </span>
    </div>

    {/* Interactive Field Input with Hardware-Accelerated Options */}
    <div className="space-y-4">
      {renderFieldInput(currentField, answers[currentField.id], (val) => handleAnswerChange(currentField.id, val), true)}
    </div>

    {/* Advance & Navigation Footer */}
    <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentStep === 0}
        onClick={handlePreviousStep}
        className="text-xs h-9 px-4 font-medium border-border hover:bg-accent cursor-pointer w-full sm:w-auto rounded-xl shadow-xs"
      >
        Previous
      </Button>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestAutoFill}
              className="text-xs h-9 px-3 font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
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
            className="text-xs h-9 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center gap-1.5 flex-1 sm:flex-initial justify-center rounded-xl"
          >
            <span>Submit Assessment</span>
            <span className="text-[10px] opacity-75 font-mono">Enter ↵</span>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleNextStep}
            className="text-xs h-9 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center gap-1.5 flex-1 sm:flex-initial justify-center rounded-xl"
          >
            <span>Next Question</span>
            <span className="text-[10px] opacity-75 font-mono">Enter ↵</span>
          </Button>
        )}
      </div>
    </div>
  </div>
</div>
```

---

## 4. CSS3 Motion Keyframes & Tactile Interactions (`theme.css`)

Pure CSS hardware-accelerated animations provide smooth slide transitions without layout thrashing.

### 4.1 Keyframe Definitions

```css
/* Smooth Upward Soft Slide for Presentation Cards */
@keyframes slideInUpSoft {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Base Presentation Option Slide-In Class */
.slide-up-anim {
  animation: slideInUpSoft 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: transform, opacity;
}

/* Staggered Delay Intervals for Option Cards */
.stagger-1 { animation-delay: 0.06s; }
.stagger-2 { animation-delay: 0.12s; }
.stagger-3 { animation-delay: 0.18s; }
.stagger-4 { animation-delay: 0.24s; }
.stagger-5 { animation-delay: 0.30s; }
.stagger-6 { animation-delay: 0.36s; }

/* Tactile Option Card Hover Dynamics (~180ms - 200ms) */
.presentation-option-card {
  transition: transform 180ms cubic-bezier(0.2, 0, 0, 1),
              box-shadow 180ms ease,
              border-color 180ms ease,
              background-color 180ms ease;
  will-change: transform;
}

.presentation-option-card:hover {
  transform: translate3d(8px, 0, 0);
}

/* Accessibility: Respect Reduced Motion Preferences */
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

### 4.2 Application in `renderFieldInput` (`FormRunner.tsx`)

When `isPresentationSlide` evaluates to true:
- Option elements in `multiple_choice`, `single_choice`, and `boolean` attach:
  - Base animation: `.slide-up-anim`
  - Sequential delay: `.stagger-1` through `.stagger-6` based on option index
  - Tactile hover: `.presentation-option-card` triggering `hover:translate-x-2` (8px glide)
- Active selection adds high-contrast ring, primary surface highlight, and checkmark pill indicator.

---

## 5. Video Presentation Layout & Dual-Choice Conditional Routing

Questions incorporating video instructional media require spatial boundary constraints and inline conditional route buttons.

### 5.1 Constrained Video Player Dimensions

- **Height Cap**: `max-h-[380px]` ensures the player does not dominate the vertical fold.
- **Centering & Sizing**: `max-w-3xl w-full mx-auto`
- **Aspect Ratio**: `aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80`
- **Player Component**: `RunnerVideoPlayer` component handles YouTube, Vimeo, MP4 direct video, and HTML5 video rendering with playback controls.

```tsx
<div className="space-y-4">
  <div className="max-w-3xl mx-auto w-full max-h-[380px] aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80">
    <RunnerVideoPlayer
      videoUrl={currentField.videoUrl}
      videoCaption={currentField.videoCaption}
      title={currentField.label}
      bare
    />
  </div>
  {currentField.videoCaption && (
    <p className="text-xs text-muted-foreground italic text-center px-1 flex items-center justify-center gap-1.5">
      <span>ℹ️</span>
      <span>{currentField.videoCaption}</span>
    </p>
  )}
</div>
```

### 5.2 Dual-Choice Route Controls

When video questions feature binary choices or conditional pathway branching:

```tsx
{dualChoices && (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-xl mx-auto w-full">
    {dualChoices.map((choice, cIdx) => {
      const isSelected = answers[currentField.id] === choice ||
        (Array.isArray(answers[currentField.id]) && (answers[currentField.id] as string[]).includes(choice)) ||
        (typeof answers[currentField.id] === 'string' && (answers[currentField.id] as string).toLowerCase() === choice.toLowerCase());

      return (
        <Button
          key={choice}
          type="button"
          size="lg"
          variant={isSelected ? 'default' : 'outline'}
          onClick={() => handleAnswerChange(currentField.id, choice)}
          className={`flex-1 w-full sm:w-auto h-12 px-6 rounded-xl font-heading font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:translate-x-1 cursor-pointer ${
            isSelected
              ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
              : 'border-border bg-card text-foreground hover:bg-muted/70 hover:border-foreground/30'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
            isSelected
              ? 'bg-primary-foreground text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : String.fromCharCode(65 + cIdx)}
          </span>
          <span className="truncate">{choice}</span>
          {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto sm:ml-1 text-primary-foreground shrink-0" />}
        </Button>
      );
    })}
  </div>
)}
```

- Selecting a choice updates form state via `handleAnswerChange(currentField.id, choice)`.
- Branching engine resolves conditional targets via `getNextStepIndex(...)`, dynamically advancing candidates along personalized instructional tracks.

---

## 6. Canvas & Fullscreen: Floating HUD Sequence Aside

### 6.1 Defect Elimination: Unsquished Presentation Grid

In previous revisions, opening the question sequence sidebar rendered an in-flow `<aside>` element (`w-64 sm:w-72 shrink-0`) directly inside the horizontal flex container. In presentation split mode, this squished the 50/50 two-column grid into a cramped, illegible 35/35 view.

### 6.2 Floating HUD Overlay Architecture

In `presentation_split` mode:
1. **Main Canvas Remains 100% Full-Width**: `<main className="w-full">` always occupies the full presentation canvas width without compression.
2. **Sidebar as Floating HUD Overlay**:
   - When opened in `presentation_split` mode, the sidebar renders as a floating drawer overlay:
     ```tsx
     {isSidebarVisible && effectiveLayoutMode === 'presentation_split' ? (
       <>
         {/* Subtle Backdrop to prevent interaction bleed */}
         <div
           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
           onClick={() => setIsSidebarVisible(false)}
         />
         {/* Floating HUD Drawer Card */}
         <aside className="fixed top-16 left-4 z-50 w-72 sm:w-80 max-h-[calc(100dvh-5rem)] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
           <div className="space-y-4 flex flex-col h-full max-h-[calc(100dvh-7rem)] overflow-hidden">
             {renderSidebarInner()}
           </div>
         </aside>
       </>
     ) : null}
     ```
3. **Floating HUD Trigger Pill**:
   - When collapsed, a discrete floating HUD button remains pinned at the bottom-left:
     ```tsx
     {!isSidebarVisible && effectiveLayoutMode === 'presentation_split' && (
       <div className="fixed bottom-6 left-6 z-30">
         <Tooltip>
           <TooltipTrigger asChild>
             <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={() => setIsSidebarVisible(true)}
               className="h-10 px-4 text-xs font-sans font-medium gap-2 border-border bg-card/90 backdrop-blur-md text-foreground hover:bg-accent rounded-full shadow-lg transition-all cursor-pointer hover:scale-105"
             >
               <Menu className="w-4 h-4 text-foreground" />
               <span>Questions ({currentStep + 1}/{visibleFields.length})</span>
             </Button>
           </TooltipTrigger>
           <TooltipContent>Show question sequence</TooltipContent>
         </Tooltip>
       </div>
     )}
     ```
4. **Standard Layout Compatibility**:
   - When `effectiveLayoutMode !== 'presentation_split'`, the sidebar continues rendering in-flow as a standard desktop layout side panel (`w-full lg:w-72 xl:w-80 shrink-0`).

---

## 7. Modernized Theme Contrast & Palettes

### 7.1 Purple Theme Modernization

#### Problem Analysis
On the Purple theme (`#0F0E1E`), outline buttons using `bg-background` or dark `bg-card` with border `#2C2852` blended invisibly into the canvas. Kicker badges rendered violet text on a violet wash (`border-primary/40 text-primary bg-primary/10`), dropping below WCAG AA contrast thresholds.

#### Corrective Palette Rules:
- **Canvas**: Deep violet canvas `#0F0E1E` (`hsl(246 35% 9%)`).
- **Foreground / Text Primary**: Pure white `#FFFFFF` (`hsl(0 0% 100%)`) delivering > 15:1 contrast against `#0F0E1E`.
- **Card Surface**: Lifted violet surface `#18162F` (`hsl(245 36% 14%)`).
- **Elevated Button Surface**: Elevated button surface `#262348` (`hsl(246 32% 19%)`).
- **Luminous Borders**: `#3A3568` (`hsl(246 34% 28%)`) providing distinct visual boundary definitions.
- **Badge Chips**: Kicker badges render crisp white text (`#FFFFFF`) on elevated violet pill (`bg-secondary/90` or `rgba(92, 69, 253, 0.25)`) with luminous violet border.

```css
.theme-purple,
[data-theme="purple"],
.theme-letterly,
[data-theme="letterly"] {
  --primary: 248 98% 63%; /* Vivid Electric Indigo #5C45FD */
  --primary-foreground: 0 0% 100%;
  --background: 246 35% 9%; /* Deep Violet Canvas #0F0E1E */
  --foreground: 0 0% 100%; /* Pure White */
  --card: 245 36% 14%; /* Lifted Surface #18162F */
  --card-foreground: 0 0% 100%;
  --secondary: 246 32% 19%; /* Elevated Button Surface #262348 */
  --secondary-foreground: 0 0% 100%;
  --muted: 246 32% 19%;
  --muted-foreground: 240 15% 75%;
  --accent: 246 32% 24%;
  --accent-foreground: 0 0% 100%;
  --border: 246 34% 28%; /* Distinct Luminous Border #3A3568 */
  --input: 246 34% 28%;
  --ring: 248 98% 63%;
  --wp-exam-card-border: #3A3568;
  --wp-exam-badge-bg: rgba(92, 69, 253, 0.25);
}
```

### 7.2 Riseup Theme Modernization

#### Problem Analysis
The Riseup theme previously over-saturated the UI with raw amber gold `#FFAD01`, applying yellow fills to buttons, sidebar selection, and progress bars. The brand name was also inconsistently spelled ("Rise Up Asia" vs "Riseup").

#### Corrective Palette Rules:
1. **Single-Word Branding**: Enforce `Riseup` (one word) across all visible strings, dropdown menus, tooltips, and preset labels (`Riseup`, `Riseup (Gold & Navy)`).
2. **Elimination of Blinding Yellow Text**:
   - Primary controls use soft warm cream `#F7F1E6` (`--primary: 40 43% 92%`).
   - Body and option text uses readable cream `#FFF1D6` (`--foreground: 40 100% 92%`).
   - Zero yellow-on-yellow text rendering.
3. **Gold Restricted Strictly as Highlighter**:
   - Gold (`#E8C547` / `47 78% 59%`) is strictly reserved for:
     - Active focus rings (`ring-[#E8C547]`)
     - Option card left-accent indicator mark (`border-l-4 border-l-[#E8C547]`)
     - Radio/checkbox checkmark and active selection pill
   - Gold is NEVER used as a button background fill, navbar fill, sequence row background, or progress bar fill.
   - Progress bar uses muted slate `#3A3A55`.

```css
.theme-riseup-asia,
[data-theme="riseup-asia"],
[data-theme="riseup"] {
  --primary: 40 43% 92%; /* Cream #F7F1E6 */
  --primary-foreground: 240 33% 6%; /* Deep Navy Text */
  --background: 240 33% 6%; /* Midnight Navy #0A0A14 */
  --foreground: 40 100% 92%; /* Soft Cream #FFF1D6 */
  --card: 240 28% 11%; /* Lifted Navy Card #141424 */
  --card-foreground: 40 100% 92%;
  --secondary: 246 32% 19%;
  --secondary-foreground: 0 0% 100%;
  --border: 240 24% 21%; /* Neutral Navy Border #2A2A44 */
  --ring: 47 78% 59%; /* Gold Accent #E8C547 strictly for ring */
  --wp-exam-highlight: #E8C547;
  --wp-exam-progress-bar: #3A3A55;
}
```

### 7.3 VS Code Navy Gold Theme Preset (`vscode-navy-gold`)

#### Specification: Preset `vscode-navy-gold`
High-contrast technical dark theme providing clean obsidian slate surfaces with crisp white text and a single gold choice mark:
- **Preset ID**: `vscode-navy-gold`
- **Display Name**: `Navy Gold`
- **Description**: `Dark VS Code background with cream controls and gold highlight`
- **Background**: `#0D1117` (GitHub Dark / Obsidian Navy Canvas)
- **Card Surface**: `#161B22`
- **Border**: `#30363D`
- **Foreground / Text Primary**: `#F0F6FC` (Crisp platinum white)
- **Primary Control**: `#F7F1E6` (Cream primary button) with text `#0D1117`
- **Highlight**: `#E8C547` (Gold choice indicator mark only)
- **Runner Menu Integration**: Fully selectable from the runner palette dropdown menu and via query parameter `?theme=vscode-navy-gold`.

```css
.theme-vscode-navy-gold,
[data-theme="vscode-navy-gold"] {
  --primary: 40 43% 92%; /* Cream #F7F1E6 */
  --primary-foreground: 220 26% 7%; /* Obsidian Navy Text */
  --background: 220 26% 7%; /* Obsidian Navy #0D1117 */
  --foreground: 210 56% 96%; /* Crisp White #F0F6FC */
  --card: 220 20% 11%; /* Dark Slate Card #161B22 */
  --card-foreground: 210 56% 96%;
  --secondary: 215 14% 19%;
  --secondary-foreground: 210 56% 96%;
  --muted: 215 14% 19%;
  --muted-foreground: 215 14% 65%;
  --accent: 215 14% 24%;
  --accent-foreground: 210 56% 96%;
  --border: 215 14% 21%; /* Crisp Slate Border #30363D */
  --input: 215 14% 21%;
  --ring: 47 78% 59%; /* Gold Accent #E8C547 strictly for active mark */
  --wp-exam-card-border: #30363D;
  --wp-exam-highlight: #E8C547;
}
```

---

## 8. Exact Component Line Range Mapping

| Component / File | Line Range | Architectural Purpose |
|---|---|---|
| `src/components/runner/FormRunner.tsx` | Lines 776–825 | Layout mode resolution (`resolveQuestionLayoutMode`), sidebar visibility state, and video/subtitle existence predicates. |
| `src/components/runner/FormRunner.tsx` | Lines 2103–2161 | Floating HUD sidebar overlay with backdrop dismissal (`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs`) and bottom-left trigger pill button. |
| `src/components/runner/FormRunner.tsx` | Lines 2163–2350 | White Presentation 50/50 two-column slide deck layout, 5xl typography, subtitle, description, `<Lightbulb />` guidance chip, and elevated response card. |
| `src/components/runner/FormRunner.tsx` | Lines 2171–2222 | Constrained video player container (`max-h-[380px] max-w-3xl`) and dual-choice route buttons with conditional branching execution. |
| `src/components/runner/FormRunner.tsx` | Lines 2834–2900 | `RunnerVideoPlayer` component declaration, embed parser, and video container rendering. |
| `src/components/runner/FormRunner.tsx` | Lines 3290–3700 | Option card styling with `.slide-up-anim`, `.stagger-1..6`, and `.presentation-option-card` hover glide in `renderFieldInput`. |
| `src/styles/theme.css` | Lines 20–67 | Keyframe `@keyframes slideInUpSoft`, `.slide-up-anim`, `.stagger-1..6`, and `.presentation-option-card` hover translation with reduced-motion support. |
| `src/styles/theme.css` | Lines 116–140 | Riseup theme CSS class variables with cream primary `#F7F1E6` and gold `#E8C547` highlight. |
| `src/styles/theme.css` | Lines 180–210 | Purple theme CSS class variables with pure white `#FFFFFF` on deep violet `#0F0E1E` and `#3A3568` luminous borders. |
| `src/styles/theme.css` | Lines 236–260 | Navy Gold preset CSS variables with `#0D1117` background, `#161B22` card, and `#30363D` border. |
| `src/lib/themes.ts` | Lines 157–235 | Theme definitions for `riseup-asia` (one-word `Riseup`), `purple`, and `dracula`. |
| `src/lib/themes.ts` | Lines 321–355 | Theme definition for `vscode-navy-gold`. |
| `src/lib/themes.ts` | Lines 404–424 | Theme aliases mapping `letterly`, `riseup`, `bright-gold`, and `navy-gold`. |
| `src/themes/theme-definitions.ts` | Lines 30–73, 118–150, 207–226 | Synchronized theme catalog presets and alias mappings. |

---

## 9. Verifiable Acceptance Criteria

- [ ] **50/50 Presentation Split Mode Layout**:
  - [ ] Question headline renders at `text-4xl lg:text-5xl` with bold weight and high-contrast foreground color.
  - [ ] Both subtitle AND description render in full without `line-clamp-2` or text clipping.
  - [ ] Candidate guidance chip renders with `<Lightbulb />` icon when `placeholder` is populated; absent when empty.
  - [ ] Main presentation canvas `<main className="w-full">` occupies 100% width without squishing or in-flow side compression.
- [ ] **CSS3 Motion & Hover Glide**:
  - [ ] `@keyframes slideInUpSoft` smoothly slides in candidate response options from 20px offset to 0.
  - [ ] Sequential options receive staggered delay classes (`stagger-1` through `stagger-6`).
  - [ ] Hovering over option cards produces smooth ~180ms horizontal glide (`transform: translate3d(8px, 0, 0)`).
  - [ ] Media query `@media (prefers-reduced-motion: reduce)` zeroes all durations and removes transforms.
- [ ] **Constrained Video Presentation & Branching**:
  - [ ] Video player container is strictly constrained to `max-h-[380px]` with `max-w-3xl` centering.
  - [ ] Binary-choice questions render dual route buttons directly beneath the video player.
  - [ ] Selecting a route button updates state and navigates via `getNextStepIndex(...)`.
- [ ] **Floating HUD Sequence Aside**:
  - [ ] Opening question sequence in presentation split mode renders a floating HUD overlay drawer with `bg-card/95 backdrop-blur-md border border-border shadow-2xl`.
  - [ ] Clicking the dimmed backdrop (`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs`) dismisses the HUD.
  - [ ] Floating HUD trigger pill button is pinned to the bottom-left when collapsed.
  - [ ] In standard quiz mode, sidebar remains docked in-flow as a standard desktop panel.
- [ ] **Purple Theme Contrast**:
  - [ ] Pure white text `#FFFFFF` renders on deep violet `#0F0E1E` (Contrast ratio > 15:1).
  - [ ] Outline buttons and card surfaces use elevated `#262348` with luminous `#3A3568` borders, eliminating background blending.
  - [ ] Kicker badge renders crisp white text on elevated pill surface.
- [ ] **Riseup Theme Modernization**:
  - [ ] Brand name spelled consistently as `Riseup` (one word) across all menus and tooltips.
  - [ ] Primary controls and headline text render in soft warm cream `#F7F1E6` / `#FFF1D6`.
  - [ ] Gold `#E8C547` is strictly reserved as an active focus ring and choice indicator mark; never used as a button or bar fill.
- [ ] **VS Code Navy Gold Preset**:
  - [ ] Preset `vscode-navy-gold` displays as `Navy Gold` in theme dropdown menus.
  - [ ] Applying preset produces `#0D1117` background, `#161B22` card surfaces, and `#30363D` borders.
- [ ] **Coding Guidelines Compliance**:
  - [ ] Strictly positive boolean naming (`hasSlideVideo`, `hasFieldSubtitle`, `hasFieldDescription`, `hasPlaceholderHint`, `isPresentationSlide`).
  - [ ] Zero explicit true evaluations (`if (hasSlideVideo)` instead of `if (hasSlideVideo === true)`).
  - [ ] Zero mixed polarity conditions.
  - [ ] All markdown links use strict relative git paths.

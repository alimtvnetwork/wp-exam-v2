# Component Specification: Presentation Split Mode, Animation & Theme Contrast Modernization

- **Feature**: 75-onboarding-quiz-presentation-modernization
- **Specification**: 02-component-spec.md
- **Status**: Draft / Ready for Execution
- **Parent Plan**: [.ai-memory/plans/pending/75-onboarding-quiz-presentation-modernization.md](../../../.ai-memory/plans/pending/75-onboarding-quiz-presentation-modernization.md)
- **Companion Architecture Spec**: [02-spec/21-app/75-onboarding-quiz-presentation-modernization/01-architecture-spec.md](01-architecture-spec.md)
- **Subtask Plan**: [.ai-memory/plans/subtasks/75-onboarding-quiz-presentation-modernization/02-presentation-mode-and-theming.md](../../../.ai-memory/plans/subtasks/75-onboarding-quiz-presentation-modernization/02-presentation-mode-and-theming.md)
- **Reference Repository**: White Presentation (`D:\work\presentations-repos\white-presentation-v1`)

---

## 1. Executive Summary & Problem Analysis

In recent user audits of the Onboarding Quiz (formerly WP Exam) preview and runner flows, severe visual hierarchy and contrast defects were identified:
1. **Presentation Split Mode Squishing & Clutter**: When switching to presentation slide mode, opening the question sequence sidebar rendered an in-flow `<aside>` element that squished the 50/50 two-column presentation grid into a cramped layout. Long descriptions were arbitrarily truncated with `line-clamp-2`, dropping vital candidate instructions. No interactive hint affordance was provided.
2. **Video Presentation Overflow**: Questions embedding video rendered unconstrained full-width players that dominated the viewport, pushing response options below the fold. Two-choice conditional routing lacked clear, prominent action buttons beneath the video.
3. **Missing Animation Fluidity**: Option response cards lacked entry momentum and tactile hover dynamics compared to the reference presentation architecture (`white-presentation-v1`), which utilizes hardware-accelerated CSS3 slide transitions (`slideInUpSoft`, staggered entry delays, and horizontal glide transitions).
4. **Purple Theme Contrast Defects**: The purple theme exhibited "purple-under-purple" mudiness where kicker badges (`bg-primary/10 text-primary`) and outline buttons (`bg-background` / `bg-card` with dark `#2C2852` borders) blended invisibly into the dark `#0F0E1E` canvas.
5. **RiseUp Theme Saturated Yellow & Branding**: Saturated gold `#FFAD01` was overused as fills across buttons, progress bars, and sidebar rows, causing cognitive fatigue ("brain fog"). Text was painted yellow-on-yellow. The brand was inconsistently named ("Rise Up Asia" vs "RiseUp").
6. **VS Code Navy Gold Preset Integration**: The high-contrast dark slate/navy theme with crisp white text and discrete gold choice indicators (`vscode-navy-gold`) must be fully selectable and prominent across runner controls.

This component specification defines the precise layout geometry, CSS3 animations, component props, and color contrast tokens to modernize the presentation experience.

---

## 2. File Ownership & Boundary Isolation

### 2.1 Owned Target Files (Worker 02)

| File Path | Responsibility |
|---|---|
| `src/components/runner/FormRunner.tsx` | Presentation split grid layout, floating HUD sidebar, video player container, 2-choice route buttons, hint callout, response card animation classes. |
| `src/lib/themes.ts` | Multi-theme catalog, HSL variables for Purple, RiseUp, and VS Code Navy Gold presets. |
| `src/themes/theme-definitions.ts` | Theme definitions catalog synchronized with `themes.ts` for consistent preview and runner theming. |
| `src/styles/theme.css` | CSS3 keyframe animations (`slideInUpSoft`), stagger utility classes, floating HUD styles, theme class overrides. |

### 2.2 Out-of-Scope Files (Owned by Worker 01 / Spec Author 01)

- `src/components/forms/FormBuilder.tsx` (Form builder header, dropdowns, canvas)
- `src/components/admin/wp-admin-sidebar.tsx` (Admin navigation)
- `src/components/forms/field-palette.tsx` (Palette drag-and-drop)
- `src/components/forms/sortable-field-card.tsx` (Builder cards)
- `src/assets/onboarding-quiz-logo.svg` (Branding mark)
- `src/lib/branching-engine.ts` (Existing branching math in `getNextStepIndex` is reused as-is)
- `src/lib/presentation-layout.ts` (Layout mode resolution is reused as-is)

---

## 3. Presentation Split Mode Specification (`FormRunner.tsx`)

Modeled after the White Presentation architecture (`D:\work\presentations-repos\white-presentation-v1`), the presentation layout transforms the question view into a full-screen, high-authority slide deck.

### 3.1 Two-Column Grid Geometry

- **Container**: `w-full max-w-[98vw] px-2 sm:px-4 mx-auto min-h-[calc(100dvh-5.5rem)]`
- **Grid Layout**: `grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start`
- **Breakpoint Behavior**:
  - `lg` and above: 50% Left Column (Question & Context), 50% Right Column (Elevated Candidate Response Card). Column order respects `effectiveAnswerPlacement` (`lg:order-1` / `lg:order-2`).
  - Below `lg`: Natural vertical stacking (Question block on top, Response Card directly below) with zero horizontal overflow.

### 3.2 Left Column: Question & Rich Context

The left column delivers clear, uncluttered question presentation without artificial content truncation:

```tsx
<div className={`w-full space-y-5 ${effectiveAnswerPlacement === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
  {/* Question Eyebrow / Kicker */}
  <div className="flex items-center gap-2 flex-wrap">
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-secondary/80 text-foreground border border-border tracking-wide shadow-xs">
      {currentField.kickerText || `Question #${currentStep + 1} • ${currentField.group || activeForm.title}`}
    </span>
    {currentField.difficulty && (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] uppercase font-mono font-semibold border ${
        currentField.difficulty === 'hard'
          ? 'border-rose-500/40 text-rose-500 bg-rose-500/10'
          : currentField.difficulty === 'medium'
          ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
          : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
      }`}>
        {currentField.difficulty} ({currentField.customPointsOverride ?? (currentField.difficulty === 'hard' ? 20 : currentField.difficulty === 'medium' ? 10 : 5)} pt)
      </span>
    )}
  </div>

  {/* Large Bold Headline */}
  <h2 className="font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight tracking-tight">
    {currentField.label}
    {isCurrentFieldRequired && (
      <span className="text-destructive font-bold ml-1.5" title="Required question">*</span>
    )}
  </h2>

  {/* Full Subtitle & Description (NO line-clamp truncation) */}
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

  {/* Interactive Hint Callout / Chip */}
  {hasPlaceholderHint && (
    <div className="pt-2">
      <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm text-foreground/90 shadow-2xs">
        <span className="p-1 rounded-md bg-accent text-accent-foreground shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
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

### 3.3 Right Column: Elevated Candidate Response Cards & Animations

The response options column features elevated card framing with CSS3 slide-in animations and smooth horizontal hover translation:

```tsx
<div className={`w-full space-y-5 ${effectiveAnswerPlacement === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
  <div className="bg-card border border-border/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-md">
    {/* Card Header Indicator */}
    <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
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
        variant="outline"
        size="sm"
        disabled={currentStep === 0}
        onClick={handlePreviousStep}
        className="text-xs h-9 px-4 font-medium border-border bg-secondary/60 text-foreground hover:bg-secondary hover:text-foreground cursor-pointer w-full sm:w-auto rounded-xl shadow-xs"
      >
        Previous
      </Button>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTestAutoFill}
          className="text-xs h-9 px-3 font-semibold rounded-xl border border-border bg-secondary/60 text-foreground hover:bg-secondary transition-all cursor-pointer shadow-xs"
          title="Fill valid answer and advance"
        >
          ⚡ Auto Fill
        </Button>

        {isLastVisibleStep ? (
          <Button
            size="sm"
            onClick={handleNextStep}
            className="text-xs h-9 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center gap-1.5 flex-1 sm:flex-initial justify-center rounded-xl"
          >
            <span>Submit Assessment</span>
            <span className="text-[10px] opacity-75 font-mono">Enter ↵</span>
          </Button>
        ) : (
          <Button
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

## 4. CSS3 Keyframe Animations & Staggered Reveal

Derived from `white-presentation-v1/src/styles/animations.less`, the animation system provides pure CSS hardware-accelerated card transitions without JavaScript overhead.

### 4.1 Keyframe Definitions (`src/styles/theme.css`)

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

/* Staggered Delay Deliberation for Multi-Choice Candidate Cards */
.stagger-1 { animation-delay: 0.06s; }
.stagger-2 { animation-delay: 0.12s; }
.stagger-3 { animation-delay: 0.18s; }
.stagger-4 { animation-delay: 0.24s; }
.stagger-5 { animation-delay: 0.30s; }
.stagger-6 { animation-delay: 0.36s; }

/* Presentation Option Card Motion */
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

/* Accessibility: Respect Reduced Motion */
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

### 4.2 Application in `renderFieldInput`

In `FormRunner.tsx`, when `isPresentationSlide` is `true`:
- Each option item in `multiple_choice`, `single_choice`, and `boolean` renders with:
  ```tsx
  const staggerClass = optIndex < 6 ? `stagger-${optIndex + 1}` : '';
  const itemAnimClass = isPresentationSlide
    ? `slide-up-anim ${staggerClass} presentation-option-card`
    : 'transition-all duration-150 hover:border-foreground/40 hover:bg-muted/70 hover:shadow-xs';
  ```
- Hover produces smooth `translate-x-2` (8px horizontal glide) with raised border clarity.

---

## 5. Video Presentation Layout & 2-Choice Conditional Routing

Questions incorporating video instruction require strict spatial constraints to maintain slide balance, accompanied by conditional branch routes immediately beneath the player.

### 5.1 Constrained Video Player Dimensions

- **Maximum Height Constraint**: `max-h-[380px]`
- **Width & Centering**: `max-w-3xl w-full mx-auto`
- **Aspect Ratio**: `aspect-video` container with `overflow-hidden rounded-2xl border border-border shadow-lg bg-black/80`
- Both direct HTML5 video (`<video>`) and iframe embeds (`<iframe>`) are constrained within the `max-h-[380px]` boundary:
  ```tsx
  <div className="w-full max-w-3xl mx-auto max-h-[380px] aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80">
    <video
      controls
      className="w-full h-full max-h-[380px] object-contain"
      src={embedInfo.embedUrl}
    />
  </div>
  ```

### 5.2 Two-Choice Conditional Route Buttons

When a video question contains branching options (e.g. 2 candidate choices or pathway choices configured in `optionBranching`):
1. **Layout**: Dual-action grid positioned directly beneath the video player:
   ```tsx
   <div className="max-w-2xl mx-auto w-full pt-4">
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       {options.map((opt, optIndex) => {
         const isSelected = selectedAnswer === opt;
         const branchTarget = currentField.optionBranching?.[opt];
         return (
           <button
             key={opt}
             type="button"
             onClick={() => handleConditionalRouteSelect(currentField.id, opt)}
             className={`flex items-center gap-3 p-4 rounded-xl border text-left font-sans text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 slide-up-anim stagger-${optIndex + 1} ${
               isSelected
                 ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary shadow-md'
                 : 'border-border/90 bg-card hover:bg-accent hover:border-foreground/40 text-foreground shadow-xs hover:translate-y-[-2px]'
             }`}
           >
             <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
               isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
             }`}>
               {String.fromCharCode(65 + optIndex)}
             </span>
             <span className="flex-1">{opt}</span>
             {branchTarget && (
               <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
             )}
           </button>
         );
       })}
     </div>
   </div>
   ```
2. **Branching Execution**:
   - Selecting a choice records `answers[currentField.id] = opt`.
   - Advances using existing `getNextStepIndex(fields, currentStep, { ...answers, [currentField.id]: opt })`.
   - Smoothly routes to the target branch step without reloads or state corruption.

---

## 6. Canvas & Fullscreen: Floating HUD Sidebar Architecture

### 6.1 Defect Elimination: Unsquished Presentation Grid

In previous revisions, opening the question sequence sidebar rendered an in-flow `<aside>` element (`w-64 sm:w-72 shrink-0`) directly inside the horizontal flex container. In presentation split mode, this squished the 50/50 two-column grid into a cramped, illegible 35/35 view.

### 6.2 Floating HUD Overlay Implementation

In `presentation_split` mode:
1. **Main Canvas Remains 100% Full-Width**: `<main className="flex-1 min-w-0 w-full">` always occupies the full presentation canvas width without compression.
2. **Sidebar as Floating HUD Overlay**:
   - When opened in `presentation_split` mode, the sidebar renders as a floating popover overlay:
     ```tsx
     {isSidebarVisible && effectiveLayoutMode === 'presentation_split' ? (
       <>
         {/* Subtle Backdrop to prevent interaction bleed */}
         <div
           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
           onClick={() => setIsSidebarVisible(false)}
         />
         {/* Floating HUD Drawer Card */}
         <aside className="fixed top-16 left-4 z-50 w-72 sm:w-80 max-h-[calc(100dvh-5rem)] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 flex flex-col animate-card-entrance overflow-hidden">
           {/* Sidebar content: Question steps, progress, filter */}
         </aside>
       </>
     ) : null}
     ```
3. **Floating HUD Trigger Pill**:
   - When collapsed, a discrete floating HUD button remains pinned at the top-left or accessible via the runner bar:
     ```tsx
     {!isSidebarVisible && effectiveLayoutMode === 'presentation_split' && (
       <div className="fixed bottom-6 left-6 z-30">
         <Button
           type="button"
           variant="outline"
           size="sm"
           onClick={() => setIsSidebarVisible(true)}
           className="h-9 px-3.5 text-xs font-sans font-medium gap-2 border-border bg-card/90 backdrop-blur-md text-foreground hover:bg-accent rounded-full shadow-lg transition-all cursor-pointer"
         >
           <Menu className="w-3.5 h-3.5 text-primary" />
           <span>Questions ({currentStep + 1}/{visibleFields.length})</span>
         </Button>
       </div>
     )}
     ```
4. **Standard Layout Compatibility**:
   - When `effectiveLayoutMode !== 'presentation_split'` (e.g. standard quiz runner), the sidebar continues rendering in-flow as a standard desktop layout side panel.

---

## 7. Theming & Color Contrast Rules

### 7.1 Purple Theme Modernization

#### Defect: Purple-Under-Purple & Invisible Buttons
On the Purple theme (`#0F0E1E`), outline buttons using `bg-background` or dark `bg-card` with border `#2C2852` blended seamlessly into the backdrop. Kicker badges rendered violet text on a violet wash (`border-primary/40 text-primary bg-primary/10`), dropping below standard contrast.

#### Corrective Palette Tokens:
- **Surface Elevation**: Elevate button surfaces to `hsl(246 32% 19%)` (`--secondary`) or card surface `hsl(245 36% 16%)`.
- **Luminous Violet & White Borders**: Outline borders use luminous violet `rgba(167, 139, 250, 0.4)` / `hsl(248 98% 63% / 0.45)` or `hsl(246 34% 32%)`.
- **Badge Chips**: Kicker badges render crisp white text (`#FFFFFF`) on elevated violet pill (`bg-secondary/90` or `rgba(92, 69, 253, 0.25)`) with luminous violet border.
- **Headlines**: Large question headlines are pure white (`#FFFFFF`) on `#0F0E1E` (Contrast ratio > 15:1, exceeding WCAG AAA).

#### Token Mapping (`src/lib/themes.ts` & `src/styles/theme.css`):
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
  --secondary: 246 32% 19%; /* Elevated Button Surface */
  --secondary-foreground: 0 0% 100%;
  --muted: 246 32% 19%;
  --muted-foreground: 240 15% 75%;
  --accent: 246 32% 24%;
  --accent-foreground: 0 0% 100%;
  --border: 246 34% 28%; /* Distinct Luminous Border */
  --input: 246 34% 28%;
  --ring: 248 98% 63%;
  --wp-exam-card-border: #3A3568;
  --wp-exam-badge-bg: rgba(92, 69, 253, 0.25);
}
```

### 7.2 RiseUp Theme Modernization

#### Defect: Saturated Yellow Cognitive Fatigue & Inconsistent Branding
The RiseUp theme previously over-saturated the UI with raw amber gold `#FFAD01`, applying yellow fills to buttons, sidebar selection, and progress bars. The brand name was incorrectly written as "Rise Up Asia".

#### Corrective Rules:
1. **Single-Word Branding**: Enforce `RiseUp` (one word) across all visible strings, dropdown menus, tooltips, and preset labels (`RiseUp`, `RiseUp (Gold & Navy)`).
2. **Elimination of Blinding Yellow Text**:
   - Question headlines and primary controls use soft warm cream `#F7F1E6` (`--primary: 40 43% 92%`).
   - Body and option text uses readable cream `#FFF1D6` (`--foreground: 40 100% 92%`).
   - Never render yellow text on a yellow background.
3. **Gold Restricted Strictly as Highlighter**:
   - Gold (`#E8C547` / `47 78% 59%`) is strictly reserved for:
     - Active focus rings (`ring-[#E8C547]`)
     - Option card left-accent indicator mark (`border-l-4 border-l-[#E8C547]`)
     - Radio/checkbox checkmark and active selection pill
   - Gold is NEVER used as a button background fill, navbar fill, sequence row background, or progress bar fill.
   - Progress bar uses muted slate `#3A3A55`.

#### Token Mapping (`src/lib/themes.ts` & `src/styles/theme.css`):
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

### 7.3 VS Code Navy Gold Theme Preset

#### Specification: Preset `vscode-navy-gold`
High-contrast technical dark theme providing clean obsidian slate surfaces with crisp white text and a single gold choice mark:
- **Preset ID**: `vscode-navy-gold`
- **Display Name**: `Navy Gold` (Menu label: `Navy Gold`, Description: `Obsidian navy canvas with cream controls and a single gold choice mark`)
- **Background**: `#0D1117` (GitHub Dark / Obsidian Navy)
- **Card**: `#161B22`
- **Border**: `#30363D`
- **Foreground / Text Primary**: `#F0F6FC` (Crisp white/platinum)
- **Muted Text**: `#8B949E`
- **Primary Control**: `#F0F6FC` with primary text `#0D1117`
- **Highlight**: `#E8C547` (Gold choice indicator mark only)
- **Runner Menu Integration**: Fully selectable from the runner palette dropdown menu and via query parameter `?theme=vscode-navy-gold`.

---

## 8. Verification & Acceptance Criteria

### 8.1 Automated & Visual Checklist

- [ ] **Presentation Split Left Column**:
  - [ ] Question headline renders at `text-4xl lg:text-5xl` with bold weight and high-contrast foreground color.
  - [ ] Both subtitle AND description render in full without `line-clamp-2` or text clipping.
  - [ ] Interactive hint callout renders with lightbulb icon and clear guidance when `placeholder` is populated; absent when empty.
- [ ] **Presentation Split Right Column**:
  - [ ] Candidate response cards render with elevated background `bg-card` and clean border.
  - [ ] CSS3 slide-in animation `slide-up-anim` triggers on option cards with staggered delay classes (`stagger-1..4`).
  - [ ] Hovering option cards causes smooth `hover:translate-x-2` horizontal glide transition.
- [ ] **Constrained Video Layout**:
  - [ ] Video player container is constrained to `max-h-[380px]` with `max-w-3xl` centering.
  - [ ] Questions with 2 choices or branching paths display dual route buttons directly below the video.
  - [ ] Selecting a route button records the response and transitions to the correct target step via `getNextStepIndex`.
- [ ] **Floating HUD Sidebar**:
  - [ ] In `presentation_split` mode, opening the question sequence renders a floating HUD overlay drawer, NEVER squishing the 50/50 columns.
  - [ ] In `standard` quiz mode, sidebar remains in-flow as a standard side panel.
  - [ ] Floating HUD pill button allows toggling sidebar visibility with one click.
- [ ] **Purple Theme Contrast**:
  - [ ] Kicker badge is clearly legible with white text on elevated pill surface.
  - [ ] Outline buttons have elevated surfaces (`hsl(246 32% 19%)`) with luminous borders, eliminating background blending.
  - [ ] Headline text contrast against `#0F0E1E` exceeds 10:1.
- [ ] **RiseUp Theme Branding & Contrast**:
  - [ ] Brand string displays as `RiseUp` (one word) across all menus and tooltips.
  - [ ] No saturated yellow text; text is crisp cream `#FFF1D6` or soft white `#F7F1E6`.
  - [ ] Gold `#E8C547` is restricted to active focus rings and choice indicators.
- [ ] **VS Code Navy Gold Selection**:
  - [ ] Preset `vscode-navy-gold` appears in runner palette menu as `Navy Gold`.
  - [ ] Selecting it applies `#0D1117` background, `#161B22` card surfaces, and gold choice marks.
- [ ] **Coding Guidelines Compliance**:
  - [ ] Strictly positive boolean naming throughout all modified files.
  - [ ] No build or test execution during authoring.
  - [ ] Relative paths and `@/...` aliases preserved.

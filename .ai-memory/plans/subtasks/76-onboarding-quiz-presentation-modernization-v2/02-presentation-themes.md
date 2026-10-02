# Subtask 02: White Presentation Slide Mode, CSS3 Motion Keyframes & High-Contrast Theming

- **Subtask ID**: Subtask 02 (Task-02)
- **Feature**: 76-onboarding-quiz-presentation-modernization-v2
- **Status**: Ready for Execution
- **Parent Plan**: [.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md](../../../.ai-memory/plans/76-onboarding-quiz-presentation-modernization-v2.md)
- **Component Spec**: [02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/02-component-spec.md](../../../02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/02-component-spec.md)
- **Architecture Spec**: [02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/01-architecture-spec.md](../../../02-spec/21-app/76-onboarding-quiz-presentation-modernization-v2/01-architecture-spec.md)
- **Assigned Worker**: Worker Subagent 02

---

## 1. Executive Summary & Architectural Scope

This subtask implements the presentation slide mode modernization, CSS3 motion keyframes, floating HUD sequence aside, and high-contrast theme palettes for the candidate runner (`FormRunner.tsx`), styling layer (`theme.css`), and theme dictionaries (`themes.ts`, `theme-definitions.ts`).

### 1.1 Target File Ownership & Exact Line Mapping

| Target File | Line Range | Subtask Responsibility |
|---|---|---|
| `src/components/runner/FormRunner.tsx` | Lines 776–825 | Layout mode state, runtime mode detection, and subtitle/video existence predicates. |
| `src/components/runner/FormRunner.tsx` | Lines 2103–2161 | Floating HUD sidebar overlay with backdrop dismissal (`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs`) and bottom-left trigger pill button. |
| `src/components/runner/FormRunner.tsx` | Lines 2163–2350 | White Presentation 50/50 two-column slide deck layout, 5xl question typography, subtitle, description, `<Lightbulb />` guidance chip, and elevated response card. |
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

## 2. Step-by-Step Implementation Plan

### Step 2.1: White Presentation 50/50 Split Mode Layout & Typography (`FormRunner.tsx`)
- **Location**: `src/components/runner/FormRunner.tsx`, Lines 2270–2297
- **Actions**:
  1. Verify the two-column desktop presentation grid uses `grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start`.
  2. Enforce headline typography at `font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight tracking-tight`.
  3. Render question kicker eyebrow badge with `currentField.kickerText || Question #${currentStep + 1} • ...`.
  4. Ensure subtitle (`font-sans text-base lg:text-lg text-foreground/85 font-normal`) and description (`font-sans text-sm sm:text-base text-muted-foreground border-l-2 border-border pl-3.5 py-0.5 whitespace-pre-line`) render without `line-clamp-2` or artificial truncation.
  5. Include candidate guidance chip (`<Lightbulb className="w-4 h-4 text-primary shrink-0" />`) displaying `currentField.placeholder` when populated.
  6. Support dynamic answer placement swapping via `effectiveAnswerPlacement === 'left'` (`lg:order-2` vs `lg:order-1`).

### Step 2.2: CSS3 Motion Keyframes & Option Card Hover Glide (`theme.css` & `FormRunner.tsx`)
- **Location**: `src/styles/theme.css`, Lines 20–67; `src/components/runner/FormRunner.tsx`, Lines 3290–3700
- **Actions**:
  1. Confirm `@keyframes slideInUpSoft` smoothly transitions from `translate3d(0, 20px, 0)` with `opacity: 0` to `translate3d(0, 0, 0)` with `opacity: 1`.
  2. Confirm `.slide-up-anim` runs 0.45s cubic-bezier timing with hardware acceleration (`will-change: transform, opacity`).
  3. Validate stagger utility classes `.stagger-1` (0.06s) through `.stagger-6` (0.36s).
  4. Enforce `.presentation-option-card` motion transition (180ms cubic-bezier) and hover translation:
     ```css
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
     ```
  5. Ensure `@media (prefers-reduced-motion: reduce)` zeroes out durations and sets `transform: none !important`.
  6. In `FormRunner.tsx` (`renderFieldInput`), attach `slide-up-anim`, `stagger-${Math.min(optIndex + 1, 6)}`, and `presentation-option-card` to choice cards when `isPresentationSlide` is true.

### Step 2.3: Constrained Video Player & Dual-Choice Route Branching (`FormRunner.tsx`)
- **Location**: `src/components/runner/FormRunner.tsx`, Lines 2171–2222, Lines 2834–2900
- **Actions**:
  1. Restrict video player container to `max-h-[380px]` with `max-w-3xl aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80`.
  2. Inside `RunnerVideoPlayer`, ensure HTML5 `<video>` and iframe embeds obey container height constraints without overflowing the viewport fold.
  3. For video questions containing binary choices (`dualChoices`), render a dual-button grid directly below the video:
     - Prominent large action buttons (`h-12 px-6 rounded-xl font-heading font-semibold text-base`).
     - Distinct option letters (A, B) in rounded badges.
     - Active selection indicator ring, primary surface highlight, and checkmark icon.
  4. Ensure selecting an option calls `handleAnswerChange(currentField.id, choice)` and correctly triggers conditional branching via `getNextStepIndex(...)`.

### Step 2.4: Floating HUD Sequence Aside with Backdrop Dismissal (`FormRunner.tsx`)
- **Location**: `src/components/runner/FormRunner.tsx`, Lines 2103–2161
- **Actions**:
  1. In `presentation_split` mode, decouple question sequence aside from standard layout flow.
  2. `<main className="w-full">` maintains 100% presentation canvas width, never squished or narrowed by the sidebar.
  3. Render floating backdrop overlay when open:
     ```tsx
     <div
       className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
       onClick={() => setIsSidebarVisible(false)}
     />
     ```
  4. Render floating HUD drawer:
     ```tsx
     <aside className="fixed top-16 left-4 z-50 w-72 sm:w-80 max-h-[calc(100dvh-5rem)] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
       <div className="space-y-4 flex flex-col h-full max-h-[calc(100dvh-7rem)] overflow-hidden">
         {renderSidebarInner()}
       </div>
     </aside>
     ```
  5. Render bottom-left floating trigger pill button when sidebar is collapsed:
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
  6. Maintain standard in-flow docked aside (`w-full lg:w-72 xl:w-80 shrink-0`) when `effectiveLayoutMode !== 'presentation_split'`.

### Step 2.5: High-Contrast Palette Tokens & Theme Synchronization (`theme.css`, `themes.ts`, `theme-definitions.ts`)
- **Location**: `src/styles/theme.css`, Lines 116–260; `src/lib/themes.ts`, Lines 157–424; `src/themes/theme-definitions.ts`, Lines 30–226
- **Actions**:
  1. **Purple Theme Contrast Modernization**:
     - Background: `#0F0E1E` (`hsl(246 35% 9%)`).
     - Foreground: `#FFFFFF` (`hsl(0 0% 100%)`) providing > 15:1 WCAG AAA contrast.
     - Elevated button surface: `#262348` (`hsl(246 32% 19%)`).
     - Card surface: `#18162F` (`hsl(245 36% 14%)`).
     - Luminous border: `#3A3568` (`hsl(246 34% 28%)`).
     - Badges: Crisp white text on elevated pill surface, eliminating "purple-under-purple" mudiness.
  2. **Riseup Theme Modernization & Branding**:
     - Brand string: Standardize to `Riseup` (one word) across all definitions, labels, and tooltips (`Riseup (Gold & Navy)`).
     - Cream primary: `#F7F1E6` (`--primary: 40 43% 92%`).
     - Soft cream foreground: `#FFF1D6` (`--foreground: 40 100% 92%`).
     - Dark navy background: `#0A0A14` (`--background: 240 33% 6%`).
     - Card surface: `#141424` (`--card: 240 28% 11%`).
     - Restrict Gold `#E8C547` strictly as active focus rings (`ring-[#E8C547]`) and choice indicator marks (`--wp-exam-highlight: #E8C547`). Never use gold as a solid button, navbar, or progress bar background fill.
  3. **VS Code Navy Gold Preset Integration (`vscode-navy-gold`)**:
     - Preset ID: `vscode-navy-gold`.
     - Name: `Navy Gold`.
     - Background: `#0D1117`.
     - Card: `#161B22`.
     - Border: `#30363D`.
     - Foreground: `#F0F6FC`.
     - Primary button: `#F7F1E6` with dark text `#0D1117`.
     - Gold highlight: `#E8C547`.
     - Ensure aliases `navy-gold` and `vscode-navy-gold` resolve properly.

---

## 3. Verifiable Acceptance Criteria

- [ ] **Presentation Split Left Column**:
  - [ ] Question headline renders at `text-4xl lg:text-5xl` with bold font-heading weight.
  - [ ] Both subtitle and description render in full without `line-clamp-2` or text clipping.
  - [ ] Candidate guidance chip renders with `<Lightbulb />` icon when `placeholder` is populated.
- [ ] **Presentation Split Right Column**:
  - [ ] Elevated candidate response card renders with `bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-lg`.
  - [ ] Candidate response header displays `Sparkles` icon and step counter.
  - [ ] Footer provides Previous, Auto Fill, and Submit/Next buttons with keyboard shortcut badges.
- [ ] **CSS3 Motion & Interactions**:
  - [ ] Option cards animate in via `@keyframes slideInUpSoft` with staggered delays (`stagger-1..6`).
  - [ ] Hovering over option cards produces smooth ~180ms horizontal glide (`hover:translate-x-2` / `translate3d(8px, 0, 0)`).
  - [ ] Reduced-motion media query completely disables transitions and transforms for accessibility.
- [ ] **Constrained Video Player & Route Controls**:
  - [ ] Video player is constrained to `max-h-[380px]` with `max-w-3xl` centering.
  - [ ] Questions with binary options display dual route buttons directly beneath the video player.
  - [ ] Option selection advances form flow and supports conditional branching.
- [ ] **Floating HUD Sequence Aside**:
  - [ ] In `presentation_split` mode, `<main className="w-full">` maintains full canvas width.
  - [ ] Opening question sequence renders floating HUD drawer with dimmed backdrop dismissal.
  - [ ] Closing sidebar returns focus to full presentation canvas.
  - [ ] Standard quiz mode preserves docked in-flow desktop sidebar panel.
- [ ] **Purple Theme Contrast**:
  - [ ] Pure white text `#FFFFFF` renders on deep violet `#0F0E1E` (contrast ratio > 15:1).
  - [ ] Buttons and borders use elevated `#262348` and `#3A3568`, eliminating purple-on-purple mudiness.
- [ ] **Riseup Theme Branding & Contrast**:
  - [ ] Brand name spelled consistently as `Riseup` (one word).
  - [ ] Soft cream `#F7F1E6` / `#FFF1D6` used for text and primary controls.
  - [ ] Gold `#E8C547` strictly reserved as an active focus ring and choice mark.
- [ ] **VS Code Navy Gold Preset**:
  - [ ] Preset `vscode-navy-gold` appears as `Navy Gold` in theme selector.
  - [ ] Applies `#0D1117` background, `#161B22` card surfaces, and `#30363D` borders.
- [ ] **Coding Guidelines Compliance**:
  - [ ] Strictly positive boolean naming (`hasSlideVideo`, `hasFieldSubtitle`, `hasFieldDescription`, `hasPlaceholderHint`, `isPresentationSlide`).
  - [ ] Zero explicit true evaluations (`if (hasSlideVideo)`).
  - [ ] Zero mixed polarity conditions.
  - [ ] Strict relative git paths in all markdown links.

---

## 4. Verification & Testing Protocol

1. **Static Analysis & Type Integrity**:
   - Ensure all props and theme dictionaries conform to TypeScript schemas without compilation errors.
2. **Layout & Responsive Validation**:
   - Verify `presentation_split` layout at desktop (`>= 1024px`) provides balanced 50/50 two-column presentation.
   - Verify mobile/tablet (`< 1024px`) collapses gracefully to vertical stack without horizontal overflow.
3. **Motion Inspection**:
   - Verify hardware-accelerated entry animation and hover glide on choice elements.
4. **Theme Contrast Auditing**:
   - Verify color contrast in dark environments against WCAG AA standards.

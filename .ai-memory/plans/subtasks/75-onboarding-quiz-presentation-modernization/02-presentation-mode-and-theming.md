# Subtask 02: Presentation Split Mode, Animation & Theming Modernization

- **Subtask ID**: `75-02-presentation-mode-and-theming`
- **Master Plan**: [.ai-memory/plans/pending/75-onboarding-quiz-presentation-modernization.md](../../pending/75-onboarding-quiz-presentation-modernization.md)
- **Component Spec**: [02-spec/21-app/75-onboarding-quiz-presentation-modernization/02-component-spec.md](../../../02-spec/21-app/75-onboarding-quiz-presentation-modernization/02-component-spec.md)
- **Architecture Spec**: [02-spec/21-app/75-onboarding-quiz-presentation-modernization/01-architecture-spec.md](../../../02-spec/21-app/75-onboarding-quiz-presentation-modernization/01-architecture-spec.md)
- **Reference Repository**: White Presentation (`D:\work\presentations-repos\white-presentation-v1`)
- **Status**: Pending Execution by Worker 02

---

## 1. Objective & Scope

Execute the presentation modernization in `FormRunner.tsx`, modernize theme palettes in `themes.ts` and `theme-definitions.ts`, and integrate hardware-accelerated CSS3 animations in `theme.css`.

Eliminate column squishing by converting the presentation sequence sidebar into a floating HUD overlay. Expand subtitles and descriptions without artificial truncation. Implement constrained video presentation with 2-choice conditional route buttons. Rectify purple-under-purple mudiness and restrict gold in RiseUp to an active focus highlighter.

---

## 2. File Boundaries & Ownership

### 2.1 Owned Target Files (Worker 02 Exclusive)

1. `src/components/runner/FormRunner.tsx`
2. `src/lib/themes.ts`
3. `src/themes/theme-definitions.ts`
4. `src/styles/theme.css`

### 2.2 Strictly Forbidden Files (Worker 01 & Lead Scope)

- DO NOT modify `src/components/forms/FormBuilder.tsx`
- DO NOT modify `src/components/admin/wp-admin-sidebar.tsx`
- DO NOT modify `src/components/forms/field-palette.tsx`
- DO NOT modify `src/components/forms/sortable-field-card.tsx`
- DO NOT modify `src/assets/onboarding-quiz-logo.svg`
- DO NOT modify `src/lib/branching-engine.ts` (reuse existing `getNextStepIndex`)
- DO NOT modify `src/lib/presentation-layout.ts` (reuse existing layout resolution)

---

## 3. Strict Coding Guideline Constraints

1. **Positive Boolean Naming**:
   - Variables, state, and props MUST use positive boolean prefixes: `isSidebarVisible`, `isPresentationSlide`, `isHintVisible`, `hasVideoUrl`, `hasSubtitle`, `hasDescription`, `isRouteOptionSelected`, `isCurrentFieldRequired`, `isInteractiveHintVisible`.
   - FORBIDDEN: `isNotVisible`, `uncollapsed`, `disableAnimation`, `noVideo`, `isNonStandard`.
2. **No Build & No Test Execution**:
   - Do NOT run `npm build`, `pnpm build`, `vite build`, `npm test`, or `vitest` during execution. Verify code syntax and structural integrity through code analysis and targeted file views.
3. **Path Conventions**:
   - Use internal project aliases (`@/lib/...`, `@/components/...`) or relative paths (`../...`). No absolute operating system paths in source code.
4. **Git Discipline**:
   - Never amend, squash, or force-push commits. Lovable sync integrity must be strictly maintained.

---

## 4. Discrete Implementation Steps for Worker 02

### Step 1: CSS3 Keyframe Animations & Staggered Utilities (`src/styles/theme.css`)

1. Add `@keyframes slideInUpSoft` modeled after White Presentation (`white-presentation-v1/src/styles/animations.less`):
   ```css
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
   ```
2. Add animation class `.slide-up-anim` using presentation easing `cubic-bezier(0.22, 1, 0.36, 1)` with `0.45s` duration.
3. Add cascade stagger delay classes `.stagger-1` (`0.06s`) through `.stagger-6` (`0.36s`).
4. Add `.presentation-option-card` hover translation (`translate3d(8px, 0, 0)`) and smooth transition duration (`180ms`).
5. Add `@media (prefers-reduced-motion: reduce)` accessibility fallback disabling animations and transforms.
6. Refine `.theme-purple` CSS variables to elevate `--secondary` to `hsl(246 32% 19%)`, set luminous border tokens, and configure badge surfaces.
7. Refine `.theme-riseup-asia` CSS variables to restrict gold `#E8C547` exclusively to active focus rings and choice indicators.

### Step 2: Theme Palettes & Preset Definitions (`src/lib/themes.ts` & `src/themes/theme-definitions.ts`)

1. **Purple Theme**:
   - In `THEME_PRESETS['purple']` (`src/lib/themes.ts` and `src/themes/theme-definitions.ts`), update `colors` and `hslValues`:
     - `--secondary`: `246 32% 19%` (elevated button surface)
     - `--secondary-foreground`: `0 0% 100%`
     - `--card`: `245 36% 14%`
     - `--border`: `246 34% 28%`
     - `badgeBg`: `rgba(92, 69, 253, 0.25)`
     - Headline text is guaranteed pure white (`#FFFFFF`) with > 15:1 contrast against `#0F0E1E`.
2. **RiseUp Theme**:
   - Update display name to `RiseUp` (one word, `RiseUp (Gold & Navy)`).
   - Change body text to soft cream `#FFF1D6` (`--foreground: 40 100% 92%`).
   - Change primary controls to warm cream `#F7F1E6` (`--primary: 40 43% 92%`).
   - Restrict gold `#E8C547` exclusively to `highlightWord` / focus rings / choice checkmarks.
   - Progress bar set to muted slate `#3A3A55`.
3. **VS Code Navy Gold Theme**:
   - Verify preset `vscode-navy-gold` in `THEME_PRESETS` in both `themes.ts` and `theme-definitions.ts`:
     - `background`: `#0D1117`
     - `cardBg`: `#161B22`
     - `cardBorder`: `#30363D`
     - `primary`: `#F0F6FC`
     - `primaryText`: `#0D1117`
     - `highlightWord`: `#E8C547`
     - `textPrimary`: `#F0F6FC`
     - `textSecondary`: `#8B949E`
   - Ensure aliases `navy-gold` and `vscode-navy-gold` resolve seamlessly.

### Step 3: Presentation Split Mode & Video Architecture (`src/components/runner/FormRunner.tsx`)

1. **Left Column Refactoring**:
   - Set question headline font to `text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight tracking-tight`.
   - Remove `line-clamp-2` from subtitle and description.
   - Render BOTH `currentField.subtitle` AND `currentField.description` when present:
     - Subtitle: `font-sans text-base lg:text-lg text-foreground/85 leading-relaxed font-normal`.
     - Description: `font-sans text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line border-l-2 border-border pl-3.5 py-0.5`.
   - Add interactive hint callout chip:
     - When `currentField.placeholder` is present, render an elevated guidance chip with `Lightbulb` icon.
2. **Right Column Option Cards & Animations**:
   - In `renderFieldInput`, when `isPresentationSlide` is `true`:
     - Apply `slide-up-anim`, `stagger-${idx + 1}`, and `presentation-option-card` to choice items.
     - Option hover produces tactile `hover:translate-x-2` glide with raised border clarity.
3. **Constrained Video Presentation & 2-Choice Routing**:
   - Wrap video player in container constrained to `max-w-3xl mx-auto w-full max-h-[380px] aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80`.
   - Ensure iframe/video elements do not exceed `max-h-[380px]`.
   - When question has 2 choices or conditional branching, render dual-button route controls directly below video:
     - Grid: `grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4`.
     - Selecting route records answer and advances via `getNextStepIndex(fields, currentStep, answers)`.
4. **Floating HUD Sidebar (Eliminating Grid Squishing)**:
   - When `effectiveLayoutMode === 'presentation_split'`:
     - Render `<aside>` as a floating HUD overlay (`fixed top-16 left-4 z-50 w-72 sm:w-80 max-h-[calc(100dvh-5rem)] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 overflow-hidden`) with backdrop dismissal.
     - Remove in-flow aside layout from the presentation container, ensuring `<main>` occupies 100% full width and 50/50 columns are never compressed.
     - Provide floating HUD button (`Questions (Step X/Y)`) pinned in the corner when collapsed.
   - When in `standard` mode, keep standard in-flow sidebar layout intact.
5. **Theme Dropdown Label Parity**:
   - Verify runner theme menu displays clean short names (`RiseUp`, `Navy Gold`, `Purple Theme`, `Green Choice`).

---

## 5. Verification & Acceptance Checklist

- [ ] `theme.css` contains `@keyframes slideInUpSoft`, `.slide-up-anim`, `.stagger-1..6`, and `.presentation-option-card`.
- [ ] Purple theme outline buttons use elevated `--secondary` surface with luminous borders.
- [ ] Purple theme kicker badge uses white text on elevated pill surface, eliminating purple-under-purple mudiness.
- [ ] RiseUp theme brand is spelled `RiseUp` (one word).
- [ ] RiseUp theme does not render saturated yellow body text; gold `#E8C547` is restricted to active focus rings and choice indicators.
- [ ] Preset `vscode-navy-gold` (`Navy Gold`) is selectable in runner menu and loads `#0D1117` background with `#F0F6FC` text and gold choice indicator.
- [ ] Left column in presentation split mode renders large `text-4xl lg:text-5xl` headline.
- [ ] Left column renders full subtitle AND full description without `line-clamp-2` truncation.
- [ ] Left column renders interactive guidance callout chip when hint/placeholder is configured.
- [ ] Right column response cards animate in using CSS3 `slide-up-anim` with stagger delays and glide `hover:translate-x-2`.
- [ ] Video questions constrain player to `max-h-[380px]` with dual route action buttons directly beneath video.
- [ ] Sidebar in presentation split mode opens as floating HUD overlay without squishing the 50/50 presentation grid.
- [ ] All boolean variables in newly added code follow strictly positive naming conventions.
- [ ] No builds or tests were executed.

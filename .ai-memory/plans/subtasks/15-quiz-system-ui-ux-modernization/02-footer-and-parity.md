# Subtask 02: FocusQuizRunner Parity, Navigation Footer Harmonization, Floating HUD & Drawer Refinement, and Theme Ambient Gradients

**Subtask ID:** `15-quiz-system-ui-ux-modernization-02`  
**Status:** Pending  
**Assignee:** Worker 02  
**Target Files:**  
- `src/components/runner/FocusQuizRunner.tsx`  
- `src/components/runner/floating-controls.tsx`  
- `src/components/runner/FormRunner.tsx`  
- `src/styles/theme.css`  
**Referenced Specification:** `02-spec/21-app/06-quiz-system-ui-ux-modernization/03-cross-theme-and-runner-parity.md`  

---

## 1. Objective & Scope

Worker 02 is tasked with bringing `src/components/runner/FocusQuizRunner.tsx` to complete optical and architectural parity with executive design standards (theme class/dataset root binding, expanding layout from `max-w-md` to `max-w-2xl lg:max-w-3xl`, applying `.presentation-option-card` styling, constant alphanumeric option badges, single right-side `CheckCircle2` indicators, and Riseup 2px hairline chrome accent).

Additionally, Worker 02 will harmonize the bottom floating controls baseline to `bottom-6` across `floating-controls.tsx` (right HUD) and `FormRunner.tsx` (left sequence drawer pill), refine button sizing to compact `h-7 w-7`, and integrate ambient radial gradients and resting card elevations into `src/styles/theme.css`.

---

## 2. Detailed Implementation Instructions

### Step 1: `FocusQuizRunner.tsx` Root Theming & Container Dimensions
In `src/components/runner/FocusQuizRunner.tsx`:

1. **Root Element Dataset & Theme Class Binding:**
   - Locate the root wrapper `<div>` (~lines 810–817).
   - Add `theme-${activeThemeId}` to the `className` string.
   - Add `data-theme={activeThemeId}` attribute to the DOM element:
     ```tsx
     <div
       className={`min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans theme-${activeThemeId}`}
       data-theme={activeThemeId}
       style={{
         backgroundColor: theme.colors.background,
         color: theme.colors.textPrimary,
       }}
     >
     ```
2. **Top Navigation Header Layout Expansion:**
   - Locate header container `<div>` (~line 823):
     - Replace `className="max-w-md mx-auto px-4 py-3 flex items-center justify-between"` with:
       ```tsx
       className="max-w-2xl lg:max-w-3xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between"
       ```
3. **Main Stage Container Layout Expansion:**
   - Locate main container `<main>` (~line 921):
     - Replace `className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center"` with:
       ```tsx
       className="flex-1 max-w-2xl lg:max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center"
       ```
4. **Question Prompt Title & Body Proportions:**
   - Locate question title `<h2>` (~line 1088):
     - Replace `className="text-2xl font-black leading-tight text-center mx-auto max-w-md"` with:
       ```tsx
       className="text-2xl sm:text-3xl font-black leading-tight text-center mx-auto max-w-2xl lg:max-w-3xl"
       ```
5. **Secondary Stage Expansion (Intro, Reading, Checklist):**
   - Audit and expand secondary containers (~lines 1543, 1585, 1696) from `max-w-md` to `max-w-2xl lg:max-w-3xl` to prevent layout crowding across all stages.

### Step 2: `FocusQuizRunner.tsx` Option Cards Parity & Hairline Chrome Accent
In `src/components/runner/FocusQuizRunner.tsx`:

1. **Import `CheckCircle2`:**
   - In top imports from `lucide-react`, import `CheckCircle2`.
2. **Define `isRiseupTheme` Helper:**
   - Ensure `const isRiseupTheme = activeThemeId === 'riseup' || activeThemeId === 'riseup-asia';` is declared within the component scope.
3. **Riseup 2px Hairline Chrome Accent Indicator:**
   - Directly above the question title `<h2>` (~line 1087), render the hairline accent mark when `isRiseupTheme` is active:
     ```tsx
     {isRiseupTheme && (
       <div className="h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md mx-auto mb-3" />
     )}
     ```
4. **Modernize MCQ & Multi-Select Option Cards (~lines 1164–1226):**
   - Apply `.presentation-option-card` class, `rounded-xl`, and smooth transition styles.
   - **Constant Alphanumeric Badge:**
     - Left badge must strictly display `String.fromCharCode(65 + optIdx)`.
     - Styling: `w-8 h-8 rounded-xl font-mono font-bold text-sm shrink-0 flex items-center justify-center`.
     - When selected: active theme primary background; when resting: muted surface.
     - Never swap the badge content to a checkmark.
   - **Single Right-Side Indicator:**
     - Render `CheckCircle2` conditionally on `isSelected`:
       ```tsx
       {isSelected && (
         <CheckCircle2
           className={`w-5 h-5 shrink-0 ml-auto ${
             isRiseupTheme ? 'text-[#E8C547]' : 'text-emerald-500'
           }`}
         />
       )}
       ```
     - Remove the legacy `<Check className="w-4 h-4" style={{ color: '#10B981' }} />`.

### Step 3: Floating HUD & Sequence Drawer Baseline Docking Harmonization
1. **PresenterHUD Dock Alignment in `src/components/runner/floating-controls.tsx` (~lines 61–75):**
   - Update outer `motion.div`:
     - Change positioning from `bottom-8 right-8` to `bottom-6 right-6`.
     - Update corner radius from `rounded-2xl` to `rounded-xl`.
     - Refine styling tokens: `className="fixed z-[9999] bottom-6 right-6 flex items-center gap-1.5 p-1 bg-card/85 backdrop-blur-xl border border-border/40 shadow-xl rounded-xl select-none touch-none cursor-grab active:cursor-grabbing"`.
   - Update drag handle pill:
     - Refine to `h-7 px-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider rounded-lg`.
   - Update Dropdown triggers (View, Theme) (~lines 98–106, 190–198):
     - Refine button dimensions from `h-8 w-8 rounded-xl` to `h-7 w-7 rounded-lg`.
2. **Sequence Drawer Floating Pill in `src/components/runner/FormRunner.tsx` (~lines 2440–2456):**
   - Maintain `fixed bottom-6 left-6 z-40` anchor.
   - Refine Button geometry to squircle `rounded-xl`, glassmorphic `backdrop-blur-xl bg-card/85`, hairline border `border-border/40`, and shadow `shadow-xl`:
     ```tsx
     <div className="fixed bottom-6 left-6 z-40">
       <Tooltip>
         <TooltipTrigger asChild>
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={() => setIsSidebarVisible(true)}
             className="h-9 px-3.5 text-xs font-sans font-medium gap-2 border border-border/40 bg-card/85 backdrop-blur-xl text-foreground hover:bg-accent rounded-xl shadow-xl transition-all cursor-pointer hover:scale-105"
           >
             <Menu className="w-4 h-4 text-foreground" />
             <span>Questions ({currentStep + 1}/{visibleFields.length})</span>
           </Button>
         </TooltipTrigger>
         <TooltipContent>Show Question Sequence HUD</TooltipContent>
       </Tooltip>
     </div>
     ```

### Step 4: Light Theme Ambient Radial Gradients & Elevation in `src/styles/theme.css`
In `src/styles/theme.css`:

1. **Light Theme Ambient Radial Backgrounds:**
   - In `.theme-microsoft-blue, [data-theme="microsoft-blue"], [data-theme="clean"], [data-theme="white"]` (~lines 370–408), add:
     ```css
     background-image: radial-gradient(
       ellipse 80% 50% at 50% 0%,
       rgba(37, 99, 235, 0.05) 0%,
       rgba(37, 99, 235, 0.01) 50%,
       transparent 100%
     );
     ```
   - In `.theme-green-choice, [data-theme="green-choice"], .theme-sweet-digs, [data-theme="sweet-digs"]` (~lines 409–449), add:
     ```css
     background-image: radial-gradient(
       ellipse 80% 50% at 50% 0%,
       rgba(22, 163, 74, 0.06) 0%,
       rgba(22, 163, 74, 0.01) 50%,
       transparent 100%
     );
     ```
2. **Option Card Resting Elevation:**
   - Ensure `.presentation-option-card` includes resting shadow:
     ```css
     box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
     ```

---

## 3. Strict Acceptance Criteria & Guardrails

- [ ] **FocusQuizRunner Theming:** Root element in `FocusQuizRunner.tsx` includes both `theme-${activeThemeId}` and `data-theme={activeThemeId}`.
- [ ] **Expanded Viewport Width:** Header, main stage, and question containers expand to `max-w-2xl lg:max-w-3xl w-full mx-auto`.
- [ ] **FocusQuiz Option Parity:** Options use `.presentation-option-card`, constant alphanumeric badge (`A`, `B`, `C`), and single right-side `CheckCircle2`.
- [ ] **Riseup Hairline Accent:** 2px hairline chrome accent indicator (`h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md mx-auto mb-3`) displays for Riseup theme in `FocusQuizRunner.tsx`.
- [ ] **Floating Dock Symmetry:** Both PresenterHUD and Sequence Drawer trigger anchor at `bottom-6` baseline (`bottom-6 right-6` and `bottom-6 left-6`) with `rounded-xl` and `backdrop-blur-xl bg-card/85`.
- [ ] **Compact Controls:** HUD buttons and drag handle refined to `h-7 w-7` / compact size.
- [ ] **Light Theme Ambient Gradients:** Radial gradient ambient lighting added to `clean` and `green-choice` in `src/styles/theme.css`.
- [ ] **Strict Relative Git Paths:** All paths in documentation and code references are relative Git paths.
- [ ] **Boolean Cleanliness:** Positive conditions evaluated implicitly; only `is` and `has` prefixes used.

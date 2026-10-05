# Subtask 01: FormRunner Presentation Container Lateral Expansion, Highlighted Question Step Badge, and Top Center Bar Cleanup

**Subtask ID:** `16-fullscreen-and-responsive-presentation-layout-01`  
**Status:** Pending  
**Assignee:** Worker 01  
**Target Files:**  
- `src/components/runner/FormRunner.tsx`  
**Referenced Specification:** `02-spec/21-app/07-fullscreen-and-responsive-presentation-layout/03-fullscreen-hud-and-action-alignment.md`  

---

## 1. Objective & Scope

Worker 01 is tasked with expanding the presentation canvas container bounds in `src/components/runner/FormRunner.tsx` to support immersive fullscreen and large-screen display resolutions, elevating the top meta question indicator into an elevated highlighted pill badge, and sanitizing the top bar layout in presentation mode to eliminate visual clutter and ensure zero candidate response artifacts.

---

## 2. Detailed Implementation Instructions

### Step 1: Presentation Canvas Container Lateral & Vertical Expansion
In `src/components/runner/FormRunner.tsx`:

1. **Outer Viewport Container Expansion (~lines 2091–2097):**
   - Locate the container wrapper enclosing the runner stage:
     ```tsx
     <div className={`mx-auto ${
       effectiveLayoutMode !== 'standard'
         ? 'space-y-0 w-full max-w-6xl px-4 sm:px-6 lg:px-8'
         : activeThemeId === 'clean-wide'
         ? 'space-y-5 max-w-7xl'
         : 'space-y-5 max-w-6xl'
     }`}>
     ```
   - **Remediation:** Upgrade `effectiveLayoutMode !== 'standard'` width to immersive presentation dimensions:
     ```tsx
     <div className={`mx-auto ${
       effectiveLayoutMode !== 'standard'
         ? 'space-y-0 w-full max-w-7xl 2xl:max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-12 transition-all duration-300'
         : activeThemeId === 'clean-wide'
         ? 'space-y-5 max-w-7xl'
         : 'space-y-5 max-w-6xl'
     }`}>
     ```

2. **Main Slide Canvas Minimum Height Elevation (~line 2491):**
   - Locate the presentation slide canvas wrapper:
     ```tsx
     <div
       key={currentField.id}
       className={`w-full min-h-[82vh] lg:min-h-[85vh] xl:min-h-[88vh] flex flex-col justify-center bg-transparent border-0 rounded-none shadow-none px-4 sm:px-8 lg:px-12 py-4 relative ${activeTransitionClass}`}
     >
     ```
   - **Remediation:** Expand the viewport track target:
     ```tsx
     <div
       key={currentField.id}
       className={`w-full min-h-[85vh] lg:min-h-[88vh] xl:min-h-[92vh] flex flex-col justify-center bg-transparent border-0 rounded-none shadow-none px-4 sm:px-8 lg:px-12 py-4 relative ${activeTransitionClass}`}
     >
     ```

---

### Step 2: Elevated Highlighted Question Step Badge
In `src/components/runner/FormRunner.tsx`, locate the top meta question indicator above the slide layout (~lines 2558–2580):

1. **Upgrade Question Step Badge:**
   - Locate the slide counter element:
     ```tsx
     {(activeForm.settings?.showSlideNumbers ?? true) && (
       <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-xs font-mono font-medium text-muted-foreground">
         <span>Question {currentStep + 1} of {visibleFields.length}</span>
       </div>
     )}
     ```
   - **Remediation:** Upgrade into an elevated highlighted pill badge:
     ```tsx
     {(activeForm.settings?.showSlideNumbers ?? true) && (
       <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border/60 bg-card/85 backdrop-blur-md text-xs font-mono font-semibold shadow-xs">
         <span className="text-primary font-bold">
           Question {currentStep + 1}
         </span>
         <span className="text-muted-foreground/50">•</span>
         <span className="text-muted-foreground">
           {visibleFields.length} Total
         </span>
       </div>
     )}
     ```

2. **Refine Difficulty and Points Indicator (~lines 2566–2577):**
   - Retain the difficulty pill styling with subtle border definition:
     ```tsx
     {currentField.difficulty && (
       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${
         currentField.difficulty === 'hard'
           ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
           : currentField.difficulty === 'medium'
           ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400'
           : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400'
       }`}>
         <span className="font-semibold">{currentField.difficulty}</span>
         <span className="opacity-60">•</span>
         <span className="font-mono">{currentField.customPointsOverride ?? (currentField.difficulty === 'hard' ? 20 : currentField.difficulty === 'medium' ? 10 : 5)} pt</span>
       </div>
     )}
     ```

---

### Step 3: Top Center Presentation Bar Cleanup & Anti-Collision Verification
In `src/components/runner/FormRunner.tsx`:

1. **Verify Presentation Top Controls Docking (~lines 2050–2090):**
   - Ensure the sticky timer badge and fullscreen toggle remain cleanly docked in the top-right corner without bleeding into the canvas center.
   - Confirm that when in presentation mode (`effectiveLayoutMode !== 'standard'`), standard mode project selectors and dev controls remain tucked away from the main optical view.
2. **Zero Candidate Response Verification:**
   - Audit the DOM output to confirm zero instances of "Candidate Response" or related unwanted subheadings exist in the presentation canvas.
3. **Implicit Boolean & Polarity Standards:**
   - Verify all boolean checks use implicit evaluation (`if (isCurrentFieldRequired)`) and eliminate any mixed polarity conditions (`if (a && !b)`).

---

## 3. Verification & Acceptance Checklist

- [ ] Presentation container expands to `max-w-7xl 2xl:max-w-[1500px]` with `min-h-[85vh] lg:min-h-[88vh] xl:min-h-[92vh]`.
- [ ] Question step badge features an elevated highlighted pill with `bg-card/85 backdrop-blur-md border border-border/60 shadow-xs`.
- [ ] Difficulty and points chips display crisp hairline borders and optical equilibrium.
- [ ] No layout collisions occur between top controls and slide contents.
- [ ] Zero instances of "Candidate Response" exist in runner views.
- [ ] Strictly relative Git paths maintained in all documentation and comments.

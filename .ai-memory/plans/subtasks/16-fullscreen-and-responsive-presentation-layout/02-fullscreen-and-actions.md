# Subtask 02: FormRunner Right Column Downward Stretch, Action Bar Baseline, Fluid Typography & FocusQuizRunner Parity

**Subtask ID:** `16-fullscreen-and-responsive-presentation-layout-02`  
**Status:** Pending  
**Assignee:** Worker 02  
**Target Files:**  
- `src/lib/presentation-layout.ts`  
- `src/components/runner/FormRunner.tsx`  
- `src/components/runner/FocusQuizRunner.tsx`  
**Referenced Specification:** `02-spec/21-app/07-fullscreen-and-responsive-presentation-layout/03-fullscreen-hud-and-action-alignment.md`  

---

## 1. Objective & Scope

Worker 02 is tasked with implementing the downward push architecture in `src/components/runner/FormRunner.tsx` to anchor navigation action controls permanently to the slide floor, upgrading the dynamic typography utility in `src/lib/presentation-layout.ts` with complete 5-breakpoint responsive scaling, and bringing `src/components/runner/FocusQuizRunner.tsx` into optical parity with executive presentation standards across container widths (`max-w-4xl`), elevated question step badges, and standardized option badges.

---

## 2. Detailed Implementation Instructions

### Step 1: Fluid Multi-Breakpoint Typography in `src/lib/presentation-layout.ts`
In `src/lib/presentation-layout.ts`, locate `getDynamicTitleTypographyClass` (~lines 30–42):

1. **Replace Dynamic Typography Classes:**
   - **Current Implementation:**
     ```ts
     export function getDynamicTitleTypographyClass(title?: string): string {
       const charCount = title?.trim().length || 0;

       if (charCount > 80) {
         return 'text-2xl sm:text-3xl lg:text-4xl leading-snug';
       }

       if (charCount > 45) {
         return 'text-3xl sm:text-4xl lg:text-5xl leading-[1.2]';
       }

       return 'text-4xl sm:text-5xl lg:text-6xl leading-[1.15]';
     }
     ```
   - **Remediation:** Replace with full 5-breakpoint responsiveness and authoritative weights:
     ```ts
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

---

### Step 2: FormRunner 2-Column Grid & Right Column Downward Stretch in `src/components/runner/FormRunner.tsx`
In `src/components/runner/FormRunner.tsx`:

1. **Update 2-Column Presentation Grid Container (~line 2701):**
   - Replace:
     ```tsx
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full min-h-[60vh] lg:min-h-[68vh] xl:min-h-[72vh] my-auto">
     ```
   - With:
     ```tsx
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 w-full min-h-[70vh] lg:min-h-[78vh] xl:min-h-[82vh] my-auto">
     ```
   - *Note:* Removing `items-center` from the parent grid allows child columns to stretch to the full track height.

2. **Verify Left Column Self-Centering (~line 2702):**
   - Confirm that the left column retains `lg:self-center` so the question title and context remain vertically centered within the presentation canvas:
     ```tsx
     <div className={`w-full space-y-6 flex flex-col justify-center lg:self-center ${
       effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-2' : 'lg:order-1'
     }`}>
     ```

3. **Update Right Column Height Stretch & Downward Offset (~line 2761):**
   - Replace:
     ```tsx
     <div className={`w-full h-full flex flex-col justify-between pt-2 lg:pt-6 xl:pt-8 ${
       effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
     }`}>
     ```
   - With:
     ```tsx
     <div className={`w-full h-full lg:self-stretch flex flex-col justify-between pt-4 sm:pt-6 lg:pt-10 xl:pt-14 ${
       effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
     }`}>
     ```

4. **Anchor Navigation Action Bar with Hairline Baseline (~line 2780):**
   - Replace:
     ```tsx
     <div className="mt-auto pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
     ```
   - With:
     ```tsx
     <div className="mt-auto pt-6 sm:pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
     ```

---

### Step 3: FocusQuizRunner Parity & Standardized Options in `src/components/runner/FocusQuizRunner.tsx`
In `src/components/runner/FocusQuizRunner.tsx`:

1. **Header Container Width Alignment (~line 827):**
   - Replace:
     ```tsx
     <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
     ```
   - With:
     ```tsx
     <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
     ```

2. **Main Stage Width Alignment (~line 925):**
   - Replace:
     ```tsx
     <main className="flex-1 max-w-2xl lg:max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
     ```
   - With:
     ```tsx
     <main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
     ```

3. **Stage Question Header Alignment (~line 1096):**
   - Update `<h2>` max width from `max-w-md` to `max-w-2xl lg:max-w-3xl xl:max-w-4xl`.

4. **Sticky Bottom Footer Width Alignment (~line 1559):**
   - Replace:
     ```tsx
     <div className="max-w-md mx-auto space-y-2">
     ```
   - With:
     ```tsx
     <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto space-y-2">
     ```

5. **Elevated Highlighted Question Step Badge (~lines 1069–1079):**
   - Replace:
     ```tsx
     <div className="flex items-center gap-2">
       <Badge variant="outline" className="text-xs uppercase font-mono">
         Question {currentQuestionIndex + 1} of {totalQuestions}
       </Badge>
       {isRandomized && (
         <Badge variant="secondary" className="text-xs">
           🔀 Shuffled
         </Badge>
       )}
     </div>
     ```
   - With:
     ```tsx
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
     ```

6. **Standardize Option Badges (`w-9 h-9 sm:w-10 sm:h-10 rounded-xl`) (~lines 1207–1217):**
   - Replace:
     ```tsx
     <span
       className={`option-badge w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all duration-200 ${
         isSelected
           ? isRiseupTheme
             ? 'bg-[#E8C547] text-[#0A0A14] border-[#E8C547]'
             : 'bg-primary text-primary-foreground border-primary'
           : 'bg-muted/70 text-muted-foreground border-border/70'
       }`}
     >
       {String.fromCharCode(65 + optIdx)}
     </span>
     ```
   - With:
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

## 3. Verification & Acceptance Checklist

- [ ] `getDynamicTitleTypographyClass` outputs 5 responsive breakpoints with `font-bold` and `font-black` weights.
- [ ] 2-column grid targets `min-h-[70vh] lg:min-h-[78vh] xl:min-h-[82vh]` without `items-center` collapse.
- [ ] Left column applies `lg:self-center`, right column applies `lg:self-stretch`.
- [ ] Action buttons anchor to bottom floor via `mt-auto` with `border-t border-border/20`.
- [ ] `FocusQuizRunner.tsx` header, main stage, question prompt, and footer expand to `max-w-2xl lg:max-w-3xl xl:max-w-4xl`.
- [ ] `FocusQuizRunner.tsx` step badge matches elevated highlighted pill format.
- [ ] Option badges standardize to `w-9 h-9 sm:w-10 sm:h-10 rounded-xl`.
- [ ] Implicit booleans and strict relative Git paths maintained.

# Subtask 01: FormRunner Canvas Optical Equilibrium, Option Card Redesign, and Double-Checkmark Removal

**Subtask ID:** `15-quiz-system-ui-ux-modernization-01`  
**Status:** Pending  
**Assignee:** Worker 01  
**Target Files:**  
- `src/components/runner/FormRunner.tsx`  
- `src/styles/theme.css`  
**Referenced Specification:** `02-spec/21-app/06-quiz-system-ui-ux-modernization/03-cross-theme-and-runner-parity.md`  

---

## 1. Objective & Scope

Worker 01 is tasked with implementing optical equilibrium across the presentation canvas in `src/components/runner/FormRunner.tsx`, redesigning option cards to enforce the executive single-indicator standard, eliminating the legacy double-checkmark pattern across all choice inputs, and synchronizing resting option card elevation in `src/styles/theme.css`.

---

## 2. Detailed Implementation Instructions

### Step 1: Remove Double-Checkmark Pattern in Multiple-Choice / Checkbox Options
In `src/components/runner/FormRunner.tsx`, locate the `multiple_choice` and checkbox renderer within `renderFieldInput` (~lines 3950–4050).

1. **Badge Icon Swap Eradication:**
   - Locate the option badge element (currently ~line 3961–3967):
     ```tsx
     <span className={`option-badge w-8 h-8 rounded-lg border flex items-center justify-center font-sans text-xs font-bold shrink-0 transition-all duration-200 ${
       isSelected
         ? 'bg-primary text-primary-foreground border-primary'
         : 'bg-muted/70 text-muted-foreground border-border/70'
     }`}>
       {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : String.fromCharCode(65 + optIndex)}
     </span>
     ```
   - **Remediation:** Remove `{isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : String.fromCharCode(65 + optIndex)}`.
   - **Replacement:** Always render the static alphanumeric letter:
     ```tsx
     <span className={`option-badge w-8 h-8 rounded-lg border flex items-center justify-center font-sans text-xs font-bold shrink-0 transition-all duration-200 ${
       isSelected
         ? 'bg-primary text-primary-foreground border-primary'
         : 'bg-muted/70 text-muted-foreground border-border/70'
     }`}>
       {String.fromCharCode(65 + optIndex)}
     </span>
     ```
2. **"Other" Option Badge Normalization:**
   - Locate the `allowOtherOption` badge (~lines 3998–4004):
     ```tsx
     <span className={`option-badge w-8 h-8 rounded-lg border flex items-center justify-center font-sans text-xs font-bold shrink-0 transition-all duration-200 ${
       hasOther
         ? 'bg-primary text-primary-foreground border-primary'
         : 'bg-muted/70 text-muted-foreground border-border/70'
     }`}>
       {hasOther ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : String.fromCharCode(65 + options.length)}
     </span>
     ```
   - **Remediation:** Replace `{hasOther ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : String.fromCharCode(65 + options.length)}` with `String.fromCharCode(65 + options.length)`.
3. **Preserve Single Right-Side `CheckCircle2`:**
   - Confirm that the single right-aligned `CheckCircle2` indicator remains intact:
     ```tsx
     {isSelected && (
       <CheckCircle2
         className={`w-5 h-5 shrink-0 ml-auto ${
           isRiseupTheme ? 'text-[#E8C547]' : 'text-emerald-500'
         }`}
       />
     )}
     ```

### Step 2: Remove Double-Checkmark Pattern in Single Choice, Radio & True/False Inputs
In `src/components/runner/FormRunner.tsx`, locate the `single_choice` and `true_false` sections inside `renderFieldInput` (~lines 4165–4280).

1. **Radio Option Badge Letter Preservation:**
   - Locate lines ~4193–4199:
     ```tsx
     <span className={`option-badge w-8 h-8 rounded-lg border flex items-center justify-center font-sans text-xs font-bold shrink-0 transition-all duration-200 ${
       isSelected
         ? 'bg-primary text-primary-foreground border-primary'
         : 'bg-muted/70 text-muted-foreground border-border/70'
     }`}>
       {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : String.fromCharCode(65 + optIndex)}
     </span>
     ```
   - **Remediation:** Change child to `String.fromCharCode(65 + optIndex)` unconditionally.
2. **Single Choice "Other" Badge Letter Preservation:**
   - Locate lines ~4230–4236:
     ```tsx
     {hasOther ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : String.fromCharCode(65 + options.length)}
     ```
   - **Remediation:** Change child to `String.fromCharCode(65 + options.length)` unconditionally.
3. **Single Right-Side Indicator Verification:**
   - Confirm that the only check indicator rendered upon selection is the right-aligned `CheckCircle2`.

### Step 3: Validate FormRunner Presentation Canvas Optical Equilibrium
In `src/components/runner/FormRunner.tsx`, inspect the 2-column presentation layout structure (~lines 2679–2745):

1. **Grid Optical Centering:**
   - Ensure the outer grid maintains vertical optical alignment:
     ```tsx
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full my-auto">
     ```
2. **Left Column Title Equilibrium:**
   - Ensure the left column retains `w-full space-y-6 flex flex-col justify-center lg:self-center`.
   - Ensure the Riseup theme 2px hairline chrome accent is present and unmodified:
     ```tsx
     {isRiseupTheme && (
       <div className="h-0.5 w-16 bg-[#E8C547] rounded-full shadow-md mb-3" />
     )}
     ```
3. **Right Column Controlled Downward Offset:**
   - Ensure the right options column retains its deliberate optical offset:
     ```tsx
     <div className={`w-full space-y-6 flex flex-col justify-center pt-2 lg:pt-6 xl:pt-8 ${
       effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'
     }`}>
     ```
4. **Candidate Response Erasure Verification:**
   - Audit the DOM node tree to confirm zero residual instances of `Candidate Response` or related subheadings exist.

### Step 4: Option Motion Class & Surface Depth Refinement
In `src/styles/theme.css`:
1. Ensure `.presentation-option-card` contains resting surface depth:
   ```css
   .presentation-option-card {
     opacity: 0.82;
     box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
     transition:
       transform 220ms cubic-bezier(0.2, 0, 0, 1),
       box-shadow 220ms ease,
       border-color 220ms ease,
       background-color 220ms ease,
       opacity 220ms ease;
     will-change: transform, opacity, box-shadow;
   }
   ```
2. Validate hover state delivers tactile feedback:
   ```css
   .presentation-option-card:hover {
     opacity: 1;
     transform: translate3d(6px, 0, 0);
     border-color: hsl(var(--primary) / 0.55);
     background-color: hsl(var(--primary) / 0.08);
     box-shadow: 0 10px 25px -4px hsl(var(--primary) / 0.2), 0 2px 6px -1px rgba(0, 0, 0, 0.25);
   }
   ```

---

## 3. Strict Acceptance Criteria & Guardrails

- [ ] **Constant Alphanumeric Badges:** Every multiple-choice and single-choice badge strictly displays `A`, `B`, `C`, etc. regardless of whether the option is selected.
- [ ] **Single Right-Hand Check Indicator:** Selected options render exactly one `CheckCircle2` icon positioned at `ml-auto`.
- [ ] **Riseup Gold Indicator Compliance:** For Riseup theme, active `CheckCircle2` is styled with `text-[#E8C547]`; for all other themes, `text-emerald-500`.
- [ ] **Optical Balance:** 2-column presentation grid has vertically centered title column (`lg:self-center`) and downward-offset options column (`pt-2 lg:pt-6 xl:pt-8`).
- [ ] **Strict Relative Git Paths:** Zero absolute filesystem paths or file URI schemes in any modified files.
- [ ] **Boolean Cleanliness:** Positive conditions evaluated implicitly; no explicit true checks; only `is` and `has` booleans used.

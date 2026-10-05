# Subtask 13-01: FormRunner Centered Presentation Layout, CSS3 GPU Motion & Progress Line Hoisting

## Subtask Identity
- **Subtask ID:** `13-presentation-slide-customization/01-runner-layout-animations`
- **Parent Task:** `63-presentation-slide-customization`
- **Assigned Worker:** Worker 01
- **Focus Area:** Runner centered presentation layout, CSS3 hardware acceleration, typography scaling, ceiling-flush progress line.
- **Reference Specs:**
  - `02-spec/21-app/04-presentation-slide-customization/01-overview.md`
  - `02-spec/21-app/04-presentation-slide-customization/02-centered-layout-and-animations.md`

---

## 1. Target Files & Responsibilities

| File Path | Action | Description of Changes |
|---|---|---|
| `src/lib/presentation-layout.ts` | Modify | Export `getDynamicTitleTypographyClass(title: string): string` helper with 45 and 80 character thresholds. |
| `src/styles/theme.css` | Modify | Remove `scale(0.98)` from `cardEntrance` keyframes, tighten `slideInUpSoft` stagger delays to 30ms increments, optimize `.presentation-option-card:hover` GPU transform. |
| `src/index.css` | Modify | Eliminate DOM-wide universal `* { transition: ... 250ms }` churn by scoping transitions strictly to interactive form controls. |
| `src/components/runner/FormRunner.tsx` | Modify | Hoist top progress line outside keyed slide container to root viewport; implement centered presentation slide container (`max-w-3xl`, `max-w-2xl`, `max-w-xl`); apply dynamic typography class; remove conflicting `hover:translate-x-2` class. |
| `src/test/spec17-presentation-split-layout.test.ts` | Modify / Extend | Add unit test suite verifying dynamic typography threshold logic, centered presentation class constraints, and animation invariants. |

---

## 2. Step-by-Step Implementation Instructions

### Step 1: Implement Dynamic Title Typography Function in `src/lib/presentation-layout.ts`
1. Open `src/lib/presentation-layout.ts`.
2. Implement and export `getDynamicTitleTypographyClass`:
   ```typescript
   /**
    * Computes dynamic Tailwind typography classes based on question title length
    * to ensure optimal visual balance across slide presentation viewports.
    */
   export function getDynamicTitleTypographyClass(title?: string): string {
     const text = (title || '').trim();
     const len = text.length;

     if (len > 80) {
       return 'text-2xl sm:text-3xl lg:text-4xl leading-snug';
     }

     if (len > 45) {
       return 'text-3xl sm:text-4xl lg:text-5xl leading-[1.2]';
     }

     return 'text-4xl sm:text-5xl lg:text-6xl leading-[1.15]';
   }
   ```
3. Ensure the function handles `undefined`, `null`, and empty strings safely, defaulting to the short-title class (`text-4xl sm:text-5xl lg:text-6xl leading-[1.15]`).

### Step 2: GPU-Accelerated CSS3 Motion Pipeline in `src/styles/theme.css`
1. Locate `@keyframes cardEntrance` in `src/styles/theme.css`.
2. Remove `scale(0.98)` to eliminate subpixel glyph blur and rasterization stutter:
   ```css
   @keyframes cardEntrance {
     0% {
       opacity: 0;
       transform: translate3d(0, 10px, 0);
     }
     100% {
       opacity: 1;
       transform: translate3d(0, 0, 0);
     }
   }
   ```
3. Update `.animate-card-entrance`:
   ```css
   .animate-card-entrance {
     animation: cardEntrance 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
     will-change: transform, opacity;
   }
   ```
4. Locate `@keyframes slideInUpSoft` and tighten duration to `0.2s cubic-bezier(0.16, 1, 0.3, 1)`.
5. Update stagger utility classes to 30ms micro-stagger increments:
   ```css
   .stagger-1 { animation-delay: 0.03s; }
   .stagger-2 { animation-delay: 0.06s; }
   .stagger-3 { animation-delay: 0.09s; }
   .stagger-4 { animation-delay: 0.12s; }
   .stagger-5 { animation-delay: 0.15s; }
   .stagger-6 { animation-delay: 0.18s; }
   ```
6. Verify `.presentation-option-card:hover` uses clean GPU translation:
   ```css
   .presentation-option-card:hover {
     transform: translate3d(4px, 0, 0);
   }
   ```

### Step 3: Remove Universal Transition Churn in `src/index.css`
1. Locate any broad selector rule `* { transition: ... }` in `src/index.css`.
2. Scope transitions explicitly to interactive form elements:
   ```css
   button, input, select, textarea, a {
     transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
     transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
     transition-duration: 150ms;
   }
   ```
3. Verify that non-interactive layout containers, wrappers, and text blocks do not inherit arbitrary property transitions that trigger paint recalculations during slide mounting.

### Step 4: Hoist Ceiling-Flush Progress Bar in `src/components/runner/FormRunner.tsx`
1. Locate the `<Progress />` element currently trapped inside `<div key={currentField.id} className="... relative">`.
2. Move this progress bar container to the top-level viewport root of `FormRunner.tsx`:
   ```tsx
   {/* Ceiling-Flush Fixed Top Progress Bar */}
   <div className="fixed top-0 left-0 right-0 w-full h-1 sm:h-1.5 z-50 pointer-events-none">
     <Progress
       value={Math.round(((stepHistory.length + 1) / Math.max(visibleFields.length, 1)) * 100)}
       className={`h-full rounded-none transition-all duration-300 ${
         isRiseupTheme
           ? 'bg-black/40 [&>div]:bg-[#3A3A55]'
           : 'bg-secondary'
       }`}
     />
   </div>
   ```
3. Because this element resides outside the keyed slide wrapper, it will maintain persistent DOM mounting across question transitions with zero repositioning jitter.

### Step 5: Implement Centered Presentation Slide Layout & Clean Hover Classes in `src/components/runner/FormRunner.tsx`
1. In `FormRunner.tsx`, when `effectiveLayoutMode === 'centered'` or when rendering centered presentation mode:
   - Outer container:
     ```tsx
     <div
       key={currentField.id}
       className="w-full min-h-[calc(100dvh-3rem)] max-w-3xl mx-auto flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-8 space-y-8 animate-card-entrance relative"
     >
     ```
   - Question header & title block:
     ```tsx
     <div className="w-full max-w-2xl mx-auto text-center space-y-4">
       {/* Meta bar centered */}
       <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-muted-foreground">
         {/* Counter & difficulty pills */}
       </div>

       {/* Scaled Question Title */}
       <h2 className={`font-heading font-bold text-foreground tracking-tight transition-all duration-150 ${getDynamicTitleTypographyClass(currentField.label)}`}>
         {currentField.label}
       </h2>

       {/* Optional Subtitle / Description */}
       {currentField.subtitle && (
         <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-xl mx-auto">
           {currentField.subtitle}
         </p>
       )}
     </div>
     ```
   - Option cards stack:
     ```tsx
     <div className="w-full max-w-xl mx-auto space-y-3">
       {/* Option cards mapped with stagger classes */}
     </div>
     ```
2. Remove `hover:translate-x-2` from `choiceMotionClass` in `FormRunner.tsx` to prevent Tailwind conflicting with the CSS3 `.presentation-option-card:hover` rule.

### Step 6: Vitest Unit Test Implementation in `src/test/spec17-presentation-split-layout.test.ts`
1. Open `src/test/spec17-presentation-split-layout.test.ts`.
2. Add comprehensive unit tests covering:
   - `getDynamicTitleTypographyClass`:
     - Short title (`<= 45` chars): asserts `text-4xl sm:text-5xl lg:text-6xl leading-[1.15]`.
     - Medium title (`46–80` chars): asserts `text-3xl sm:text-4xl lg:text-5xl leading-[1.2]`.
     - Long title (`> 80` chars): asserts `text-2xl sm:text-3xl lg:text-4xl leading-snug`.
     - Handles empty/undefined strings without throwing.
   - CSS3 Animation classes and container constraints:
     - Verify layout mode resolver outputs correct classes for centered layout.

---

## 3. Verification & Compliance Checklist

- [ ] `getDynamicTitleTypographyClass` exported and covered by unit tests.
- [ ] `@keyframes cardEntrance` uses pure `translate3d` without any `scale()` values.
- [ ] `@keyframes slideInUpSoft` stagger intervals use 30ms offsets.
- [ ] Universal `*` transition rule removed from `src/index.css`.
- [ ] Progress line hoisted to fixed ceiling position (`top: 0`, `z-index: 50`).
- [ ] Centered layout enforces `max-w-3xl`, `max-w-2xl`, and `max-w-xl` constraints.
- [ ] All paths are relative Git paths.
- [ ] Strict lowercase filenames followed.

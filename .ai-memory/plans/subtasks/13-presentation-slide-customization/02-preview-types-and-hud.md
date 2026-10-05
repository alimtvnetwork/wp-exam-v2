# Subtask 13-02: Preview Types Dropdown, Slide Numbering Toggle & PresenterHUD Persistence

## Subtask Identity
- **Subtask ID:** `13-presentation-slide-customization/02-preview-types-and-hud`
- **Parent Task:** `63-presentation-slide-customization`
- **Assigned Worker:** Worker 02
- **Focus Area:** Extended layout modes, slide numbering toggle, SortableFieldCard dropdown, PresenterHUD live controls, dual-layer Zustand/localStorage persistence.
- **Reference Specs:**
  - `02-spec/21-app/04-presentation-slide-customization/01-overview.md`
  - `02-spec/21-app/04-presentation-slide-customization/03-preview-types-and-persistence.md`

---

## 1. Target Files & Responsibilities

| File Path | Action | Description of Changes |
|---|---|---|
| `src/lib/types/form.ts` | Modify | Extend `QuestionLayoutMode` with `'centered' \| 'split_right' \| 'split_left' \| 'cards_grid'`; add `showSlideNumbers?: boolean` to `FormSettings`. |
| `src/lib/presentation-layout.ts` | Modify | Update `resolveQuestionLayoutMode` to handle all 6 modes; export layout mode descriptor constants. |
| `src/quiz/store/useQuizStore.ts` | Modify | Update `BatchApplyConfigOptions` and `initialSettings` to support `showSlideNumbers` and all extended layout modes. |
| `src/components/forms/FormBuilder.tsx` | Modify | Add `Slide #` toggle button to presentation controls bar; add "Show Slide Numbers" `<Switch>` to Settings tab; update Default Question Layout selector with all 6 modes. |
| `src/components/forms/sortable-field-card.tsx` | Modify | Replace binary toggle with `<Select>` layout dropdown in card header; enhance context menu with layout mode selector submenu. |
| `src/components/runner/floating-controls.tsx` | Modify | Extend `PresenterHUD` with layout selector dropdown, slide numbering toggle button, and "Save Layout to Quiz" action button. |
| `src/components/runner/FormRunner.tsx` | Modify | Render ceiling-flush progress pill badge beneath top progress line; respect `showSlideNumbers` in meta bar; render layout variants (`centered`, `cards_grid`, `split_right`, `split_left`); wire `PresenterHUD` callbacks to Zustand and `localStorage['wp_exam_draft_*']`. |
| `src/test/spec17-presentation-split-layout.test.ts` | Modify / Extend | Add unit tests for extended layout resolution, slide numbering toggle states, and draft persistence serialization. |

---

## 2. Step-by-Step Implementation Instructions

### Step 1: Extend Types in `src/lib/types/form.ts`
1. Locate `export type QuestionLayoutMode` in `src/lib/types/form.ts`.
2. Extend the union to include all 6 supported layout modes:
   ```typescript
   export type QuestionLayoutMode =
     | 'standard'
     | 'centered'
     | 'presentation_split'
     | 'split_right'
     | 'split_left'
     | 'cards_grid';
   ```
3. Locate `export interface FormSettings` in `src/lib/types/form.ts`.
4. Add the `showSlideNumbers` configuration field:
   ```typescript
   export interface FormSettings {
     // ...existing settings
     showSlideNumbers?: boolean;
   }
   ```

### Step 2: Update Layout Resolution Engine in `src/lib/presentation-layout.ts`
1. Open `src/lib/presentation-layout.ts`.
2. Ensure `resolveQuestionLayoutMode` handles all 6 modes cleanly:
   ```typescript
   export function resolveQuestionLayoutMode(params: ResolveLayoutModeParams): QuestionLayoutMode {
     const runtime = params.runtimeOverride;
     if (runtime) {
       if (runtime !== 'default') {
         return runtime;
       }
     }

     const field = params.fieldMode;
     if (field) {
       return field;
     }

     const formDef = params.formDefaultMode;
     if (formDef) {
       return formDef;
     }

     return 'standard';
   }
   ```
3. Export layout descriptor constants for reusable UI rendering:
   ```typescript
   export interface LayoutModeOption {
     id: QuestionLayoutMode;
     name: string;
     desc: string;
   }

   export const QUESTION_LAYOUT_OPTIONS: LayoutModeOption[] = [
     { id: 'standard', name: 'Standard Quiz', desc: 'Single-card vertical question stack' },
     { id: 'centered', name: 'Centered Slide', desc: 'Focused vertical-center presentation slide' },
     { id: 'presentation_split', name: 'Split Screen (Auto)', desc: 'Adaptive dual-column presentation' },
     { id: 'split_right', name: 'Split (Answers Right)', desc: 'Question on left, answers on right' },
     { id: 'split_left', name: 'Split (Answers Left)', desc: 'Answers on left, question on right' },
     { id: 'cards_grid', name: 'Cards Grid', desc: 'Multi-column grid for choice options' },
   ];
   ```

### Step 3: Update Zustand Store in `src/quiz/store/useQuizStore.ts`
1. Update `initialSettings` in `src/quiz/store/useQuizStore.ts`:
   ```typescript
   const initialSettings: FormSettings = {
     // ...
     showSlideNumbers: true,
     defaultQuestionLayout: 'standard',
   };
   ```
2. Verify `batchApplyConfig` accepts any of the 6 `QuestionLayoutMode` values.

### Step 4: Add Slide Number Toggle and Layout Dropdowns in `src/components/forms/FormBuilder.tsx`
1. In `src/components/forms/FormBuilder.tsx`, presentation controls bar:
   - Import `Hash` from `lucide-react`.
   - Add quick toggle button for `Slide #`:
     ```tsx
     <Tooltip>
       <TooltipTrigger asChild>
         <button
           type="button"
           onClick={() => {
             const nextState = settings.showSlideNumbers === false;
             updateSettings({ showSlideNumbers: nextState });
             handleSyncDraft();
             toast.info(nextState ? 'Slide numbers enabled' : 'Slide numbers hidden');
           }}
           className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
             settings.showSlideNumbers !== false
               ? 'bg-primary/10 border-primary/40 text-primary shadow-2xs font-bold'
               : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
           }`}
           aria-label="Toggle Slide Numbering"
         >
           <Hash className="w-3.5 h-3.5" />
           <span>Slide #</span>
           <span className={`w-1.5 h-1.5 rounded-full ${
             settings.showSlideNumbers !== false ? 'bg-primary' : 'bg-muted-foreground/40'
           }`} />
         </button>
       </TooltipTrigger>
       <TooltipContent>Toggle slide numbers and progression pill in presentation view</TooltipContent>
     </Tooltip>
     ```
2. In Settings tab Presentation Settings section:
   - Add `<Switch>` for `Show Slide Numbers`.
   - Update `defaultQuestionLayout` `<Select>` items to list all 6 layout modes (`standard`, `centered`, `presentation_split`, `split_right`, `split_left`, `cards_grid`).

### Step 5: Replace Header Toggle with Layout `<Select>` in `src/components/forms/sortable-field-card.tsx`
1. Open `src/components/forms/sortable-field-card.tsx`.
2. Locate the binary layout toggle buttons in the card header (lines ~710–746).
3. Replace with the layout mode `<Select>` dropdown:
   ```tsx
   <div className="shrink-0">
     <Select
       value={field.layoutMode || 'standard'}
       onValueChange={(val) => onUpdate(id, { layoutMode: val as QuestionLayoutMode })}
     >
       <SelectTrigger
         className="h-8 px-2.5 text-xs font-semibold bg-card border border-border rounded-lg shadow-2xs gap-1.5 cursor-pointer hover:bg-muted/50"
         aria-label="Question Display Preview Type"
       >
         <LayoutTemplate className="w-3.5 h-3.5 text-primary shrink-0" />
         <SelectValue placeholder="Layout" />
       </SelectTrigger>
       <SelectContent align="end" className="min-w-[15rem] bg-popover border-border z-[100]">
         {QUESTION_LAYOUT_OPTIONS.map((opt) => (
           <SelectItem key={opt.id} value={opt.id} className="text-xs py-2 cursor-pointer">
             <div className="font-semibold text-foreground">{opt.name}</div>
             <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
           </SelectItem>
         ))}
       </SelectContent>
     </Select>
   </div>
   ```
4. Update the card context menu (`DropdownMenu`) to provide a submenu for layout mode selection with active checkmarks.

### Step 6: Extend PresenterHUD in `src/components/runner/floating-controls.tsx`
1. Open `src/components/runner/floating-controls.tsx`.
2. Update `PresenterHUDProps` interface to include in-preview customization props:
   - `currentFieldId?: string;`
   - `showSlideNumbers?: boolean;`
   - `onToggleSlideNumbers?: () => void;`
   - `onUpdateFieldLayout?: (fieldId: string, layoutMode: QuestionLayoutMode) => void;`
   - `onSaveToQuiz?: () => void;`
   - `isSavePending?: boolean;`
3. Add Layout Selector dropdown to PresenterHUD dock:
   - Lists all 6 options from `QUESTION_LAYOUT_OPTIONS`.
   - Calling `onUpdateFieldLayout(currentFieldId, mode)` when selected.
4. Add `Slide #` toggle button:
   - Toggles slide numbering and updates visual active indicator.
5. Add `Save Layout` action button (`Save` icon with label):
   - One-click trigger for `onSaveToQuiz()`.

### Step 7: Connect FormRunner Handlers & Persistence in `src/components/runner/FormRunner.tsx`
1. Open `src/components/runner/FormRunner.tsx`.
2. Add ceiling-flush pill badge right below the top progress bar:
   ```tsx
   {activeForm.settings?.showSlideNumbers !== false && (
     <div
       className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in slide-in-from-top-1 duration-200"
       role="status"
       aria-label={`Slide ${currentStep + 1} of ${visibleFields.length}`}
     >
       <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-background/85 dark:bg-card/90 backdrop-blur-md border border-border/50 text-[11px] font-mono font-semibold text-foreground/80 shadow-xs tracking-tight">
         <span className="text-muted-foreground">Slide</span>
         <span className="text-primary font-bold">{currentStep + 1}</span>
         <span className="text-muted-foreground/60">/</span>
         <span className="text-muted-foreground">{visibleFields.length}</span>
       </div>
     </div>
   )}
   ```
3. Respect `showSlideNumbers` in the slide meta bar counter.
4. Implement handlers in `FormRunner.tsx`:
   - `handleUpdateFieldLayout(fieldId, layoutMode)`: updates `activeForm` state and `useQuizStore.getState().updateField(...)`.
   - `handleToggleSlideNumbers()`: toggles `showSlideNumbers` in `activeForm` and `useQuizStore.getState().updateSettings(...)`.
   - `handleSaveLayoutToQuiz()`: commits entire form draft to `localStorage.setItem('wp_exam_draft_' + slug, JSON.stringify(draftPayload))`.
5. Support layout branches for:
   - `centered`: Centered title, single-axis option card stack.
   - `split_right`: Question stem left, answer sheet right.
   - `split_left`: Answer sheet left, question stem right.
   - `cards_grid`: Responsive 2-column choice card grid (`grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto`).
6. Pass all props and callbacks to `<PresenterHUD />`.

### Step 8: Unit Test Verification in `src/test/spec17-presentation-split-layout.test.ts`
1. Add test cases verifying:
   - `resolveQuestionLayoutMode` correctly resolves `'centered'`, `'split_right'`, `'split_left'`, `'cards_grid'`.
   - `showSlideNumbers` defaults to `true` when omitted from settings.
   - Layout mode changes properly serialize into draft payload structure.

---

## 3. Verification & Compliance Checklist

- [ ] `QuestionLayoutMode` extended with 4 new variants (6 total).
- [ ] `showSlideNumbers?: boolean` added to `FormSettings` with positive boolean evaluation.
- [ ] `FormBuilder.tsx` contains `Slide #` quick toggle and Settings tab switch.
- [ ] `sortable-field-card.tsx` contains header `<Select>` layout dropdown and context menu submenu.
- [ ] `PresenterHUD` contains layout selector, slide numbers toggle, and "Save Layout" action.
- [ ] `FormRunner.tsx` displays flush pill badge beneath progress line when enabled.
- [ ] Dual-layer persistence wired to `useQuizStore` and `localStorage['wp_exam_draft_*']`.
- [ ] All paths are relative Git paths.
- [ ] Strict lowercase filenames followed.

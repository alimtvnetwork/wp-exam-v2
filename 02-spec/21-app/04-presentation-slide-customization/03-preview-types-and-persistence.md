# Presentation Slide Customization — Preview Types, Numbering & In-Preview Persistence Spec

This technical specification defines the data architecture, UI components, in-preview live customization HUD, and dual-layer persistence engine for question preview types, slide numbering, and real-time authoring synchronization in the quiz presentation runner.

---

## 1. Slide Numbering Architecture & Toggle Specification

### 1.1 Problem Statement & User Directive

In presentation slide mode, candidates and presenters require clear visibility into their sequential progression through slides. However, depending on the presentation context (e.g. timed assessment vs. blind diagnostic vs. executive pitch deck), authors must be able to selectively enable or disable slide numbering:

> *"in between, if we have the numbers like one, two, like the slides, that would be nice. And that could be enabled, disabled from the back end section or the slide section for the quizzes."*

When enabled, slide numbering must render both as an unobtrusive, ceiling-flush progress pill beneath the primary top progress line and as an aligned counter within the slide meta bar.

### 1.2 Data Schema: `FormSettings.showSlideNumbers`

To support persistent configuration across the entire form lifecycle, `FormSettings` in `src/lib/types/form.ts` is extended with an optional boolean property:

```typescript
export interface FormSettings {
  // Existing settings...
  timeLimitSeconds?: number;
  timerMode?: 'none' | 'global' | 'per_question' | 'per_difficulty' | 'per_tier';
  defaultQuestionLayout?: QuestionLayoutMode;
  defaultAnswerPlacement?: AnswerPlacementMode;
  
  /**
   * Whether slide numbers and progression pills are displayed in presentation mode.
   * When true or undefined (default), slide numbering (e.g. "Slide 3 / 10") appears.
   * When explicitly false, slide counters and numbering pills are hidden for a clean deck view.
   */
  showSlideNumbers?: boolean;
}
```

#### Default Evaluation Logic
Following the repository's positive boolean principles, slide numbering evaluates implicitly:
```typescript
const isSlideNumberingEnabled = activeForm.settings?.showSlideNumbers !== false;
```
If unset in legacy form records, `showSlideNumbers` defaults to `true` (slide numbers shown by default).

### 1.3 FormBuilder UI Controls

The slide numbering configuration is exposed to form authors in two primary locations in `src/components/forms/FormBuilder.tsx`:

#### A. Presentation Controls Bar (Quick Action)
Located in the builder header bar alongside the `Quiz | Slide` format selector:

```tsx
{/* Slide Numbering Quick Toggle */}
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

#### B. Settings Tab (Form Settings Panel)
Under the Presentation Settings section in the builder's Settings tab:

```tsx
{/* Show Slide Numbers Toggle */}
<div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card/60">
  <div className="space-y-0.5">
    <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
      <Hash className="w-4 h-4 text-primary" />
      <span>Show Slide Numbers</span>
    </div>
    <p className="text-xs text-muted-foreground">
      Display sequential slide numbers and progress pill (e.g. "Slide 3 / 10") in presentation mode.
    </p>
  </div>
  <Switch
    checked={settings.showSlideNumbers !== false}
    onCheckedChange={(checked) => {
      updateSettings({ showSlideNumbers: checked });
      handleSyncDraft();
    }}
  />
</div>
```

### 1.4 Runner Presentation UI: Flush Pill Badge & Counter

In `src/components/runner/FormRunner.tsx`, when `isSlideNumberingEnabled` evaluates to `true`, the runner renders two complementary indicators:

#### A. Ceiling-Flush Progress Pill Badge
Anchored immediately below the fixed ceiling progress bar (`fixed top-2.5 left-1/2 -translate-x-1/2 z-50`):

```tsx
{isSlideNumberingEnabled && (
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

#### B. Slide Meta Bar Counter
Inside the centered presentation canvas header, the question counter pill reflects the author's toggle:

```tsx
{isSlideNumberingEnabled ? (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/40 text-xs font-mono font-medium text-muted-foreground">
    <span>Question {currentStep + 1} of {visibleFields.length}</span>
  </div>
) : (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/30 border border-border/30 text-xs font-sans font-medium text-muted-foreground">
    <span>Slide Assessment</span>
  </div>
)}
```

---

## 2. Extended Question Layout Modes & Selection Dropdown

### 2.1 Problem Statement & User Directive

Current quiz questions only toggle between standard vertical card view (`standard`) and a rigid 2-column split view (`presentation_split`). Users require diverse presentation styles tailored to content complexity:

> *"we should have different type of previews for each one of the quiz display. Then we can check out which type of display we want. For example, the MCQ is correct. By default, it's going to have the default behavior. But we can have a selection of how it's going to be viewed or portrayed in the UI. We can have that settings for the specific question as well. That would be in the drop down."*

### 2.2 Extended `QuestionLayoutMode` Type Definition

In `src/lib/types/form.ts`, `QuestionLayoutMode` is extended to encompass 6 discrete presentation layouts:

```typescript
export type QuestionLayoutMode =
  | 'standard'             // Classic vertical card stack (traditional quiz format)
  | 'centered'             // Focused vertical-center presentation slide with balanced constraints
  | 'presentation_split'   // Dual-column presentation slide (adaptive split based on answerPlacement)
  | 'split_right'          // Explicit split: question/stem on Left, answers on Right
  | 'split_left'           // Explicit split: answers on Left, question/stem on Right
  | 'cards_grid';          // Responsive 2-column card grid for rich or high-density choices
```

#### Layout Mode Behavior Matrix

| Layout Mode | Container Constraint | Left Column / Area | Right Column / Area | Target Use Case |
|---|---|---|---|---|
| `standard` | `max-w-3xl` | Vertical single-column stack | Vertical single-column stack | Traditional sequential or all-in-one quiz |
| `centered` | `max-w-3xl` (outer), `max-w-2xl` (title), `max-w-xl` (options) | Centered title, subtitle, hints, and option cards along single vertical axis | Single axis flow | Immersive presentation slide decks |
| `presentation_split` | Full width container (`px-4 sm:px-8 lg:px-12`) | Governed by `answerPlacement` (default: question/stem left) | Governed by `answerPlacement` (default: answer options right) | General dual-pane presentation questions |
| `split_right` | Full width container (`px-4 sm:px-8 lg:px-12`) | Question stem, media, citations, action checklist | Interactive answer options, submit buttons | Complex scenarios requiring side-by-side reference reading |
| `split_left` | Full width container (`px-4 sm:px-8 lg:px-12`) | Interactive answer options, submit buttons | Question stem, media, citations, action checklist | Reverse reading flows, left-handed touch optimization |
| `cards_grid` | `max-w-4xl` | Centered question title and stem | 2-column responsive grid (`grid-cols-1 sm:grid-cols-2 gap-3`) for answer cards | 4+ MCQ choices, image cards, rich descriptions |

### 2.3 Layout Resolution Engine (`src/lib/presentation-layout.ts`)

The resolution function `resolveQuestionLayoutMode` determines the active layout mode using strict hierarchical precedence:

```typescript
export interface ResolveLayoutModeParams {
  runtimeOverride?: QuestionLayoutMode | 'default';
  fieldMode?: QuestionLayoutMode;
  formDefaultMode?: QuestionLayoutMode;
}

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

### 2.4 Question Card Header Layout Dropdown (`SortableFieldCard`)

In `src/components/forms/sortable-field-card.tsx`, the previous two-button toggle is replaced with a comprehensive `<Select>` dropdown offering immediate preview-type selection for each question:

```tsx
{/* Extended Question Layout Mode Select Dropdown */}
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
      <SelectItem value="standard" className="text-xs py-2 cursor-pointer">
        <div className="font-semibold text-foreground">Standard Quiz</div>
        <div className="text-[11px] text-muted-foreground">Traditional single-card vertical flow</div>
      </SelectItem>
      <SelectItem value="centered" className="text-xs py-2 cursor-pointer">
        <div className="font-semibold text-foreground">Centered Slide</div>
        <div className="text-[11px] text-muted-foreground">Vertical centered presentation deck</div>
      </SelectItem>
      <SelectItem value="presentation_split" className="text-xs py-2 cursor-pointer">
        <div className="font-semibold text-foreground">Presentation Split (Auto)</div>
        <div className="text-[11px] text-muted-foreground">Dual column split based on placement setting</div>
      </SelectItem>
      <SelectItem value="split_right" className="text-xs py-2 cursor-pointer">
        <div className="font-semibold text-foreground">Split (Answers Right)</div>
        <div className="text-[11px] text-muted-foreground">Stem on Left, Answer Sheet on Right</div>
      </SelectItem>
      <SelectItem value="split_left" className="text-xs py-2 cursor-pointer">
        <div className="font-semibold text-foreground">Split (Answers Left)</div>
        <div className="text-[11px] text-muted-foreground">Answer Sheet on Left, Stem on Right</div>
      </SelectItem>
      <SelectItem value="cards_grid" className="text-xs py-2 cursor-pointer">
        <div className="font-semibold text-foreground">Cards Grid (2-Column)</div>
        <div className="text-[11px] text-muted-foreground">Multi-column grid for choice options</div>
      </SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 2.5 Context Menu Integration

In `SortableFieldCard`'s actions menu (`DropdownMenu`), the layout action is enhanced with a submenu displaying all 6 modes with checkmark indicators:

```tsx
<DropdownMenuSub>
  <DropdownMenuSubTrigger className="text-sm flex items-center gap-2 cursor-pointer py-1.5">
    <LayoutTemplate className="w-4 h-4 text-primary" />
    <span>Question Display Layout</span>
  </DropdownMenuSubTrigger>
  <DropdownMenuSubContent className="min-w-[14rem] bg-popover border-border z-[100]">
    {LAYOUT_MODE_OPTIONS.map((opt) => (
      <DropdownMenuItem
        key={opt.value}
        onClick={() => onUpdate(id, { layoutMode: opt.value })}
        className="text-xs flex items-center justify-between cursor-pointer py-1.5"
      >
        <div>
          <div className="font-semibold text-foreground">{opt.label}</div>
          <div className="text-[10px] text-muted-foreground">{opt.description}</div>
        </div>
        {(field.layoutMode || 'standard') === opt.value && (
          <Check className="w-3.5 h-3.5 text-primary ml-2 shrink-0" />
        )}
      </DropdownMenuItem>
    ))}
  </DropdownMenuSubContent>
</DropdownMenuSub>
```

---

## 3. PresenterHUD In-Preview Customization Specification

### 3.1 Problem Statement & User Directive

Authors frequently preview quizzes in full presentation mode to verify timing, visuals, and pacing. When an author spots a layout mismatch (e.g. a question with long options that would look better in `centered` or `cards_grid` mode), forcing them to exit preview, find the card in the builder, adjust it, and re-launch preview creates severe cognitive friction:

> *"the owner of the slide can also get into the slide mode and can change the preview of the question as well, how he or the person wanted to preview this stuff. They could save it, save the settings during the preview. So that would also reflect back in the question quiz."*

### 3.2 Extended `PresenterHUDProps` Interface

`PresenterHUD` in `src/components/runner/floating-controls.tsx` is extended to support layout selection, slide numbering toggle, and direct persistence back to the quiz:

```typescript
export interface PresenterHUDProps {
  // Existing props
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeThemeShortName: string;
  runnerViewMode: 'default' | QuestionLayoutMode;
  setRunnerViewMode: (mode: 'default' | QuestionLayoutMode) => void;
  effectiveLayoutMode: QuestionLayoutMode;
  isSidebarVisible: boolean;
  setIsSidebarVisible: (visible: boolean) => void;
  timeLeftSeconds: number | null;

  // In-preview customization extensions
  currentFieldId?: string;
  showSlideNumbers?: boolean;
  onToggleSlideNumbers?: () => void;
  onUpdateFieldLayout?: (fieldId: string, layoutMode: QuestionLayoutMode) => void;
  onSaveToQuiz?: () => void;
  isSavePending?: boolean;
}
```

### 3.3 PresenterHUD Visual Architecture

The PresenterHUD floating dock receives three enhanced controls:

```
+-------------------------------------------------------------------------------------------------------+
| [:: HUD] | [09:45] | [ Eye: Layout ▾ ] | [ #: Slide Numbers ] | [ Palette: Theme ▾ ] | [💾 Save to Quiz] |
+-------------------------------------------------------------------------------------------------------+
```

1. **Draggable Grip (`:: HUD`):** Preserved for user repositioning anywhere on the viewport.
2. **Timer Indicator (`09:45`):** Retains active exam countdown if configured.
3. **Question Layout Selector (`Eye: Layout ▾`):**
   - Displays current layout mode with an active indicator badge.
   - Dropdown allows selecting any of the 6 layout modes for the currently visible slide.
   - When selected, updates runtime view mode AND calls `onUpdateFieldLayout(currentFieldId, mode)`.
4. **Slide Numbering Toggle (`#: Slide Numbers`):**
   - Clickable icon button toggling slide numbers on/off.
   - Reflects enabled state via active primary color and subtle badge.
5. **Theme Preset Selector (`Palette: Theme ▾`):**
   - Instant live switching between the 10 production themes.
6. **Save Customizations Button (`💾 Save to Quiz`):**
   - High-contrast, one-click persistence button.
   - Triggers `onSaveToQuiz()`, which immediately writes all modifications to Zustand and `localStorage`.

### 3.4 PresenterHUD JSX Implementation

```tsx
{/* Question Layout Selector Menu */}
<DropdownMenu>
  <Tooltip>
    <TooltipTrigger asChild>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1.5 shrink-0 cursor-pointer rounded-xl hover:bg-muted/60 text-xs font-semibold"
          aria-label="Select Question Layout Mode"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline capitalize">
            {effectiveLayoutMode.replace('_', ' ')}
          </span>
        </Button>
      </DropdownMenuTrigger>
    </TooltipTrigger>
    <TooltipContent>Customize layout for this question</TooltipContent>
  </Tooltip>
  <DropdownMenuContent align="end" className="min-w-[15rem] border border-border/40 bg-popover text-popover-foreground z-[10000]">
    <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
      Slide Layout Mode
    </div>
    {LAYOUT_OPTIONS.map((layout) => (
      <DropdownMenuItem
        key={layout.id}
        onSelect={() => {
          if (currentFieldId && onUpdateFieldLayout) {
            onUpdateFieldLayout(currentFieldId, layout.id);
          } else {
            setRunnerViewMode(layout.id);
          }
          toast.info(`Switched question layout to: ${layout.name}`);
        }}
        className={effectiveLayoutMode === layout.id ? 'bg-accent text-foreground font-semibold' : undefined}
      >
        <div className="flex flex-col">
          <span>{layout.name}</span>
          <span className="text-[10px] text-muted-foreground">{layout.desc}</span>
        </div>
      </DropdownMenuItem>
    ))}
    <DropdownMenuSeparator className="my-1 border-border/40" />
    <DropdownMenuItem
      onSelect={() => setIsSidebarVisible(!isSidebarVisible)}
      className={isSidebarVisible ? 'bg-accent text-foreground' : undefined}
    >
      <ListOrdered className="w-3.5 h-3.5 mr-2" />
      <span>{isSidebarVisible ? 'Hide Question Sequence' : 'Show Question Sequence'}</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

{/* Slide Numbering Toggle */}
<Tooltip>
  <TooltipTrigger asChild>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => {
        if (onToggleSlideNumbers) {
          onToggleSlideNumbers();
        }
      }}
      className={`h-8 w-8 shrink-0 cursor-pointer rounded-xl transition-colors ${
        showSlideNumbers !== false
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'text-muted-foreground hover:bg-muted/60'
      }`}
      aria-label="Toggle Slide Numbers"
    >
      <Hash className="w-3.5 h-3.5" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    {showSlideNumbers !== false ? 'Hide slide numbers' : 'Show slide numbers'}
  </TooltipContent>
</Tooltip>

{/* One-Click Save Layout to Quiz Action */}
{onSaveToQuiz && (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        size="sm"
        onClick={onSaveToQuiz}
        disabled={isSavePending}
        className="h-8 px-2.5 gap-1.5 shrink-0 cursor-pointer rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs font-semibold text-xs transition-all"
        aria-label="Save layout customizations to quiz"
      >
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Save Layout</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent>Persist current layout and slide settings directly to quiz draft</TooltipContent>
  </Tooltip>
)}
```

---

## 4. Real-Time Persistence Pipeline to Zustand & Draft Storage

### 4.1 Architecture Flow Diagram

```
+-------------------------------------------------------------------------------------------------+
| PresenterHUD User Interaction                                                                   |
| [Select Layout Mode: 'centered'] -> triggers onUpdateFieldLayout(fieldId, 'centered')          |
| [Toggle Slide Numbers: true]     -> triggers onToggleSlideNumbers()                             |
| [Click 'Save Layout']            -> triggers onSaveToQuiz()                                     |
+-------------------------------------------------------------------------------------------------+
                                                |
                                                v
+-------------------------------------------------------------------------------------------------+
| FormRunner In-Memory State Update                                                               |
| 1. Updates activeForm.fields[currentStep].layoutMode = 'centered'                               |
| 2. Updates activeForm.settings.showSlideNumbers = true                                          |
| 3. Triggers immediate re-render of presentation slide canvas                                    |
+-------------------------------------------------------------------------------------------------+
                                                |
                                                v
+-------------------------------------------------------------------------------------------------+
| Persistence Execution Pipeline (onSaveToQuiz)                                                   |
|                                                                                                 |
| Layer 1: Zustand Store Synchronization                                                          |
|   useQuizStore.getState().updateField(fieldId, { layoutMode: 'centered' })                      |
|   useQuizStore.getState().updateSettings({ showSlideNumbers: true })                            |
|                                                                                                 |
| Layer 2: LocalStorage Draft Synchronization                                                      |
|   const draftKey = `wp_exam_draft_${activeSlug}`                                                |
|   localStorage.setItem(draftKey, JSON.stringify(draftPayload))                                 |
|                                                                                                 |
| Layer 3: IndexedDB Session Synchronization (if in active run)                                   |
|   saveDraftToIndexedDB({ formId, currentStep, answers, settings })                              |
+-------------------------------------------------------------------------------------------------+
                                                |
                                                v
+-------------------------------------------------------------------------------------------------+
| Feedback & Toast Notification                                                                   |
|   toast.success("Saved layout customizations to quiz successfully!")                            |
+-------------------------------------------------------------------------------------------------+
```

### 4.2 FormRunner Persistence Handlers Implementation

In `src/components/runner/FormRunner.tsx`, the persistence callbacks are wired directly to the Zustand store and local draft storage:

```tsx
// Live in-preview question layout updater
const handleUpdateFieldLayout = useCallback((fieldId: string, layoutMode: QuestionLayoutMode) => {
  // 1. Update runner local state for immediate reactivity
  setActiveForm((prev) => ({
    ...prev,
    fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, layoutMode } : f)),
  }));

  // 2. Reflect directly in Zustand builder store
  useQuizStore.getState().updateField(fieldId, { layoutMode });
  
  toast.success(`Question layout updated to ${layoutMode.replace('_', ' ')}`);
}, []);

// Live in-preview slide numbering toggle
const handleToggleSlideNumbers = useCallback(() => {
  const currentVal = activeForm.settings?.showSlideNumbers !== false;
  const nextVal = !currentVal;

  setActiveForm((prev) => ({
    ...prev,
    settings: {
      ...prev.settings,
      showSlideNumbers: nextVal,
    },
  }));

  useQuizStore.getState().updateSettings({ showSlideNumbers: nextVal });
  toast.info(nextVal ? 'Slide numbers enabled' : 'Slide numbers hidden');
}, [activeForm.settings?.showSlideNumbers]);

// Direct full-draft persistence handler
const handleSaveLayoutToQuiz = useCallback(() => {
  try {
    const currentSlug = activeForm.slug || 'custom-form';
    const currentSettings = activeForm.settings || {};
    
    // Ensure Zustand store has identical state
    const zustandState = useQuizStore.getState();
    zustandState.updateSettings(currentSettings);
    activeForm.fields.forEach((field) => {
      zustandState.updateField(field.id, { layoutMode: field.layoutMode });
    });

    // Write full draft payload to localStorage
    const draftPayload = {
      title: activeForm.title,
      description: activeForm.description,
      slug: currentSlug,
      formType: activeForm.formType,
      formAccess: activeForm.formAccess,
      isSequential: activeForm.isSequential,
      settings: currentSettings,
      fields: activeForm.fields,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`wp_exam_draft_${currentSlug}`, JSON.stringify(draftPayload));
    }

    toast.success('Saved layout customizations to quiz draft!');
  } catch (error) {
    toast.error('Failed to save layout settings to quiz');
  }
}, [activeForm]);
```

### 4.3 Passing Callbacks to PresenterHUD in JSX

```tsx
<PresenterHUD
  activeThemeId={activeThemeId}
  setActiveThemeId={setActiveThemeId}
  activeThemeShortName={activeThemeShortName}
  runnerViewMode={runnerViewMode}
  setRunnerViewMode={setRunnerViewMode}
  effectiveLayoutMode={effectiveLayoutMode}
  isSidebarVisible={isSidebarVisible}
  setIsSidebarVisible={setIsSidebarVisible}
  timeLeftSeconds={timeLeftSeconds}
  currentFieldId={currentField?.id}
  showSlideNumbers={activeForm.settings?.showSlideNumbers}
  onToggleSlideNumbers={handleToggleSlideNumbers}
  onUpdateFieldLayout={handleUpdateFieldLayout}
  onSaveToQuiz={handleSaveLayoutToQuiz}
/>
```

---

## 5. Architectural Invariants & Verification Checklist

1. **Relative Paths Only:** All citations and references adhere strictly to relative repository paths (`src/...`, `02-spec/...`).
2. **Boolean Standard:** Positive evaluation only (`showSlideNumbers !== false` or `isSlideNumberingEnabled`). Zero explicit `== true` or mixed polarity checks.
3. **No Breaking Schema Changes:** `showSlideNumbers?: boolean` is completely backward-compatible. Existing forms render with numbers enabled by default.
4. **Zero-Latency In-Preview Feedback:** Changing the layout mode in `PresenterHUD` causes immediate hot re-render of the question canvas without a page refresh or route shift.
5. **Bidirectional Persistence:** Modifying settings in either `FormBuilder` or `PresenterHUD` synchronizes identically through `useQuizStore` and `localStorage['wp_exam_draft_*']`.

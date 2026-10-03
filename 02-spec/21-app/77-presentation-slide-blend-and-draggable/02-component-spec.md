# Component Specification: Presenter HUD Draggable Mobility & Viewport Layer Isolation

## 1. Executive Summary & Architectural Motivation

In presentation mode and standard candidate quiz examination sessions, the **Presenter HUD** (`PresenterHUD` in `src/components/runner/floating-controls.tsx`) provides essential presentation orchestration controls: view mode toggle (Quiz format vs Presentation slide vs Questions sidebar), active visual theme switcher (`Palette`), and session timer countdown display.

Previously, two architectural defects restricted its usability:
1. **Layout Flow Entanglement:** The `<PresenterHUD />` component was mounted *inside* the runner's inner container (`<div className="space-y-5 mx-auto ...">`) in `src/components/runner/FormRunner.tsx`. As a result, CSS sibling spacing rules (`space-y-5`, applying `margin-top: 1.25rem` to subsequent siblings), container max-width bounds (`max-w-[1400px]`, `max-w-7xl`, `max-w-6xl`), and inner overflow boundaries interfered with the HUD's viewport-relative positioning and motion boundaries.
2. **Ambiguous Drag Affordance & Collision:** While the HUD outer card had `drag` enabled via Framer Motion, it lacked a dedicated drag handle and tactile grab affordance. The entire container displayed `cursor-move`, leading to accidental drags when users intended to click the `Eye` or `Palette` dropdown triggers. Furthermore, the z-index was capped at `z-50`, allowing underlying elevated presentation cards, sticky navigation bars, or dialog overlays to bleed through or occlude the HUD, while missing `touch-none` and `select-none` caused touch panning and accidental text selection during drag on touch devices.

This specification details the structural refactoring required to achieve **Unrestricted Draggable Mobility**, dedicated handle ergonomics via `GripVertical`, layer elevation to `z-[9999]`, and clean root-level DOM isolation.

---

## 2. Target Files & Component Responsibilities

| Relative File Path | Component / Target | Architectural Scope & Responsibility |
|--------------------|--------------------|---------------------------------------|
| `src/components/runner/floating-controls.tsx` | `<PresenterHUD />` | Upgrade Framer Motion container with `drag`, `dragMomentum={false}`, `whileDrag={{ scale: 1.03 }}`, `z-[9999]`, `touch-none`, `select-none`, and dedicated `GripVertical` drag handle affordance with tooltip. Ensure dropdown popover menus render with `z-[10000]`. |
| `src/components/runner/FormRunner.tsx` | Runner Layout Root | Extract `<PresenterHUD />` out of the inner `space-y-5 mx-auto` content container and place it at the outer runner root level, immediately preceding the closing root `</div>`. |

---

## 3. DOM & Layout Architecture

### 3.1 Pre-Refactor DOM Structure (Defect State)

```tsx
// src/components/runner/FormRunner.tsx (Pre-refactor)
<div className="min-h-screen p-3 sm:p-6 transition-colors duration-300 relative ...">
  {/* Inner Content Container */}
  <div className="space-y-5 mx-auto max-w-[1400px] ...">
    {/* Header / Slug Bar */}
    {/* Question / Slide Content */}
    {/* Navigation Footer */}
    {/* Blackout Overlay */}
    
    {/* DEFECT: PresenterHUD trapped inside inner space-y-5 container */}
    <PresenterHUD ... />
  </div>
</div>
```

### 3.2 Post-Refactor DOM Structure (Isolated Root Level)

```tsx
// src/components/runner/FormRunner.tsx (Post-refactor)
<div className="min-h-screen p-3 sm:p-6 transition-colors duration-300 relative ...">
  {/* Inner Content Container */}
  <div className="space-y-5 mx-auto max-w-[1400px] ...">
    {/* Header / Slug Bar */}
    {/* Question / Slide Content */}
    {/* Navigation Footer */}
    {/* Blackout Overlay */}
  </div>
  
  {/* ISOLATED: PresenterHUD unconstrained at root viewport level */}
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
  />
</div>
```

---

## 4. Draggable Mobility & Affordance Specification

### 4.1 Framer Motion Container Architecture

The outer floating card in `src/components/runner/floating-controls.tsx` must utilize Framer Motion with the following props and Tailwind utility classes:

```tsx
<motion.div
  drag
  dragMomentum={false}
  whileDrag={{ scale: 1.03 }}
  className="fixed z-[9999] bottom-8 right-8 flex items-center gap-1.5 p-1.5 sm:p-2 bg-card/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl select-none touch-none cursor-grab active:cursor-grabbing"
>
```

#### Key Technical Properties:
- **`drag`**: Enables freeform 2D translation across the entire screen.
- **`dragMomentum={false}`**: Eliminates inertia drift, guaranteeing the HUD stops precisely where the user releases it.
- **`whileDrag={{ scale: 1.03 }}`**: Provides crisp micro-elevation tactile feedback while the HUD is in motion.
- **`fixed z-[9999]`**: Outranks all standard UI elements (`z-10` to `z-50`), slide cards, and overlays.
- **`select-none`**: Prevents accidental DOM text selection during dragging motions.
- **`touch-none`**: Disables native mobile browser gestures (swipe, pinch-to-zoom, pull-to-refresh) during drag interaction on touchscreen devices.
- **`cursor-grab active:cursor-grabbing`**: Standardized pointer feedback indicating grab capability.

### 4.2 Dedicated Drag Handle Affordance

To resolve ambiguity between dragging the HUD and interacting with its action buttons (`Eye` layout menu and `Palette` theme menu), a dedicated drag handle is positioned at the leftmost edge:

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <div
      className="flex items-center gap-1 px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg border-r border-border/50 select-none touch-none cursor-grab active:cursor-grabbing transition-colors"
      aria-label="Drag to reposition HUD"
      role="button"
      tabIndex={0}
    >
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-[10px] font-bold tracking-widest uppercase hidden sm:inline-block">HUD</span>
    </div>
  </TooltipTrigger>
  <TooltipContent side="top">Drag to reposition HUD</TooltipContent>
</Tooltip>
```

#### Drag Handle Specifications:
- **Icon:** `GripVertical` from `lucide-react` (size: `w-3.5 h-3.5`).
- **Label:** "HUD" in bold uppercase tracking (`text-[10px] font-bold tracking-widest uppercase hidden sm:inline-block`), giving clear identification while remaining compact on narrow mobile viewports.
- **Right Border Divider:** `border-r border-border/50` creating visual separation between the grab zone and interactive triggers.
- **Tooltip:** Wrapped in `<Tooltip>` with content `"Drag to reposition HUD"` positioned `side="top"`.

### 4.3 Dropdown Menu Z-Index Elevation

Because `PresenterHUD` is elevated to `z-[9999]`, all nested `<DropdownMenuContent>` elements must specify `z-[10000]` to guarantee that menu options (Layout mode choices, Theme choices) render above the HUD container without clipping:

```tsx
<DropdownMenuContent
  align="end"
  className="min-w-[12rem] border border-border bg-popover text-popover-foreground z-[10000]"
>
```

---

## 5. Interface & Props Contract

`src/components/runner/floating-controls.tsx` exports the following typed interface:

```typescript
export interface PresenterHUDProps {
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeThemeShortName: string;
  runnerViewMode: 'default' | 'standard' | 'presentation_split';
  setRunnerViewMode: (mode: 'default' | 'standard' | 'presentation_split') => void;
  effectiveLayoutMode: string;
  isSidebarVisible: boolean;
  setIsSidebarVisible: (visible: boolean) => void;
  timeLeftSeconds: number | null;
}
```

No alterations to the interface signature are required. All upgrades preserve backward compatibility with `FormRunner.tsx`.

---

## 6. Edge Cases & Resilience

1. **Window Resize Boundary:** When the browser viewport resizes, Framer Motion retains relative coordinate offsets. Because `dragMomentum={false}` is enforced, the element does not bounce or throw itself outside the visible viewport.
2. **Dropdown Menu Interaction vs Drag:** Button triggers (`Button variant="outline" size="icon"`) stop click event propagation naturally in React, allowing clicks to trigger Radix dropdown overlays without initiating a drag gesture.
3. **Touchscreen Pinch & Scroll Immunity:** The presence of `touch-none` prevents mobile touch events inside the HUD from triggering document scroll or zoom gestures.
4. **Theme Synchronization:** Theme changes triggered via the HUD (`Palette` menu) dynamically mutate `data-theme` on the root HTML document while preserving current HUD drag coordinates.

---

## 7. Verifiable Acceptance Criteria

| Criteria ID | Target File | Verification Method / Assertion | Expected Value |
|-------------|-------------|---------------------------------|----------------|
| **CRIT-HUD-01** | `src/components/runner/floating-controls.tsx` | Inspect `<motion.div>` props | Contains `drag`, `dragMomentum={false}`, and `whileDrag={{ scale: 1.03 }}` |
| **CRIT-HUD-02** | `src/components/runner/floating-controls.tsx` | Inspect `<motion.div>` className | Contains `fixed z-[9999]`, `select-none`, `touch-none`, and `cursor-grab active:cursor-grabbing` |
| **CRIT-HUD-03** | `src/components/runner/floating-controls.tsx` | Inspect Lucide icon imports | Imports `GripVertical` from `lucide-react` |
| **CRIT-HUD-04** | `src/components/runner/floating-controls.tsx` | Inspect Drag Handle element | Contains `<GripVertical className="w-3.5 h-3.5` and `cursor-grab active:cursor-grabbing` |
| **CRIT-HUD-05** | `src/components/runner/floating-controls.tsx` | Inspect Drag Handle Tooltip | Tooltip text is `"Drag to reposition HUD"` |
| **CRIT-HUD-06** | `src/components/runner/floating-controls.tsx` | Inspect `<DropdownMenuContent>` className | Contains `z-[10000]` on both View and Theme dropdowns |
| **CRIT-HUD-07** | `src/components/runner/FormRunner.tsx` | Verify `<PresenterHUD />` placement | Placed outside inner `space-y-5 mx-auto` container, directly under root runner `div` |

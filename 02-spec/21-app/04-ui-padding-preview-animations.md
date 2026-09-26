# UI Padding, Preview Window, and Animation Fixes

## 1. Overview
This specification addresses three user-reported UI/UX issues: improving the interactive form preview experience, optimizing wasted padding space in the builder layout, and refining dropdown/popup animations.

## 2. Requirements

### 2.1 Preview Window & Auto-Fill
- **Issue**: The inline interactive preview has color contrast issues and is constrained.
- **Spec**: 
  - Change the "Test Preview" action to open in a new window/tab (`target="_blank"`) rather than an inline modal.
  - Add an "Auto Fill" button or shortcut in the preview/runner mode that populates dummy data for faster testing.
  - Fix coloring issues (e.g., dark text on dark backgrounds or white boxes inside dark themes).

### 2.2 Padding Space Optimization
- **Issue**: Excessive padding on the left side of the Form Builder and main layout.
- **Spec**:
  - Reduce structural padding (e.g., `p-4 sm:p-6 lg:p-8`) to tighter values (e.g., `p-2 sm:p-4`) in `Index.tsx`.
  - Remove unnecessary left margins/padding in `FormBuilder.tsx` to maximize canvas width.

### 2.3 Dropdown & Popup Animations
- **Issue**: Unappealing pop-in animations on Select and Dropdown components.
- **Spec**:
  - Replace bouncy or slow animations with snappy, subtle fades and slides.
  - Update component animation classes: `data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2`.

## 3. UI/UX Correction Steps (For AI Agents)
* **Animation Rules**: All dropdowns, dialogs, and popovers MUST use `duration-150` (or Tailwind default) with simple `fade-in-0` and `zoom-in-95`. Do not use exaggerated slides or bounces.
* **Padding Rules**: Do not use massive `p-8` for structural layout wrappers. Maximize canvas space by using `p-4` or `p-2` on main content areas.
* **Preview Rules**: Previews should always be isolated in new tabs to replicate the exact candidate experience without admin UI interference.

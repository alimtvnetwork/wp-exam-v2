# Subtask 02: Card Actions Reorder, Responsive Properties Menu & High-Contrast Options

> **/goal** Reorder card action buttons to Delete-Left, Duplicate-Center, Save-Right, implement responsive compact properties dropdown on narrow viewports, and refine option typography and hover contrast.
> **/learn** Positive booleans only, zero explicit true checks, strict relative paths.

## Target Files
- `src/components/forms/sortable-field-card.tsx`

## Tasks
1. Reorder Card Footer Action Toolbar:
   - Order: `[Delete (red)]` on LEFT, `[Duplicate (blue)]` in CENTER, `[Save (green)]` on RIGHT.
   - On Delete: Call `removeFieldWithTrash(id)` or `onRemove(id)` with a Sonner toast:
     ```ts
     toast.success(`Question "${field.label || 'Untitled'}" moved to trash`, {
       action: {
         label: 'Undo',
         onClick: () => restoreField(id),
       },
     });
     ```
2. Low-Resolution Responsive Properties Menu:
   - When viewport is `< 640px` (`sm:hidden`), collapse Required switch, Points/Tier, and Allow Other into a single "Field Properties" DropdownMenu.
   - Keep full horizontal controls for `hidden sm:flex`.
3. Choice & Dropdown Option Typography and Hover States:
   - Ensure option inputs and choices render with uniform `text-sm sm:text-base` fonts.
   - Apply high-contrast emerald/primary hover borders and backgrounds (`hover:border-primary hover:bg-primary/10`).

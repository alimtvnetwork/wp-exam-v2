# Plan: UI Padding, Preview Window, and Animation Fixes

## Phase 1: Planning and Discovery
- [ ] 1. Identify padding classes in `Index.tsx` and `FormBuilder.tsx`.
- [ ] 2. Inspect animation classes in `Select.tsx`, `DropdownMenu.tsx`, and `Popover.tsx`.
- [ ] 3. Analyze the interactive preview logic and convert to `window.open()`.

## Phase 2: Execution (Batched)
- [ ] 4. **Sub-agent A**: Reduce structural padding in `Index.tsx` and `FormBuilder.tsx`. Update dropdown/popup animation classes in UI components (`Select`, `DropdownMenu`, etc.).
- [ ] 5. **Sub-agent B**: Convert Interactive Preview to open in a new tab. Implement 'Auto Fill' functionality for form fields in the runner. Fix color contrast issues in the preview UI.

## Phase 3: Verification
- [ ] 6. Run `npm run build` and `npx tsc --noEmit`.
- [ ] 7. Atomic Git Commit & Push.

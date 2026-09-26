# Plan: UI/UX Enhancements & Google Forms Restructure

## Phase 1: Planning and Discovery
- [ ] 1. Discover all typography and gap spacing classes in `FormBuilder.tsx` and `Index.tsx`.
- [ ] 2. Discover `sortable-field-card.tsx` layout structure to plan the header restructure.
- [ ] 3. Generate granular subtasks in `.ai-memory/plans/subtasks/05-ui-ux/`.

## Phase 2: Execution (Batched)
- [ ] 4. **Subagent A**: 
  - Fix typography sizes (change `text-[10px]/text-xs` to `text-sm`).
  - Fix the large top gap in the layout container.
  - Fix AI Studio & Tool button hover blending.
  - Replace zoom-in animations with fade/hover animations.
- [ ] 5. **Subagent B**: 
  - Restructure `sortable-field-card.tsx` to move Field Type to the top header (Google Forms style).
  - Implement Section autocomplete/dropdown.
  - Implement the "Allow Others" enhanced MCQ feature.

## Phase 3: Verification
- [ ] 6. Run `npm run build` and `npx tsc --noEmit`.
- [ ] 7. Atomic Git Commit & Push.

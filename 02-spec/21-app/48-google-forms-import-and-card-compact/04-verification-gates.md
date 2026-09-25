# Specification: Verification Gates & Acceptance Criteria

Spec Reference: [01-overview.md](01-overview.md)

## 1. Acceptance Criteria

1. **AC-01 (Compact Field Card Header):**
   - The field card header in `sortable-field-card.tsx` replaces loose action buttons with an `Actions ▾` dropdown menu (`DropdownMenu` / Radix UI).
   - The field type badge (`[MULTIPLE CHOICE]`) is no longer clipped or squished; renders with proper padding and icon alignment.
   - Live Preview toggle remains accessible with clear active indicator.

2. **AC-02 (Right-Hand Field Palette Fluidity):**
   - In `field-palette.tsx`, cards use compact, sleek dimensions with 12px padding and clear typography.
   - Category filtering works smoothly without layout shift.
   - Clicking any item appends it cleanly to the canvas.

3. **AC-03 (Google Forms Import Engine):**
   - Successfully converts Google Forms API v1 JSON schema into valid `FormField[]`.
   - Correctly maps Choice (`RADIO` -> `single_choice`, `CHECKBOX` -> `multiple_choice`, `DROP_DOWN` -> `dropdown`), Text (`short_answer` vs `paragraph`), and Scale (`rating`).
   - Parses public viewform URLs and extracts question titles, types, and choices.
   - Supports OAuth/API token input to query `https://forms.googleapis.com/v1/forms/{formId}`.

4. **AC-04 (Post-Import Customization):**
   - Once imported, all fields immediately display on the builder canvas.
   - User can edit labels, attach custom compound validation, configure branching rules, and test via Live Runner.

5. **AC-05 (Automated Quality Gates):**
   - `npm run lint` passes with 0 errors.
   - `npx tsc --noEmit` passes with 0 errors.
   - `npx vitest run` passes 100% of test suites.
   - `npm run build` generates production bundle without failure.

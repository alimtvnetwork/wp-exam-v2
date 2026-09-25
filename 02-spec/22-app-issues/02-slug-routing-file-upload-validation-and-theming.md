# 02: Slug Routing Synchronization, File Upload Validation, Cross-Section Drag, and Theming Fluidity

Spec Reference: [02-spec/22-app-issues/01-index.md](01-index.md)

## 1. Reproduction Steps

1. **Static URL Address Bar Issue:**
   - Navigate to `/admin`. Click the Form Builder tab and type a form title like "React & TypeScript Assessment" or edit the slug to `react-ts-eval`.
   - Observe the browser address bar: it remains frozen at `http://localhost:5173/admin` or `http://localhost:5173/`.
   - Refreshing or sharing the URL fails to restore the active form, as the address bar does not update via `window.history` or router navigation.

2. **File Upload Missing Validation Configurator:**
   - In FormBuilder, add a `file_upload` question type.
   - Click `Actions ▾` -> `Validation Rules`.
   - The validation drawer presents generic string regex options (`starts_with`, `regex`) instead of file-specific validation options (Max File Size in MB, Allowed MIME Types / File Extensions like `.pdf, .docx, .zip, .png`).
   - In Test Preview, dropping a file does not validate against author-configured size limits or file extensions.

3. **Cross-Section Drag & Drop Limitation:**
   - Filter questions by a specific section (e.g. "General").
   - Questions in other sections are hidden, preventing authors from dragging questions across sections when filtered, with no explicit 1-click "Move to Section" control.

4. **Lack of Visual Theming Fluidity & Hover Animations:**
   - Switching between "Rise Up Asia", "Purple Theme", and "Antigravity Dracula" causes abrupt color switches without CSS interpolation.
   - Action buttons lack fluid hover micro-interactions (no glow, no lift, no smooth border transitions).

---

## 2. Root Cause Analysis (Cause)

1. **URL Synchronization Gap:**
   - Although `/admin/form/:slug` and `/f/:slug` routes were defined in `App.tsx`, `FormBuilder.tsx` updated only the in-memory Zustand store `slug` state without synchronizing the browser's `window.history` or triggering router navigation.
   - When an author changes the slug or title, the browser address bar must sync via `window.history.replaceState` or `navigate('/admin/form/' + slug, { replace: true })`.

2. **Validation Engine Type Mismatch:**
   - `VALIDATION_PRESETS` in `src/lib/types/form.ts` and `evaluateCompoundValidation` were designed purely for string regex matching.
   - `file_upload` requires distinct validation fields in `FormField`:
     - `maxFileSizeBytes` (default: 10MB)
     - `allowedFileExtensions` (e.g. `['pdf', 'docx', 'zip', 'png', 'jpg']`)
   - `SortableFieldCard` rendered the string regex editor even when `field.type === 'file_upload'`.

3. **Section Boundary Isolation in Filtered DnD:**
   - Filtering by section restricted `displayedFields` to a subset, making cross-section drag-and-drop physically impossible in filtered views without an explicit section mover.

4. **Absence of Global CSS Transitions:**
   - `src/index.css` lacked global transition properties for `--primary`, `--card`, `--border`, and `--background`, making theme swaps harsh and instantaneous.

---

## 3. Code Modifications (Fix)

1. **Live Browser URL Synchronization (`FormBuilder.tsx` & `Index.tsx`):**
   - In `FormBuilder`, introduce debounced `window.history.replaceState` to seamlessly update the address bar to `/admin/form/:slug` whenever `slug` changes, without causing component unmounts or focus loss.
   - Add a dedicated **Slug Management Panel** with slug validation (kebab-case regex, min 3 chars) and canonical link preview.

2. **Dedicated File Upload Validation Configurator (`sortable-field-card.tsx`):**
   - When `field.type === 'file_upload'`, render the **File Upload Validation Configurator**:
     - Max File Size Selector: `5MB`, `10MB`, `25MB`, `50MB`
     - Allowed Extensions Multi-Select: `.pdf`, `.docx`, `.zip`, `.png`, `.jpg`, `.csv`
     - Custom error message configuration.
   - Update `evaluateFileUploadValidation(field, file)` to test size and extension against configured rules with clear pass/fail status in the dropzone preview.

3. **Cross-Section Drag & Drop + Section Mover:**
   - Add a 1-click **"Move to Section ▾"** submenu in `SortableFieldCard` `Actions ▾` dropdown, allowing authors to move questions to any section immediately, even when filtered.
   - Render section drop banners with visual drop target styling.

4. **Fluid UI Theming Animations & Micro-Interactions:**
   - Add global smooth CSS color transitions to `src/index.css`:
     `transition: background-color 300ms ease, border-color 300ms ease, color 200ms ease, box-shadow 300ms ease`.
   - Add vibrant hover micro-interactions on buttons: `hover:border-primary/60 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`.

---

## 4. Architectural Prevention (Prevention)

1. **Type-Guarded Validation Interfaces:**
   - Ensure `FieldValidationConfig` supports file-specific criteria alongside string regex rules.
2. **URL as Ground Truth:**
   - Every entity in the application must maintain a bidirectional URL contract: URL params drive store state on initial load, and store state syncs to URL on edit.
3. **Automated Vitest Regression Gates:**
   - Maintain unit tests in `src/test/slug-routing-and-theming.test.ts` testing URL synchronization, file validation logic, and HSL theme transitions.

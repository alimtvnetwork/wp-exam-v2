# Task 59: Slug Routing, File Upload Preview, Terminology Standardization, AI Studio & Dynamic Theming

Spec Reference: [02-spec/21-app/52-slug-routing-file-upload-preview-and-ai-studio/01-overview.md](../../../02-spec/21-app/52-slug-routing-file-upload-preview-and-ai-studio/01-overview.md)

## 1. Executive Summary & Root Cause Analysis

Following user feedback on static URLs, defective file upload test previews, dual terminology stutter ("Section / Module"), raw HTML form controls, and non-propagating theme colors, Task 59 successfully delivered a comprehensive overhaul:

1. **Dynamic Slug Management & URL Routing:**
   - Integrated customizable slugs into `useQuizStore` (`slug`, `setSlug`, auto-slug generator `generateSlug(title)`).
   - Created an editable slug ribbon in `FormBuilder` header with live `/f/:slug` preview, 1-click copy, and public/preview new tab buttons.
   - Added dynamic routes in `App.tsx`: `/f/:slug` (public candidate runner), `/preview/:slug` (live preview runner), and `/admin/form/:slug` (administrative builder targeting specific form slug).
   - Updated `FormRunner` to read `routeSlug` via `useParams<{ slug?: string }>()` and prioritize active builder form.

2. **File Upload Preview Dropzone:**
   - In `SortableFieldCard`, replaced the generic text input for `file_upload` with an interactive drag-and-drop dropzone simulator.
   - Dropzone supports file dragover states, browse file selection, size limit inspection (< 10MB), and formatted metadata display (filename, formatted MB size, valid status badge, timestamp, and remove button).
   - In `FormRunner`, upgraded the static dashed box to an interactive file selector with active upload feedback.

3. **Terminology Standardization ("Section"):**
   - Eliminated confusing dual "Section / Module" slash-stutter.
   - Standardized strictly on "Section" across labels, badges, and filters in `SortableFieldCard` and `FormBuilder`.
   - Enabled seamless cross-section drag-and-drop: moving questions between sections automatically adopts the destination section group.

4. **Modern UI Controls (Radix UI):**
   - Replaced raw HTML checkboxes (`<input type="checkbox">`) for "Required Field" with Radix UI `Switch` components.
   - Modernized scoring points display with centered bold inputs.

5. **Per-Question AI Instruction Studio & Quick JSON In/Out:**
   - Created `QuestionAiStudioModal` with 3 tabs:
     - **AI Prompt Generator:** Complete LLM prompt with question type, label, section, options, designated correct answer, and points.
     - **Current Question JSON:** Formatted JSON schema with 1-click copy.
     - **Import AI JSON:** 1-click JSON validator and updater with instant store synchronization.
   - Wired into `SortableFieldCard` action bar as an inline quick button and inside the `Actions ▾` dropdown.

6. **Theming Engine & Live HSL Color Propagation:**
   - Added complete Tailwind HSL CSS variable dictionaries (`hslValues`) to `THEME_CONFIGS` for all 5 supported themes:
     - `riseup`: Warm Gold (`41 100% 50%`) & Midnight Navy (`240 33% 6%`)
     - `letterly`: Electric Indigo (`247 98% 63%`) & Night Sky (`244 36% 9%`)
     - `dracula`: Purple (`265 89% 78%`) & Neon Green (`135 94% 65%`)
     - `obsidian`: Obsidian Slate (`216 28% 7%`) & Cyan Neon (`199 89% 48%`)
     - `clean`: Corporate Slate & Sapphire (`221 83% 53%`)
   - Updated `ThemeProvider`'s `useEffect` to inject all HSL CSS variables directly into `document.documentElement.style`, transforming `--primary`, `--card`, `--border`, `--ring`, and `--background` instantly upon theme selection.

---

## 2. Modified & Verified File Artifacts

| File Path | Description |
|:---|:---|
| `src/quiz/store/useQuizStore.ts` | Added `slug`, `setSlug`, auto-slug generator, and title synchronization |
| `src/components/forms/question-ai-studio-modal.tsx` | New 3-tab AI instruction studio and JSON import/export modal |
| `src/components/forms/sortable-field-card.tsx` | File upload dropzone, Section terminology, Radix Switch, AI studio button |
| `src/components/forms/FormBuilder.tsx` | Live editable slug ribbon, public/preview buttons, cross-section DnD adoption |
| `src/components/runner/FormRunner.tsx` | Dynamic slug routing support (`/f/:slug`, `/preview/:slug`), interactive file upload |
| `src/lib/theme-context.tsx` | HSL CSS token dictionaries and live injection for all 5 themes |
| `src/pages/Index.tsx` | Admin route slug sync (`/admin/form/:slug`) and theme container map |
| `src/App.tsx` | Added `/f/:slug`, `/preview/:slug`, and `/admin/form/:slug` routes |
| `src/test/slug-routing-and-theming.test.ts` | 5 new unit tests verifying slug generation, routing, HSL tokens, and AI prompts |

---

## 3. Verification Gate Results

- **TypeScript Compilation (`npx tsc --noEmit`):** 0 errors.
- **ESLint Validation (`npm run lint`):** 0 errors, 10 existing warnings.
- **Unit Test Suite (`npx vitest run`):** 70 passed across 9 test files (0 failures).
- **Vite Dev Server:** Running smoothly on `http://localhost:5173/`.

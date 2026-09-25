# 03: Runner File Upload Rendering, Slug Inspector, AI Schema Export/Import & Theme Color Synchronization

Spec Reference: [02-spec/22-app-issues/01-index.md](01-index.md)

## 1. Reproduction Steps

1. **Test Preview / FormRunner File Upload Blank State:**
   - In FormBuilder, create a `file_upload` field and click "Preview" or open `/preview/:slug` or `/f/:slug`.
   - In the runner, the file upload field either renders a raw file input or fails to display the selected file card with validation status. Selecting a file leaves the test view looking blank or incomplete.
2. **Slug Management & Category Routing Visibility:**
   - When organizing forms into categories or editing form slugs, authors cannot see how the slug is formatted or verify its category prefix.
   - Address bar navigation needs clear visual feedback of the active slug hierarchy.
3. **Outdated Raw Form Elements & Required Field UI:**
   - Required fields render with raw asterisks (`*`) resembling legacy HTML forms without modern design system tokens or badge pills.
4. **Section / Module Terminology Inconsistency:**
   - Mentions of "module" or "section / module" cause confusion with the standard Section taxonomy.
5. **Missing Per-Question AI Instruction & 1-Click JSON Import/Export:**
   - Authors cannot view the structured AI prompt, system JSON format, and expected AI output format directly on each question with quick 1-click import/export.
6. **Theming Inefficacy & Absence of Hover Micro-Animations:**
   - Switching between themes (Rise Up Asia Gold, Purple Theme, Dracula Purple, Obsidian Emerald, Clean Slate) has weak visual impact because hardcoded color classes (`bg-slate-900`, `text-slate-400`, `border-slate-800`) override the theme's HSL variables. Action buttons lack smooth hover micro-animations and glow effects.

---

## 2. Root Cause Analysis (Cause)

1. **Runner File Upload Gap:**
   - `FormRunner.tsx` lacked a dedicated file upload dropzone component with state management for selected files, file size formatting, and integration with `evaluateFileUploadValidation`.
2. **Slug Inspector Absence:**
   - `FormBuilder.tsx` only had a simple text input for slug without a dedicated Slug Management Inspector showing the full URL structure, category prefixing, auto-slug generation from title, and canonical links.
3. **Styling & Token Coupling:**
   - Several components relied on hardcoded Tailwind slate/neutral palettes instead of Shadcn semantic tokens (`bg-primary`, `text-primary`, `border-primary`, `bg-card`, `text-card-foreground`).
4. **Isolated AI Studio:**
   - The Question AI Studio was opened through a separate modal rather than offering inline 1-click "Export JSON" and "Import / Paste JSON" directly within each card's Actions menu.

---

## 3. Code Modifications (Fix)

1. **Full-Featured File Upload in FormRunner (`FormRunner.tsx`):**
   - Implement an interactive file dropzone supporting drag-and-drop, file browsing, and instant validation against `field.fileValidation`.
   - Display a sleek file card with file name, formatted size in MB, MIME type icon, pass/fail status badge, and clear/remove action.
2. **Slug Management Inspector (`FormBuilder.tsx`):**
   - Add a dedicated Slug Management Inspector ribbon displaying:
     - Active canonical URL (`/f/:slug`) with 1-click copy.
     - Auto-slug generator button syncing with the form title.
     - Category prefix indicator.
     - Real-time address bar synchronization via `window.history.replaceState`.
3. **Modern UI Template & Required Badge Pill:**
   - Replace raw asterisks with modern pill badges:
     `<Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/10 font-mono">Required</Badge>`.
   - Redesign question cards with refined glassmorphism, rounded corners (`rounded-2xl`), and subtle elevation.
4. **Standardize to "Section":**
   - Standardize all labels, tooltips, and filter headers strictly to "Section".
5. **AI Instruction & 1-Click Import/Export Studio (`sortable-field-card.tsx`):**
   - In each question card's Actions menu:
     - **AI Instruction & Schema:** Open modal showing prompt, system JSON, and target AI output schema.
     - **Export Question JSON:** 1-click copy of the question's complete JSON.
     - **Import / Replace from JSON:** Modal/dialog allowing authors to paste AI-generated JSON and immediately update the question.
6. **Theming Engine Overhaul & Button Hover Animations (`index.css`, `theme-context.tsx`):**
   - Replace hardcoded colors with theme variables (`hsl(var(--primary))`, `hsl(var(--card))`, `hsl(var(--border))`).
   - Add button hover micro-animations (`hover:scale-[1.02] active:scale-[0.98]`, glow micro-shadows, and smooth CSS transitions).

---

## 4. Architectural Prevention (Prevention)

1. **Unified Design Tokens:** Enforce semantic Tailwind classes (`bg-card`, `text-foreground`, `border-border`, `text-primary`) across all form components.
2. **Reusable File Validation:** Centralize all file inspection logic in `evaluateFileUploadValidation()`.
3. **Automated Quality Gates:** Ensure all Vitest tests pass with 0 regressions.

---

## 5. Resolution & Verification Status

- **Status:** [x] Resolved & Production-Ready
- **Verification Gates:**
  - `npx tsc --noEmit` -> 0 errors.
  - `npm run lint` -> 0 errors.
  - `npx vitest run` -> 71/71 tests passed.
  - Local Vite dev server -> running on `http://localhost:5173/`.


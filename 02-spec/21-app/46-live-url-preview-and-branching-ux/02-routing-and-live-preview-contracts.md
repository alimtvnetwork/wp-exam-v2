# Spec [46]: Routing & Live Preview Contracts

## 1. Route Topology

| Route Path | Component | Purpose | Query Parameters |
|---|---|---|---|
| `/admin` | `Index.tsx` | WordPress-style admin console | `?tab=builder`, `?tab=runner`, `?tab=focus-runner`, `?tab=projects`, etc. |
| `/preview` | `FormRunner.tsx` (wrapped) | Dedicated full-screen live preview of builder form | Optional `?token=...`, `?theme=...` |
| `/runner` | `FormRunner.tsx` (wrapped) | Public respondent runner | `?preview=true`, `?project=<id>`, `?invite=<token>`, `?token=<token>`, `?quiz=<id>` |
| `/wp-exam-runner` | Redirect to `/runner` | Backward-compatibility alias for legacy invite links | Preserves query string |
| `/apply` | `WizardRunner.tsx` | 4-step job application wizard | - |
| `/forms/canvas` | `VisualNodeCanvas.tsx` | Visual DAG project stage editor | - |

---

## 2. Live Preview Resolution Matrix (`FormRunner.tsx`)

When `FormRunner` initializes, it determines the active form in this strict order of precedence:

1. **Direct Prop (`initialForm`):**
   If `props.form` is passed and has fields, it is used immediately as `activeForm`. `selectedProjectId` defaults to `'custom-active'`.
2. **Preview Mode Flag (`?preview=true` or `/preview`):**
   If no prop is passed, but the URL path is `/preview` or contains `?preview=true` / `?preview=current`, load the active form from `useQuizStore.getState()`.
3. **Explicit Project Query (`?project=<id>`):**
   If `PRESET_PROJECTS[urlProject]` exists, use the preset.
4. **Preset Fallback:**
   Fallback to `PRESET_PROJECTS['intern-programmer']`.

---

## 3. URL Synchronization Contract (`Index.tsx`)

- On mount, `Index.tsx` reads `tab` from URL search parameters (`const tabParam = searchParams.get('tab') as AdminTab`). If valid, it initializes `activeTab` to `tabParam`.
- Whenever `activeTab` changes (e.g. user clicks a sidebar menu item), `Index.tsx` updates the browser query string via `window.history.replaceState` or React Router's `setSearchParams`, ensuring the URL reflects the active view (e.g. `/admin?tab=focus-runner`).
- When `ProjectHierarchyManager` launches the focus runner with a specific project, `Index.tsx` stores `selectedFocusProject` in state and passes it to `<FocusQuizRunner config={...} />`.

---

## 4. Public Share & Invite URL Generation

1. **Form Builder Live URL Toolbar:**
   - Displays real-time live preview URL: `${origin}/preview` or `${origin}/runner?preview=true`.
   - "Copy Live URL" button copies the public preview link to clipboard.
   - "Open in New Tab" button opens `/preview` in a new browser window.
2. **Focus Quiz Runner Share Link:**
   - Always generates `${origin}/runner?quiz=${config.id}&q=${currentQuestionIndex + 1}`.
   - Never uses `${origin}/admin`.
3. **Candidate Invite Links:**
   - Generates `${origin}/runner?invite=${token}&form=${store.id || 'current'}`.

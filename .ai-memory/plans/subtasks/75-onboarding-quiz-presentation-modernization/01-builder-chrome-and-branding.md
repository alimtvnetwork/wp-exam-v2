# Subtask 01: Builder Chrome & Brand Modernization

**Parent Plan:** [.ai-memory/plans/pending/75-onboarding-quiz-presentation-modernization.md](../../pending/75-onboarding-quiz-presentation-modernization.md)  
**Architecture Spec:** [02-spec/21-app/75-onboarding-quiz-presentation-modernization/01-architecture-spec.md](../../../../02-spec/21-app/75-onboarding-quiz-presentation-modernization/01-architecture-spec.md)  
**Assigned Worker:** Worker 01  
**Status:** Ready for Execution  

---

## 1. Scope & File Ownership

Worker 01 has exclusive edit ownership of exactly the following five files:

| # | Target File Path | Purpose |
|---|------------------|---------|
| 1 | `src/assets/onboarding-quiz-logo.svg` | Modern canonical SVG logo asset for the Onboarding Quiz platform |
| 2 | `src/components/admin/wp-admin-sidebar.tsx` | Admin sidebar brand header ('Onboarding Quiz v2.5'), logo integration, and high-contrast active navigation row styling |
| 3 | `src/components/forms/FormBuilder.tsx` | 2px top gradient ribbon (`h-0.5`), `shadow-md` card elevation, and unified expandable Config `DropdownMenu` |
| 4 | `src/components/forms/field-palette.tsx` | Overhaul to unclipped two-row card layout with `line-clamp-2` descriptions and compact category filter pills |
| 5 | `src/components/forms/sortable-field-card.tsx` | Standardize header actions to `h-8` icon buttons, tooltips, dirty-state Save button, constrained type selector, and card `shadow-md` |

### Strictly Forbidden / Out of Scope for Worker 01
- `src/styles/theme.css` (Owned by Worker 02)
- `src/lib/themes.ts` and `src/themes/theme-definitions.ts` (Owned by Worker 02)
- `src/components/runner/FormRunner.tsx` (Owned by Worker 02)
- Primitive UI components under `src/components/ui/*` (Do NOT modify `tabs.tsx` or `dropdown-menu.tsx`)
- Subtask plan 02 or companion specs (`02-component-spec.md`, `02-presentation-mode-and-theming.md`)

---

## 2. Strict Coding Guideline Constraints

1. **Positive Boolean Naming:** All state variables, props, and conditionals must use affirmative boolean prefixes:
   - Use `isQuestionDirty`, NOT `isNotClean`
   - Use `hasAttachedVideo`, NOT `noVideo`
   - Use `isSequential`, NOT `isNonSequential`
   - Avoid double negatives or inverted boolean parameters.
2. **Relative & Aliased Imports:** All module imports must utilize relative paths (`./...`, `../...`) or the standardized `@/...` root alias. Never use absolute filesystem paths.
3. **Strict No-Build & No-Test Rule:** Do NOT run `npm run build`, `npm run test`, `vite build`, `jest`, or start dev servers during implementation. Validate purely via syntax inspection, AST checking, and code review.
4. **Whitespace & Structure Preservation:** Maintain clean formatting, existing comments, and exported interface signatures so that sibling components and runner integrations remain 100% backwards compatible.

---

## 3. Discrete Implementation Steps for Worker 01

### Step 1: Create `src/assets/onboarding-quiz-logo.svg`
Create the dedicated brand logo asset with high visual clarity:
- Clean 32x32 SVG vector art.
- Dark navy background tile (`#152033`, `rx="8"`).
- Cream quiz sheet graphic (`#F7F4EC`, `rx="2.5"`).
- Form checklist bars (`#152033`).
- Emerald checkmark seal (`#1F8A4C`) with white check icon.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#152033"/>
  <rect x="7" y="6" width="14" height="18" rx="2.5" fill="#F7F4EC"/>
  <path d="M10.5 11.5h7M10.5 15h7M10.5 18.5h4.5" stroke="#152033" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="22.5" cy="21.5" r="6" fill="#1F8A4C"/>
  <path d="M19.8 21.6l1.8 1.8 3.6-3.8" stroke="#F7F4EC" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Step 2: Update Sidebar Brand & Contrast in `wp-admin-sidebar.tsx`
1. Import the brand logo:
   ```tsx
   import onboardingQuizLogo from '@/assets/onboarding-quiz-logo.svg';
   ```
2. Update the brand header block (around lines 185–209):
   - Replace old mark with `onboardingQuizLogo`.
   - Title: `"Onboarding Quiz"`.
   - Badge: `"v2.5"` (`text-xs px-1 rounded bg-muted text-primary font-mono border border-border`).
   - Subtitle: `"Admin Console"`.
3. Fix active navigation contrast (around lines 250–260):
   - Active state classes: `'bg-muted text-foreground font-semibold shadow-xs'`.
   - Left accent indicator: `'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary'`.
   - Ensure the active row NEVER applies `bg-primary/15` or yellow fill under the Riseup theme.

### Step 3: Modernize FormBuilder Ribbon & Expandable Config in `FormBuilder.tsx`
1. **Title Card Ribbon Restraint:**
   - Locate the main title `Card` in `FormBuilder.tsx` (around lines 700–710).
   - Ensure the card has classes: `border border-border/80 bg-card shadow-md rounded-2xl overflow-hidden animate-sweet-fade-in`.
   - Update top accent bar:
     ```tsx
     <div className="h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full" />
     ```
2. **Unified Config Dropdown:**
   - In the title card header row (around line 718), replace any residual inline buttons with the single `DropdownMenu`:
     - Trigger: `h-8 w-8` icon button with `SlidersHorizontal` icon, wrapped in `<Tooltip>` with content `"Config"`.
     - Items (strictly in order):
       1. Health & Design Audit: `setInspectorTab('audit')` + `setIsDesignPanelOpen(true)`. Shows grade and percentage score (`Health: ${grade} (${score}%)`).
       2. Quiz Config: `setIsCentralConfigOpen(true)`.
       3. Triggers: `setIsNotificationModalOpen(true)` with badge count when triggers exist.
       4. Separator.
       5. JSON Import / Export: `setIsJsonModalOpen(true)`.
       6. Import Google Forms: `setIsGoogleModalOpen(true)`.
       7. Visual Branching Flow: `setIsFlowModalOpen(true)`.
       8. Separator.
       9. Share: `handleCopyLiveUrl`.
   - Ensure Trash Popover remains positioned adjacent to the Config button, rendering only when `trashFields.length > 0`.

### Step 4: Overhaul Field Palette in `field-palette.tsx`
1. **Unclipped Two-Row Card Layout:**
   - Replace the inner flex layout inside the palette options loop (around lines 314–336).
   - Label: `text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight` (do NOT use `truncate` on the title).
   - Category Badge: `text-[10px] uppercase tracking-wider text-muted-foreground font-mono opacity-60 shrink-0`.
   - Description: Replace `truncate` with `text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2`.
2. **Category Filter Pills:**
   - Verify all 5 categories (`All`, `Choice`, `Text`, `Media`, `Page Elements`) fit horizontally inside the rail using compact icon-first buttons with tooltips, or compact padding (`py-1 px-1.5 text-xs`).

### Step 5: Streamline SortableFieldCard Header in `sortable-field-card.tsx`
1. **Card Elevation:**
   - Update the card root element (around line 530) to include `shadow-md rounded-2xl border-border/80 hover:border-primary/40`.
2. **CardHeader Toolbar Standardization:**
   - Adjust `CardHeader` padding to `py-2.5 px-4 sm:px-5` for a cleaner, compact footprint.
   - Per-Question Save button: Standardize to `h-8 w-8`. Wrap in `<Tooltip>` with content `"Save Question"`.
   - When dirty: `bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20`.
   - When clean: `bg-card border-border text-foreground hover:bg-accent`.
3. **Field Type Selector:**
   - Standardize `SelectTrigger` to `h-8 text-xs font-semibold min-w-0 w-[9rem] sm:w-[11rem] shrink overflow-hidden [&>span]:min-w-0 [&>span]:truncate`.
4. **Header Action Buttons:**
   - Standardize Layout Toggle (Quiz vs Slide), Answer Placement, Preview Toggle, and Actions Dropdown trigger to uniform `h-8` heights.
   - Wrap each control in Shadcn `<Tooltip>` with clear, descriptive labels.

### Step 6: Step-by-Step Code Validation
- Review all modified files for syntax errors or unclosed JSX tags.
- Verify positive boolean conventions across all updated state and prop names.
- Verify all relative paths and imports.

---

## 4. Acceptance Criteria Checklist for Worker 01

- [ ] `src/assets/onboarding-quiz-logo.svg` exists, valid SVG markup, 32x32 viewBox, navy/emerald theme.
- [ ] `wp-admin-sidebar.tsx` brand header displays `Onboarding Quiz`, `v2.5`, `Admin Console`, and the SVG logo.
- [ ] Selected sidebar item renders with `bg-muted text-foreground` and a thin `w-1 bg-primary` accent; zero yellow-on-yellow contrast issues under Riseup.
- [ ] `FormBuilder.tsx` title card has a subtle 2px top gradient (`h-0.5`) and `shadow-md rounded-2xl` styling.
- [ ] Inline utility buttons on the title card are consolidated into a single `Config` `DropdownMenu` with Tooltip.
- [ ] Form title input has ample space and is not clipped on standard screen sizes.
- [ ] `field-palette.tsx` cards render with unclipped titles and `line-clamp-2` descriptions.
- [ ] `sortable-field-card.tsx` header toolbar actions are standardized to `h-8` with Shadcn Tooltips.
- [ ] Per-question Save button highlights distinctly in emerald when dirty, and returns to neutral when saved.
- [ ] Field type `SelectTrigger` does not overflow the question card width.
- [ ] Zero build/test runs executed.

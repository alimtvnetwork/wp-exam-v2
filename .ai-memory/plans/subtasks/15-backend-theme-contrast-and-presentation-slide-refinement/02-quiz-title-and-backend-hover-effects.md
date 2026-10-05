# Subtask 02: Quiz Title & Admin Hover Effects

**Status:** Queued  
**Parent Plan:** `.ai-memory/plans/80-backend-theme-contrast-and-presentation-slide-refinement.md`  
**Spec Reference:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/02-dracula-and-backend-admin-styling.md`  

---

## 1. Objectives

1. Refine `src/components/admin/wp-admin-sidebar.tsx`:
   - Enhance contrast of section headers (`AUTHORING & CURRICULUM`, etc.) with `text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 font-mono`.
   - Enhance interactive hover on inactive navigation items with `text-foreground/80 hover:text-foreground hover:bg-muted/70 hover:translate-x-1 hover:border-l-2 hover:border-primary/40`.
2. Refine `src/components/forms/FormBuilder.tsx`:
   - Assessment title input wrapped in `group/title` with blended resting state, smooth hover effect (`hover:border-primary/60 hover:bg-accent/25 hover:shadow-xs`), and subtle pencil indicator on hover.
   - Form description field styled with `text-sm text-foreground/80 hover:text-foreground focus:text-foreground`.

## 2. Target Files

- `src/components/admin/wp-admin-sidebar.tsx`
- `src/components/forms/FormBuilder.tsx`

## 3. Acceptance Verification

- Hovering over assessment title triggers smooth background tint, border accent, and pencil cue.
- Admin sidebar items display clear contrast and slide animation on hover.

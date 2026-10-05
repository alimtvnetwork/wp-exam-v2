# Specification 79: Component 02 — Dracula Theme & Backend Admin Console Styling

**Parent Spec:** `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/01-overview.md`  
**Target Files:**  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/themes/theme-definitions.ts`  
- `src/lib/theme-context.tsx`  
- `src/components/admin/wp-admin-sidebar.tsx`  
- `src/components/forms/FormBuilder.tsx`  

---

## 1. Problem Definition: Dracula Theme Washed-Out Admin UI

In the current theme configuration, the Dracula theme defines:
- `--background: 231 15% 12%` (`#191A21`)
- `--card: 231 15% 18%` (`#282A36`)
- `--muted-foreground: 225 27% 51%` (`#6272A4`) in `src/styles/theme.css` and `src/styles/theme.less`

Because `#6272A4` has a luminance of under 20%, when rendered against Dracula's dark surfaces (`#282A36`), the contrast ratio is barely ~2.4:1. This causes:
1. In the sidebar: unselected menu items (`Focus Quiz Studio`, `Curriculum Projects`, etc.) look faded, faint, and nearly invisible.
2. In section headers: category titles (`AUTHORING & CURRICULUM`, `CANDIDATE DELIVERY`, `OPERATIONS & TRIAGE`) blend in with the dark background.
3. In builder cards: descriptions, metadata badges, and form controls lose structure and visual hierarchy.

---

## 2. Dracula Color Variable Upgrades

Update Dracula tokens across all stylesheets and configuration files:

```css
/* theme.css & theme.less */
.theme-dracula,
[data-theme="dracula"] {
  --primary: 265 89% 78%;              /* #BD93F9 Neon Dracula Purple */
  --primary-foreground: 231 15% 12%;   /* #191A21 Dark Contrast */
  --background: 231 15% 12%;           /* #191A21 Deep Dark Violet Canvas */
  --foreground: 60 30% 96%;            /* #F8F8F2 Crisp Off-White */
  --card: 231 15% 18%;                 /* #282A36 Elevated Dracula Surface */
  --card-foreground: 60 30% 96%;
  --popover: 231 15% 18%;
  --popover-foreground: 60 30% 96%;
  --border: 232 14% 34%;               /* #4B4E63 Defined Surface Edge */
  --input: 232 14% 34%;
  --ring: 265 89% 78%;
  --accent: 265 89% 78%;
  --accent-foreground: 231 15% 12%;
  --secondary: 232 14% 25%;
  --secondary-foreground: 60 30% 96%;
  --muted: 232 14% 25%;
  --muted-foreground: 225 25% 76%;     /* #BAC7E8 High-Contrast Accessible Lilac-Slate */
  --wp-exam-bg: #191A21;
  --wp-exam-card: #282A36;
  --wp-exam-card-border: #44475A;
  --wp-exam-card-hover: #343746;
  --wp-exam-card-active-border: #BD93F9;
  --wp-exam-card-active-bg: #383A59;
  --wp-exam-primary: #BD93F9;
  --wp-exam-primary-text: #282A36;
  --wp-exam-highlight: #50FA7B;
  --wp-exam-text-primary: #F8F8F2;
  --wp-exam-text-secondary: #BAC7E8;   /* Upgraded from #6272A4 */
  --wp-exam-progress-bar: #BD93F9;
  --wp-exam-badge-bg: rgba(189, 147, 249, 0.2);
}
```

---

## 3. WordPress Admin Sidebar Enhancements (`wp-admin-sidebar.tsx`)

1. **Section Headers:**
   Change category headers from plain `text-muted-foreground` to:
   ```tsx
   <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 font-mono flex items-center gap-1.5">
     {section.title}
   </span>
   ```

2. **Navigation Items Contrast & Slide Hover:**
   - Active state:
     `bg-primary/15 text-foreground font-semibold shadow-xs ring-1 ring-primary/40`
     Active bar: `w-1 rounded-r bg-primary`
   - Inactive state:
     `text-foreground/80 hover:text-foreground hover:bg-muted/70 hover:translate-x-1 transition-all duration-200`
   - Icons:
     Active: `text-primary`
     Inactive: `text-muted-foreground group-hover:text-primary transition-colors`
   - Badges:
     High contrast styling so `v2.5`, `New`, `Distraction-Free` badges stand out cleanly against the sidebar background.

---

## 4. Assessment Title Interactive Hover in `FormBuilder.tsx`

The user requested:
> "Also, try to blend it in, try to have the hover over on the name of the quiz and things like that."

In `src/components/forms/FormBuilder.tsx`, update the assessment title input and header card:
1. **Interactive Title Container:** Wrap the title in an interactive zone with smooth transition:
   ```tsx
   <div className="relative group/title flex-1">
     <input
       type="text"
       value={title}
       onChange={(e) => setTitle(e.target.value)}
       placeholder="Untitled Assessment Form"
       className="w-full text-xl sm:text-2xl font-bold bg-transparent border-0 border-b border-transparent group-hover/title:border-border/80 group-hover/title:bg-accent/25 focus:bg-accent/35 focus:border-primary focus:outline-none transition-all duration-200 px-3 py-1.5 rounded-lg text-foreground placeholder:text-muted-foreground/50 cursor-text"
       title="Click to edit assessment title"
     />
     <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/title:opacity-60 transition-opacity pointer-events-none flex items-center gap-1 text-xs text-muted-foreground">
       <Edit3 className="w-3.5 h-3.5" />
       <span className="text-[11px] font-mono">Edit Title</span>
     </div>
   </div>
   ```
2. **Top Bar Header Name:** Add subtle hover highlight to the `Onboarding Quiz Builder` header brand in `FormBuilder.tsx` and `wp-admin-sidebar.tsx`.

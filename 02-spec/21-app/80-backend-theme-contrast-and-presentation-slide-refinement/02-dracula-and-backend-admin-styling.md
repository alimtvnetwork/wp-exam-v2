# Specification 80: Component Spec 02 — Dracula Theme Contrast & Backend Admin Console

**Parent Spec:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  
**Area:** Admin Console, Dracula Theming, Sidebar Navigation, Quiz Title Interactions  

---

## 1. Problem Statement: Washed-Out Admin UI in Dracula Theme

As illustrated in visual artifact `assets/screenshots/user-feedback-admin-dracula-faded.png`, the Antigravity Dracula theme previously rendered with muddy secondary text (`#6272A4`) in the admin console. Because the card backgrounds use `#282A36` and `#191A21`, this resulted in an illegible ~2.4:1 contrast ratio that blended menus, labels, and descriptions into a dull dark mass.

Furthermore, the quiz assessment title ("Sample Sequential Knowledge Quiz") lacked interactive feedback, appearing as flat, static text without tactile indication of editability.

---

## 2. Token Contrast Architecture

The Dracula theme tokens across all CSS, LESS, and TypeScript catalogs are upgraded to high-contrast values:

| Token | Previous Muddy Value | Upgraded Accessible Value | Contrast vs `#282A36` | Role |
| :--- | :--- | :--- | :--- | :--- |
| `--muted-foreground` | `225 27% 51%` (`#6272A4`) | `225 25% 76%` (`#BAC7E8`) | **7.2:1** (AAA) | Secondary descriptions, hints, metadata |
| `textSecondary` | `#6272A4` | `#BAC7E8` | **7.2:1** (AAA) | Theming catalog secondary text |
| `--card-border` | `#3A3A4A` | `#44475A` | **3.8:1** (UI Border) | Distinct card boundary definition |
| `--card-hover` | `#2D2F3F` | `#343746` | N/A | Tactile elevation on hover |
| `--wp-exam-card-active-border` | `#BD93F9` | `#BD93F9` | **5.2:1** (AA) | Active card ring indicator |
| `--wp-exam-card-active-bg` | `#2D2F3F` | `#383A59` | N/A | Active selection background tint |

### Unified Token Consistency Across 5 Sources
The updated token values must be synchronized across:
1. `src/styles/theme.css` (`.theme-dracula`, `[data-theme="dracula"]`)
2. `src/styles/theme.less` (`.theme-dracula`, `[data-theme="dracula"]`)
3. `src/lib/themes.ts` (`THEME_PRESETS.dracula`)
4. `src/themes/theme-definitions.ts` (`THEME_DEFINITIONS.dracula`)
5. `src/lib/theme-context.tsx` (`THEME_CONFIGS.dracula`)

---

## 3. WordPress Admin Sidebar Enhancements (`wp-admin-sidebar.tsx`)

1. **Navigation Section Headers:** Render uppercase group labels in crisp `text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 font-mono` to ensure clear section hierarchy.
2. **Inactive Navigation Items:**
   - Base state: `text-foreground/80 font-medium`
   - Hover state: `hover:text-foreground hover:bg-muted/70 hover:translate-x-1 hover:border-l-2 hover:border-primary/40 transition-all duration-200`
   - Icon styling: `text-muted-foreground group-hover:text-primary transition-colors`
3. **Active Navigation Items:**
   - Accent bar: `absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary`
   - Surface styling: `bg-primary/15 text-foreground font-semibold shadow-xs ring-1 ring-primary/40 border-l-2 border-primary`
   - Icon styling: `text-primary`
4. **Header Brand Identity:**
   - Application brand link with `group-hover:text-primary transition-colors`.

---

## 4. Assessment Title & Description Interactivity (`FormBuilder.tsx`)

1. **Interactive Quiz Title (`group/title`):**
   - Base state: Crisp `text-xl sm:text-2xl font-bold bg-transparent border-0 border-b border-border/30 rounded-lg text-foreground px-3 py-1.5`
   - Hover state: `hover:border-primary/60 hover:bg-accent/25 hover:shadow-xs transition-all duration-200`
   - Focus state: `focus:bg-accent/35 focus:border-primary focus:outline-none`
   - Interactive Pencil Cue: Absolute-positioned badge `opacity-0 group-hover/title:opacity-60 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5 text-xs text-muted-foreground` displaying `<Edit3 className="w-3.5 h-3.5 text-primary" />` and `Edit Title`.
2. **Form Description Field:**
   - Render in `text-sm text-foreground/80 hover:text-foreground focus:text-foreground bg-transparent border-0 border-b border-border/30 hover:border-border focus:border-primary focus:outline-none transition-colors px-1 py-1` with placeholder `placeholder:text-muted-foreground/50`.

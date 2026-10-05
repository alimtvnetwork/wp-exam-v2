# Specification 79: Theme Contrast, Hover Animations, and Presentation Layout

**Status:** Approved  
**Priority:** High  
**Parent Epic:** Onboarding Quiz Presentation & Admin UI Modernization  
**Specification Root:** `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/`  

---

## 1. Executive Summary

This specification addresses critical UI/UX and thematic contrast issues identified across the application:

1. **Antigravity Dracula Theme in Backend Admin Panel:** In the admin console (`src/components/admin/wp-admin-sidebar.tsx`, `src/components/forms/FormBuilder.tsx`), Dracula theme renders with faded, low-contrast text where elements blend together into an illegible dark background. Muted foreground contrast must be upgraded from muddy comment slate (`#6272A4`, ~2.4:1 contrast) to crisp, accessible lilac-slate (`#BAC7E8`, 7.2:1 contrast).
2. **Interactive Hover States on Quiz Name & Admin Controls:** The assessment title and header elements in `FormBuilder.tsx` require smooth, blended hover interactions with subtle color glow, animated background tint transitions, and interactive indicator cues.
3. **Presentation Mode Question Title Vertical Centering:** In presentation mode (`src/components/runner/FormRunner.tsx`), the question prompt must be centered vertically in its column to provide optimal visual gravity, with the right-hand options column nudged downward slightly (`pt-4 lg:pt-8`) for perfect optical balance.
4. **Permanent Removal of Candidate Response Label:** Enforce a strict, unconditional ban on the redundant `Candidate Response` label and header section in all runner views.
5. **MCQ/Single-Choice Option Animations & Blending:** Options in presentation mode and standard runner must have semi-transparent blended resting states (`opacity: 0.82`, `bg-card/70`), smooth slide-right hover animations (`transform: translate3d(6px, 0, 0)`), opacity fade-in to `1.0`, and theme-aware border and background glow.
6. **Riseup and Purple Theme Guidelines Compliance:** Realign the Riseup palette strictly with repository guidelines: cream (`#F7F1E6`) primary text, dark navy (`#0A0A14`) canvas, and gold (`#E8C547`) strictly reserved as an active indicator mark (never text highlight). Realign the Purple theme with white (`#FFFFFF`) on deep violet (`#0F0E1E`) and luminous borders (`#3A3568`).

---

## 2. Problem Statement & User Directives

| Domain | Current Issue | Target Solution |
| :--- | :--- | :--- |
| **Dracula Theme in Admin Panel** | Muted text and sidebar labels use `--muted-foreground: 225 27% 51%` (`#6272A4`). In the admin sidebar and card descriptions, text blends into `#282A36` / `#191A21` surfaces, appearing muddy and washed out. | Upgrade `--muted-foreground` to `225 25% 78%` (`#BAC7E8`) for Dracula. Enhance sidebar item contrast, border highlights, and hover transitions. |
| **Quiz Name Hover in Admin** | The quiz title input in `FormBuilder.tsx` has minimal hover feedback, lacking interactive warmth. | Add subtle pill background tint, luminous border glow, and interactive pencil cue on hover. |
| **Presentation Title Alignment** | The question title sits at the very top baseline of the 2-column grid, causing vertical visual imbalance when answer options are fewer or tall. | Vertically center the title in the left column (`flex flex-col justify-center min-h-[55vh]`) and offset the right options column slightly downward (`pt-4 lg:pt-8`). |
| **Candidate Response Label** | Historical `Candidate Response` label header was redundant and previously cluttered the runner. | Ensure zero instances of `Candidate Response` exist across all components, templates, and specs. |
| **Option Hover Animations** | Unselected options have static opacity and lack sliding feedback. | Provide resting semi-transparency (`opacity: 0.82`), smooth sliding transition (`translateX(6px)`), theme-colored border highlights, and text brightening on hover. |
| **Riseup Theme Coloring** | Title highlights previously rendered acronyms (e.g., "HTML") in gold `#E8C547`, violating Rule 9. | Render title highlights in cream `#F7F1E6` with crisp styling; restrict `#E8C547` strictly to active selection marks. |
| **Purple Theme Presentation** | Action buttons and option cards require enhanced contrast against `#0F0E1E`. | Enforce luminous borders (`#3A3568`), vivid indigo buttons (`#5C45FD`), and crisp white text (`#FFFFFF`). |

---

## 3. Specification Structure

- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/01-overview.md` — Architectural overview & user directives
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/02-dracula-and-backend-admin-styling.md` — Dracula theme contrast & admin console styling
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/03-presentation-layout-and-candidate-removal.md` — Title centering, right column balance, zero Candidate Response
- `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/04-hover-animations-and-theme-palettes.md` — Option slide animations, Riseup & Purple theme color parity

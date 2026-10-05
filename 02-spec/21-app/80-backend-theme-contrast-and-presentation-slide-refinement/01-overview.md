# Specification 80: Backend Theme Contrast, Option Hover Motion, and Presentation Slide Refinement

**Status:** Approved  
**Priority:** High  
**Parent Epic:** Onboarding Quiz Presentation & Admin UI Modernization  
**Specification Root:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  

---

## 1. User Request (Verbatim)

```text
Fix these UI issues. I really like this color in the presentation, but for this theme, I believe this is the Antigravity Dracula theme. I don't like this in the backend admin panel because the backend admin panel is a bit more faded. The text actually blends in. It feels like the same thing. Try to improve the menu and other stuff for the backend side so this theme will look really nice. Also, try to blend it in, try to have the hover over on the name of the quiz and things like that. When we are in the presentation mode for the quizzes, try to take the title in the middle so that it looks nice, and the right-hand side should go a little bit down, but not too much, a little bit so that it remains as it is. Do not use the candidates response section. I asked you to remove this several times. The backend for this theme looks terrible. Make the UI better, think about this, and then work with it. First, try to write a spec regarding these changes, how you're going to improve the design. Write those for the AI first part. Then you start with the work. That is the priority. Try to have better animation when I hover over. For example, the current text has no effects when I hover over. What you could do, the options, keep this a little bit blended in, like opacity, a bit of transparency. When I hover over, this actually comes as a sliding animation on top of this. The opacity goes in, like faded animation, that looks nice, colorful. Add a little bit of coloring when I hover over. Play with the contrast and darkness with the coloring so that it looks very professional. With all these themes, actually, not only these themes, but also other themes. When we are in the presentation mode, the purple theme also needs some improvements. Riseup Asia LLC theme, the HTML coloring and things like that. This is not the exact color from the Riseup Asia LLC, so check the spec from the coding guidelines. Try to improve your design spec coloring. And also the buttons.
```

---

## 2. Visual Feedback Artifacts & Screenshots

The user provided 5 visual feedback artifacts captured from live presentation and admin environments:

1. **Presentation Layout & Centering:** `assets/screenshots/user-feedback-presentation-layout.png` (`media_1791184206952.png`)  
   - Highlights the uncentered question prompt and requests vertical optical centering in the slide canvas.
   - Highlights the right-hand answer column with an arrow indicating a slight downward offset.
2. **Candidate Response Removal Confirmation:** `assets/screenshots/user-feedback-candidate-response-removal.png` (`media_1791184475297.png`)  
   - Shows the legacy `Candidate Response` label mark that must be completely and irreversibly eradicated.
3. **Backend Admin Panel Contrast Deficiency:** `assets/screenshots/user-feedback-admin-dracula-faded.png` (`media_1791184492841.png`)  
   - Shows the WordPress Admin Sidebar and Form Builder in Dracula theme where muted text blends into dark card surfaces.
4. **Presentation Options Column Alignment:** `assets/screenshots/user-feedback-presentation-options-right.png` (`media_1791184530634.png`)  
   - Shows option rows needing smooth sliding animation, resting transparency, colorful hover tinting, and text shadow hover spread.
5. **Riseup Brand Theme Acronym Color Violation:** `assets/screenshots/user-feedback-riseup-html-coloring.png` (`media_1791184575662.png`)  
   - Shows "HTML" highlighted in gold (`#E8C547`) instead of brand-compliant cream (`#F7F1E6`).

---

## 3. Executive Architectural Goals

| Area | Current Issue | Target Architectural Solution |
| :--- | :--- | :--- |
| **Dracula Admin Contrast** | Muted text and sidebar labels use `--muted-foreground: 225 27% 51%` (`#6272A4`), appearing muddy and washed out against `#282A36` surfaces. | Upgrade `--muted-foreground` to `225 25% 76%` (`#BAC7E8`) across `theme.css`, `theme.less`, and theme catalogs. Boost sidebar section headers (`text-foreground/70 font-semibold tracking-wider font-mono`) and hover states with primary tint (`bg-primary/10 hover:border-l-2 hover:border-primary/60`). |
| **Quiz Title Hover Feedback** | Assessment title input in `FormBuilder.tsx` has static styling with minimal interactive cues and low contrast. | Add blended background container (`bg-muted/30 border border-border/40 hover:border-primary/70 hover:bg-muted/50 rounded-xl px-4 py-2.5 shadow-2xs`), luminous border glow, and interactive pencil cue on hover. |
| **Presentation Title Centering** | Question title in 2-column mode had `items-start` pinning it to the top of the canvas. | Vertically center the title in the slide canvas (`items-center w-full my-auto` with `lg:self-center`) and provide a controlled downward offset (`pt-2 lg:pt-6 xl:pt-8`) on the right options column. |
| **Candidate Response Section** | Redundant candidate response label previously cluttered the runner header. | Verify zero occurrences in DOM or JSX. Automated test assertion `screen.queryByText(/candidate response/i) === null`. |
| **Option Hover Animations & Color Tint** | Options have static opacity and lack colorful interactive sliding feedback. | Resting semi-transparency (`opacity: 0.82`, `bg-card/75`), smooth slide-right hover (`transform: translate3d(6px, 0, 0)`), opacity fade-in to `1.0`, colorful theme tinting (`linear-gradient(90deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--card) / 0.92) 100%)`), theme border glow (`border-color: hsl(var(--primary) / 0.75)`), and text-shadow spread across **all themes**. |
| **Riseup Theme Palette & Buttons** | Technical acronyms (e.g. "HTML") rendered in gold `#E8C547`, violating Rule 9. | Render acronyms in brand cream `#F7F1E6` with `font-extrabold`; reserve gold `#E8C547` strictly for active indicator marks. Buttons use cream primary (`#F7F1E6`) with dark navy text (`#0A0A14 font-bold`) and subtle gold active rings. |
| **Purple Theme Presentation** | Action buttons and option cards require enhanced contrast against `#0F0E1E`. | Enforce luminous borders (`#3A3568`), vivid indigo buttons (`#5C45FD`), and crisp white text (`#FFFFFF`). |

---

## 4. Document Directory

- `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/01-overview.md` — Executive summary & screenshot citations
- `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/02-dracula-and-backend-admin-styling.md` — Dracula theme contrast & admin console styling
- `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/03-presentation-layout-and-candidate-removal.md` — Presentation layout vertical balance & zero candidate response
- `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/04-hover-animations-and-theme-palettes.md` — Option slide motion, colorful hover tint, Riseup & Purple theme color compliance
- `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/05-acceptance-criteria.md` — Verification matrix & automated test checklist

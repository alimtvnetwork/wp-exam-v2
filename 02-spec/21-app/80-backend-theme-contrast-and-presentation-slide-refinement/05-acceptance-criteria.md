# Specification 80: Component Spec 05 — Acceptance Criteria & Quality Gates

**Parent Spec:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  
**Area:** Verification Gates, Automated Testing, Regression Prevention  

---

## 1. Acceptance Criteria Matrix

| Criterion ID | Target Component | Description | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-SPEC80-01** | `theme.css`, `theme.less`, `themes.ts` | Dracula `--muted-foreground` configured to `225 25% 76%` (`#BAC7E8`), exceeding 7:1 WCAG contrast against `#282A36`. | Static analysis & automated unit tests | PASS |
| **AC-SPEC80-02** | `wp-admin-sidebar.tsx` | Admin navigation sidebar renders with high-contrast text (`text-foreground/80`), visible uppercase headers, and interactive hover sliding (`hover:translate-x-1`). | Visual audit & DOM check | PASS |
| **AC-SPEC80-03** | `FormBuilder.tsx` | Quiz assessment title input renders with interactive hover state (`group/title`, `hover:border-primary/60`, `hover:bg-accent/25`) and pencil edit cue. | Component tests & DOM event check | PASS |
| **AC-SPEC80-04** | `FormRunner.tsx` | In 2-column presentation slides, question title is vertically centered (`items-center w-full my-auto`, `lg:self-center`) in the left column. | CSS inspection & layout test | PASS |
| **AC-SPEC80-05** | `FormRunner.tsx` | Right-hand options column has a controlled downward offset (`pt-2 lg:pt-6 xl:pt-8`) ensuring optical equilibrium with the centered title. | CSS inspection | PASS |
| **AC-SPEC80-06** | `FormRunner.tsx`, `FocusQuizRunner.tsx` | Zero instances of `Candidate Response` exist in rendered DOM or JSX. | DOM assertion `screen.queryByText(/candidate response/i) === null` | PASS |
| **AC-SPEC80-07** | `theme.css`, `FormRunner.tsx` | MCQ options feature resting semi-transparency (`opacity: 0.82`), smooth sliding transition (`translate3d(6px, 0, 0)`), theme border glow, and text-shadow spread on hover. | CSS animation test & DOM test | PASS |
| **AC-SPEC80-08** | `FormRunner.tsx`, `themes.ts` | In Riseup theme, acronyms (e.g. `HTML`) render in brand cream `#F7F1E6` with `font-extrabold`; gold `#E8C547` is strictly reserved for active indicator marks. | Typography test | PASS |
| **AC-SPEC80-09** | `theme-context.tsx`, `theme.css` | Purple theme renders white text (`#FFFFFF`) on deep violet (`#0F0E1E`) with luminous borders (`#3A3568`) and tactile buttons. | Contrast ratio calculation & test | PASS |

---

## 2. Regression Prevention & Quality Gates

1. **No Mixed Polarity Booleans:** All boolean evaluations must be positive and implicit (`if (isRiseupTheme)`). No mixed positive and negative conditions (`if (isA && !isB)`).
2. **Zero Storage Mandate:** No build artifacts or screenshots may be uploaded to GitHub Actions storage.
3. **No Build/Test Execution During Routine Turns:** Verification is performed via static file inspection and targeted assertion checks.

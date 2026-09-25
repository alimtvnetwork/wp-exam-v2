# Spec 51: Embedded Design Validation Dock & Fluid Palette Architecture

## 1. Domain Architecture & System Context
This specification defines the seamless integration of the **Real-Time Design Validation & Health Audit System** directly into the right-hand Inspector Dock of the FormBuilder (`src/components/forms/FormBuilder.tsx`), alongside a senior-grade redesign of the **Field Palette** (`src/components/forms/field-palette.tsx`) and **Questions Outline**.

By embedding the Design Validation Engine into a dedicated 4th dock tab (`Audit` / `Validation`) with live badge indicators, authors gain continuous real-time diagnostic visibility, categorical scoring breakdowns, inline field jumps, and 1-click auto-fixes without needing to open a separate modal.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  FormBuilder Header                                                                    │
│  [Title] [Live URL: /preview 📋 ↗]         [Health 95% A+]  [Tools ▾] [Preview] [Save] │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴──────────────────────────────────────────────────┐
│  2-Column Fluid Layout                                                                 │
│  ┌──────────────────────────────────────────────┐ ┌──────────────────────────────────┐ │
│  │ Main Google Forms Canvas                     │ │ Right Inspector Dock             │ │
│  │                                              │ │ [Fields] [Outline] [Audit] [Cfg] │ │
│  │  ┌────────────────────────────────────────┐  │ │ ──────────────────────────────── │ │
│  │  │ Form Title & Header Description Card   │  │ │ Health Score: 95% (Grade A+)     │ │
│  │  └────────────────────────────────────────┘  │ │ [████████████████████░░] 95%     │ │
│  │  ┌────────────────────────────────────────┐  │ │                                  │ │
│  │  │ Question #1 Card [Req] [10pt] [•••]    │  │ │ Categorical Health:              │ │
│  │  │  Prompt Input                          │  │ │  • Structure: 100%               │ │
│  │  │  Option List                           │  │ │  • Choice Sets: 90%              │ │
│  │  └────────────────────────────────────────┘  │ │  • Quiz Scoring: 100%            │ │
│  │  ┌────────────────────────────────────────┐  │ │  • Branching Logic: 100%         │ │
│  │  │ Question #2 Card [Req] [10pt] [•••]    │  │ │  • A11y / Guidance: 85%          │ │
│  │  └────────────────────────────────────────┘  │ │                                  │ │
│  │                                              │ │ Diagnostic Violations (2):       │ │
│  │                                              │ │ [!] Q2 lacks placeholder guidance│ │
│  │                                              │ │     [Jump] [1-Click Fix]         │ │
│  │                                              │ │                                  │ │
│  │                                              │ │ [✨ Fix All Repairable Issues]   │ │
│  └──────────────────────────────────────────────┘ └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. User Request (Verbatim)
```text
is it done?

please add design validation system??

https://prnt.sc/e53IZKChkVu4

Fix these buttons. Do not add too many buttons. Try to compact the buttons with a drop-down. And the idea here is that we can preview it and make sure the buttons does have the proper alignment everywhere, and try to integrate a code to import Google Forms. Okay, so if we have the Google Form account access authentication, we should be able to import a whole Google Form to our system. That is a priority. Okay, and on top of this, we can actually customize the logic. So please make a big plan and implement this and try to fix this UI/UX and make sure the UI is fluid. Currently, if we go into the right-hand side also, it looks terrible. It looks like a junior or someone who does not have any design conscious, they have done it. So please based on this
```

## 3. Visual Reference Assets
- User Reference Screenshot: `assets/screenshots/google-forms-import-and-card-compact-01.png`
- Relative Markdown Link: `![Google Forms Import & Compact Header](assets/screenshots/google-forms-import-and-card-compact-01.png)`

## 4. Key Architectural Deliverables
1. **Dock Tab Integration:** Expand the right-hand segmented switcher from 3 tabs (`Fields`, `Outline`, `Config`) to 4 tabs (`Fields`, `Outline`, `Audit`, `Config`), displaying a live badge with the letter grade or issue count.
2. **Embedded Audit Dock View (`DesignValidationSidebarView`):**
   - Live health score radial/meter (0–100) with grade pill (`A+`, `A`, `B`, `C`, `D`).
   - Categorical radar meters (`Structure`, `Choices`, `Scoring`, `Logic`, `A11y`).
   - Filterable issue list (`All`, `Errors`, `Warnings`, `A11y`) with inline "Jump" and "1-Click Fix" triggers.
   - Global "Fix All Repairable Issues" button.
3. **Fluid Field Palette Enhancements:**
   - Single-column / responsive 2-column layout optimized for 320px–420px inspector widths.
   - Glassmorphic card surfaces, pastel icon badges, hover elevation, and micro-interactions.
   - Live search input with instant clear (`✕`) button and categorized filter chips.
4. **Interactive Synchronization:** Clicking the header health pill opens the comprehensive dialog OR focuses the Audit tab in the right dock with active synchronization.

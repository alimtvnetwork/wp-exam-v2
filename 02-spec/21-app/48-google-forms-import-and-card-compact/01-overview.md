# Specification: Google Forms Import Engine & Field Card Actions Compact

## 1. User Request (Verbatim)

```text
https://prnt.sc/e53IZKChkVu4

Fix these buttons. Do not add too many buttons. Try to compact the buttons with a drop-down. And the idea here is that we can preview it and make sure the buttons does have the proper alignment everywhere, and try to integrate a code to import Google Forms. Okay, so if we have the Google Form account access authentication, we should be able to import a whole Google Form to our system. That is a priority. Okay, and on top of this, we can actually customize the logic. So please make a big plan and implement this and try to fix this UI/UX and make sure the UI is fluid. Currently, if we go into the right-hand side also, it looks terrible. It looks like a junior or someone who does not have any design conscious, they have done it. So please based on this
```

Visual Reference: ![User Review Screenshot](assets/screenshots/google-forms-import-and-card-compact-01.png)

---

## 2. Executive Summary & Blast Radius

This specification addresses critical UI/UX bottlenecks in the Form Builder and introduces complete Google Forms import architecture:

1. **Card Action Buttons Compactness:** In `sortable-field-card.tsx`, replace the horizontal sprawl of loose buttons (`Test Preview`, `Validation`, `Triggers`, `Branching`, `Duplicate`, `Delete`) with an elegant `Actions ▾` dropdown menu (Radix UI `DropdownMenu`), keeping only high-frequency controls visible and aligned cleanly with the question header.
2. **Badge Clipping & Typographic Polish:** Resolve squished and overflowing type badge (`[MULTIPLE CHOICE]`) by restructuring the header card layout, maintaining consistent flex wrapping, proper padding, and crisp typography.
3. **Right-Hand Sidebar Fluidity:** Complete overhaul of `field-palette.tsx` and the builder sidebar in `FormBuilder.tsx`. Eliminate bulky, oversized cards in favor of sleek, compact, design-token-compliant draggable components with refined typography and micro-interactions.
4. **Google Forms Full Importer:**
   - **Google Forms API v1 Integration:** Connect via OAuth2 access token / API key to fetch form metadata, questions, choices, and validation.
   - **Public Viewform URL Parser:** Scrape/parse published Google Forms (`https://docs.google.com/forms/d/e/.../viewform` or form ID) to extract title, description, questions, and choice lists.
   - **JSON / Schema Importer:** Dedicated modal (`GoogleFormsImportModal`) supporting URL scraping, API connect, and schema upload.
5. **Customizable Logic Post-Import:** Once imported, questions seamlessly populate the Quiz Store (`useQuizStore`), allowing full attachment of custom scoring, branching rules, compound validations, and live preview runner execution.

---

## 3. Extracted Actionable Task List

- **Task-01:** Field Card Header Compact Actions & Badge Redesign in `sortable-field-card.tsx`.
- **Task-02:** Right-Hand Sidebar & Palette Fluid Redesign in `field-palette.tsx` and `FormBuilder.tsx`.
- **Task-03:** Google Forms Importer Engine (`google-forms-importer.ts`) supporting API, URL, and JSON.
- **Task-04:** Google Forms Import Modal & UI Wiring in `FormBuilder.tsx`.
- **Task-05:** Quality Gates, Unit Tests, and Build Verification in `src/test/google-forms-import.test.ts`.

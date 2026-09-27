# Spec 18: Presentation UI/UX, Multi-Format Citation Links Parser & Advanced Email Trigger Engine

## Status: Active
## Domain: 21-app (WP Exam Core Application)

---

## 1. Overview & Architectural Blueprint

This specification standardizes the presentation-grade quiz runner, field card UI refinements, multi-format citation/reference link parser, and multi-layer variable email notification system across WP Exam.

### 1.1 Core Problems Addressed
1. **Field Card Option Visual Clash**: Replace bulky, conflicting "Correct Answer" text buttons with minimal icon checkmarks with hover tooltips, standardized typography in standard REM (`text-base`), and high-contrast color tokens.
2. **Responsive Toolbar Breakage**: Provide an overflow dropdown menu for field card actions when space is restricted.
3. **Multi-Format Citation Links**: Ingest 5 different URL/citation formats (Double-line Title+URL, Colon Title:URL, Markdown links, Raw URLs, and JSON array) with auto-detection, URL title extraction, auto-expanding input rows, and Poppins headers.
4. **Advanced Multi-Layer Email Engine**: Redesign notification rules with existing vs new selection, dynamic form field mapping for `To`/`From`, cascading notification layers, and CC/BCC controls.
5. **FormBuilder Top Bar Space Optimization**: Replace raw slug text with a compact link icon + copy button, condense secondary tool buttons, and prevent header collision.
6. **Cinematic Presentation Runner**: Deliver a full-viewport 2-column slide presentation layout with a collapsible sequential question drawer, fluid answer inputs, and streamlined top preview bar.

---

## 2. Multi-Format Link & Citation Parser (5 Supported Formats)

The system must parse pasted text into structured `QuestionReferenceLinkItem[]`:
```ts
export interface QuestionReferenceLinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
}
```

### Supported Ingestion Formats:
- **Format 1: Double-Line (Title above URL)**
  ```text
  Example Domain
  https://example.com/

  alimkarim.com
  https://alimkarim.com/
  ```
- **Format 2: Colon Separated (Title: URL)**
  ```text
  Example Domain: https://example.com/
  alimkarim.com: https://alimkarim.com/
  ```
- **Format 3: Markdown Hyperlinks**
  ```markdown
  [Example Domain](https://example.com/)
  [alimkarim.com](https://alimkarim.com/)
  ```
- **Format 4: Raw URLs (Domain extracted as fallback title)**
  ```text
  https://example.com/
  https://alimkarim.com/
  ```
- **Format 5: Structured JSON Array**
  ```json
  [
    {
      "title": "Example Domain",
      "url": "https://example.com/"
    },
    {
      "title": "alimkarim.com",
      "url": "https://alimkarim.com/"
    }
  ]
  ```

---

## 3. UI/UX Refinements

### 3.1 Field Card MCQ Options
- Selected correct option renders as a circular emerald checkmark (`CheckCircle2`) with `title="Marked as Correct Answer"`.
- Unselected option renders as a neutral muted outline checkmark (`Circle`) with `title="Click to mark as correct"`.
- Typography uses `font-sans` (Poppins) with standard `text-sm` and `text-base` for question titles, eliminating dark blended overlays.

### 3.2 Responsive Footer Overflow Menu
- When card width < 480px, group [Duplicate, Delete, Allow Other, Points] into an `Actions` Dropdown Menu (`DropdownMenuTrigger` with `MoreVertical`).

### 3.3 FormBuilder Header Optimization
- Slug chip replaced by icon button (`Link2` + `Copy` on click, popover for editing).
- Segmented Quiz Format vs Presentation Slide pills styled compactly with `h-8`.
- Action buttons grouped with clear icon indicators and tooltips.

### 3.4 Presentation Slide Runner
- Full-screen fluid layout: Left side (50% on desktop) displays Question Headline, Subtitle, Description, Reference Links, and Action Checklist.
- Right side (50%) hosts elevated, borderless answer card with high-contrast radio/checkbox items.
- Collapsible Left Drawer displays numbered question sequence with answered/pending icons.

---

## 4. Verification Gates
1. Unit test suite covering all 5 citation formats and auto-detection in `src/test/citation-link-parser.test.ts`.
2. Responsive layout verification in `src/test/presentation-ui-ux.test.ts`.
3. ESLint check with 0 errors.
4. Production build verification with `npm run build`.

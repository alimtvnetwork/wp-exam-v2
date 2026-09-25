# Verification Gates & Acceptance Criteria

Version: 1.0.0
Updated: 2026-09-25
Category: Specification Verification Gates

---

## 1. Acceptance Criteria Checklist

- [ ] **AC-01: WordPress Left-Hand Sidebar Navigation:** Admin dashboard features a vertical left-hand navigation panel matching WordPress layout standards with categorized sections (Curriculum, Delivery, Operations, System).
- [ ] **AC-02: Responsive Sidebar Collapse:** Sidebar supports toggle between expanded (250px) and collapsed (64px) icon-only modes with smooth transitions.
- [ ] **AC-03: Drag-and-Drop Question Card Ergonomics:** Question cards in FormBuilder feature prominent grip handles, clear type badges, points badges, and high-contrast inputs.
- [ ] **AC-04: Categorized Field Palette:** Field additions are driven by a categorized palette (Choice, Input, Verification/Media) with descriptive icons and 1-click addition.
- [ ] **AC-05: Design Token & Contrast Conformance:** All components render with high-contrast text and theme tokens across Rise Up Asia, Purple, Obsidian, and Clean Light themes.
- [ ] **AC-06: Zero Lint Errors & Clean Build:** ESLint passes with 0 errors and Vite production build succeeds.

---

## 2. Automated Quality Invariants

- Boolean check implicit rule: Zero `== true` expressions.
- Function sizing: <= 8 to 15 lines per function where applicable.
- Relative paths: Zero `file:///` URIs or absolute paths in committed code.

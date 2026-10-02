# App UI — Acceptance Criteria Index

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

Master index of acceptance criteria for the `24-app-ui-design-system` specification directory.

---

## Acceptance Criteria Registry

### AC-ADS-001: Design Token & Component Isolation
- **Given:** React SPA styled with Tailwind CSS and CSS variables.
- **When:** Mounting the app inside the WordPress admin page.
- **Then:** All elements are encapsulated within `.wp-exam-theme` and no styles leak into core WordPress admin components.
- **Command:**
  ```bash
  npm run build && npm run test
  ```

### AC-ADS-002: Multi-Theme Contrast & HSL Palette Verification
- **Given:** The 8 canonical themes (`green-choice`, `clean-wide`, `microsoft-blue`, `riseup-asia`, `dracula`, `purple`, `vscode-dark`, `sweet-digs`).
- **When:** Loading the candidate runner or toggling themes via the theme picker.
- **Then:** All text and interactive cards satisfy WCAG 2.1 AA/AAA contrast guidelines (>4.5:1 for body copy, >7.0:1 for dark themes, >3.0:1 for borders).
- **Command:**
  ```bash
  npm run test
  ```

### AC-ADS-003: CSS3 Motion, Card Entrance & Zero Hover Scale
- **Given:** Sequential question advancement in `FormRunner`.
- **When:** Advancing to the next question step or hovering over options.
- **Then:** `.animate-card-entrance` fires smoothly without layout jitter, and no option card applies disruptive hover scaling (`hover:scale-*`).
- **Command:**
  ```bash
  npm run test
  ```

### AC-ADS-004: Candidate View Ergonomics & Distraction-Free Header
- **Given:** A respondent accessing `/f/:slug` or author previewing at `/preview/:slug`.
- **When:** Rendering the candidate runner header.
- **Then:** Developer debug tools (`[⚡ Auto | 🛠️ Debug | ✕ Exit]`) and demo project selectors are hidden, and mock fallback suggestions are removed.
- **Command:**
  ```bash
  npm run test
  ```

### AC-ADS-005: New-Tab Preview Routing & Modal Elimination
- **Given:** An author clicking "Preview" in `FormBuilder`.
- **When:** Triggering preview mode.
- **Then:** The assessment opens in a dedicated browser tab at `/preview/:slug` with full viewport dimensions instead of a cramped admin modal.
- **Command:**
  ```bash
  npm run build
  ```


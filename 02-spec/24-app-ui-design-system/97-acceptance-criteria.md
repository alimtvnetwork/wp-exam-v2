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

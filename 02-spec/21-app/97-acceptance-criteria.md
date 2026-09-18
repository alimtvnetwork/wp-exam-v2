# App — Acceptance Criteria Index

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

Master index of acceptance criteria for the `21-app` specification directory.

---

## Acceptance Criteria Registry

### AC-APP-001: Application Build & Conformance
- **Given:** The workspace is initialized with dependencies installed.
- **When:** Running the application smoke and unit test suite.
- **Then:** All frontend Vitest tests and lint checks exit with code 0.
- **Command:**
  ```bash
  npm run test && npm run lint
  ```

### AC-APP-002: Quiz Plugin Feature Activation
- **Given:** WordPress environment with `wp-exam` plugin active.
- **When:** Administrator navigates to WP Admin -> Quizzes.
- **Then:** `#wp-exam-app` mounts successfully and displays the quiz manager UI without JavaScript console errors.

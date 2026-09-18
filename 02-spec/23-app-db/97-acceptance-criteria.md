# App DB — Acceptance Criteria Index

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

Master index of acceptance criteria for the `23-app-db` specification directory.

---

## Acceptance Criteria Registry

### AC-ADB-001: Schema Conformance & Naming
- **Given:** WordPress database schema defined in `23-app-db/01-schema.md`.
- **When:** Validating SQL table definitions.
- **Then:** All table names are singular PascalCase prefixed with `$wpdb->prefix`, all primary keys follow `{Table}Id`, and all migrations are idempotent.
- **Command:**
  ```bash
  python 03-ai-scripts/06-cicd-local-runner.py
  ```

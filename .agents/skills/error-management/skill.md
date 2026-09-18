---
name: error-management
description: Enforces structured error handling, appfault wrappers, and universal response envelopes.
---

# Error Management Skill

## Core Enforcements
1. Never swallow errors; wrap with operation name and context.
2. Return *appfault.AppError or Result[T] in Go; structured AppError in TypeScript.
3. Universal response envelope: { Status, Attributes, Results }.
4. Frontend errors flow to global store and modal; no per-component alert boxes.

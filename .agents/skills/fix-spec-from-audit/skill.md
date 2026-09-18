---
name: fix-spec-from-audit
description: Autonomously ingests the latest specification audit file, decomposes findings into an exhaustive 1:1 remediation checklist, executes parallel remediation on specs, verifies compliance, and closes the audit gap.
---

# Fix Spec from Audit Skill

## Workflow

### 1. Audit Ingestion & Finding Matrix
- Scan `02-spec/25-app-spec-audit/` for the latest audit file (`NN-audit-*.md`).
- Parse the Markdown Summary Table at the bottom of the audit report.
- Build 1:1 remediation ledger in `.ai-memory/plans/pending/xx-spec-remediation.md`.
- Decompose findings into lean subtasks under `.ai-memory/plans/subtasks/xx-spec-fix/`.

### 2. Multi-Agent Remediation Execution
- Group subtasks by target file and execute fixes in isolated micro-batches.
- Fix missing file topologies, undefined REST contracts, test specs, acceptance criteria, enums, DB schemas, and design tokens.
- Track progress in `.ai-memory/temp-agents/xx-<task-name>/state.md`.

### 3. Verification & Quality Gates
- Verify cross-links with `check-spec-cross-links.py`.
- Format markdown with `03-ai-scripts/31-md-gap-fixer.py`.
- Run local CI/CD runner `03-ai-scripts/06-cicd-local-runner.py`.

### 4. Audit Gap Removal & Archive
- Verify all ledger checkboxes are marked `[x]`.
- Remove or archive the audit report from `02-spec/25-app-spec-audit/`.
- Consolidate subtasks into `.ai-memory/plans/completed/xx-spec-remediation-completed.md`.
- Update `.ai-memory/plans/01-index.md` and `.ai-memory/what-to-read.md`.
- Commit and push changes.

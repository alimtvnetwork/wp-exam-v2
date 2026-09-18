---
name: write-memory
description: Persists learned rules, conventions, retrospectives, and session context into .ai-memory/ with strict index synchronization.
---

# Write Memory Skill

## Workflow
1. Audit last 30 commits (git log -n 30 --oneline) before writing memory.
2. Maintain compact 20-task recent completion register in .ai-memory/plans/01-index.md.
3. Never write to root memories/ - use .ai-memory/memory/learned/.
4. Update .ai-memory/memory/01-index.md whenever adding a new memory file.
5. Append new hard prohibitions to .ai-memory/strictly-avoid.md (never overwrite).

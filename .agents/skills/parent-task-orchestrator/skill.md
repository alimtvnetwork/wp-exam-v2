---
name: parent-task-orchestrator
description: Autonomously orchestrates and executes parent tasks through N-step continuous self-looping and strict 2-agent concurrency.
---

# Parent Task N-Step Continuous Loop & Multi-Agent Orchestration

## Core Principles
1. **Phase 1: Planning Mode & Task Extraction (Steps 1..N/2):**
   - Record verbatim user prompt in pending plan.
   - Extract actionable task deliverables.
   - Decompose into lean subtasks in .ai-memory/plans/subtasks/xx-<slug>/.
   - Never stop after planning; immediately self-loop to Phase 2.
2. **Phase 2: Execution Mode & Parallel Refactoring (Steps N/2+1..N):**
   - Dispatch at most 2 concurrent subagents on disjoint files.
   - Strict folder bounding within .ai-memory/.
   - Enforce coding guidelines and universal response envelopes.
3. **Task Consolidation & Final Atomic Commit:**
   - Consolidate all subtasks into .ai-memory/plans/completed/xx-<slug>.md.
   - Single grouped atomic git commit and push before ending turn.

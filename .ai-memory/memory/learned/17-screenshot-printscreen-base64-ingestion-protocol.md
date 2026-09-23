# Screenshot & Print Screen Base64 Ingestion Protocol

## What Was Learned

- **Print Screen URL & Base64 Image Ingestion**:
  - Whenever user prompts, task descriptions, or issue tickets provide a screenshot URL, print screen link, or base64 data URI (`data:image/png;base64,...`):
  - **Local Persistence**: Agents must immediately decode the base64 encoding or download the image from the URL to the local filesystem under `assets/screenshots/<task-slug>-<NN>.png` or `assets/ui/<task-slug>-<NN>.png`.
  - **Ban on Embedded Base64 Strings**: Raw base64 payloads and ephemeral remote URLs must never be left in prompt texts, specifications, plans, subtasks, or code comments to prevent context blowout and token waste.
  - **Strict Relative Path Referencing**: All references in specs and documentation must use strict relative paths (e.g., `![Screenshot](assets/screenshots/<task-slug>-<NN>.png)`). Absolute filesystem paths (`file:///` or OS drive letters) remain strictly banned under Rule 5.
  - **Visual Ground Truth**: The saved image file serves as the canonical visual reference for UI layout, hierarchy, spacing, typography, and state styling during spec authoring and frontend component execution.
- **Synchronized Prompts & Skills**:
  - Updated parent task execution prompts (`01-prompts/14-execute/01`, `02`, `03`, `04`, `05`, `06`, `07`).
  - Updated spec authoring and reverse-engineering prompts (`01-prompts/13-plan-audit/02`, `01-prompts/03-read-write/08`).
  - Updated Antigravity execution, spec, and UI skills (`.agents/skills/execute-parent-task`, `execute-parent-task-with-n-steps`, `parent-task-n-step-loop`, `execute-batched-loop`, `execute-batched-loop-wor`, `execute-pending-tasks`, `execute-ai-instruction-writer`, `spec-authoring-and-validation`, `spec-reverse-engineering`, `react-ui-theming-design`).

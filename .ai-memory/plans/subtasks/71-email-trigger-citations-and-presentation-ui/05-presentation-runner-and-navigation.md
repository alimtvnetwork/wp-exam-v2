# Subtask 05: Presentation 2-Column Split Runner, Collapsible Menu & Header Compaction
Traceability ID: Task-07 (Part B)
Spec Reference: [02-spec/21-app/18-presentation-ui-ux-and-links-parser.md](../../../02-spec/21-app/18-presentation-ui-ux-and-links-parser.md)
Target Files: src/components/runner/FormRunner.tsx
Action: In FormRunner.tsx: remove redundant URL banner from runner header, replace with compact Copy link button. Compact Autofill, Debug, and Exit into a unified segmented pill `[ ⚡ Auto | 🛠️ Debug | ✕ Exit ]`. In presentation split mode, suppress Hero section and Candidate Guest banner from displaying on top of active question slide. Deliver clean 2-column split presentation slide: Left column (50%) has Eyebrow kicker, Ubuntu question headline, Poppins description, reference links, and action checklist; Right column (50%) has elevated answer card with high-contrast options and `Enter ↵` keyboard shortcut hint. Remove "Mandatory" text from question card header. Ensure collapsible question drawer on left side with sequential navigation locking.
Acceptance Criteria:
- No redundant URL banner; compact Auto/Debug/Exit pill.
- In presentation split mode, active question takes full slide viewport with zero obstructive banners above.
- Left column: Kicker, Ubuntu headline, Poppins description, references, checklist.
- Right column: Elevated answer card with high-contrast options.
- Zero "Mandatory" text in question card header.
Targeted Verification: TypeScript compile check.

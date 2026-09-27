# Subtask 04: FormBuilder Header Compaction, Secondary Utility Bar & Live Preview Modal
Traceability ID: Task-06, Task-07 (Part A)
Spec Reference: [02-spec/21-app/18-presentation-ui-ux-and-links-parser.md](../../../02-spec/21-app/18-presentation-ui-ux-and-links-parser.md)
Target Files: src/components/forms/FormBuilder.tsx
Action: In FormBuilder.tsx: streamline top action bar to only hold Back button, title, compact Link popover chip, Public Globe badge, format toggle (Quiz Format vs Presentation Slide), and Preview/Save segmented control. Move [🔔 Triggers] and [🛠️ Tools ▾] down to the secondary utility row alongside Health Audit, Trash, and Share. Render full-screen `<Dialog open={isRunnerPreviewModalOpen} onOpenChange={setIsRunnerPreviewModalOpen}>` containing `<FormRunner ... isPreviewRoute={true} />` at the bottom of the component so Preview immediately opens an interactive runner modal without popup blocking.
Acceptance Criteria:
- Top action bar does not collide or wrap on narrower viewports.
- Triggers and Tools live cleanly in secondary utility bar.
- Clicking Preview button immediately launches live interactive preview modal with zero popup blocker issues.
Targeted Verification: TypeScript compile check.

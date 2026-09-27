# Subtask 01: Multi-Layer Variable Email Notification Trigger System
Traceability ID: Task-01
Spec Reference: [02-spec/21-app/18-presentation-ui-ux-and-links-parser.md](../../../02-spec/21-app/18-presentation-ui-ux-and-links-parser.md)
Target Files: src/components/forms/notification-trigger-modal.tsx
Action: Implement initial decision cards (Use Existing Preset vs Create New Rule), ensure empty state when no saved rules exist, variable recipient mapping for To: with form field token selection and custom input, multi-layer cascading execution stages (Layer 1 acknowledgment, Layer 2 team dispatch), dedicated CC and BCC fields, and clean disable-by-default activation.
Acceptance Criteria:
- Modal asks user whether to use an existing preset or create a new rule.
- If no rules are configured in form, does not force a default active rule; starts on clean selection screen.
- Form fields from `store.fields` are available in dropdown for `To:`, plus custom variable entry.
- Multi-layer cascading stages can be added, edited, and removed.
Targeted Verification: TypeScript compile check.

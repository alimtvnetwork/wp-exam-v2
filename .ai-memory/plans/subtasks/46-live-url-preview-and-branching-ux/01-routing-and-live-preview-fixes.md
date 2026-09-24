# Subtask [01]: Routing & Live Preview Fixes
Traceability ID: Task-01
Spec Reference: [02-spec/21-app/46-live-url-preview-and-branching-ux/02-routing-and-live-preview-contracts.md](../../../02-spec/21-app/46-live-url-preview-and-branching-ux/02-routing-and-live-preview-contracts.md)
Target Files: src/App.tsx, src/components/runner/FormRunner.tsx, src/components/forms/FormBuilder.tsx
Action: Register `/preview` and `/wp-exam-runner` routes; fix `FormRunner.tsx` active form resolution to give top precedence to `initialForm` and `/preview` store loader; add Live URL toolbar in `FormBuilder.tsx`.
Acceptance Criteria:
- Opening Live Preview in `FormBuilder` displays the active user-edited form.
- Direct navigation to `/preview` renders the active form from `useQuizStore`.
- `/wp-exam-runner` aliases to `/runner`.
Targeted Verification: npm run lint

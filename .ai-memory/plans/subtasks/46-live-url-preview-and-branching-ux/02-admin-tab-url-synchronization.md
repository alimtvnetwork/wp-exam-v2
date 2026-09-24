# Subtask [02]: Admin Tab URL Synchronization & Public Share Link Fixes
Traceability ID: Task-02
Spec Reference: [02-spec/21-app/46-live-url-preview-and-branching-ux/02-routing-and-live-preview-contracts.md](02-spec/21-app/46-live-url-preview-and-branching-ux/02-routing-and-live-preview-contracts.md)
Target Files: src/pages/Index.tsx, src/components/runner/FocusQuizRunner.tsx, src/components/admin/invites-manager.tsx
Action: Synchronize `activeTab` with browser URL query string (`?tab=...`); pass selected project from `ProjectHierarchyManager` to `FocusQuizRunner`; fix share links in `FocusQuizRunner` to use `/runner?quiz=...`; fix invite links in `invites-manager` to point to `/runner?invite=...`.
Acceptance Criteria:
- Switching admin tabs updates browser URL to `/admin?tab=<tab_id>`.
- Refreshing browser on `/admin?tab=projects` restores the projects tab.
- Public share links in `FocusQuizRunner` never point to `/admin`.
Targeted Verification: npm run lint

# Hierarchical Curriculum Engine Specification

## 1. Hierarchy Topology

The curriculum architecture models multi-tier educational programs, corporate onboarding, and technical certifications into 4 structured tiers:

```
Category / Subject (e.g. Employee Onboarding & Security)
 └── Project (e.g. Security Compliance & Password Hygiene)
      ├── Recursive Sub-Projects (e.g. Hardware Security Keys & YubiKey)
      │    └── Sub-Sections (Practical Tasks, Checklists, Quizzes)
      └── Sections (Reading Documentation, Video Lectures, Verification Checklists, Focus Quizzes)
```

---

## 2. Recursive Sub-Projects & Data Schema

### 2.1 Schema Definition
- `categories`: Top-level subject grouping container with title, description, display order, and allowed permissions.
- `projects`: Individual curriculum course module:
  - `id`: Unique string slug (e.g. `proj_sec_101`).
  - `category_id`: Foreign key referencing parent category.
  - `parent_project_id`: Recursive pointer to parent project (blank for top-level projects, populated for sub-projects).
  - `pipeline_order_json`: Ordered array of section IDs or sub-project IDs defining execution sequence.
  - `permissions_json`: Array of WordPress roles or candidate IDs permitted to access the module.
  - `settings_json`: Module-level options (passing score, theme ID, random questions toggle).

### 2.2 Execution Pipeline Reordering
- Execution pipelines allow administrators to configure custom progression paths:
  - Default sequential order: Section 1 -> Section 2 -> Section 3.
  - Non-linear curriculum ordering: Step A -> Step C -> Step D -> Step B.
  - Administrators can move steps up or down using pipeline controls in `ProjectHierarchyManager`.

---

## 3. Project JSON Import & Export

### 3.1 Export Contract
- Administrators can export any project as a self-contained JSON manifest:
  - Encapsulates ID, title, description, category ID, parent project ID, pipeline order, permissions, sections, checklists, reading materials, quiz questions, sub-projects, and revision history.
  - Generates downloadable `.json` file and copies formatted text to clipboard.

### 3.2 Import Contract
- Allows pasting JSON manifests or uploading files:
  - Validates presence of mandatory `title` and array attributes.
  - Auto-assigns new revision timestamps and records change summary in `history/{id}_history.sqlite`.
  - Instantly attaches to the currently selected Category in the UI tree.

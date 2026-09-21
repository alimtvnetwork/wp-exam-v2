---
name: wp-exam-admin-and-curriculum
description: Admin management architecture for WP Exam, including 4-tier curriculum hierarchy, drag-and-drop FormBuilder, AI Instruction Studio, candidate invites, and bug triage.
---

# WP Exam: Admin Management & Curriculum Hierarchy Architecture

This skill guides the design, implementation, and modification of the admin management suite in `src/components/admin/` and form building tools in `src/components/forms/`.

## 1. 4-Tier Curriculum Hierarchy Model

The curriculum tree follows a 4-tier hierarchical domain model:

1. **Category / Subject**: Top-level academic domain or department (e.g. "WordPress Development", "Frontend Engineering").
2. **Parent Project**: Core curriculum module or course (e.g. "Core Gutenberg Mastery").
3. **Recursive Sub-Projects**: Multi-level branching sub-modules with parent-child inheritance.
4. **Sections**: Granular learning units contained within a project:
   - Documentation Study Section (multi-page markdown/HTML viewer).
   - Video Lesson Section (YouTube, Vimeo, or hosted video).
   - Practical Verification Checklist Section (interactive gatekeeping checklist).
   - Focus Quiz Section (single-item focus exam).

### Topological Sequencing & Pipeline Reordering
- Projects support custom progression pipelines (e.g., section order `[1, 3, 2, 4]` or prerequisite gates).
- Pipeline cycles are strictly forbidden; validation must perform cycle detection before saving new topologies.

## 2. Form & Quiz Builder (`FormBuilder.tsx`)

- Located in `src/components/forms/FormBuilder.tsx`.
- Powered by `@dnd-kit/core` and `@dnd-kit/sortable` for fluid drag-and-drop reordering of fields and options.
- Dynamic field property drawer:
  - Label, Placeholder, Helper text.
  - Required toggle (`isRequired`).
  - Validation rules (Numeric min/max, Email format, Regex pattern with custom error messages).
  - Branching target selection per option.
  - Live preview mode toggling between builder layout and candidate runner view.

## 3. AI Instruction Studio (`ai-instruction-studio.tsx`)

- Located in `src/components/admin/ai-instruction-studio.tsx`.
- Purpose: Admin tool for generating complete curriculum modules, prompt templates, and quiz structures using AI models.
- System prompt templates:
  - **Onboarding Curriculum Designer**: Generates complete multi-tier courses with reading docs, videos, checklists, and quizzes.
  - **Screenshot to Quiz Compiler**: Analyzes uploaded UI screenshots and emits validated JSON quiz definitions.
  - **Technical Exam Author**: Produces rigorous multiple-choice and practical submission questions with weighted scoring.
  - **Theme Styler**: Synthesizes custom CSS color tokens and design presets from natural language prompts.
- Built-in JSON linter and schema validator ensuring emitted manifests comply with `FocusQuizConfig`.

## 4. Candidate Invites & Access Control (`invites-manager.tsx`)

- Located in `src/components/admin/invites-manager.tsx` and supported by `UserInviteRestController.php`.
- Generates cryptographically secure candidate access tokens with configurable expiration dates and max-attempt counts.
- Dispatches automated email invitations with personalized exam URLs (`/exam?token=...`).
- Tracks invite lifecycle: `Pending` -> `Accepted` -> `Completed` / `Expired`.

## 5. Candidate Question Bug Triage & Reporting

- Supported by `AnalyticsDashboard.tsx` and `question_reports` database table.
- When candidates flag an issue during exam execution (Bug, Typo, Ambiguous Question, Answer Dispute), report records are ingested with candidate ID, question ID, timestamp, and explanation.
- Admin Triage Workflow:
  - Status transitions: `New` -> `Investigating` -> `Resolved` -> `Dismissed`.
  - Resolution actions: Correct question text, adjust valid answer options, grant retroactive points, or dismiss frivolous flags.

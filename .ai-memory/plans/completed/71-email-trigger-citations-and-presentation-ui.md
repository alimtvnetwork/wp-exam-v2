# Plan 71: Email Trigger System, Citations Redesign, and Presentation UI/UX Optimization

Spec Reference: [02-spec/21-app/18-presentation-ui-ux-and-links-parser.md](../../../02-spec/21-app/18-presentation-ui-ux-and-links-parser.md)

## User Request (Verbatim)
The user requested fixing email setup, resolving color clashes, compacting controls on reduced space, standardizing MCQ correct answer with a hoverable checkmark, reducing question title font sizes using REM, fixing citations header typography to Poppins, adding auto-expanding citation rows, removing redundant cross, supporting 5 reference link formats, compacting FormBuilder header, and delivering the full 2-column split presentation runner with collapsible question menu, URL bar removal, and instant preview.

## Architecture Context & Blast Radius
- `src/components/forms/notification-trigger-modal.tsx`: Advanced notification triggers with initial choice (preset vs new), variable field mapping, cascading layers, and CC/BCC.
- `src/components/forms/sortable-field-card.tsx`: MCQ checkmark buttons, uniform `h-10` option rows, responsive footer overflow menu, question title REM sizing, Poppins item headers, auto-expanding citation rows, and single left delete icon.
- `src/components/forms/FormBuilder.tsx`: Top header compaction (icon link chip, public globe icon, compact format pills, Preview/Save segmented control), secondary utility bar (`[ 🔔 Triggers ]` and `[ 🛠️ Tools ▾ ]`), and instant live preview `<Dialog>`.
- `src/components/runner/FormRunner.tsx`: Streamlined runner header (no redundant URL banner, compact Auto/Debug/Exit pill), 2-column presentation layout, Poppins/Ubuntu hierarchy, no mandatory badge text, and collapsible question drawer.

## Task Mapping & Subtasks
- Subtask 01: Multi-Layer Variable Email Notification Trigger System -> `.ai-memory/plans/subtasks/71-email-trigger-citations-and-presentation-ui/01-email-trigger-system.md`
- Subtask 02: Field Card MCQ Checkmark, Option Row Dimensions & Typography REM -> `.ai-memory/plans/subtasks/71-email-trigger-citations-and-presentation-ui/02-field-card-options-and-typography.md`
- Subtask 03: Citations Modal Auto-Expansion, Poppins Header & Single Left Delete -> `.ai-memory/plans/subtasks/71-email-trigger-citations-and-presentation-ui/03-citations-modal-redesign.md`
- Subtask 04: FormBuilder Header Compaction, Secondary Utility Bar & Live Preview Modal -> `.ai-memory/plans/subtasks/71-email-trigger-citations-and-presentation-ui/04-formbuilder-header-and-preview-modal.md`
- Subtask 05: Presentation 2-Column Split Runner, Collapsible Menu & Header Compaction -> `.ai-memory/plans/subtasks/71-email-trigger-citations-and-presentation-ui/05-presentation-runner-and-navigation.md`

## Verification & Completed Outcomes
- **Multi-Layer Variable Email Triggers**: Initial trigger decision screen displays cards for "Use Existing Rule Preset" vs "Create New Custom Rule". Email notifications are disabled by default without forced triggers. Dual-mode recipient mapping supports detected form field variables and custom variable tokens (`{{candidate_email}}`, `{{field_email}}`). Cascading execution stages (Layer 1 -> Layer 2) and CC/BCC inputs are operational.
- **Field Card MCQ & Options**: Option rows are standardized to uniform `h-10 rounded-lg` across letter badge (`w-10 h-10`), text input (`h-10 text-base`), checkmark button (`w-10 h-10`), and delete button (`w-10 h-10`). The "Other" option row matches exact dimensions. Duplicate configure buttons or badges removed.
- **Question Title Font Size**: Scaled to `text-[0.95rem] sm:text-base font-semibold h-10` with clean REM-based typography and animated floating placeholder indicator.
- **Citations & References**: Item #N header uses Poppins (`font-sans text-xs font-semibold`). Auto-expanding rows dynamically add trailing empty items upon typing. Single delete icon (`Trash2`) on left, redundant right cross and redundant add button removed. All 5 reference formats (Double-line, Colon, Markdown, Raw URL, JSON array) supported with format guide tabs.
- **FormBuilder Header & Secondary Bar**: Relocated `[ 🔔 Triggers ]` and `[ 🛠️ Tools ▾ ]` to the secondary utility row alongside Health Audit, Trash, and Share. In-dialog `<Dialog>` preview modal eliminates browser popup blocking while preserving "New Tab" button.
- **Presentation Split Runner Canvas**: Redundant URL banner removed and replaced with compact Copy Link button. Action pill consolidated to `[ ⚡ Auto | 🛠️ Debug | ✕ Exit ]`. Hero section and Candidate Guest banner suppressed in presentation mode. True 2-column presentation grid with left-hand kicker, Ubuntu headline, Poppins description, reference cards, action checklist, and right-hand elevated answer card with keyboard shortcut hint (`Enter ↵`). Redundant "Mandatory Response" badge purged.
- **Quality Gates**: `npm run compile` built successfully in 3.43s. 187 vitest tests passed across 17 test suites with 0 errors.

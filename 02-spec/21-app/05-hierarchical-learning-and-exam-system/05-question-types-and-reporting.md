# Question Types, Reporting Triage & AI Studio Specification

## 1. Supported Question Types & Input Modalities

The system natively supports 6 input modalities:
1. **MCQ (Single-Choice Radio)**:
   - Single selectable option with radio indicator.
   - 1-column or 2-column responsive layout.
   - Custom emoji / icon adornment per option.
2. **Multi-Select Checkbox**:
   - Multiple selectable options with checkmarks.
   - Subtitle indicator: "Select all that apply".
3. **Short Answer & Paragraph (Text Area)**:
   - Free-form text input for subjective responses, architectural descriptions, or code snippets.
4. **URL Submission & Mindmap Links**:
   - Accepts links to mindmaps, workflow diagrams, or collaborative documents.
   - Live URL verification engines:
     - `google_docs`: Requires valid `docs.google.com` link.
     - `workflowy`: Requires valid `workflowy.com` link.
     - `xmind`: Requires valid `xmind.app` link.
     - `figma`: Requires valid `figma.com` link.
     - `url`: Standard web URL regex matching.
   - Visual feedback: Renders real-time green checkmark or red warning banner as the candidate types.
5. **File Upload (PDF & Document)**:
   - File attachment supporting `.pdf`, `.docx`, and `.doc` up to 25MB.
6. **Hints & Reference Links**:
   - On-demand hint disclosure accordion and reference documentation links.

---

## 2. Question Reporting & Bug Triage Subsystem

### 2.1 Candidate Reporting Modal (`FocusQuizRunner`)
- Accessible via the flag icon on any active quiz question.
- Report Categories:
  - 💬 Question Feedback / Ambiguity
  - 🐛 Technical Bug
  - 📝 Typo / Grammar
  - ⚖️ Dispute Correct Answer
- Collects candidate email (optional for anonymous submissions) and detailed problem description.
- Persists report to `localStorage` and dispatches to REST endpoint `POST /wp-json/wp-exam/v1/reports`.

### 2.2 Instructor Triage Table (`AnalyticsDashboard`)
- Displays all reported questions and technical bugs in a dedicated card.
- Summarizes total report count, open issues count, and technical bugs count.
- Filter chips: `All`, `🐛 Bugs`, `💬 Feedback`, `📝 Typos`, `⚖️ Disputes`.
- Action buttons: "Mark Resolved" and "Dismiss from Triage".

---

## 3. AI Instruction Studio

- Accessible in the admin navigation via `🤖 AI Studio`.
- **System Prompt Templates**:
  - `Onboarding Curriculum Designer`: Converts raw documentation into a structured 3-stage JSON course (Reading Docs + Checklist + Focus Quiz).
  - `Screenshot to Quiz Compiler`: Guides vision-capable models to extract titles, options, emojis, and layouts from visual UI screenshots into valid WP Exam JSON.
  - `Technical Exam Author`: Generates 10-question technical certifications with anti-cheat grading.
- **Built-in JSON Validator**: Allows testing and validating AI-generated JSON before importing into the hierarchy manager.

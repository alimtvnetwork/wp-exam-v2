# 17 — Presentation Split Layout, Question Display Modes & Best UI/UX Preview Architecture

> **/goal** Implement a presentation-grade 2-column split question layout, dual form/question layout configurators, interactive reference cards and mandatory checklist to-dos, and real-time Quiz vs Presentation preview modes.
> **/learn** Synthesizes presentation patterns from `presentations-repos` (Pitch, Slidev, flat-slide-show) and world-class UI benchmarks (Linear, Typeform, Slido). Adheres strictly to positive booleans, strict relative git paths, and standard typography (Ubuntu headings, Poppins body).

---

## 1. Verbatim Requirement Ingestion

```text
What are the best UI/UX projects that you know of? Can you get some ideas and improve the spec inside our project? That's the first thing. Second, I want you to improve the UI/UX better if you can. Especially, I want you to focus on the preview item of the question. So that could be somewhere like a presentation. The left-hand side, there will be question, right-hand side, there will be choice of question answers or writing, things like that. I want that flavor as well. So user can pick how they will present to the user, how the user sees it. And a question will also have a way. So on top of the question, there will be a default setup. And also inside a question, there will be a setup like how it will be displayed. So let's say a question can be displayed as a quiz, as a presentation, left-hand side, bigger question, a little bit of description, and right-hand side, the inputs to fill, and if any reference, it would be in the left-hand side and the check mark or two means that they have to do. Think like that. Like a presentation. And you can get some presentation ideas from the presentation owner. We have a presentation repos inside the work directory. Check those out, get some ideas. It's a long process. I want you to first write the spec and then improve it. It's not going to happen overnight, so you need to understand these aspects, create this presentation over BU preview segments, then it would be happening. Okay? So spend some time, then do it. Present here.
```

---

## 2. World-Class UI/UX Architectural Benchmarks

### 2.1 Typeform & Linear Micro-Interaction Foundations
1. **Uncluttered Visual Hierarchy**: One distinct primary focus. The respondent is never overwhelmed by stacked inputs or cluttered meta-controls.
2. **Kicker / Eyebrow Navigation**: Clear micro-kicker (`Step X of Y`, `Section Name • Difficulty Tier`) placed above the headline to establish cognitive context instantly.
3. **Commanding Ubuntu Typography**: High-impact bold questions in `Ubuntu` (`font-heading font-bold text-2xl sm:text-3xl text-foreground`), paired with comfortable reading line heights for Poppins description body (`font-sans text-sm sm:text-base text-muted-foreground leading-relaxed`).

### 2.2 Presentation-Grade Dual-Column Composition (from `presentations-repos/flat-slide-show` & `slides-spec`)
1. **Left Column — The Narrative & Guidance Zone (50%–55% Desktop Width)**:
   - **Kicker & Question Number**: Pill badge with question index and mandatory red asterisk (`#04 • Mandatory`).
   - **Prominent Question Title**: Large bold Ubuntu typography commanding primary visual weight.
   - **Instructional Body**: Formatted guidance, hint text, or technical scenario context.
   - **Reference Links & External Resources**: Clickable reference cards linking to documentation, repositories, API schemas, or Figma designs (`BookOpen`, `ExternalLink`).
   - **Mandatory Action Checklist ("Must-Do Before Answering")**: Interactive checkboxes representing prerequisites (e.g. `[ ] Clone starter repo`, `[ ] Review specification checklist`). Candidates can mark them off directly; completed items show checkmarks with strikethrough.
   - **Metadata Footer**: Allocated points pill, estimated duration, and difficulty indicator.
2. **Right Column — The Interactive Input & Answer Zone (45%–50% Desktop Width)**:
   - Elevated glassmorphic card container (`bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm`).
   - Full support for all field input types:
     - Single & Multiple Choice with sequenced letter badges `[A]`, `[B]`, `[C]` and emerald hover contrast.
     - Sequenced Searchable Dropdowns with custom "Other" typing.
     - Text Area / Paragraph inputs with character counting.
     - Multi-Mode Rating (Numbers, IMDB Stars, 5-stage feelings emojis).
     - File Upload with interactive drag-and-drop validation.
     - List of items with suggestions pool.
   - Primary advance action button with subtle keyboard shortcut hints (`Press Enter ↵`).

---

## 3. Data Contracts & Layout Modes

### 3.1 Layout Mode Types (`src/lib/types/form.ts`)
```ts
export type QuestionLayoutMode = 'standard' | 'presentation_split';

export interface FormSettings {
  // Global form-level default layout
  defaultQuestionLayout?: QuestionLayoutMode;
  // ... other form settings
}

export interface FormField {
  // Per-question layout override ('standard' | 'presentation_split' | undefined)
  layoutMode?: QuestionLayoutMode;
  // Kicker eyebrow text above question title
  kickerText?: string;
  // Action checklist items ('Must-do before answering')
  actionChecklist?: Array<{ id: string; label: string; isRequired: boolean }>;
  // Reference links attached to question
  referenceLinks?: Array<{ id: string; title: string; url: string }>;
  // ... existing field properties
}
```

### 3.2 Layout Resolution Priority
1. **Question-Level Override**: If `field.layoutMode` is explicitly configured (`'standard'` or `'presentation_split'`), it takes highest priority.
2. **Form-Level Default**: If `field.layoutMode` is unset, falls back to `form.settings.defaultQuestionLayout || 'standard'`.
3. **Runtime Preview Override**: In the runner/preview toolbar, users can toggle layout on-the-fly (`Quiz View` vs `Presentation View`) to evaluate user experience.

---

## 4. UI/UX Interaction Design

### 4.1 Builder Configuration
1. **Form-Level Setting**: In FormBuilder inspector / settings drawer, an explicit layout picker allows administrators to set the default layout (`Standard Card` vs `Presentation Split`).
2. **Question Card Header / Controls**: In `sortable-field-card.tsx`, questions have a dedicated layout mode selector allowing authors to toggle individual questions into Presentation Split mode.
3. **Checklist & Reference Editor**: Integrated within the question card, allowing authors to add reference URLs and checklist to-dos.

### 4.2 Form Runner / Preview Mode
1. **Top Toolbar Layout Switcher**:
   - `[Quiz View (Standard)]` $\leftrightarrow$ `[Presentation View (Split)]` segmented pill control.
2. **Adaptive Responsive Behavior**:
   - **Desktop ($\ge 1024px$)**: 2-column side-by-side presentation view.
   - **Tablet & Mobile ($< 1024px$)**: Seamlessly stacks into vertical rhythm while preserving presentation styling (kicker, large question, references, checklist, then interactive answer card).

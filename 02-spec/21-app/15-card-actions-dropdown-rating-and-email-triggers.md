# Card Actions, Enhanced Dropdowns, Multi-Mode Rating & Notification Triggers

> **/goal** Implement ergonomic card action buttons, high-contrast selectable item hover states, advanced searchable dropdowns with display vs value mapping, multi-mode rating with conditional feedback and Google Maps reviews, and a sanitized multi-channel notification trigger engine.
> **/learn** Adhere strictly to `.ai-memory/folder-structure.md`, positive booleans only, zero explicit true checks, and strict relative git paths.

## 1. Executive Summary

This specification establishes modern architectural enhancements for the WP Exam FormBuilder and FormRunner:
1. **Ergonomic Card Action Toolbar**: Reorders footer buttons to `[Delete (red)]` on LEFT, `[Duplicate (blue)]` in CENTER, and `[Save (green)]` on RIGHT, backed by a deleted questions trash ledger with 1-click Toast Undo.
2. **Selectable Items Contrast & Typography**: Ensures MCQ and choice options have consistent `text-sm sm:text-base` body typography and high-contrast emerald/primary hover rings and backgrounds.
3. **Advanced Searchable Dropdown Engine**: Enhances dropdowns with sequenced letter badges (A, B, C...), display label vs stored internal value mapping, option search filtering, and an editable inline input when "Other" is selected.
4. **Low-Resolution Responsive Consolidation**: On narrow or low-resolution viewports (`< 640px`), wraps card footer controls into a unified compact "Field Settings" properties dropdown to prevent layout breaking.
5. **Multi-Mode Rating System**:
   - Three rendering modes: Numeric Scale, IMDB Star Sequence, and 5-stage Feeling Emoji sequence (😢 Cry -> 🙁 Sad -> 😐 Neutral -> 😊 Happy -> 😍 Love).
   - Conditional actions: Low score (<= 3) triggers improvement feedback commentary; high score (>= 4) triggers Google Maps review CTA button and appreciation tag pills.
6. **PII-Sanitized Email Template & Notification Triggers**: Ingests `.ai-memory/temp/email-template.html` with zero PII into `assets/templates/email-template.html` and introduces a pluggable `NotificationTrigger` engine for Email, WhatsApp, and Telegram.

---

## 2. Card Action Toolbar & Trash Recovery Architecture

### 2.1 Button Reordering
The card footer action group is organized as an inline-flex segmented pill:
- **Left**: `Delete Question` — Red text / hover background (`text-destructive hover:bg-destructive/10`), Trash icon.
- **Center**: `Duplicate Question` — Primary blue / indigo text / hover background (`text-primary hover:bg-primary/10`), Copy icon.
- **Right**: `Save Question` — Emerald green text / active background (`bg-emerald-600 text-white` when dirty, emerald text when pristine), Save icon.

### 2.2 Deleted Question Trash & Undo Protocol
When a question is removed:
1. The question object is pushed to the store's `trashFields` ledger along with its original index and timestamp.
2. Sonner toast is immediately dispatched:
   ```ts
   toast.success(`Question "${field.label || 'Untitled'}" deleted`, {
     action: {
       label: 'Undo',
       onClick: () => restoreField(field.id),
     },
     duration: 5000,
   });
   ```
3. A "Restore Deleted" button appears in the builder tools bar if `trashFields.length > 0`.

---

## 3. Enhanced Dropdown Engine

### 3.1 Display Label vs Stored Value
Each dropdown option supports:
```ts
export interface DropdownOptionItem {
  label: string;
  value: string;
}
```
If a simple string array is provided (`field.options`), `label` and `value` are identical. In advanced mode, editors can customize the internal `value` (e.g. `bsc_cs`) separate from the displayed `label` (e.g. `Bachelor of Science in Computer Science`).

### 3.2 Search Filtering & Sequenced Indicators
- In FormRunner, dropdowns offer an integrated search filter input for fast navigation through large sets.
- Each option displays a sequenced badge `[A]`, `[B]`, `[C]`...
- When "Other" is chosen, an inline input is immediately displayed, allowing candidate custom typing.

---

## 4. Multi-Mode Rating System

### 4.1 Rating Display Modes
- `numbers`: Horizontal array of number pills 1 through N.
- `stars`: IMDB-style 1–5 or 1–10 star sequence with vibrant amber fill and glowing hover states.
- `emojis`: 5-stage sentiment progression:
  1. 😢 / 😡 `Cry / Angry`
  2. 🙁 `Sad`
  3. 😐 `Neutral`
  4. 😊 `Happy`
  5. 😍 `Love / Heart Eyes`

### 4.2 Score-Driven Conditional Triggers
- **Score <= Threshold (default 3)**:
  - Renders an improvement prompt: *"How can we improve our service?"* with a multiline commentary box.
- **Score >= Threshold (default 4)**:
  - Renders a Google Maps / Public Review Link CTA button opening `field.ratingReviewUrl` in a new tab.
  - Renders selectable Appreciation Tag pills (e.g. `⚡ Fast Response`, `🎓 Knowledgeable`, `📚 Great Curriculum`, `🤝 Supportive Mentors`, `✨ Seamless Experience`).

---

## 5. Notification Trigger & Template Engine

### 5.1 Trigger Schema
```ts
export type NotificationChannel = 'email' | 'whatsapp' | 'telegram';
export type NotificationTriggerEvent = 'on_field_answer' | 'on_section_complete' | 'on_form_submit' | 'on_score_threshold';

export interface NotificationTrigger {
  id: string;
  channel: NotificationChannel;
  event: NotificationTriggerEvent;
  to: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  templateId?: string;
  templateHtml?: string;
  colorPalette?: string;
  conditionScoreMin?: number;
  conditionScoreMax?: number;
}
```

### 5.2 Zero-PII Ingestion
The canonical HTML notification template is stored at `assets/templates/email-template.html` containing zero personal details, using placeholder variables like `{{candidate_name}}`, `{{job_position}}`, and `{{asking_salary}}`.

---

## 6. Verification & Quality Gates

1. **Unit Testing**: `src/test/spec15-card-enhancements-and-email-triggers.test.ts` tests:
   - Button ordering in card footer.
   - Dropdown display label vs value mapping and "Other" custom text handling.
   - Rating 3-mode rendering and conditional feedback / review trigger logic.
   - Trash ledger push, restore, and Toast undo behavior.
   - Notification trigger validation and template placeholders.
2. **Build Gate**: `npm run build` must succeed with zero TypeScript or JSX errors.

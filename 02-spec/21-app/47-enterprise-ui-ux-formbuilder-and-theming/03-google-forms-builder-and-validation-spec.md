# Spec [47] Part 3: Google Forms Builder UX & Compound Validation Specification

## 1. Google Forms Layout Architecture

### 1.1 Form Header Card (Google Forms Style)
- Prominent top card positioned above all question items.
- Editable Form Title with inline click-to-edit or input with clear focus states.
- Editable Form Description supporting multiline explanation of the quiz/assessment.
- Status and metadata strip: Form Type pill (`Quiz` / `Survey`), Visibility (`Public` / `Restricted`), Total Points counter, and Question Count badge.
- Automatic persistence to `useQuizStore`.

### 1.2 Fixed / Sticky Right-Hand Field Palette
- Remove the top palette bar that crowded the builder canvas.
- Introduce a 2-column layout:
  - Left / Center (8 cols / 65% width): Scrollable form canvas containing the Form Header Card and Sortable Question Cards.
  - Right (4 cols / 35% width): Fixed / sticky sidebar container housing the `FieldPalette`.
- Interaction Models:
  1. **Click-to-Add:** Clicking any field type in the palette immediately appends it to the canvas.
  2. **Drag-and-Drop:** Dragging a palette item drops it precisely at the desired drop indicator position within the canvas.

### 1.3 Group / Module Clarification
- Users found the raw "Group / Module" text ambiguous.
- Clarification redesign:
  - Label updated to: `Section / Category (Optional Module)` with tooltip explaining: *"Groups related questions into logical sections in multi-step assessments."*
  - On the canvas, consecutive fields sharing the same group display a polished visual Section Divider Header with an accordion collapse toggle and group badge.

---

## 2. Multi-Rule Compound Validation Engine

### 2.1 Data Schema Upgrade (`src/lib/types/form.ts`)
```typescript
export type ValidationRuleType = 
  | 'starts_with' 
  | 'ends_with' 
  | 'contains' 
  | 'not_contains'
  | 'regex' 
  | 'url' 
  | 'email' 
  | 'phone' 
  | 'google_drive' 
  | 'pdf';

export interface SingleValidationRule {
  id: string;
  ruleType: ValidationRuleType;
  value?: string; // Prefix, suffix, substring, or custom regex pattern
  customErrorMessage?: string; // Optional user override
  isCaseSensitive?: boolean;
}

export interface CompoundValidationRule {
  operator: 'AND' | 'OR';
  rules: SingleValidationRule[];
}
```

### 2.2 Built-in Presets & Default Error Messages
When a user selects a preset, the system automatically generates an authoritative default error message. Users may optionally provide a custom error override:

| Rule Type / Preset | Pattern / Logic | Auto-Generated Default Error Message |
|---|---|---|
| `starts_with` | `value.startsWith(target)` | `Value must start with "${target}".` |
| `ends_with` | `value.endsWith(target)` | `Value must end with "${target}".` |
| `contains` | `value.includes(target)` | `Value must contain "${target}".` |
| `email` | `^[^\s@]+@[^\s@]+\.[^\s@]+$` | `Please enter a valid email address (e.g. name@domain.com).` |
| `phone` | `^\+?[0-9\s\-()]{7,20}$` | `Please enter a valid phone number with country prefix.` |
| `url` | `^https?:\/\/[^\s$.?#].[^\s]*$` | `Please enter a valid web URL starting with http:// or https://.` |
| `google_drive` | `^https:\/\/(drive\|docs)\.google\.com\/.*$` | `Must be a valid Google Drive or Google Docs sharing link.` |
| `pdf` | `^https?:\/\/.*\.pdf(\?.*)?$` | `Must be a valid URL pointing to a PDF document (.pdf).` |
| `regex` | Custom user pattern | `Input format is invalid for this required pattern.` |

### 2.3 Compound Evaluation Logic
- Multiple rules can be added per field.
- Author toggles between `AND` (all rules must pass) and `OR` (at least one rule must pass).
- Interactive Live Tester in builder: An input box allowing the author to type sample text and immediately see green/red checkmarks and the rendered error message in real time.

---

## 3. Per-Field Live Test Preview Mode & Notification Triggers

### 3.1 Per-Field Interactive Preview Mode
- Each field card includes a "Live Preview / Test" button.
- Expanding this mode renders the live respondent widget directly inside the card:
  - For WhatsApp fields: Test country code selection, phone number entry, and live generation of `https://wa.me/...` deep link.
  - For Regex / Text fields: Type test inputs and see live debounced validation checks.
  - For Multiple Choice: Click options and observe state updates.

### 3.2 Field Action Triggers
Authors can configure field actions:
1. **Email Alert Trigger:** Dispatches an automated email notification when a specific option or answer is submitted.
2. **WhatsApp Notification Trigger:** Triggers a WhatsApp alert webhook with candidate response metadata.
3. **Conditional Field Trigger:** Dynamically shows or unlocks downstream fields upon selection.

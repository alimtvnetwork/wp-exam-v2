# Specification: Google Forms Data Contracts & Mapping Engine

Spec Reference: [01-overview.md](01-overview.md)

## 1. Google Forms API v1 Interfaces

```typescript
export interface GoogleFormInfo {
  title: string;
  description?: string;
  documentTitle?: string;
}

export type GoogleFormItemType =
  | 'QUESTION_ITEM'
  | 'QUESTION_GROUP_ITEM'
  | 'PAGE_BREAK_ITEM'
  | 'TEXT_ITEM'
  | 'IMAGE_ITEM'
  | 'VIDEO_ITEM';

export type GoogleQuestionType =
  | 'RADIO'
  | 'CHECKBOX'
  | 'DROP_DOWN'
  | 'TEXT'
  | 'PARAGRAPH_TEXT'
  | 'SCALE'
  | 'DATE'
  | 'TIME'
  | 'FILE_UPLOAD';

export interface GoogleChoiceOption {
  value: string;
  isOther?: boolean;
  goToAction?: 'NEXT_SECTION' | 'RESTART_FORM' | 'SUBMIT_FORM';
}

export interface GoogleQuestionChoiceQuestion {
  type: 'RADIO' | 'CHECKBOX' | 'DROP_DOWN';
  options: GoogleChoiceOption[];
  shuffle?: boolean;
}

export interface GoogleQuestionTextQuestion {
  paragraph?: boolean;
}

export interface GoogleQuestionScaleQuestion {
  low: number;
  high: number;
  lowLabel?: string;
  highLabel?: string;
}

export interface GoogleQuestionItem {
  question: {
    questionId: string;
    required?: boolean;
    choiceQuestion?: GoogleQuestionChoiceQuestion;
    textQuestion?: GoogleQuestionTextQuestion;
    scaleQuestion?: GoogleQuestionScaleQuestion;
    grading?: {
      pointValue?: number;
      correctAnswers?: {
        answers: Array<{ value: string }>;
      };
    };
  };
}

export interface GoogleFormItem {
  itemId: string;
  title?: string;
  description?: string;
  questionItem?: GoogleQuestionItem;
  pageBreakItem?: Record<string, unknown>;
  textItem?: Record<string, unknown>;
}

export interface GoogleFormSchema {
  formId: string;
  info: GoogleFormInfo;
  items: GoogleFormItem[];
  revisionId?: string;
  responderUri?: string;
}
```

---

## 2. WP Exam Type Mapping Contract

| Google Forms Type | WP Exam `FieldType` | Mapping Logic & Extraction |
|---|---|---|
| `RADIO` | `single_choice` | Extracts options values into string array; sets `isRequired: Boolean(required)`. |
| `CHECKBOX` | `multiple_choice` | Extracts options values into string array; points from `grading.pointValue`. |
| `DROP_DOWN` | `dropdown` | Extracts options values into string array. |
| `TEXT` (paragraph: false) | `short_answer` | Creates text input field with placeholder. |
| `PARAGRAPH_TEXT` (paragraph: true) | `paragraph` | Creates multi-line textarea field. |
| `SCALE` | `rating` | Sets rating scale (1-5 or 1-10) with labels. |
| `FILE_UPLOAD` | `file_upload` | Configures file upload field. |
| `PAGE_BREAK_ITEM` | `group` delimiter | Uses section title as group attribute on following questions. |

---

## 3. Google Forms Import Request Payloads

```typescript
export interface GoogleFormsApiImportPayload {
  mode: 'oauth' | 'public_url' | 'json';
  accessToken?: string;
  formId?: string;
  publicUrl?: string;
  rawJson?: string;
}

export interface GoogleFormsImportResult {
  isSuccess: boolean;
  formTitle: string;
  formDescription: string;
  fields: FormField[];
  message: string;
  importedCount: number;
}
```

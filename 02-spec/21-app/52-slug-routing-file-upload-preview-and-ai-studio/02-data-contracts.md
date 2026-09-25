# Spec 52: Data Contracts & Schemas

## 1. Slug Management Data Contract

```typescript
export interface SlugMetadata {
  slug: string;
  canonicalPath: string; // e.g. "/f/engineering-assessment"
  previewPath: string;   // e.g. "/preview/engineering-assessment"
  adminPath: string;     // e.g. "/admin/form/engineering-assessment"
  isCustomized: boolean;
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'untitled-form';
}
```

## 2. Question AI Instruction & Exchange Contract

```typescript
export interface QuestionAiPromptSpec {
  questionId: string;
  field: FormField;
  promptInstructions: string;
  inputJsonExample: string;
  expectedOutputSchema: string;
}

export interface QuestionAiImportPayload {
  label: string;
  type: FieldType;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  isRequired?: boolean;
  placeholder?: string;
  section?: string;
}
```

## 3. File Upload Preview Contract

```typescript
export interface FileUploadPreviewState {
  file: File | null;
  fileName: string | null;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  uploadProgress: number; // 0 to 100
  isUploaded: boolean;
  errorMessage: string | null;
}
```

## 4. Theme Token Injection Contract

```typescript
export interface ThemeVisualTokens {
  id: 'letterly' | 'riseup' | 'default';
  name: string;
  primaryHsl: string;
  accentHsl: string;
  bgHsl: string;
  cardHsl: string;
  borderHsl: string;
  glowEffect: string;
  fontFamily: string;
  borderRadius: string;
}
```

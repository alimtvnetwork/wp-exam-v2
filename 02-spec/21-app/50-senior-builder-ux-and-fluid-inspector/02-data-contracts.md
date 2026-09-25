# Spec 50: Data Contracts & Component Signatures

Spec Reference: [01-overview.md](./01-overview.md)

## 1. Component Props & Signatures

### 1.1. FieldPalette (`src/components/forms/field-palette.tsx`)

```typescript
export interface PaletteOption {
  type: FieldType;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'choice' | 'text' | 'media';
  colorClass: string;
}

export interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
  activeCount: number;
  layoutMode?: 'horizontal' | 'vertical';
  isEmbedded?: boolean;
}
```

### 1.2. Top Command Bar State & Action Handlers (`src/components/forms/FormBuilder.tsx`)

```typescript
export interface FormBuilderCommandBarProps {
  title: string;
  isSaving: boolean;
  saveStatus: string | null;
  designReport: DesignHealthReport;
  onSave: () => void;
  onOpenPreview: () => void;
  onOpenLiveUrl: () => void;
  onCopyLiveUrl: () => void;
  onOpenDesignPanel: () => void;
  onOpenGoogleImport: () => void;
  onOpenBranchingFlow: () => void;
  onOpenJsonModal: () => void;
}
```

---

## 2. Palette Component Categorization Taxonomy

| Category | Field Types Included | Visual Accent |
|---|---|---|
| `choice` | `multiple_choice`, `single_choice`, `true_false`, `dropdown`, `rating` | Indigo / Sky / Emerald |
| `text` | `short_answer`, `paragraph`, `email`, `phone`, `whatsapp` | Blue / Violet / Teal |
| `media` | `regex_text`, `link`, `file_upload` | Amber / Purple / Rose |

---

## 3. UI State Invariants

- **Filter Persistence:** Searching or toggling category pills in `FieldPalette` must be instantaneous (< 16ms) without re-rendering the parent form canvas.
- **Scroll Sync:** Selecting any question item in the `Outline` tab must invoke smooth scrolling and center-align the target card on the canvas with zero layout shift.

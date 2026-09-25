# Spec 51: Data Contracts & State Management

## 1. Design Validation Types & Invariants

```typescript
export type DesignIssueSeverity = 'error' | 'warning' | 'info';

export type DesignIssueCategory = 'structure' | 'choices' | 'scoring' | 'logic' | 'a11y';

export interface DesignValidationIssue {
  id: string;
  fieldId?: string;
  category: DesignIssueCategory;
  severity: DesignIssueSeverity;
  title: string;
  description: string;
  recommendation: string;
  autoFixAvailable: boolean;
  autoFixAction?: string;
}

export interface DesignHealthReport {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  errorCount: number;
  warningCount: number;
  infoCount: number;
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  issues: DesignValidationIssue[];
  categoryScores: Record<DesignIssueCategory, number>;
}
```

## 2. Inspector Dock State Contract

```typescript
export type InspectorTabType = 'palette' | 'outline' | 'audit' | 'settings';

export interface InspectorDockState {
  activeTab: InspectorTabType;
  selectedCategoryFilter: string; // 'all' | 'errors' | 'warnings' | 'a11y'
  isAutoScrollEnabled: boolean;
  highlightedFieldId: string | null;
}
```

## 3. Auto-Fix Action Catalog
- `add_default_question`: Injects standard Multiple Choice question if form is empty.
- `auto_group_sections`: Distributes questions across two thematic sections to reduce cognitive load.
- `fix_untitled_prompt`: Assigns formatted label `Question #N Prompt`.
- `add_default_choices`: Populates empty choices with Option A, B, C.
- `clean_empty_choices`: Strips whitespace-only choice items.
- `set_default_points`: Assigns default 10 points in quiz mode.
- `set_first_option_correct`: Designates Option A as correct answer for automated grading.
- `remove_broken_branch`: Prunes dangling condition jumps targeting deleted fields.
- `reset_regex_pattern`: Restores standard alphanumeric regex validator.
- `set_default_placeholder`: Injects contextual guidance placeholder per field type.

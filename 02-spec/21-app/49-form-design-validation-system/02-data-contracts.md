# Specification: Data Contracts & Types for Design Validation System

Spec Reference: [01-overview.md](01-overview.md)

## 1. Diagnostic Types & Severity Levels

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
  issues: DesignValidationIssue[];
  categoryScores: Record<DesignIssueCategory, number>;
}
```

## 2. Validation Rule Invariants

1. **Prompt Completeness:** Question `label` must be non-empty and at least 3 characters.
2. **Choice Completeness:** For `multiple_choice`, `single_choice`, and `dropdown`, `options` array must have at least 2 non-empty items.
3. **Quiz Scoring Key:** When `formType === 'quiz'`, choice questions must have a defined `correctAnswer` matching one of the options.
4. **Branching DAG Integrity:** Every condition `targetFieldId` must point to a valid existing field ID present in the active form.
5. **Regex Safety:** Any custom `validationRule` of type `regex` must compile without throwing `SyntaxError`.
6. **Accessibility Placeholder:** Text inputs (`short_answer`, `paragraph`, `email`, `phone`) should have placeholder text.

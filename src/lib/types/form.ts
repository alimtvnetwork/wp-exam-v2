export type FormType = 'quiz' | 'employee_signup' | 'survey' | 'general_form';
export type FormAccessType = 'public' | 'authenticated' | 'admin_only';

export type FieldType =
  | 'multiple_choice'
  | 'single_choice'
  | 'true_false'
  | 'short_answer'
  | 'paragraph'
  | 'email'
  | 'phone'
  | 'dropdown'
  | 'rating'
  | 'file_upload'
  | 'link'
  | 'regex_text';

export type StringMatchRuleType = 'starts_with' | 'ends_with' | 'contains' | 'regex' | 'exact';

export interface FieldValidationRule {
  ruleType: StringMatchRuleType;
  pattern: string;
  errorMessage?: string;
}

export interface FieldConditionRule {
  parentFieldId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'is_empty'
    | 'is_not_empty'
    | 'greater_than'
    | 'less_than'
    | 'greater_than_or_equal'
    | 'less_than_or_equal';
  expectedValue: string | number;
  action: 'show' | 'hide' | 'require' | 'jump_to';
  jumpToFieldId?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  group?: string;
  url?: string;
  linkText?: string;
  validationRule?: FieldValidationRule;
  conditions?: FieldConditionRule[];
  conditionMatch?: 'all' | 'any';
  optionBranching?: Record<string, string>;
  branchTarget?: string;
}

export interface FormSettings {
  timeLimitSeconds?: number;
  passingScore?: number;
  notificationEmail?: string;
  successMessage?: string;
}

export interface FormModel {
  id?: number | string;
  title: string;
  description: string;
  formType: FormType;
  formAccess: FormAccessType;
  isSequential: boolean;
  isPublished: boolean;
  settings: FormSettings;
  fields: FormField[];
}

export interface FormSubmissionPayload {
  guestName?: string;
  guestEmail?: string;
  answers: Record<string, unknown>;
}

export interface FormSubmissionResult {
  submission_id?: number;
  form_id: number;
  form_type: FormType;
  score?: number | null;
  total_possible_score?: number | null;
  score_percentage?: number | null;
  is_passed?: boolean | null;
  message: string;
}

export interface UniversalEnvelope<T> {
  Status: {
    IsSuccess: boolean;
    IsFailed: boolean;
    Code: number;
    Message: string;
    Timestamp: string;
  };
  Attributes: {
    RequestedAt: string;
    RequestDelegatedAt: string;
    HasAnyErrors: boolean;
    IsSingle: boolean;
    IsMultiple: boolean;
    TotalRecords: number;
    PerPage: number;
    TotalPages: number;
    CurrentPage: number;
  };
  Results: T;
  Errors?: Array<{ field?: string; message: string }>;
}

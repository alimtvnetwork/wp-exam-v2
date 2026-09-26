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
  | 'whatsapp'
  | 'dropdown'
  | 'rating'
  | 'file_upload'
  | 'link'
  | 'regex_text'
  | 'video';

export type StringMatchRuleType =
  | 'starts_with'
  | 'ends_with'
  | 'contains'
  | 'not_contains'
  | 'regex'
  | 'url'
  | 'email'
  | 'phone'
  | 'google_drive'
  | 'pdf'
  | 'exact';

export interface SingleValidationItem {
  id: string;
  ruleType: StringMatchRuleType;
  pattern?: string;
  value?: string; // Friendly alias for pattern in test suites and UI inputs
  errorMessage?: string;
  isCaseSensitive?: boolean;
}

export interface CompoundValidationRule {
  operator?: 'AND' | 'OR';
  rules?: SingleValidationItem[];
  // Backwards compatibility for legacy single-rule objects
  ruleType?: StringMatchRuleType;
  pattern?: string;
  errorMessage?: string;
}

export type FieldValidationRule = CompoundValidationRule;

export interface FieldActionTrigger {
  id: string;
  type: 'email_alert' | 'whatsapp_webhook' | 'conditional_trigger';
  target: string; // Recipient email address, webhook URL, or trigger identifier
  condition?: string; // Optional trigger condition
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

export interface FileValidationRule {
  maxSizeMb?: number; // e.g. 5, 10, 25, 50, 100
  allowedExtensions?: string[]; // e.g. ['pdf', 'docx', 'zip', 'png', 'jpg']
  customErrorMessage?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  points?: number;
  group?: string; // Section identifier
  moduleName?: string;
  url?: string;
  linkText?: string;
  videoUrl?: string;
  videoCaption?: string;
  validationRule?: FieldValidationRule;
  fileValidation?: FileValidationRule;
  triggers?: FieldActionTrigger[];
  conditions?: FieldConditionRule[];
  conditionMatch?: 'all' | 'any';
  optionBranching?: Record<string, string>;
  branchTarget?: string;
  allowOtherOption?: boolean;
  suggestedOtherOptions?: string[];
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
    Code: number;
    Message: string;
    Timestamp: string;
  };
  Data: T;
  Meta?: Record<string, unknown>;
}

export const VALIDATION_PRESETS: Record<
  string,
  { label: string; ruleType: StringMatchRuleType; defaultPattern: string; defaultMessage: string }
> = {
  email: {
    label: 'Valid Email Address',
    ruleType: 'email',
    defaultPattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    defaultMessage: 'Please enter a valid email address (e.g. name@example.com).',
  },
  phone: {
    label: 'Phone Number (International)',
    ruleType: 'phone',
    defaultPattern: '^\\+?[0-9\\s\\-()]{7,20}$',
    defaultMessage: 'Please enter a valid phone number with country prefix.',
  },
  url: {
    label: 'Website Link (HTTP/HTTPS)',
    ruleType: 'url',
    defaultPattern: '^https?:\\/\\/[^\\s$.?#].[^\\s]*$',
    defaultMessage: 'Must be a valid web link starting with http:// or https://.',
  },
  google_drive: {
    label: 'Google Drive / Docs Link',
    ruleType: 'google_drive',
    defaultPattern: '^https?:\\/\\/(drive|docs)\\.google\\.com\\/.*$',
    defaultMessage: 'Must be a valid Google Drive or Docs sharing URL.',
  },
  pdf: {
    label: 'PDF Document Link',
    ruleType: 'pdf',
    defaultPattern: '^https?:\\/\\/.*\\.pdf(\\?.*)?$',
    defaultMessage: 'Must be a valid URL pointing directly to a PDF file (.pdf).',
  },
  starts_with: {
    label: 'Starts With Prefix',
    ruleType: 'starts_with',
    defaultPattern: '',
    defaultMessage: 'Value must begin with the specified prefix.',
  },
  ends_with: {
    label: 'Ends With Suffix',
    ruleType: 'ends_with',
    defaultPattern: '',
    defaultMessage: 'Value must end with the specified suffix.',
  },
  contains: {
    label: 'Contains Substring',
    ruleType: 'contains',
    defaultPattern: '',
    defaultMessage: 'Value must contain the specified text.',
  },
  not_contains: {
    label: 'Does Not Contain Substring',
    ruleType: 'not_contains',
    defaultPattern: '',
    defaultMessage: 'Value must not contain the specified text.',
  },
  regex: {
    label: 'Custom Regular Expression',
    ruleType: 'regex',
    defaultPattern: '',
    defaultMessage: 'Input does not match the required regular expression pattern.',
  },
};

/**
 * Validates a single rule item against a candidate input.
 */
export function evaluateSingleRule(
  rule: SingleValidationItem,
  rawInput: string
): { isValid: boolean; message: string } {
  const value = String(rawInput ?? '');
  const pattern = (rule.pattern ?? rule.value ?? '').trim();
  const preset = VALIDATION_PRESETS[rule.ruleType];
  const defaultMsg = preset?.defaultMessage || 'Validation rule failed';
  const customMsg = rule.errorMessage?.trim();
  const errorMessage = customMsg || defaultMsg;

  if (!pattern && rule.ruleType !== 'email' && rule.ruleType !== 'phone' && rule.ruleType !== 'url' && rule.ruleType !== 'google_drive' && rule.ruleType !== 'pdf') {
    return { isValid: true, message: 'Valid' };
  }

  try {
    switch (rule.ruleType) {
      case 'starts_with': {
        const hasPrefix = rule.isCaseSensitive ? value.startsWith(pattern) : value.toLowerCase().startsWith(pattern.toLowerCase());
        const hasMsg = Boolean(customMsg);
        return hasPrefix
          ? { isValid: true, message: `Starts with "${pattern}"` }
          : { isValid: false, message: hasMsg ? errorMessage : `Value must begin with "${pattern}"` };
      }
      case 'ends_with': {
        const hasSuffix = rule.isCaseSensitive ? value.endsWith(pattern) : value.toLowerCase().endsWith(pattern.toLowerCase());
        const hasMsg = Boolean(customMsg);
        return hasSuffix
          ? { isValid: true, message: `Ends with "${pattern}"` }
          : { isValid: false, message: hasMsg ? errorMessage : `Value must end with "${pattern}"` };
      }
      case 'contains': {
        const hasSub = rule.isCaseSensitive ? value.includes(pattern) : value.toLowerCase().includes(pattern.toLowerCase());
        const hasMsg = Boolean(customMsg);
        return hasSub
          ? { isValid: true, message: `Contains "${pattern}"` }
          : { isValid: false, message: hasMsg ? errorMessage : `Value must contain "${pattern}"` };
      }
      case 'not_contains': {
        const hasSub = rule.isCaseSensitive ? value.includes(pattern) : value.toLowerCase().includes(pattern.toLowerCase());
        const hasMsg = Boolean(customMsg);
        return !hasSub
          ? { isValid: true, message: 'Valid (does not contain)' }
          : { isValid: false, message: hasMsg ? errorMessage : `Value cannot contain "${pattern}"` };
      }
      case 'exact': {
        const isMatch = rule.isCaseSensitive ? value === pattern : value.toLowerCase() === pattern.toLowerCase();
        return isMatch
          ? { isValid: true, message: 'Exact match verified' }
          : { isValid: false, message: errorMessage };
      }
      case 'email': {
        const reg = new RegExp(pattern || VALIDATION_PRESETS.email.defaultPattern);
        return reg.test(value)
          ? { isValid: true, message: 'Valid email address' }
          : { isValid: false, message: errorMessage };
      }
      case 'phone': {
        const reg = new RegExp(pattern || VALIDATION_PRESETS.phone.defaultPattern);
        return reg.test(value)
          ? { isValid: true, message: 'Valid phone number' }
          : { isValid: false, message: errorMessage };
      }
      case 'url': {
        const reg = new RegExp(pattern || VALIDATION_PRESETS.url.defaultPattern);
        return reg.test(value)
          ? { isValid: true, message: 'Valid URL' }
          : { isValid: false, message: errorMessage };
      }
      case 'google_drive': {
        const reg = new RegExp(pattern || VALIDATION_PRESETS.google_drive.defaultPattern);
        return reg.test(value)
          ? { isValid: true, message: 'Valid Google Drive URL' }
          : { isValid: false, message: errorMessage };
      }
      case 'pdf': {
        const reg = new RegExp(pattern || VALIDATION_PRESETS.pdf.defaultPattern);
        return reg.test(value)
          ? { isValid: true, message: 'Valid PDF Document link' }
          : { isValid: false, message: errorMessage };
      }
      case 'regex':
      default: {
        if (!pattern) return { isValid: true, message: 'Valid' };
        const reg = new RegExp(pattern);
        return reg.test(value)
          ? { isValid: true, message: 'Regular expression matched' }
          : { isValid: false, message: errorMessage };
      }
    }
  } catch (err) {
    return { isValid: false, message: `Syntax error: ${String(err)}` };
  }
}

/**
 * Evaluates compound validation rules (supporting AND / OR logic gates).
 */
export function evaluateCompoundValidation(
  validationRule: FieldValidationRule | undefined,
  rawInput: string
): { isValid: boolean; message: string } {
  if (!validationRule) {
    return { isValid: true, message: 'No validation rules' };
  }

  // Handle multi-rule array
  const hasRules = Boolean(validationRule.rules && validationRule.rules.length > 0);
  if (hasRules) {
    const rules = validationRule.rules || [];
    const operator = validationRule.operator || 'AND';

    if (operator === 'OR') {
      const results = rules.map((r) => evaluateSingleRule(r, rawInput));
      const hasAnyPass = results.some((res) => res.isValid);
      if (hasAnyPass) {
        return { isValid: true, message: 'Compound validation satisfied (OR)' };
      }
      const firstFail = results.find((res) => !res.isValid);
      return firstFail || { isValid: false, message: 'At least one condition must be satisfied' };
    }

    // Default: AND logic
    for (const rule of rules) {
      const result = evaluateSingleRule(rule, rawInput);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true, message: 'All validation rules satisfied' };
  }

  // Handle legacy single-rule format
  const hasLegacyRule = Boolean(validationRule.ruleType || validationRule.pattern);
  if (hasLegacyRule) {
    const single: SingleValidationItem = {
      id: 'legacy-1',
      ruleType: validationRule.ruleType || 'regex',
      pattern: validationRule.pattern || '',
      errorMessage: validationRule.errorMessage,
    };
    return evaluateSingleRule(single, rawInput);
  }

  return { isValid: true, message: 'Valid' };
}

/**
 * Validates a file candidate input against configured file size limits and extensions.
 */
export function evaluateFileUploadValidation(
  rule?: FileValidationRule,
  file?: { name: string; size: number; type?: string } | null
): { isValid: boolean; message: string } {
  if (!file) {
    return { isValid: false, message: 'No file uploaded yet.' };
  }

  const maxSizeMb = rule?.maxSizeMb || 10;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);

  if (file.size > maxSizeBytes) {
    const errorMsg =
      rule?.customErrorMessage ||
      `File too large (${fileSizeMb} MB). Maximum permitted file size is ${maxSizeMb} MB.`;

    return { isValid: false, message: errorMsg };
  }

  const rawExts = rule?.allowedExtensions;
  const allowedExts =
    rawExts && rawExts.length > 0
      ? rawExts.map((e) => e.toLowerCase().replace(/^\./, ''))
      : ['pdf', 'docx', 'zip', 'png', 'jpg'];

  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

  if (!allowedExts.includes(fileExt)) {
    const errorMsg =
      rule?.customErrorMessage ||
      `Invalid format (.${fileExt}). Permitted extensions: ${allowedExts.map((e) => '.' + e).join(', ')}.`;

    return { isValid: false, message: errorMsg };
  }

  return {
    isValid: true,
    message: `Valid file upload: ${file.name} (${fileSizeMb} MB). Verified and accepted.`,
  };
}

export interface VideoEmbedDetails {
  platform: 'youtube' | 'vimeo' | 'loom' | 'direct' | 'custom';
  embedUrl: string;
  isDirectVideo: boolean;
}

/**
 * Parses video URLs from YouTube, Vimeo, Loom, or direct MP4/WebM files into responsive embed URLs.
 */
export function parseVideoEmbedUrl(rawUrl?: string): VideoEmbedDetails | null {
  const hasUrl = Boolean(rawUrl && rawUrl.trim().length > 0);

  if (!hasUrl) {
    return null;
  }

  const cleanUrl = (rawUrl || '').trim();

  // YouTube format check: watch?v=ID, youtu.be/ID, embed/ID, shorts/ID
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  const hasYtMatch = Boolean(ytMatch && ytMatch[1]);

  if (hasYtMatch) {
    const videoId = ytMatch ? ytMatch[1] : '';

    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      isDirectVideo: false,
    };
  }

  // Vimeo format check: vimeo.com/ID
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  const hasVimeoMatch = Boolean(vimeoMatch && vimeoMatch[1]);

  if (hasVimeoMatch) {
    const videoId = vimeoMatch ? vimeoMatch[1] : '';

    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      isDirectVideo: false,
    };
  }

  // Loom format check: loom.com/share/ID or loom.com/embed/ID
  const loomMatch = cleanUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  const hasLoomMatch = Boolean(loomMatch && loomMatch[1]);

  if (hasLoomMatch) {
    const videoId = loomMatch ? loomMatch[1] : '';

    return {
      platform: 'loom',
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      isDirectVideo: false,
    };
  }

  // Direct video file extensions
  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl);

  if (isDirect) {
    return {
      platform: 'direct',
      embedUrl: cleanUrl,
      isDirectVideo: true,
    };
  }

  return {
    platform: 'custom',
    embedUrl: cleanUrl,
    isDirectVideo: false,
  };
}


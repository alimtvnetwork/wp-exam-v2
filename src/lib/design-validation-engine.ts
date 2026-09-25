import { FormField, FormType, FormSettings } from '@/lib/types/form';

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

/**
 * Real-time diagnostic engine that audits form structure, choice completeness,
 * quiz scoring invariants, DAG branching logic, regex safety, and accessibility.
 */
export function auditFormDesign(
  fields: FormField[],
  formType: FormType = 'form',
  settings?: FormSettings
): DesignHealthReport {
  const issues: DesignValidationIssue[] = [];
  const fieldIdSet = new Set(fields.map((f) => f.id));

  // Category tracking
  let structurePenalty = 0;
  let choicesPenalty = 0;
  let scoringPenalty = 0;
  let logicPenalty = 0;
  let a11yPenalty = 0;

  // Rule 1: Form Structure
  if (fields.length === 0) {
    issues.push({
      id: 'issue-empty-form',
      category: 'structure',
      severity: 'error',
      title: 'Form contains no questions',
      description: 'Your form is completely empty. Candidates cannot submit a blank assessment.',
      recommendation: 'Add questions from the Component Palette or import a Google Form.',
      autoFixAvailable: true,
      autoFixAction: 'add_default_question',
    });
    structurePenalty += 50;
  }

  // Section fatigue check
  const hasSections = fields.some((f) => Boolean(f.group));
  if (fields.length > 10 && !hasSections) {
    issues.push({
      id: 'issue-cognitive-overload',
      category: 'structure',
      severity: 'info',
      title: 'High cognitive load detected',
      description: `The form has ${fields.length} consecutive questions without section dividers.`,
      recommendation: 'Break long forms into modular sections (e.g. Part 1: Personal, Part 2: Technical).',
      autoFixAvailable: true,
      autoFixAction: 'auto_group_sections',
    });
    structurePenalty += 10;
  }

  // Iterate over individual questions
  fields.forEach((field, index) => {
    const qNum = index + 1;
    const labelTrimmed = (field.label || '').trim();

    // 1. Missing or generic prompt
    if (!labelTrimmed || labelTrimmed.toLowerCase() === 'untitled question') {
      issues.push({
        id: `issue-prompt-${field.id}`,
        fieldId: field.id,
        category: 'structure',
        severity: 'warning',
        title: `Question #${qNum} has an untitled or empty prompt`,
        description: 'Question prompts must provide clear instructions to candidates.',
        recommendation: 'Enter a descriptive question prompt.',
        autoFixAvailable: true,
        autoFixAction: 'fix_untitled_prompt',
      });
      structurePenalty += 8;
    }

    // 2. Choice Completeness
    if (
      field.type === 'multiple_choice' ||
      field.type === 'single_choice' ||
      field.type === 'dropdown'
    ) {
      const opts = field.options || [];
      const nonEmptyOpts = opts.filter((o) => o && o.trim().length > 0);

      if (nonEmptyOpts.length < 2) {
        issues.push({
          id: `issue-choices-${field.id}`,
          fieldId: field.id,
          category: 'choices',
          severity: 'error',
          title: `Question #${qNum} needs at least 2 choices`,
          description: `This ${field.type.replace('_', ' ')} question only has ${nonEmptyOpts.length} valid option(s).`,
          recommendation: 'Add at least 2 distinct choice options.',
          autoFixAvailable: true,
          autoFixAction: 'add_default_choices',
        });
        choicesPenalty += 15;
      } else if (opts.length !== nonEmptyOpts.length) {
        issues.push({
          id: `issue-empty-choice-${field.id}`,
          fieldId: field.id,
          category: 'choices',
          severity: 'warning',
          title: `Question #${qNum} has blank choice options`,
          description: 'Empty option rows confuse candidates and break grading parity.',
          recommendation: 'Remove empty option rows or supply text.',
          autoFixAvailable: true,
          autoFixAction: 'clean_empty_choices',
        });
        choicesPenalty += 6;
      }
    }

    // 3. Quiz Scoring Invariants
    const isInformationalField = field.type === 'link' || field.type === 'video';

    if (formType === 'quiz' && !isInformationalField) {
      if (!field.points || field.points <= 0) {
        issues.push({
          id: `issue-points-${field.id}`,
          fieldId: field.id,
          category: 'scoring',
          severity: 'warning',
          title: `Question #${qNum} awards 0 points`,
          description: 'In a graded quiz, each question should award positive scoring points.',
          recommendation: 'Assign at least 5 or 10 points to this question.',
          autoFixAvailable: true,
          autoFixAction: 'set_default_points',
        });
        scoringPenalty += 5;
      }

      if (
        (field.type === 'single_choice' || field.type === 'multiple_choice' || field.type === 'dropdown') &&
        (!field.correctAnswer || (Array.isArray(field.correctAnswer) && field.correctAnswer.length === 0))
      ) {
        issues.push({
          id: `issue-answer-key-${field.id}`,
          fieldId: field.id,
          category: 'scoring',
          severity: 'error',
          title: `Question #${qNum} missing correct answer key`,
          description: 'Automated grading requires designated correct answer(s).',
          recommendation: 'Select the correct answer option for grading.',
          autoFixAvailable: true,
          autoFixAction: 'set_first_option_correct',
        });
        scoringPenalty += 12;
      }
    }

    // 4. DAG Branching Logic Integrity
    const brokenTargets: string[] = [];

    if (field.conditions && field.conditions.length > 0) {
      field.conditions.forEach((cond) => {
        const target = cond.jumpToFieldId || (cond as unknown as { targetFieldId?: string }).targetFieldId;
        if (target && !fieldIdSet.has(target)) {
          brokenTargets.push(target);
        }
      });
    }

    if ((field as unknown as { branchingRules?: Array<{ targetFieldId?: string; jumpToFieldId?: string }> }).branchingRules) {
      const rules = (field as unknown as { branchingRules: Array<{ targetFieldId?: string; jumpToFieldId?: string }> }).branchingRules;
      rules.forEach((rule) => {
        const target = rule.targetFieldId || rule.jumpToFieldId;
        if (target && !fieldIdSet.has(target)) {
          brokenTargets.push(target);
        }
      });
    }

    if (field.branchTarget && !fieldIdSet.has(field.branchTarget)) {
      brokenTargets.push(field.branchTarget);
    }

    if (field.optionBranching) {
      Object.values(field.optionBranching).forEach((target) => {
        if (target && !fieldIdSet.has(target)) {
          brokenTargets.push(target);
        }
      });
    }

    if (brokenTargets.length > 0) {
      issues.push({
        id: `issue-broken-branch-${field.id}`,
        fieldId: field.id,
        category: 'logic',
        severity: 'error',
        title: `Question #${qNum} has broken branching target`,
        description: `Branching rule references non-existent target field ID(s): ${brokenTargets.join(', ')}.`,
        recommendation: 'Update the condition to target an existing field or remove the rule.',
        autoFixAvailable: true,
        autoFixAction: 'remove_broken_branch',
      });
      logicPenalty += 15;
    }

    // 5. Regex Safety
    if (field.validationRule?.ruleType === 'regex' && field.validationRule.pattern) {
      try {
        new RegExp(field.validationRule.pattern);
      } catch (err) {
        issues.push({
          id: `issue-invalid-regex-${field.id}`,
          fieldId: field.id,
          category: 'logic',
          severity: 'error',
          title: `Question #${qNum} has invalid Regex syntax`,
          description: `Pattern "${field.validationRule.pattern}" failed to compile: ${String(err)}`,
          recommendation: 'Correct the regex pattern to prevent validation crashes.',
          autoFixAvailable: true,
          autoFixAction: 'reset_regex_pattern',
        });
        logicPenalty += 15;
      }
    }

    // 6. Accessibility & UX Guidance
    if (
      (field.type === 'short_answer' ||
        field.type === 'paragraph' ||
        field.type === 'email' ||
        field.type === 'phone') &&
      (!field.placeholder || !field.placeholder.trim())
    ) {
      issues.push({
        id: `issue-a11y-placeholder-${field.id}`,
        fieldId: field.id,
        category: 'a11y',
        severity: 'info',
        title: `Question #${qNum} lacks placeholder guidance`,
        description: 'Adding helpful placeholder text improves usability and form completion rates.',
        recommendation: 'Provide placeholder guidance (e.g. "Enter your name..." or "+880 1700 000000").',
        autoFixAvailable: true,
        autoFixAction: 'set_default_placeholder',
      });
      a11yPenalty += 3;
    }
  });

  // Calculate scores
  const totalPenalty = structurePenalty + choicesPenalty + scoringPenalty + logicPenalty + a11yPenalty;
  const rawScore = Math.max(0, 100 - totalPenalty);
  const score = Math.round(rawScore);

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (score >= 95) {
    grade = 'A+';
  } else if (score >= 85) {
    grade = 'A';
  } else if (score >= 70) {
    grade = 'B';
  } else if (score >= 55) {
    grade = 'C';
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return {
    score,
    grade,
    errorCount,
    warningCount,
    infoCount,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      info: infoCount,
    },
    issues,
    categoryScores: {
      structure: Math.max(0, 100 - structurePenalty * 2),
      choices: Math.max(0, 100 - choicesPenalty * 2),
      scoring: Math.max(0, 100 - scoringPenalty * 2),
      logic: Math.max(0, 100 - logicPenalty * 2),
      a11y: Math.max(0, 100 - a11yPenalty * 2),
    },
  };
}

/**
 * Pure auto-fix applier that repairs a specific diagnostic issue across fields.
 */
export function applyAutoFixToFields(
  fields: FormField[],
  issue: DesignValidationIssue
): FormField[] {
  if (!issue.autoFixAvailable) {
    return fields;
  }

  // Global fixes
  if (issue.autoFixAction === 'add_default_question') {
    return [
      {
        id: `field-${Date.now()}`,
        type: 'multiple_choice',
        label: 'Sample Question',
        isRequired: true,
        options: ['Option A', 'Option B', 'Option C'],
        points: 10,
        correctAnswer: 'Option A',
      },
    ];
  }

  if (issue.autoFixAction === 'auto_group_sections') {
    return fields.map((f, idx) => ({
      ...f,
      group: idx < 5 ? 'Part 1: General Background' : 'Part 2: Technical Skills',
    }));
  }

  // Field-specific fixes
  if (!issue.fieldId) {
    return fields;
  }

  return fields.map((f, idx) => {
    if (f.id !== issue.fieldId) {
      return f;
    }

    const updated = { ...f };

    switch (issue.autoFixAction) {
      case 'fix_untitled_prompt':
        updated.label = `Question #${idx + 1} Prompt`;
        break;

      case 'add_default_choices':
        updated.options = ['Option A', 'Option B', 'Option C'];
        if (!updated.correctAnswer) {
          updated.correctAnswer = 'Option A';
        }
        break;

      case 'clean_empty_choices':
        if (updated.options) {
          const cleaned = updated.options.filter((o) => o && o.trim().length > 0);
          updated.options = cleaned.length >= 2 ? cleaned : ['Option A', 'Option B'];
        }
        break;

      case 'set_default_points':
        updated.points = 10;
        break;

      case 'set_first_option_correct':
        if (updated.options && updated.options.length > 0) {
          updated.correctAnswer =
            updated.type === 'multiple_choice' ? [updated.options[0]] : updated.options[0];
        }
        break;

      case 'remove_broken_branch':
        updated.conditions = [];
        delete (updated as unknown as { branchingRules?: unknown }).branchingRules;
        delete updated.branchTarget;
        delete updated.optionBranching;
        break;

      case 'reset_regex_pattern':
        if (updated.validationRule) {
          updated.validationRule.pattern = '^[a-zA-Z0-9_-]+$';
          updated.validationRule.errorMessage = 'Format must be alphanumeric.';
        }
        break;

      case 'set_default_placeholder':
        if (updated.type === 'email') {
          updated.placeholder = 'candidate@company.org';
        } else if (updated.type === 'phone') {
          updated.placeholder = '+880 1700 000000';
        } else if (updated.type === 'paragraph') {
          updated.placeholder = 'Provide comprehensive commentary...';
        } else {
          updated.placeholder = 'Enter response here...';
        }
        break;

      default:
        break;
    }

    return updated;
  });
}

/**
 * 1-Click fix all repairable issues across the form.
 */
export function applyAllAutoFixes(
  fields: FormField[],
  issues: DesignValidationIssue[]
): FormField[] {
  let currentFields = [...fields];

  for (const issue of issues) {
    if (issue.autoFixAvailable) {
      currentFields = applyAutoFixToFields(currentFields, issue);
    }
  }

  return currentFields;
}

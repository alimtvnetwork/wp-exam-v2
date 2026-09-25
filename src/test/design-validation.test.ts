import { describe, it, expect } from 'vitest';
import {
  auditFormDesign,
  applyAutoFixToFields,
  applyAllAutoFixes,
} from '@/lib/design-validation-engine';
import { FormField } from '@/lib/types/form';

describe('Design Validation Engine (Spec 49)', () => {
  it('should flag empty forms with error severity and score deduction', () => {
    const report = auditFormDesign([], 'survey');

    expect(report.score).toBe(50);
    expect(report.grade).toBe('D');
    expect(report.summary.errors).toBe(1);
    expect(report.issues[0].id).toBe('issue-empty-form');
    expect(report.issues[0].severity).toBe('error');
  });

  it('should flag untitled or generic field prompts', () => {
    const fields: FormField[] = [
      {
        id: 'f-1',
        type: 'short_answer',
        label: 'Untitled Question',
        isRequired: true,
        placeholder: 'Enter response...',
      },
    ];

    const report = auditFormDesign(fields, 'survey');

    const promptIssue = report.issues.find((i) => i.id === 'issue-prompt-f-1');
    expect(promptIssue).toBeDefined();
    expect(promptIssue?.severity).toBe('warning');
    expect(promptIssue?.autoFixAction).toBe('fix_untitled_prompt');
  });

  it('should flag choice questions with zero options', () => {
    const fields: FormField[] = [
      {
        id: 'f-choice',
        type: 'multiple_choice',
        label: 'Select primary language',
        options: [],
        isRequired: true,
      },
    ];

    const report = auditFormDesign(fields, 'survey');

    const choiceIssue = report.issues.find((i) => i.id === 'issue-choices-f-choice');
    expect(choiceIssue).toBeDefined();
    expect(choiceIssue?.severity).toBe('error');
    expect(choiceIssue?.autoFixAction).toBe('add_default_choices');
  });

  it('should flag empty choice strings in options array', () => {
    const fields: FormField[] = [
      {
        id: 'f-empty-opt',
        type: 'multiple_choice',
        label: 'Select framework',
        options: ['React', '   ', 'Vue'],
        isRequired: true,
      },
    ];

    const report = auditFormDesign(fields, 'survey');

    const emptyOptIssue = report.issues.find((i) => i.id === 'issue-empty-choice-f-empty-opt');
    expect(emptyOptIssue).toBeDefined();
    expect(emptyOptIssue?.severity).toBe('warning');
    expect(emptyOptIssue?.autoFixAction).toBe('clean_empty_choices');
  });

  it('should flag zero or missing points in quiz mode', () => {
    const fields: FormField[] = [
      {
        id: 'f-quiz-no-pts',
        type: 'single_choice',
        label: 'What does CSS stand for?',
        options: ['Cascading Style Sheets', 'Computer Science Style'],
        correctAnswer: 'Cascading Style Sheets',
        points: 0,
        isRequired: true,
      },
    ];

    const report = auditFormDesign(fields, 'quiz');

    const ptsIssue = report.issues.find((i) => i.id === 'issue-points-f-quiz-no-pts');
    expect(ptsIssue).toBeDefined();
    expect(ptsIssue?.severity).toBe('warning');
    expect(ptsIssue?.autoFixAction).toBe('set_default_points');
  });

  it('should flag missing answer keys in quiz mode', () => {
    const fields: FormField[] = [
      {
        id: 'f-quiz-no-key',
        type: 'multiple_choice',
        label: 'Select valid HTTP verbs',
        options: ['GET', 'POST', 'INVALID'],
        points: 10,
        isRequired: true,
      },
    ];

    const report = auditFormDesign(fields, 'quiz');

    const keyIssue = report.issues.find((i) => i.id === 'issue-answer-key-f-quiz-no-key');
    expect(keyIssue).toBeDefined();
    expect(keyIssue?.severity).toBe('error');
    expect(keyIssue?.autoFixAction).toBe('set_first_option_correct');
  });

  it('should flag broken DAG branching target references', () => {
    const fields: FormField[] = [
      {
        id: 'f-branch-src',
        type: 'single_choice',
        label: 'Do you require remote accommodations?',
        options: ['Yes', 'No'],
        isRequired: true,
        branchingRules: [
          {
            fieldId: 'f-branch-src',
            operator: 'equals',
            value: 'Yes',
            targetFieldId: 'non-existent-step-id',
          },
        ],
      },
    ];

    const report = auditFormDesign(fields, 'survey');

    const branchIssue = report.issues.find((i) => i.id === 'issue-broken-branch-f-branch-src');
    expect(branchIssue).toBeDefined();
    expect(branchIssue?.severity).toBe('error');
    expect(branchIssue?.autoFixAction).toBe('remove_broken_branch');
  });

  it('should flag invalid regex syntax in validation rules', () => {
    const fields: FormField[] = [
      {
        id: 'f-regex',
        type: 'regex_text',
        label: 'Custom Validation Field',
        validationRule: {
          ruleType: 'regex',
          pattern: '[a-z',
          errorMessage: 'Malformed expression',
        },
        isRequired: true,
      },
    ];

    const report = auditFormDesign(fields, 'survey');

    const regexIssue = report.issues.find((i) => i.id === 'issue-invalid-regex-f-regex');
    expect(regexIssue).toBeDefined();
    expect(regexIssue?.severity).toBe('error');
    expect(regexIssue?.autoFixAction).toBe('reset_regex_pattern');
  });

  it('should flag missing accessible placeholder on text input fields', () => {
    const fields: FormField[] = [
      {
        id: 'f-text-no-ph',
        type: 'short_answer',
        label: 'Candidate Full Legal Name',
        placeholder: '',
        isRequired: true,
      },
    ];

    const report = auditFormDesign(fields, 'survey');

    const phIssue = report.issues.find((i) => i.id === 'issue-a11y-placeholder-f-text-no-ph');
    expect(phIssue).toBeDefined();
    expect(phIssue?.severity).toBe('info');
    expect(phIssue?.autoFixAction).toBe('set_default_placeholder');
  });

  it('should flag cognitive overload when form exceeds 10 questions without sections', () => {
    const fields: FormField[] = Array.from({ length: 15 }, (_, i) => ({
      id: `f-${i + 1}`,
      type: 'short_answer',
      label: `Candidate Question ${i + 1}`,
      placeholder: 'Enter answer...',
      isRequired: true,
    }));

    const report = auditFormDesign(fields, 'survey');

    const overloadIssue = report.issues.find((i) => i.id === 'issue-cognitive-overload');
    expect(overloadIssue).toBeDefined();
    expect(overloadIssue?.severity).toBe('info');
  });

  it('should apply individual auto-fixes idempotently', () => {
    const initialFields: FormField[] = [
      {
        id: 'f-auto-1',
        type: 'multiple_choice',
        label: 'Untitled Question',
        options: ['Choice 1', '', 'Choice 3'],
        points: 0,
        isRequired: true,
      },
    ];

    // Fix untitled prompt
    const report1 = auditFormDesign(initialFields, 'quiz');
    const promptIssue = report1.issues.find((i) => i.id === 'issue-prompt-f-auto-1')!;
    const fieldsFixedPrompt = applyAutoFixToFields(initialFields, promptIssue);
    expect(fieldsFixedPrompt[0].label).not.toContain('Untitled');

    // Fix clean empty choices
    const report2 = auditFormDesign(fieldsFixedPrompt, 'quiz');
    const choiceIssue = report2.issues.find((i) => i.id === 'issue-empty-choice-f-auto-1')!;
    const fieldsCleanChoices = applyAutoFixToFields(fieldsFixedPrompt, choiceIssue);
    expect(fieldsCleanChoices[0].options).toEqual(['Choice 1', 'Choice 3']);

    // Fix set points
    const report3 = auditFormDesign(fieldsCleanChoices, 'quiz');
    const ptsIssue = report3.issues.find((i) => i.id === 'issue-points-f-auto-1')!;
    const fieldsFixedPts = applyAutoFixToFields(fieldsCleanChoices, ptsIssue);
    expect(fieldsFixedPts[0].points).toBe(10);

    // Fix answer key
    const report4 = auditFormDesign(fieldsFixedPts, 'quiz');
    const keyIssue = report4.issues.find((i) => i.id === 'issue-answer-key-f-auto-1')!;
    const fieldsFixedKey = applyAutoFixToFields(fieldsFixedPts, keyIssue);
    expect(fieldsFixedKey[0].correctAnswer).toEqual(['Choice 1']);
  });

  it('should apply all auto-fixes in batch and improve overall health score', () => {
    const initialFields: FormField[] = [
      {
        id: 'f-batch-1',
        type: 'single_choice',
        label: 'Untitled Question',
        options: [],
        points: 0,
        isRequired: true,
      },
      {
        id: 'f-batch-2',
        type: 'regex_text',
        label: 'Valid Code',
        validationRule: {
          ruleType: 'regex',
          pattern: '[unclosed',
          errorMessage: 'Bad regex',
        },
        isRequired: true,
      },
    ];

    const initialReport = auditFormDesign(initialFields, 'quiz');
    const initialScore = initialReport.score;

    const repairedFields = applyAllAutoFixes(initialFields, initialReport.issues);
    const repairedReport = auditFormDesign(repairedFields, 'quiz');

    expect(repairedReport.score).toBeGreaterThan(initialScore);
    expect(repairedFields[0].options?.length).toBeGreaterThan(0);
    expect(repairedFields[0].points).toBe(10);
    expect(repairedFields[1].validationRule?.pattern).toBe('^[a-zA-Z0-9_-]+$');
  });
});

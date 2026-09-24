import { describe, it, expect } from 'vitest';
import { FormField } from '../lib/types/form';
import {
  evaluateConditionRule,
  evaluateFieldVisibility,
  evaluateFieldRequired,
  getNextStepIndex,
  getPreviousStepIndex,
  rewindStep,
  detectBranchingCycles,
  formatRuleDescription,
} from '../lib/branching-engine';

describe('Branching Engine Unit Tests', () => {
  describe('evaluateConditionRule', () => {
    it('evaluates equals operator with case insensitivity', () => {
      const rule = {
        parentFieldId: 'q1',
        operator: 'equals' as const,
        expectedValue: 'Yes',
        action: 'show' as const,
      };

      expect(evaluateConditionRule(rule, { q1: 'Yes' })).toBe(true);
      expect(evaluateConditionRule(rule, { q1: 'yes' })).toBe(true);
      expect(evaluateConditionRule(rule, { q1: 'No' })).toBe(false);
      expect(evaluateConditionRule(rule, {})).toBe(false);
    });

    it('evaluates not_equals operator', () => {
      const rule = {
        parentFieldId: 'q1',
        operator: 'not_equals' as const,
        expectedValue: 'Draft',
        action: 'show' as const,
      };

      expect(evaluateConditionRule(rule, { q1: 'Published' })).toBe(true);
      expect(evaluateConditionRule(rule, { q1: 'draft' })).toBe(false);
      expect(evaluateConditionRule(rule, {})).toBe(false);
    });

    it('evaluates contains operator for strings and arrays', () => {
      const rule = {
        parentFieldId: 'skills',
        operator: 'contains' as const,
        expectedValue: 'React',
        action: 'show' as const,
      };

      expect(evaluateConditionRule(rule, { skills: 'React, Node, TypeScript' })).toBe(true);
      expect(evaluateConditionRule(rule, { skills: ['Vue', 'React', 'Angular'] })).toBe(true);
      expect(evaluateConditionRule(rule, { skills: ['Python', 'Django'] })).toBe(false);
    });

    it('evaluates is_not_empty and is_empty operators', () => {
      const notEmptyRule = {
        parentFieldId: 'name',
        operator: 'is_not_empty' as const,
        action: 'show' as const,
      };
      const emptyRule = {
        parentFieldId: 'name',
        operator: 'is_empty' as const,
        action: 'show' as const,
      };

      expect(evaluateConditionRule(notEmptyRule, { name: 'Alice' })).toBe(true);
      expect(evaluateConditionRule(notEmptyRule, { name: '' })).toBe(false);
      expect(evaluateConditionRule(notEmptyRule, {})).toBe(false);

      expect(evaluateConditionRule(emptyRule, { name: '' })).toBe(true);
      expect(evaluateConditionRule(emptyRule, {})).toBe(true);
      expect(evaluateConditionRule(emptyRule, { name: 'Alice' })).toBe(false);
    });

    it('evaluates array-aware is_empty and is_not_empty operators correctly', () => {
      const notEmptyRule = {
        parentFieldId: 'tags',
        operator: 'is_not_empty' as const,
        action: 'show' as const,
      };
      const emptyRule = {
        parentFieldId: 'tags',
        operator: 'is_empty' as const,
        action: 'show' as const,
      };

      expect(evaluateConditionRule(notEmptyRule, { tags: ['Engineering'] })).toBe(true);
      expect(evaluateConditionRule(notEmptyRule, { tags: [] })).toBe(false);
      expect(evaluateConditionRule(emptyRule, { tags: [] })).toBe(true);
      expect(evaluateConditionRule(emptyRule, { tags: ['Design'] })).toBe(false);
    });

    it('evaluates numeric comparison operators (greater_than, less_than, etc.)', () => {
      const gtRule = {
        parentFieldId: 'score',
        operator: 'greater_than' as const,
        expectedValue: 80,
        action: 'show' as const,
      };
      const gteRule = {
        parentFieldId: 'score',
        operator: 'greater_than_or_equal' as const,
        expectedValue: 80,
        action: 'show' as const,
      };
      const ltRule = {
        parentFieldId: 'score',
        operator: 'less_than' as const,
        expectedValue: 50,
        action: 'show' as const,
      };
      const lteRule = {
        parentFieldId: 'score',
        operator: 'less_than_or_equal' as const,
        expectedValue: 50,
        action: 'show' as const,
      };

      expect(evaluateConditionRule(gtRule, { score: 85 })).toBe(true);
      expect(evaluateConditionRule(gtRule, { score: 80 })).toBe(false);
      expect(evaluateConditionRule(gtRule, { score: 75 })).toBe(false);

      expect(evaluateConditionRule(gteRule, { score: 80 })).toBe(true);
      expect(evaluateConditionRule(gteRule, { score: 79 })).toBe(false);

      expect(evaluateConditionRule(ltRule, { score: 40 })).toBe(true);
      expect(evaluateConditionRule(ltRule, { score: 50 })).toBe(false);

      expect(evaluateConditionRule(lteRule, { score: 50 })).toBe(true);
      expect(evaluateConditionRule(lteRule, { score: 51 })).toBe(false);
    });
  });

  describe('evaluateFieldVisibility', () => {
    it('returns true when field has no conditions', () => {
      const field: FormField = {
        id: 'q1',
        type: 'short_answer',
        label: 'Name',
        isRequired: true,
      };

      expect(evaluateFieldVisibility(field, {})).toBe(true);
    });

    it('hides field when show condition is not satisfied', () => {
      const field: FormField = {
        id: 'q2',
        type: 'paragraph',
        label: 'Explain why',
        isRequired: true,
        conditions: [
          {
            parentFieldId: 'q1',
            operator: 'equals',
            expectedValue: 'Yes',
            action: 'show',
          },
        ],
      };

      expect(evaluateFieldVisibility(field, { q1: 'No' })).toBe(false);
      expect(evaluateFieldVisibility(field, { q1: 'Yes' })).toBe(true);
    });

    it('hides field when hide condition is satisfied', () => {
      const field: FormField = {
        id: 'q2',
        type: 'short_answer',
        label: 'Optional Details',
        isRequired: false,
        conditions: [
          {
            parentFieldId: 'q1',
            operator: 'equals',
            expectedValue: 'Skip',
            action: 'hide',
          },
        ],
      };

      expect(evaluateFieldVisibility(field, { q1: 'Skip' })).toBe(false);
      expect(evaluateFieldVisibility(field, { q1: 'Continue' })).toBe(true);
    });

    it('respects conditionMatch any vs all', () => {
      const fieldAll: FormField = {
        id: 'q3',
        type: 'short_answer',
        label: 'Advanced',
        isRequired: false,
        conditionMatch: 'all',
        conditions: [
          { parentFieldId: 'q1', operator: 'equals', expectedValue: 'A', action: 'show' },
          { parentFieldId: 'q2', operator: 'equals', expectedValue: 'B', action: 'show' },
        ],
      };

      expect(evaluateFieldVisibility(fieldAll, { q1: 'A', q2: 'B' })).toBe(true);
      expect(evaluateFieldVisibility(fieldAll, { q1: 'A', q2: 'C' })).toBe(false);

      const fieldAny: FormField = {
        ...fieldAll,
        conditionMatch: 'any',
      };

      expect(evaluateFieldVisibility(fieldAny, { q1: 'A', q2: 'C' })).toBe(true);
      expect(evaluateFieldVisibility(fieldAny, { q1: 'X', q2: 'Y' })).toBe(false);
    });
  });

  describe('evaluateFieldRequired', () => {
    it('returns false for hidden fields even if marked required', () => {
      const field: FormField = {
        id: 'q2',
        type: 'short_answer',
        label: 'Must answer if visible',
        isRequired: true,
        conditions: [
          { parentFieldId: 'q1', operator: 'equals', expectedValue: 'Yes', action: 'show' },
        ],
      };

      expect(evaluateFieldRequired(field, { q1: 'No' })).toBe(false);
      expect(evaluateFieldRequired(field, { q1: 'Yes' })).toBe(true);
    });

    it('dynamically makes field required based on require condition', () => {
      const field: FormField = {
        id: 'q2',
        type: 'short_answer',
        label: 'VAT / Tax Number',
        isRequired: false,
        conditions: [
          { parentFieldId: 'is_business', operator: 'equals', expectedValue: 'Yes', action: 'require' },
        ],
      };

      expect(evaluateFieldRequired(field, { is_business: 'No' })).toBe(false);
      expect(evaluateFieldRequired(field, { is_business: 'Yes' })).toBe(true);
    });
  });

  describe('getNextStepIndex and getPreviousStepIndex', () => {
    const fields: FormField[] = [
      {
        id: 'q0',
        type: 'single_choice',
        label: 'Choose track',
        isRequired: true,
        options: ['Track A', 'Track B'],
        optionBranching: {
          'Track B': 'q2',
        },
      },
      {
        id: 'q1',
        type: 'short_answer',
        label: 'Track A Question',
        isRequired: true,
        conditions: [
          { parentFieldId: 'q0', operator: 'equals', expectedValue: 'Track A', action: 'show' },
        ],
      },
      {
        id: 'q2',
        type: 'short_answer',
        label: 'Final Common Question',
        isRequired: true,
      },
    ];

    it('navigates sequentially when condition allows next step', () => {
      const nextStep = getNextStepIndex(fields, 0, { q0: 'Track A' });
      expect(nextStep).toBe(1);
    });

    it('jumps directly using optionBranching', () => {
      const nextStep = getNextStepIndex(fields, 0, { q0: 'Track B' });
      expect(nextStep).toBe(2);
    });

    it('skips hidden step when advancing', () => {
      const nextStep = getNextStepIndex(fields, 0, { q0: 'Other' });
      expect(nextStep).toBe(2);
    });

    it('finds previous visible step correctly', () => {
      const prevStep = getPreviousStepIndex(fields, 2, { q0: 'Track B' });
      // q1 is hidden for Track B, so previous visible step is q0 (index 0)
      expect(prevStep).toBe(0);
    });
  });

  describe('formatRuleDescription', () => {
    const allFields: FormField[] = [
      { id: 'f1', type: 'single_choice', label: 'Do you code in Go?', isRequired: true },
      { id: 'f2', type: 'short_answer', label: 'Years of Go experience', isRequired: false },
    ];

    it('formats show rule into natural English', () => {
      const desc = formatRuleDescription(
        { parentFieldId: 'f1', operator: 'equals', expectedValue: 'Yes', action: 'show' },
        allFields
      );
      expect(desc).toContain('SHOW this question');
      expect(desc).toContain('"Do you code in Go?"');
      expect(desc).toContain('"Yes"');
    });

    it('formats is_not_empty operator cleanly', () => {
      const desc = formatRuleDescription(
        { parentFieldId: 'f1', operator: 'is_not_empty', action: 'show' },
        allFields
      );
      expect(desc).toBe('SHOW this question when "Do you code in Go?" is answered');
    });
  });

  describe('rewindStep', () => {
    const fields: FormField[] = [
      { id: 'q0', type: 'short_answer', label: 'Q0', isRequired: true },
      { id: 'q1', type: 'short_answer', label: 'Q1', isRequired: true },
      { id: 'q2', type: 'short_answer', label: 'Q2', isRequired: true },
    ];

    it('returns step 0 when history is empty', () => {
      const res = rewindStep(fields, { currentStep: 0, history: [] }, {});
      expect(res.currentStep).toBe(0);
      expect(res.history).toEqual([]);
    });

    it('pops the last step from history', () => {
      const res = rewindStep(fields, { currentStep: 2, history: [0] }, {});
      expect(res.currentStep).toBe(0);
      expect(res.history).toEqual([]);
    });

    it('skips target if target became hidden by earlier answers', () => {
      const conditionalFields: FormField[] = [
        { id: 'q0', type: 'short_answer', label: 'Q0', isRequired: true },
        {
          id: 'q1',
          type: 'short_answer',
          label: 'Q1',
          isRequired: true,
          conditions: [{ parentFieldId: 'q0', operator: 'equals', expectedValue: 'ShowQ1', action: 'show' }],
        },
        { id: 'q2', type: 'short_answer', label: 'Q2', isRequired: true },
      ];

      // q1 is in history, but now q0 is 'HideQ1' so q1 is invisible.
      // rewindStep should pop q1 and continue popping to q0.
      const res = rewindStep(conditionalFields, { currentStep: 2, history: [0, 1] }, { q0: 'HideQ1' });
      expect(res.currentStep).toBe(0);
      expect(res.history).toEqual([]);
    });
  });

  describe('detectBranchingCycles', () => {
    it('detects direct circular loop between two fields', () => {
      const cyclicFields: FormField[] = [
        {
          id: 'q1',
          type: 'single_choice',
          label: 'Question 1',
          isRequired: true,
          optionBranching: {
            'Option A': 'q2',
          },
        },
        {
          id: 'q2',
          type: 'single_choice',
          label: 'Question 2',
          isRequired: true,
          optionBranching: {
            'Option B': 'q1',
          },
        },
      ];

      const report = detectBranchingCycles(cyclicFields);
      expect(report.hasCycles).toBe(true);
      expect(report.description).toContain('Circular jump loop detected');
    });

    it('confirms DAG safe when branching has no loops', () => {
      const acyclicFields: FormField[] = [
        {
          id: 'q1',
          type: 'single_choice',
          label: 'Question 1',
          isRequired: true,
          optionBranching: {
            'Option A': 'q2',
            'Option B': 'q3',
          },
        },
        {
          id: 'q2',
          type: 'short_answer',
          label: 'Question 2',
          isRequired: true,
        },
        {
          id: 'q3',
          type: 'short_answer',
          label: 'Question 3',
          isRequired: true,
        },
      ];

      const report = detectBranchingCycles(acyclicFields);
      expect(report.hasCycles).toBe(false);
      expect(report.cycleNodes).toEqual([]);
    });
  });
});

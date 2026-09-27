import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveQuestionLayoutMode,
  resolveAnswerPlacement,
  extractQuestionReferences,
  extractQuestionChecklist,
  verifyChecklistCompletion,
} from '@/lib/presentation-layout';
import { FormField, FormModel, QuestionLayoutMode } from '@/lib/types/form';

describe('Spec 17: Presentation Split Layout, Question Display Modes & UI/UX Preview Architecture', () => {
  describe('Layout Mode Priority Resolution', () => {
    it('prioritizes runtime override above all else when not default', () => {
      const mode = resolveQuestionLayoutMode({
        runtimeOverride: 'presentation_split',
        fieldMode: 'standard',
        formDefaultMode: 'standard',
      });
      expect(mode).toBe('presentation_split');

      const standardOverride = resolveQuestionLayoutMode({
        runtimeOverride: 'standard',
        fieldMode: 'presentation_split',
        formDefaultMode: 'presentation_split',
      });
      expect(standardOverride).toBe('standard');
    });

    it('falls back to field layout mode when runtime override is default or undefined', () => {
      const fieldSplit = resolveQuestionLayoutMode({
        runtimeOverride: 'default',
        fieldMode: 'presentation_split',
        formDefaultMode: 'standard',
      });
      expect(fieldSplit).toBe('presentation_split');

      const fieldStandard = resolveQuestionLayoutMode({
        fieldMode: 'standard',
        formDefaultMode: 'presentation_split',
      });
      expect(fieldStandard).toBe('standard');
    });

    it('falls back to form settings default layout when field mode is undefined', () => {
      const formSplit = resolveQuestionLayoutMode({
        runtimeOverride: 'default',
        fieldMode: undefined,
        formDefaultMode: 'presentation_split',
      });
      expect(formSplit).toBe('presentation_split');
    });

    it('defaults to standard layout when all configuration layers are unset', () => {
      const defaultMode = resolveQuestionLayoutMode({});
      expect(defaultMode).toBe('standard');
    });
  });

  describe('Reference Resources Extraction & Deduplication', () => {
    it('extracts referenceLinks and merges citations with external URLs', () => {
      const sampleField: FormField = {
        id: 'q1',
        type: 'multiple_choice',
        label: 'What is the algorithmic complexity of binary search?',
        referenceLinks: [
          {
            id: 'ref-1',
            title: 'Big-O Cheat Sheet',
            url: 'https://www.bigocheatsheet.com',
            description: 'Time and space complexity charts.',
          },
        ],
        citations: [
          {
            id: 'cit-1',
            title: 'Wikipedia BST',
            url: 'https://en.wikipedia.org/wiki/Binary_search_tree',
            position: 'prefix',
          },
          {
            id: 'cit-2',
            title: 'Duplicate Big-O Link',
            url: 'https://www.bigocheatsheet.com',
            position: 'suffix',
          },
        ],
      };

      const references = extractQuestionReferences({ field: sampleField });
      expect(references.length).toBe(2);
      expect(references[0].title).toBe('Big-O Cheat Sheet');
      expect(references[0].url).toBe('https://www.bigocheatsheet.com');
      expect(references[1].title).toBe('Wikipedia BST');
      expect(references[1].url).toBe('https://en.wikipedia.org/wiki/Binary_search_tree');
    });

    it('returns empty array when field has no references or citations', () => {
      const plainField: FormField = {
        id: 'q2',
        type: 'text',
        label: 'Simple question',
      };

      const references = extractQuestionReferences({ field: plainField });
      expect(references).toEqual([]);
    });
  });

  describe('Action Checklist Extraction & Mandatory Verification', () => {
    it('extracts actionChecklist items and mandatory citations', () => {
      const sampleField: FormField = {
        id: 'q3',
        type: 'multiple_choice',
        label: 'Implement idempotent API handler',
        actionChecklist: [
          {
            id: 'chk-1',
            label: 'Clone starter repository',
            isRequired: true,
          },
          {
            id: 'chk-2',
            label: 'Run local test suite',
            isRequired: false,
          },
        ],
        citations: [
          {
            id: 'cit-3',
            title: 'Review API Guidelines',
            position: 'prefix',
            isRequiredCheck: true,
          },
        ],
      };

      const checklist = extractQuestionChecklist({ field: sampleField });
      expect(checklist.length).toBe(3);
      expect(checklist[0].label).toBe('Clone starter repository');
      expect(checklist[0].isRequired).toBe(true);
      expect(checklist[1].label).toBe('Run local test suite');
      expect(checklist[1].isRequired).toBe(false);
      expect(checklist[2].label).toBe('Review API Guidelines');
      expect(checklist[2].isRequired).toBe(true);
    });

    it('accurately evaluates checklist completion and identifies missing mandatory items', () => {
      const items = [
        { id: 'item-1', label: 'Mandatory Task 1', isRequired: true },
        { id: 'item-2', label: 'Optional Task 2', isRequired: false },
        { id: 'item-3', label: 'Mandatory Task 3', isRequired: true },
      ];

      const incompleteResult = verifyChecklistCompletion({
        items,
        completedMap: {
          'item-1': true,
        },
      });

      expect(incompleteResult.isAllCompleted).toBe(false);
      expect(incompleteResult.isMandatorySatisfied).toBe(false);
      expect(incompleteResult.completedCount).toBe(1);
      expect(incompleteResult.totalCount).toBe(3);
      expect(incompleteResult.missingMandatoryLabels).toEqual(['Mandatory Task 3']);

      const satisfiedResult = verifyChecklistCompletion({
        items,
        completedMap: {
          'item-1': true,
          'item-3': true,
        },
      });

      expect(satisfiedResult.isAllCompleted).toBe(false);
      expect(satisfiedResult.isMandatorySatisfied).toBe(true);
      expect(satisfiedResult.completedCount).toBe(2);
      expect(satisfiedResult.missingMandatoryLabels).toEqual([]);

      const fullResult = verifyChecklistCompletion({
        items,
        completedMap: {
          'item-1': true,
          'item-2': true,
          'item-3': true,
        },
      });

      expect(fullResult.isAllCompleted).toBe(true);
      expect(fullResult.isMandatorySatisfied).toBe(true);
      expect(fullResult.completedCount).toBe(3);
      expect(fullResult.missingMandatoryLabels).toEqual([]);
    });
  });

  describe('Form Model Contract Serialization', () => {
    it('serializes form-level and question-level presentation settings correctly', () => {
      const mockForm: FormModel = {
        id: 'test-form',
        title: 'Architectural Presentation Quiz',
        formType: 'quiz',
        formAccess: 'public',
        isSequential: true,
        isPublished: true,
        settings: {
          defaultQuestionLayout: 'presentation_split',
          timeLimitSeconds: 1200,
        },
        fields: [
          {
            id: 'f1',
            type: 'multiple_choice',
            label: 'Which caching strategy guarantees read consistency?',
            layoutMode: 'presentation_split',
            kickerText: 'Question 01 • Distributed Systems',
            options: ['Cache-Aside', 'Write-Through', 'Read-Through', 'Write-Behind'],
            correctAnswer: 'Write-Through',
            points: 15,
            referenceLinks: [
              {
                id: 'ref-cache',
                title: 'Distributed Caching Patterns',
                url: 'https://patterns.dev',
              },
            ],
            actionChecklist: [
              {
                id: 'chk-cache',
                label: 'Read through write-through diagram',
                isRequired: true,
              },
            ],
          },
          {
            id: 'f2',
            type: 'true_false',
            label: 'Read-through caching shifts cache loading responsibility to the cache provider.',
            layoutMode: 'standard',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
        ],
      };

      expect(mockForm.settings?.defaultQuestionLayout).toBe('presentation_split');
      expect(mockForm.fields[0].layoutMode).toBe('presentation_split');
      expect(mockForm.fields[0].kickerText).toBe('Question 01 • Distributed Systems');
      expect(mockForm.fields[0].referenceLinks?.[0].title).toBe('Distributed Caching Patterns');
      expect(mockForm.fields[0].actionChecklist?.[0].isRequired).toBe(true);
      expect(mockForm.fields[1].layoutMode).toBe('standard');
    });
  });

  describe('Answer / Checkbox Placement Resolution', () => {
    it('prioritizes question-level answerPlacement when set', () => {
      const leftMode = resolveAnswerPlacement({
        fieldPlacement: 'left',
        formDefaultPlacement: 'right',
      });
      expect(leftMode).toBe('left');

      const rightMode = resolveAnswerPlacement({
        fieldPlacement: 'right',
        formDefaultPlacement: 'left',
      });
      expect(rightMode).toBe('right');
    });

    it('falls back to formDefaultPlacement when fieldPlacement is unset', () => {
      const fallbackLeft = resolveAnswerPlacement({
        fieldPlacement: undefined,
        formDefaultPlacement: 'left',
      });
      expect(fallbackLeft).toBe('left');

      const fallbackRight = resolveAnswerPlacement({
        fieldPlacement: undefined,
        formDefaultPlacement: 'right',
      });
      expect(fallbackRight).toBe('right');
    });

    it('defaults to right-hand side placement when all are unset', () => {
      const defaultPlacement = resolveAnswerPlacement({});
      expect(defaultPlacement).toBe('right');
    });
  });
});

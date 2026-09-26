import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '../quiz/store/useQuizStore';
import {
  FormField,
  BooleanDisplayPreset,
  QuestionDifficulty,
  QuestionCitation,
} from '../lib/types/form';

describe('Spec 13: Question Card Intelligence, Boolean Presets, Difficulty Tiers & Exam Security', () => {
  beforeEach(() => {
    useQuizStore.getState().resetForm();
  });

  describe('Universal Boolean Field & Display Presets', () => {
    const getPresetOptions = (preset?: BooleanDisplayPreset): string[] => {
      switch (preset) {
        case 'yes_no':
          return ['Yes', 'No'];
        case 'enable_disable':
          return ['Enable', 'Disable'];
        case 'agree_disagree':
          return ['Agree', 'Disagree'];
        case 'true_false':
        default:
          return ['True', 'False'];
      }
    };

    it('should generate correct binary labels across all 4 presets', () => {
      expect(getPresetOptions('true_false')).toEqual(['True', 'False']);
      expect(getPresetOptions('yes_no')).toEqual(['Yes', 'No']);
      expect(getPresetOptions('enable_disable')).toEqual(['Enable', 'Disable']);
      expect(getPresetOptions('agree_disagree')).toEqual(['Agree', 'Disagree']);
      expect(getPresetOptions(undefined)).toEqual(['True', 'False']);
    });

    it('should normalize and grade boolean responses case-insensitively', () => {
      const field: FormField = {
        id: 'q-bool-1',
        type: 'boolean',
        label: 'Do you agree with the code of conduct?',
        isRequired: true,
        booleanDisplay: 'agree_disagree',
        correctAnswer: 'Agree',
        points: 10,
      };

      const userChoice = 'agree';
      const isCorrect = userChoice.trim().toLowerCase() === field.correctAnswer?.toLowerCase();

      expect(isCorrect).toBe(true);
    });
  });

  describe('Difficulty Tiers & Points Allocation Hierarchy', () => {
    const resolvePoints = (field: FormField): number => {
      if (typeof field.customPointsOverride === 'number') {
        return field.customPointsOverride;
      }

      if (typeof field.points === 'number') {
        return field.points;
      }

      switch (field.difficulty) {
        case 'easy':
          return 5;
        case 'hard':
          return 20;
        case 'medium':
        default:
          return 10;
      }
    };

    it('should assign standard defaults based on difficulty tier', () => {
      const easyField: FormField = { id: '1', type: 'single_choice', label: 'E', isRequired: true, difficulty: 'easy' };
      const medField: FormField = { id: '2', type: 'single_choice', label: 'M', isRequired: true, difficulty: 'medium' };
      const hardField: FormField = { id: '3', type: 'single_choice', label: 'H', isRequired: true, difficulty: 'hard' };

      expect(resolvePoints(easyField)).toBe(5);
      expect(resolvePoints(medField)).toBe(10);
      expect(resolvePoints(hardField)).toBe(20);
    });

    it('should prioritize customPointsOverride over tier defaults', () => {
      const customField: FormField = {
        id: '4',
        type: 'short_answer',
        label: 'Architecture essay',
        isRequired: true,
        difficulty: 'hard',
        customPointsOverride: 35,
      };

      expect(resolvePoints(customField)).toBe(35);
    });
  });

  describe('Citations, Reference Links & Actionable Checklist Gates', () => {
    it('should partition citations into prefix and suffix groups', () => {
      const citations: QuestionCitation[] = [
        { id: 'c1', title: 'Architecture RFC 102', position: 'prefix', url: 'https://docs.example.com' },
        { id: 'c2', title: 'I have run local unit tests', position: 'suffix', isRequiredCheck: true },
        { id: 'c3', title: 'Style Guide Citation', position: 'prefix' },
      ];

      const prefixCitations = citations.filter((c) => c.position === 'prefix');
      const suffixCitations = citations.filter((c) => c.position === 'suffix');

      expect(prefixCitations).toHaveLength(2);
      expect(suffixCitations).toHaveLength(1);
    });

    it('should accurately detect uncompleted mandatory checklist to-dos', () => {
      const citations: QuestionCitation[] = [
        { id: 'c1', title: 'Review Schema', position: 'prefix' },
        { id: 'c2', title: 'I have executed database migration', position: 'suffix', isRequiredCheck: true },
        { id: 'c3', title: 'I have sanitized user inputs', position: 'suffix', isRequiredCheck: true },
      ];

      const completedChecks: Record<string, boolean> = {
        c2: true,
      };

      const incomplete = citations.find((c) => {
        if (!c.isRequiredCheck) {
          return false;
        }

        const isDone = Boolean(completedChecks[c.id]);

        return !isDone;
      });

      expect(incomplete?.id).toBe('c3');

      // Complete c3
      completedChecks.c3 = true;

      const remainingIncomplete = citations.find((c) => {
        if (!c.isRequiredCheck) {
          return false;
        }

        const isDone = Boolean(completedChecks[c.id]);

        return !isDone;
      });

      expect(remainingIncomplete).toBeUndefined();
    });
  });

  describe('List of Items Question Type & Suggestions Pool', () => {
    it('should store and aggregate candidate list responses with suggestions', () => {
      const field: FormField = {
        id: 'q-list-1',
        type: 'list_items',
        label: 'List your core engineering competencies',
        isRequired: true,
        suggestionsPool: ['TypeScript', 'Go', 'Docker', 'SQLite', 'GraphQL'],
      };

      let candidateItems = ['TypeScript', 'Go'];

      // Add from suggestions
      const suggestionToAdd = 'Docker';
      if (!candidateItems.includes(suggestionToAdd)) {
        candidateItems = [...candidateItems, suggestionToAdd];
      }

      expect(candidateItems).toEqual(['TypeScript', 'Go', 'Docker']);
      expect(field.suggestionsPool).toContain('SQLite');
    });
  });

  describe('Exam Timers & Anti-Cheat Settings', () => {
    it('should update form settings with timerMode and fullscreen lock', () => {
      const { updateSettings } = useQuizStore.getState();

      updateSettings({
        timerMode: 'per_tier',
        difficultyTimers: { easy: 45, medium: 90, hard: 180 },
        enableFullscreenLock: true,
      });

      const updated = useQuizStore.getState().settings;

      expect(updated?.timerMode).toBe('per_tier');
      expect(updated?.difficultyTimers?.hard).toBe(180);
      expect(updated?.enableFullscreenLock).toBe(true);
    });
  });
});

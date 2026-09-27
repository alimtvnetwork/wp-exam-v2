import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { FormField } from '@/lib/types/form';

describe('Spec 18: Centralized Quiz Configuration & Batch Synchronization', () => {
  beforeEach(() => {
    useQuizStore.getState().resetForm();
  });

  describe('Central Configuration Defaults in Store', () => {
    it('should initialize with standard centralized defaults', () => {
      const state = useQuizStore.getState();
      const settings = state.settings;

      expect(settings.defaultBooleanPreset).toBe('true_false');
      expect(settings.defaultAlignment).toBe('center');
      expect(settings.defaultDifficulty).toBe('medium');
      expect(settings.defaultPoints).toBe(10);
      expect(settings.defaultQuestionLayout).toBe('standard');
      expect(settings.defaultQuestionsRequired).toBe(true);
    });

    it('should allow modifying centralized quiz settings', () => {
      const { updateSettings } = useQuizStore.getState();

      updateSettings({
        defaultBooleanPreset: 'yes_no',
        defaultAlignment: 'right',
        defaultPoints: 25,
        defaultDifficulty: 'hard',
      });

      const updated = useQuizStore.getState().settings;

      expect(updated.defaultBooleanPreset).toBe('yes_no');
      expect(updated.defaultAlignment).toBe('right');
      expect(updated.defaultPoints).toBe(25);
      expect(updated.defaultDifficulty).toBe('hard');
    });
  });

  describe('Batch Synchronization Engine (batchApplyConfig)', () => {
    beforeEach(() => {
      const sampleFields: FormField[] = [
        {
          id: 'q1',
          type: 'multiple_choice',
          label: 'Question 1',
          isRequired: false,
          choiceAlignment: 'left',
          points: 5,
        },
        {
          id: 'q2',
          type: 'boolean',
          label: 'Question 2',
          isRequired: false,
          booleanDisplay: 'true_false',
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 5,
        },
        {
          id: 'q3',
          type: 'video',
          label: 'Briefing Video',
          isRequired: false,
          points: 0,
        },
      ];

      useQuizStore.getState().setFields(sampleFields);
    });

    it('should batch apply points to non-media questions while preserving video zero-points', () => {
      const { batchApplyConfig } = useQuizStore.getState();

      batchApplyConfig({ points: 20 });

      const fields = useQuizStore.getState().fields;

      expect(fields[0].points).toBe(20);
      expect(fields[1].points).toBe(20);
      expect(fields[2].points).toBe(0);
    });

    it('should batch apply choice alignment across all fields', () => {
      const { batchApplyConfig } = useQuizStore.getState();

      batchApplyConfig({ choiceAlignment: 'center' });

      const fields = useQuizStore.getState().fields;

      expect(fields[0].choiceAlignment).toBe('center');
      expect(fields[1].choiceAlignment).toBe('center');
    });

    it('should batch update boolean display preset and regenerate options and correct answers', () => {
      const { batchApplyConfig } = useQuizStore.getState();

      batchApplyConfig({ booleanDisplay: 'yes_no' });

      const fields = useQuizStore.getState().fields;
      const boolField = fields[1];

      expect(boolField.booleanDisplay).toBe('yes_no');
      expect(boolField.options).toEqual(['Yes', 'No']);
      expect(boolField.correctAnswer).toBe('Yes');
    });

    it('should batch toggle mandatory status across questions', () => {
      const { batchApplyConfig } = useQuizStore.getState();

      batchApplyConfig({ isRequired: true });

      const fields = useQuizStore.getState().fields;

      expect(fields[0].isRequired).toBe(true);
      expect(fields[1].isRequired).toBe(true);
      expect(fields[2].isRequired).toBe(false);
    });

    it('should universally synchronize all defaults simultaneously', () => {
      const { batchApplyConfig } = useQuizStore.getState();

      batchApplyConfig({
        points: 50,
        difficulty: 'hard',
        choiceAlignment: 'right',
        booleanDisplay: 'agree_disagree',
        isRequired: true,
      });

      const fields = useQuizStore.getState().fields;

      expect(fields[0].points).toBe(50);
      expect(fields[0].difficulty).toBe('hard');
      expect(fields[0].choiceAlignment).toBe('right');
      expect(fields[0].isRequired).toBe(true);

      expect(fields[1].booleanDisplay).toBe('agree_disagree');
      expect(fields[1].options).toEqual(['Agree', 'Disagree']);
      expect(fields[1].correctAnswer).toBe('Agree');
    });
  });
});

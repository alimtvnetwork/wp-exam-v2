import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllQuizzes,
  getCustomQuizzes,
  saveCustomQuiz,
  duplicateCustomQuiz,
  deleteCustomQuiz,
  BUILTIN_PRESET_QUIZZES,
} from '../quiz/store/quiz-registry';
import { useQuizStore } from '../quiz/store/useQuizStore';
import { FormModel } from '../lib/types/form';

describe('Quiz Library & Custom Quizzes Registry', () => {
  beforeEach(() => {
    localStorage.clear();
    useQuizStore.getState().resetForm();
  });

  it('should return all built-in preset quizzes by default', () => {
    const all = getAllQuizzes();

    expect(all.length).toBeGreaterThanOrEqual(BUILTIN_PRESET_QUIZZES.length);
    const internQuiz = all.find((q) => q.slug === 'intern-programmer');
    expect(internQuiz).toBeDefined();
    expect(internQuiz?.title).toBe('Intern Programmer Candidate Evaluation');
  });

  it('should save and persist custom quizzes to registry', () => {
    const testModel: FormModel = {
      title: 'DevOps & CI/CD Pipeline Assessment',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        passingScore: 85,
        timeLimitSeconds: 1500,
      },
      fields: [
        {
          id: 'field-101',
          type: 'multiple_choice',
          label: 'What is the purpose of zero-storage GitHub Actions workflows?',
          isRequired: true,
          options: ['Eliminate quota waste', 'Slow down builds'],
          correctAnswer: 'Eliminate quota waste',
          points: 25,
        },
      ],
    };

    const saved = saveCustomQuiz(testModel, 'devops-cicd-assessment');

    expect(saved.slug).toBe('devops-cicd-assessment');
    expect(saved.title).toBe('DevOps & CI/CD Pipeline Assessment');
    expect(saved.questionCount).toBe(1);
    expect(saved.totalPoints).toBe(25);
    expect(saved.isCustom).toBe(true);

    const customList = getCustomQuizzes();
    expect(customList.length).toBe(1);
    expect(customList[0].slug).toBe('devops-cicd-assessment');
  });

  it('should duplicate a quiz with a modified title and unique slug', () => {
    const initial = BUILTIN_PRESET_QUIZZES[0];
    const duplicated = duplicateCustomQuiz(initial);

    expect(duplicated.title).toContain('(Copy)');
    expect(duplicated.slug).toContain(`${initial.slug}-copy`);
    expect(duplicated.isCustom).toBe(true);

    const customQuizzes = getCustomQuizzes();
    expect(customQuizzes.some((q) => q.slug === duplicated.slug)).toBe(true);
  });

  it('should delete custom quiz from registry', () => {
    const testModel: FormModel = {
      title: 'Disposable Quiz',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: false,
      isPublished: true,
      settings: {},
      fields: [],
    };

    const saved = saveCustomQuiz(testModel, 'disposable-quiz');
    expect(getCustomQuizzes().length).toBe(1);

    const wasDeleted = deleteCustomQuiz(saved.id);
    expect(wasDeleted).toBe(true);
    expect(getCustomQuizzes().length).toBe(0);
  });

  it('should load quiz model into useQuizStore', () => {
    const store = useQuizStore.getState();

    store.loadForm({
      title: 'Architect Level 3 Examination',
      slug: 'architect-lvl3',
      formType: 'quiz',
      fields: [
        {
          id: 'f1',
          type: 'true_false',
          label: 'Eventual consistency models suit distributed read-heavy workloads.',
          isRequired: true,
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 15,
        },
      ],
    });

    const updated = useQuizStore.getState();
    expect(updated.title).toBe('Architect Level 3 Examination');
    expect(updated.slug).toBe('architect-lvl3');
    expect(updated.fields.length).toBe(1);
    expect(updated.fields[0].id).toBe('f1');
  });
});

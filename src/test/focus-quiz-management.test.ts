import { describe, it, expect, beforeEach } from 'vitest';
import {
  SEEDED_FOCUS_QUIZZES,
  DEFAULT_INITIAL_FOCUS_CONFIG,
  FOCUS_QUIZZES_LIST_STORAGE_KEY,
  ACTIVE_FOCUS_QUIZ_STORAGE_KEY,
  loadStoredFocusQuizzes,
  persistFocusQuizzes,
} from '@/components/admin/focus-quiz-editor';
import { FocusQuizConfig } from '@/components/runner/FocusQuizRunner';

describe('Focus Quiz Multi-Quiz Management & Authoring Studio', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default seeded focus quizzes when localStorage is completely empty', () => {
    const list = loadStoredFocusQuizzes();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list[0].id).toBe('custom-focus-quiz');
    expect(list[1].id).toBe('product-design-focus-quiz');
    expect(list[2].id).toBe('devops-security-focus-quiz');
  });

  it('migrates legacy single active quiz when present into quizzes list', () => {
    const customSingle: FocusQuizConfig = {
      id: 'legacy-active-quiz',
      title: 'Legacy Custom Assessment',
      questions: [],
    };
    localStorage.setItem(ACTIVE_FOCUS_QUIZ_STORAGE_KEY, JSON.stringify(customSingle));

    const list = loadStoredFocusQuizzes();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].id).toBe('legacy-active-quiz');
    expect(list[0].title).toBe('Legacy Custom Assessment');
  });

  it('persists and loads multiple focus quizzes in localStorage', () => {
    const customList: FocusQuizConfig[] = [
      {
        ...DEFAULT_INITIAL_FOCUS_CONFIG,
        id: 'quiz-a',
        title: 'Quiz Alpha',
      },
      {
        ...DEFAULT_INITIAL_FOCUS_CONFIG,
        id: 'quiz-b',
        title: 'Quiz Beta',
      },
    ];

    persistFocusQuizzes(customList);
    const loaded = loadStoredFocusQuizzes();

    expect(loaded.length).toBe(2);
    expect(loaded[0].id).toBe('quiz-a');
    expect(loaded[1].id).toBe('quiz-b');
  });

  it('verifies seeded quizzes adhere to 4-stage sequential focus rules', () => {
    SEEDED_FOCUS_QUIZZES.forEach((quiz) => {
      // 1. General rules
      expect(quiz.id).toBeDefined();
      expect(quiz.title.length).toBeGreaterThan(5);
      expect(quiz.passingScore).toBeGreaterThanOrEqual(50);

      // 2. Welcome screen
      expect(quiz.hasIntro).toBe(true);
      expect(quiz.introTitle).toBeDefined();

      // 3. Reading section
      expect(quiz.readingSection).toBeDefined();
      expect(quiz.readingSection!.pages.length).toBeGreaterThanOrEqual(1);

      // 4. Checklist section
      expect(quiz.checklistSection).toBeDefined();
      expect(quiz.checklistSection!.items.length).toBeGreaterThanOrEqual(2);

      // 5. Scored assessment questions
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('supports creating, duplicating, and updating quiz properties', () => {
    const initialList = [...SEEDED_FOCUS_QUIZZES];
    const newQuizId = `mobile-screening-${Date.now()}`;
    const newQuiz: FocusQuizConfig = {
      id: newQuizId,
      title: 'Mobile Screening Assessment',
      themeId: 'microsoft-blue',
      passingScore: 85,
      questions: [
        {
          id: 'q-mob-1',
          type: 'mcq',
          title: 'What is the standard Android app lifecycle hook for saving transient UI state?',
          options: ['onSaveInstanceState', 'onDestroy', 'onPause'],
          correctAnswer: 'onSaveInstanceState',
          points: 50,
        },
      ],
    };

    // Create
    const updatedList = [newQuiz, ...initialList];
    persistFocusQuizzes(updatedList);
    let loaded = loadStoredFocusQuizzes();
    expect(loaded.length).toBe(initialList.length + 1);
    expect(loaded[0].id).toBe(newQuizId);

    // Duplicate
    const duplicated: FocusQuizConfig = {
      ...newQuiz,
      id: `${newQuizId}-copy`,
      title: `${newQuiz.title} (Copy)`,
    };
    persistFocusQuizzes([duplicated, ...loaded]);
    loaded = loadStoredFocusQuizzes();
    expect(loaded.length).toBe(initialList.length + 2);
    expect(loaded[0].title).toBe('Mobile Screening Assessment (Copy)');

    // Update
    const modified = loaded.map((q) => (q.id === newQuizId ? { ...q, title: 'Updated Title' } : q));
    persistFocusQuizzes(modified);
    loaded = loadStoredFocusQuizzes();
    const updatedFound = loaded.find((q) => q.id === newQuizId);
    expect(updatedFound?.title).toBe('Updated Title');
  });

  it('safely handles quiz deletion and prevents leaving the list empty', () => {
    const singleList: FocusQuizConfig[] = [
      {
        ...DEFAULT_INITIAL_FOCUS_CONFIG,
        id: 'sole-quiz',
        title: 'Only Quiz',
      },
    ];
    persistFocusQuizzes(singleList);

    // Delete sole quiz: fallback must restore initial template
    const remaining = singleList.filter((q) => q.id !== 'sole-quiz');
    const isListEmpty = (remaining.length === 0);
    const finalList = isListEmpty ? [DEFAULT_INITIAL_FOCUS_CONFIG] : remaining;

    persistFocusQuizzes(finalList);
    const loaded = loadStoredFocusQuizzes();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe(DEFAULT_INITIAL_FOCUS_CONFIG.id);
  });
});

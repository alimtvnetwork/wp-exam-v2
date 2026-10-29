import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEY_HISTORY,
  loadAllDynamicSubmissions,
  normalizeQuizSubmission,
  buildQuestionDictionary,
} from '@/components/admin/history-manager';
import { STORAGE_KEY_SUBMISSIONS, QuizSubmissionRecord } from '@/components/admin/analytics-dashboard';
import { SubmissionHistoryRecord } from '@/quiz/store/exam-store';

describe('Dynamic History & Submissions Manager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds a comprehensive question dictionary from curriculum, focus quizzes, and job roles', () => {
    const dict = buildQuestionDictionary();
    expect(Object.keys(dict).length).toBeGreaterThanOrEqual(10);

    // Verify curriculum question mapping
    expect(dict['q1']).toBeDefined();
    expect(dict['q1'].title).toBeDefined();

    // Verify job role question mapping
    expect(dict['fe_q1']).toBeDefined();
    expect(dict['fe_q1'].title).toContain('Discriminated Unions');
  });

  it('correctly normalizes quiz runner submissions into full history records', () => {
    const qDict = buildQuestionDictionary();

    const quizSub: QuizSubmissionRecord = {
      id: 'sub_test_101',
      quiz_id: 'custom-focus-quiz',
      quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
      candidate_name: 'Alex Developer',
      candidate_email: 'alex.dev@innovate.co',
      is_anonymous: false,
      score: 80,
      total: 100,
      percentage: 80,
      is_passed: true,
      wrong_question_ids: ['q2'],
      answers: {
        q1: 'Implicit check',
        q2: 'error',
      },
      submitted_at: '2026-10-27T14:30:00Z',
    };

    const historyRecord = normalizeQuizSubmission(quizSub, qDict);
    expect(historyRecord.form_title).toBe('Engineering Guidelines & Anti-Pattern Compliance Quiz');
    expect(historyRecord.respondent_name).toBe('Alex Developer');
    expect(historyRecord.respondent_email).toBe('alex.dev@innovate.co');
    expect(historyRecord.score_percentage).toBe(80);
    expect(historyRecord.is_passed).toBe(true);
    expect(historyRecord.answers.length).toBe(2);

    const q2Answer = historyRecord.answers.find((a) => a.question.includes('q2') || a.answer === 'error');
    expect(q2Answer).toBeDefined();
    expect(q2Answer?.isCorrect).toBe(false);
  });

  it('dynamically merges persistent history, runner quiz submissions, and in-memory submissions', () => {
    // 1. Seed persistent form submission history
    const persistentRecord: SubmissionHistoryRecord = {
      id: 901,
      form_title: 'Fullstack Developer Technical Assessment',
      form_type: 'assessment',
      respondent_name: 'Liam Vance',
      respondent_email: 'liam.vance@techcorp.io',
      score: 95,
      total_score: 100,
      score_percentage: 95,
      is_passed: true,
      submitted_at: '2026-10-27 10:00',
      answers: [],
    };
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([persistentRecord]));

    // 2. Seed runner quiz submission
    const runnerSub: QuizSubmissionRecord = {
      id: 'sub_902',
      quiz_id: 'proj_sec_101',
      quiz_title: 'Security Compliance & Password Hygiene',
      candidate_name: 'Chloe Kim',
      candidate_email: 'chloe.kim@security.io',
      score: 100,
      total: 100,
      percentage: 100,
      is_passed: true,
      submitted_at: '2026-10-27 12:00',
    };
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify([runnerSub]));

    // 3. In-memory store submission
    const storeSubmissions: SubmissionHistoryRecord[] = [
      {
        id: 903,
        form_title: 'Onboarding General Survey',
        form_type: 'survey',
        respondent_name: 'David Chen',
        respondent_email: 'david.c@company.org',
        score: 100,
        total_score: 100,
        score_percentage: 100,
        is_passed: true,
        submitted_at: '2026-10-26 15:00',
        answers: [],
      },
    ];

    const merged = loadAllDynamicSubmissions(storeSubmissions);
    expect(merged.length).toBe(3);

    // Verify newest first sort
    expect(merged[0].respondent_email).toBe('chloe.kim@security.io');
    expect(merged[1].respondent_email).toBe('liam.vance@techcorp.io');
    expect(merged[2].respondent_email).toBe('david.c@company.org');
  });

  it('updates dynamically when new submissions are saved to localStorage', () => {
    const initial = loadAllDynamicSubmissions([]);
    expect(initial.length).toBe(0);

    const newSub: QuizSubmissionRecord = {
      id: 'sub_dyn_1',
      quiz_id: 'proj_sec_101',
      candidate_name: 'Test Candidate',
      candidate_email: 'test@candidate.com',
      score: 100,
      total: 100,
      percentage: 100,
      is_passed: true,
      submitted_at: '2026-10-28 00:00',
    };
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify([newSub]));

    const reloaded = loadAllDynamicSubmissions([]);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].respondent_email).toBe('test@candidate.com');
  });
});

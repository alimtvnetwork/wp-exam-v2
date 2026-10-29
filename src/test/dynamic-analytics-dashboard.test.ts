import { describe, it, expect, beforeEach } from 'vitest';
import {
  SAMPLE_PROJECT_ANALYTICS,
  INITIAL_REPORTS,
  STORAGE_KEY_REPORTS,
  STORAGE_KEY_SHARING,
  STORAGE_KEY_SUBMISSIONS,
  QuestionReport,
  ProjectAnalytics,
  QuizSubmissionRecord,
  loadDynamicCoursesRegistry,
  computeCourseAnalytics,
  loadStoredSubmissions,
  loadStoredReports,
} from '@/components/admin/analytics-dashboard';
import { INITIAL_CATEGORIES } from '@/components/admin/project-hierarchy-manager';
import { SEEDED_FOCUS_QUIZZES } from '@/components/admin/focus-quiz-editor';

describe('Dynamic Analytics Dashboard & Telemetry', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides base sample project analytics for continuity', () => {
    expect(SAMPLE_PROJECT_ANALYTICS.length).toBeGreaterThanOrEqual(2);
    const onboarding = SAMPLE_PROJECT_ANALYTICS[0];
    expect(onboarding.projectId).toBe('proj-onboarding-101');
    expect(onboarding.passRate).toBe(81);
    expect(onboarding.questions.length).toBe(4);

    // Verify high failure alerts logic (> 40%)
    const highAlerts = onboarding.questions.filter((q) => q.hasHighFailureAlert);
    expect(highAlerts.length).toBe(2);
    highAlerts.forEach((q) => {
      expect(q.failureRate).toBeGreaterThan(40);
    });
  });

  it('correctly calculates difficulty index from pass rate', () => {
    const sample = SAMPLE_PROJECT_ANALYTICS[0];
    const difficultyIndex = 100 - sample.passRate;
    expect(difficultyIndex).toBe(19);

    const wpExam = SAMPLE_PROJECT_ANALYTICS[1];
    expect(100 - wpExam.passRate).toBe(29);
  });

  it('persists and restores public analytics sharing states across courses', () => {
    const sharingSettings: Record<string, boolean> = {
      'proj_sec_101': true,
      'custom-focus-quiz': false,
    };

    localStorage.setItem(STORAGE_KEY_SHARING, JSON.stringify(sharingSettings));

    const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEY_SHARING)!);
    expect(retrieved['proj_sec_101']).toBe(true);
    expect(retrieved['custom-focus-quiz']).toBe(false);
  });

  it('persists and filters candidate question reports in triage', () => {
    const customReport: QuestionReport = {
      id: 'rep_test_999',
      project_id: 'proj_sec_101',
      question_id: 'q1',
      question_title: 'Minimum password length required?',
      report_type: 'bug',
      feedback_text: 'Option 16+ button was unresponsive on mobile iOS Safari.',
      user_identifier: 'test.candidate@example.com',
      status: 'open',
      created_at: '2026-10-27 12:00',
    };

    const updatedReports = [customReport];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updatedReports));

    const loaded: QuestionReport[] = loadStoredReports();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('rep_test_999');
    expect(loaded[0].report_type).toBe('bug');

    // Test resolving report
    const resolvedList = loaded.map((r) =>
      r.id === 'rep_test_999' ? { ...r, status: 'resolved' as const } : r
    );
    expect(resolvedList[0].status).toBe('resolved');
  });

  it('ensures curriculum projects and focus quizzes have compatible question schemas for telemetry', () => {
    const curriculumProjects = INITIAL_CATEGORIES.flatMap((c) => c.projects);
    expect(curriculumProjects.length).toBeGreaterThanOrEqual(3);

    const questionsWithQuiz = curriculumProjects
      .flatMap((p) => p.sections)
      .filter((s) => s.content_type === 'quiz')
      .flatMap((s) => s.questions || []);

    expect(questionsWithQuiz.length).toBeGreaterThanOrEqual(3);
    questionsWithQuiz.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.title).toBeDefined();
    });

    expect(SEEDED_FOCUS_QUIZZES.length).toBeGreaterThanOrEqual(3);
    const focusQuestions = SEEDED_FOCUS_QUIZZES.flatMap((q) => q.questions);
    expect(focusQuestions.length).toBeGreaterThanOrEqual(8);
    focusQuestions.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.title).toBeDefined();
      expect(q.type).toBeDefined();
    });
  });

  it('dynamically loads real courses from curriculum, focus quizzes, and job roles without mock courses', () => {
    const courses = loadDynamicCoursesRegistry();
    expect(courses.length).toBeGreaterThanOrEqual(5);

    // Verify it loads real curriculum projects
    const sec101 = courses.find((c) => c.projectId === 'proj_sec_101');
    expect(sec101).toBeDefined();
    expect(sec101?.sourceType).toBe('curriculum');
    expect(sec101?.questions.length).toBeGreaterThanOrEqual(2);

    // Verify it loads real focus quizzes
    const focusQuiz = courses.find((c) => c.projectId === 'custom-focus-quiz');
    expect(focusQuiz).toBeDefined();
    expect(focusQuiz?.sourceType).toBe('focus_quiz');
    expect(focusQuiz?.questions.length).toBeGreaterThanOrEqual(4);

    // Verify no fake mock courses are injected into active registry
    const fakeMockCourse = courses.find((c) => c.projectId === 'proj-onboarding-101');
    expect(fakeMockCourse).toBeUndefined();
  });

  it('computes clean zero baseline metrics when a course has zero candidate submissions', () => {
    const courses = loadDynamicCoursesRegistry();
    const course = courses[0];
    const emptySubmissions: QuizSubmissionRecord[] = [];

    const analytics = computeCourseAnalytics(course, emptySubmissions, true);
    expect(analytics.projectId).toBe(course.projectId);
    expect(analytics.totalCompleted).toBe(0);
    expect(analytics.totalFailed).toBe(0);
    expect(analytics.passRate).toBe(0);
    expect(analytics.authenticatedCount).toBe(0);
    expect(analytics.anonymousCount).toBe(0);

    // Every question should have 0 answers and 0% failure rate
    analytics.questions.forEach((q) => {
      expect(q.totalAnswers).toBe(0);
      expect(q.failureCount).toBe(0);
      expect(q.failureRate).toBe(0);
      expect(q.hasHighFailureAlert).toBe(false);
    });
  });

  it('computes real-time failure metrics and flags high failure alerts from candidate submissions', () => {
    const courses = loadDynamicCoursesRegistry();
    const course = courses.find((c) => c.projectId === 'custom-focus-quiz') || courses[0];
    const q1 = course.questions[0];
    const q2 = course.questions[1];

    // Create 3 submissions: 2 passed, 1 failed (where q2 was answered wrong by 2 candidates)
    const submissions: QuizSubmissionRecord[] = [
      {
        id: 'sub_1',
        quiz_id: course.projectId,
        candidate_email: 'candidate1@example.com',
        is_anonymous: false,
        score: 100,
        total: 100,
        percentage: 100,
        is_passed: true,
        wrong_question_ids: [],
        submitted_at: '2026-10-28T00:00:00Z',
      },
      {
        id: 'sub_2',
        quiz_id: course.projectId,
        candidate_email: 'candidate2@example.com',
        is_anonymous: false,
        score: 80,
        total: 100,
        percentage: 80,
        is_passed: true,
        wrong_question_ids: [q2.id],
        submitted_at: '2026-10-28T00:05:00Z',
      },
      {
        id: 'sub_3',
        quiz_id: course.projectId,
        candidate_email: 'anonymous_candidate',
        is_anonymous: true,
        score: 40,
        total: 100,
        percentage: 40,
        is_passed: false,
        wrong_question_ids: [q1.id, q2.id],
        submitted_at: '2026-10-28T00:10:00Z',
      },
    ];

    const analytics = computeCourseAnalytics(course, submissions, true);
    expect(analytics.totalCompleted).toBe(3);
    expect(analytics.totalFailed).toBe(1);
    expect(analytics.passRate).toBe(67); // 2 passed out of 3 = 66.67% -> 67%
    expect(analytics.authenticatedCount).toBe(2);
    expect(analytics.anonymousCount).toBe(1);

    // Q1 had 1 failure out of 3 -> 33% (normal)
    const q1Stat = analytics.questions.find((q) => q.id === q1.id)!;
    expect(q1Stat.totalAnswers).toBe(3);
    expect(q1Stat.failureCount).toBe(1);
    expect(q1Stat.failureRate).toBe(33);
    expect(q1Stat.hasHighFailureAlert).toBe(false);

    // Q2 had 2 failures out of 3 -> 67% (high failure alert >= 40%)
    const q2Stat = analytics.questions.find((q) => q.id === q2.id)!;
    expect(q2Stat.totalAnswers).toBe(3);
    expect(q2Stat.failureCount).toBe(2);
    expect(q2Stat.failureRate).toBe(67);
    expect(q2Stat.hasHighFailureAlert).toBe(true);
  });

  it('persists submissions and updates loadStoredSubmissions()', () => {
    expect(loadStoredSubmissions()).toHaveLength(0);

    const testSub: QuizSubmissionRecord = {
      id: 'sub_sim_100',
      quiz_id: 'proj_sec_101',
      candidate_email: 'marcus@techcorp.io',
      score: 100,
      total: 100,
      percentage: 100,
      is_passed: true,
      submitted_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify([testSub]));
    const loaded = loadStoredSubmissions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('sub_sim_100');
    expect(loaded[0].candidate_email).toBe('marcus@techcorp.io');
  });

  it('starts with an empty reports list when no reports are logged in storage', () => {
    // When clean localStorage, loadStoredReports should return [] rather than fake mock reports
    const stored = loadStoredReports();
    expect(stored).toHaveLength(0);
  });
});

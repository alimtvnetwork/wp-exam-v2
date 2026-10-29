import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeLiveStorageMetrics,
  formatBytes,
} from '@/components/admin/sqlite-status';
import { BUILTIN_PRESET_QUIZZES } from '@/quiz/store/quiz-registry';

describe('Dynamic Admin SQLite Storage Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatBytes helper', () => {
    it('formats bytes under 1KB with B suffix', () => {
      expect(formatBytes(500)).toBe('500 B');
    });

    it('formats bytes under 1MB with KB suffix', () => {
      expect(formatBytes(2048)).toBe('2.0 KB');
      expect(formatBytes(15360)).toBe('15.0 KB');
    });

    it('formats bytes 1MB and above with MB suffix', () => {
      expect(formatBytes(1048576)).toBe('1.00 MB');
      expect(formatBytes(2621440)).toBe('2.50 MB');
    });
  });

  describe('computeLiveStorageMetrics', () => {
    it('computes baseline metrics when storage is empty', () => {
      const metrics = computeLiveStorageMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalForms).toBeGreaterThanOrEqual(BUILTIN_PRESET_QUIZZES.length);
      expect(metrics.presetFormsCount).toBe(BUILTIN_PRESET_QUIZZES.length);
      expect(metrics.customFormsCount).toBe(0);
      expect(metrics.totalSubmissions).toBe(0);
      expect(metrics.totalInvites).toBe(0);
      expect(metrics.totalRoles).toBeGreaterThanOrEqual(5);
    });

    it('dynamically reflects custom quizzes and question counts', () => {
      const customQuiz = {
        id: 'custom-math-quiz',
        slug: 'custom-math-quiz',
        title: 'Custom Math Assessment',
        formType: 'quiz',
        questionCount: 3,
        totalPoints: 30,
        isCustom: true,
        updatedAt: '2026-10-28',
        model: {
          id: 'custom-math-quiz',
          title: 'Custom Math Assessment',
          formType: 'quiz',
          fields: [
            { id: 'q1', type: 'multiple_choice', label: '1 + 1?', points: 10 },
            { id: 'q2', type: 'multiple_choice', label: '2 + 2?', points: 10 },
            { id: 'q3', type: 'multiple_choice', label: '3 + 3?', points: 10 },
          ],
        },
      };

      localStorage.setItem('wp_exam_custom_quizzes', JSON.stringify([customQuiz]));

      const metrics = computeLiveStorageMetrics();

      expect(metrics.customFormsCount).toBe(1);
      expect(metrics.totalForms).toBe(BUILTIN_PRESET_QUIZZES.length + 1);
      expect(metrics.totalQuestions).toBeGreaterThanOrEqual(3);
    });

    it('dynamically calculates submissions, pass rates and average score', () => {
      const mockSubmissions = [
        { id: 'sub_1', percentage: 90, is_passed: true },
        { id: 'sub_2', percentage: 50, is_passed: false },
        { id: 'sub_3', percentage: 70, is_passed: true },
      ];

      localStorage.setItem('wp_exam_quiz_submissions', JSON.stringify(mockSubmissions));

      const metrics = computeLiveStorageMetrics();

      expect(metrics.totalSubmissions).toBe(3);
      expect(metrics.passedSubmissions).toBe(2);
      expect(metrics.averageScorePercentage).toBe(70);
    });

    it('dynamically aggregates candidate invites by status', () => {
      const mockInvites = [
        { token: 't1', email: 'a@test.com', status: 'pending' },
        { token: 't2', email: 'b@test.com', status: 'pending' },
        { token: 't3', email: 'c@test.com', status: 'accepted' },
        { token: 't4', email: 'd@test.com', status: 'expired' },
      ];

      localStorage.setItem('wp_exam_candidate_invites', JSON.stringify(mockInvites));

      const metrics = computeLiveStorageMetrics();

      expect(metrics.totalInvites).toBe(4);
      expect(metrics.pendingInvites).toBe(2);
      expect(metrics.acceptedInvites).toBe(1);
      expect(metrics.expiredInvites).toBe(1);
    });

    it('calculates storage footprint across wp_exam_ local storage keys', () => {
      localStorage.setItem('wp_exam_test_payload', JSON.stringify({ hello: 'world' }));

      const metrics = computeLiveStorageMetrics();

      expect(metrics.storageFootprintBytes).toBeGreaterThan(0);
      expect(metrics.storageFootprintFormatted).toMatch(/B|KB|MB/);
    });
  });
});

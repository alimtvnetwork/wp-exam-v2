import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getJobRoles,
  getJobRoleById,
  saveJobRole,
  deleteJobRole,
  getCustomJobRoles,
  persistJobRoleToServer,
  deleteJobRoleFromServer,
  SEEDED_JOB_ROLES,
  JobRole,
} from '@/lib/role-assignments';

describe('Role Assignments & Two-Tier Quizzing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default seeded roles with Phase 1 and Phase 2 questions', () => {
    const roles = getJobRoles();
    const hasRoles = roles.length >= 5;

    expect(hasRoles).toBe(true);

    const feRole = roles.find((r) => r.id === 'frontend-developer');
    expect(feRole).toBeDefined();
    expect(feRole?.firstPhaseQuestion.question).toContain('memoize');
    expect(feRole?.firstPhaseQuestion.options.length).toBeGreaterThanOrEqual(2);
    expect(feRole?.secondPhaseQuestions.length).toBeGreaterThanOrEqual(2);
  });

  it('looks up role by id and falls back gracefully for unknown roles', () => {
    const wpRole = getJobRoleById('wordpress-specialist');
    expect(wpRole.id).toBe('wordpress-specialist');
    expect(wpRole.title).toContain('WordPress');

    const fallbackRole = getJobRoleById('unknown-role-xyz');
    expect(fallbackRole).toBeDefined();
    expect(fallbackRole.id).toBe(SEEDED_JOB_ROLES[0].id);
  });

  it('persists a new custom role with custom screening and assessment questions', () => {
    const customRole: JobRole = {
      id: 'qa-engineer',
      title: 'QA Automation Engineer',
      department: 'Quality Assurance',
      type: 'Full-Time',
      description: 'End-to-end automation with Vitest and Playwright.',
      isCustom: true,
      firstPhaseQuestion: {
        question: 'Which test runner offers instant native Vite integration and ESM support?',
        hint: 'Think of the runner designed specifically as a drop-in Jest alternative for Vite.',
        briefingNotes: ['Automated regression prevention.', 'Mocking and test isolation.'],
        options: [
          { val: 'vitest', label: 'Vitest' },
          { val: 'manual-clicks', label: 'Manual spreadsheet tracking' },
        ],
        correctAnswer: 'vitest',
      },
      secondPhaseQuestions: [
        {
          id: 'qa_q1',
          question: 'What is the purpose of test fixture isolation?',
          options: ['Prevents state leak between test executions', 'Slows down runner execution'],
          correctAnswer: 'Prevents state leak between test executions',
          explanation: 'Fixture isolation ensures tests run independently.',
        },
      ],
    };

    saveJobRole(customRole);

    const rolesAfterSave = getJobRoles();
    const found = rolesAfterSave.find((r) => r.id === 'qa-engineer');
    expect(found).toBeDefined();
    expect(found?.title).toBe('QA Automation Engineer');
    expect(found?.firstPhaseQuestion.correctAnswer).toBe('vitest');

    deleteJobRole('qa-engineer');
    const rolesAfterDelete = getJobRoles();
    const foundAfterDelete = rolesAfterDelete.find((r) => r.id === 'qa-engineer');
    expect(foundAfterDelete).toBeUndefined();
  });

  describe('Gap 4: Server SQLite Synchronization for Job Roles & MCQs', () => {
    it('retrieves isolated custom job roles list with getCustomJobRoles', () => {
      const initialCustom = getCustomJobRoles();
      expect(initialCustom).toEqual([]);

      const mockRole: JobRole = {
        id: 'ai-prompt-engineer',
        title: 'AI Prompt Engineer',
        department: 'AI',
        type: 'Full-Time',
        description: 'Design robust system prompts.',
        durationMinutes: 45,
        isCustom: true,
        firstPhaseQuestion: {
          question: 'Test Q',
          hint: 'Hint',
          briefingNotes: [],
          options: [{ val: '1', label: 'One' }],
          correctAnswer: '1',
        },
        secondPhaseQuestions: [],
      };

      saveJobRole(mockRole);
      const customList = getCustomJobRoles();
      expect(customList.length).toBe(1);
      expect(customList[0].id).toBe('ai-prompt-engineer');
      expect(customList[0].durationMinutes).toBe(45);
    });

    it('persists role to server and updates local cache simultaneously', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', data: { roles: [] } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const role: JobRole = {
        id: 'cloud-architect',
        title: 'Cloud Architect',
        department: 'Infrastructure',
        type: 'Full-Time',
        description: 'Architect multi-region topologies.',
        durationMinutes: 60,
        isCustom: true,
        firstPhaseQuestion: {
          question: 'Cloud Q',
          hint: 'Cloud Hint',
          briefingNotes: [],
          options: [{ val: 'a', label: 'AWS' }],
          correctAnswer: 'a',
        },
        secondPhaseQuestions: [],
      };

      await persistJobRoleToServer(role);

      const resolved = getJobRoleById('cloud-architect');
      expect(resolved).toBeDefined();
      expect(resolved.title).toBe('Cloud Architect');
      expect(resolved.durationMinutes).toBe(60);

      await deleteJobRoleFromServer('cloud-architect');
      const resolvedAfterDelete = getJobRoleById('cloud-architect');
      // Should fall back to seeded role when deleted
      expect(resolvedAfterDelete.id).toBe(SEEDED_JOB_ROLES[0].id);

      vi.unstubAllGlobals();
    });
  });
});

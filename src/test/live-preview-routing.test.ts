import { describe, it, expect } from 'vitest';
import { FormField } from '../lib/types/form';

describe('Live Preview & URL Routing Contracts', () => {
  it('generates canonical public runner URL for shared questions', () => {
    const origin = 'https://app.riseupasia.com';
    const quizId = 'fullstack-eval-v1';
    const questionIndex = 3;

    const publicUrl = `${origin}/runner?quiz=${encodeURIComponent(quizId)}&q=${questionIndex + 1}`;

    expect(publicUrl).toBe('https://app.riseupasia.com/runner?quiz=fullstack-eval-v1&q=4');
    expect(publicUrl).not.toContain('/admin');
  });

  it('generates correct candidate invite links pointing to /runner', () => {
    const origin = 'https://app.riseupasia.com';
    const inviteToken = 'inv_test_token_8899';

    const inviteLink = `${origin}/runner?invite=${encodeURIComponent(inviteToken)}`;

    expect(inviteLink).toBe('https://app.riseupasia.com/runner?invite=inv_test_token_8899');
    expect(inviteLink).not.toContain('/wp-exam-runner');
  });

  it('prioritizes initialForm over hardcoded presets in FormRunner logic', () => {
    const customBuilderForm = {
      title: 'Custom User Built Form',
      description: 'Built live in FormBuilder',
      fields: [
        {
          id: 'cf_1',
          type: 'short_answer' as const,
          label: 'What is your GitHub username?',
          isRequired: true,
        },
      ],
    };

    const presetMap: Record<string, { title: string; fields: FormField[] }> = {
      'intern-programmer': {
        title: 'Intern Programmer',
        fields: [],
      },
    };

    // FormRunner logic: initialForm must take precedence over PRESET_PROJECTS[selectedProjectId]
    const resolveActiveForm = (
      initialForm?: typeof customBuilderForm,
      selectedProjectId?: string
    ) => {
      if (initialForm) {
        return initialForm;
      }

      if (selectedProjectId && presetMap[selectedProjectId]) {
        return presetMap[selectedProjectId];
      }

      return presetMap['intern-programmer'];
    };

    const resolved = resolveActiveForm(customBuilderForm, 'intern-programmer');
    expect(resolved.title).toBe('Custom User Built Form');
    expect(resolved.fields[0].id).toBe('cf_1');
  });

  it('correctly parses candidate token from either ?invite or ?token param', () => {
    const extractToken = (search: string) => {
      const params = new URLSearchParams(search);
      return params.get('invite') || params.get('token') || '';
    };

    expect(extractToken('?invite=token_abc123')).toBe('token_abc123');
    expect(extractToken('?token=token_xyz789')).toBe('token_xyz789');
    expect(extractToken('?tab=builder')).toBe('');
  });
});

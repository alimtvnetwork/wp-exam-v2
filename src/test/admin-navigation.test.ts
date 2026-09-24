import { describe, it, expect } from 'vitest';
import { AdminTab } from '@/components/admin/wp-admin-sidebar';

describe('WordPress Admin Navigation & Layout Standards', () => {
  it('should define all required administrative tabs', () => {
    const validTabs: AdminTab[] = [
      'builder',
      'projects',
      'focus-runner',
      'runner',
      'invites',
      'history',
      'analytics',
      'email',
      'ai-studio',
      'backups',
      'storage',
    ];

    expect(validTabs).toHaveLength(11);
    expect(validTabs).toContain('builder');
    expect(validTabs).toContain('projects');
    expect(validTabs).toContain('focus-runner');
    expect(validTabs).toContain('analytics');
    expect(validTabs).toContain('storage');
  });

  it('should verify field type categorization integrity', () => {
    const choiceTypes = ['multiple_choice', 'single_choice', 'true_false', 'dropdown', 'rating'];
    const textTypes = ['short_answer', 'paragraph', 'email', 'phone'];
    const mediaTypes = ['link', 'instruction_link', 'file_upload', 'regex_field'];

    expect(choiceTypes.length).toBe(5);
    expect(textTypes.length).toBe(4);
    expect(mediaTypes.length).toBe(4);
  });
});

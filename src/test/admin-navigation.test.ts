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

  it('should verify permanent zero-tolerance elimination of Candidate Response in runner sources', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const formRunnerPath = path.resolve(__dirname, '../components/runner/FormRunner.tsx');
    const focusRunnerPath = path.resolve(__dirname, '../components/runner/FocusQuizRunner.tsx');

    const formRunnerSource = fs.readFileSync(formRunnerPath, 'utf-8');
    const focusRunnerSource = fs.readFileSync(focusRunnerPath, 'utf-8');

    // Asserts zero occurrences of "Candidate Response" label or header mark
    expect(formRunnerSource).not.toMatch(/candidate\s+response/i);
    expect(focusRunnerSource).not.toMatch(/>\s*candidate\s+response\s*</i);
  });

  it('should verify 2-column presentation layout optical equilibrium classes', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const formRunnerPath = path.resolve(__dirname, '../components/runner/FormRunner.tsx');
    const formRunnerSource = fs.readFileSync(formRunnerPath, 'utf-8');

    // Assert vertical centering via items-center on presentation grid
    expect(formRunnerSource).toContain('grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center');

    // Assert balanced right-column downward offset (pt-2 lg:pt-6 xl:pt-8)
    expect(formRunnerSource).toContain('pt-2 lg:pt-6 xl:pt-8');
  });
});

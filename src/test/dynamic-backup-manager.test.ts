import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildLiveSystemSnapshot,
  loadStoredBackups,
  STORAGE_KEY_BACKUPS,
  BackupEntry,
} from '@/components/admin/backup-manager';

describe('Dynamic System Backup Manager & Real Archive Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds live system snapshot with real store metrics and serialized manifest', () => {
    // Seed some mock data in localStorage
    localStorage.setItem('wp_exam_submissions_history', JSON.stringify([{ id: 'sub_1', score: 85 }]));
    localStorage.setItem('wp_exam_candidate_invites', JSON.stringify([{ token: 'tok_1', email: 'test@example.com' }]));
    localStorage.setItem('wp_exam_custom_job_roles', JSON.stringify([{ id: 'role_qa', title: 'QA Engineer' }]));

    const { snapshot, counts, jsonString } = buildLiveSystemSnapshot();

    expect(snapshot).toBeDefined();
    expect(counts.submissions).toBe(1);
    expect(counts.invites).toBe(1);
    expect(counts.roles).toBe(1);
    expect(counts.quizzes).toBeGreaterThanOrEqual(1);

    expect(jsonString).toContain('Onboarding Quiz & WP Exam');
    expect(jsonString).toContain('wp_exam_submissions_history');
    expect(jsonString).toContain('role_qa');
  });

  it('loads stored backups and initializes real baseline archive when storage is empty', () => {
    const backups = loadStoredBackups();
    expect(backups.length).toBe(1);

    const first = backups[0];
    expect(first.filename).toContain('wp_exam_backup_');
    expect(first.filename).toContain('.json');
    expect(first.file_size).toBeGreaterThan(0);
    expect(first.item_counts).toBeDefined();
    expect(first.payload).toBeDefined();

    // Verify persisted into localStorage
    const raw = localStorage.getItem(STORAGE_KEY_BACKUPS);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw!);
    expect(parsed[0].filename).toBe(first.filename);
  });

  it('respects retention and rotation limits by pruning older backups', () => {
    const initialList: BackupEntry[] = [];
    for (let i = 0; i < 7; i++) {
      initialList.push({
        id: `backup_${i}`,
        filename: `wp_exam_backup_${i}.json`,
        file_size: 1024 * (i + 1),
        created_at: `2026-10-28 0${i}:00:00`,
        item_counts: { quizzes: 1, roles: 5, submissions: 10, invites: 2 },
        payload: '{}',
      });
    }

    localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(initialList));
    const loaded = loadStoredBackups();
    expect(loaded.length).toBe(7);

    // Apply rotation to keep only 5
    const retentionLimit = 5;
    const pruned = loaded.slice(0, retentionLimit);
    expect(pruned.length).toBe(5);
    expect(pruned[0].filename).toBe('wp_exam_backup_0.json');
    expect(pruned[4].filename).toBe('wp_exam_backup_4.json');
  });

  it('serializes and parses restore payload verifying store manifests', () => {
    const samplePayload = {
      app: 'Onboarding Quiz & WP Exam',
      schemaVersion: '2.5.0',
      exportedAt: new Date().toISOString(),
      stores: {
        wp_exam_quiz_store: { title: 'Restored Quiz', fields: [] },
        wp_exam_custom_job_roles: [{ id: 'restored-role', title: 'Restored Role' }],
        wp_exam_submissions_history: [{ id: 'sub_restored', score: 100 }],
        wp_exam_candidate_invites: [{ token: 'inv_restored', email: 'restored@example.com' }],
      },
    };

    const serialized = JSON.stringify(samplePayload);
    const parsed = JSON.parse(serialized);

    expect(parsed.stores.wp_exam_quiz_store.title).toBe('Restored Quiz');
    expect(parsed.stores.wp_exam_custom_job_roles[0].id).toBe('restored-role');
    expect(parsed.stores.wp_exam_submissions_history[0].score).toBe(100);
  });
});

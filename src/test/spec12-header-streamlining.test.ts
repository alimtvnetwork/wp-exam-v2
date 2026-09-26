import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '../quiz/store/useQuizStore';
import { auditFormDesign } from '../lib/design-validation-engine';

describe('Spec 12: Header Streamlining, Form Access & Health Score Auditing', () => {
  beforeEach(() => {
    useQuizStore.getState().resetForm();
  });

  it('should support form access types in store configuration', () => {
    const { setFormAccess } = useQuizStore.getState();

    setFormAccess('public');
    expect(useQuizStore.getState().formAccess).toBe('public');

    setFormAccess('authenticated');
    expect(useQuizStore.getState().formAccess).toBe('authenticated');
  });

  it('should compute design health score and grade for hover card', () => {
    const fields = [
      {
        id: 'q1',
        type: 'multiple_choice' as const,
        label: 'What is the primary benefit of Split-DB architecture?',
        isRequired: true,
        options: ['Performance & Sharding', 'Higher latency', 'None'],
        correctAnswer: 'Performance & Sharding',
        points: 10,
      },
      {
        id: 'q2',
        type: 'true_false' as const,
        label: 'WAL mode allows concurrent readers and writers in SQLite.',
        isRequired: true,
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
      },
    ];

    const report = auditFormDesign(fields, 'quiz');

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(['A+', 'A', 'B']).toContain(report.grade);
    expect(Array.isArray(report.issues)).toBe(true);
  });

  it('should penalize health score for missing options or questions', () => {
    const emptyFields: any[] = [];
    const report = auditFormDesign(emptyFields, 'quiz');

    expect(report.score).toBeLessThan(100);
    expect(report.issues.length).toBeGreaterThan(0);
  });
});

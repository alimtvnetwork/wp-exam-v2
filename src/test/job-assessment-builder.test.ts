import { describe, it, expect, beforeEach } from 'vitest';
import {
  getJobRoles,
  saveJobRole,
  JobRole,
  AssessmentQuizQuestion,
} from '@/lib/role-assignments';

describe('Job Assessment Builder & Enhanced Two-Column Quizzing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes role with default assessment questions and metadata', () => {
    const roles = getJobRoles();
    const role = roles.find((r) => r.id === 'frontend-developer');
    expect(role).toBeDefined();

    const questions = role?.secondPhaseQuestions || [];
    const hasQuestions = questions.length >= 2;
    expect(hasQuestions).toBe(true);

    const firstQ = questions[0];
    expect(firstQ.question).toBeDefined();
    expect(firstQ.type).toBeDefined();
    expect(firstQ.options).toBeDefined();
    expect(firstQ.correctAnswer).toBeDefined();
  });

  it('supports adding and persisting polymorphic question types with points and required flags', () => {
    const customRole: JobRole = {
      id: 'fullstack-lead',
      title: 'Fullstack Tech Lead',
      department: 'Engineering',
      type: 'Full-Time',
      description: 'System design and multi-tier application architecture.',
      durationMinutes: 45,
      passThresholdPercent: 80,
      isCustom: true,
      firstPhaseQuestion: {
        question: 'Which isolation level prevents phantom reads in SQL?',
        hint: 'Serializable.',
        briefingNotes: ['ACID compliance.'],
        options: [
          { val: 'serializable', label: 'Serializable' },
          { val: 'read-uncommitted', label: 'Read Uncommitted' },
        ],
        correctAnswer: 'serializable',
      },
      secondPhaseQuestions: [
        {
          id: 'q_mcq_1',
          question: 'What is the primary trade-off of optimistic concurrency control?',
          type: 'mcq',
          points: 15,
          isRequired: true,
          options: ['Higher throughput under low contention', 'Deadlocks during reads'],
          correctAnswer: 'Higher throughput under low contention',
          explanation: 'Optimistic locking assumes conflict is rare and validates on commit.',
        },
        {
          id: 'q_media_1',
          question: 'Analyze the system topology diagram and identify the single point of failure.',
          type: 'media_mcq',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
          points: 20,
          isRequired: true,
          options: ['Primary Ingress Gateway', 'Stateless Replica 2'],
          correctAnswer: 'Primary Ingress Gateway',
          explanation: 'The ingress gateway lacks active-passive HA failover.',
        },
        {
          id: 'q_written_1',
          question: 'Describe your database migration strategy for zero-downtime column renames.',
          type: 'text_open',
          points: 25,
          isRequired: true,
          placeholder: 'Explain dual-write phase, backfill, and cutover...',
          maxWordCount: 350,
          explanation: 'Evaluates expand-and-contract schema migration expertise.',
        },
      ],
    };

    saveJobRole(customRole);

    const saved = getJobRoles().find((r) => r.id === 'fullstack-lead');
    expect(saved).toBeDefined();
    expect(saved?.durationMinutes).toBe(45);
    expect(saved?.passThresholdPercent).toBe(80);

    const qList = saved?.secondPhaseQuestions || [];
    expect(qList).toHaveLength(3);

    // MCQ Verification
    expect(qList[0].points).toBe(15);
    expect(qList[0].isRequired).toBe(true);
    expect(qList[0].correctAnswer).toBe('Higher throughput under low contention');

    // Media MCQ Verification
    expect(qList[1].type).toBe('media_mcq');
    expect(qList[1].mediaType).toBe('image');
    expect(qList[1].mediaUrl).toContain('unsplash');
    expect(qList[1].points).toBe(20);

    // Written Response Verification
    expect(qList[2].type).toBe('text_open');
    expect(qList[2].maxWordCount).toBe(350);
    expect(qList[2].points).toBe(25);
  });

  it('supports duplicating questions with deep copy and distinct IDs', () => {
    const roles = getJobRoles();
    const role = roles.find((r) => r.id === 'frontend-developer')!;
    const originalQ = role.secondPhaseQuestions[0];

    const duplicated: AssessmentQuizQuestion = {
      ...originalQ,
      id: `copy_${Date.now()}`,
      question: `${originalQ.question} (Copy)`,
      options: originalQ.options ? [...originalQ.options] : undefined,
    };

    const updatedRole: JobRole = {
      ...role,
      secondPhaseQuestions: [originalQ, duplicated, ...role.secondPhaseQuestions.slice(1)],
      isCustom: true,
    };

    saveJobRole(updatedRole);

    const persisted = getJobRoles().find((r) => r.id === 'frontend-developer')!;
    expect(persisted.secondPhaseQuestions).toHaveLength(role.secondPhaseQuestions.length + 1);
    expect(persisted.secondPhaseQuestions[1].question).toContain('(Copy)');
    expect(persisted.secondPhaseQuestions[1].id).not.toBe(originalQ.id);
  });

  it('supports reordering questions seamlessly', () => {
    const roles = getJobRoles();
    const role = roles.find((r) => r.id === 'frontend-developer')!;
    const firstId = role.secondPhaseQuestions[0].id;
    const secondId = role.secondPhaseQuestions[1].id;

    // Swap position 0 and 1
    const reorderedList = [...role.secondPhaseQuestions];
    const temp = reorderedList[0];
    reorderedList[0] = reorderedList[1];
    reorderedList[1] = temp;

    const updatedRole: JobRole = {
      ...role,
      secondPhaseQuestions: reorderedList,
      isCustom: true,
    };

    saveJobRole(updatedRole);

    const persisted = getJobRoles().find((r) => r.id === 'frontend-developer')!;
    expect(persisted.secondPhaseQuestions[0].id).toBe(secondId);
    expect(persisted.secondPhaseQuestions[1].id).toBe(firstId);
  });

  it('calculates total assessment scoring points and passing thresholds correctly', () => {
    const questions: AssessmentQuizQuestion[] = [
      { id: 'q1', question: 'Q1', points: 10, correctAnswer: 'A', options: ['A', 'B'] },
      { id: 'q2', question: 'Q2', points: 20, correctAnswer: 'B', options: ['A', 'B'] },
      { id: 'q3', question: 'Q3', points: 30, correctAnswer: 'A', options: ['A', 'B'] },
    ];

    const totalPoints = questions.reduce((acc, q) => acc + (q.points || 10), 0);
    expect(totalPoints).toBe(60);

    // Simulate candidate answering Q1 & Q2 correctly, Q3 wrong
    const candidateAnswers: Record<string, string> = {
      q1: 'A',
      q2: 'B',
      q3: 'B',
    };

    let earned = 0;
    questions.forEach((q) => {
      const isCorrect = candidateAnswers[q.id] === q.correctAnswer;
      if (isCorrect) {
        earned += (q.points || 10);
      }
    });

    expect(earned).toBe(30); // 10 + 20
    const percent = Math.round((earned / totalPoints) * 100);
    expect(percent).toBe(50);

    const threshold = 75;
    const isPassed = percent >= threshold;
    expect(isPassed).toBe(false);

    // Candidate answering all correctly
    candidateAnswers.q3 = 'A';
    let fullScore = 0;
    questions.forEach((q) => {
      const isCorrect = candidateAnswers[q.id] === q.correctAnswer;
      if (isCorrect) {
        fullScore += (q.points || 10);
      }
    });
    const fullPercent = Math.round((fullScore / totalPoints) * 100);
    expect(fullPercent).toBe(100);
    expect(fullPercent >= threshold).toBe(true);
  });
});

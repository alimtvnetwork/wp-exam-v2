import { create } from 'zustand';
import type { FormModel } from '@/lib/types/form';

export interface UserInviteRecord {
  id: number;
  email: string;
  role: string;
  invite_token: string;
  status: 'pending' | 'accepted' | 'completed';
  form_id?: number;
  created_at: string;
}

export interface SubmissionAnswer {
  question: string;
  answer: string;
  correct: string;
  isCorrect: boolean;
}

export interface SubmissionHistoryRecord {
  id: number;
  form_title: string;
  form_type: string;
  respondent_name: string;
  respondent_email: string;
  score: number;
  total_score: number;
  score_percentage: number;
  is_passed: boolean;
  submitted_at: string;
  answers: SubmissionAnswer[];
}

export interface RunnerSession {
  token: string | null;
  role: 'public' | 'subscriber' | 'contributor' | 'editor' | 'administrator';
  respondentEmail: string;
  respondentName: string;
  isAuthenticated: boolean;
}

export interface ChecklistItemRecord {
  id: number;
  invite_token: string;
  title: string;
  kind: 'quiz' | 'exam' | 'project';
  status: 'pending' | 'in_progress' | 'completed';
  due_at: string;
  invite_url: string;
}

interface ExamAppState {
  invites: UserInviteRecord[];
  submissions: SubmissionHistoryRecord[];
  session: RunnerSession;
  conditionalFixtures: ConditionalStepFixture[];
  checklistItems: ChecklistItemRecord[];

  // Invites actions
  addInvite: (invite: Omit<UserInviteRecord, 'id' | 'created_at'>) => UserInviteRecord;
  revokeInvite: (id: number) => void;
  markInviteCompleted: (token: string) => void;
  getInviteByToken: (token: string) => UserInviteRecord | undefined;

  // History actions
  addSubmission: (record: Omit<SubmissionHistoryRecord, 'id' | 'submitted_at'>) => SubmissionHistoryRecord;

  // Session / Authentication actions
  authenticateWithToken: (token: string) => boolean;
  authenticateAsRole: (role: RunnerSession['role'], name: string, email: string) => void;
  clearSession: () => void;
}

const seedInvites: UserInviteRecord[] = [
  {
    id: 1,
    email: 'alex.candidate@company.org',
    role: 'subscriber',
    invite_token: 'a9f1c4e72b83',
    status: 'pending',
    created_at: '2026-09-18 10:15',
  },
  {
    id: 2,
    email: 'sarah.engineer@company.org',
    role: 'contributor',
    invite_token: '7b2e9d41a580',
    status: 'accepted',
    created_at: '2026-09-17 14:30',
  },
];

const seedSubmissions: SubmissionHistoryRecord[] = [
  {
    id: 101,
    form_title: 'JavaScript & React Developer Assessment',
    form_type: 'quiz',
    respondent_name: 'David Miller',
    respondent_email: 'david.miller@candidate.io',
    score: 90,
    total_score: 100,
    score_percentage: 90,
    is_passed: true,
    submitted_at: '2026-09-18 11:20',
    answers: [
      { question: 'What does HTML stand for?', answer: 'HyperText Markup Language', correct: 'HyperText Markup Language', isCorrect: true },
      { question: 'CSS is used for structuring webpage content.', answer: 'False', correct: 'False', isCorrect: true },
    ],
  },
  {
    id: 102,
    form_title: 'Engineering Onboarding Sign-Up',
    form_type: 'employee_signup',
    respondent_name: 'Elena Rostova',
    respondent_email: 'elena.rostova@company.org',
    score: 100,
    total_score: 100,
    score_percentage: 100,
    is_passed: true,
    submitted_at: '2026-09-17 16:45',
    answers: [
      { question: 'Full Legal Name', answer: 'Elena Rostova', correct: '', isCorrect: true },
      { question: 'Company Email', answer: 'elena.rostova@company.org', correct: '', isCorrect: true },
    ],
  },
  {
    id: 103,
    form_title: 'WordPress Core Architecture Exam',
    form_type: 'quiz',
    respondent_name: 'Marcus Vance',
    respondent_email: 'marcus.v@dev.net',
    score: 55,
    total_score: 100,
    score_percentage: 55,
    is_passed: false,
    submitted_at: '2026-09-16 09:12',
    answers: [
      { question: 'What does HTML stand for?', answer: 'Hyperlink Text Section', correct: 'HyperText Markup Language', isCorrect: false },
    ],
  },
];

const defaultSession: RunnerSession = {
  token: null,
  role: 'public',
  respondentEmail: '',
  respondentName: '',
  isAuthenticated: false,
};

/**
 * Demo checklist items for the token-scoped candidate checklist dashboard
 * (spec 05). One invite with mixed statuses plus a due-soon item for the
 * WP-Cron reminder path. The due-soon date is relative to the seed date
 * 2026-10-17 (within 48h). No credentials, tokens, or secrets.
 */
const seedChecklistItems: ChecklistItemRecord[] = [
  {
    id: 1,
    invite_token: 'a9f1c4e72b83',
    title: 'Engineering Onboarding Quiz',
    kind: 'quiz',
    status: 'pending',
    due_at: '2026-10-24 17:00',
    invite_url: '/wp-exam-runner/?invite=a9f1c4e72b83',
  },
  {
    id: 2,
    invite_token: 'a9f1c4e72b83',
    title: 'Workplace Safety Exam',
    kind: 'exam',
    status: 'in_progress',
    due_at: '2026-10-22 12:00',
    invite_url: '/wp-exam-runner/?invite=a9f1c4e72b83',
  },
  {
    id: 3,
    invite_token: 'a9f1c4e72b83',
    title: 'Portfolio Project Submission',
    kind: 'project',
    status: 'completed',
    due_at: '2026-10-15 09:00',
    invite_url: '/wp-exam-runner/?invite=a9f1c4e72b83',
  },
  {
    id: 4,
    invite_token: 'a9f1c4e72b83',
    title: 'Data Privacy Refresher',
    kind: 'quiz',
    status: 'pending',
    due_at: '2026-10-19 09:00',
    invite_url: '/wp-exam-runner/?invite=a9f1c4e72b83',
  },
];

export interface ConditionalStepFixture {
  slug: string;
  form: FormModel;
}

/**
 * Plain-data fixtures for previewing conditional steps, the branch-map
 * strip, and Dracula/Riseup theme states. No credentials, tokens, or
 * secrets — safe to ship as seed data.
 */
export const seedConditionalFixtures: ConditionalStepFixture[] = [
  {
    slug: 'branching-onboarding',
    form: {
      id: 'branching-onboarding',
      title: 'Engineering Onboarding — Branching Demo',
      description: 'Conditional-step fixture: the Role answer routes engineers, designers, and everyone else down different tracks.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        passingScore: 70,
        successMessage: 'Onboarding track complete.',
        theme: 'dracula',
      },
      fields: [
        {
          id: 'ob-name',
          type: 'short_answer',
          label: 'What is your full name?',
          isRequired: true,
        },
        {
          id: 'ob-role',
          type: 'multiple_choice',
          label: 'Role',
          isRequired: true,
          options: ['Engineer', 'Designer', 'Other'],
          conditions: [
            { parentFieldId: 'ob-role', operator: 'equals', expectedValue: 'Engineer', action: 'jump_to', jumpToFieldId: 'ob-engineer-track' },
            { parentFieldId: 'ob-role', operator: 'equals', expectedValue: 'Designer', action: 'jump_to', jumpToFieldId: 'ob-designer-track' },
            { parentFieldId: 'ob-role', operator: 'equals', expectedValue: 'Other', action: 'jump_to', jumpToFieldId: 'ob-general-track' },
          ],
        },
        {
          id: 'ob-engineer-track',
          type: 'multiple_choice',
          label: 'Engineering track: which stack will you primarily work in?',
          isRequired: true,
          options: ['TypeScript / React', 'Go services', 'WordPress / PHP'],
          points: 10,
          conditions: [
            { parentFieldId: 'ob-engineer-track', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'ob-general-track' },
          ],
        },
        {
          id: 'ob-designer-track',
          type: 'multiple_choice',
          label: 'Design track: which tool is your daily driver?',
          isRequired: true,
          options: ['Figma', 'Penpot', 'Illustrator'],
          points: 10,
          conditions: [
            { parentFieldId: 'ob-designer-track', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'ob-general-track' },
          ],
        },
        {
          id: 'ob-general-track',
          type: 'paragraph',
          label: 'General track: tell us what you would like to learn first.',
          isRequired: false,
        },
      ],
    },
  },
  {
    slug: 'branching-cycle-guard',
    form: {
      id: 'branching-cycle-guard',
      title: 'Cycle Guard — Deliberately Cyclic Fixture',
      description: 'Negative fixture: two steps jump to each other. Consumed only by validateConditionalFixture, never rendered.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: false,
      settings: {
        theme: 'riseup',
      },
      fields: [
        {
          id: 'cg-a',
          type: 'multiple_choice',
          label: 'Cycle guard A: pick an option to jump forward.',
          isRequired: true,
          options: ['A'],
          conditions: [
            { parentFieldId: 'cg-a', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'cg-b' },
          ],
        },
        {
          id: 'cg-b',
          type: 'multiple_choice',
          label: 'Cycle guard B: pick an option to jump back.',
          isRequired: true,
          options: ['B'],
          conditions: [
            { parentFieldId: 'cg-b', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'cg-a' },
          ],
        },
      ],
    },
  },
  {
    slug: 'conditional-visibility-demo',
    form: {
      id: 'conditional-visibility-demo',
      title: 'Conditional Visibility Demo',
      description: 'Field-level visibility fixture: the long-text field only appears when the updates checkbox is selected.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        passingScore: 70,
        successMessage: 'Visibility demo complete.',
        theme: 'dracula',
      },
      fields: [
        {
          id: 'cv-notify',
          type: 'multiple_choice',
          label: 'How should we reach you about new quizzes?',
          isRequired: true,
          options: ['Yes, send me updates', 'No thanks'],
        },
        {
          id: 'cv-topics',
          type: 'paragraph',
          label: 'Which topics interest you most?',
          isRequired: false,
          conditions: [
            { parentFieldId: 'cv-notify', operator: 'contains', expectedValue: 'Yes, send me updates', action: 'show' },
          ],
        },
      ],
    },
  },
  {
    slug: 'simulation-showcase',
    form: {
      id: 'simulation-showcase',
      title: 'Simulation Showcase — Nested Conditional Sections',
      description: 'Complex conditional fixture: track routing, a multi-select contains rule, a visibility rule nested inside a jump-rule branch, and a terminal dead-end guard step.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        passingScore: 70,
        successMessage: 'Simulation showcase complete.',
        theme: 'dracula',
      },
      fields: [
        {
          id: 'ss-track',
          type: 'multiple_choice',
          label: 'Section 1 of 4 — pick your simulation track.',
          isRequired: true,
          options: ['Engineering', 'Design'],
          conditions: [
            { parentFieldId: 'ss-track', operator: 'equals', expectedValue: 'Engineering', action: 'jump_to', jumpToFieldId: 'ss-eng-stack' },
            { parentFieldId: 'ss-track', operator: 'equals', expectedValue: 'Design', action: 'jump_to', jumpToFieldId: 'ss-design-stack' },
          ],
        },
        {
          id: 'ss-eng-stack',
          type: 'multiple_choice',
          label: 'Section 2 of 4 — which engineering stack will you explore?',
          isRequired: true,
          options: ['TypeScript / React', 'Go services'],
          points: 10,
          conditions: [
            { parentFieldId: 'ss-eng-stack', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'ss-skills' },
          ],
        },
        {
          id: 'ss-design-stack',
          type: 'multiple_choice',
          label: 'Section 2 of 4 — which design discipline will you explore?',
          isRequired: true,
          options: ['Product design', 'Motion design'],
          points: 10,
          conditions: [
            { parentFieldId: 'ss-design-stack', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'ss-skills' },
          ],
        },
        {
          id: 'ss-skills',
          type: 'multiple_choice',
          label: 'Section 3 of 4 — select your skill areas.',
          isRequired: true,
          options: ['Frontend', 'Backend', 'Frontend + Backend'],
          points: 10,
          conditions: [
            { parentFieldId: 'ss-skills', operator: 'contains', expectedValue: 'Frontend + Backend', action: 'jump_to', jumpToFieldId: 'ss-wrap' },
            { parentFieldId: 'ss-skills', operator: 'contains', expectedValue: 'Frontend', action: 'jump_to', jumpToFieldId: 'ss-frontend-q' },
            { parentFieldId: 'ss-skills', operator: 'contains', expectedValue: 'Backend', action: 'jump_to', jumpToFieldId: 'ss-backend-q' },
          ],
        },
        {
          id: 'ss-frontend-q',
          type: 'multiple_choice',
          label: 'Section 4 of 4 — which frontend framework?',
          isRequired: true,
          options: ['React', 'Vue'],
          points: 10,
          conditions: [
            { parentFieldId: 'ss-skills', operator: 'contains', expectedValue: 'Frontend', action: 'show' },
            { parentFieldId: 'ss-frontend-q', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'ss-wrap' },
          ],
        },
        {
          id: 'ss-backend-q',
          type: 'multiple_choice',
          label: 'Section 4 of 4 — which backend runtime?',
          isRequired: true,
          options: ['Node.js', 'Go'],
          points: 10,
          conditions: [
            { parentFieldId: 'ss-skills', operator: 'contains', expectedValue: 'Backend', action: 'show' },
            { parentFieldId: 'ss-backend-q', operator: 'is_not_empty', action: 'jump_to', jumpToFieldId: 'ss-wrap' },
          ],
        },
        {
          id: 'ss-wrap',
          type: 'paragraph',
          label: 'Anything else you would like to add before we wrap up?',
          isRequired: false,
        },
      ],
    },
  },
  {
    slug: 'video-prompt-demo',
    form: {
      id: 'video-prompt-demo',
      title: 'Video Prompt Demo — Watch & Answer',
      description: 'Seed fixture: a video_prompt question (URL-based, no blob) with a recorded-video answer chain.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        passingScore: 70,
        successMessage: 'Video prompt demo complete.',
        theme: 'dracula',
      },
      fields: [
        {
          id: 'vp-watch',
          type: 'video_prompt',
          label: 'Watch the product walkthrough, then introduce yourself.',
          isRequired: true,
          videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          videoCaption: 'Watch the full clip before recording your answer.',
          answerKind: 'video',
          videoAnswerMaxSeconds: 60,
          videoAnswerPrompt: 'Record a 60-second introduction after watching.',
          points: 10,
        },
      ],
    },
  },
];

export const useExamAppStore = create<ExamAppState>((set, get) => ({
  invites: seedInvites,
  submissions: seedSubmissions,
  session: defaultSession,
  conditionalFixtures: seedConditionalFixtures,
  checklistItems: seedChecklistItems,

  addInvite: (data) => {
    const newRecord: UserInviteRecord = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    set((state) => ({
      invites: [newRecord, ...state.invites],
    }));

    return newRecord;
  },

  revokeInvite: (id) => {
    set((state) => ({
      invites: state.invites.filter((inv) => inv.id !== id),
    }));
  },

  markInviteCompleted: (token) => {
    set((state) => ({
      invites: state.invites.map((inv) =>
        inv.invite_token === token ? { ...inv, status: 'completed' } : inv
      ),
    }));
  },

  getInviteByToken: (token) => {
    return get().invites.find((inv) => inv.invite_token === token);
  },

  addSubmission: (data) => {
    const newRecord: SubmissionHistoryRecord = {
      ...data,
      id: Date.now(),
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    set((state) => ({
      submissions: [newRecord, ...state.submissions],
    }));

    return newRecord;
  },

  authenticateWithToken: (token) => {
    const cleanToken = token.trim();
    const invite = get().getInviteByToken(cleanToken);

    if (invite) {
      set({
        session: {
          token: invite.invite_token,
          role: (invite.role as RunnerSession['role']) || 'subscriber',
          respondentEmail: invite.email,
          respondentName: invite.email.split('@')[0].replace('.', ' '),
          isAuthenticated: true,
        },
      });

      return true;
    }

    return false;
  },

  authenticateAsRole: (role, name, email) => {
    set({
      session: {
        token: null,
        role,
        respondentEmail: email,
        respondentName: name,
        isAuthenticated: true,
      },
    });
  },

  clearSession: () => {
    set({ session: defaultSession });
  },
}));

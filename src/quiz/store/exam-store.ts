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

interface ExamAppState {
  invites: UserInviteRecord[];
  submissions: SubmissionHistoryRecord[];
  session: RunnerSession;
  conditionalFixtures: ConditionalStepFixture[];

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
];

export const useExamAppStore = create<ExamAppState>((set, get) => ({
  invites: seedInvites,
  submissions: seedSubmissions,
  session: defaultSession,
  conditionalFixtures: seedConditionalFixtures,

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

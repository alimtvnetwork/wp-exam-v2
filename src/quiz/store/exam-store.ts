import { create } from 'zustand';

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
      { question: 'What does HTML stand for?', answer: 'Hyperlink Text Module', correct: 'HyperText Markup Language', isCorrect: false },
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

export const useExamAppStore = create<ExamAppState>((set, get) => ({
  invites: seedInvites,
  submissions: seedSubmissions,
  session: defaultSession,

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

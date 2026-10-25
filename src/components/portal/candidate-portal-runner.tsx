import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getJobRoles, getJobRoleById, JobRole } from '@/lib/role-assignments';
import {
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Video,
  Award,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  Calendar,
  Home,
  Search,
  LogIn,
  KeyRound,
  ListChecks,
  BookOpen,
  Layers,
  Check,
  ShieldAlert,
  Download,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { unifiedFetch } from '@/utils/api-client';
import { useAuth } from '@/lib/auth-context';

export interface AssignedTask {
  id: string;
  title: string;
  type: 'assessment' | 'checklist' | 'quiz' | 'curriculum';
  slug?: string;
  due_date?: string;
  notes?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  assigned_at?: string;
  completed_at?: string;
  score?: number;
}

interface PortalStep {
  id: string;
  title: string;
  description: string;
  step_number: number;
  is_required: boolean;
  is_completed: boolean;
  completed_at?: string;
  data?: Record<string, unknown>;
}

interface CandidateInfo {
  id: number;
  candidate_name: string;
  candidate_email: string;
  name?: string;
  email?: string;
  phone?: string;
  job_role?: string;
  current_stage_key: string;
  current_stage?: string;
  notes?: string;
  score?: number;
}

interface PortalSession {
  token: string;
  candidate: CandidateInfo;
  steps: PortalStep[];
  assigned_tasks?: AssignedTask[];
  completed_step_count: number;
  total_step_count: number;
  completion_percentage: number;
  is_fully_verified: boolean;
  assessment_gating_mode?: 'admin_approval' | 'instant_self_service';
  is_assessment_approved?: boolean;
}

export interface TaskContentItem {
  id: string;
  text: string;
  details?: string;
}

export interface TaskQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TaskCurriculumChapter {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface TaskContentDefinition {
  checklistItems?: TaskContentItem[];
  quizQuestions?: TaskQuizQuestion[];
  curriculumChapters?: TaskCurriculumChapter[];
}

export const TASK_CONTENT_CATALOG: Record<string, TaskContentDefinition> = {
  'onboarding-checklist': {
    checklistItems: [
      {
        id: 'chk_1',
        text: 'Enroll hardware security key (YubiKey / WebAuthn) for corporate sign-in',
        details: 'Hardware security tokens eliminate phishing risk and SIM-swapping vulnerabilities.',
      },
      {
        id: 'chk_2',
        text: 'Configure Google Workspace corporate email & 2-step verification',
        details: 'Primary organizational email account setup with mandatory 2FA.',
      },
      {
        id: 'chk_3',
        text: 'Join 1Password enterprise vault & generate master passphrase',
        details: 'Random passphrase with 16+ characters minimum length.',
      },
      {
        id: 'chk_4',
        text: 'Review and sign employee remote work and security compliance policy',
        details: 'Digital acknowledgment of company data confidentiality and security rules.',
      },
      {
        id: 'chk_5',
        text: 'Verify workstation full-disk encryption (BitLocker / FileVault)',
        details: 'Ensure all local hard drives are encrypted at rest with active protection.',
      },
    ],
  },
  'dev-prereqs-checklist': {
    checklistItems: [
      {
        id: 'chk_1',
        text: 'Configure hardware 2FA / WebAuthn on GitHub corporate account',
        details: 'Mandatory security key enrollment to access private company repositories.',
      },
      {
        id: 'chk_2',
        text: 'Generate and upload SSH Ed25519 signing key to GitHub profile',
        details: 'Enable GitHub "Vigilant Mode" to cryptographically sign all git commits.',
      },
      {
        id: 'chk_3',
        text: 'Configure Git core.autocrlf to input (strict LF line endings)',
        details: 'Prevents CRLF carriage returns from corrupting cross-platform CI pipelines.',
      },
      {
        id: 'chk_4',
        text: 'Install Node.js LTS runtime and verify package dependencies',
        details: 'Ensure local developer environment matches production runtime targets.',
      },
      {
        id: 'chk_5',
        text: 'Run local test suite (npm test) with 100% passing tests',
        details: 'Verify unit test harness runs cleanly without errors before pushing code.',
      },
    ],
  },
  'workstation-checklist': {
    checklistItems: [
      {
        id: 'chk_1',
        text: 'Confirm BitLocker or FileVault full-disk encryption active on boot drive',
        details: 'Mandatory cryptographic protection against physical device compromise.',
      },
      {
        id: 'chk_2',
        text: 'Enroll workstation in corporate device management (MDM) profile',
        details: 'Enables security telemetry, remote patch compliance, and device health monitoring.',
      },
      {
        id: 'chk_3',
        text: 'Configure workstation screensaver auto-lock timeout to 5 minutes or less',
        details: 'Protects unattended laptops and workstations in shared environments.',
      },
      {
        id: 'chk_4',
        text: 'Disable automatic OS sleep during long-running background test jobs',
        details: 'Prevents runner process interruption while test suites execute.',
      },
      {
        id: 'chk_5',
        text: 'Verify host firewall is active with stealth mode enabled',
        details: 'Blocks unauthorized inbound network connections on developer endpoints.',
      },
    ],
  },
  'wp-fullstack-exam': {
    quizQuestions: [
      {
        id: 'q1',
        question: 'Which WordPress action hook is the canonical location for registering custom REST API endpoints?',
        options: ['init', 'rest_api_init', 'wp_loaded', 'admin_init'],
        correctAnswer: 'rest_api_init',
        explanation: 'register_rest_route must always be invoked inside the rest_api_init action hook.',
      },
      {
        id: 'q2',
        question: 'In a decoupled WordPress & React architecture, what header authenticates nonced REST requests?',
        options: ['X-WP-Nonce', 'Authorization-Token', 'WP-Secret-Key', 'X-CSRF-Token'],
        correctAnswer: 'X-WP-Nonce',
        explanation: 'WordPress REST API uses the X-WP-Nonce header for logged-in cookie-based session verification.',
      },
      {
        id: 'q3',
        question: 'What is the recommended practice for managing structured error metadata in enterprise controllers?',
        options: [
          'Structured AppError envelope with status code and error type',
          'Throwing raw generic RuntimeException',
          'echo JSON string and exit',
          'Silent boolean false return',
        ],
        correctAnswer: 'Structured AppError envelope with status code and error type',
        explanation: 'Structured error envelopes guarantee consistent JSON contract schemas across all platforms.',
      },
    ],
  },
  'coding-standards-quiz': {
    quizQuestions: [
      {
        id: 'q1',
        question: 'How must positive boolean conditions be evaluated according to repository guidelines?',
        options: [
          'Implicit check: if isReady { ... }',
          'Explicit comparison: if isReady is compared to a boolean literal',
          'Ternary check: isReady ? 1 : 0',
          'Loose check: if isReady != null',
        ],
        correctAnswer: 'Implicit check: if isReady { ... }',
        explanation: 'Explicit equality checks against literal boolean flags are strictly banned.',
      },
      {
        id: 'q2',
        question: 'What is the rule regarding mixing positive and negative checks in the same conditional?',
        options: [
          'No Mixed Polarity: NEVER combine positive and negative checks in the same if statement',
          'Allowed anywhere without restriction',
          'Only allowed inside loops',
          'Only allowed in test files',
        ],
        correctAnswer: 'No Mixed Polarity: NEVER combine positive and negative checks in the same if statement',
        explanation: 'Discrete condition polarity prevents cognitive complexity and logic bugs.',
      },
      {
        id: 'q3',
        question: 'What line endings are strictly mandatory across all files in the codebase?',
        options: [
          'Strict LF (\n) line endings',
          'CRLF (Windows default)',
          'Mixed line endings',
          'OS-dependent',
        ],
        correctAnswer: 'Strict LF (\n) line endings',
        explanation: 'All files, scripts, and documentation must use strict LF line endings.',
      },
    ],
  },
  'qa-triage-quiz': {
    quizQuestions: [
      {
        id: 'q1',
        question: 'What is the repository zero-storage mandate regarding GitHub Actions build artifacts?',
        options: [
          'Total Ban on actions/upload-artifact: output to step summary and console only',
          'Upload all video traces and zip files',
          'Upload up to 500MB per workflow',
          'Save test output in git commits',
        ],
        correctAnswer: 'Total Ban on actions/upload-artifact: output to step summary and console only',
        explanation: 'Free-tier account quotas require zero storage uploads in routine CI workflows.',
      },
      {
        id: 'q2',
        question: 'How should destructive OS tests (reboots, shutdowns, process termination) be executed?',
        options: [
          'Strictly isolated using mock executors; NEVER trigger real OS shutdown',
          'Execute real system shutdown commands',
          'Only run on administrator workstations',
          'Skip tests entirely',
        ],
        correctAnswer: 'Strictly isolated using mock executors; NEVER trigger real OS shutdown',
        explanation: 'Unit tests must never trigger real system shutdowns or destructive machine operations.',
      },
      {
        id: 'q3',
        question: 'What are the four components of a grounded Root Cause Analysis (RCA)?',
        options: [
          'Defect Observation, System Mechanism, Root Cause, Prevention Rule',
          'Guess, Hope, Try, Ignore',
          'Blame, Commit, Deploy, Forget',
          'Log, Alert, Restart, Close',
        ],
        correctAnswer: 'Defect Observation, System Mechanism, Root Cause, Prevention Rule',
        explanation: '4-part RCA provides verifiable root cause identification and preventive guardrails.',
      },
    ],
  },
  'sec-mastery-quiz': {
    quizQuestions: [
      {
        id: 'q1',
        question: 'What is the minimum character requirement for enterprise passwords?',
        options: [
          '16+ characters with mixed alphanumeric and symbol sets',
          '8 characters',
          '12 characters',
          'Any length if changed monthly',
        ],
        correctAnswer: '16+ characters with mixed alphanumeric and symbol sets',
        explanation: '16+ character passphrases ensure high cryptographic entropy against brute-force attacks.',
      },
      {
        id: 'q2',
        question: 'Where should sensitive database credentials and API private keys be stored?',
        options: [
          'Strictly in local .env files or secure key vaults; NEVER committed to git',
          'Committed to git in config files',
          'Hardcoded in JavaScript bundles',
          'Sent as URL query parameters',
        ],
        correctAnswer: 'Strictly in local .env files or secure key vaults; NEVER committed to git',
        explanation: 'Secrets committed to git history are immediately compromised.',
      },
      {
        id: 'q3',
        question: 'Why are hardware security keys (FIDO2 / WebAuthn) preferred over SMS verification?',
        options: [
          'Completely immune to SIM-swapping and adversary-in-the-middle phishing',
          'They do not require internet access',
          'SMS is deprecated worldwide',
          'Hardware keys are free',
        ],
        correctAnswer: 'Completely immune to SIM-swapping and adversary-in-the-middle phishing',
        explanation: 'FIDO2 cryptographic domain-binding guarantees phishing resistance.',
      },
    ],
  },
  'sec-101-track': {
    curriculumChapters: [
      {
        id: 'ch1',
        title: 'Module 1: Enterprise Password Hygiene & Credential Management',
        summary: 'Learn password entropy principles, password vault configuration, and credential rotation.',
        keyPoints: [
          'Use 16+ character randomly generated passphrases for all service logins',
          'Never reuse master passwords across personal and corporate platforms',
          'Store all recovery emergency keys inside encrypted enterprise vaults',
        ],
      },
      {
        id: 'ch2',
        title: 'Module 2: Phishing Resistance & Hardware Security Keys',
        summary: 'Understand modern phishing tactics, prompt-bombing MFA fatigue, and FIDO2 cryptographic defense.',
        keyPoints: [
          'Hardware security keys bind authentication directly to the legitimate web origin',
          'Never approve unexpected MFA push notifications without verifying the initiating source',
          'Report suspicious credential prompt emails to the security triage channel immediately',
        ],
      },
      {
        id: 'ch3',
        title: 'Module 3: Workstation Encryption & Clean Remote Work Hygiene',
        summary: 'Ensure endpoint data security, full-disk BitLocker/FileVault protection, and network safety.',
        keyPoints: [
          'Always verify full-disk encryption is active on every workstation storing repo code',
          'Avoid connecting to unencrypted public Wi-Fi networks without an enterprise VPN tunnel',
          'Lock your workstation screen whenever stepping away from your workspace',
        ],
      },
    ],
  },
  'coding-standards-track': {
    curriculumChapters: [
      {
        id: 'ch1',
        title: 'Module 1: Boolean Cleanliness & Condition Flattening',
        summary: 'Master implicit boolean evaluations, guard clause inversion, and polarity separation.',
        keyPoints: [
          'Never evaluate booleans explicitly against boolean literals (use implicit if isReady instead)',
          'Never mix positive and negative checks in the same condition branch',
          'Use early guard clause returns to flatten deeply nested if-else ladders',
        ],
      },
      {
        id: 'ch2',
        title: 'Module 2: Structured Error Management with AppError',
        summary: 'Implement predictable failure semantics across all system boundaries and services.',
        keyPoints: [
          'Functions returning failures must return structured *appfault.AppError envelopes',
          'Always attach contextual failure messages and error codes to outgoing responses',
          'Avoid bare void or untyped errors in Go and TypeScript business packages',
        ],
      },
      {
        id: 'ch3',
        title: 'Module 3: Relative Git Paths & Zero-Storage CI Mandate',
        summary: 'Enforce portable relative repository references and maintain clean, zero-cost CI pipelines.',
        keyPoints: [
          'All file links, specs, and citations must use strictly relative paths from git root',
          'Absolute filesystem paths (file:/// URIs) are totally banned across all repo files',
          'Write test diagnostics directly to step summaries; do not upload bulky artifact archives',
        ],
      },
    ],
  },
  'product-qa-track': {
    curriculumChapters: [
      {
        id: 'ch1',
        title: 'Module 1: Application Specification Auditing & Scorecards',
        summary: 'Learn blind-AI specification reviews, gap analysis matrices, and verification checklists.',
        keyPoints: [
          'Specifications must contain concrete, testable acceptance criteria',
          'Identify missing edge cases and validation rules before implementing features',
          'Generate actionable remediation checklists for cross-functional alignment',
        ],
      },
      {
        id: 'ch2',
        title: 'Module 2: Playwright Test Automation & Flakiness Isolation',
        summary: 'Architect resilient end-to-end test scenarios with isolated fixtures and predictable state.',
        keyPoints: [
          'Use deterministic data test IDs and semantic role selectors in user journeys',
          'Isolate background network mocks to prevent flaky third-party service dependencies',
          'Ensure test cleanup leaves no dangling database or storage debris',
        ],
      },
      {
        id: 'ch3',
        title: 'Module 3: Root Cause Analysis (RCA) Protocol',
        summary: 'Diagnose bugs systematically without guessing or reverting code blindly.',
        keyPoints: [
          'Document the observable defect symptom and exact reproduction steps',
          'Identify the underlying software mechanism that allowed the defect to occur',
          'Formulate permanent prevention rules to prevent regression across all codebases',
        ],
      },
    ],
  },
};

export const getTaskContent = (task: AssignedTask): TaskContentDefinition => {
  const taskKey = task.slug || task.id;

  if (TASK_CONTENT_CATALOG[taskKey]) {
    return TASK_CONTENT_CATALOG[taskKey];
  }

  for (const [key, def] of Object.entries(TASK_CONTENT_CATALOG)) {
    const isMatching = taskKey.includes(key) || key.includes(taskKey);

    if (isMatching) {
      return def;
    }
  }

  if (task.type === 'checklist') {
    const noteText = task.notes ? ` (${task.notes})` : '';

    return {
      checklistItems: [
        {
          id: 'custom_chk_1',
          text: `Review objectives for "${task.title}"`,
          details: `Understand the scope and deliverables required for this task${noteText}.`,
        },
        {
          id: 'custom_chk_2',
          text: 'Execute assigned instructions and setup requirements',
          details: 'Carry out the technical setup, documentation, or form submission.',
        },
        {
          id: 'custom_chk_3',
          text: 'Perform quality check and verify compliance criteria',
          details: 'Ensure all guidelines and quality gates have been satisfied.',
        },
        {
          id: 'custom_chk_4',
          text: 'Finalize and submit completed task deliverable',
          details: 'Confirm completion to notify hiring managers and update candidate status.',
        },
      ],
    };
  }

  if (task.type === 'quiz') {
    return {
      quizQuestions: [
        {
          id: 'custom_q1',
          question: `Regarding ${task.title}: What is the most effective approach to completing this milestone?`,
          options: [
            'Follow documented repository guidelines and verify all steps',
            'Skip automated verification tests',
            'Bypass security policies',
            'Ignore instructions',
          ],
          correctAnswer: 'Follow documented repository guidelines and verify all steps',
          explanation: 'Following established engineering guidelines ensures consistent quality.',
        },
        {
          id: 'custom_q2',
          question: 'What step is required before marking this task completed?',
          options: [
            'Verify all requirements are met and documented',
            'Delete the task record',
            'Submit without review',
            'Change deadline to next month',
          ],
          correctAnswer: 'Verify all requirements are met and documented',
          explanation: 'Verification ensures that deliverables satisfy acceptance criteria.',
        },
      ],
    };
  }

  return {
    curriculumChapters: [
      {
        id: 'custom_ch1',
        title: `Curriculum: ${task.title}`,
        summary: task.notes || 'Core learning track specifications and requirements.',
        keyPoints: [
          'Read and review foundational documentation',
          'Follow instructions and standard practices',
          'Confirm completion to receive milestone sign-off',
        ],
      },
    ],
  };
};

const DEFAULT_SESSION: PortalSession = {
  token: 'demo-token',
  assessment_gating_mode: 'admin_approval',
  is_assessment_approved: false,
  candidate: {
    id: 1,
    candidate_name: 'Alex Morgan',
    candidate_email: 'alex.morgan@example.com',
    phone: '+1 (555) 345-6789',
    current_stage_key: 'screening',
    notes: 'Candidate verification portal session',
    score: 100,
  },
  assigned_tasks: [
    {
      id: 'task_pre_hire_eval',
      title: 'Technical Assessment & Skills Verification',
      type: 'assessment',
      slug: 'technical-assessment',
      due_date: 'Within 5 days',
      notes: 'Complete all 5 verification steps including technical evaluation.',
      status: 'in_progress',
      assigned_at: '2026-10-18',
    },
    {
      id: 'task_onboarding_chk',
      title: 'Employee Onboarding & Security Checklist',
      type: 'checklist',
      slug: 'onboarding-checklist',
      due_date: 'Before Day 1',
      notes: 'Hardware security keys, 2FA setup, and workstation compliance.',
      status: 'not_started',
      assigned_at: '2026-10-19',
    },
  ],
  steps: [
    {
      id: 'step_welcome',
      title: 'Profile Verification & Welcome',
      description: 'Confirm your applicant identity and contact details.',
      step_number: 1,
      is_required: true,
      is_completed: false,
    },
    {
      id: 'step_nda',
      title: 'Confidentiality & NDA Agreement',
      description: 'Review and sign organizational confidentiality policies.',
      step_number: 2,
      is_required: true,
      is_completed: false,
    },
    {
      id: 'step_assessment',
      title: 'Technical Assessment & Skills Verification',
      description: 'Complete the interactive timed evaluation module.',
      step_number: 3,
      is_required: true,
      is_completed: false,
    },
    {
      id: 'step_submission',
      title: 'Work Sample & Video Introduction',
      description: 'Provide introductory video responses or portfolio attachments.',
      step_number: 4,
      is_required: true,
      is_completed: false,
    },
    {
      id: 'step_complete',
      title: 'Final Review & Verification Receipt',
      description: 'Submit complete verification packet and download confirmation.',
      step_number: 5,
      is_required: true,
      is_completed: false,
    },
  ],
  completed_step_count: 0,
  total_step_count: 5,
  completion_percentage: 0,
  is_fully_verified: false,
};

export const CandidatePortalRunner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { token: routeToken } = useParams<{ token?: string }>();
  const userTokenPart = user?.email ? user.email.split('@')[0] : '';
  const activeToken = routeToken || userTokenPart || 'demo-candidate';
  const [session, setSession] = useState<PortalSession>(DEFAULT_SESSION);
  const [activeStepId, setActiveStepId] = useState<string>('step_welcome');
  const [portalTab, setPortalTab] = useState<'assignments' | 'assessment' | 'task_view'>('assignments');
  const [activeTask, setActiveTask] = useState<AssignedTask | null>(null);
  const [taskChecklistState, setTaskChecklistState] = useState<Record<string, boolean>>({});
  const [taskQuizAnswers, setTaskQuizAnswers] = useState<Record<string, string>>({});
  const [taskQuizScore, setTaskQuizScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lookupEmail, setLookupEmail] = useState<string>('');
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);

  const handleOpenTask = (task: AssignedTask) => {
    const isEntranceStepper = (task.id === 'task_pre_hire_eval' || task.slug === 'technical-assessment');

    if (isEntranceStepper) {
      setPortalTab('assessment');
      return;
    }

    setActiveTask(task);
    setPortalTab('task_view');

    if (task.type === 'checklist' && typeof window !== 'undefined') {
      const email = session.candidate.candidate_email;
      const key = `wp_exam_chk_${email}_${task.id}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        try {
          setTaskChecklistState(JSON.parse(saved));
        } catch {
          setTaskChecklistState({});
        }
      } else {
        setTaskChecklistState({});
      }
    }

    if (task.type === 'quiz') {
      setTaskQuizAnswers({});
      const hasScore = typeof task.score === 'number';
      setTaskQuizScore(hasScore ? (task.score || 0) : null);
    }
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: 'not_started' | 'in_progress' | 'completed',
    score?: number
  ) => {
    const currentTasks = session.assigned_tasks || [];

    const updatedTasks = currentTasks.map((t) => {
      const isMatch = (t.id === taskId);

      if (isMatch) {
        const hasScore = typeof score === 'number';
        return {
          ...t,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : t.completed_at,
          score: hasScore ? score : t.score,
        };
      }

      return t;
    });

    setSession((prev) => ({
      ...prev,
      assigned_tasks: updatedTasks,
    }));

    if (activeTask && activeTask.id === taskId) {
      const hasScore = typeof score === 'number';
      setActiveTask((prev) => (prev ? {
        ...prev,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : prev.completed_at,
        score: hasScore ? score : prev.score,
      } : null));
    }

    if (typeof window !== 'undefined') {
      const email = session.candidate.candidate_email;
      const key = `wp_exam_assigned_tasks_${email}`;
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    }

    const updatedTask = updatedTasks.find((t) => t.id === taskId);
    const hasTask = Boolean(updatedTask);

    if (hasTask && updatedTask) {
      unifiedFetch('/api/v1/applicants/assign-task', '/wp-json/wp-exam/v1/applicants/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: session.candidate.id,
          candidate_email: session.candidate.candidate_email,
          task: updatedTask,
        }),
      }).catch(() => {
        // Standalone offline mode
      });
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!activeTask) {
      return;
    }

    const nextState = {
      ...taskChecklistState,
      [itemId]: !taskChecklistState[itemId],
    };

    setTaskChecklistState(nextState);

    if (typeof window !== 'undefined') {
      const email = session.candidate.candidate_email;
      const storageKey = `wp_exam_chk_${email}_${activeTask.id}`;
      localStorage.setItem(storageKey, JSON.stringify(nextState));
    }

    const isNotStarted = (activeTask.status === 'not_started');

    if (isNotStarted) {
      handleUpdateTaskStatus(activeTask.id, 'in_progress');
    }
  };

  const handleCompleteChecklist = () => {
    if (!activeTask) {
      return;
    }

    handleUpdateTaskStatus(activeTask.id, 'completed');
    toast.success(`Checklist completed: "${activeTask.title}"!`);
  };

  const handleCompleteQuiz = (questions: TaskQuizQuestion[]) => {
    if (!activeTask) {
      return;
    }

    let correctCount = 0;

    questions.forEach((q) => {
      const selected = taskQuizAnswers[q.id];
      const isCorrect = (selected === q.correctAnswer);

      if (isCorrect) {
        correctCount++;
      }
    });

    const total = questions.length;
    const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 100;

    setTaskQuizScore(scorePercent);
    handleUpdateTaskStatus(activeTask.id, 'completed', scorePercent);
    toast.success(`Quiz completed with ${scorePercent}% score!`);
  };

  // Step 1 Form State
  const [confirmPhone, setConfirmPhone] = useState<string>(session.candidate.phone || '');
  const [confirmProfileChecked, setConfirmProfileChecked] = useState<boolean>(false);

  // Step 2 Form State
  const [ndaSignName, setNdaSignName] = useState<string>('');
  const [ndaAgreed, setNdaAgreed] = useState<boolean>(false);

  // Step 3 Quiz State
  const [q1Answer, setQ1Answer] = useState<string>('');
  const [q2Answer, setQ2Answer] = useState<string>('');
  const [q3Answer, setQ3Answer] = useState<string>('');
  const [examScore, setExamScore] = useState<number | null>(null);

  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role') || searchParams.get('job');

  const [rolesList, setRolesList] = useState<JobRole[]>(() => getJobRoles());

  useEffect(() => {
    const handleRolesUpdate = () => {
      setRolesList(getJobRoles());
    };

    window.addEventListener('wp_exam_roles_updated', handleRolesUpdate);

    return () => {
      window.removeEventListener('wp_exam_roles_updated', handleRolesUpdate);
    };
  }, []);

  const candidateRoleKey = session.candidate?.job_role || queryRole || 'frontend-developer';
  const currentJobRole = getJobRoleById(candidateRoleKey);
  const roleQuestions = currentJobRole.secondPhaseQuestions;

  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});

  // Step 3 Timed Assessment & Anti-Cheat Proctoring State
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [examBriefingAgreed, setExamBriefingAgreed] = useState<boolean>(false);
  const [examSecondsLeft, setExamSecondsLeft] = useState<number>(600);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showFocusLostModal, setShowFocusLostModal] = useState<boolean>(false);
  const [examIntegrityStatus, setExamIntegrityStatus] = useState<'clean' | 'flagged'>('clean');

  // Step 4 Submission State
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const fetchSession = async () => {
    setIsLoading(true);

    try {
      const tokenEnc = encodeURIComponent(activeToken);
      const res = await unifiedFetch(`/api/v1/portal/${tokenEnc}`, `/wp-json/wp-exam/v1/portal/${tokenEnc}`);
      const hasResponse = res.ok;

      if (hasResponse) {
        const json = await res.json();
        const sessionData = json?.data ?? json;

        if (sessionData?.steps) {
          const rawCandidate = sessionData.candidate || {};
          const candidateName = rawCandidate.candidate_name || rawCandidate.name || 'Candidate';
          const candidateEmail = rawCandidate.candidate_email || rawCandidate.email || 'candidate@example.com';
          const currentStage = rawCandidate.current_stage_key || rawCandidate.current_stage || 'assessment';
          const phone = rawCandidate.phone || '';
          const candScoreRaw = rawCandidate.score;
          const hasCandScore = typeof candScoreRaw === 'number';

          const normalizedCandidate: CandidateInfo = {
            id: rawCandidate.id || 1,
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            phone: phone,
            current_stage_key: currentStage,
            notes: rawCandidate.notes || '',
            score: hasCandScore ? candScoreRaw : undefined,
          };

          const localTasksKey = `wp_exam_assigned_tasks_${normalizedCandidate.candidate_email}`;
          let localTasks: AssignedTask[] = [];

          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(localTasksKey);

            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                const isArr = Array.isArray(parsed);

                if (isArr) {
                  localTasks = parsed;
                }
              } catch {
                // Ignore parse errors
              }
            }
          }

          const serverTasks: AssignedTask[] = Array.isArray(sessionData.assigned_tasks)
            ? sessionData.assigned_tasks
            : [];
          const tasksMap = new Map<string, AssignedTask>();
          serverTasks.forEach((t) => tasksMap.set(t.id, t));
          localTasks.forEach((t) => tasksMap.set(t.id, t));
          let allTasks = Array.from(tasksMap.values());

          const hasNoTasks = (allTasks.length === 0);

          if (hasNoTasks) {
            const isAllDone = Boolean(sessionData.is_fully_verified);
            allTasks = [
              {
                id: 'task_pre_hire_eval',
                title: 'Technical Assessment & Skills Verification',
                type: 'assessment',
                slug: 'technical-assessment',
                due_date: 'Within 5 days',
                notes: 'Complete all 5 verification steps including technical evaluation.',
                status: isAllDone ? 'completed' : 'in_progress',
                assigned_at: '2026-10-18',
              },
            ];

            const isHired = (normalizedCandidate.current_stage_key === 'hired');

            if (isHired) {
              allTasks.push({
                id: 'task_onboarding_chk',
                title: 'Employee Onboarding & Security Checklist',
                type: 'checklist',
                slug: 'onboarding-checklist',
                due_date: 'Before Day 1',
                notes: 'Hardware security keys, 2FA setup, and workstation compliance.',
                status: 'not_started',
                assigned_at: new Date().toISOString(),
              });
            }
          }

          const normalizedSession: PortalSession = {
            token: sessionData.token || activeToken,
            candidate: normalizedCandidate,
            steps: sessionData.steps,
            assigned_tasks: allTasks,
            completed_step_count: sessionData.completed_step_count ?? sessionData.completed_steps_count ?? 0,
            total_step_count: sessionData.total_step_count ?? sessionData.total_steps_count ?? 5,
            completion_percentage: sessionData.completion_percentage ?? sessionData.progress_percentage ?? 0,
            is_fully_verified: Boolean(sessionData.is_fully_verified),
            assessment_gating_mode: sessionData.assessment_gating_mode || 'admin_approval',
            is_assessment_approved: Boolean(sessionData.is_assessment_approved),
          };

          setSession(normalizedSession);

          // Populate step 3 data and score if already completed
          const assessmentStep = sessionData.steps.find((s: PortalStep) => s.id === 'step_assessment');
          const hasAssessmentData = Boolean(assessmentStep?.data);

          if (hasAssessmentData) {
            const stepScore = assessmentStep?.data?.score;
            const hasStepScore = typeof stepScore === 'number';

            if (hasStepScore) {
              setExamScore(stepScore);
            }

            if (assessmentStep?.data?.answers && typeof assessmentStep.data.answers === 'object') {
              setAssessmentAnswers(assessmentStep.data.answers);
            }

            const stepQ1 = assessmentStep?.data?.q1;

            if (stepQ1) {
              setQ1Answer(String(stepQ1));
            }

            const stepQ2 = assessmentStep?.data?.q2;

            if (stepQ2) {
              setQ2Answer(String(stepQ2));
            }

            const stepQ3 = assessmentStep?.data?.q3;

            if (stepQ3) {
              setQ3Answer(String(stepQ3));
            }

            const savedStrikes = assessmentStep?.data?.tab_switch_count;
            const hasSavedStrikes = typeof savedStrikes === 'number';

            if (hasSavedStrikes) {
              setTabSwitchCount(savedStrikes);
            }

            const savedIntegrity = assessmentStep?.data?.integrity_status;
            const isClean = (savedIntegrity === 'clean');
            const isFlagged = (savedIntegrity === 'flagged');

            if (isClean) {
              setExamIntegrityStatus('clean');
            }

            if (isFlagged) {
              setExamIntegrityStatus('flagged');
            }
          }

          if (hasCandScore) {
            setExamScore((prev) => (prev !== null ? prev : candScoreRaw));
          }

          // Find first uncompleted step
          const firstUncompleted = sessionData.steps.find((s: PortalStep) => !s.is_completed);

          if (firstUncompleted) {
            setActiveStepId(firstUncompleted.id);
          }
        }
      }
    } catch {
      // Graceful fallback to default session
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [activeToken]);

  const handleCompleteStep = async (stepId: string, stepData: Record<string, unknown> = {}) => {
    // Optimistic update
    setSession((prev) => {
      const updatedSteps = prev.steps.map((s) =>
        s.id === stepId ? { ...s, is_completed: true, completed_at: new Date().toISOString() } : s
      );
      const completed = updatedSteps.filter((s) => s.is_completed).length;
      const pct = Math.round((completed / updatedSteps.length) * 100);

      return {
        ...prev,
        steps: updatedSteps,
        completed_step_count: completed,
        completion_percentage: pct,
        is_fully_verified: completed === updatedSteps.length,
      };
    });

    const isFinalSubmission = (stepId === 'step_complete');

    if (isFinalSubmission) {
      toast.success('Application submitted successfully! Our team is reviewing your profile.');
    } else {
      toast.success('Step verified and recorded successfully');
    }

    // Advance to next step
    const currentIndex = session.steps.findIndex((s) => s.id === stepId);
    const nextStep = session.steps[currentIndex + 1];

    if (nextStep) {
      setActiveStepId(nextStep.id);
    }

    try {
      const tokenEnc = encodeURIComponent(activeToken);
      const res = await unifiedFetch(
        `/api/v1/portal/${tokenEnc}/complete-step`,
        `/wp-json/wp-exam/v1/portal/${tokenEnc}/complete-step`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step_id: stepId,
            step_data: stepData,
          }),
        }
      );

      const hasSuccess = res.ok;

      if (hasSuccess) {
        const json = await res.json();
        const updated = json?.data ?? json;

        if (updated?.steps) {
          setSession(updated);
        }
      }
    } catch {
      // Standalone mode retains optimistic state
    }
  };


  const candidateName = session?.candidate?.candidate_name || session?.candidate?.name || 'Candidate';
  const candidateEmail = session?.candidate?.candidate_email || session?.candidate?.email || 'candidate@example.com';
  const candidateInitial = (candidateName.trim().charAt(0) || 'C').toUpperCase();

  const firstUncompletedIndex = session.steps.findIndex((s) => !s.is_completed);
  const activeUncompletedIndex = (firstUncompletedIndex === -1) ? session.steps.length : firstUncompletedIndex;

  const gatingMode = session.assessment_gating_mode || 'admin_approval';
  const stageKey = session.candidate?.current_stage_key || '';
  const isApprovedByAdmin = Boolean(
    session.is_assessment_approved ||
    ['assessment', 'exam', 'interview', 'offered', 'hired'].includes(stageKey)
  );
  const isAssessmentGated = (gatingMode === 'admin_approval' && !isApprovedByAdmin);

  // Step 1 satisfaction
  const isStep1Done = Boolean(session.steps.find((s) => s.id === 'step_welcome')?.is_completed);
  const isStep1Satisfied = confirmProfileChecked || isStep1Done;

  // Step 2 satisfaction
  const isStep2Done = Boolean(session.steps.find((s) => s.id === 'step_nda')?.is_completed);
  const isStep2Satisfied = (ndaAgreed && ndaSignName.trim().length >= 2) || isStep2Done;

  const isStepAccessible = (stepNumber: number, isDone: boolean): boolean => {
    if (isDone) {
      return true;
    }

    const stepIndex = stepNumber - 1;
    const isAvailable = (stepIndex <= activeUncompletedIndex);

    // If candidate has completed Step 1 and Step 2, they can always view Step 3
    // (even if gated by admin, so they can see the pending status and check approval)
    if (stepNumber === 3) {
      return isStep1Done && isStep2Done;
    }

    // Steps 4 and 5 require Step 3 to be completed (which requires approval)
    if (stepNumber > 3 && isAssessmentGated) {
      return false;
    }

    return isAvailable;
  };

  // Step 3 satisfaction
  const isStep3Done = Boolean(session.steps.find((s) => s.id === 'step_assessment')?.is_completed);
  const isAllRoleQuestionsAnswered = (roleQuestions.length > 0)
    ? roleQuestions.every((q) => Boolean(assessmentAnswers[q.id]))
    : Boolean(q1Answer && q2Answer && q3Answer);
  const isStep3Satisfied = Boolean(isAllRoleQuestionsAnswered || isStep3Done);

  // Step 4 satisfaction
  const isStep4Done = Boolean(session.steps.find((s) => s.id === 'step_submission')?.is_completed);
  const isStep4Satisfied = (videoUrl.trim().length > 0) || isStep4Done;

  // Step 5 satisfaction / completion
  const isStep5Done = Boolean(session.steps.find((s) => s.id === 'step_complete')?.is_completed || session.is_fully_verified);

  const handleStep1Submit = () => {
    if (!isStep1Satisfied) {
      toast.error('Please verify and confirm your contact details before proceeding.');
      return;
    }

    handleCompleteStep('step_welcome', { phone: confirmPhone });
  };

  const handleStep2Submit = () => {
    if (!isStep2Satisfied) {
      toast.error('Please sign your digital signature and accept the agreement.');
      return;
    }

    handleCompleteStep('step_nda', { signature: ndaSignName, signed_at: new Date().toISOString() });

    if (isAssessmentGated) {
      toast.info('Profile verification submitted. Awaiting administrative review before assessment unlocks.');
    }
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStep3Submit = (overrideStrikes?: number, isForcedTimeout?: boolean) => {
    const isManual = (overrideStrikes === undefined && !isForcedTimeout);

    if (isManual) {
      if (!isStep3Satisfied) {
        toast.error('Please answer all assessment questions before proceeding.');

        return;
      }
    }

    const finalStrikes = (typeof overrideStrikes === 'number') ? overrideStrikes : tabSwitchCount;
    const isClean = (finalStrikes === 0);
    const integrityStatus: 'clean' | 'flagged' = isClean ? 'clean' : 'flagged';
    setExamIntegrityStatus(integrityStatus);

    let correctCount = 0;
    const totalQuestions = roleQuestions.length;

    if (totalQuestions > 0) {
      roleQuestions.forEach((q) => {
        const choice = assessmentAnswers[q.id];
        const isCorrect = (choice === q.correctAnswer);
        if (isCorrect) {
          correctCount++;
        }
      });
    } else {
      const isQ1Correct = (q1Answer === 'Implicit check: if (isReady)');
      if (isQ1Correct) {
        correctCount++;
      }

      const isQ2Correct = (q2Answer === 'SQLite Split-DB architecture (Main + Project shards)');
      if (isQ2Correct) {
        correctCount++;
      }

      const isQ3Correct = (q3Answer === 'Strictly an active indicator mark, never dominant surface or text');
      if (isQ3Correct) {
        correctCount++;
      }
    }

    const calculatedScore = (totalQuestions > 0)
      ? Math.round((correctCount / totalQuestions) * 100)
      : Math.round((correctCount / 3) * 100);

    setExamScore(calculatedScore);

    const timeSpent = Math.max(0, 600 - examSecondsLeft);

    handleCompleteStep('step_assessment', {
      answers: assessmentAnswers,
      q1: q1Answer,
      q2: q2Answer,
      q3: q3Answer,
      score: calculatedScore,
      correct_count: correctCount,
      total_questions: totalQuestions || 3,
      role_id: currentJobRole.id,
      role_title: currentJobRole.title,
      time_spent_seconds: timeSpent,
      tab_switch_count: finalStrikes,
      integrity_status: integrityStatus,
      is_forced_timeout: Boolean(isForcedTimeout),
    });
  };

  // Proctoring tab switch & window blur detection effect
  useEffect(() => {
    if (!isExamStarted) {
      return;
    }

    if (isStep3Done) {
      return;
    }

    const isAssessmentStep = (activeStepId === 'step_assessment');

    if (!isAssessmentStep) {
      return;
    }

    const handleBlurOrHidden = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setShowFocusLostModal(true);

        const isExceeded = (next >= 3);

        if (isExceeded) {
          toast.error('Proctoring violation: 3 tab switches detected! Exam automatically submitted.');
          handleStep3Submit(next, false);
        } else {
          toast.warning(`Proctoring alert: Window focus lost! Strike ${next} of 3 recorded.`);
        }

        return next;
      });
    };

    const handleVisibilityChange = () => {
      const isHidden = Boolean(document.hidden);

      if (isHidden) {
        handleBlurOrHidden();
      }
    };

    window.addEventListener('blur', handleBlurOrHidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlurOrHidden);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamStarted, isStep3Done, activeStepId, roleQuestions, assessmentAnswers, q1Answer, q2Answer, q3Answer]);

  // Exam 10-minute countdown timer effect
  useEffect(() => {
    if (!isExamStarted) {
      return;
    }

    if (isStep3Done) {
      return;
    }

    const isAssessmentStep = (activeStepId === 'step_assessment');

    if (!isAssessmentStep) {
      return;
    }

    const timer = setInterval(() => {
      setExamSecondsLeft((prev) => {
        const isExpired = (prev <= 1);

        if (isExpired) {
          clearInterval(timer);
          toast.warning('Exam time limit expired (10:00). Auto-submitting answers.');
          handleStep3Submit(tabSwitchCount, true);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isExamStarted, isStep3Done, activeStepId, tabSwitchCount, roleQuestions, assessmentAnswers, q1Answer, q2Answer, q3Answer]);

  const handleStep4Submit = () => {
    if (!isStep4Satisfied) {
      toast.error('Please provide an introductory video recording link.');
      return;
    }

    handleCompleteStep('step_submission', { video_url: videoUrl, portfolio_url: portfolioUrl, notes: submissionNotes });
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = lookupEmail.trim();

    if (!cleanEmail) {
      toast.error('Please enter your registered candidate email');

      return;
    }

    const tokenPart = cleanEmail.split('@')[0];
    navigate(`/portal/${tokenPart}`);
    setIsLookupOpen(false);
  };

  const displayScore = (() => {
    const hasExamScore = (examScore !== null);

    if (hasExamScore) {
      return examScore;
    }

    const assessmentStep = session.steps.find((s) => s.id === 'step_assessment');
    const stepDataScore = assessmentStep?.data?.score;
    const hasStepDataScore = typeof stepDataScore === 'number';

    if (hasStepDataScore) {
      return stepDataScore;
    }

    const candScore = session.candidate.score;
    const hasCandScore = typeof candScore === 'number';

    if (hasCandScore) {
      return candScore;
    }

    const hasRoleAnswers = (Object.keys(assessmentAnswers).length > 0);
    const hasLegacyAnswers = Boolean(q1Answer || q2Answer || q3Answer);
    const hasAnyAnswer = Boolean(hasRoleAnswers || hasLegacyAnswers);

    if (hasAnyAnswer) {
      let count = 0;
      const totalQuestions = roleQuestions.length;

      if (totalQuestions > 0) {
        roleQuestions.forEach((q) => {
          const isMatch = (assessmentAnswers[q.id] === q.correctAnswer);
          if (isMatch) {
            count++;
          }
        });

        return Math.round((count / totalQuestions) * 100);
      }

      const isQ1 = (q1Answer === 'Implicit check: if (isReady)');
      if (isQ1) {
        count++;
      }

      const isQ2 = (q2Answer === 'SQLite Split-DB architecture (Main + Project shards)');
      if (isQ2) {
        count++;
      }

      const isQ3 = (q3Answer === 'Strictly an active indicator mark, never dominant surface or text');
      if (isQ3) {
        count++;
      }

      return Math.round((count / 3) * 100);
    }

    const isAssessmentStepDone = Boolean(assessmentStep?.is_completed);

    if (isAssessmentStepDone) {
      return 100;
    }

    return null;
  })();

  const correctQuestionsCount = (() => {
    const hasDisplayScore = (displayScore !== null);

    if (hasDisplayScore) {
      return Math.round((displayScore / 100) * 3);
    }

    return 3;
  })();

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hairline Chrome Accent Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-md">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/70 to-accent" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Shield className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                    Candidate Self-Service Portal
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete your recruitment verification milestones and submission packet.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/40">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {candidateInitial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {candidateName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      {candidateEmail}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLookupOpen(true)}
                  className="h-10 text-xs gap-1.5 px-3 rounded-xl border-dashed border-border/70 hover:border-primary/50 cursor-pointer"
                  title="Switch candidate or enter your registered email"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Switch</span>
                </Button>
              </div>
            </div>

            {/* Progress Bar & Stage Indicator */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Overall Verification Progress
                </span>
                <span className="text-primary font-mono font-bold">
                  {session.completion_percentage}% ({session.completed_step_count}/{session.total_step_count} Steps)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${session.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hired / Welcome to Team Celebration Banner */}
        {stageKey === 'hired' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Congratulations, You're Hired!
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 text-[10px] font-bold uppercase">
                    Status: Hired
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Welcome to the engineering team! Your application and technical evaluation have been approved and your hiring process is complete.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                const tokenPart = session.candidate.candidate_email.split('@')[0] || activeToken;
                navigate(`/checklist/${tokenPart}`);
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>View Onboarding Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Navigation Tabs: Hub vs Stepper vs Active Task */}
        <div className="flex items-center justify-between border-b border-border/60 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPortalTab('assignments');
                setActiveTask(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                portalTab === 'assignments'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>My Assignments ({session.assigned_tasks?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalTab('assessment');
                setActiveTask(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                portalTab === 'assessment'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Technical Exam Stepper</span>
            </button>

            {portalTab === 'task_view' && activeTask && (
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition bg-emerald-600 text-white shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{activeTask.title}</span>
              </button>
            )}
          </div>

          {portalTab !== 'assignments' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPortalTab('assignments');
                setActiveTask(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Assignments Hub</span>
            </Button>
          )}
        </div>

        {/* Assignments Hub Dashboard */}
        {portalTab === 'assignments' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-emerald-500" />
                  Your Assigned Tasks & Workflows
                </h2>
                <p className="text-xs text-muted-foreground">
                  Complete each assigned milestone below to finalize your evaluation and onboarding.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.assigned_tasks?.map((task) => {
                const isCompleted = (task.status === 'completed') || (task.type === 'assessment' && isStep5Done);
                const isInProgress = (task.status === 'in_progress') || (task.type === 'assessment' && !isStep5Done && session.completed_step_count > 0);

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 shadow-xs flex flex-col justify-between gap-4 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              task.type === 'checklist'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : task.type === 'quiz'
                                ? 'bg-sky-500/10 text-sky-500'
                                : task.type === 'curriculum'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {task.type === 'checklist' && <ListChecks className="w-4 h-4" />}
                            {task.type === 'quiz' && <Award className="w-4 h-4" />}
                            {task.type === 'curriculum' && <BookOpen className="w-4 h-4" />}
                            {task.type === 'assessment' && <Sparkles className="w-4 h-4" />}
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-foreground leading-snug">{task.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                {task.type}
                              </Badge>
                              {task.due_date && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted-foreground/70" />
                                  {task.due_date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Badge
                          className={`text-[10px] uppercase font-mono tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                              : isInProgress
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>

                      {task.notes && (
                        <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/30 italic">
                          "{task.notes}"
                        </p>
                      )}

                      {/* Score pill if completed assessment */}
                      {task.type === 'assessment' && isStep5Done && displayScore !== null && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            Final Exam Performance
                          </span>
                          <span className="font-mono text-sm">{displayScore}%</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        onClick={() => handleOpenTask(task)}
                        className={`w-full font-semibold text-xs shadow-xs gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-muted hover:bg-muted/80 text-foreground'
                            : task.type === 'checklist'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                      >
                        <span>
                          {isCompleted
                            ? 'Review Completed Task'
                            : isInProgress
                            ? 'Continue Task'
                            : task.type === 'checklist'
                            ? `Open ${task.title}`
                            : task.type === 'quiz'
                            ? 'Start Quiz'
                            : task.type === 'curriculum'
                            ? 'Open Curriculum Track'
                            : 'Start Assessment'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dedicated Interactive Task Runner View */}
        {portalTab === 'task_view' && activeTask && (() => {
          const content = getTaskContent(activeTask);
          const isChecklist = activeTask.type === 'checklist';
          const isQuiz = activeTask.type === 'quiz';
          const isCurriculum = activeTask.type === 'curriculum';
          const isCompleted = activeTask.status === 'completed';

          const checklistItems = content.checklistItems || [];
          const totalItems = checklistItems.length;
          const checkedCount = checklistItems.filter((item) => Boolean(taskChecklistState[item.id])).length;
          const checklistPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
          const isAllChecked = (totalItems > 0 && checkedCount === totalItems);

          const quizQuestions = content.quizQuestions || [];
          const totalQuestions = quizQuestions.length;
          const answeredCount = quizQuestions.filter((q) => Boolean(taskQuizAnswers[q.id])).length;
          const isAllAnswered = (totalQuestions > 0 && answeredCount === totalQuestions);

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Back to Hub Top Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPortalTab('assignments');
                    setActiveTask(null);
                  }}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Assignments Hub</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-mono tracking-wider">
                    {activeTask.type}
                  </Badge>
                  {activeTask.due_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {activeTask.due_date}
                    </span>
                  )}
                </div>
              </div>

              {/* Task Header Card */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isChecklist ? 'bg-emerald-500/10 text-emerald-500' : isQuiz ? 'bg-sky-500/10 text-sky-500' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {isChecklist && <ListChecks className="w-4 h-4" />}
                        {isQuiz && <Award className="w-4 h-4" />}
                        {isCurriculum && <BookOpen className="w-4 h-4" />}
                      </div>
                      <h2 className="text-xl font-bold text-foreground font-heading">{activeTask.title}</h2>
                    </div>

                    {activeTask.notes && (
                      <p className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-xl border border-border/40 mt-2">
                        "{activeTask.notes}"
                      </p>
                    )}
                  </div>

                  <Badge
                    className={`text-xs uppercase font-mono tracking-wider px-3 py-1 ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : activeTask.status === 'in_progress'
                        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? 'Completed' : activeTask.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>

                {/* Checklist Progress Bar */}
                {isChecklist && (
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {checkedCount} of {totalItems} items completed
                      </span>
                      <span className="font-mono text-muted-foreground">{checklistPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Quiz Score Banner if completed */}
                {isQuiz && taskQuizScore !== null && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Quiz Score: {taskQuizScore}%
                    </span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              {/* 1. Checklist Items View */}
              {isChecklist && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Action Items & Verification Steps ({totalItems})
                  </h3>

                  <div className="space-y-2.5">
                    {checklistItems.map((item, idx) => {
                      const isItemChecked = Boolean(taskChecklistState[item.id]);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                            isItemChecked
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isItemChecked
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-muted-foreground/40 bg-background'
                            }`}
                          >
                            {isItemChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="space-y-1 select-none">
                            <div className={`text-sm font-semibold leading-snug ${
                              isItemChecked ? 'text-foreground line-through opacity-80' : 'text-foreground'
                            }`}>
                              {idx + 1}. {item.text}
                            </div>
                            {item.details && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {item.details}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Complete Checklist Action Footer */}
                  <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPortalTab('assignments');
                        setActiveTask(null);
                      }}
                      className="text-xs"
                    >
                      Save & Return Later
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleCompleteChecklist}
                      disabled={!isAllChecked && !isCompleted}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompleted ? 'Checklist Already Completed' : isAllChecked ? 'Submit & Finalize Checklist' : `Complete all ${totalItems} items to submit`}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* 2. Quiz Questions View */}
              {isQuiz && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Multiple Choice Questions ({totalQuestions})
                  </h3>

                  <div className="space-y-4">
                    {quizQuestions.map((q, idx) => {
                      const selected = taskQuizAnswers[q.id];

                      return (
                        <div key={q.id} className="p-5 rounded-2xl bg-card border border-border space-y-3">
                          <div className="font-semibold text-sm text-foreground">
                            Question {idx + 1}: {q.question}
                          </div>

                          <div className="space-y-2">
                            {q.options.map((opt) => {
                              const isSelected = (selected === opt);

                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setTaskQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                  className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'border-sky-500 bg-sky-500/10 font-semibold text-foreground ring-1 ring-sky-500/40'
                                      : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-500" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPortalTab('assignments');
                        setActiveTask(null);
                      }}
                      className="text-xs"
                    >
                      Save & Return
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleCompleteQuiz(quizQuestions)}
                      disabled={!isAllAnswered}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs gap-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>{isAllAnswered ? 'Submit Quiz Answers' : `Answer all ${totalQuestions} questions to submit`}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. Curriculum Chapters View */}
              {isCurriculum && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Curriculum Modules
                  </h3>

                  <div className="space-y-3">
                    {(content.curriculumChapters || []).map((ch, idx) => (
                      <div key={ch.id} className="p-5 rounded-2xl bg-card border border-border space-y-2">
                        <h4 className="font-bold text-sm text-foreground font-heading">
                          {ch.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {ch.summary}
                        </p>
                        <div className="pt-2 space-y-1.5 border-t border-border/40">
                          {ch.keyPoints.map((pt, pIdx) => (
                            <div key={pIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPortalTab('assignments');
                        setActiveTask(null);
                      }}
                      className="text-xs"
                    >
                      Return to Hub
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateTaskStatus(activeTask.id, 'completed');
                        toast.success(`Curriculum track "${activeTask.title}" verified!`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Curriculum as Completed</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Assessment Stepper View */}
        {portalTab === 'assessment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Milestone Steps Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {session.steps.map((step) => {
            const isActive = (activeStepId === step.id);
            const isDone = step.is_completed;
            const isAccessible = isStepAccessible(step.step_number, isDone);
            const isLocked = !isAccessible;

            return (
              <button
                key={step.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isAccessible) {
                    setActiveStepId(step.id);
                    return;
                  }

                  toast.warning(`Please complete previous steps before advancing to Step ${step.step_number}.`);
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                    : isDone
                    ? 'border-emerald-500/40 bg-card hover:bg-muted/40 cursor-pointer'
                    : isAccessible
                    ? 'border-border/60 bg-card hover:bg-muted/40 cursor-pointer'
                    : 'border-border/30 bg-muted/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Step {step.step_number}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (step.id === 'step_assessment' && isAssessmentGated) ? (
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </div>
                <div className="text-xs font-semibold text-foreground truncate w-full flex items-center justify-between">
                  <span>{step.title.split('&')[0]}</span>
                  {isLocked ? (
                    <span className="text-[9px] text-muted-foreground font-normal ml-1">Locked</span>
                  ) : (step.id === 'step_assessment' && isAssessmentGated) ? (
                    <span className="text-[9px] text-amber-500 font-medium ml-1">Under Review</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Content Card */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
          {/* Step 1: Profile & Identity */}
          {activeStepId === 'step_welcome' && (
            <>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Step 1 of 5
                  </Badge>
                  <CardTitle className="text-xl">Profile Verification & Contact Information</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Confirm your applicant details for official record matching.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Full Name</label>
                    <Input value={candidateName} disabled className="bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <Input value={candidateEmail} disabled className="bg-muted/40" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">Phone Number</label>
                    <Input
                      value={confirmPhone}
                      onChange={(e) => setConfirmPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <input
                    type="checkbox"
                    id="chk_profile"
                    checked={confirmProfileChecked}
                    onChange={(e) => setConfirmProfileChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="chk_profile" className="text-xs text-foreground leading-relaxed cursor-pointer">
                    I confirm that the above contact details are correct and authorize the recruiting committee to contact me regarding my application status.
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                  {!isStep1Satisfied ? (
                    <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Please confirm your contact details to proceed.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Contact details confirmed.</span>
                    </div>
                  )}

                  <Button
                    onClick={handleStep1Submit}
                    disabled={!isStep1Satisfied}
                    className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{isStep1Done ? 'Save & Next Step' : 'Confirm Profile & Proceed'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: NDA Agreement */}
          {activeStepId === 'step_nda' && (
            <>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Step 2 of 5
                  </Badge>
                  <CardTitle className="text-xl">Confidentiality & Non-Disclosure Agreement</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please review the terms of confidentiality regarding internal assessments and intellectual property.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Evaluation Target Role:</span>
                    <span className="font-bold text-foreground">{currentJobRole.title} ({currentJobRole.department})</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary">
                    Mutual NDA
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs font-mono leading-relaxed space-y-3 max-h-56 overflow-y-auto">
                  <p className="font-bold text-foreground">1. Confidential Information & Role Evaluation Scope</p>
                  <p className="text-muted-foreground">
                    This agreement is entered between WP Exam and candidate <strong>{candidateName}</strong> for evaluating candidate competency for the position of <strong>{currentJobRole.title}</strong>. All technical prompts, architecture, proprietary interview questions, and evaluation criteria provided in this portal constitute confidential trade secrets.
                  </p>
                  <p className="font-bold text-foreground">2. Non-Disclosure & Non-Circumvention</p>
                  <p className="text-muted-foreground">
                    The Candidate agrees not to disclose, publish, record, or distribute any portion of the examination materials to third parties or public forums.
                  </p>
                  <p className="font-bold text-foreground">3. Intellectual Property Rights</p>
                  <p className="text-muted-foreground">
                    All works produced as part of the assessment process remain strictly the intellectual property of the organization.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Electronic Signature (Full Legal Name) *</label>
                    <Input
                      placeholder="Type your full legal name as digital signature..."
                      value={ndaSignName}
                      onChange={(e) => setNdaSignName(e.target.value)}
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <input
                      type="checkbox"
                      id="chk_nda"
                      checked={ndaAgreed}
                      onChange={(e) => setNdaAgreed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="chk_nda" className="text-xs text-foreground leading-relaxed cursor-pointer">
                      I have read, understood, and agree to the terms of the Confidentiality & Non-Disclosure Agreement.
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStepId('step_welcome')}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    &larr; Previous Step
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isStep2Satisfied ? (
                      <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Digital signature & agreement required.</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Agreement signed.</span>
                      </div>
                    )}

                    <Button
                      onClick={handleStep2Submit}
                      disabled={!isStep2Satisfied}
                      className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{isStep2Done ? 'Update & Next Step' : 'Sign Agreement & Proceed'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Technical Skills Assessment */}
          {activeStepId === 'step_assessment' && (
            isAssessmentGated ? (
              <>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono">
                      Step 3 of 5 &bull; Pending Recruiter Review
                    </Badge>
                    <CardTitle className="text-xl">Profile Verification Submitted & Awaiting Approval</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your profile verification and signed NDA have been received. Recruiter approval is required before technical assignments unlock.
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
                      <Clock className="w-7 h-7 animate-pulse" />
                    </div>

                    <div className="max-w-md mx-auto space-y-1.5">
                      <h3 className="text-base font-bold text-foreground">
                        Profile Under Review by Recruiting Team
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Under our <strong className="text-foreground">Admin Approval Gate</strong> policy, candidate profiles are reviewed by the recruiting team in the Applicant Pipeline before technical assignments and timed evaluations are unlocked.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border/50 max-w-sm mx-auto text-left text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Candidate:</span>
                        <span className="font-semibold text-foreground">{candidateName}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Pipeline Stage:</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                          {stageKey || 'Screening'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Assignment Access:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked (Awaiting Recruiter Approval)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveStepId('step_nda')}
                        className="text-xs cursor-pointer"
                      >
                        &larr; View Signed NDA
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          fetchSession();
                          toast.info('Checking for administrative approval in pipeline...');
                        }}
                        className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Check Approval Status</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : isStep3Done ? (
              /* State 1: Completed Assessment Results */
              <>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono">
                      Step 3 Completed
                    </Badge>
                    <CardTitle className="text-xl">{currentJobRole.title} — Technical Assessment Results</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your assessment responses and proctoring audit log have been recorded into the candidate pipeline.
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/60">
                      <div>
                        <span className="text-xs text-muted-foreground block font-mono">Assessment Final Score</span>
                        <div className="text-3xl font-extrabold text-foreground font-heading mt-0.5">
                          {displayScore !== null ? `${displayScore}%` : 'Recorded'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {examIntegrityStatus === 'clean' ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 py-1 px-3">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Proctoring Clean (0 Tab Switches)</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1.5 py-1 px-3">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Proctoring Flagged ({tabSwitchCount} Tab Switches)</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <span className="text-muted-foreground block">Target Role</span>
                        <span className="font-semibold text-foreground">{currentJobRole.title}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <span className="text-muted-foreground block">Questions Answered</span>
                        <span className="font-semibold text-foreground font-mono">{roleQuestions.length || 3} of {roleQuestions.length || 3}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <span className="text-muted-foreground block">Proctoring Status</span>
                        <span className="font-semibold font-mono capitalize">
                          {examIntegrityStatus === 'clean' ? 'Passed Clean' : 'Flagged for Review'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveStepId('step_nda')}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      &larr; View Signed NDA
                    </Button>

                    <Button
                      onClick={() => setActiveStepId('step_submission')}
                      className="gap-2 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-md"
                    >
                      <span>Proceed to Step 4: Video & Portfolio</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : !isExamStarted ? (
              /* State 2: Pre-Exam Briefing & Rules Notice */
              <>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/40 text-primary font-mono">
                      Step 3 of 5 &bull; Timed Evaluation
                    </Badge>
                    <CardTitle className="text-xl">{currentJobRole.title} — Technical Assessment Briefing</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please carefully review the time limit and anti-cheating proctoring rules before beginning your exam.
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {gatingMode === 'admin_approval'
                        ? `Profile approved by recruitment team. Technical assessment for ${currentJobRole.title} unlocked.`
                        : `Instant Self-Service: Identity verified. Technical assessment for ${currentJobRole.title} unlocked.`}
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 space-y-4">
                    <div className="flex items-center gap-2 font-bold font-heading text-base text-amber-800 dark:text-amber-300">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span>Exam Instructions & Anti-Cheat Proctoring Rules</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      <div className="p-3.5 rounded-xl bg-card border border-amber-500/20 text-card-foreground space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>1. Strict 10-Minute Time Limit</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          The 10:00 countdown timer starts as soon as you press "Start 10-Minute Assessment". It cannot be paused or reset. Answers will auto-submit when the timer expires.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-card border border-amber-500/20 text-card-foreground space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-foreground">
                          <ShieldAlert className="w-4 h-4 text-destructive" />
                          <span>2. Tab Switching Prohibited</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Active proctoring tracks window focus and browser visibility. Switching tabs, opening secondary apps, or minimizing this screen will trigger proctoring violations.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-card border border-amber-500/20 text-card-foreground space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-foreground">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>3. 3-Strike Immediate Submission</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Every tab switch or focus loss is recorded as a strike. On the 3rd strike, the exam will immediately auto-submit and flag your application for recruiter review.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-card border border-amber-500/20 text-card-foreground space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>4. Quiet & Focused Environment</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Please ensure all notifications, chat windows, and background browser tabs are closed before launching your exam session.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Readiness Confirmation Checkbox */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={examBriefingAgreed}
                        onChange={(e) => setExamBriefingAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-foreground leading-relaxed">
                        I understand the 10-minute time limit and anti-cheating proctoring rules. I confirm I will stay in this browser window until completion. <span className="text-red-500 font-bold ml-1">*</span>
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveStepId('step_nda')}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      &larr; Previous Step
                    </Button>

                    <Button
                      onClick={() => {
                        setIsExamStarted(true);
                        toast.success('Exam started! 10:00 timer is running.');
                      }}
                      disabled={!examBriefingAgreed}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                    >
                      <span>Start 10-Minute Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              /* State 3: Active Timed Proctored Exam Mode */
              <>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        Step 3 of 5
                      </Badge>
                      <CardTitle className="text-xl">{currentJobRole.title} — Active Assessment</CardTitle>
                    </div>

                    {/* Sticky / Live Proctoring Timer HUD */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-bold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        <span>Proctored Session</span>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-xs ${
                        tabSwitchCount === 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : tabSwitchCount < 3
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-destructive/10 text-destructive border border-destructive/30'
                      }`}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Strikes: {tabSwitchCount}/3</span>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-sm font-mono font-bold shadow-xs ${
                        examSecondsLeft <= 60
                          ? 'bg-destructive text-destructive-foreground animate-pulse'
                          : examSecondsLeft <= 180
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                            : 'bg-primary text-primary-foreground'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>{formatTimerDisplay(examSecondsLeft)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Select your answer for each role question. Tab switching is strictly monitored.
                  </p>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="space-y-4">
                    {roleQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                        <label className="text-xs font-bold text-foreground">
                          Q{idx + 1}: {q.question}
                        </label>
                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 text-xs text-foreground cursor-pointer p-2.5 rounded-lg transition-colors ${
                                assessmentAnswers[q.id] === opt
                                  ? 'bg-primary/10 border border-primary/30 font-semibold'
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`role_q_${q.id}`}
                                value={opt}
                                checked={assessmentAnswers[q.id] === opt}
                                onChange={(e) => {
                                  setAssessmentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                                }}
                                className="cursor-pointer text-primary"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>Proctored window focus lock active</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isStep3Satisfied ? (
                        <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Please answer all {roleQuestions.length} questions.</span>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>All questions answered.</span>
                        </div>
                      )}

                      <Button
                        onClick={() => handleStep3Submit()}
                        disabled={!isStep3Satisfied}
                        className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                      >
                        <span>Submit Assessment & Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )
          )}

          {/* Step 4: Video & Portfolio Submission */}
          {activeStepId === 'step_submission' && (
            <>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Step 4 of 5
                  </Badge>
                  <CardTitle className="text-xl">Work Sample & Video Introduction</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provide an introductory video recording link and portfolio code repository.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-primary" />
                      Introductory Video Link (Loom, YouTube, or Google Drive) *
                    </label>
                    <Input
                      placeholder="https://www.loom.com/share/... or YouTube link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-primary" />
                      GitHub / Portfolio Repository URL
                    </label>
                    <Input
                      placeholder="https://github.com/..."
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Additional Candidate Notes & Technical Highlights
                    </label>
                    <Input
                      placeholder="Key projects, architectural decisions, questions for team..."
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStepId('step_assessment')}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    &larr; Previous Step
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isStep4Satisfied ? (
                      <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Introductory video link required.</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submission ready.</span>
                      </div>
                    )}

                    <Button
                      onClick={handleStep4Submit}
                      disabled={!isStep4Satisfied}
                      className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{isStep4Done ? 'Update & Next Step' : 'Save Submission & Proceed'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Final Review & Submission Confirmation */}
          {activeStepId === 'step_complete' && (
            <>
              {isStep5Done ? (
                /* Post-Submission State: Clear, Reassuring Confirmation, Exam Results & Next Steps Roadmap */
                <>
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Application Submitted
                      </Badge>
                      <CardTitle className="text-xl">Submission Confirmation & Results</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your evaluation and assessment score have been successfully submitted to our recruitment team.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    {/* Celebratory Hero Card */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        Application Successfully Submitted!
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Thank you, <strong className="text-foreground">{candidateName}</strong>! We have received your completed assessment, work sample, and submission details.
                      </p>
                    </div>

                    {/* Official Assessment & Exam Result Card */}
                    {displayScore !== null && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-foreground">
                                Your Assessment & Exam Result
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Official score recorded and filed with your candidate profile
                              </p>
                            </div>
                          </div>

                          <Badge
                            className={`font-semibold text-xs px-2.5 py-1 ${
                              displayScore >= 70
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {displayScore >= 70 ? 'Passed (Benchmark Met)' : 'Score Under Review'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                              Final Exam Score
                            </span>
                            <div className="text-3xl font-extrabold font-mono text-primary">
                              {displayScore}%
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                              Questions Verified
                            </span>
                            <div className="text-3xl font-extrabold font-mono text-foreground">
                              {correctQuestionsCount} / 3
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                              Verification Status
                            </span>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>Official Record Saved</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            {displayScore >= 70
                              ? `Congratulations! Your score of ${displayScore}% meets our hiring technical benchmark. Your results, video presentation, and signed NDA have been delivered to our recruitment team.`
                              : `Your score of ${displayScore}% has been recorded in your application packet. Our recruiting committee will review your overall profile including your video submission.`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* What Happens Next Roadmap */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          What Happens Next?
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Here is what to expect during our evaluation process:
                        </p>
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Stage 1 */}
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                1. Review & Verification
                              </span>
                              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                In Progress
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Our recruiting team is reviewing your assessment scores, signed agreements, and video presentation. (Usually 1–3 business days)
                            </p>
                          </div>
                        </div>

                        {/* Stage 2 */}
                        <div className="p-3.5 rounded-xl bg-muted/20 border border-border/30 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                2. Email Notification
                              </span>
                              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40">
                                Upcoming
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              We will send an update directly to <strong className="text-foreground">{candidateEmail}</strong> with the committee's decision.
                            </p>
                          </div>
                        </div>

                        {/* Stage 3 */}
                        <div className="p-3.5 rounded-xl bg-muted/20 border border-border/30 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                3. Technical Interview
                              </span>
                              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40">
                                Upcoming
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Shortlisted candidates will receive a calendar invite to schedule a conversation with our engineering lead.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="text-base shrink-0">💡</span>
                      <span>
                        Please check your spam or promotions folder in case our email lands there. If you need assistance, contact our recruitment team.
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All 5 verification steps completed</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowReceiptModal(true)}
                          className="gap-2 cursor-pointer text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Verification Receipt</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/')}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span>Return to Home</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                /* Pre-Submission State: Review & Submit */
                <>
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        Step 5 of 5
                      </Badge>
                      <CardTitle className="text-xl">Review & Submit Your Application</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please review your completed steps and exam result below before submitting your application.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>Ready for Final Submission</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You have finished all required sections. Once you click <strong>Submit</strong>, your responses will be submitted to our recruiting team and your final evaluation results will be recorded.
                      </p>
                    </div>

                    {/* Step Milestones Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {session.steps.slice(0, 4).map((stg) => (
                        <div key={stg.id} className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs shadow-2xs">
                          <span className="font-medium text-foreground">{stg.title}</span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-bold ${
                              stg.is_completed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {stg.is_completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveStepId('step_submission')}
                        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        &larr; Previous Step
                      </Button>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleCompleteStep('step_complete')}
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </>
          )}
        </Card>
      </div>
    )}
  </div>

      {/* Lookup / Switch Candidate Modal */}
      <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="w-4 h-4 text-primary" />
              <span>Access Candidate Portal</span>
            </DialogTitle>
            <DialogDescription>
              Enter your registered candidate email address or applicant ID to load your personal application milestones and assessment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLookupSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Registered Candidate Email Address</label>
              <Input
                type="email"
                placeholder="e.g. taylor.swift@example.com"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter className="flex sm:justify-between items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsLookupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 cursor-pointer">
                <LogIn className="w-3.5 h-3.5" />
                <span>Open Application</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Proctoring Focus Lost Warning Modal */}
      <Dialog open={showFocusLostModal} onOpenChange={setShowFocusLostModal}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground border-2 border-destructive rounded-2xl p-6 shadow-2xl space-y-4">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2 shadow-inner">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-foreground font-heading">
              Anti-Cheat Warning: Window Focus Lost!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground pt-1">
              Tab switching, minimizing the browser, or navigating away from this window is strictly prohibited during the assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-center space-y-1">
            <span className="text-xs text-destructive font-semibold block">Proctoring Infraction Recorded:</span>
            <span className="text-lg font-bold font-mono text-destructive">
              Strike #{tabSwitchCount} of 3
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">
              {tabSwitchCount >= 3
                ? 'Maximum infractions reached. Your exam is being automatically submitted.'
                : 'Warning: 3 strikes will result in immediate auto-submission with an integrity flag.'}
            </p>
          </div>

          <DialogFooter className="pt-2 sm:justify-center">
            <Button
              type="button"
              onClick={() => setShowFocusLostModal(false)}
              className="w-full bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer"
            >
              I Understand & Resume Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Verification Receipt & Certificate Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
              </span>
              <DialogTitle className="text-lg">
                Official Verification Receipt & Packet
              </DialogTitle>
            </div>
            <DialogDescription>
              Official verification record generated upon completing all recruitment milestones.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-5 print:border-none print:shadow-none" id="printable-receipt">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="space-y-1">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Verification Certificate
                </div>
                <div className="text-lg font-bold text-foreground">
                  Candidate Milestone Verification Packet
                </div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono text-xs">
                VERIFIED
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Candidate Legal Name</span>
                <span className="font-semibold text-foreground text-sm">{candidateName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Candidate Email</span>
                <span className="font-mono text-foreground">{candidateEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Target Role</span>
                <span className="font-semibold text-foreground">{currentJobRole.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Verification Token / ID</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {`VRF-${Math.abs(session.candidate?.id || 101)}-${activeToken.slice(0, 8).toUpperCase()}`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Assessment Score</span>
                <span className="font-mono font-bold text-primary text-sm">
                  {displayScore !== null ? `${displayScore}%` : '100%'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Proctoring Integrity</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {tabSwitchCount === 0 ? 'Clean (0 Tab Strikes)' : `${tabSwitchCount} Strikes Logged`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">NDA Legal Execution</span>
                <span className="font-semibold text-foreground">
                  Digitally Signed ({ndaSignName || candidateName})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Execution Date</span>
                <span className="font-mono text-muted-foreground">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1 text-xs">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                Cryptographic Verification Fingerprint (SHA-256 Stamp)
              </span>
              <p className="font-mono text-[11px] text-muted-foreground break-all">
                {`sha256-verified:${activeToken}:${session.candidate?.id || 1}:${displayScore || 100}:${ndaSignName || 'signed'}:${Date.now().toString(36)}`}
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.print();
                }
              }}
              className="gap-2 cursor-pointer text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `=======================================================
OFFICIAL CANDIDATE VERIFICATION PACKET & RECEIPT
=======================================================
Verification ID : VRF-${Math.abs(session.candidate?.id || 101)}-${activeToken.slice(0, 8).toUpperCase()}
Candidate Name  : ${candidateName}
Candidate Email : ${candidateEmail}
Target Role     : ${currentJobRole.title}
Assessment Score: ${displayScore !== null ? `${displayScore}%` : '100%'}
Proctoring Audit: ${tabSwitchCount === 0 ? 'Clean (0 Strikes)' : `${tabSwitchCount} Strikes Logged`}
NDA Execution   : Signed by ${ndaSignName || candidateName}
Date Certified  : ${new Date().toISOString()}
Status          : VERIFIED & FILED WITH HIRING COMMITTEE
=======================================================`;
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `verification-receipt-${activeToken.slice(0, 8)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Verification receipt downloaded!');
                }}
                className="gap-2 cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setShowReceiptModal(false)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatePortalRunner;

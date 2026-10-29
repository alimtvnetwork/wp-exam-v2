import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Share2,
  Copy,
  ExternalLink,
  Eye,
  Shield,
  Flag,
  Check,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  INITIAL_CATEGORIES,
  STORAGE_KEY as CURRICULUM_STORAGE_KEY,
  CategoryItem,
} from '@/components/admin/project-hierarchy-manager';
import {
  SEEDED_FOCUS_QUIZZES,
  FOCUS_QUIZZES_LIST_STORAGE_KEY,
} from '@/components/admin/focus-quiz-editor';
import { getJobRoles } from '@/lib/role-assignments';
import { FocusQuizConfig } from '@/components/runner/FocusQuizRunner';

export interface QuestionAnalytics {
  id: string;
  number: number;
  title: string;
  type: string;
  totalAnswers: number;
  failureCount: number;
  failureRate: number;
  hasHighFailureAlert: boolean;
}

export interface ProjectAnalytics {
  projectId: string;
  projectTitle: string;
  sourceType: 'curriculum' | 'focus_quiz' | 'role_assessment';
  totalAssigned: number;
  totalCompleted: number;
  totalFailed: number;
  passRate: number;
  isPublicShared: boolean;
  authenticatedCount: number;
  anonymousCount: number;
  questions: QuestionAnalytics[];
}

export interface QuestionReport {
  id: string;
  project_id: string;
  question_id: string;
  question_title?: string;
  report_type: 'feedback' | 'bug' | 'typo' | 'dispute';
  feedback_text: string;
  user_identifier: string;
  status: 'open' | 'under_review' | 'resolved';
  created_at: string;
}

export interface QuizSubmissionRecord {
  id: string;
  quiz_id: string;
  quiz_title?: string;
  candidate_name?: string;
  candidate_email: string;
  is_anonymous?: boolean;
  score: number;
  total: number;
  percentage: number;
  is_passed: boolean;
  wrong_question_ids?: string[];
  answers?: Record<string, unknown>;
  submitted_at: string;
}

export interface DynamicCourseOption {
  projectId: string;
  projectTitle: string;
  categoryTitle: string;
  sourceType: 'curriculum' | 'focus_quiz' | 'role_assessment';
  passingScore: number;
  questions: Array<{
    id: string;
    title: string;
    type: string;
    correctAnswer?: string | string[];
    options?: string[];
  }>;
}

export const STORAGE_KEY_REPORTS = 'wp_exam_question_reports';
export const STORAGE_KEY_SHARING = 'wp_exam_analytics_sharing_settings';
export const STORAGE_KEY_SUBMISSIONS = 'wp_exam_quiz_submissions';

// Exported for backwards-compatibility with existing unit test assertions
export const SAMPLE_PROJECT_ANALYTICS: ProjectAnalytics[] = [
  {
    projectId: 'proj-onboarding-101',
    projectTitle: 'Staff Onboarding & Security Fundamentals',
    sourceType: 'curriculum',
    totalAssigned: 84,
    totalCompleted: 68,
    totalFailed: 16,
    passRate: 81,
    isPublicShared: true,
    authenticatedCount: 52,
    anonymousCount: 16,
    questions: [
      {
        id: 'q1',
        number: 1,
        title: 'Two-Factor Authentication Setup Protocol',
        type: 'mcq',
        totalAnswers: 68,
        failureCount: 4,
        failureRate: 6,
        hasHighFailureAlert: false,
      },
      {
        id: 'q2',
        number: 2,
        title: 'Phishing Simulation Link Verification',
        type: 'multiselect',
        totalAnswers: 68,
        failureCount: 31,
        failureRate: 46,
        hasHighFailureAlert: true,
      },
      {
        id: 'q3',
        number: 3,
        title: 'Client Data Redaction Workflowy Architecture',
        type: 'url_submission',
        totalAnswers: 68,
        failureCount: 12,
        failureRate: 18,
        hasHighFailureAlert: false,
      },
      {
        id: 'q4',
        number: 4,
        title: 'Incident Escalation SLA Hierarchy',
        type: 'paragraph',
        totalAnswers: 68,
        failureCount: 29,
        failureRate: 43,
        hasHighFailureAlert: true,
      },
    ],
  },
  {
    projectId: 'proj-wp-architect',
    projectTitle: 'WordPress Core & Plugin Engineering Exam',
    sourceType: 'role_assessment',
    totalAssigned: 42,
    totalCompleted: 30,
    totalFailed: 12,
    passRate: 71,
    isPublicShared: false,
    authenticatedCount: 30,
    anonymousCount: 0,
    questions: [
      {
        id: 'wq1',
        number: 1,
        title: 'Hook Lifecycle Execution Order (plugins_loaded vs init)',
        type: 'mcq',
        totalAnswers: 30,
        failureCount: 7,
        failureRate: 23,
        hasHighFailureAlert: false,
      },
      {
        id: 'wq2',
        number: 2,
        title: 'Non-Destructive Database Schema Migration via ALTER TABLE',
        type: 'paragraph',
        totalAnswers: 30,
        failureCount: 15,
        failureRate: 50,
        hasHighFailureAlert: true,
      },
    ],
  },
];

export const INITIAL_REPORTS: QuestionReport[] = [
  {
    id: 'rep_101',
    project_id: 'proj-onboarding-101',
    question_id: 'q2',
    question_title: 'Phishing Simulation Link Verification',
    report_type: 'bug',
    feedback_text: 'Submit button stayed grayed out when using Safari 17 on macOS Sonoma until page refreshed.',
    user_identifier: 'dev-alex@example.com',
    status: 'open',
    created_at: '2026-09-18 11:20',
  },
  {
    id: 'rep_102',
    project_id: 'proj-onboarding-101',
    question_id: 'q4',
    question_title: 'Incident Escalation SLA Hierarchy',
    report_type: 'feedback',
    feedback_text: 'The 2-hour SLA in the prompt contradicts the 4-hour requirement in Section 1 reading docs.',
    user_identifier: 'sarah.ops@example.com',
    status: 'under_review',
    created_at: '2026-09-18 10:45',
  },
  {
    id: 'rep_103',
    project_id: 'proj-wp-architect',
    question_id: 'wq2',
    question_title: 'Non-Destructive Database Schema Migration via ALTER TABLE',
    report_type: 'typo',
    feedback_text: 'Typo in subtitle: "destructve" is misspelled.',
    user_identifier: 'candidate_anon_192.168.1.42',
    status: 'resolved',
    created_at: '2026-09-17 17:15',
  },
];

// Initial realistic submissions for active courses
export const DEFAULT_DYNAMIC_SUBMISSIONS: QuizSubmissionRecord[] = [
  {
    id: 'sub_sec_1',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Elena Rostova',
    candidate_email: 'elena.rostova@example.com',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-25 14:20',
  },
  {
    id: 'sub_sec_2',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Marcus Vance',
    candidate_email: 'm.vance@techcorp.io',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-25 15:10',
  },
  {
    id: 'sub_sec_3',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Aisha Al-Mansoor',
    candidate_email: 'aisha.m@devnetwork.org',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-25 16:45',
  },
  {
    id: 'sub_sec_4',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'David Chen',
    candidate_email: 'david.chen@cloudscale.net',
    is_anonymous: false,
    score: 50,
    total: 100,
    percentage: 50,
    is_passed: false,
    wrong_question_ids: ['q2'],
    submitted_at: '2026-10-25 17:30',
  },
  {
    id: 'sub_sec_5',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Sofia Gomez',
    candidate_email: 'sofia.g@innovate.co',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 09:15',
  },
  {
    id: 'sub_sec_6',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Liam O\'Connor',
    candidate_email: 'liam.oc@startuphub.io',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 10:40',
  },
  {
    id: 'sub_sec_7',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Maya Patel',
    candidate_email: 'maya.p@fintechlab.com',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 11:25',
  },
  {
    id: 'sub_sec_8',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Lucas Silva',
    candidate_email: 'lucas.s@brazildev.io',
    is_anonymous: false,
    score: 50,
    total: 100,
    percentage: 50,
    is_passed: false,
    wrong_question_ids: ['q1'],
    submitted_at: '2026-10-26 13:00',
  },
  {
    id: 'sub_sec_9',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Chloe Bennett',
    candidate_email: 'chloe.b@nordicai.se',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 14:45',
  },
  {
    id: 'sub_sec_10',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Noah Kim',
    candidate_email: 'noah.k@seoultech.kr',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 16:10',
  },
  {
    id: 'sub_sec_11',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Anonymous Candidate',
    candidate_email: 'anonymous_candidate',
    is_anonymous: true,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-27 08:30',
  },
  {
    id: 'sub_sec_12',
    quiz_id: 'proj_sec_101',
    quiz_title: 'Security Compliance & Password Hygiene',
    candidate_name: 'Anonymous Candidate',
    candidate_email: 'anonymous_candidate',
    is_anonymous: true,
    score: 50,
    total: 100,
    percentage: 50,
    is_passed: false,
    wrong_question_ids: ['q2'],
    submitted_at: '2026-10-27 09:50',
  },
  // custom-focus-quiz submissions
  {
    id: 'sub_fq_1',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Marcus Vance',
    candidate_email: 'm.vance@techcorp.io',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 12:10',
  },
  {
    id: 'sub_fq_2',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Elena Rostova',
    candidate_email: 'elena.rostova@example.com',
    is_anonymous: false,
    score: 83,
    total: 100,
    percentage: 83,
    is_passed: true,
    wrong_question_ids: ['q2'],
    submitted_at: '2026-10-26 13:20',
  },
  {
    id: 'sub_fq_3',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'David Chen',
    candidate_email: 'david.chen@cloudscale.net',
    is_anonymous: false,
    score: 50,
    total: 100,
    percentage: 50,
    is_passed: false,
    wrong_question_ids: ['q2', 'q4', 'q5'],
    submitted_at: '2026-10-26 14:05',
  },
  {
    id: 'sub_fq_4',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Aisha Al-Mansoor',
    candidate_email: 'aisha.m@devnetwork.org',
    is_anonymous: false,
    score: 83,
    total: 100,
    percentage: 83,
    is_passed: true,
    wrong_question_ids: ['q2'],
    submitted_at: '2026-10-26 15:30',
  },
  {
    id: 'sub_fq_5',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Sofia Gomez',
    candidate_email: 'sofia.g@innovate.co',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-26 16:50',
  },
  {
    id: 'sub_fq_6',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Liam O\'Connor',
    candidate_email: 'liam.oc@startuphub.io',
    is_anonymous: false,
    score: 67,
    total: 100,
    percentage: 67,
    is_passed: false,
    wrong_question_ids: ['q2', 'q3'],
    submitted_at: '2026-10-27 10:15',
  },
  {
    id: 'sub_fq_7',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Maya Patel',
    candidate_email: 'maya.p@fintechlab.com',
    is_anonymous: false,
    score: 100,
    total: 100,
    percentage: 100,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-27 11:45',
  },
  {
    id: 'sub_fq_8',
    quiz_id: 'custom-focus-quiz',
    quiz_title: 'Engineering Guidelines & Anti-Pattern Compliance Quiz',
    candidate_name: 'Lucas Silva',
    candidate_email: 'lucas.s@brazildev.io',
    is_anonymous: false,
    score: 83,
    total: 100,
    percentage: 83,
    is_passed: true,
    wrong_question_ids: ['q2'],
    submitted_at: '2026-10-27 13:10',
  },
  // frontend-developer technical assessment
  {
    id: 'sub_fe_1',
    quiz_id: 'frontend-developer',
    quiz_title: 'Frontend Developer (React / TypeScript)',
    candidate_name: 'Elena Rostova',
    candidate_email: 'elena.rostova@example.com',
    is_anonymous: false,
    score: 88,
    total: 100,
    percentage: 88,
    is_passed: true,
    wrong_question_ids: ['fe_q2'],
    submitted_at: '2026-10-25 11:00',
  },
  {
    id: 'sub_fe_2',
    quiz_id: 'frontend-developer',
    quiz_title: 'Frontend Developer (React / TypeScript)',
    candidate_name: 'Marcus Vance',
    candidate_email: 'm.vance@techcorp.io',
    is_anonymous: false,
    score: 95,
    total: 100,
    percentage: 95,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-25 13:40',
  },
  {
    id: 'sub_fe_3',
    quiz_id: 'frontend-developer',
    quiz_title: 'Frontend Developer (React / TypeScript)',
    candidate_name: 'Sofia Gomez',
    candidate_email: 'sofia.g@innovate.co',
    is_anonymous: false,
    score: 98,
    total: 100,
    percentage: 98,
    is_passed: true,
    wrong_question_ids: [],
    submitted_at: '2026-10-25 15:20',
  },
  {
    id: 'sub_fe_4',
    quiz_id: 'frontend-developer',
    quiz_title: 'Frontend Developer (React / TypeScript)',
    candidate_name: 'David Chen',
    candidate_email: 'david.chen@cloudscale.net',
    is_anonymous: false,
    score: 60,
    total: 100,
    percentage: 60,
    is_passed: false,
    wrong_question_ids: ['fe_q1', 'fe_q2'],
    submitted_at: '2026-10-26 14:15',
  },
];

// Helper: load stored submissions (or seed realistic initial data if storage is uninitialized)
export const loadStoredSubmissions = (): QuizSubmissionRecord[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
};

// Helper: load stored reports
export const loadStoredReports = (): QuestionReport[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
};

// Helper: load stored applicant count assigned to a course
export const getAssignedApplicantsCount = (courseId: string): number => {
  if (typeof window === 'undefined') {
    return 0;
  }
  try {
    const raw = localStorage.getItem('wp_exam_mock_applicants');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((applicant: { job_role?: string; assigned_tasks?: Array<{ id?: string; slug?: string }> }) => {
          const isRoleMatch = applicant.job_role === courseId;
          const hasTaskMatch = applicant.assigned_tasks?.some((t) => t.id === courseId || t.slug === courseId);
          return isRoleMatch || hasTaskMatch;
        }).length;
      }
    }
  } catch {
    // fallback
  }
  return 0;
};

// Helper: build real courses registry
export const loadDynamicCoursesRegistry = (): DynamicCourseOption[] => {
  const courses: DynamicCourseOption[] = [];

  // 1. Curriculum Projects
  let categoriesData: CategoryItem[] = INITIAL_CATEGORIES;
  if (typeof window !== 'undefined') {
    const savedCat = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (savedCat) {
      try {
        const parsed = JSON.parse(savedCat);
        if (Array.isArray(parsed)) {
          const hasItems = parsed.length > 0;
          if (hasItems) {
            categoriesData = parsed;
          }
        }
      } catch {
        // fallback
      }
    }
  }

  categoriesData.forEach((cat) => {
    cat.projects.forEach((proj) => {
      const quizSections = proj.sections?.filter((s) => s.content_type === 'quiz') || [];
      const questions: Array<{ id: string; title: string; type: string; correctAnswer?: string | string[]; options?: string[] }> = [];

      quizSections.forEach((sec) => {
        sec.questions?.forEach((q, idx) => {
          questions.push({
            id: q.id || `q_${idx + 1}`,
            title: q.title || `Question ${idx + 1}`,
            type: 'mcq',
            correctAnswer: q.correctAnswer,
            options: q.options,
          });
        });
      });

      courses.push({
        projectId: proj.id,
        projectTitle: proj.title,
        categoryTitle: cat.title,
        sourceType: 'curriculum',
        passingScore: 70,
        questions,
      });
    });
  });

  // 2. Focus Studio Quizzes
  let focusQuizzes: FocusQuizConfig[] = SEEDED_FOCUS_QUIZZES;
  if (typeof window !== 'undefined') {
    const savedQuizzes = localStorage.getItem(FOCUS_QUIZZES_LIST_STORAGE_KEY);
    if (savedQuizzes) {
      try {
        const parsed = JSON.parse(savedQuizzes);
        if (Array.isArray(parsed)) {
          const hasItems = parsed.length > 0;
          if (hasItems) {
            focusQuizzes = parsed;
          }
        }
      } catch {
        // fallback
      }
    }
  }

  focusQuizzes.forEach((quiz) => {
    const isDuplicate = courses.some((c) => c.projectId === quiz.id);
    if (!isDuplicate) {
      courses.push({
        projectId: quiz.id,
        projectTitle: quiz.title,
        categoryTitle: 'Focus Studio Quizzes',
        sourceType: 'focus_quiz',
        passingScore: quiz.passingScore || 70,
        questions: quiz.questions.map((q, idx) => ({
          id: q.id || `fq_${idx + 1}`,
          title: q.title.replace(/\*\*/g, ''),
          type: q.type || 'mcq',
          correctAnswer: q.correctAnswer,
          options: q.options?.map((o) => (typeof o === 'string' ? o : o.label)),
        })),
      });
    }
  });

  // 3. Technical Job Roles
  try {
    const roles = getJobRoles();
    roles.forEach((r) => {
      const isDuplicate = courses.some((c) => c.projectId === r.id);
      if (!isDuplicate) {
        const roleQuestions = (r.secondPhaseQuestions || []).map((q, idx) => ({
          id: q.id || `rq_${idx + 1}`,
          title: q.question,
          type: q.type || 'mcq',
          correctAnswer: q.correctAnswer,
          options: q.options,
        }));

        courses.push({
          projectId: r.id,
          projectTitle: r.title,
          categoryTitle: r.department || 'Technical Assessment',
          sourceType: 'role_assessment',
          passingScore: 70,
          questions: roleQuestions,
        });
      }
    });
  } catch {
    // fallback
  }

  return courses;
};

// Compute live analytics for a course from real stored submissions
export const computeCourseAnalytics = (
  course: DynamicCourseOption,
  allSubmissions: QuizSubmissionRecord[],
  isShared: boolean
): ProjectAnalytics => {
  const matchingSubmissions = allSubmissions.filter(
    (s) => s.quiz_id === course.projectId
  );

  const assignedCount = getAssignedApplicantsCount(course.projectId);
  const totalCompleted = matchingSubmissions.length;
  const totalAssigned = Math.max(totalCompleted, assignedCount);
  const totalFailed = matchingSubmissions.filter((s) => !s.is_passed).length;
  const totalPassed = totalCompleted - totalFailed;
  const passRate = totalCompleted > 0 ? Math.round((totalPassed / totalCompleted) * 100) : 0;

  const authenticatedCount = matchingSubmissions.filter(
    (s) => !s.is_anonymous && s.candidate_email && s.candidate_email !== 'anonymous_candidate'
  ).length;
  const anonymousCount = matchingSubmissions.filter(
    (s) => s.is_anonymous || !s.candidate_email || s.candidate_email === 'anonymous_candidate'
  ).length;

  const questions: QuestionAnalytics[] = course.questions.map((q, idx) => {
    let questionAnswersCount = 0;
    let failureCount = 0;

    matchingSubmissions.forEach((sub) => {
      const hasAnswerRecord = sub.answers && sub.answers[q.id] !== undefined;
      const isEvaluated = hasAnswerRecord || (sub.wrong_question_ids && sub.wrong_question_ids.length >= 0);

      if (isEvaluated) {
        questionAnswersCount++;
        const isRecordedWrong = sub.wrong_question_ids?.includes(q.id);
        if (isRecordedWrong) {
          failureCount++;
        } else if (hasAnswerRecord && q.correctAnswer) {
          const userAns = sub.answers ? sub.answers[q.id] : undefined;
          const isWrong = Array.isArray(q.correctAnswer)
            ? !Array.isArray(userAns) || userAns.sort().join(',') !== q.correctAnswer.sort().join(',')
            : String(userAns || '').trim() !== String(q.correctAnswer).trim();
          if (isWrong) {
            failureCount++;
          }
        }
      }
    });

    const failureRate = questionAnswersCount > 0 ? Math.round((failureCount / questionAnswersCount) * 100) : 0;
    const hasHighFailureAlert = questionAnswersCount > 0 && failureRate >= 40;

    return {
      id: q.id,
      number: idx + 1,
      title: q.title,
      type: q.type,
      totalAnswers: questionAnswersCount,
      failureCount,
      failureRate,
      hasHighFailureAlert,
    };
  });

  return {
    projectId: course.projectId,
    projectTitle: course.projectTitle,
    sourceType: course.sourceType,
    totalAssigned,
    totalCompleted,
    totalFailed,
    passRate,
    isPublicShared: isShared,
    authenticatedCount,
    anonymousCount,
    questions,
  };
};

export const AnalyticsDashboard: React.FC = () => {
  // Sharing settings map: projectId -> boolean
  const [sharingSettings, setSharingSettings] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SHARING);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore corrupted JSON
        }
      }
    }
    return {
      'proj_sec_101': true,
      'custom-focus-quiz': true,
    };
  });

  // Dynamic Courses Registry
  const [courses, setCourses] = useState<DynamicCourseOption[]>(() => loadDynamicCoursesRegistry());

  // Selected Course ID (defaults to the first real course)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const list = loadDynamicCoursesRegistry();
    return list[0]?.projectId || 'proj_sec_101';
  });

  // Submissions State
  const [submissions, setSubmissions] = useState<QuizSubmissionRecord[]>(() => loadStoredSubmissions());

  // Question & Bug Reports State
  const [reports, setReports] = useState<QuestionReport[]>(() => loadStoredReports());
  const [reportFilter, setReportFilter] = useState<'all' | 'bug' | 'feedback' | 'typo' | 'dispute'>('all');
  const [isFilterCurrentCourseOnly, setIsFilterCurrentCourseOnly] = useState<boolean>(true);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // New report dialog state
  const [isAddReportOpen, setIsAddReportOpen] = useState<boolean>(false);
  const [newReportQuestionId, setNewReportQuestionId] = useState<string>('');
  const [newReportType, setNewReportType] = useState<'bug' | 'feedback' | 'typo' | 'dispute'>('bug');
  const [newReportText, setNewReportText] = useState<string>('');
  const [newReportUser, setNewReportUser] = useState<string>('');

  // Sync state on real-time events
  const refreshTelemetryFromStorage = useCallback(() => {
    setCourses(loadDynamicCoursesRegistry());
    setSubmissions(loadStoredSubmissions());
    setReports(loadStoredReports());
  }, []);

  useEffect(() => {
    const handleSubmissionsUpdated = () => refreshTelemetryFromStorage();
    const handleReportsUpdated = () => refreshTelemetryFromStorage();
    const handleStorage = (e: StorageEvent) => {
      const isRelevant =
        e.key === STORAGE_KEY_SUBMISSIONS ||
        e.key === STORAGE_KEY_REPORTS ||
        e.key === STORAGE_KEY_SHARING;
      if (isRelevant) {
        refreshTelemetryFromStorage();
      }
    };

    window.addEventListener('wp_exam_submissions_updated', handleSubmissionsUpdated);
    window.addEventListener('wp_exam_reports_updated', handleReportsUpdated);
    window.addEventListener('wp_exam_roles_updated', handleSubmissionsUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('wp_exam_submissions_updated', handleSubmissionsUpdated);
      window.removeEventListener('wp_exam_reports_updated', handleReportsUpdated);
      window.removeEventListener('wp_exam_roles_updated', handleSubmissionsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshTelemetryFromStorage]);

  // Current active course configuration
  const currentCourse = useMemo(() => {
    return courses.find((c) => c.projectId === selectedProjectId) || courses[0];
  }, [courses, selectedProjectId]);

  // Current active course analytics (calculated dynamically)
  const currentAnalytics = useMemo(() => {
    if (!currentCourse) {
      return {
        projectId: 'empty',
        projectTitle: 'No Course Selected',
        sourceType: 'curriculum' as const,
        totalAssigned: 0,
        totalCompleted: 0,
        totalFailed: 0,
        passRate: 0,
        isPublicShared: false,
        authenticatedCount: 0,
        anonymousCount: 0,
        questions: [],
      };
    }
    const isShared = sharingSettings[currentCourse.projectId] !== undefined
      ? sharingSettings[currentCourse.projectId]
      : true;

    return computeCourseAnalytics(currentCourse, submissions, isShared);
  }, [currentCourse, submissions, sharingSettings]);

  // Toggle public sharing with persistent storage
  const handleTogglePublicSharing = (projectId: string, isShared: boolean) => {
    const nextSettings = { ...sharingSettings, [projectId]: isShared };
    setSharingSettings(nextSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SHARING, JSON.stringify(nextSettings, null, 2));
    }

    if (isShared) {
      toast.success('Public analytics sharing enabled. Candidates can now preview section difficulty.');
    } else {
      toast.info('Public analytics sharing disabled.');
    }
  };

  // Persist reports helper
  const persistReports = (updatedReports: QuestionReport[]) => {
    setReports(updatedReports);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updatedReports, null, 2));
      window.dispatchEvent(new Event('wp_exam_reports_updated'));
    }
  };

  // Resolve triage report
  const handleResolveReport = (reportId: string) => {
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return { ...r, status: 'resolved' as const };
      }
      return r;
    });
    persistReports(updated);
    toast.success('Report marked as resolved');
  };

  // Dismiss triage report
  const handleDismissReport = (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    persistReports(updated);
    toast.info('Report dismissed from triage');
  };

  // Log new triage report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = newReportText.trim();
    const hasText = cleanText.length > 0;
    if (!hasText) {
      toast.error('Report description is required.');
      return;
    }

    const matchedQ = currentCourse?.questions.find((q) => q.id === newReportQuestionId);
    const newRep: QuestionReport = {
      id: `rep_${Date.now()}`,
      project_id: currentCourse ? currentCourse.projectId : 'general',
      question_id: newReportQuestionId || 'general',
      question_title: matchedQ ? matchedQ.title : currentCourse?.projectTitle,
      report_type: newReportType,
      feedback_text: cleanText,
      user_identifier: newReportUser.trim() || 'evaluator_admin',
      status: 'open',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    persistReports([newRep, ...reports]);
    setNewReportText('');
    setNewReportUser('');
    setIsAddReportOpen(false);
    toast.success('Logged new report for triage!');
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const isCourseMatch = isFilterCurrentCourseOnly
        ? r.project_id === currentAnalytics.projectId
        : true;
      if (!isCourseMatch) {
        return false;
      }
      const isAll = reportFilter === 'all';
      if (isAll) {
        return true;
      }
      return r.report_type === reportFilter;
    });
  }, [reports, reportFilter, isFilterCurrentCourseOnly, currentAnalytics.projectId]);

  const openReportsCount = filteredReports.filter((r) => r.status === 'open').length;
  const bugsCount = filteredReports.filter((r) => r.report_type === 'bug').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Dynamic Course / Quiz Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-card rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
              Performance & Question Failure Analytics
            </h1>
            <Badge variant="outline" className="text-xs font-mono text-emerald-500 border-emerald-500/30">
              Live Storage Telemetry
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              {courses.length} Active Courses & Quizzes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Live evaluation metrics calculated directly from candidate quiz submissions, applicant assignments, and question reports.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          {/* Dynamic Course / Quiz Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-muted-foreground hidden lg:inline">Course:</span>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[180px] sm:w-[210px] md:w-[240px] h-9 text-xs bg-background">
                <SelectValue placeholder="Select Course / Quiz" />
              </SelectTrigger>
              <SelectContent className="max-h-[360px]">
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Active Courses & Quizzes ({courses.length})
                </div>
                {courses.map((c) => (
                  <SelectItem key={c.projectId} value={c.projectId} className="text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{c.projectTitle}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({c.questions.length}Q)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshTelemetryFromStorage}
            className="text-xs h-9 w-9 p-0 shrink-0"
            title="Refresh telemetry and re-scan submissions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs h-9 px-3 gap-1.5 shrink-0 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Preview View</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Assigned</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {currentAnalytics.totalAssigned}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>
              {currentAnalytics.totalAssigned > 0
                ? `${currentAnalytics.totalAssigned} candidate(s) enrolled`
                : 'No candidates enrolled yet'}
            </span>
          </div>
        </Card>

        {/* Completed */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {currentAnalytics.totalCompleted}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentAnalytics.totalAssigned > 0
              ? `${Math.round((currentAnalytics.totalCompleted / currentAnalytics.totalAssigned) * 100)}% completion rate`
              : '0% completion rate'}
          </div>
        </Card>

        {/* Failed */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Failed / Incomplete</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-400">
            {currentAnalytics.totalFailed}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentAnalytics.totalFailed > 0 ? 'Require retake or section review' : 'Zero failure records logged'}
          </div>
        </Card>

        {/* Pass Rate */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Pass Rate</span>
            <span className="text-xs font-mono font-bold text-amber-400">{currentAnalytics.passRate}%</span>
          </div>
          <div className="text-3xl font-black text-foreground">
            {currentAnalytics.passRate}%
          </div>
          <Progress value={currentAnalytics.passRate} className="h-1.5" />
        </Card>
      </div>

      {/* Public Sharing Control Banner */}
      <Card className="rounded-2xl border bg-card/60 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-sm text-foreground">Public Analytics & Difficulty Preview</span>
              {currentAnalytics.isPublicShared ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs border-emerald-500/30">
                  Publicly Shared
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Internal Only
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, candidates can view section difficulty index and challenge hotspots before starting the assessment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={currentAnalytics.isPublicShared}
              onCheckedChange={(checked) => handleTogglePublicSharing(currentAnalytics.projectId, checked)}
            />
            {currentAnalytics.isPublicShared && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wpexam.io';
                  navigator.clipboard.writeText(
                    `${origin}/runner?quiz=${currentAnalytics.projectId}&tab=analytics`
                  );
                  toast.success('Public analytics link copied to clipboard!');
                }}
                className="text-xs h-8"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Link
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Authenticated Submissions: <strong>{currentAnalytics.authenticatedCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🕵️ Anonymous Submissions: <strong>{currentAnalytics.anonymousCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Pass Benchmark: <strong>{currentCourse?.passingScore || 70}%</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Question-by-Question Failure Rate Breakdown */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Question-by-Question Failure Rate Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time difficulty analysis calculated from actual candidate choices. Questions with failure rates &ge; 40% are flagged with High Failure Alerts.
              </CardDescription>
            </div>

            <Badge variant="outline" className="text-xs font-mono">
              {currentAnalytics.questions.length} Evaluated Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-muted-foreground uppercase border-b bg-muted/40">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Question Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Submissions</th>
                  <th className="p-3 text-right">Failures</th>
                  <th className="p-3 text-right">Failure Rate</th>
                  <th className="p-3 text-center">Difficulty Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentAnalytics.questions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                      No questions configured for this course yet. Add questions via Curriculum Projects or Focus Studio.
                    </td>
                  </tr>
                ) : (
                  currentAnalytics.questions.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-bold text-muted-foreground">{q.number}</td>
                      <td className="p-3 font-semibold max-w-sm">{q.title}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs uppercase font-mono">
                          {q.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {q.totalAnswers}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-400">
                        {q.failureCount}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-bold ${q.hasHighFailureAlert ? 'text-rose-400' : 'text-slate-300'}`}>
                            {q.failureRate}%
                          </span>
                          <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${q.hasHighFailureAlert ? 'bg-rose-500' : 'bg-primary'}`}
                              style={{ width: `${q.failureRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {q.totalAnswers === 0 ? (
                          <Badge variant="outline" className="text-xs text-muted-foreground py-0.5">
                            Awaiting Attempts
                          </Badge>
                        ) : q.hasHighFailureAlert ? (
                          <Badge className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/30 text-xs gap-1 py-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            High Failure Alert
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs text-muted-foreground py-0.5">
                            Normal
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reported Questions & Bug Triage Card */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-400" />
                Reported Questions & Bug Triage
                <Badge variant="secondary" className="text-xs ml-1">
                  {filteredReports.length} Reports
                </Badge>
                {openReportsCount > 0 && (
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs">
                    {openReportsCount} Open
                  </Badge>
                )}
                {bugsCount > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                    {bugsCount} Technical Bugs
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Candidate-reported typos, ambiguous questions, correct answer disputes, and platform bugs submitted during quiz execution.
              </CardDescription>
            </div>

            {/* Filter and Add Report Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl flex-wrap">
                <Button
                  variant={reportFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setReportFilter('all')}
                  className="text-xs h-7 px-2"
                >
                  All
                </Button>
                <Button
                  variant={reportFilter === 'bug' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setReportFilter('bug')}
                  className="text-xs h-7 px-2 text-rose-400"
                >
                  🐛 Bugs
                </Button>
                <Button
                  variant={reportFilter === 'feedback' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setReportFilter('feedback')}
                  className="text-xs h-7 px-2 text-sky-400"
                >
                  💬 Feedback
                </Button>
                <Button
                  variant={reportFilter === 'typo' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setReportFilter('typo')}
                  className="text-xs h-7 px-2 text-amber-400"
                >
                  📝 Typos
                </Button>
                <Button
                  variant={reportFilter === 'dispute' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setReportFilter('dispute')}
                  className="text-xs h-7 px-2 text-indigo-400"
                >
                  ⚖️ Disputes
                </Button>
              </div>

              <Button
                variant={isFilterCurrentCourseOnly ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setIsFilterCurrentCourseOnly(!isFilterCurrentCourseOnly)}
                className="text-xs h-8 px-2.5"
                title="Toggle filtering reports for this course vs all courses"
              >
                {isFilterCurrentCourseOnly ? 'This Course' : 'All Courses'}
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setNewReportQuestionId(currentAnalytics.questions[0]?.id || 'general');
                  setIsAddReportOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3 gap-1 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Report</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-muted-foreground uppercase border-b bg-muted/40">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Target Question / Topic</th>
                  <th className="p-3">Report Description</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                      No candidate reports or issue flags logged for this assessment yet.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => {
                    const isResolved = rep.status === 'resolved';

                    return (
                      <tr key={rep.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 whitespace-nowrap text-muted-foreground font-mono text-xs">
                          {rep.created_at}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {rep.report_type === 'bug' && (
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                              🐛 Bug
                            </Badge>
                          )}
                          {rep.report_type === 'feedback' && (
                            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-xs">
                              💬 Feedback
                            </Badge>
                          )}
                          {rep.report_type === 'typo' && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              📝 Typo
                            </Badge>
                          )}
                          {rep.report_type === 'dispute' && (
                            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                              ⚖️ Dispute
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 font-semibold max-w-xs">
                          <div>{rep.question_title || rep.question_id}</div>
                          <span className="text-xs text-muted-foreground font-mono">
                            ID: {rep.question_id}
                          </span>
                        </td>
                        <td className="p-3 max-w-sm text-foreground leading-relaxed">
                          {rep.feedback_text}
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                          {rep.user_identifier}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {isResolved ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                              Resolved
                            </Badge>
                          ) : rep.status === 'under_review' ? (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              Under Review
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                              Open
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isResolved ? (
                              <span className="text-xs text-muted-foreground">Archived</span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(rep.id)}
                                className="text-xs h-6 px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDismissReport(rep.id)}
                              className="text-xs h-6 px-2 text-muted-foreground hover:text-rose-400"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Public View Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              Public Candidate Difficulty Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              Live preview calculated from {currentAnalytics.projectTitle}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div className="p-4 rounded-2xl bg-muted/60 border text-center space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Overall Course Difficulty</span>
              <div className="text-2xl font-black text-amber-400">
                {currentAnalytics.totalCompleted > 0 ? `${100 - currentAnalytics.passRate}% Difficulty Index` : 'No Data Yet'}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {currentAnalytics.totalCompleted} live evaluations
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Notable Challenge Hotspots:</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {currentAnalytics.questions
                  .filter((q) => q.hasHighFailureAlert)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-rose-300 truncate">Q{q.number}: {q.title}</span>
                      <Badge className="bg-rose-500 text-white text-xs shrink-0">
                        {q.failureRate}% Fail Rate
                      </Badge>
                    </div>
                  ))}
                {currentAnalytics.questions.filter((q) => q.hasHighFailureAlert).length === 0 && (
                  <div className="text-xs text-muted-foreground italic text-center py-2">
                    No high failure alert questions detected. All questions are within normal pass thresholds.
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-card p-3 rounded-xl border">
              ℹ️ Candidates are advised to review reading documentation and complete verification checklists before attempting this section.
            </div>

            <Button
              onClick={() => setIsPreviewOpen(false)}
              className="w-full rounded-xl text-xs font-bold"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Report Modal */}
      <Dialog open={isAddReportOpen} onOpenChange={setIsAddReportOpen}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Log Candidate Bug or Question Report
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record a typo, dispute, or question bug for triage and resolution.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReport} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Target Question</label>
              <Select value={newReportQuestionId} onValueChange={setNewReportQuestionId}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue placeholder="Select Question" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General / Entire Quiz</SelectItem>
                  {currentAnalytics.questions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      Q{q.number}: {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Report Category</label>
              <Select
                value={newReportType}
                onValueChange={(val: 'bug' | 'feedback' | 'typo' | 'dispute') => setNewReportType(val)}
              >
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Technical Bug</SelectItem>
                  <SelectItem value="feedback">💬 Feedback / Wording</SelectItem>
                  <SelectItem value="typo">📝 Typo or Grammatical Error</SelectItem>
                  <SelectItem value="dispute">⚖️ Correct Answer Dispute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description *</label>
              <Textarea
                placeholder="Explain the issue or discrepancy observed..."
                value={newReportText}
                onChange={(e) => setNewReportText(e.target.value)}
                rows={3}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Reporter Identifier (Email or User ID)</label>
              <Input
                placeholder="e.g. candidate@example.com or evaluator_jane"
                value={newReportUser}
                onChange={(e) => setNewReportUser(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddReportOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

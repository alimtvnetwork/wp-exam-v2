import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  MoreVertical,
  Star,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Lock,
  Unlock,
  SlidersHorizontal,
  ShieldCheck,
  ExternalLink,
  Award,
  Copy,
  Link2,
  ListChecks,
  BookOpen,
  Sparkles,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  getJobRoles,
  getJobRoleById,
  JobRole,
} from '@/lib/role-assignments';

export interface ApplicantStage {
  id: number;
  stage_key: string;
  stage_name: string;
  display_order: number;
  color_code: string;
}

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

export interface Applicant {
  id: number;
  candidate_name: string;
  candidate_email: string;
  phone?: string;
  job_role?: string;
  portal_token?: string;
  current_stage_key: string;
  form_id?: number;
  submission_id?: number;
  score?: number;
  rating?: number;
  notes?: string;
  assigned_tasks?: AssignedTask[];
  created_at?: string;
  updated_at?: string;
}

export interface AvailableTaskOption {
  id: string;
  title: string;
  type: 'assessment' | 'checklist' | 'quiz' | 'curriculum';
  category: string;
  slug: string;
  recommendedDueDate: string;
  defaultNotes: string;
}

export const AVAILABLE_SYSTEM_TASKS: AvailableTaskOption[] = [
  // 1. Entrance & Technical Evaluations
  {
    id: 'eval_tech_core',
    title: 'Technical Assessment & Skills Verification',
    type: 'assessment',
    category: 'Technical Entrance Exams',
    slug: 'technical-assessment',
    recommendedDueDate: '5 days',
    defaultNotes: 'Complete all 5 verification steps including technical evaluation.',
  },
  {
    id: 'eval_wp_fullstack',
    title: 'WordPress & React Fullstack Developer Assessment',
    type: 'assessment',
    category: 'Technical Entrance Exams',
    slug: 'wp-fullstack-exam',
    recommendedDueDate: '3 days',
    defaultNotes: 'Technical evaluation covering WordPress hooks, REST APIs, and React components.',
  },
  // 2. Onboarding & Compliance Checklists
  {
    id: 'chk_employee_onboarding',
    title: 'Employee Onboarding & Security Checklist',
    type: 'checklist',
    category: 'Onboarding & Compliance Checklists',
    slug: 'onboarding-checklist',
    recommendedDueDate: '1 day',
    defaultNotes: 'Hardware security keys, 2FA setup, and workstation compliance.',
  },
  {
    id: 'chk_workstation_setup',
    title: 'Workstation Compliance & SSH Key Verification',
    type: 'checklist',
    category: 'Onboarding & Compliance Checklists',
    slug: 'workstation-checklist',
    recommendedDueDate: '2 days',
    defaultNotes: 'Endpoint BitLocker encryption, primary YubiKey enrollment, and Git SSH commit signing.',
  },
  {
    id: 'chk_dev_prereqs',
    title: 'Developer Environment & GitHub 2FA Setup',
    type: 'checklist',
    category: 'Onboarding & Compliance Checklists',
    slug: 'dev-prereqs-checklist',
    recommendedDueDate: '1 day',
    defaultNotes: 'Configure GitHub hardware 2FA key and enroll password manager.',
  },
  // 3. Focus Quizzes
  {
    id: 'quiz_coding_guidelines',
    title: 'Coding Guidelines & Anti-Patterns Quiz',
    type: 'quiz',
    category: 'Focus Studio Quizzes',
    slug: 'coding-standards-quiz',
    recommendedDueDate: '3 days',
    defaultNotes: 'Compliance test on positive booleans, AppError wrappers, and LF endings.',
  },
  {
    id: 'quiz_playwright_qa',
    title: 'Playwright Test Automation & Triage Quiz',
    type: 'quiz',
    category: 'Focus Studio Quizzes',
    slug: 'qa-triage-quiz',
    recommendedDueDate: '4 days',
    defaultNotes: 'End-to-end testing principles and zero-storage CI/CD mandate.',
  },
  {
    id: 'quiz_sec_mastery',
    title: 'Security Mastery Quiz',
    type: 'quiz',
    category: 'Focus Studio Quizzes',
    slug: 'sec-mastery-quiz',
    recommendedDueDate: '3 days',
    defaultNotes: '16+ character password policies and endpoint security verification.',
  },
  // 4. Curriculum Tracks
  {
    id: 'track_sec_hygiene',
    title: 'Employee Security & Password Hygiene Track',
    type: 'curriculum',
    category: 'Curriculum & Learning Tracks',
    slug: 'sec-101-track',
    recommendedDueDate: '1 week',
    defaultNotes: 'Review security standard documentation, setup checklist, and mastery quiz.',
  },
  {
    id: 'track_coding_standards',
    title: 'Coding Guidelines & Anti-Patterns Track',
    type: 'curriculum',
    category: 'Curriculum & Learning Tracks',
    slug: 'coding-standards-track',
    recommendedDueDate: '5 days',
    defaultNotes: 'Banned anti-patterns, discrete branching immutability, and Go AppError rules.',
  },
  {
    id: 'track_product_standards',
    title: 'Product & QA Standards Curriculum',
    type: 'curriculum',
    category: 'Curriculum & Learning Tracks',
    slug: 'product-qa-track',
    recommendedDueDate: '1 week',
    defaultNotes: 'Quality assurance workflows, Playwright E2E suites, and bug triage.',
  },
];

const TASK_CATEGORIES: string[] = [
  'Technical Entrance Exams',
  'Onboarding & Compliance Checklists',
  'Focus Studio Quizzes',
  'Curriculum & Learning Tracks',
];

const DEADLINE_OPTIONS: { value: string; label: string }[] = [
  { value: '1 day', label: '1 Day' },
  { value: '2 days', label: '2 Days' },
  { value: '3 days', label: '3 Days' },
  { value: '4 days', label: '4 Days' },
  { value: '5 days', label: '5 Days' },
  { value: '6 days', label: '6 Days' },
  { value: '1 week', label: '1 Week' },
  { value: '2 weeks', label: '2 Weeks' },
  { value: '3 weeks', label: '3 Weeks' },
  { value: '1 month', label: '1 Month' },
];

const normalizeDeadline = (val: string): string => {
  const lower = (val || '').toLowerCase().trim();

  if (lower.includes('1 month')) {
    return '1 month';
  }

  if (lower.includes('3 week')) {
    return '3 weeks';
  }

  if (lower.includes('2 week')) {
    return '2 weeks';
  }

  if (lower.includes('1 week') || lower.includes('7 day')) {
    return '1 week';
  }

  if (lower.includes('6 day')) {
    return '6 days';
  }

  if (lower.includes('5 day')) {
    return '5 days';
  }

  if (lower.includes('4 day')) {
    return '4 days';
  }

  if (lower.includes('3 day')) {
    return '3 days';
  }

  if (lower.includes('2 day')) {
    return '2 days';
  }

  if (lower.includes('1 day') || lower.includes('day 1')) {
    return '1 day';
  }

  return '5 days';
};

const DEFAULT_STAGES: ApplicantStage[] = [
  { id: 1, stage_key: 'applied', stage_name: 'Applied', display_order: 0, color_code: '#64748b' },
  { id: 2, stage_key: 'screening', stage_name: 'Screening', display_order: 1, color_code: '#0284c7' },
  { id: 3, stage_key: 'exam', stage_name: 'Assessment', display_order: 2, color_code: '#8b5cf6' },
  { id: 4, stage_key: 'interview', stage_name: 'Interview', display_order: 3, color_code: '#f59e0b' },
  { id: 5, stage_key: 'offered', stage_name: 'Offered', display_order: 4, color_code: '#10b981' },
  { id: 6, stage_key: 'hired', stage_name: 'Hired', display_order: 5, color_code: '#059669' },
  { id: 7, stage_key: 'rejected', stage_name: 'Archived', display_order: 6, color_code: '#ef4444' },
];

const INITIAL_MOCK_APPLICANTS: Applicant[] = [
  {
    id: 1,
    candidate_name: 'Elena Rostova',
    candidate_email: 'elena.rostova@example.com',
    portal_token: 'cpt_elena_e49b81f20387a6c5',
    phone: '+1 (555) 234-5678',
    current_stage_key: 'applied',
    score: 88,
    rating: 4,
    notes: 'Strong portfolio in fullstack WordPress and React systems.',
    created_at: '2026-10-18 10:20:00',
  },
  {
    id: 2,
    candidate_name: 'Marcus Vance',
    candidate_email: 'm.vance@techcorp.io',
    portal_token: 'cpt_marcus_71a0d39e2c45b819',
    phone: '+1 (555) 876-5432',
    current_stage_key: 'screening',
    score: 95,
    rating: 5,
    notes: 'Reviewed past GitHub contributions. Clean code architecture.',
    created_at: '2026-10-17 14:15:00',
  },
  {
    id: 3,
    candidate_name: 'Aisha Al-Mansoor',
    candidate_email: 'aisha.m@devnetwork.org',
    portal_token: 'cpt_aisha_83bf6271c049e1da',
    phone: '+44 20 7946 0912',
    current_stage_key: 'exam',
    score: 92,
    rating: 5,
    notes: 'Completed technical verification test with 92% accuracy.',
    created_at: '2026-10-16 09:30:00',
  },
  {
    id: 4,
    candidate_name: 'David Chen',
    candidate_email: 'david.chen@cloudscale.net',
    portal_token: 'cpt_david_19ef47b3820a61cd',
    phone: '+1 (555) 345-6789',
    current_stage_key: 'interview',
    score: 84,
    rating: 4,
    notes: 'Round 1 technical interview passed. Panel round scheduled.',
    created_at: '2026-10-15 16:45:00',
  },
  {
    id: 5,
    candidate_name: 'Sofia Gomez',
    candidate_email: 'sofia.g@innovate.co',
    portal_token: 'cpt_sofia_52ac301984be7601',
    phone: '+1 (555) 987-6543',
    current_stage_key: 'offered',
    score: 98,
    rating: 5,
    notes: 'Formal offer extended for Senior Frontend Architect role.',
    created_at: '2026-10-14 11:00:00',
  },
];

export interface ApplicantPipelineKanbanProps {
  onNavigateTab?: (tab: string) => void;
}

export const ApplicantPipelineKanban: React.FC<ApplicantPipelineKanbanProps> = ({ onNavigateTab }) => {
  const navigate = useNavigate();
  const [stages, setStages] = useState<ApplicantStage[]>(DEFAULT_STAGES);
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_MOCK_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterStage, setSelectedFilterStage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [gatingMode, setGatingMode] = useState<'admin_approval' | 'instant_self_service'>('admin_approval');
  const [isSavingGating, setIsSavingGating] = useState(false);

  // New Candidate Dialog
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newPortalToken, setNewPortalToken] = useState<string>(() => {
    return 'cpt_' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newJobRole, setNewJobRole] = useState('frontend-developer');
  const [newStage, setNewStage] = useState('applied');
  const [newNotes, setNewNotes] = useState('');

  const handleOpenNewDialog = () => {
    const freshToken = 'cpt_' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setNewPortalToken(freshToken);
    setIsNewDialogOpen(true);
  };

  // Job Roles State
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

  // Assessment Results Dialog
  const [viewAssessmentCandidate, setViewAssessmentCandidate] = useState<Applicant | null>(null);

  // Note/Feedback Dialog
  const [activeFeedbackApplicant, setActiveFeedbackApplicant] = useState<Applicant | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);

  // Task Assignment Modal State
  const [activeAssignCandidate, setActiveAssignCandidate] = useState<Applicant | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('eval_tech_core');
  const [assignTaskType, setAssignTaskType] = useState<'assessment' | 'checklist' | 'quiz' | 'curriculum'>('assessment');
  const [assignTaskTitle, setAssignTaskTitle] = useState<string>('Technical Assessment & Verification');
  const [assignTaskSlug, setAssignTaskSlug] = useState<string>('technical-assessment');
  const [assignTaskDueDate, setAssignTaskDueDate] = useState<string>('5 days');
  const [assignTaskNotes, setAssignTaskNotes] = useState<string>('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState<boolean>(false);

  const fetchApplicantsAndStages = async () => {
    setIsLoading(true);

    try {
      const stagesRes = await unifiedFetch('/api/v1/applicants/stages', '/wp-json/wp-exam/v1/applicants/stages');
      const hasStagesSuccess = stagesRes.ok;

      if (hasStagesSuccess) {
        const json = await stagesRes.json();
        const stageList = json?.data ?? json;

        if (Array.isArray(stageList)) {
          const hasItems = stageList.length > 0;

          if (hasItems) {
            setStages(stageList);
          }
        }
      }

      const applicantsRes = await unifiedFetch('/api/v1/applicants', '/wp-json/wp-exam/v1/applicants');
      const hasApplicantsSuccess = applicantsRes.ok;

      if (hasApplicantsSuccess) {
        const json = await applicantsRes.json();
        const applicantList = json?.data ?? json;

        if (Array.isArray(applicantList)) {
          const hasItems = applicantList.length > 0;

          if (hasItems) {
            setApplicants(applicantList);
          }
        }
      }

      const settingsRes = await unifiedFetch('/api/v1/applicants/settings', '/wp-json/wp-exam/v1/applicants/settings');
      const hasSettingsSuccess = settingsRes.ok;

      if (hasSettingsSuccess) {
        const json = await settingsRes.json();
        const settingsData = json?.data ?? json;

        if (settingsData?.assessment_gating_mode) {
          setGatingMode(settingsData.assessment_gating_mode);
        }
      }
    } catch {
      // Graceful fallback to initial mock state in dev/standalone mode
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGatingMode = async (mode: 'admin_approval' | 'instant_self_service') => {
    setGatingMode(mode);
    setIsSavingGating(true);

    try {
      const res = await unifiedFetch('/api/v1/applicants/settings', '/wp-json/wp-exam/v1/applicants/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_gating_mode: mode }),
      });

      const isSuccess = res.ok;

      if (isSuccess) {
        toast.success(
          mode === 'admin_approval'
            ? 'Assessment gating set to Admin Approval Gate (Step 3 locked until manual approval)'
            : 'Assessment gating set to Instant Self-Service (Step 3 unlocks immediately upon profile verification)'
        );
      }
    } catch {
      toast.error('Failed to update assessment gating configuration');
    } finally {
      setIsSavingGating(false);
    }
  };

  useEffect(() => {
    fetchApplicantsAndStages();
  }, []);

  const handleStageTransition = async (applicantId: number, toStageKey: string, note?: string) => {
    const targetApplicant = applicants.find((a) => a.id === applicantId);
    const hasTarget = Boolean(targetApplicant);

    if (!hasTarget) {
      return;
    }

    const previousStageKey = targetApplicant?.current_stage_key;

    // Optimistic update
    setApplicants((prev) =>
      prev.map((app) => (app.id === applicantId ? { ...app, current_stage_key: toStageKey } : app))
    );

    const targetStageName = stages.find((s) => s.stage_key === toStageKey)?.stage_name || toStageKey;
    toast.success(`Moved ${targetApplicant?.candidate_name} to ${targetStageName}`);

    try {
      const response = await unifiedFetch('/api/v1/applicants/stage-transition', '/wp-json/wp-exam/v1/applicants/stage-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          candidate_email: targetApplicant?.candidate_email,
          to_stage_key: toStageKey,
          notes: note || `Stage transitioned from ${previousStageKey} to ${toStageKey}`,
        }),
      });

      const isFail = !response.ok;

      if (isFail) {
        // Rollback on network failure
        setApplicants((prev) =>
          prev.map((app) => (app.id === applicantId ? { ...app, current_stage_key: previousStageKey || 'applied' } : app))
        );
        toast.error('Failed to sync stage transition with server');
      } else {
        const json = await response.json();
        const serverApp = json?.data?.applicant;
        const hasServerId = Boolean(serverApp?.id);

        if (hasServerId) {
          const sId = Number(serverApp.id);
          setApplicants((prev) =>
            prev.map((app) => (app.candidate_email === targetApplicant?.candidate_email ? { ...app, ...serverApp, id: sId } : app))
          );
        }
      }
    } catch {
      // Standalone mode retains optimistic state
    }
  };

  const handleCreateApplicant = async () => {
    const isNameClean = newName.trim().length > 0;
    const isEmailClean = newEmail.trim().length > 0;

    if (!isNameClean) {
      toast.error('Candidate name is required');

      return;
    }

    if (!isEmailClean) {
      toast.error('Candidate email is required');

      return;
    }

    const newId = Date.now();
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const clientToken = `cpt_${randomHex}`;

    const candidatePayload: Applicant = {
      id: newId,
      candidate_name: newName.trim(),
      candidate_email: newEmail.trim(),
      phone: newPhone.trim(),
      job_role: newJobRole,
      portal_token: clientToken,
      current_stage_key: newStage,
      notes: newNotes.trim(),
      rating: 5,
      score: 100,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setApplicants((prev) => [candidatePayload, ...prev]);
    setIsNewDialogOpen(false);
    toast.success(`Added candidate: ${candidatePayload.candidate_name}`);

    // Reset form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewStage('applied');
    setNewNotes('');

    try {
      const res = await unifiedFetch('/api/v1/applicants', '/wp-json/wp-exam/v1/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidatePayload.candidate_name,
          candidate_email: candidatePayload.candidate_email,
          phone: candidatePayload.phone,
          stage_key: candidatePayload.current_stage_key,
          job_role: candidatePayload.job_role,
          notes: candidatePayload.notes,
        }),
      });

      const isSuccess = res.ok;

      if (isSuccess) {
        const json = await res.json();
        const serverApplicant = json?.data?.applicant ?? json?.data;
        const hasServerId = Boolean(serverApplicant?.id);

        if (hasServerId) {
          const sId = Number(serverApplicant.id);
          setApplicants((prev) =>
            prev.map((app) =>
              app.id === newId ? { ...app, ...serverApplicant, id: sId } : app
            )
          );
        }
      }
    } catch {
      // Standalone mode retains state
    }
  };

  const handleDeleteApplicant = async (id: number) => {
    const target = applicants.find((a) => a.id === id);
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Removed ${target?.candidate_name || 'candidate'}`);

    try {
      await fetch(`/wp-json/wp-exam/v1/applicants/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Standalone mode
    }
  };

  const handleSaveFeedback = async () => {
    const hasActive = Boolean(activeFeedbackApplicant);

    if (!hasActive) {
      return;
    }

    const applicantId = activeFeedbackApplicant?.id;

    if (!applicantId) {
      return;
    }

    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, notes: feedbackNotes, rating: feedbackRating } : app
      )
    );

    setActiveFeedbackApplicant(null);
    toast.success('Candidate feedback and rating updated');

    try {
      await unifiedFetch('/api/v1/applicants/feedback', '/wp-json/wp-exam/v1/applicants/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          candidate_email: activeFeedbackApplicant?.candidate_email,
          rating: feedbackRating,
          notes: feedbackNotes,
        }),
      });
    } catch {
      // Standalone mode
    }
  };

  const handleSelectAvailableTask = (taskId: string) => {
    setSelectedTaskId(taskId);

    const isCustom = taskId === 'custom_task';

    if (isCustom) {
      setAssignTaskTitle('');
      setAssignTaskSlug('custom-assignment');
      return;
    }

    const matched = AVAILABLE_SYSTEM_TASKS.find((t) => t.id === taskId);
    const hasMatched = Boolean(matched);

    if (hasMatched) {
      const task = matched!;
      setAssignTaskType(task.type);
      setAssignTaskTitle(task.title);
      setAssignTaskSlug(task.slug);
      setAssignTaskDueDate(normalizeDeadline(task.recommendedDueDate));
      setAssignTaskNotes(task.defaultNotes);
    }
  };

  const handleOpenAssignTask = (candidate: Applicant) => {
    setActiveAssignCandidate(candidate);
    const defaultTask = AVAILABLE_SYSTEM_TASKS[0];
    setSelectedTaskId(defaultTask.id);
    setAssignTaskType(defaultTask.type);
    setAssignTaskTitle(defaultTask.title);
    setAssignTaskSlug(defaultTask.slug);
    setAssignTaskDueDate(normalizeDeadline(defaultTask.recommendedDueDate));
    setAssignTaskNotes(defaultTask.defaultNotes);
  };

  const handleSaveAssignTask = async () => {
    const hasCandidate = Boolean(activeAssignCandidate);

    if (!hasCandidate) {
      return;
    }

    const cleanTitle = assignTaskTitle.trim();
    const hasTitle = Boolean(cleanTitle);

    if (!hasTitle) {
      toast.error('Task title is required');
      return;
    }

    setIsSubmittingAssign(true);

    const targetCandidate = activeAssignCandidate!;
    const fallbackSlug = assignTaskType === 'checklist' ? 'onboarding-checklist' : 'technical-assessment';
    const finalSlug = assignTaskSlug.trim() || fallbackSlug;

    const newTask: AssignedTask = {
      id: 'task_' + Date.now(),
      title: cleanTitle,
      type: assignTaskType,
      slug: finalSlug,
      due_date: assignTaskDueDate,
      notes: assignTaskNotes.trim(),
      status: 'not_started',
      assigned_at: new Date().toISOString(),
    };

    setApplicants((prev) =>
      prev.map((app) => {
        const isTarget = app.id === targetCandidate.id;

        if (isTarget) {
          const currentTasks = app.assigned_tasks || [];
          return {
            ...app,
            assigned_tasks: [...currentTasks, newTask],
          };
        }

        return app;
      })
    );

    if (typeof window !== 'undefined') {
      const email = targetCandidate.candidate_email;
      const key = `wp_exam_assigned_tasks_${email}`;
      const existingStr = localStorage.getItem(key);
      let existingList: AssignedTask[] = [];

      if (existingStr) {
        try {
          const parsed = JSON.parse(existingStr);
          const isArr = Array.isArray(parsed);

          if (isArr) {
            existingList = parsed;
          }
        } catch {
          // Fallback to empty
        }
      }

      localStorage.setItem(key, JSON.stringify([...existingList, newTask]));
    }

    toast.success(`Assigned "${cleanTitle}" to ${targetCandidate.candidate_name}`);

    try {
      await unifiedFetch('/api/v1/applicants/assign-task', '/wp-json/wp-exam/v1/applicants/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: targetCandidate.id,
          candidate_email: targetCandidate.candidate_email,
          task: newTask,
        }),
      });
    } catch {
      // Local state is preserved
    } finally {
      setIsSubmittingAssign(false);
      setActiveAssignCandidate(null);
    }
  };

  const handleRemoveAssignTask = async (candidateId: number, taskId: string) => {
    const candidate = applicants.find((a) => a.id === candidateId);
    const hasCandidate = Boolean(candidate);

    if (!hasCandidate) {
      return;
    }

    const updatedTasks = (candidate?.assigned_tasks || []).filter((t) => t.id !== taskId);

    setApplicants((prev) =>
      prev.map((app) => (app.id === candidateId ? { ...app, assigned_tasks: updatedTasks } : app))
    );

    if (typeof window !== 'undefined') {
      const email = candidate?.candidate_email || '';
      const key = `wp_exam_assigned_tasks_${email}`;
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    }

    toast.success('Assigned task removed');
  };

  const filteredApplicants = applicants.filter((candidate) => {
    const matchesSearch =
      candidate.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.phone && candidate.phone.includes(searchQuery));

    const matchesStage = selectedFilterStage === 'all' || candidate.current_stage_key === selectedFilterStage;

    const isMatch = Boolean(matchesSearch && matchesStage);

    return isMatch;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto">
      {/* Hairline Chrome Accent Card */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-md">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/70 to-accent" />
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                Applicant Pipeline & Recruitment Kanban
              </h1>
              <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
                {applicants.length} Candidates
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Track candidate progression through sequential hiring stages, record evaluation feedback, and transition applicants with SQLite split-DB audit logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApplicantsAndStages}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Pipeline
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onNavigateTab) {
                  onNavigateTab('roles');
                  return;
                }

                navigate('/admin/roles');
              }}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Roles & Assessments</span>
            </Button>
            <Button
              size="sm"
              onClick={handleOpenNewDialog}
              className="gap-2 bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-background/80"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Stage:
            </span>
            <Button
              variant={selectedFilterStage === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilterStage('all')}
              className="h-7 text-xs px-2.5 rounded-lg"
            >
              All ({applicants.length})
            </Button>
            {stages.map((stg) => {
              const count = applicants.filter((a) => a.current_stage_key === stg.stage_key).length;

              return (
                <Button
                  key={stg.stage_key}
                  variant={selectedFilterStage === stg.stage_key ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilterStage(stg.stage_key)}
                  className="h-7 text-xs px-2.5 rounded-lg gap-1.5 shrink-0"
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: stg.color_code }}
                  />
                  {stg.stage_name} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assessment Gating Configuration Toolbar */}
      <div className="rounded-2xl bg-card border border-border/60 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-foreground font-heading">
                Assessment Gating Configuration
              </h2>
              {gatingMode === 'admin_approval' ? (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-medium">
                  Admin Approval Gate Active (Recommended)
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-medium">
                  Instant Self-Service Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Choose how candidates unlock their technical assignments and quizzes after verifying their profile and signing the NDA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            {/* Mode 1: Admin Approval Gate */}
            <button
              type="button"
              onClick={() => handleToggleGatingMode('admin_approval')}
              disabled={isSavingGating}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                gatingMode === 'admin_approval'
                  ? 'border-primary/80 bg-primary/10 ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/60 bg-muted/20 hover:bg-muted/40 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Approval Gate</span>
                </div>
                {gatingMode === 'admin_approval' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Step 3 (Assessment) stays physically locked until an admin manually clicks "Approve" in this Kanban dashboard.
              </p>
            </button>

            {/* Mode 2: Instant Self-Service */}
            <button
              type="button"
              onClick={() => handleToggleGatingMode('instant_self_service')}
              disabled={isSavingGating}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                gatingMode === 'instant_self_service'
                  ? 'border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/40 shadow-xs'
                  : 'border-border/60 bg-muted/20 hover:bg-muted/40 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                  <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant Self-Service</span>
                </div>
                {gatingMode === 'instant_self_service' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Step 3 unlocks immediately as soon as candidate confirms their profile and signs the NDA without waiting.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns with smooth horizontal scrolling */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-0.5">
          <span className="font-semibold text-foreground/85">Recruitment Stages ({stages.length})</span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md">
            Scroll horizontally to navigate all stages
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div className="w-full overflow-x-auto pb-6 pt-1 scrollbar-thin">
          <div className="flex gap-4 items-start min-w-max pb-2">
            {stages.map((stage, stageIndex) => {
              const stageCandidates = filteredApplicants.filter(
                (app) => app.current_stage_key === stage.stage_key
              );
              const nextStage = stages[stageIndex + 1];

              return (
                <div
                  key={stage.stage_key}
                  className="w-[320px] shrink-0 flex flex-col rounded-xl bg-card/75 border border-border/70 overflow-hidden shadow-xs hover:border-border transition-colors"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-border/40 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full ring-2 ring-background shrink-0"
                          style={{ backgroundColor: stage.color_code }}
                        />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {stage.stage_name}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="text-[11px] h-5 px-2 font-mono font-semibold">
                        {stageCandidates.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Candidates Column List */}
                  <div className="p-3 space-y-3 min-h-[460px] max-h-[calc(100vh-280px)] overflow-y-auto">
                    {stageCandidates.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/50 rounded-xl bg-muted/10 text-muted-foreground text-xs space-y-1.5">
                        <Briefcase className="w-5 h-5 opacity-40" />
                        <span className="font-medium">No candidates in this stage</span>
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <Card
                          key={candidate.id}
                          className="group relative bg-card hover:bg-muted/30 border-border/80 hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-xl overflow-hidden"
                        >
                          <CardHeader className="p-4 pb-2.5 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-foreground truncate">
                                  {candidate.candidate_name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5" title={candidate.candidate_email}>
                                  <Mail className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                                  <span className="truncate">{candidate.candidate_email}</span>
                                </p>
                                {candidate.job_role && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/30 text-primary font-mono truncate max-w-full">
                                      <Briefcase className="w-2.5 h-2.5 mr-1 inline shrink-0" />
                                      <span className="truncate">{getJobRoleById(candidate.job_role).title}</span>
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Transition To:
                                  </div>
                                  {stages
                                    .filter((s) => s.stage_key !== stage.stage_key)
                                    .map((s) => (
                                      <DropdownMenuItem
                                        key={s.stage_key}
                                        onClick={() => handleStageTransition(candidate.id, s.stage_key)}
                                        className="text-xs gap-2"
                                      >
                                        <span
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: s.color_code }}
                                        />
                                        {s.stage_name}
                                      </DropdownMenuItem>
                                    ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleOpenAssignTask(candidate)}
                                    className="text-xs gap-2 font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    Assign Assessment / Task
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActiveFeedbackApplicant(candidate);
                                      setFeedbackNotes(candidate.notes || '');
                                      setFeedbackRating(candidate.rating || 5);
                                    }}
                                    className="text-xs gap-2"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Add Evaluation Note
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setViewAssessmentCandidate(candidate)}
                                    className="text-xs gap-2 font-medium text-primary cursor-pointer"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    View Exam & Submissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const roleQuery = candidate.job_role ? `?role=${candidate.job_role}` : '';
                                      const portalToken = candidate.portal_token || ('cpt_' + candidate.id + '_' + candidate.candidate_email.split('@')[0]);
                                      const fullUrl = `${window.location.origin}/portal/${portalToken}${roleQuery}`;
                                      navigator.clipboard.writeText(fullUrl);
                                      toast.success(`Copied portal link: ${fullUrl}`);
                                    }}
                                    className="text-xs gap-2 cursor-pointer font-medium"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Portal Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const roleQuery = candidate.job_role ? `?role=${candidate.job_role}` : '';
                                      const portalToken = candidate.portal_token || ('cpt_' + candidate.id + '_' + candidate.candidate_email.split('@')[0]);
                                      window.open(`/portal/${portalToken}${roleQuery}`, '_blank');
                                    }}
                                    className="text-xs gap-2"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View Candidate Portal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteApplicant(candidate.id)}
                                    className="text-xs gap-2 text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Candidate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>

                          <CardContent className="p-4 pt-1 space-y-3">
                            {candidate.phone && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs py-1 border-t border-border/50">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                <span className="text-xs font-bold text-foreground">
                                  {candidate.rating || 5}/5
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium">Rating</span>
                              </div>

                              {candidate.score !== undefined && (
                                <Badge
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewAssessmentCandidate(candidate);
                                  }}
                                  title="Click to view exam score details"
                                  className="text-[11px] h-5 px-2 border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary font-mono font-medium cursor-pointer transition-colors"
                                >
                                  {candidate.score}% score
                                </Badge>
                              )}
                            </div>

                            {candidate.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/40 p-2.5 rounded-lg italic border border-border/40 leading-relaxed">
                                "{candidate.notes}"
                              </p>
                            )}

                            {/* Assessment Gating Approval Action */}
                            {(() => {
                              const isPreAssessment = (candidate.current_stage_key === 'applied' || candidate.current_stage_key === 'screening');
                              const isAssessmentUnlocked = ['exam', 'assessment', 'interview', 'offered', 'hired'].includes(candidate.current_stage_key);
                              const assessmentStage = stages.find((s) => s.stage_key === 'assessment' || s.stage_key === 'exam') || stages[2];
                              const assessmentStageKey = assessmentStage?.stage_key || 'exam';

                              return (
                                <div className="space-y-2 pt-0.5">
                                  {gatingMode === 'admin_approval' && isPreAssessment && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleStageTransition(candidate.id, assessmentStageKey, 'Approved profile for technical assessment by admin')}
                                      className="w-full h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-150 shadow-xs cursor-pointer whitespace-nowrap"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>Approve & Unlock Assessment</span>
                                    </Button>
                                  )}

                                  {isAssessmentUnlocked && (
                                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                      <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        Assessment Unlocked
                                      </span>
                                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] h-4 px-1.5 font-mono">
                                        Approved
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Assigned Tasks Summary & Quick Assign Action on Candidate Card */}
                            <div className="space-y-1.5 pt-1 border-t border-border/40">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                                  <ListChecks className="w-3 h-3 text-primary" />
                                  Assigned Tasks ({candidate.assigned_tasks?.length || 0})
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAssignTask(candidate);
                                  }}
                                  className="text-primary hover:underline text-[10px] font-semibold flex items-center gap-0.5"
                                >
                                  <Plus className="w-2.5 h-2.5" /> Assign
                                </button>
                              </div>

                              {candidate.assigned_tasks && candidate.assigned_tasks.length > 0 ? (
                                <div className="space-y-1">
                                  {candidate.assigned_tasks.slice(0, 2).map((t) => {
                                    const isCompleted = t.status === 'completed';
                                    const isInProgress = t.status === 'in_progress';

                                    return (
                                      <div
                                        key={t.id}
                                        className="flex items-center justify-between px-2 py-1 rounded bg-muted/40 border border-border/50 text-[11px]"
                                      >
                                        <span className="truncate max-w-[130px] font-medium text-foreground">{t.title}</span>
                                        <Badge
                                          variant="outline"
                                          className={`text-[9px] h-4 px-1 ${
                                            isCompleted
                                              ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                                              : isInProgress
                                              ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
                                              : 'border-muted text-muted-foreground'
                                          }`}
                                        >
                                          {isCompleted ? 'Done' : isInProgress ? 'In Progress' : 'Pending'}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                  {candidate.assigned_tasks.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground italic block pl-1">
                                      +{candidate.assigned_tasks.length - 2} more tasks
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10px] text-muted-foreground italic py-0.5">
                                  No tasks assigned yet
                                </div>
                              )}
                            </div>

                            {nextStage && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleStageTransition(candidate.id, nextStage.stage_key)}
                                className="w-full h-8 text-xs gap-1.5 bg-muted/80 hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-150"
                              >
                                <span>Advance to {nextStage.stage_name}</span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Candidate Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Create an applicant profile to enroll into the recruitment pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Candidate Full Name *</label>
              <Input
                placeholder="e.g. Alex Morgan"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address *</label>
              <Input
                type="email"
                placeholder="alex.morgan@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            {newEmail.trim().length > 0 && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px] text-primary">
                    <Link2 className="w-3.5 h-3.5" />
                    Cryptographic Portal URL (Collision-Free):
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Secure Token
                  </Badge>
                </div>
                <code className="font-mono text-[11px] text-muted-foreground break-all select-all block">
                  {window.location.origin}/portal/{newPortalToken}{newJobRole ? `?role=${newJobRole}` : ''}
                </code>
                <p className="text-[10px] text-muted-foreground pt-0.5">
                  This unique cryptographic token guarantees each candidate has an isolated, collision-free portal session.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Job Role *</label>
              <select
                value={newJobRole}
                onChange={(e) => setNewJobRole(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                {rolesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Initial Recruitment Stage</label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                {stages.map((stg) => (
                  <option key={stg.stage_key} value={stg.stage_key}>
                    {stg.stage_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Notes / Assessment Background</label>
              <Input
                placeholder="Initial screening notes or referral source..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateApplicant}>
              Create Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Feedback & Note Dialog */}
      <Dialog
        open={Boolean(activeFeedbackApplicant)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveFeedbackApplicant(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Candidate Evaluation & Notes</DialogTitle>
            <DialogDescription>
              Record interviewer feedback and rating for {activeFeedbackApplicant?.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= feedbackRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/40'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-foreground ml-2">
                  {feedbackRating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Evaluation Notes & Comments</label>
              <textarea
                rows={4}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Interview notes, assessment highlights, strengths, areas of concern..."
                className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveFeedbackApplicant(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeedback}>
              Save Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment & Exam Results Modal */}
      <Dialog
        open={Boolean(viewAssessmentCandidate)}
        onOpenChange={(open) => {
          const isClosed = !open;
          if (isClosed) {
            setViewAssessmentCandidate(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-primary" />
              <span>Assessment & Exam Results</span>
            </DialogTitle>
            <DialogDescription>
              Review exam performance and scoring details for {viewAssessmentCandidate?.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          {viewAssessmentCandidate && (
            <div className="space-y-4 py-2">
              {/* Score Highlight Box */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground font-medium">Exam Performance Score</span>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {viewAssessmentCandidate.score ?? 0}%
                  </div>
                </div>
                <Badge
                  className={`font-semibold ${
                    (viewAssessmentCandidate.score ?? 0) >= 70
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {(viewAssessmentCandidate.score ?? 0) >= 70 ? 'Passed' : 'Under Review'}
                </Badge>
              </div>

              {/* Candidate Info Grid */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Candidate Name:</span>
                  <span className="font-semibold text-foreground">{viewAssessmentCandidate.candidate_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Email Address:</span>
                  <span className="font-mono text-foreground">{viewAssessmentCandidate.candidate_email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Pipeline Stage:</span>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {viewAssessmentCandidate.current_stage_key}
                  </Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Evaluator Rating:</span>
                  <span className="font-semibold text-foreground">
                    {viewAssessmentCandidate.rating ?? 0} / 5 Stars
                  </span>
                </div>
                {viewAssessmentCandidate.notes && (
                  <div className="space-y-1 pt-1">
                    <span className="text-muted-foreground">Evaluation Notes:</span>
                    <p className="p-2.5 rounded-lg bg-muted/40 border border-border/30 text-foreground italic">
                      "{viewAssessmentCandidate.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const hasCandidate = Boolean(viewAssessmentCandidate);
                  if (hasCandidate) {
                    const portalToken = viewAssessmentCandidate?.portal_token || ('cpt_' + viewAssessmentCandidate?.id + '_' + viewAssessmentCandidate?.candidate_email.split('@')[0]);
                    const fullUrl = `${window.location.origin}/portal/${portalToken}`;
                    navigator.clipboard.writeText(fullUrl);
                    toast.success(`Copied portal link: ${fullUrl}`);
                  }
                }}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Portal Link</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const hasCandidate = Boolean(viewAssessmentCandidate);
                  if (hasCandidate) {
                    const portalToken = viewAssessmentCandidate?.portal_token || ('cpt_' + viewAssessmentCandidate?.id + '_' + viewAssessmentCandidate?.candidate_email.split('@')[0]);
                    window.open(`/portal/${portalToken}`, '_blank');
                  }
                }}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Candidate Portal</span>
              </Button>
            </div>
            <Button size="sm" onClick={() => setViewAssessmentCandidate(null)} className="cursor-pointer text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Assessment & Onboarding Task Dialog */}
      <Dialog
        open={Boolean(activeAssignCandidate)}
        onOpenChange={(open) => {
          const isClosed = !open;
          if (isClosed) {
            setActiveAssignCandidate(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <span>Assign Assessment or Task</span>
            </DialogTitle>
            <DialogDescription>
              Assign technical exams, onboarding checklists, or curriculum tracks to {activeAssignCandidate?.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          {activeAssignCandidate && (
            <div className="space-y-4 py-2">
              {/* Candidate Info Pill */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-foreground">{activeAssignCandidate.candidate_name}</div>
                  <div className="text-muted-foreground">{activeAssignCandidate.candidate_email}</div>
                </div>
                <Badge variant="outline" className="capitalize text-[10px]">
                  Stage: {activeAssignCandidate.current_stage_key}
                </Badge>
              </div>

              {/* Task Dropdown Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Available Tasks & Modules</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Choose from pre-configured catalog</span>
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => handleSelectAvailableTask(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring text-foreground"
                >
                  {TASK_CATEGORIES.map((category) => (
                    <optgroup key={category} label={category}>
                      {AVAILABLE_SYSTEM_TASKS.filter((task) => task.category === category).map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="Custom Option">
                    <option value="custom_task">Custom / One-off Assignment...</option>
                  </optgroup>
                </select>
              </div>

              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Task Title</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Editable</span>
                </label>
                <Input
                  value={assignTaskTitle}
                  onChange={(e) => setAssignTaskTitle(e.target.value)}
                  placeholder="e.g. Technical Assessment & Skills Verification"
                  className="text-xs h-9"
                />
              </div>

              {/* Due Date & Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Completion Deadline</label>
                <select
                  value={assignTaskDueDate}
                  onChange={(e) => setAssignTaskDueDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring text-foreground"
                >
                  {DEADLINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructions / Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Instructions / Note for Candidate (Optional)</label>
                <textarea
                  rows={2}
                  value={assignTaskNotes}
                  onChange={(e) => setAssignTaskNotes(e.target.value)}
                  placeholder="Any guidance or instructions that should accompany this assignment..."
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Already Assigned Tasks List */}
              {activeAssignCandidate.assigned_tasks && activeAssignCandidate.assigned_tasks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Currently Assigned Tasks ({activeAssignCandidate.assigned_tasks.length})
                  </label>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {activeAssignCandidate.assigned_tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 text-xs"
                      >
                        <div>
                          <div className="font-medium text-foreground">{task.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Due: {task.due_date || 'No deadline'} • Status: {task.status}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignTask(activeAssignCandidate.id, task.id)}
                          className="h-6 w-6 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAssignCandidate(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAssignTask}
              disabled={isSubmittingAssign}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assign to Candidate</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantPipelineKanban;

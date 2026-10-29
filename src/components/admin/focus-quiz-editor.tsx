import React, { useState, useEffect, useMemo } from 'react';
import {
  FocusQuizConfig,
  FocusQuestion,
  ReadingPage,
  ChecklistItem,
} from '@/components/runner/FocusQuizRunner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  PlayCircle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ListChecks,
  HelpCircle,
  Layers,
  ArrowLeft,
  Pencil,
  Copy,
  Search,
  Check,
  Video,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const FOCUS_QUIZZES_LIST_STORAGE_KEY = 'wp_exam_focus_quizzes_list';
export const ACTIVE_FOCUS_QUIZ_STORAGE_KEY = 'wp_exam_saved_focus_quiz';

export const DEFAULT_INITIAL_FOCUS_CONFIG: FocusQuizConfig = {
  id: 'custom-focus-quiz',
  title: 'Engineering Technical Assessment',
  themeId: 'purple',
  hasIntro: true,
  introTitle: "You're in the **right place**!",
  introSubtitle: 'To tailor the assessment to your background, please complete the sequential steps.',
  introImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  passingScore: 70,
  jobSelectionTitle: 'Junior Software Engineer',
  emailCadence: 'per_section',
  readingSection: {
    title: 'Section 1: Architectural Guidelines & Coding Standards',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    pages: [
      {
        pageNumber: 1,
        title: 'Split SQLite Database Architecture',
        content: 'Candidates must respect multi-tenant database isolation. Each project maintains its own isolated database file.',
      },
      {
        pageNumber: 2,
        title: 'Strict Boolean Conventions',
        content: 'Evaluate booleans implicitly without explicit true comparisons. Never combine positive and negative conditions.',
      },
    ],
  },
  checklistSection: {
    title: 'Pre-Assessment Readiness Checklist',
    subtitle: 'Ensure your environment meets the minimum standards before initiating the timed section.',
    items: [
      { id: 'item-1', label: 'Local environment running PHP 8.2+ or Node.js 18+', isMandatory: true },
      { id: 'item-2', label: 'Stable internet connection with camera/screen access', isMandatory: true },
      { id: 'item-3', label: 'GitHub repository or Google Docs work link ready for submission', isMandatory: false },
    ],
  },
  questions: [
    {
      id: 'fq-1',
      type: 'mcq',
      title: 'Which database pattern provides complete data isolation per assessment project?',
      subtitle: 'Select the optimal architectural model for multi-tenant candidate data.',
      options: [
        'Single monolithic MySQL database with shared tables',
        'Split SQLite engine with per-project database files',
        'In-memory JavaScript array without persistence',
        'Flat JSON file stored on desktop',
      ],
      correctAnswer: 'Split SQLite engine with per-project database files',
      points: 25,
      hint: 'Refer to Spec 21 app database architecture guidelines.',
    },
    {
      id: 'fq-2',
      type: 'multiselect',
      title: 'Which boolean evaluation patterns are strictly prohibited in our coding standard?',
      subtitle: 'Select all violations.',
      options: [
        'if (isReady == true)',
        'if (isReady)',
        'if (isFirst && !isSecond)',
        'if (hasPermission)',
      ],
      correctAnswer: ['if (isReady == true)', 'if (isFirst && !isSecond)'],
      points: 25,
      hint: 'Positive booleans must be evaluated implicitly, and mixed polarity is banned.',
    },
    {
      id: 'fq-3',
      type: 'paragraph',
      title: 'Explain the benefits of distraction-free focus assessments for technical candidates.',
      subtitle: 'Provide a concise 2-3 paragraph answer.',
      points: 25,
      hint: 'Discuss cognitive load, linear progression, and immediate feedback.',
    },
    {
      id: 'fq-4',
      type: 'url_submission',
      title: 'Submit your Google Docs or Workflowy architectural proposal link',
      subtitle: 'Ensure public read-access is granted to the review panel.',
      verificationType: 'google_docs',
      points: 25,
      hint: 'The link must begin with https://docs.google.com/ or https://workflowy.com/',
    },
  ],
};

export const SEEDED_FOCUS_QUIZZES: FocusQuizConfig[] = [
  DEFAULT_INITIAL_FOCUS_CONFIG,
  {
    id: 'product-design-focus-quiz',
    title: 'Product & UX Design Systems Review',
    themeId: 'riseup-asia',
    hasIntro: true,
    introTitle: 'Design System & Component Architecture Review',
    introSubtitle: 'Demonstrate your UX principles, tokenization discipline, and accessible contrast patterns.',
    introImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    passingScore: 75,
    jobSelectionTitle: 'Senior UI/UX Designer',
    emailCadence: 'per_section',
    readingSection: {
      title: 'Section 1: Precision Design System Standards',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      pages: [
        {
          pageNumber: 1,
          title: 'Hairline Chrome & Optical Centering',
          content: 'Title cards must use a 2px hairline accent edge (h-0.5) with shadow-md, never heavy solid banners. Question titles must maintain optical equilibrium.',
        },
        {
          pageNumber: 2,
          title: 'High-Contrast Lilac Slate & Accessible Themes',
          content: 'In dark themes, admin surfaces must render muted text in crisp lilac-slate (#BAC7E8, 7.2:1 contrast ratio) rather than muted comment slate.',
        },
      ],
    },
    checklistSection: {
      title: 'Pre-Evaluation Environment Readiness',
      subtitle: 'Prepare your design workstation before starting the review questions.',
      items: [
        { id: 'item-pd-1', label: 'Figma or design canvas access ready for inspection', isMandatory: true },
        { id: 'item-pd-2', label: 'WCAG 2.1 AA accessibility contrast checker active', isMandatory: true },
        { id: 'item-pd-3', label: 'Interactive component state matrix prepared', isMandatory: false },
      ],
    },
    questions: [
      {
        id: 'fq-pd-1',
        type: 'mcq',
        title: 'Which minimum contrast ratio is mandatory for readable text on dark admin surfaces?',
        subtitle: 'Select the WCAG AAA compliant ratio specified in our design guidelines.',
        options: [
          '3.0:1 (Draft contrast)',
          '4.5:1 (Standard text)',
          '7.2:1 (Crisp lilac-slate compliant standard)',
          '2.1:1 (Minimal decorative contrast)',
        ],
        correctAnswer: '7.2:1 (Crisp lilac-slate compliant standard)',
        points: 30,
        hint: 'Refer to design guidelines for lilac-slate (#BAC7E8).',
      },
      {
        id: 'fq-pd-2',
        type: 'multiselect',
        title: 'Which chrome accent rules are required in the presentation slide layout?',
        subtitle: 'Select all correct rules.',
        options: [
          '2px hairline accent edge (h-0.5) with shadow-md',
          'Heavy gradient banners with h-2 or higher',
          'Optical vertical centering in 2-column presentation slides',
          'Zero Candidate Response headings in runner views',
        ],
        correctAnswer: [
          '2px hairline accent edge (h-0.5) with shadow-md',
          'Optical vertical centering in 2-column presentation slides',
          'Zero Candidate Response headings in runner views',
        ],
        points: 40,
        hint: 'Heavy banners are strictly banned.',
      },
      {
        id: 'fq-pd-3',
        type: 'paragraph',
        title: 'How do design tokens improve cross-functional development velocity between React and backend themes?',
        subtitle: 'Provide a concise architectural overview with 2-3 examples.',
        points: 30,
        hint: 'Discuss semantic tokens, CSS variables, and design system synchronization.',
      },
    ],
  },
  {
    id: 'devops-security-focus-quiz',
    title: 'DevOps & Cloud Infrastructure Protocol Drill',
    themeId: 'dracula',
    hasIntro: true,
    introTitle: 'Zero-Storage CI/CD & Cloud Infrastructure Drill',
    introSubtitle: 'Verify your proficiency with GitHub Actions zero-storage mandates, SSH hygiene, and automated self-healing pipelines.',
    introImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    passingScore: 80,
    jobSelectionTitle: 'DevOps & Cloud Engineer',
    emailCadence: 'per_section',
    readingSection: {
      title: 'Section 1: Zero-Storage Mandate & Pipeline Discipline',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      pages: [
        {
          pageNumber: 1,
          title: 'Zero-Storage GitHub Actions Policy',
          content: 'Routine build artifacts, coverage reports, and logs must be piped directly to $GITHUB_STEP_SUMMARY or console output. Uploading zip artifacts exhausts storage quotas.',
        },
        {
          pageNumber: 2,
          title: 'Vigilant Mode & Cryptographic Git Signatures',
          content: 'All commits must be cryptographically signed via Ed25519 SSH keys with GitHub Vigilant Mode enforced.',
        },
      ],
    },
    checklistSection: {
      title: 'Infrastructure & Workstation Security Checklist',
      subtitle: 'Ensure security protocols are verified before answering questions.',
      items: [
        { id: 'item-dev-1', label: 'Docker engine and local runtime active', isMandatory: true },
        { id: 'item-dev-2', label: 'GitHub SSH Ed25519 signing key active and verified', isMandatory: true },
        { id: 'item-dev-3', label: 'No CI/CD bypass flags enabled in local git config', isMandatory: true },
      ],
    },
    questions: [
      {
        id: 'fq-dev-1',
        type: 'mcq',
        title: 'Where must diagnostic test reports and CI/CD drift summaries be published under our zero-storage mandate?',
        subtitle: 'Select the zero-storage compliant destination.',
        options: [
          'actions/upload-artifact archive zip files',
          '$GITHUB_STEP_SUMMARY or console standard output',
          'Third-party cloud S3 bucket with indefinite retention',
          'Raw filesystem dumps committed into git history',
        ],
        correctAnswer: '$GITHUB_STEP_SUMMARY or console standard output',
        points: 35,
        hint: 'Uploading artifacts exhausts account storage quotas.',
      },
      {
        id: 'fq-dev-2',
        type: 'multiselect',
        title: 'Which practices violate repository CI/CD pipeline integrity rules?',
        subtitle: 'Select all prohibited practices.',
        options: [
          'Disabling CI/CD checks or commenting out workflows to force green status',
          'Writing surgical bug fixes using 4-part Root Cause Analysis (RCA)',
          'Uploading routine Playwright reports to GitHub Actions artifact storage',
          'Evaluating positive booleans implicitly without explicit true comparisons',
        ],
        correctAnswer: [
          'Disabling CI/CD checks or commenting out workflows to force green status',
          'Uploading routine Playwright reports to GitHub Actions artifact storage',
        ],
        points: 35,
        hint: 'Disabling CI/CD and uploading routine artifacts are strictly forbidden.',
      },
      {
        id: 'fq-dev-3',
        type: 'url_submission',
        title: 'Provide a link to your public GitHub profile or dotfiles demonstrating SSH commit signing',
        subtitle: 'Verified commits must show the Verified badge on GitHub.',
        verificationType: 'url',
        points: 30,
        hint: 'https://github.com/...',
      },
    ],
  },
];

export const loadStoredFocusQuizzes = (): FocusQuizConfig[] => {
  if (typeof window === 'undefined') {
    return SEEDED_FOCUS_QUIZZES;
  }

  const rawList = localStorage.getItem(FOCUS_QUIZZES_LIST_STORAGE_KEY);

  if (rawList) {
    try {
      const parsed = JSON.parse(rawList);
      const isArray = Array.isArray(parsed);

      if (isArray) {
        const hasItems = (parsed.length > 0);

        if (hasItems) {
          return parsed as FocusQuizConfig[];
        }
      }
    } catch {
      // Fallback to active single quiz or seeded list
    }
  }

  // Check legacy single quiz
  const rawSingle = localStorage.getItem(ACTIVE_FOCUS_QUIZ_STORAGE_KEY);

  if (rawSingle) {
    try {
      const single = JSON.parse(rawSingle);
      const hasId = Boolean(single?.id);

      if (hasId) {
        const others = SEEDED_FOCUS_QUIZZES.filter((q) => q.id !== single.id);

        return [single, ...others];
      }
    } catch {
      // Fallback to seeded
    }
  }

  return SEEDED_FOCUS_QUIZZES;
};

export const persistFocusQuizzes = (quizzes: FocusQuizConfig[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(FOCUS_QUIZZES_LIST_STORAGE_KEY, JSON.stringify(quizzes, null, 2));
  } catch {
    // Graceful error handling
  }
};

interface FocusQuizEditorProps {
  onLaunchRunner: (config: FocusQuizConfig) => void;
}

export const FocusQuizEditor: React.FC<FocusQuizEditorProps> = ({ onLaunchRunner }) => {
  const [quizzes, setQuizzes] = useState<FocusQuizConfig[]>(() => loadStoredFocusQuizzes());
  const [activeQuizId, setActiveQuizId] = useState<string>(() => {
    const list = loadStoredFocusQuizzes();

    return list[0]?.id || DEFAULT_INITIAL_FOCUS_CONFIG.id;
  });
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [activeTab, setActiveTab] = useState<'general' | 'intro' | 'reading' | 'checklist' | 'questions'>('general');

  // Filter & Search state in list view
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [themeFilter, setThemeFilter] = useState<string>('all');

  // Dialog states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newQuizTitle, setNewQuizTitle] = useState<string>('');
  const [newQuizSlug, setNewQuizSlug] = useState<string>('');
  const [newQuizTheme, setNewQuizTheme] = useState<string>('purple');
  const [newQuizPassing, setNewQuizPassing] = useState<number>(70);
  const [newQuizJobTitle, setNewQuizJobTitle] = useState<string>('');

  const [quizToDelete, setQuizToDelete] = useState<FocusQuizConfig | null>(null);

  // Active quiz being edited
  const currentQuiz = useMemo<FocusQuizConfig>(() => {
    const found = quizzes.find((q) => q.id === activeQuizId);
    const hasFound = Boolean(found);

    if (hasFound) {
      return found as FocusQuizConfig;
    }

    return quizzes[0] || DEFAULT_INITIAL_FOCUS_CONFIG;
  }, [quizzes, activeQuizId]);

  // Keep single active quiz in legacy storage key for runner fallback compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCurrent = Boolean(currentQuiz);

      if (hasCurrent) {
        localStorage.setItem(ACTIVE_FOCUS_QUIZ_STORAGE_KEY, JSON.stringify(currentQuiz, null, 2));
      }
    }
  }, [currentQuiz]);

  const updateCurrentQuiz = (updater: (prev: FocusQuizConfig) => FocusQuizConfig) => {
    setQuizzes((prevList) => {
      const nextList = prevList.map((q) => {
        const isMatch = (q.id === activeQuizId);

        if (isMatch) {
          return updater(q);
        }

        return q;
      });

      persistFocusQuizzes(nextList);

      return nextList;
    });
  };

  const handleSaveCurrentQuiz = () => {
    persistFocusQuizzes(quizzes);

    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_FOCUS_QUIZ_STORAGE_KEY, JSON.stringify(currentQuiz, null, 2));
    }

    toast.success(`Saved changes for "${currentQuiz.title}"`);
  };

  const handleResetCurrentQuiz = () => {
    const templateMatch = SEEDED_FOCUS_QUIZZES.find((s) => s.id === currentQuiz.id);
    const resetConfig: FocusQuizConfig = templateMatch
      ? JSON.parse(JSON.stringify(templateMatch))
      : {
          ...DEFAULT_INITIAL_FOCUS_CONFIG,
          id: currentQuiz.id,
          title: currentQuiz.title,
        };

    updateCurrentQuiz(() => resetConfig);
    toast.info(`Reset "${currentQuiz.title}" to default template`);
  };

  const handleOpenEditor = (quiz: FocusQuizConfig) => {
    setActiveQuizId(quiz.id);
    setViewMode('editor');
    setActiveTab('general');
  };

  const handleLaunchRunner = (quiz: FocusQuizConfig) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_FOCUS_QUIZ_STORAGE_KEY, JSON.stringify(quiz, null, 2));
    }

    onLaunchRunner(quiz);
  };

  const handleOpenCreateModal = () => {
    const defaultNum = quizzes.length + 1;
    setNewQuizTitle(`Assessment Quiz ${defaultNum}`);
    setNewQuizSlug(`focus-quiz-${Date.now().toString(36)}`);
    setNewQuizTheme('purple');
    setNewQuizPassing(70);
    setNewQuizJobTitle('Software Engineer');
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = newQuizTitle.trim() || 'New Candidate Focus Quiz';
    const rawSlug = newQuizSlug.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let finalSlug = rawSlug || `quiz-${Date.now().toString(36)}`;
    let counter = 1;

    while (quizzes.some((q) => q.id === finalSlug)) {
      finalSlug = `${rawSlug}-${counter}`;
      counter++;
    }

    const createdQuiz: FocusQuizConfig = {
      id: finalSlug,
      title: cleanTitle,
      themeId: newQuizTheme || 'purple',
      hasIntro: true,
      introTitle: `Welcome to **${cleanTitle}**`,
      introSubtitle: 'Please review the instructional briefing and complete the sequential questions.',
      introImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      passingScore: newQuizPassing || 70,
      jobSelectionTitle: newQuizJobTitle.trim() || 'Candidate',
      emailCadence: 'per_section',
      readingSection: {
        title: 'Section 1: Assessment Briefing',
        pages: [
          {
            pageNumber: 1,
            title: 'Overview & Guidelines',
            content: 'Review these instructions carefully before proceeding to the scored questions.',
          },
        ],
      },
      checklistSection: {
        title: 'Pre-Test Verification Checklist',
        subtitle: 'Confirm each requirement before initiating the scored assessment.',
        items: [
          { id: `item-${Date.now()}-1`, label: 'Workstation ready with quiet environment', isMandatory: true },
          { id: `item-${Date.now()}-2`, label: 'Stable internet connection verified', isMandatory: true },
        ],
      },
      questions: [
        {
          id: `fq-${Date.now()}-1`,
          type: 'mcq',
          title: 'Starter Assessment Question',
          subtitle: 'Select the optimal response from the choices below.',
          options: ['Primary Architectural Pattern', 'Alternative Choice B', 'Alternative Choice C'],
          correctAnswer: 'Primary Architectural Pattern',
          points: 50,
          hint: 'Select the primary pattern discussed in the briefing.',
        },
        {
          id: `fq-${Date.now()}-2`,
          type: 'paragraph',
          title: 'Candidate Technical Explanation',
          subtitle: 'Provide a concise 2-3 paragraph answer.',
          points: 50,
        },
      ],
    };

    const nextList = [createdQuiz, ...quizzes];
    setQuizzes(nextList);
    persistFocusQuizzes(nextList);
    setActiveQuizId(createdQuiz.id);
    setIsCreateModalOpen(false);
    setViewMode('editor');
    setActiveTab('general');

    toast.success(`Created Focus Quiz "${cleanTitle}"!`);
  };

  const handleDuplicateQuiz = (quizToClone: FocusQuizConfig) => {
    let cloneId = `${quizToClone.id}-copy`;
    let counter = 1;

    while (quizzes.some((q) => q.id === cloneId)) {
      cloneId = `${quizToClone.id}-copy-${counter}`;
      counter++;
    }

    const clonedQuiz: FocusQuizConfig = {
      ...JSON.parse(JSON.stringify(quizToClone)),
      id: cloneId,
      title: `${quizToClone.title} (Copy)`,
    };

    const nextList = [clonedQuiz, ...quizzes];
    setQuizzes(nextList);
    persistFocusQuizzes(nextList);

    toast.success(`Duplicated "${quizToClone.title}"`);
  };

  const handleConfirmDeleteQuiz = () => {
    const hasTarget = Boolean(quizToDelete);

    if (!hasTarget) {
      return;
    }

    const targetId = quizToDelete!.id;
    const remaining = quizzes.filter((q) => q.id !== targetId);
    let finalList = remaining;
    const isListEmpty = (remaining.length === 0);

    if (isListEmpty) {
      finalList = [DEFAULT_INITIAL_FOCUS_CONFIG];
    }

    setQuizzes(finalList);
    persistFocusQuizzes(finalList);

    const isDeletedActive = (activeQuizId === targetId);

    if (isDeletedActive) {
      setActiveQuizId(finalList[0].id);
      setViewMode('list');
    }

    toast.success(`Deleted "${quizToDelete!.title}"`);
    setQuizToDelete(null);
  };

  // Question manipulation handlers
  const handleAddQuestion = (type: FocusQuestion['type']) => {
    const newQuestion: FocusQuestion = {
      id: `fq-${Date.now()}`,
      type,
      title: 'New Assessment Question',
      subtitle: 'Provide clear instructions for the candidate',
      points: 10,
      options: type === 'mcq' || type === 'multiselect' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      correctAnswer: type === 'mcq' ? 'Option 1' : undefined,
    };

    updateCurrentQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));

    toast.success(`Added new ${type} question`);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<FocusQuestion>) => {
    updateCurrentQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  };

  const handleRemoveQuestion = (id: string) => {
    updateCurrentQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));

    toast.info('Question removed');
  };

  // Reading section handlers
  const handleAddReadingPage = () => {
    const currentPages = currentQuiz.readingSection?.pages || [];
    const newPage: ReadingPage = {
      pageNumber: currentPages.length + 1,
      title: `Topic ${currentPages.length + 1}`,
      content: 'Enter instructional reading content for candidates...',
    };

    updateCurrentQuiz((prev) => ({
      ...prev,
      readingSection: {
        title: prev.readingSection?.title || 'Instructional Briefing',
        videoUrl: prev.readingSection?.videoUrl,
        pages: [...currentPages, newPage],
      },
    }));
  };

  const handleRemoveReadingPage = (index: number) => {
    const currentPages = currentQuiz.readingSection?.pages || [];
    const updated = currentPages.filter((_, i) => i !== index);

    updateCurrentQuiz((prev) => ({
      ...prev,
      readingSection: prev.readingSection
        ? {
            ...prev.readingSection,
            pages: updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
          }
        : undefined,
    }));
  };

  // Checklist section handlers
  const handleAddChecklistItem = () => {
    const currentItems = currentQuiz.checklistSection?.items || [];
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: 'New mandatory candidate verification check',
      isMandatory: true,
    };

    updateCurrentQuiz((prev) => ({
      ...prev,
      checklistSection: {
        title: prev.checklistSection?.title || 'Pre-Assessment Checklist',
        subtitle: prev.checklistSection?.subtitle,
        items: [...currentItems, newItem],
      },
    }));
  };

  const handleRemoveChecklistItem = (id: string) => {
    const currentItems = currentQuiz.checklistSection?.items || [];

    updateCurrentQuiz((prev) => ({
      ...prev,
      checklistSection: prev.checklistSection
        ? {
            ...prev.checklistSection,
            items: currentItems.filter((i) => i.id !== id),
          }
        : undefined,
    }));
  };

  // Filtered quizzes for list view
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const qTitle = (q.title || '').toLowerCase();
      const qSlug = (q.id || '').toLowerCase();
      const sQuery = searchQuery.trim().toLowerCase();
      const hasSearch = (sQuery.length > 0);

      if (hasSearch) {
        const matchesTitle = qTitle.includes(sQuery);
        const matchesSlug = qSlug.includes(sQuery);
        const isMatch = (matchesTitle || matchesSlug);

        if (!isMatch) {
          return false;
        }
      }

      const hasThemeFilter = (themeFilter !== 'all');

      if (hasThemeFilter) {
        const isThemeMatch = ((q.themeId || 'purple') === themeFilter);

        if (!isThemeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [quizzes, searchQuery, themeFilter]);

  const totalPoints = currentQuiz.questions.reduce((acc, q) => acc + (q.points || 0), 0);
  const totalQuestionsAllQuizzes = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
  const uniqueThemesCount = new Set(quizzes.map((q) => q.themeId || 'purple')).size;
  const avgPassingThreshold = Math.round(
    quizzes.reduce((acc, q) => acc + (q.passingScore || 70), 0) / (quizzes.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* VIEW MODE 1: FOCUS QUIZZES LIST VIEW                                     */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Top List Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-card rounded-2xl border border-border shadow-xs">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                  Focus Quiz Studio
                </h1>
                <Badge variant="secondary" className="text-xs font-mono">
                  Focus Engine
                </Badge>
                <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30">
                  {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Manage, author, and preview sequential 4-stage distraction-free candidate assessments.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handleOpenCreateModal}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-4 gap-1.5 font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Focus Quiz</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Total Quizzes</span>
              <span className="text-2xl font-bold text-foreground font-mono">{quizzes.length}</span>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Total Questions</span>
              <span className="text-2xl font-bold text-primary font-mono">{totalQuestionsAllQuizzes}</span>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Active Themes</span>
              <span className="text-2xl font-bold text-foreground font-mono">{uniqueThemesCount}</span>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Avg Pass Mark</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {avgPassingThreshold}%
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-muted/20 border border-border rounded-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search focus quizzes by title or unique slug..."
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Theme:</span>
              <Select value={themeFilter} onValueChange={setThemeFilter}>
                <SelectTrigger className="h-9 text-xs w-44 bg-background">
                  <SelectValue placeholder="All Themes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  <SelectItem value="purple">Purple Theme</SelectItem>
                  <SelectItem value="riseup-asia">Riseup Asia</SelectItem>
                  <SelectItem value="dracula">Dracula</SelectItem>
                  <SelectItem value="vscode-dark">VS Code Dark</SelectItem>
                  <SelectItem value="microsoft-blue">Microsoft Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quizzes Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => {
              const qCount = quiz.questions?.length || 0;
              const pointsSum = (quiz.questions || []).reduce((acc, q) => acc + (q.points || 0), 0);
              const readPages = quiz.readingSection?.pages?.length || 0;
              const chkItems = quiz.checklistSection?.items?.length || 0;
              const isSelected = (quiz.id === activeQuizId);

              return (
                <Card
                  key={quiz.id}
                  className={`border transition-all duration-200 bg-card hover:border-primary/60 hover:shadow-md flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-primary/40 border-primary' : 'border-border'
                  }`}
                >
                  <CardHeader className="p-5 pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-mono capitalize px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
                      >
                        {quiz.themeId || 'purple'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      >
                        {quiz.passingScore || 70}% Pass
                      </Badge>
                    </div>

                    <div>
                      <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                        slug: {quiz.id}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Feature Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                        <span>{qCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span>{readPages} Briefing Pages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ListChecks className="w-3.5 h-3.5 text-primary" />
                        <span>{chkItems} Checklists</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{pointsSum} Max Pts</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenEditor(quiz)}
                          className="text-xs h-8 gap-1.5 font-semibold cursor-pointer shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Author</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLaunchRunner(quiz)}
                          className="text-xs h-8 gap-1.5 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                          title="Preview Candidate Experience"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateQuiz(quiz)}
                          className="text-xs h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Duplicate Quiz"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuizToDelete(quiz)}
                          className="text-xs h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 cursor-pointer"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border/80 space-y-3">
              <Layers className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-sm font-semibold text-foreground">No Focus Quizzes Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No assessments match your current search query. Create a new quiz or clear your filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setThemeFilter('all');
                }}
                className="text-xs h-8"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: FOCUS QUIZ AUTHORING STUDIO (EDITOR)                        */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-6">
          {/* Top Studio Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs h-8 gap-1.5 border-border hover:bg-muted/50 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Quiz List</span>
              </Button>

              <div className="h-4 w-px bg-border hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                    {currentQuiz.title}
                  </h1>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {currentQuiz.id}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  4-stage distraction-free candidate assessment authoring studio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Quiz Selector Switcher */}
              <Select value={activeQuizId} onValueChange={(val) => setActiveQuizId(val)}>
                <SelectTrigger className="h-8 text-xs w-44 bg-background font-medium">
                  <SelectValue placeholder="Switch Quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((q) => (
                    <SelectItem key={q.id} value={q.id} className="text-xs">
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCreateModal}
                className="text-xs h-8 gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer"
                title="Create New Quiz"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuizToDelete(currentQuiz)}
                className="text-xs h-8 gap-1.5 border-border text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                title="Delete Current Quiz"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetCurrentQuiz}
                className="text-xs h-8 gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer"
                title="Reset to default template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveCurrentQuiz}
                className="text-xs h-8 gap-1.5 border-border cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </Button>

              <Button
                onClick={() => handleLaunchRunner(currentQuiz)}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 font-semibold cursor-pointer shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Preview Runner</span>
              </Button>
            </div>
          </div>

          {/* Overview Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-card border border-border rounded-xl">
              <span className="text-xs text-muted-foreground block">Active Theme</span>
              <span className="text-sm font-bold capitalize text-primary">{currentQuiz.themeId || 'purple'}</span>
            </div>
            <div className="p-3 bg-card border border-border rounded-xl">
              <span className="text-xs text-muted-foreground block">Passing Threshold</span>
              <span className="text-sm font-bold text-foreground">{currentQuiz.passingScore || 70}%</span>
            </div>
            <div className="p-3 bg-card border border-border rounded-xl">
              <span className="text-xs text-muted-foreground block">Questions</span>
              <span className="text-sm font-bold text-foreground">{currentQuiz.questions.length} items</span>
            </div>
            <div className="p-3 bg-card border border-border rounded-xl">
              <span className="text-xs text-muted-foreground block">Max Possible Score</span>
              <span className="text-sm font-bold text-foreground">{totalPoints} pts</span>
            </div>
          </div>

          {/* Step Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-border/80 pb-2 overflow-x-auto">
            <Button
              type="button"
              variant={activeTab === 'general' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('general')}
              className="text-xs h-8 gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. General Rules</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'intro' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('intro')}
              className="text-xs h-8 gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Welcome Screen</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'reading' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('reading')}
              className="text-xs h-8 gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>3. Video & Reading</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'checklist' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('checklist')}
              className="text-xs h-8 gap-1.5 cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>4. Pre-Test Checklist</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'questions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('questions')}
              className="text-xs h-8 gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>5. Assessment Questions ({currentQuiz.questions.length})</span>
            </Button>
          </div>

          {/* Tab 1: General Settings */}
          {activeTab === 'general' && (
            <Card className="border-border bg-card">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/15">
                <CardTitle className="text-sm font-semibold">General Assessment Rules</CardTitle>
                <CardDescription className="text-xs">
                  Configure title, passing score, email notification cadence, and visual theme.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Quiz Title</Label>
                    <Input
                      value={currentQuiz.title}
                      onChange={(e) => updateCurrentQuiz((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Senior Frontend Architecture Screening"
                      className="text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Unique Quiz Slug / ID</Label>
                    <Input
                      value={currentQuiz.id}
                      onChange={(e) => updateCurrentQuiz((p) => ({ ...p, id: e.target.value }))}
                      placeholder="e.g. senior-frontend-v1"
                      className="text-xs h-9 bg-background font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Visual Theme Preset</Label>
                    <Select
                      value={currentQuiz.themeId || 'purple'}
                      onValueChange={(val) => updateCurrentQuiz((p) => ({ ...p, themeId: val }))}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Select Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purple">Purple Theme (Deep Purple & Focus)</SelectItem>
                        <SelectItem value="riseup-asia">Riseup (Gold & Modern Dark)</SelectItem>
                        <SelectItem value="dracula">Dracula (Vibrant Purple & Slate)</SelectItem>
                        <SelectItem value="vscode-dark">VS Code Dark (Professional Slate)</SelectItem>
                        <SelectItem value="microsoft-blue">Microsoft Fluent Blue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Passing Threshold (%)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={currentQuiz.passingScore || 70}
                      onChange={(e) => updateCurrentQuiz((p) => ({ ...p, passingScore: Number(e.target.value) }))}
                      className="text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Job Selection Title</Label>
                    <Input
                      value={currentQuiz.jobSelectionTitle || ''}
                      onChange={(e) => updateCurrentQuiz((p) => ({ ...p, jobSelectionTitle: e.target.value }))}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 2: Welcome Screen */}
          {activeTab === 'intro' && (
            <Card className="border-border bg-card">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/15">
                <CardTitle className="text-sm font-semibold">Welcome & Candidate Introduction</CardTitle>
                <CardDescription className="text-xs">
                  First screen presented to candidates before briefing and questions begin.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="has-intro-toggle" className="text-xs font-semibold cursor-pointer">
                      Enable Welcome Intro Screen
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Presents a hero card with motivational text before questions.
                    </p>
                  </div>
                  <Switch
                    id="has-intro-toggle"
                    checked={currentQuiz.hasIntro ?? true}
                    onCheckedChange={(val) => updateCurrentQuiz((p) => ({ ...p, hasIntro: val }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Intro Title / Headline (Markdown Supported)</Label>
                  <Input
                    value={currentQuiz.introTitle || ''}
                    onChange={(e) => updateCurrentQuiz((p) => ({ ...p, introTitle: e.target.value }))}
                    placeholder="You're in the **right place**!"
                    className="text-xs h-9 bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Intro Subtitle / Instructions</Label>
                  <Textarea
                    value={currentQuiz.introSubtitle || ''}
                    onChange={(e) => updateCurrentQuiz((p) => ({ ...p, introSubtitle: e.target.value }))}
                    placeholder="Explain the assessment goals and expectations..."
                    rows={3}
                    className="text-xs bg-background resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Intro Hero Image URL</Label>
                  <Input
                    value={currentQuiz.introImage || ''}
                    onChange={(e) => updateCurrentQuiz((p) => ({ ...p, introImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="text-xs h-9 bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Reading Material & Video */}
          {activeTab === 'reading' && (
            <Card className="border-border bg-card">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/15 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Video Briefing & Reading Material</CardTitle>
                  <CardDescription className="text-xs">
                    Instructional materials candidates must review prior to answering questions.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddReadingPage}
                  className="text-xs h-7 gap-1 border-border cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic Page</span>
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Section Title</Label>
                    <Input
                      value={currentQuiz.readingSection?.title || ''}
                      onChange={(e) =>
                        updateCurrentQuiz((p) => ({
                          ...p,
                          readingSection: {
                            title: e.target.value,
                            videoUrl: p.readingSection?.videoUrl,
                            pages: p.readingSection?.pages || [],
                          },
                        }))
                      }
                      placeholder="Section 1: Architecture Guidelines"
                      className="text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Briefing Video Embed URL (YouTube / Vimeo)</Label>
                    <Input
                      value={currentQuiz.readingSection?.videoUrl || ''}
                      onChange={(e) =>
                        updateCurrentQuiz((p) => ({
                          ...p,
                          readingSection: {
                            title: p.readingSection?.title || 'Instructional Briefing',
                            videoUrl: e.target.value,
                            pages: p.readingSection?.pages || [],
                          },
                        }))
                      }
                      placeholder="https://www.youtube-nocookie.com/embed/..."
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                </div>

                {/* Reading Pages List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold block text-foreground">
                    Reading Pages ({currentQuiz.readingSection?.pages?.length || 0})
                  </span>
                  {currentQuiz.readingSection?.pages?.map((page, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-primary">Page {page.pageNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveReadingPage(idx)}
                          className="text-xs h-6 px-1.5 text-rose-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={page.title}
                        onChange={(e) => {
                          const updated = [...(currentQuiz.readingSection?.pages || [])];
                          updated[idx].title = e.target.value;
                          updateCurrentQuiz((p) => ({
                            ...p,
                            readingSection: {
                              title: p.readingSection?.title || '',
                              videoUrl: p.readingSection?.videoUrl,
                              pages: updated,
                            },
                          }));
                        }}
                        placeholder="Page Title"
                        className="text-xs h-8 bg-background font-semibold"
                      />
                      <Textarea
                        value={page.content}
                        onChange={(e) => {
                          const updated = [...(currentQuiz.readingSection?.pages || [])];
                          updated[idx].content = e.target.value;
                          updateCurrentQuiz((p) => ({
                            ...p,
                            readingSection: {
                              title: p.readingSection?.title || '',
                              videoUrl: p.readingSection?.videoUrl,
                              pages: updated,
                            },
                          }));
                        }}
                        placeholder="Detailed page text..."
                        rows={2}
                        className="text-xs bg-background resize-none"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 4: Pre-Test Checklist */}
          {activeTab === 'checklist' && (
            <Card className="border-border bg-card">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/15 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Pre-Assessment Readiness Checklist</CardTitle>
                  <CardDescription className="text-xs">
                    Candidates must review and check these items before advancing.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  className="text-xs h-7 gap-1 border-border cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Checklist Item</span>
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Checklist Header Title</Label>
                    <Input
                      value={currentQuiz.checklistSection?.title || ''}
                      onChange={(e) =>
                        updateCurrentQuiz((p) => ({
                          ...p,
                          checklistSection: {
                            title: e.target.value,
                            subtitle: p.checklistSection?.subtitle,
                            items: p.checklistSection?.items || [],
                          },
                        }))
                      }
                      placeholder="Pre-Assessment Readiness Checklist"
                      className="text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Checklist Subtitle / Notice</Label>
                    <Input
                      value={currentQuiz.checklistSection?.subtitle || ''}
                      onChange={(e) =>
                        updateCurrentQuiz((p) => ({
                          ...p,
                          checklistSection: {
                            title: p.checklistSection?.title || '',
                            subtitle: e.target.value,
                            items: p.checklistSection?.items || [],
                          },
                        }))
                      }
                      placeholder="Ensure your environment meets the minimum standards..."
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {currentQuiz.checklistSection?.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 bg-muted/20 border border-border rounded-lg">
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const updated = (currentQuiz.checklistSection?.items || []).map((i) =>
                            i.id === item.id ? { ...i, label: e.target.value } : i
                          );
                          updateCurrentQuiz((p) => ({
                            ...p,
                            checklistSection: {
                              title: p.checklistSection?.title || '',
                              subtitle: p.checklistSection?.subtitle,
                              items: updated,
                            },
                          }));
                        }}
                        placeholder="Checklist condition..."
                        className="text-xs h-8 bg-background flex-1"
                      />

                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Mandatory</Label>
                        <Switch
                          checked={item.isMandatory ?? true}
                          onCheckedChange={(val) => {
                            const updated = (currentQuiz.checklistSection?.items || []).map((i) =>
                              i.id === item.id ? { ...i, isMandatory: val } : i
                            );
                            updateCurrentQuiz((p) => ({
                              ...p,
                              checklistSection: {
                                title: p.checklistSection?.title || '',
                                subtitle: p.checklistSection?.subtitle,
                                items: updated,
                              },
                            }));
                          }}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-xs h-7 px-1.5 text-rose-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 5: Assessment Questions */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Scored Questions ({currentQuiz.questions.length})</span>
                  <Badge variant="outline" className="text-xs font-mono">{totalPoints} total points</Badge>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddQuestion('mcq')}
                    className="text-xs h-7 gap-1 border-border cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>MCQ</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddQuestion('multiselect')}
                    className="text-xs h-7 gap-1 border-border cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Multi-Select</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddQuestion('paragraph')}
                    className="text-xs h-7 gap-1 border-border cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Paragraph</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddQuestion('url_submission')}
                    className="text-xs h-7 gap-1 border-border cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>URL Link</span>
                  </Button>
                </div>
              </div>

              {/* Question Cards List */}
              <div className="space-y-4">
                {currentQuiz.questions.map((q, idx) => (
                  <Card key={q.id} className="border-border bg-card shadow-xs">
                    <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/15 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-mono">Q{idx + 1}</Badge>
                        <Badge variant="outline" className="text-xs uppercase font-mono">{q.type.replace('_', ' ')}</Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground font-mono">Points:</span>
                          <Input
                            type="number"
                            min={0}
                            value={q.points || 0}
                            onChange={(e) => handleUpdateQuestion(q.id, { points: Number(e.target.value) })}
                            className="w-16 h-7 text-xs bg-background font-mono text-center"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-xs h-7 px-1.5 text-rose-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Question Prompt</Label>
                        <Input
                          value={q.title}
                          onChange={(e) => handleUpdateQuestion(q.id, { title: e.target.value })}
                          placeholder="Question prompt..."
                          className="text-xs h-9 bg-background font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Subtitle / Clarification</Label>
                        <Input
                          value={q.subtitle || ''}
                          onChange={(e) => handleUpdateQuestion(q.id, { subtitle: e.target.value })}
                          placeholder="Additional context or guidance..."
                          className="text-xs h-8 bg-background"
                        />
                      </div>

                      {/* Options builder for MCQ and MultiSelect */}
                      {(q.type === 'mcq' || q.type === 'multiselect') && (
                        <div className="space-y-2 pt-1">
                          <Label className="text-xs font-semibold block">Options & Choices</Label>
                          {Array.isArray(q.options) &&
                            q.options.map((opt, optIdx) => {
                              const optLabel = typeof opt === 'string' ? opt : opt.label;
                              const isCorrect =
                                q.type === 'mcq'
                                  ? q.correctAnswer === optLabel
                                  : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optLabel);

                              return (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant={isCorrect ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                      const isMcq = (q.type === 'mcq');

                                      if (isMcq) {
                                        handleUpdateQuestion(q.id, { correctAnswer: optLabel });
                                      } else {
                                        const current = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
                                        const exists = current.includes(optLabel);
                                        const next = exists
                                          ? current.filter((c) => c !== optLabel)
                                          : [...current, optLabel];
                                        handleUpdateQuestion(q.id, { correctAnswer: next });
                                      }
                                    }}
                                    className="text-xs h-7 w-24 px-2 shrink-0 justify-center whitespace-nowrap cursor-pointer"
                                    title="Mark as correct answer"
                                  >
                                    {isCorrect ? 'Correct ✓' : 'Mark Correct'}
                                  </Button>

                                  <Input
                                    value={optLabel}
                                    onChange={(e) => {
                                      const updated = [...q.options!];
                                      const isString = (typeof updated[optIdx] === 'string');

                                      if (isString) {
                                        updated[optIdx] = e.target.value;
                                      } else {
                                        updated[optIdx] = { ...(updated[optIdx] as object), label: e.target.value };
                                      }

                                      handleUpdateQuestion(q.id, { options: updated });
                                    }}
                                    className="text-xs h-7 bg-background"
                                  />

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = q.options!.filter((_, i) => i !== optIdx);
                                      handleUpdateQuestion(q.id, { options: updated });
                                    }}
                                    className="text-xs h-7 px-1 text-muted-foreground hover:text-rose-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              );
                            })}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const current = Array.isArray(q.options) ? [...q.options] : [];
                              current.push(`Choice ${current.length + 1}`);
                              handleUpdateQuestion(q.id, { options: current });
                            }}
                            className="text-xs h-7 gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Option</span>
                          </Button>
                        </div>
                      )}

                      {/* Verification selector for URL submission */}
                      {q.type === 'url_submission' && (
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-xs font-semibold">Enforced Work Platform</Label>
                          <Select
                            value={q.verificationType || 'google_docs'}
                            onValueChange={(val) =>
                              handleUpdateQuestion(q.id, {
                                verificationType: val as FocusQuestion['verificationType'],
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue placeholder="Verification Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google_docs">Google Docs Document</SelectItem>
                              <SelectItem value="workflowy">Workflowy Outline</SelectItem>
                              <SelectItem value="xmind">XMind / Mindmap</SelectItem>
                              <SelectItem value="figma">Figma Canvas</SelectItem>
                              <SelectItem value="url">Any Public HTTPS URL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG 1: CREATE NEW FOCUS QUIZ                                           */}
      {/* ========================================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span>Create New Focus Quiz</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure baseline parameters for your new sequential assessment. You can customize questions and content in the studio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCreateQuiz} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Quiz Title</Label>
              <Input
                value={newQuizTitle}
                onChange={(e) => {
                  setNewQuizTitle(e.target.value);
                  const generated = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setNewQuizSlug(generated);
                }}
                placeholder="e.g. Mobile Developer Screening"
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unique Quiz Slug / Identifier</Label>
              <Input
                value={newQuizSlug}
                onChange={(e) => setNewQuizSlug(e.target.value)}
                placeholder="e.g. mobile-dev-quiz-v1"
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Visual Theme</Label>
                <Select value={newQuizTheme} onValueChange={setNewQuizTheme}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">Purple Theme</SelectItem>
                    <SelectItem value="riseup-asia">Riseup Asia</SelectItem>
                    <SelectItem value="dracula">Dracula</SelectItem>
                    <SelectItem value="vscode-dark">VS Code Dark</SelectItem>
                    <SelectItem value="microsoft-blue">Microsoft Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pass Threshold (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={newQuizPassing}
                  onChange={(e) => setNewQuizPassing(Number(e.target.value))}
                  className="text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Job Role</Label>
              <Input
                value={newQuizJobTitle}
                onChange={(e) => setNewQuizJobTitle(e.target.value)}
                placeholder="e.g. Senior Android Engineer"
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 font-semibold gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create & Open in Studio</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: DELETE CONFIRMATION                                             */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(quizToDelete)} onOpenChange={(open) => {
        const isClosed = !open;

        if (isClosed) {
          setQuizToDelete(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Delete Focus Quiz</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{quizToDelete?.title}</strong> (<span className="font-mono">{quizToDelete?.id}</span>)?
              <br />
              This will remove the quiz from your saved studio assessments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuizToDelete(null)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteQuiz}
              className="text-xs h-8 font-semibold gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Focus Quiz</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

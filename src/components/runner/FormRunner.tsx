import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FormModel,
  FormField,
  FormSubmissionResult,
  evaluateFileUploadValidation,
  parseVideoEmbedUrl,
  QuestionCitation,
  CitationPosition,
  BooleanDisplayPreset,
} from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useExamAppStore } from '@/quiz/store/exam-store';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Play,
  Copy,
  Share2,
  Layers,
  Palette,
  UploadCloud,
  FileText,
  X,
  Video,
  Film,
  Zap,
  Sparkles,
  Bug,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Heading,
  Clock,
  Maximize2,
  Minimize2,
  ShieldAlert,
  ListOrdered,
  BookOpen,
  Star,
  Heart,
  ThumbsUp,
  Smile,
  Award,
  GraduationCap,
  Circle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { PhoneWithCountrySelect } from '@/components/ui/phone-input';
import { MultilineListItemsInput } from '@/components/forms/multiline-list-items-input';
import { toast } from 'sonner';
import { getTheme, getThemeCssVariables, THEME_PRESETS } from '@/lib/themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  evaluateFieldVisibility,
  evaluateFieldRequired,
  getNextStepIndex,
  getPreviousStepIndex,
} from '@/lib/branching-engine';

interface FormRunnerProps {
  form?: FormModel;
  onClose?: () => void;
  isPreviewRoute?: boolean;
}

const PRESET_PROJECTS: Record<string, FormModel> = {
  'intern-programmer': {
    id: 'intern-programmer',
    title: 'Intern Programmer Candidate Evaluation',
    description: 'Assessment covering foundational computer science, algorithm analysis, and web engineering principles.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: true,
    isPublished: true,
    settings: {
      timeLimitSeconds: 1800,
      passingScore: 70,
      successMessage: 'Congratulations! Your score qualifies for Phase 2 interview review.',
    },
    fields: [
      {
        id: 'q1',
        type: 'multiple_choice',
        label: 'What is the time complexity of searching an element in a balanced binary search tree?',
        isRequired: true,
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 'O(log n)',
        points: 10,
        group: 'Algorithms',
      },
      {
        id: 'q2',
        type: 'true_false',
        label: 'In JavaScript / TypeScript, arrays are passed by reference rather than by value.',
        isRequired: true,
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
        group: 'Language Core',
      },
      {
        id: 'q3',
        type: 'link',
        label: 'Official Candidate Assessment Guidelines & Code of Ethics',
        url: 'https://careers.developers-organism.com/apply/?job=Intern+Programmer',
        linkText: 'Review Guidelines',
        isRequired: false,
        group: 'Compliance',
      },
      {
        id: 'q4',
        type: 'regex_text',
        label: 'Candidate University Student ID or Roll Code',
        placeholder: 'e.g. STU-2026-9901',
        validationRule: {
          ruleType: 'regex',
          pattern: '^STU-[0-9]{4}-[0-9]{4}$',
          errorMessage: 'Format must be STU-YYYY-XXXX (e.g. STU-2026-1024)',
        },
        isRequired: true,
        group: 'Verification',
      },
      {
        id: 'q5',
        type: 'dropdown',
        label: 'Select primary programming language for practical test:',
        isRequired: true,
        options: ['TypeScript / Node.js', 'PHP / Laravel', 'Python / Django', 'Go / Golang'],
        correctAnswer: 'TypeScript / Node.js',
        points: 10,
        group: 'Language Core',
      },
    ],
  },

  'full-stack-architect': {
    id: 'full-stack-architect',
    title: 'Full-Stack Web Architecture Certification',
    description: 'Enterprise evaluation on REST API design, state management, and split-DB patterns.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: true,
    isPublished: true,
    settings: {
      timeLimitSeconds: 2400,
      passingScore: 80,
      successMessage: 'Exemplary performance! Full-Stack certification verified.',
    },
    fields: [
      {
        id: 'fsa-1',
        type: 'multiple_choice',
        label: 'Which HTTP header is mandatory for Content Security Policy compliance?',
        isRequired: true,
        options: ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'Access-Control-Allow-Origin'],
        correctAnswer: 'Content-Security-Policy',
        points: 15,
      },
      {
        id: 'fsa-2',
        type: 'true_false',
        label: 'SQLite split-database engines can run isolated WAL modes per individual user shard.',
        isRequired: true,
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 15,
      },
    ],
  },

  'cybersecurity-essentials': {
    id: 'cybersecurity-essentials',
    title: 'Cybersecurity Fundamentals & Access Control',
    description: 'Practical security evaluation on OWASP Top 10, JWT sanitization, and SQL injection prevention.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: false,
    isPublished: true,
    settings: {
      timeLimitSeconds: 1200,
      passingScore: 75,
      successMessage: 'Security compliance verified.',
    },
    fields: [
      {
        id: 'sec-1',
        type: 'multiple_choice',
        label: 'What is the most effective defense against SQL Injection vulnerabilities?',
        isRequired: true,
        options: ['Parameterized Queries / Prepared Statements', 'Input String Escaping', 'Client-side Regex Filtering', 'Web Application Firewalls only'],
        correctAnswer: 'Parameterized Queries / Prepared Statements',
        points: 20,
      },
    ],
  },
};

export interface QuizSessionData {
  formSlug: string;
  answers: Record<string, unknown>;
  currentStep: number;
  stepHistory: number[];
  savedAt: number;
  isTimed: boolean;
  timeLeftSeconds: number | null;
}

interface QuizHeroSectionProps {
  title: string;
  description?: string;
  questionCount: number;
  totalPoints: number;
  passingScore: number;
  isTimed: boolean;
  timeLimitSeconds?: number;
  hasSavedSession: boolean;
  savedTimeAgo?: string;
  currentStep: number;
  onStartOrResume: () => void;
  onSaveProgress: () => void;
}

const QuizHeroSection: React.FC<QuizHeroSectionProps> = ({
  title,
  description,
  questionCount,
  totalPoints,
  passingScore,
  isTimed,
  timeLimitSeconds,
  hasSavedSession,
  savedTimeAgo,
  currentStep,
  onStartOrResume,
  onSaveProgress,
}) => {
  const formatHeroTimer = (seconds?: number): string => {
    if (!seconds) {
      return 'Untimed';
    }
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isTimedWithSeconds = Boolean(isTimed && timeLimitSeconds);
  const isQuestionActive = currentStep > 0;

  return (
    <div className="w-full bg-card/70 backdrop-blur-xs border border-border rounded-2xl p-6 sm:p-8 text-center shadow-xs relative overflow-hidden transition-all">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10" />

      {/* Icon Badge */}
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3 shadow-2xs">
        <GraduationCap className="w-6 h-6" />
      </div>

      {/* Gradient Heading (Ubuntu) */}
      <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
        {title}
      </h1>

      {/* Description (Poppins) */}
      <p className="font-sans text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-2 leading-relaxed">
        {description || 'Evaluate candidate skills with standardized assessment modules and live performance verification.'}
      </p>

      {/* Metadata Stats Grid / Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-4 text-xs font-sans">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-foreground font-medium">
          <ListOrdered className="w-3.5 h-3.5 text-primary" />
          <span>{questionCount} Questions</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-foreground font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {isTimedWithSeconds ? `Timed Exam (${formatHeroTimer(timeLimitSeconds)})` : 'Self-Paced / Untimed'}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-foreground font-medium">
          <Award className="w-3.5 h-3.5 text-primary" />
          <span>{totalPoints} Total Points</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-foreground font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Pass Score: {passingScore}%</span>
        </span>

        {hasSavedSession ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Saved Session {savedTimeAgo ? `(${savedTimeAgo})` : 'Available'}</span>
          </span>
        ) : null}
      </div>

      {/* Hero Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5 font-sans">
        <Button
          type="button"
          onClick={onStartOrResume}
          size="sm"
          className="relative overflow-hidden group text-xs sm:text-sm font-semibold h-9 px-5 bg-primary text-primary-foreground shadow-xs hover:shadow-md transition-all cursor-pointer rounded-lg"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            {hasSavedSession ? 'Resume Saved Session' : isQuestionActive ? `Continue Question #${currentStep + 1}` : 'Start Assessment'}
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="absolute inset-0 bg-primary-foreground/15 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
        </Button>

        <Button
          type="button"
          onClick={onSaveProgress}
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm font-medium h-9 px-4 border border-border hover:bg-accent hover:text-foreground cursor-pointer flex items-center gap-1.5 rounded-lg"
        >
          <Save className="w-3.5 h-3.5 text-primary" />
          <span>Save Progress</span>
        </Button>
      </div>
    </div>
  );
};

export const FormRunner: React.FC<FormRunnerProps> = ({
  form: initialForm,
  onClose,
  isPreviewRoute,
}) => {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const examStore = useExamAppStore();
  const session = examStore.session;
  const quizStore = useQuizStore();

  const storeForm: FormModel = useMemo(() => ({
    id: quizStore.id || 'builder-active',
    title: quizStore.title || 'Custom Form',
    description: quizStore.description || '',
    formType: quizStore.formType || 'quiz',
    formAccess: quizStore.formAccess || 'public',
    isSequential: quizStore.isSequential,
    isPublished: true,
    settings: quizStore.settings,
    fields: quizStore.fields,
  }), [quizStore]);

  // Determine active project from URL, initial form, or store
  const getInitialProjectId = (): string => {
    if (initialForm) {
      return 'custom-active';
    }

    if (routeSlug) {
      if (PRESET_PROJECTS[routeSlug]) {
        return routeSlug;
      }

      return 'custom-active';
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlProject = params.get('project');

      if (urlProject && PRESET_PROJECTS[urlProject]) {
        return urlProject;
      }

      if (params.get('preview') || isPreviewRoute) {
        return 'custom-active';
      }
    }

    if (isPreviewRoute || quizStore.fields.length > 0) {
      return 'custom-active';
    }

    return 'intern-programmer';
  };

  const [selectedProjectId, setSelectedProjectId] = useState<string>(getInitialProjectId());
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme && (THEME_PRESETS[urlTheme] || urlTheme === 'green-choice' || urlTheme === 'sweet-digs' || urlTheme === 'clean-wide')) {
        return urlTheme;
      }
    }
    return 'green-choice';
  });
  const currentTheme = getTheme(activeThemeId);
  const themeVars = getThemeCssVariables(currentTheme);

  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  const activeForm: FormModel = useMemo(() => {
    if (selectedProjectId === 'custom-active') {
      return initialForm || storeForm;
    }
    if (PRESET_PROJECTS[selectedProjectId]) {
      return PRESET_PROJECTS[selectedProjectId];
    }
    return initialForm || storeForm || PRESET_PROJECTS['intern-programmer'];
  }, [selectedProjectId, initialForm, storeForm]);

  const [currentStep, setCurrentStep] = useState(0);
  const [stepHistory, setStepHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [guestName, setGuestName] = useState(session.respondentName || '');
  const [guestEmail, setGuestEmail] = useState(session.respondentEmail || '');
  const [tokenInput, setTokenInput] = useState(session.token || '');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<FormSubmissionResult | null>(null);

  const activeSlug = selectedProjectId === 'custom-active' 
    ? (quizStore.slug || 'custom-form') 
    : selectedProjectId;
  const storageKey = `wp_quiz_session_${activeSlug}`;

  const [savedSession, setSavedSession] = useState<QuizSessionData | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Load saved session on activeSlug change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: QuizSessionData = JSON.parse(raw);
        setSavedSession(parsed);
        const minsAgo = Math.max(1, Math.round((Date.now() - parsed.savedAt) / 60000));
        setLastSavedTime(`${minsAgo}m ago`);
      } else {
        setSavedSession(null);
        setLastSavedTime(null);
      }
    } catch {
      setSavedSession(null);
      setLastSavedTime(null);
    }
  }, [storageKey]);

  const totalPossiblePoints = useMemo(() => {
    return visibleFields.reduce((sum, f) => {
      const pts = f.customPointsOverride ?? (f.difficulty === 'hard' ? 20 : f.difficulty === 'medium' ? 10 : 5);
      return sum + pts;
    }, 0);
  }, [visibleFields]);

  const handleSaveProgress = () => {
    try {
      const sessionData: QuizSessionData = {
        formSlug: activeSlug,
        answers,
        currentStep,
        stepHistory,
        savedAt: Date.now(),
        isTimed: Boolean(activeForm.hasTimeLimit || activeForm.timeLimitSeconds),
        timeLeftSeconds,
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionData));
      setSavedSession(sessionData);
      setLastSavedTime('Just now');
      toast.success('Quiz progress saved to session successfully!');
    } catch {
      toast.error('Failed to save quiz session to local storage.');
    }
  };

  const handleResumeSession = () => {
    if (savedSession) {
      if (savedSession.answers) {
        setAnswers(savedSession.answers);
      }
      if (typeof savedSession.currentStep === 'number') {
        setCurrentStep(savedSession.currentStep);
      }
      if (savedSession.stepHistory) {
        setStepHistory(savedSession.stepHistory);
      }
      if (savedSession.timeLeftSeconds !== null && savedSession.timeLeftSeconds !== undefined) {
        setTimeLeftSeconds(savedSession.timeLeftSeconds);
      }
      toast.success('Saved session restored successfully!');
    }
  };

  const handleTestAutoFill = () => {
    if (isSequential && currentField) {
      let mockVal: unknown = 'Sample Response';
      if (currentField.type === 'multiple_choice') {
        mockVal = currentField.correctAnswer ? [currentField.correctAnswer] : currentField.options?.slice(0, 1) || ['A'];
      } else if (currentField.type === 'single_choice' || currentField.type === 'true_false' || currentField.type === 'boolean') {
        const defaultChoice = currentField.booleanDisplay === 'yes_no'
          ? 'Yes'
          : currentField.booleanDisplay === 'enable_disable'
          ? 'Enable'
          : currentField.booleanDisplay === 'agree_disagree'
          ? 'Agree'
          : 'True';
        mockVal = currentField.correctAnswer || currentField.options?.[0] || defaultChoice;
      } else if (currentField.type === 'list_items') {
        mockVal = (currentField.suggestionsPool && currentField.suggestionsPool.length > 0)
          ? currentField.suggestionsPool.slice(0, 2)
          : ['Primary Item', 'Secondary Item'];
      } else if (currentField.type === 'rating') {
        mockVal = 5;
      } else if (currentField.type === 'dropdown') {
        mockVal = currentField.correctAnswer || currentField.options?.[0] || '';
      } else if (currentField.type === 'email') {
        mockVal = 'candidate.test@example.com';
      } else if (currentField.type === 'phone' || currentField.type === 'whatsapp') {
        mockVal = '+880 1712345678';
      } else if (currentField.type === 'regex_text') {
        mockVal = 'STU-2026-1024';
      } else if (currentField.type === 'file_upload') {
        mockVal = { fileName: 'resume-portfolio.pdf', fileSizeMb: 1.5 };
      }
      handleAnswerChange(currentField.id, mockVal);
      toast.success(`⚡ Auto-filled Question #${currentStep + 1}`);
      setTimeout(() => {
        handleNextStep();
      }, 250);
      return;
    }

    const newAnswers: Record<string, unknown> = { ...answers };
    fields.forEach((f) => {
      if (!newAnswers[f.id]) {
        if (f.type === 'multiple_choice') {
          newAnswers[f.id] = f.correctAnswer ? [f.correctAnswer] : f.options?.slice(0, 1) || ['A'];
        } else if (f.type === 'single_choice' || f.type === 'true_false' || f.type === 'boolean') {
          const defaultChoice = f.booleanDisplay === 'yes_no'
            ? 'Yes'
            : f.booleanDisplay === 'enable_disable'
            ? 'Enable'
            : f.booleanDisplay === 'agree_disagree'
            ? 'Agree'
            : 'True';
          newAnswers[f.id] = f.correctAnswer || f.options?.[0] || defaultChoice;
        } else if (f.type === 'list_items') {
          newAnswers[f.id] = (f.suggestionsPool && f.suggestionsPool.length > 0)
            ? f.suggestionsPool.slice(0, 2)
            : ['Primary Item', 'Secondary Item'];
        } else if (f.type === 'rating') {
          newAnswers[f.id] = 5;
        } else if (f.type === 'dropdown') {
          newAnswers[f.id] = f.correctAnswer || f.options?.[0] || '';
        } else if (f.type === 'email') {
          newAnswers[f.id] = 'candidate.test@example.com';
        } else if (f.type === 'phone' || f.type === 'whatsapp') {
          newAnswers[f.id] = '+880 1712345678';
        } else if (f.type === 'regex_text') {
          newAnswers[f.id] = 'STU-2026-1024';
        } else {
          newAnswers[f.id] = `Valid Response for ${f.label}`;
        }
      }
    });
    setAnswers(newAnswers);
    toast.success('⚡ Auto-filled all questions!');
  };

  useEffect(() => {
    if (session.isAuthenticated) {
      setGuestName(session.respondentName);
      setGuestEmail(session.respondentEmail);
      if (session.token) {
        setTokenInput(session.token);
      }
    }
  }, [session]);

  // Auto-authenticate if invite or token parameter is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite') || params.get('token');
      if (token && !session.isAuthenticated) {
        setTokenInput(token);
        const isSuccess = examStore.authenticateWithToken(token);
        if (isSuccess) {
          setAuthMessage('✓ Access token verified. Candidate session active.');
          setTimeout(() => setAuthMessage(null), 3500);
        }
      }
    }
  }, [session.isAuthenticated, examStore]);

  const fields = useMemo(() => activeForm.fields || [], [activeForm.fields]);
  const isSequential = activeForm.isSequential && fields.length > 1;
  const currentField = fields[currentStep];
  const visibleFields = useMemo(
    () => fields.filter((f) => evaluateFieldVisibility(f, answers, fields)),
    [fields, answers]
  );
  const isCurrentFieldRequired = currentField ? evaluateFieldRequired(currentField, answers, fields) : false;
  const nextVisibleIndex = getNextStepIndex(fields, currentStep, answers);
  const isLastVisibleStep = nextVisibleIndex >= fields.length;

  const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [tabBlurCount, setTabBlurCount] = useState<number>(0);
  const [showBlackoutWarning, setShowBlackoutWarning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTimerDisplay = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Timer Initialization & Reset Effect
  useEffect(() => {
    if (isSubmitted) return;
    const settings = activeForm.settings;
    if (!settings) return;

    const mode = settings.timerMode || 'global';
    let initialSeconds: number | null = null;

    if (mode === 'global' && settings.timeLimitSeconds) {
      if (timeLeftSeconds === null) {
        initialSeconds = settings.timeLimitSeconds;
      }
    } else if (mode === 'per_question') {
      initialSeconds = settings.perQuestionSeconds || 60;
    } else if (mode === 'per_tier' && currentField) {
      const diff = currentField.difficulty || 'medium';
      const tierTimers = settings.difficultyTimers || { easy: 45, medium: 90, hard: 180 };
      initialSeconds = tierTimers[diff] || 90;
    }

    if (initialSeconds !== null) {
      setTimeLeftSeconds(initialSeconds);
    }
  }, [activeForm, currentStep, isSubmitted]);

  // Interval Countdown Effect
  useEffect(() => {
    if (timeLeftSeconds === null || timeLeftSeconds <= 0 || isSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (activeForm.settings?.timerMode === 'per_question') {
            toast.warning('Time expired for this question! Advancing...');
            handleNextStep();
          } else {
            toast.error('Time limit reached! Submitting examination...');
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeftSeconds, isSubmitted, activeForm]);

  // Fullscreen Anti-Cheat Integrity Monitor
  useEffect(() => {
    const isLockEnabled = Boolean(activeForm.settings?.enableFullscreenLock);
    if (!isLockEnabled || isSubmitted) return;

    const handleBlur = () => {
      setTabBlurCount((prev) => {
        const next = prev + 1;
        setShowBlackoutWarning(true);
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);
    const handleVisChange = () => {
      if (document.hidden) {
        handleBlur();
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, [activeForm.settings?.enableFullscreenLock, isSubmitted]);

  useEffect(() => {
    if (isSequential) {
      if (currentField) {
        const isVisible = evaluateFieldVisibility(currentField, answers, fields);

        if (!isVisible) {
          const nextIdx = getNextStepIndex(fields, currentStep, answers);
          const hasValidNext = nextIdx < fields.length;

          if (hasValidNext) {
            setCurrentStep(nextIdx);
          }
        }
      }
    }
  }, [answers, currentStep, fields, isSequential, currentField]);

  const renderCitations = (citationsList?: QuestionCitation[], pos: CitationPosition = 'prefix') => {
    if (!citationsList || citationsList.length === 0) return null;
    const matching = citationsList.filter((c) => c.position === pos);
    if (matching.length === 0) return null;

    return (
      <div className="space-y-2 my-2.5">
        {matching.map((cit) => {
          const isDone = Boolean(completedChecks[cit.id]);

          return (
            <div
              key={cit.id}
              className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 transition-all ${
                cit.isRequiredCheck
                  ? isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground'
                    : 'border-amber-500/40 bg-amber-500/5 text-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground'
              }`}
            >
              {cit.isRequiredCheck ? (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={(e) =>
                      setCompletedChecks((prev) => ({ ...prev, [cit.id]: e.target.checked }))
                    }
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-semibold text-foreground">{cit.title}</span>
                </label>
              ) : (
                <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                {!cit.isRequiredCheck && (
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>{cit.title}</span>
                    {cit.url && (
                      <a
                        href={cit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-xs inline-flex items-center gap-0.5"
                      >
                        [External Link &nearr;]
                      </a>
                    )}
                  </div>
                )}
                {cit.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{cit.description}</p>
                )}
              </div>

              {cit.isRequiredCheck && (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono shrink-0 ${
                    isDone
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10'
                      : 'border-amber-500 text-amber-600 bg-amber-500/10 animate-pulse'
                  }`}
                >
                  {isDone ? 'Completed ✓' : 'Mandatory Task *'}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleAnswerChange = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleProjectSwitch = (newProjectId: string) => {
    const targetSlug = newProjectId === 'custom-active' 
      ? (quizStore.slug || 'custom-form') 
      : newProjectId;

    setSelectedProjectId(newProjectId);
    setCurrentStep(0);
    setStepHistory([]);
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);

    // Update browser address bar path directly to canonical /preview/:slug or /f/:slug
    if (typeof window !== 'undefined') {
      const nextPath = isPreviewRoute ? `/preview/${targetSlug}` : `/f/${targetSlug}`;
      window.history.replaceState({}, '', nextPath);
    }
  };

  const handleCopyProjectLink = () => {
    const targetSlug = selectedProjectId === 'custom-active' 
      ? (quizStore.slug || 'custom-form') 
      : selectedProjectId;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const link = isPreviewRoute ? `${origin}/preview/${targetSlug}` : `${origin}/f/${targetSlug}`;
    navigator.clipboard.writeText(link);
    toast.success(`Copied live canonical URL: ${link}`);
  };

  const handleVerifyToken = () => {
    if (!tokenInput.trim()) {
      setAuthMessage('Please enter an invitation access token.');
      return;
    }

    const isSuccess = examStore.authenticateWithToken(tokenInput.trim());

    if (isSuccess) {
      setAuthMessage('✓ Token verified! Logged in as invited respondent.');
      setTimeout(() => setAuthMessage(null), 3500);
    } else {
      setAuthMessage('❌ Invalid or expired invitation token.');
      setTimeout(() => setAuthMessage(null), 3500);
    }
  };

  const handleAutoFill = () => {
    const newAnswers = { ...answers };
    fields.forEach((f) => {
      if (f.type === 'multiple_choice') {
        newAnswers[f.id] = (f.correctAnswers && f.correctAnswers.length > 0)
          ? f.correctAnswers
          : f.correctAnswer
          ? [f.correctAnswer]
          : (f.options && f.options.length > 0)
          ? [f.options[0]]
          : ['Sample Answer'];
      } else if (f.type === 'single_choice' || f.type === 'dropdown' || f.type === 'true_false' || f.type === 'boolean') {
        const defaultChoice = f.booleanDisplay === 'yes_no'
          ? 'Yes'
          : f.booleanDisplay === 'enable_disable'
          ? 'Enable'
          : f.booleanDisplay === 'agree_disagree'
          ? 'Agree'
          : 'True';
        newAnswers[f.id] = f.correctAnswer || (f.options && f.options.length > 0 ? f.options[0] : defaultChoice);
      } else if (f.type === 'list_items') {
        newAnswers[f.id] = (f.suggestionsPool && f.suggestionsPool.length > 0)
          ? f.suggestionsPool.slice(0, 2)
          : ['Primary Item', 'Secondary Item'];
      } else if (f.type === 'short_answer' || f.type === 'paragraph') {
        newAnswers[f.id] = f.correctAnswer || 'Sample answer text for testing purposes.';
      } else if (f.type === 'email') {
        newAnswers[f.id] = 'candidate.test@example.com';
      } else if (f.type === 'phone' || f.type === 'whatsapp') {
        newAnswers[f.id] = '+1234567890';
      } else if (f.type === 'regex_text') {
        newAnswers[f.id] = 'STU-2026-9901';
      } else if (f.type === 'rating') {
        newAnswers[f.id] = 5;
      } else {
        newAnswers[f.id] = 'Auto-filled data';
      }
    });
    setAnswers(newAnswers);
    toast.success('Form fields auto-filled with test data!');
  };

  // Auto-fill on initial test session launch if requested via URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('test') === 'true' || params.get('autofill') === 'true') {
        const timer = setTimeout(() => {
          handleAutoFill();
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [fields.length]);

  const handleNextStep = () => {
    if (!currentField) {
      return;
    }

    const isRequired = evaluateFieldRequired(currentField, answers, fields);
    const answer = answers[currentField.id];
    const hasAnswer = answer !== undefined && answer !== null && answer !== '';

    if (isRequired) {
      if (!hasAnswer) {
        toast.error(`Please provide an answer for "${currentField.label}" before proceeding.`);

        return;
      }
    }

    // Verify mandatory checklist to-dos for current field
    if (currentField.citations && currentField.citations.length > 0) {
      const incompleteCheck = currentField.citations.find((c) => {
        if (!c.isRequiredCheck) {
          return false;
        }

        const isDone = Boolean(completedChecks[c.id]);

        return !isDone;
      });

      if (incompleteCheck) {
        toast.error(`Please complete mandatory requirement: "${incompleteCheck.title}" before proceeding.`);

        return;
      }
    }

    const nextIndex = getNextStepIndex(fields, currentStep, answers);
    const isEndReached = nextIndex >= fields.length;

    if (isEndReached) {
      handleSubmit();

      return;
    }

    setStepHistory((prev) => [...prev, currentStep]);
    setCurrentStep(nextIndex);
  };

  const handlePreviousStep = () => {
    if (stepHistory.length > 0) {
      const newHistory = [...stepHistory];
      let targetIndex = newHistory.pop()!;
      while (newHistory.length > 0 && !evaluateFieldVisibility(fields[targetIndex], answers, fields)) {
        targetIndex = newHistory.pop()!;
      }
      setStepHistory(newHistory);
      setCurrentStep(targetIndex);
    } else {
      const prevIndex = getPreviousStepIndex(fields, currentStep, answers);
      setCurrentStep(prevIndex);
    }
  };

  const handleSubmit = () => {
    const finalName = guestName.trim() || session.respondentName || 'Anonymous Candidate';
    const finalEmail = guestEmail.trim() || session.respondentEmail || 'candidate@example.com';

    const currentVisibleFields = fields.filter((f) => evaluateFieldVisibility(f, answers, fields));

    // Verify mandatory question responses
    const missingRequiredField = currentVisibleFields.find((f) => {
      const isRequired = evaluateFieldRequired(f, answers, fields);
      const answer = answers[f.id];
      const hasAnswer = answer !== undefined && answer !== null && answer !== '';

      if (isRequired) {
        if (!hasAnswer) {
          return true;
        }
      }

      return false;
    });

    if (missingRequiredField) {
      toast.error(`Please answer required question: "${missingRequiredField.label}"`);

      return;
    }

    // Verify mandatory checklist to-dos across all visible fields
    for (const f of currentVisibleFields) {
      if (f.citations && f.citations.length > 0) {
        const incompleteCheck = f.citations.find((c) => {
          if (!c.isRequiredCheck) {
            return false;
          }

          const isDone = Boolean(completedChecks[c.id]);

          return !isDone;
        });

        if (incompleteCheck) {
          toast.error(`Please complete mandatory task: "${incompleteCheck.title}" (Question: ${f.label})`);

          return;
        }
      }
    }

    let earned = 0;
    let total = 0;
    let isPassed: boolean | null = null;
    let pct = 0;

    const isQuiz = activeForm.formType === 'quiz';

    const normalizeAnswer = (val: unknown): string => {
      const text = String(val ?? '').trim();
      if (text.startsWith('__other__:')) {
        return text.substring('__other__:'.length).trim().toLowerCase();
      }
      return text.toLowerCase();
    };

    if (isQuiz) {
      currentVisibleFields.forEach((f) => {
        const defaultPts = f.difficulty === 'easy' ? 5 : f.difficulty === 'hard' ? 20 : 10;
        const pts = f.points ?? defaultPts;
        total += pts;
        const userRaw = answers[f.id];
        const correctAnswers = (f as FormField & { correctAnswers?: string[] }).correctAnswers;
        const singleCorrect = f.correctAnswer || '';
        let isCorrect = false;

        const hasMultiCorrect = Boolean(correctAnswers && correctAnswers.length > 0);
        if (hasMultiCorrect) {
          const userArr = (Array.isArray(userRaw) ? userRaw : [userRaw])
            .map(normalizeAnswer)
            .filter(Boolean);
          const cleanExpected = (correctAnswers || []).map(normalizeAnswer).filter(Boolean);

          const hasEqualCount = userArr.length === cleanExpected.length;
          if (hasEqualCount) {
            const allMatched = cleanExpected.every((exp) => userArr.includes(exp));
            if (allMatched) {
              isCorrect = true;
            }
          }
        } else if (f.type === 'list_items') {
          const userItems = Array.isArray(userRaw)
            ? userRaw.map((s) => String(s).trim().toLowerCase())
            : String(userRaw || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
          const expectedItems = (correctAnswers && correctAnswers.length > 0 ? correctAnswers : [singleCorrect])
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          if (expectedItems.length > 0) {
            isCorrect = expectedItems.every((exp) => userItems.includes(exp));
          } else {
            isCorrect = userItems.length > 0;
          }
        } else {
          const userStr = normalizeAnswer(userRaw);
          const expectedStr = normalizeAnswer(singleCorrect || (correctAnswers && correctAnswers[0]) || '');
          const hasUserAns = Boolean(userStr);
          const hasExpected = Boolean(expectedStr);

          if (hasUserAns) {
            if (hasExpected) {
              const isMatch = userStr === expectedStr;
              if (isMatch) {
                isCorrect = true;
              }
            }
          }
        }

        if (isCorrect) {
          earned += pts;
        }
      });

      const hasTotal = total > 0;
      pct = hasTotal ? Math.round((earned / total) * 100) : 0;
      const passingScore = activeForm.settings?.passingScore ?? 70;
      isPassed = pct >= passingScore;

      setResult({
        form_id: 1,
        form_type: 'quiz',
        score: earned,
        total_possible_score: total,
        score_percentage: pct,
        is_passed: isPassed,
        message: activeForm.settings?.successMessage || 'Quiz completed successfully!',
      });
    } else {
      setResult({
        form_id: 1,
        form_type: activeForm.formType,
        message: activeForm.settings?.successMessage || 'Submission received successfully!',
      });
    }

    // Persist to store
    examStore.addSubmission({
      form_title: activeForm.title,
      form_type: activeForm.formType,
      respondent_name: finalName,
      respondent_email: finalEmail,
      score: earned,
      total_score: total,
      score_percentage: pct,
      is_passed: Boolean(isPassed),
      answers: currentVisibleFields.map((f) => {
        const userRaw = answers[f.id];
        const correctAnswers = (f as FormField & { correctAnswers?: string[] }).correctAnswers;
        const singleCorrect = f.correctAnswer || '';
        let isCorrect = false;

        const hasMultiCorrect = Boolean(correctAnswers && correctAnswers.length > 0);
        if (hasMultiCorrect) {
          const userArr = (Array.isArray(userRaw) ? userRaw : [userRaw])
            .map(normalizeAnswer)
            .filter(Boolean);
          const cleanExpected = (correctAnswers || []).map(normalizeAnswer).filter(Boolean);

          const hasEqualCount = userArr.length === cleanExpected.length;
          if (hasEqualCount) {
            const allMatched = cleanExpected.every((exp) => userArr.includes(exp));
            if (allMatched) {
              isCorrect = true;
            }
          }
        } else if (f.type === 'list_items') {
          const userItems = Array.isArray(userRaw)
            ? userRaw.map((s) => String(s).trim().toLowerCase())
            : String(userRaw || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
          const expectedItems = (correctAnswers && correctAnswers.length > 0 ? correctAnswers : [singleCorrect])
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          if (expectedItems.length > 0) {
            isCorrect = expectedItems.every((exp) => userItems.includes(exp));
          } else {
            isCorrect = userItems.length > 0;
          }
        } else {
          const userStr = normalizeAnswer(userRaw);
          const expectedStr = normalizeAnswer(singleCorrect || (correctAnswers && correctAnswers[0]) || '');
          const hasUserAns = Boolean(userStr);
          const hasExpected = Boolean(expectedStr);

          if (hasUserAns) {
            if (hasExpected) {
              const isMatch = userStr === expectedStr;
              if (isMatch) {
                isCorrect = true;
              }
            }
          }
        }

        const formatAnswerDisplay = (ans: unknown): string => {
          if (Array.isArray(ans)) {
            return ans.map((item) => String(item).replace(/^__other__:/, 'Other: ')).join(', ');
          }
          return String(ans ?? '').replace(/^__other__:/, 'Other: ');
        };

        return {
          question: f.label,
          answer: formatAnswerDisplay(userRaw),
          correct: hasMultiCorrect ? (correctAnswers || []).join(', ') : singleCorrect,
          isCorrect,
        };
      }),
    });

    const hasSessionToken = Boolean(session.token);

    if (hasSessionToken) {
      examStore.markInviteCompleted(session.token);
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-xl mx-auto border-emerald-500/40 shadow-xl bg-card animate-in fade-in duration-150">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto my-2 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xl">
            ✓
          </div>
          <CardTitle className="text-xl font-bold">
            {activeForm.formType === 'quiz' ? 'Assessment Completed' : 'Submission Received'}
          </CardTitle>
          <CardDescription className="text-xs">{result?.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {activeForm.formType === 'quiz' ? (
            <div className="p-4 rounded-xl bg-muted/30 text-center space-y-2 border">
              <div className="text-4xl font-extrabold text-primary font-mono">{result?.score_percentage}%</div>
              <div className="text-xs text-muted-foreground">
                Score: {result?.score} / {result?.total_possible_score} Total Points
              </div>
              <div>
                <Badge variant={result?.is_passed ? 'default' : 'destructive'} className="text-xs">
                  {result?.is_passed ? 'Passed Examination' : 'Threshold Not Met'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-muted/30 space-y-1 text-xs border">
              <div><strong>Candidate:</strong> {guestName || 'Anonymous'}</div>
              <div><strong>Email:</strong> {guestEmail || 'N/A'}</div>
              <div><strong>Fields Recorded:</strong> {Object.keys(answers).length} of {fields.length}</div>
            </div>
          )}

          <div className="p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground text-center border">
            ✓ Official verification record signed and saved to SQLite Split-DB engine.
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(0);
                setAnswers({});
              }}
              className="text-xs"
            >
              Take Assessment Again
            </Button>

            <Button
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigate('/');
                }
              }}
              size="sm"
              variant="default"
              className="text-xs"
            >
              Exit to Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`space-y-5 font-sans ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-background overflow-y-auto p-4 sm:p-8 min-h-screen'
          : `${activeThemeId === 'clean-wide' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto p-3 sm:p-6 rounded-2xl`
      } transition-all duration-300 theme-${activeThemeId}`}
      style={{
        ...themeVars,
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.textPrimary,
      }}
    >
      {/* Streamlined Single-Line Project Selector, Slug & Actions Bar */}
      <div 
        className="p-2.5 sm:px-4 border border-border bg-card text-card-foreground rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Project Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Label className="text-xs font-medium font-sans flex items-center gap-1 whitespace-nowrap text-foreground">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Project:</span>
            </Label>
            <Select
              value={selectedProjectId}
              onValueChange={handleProjectSwitch}
            >
              <SelectTrigger 
                className="text-xs font-medium font-sans h-8 w-[160px] sm:w-[190px] max-w-[220px] rounded-lg border border-border bg-background text-foreground shadow-2xs cursor-pointer truncate"
              >
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent 
                className="border border-border shadow-xl backdrop-blur-md rounded-xl bg-popover text-popover-foreground text-xs font-sans"
              >
                <SelectItem value="intern-programmer" className="text-xs py-1.5 font-sans">
                  Intern Programmer Assessment
                </SelectItem>
                <SelectItem value="full-stack-architect" className="text-xs py-1.5 font-sans">
                  Full-Stack Web Architecture
                </SelectItem>
                <SelectItem value="cybersecurity-essentials" className="text-xs py-1.5 font-sans">
                  Cybersecurity Fundamentals
                </SelectItem>
                {(initialForm || quizStore.fields.length > 0) && (
                  <SelectItem value="custom-active" className="text-xs py-1.5 font-sans">
                    Custom Form ({activeForm.title || 'Builder Active'})
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Active Canonical Slug Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-mono shadow-2xs shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-muted-foreground">{isPreviewRoute ? '/preview/' : '/f/'}</span>
            <span className="font-semibold text-primary truncate max-w-[130px] sm:max-w-[180px]">
              {selectedProjectId === 'custom-active' ? (quizStore.slug || 'custom-form') : selectedProjectId}
            </span>
          </div>
        </div>

        {/* Right Action Controls: Anti-Collision guaranteed */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0 justify-end">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <Label className="text-xs font-medium font-sans flex items-center gap-1 whitespace-nowrap text-foreground">
              <Palette className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Theme:</span>
            </Label>
            <Select
              value={activeThemeId}
              onValueChange={(val) => {
                setActiveThemeId(val);
                const nextT = getTheme(val);
                document.documentElement.setAttribute('data-theme', nextT.id);
              }}
            >
              <SelectTrigger 
                className="text-xs font-medium font-sans h-8 w-[115px] sm:w-[135px] rounded-lg border border-border bg-background text-foreground hover:border-primary/50 shadow-2xs cursor-pointer truncate"
              >
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent 
                className="border border-border shadow-xl backdrop-blur-md rounded-xl bg-popover text-popover-foreground text-xs font-sans"
              >
                {Object.values(THEME_PRESETS).map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs py-1.5 font-medium font-sans">
                    {t.name.split(' (')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopyProjectLink}
            className="h-8 w-8 rounded-lg border border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-xs transition-all cursor-pointer group shrink-0"
            title="Copy Direct Canonical URL to Clipboard"
          >
            <Share2 className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            className="text-xs h-8 px-2.5 gap-1.5 font-medium font-sans border border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-xs transition-all cursor-pointer group rounded-lg shrink-0 whitespace-nowrap"
            title="Auto-fill form fields with sample test data"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Auto Fill</span>
          </Button>

          <Button
            type="button"
            variant={isDebugMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`text-xs h-8 px-2.5 gap-1 font-medium font-sans border shadow-xs transition-all cursor-pointer rounded-lg shrink-0 whitespace-nowrap ${
              isDebugMode
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                : 'border-border bg-card text-foreground hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/40'
            }`}
            title="Toggle Debug Simulator & Step Jumper"
          >
            <Bug className="w-3.5 h-3.5 text-amber-500" />
            <span>Debug</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate('/');
              }
            }}
            className="text-xs h-8 px-2.5 border border-border bg-card text-foreground hover:bg-accent hover:text-foreground cursor-pointer font-medium font-sans transition-all group rounded-lg gap-1 shrink-0 whitespace-nowrap"
            title="Exit form runner and return to portal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Button>
        </div>
      </div>

      {/* Hero Model: Assessment Introduction & Overview */}
      <QuizHeroSection
        title={activeForm.title || 'Candidate Assessment'}
        description={activeForm.description}
        questionCount={visibleFields.length}
        totalPoints={totalPossiblePoints}
        passingScore={activeForm.passingScore || 70}
        isTimed={Boolean(activeForm.hasTimeLimit || activeForm.timeLimitSeconds)}
        timeLimitSeconds={activeForm.timeLimitSeconds}
        hasSavedSession={Boolean(savedSession)}
        savedTimeAgo={lastSavedTime || undefined}
        currentStep={currentStep}
        onStartOrResume={() => {
          if (savedSession) {
            handleResumeSession();
          } else {
            setCurrentStep(0);
          }
        }}
        onSaveProgress={handleSaveProgress}
      />

      {/* Candidate Role & Access Bar */}
      <div 
        className="p-3.5 border border-border bg-card text-card-foreground rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {session.isAuthenticated ? (
            <>
              <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-0.5">
                ✓ Verified Respondent
              </Badge>
              <span className="text-sm font-semibold text-foreground">{session.respondentEmail}</span>
              <Badge variant="outline" className="text-xs uppercase font-mono border-primary text-primary font-bold">{session.role}</Badge>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs font-semibold bg-muted text-foreground px-2.5 py-0.5 font-bold">
                Candidate Guest
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">Unauthenticated Respondent</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Input
            placeholder="Invite Access Token..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="h-9 text-sm w-48 font-mono bg-background border border-border text-foreground rounded-lg"
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="h-9 px-4 text-sm font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer rounded-lg shadow-xs" 
            onClick={handleVerifyToken}
          >
            Verify
          </Button>
          {session.isAuthenticated && (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
              onClick={examStore.clearSession}
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>

      {authMessage && (
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-semibold text-center">
          {authMessage}
        </div>
      )}

      {/* Debug Mode Simulator & Step Jumper Panel */}
      {isDebugMode && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 font-heading">
              <Bug className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Developer Debug Simulator &amp; Field Inspector
            </span>
            <span className="font-mono text-muted-foreground">
              {isSequential ? `Question ${currentStep + 1} of ${fields.length}` : `${fields.length} Fields`}
            </span>
          </div>

          {isSequential && fields.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-muted-foreground">Jump Step:</span>
              {fields.map((f, idx) => (
                <Button
                  key={f.id}
                  type="button"
                  size="sm"
                  variant={currentStep === idx ? 'default' : 'outline'}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-7 px-2.5 text-xs font-mono font-semibold rounded-lg ${
                    currentStep === idx ? 'bg-amber-600 text-white' : 'border-border/80'
                  }`}
                >
                  #{idx + 1}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestAutoFill}
              className="h-7 px-2.5 text-xs font-bold border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
            >
              ⚡ Fill &amp; Advance Current
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFill}
              className="h-7 px-2.5 text-xs font-bold border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
            >
              ⚡ Fill All Questions
            </Button>
            <span className="text-muted-foreground font-mono">
              Payload: {Object.keys(answers).length} answers recorded
            </span>
          </div>
        </div>
      )}

      {/* Sequential Wizard Runner with Left-Hand Sequence Navigator */}
      {isSequential && currentField ? (
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
          {/* Left-Hand Question Sequence & Session Sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 sticky top-4">
              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-foreground">Progress</span>
                  <span className="font-mono text-primary font-bold">
                    {Math.round(((stepHistory.length + 1) / Math.max(visibleFields.length, 1)) * 100)}%
                  </span>
                </div>
                <Progress
                  value={Math.round(((stepHistory.length + 1) / Math.max(visibleFields.length, 1)) * 100)}
                  className="h-2 bg-secondary"
                />
                <div className="text-[11px] text-muted-foreground font-sans flex items-center justify-between">
                  <span>Question {currentStep + 1} of {visibleFields.length}</span>
                  <span>{Object.keys(answers).length} answered</span>
                </div>
              </div>

              {/* Question Sequence List */}
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                  Questions Sequence
                </div>
                {visibleFields.map((f, idx) => {
                  const isCurrent = currentStep === idx;
                  const isAnswered = answers[f.id] !== undefined && answers[f.id] !== '' && (Array.isArray(answers[f.id]) ? (answers[f.id] as unknown[]).length > 0 : true);

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : isAnswered
                          ? 'bg-muted/40 hover:bg-muted text-foreground border border-border/60'
                          : 'hover:bg-muted/30 text-muted-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                          isCurrent
                            ? 'bg-primary-foreground text-primary font-bold'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-600 font-bold'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{f.label || `Question #${idx + 1}`}</span>
                      </div>
                      {isAnswered ? (
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-primary-foreground' : 'text-emerald-500'}`} />
                      ) : (
                        <Circle className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-primary-foreground/60' : 'text-muted-foreground/40'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Session & Fullscreen Actions */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveProgress}
                  className="w-full h-8 text-xs font-medium font-sans justify-center gap-1.5 border-border bg-background hover:bg-primary/10 hover:text-primary rounded-lg transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-primary" />
                  <span>Save as Session</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFullscreen}
                  className="w-full h-8 text-xs font-sans text-muted-foreground hover:text-foreground justify-center gap-1.5 rounded-lg transition-all cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen Canvas'}</span>
                </Button>
              </div>
            </div>
          </aside>

          {/* Right-Hand Main Question Canvas */}
          <main className="flex-1 min-w-0 w-full">
            <Card className="w-full border border-border shadow-md bg-card text-card-foreground rounded-2xl overflow-hidden animate-in fade-in duration-150">
              <CardHeader className="py-4 px-6 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-bold text-sm text-primary">
                    Step {stepHistory.length + 1} of ~{visibleFields.length} (Question #{currentStep + 1})
                  </span>
                  <div className="flex items-center gap-2">
                    {timeLeftSeconds !== null && (
                      <Badge variant="outline" className={`font-mono text-xs gap-1 font-semibold ${
                        timeLeftSeconds < 60 ? 'border-destructive text-destructive bg-destructive/10 animate-pulse' : 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimerDisplay(timeLeftSeconds)}</span>
                      </Badge>
                    )}
                    {currentField.difficulty && (
                      <Badge variant="outline" className={`text-xs font-semibold uppercase ${
                        currentField.difficulty === 'hard'
                          ? 'border-rose-500/40 text-rose-600 bg-rose-500/10'
                          : currentField.difficulty === 'medium'
                          ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                          : 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                      }`}>
                        {currentField.difficulty} ({currentField.customPointsOverride ?? (currentField.difficulty === 'hard' ? 20 : currentField.difficulty === 'medium' ? 10 : 5)} pt)
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleFullscreen}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    Math.round(((stepHistory.length + 1) / Math.max(visibleFields.length, stepHistory.length + 1)) * 100)
                  )}
                  className="h-2 mb-2 bg-secondary"
                />
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                  {currentField.label}
                  {isCurrentFieldRequired && (
                    <span className="text-destructive text-red-500 font-bold ml-1.5" title="Mandatory Response">*</span>
                  )}
                </CardTitle>
                {isCurrentFieldRequired && (
                  <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-500 bg-amber-500/10 flex items-center gap-1.5 w-fit mt-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Mandatory Response</span>
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4 p-6">
                {/* Question Illustration / Image */}
                {currentField.imageUrl && (
                  <div className="w-full my-2 rounded-xl overflow-hidden border border-border/80 shadow-xs bg-muted/20">
                    <img
                      src={currentField.imageUrl}
                      alt={currentField.imageCaption || currentField.label}
                      className="w-full max-h-80 object-contain mx-auto"
                    />
                    {currentField.imageCaption && (
                      <p className="text-xs text-muted-foreground p-2 text-center italic bg-muted/40 border-t border-border/60">
                        {currentField.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {currentField.type !== 'video' && currentField.videoUrl && (
                  <RunnerVideoPlayer
                    videoUrl={currentField.videoUrl}
                    videoCaption={currentField.videoCaption}
                    title={currentField.label}
                  />
                )}

                {/* Prefix Citations */}
                {renderCitations(currentField.citations, 'prefix')}

                {renderFieldInput(currentField, answers[currentField.id], (val) => handleAnswerChange(currentField.id, val))}

                {/* Suffix Citations */}
                {renderCitations(currentField.citations, 'suffix')}

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentStep === 0}
                      onClick={handlePreviousStep}
                      className="text-sm h-9 px-4 font-medium border-border hover:bg-accent cursor-pointer"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestAutoFill}
                      className="text-xs h-9 px-3.5 font-bold rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      title="Fill valid answer and advance immediately"
                    >
                      ⚡ Test Fill &amp; Next
                    </Button>
                  </div>

                  {isLastVisibleStep ? (
                    <Button size="sm" onClick={handleNextStep} className="text-sm h-9 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer">
                      Submit Assessment &check;
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleNextStep} className="text-sm h-9 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer">
                      Next Question &rarr;
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      ) : (
        /* Single-Page Form Mode */
        <Card className={`w-full ${activeThemeId === 'clean-wide' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto border-border shadow-lg bg-card animate-in fade-in duration-150`}>
          <CardHeader className="py-4 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{activeForm.formType.replace('_', ' ')}</Badge>
                <Badge variant="secondary" className="text-xs">{activeForm.formAccess}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {timeLeftSeconds !== null && (
                  <Badge variant="outline" className={`font-mono text-xs gap-1 font-semibold ${
                    timeLeftSeconds < 60 ? 'border-destructive text-destructive bg-destructive/10 animate-pulse' : 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimerDisplay(timeLeftSeconds)}</span>
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFullscreen}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Exam'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <CardTitle className="text-xl font-bold">{activeForm.title}</CardTitle>
            {activeForm.description && (
              <CardDescription className="text-xs">{activeForm.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">Your Full Name</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="bg-background text-sm h-10 font-medium rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">Your Email</label>
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. elena@company.org"
                  className="bg-background text-sm h-10 font-medium rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              {visibleFields.map((f, idx) => {
                const isFieldRequired = evaluateFieldRequired(f, answers, fields);

                return (
                  <div key={f.id} className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-4">
                    <label className="font-semibold text-base sm:text-lg flex items-center justify-between gap-2">
                      <span className="text-foreground">
                        {idx + 1}. {f.label}
                        {isFieldRequired && (
                          <span className="text-destructive text-red-500 font-bold ml-1.5" title="Mandatory Response">*</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {f.difficulty && (
                          <Badge variant="outline" className={`text-xs font-semibold uppercase ${
                            f.difficulty === 'hard'
                              ? 'border-rose-500/40 text-rose-600 bg-rose-500/10'
                              : f.difficulty === 'medium'
                              ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                              : 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                          }`}>
                            {f.difficulty} ({f.customPointsOverride ?? (f.difficulty === 'hard' ? 20 : f.difficulty === 'medium' ? 10 : 5)} pt)
                          </Badge>
                        )}
                        {isFieldRequired ? (
                          <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-500 bg-amber-500/10 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Required</span>
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">Optional</span>
                        )}
                      </div>
                    </label>

                    {/* Question Illustration / Image */}
                    {f.imageUrl && (
                      <div className="w-full my-2 rounded-xl overflow-hidden border border-border/80 shadow-xs bg-muted/20">
                        <img
                          src={f.imageUrl}
                          alt={f.imageCaption || f.label}
                          className="w-full max-h-80 object-contain mx-auto"
                        />
                        {f.imageCaption && (
                          <p className="text-xs text-muted-foreground p-2 text-center italic bg-muted/40 border-t border-border/60">
                            {f.imageCaption}
                          </p>
                        )}
                      </div>
                    )}

                    {f.type !== 'video' && f.videoUrl && (
                      <RunnerVideoPlayer
                        videoUrl={f.videoUrl}
                        videoCaption={f.videoCaption}
                        title={f.label}
                      />
                    )}

                    {/* Prefix Citations */}
                    {renderCitations(f.citations, 'prefix')}

                    {renderFieldInput(f, answers[f.id], (val) => handleAnswerChange(f.id, val))}

                    {/* Suffix Citations */}
                    {renderCitations(f.citations, 'suffix')}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button onClick={handleSubmit} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold h-10 px-5 rounded-lg shadow-xs cursor-pointer">
                Submit Response
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anti-Cheat Fullscreen Blackout Overlay */}
      {showBlackoutWarning && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-card text-card-foreground border-2 border-destructive rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Anti-Cheat Alert: Focus Lost</h3>
            <p className="text-sm text-muted-foreground">
              Tab switching, window minimize, or background blur detected. This incident has been logged.
              <span className="block mt-1 font-mono text-destructive font-semibold">
                Violation Incident #{tabBlurCount}
              </span>
            </p>
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => {
                  setShowBlackoutWarning(false);
                  if (activeForm.settings?.enableFullscreenLock) {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  }
                }}
                className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold h-10 rounded-xl cursor-pointer"
              >
                Resume Examination Immediately
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RunnerFileUpload: React.FC<{
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
}> = ({ field, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileValue = (typeof value === 'object' && value !== null) 
    ? (value as {
        name?: string;
        size?: number;
        type?: string;
        uploadedAt?: string;
      })
    : null;

  const handleProcessFile = (file?: File | null) => {
    if (!file) {
      return;
    }

    const evaluation = evaluateFileUploadValidation(field.fileValidation, {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (evaluation.isValid) {
      setValidationError(null);
      onChange({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleTimeString(),
      });
      toast.success(`File accepted: ${file.name}`);
    } else {
      setValidationError(evaluation.message);
      onChange(null);
      toast.error(evaluation.message);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setValidationError(null);
  };

  const allowedExts =
    field.fileValidation?.allowedExtensions &&
    field.fileValidation.allowedExtensions.length > 0
      ? field.fileValidation.allowedExtensions
      : ['pdf', 'docx', 'zip', 'png', 'jpg'];

  const maxSize = field.fileValidation?.maxSizeMb || 10;

  return (
    <div className="space-y-2">
      {fileValue && fileValue.name ? (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
                {fileValue.name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                {fileValue.size && (
                  <span className="font-mono">
                    {(fileValue.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Validated
                </span>
                {fileValue.uploadedAt && (
                  <>
                    <span>•</span>
                    <span>{fileValue.uploadedAt}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            title="Remove and upload different file"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            handleProcessFile(dropped);
          }}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-background/50'
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              handleProcessFile(selected);
              e.target.value = '';
            }}
          />
          <UploadCloud className="w-8 h-8 text-primary/70 mb-2" />
          <span className="text-xs font-semibold text-foreground">
            Drag and drop file here, or <span className="text-primary underline font-bold">browse</span>
          </span>
          <span className="text-xs text-muted-foreground mt-1 font-mono">
            Supported: {allowedExts.map((e) => '.' + e.toLowerCase().replace(/^\./, '')).join(', ')} • Max: {maxSize} MB
          </span>
        </div>
      )}

      {validationError && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2 animate-in fade-in-50 duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{validationError}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setValidationError(null)}
            className="h-6 px-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

export const RunnerVideoPlayer: React.FC<{
  videoUrl?: string;
  videoCaption?: string;
  title?: string;
}> = ({ videoUrl, videoCaption, title }) => {
  const embedInfo = parseVideoEmbedUrl(videoUrl);
  const hasEmbed = Boolean(embedInfo && embedInfo.embedUrl);

  if (!hasEmbed) {
    return (
      <div className="w-full aspect-video rounded-xl border-2 border-dashed border-border/80 flex flex-col items-center justify-center p-6 text-center bg-muted/20">
        <Film className="w-9 h-9 text-muted-foreground/50 mb-2" />
        <p className="text-xs font-semibold text-foreground">Video Stream Unavailable</p>
        <p className="text-xs text-muted-foreground mt-1">
          No valid video URL was configured for this question.
        </p>
      </div>
    );
  }

  const isDirectVideo = Boolean(embedInfo && embedInfo.isDirectVideo);

  return (
    <div className="space-y-2">
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-border shadow-md bg-black/60">
        {isDirectVideo ? (
          <video
            controls
            className="w-full h-full object-contain"
            src={embedInfo ? embedInfo.embedUrl : ''}
          >
            Your browser does not support HTML5 video playback.
          </video>
        ) : (
          <iframe
            className="w-full h-full"
            src={embedInfo ? embedInfo.embedUrl : ''}
            title={title || 'Assessment Video Stream'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {videoCaption && (
        <p className="text-xs text-muted-foreground italic px-1 flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>{videoCaption}</span>
        </p>
      )}
    </div>
  );
};

export const RunnerListItemsInput: React.FC<{
  value: unknown;
  onChange: (val: string[]) => void;
  suggestionsPool?: string[];
  placeholder?: string;
  isReadOnly?: boolean;
}> = ({ value, onChange, suggestionsPool = [], placeholder, isReadOnly = false }) => {
  return (
    <MultilineListItemsInput
      value={value}
      onChange={onChange}
      suggestionsPool={suggestionsPool}
      placeholder={placeholder || 'Type an item or link and press Enter...'}
      isReadOnly={isReadOnly}
    />
  );
};

function renderFieldInput(field: FormField, value: unknown, onChange: (val: unknown) => void) {
  const strValue = typeof value === 'string' ? value : '';

  switch (field.type) {
    case 'section_header':
      return (
        <div className={`py-2 px-1 ${
          field.choiceAlignment === 'center'
            ? 'text-center'
            : field.choiceAlignment === 'right'
            ? 'text-right'
            : 'text-left'
        }`}>
          {field.subtitle && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {field.subtitle}
            </p>
          )}
          <div className={`h-1 w-16 bg-primary rounded-full mt-3 ${
            field.choiceAlignment === 'center'
              ? 'mx-auto'
              : field.choiceAlignment === 'right'
              ? 'ml-auto'
              : ''
          }`} />
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-2.5">
          {(field.faqItems || [
            { question: 'What is the required notice period for this role?', answer: 'We prioritize candidates who can join immediately or within 30 days.' },
            { question: 'Is remote work supported?', answer: 'Yes, this role offers 100% remote flexibility with core overlap hours.' },
          ]).map((item, idx) => (
            <details key={idx} className="group rounded-xl border border-border bg-card p-4 transition-all duration-150 open:bg-primary/5 open:border-primary/40">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-sm sm:text-base text-foreground list-none">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>{item.question}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-150 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground pl-7 leading-relaxed border-t border-border/40 pt-2.5">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      );

    case 'video':
      return (
        <RunnerVideoPlayer
          videoUrl={field.videoUrl}
          videoCaption={field.videoCaption}
          title={field.label}
        />
      );
    case 'file_upload':
      return <RunnerFileUpload field={field} value={value} onChange={onChange} />;
    case 'link':
      return (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-primary block">{field.linkText || 'Open Learning Resource'}</span>
            <span className="text-xs text-muted-foreground font-mono truncate max-w-sm block">{field.url || '#'}</span>
          </div>
          <a
            href={field.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition"
          >
            <span>Visit Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );

    case 'regex_text': {
      const pattern = field.validationRule?.pattern;
      let isValid = true;
      if (strValue && pattern) {
        try {
          const regex = new RegExp(pattern);
          isValid = regex.test(strValue);
        } catch {
          isValid = true;
        }
      }

      return (
        <div className="space-y-1">
          <Input
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'Enter value...'}
            className={`font-mono text-sm bg-background h-10 rounded-lg ${!isValid && strValue ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {!isValid && strValue && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{field.validationRule?.errorMessage || 'Invalid format pattern'}</span>
            </span>
          )}
        </div>
      );
    }

    case 'multiple_choice': {
      const options = field.options || [];
      const selectedOpts = Array.isArray(value) ? value : (typeof value === 'string' && value ? [value] : []);
      const otherPrefix = '__other__:';
      const hasOther = selectedOpts.some(opt => typeof opt === 'string' && opt.startsWith(otherPrefix));
      const otherValue = hasOther ? selectedOpts.find(opt => typeof opt === 'string' && opt.startsWith(otherPrefix))?.substring(otherPrefix.length) || '' : '';

      const handleChange = (opt: string, checked: boolean) => {
        if (checked) {
          onChange([...selectedOpts, opt]);
        } else {
          onChange(selectedOpts.filter(o => o !== opt));
        }
      };

      const handleOtherChange = (text: string) => {
        const filtered = selectedOpts.filter((o) => {
          if (typeof o !== 'string') {
            return true;
          }
          const isOther = o.startsWith(otherPrefix);
          return !isOther;
        });
        if (text) {
           onChange([...filtered, otherPrefix + text]);
        } else {
           onChange([...filtered, otherPrefix + ' ']);
        }
      };

      return (
        <div className="space-y-2">
          {options.map((opt, optIndex) => (
            <label
              key={opt}
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-sm sm:text-base font-medium cursor-pointer transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5 ${
                selectedOpts.includes(opt)
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-card text-foreground'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-sm font-bold shrink-0 transition-colors ${
                selectedOpts.includes(opt)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/60 border-border text-muted-foreground'
              }`}>
                {String.fromCharCode(65 + optIndex)}
              </span>
              <input
                type="checkbox"
                name={`field-${field.id}`}
                value={opt}
                checked={selectedOpts.includes(opt)}
                onChange={(e) => handleChange(opt, e.target.checked)}
                className="text-primary focus:ring-primary h-4 w-4 rounded"
              />
              <span className="flex-1">{opt}</span>
            </label>
          ))}
          {field.allowOtherOption && (
            <div className="space-y-2 pt-1">
              <label
                className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-sm sm:text-base font-medium cursor-pointer transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5 ${
                  hasOther
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                  hasOther
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/60 border-border text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + options.length)}
                </span>
                <input
                  type="checkbox"
                  name={`field-${field.id}-other`}
                  checked={hasOther}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleOtherChange(' ');
                    } else {
                      const filtered = selectedOpts.filter((o) => {
                        if (typeof o !== 'string') {
                          return true;
                        }
                        const isOther = o.startsWith(otherPrefix);
                        return !isOther;
                      });
                      onChange(filtered);
                    }
                  }}
                  className="text-primary focus:ring-primary h-4 w-4 rounded"
                />
                <span className="shrink-0">Other:</span>
                {hasOther && (
                  <Input
                    value={otherValue.trim()}
                    onChange={(e) => handleOtherChange(e.target.value)}
                    placeholder="Type custom answer or click a suggestion below..."
                    className="h-8 text-sm flex-1 max-w-md bg-background"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </label>

              {/* MCQ Others Suggestions Pills */}
              {(() => {
                const popularSuggestions = (field as FormField & { suggestedOtherOptions?: string[] }).suggestedOtherOptions?.length
                  ? (field as FormField & { suggestedOtherOptions?: string[] }).suggestedOtherOptions!
                  : ['Bachelor in E-commerce', 'Bachelor in Arts', 'Engineering', 'Self-Taught'];

                return (
                  <div className="flex flex-wrap items-center gap-1.5 pl-9 pt-0.5 animate-in fade-in duration-150">
                    <span className="text-xs text-muted-foreground font-medium">Suggestions:</span>
                    {popularSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOtherChange(sug);
                        }}
                        className="text-xs px-3 py-1 rounded-full border border-border/80 bg-background text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-all font-medium cursor-pointer shadow-2xs"
                        title={`Fill Other with "${sug}"`}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );
    }

    case 'boolean': {
      const getPresetOptions = (preset?: BooleanDisplayPreset): string[] => {
        switch (preset) {
          case 'yes_no':
            return ['Yes', 'No'];
          case 'enable_disable':
            return ['Enable', 'Disable'];
          case 'agree_disagree':
            return ['Agree', 'Disagree'];
          case 'true_false':
          default:
            return ['True', 'False'];
        }
      };

      const options = (field.options && field.options.length > 0)
        ? field.options
        : getPresetOptions(field.booleanDisplay);

      const alignClass = field.alignment === 'center'
        ? 'justify-center text-center'
        : field.alignment === 'right'
        ? 'justify-end text-right'
        : 'justify-start text-left';

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, optIndex) => {
            const isSelected = strValue.toLowerCase() === opt.toLowerCase();

            return (
              <label
                key={opt}
                className={`flex items-center gap-3 p-4 rounded-xl border text-sm sm:text-base font-medium font-sans cursor-pointer transition-all duration-150 hover:border-primary/50 hover:bg-primary/5 ${alignClass} ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-medium font-sans shadow-xs'
                    : 'border-border bg-card text-foreground font-sans'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-sm font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/60 border-border text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + optIndex)}
                </span>
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-semibold">{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'list_items':
      return (
        <RunnerListItemsInput
          value={value}
          onChange={onChange}
          suggestionsPool={field.suggestionsPool}
          placeholder={field.placeholder}
        />
      );

    case 'single_choice':
    case 'true_false': {
      const options = field.options || ['Yes', 'No'];
      const otherPrefix = '__other__:';
      const hasOther = strValue.startsWith(otherPrefix);
      const otherValue = hasOther ? strValue.substring(otherPrefix.length) : '';

      return (
        <div className="space-y-2">
          {options.map((opt, optIndex) => (
            <label
              key={opt}
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-sm sm:text-base font-medium cursor-pointer transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5 ${
                strValue === opt
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-card text-foreground'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-sm font-bold shrink-0 transition-colors ${
                strValue === opt
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/60 border-border text-muted-foreground'
              }`}>
                {String.fromCharCode(65 + optIndex)}
              </span>
              <input
                type="radio"
                name={`field-${field.id}`}
                value={opt}
                checked={strValue === opt}
                onChange={() => onChange(opt)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="flex-1">{opt}</span>
            </label>
          ))}
          {field.allowOtherOption && (
            <div className="space-y-2 pt-1">
              <label
                className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-sm sm:text-base font-medium cursor-pointer transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5 ${
                  hasOther
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                  hasOther
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/60 border-border text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + options.length)}
                </span>
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value="__other__"
                  checked={hasOther}
                  onChange={() => onChange(otherPrefix + ' ')}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="shrink-0">Other:</span>
                {hasOther && (
                  <Input
                    value={otherValue.trim()}
                    onChange={(e) => onChange(otherPrefix + e.target.value)}
                    placeholder="Type custom answer or click a suggestion below..."
                    className="h-8 text-sm flex-1 max-w-md bg-background"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </label>

              {/* Single Choice Others Suggestions Pills */}
              {(() => {
                const popularSuggestions = (field as FormField & { suggestedOtherOptions?: string[] }).suggestedOtherOptions?.length
                  ? (field as FormField & { suggestedOtherOptions?: string[] }).suggestedOtherOptions!
                  : ['Bachelor in E-commerce', 'Bachelor in Arts', 'Engineering', 'Self-Taught'];

                return (
                  <div className="flex flex-wrap items-center gap-1.5 pl-9 pt-0.5 animate-in fade-in duration-150">
                    <span className="text-xs text-muted-foreground font-medium">Suggestions:</span>
                    {popularSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange(otherPrefix + sug);
                        }}
                        className="text-xs px-3 py-1 rounded-full border border-border/80 bg-background text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-all font-medium cursor-pointer shadow-2xs"
                        title={`Fill Other with "${sug}"`}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );
    }

    case 'dropdown': {
      const options = field.options || [];
      return (
        <select
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-8 px-2 border border-input rounded-md text-xs bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
        >
          <option value="" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">-- Choose Option --</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
              {opt}
            </option>
          ))}
        </select>
      );
    }

    case 'paragraph':
      return (
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Type your detailed answer...'}
          rows={3}
          className="text-xs bg-background"
        />
      );

    case 'rating':
    case 'rating_feedback': {
      let currentRating = 0;
      let feedbackText = '';

      if (typeof value === 'number') {
        currentRating = value;
      } else if (typeof value === 'object' && value !== null) {
        const valObj = value as Record<string, unknown>;
        currentRating = Number(valObj.rating) || 0;
        feedbackText = String(valObj.feedback || '');
      } else if (typeof value === 'string') {
        currentRating = Number(value) || 0;
      }

      const maxScale = field.ratingMax || 5;
      const iconType = field.ratingIcon || 'star';
      const isFeedbackEnabled = Boolean(field.hasRatingFeedback || field.type === 'rating_feedback');

      const handleRate = (num: number) => {
        if (isFeedbackEnabled) {
          onChange({ rating: num, feedback: feedbackText });
        } else {
          onChange(num);
        }
      };

      const handleFeedbackChange = (text: string) => {
        onChange({ rating: currentRating, feedback: text });
      };

      return (
        <div className="space-y-3 font-sans">
          <div
            className={`flex items-center gap-2 flex-wrap ${
              (field.alignment || 'center') === 'center'
                ? 'justify-center'
                : field.alignment === 'right'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {Array.from({ length: maxScale }, (_, i) => i + 1).map((star) => {
              const isSelected = currentRating >= star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? iconType === 'heart'
                        ? 'border-rose-500 bg-rose-500/15 text-rose-600 shadow-xs'
                        : iconType === 'thumb'
                        ? 'border-sky-500 bg-sky-500/15 text-sky-600 shadow-xs'
                        : 'border-amber-500 bg-amber-500/15 text-amber-600 shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                  title={`Rate ${star} out of ${maxScale}`}
                >
                  {iconType === 'heart' ? (
                    <Heart className={`w-4 h-4 transition-colors ${isSelected ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground/60'}`} />
                  ) : iconType === 'thumb' ? (
                    <ThumbsUp className={`w-4 h-4 transition-colors ${isSelected ? 'text-sky-500 fill-sky-500' : 'text-muted-foreground/60'}`} />
                  ) : iconType === 'smiley' ? (
                    <Smile className={`w-4 h-4 transition-colors ${isSelected ? 'text-amber-500' : 'text-muted-foreground/60'}`} />
                  ) : iconType === 'emoji' ? (
                    <span className="text-base leading-none">{field.ratingCustomEmoji || '🎯'}</span>
                  ) : (
                    <Star className={`w-4 h-4 transition-colors ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/60'}`} />
                  )}
                  <span>{star}</span>
                </button>
              );
            })}
          </div>

          {currentRating > 0 && (
            <div className="text-center text-xs font-semibold text-muted-foreground">
              {currentRating} out of {maxScale}
            </div>
          )}

          {isFeedbackEnabled && (
            <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
              <Label className="text-xs font-semibold text-muted-foreground">
                Feedback Commentary (Optional):
              </Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                placeholder={field.ratingFeedbackPlaceholder || 'Share any comments or reasons for your rating...'}
                rows={2}
                className="text-sm bg-background rounded-xl"
              />
            </div>
          )}
        </div>
      );
    }

    case 'phone':
    case 'whatsapp':
      return (
        <PhoneWithCountrySelect
          value={strValue}
          onChange={(val) => onChange(val)}
          placeholder={field.placeholder}
        />
      );

    case 'short_answer':
    case 'email':
    default:
      return (
        <Input
          type={field.type === 'email' ? 'email' : 'text'}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter your response...'}
          className="text-sm bg-background h-10 rounded-xl"
        />
      );
  }
}

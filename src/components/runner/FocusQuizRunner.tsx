import React, { useState } from 'react';
import {
  ArrowLeft,
  Flag,
  Check,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Send,
  Sparkles,
  BookOpen,
  PlayCircle,
  CheckSquare,
  Shuffle,
  ShieldCheck,
  AlertCircle,
  FileText,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { THEME_PRESETS, getTheme, ThemeDefinition } from '@/themes/theme-definitions';
import { toast } from 'sonner';

export interface FocusQuestion {
  id: string;
  type: 'mcq' | 'multiselect' | 'paragraph' | 'url_submission' | 'mindmap' | 'file_upload';
  title: string;
  subtitle?: string;
  options?: Array<{ label: string; icon?: string; isFullWidth?: boolean } | string>;
  correctAnswer?: string | string[];
  hint?: string;
  mediaUrl?: string;
  verificationType?: 'google_docs' | 'workflowy' | 'xmind' | 'figma' | 'url' | 'any';
  layout?: '1-column' | '2-column';
  points?: number;
}

export interface ReadingPage {
  pageNumber: number;
  title: string;
  content: string;
}

export interface ReadingSection {
  title: string;
  videoUrl?: string;
  pages: ReadingPage[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  isMandatory?: boolean;
}

export interface ChecklistSection {
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
}

export interface FocusQuizConfig {
  id: string;
  title: string;
  themeId?: string;
  hasIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
  introImage?: string;
  readingSection?: ReadingSection;
  checklistSection?: ChecklistSection;
  isRandomized?: boolean;
  emailCadence?: 'per_section' | 'end_of_day' | 'end_of_week';
  questions: FocusQuestion[];
  passingScore?: number;
}

interface FocusQuizRunnerProps {
  config?: FocusQuizConfig;
  onComplete?: (result: {
    score: number;
    total: number;
    percentage: number;
    isPassed: boolean;
    telemetryCount: number;
  }) => void;
  onBackToAdmin?: () => void;
}

const DEFAULT_SAMPLE_CONFIG: FocusQuizConfig = {
  id: 'letterly-sample',
  title: 'Personalized Writing Assessment',
  themeId: 'letterly',
  hasIntro: true,
  introTitle: "You're in the **right place**!",
  introSubtitle: "To give the best solution to your problems, we need to ask a few questions about you.",
  introImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  passingScore: 70,
  emailCadence: 'per_section',
  readingSection: {
    title: 'Section 1: Architecture & Development Guidelines',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    pages: [
      {
        pageNumber: 1,
        title: 'Core Architecture & Split Database Design',
        content:
          'Welcome to the exam and onboarding curriculum. In this module, candidates study how WordPress exam micro-ORMs manage data safely. Each project maintains its own isolated SQLite database to guarantee total data privacy and zero cross-project pollution.',
      },
      {
        pageNumber: 2,
        title: 'Security, Client IP Tracking & Anti-Abuse',
        content:
          'To prevent fraudulent submissions while supporting anonymous surveys, client IP addresses are securely hashed and logged with an anonymity boolean flag. Before taking the quiz, candidates must complete the practical verification checklist.',
      },
      {
        pageNumber: 3,
        title: 'Category & Recursive Sub-Projects Hierarchy',
        content:
          'Curriculum modules are organized top-down into Categories, Projects, and Recursive Sub-Projects via parent_project_id foreign keys, allowing deeply nested departmental and course trees.',
      },
      {
        pageNumber: 4,
        title: 'Execution Pipeline Sequencing & Custom Paths',
        content:
          'Projects enforce strict or flexible sequential pipelines (e.g., Step A -> Step C -> Step D -> Step B). Candidates must complete prerequisites before downstream modules unlock.',
      },
      {
        pageNumber: 5,
        title: 'Practical Verification Checklist Gates',
        content:
          'Mandatory verification checklists act as hard quality gates. Candidates must actively confirm prerequisite reading and environment readiness before taking the exam.',
      },
      {
        pageNumber: 6,
        title: 'Focus-Mode Single-Item Quiz UX',
        content:
          'To maximize candidate cognitive focus and eliminate clutter, quizzes display exactly one question item at a time with prominent typography, visual cards, and high contrast.',
      },
      {
        pageNumber: 7,
        title: 'Anti-Cheat Grading & Concealed Solutions',
        content:
          'Upon failed submission, correct answers remain strictly concealed. Candidates receive diagnostic feedback indicating wrong answers and must retake until mastery is achieved.',
      },
      {
        pageNumber: 8,
        title: 'Diverse Question Submissions',
        content:
          'The assessment engine supports single MCQ, multi-select checkboxes, free text/paragraph responses, and direct PDF/Doc document file attachments.',
      },
      {
        pageNumber: 9,
        title: 'Mindmap, Workflowy, XMind & URL Verification',
        content:
          'Candidates can submit architectural diagrams and mindmaps from Workflowy, XMind, Figma, and Google Docs with live URL format and domain verification.',
      },
      {
        pageNumber: 10,
        title: 'Candidate Question Reporting, Triage & Rotating Backups',
        content:
          'Every question includes an in-quiz report modal to flag typos or disputes directly to instructor dashboards, while system databases undergo automated rotating backups.',
      },
    ],
  },
  checklistSection: {
    title: 'Practical Verification Checklist',
    subtitle: 'Confirm that you have completed the prerequisite tasks before proceeding to the quiz:',
    items: [
      { id: 'c1', label: 'Have you read the documentation sections and architecture guide?', isMandatory: true },
      { id: 'c2', label: 'Have you watched the technical walkthrough video?', isMandatory: true },
      { id: 'c3', label: 'Have you verified the SQLite database migrations locally?', isMandatory: true },
      { id: 'c4', label: 'Have you prepared your mindmap or Workflowy submission link?', isMandatory: false },
    ],
  },
  questions: [
    {
      id: 'q1',
      type: 'multiselect',
      title: '**What** do you write?',
      subtitle: 'Select all that apply',
      layout: '1-column',
      options: [
        { label: 'Messages & Emails', icon: '💬' },
        { label: 'Personal notes', icon: '📝' },
        { label: 'Meeting notes', icon: '💼' },
        { label: 'Social media posts', icon: '📱' },
        { label: 'Journaling', icon: '📖' },
        { label: 'Documents', icon: '📊' },
        { label: 'Lecture notes', icon: '🎓' },
      ],
      correctAnswer: ['Messages & Emails', 'Documents'],
      hint: 'Think about your daily workflow and communication patterns.',
      points: 10,
    },
    {
      id: 'q2',
      type: 'multiselect',
      title: 'Which of these are **problems** for you?',
      subtitle: 'Select all that apply',
      layout: '1-column',
      options: [
        { label: 'Writing takes too long', icon: '⏱️' },
        { label: "Writer's block", icon: '🛑' },
        { label: 'Procrastination', icon: '⏳' },
        { label: 'Typing on the go', icon: '📲' },
        { label: 'Capturing racing thoughts', icon: '⚡' },
        { label: 'Writing nicely', icon: '🌟' },
      ],
      correctAnswer: ['Writing takes too long', "Writer's block"],
      hint: 'Identify friction points that slow down your output.',
      points: 10,
    },
    {
      id: 'q3',
      type: 'mcq',
      title: 'What is **the main problem** with typing?',
      subtitle: 'Select one',
      layout: '1-column',
      options: [
        { label: 'Slow and time-consuming', icon: '⏱️' },
        { label: 'Difficult and uncomfortable', icon: '😫' },
        { label: 'Errors and need for corrections', icon: '🛠️' },
      ],
      correctAnswer: 'Slow and time-consuming',
      hint: 'Consider the primary bottleneck in mobile text entry.',
      points: 10,
    },
    {
      id: 'q4',
      type: 'multiselect',
      title: 'Which **social media platforms** are you on?',
      subtitle: 'Select all that apply',
      layout: '2-column',
      options: [
        { label: 'Instagram', icon: '📸' },
        { label: 'X / Twitter', icon: '𝕏' },
        { label: 'LinkedIn', icon: '💼' },
        { label: 'Facebook', icon: '📘' },
        { label: 'YouTube', icon: '▶️' },
        { label: 'TikTok', icon: '🎵' },
        { label: 'Medium', icon: '⚫' },
        { label: 'Other', icon: '🌐' },
        { label: "I don't use any", icon: '🚫', isFullWidth: true },
      ],
      correctAnswer: ['LinkedIn', 'X / Twitter'],
      hint: 'Select the platforms where you actively post or consume industry content.',
      points: 10,
    },
    {
      id: 'q5',
      type: 'url_submission',
      title: 'Submit your **workflow map** or notes link',
      subtitle: 'Paste Google Docs, Notion, or Workflowy URL for review',
      verificationType: 'google_docs',
      hint: 'Must start with https:// and contain docs.google.com or drive.google.com.',
      points: 15,
    },
  ],
};

type RunnerStage = 'intro' | 'reading' | 'checklist' | 'quiz' | 'completed';

export const FocusQuizRunner: React.FC<FocusQuizRunnerProps> = ({
  config = DEFAULT_SAMPLE_CONFIG,
  onComplete,
  onBackToAdmin,
}) => {
  const initialStage: RunnerStage = config.hasIntro ? 'intro' : 'reading';

  const [currentStage, setCurrentStage] = useState<RunnerStage>(initialStage);
  const [activeThemeId, setActiveThemeId] = useState<string>(config.themeId || 'letterly');
  const [currentReadingPageIndex, setCurrentReadingPageIndex] = useState<number>(0);
  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isRandomized, setIsRandomized] = useState<boolean>(Boolean(config.isRandomized));
  const [activeQuestions, setActiveQuestions] = useState<FocusQuestion[]>(config.questions);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportText, setReportText] = useState<string>('');
  const [reportType, setReportType] = useState<'feedback' | 'bug' | 'typo' | 'dispute'>('feedback');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [clickCount, setClickCount] = useState<number>(0);
  const [calculatedScore, setCalculatedScore] = useState<{
    score: number;
    total: number;
    percentage: number;
    isPassed: boolean;
    wrongQuestions: string[];
  } | null>(null);

  const theme: ThemeDefinition = getTheme(activeThemeId);
  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length;

  const readingPages = config.readingSection?.pages || [];
  const totalReadingPages = readingPages.length;

  const checklistItems = config.checklistSection?.items || [];
  const mandatoryChecklistCount = checklistItems.filter((i) => i.isMandatory).length;
  const completedMandatoryCount = checklistItems.filter(
    (i) => i.isMandatory && completedChecklistIds.includes(i.id)
  ).length;
  const isChecklistSatisfied = completedMandatoryCount === mandatoryChecklistCount;

  const recordClickTelemetry = (action: string) => {
    setClickCount((prev) => prev + 1);
  };

  const handleToggleRandomization = () => {
    recordClickTelemetry('toggle_randomization');
    if (isRandomized) {
      setIsRandomized(false);
      setActiveQuestions(config.questions);
      toast.info('Questions restored to standard sequential order.');
    } else {
      setIsRandomized(true);
      const shuffled = [...config.questions].sort(() => Math.random() - 0.5);
      setActiveQuestions(shuffled);
      setCurrentQuestionIndex(0);
      toast.success('Questions randomized.');
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    recordClickTelemetry(`checklist_item_${id}`);
    if (completedChecklistIds.includes(id)) {
      setCompletedChecklistIds(completedChecklistIds.filter((item) => item !== id));
    } else {
      setCompletedChecklistIds([...completedChecklistIds, id]);
    }
  };

  const validateUrlSubmission = (url: string, vType?: string): { isValid: boolean; message: string } => {
    if (!url || !url.trim()) {
      return { isValid: false, message: 'Please paste a URL' };
    }

    const trimmed = url.trim();
    const hasProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://');

    if (!hasProtocol) {
      return { isValid: false, message: 'URL must start with https:// or http://' };
    }

    if (vType === 'google_docs') {
      const isGDoc = trimmed.includes('docs.google.com') || trimmed.includes('drive.google.com');

      if (!isGDoc) {
        return { isValid: false, message: 'Requires Google Docs link (docs.google.com)' };
      }

      return { isValid: true, message: '✓ Valid Google Docs verified' };
    }

    if (vType === 'workflowy') {
      const isWorkflowy = trimmed.includes('workflowy.com');

      if (!isWorkflowy) {
        return { isValid: false, message: 'Requires Workflowy outline link (workflowy.com)' };
      }

      return { isValid: true, message: '✓ Valid Workflowy verified' };
    }

    if (vType === 'xmind') {
      const isXmind = trimmed.includes('xmind.app') || trimmed.includes('xmind.net');

      if (!isXmind) {
        return { isValid: false, message: 'Requires XMind map link (xmind.app)' };
      }

      return { isValid: true, message: '✓ Valid XMind map verified' };
    }

    if (vType === 'figma') {
      const isFigma = trimmed.includes('figma.com');

      if (!isFigma) {
        return { isValid: false, message: 'Requires Figma board link (figma.com)' };
      }

      return { isValid: true, message: '✓ Valid Figma link verified' };
    }

    return { isValid: true, message: '✓ Valid URL verified' };
  };

  const handleSelectOption = (questionId: string, optionLabel: string, isMulti: boolean) => {
    recordClickTelemetry(`select_option_${questionId}`);

    if (isMulti) {
      const currentSelected: string[] = Array.isArray(answers[questionId])
        ? [...answers[questionId]]
        : [];

      if (optionLabel === "I don't use any") {
        setAnswers({ ...answers, [questionId]: ["I don't use any"] });
        return;
      }

      const filtered = currentSelected.filter((item) => item !== "I don't use any");
      const hasItem = filtered.includes(optionLabel);

      if (hasItem) {
        setAnswers({ ...answers, [questionId]: filtered.filter((item) => item !== optionLabel) });
      } else {
        setAnswers({ ...answers, [questionId]: [...filtered, optionLabel] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: optionLabel });
    }
  };

  const handleTextAnswerChange = (questionId: string, val: string) => {
    setAnswers({ ...answers, [questionId]: val });
  };

  const handleContinue = () => {
    recordClickTelemetry('continue_button');

    if (currentStage === 'intro') {
      if (config.readingSection && totalReadingPages > 0) {
        setCurrentStage('reading');
      } else if (config.checklistSection) {
        setCurrentStage('checklist');
      } else {
        setCurrentStage('quiz');
      }

      return;
    }

    if (currentStage === 'reading') {
      if (currentReadingPageIndex < totalReadingPages - 1) {
        setCurrentReadingPageIndex(currentReadingPageIndex + 1);
      } else if (config.checklistSection) {
        setCurrentStage('checklist');
      } else {
        setCurrentStage('quiz');
      }

      return;
    }

    if (currentStage === 'checklist') {
      if (!isChecklistSatisfied) {
        toast.error('Please complete all mandatory verification checklist items to continue.');
        return;
      }

      setCurrentStage('quiz');
      return;
    }

    if (currentStage === 'quiz') {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowHint(false);
      } else {
        finishQuiz();
      }
    }
  };

  const handlePrevious = () => {
    recordClickTelemetry('previous_button');

    if (currentStage === 'quiz') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setShowHint(false);
      } else if (config.checklistSection) {
        setCurrentStage('checklist');
      } else if (config.readingSection) {
        setCurrentStage('reading');
      } else if (config.hasIntro) {
        setCurrentStage('intro');
      } else if (onBackToAdmin) {
        onBackToAdmin();
      }

      return;
    }

    if (currentStage === 'checklist') {
      if (config.readingSection) {
        setCurrentStage('reading');
      } else if (config.hasIntro) {
        setCurrentStage('intro');
      } else if (onBackToAdmin) {
        onBackToAdmin();
      }

      return;
    }

    if (currentStage === 'reading') {
      if (currentReadingPageIndex > 0) {
        setCurrentReadingPageIndex(currentReadingPageIndex - 1);
      } else if (config.hasIntro) {
        setCurrentStage('intro');
      } else if (onBackToAdmin) {
        onBackToAdmin();
      }

      return;
    }

    if (currentStage === 'intro' && onBackToAdmin) {
      onBackToAdmin();
    }
  };

  const finishQuiz = () => {
    let earned = 0;
    let total = 0;
    const wrong: string[] = [];

    activeQuestions.forEach((q, idx) => {
      const qPoints = q.points || 10;
      total += qPoints;
      const userAns = answers[q.id];

      if (q.type === 'mcq') {
        const isMatch =
          String(userAns || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();

        if (isMatch) {
          earned += qPoints;
        } else {
          wrong.push(`Question ${idx + 1}: ${q.title.replace(/\*\*/g, '')}`);
        }
      } else if (q.type === 'multiselect') {
        const expectedArr: string[] = Array.isArray(q.correctAnswer)
          ? q.correctAnswer
          : [String(q.correctAnswer || '')];
        const userArr: string[] = Array.isArray(userAns) ? userAns : [];
        const isExactMatch =
          expectedArr.length === userArr.length &&
          expectedArr.every((item) => userArr.includes(item));

        if (isExactMatch) {
          earned += qPoints;
        } else {
          wrong.push(`Question ${idx + 1}: ${q.title.replace(/\*\*/g, '')}`);
        }
      } else if (q.type === 'url_submission' || q.type === 'mindmap') {
        const validation = validateUrlSubmission(String(userAns || ''), q.verificationType);

        if (validation.isValid) {
          earned += qPoints;
        } else {
          wrong.push(`Question ${idx + 1}: ${q.title.replace(/\*\*/g, '')}`);
        }
      } else {
        const hasText = Boolean(userAns && String(userAns).trim().length > 3);

        if (hasText) {
          earned += qPoints;
        } else {
          wrong.push(`Question ${idx + 1}: ${q.title.replace(/\*\*/g, '')}`);
        }
      }
    });

    const percentage = total > 0 ? Math.round((earned / total) * 100) : 100;
    const isPassed = percentage >= (config.passingScore || 70);

    const result = {
      score: earned,
      total,
      percentage,
      isPassed,
      wrongQuestions: wrong,
    };

    setCalculatedScore(result);
    setCurrentStage('completed');

    if (onComplete) {
      onComplete({
        score: earned,
        total,
        percentage,
        isPassed,
        telemetryCount: clickCount,
      });
    }
  };

  const submitReport = () => {
    const cleanFeedback = reportText.trim();
    const hasFeedback = Boolean(cleanFeedback);

    if (hasFeedback) {
      const newReport = {
        id: 'rep_' + Date.now(),
        project_id: config.id,
        question_id: currentQuestion?.id || 'general',
        question_title: currentQuestion?.title || 'General Assessment',
        report_type: reportType,
        feedback_text: cleanFeedback,
        user_identifier: reporterEmail.trim() || 'anonymous_candidate',
        status: 'open',
        created_at: new Date().toLocaleString(),
      };

      try {
        const storedReports = JSON.parse(localStorage.getItem('wp_exam_question_reports') || '[]');
        localStorage.setItem('wp_exam_question_reports', JSON.stringify([newReport, ...storedReports]));
      } catch {
        // LocalStorage fallback
      }

      // Dispatch to REST backend endpoint
      fetch('/wp-json/wp-exam/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      }).catch(() => {});

      toast.success('Question report and feedback logged! Instructors notified via email dispatch.');
      setReportText('');
      setReporterEmail('');
      setShowReportModal(false);
    } else {
      toast.error('Please describe the issue or feedback.');
    }
  };

  const renderFormattedTitle = (title: string) => {
    const parts = title.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2);

        return (
          <span
            key={index}
            style={{ color: theme.colors.highlightWord }}
            className="font-extrabold tracking-tight"
          >
            {clean}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      {/* Top Navigation & Stage Progress */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md bg-opacity-90 border-b"
        style={{ borderColor: theme.colors.cardBorder }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full hover:opacity-80 transition"
            style={{ color: theme.colors.textSecondary }}
            title="Go back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-bold tracking-tight text-sm">
            <span className="text-lg">🎯</span>
            <span>{config.title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Randomization Toggle */}
            <button
              onClick={handleToggleRandomization}
              className="p-1.5 rounded-full hover:opacity-80 transition"
              style={{
                color: isRandomized ? theme.colors.highlightWord : theme.colors.textSecondary,
              }}
              title="Toggle Question Randomization"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Theme Selector */}
            <select
              value={activeThemeId}
              onChange={(e) => setActiveThemeId(e.target.value)}
              className="text-xs px-2 py-1 rounded bg-transparent border cursor-pointer"
              style={{ borderColor: theme.colors.cardBorder, color: theme.colors.textSecondary }}
            >
              {Object.values(THEME_PRESETS).map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name.split(' ')[0]}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-1.5 rounded-full hover:opacity-80 transition"
              style={{ color: theme.colors.textSecondary }}
              title="Report issue with question"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar for Quiz or Reading */}
        {currentStage === 'quiz' && (
          <div className="w-full bg-slate-800 h-1 relative overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%`,
                backgroundColor: theme.colors.progressBar,
              }}
            />
          </div>
        )}

        {currentStage === 'reading' && (
          <div className="w-full bg-slate-800 h-1 relative overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.round(((currentReadingPageIndex + 1) / totalReadingPages) * 100)}%`,
                backgroundColor: theme.colors.progressBar,
              }}
            />
          </div>
        )}
      </header>

      {/* Main Runner Stage Display */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {/* Stage 0: Intro Hero */}
        {currentStage === 'intro' && (
          <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
            {config.introImage && (
              <div
                className="w-full h-56 rounded-3xl overflow-hidden shadow-2xl border"
                style={{ borderColor: theme.colors.cardBorder }}
              >
                <img
                  src={config.introImage}
                  alt="Assessment Intro"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-3xl font-extrabold leading-tight">
              {renderFormattedTitle(config.introTitle || "You're in the **right place**!")}
            </h1>

            <p className="text-base" style={{ color: theme.colors.textSecondary }}>
              {config.introSubtitle}
            </p>
          </div>
        )}

        {/* Stage 1: Reading Documentation & Embedded Video */}
        {currentStage === 'reading' && config.readingSection && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.colors.cardBorder }}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                <BookOpen className="w-4 h-4" />
                Step 1: Reading & Lectures
              </span>
              <Badge variant="outline" className="text-xs">
                Page {currentReadingPageIndex + 1} of {totalReadingPages}
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black leading-tight">
                {readingPages[currentReadingPageIndex]?.title}
              </h2>
            </div>

            {config.readingSection.videoUrl && currentReadingPageIndex === 0 && (
              <div
                className="w-full h-48 rounded-2xl overflow-hidden border shadow relative bg-black/40 flex items-center justify-center"
                style={{ borderColor: theme.colors.cardBorder }}
              >
                <iframe
                  src={config.readingSection.videoUrl}
                  title="Lecture Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}

            <div
              className="p-5 rounded-2xl border text-sm leading-relaxed space-y-3"
              style={{
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.cardBorder,
                color: theme.colors.textPrimary,
              }}
            >
              <p>{readingPages[currentReadingPageIndex]?.content}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Telemetry: {clickCount} user interaction clicks tracked</span>
              <span>Review materials thoroughly</span>
            </div>
          </div>
        )}

        {/* Stage 2: Practical Verification Checklist */}
        {currentStage === 'checklist' && config.checklistSection && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b pb-3" style={{ borderColor: theme.colors.cardBorder }}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <CheckSquare className="w-4 h-4" />
                Step 2: Practical Verification
              </span>
              <h2 className="text-2xl font-black leading-tight mt-2">
                {config.checklistSection.title}
              </h2>
              {config.checklistSection.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {config.checklistSection.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {checklistItems.map((item) => {
                const isChecked = completedChecklistIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3"
                    style={{
                      backgroundColor: isChecked ? theme.colors.cardActiveBg : theme.colors.cardBg,
                      borderColor: isChecked ? theme.colors.cardActiveBorder : theme.colors.cardBorder,
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors ${
                        isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-slate-500'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-sm leading-snug block">{item.label}</span>
                      {item.isMandatory && (
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1 block">
                          * Mandatory Requirement
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl border bg-card/60 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Mandatory Verification:</span>
              <span className={`font-bold ${isChecklistSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>
                {completedMandatoryCount} of {mandatoryChecklistCount} verified
              </span>
            </div>
          </div>
        )}

        {/* Stage 3: Focus Quiz Question View */}
        {currentStage === 'quiz' && currentQuestion && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </Badge>
                {isRandomized && (
                  <Badge variant="secondary" className="text-[10px]">
                    🔀 Shuffled
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl font-black leading-tight">
                {renderFormattedTitle(currentQuestion.title)}
              </h2>

              {currentQuestion.subtitle && (
                <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Media Embed if available */}
            {currentQuestion.mediaUrl && (
              <div
                className="w-full h-44 rounded-2xl overflow-hidden border shadow"
                style={{ borderColor: theme.colors.cardBorder }}
              >
                <img
                  src={currentQuestion.mediaUrl}
                  alt="Question Media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Options List / Grid for MCQ & Multi-select */}
            {(currentQuestion.type === 'mcq' || currentQuestion.type === 'multiselect') &&
              currentQuestion.options && (
                <div
                  className={
                    currentQuestion.layout === '2-column'
                      ? 'grid grid-cols-2 gap-3'
                      : 'flex flex-col space-y-3'
                  }
                >
                  {currentQuestion.options.map((opt, optIdx) => {
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    const optIcon = typeof opt === 'object' ? opt.icon : undefined;
                    const isFullWidth = typeof opt === 'object' ? opt.isFullWidth : false;

                    const userSelected = answers[currentQuestion.id];
                    const isSelected =
                      currentQuestion.type === 'multiselect'
                        ? Array.isArray(userSelected) && userSelected.includes(optLabel)
                        : userSelected === optLabel;

                    return (
                      <button
                        key={optIdx}
                        onClick={() =>
                          handleSelectOption(
                            currentQuestion.id,
                            optLabel,
                            currentQuestion.type === 'multiselect'
                          )
                        }
                        className={`text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between ${
                          isFullWidth ? 'col-span-2' : ''
                        }`}
                        style={{
                          backgroundColor: isSelected ? theme.colors.cardActiveBg : theme.colors.cardBg,
                          borderColor: isSelected ? theme.colors.cardActiveBorder : theme.colors.cardBorder,
                          boxShadow: isSelected
                            ? `0 0 16px ${theme.colors.cardActiveBorder}44`
                            : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {optIcon && <span className="text-xl">{optIcon}</span>}
                          <span className="font-semibold text-sm leading-snug">{optLabel}</span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-transparent' : 'border-slate-600'
                          }`}
                          style={{
                            backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            {/* URL Submission / Mindmap Link with Live Verification */}
            {(currentQuestion.type === 'url_submission' || currentQuestion.type === 'mindmap') && (
              <div className="space-y-3">
                <div
                  className="p-4 rounded-2xl border space-y-3"
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.cardBorder,
                  }}
                >
                  <label className="text-xs font-semibold block text-slate-300">
                    Live Validated Link ({currentQuestion.verificationType || 'URL'}):
                  </label>
                  <Input
                    placeholder="https://docs.google.com/document/d/..."
                    value={String(answers[currentQuestion.id] || '')}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    className="p-3 text-sm rounded-xl"
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.cardBorder,
                    }}
                  />

                  {/* Live Verification Indicator */}
                  {answers[currentQuestion.id] && (
                    <div className="text-xs pt-1">
                      {(() => {
                        const validation = validateUrlSubmission(
                          String(answers[currentQuestion.id]),
                          currentQuestion.verificationType
                        );

                        if (validation.isValid) {
                          return (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {validation.message}
                            </span>
                          );
                        }

                        return (
                          <span className="text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {validation.message}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Upload (PDF, Doc) */}
            {currentQuestion.type === 'file_upload' && (
              <div
                className="p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center space-y-3"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold block">Upload PDF or Document</span>
                  <span className="text-xs text-muted-foreground block">
                    Supported formats: .pdf, .docx, .doc (Max 25MB)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleTextAnswerChange(currentQuestion.id, 'uploaded_spec_document.pdf');
                    toast.success('Document attached successfully.');
                  }}
                  className="text-xs"
                >
                  Browse Files
                </Button>
                {answers[currentQuestion.id] && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1 text-emerald-400">
                    <FileText className="w-3 h-3" />
                    {String(answers[currentQuestion.id])}
                  </Badge>
                )}
              </div>
            )}

            {/* Paragraph / Text Area */}
            {currentQuestion.type === 'paragraph' && (
              <div
                className="p-4 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <Textarea
                  placeholder="Type your comprehensive response..."
                  rows={5}
                  value={String(answers[currentQuestion.id] || '')}
                  onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                  className="p-3 text-sm rounded-xl resize-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.cardBorder,
                  }}
                />
              </div>
            )}

            {/* Hint Display */}
            {currentQuestion.hint && (
              <div className="text-center">
                {showHint ? (
                  <div
                    className="p-3 rounded-xl border text-xs max-w-sm mx-auto"
                    style={{
                      backgroundColor: theme.colors.cardBg,
                      borderColor: theme.colors.cardBorder,
                    }}
                  >
                    💡 <span className="font-semibold">Hint:</span> {currentQuestion.hint}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      recordClickTelemetry('show_hint');
                      setShowHint(true);
                    }}
                    className="text-xs font-semibold inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition"
                    style={{ color: theme.colors.highlightWord }}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Show Question Hint
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stage 4: Completion Screen with Anti-Cheat Grading & Email Dispatch */}
        {currentStage === 'completed' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl shadow-xl bg-indigo-500/20 text-indigo-400">
              {calculatedScore?.isPassed ? '🏆' : '📚'}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">
                {calculatedScore?.isPassed ? 'Assessment Completed!' : 'Review & Try Again'}
              </h2>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {calculatedScore?.isPassed
                  ? 'Great job! You have demonstrated understanding of this section.'
                  : 'You have not met the passing score threshold. Please review the highlighted mistakes and retry.'}
              </p>
            </div>

            {/* Score Pill */}
            <div
              className="p-4 rounded-3xl border flex flex-col items-center gap-1 shadow-inner"
              style={{
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.cardBorder,
              }}
            >
              <span className="text-4xl font-black" style={{ color: theme.colors.highlightWord }}>
                {calculatedScore?.percentage}%
              </span>
              <span
                className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: calculatedScore?.isPassed ? '#10B98133' : '#EF444433',
                  color: calculatedScore?.isPassed ? '#10B981' : '#EF4444',
                }}
              >
                {calculatedScore?.isPassed ? 'Passed' : 'Failed'} (Required:{' '}
                {config.passingScore || 70}%)
              </span>
              <span className="text-xs text-slate-400">
                Score: {calculatedScore?.score} / {calculatedScore?.total} points
              </span>
            </div>

            {/* Anti-Cheat Review: Show which questions were wrong WITHOUT giving away correct answers */}
            {calculatedScore && calculatedScore.wrongQuestions.length > 0 && (
              <div
                className="p-4 rounded-2xl border text-left space-y-2 text-xs"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>⚠️</span> You have done the wrong answer on:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {calculatedScore.wrongQuestions.map((qTitle, idx) => (
                    <li key={idx}>
                      <span className="font-semibold text-rose-300">Incorrect:</span> {qTitle}
                    </li>
                  ))}
                </ul>
                <p className="text-slate-400 text-[11px] pt-1">
                  Answers are locked to ensure comprehensive mastery. Review the documentation and retake.
                </p>
              </div>
            )}

            {/* Email Notification Dispatch Status */}
            <div
              className="p-3 rounded-xl border text-xs text-left flex items-start gap-2.5"
              style={{
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.cardBorder,
              }}
            >
              <span className="text-lg">📧</span>
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Notification Chain Dispatched:</span>
                <span className="text-[11px] text-muted-foreground block">
                  Results emailed to candidate and course owner (Delivery Cadence:{' '}
                  {config.emailCadence || 'per_section'}).
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Client telemetry: {clickCount} user interactions recorded.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => {
                  setCurrentStage('quiz');
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setCalculatedScore(null);
                }}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.primaryText,
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Retake Assessment
              </Button>

              {onBackToAdmin && (
                <Button
                  onClick={onBackToAdmin}
                  variant="outline"
                  className="w-full py-3 rounded-xl text-sm"
                  style={{ borderColor: theme.colors.cardBorder }}
                >
                  Return to Admin Dashboard
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Progression Button */}
      {currentStage !== 'completed' && (
        <footer
          className="sticky bottom-0 z-20 backdrop-blur-md bg-opacity-95 p-4 border-t"
          style={{ borderColor: theme.colors.cardBorder }}
        >
          <div className="max-w-md mx-auto space-y-2">
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl font-bold text-base shadow-xl transition active:scale-[0.98] hover:opacity-95"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.primaryText,
              }}
            >
              {currentStage === 'intro'
                ? "Let's do it"
                : currentStage === 'reading'
                ? currentReadingPageIndex < totalReadingPages - 1
                  ? 'Next Page'
                  : 'Proceed to Checklist'
                : currentStage === 'checklist'
                ? 'Proceed to Quiz'
                : currentQuestionIndex === totalQuestions - 1
                ? 'Complete Assessment'
                : 'Continue'}
            </button>

            {currentStage === 'reading' && currentReadingPageIndex < totalReadingPages - 1 && (
              <button
                onClick={() => {
                  recordClickTelemetry('skip_to_checklist');
                  setCurrentStage('checklist');
                }}
                className="w-full py-1 text-xs font-medium text-center transition hover:underline opacity-80"
                style={{ color: theme.colors.textSecondary }}
              >
                Proceed to Checklist →
              </button>
            )}
          </div>
        </footer>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.cardBorder,
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-400" />
                Report Question or Issue
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Notice a typo, misleading answer, or technical bug? Submit feedback directly to curriculum instructors.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 block">Report Category:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setReportType('feedback')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${
                    reportType === 'feedback' ? 'bg-primary/20 border-primary font-bold text-white' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <span>💬 Question Feedback</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('bug')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${
                    reportType === 'bug' ? 'bg-rose-500/20 border-rose-500 font-bold text-rose-300' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <span>🐛 Technical Bug</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('typo')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${
                    reportType === 'typo' ? 'bg-amber-500/20 border-amber-500 font-bold text-amber-300' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <span>📝 Typo / Grammar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('dispute')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${
                    reportType === 'dispute' ? 'bg-indigo-500/20 border-indigo-500 font-bold text-indigo-300' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <span>⚖️ Dispute Answer</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">Your Email (Optional):</label>
              <Input
                placeholder="candidate@example.com"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                className="p-2.5 text-xs rounded-xl"
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.cardBorder,
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">Description / Feedback:</label>
              <Textarea
                placeholder="Describe the problem, discrepancy, or bug in detail..."
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="p-3 text-xs rounded-xl"
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.cardBorder,
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitReport} className="flex items-center gap-1 text-xs">
                <Send className="w-3.5 h-3.5" />
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

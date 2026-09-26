import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  FormModel,
  FormField,
  FormSubmissionResult,
  evaluateFileUploadValidation,
  parseVideoEmbedUrl,
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
} from 'lucide-react';
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

export const FormRunner: React.FC<FormRunnerProps> = ({
  form: initialForm,
  onClose,
  isPreviewRoute,
}) => {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
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
      if (urlTheme && (THEME_PRESETS[urlTheme] || urlTheme === 'clean-wide')) {
        return urlTheme;
      }
    }
    return 'clean-wide';
  });
  const currentTheme = getTheme(activeThemeId);
  const themeVars = getThemeCssVariables(currentTheme);

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
      if (f.type === 'multiple_choice' || f.type === 'dropdown' || f.type === 'true_false') {
        newAnswers[f.id] = f.correctAnswer || (f.options && f.options.length > 0 ? f.options[0] : 'Answer');
      } else if (f.type === 'short_answer' || f.type === 'paragraph') {
        newAnswers[f.id] = 'Sample answer text for testing purposes.';
      } else if (f.type === 'email') {
        newAnswers[f.id] = 'test@example.com';
      } else if (f.type === 'phone' || f.type === 'whatsapp') {
        newAnswers[f.id] = '+1234567890';
      } else if (f.type === 'regex_text') {
        newAnswers[f.id] = 'STU-2026-9901'; // Default matching the sample regex if any
      } else if (f.type === 'rating') {
        newAnswers[f.id] = 5;
      } else {
        newAnswers[f.id] = 'Auto-filled data';
      }
    });
    setAnswers(newAnswers);
    toast.success('Form fields auto-filled!');
  };

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
        const pts = f.points || 1;
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
        } else {
          const userStr = normalizeAnswer(userRaw);
          const expectedStr = normalizeAnswer(singleCorrect);
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
        } else {
          const userStr = normalizeAnswer(userRaw);
          const expectedStr = normalizeAnswer(singleCorrect);
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

            {onClose && (
              <Button onClick={onClose} size="sm" variant="default" className="text-xs">
                Close Runner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`space-y-4 font-sans ${activeThemeId === 'clean-wide' ? 'max-w-5xl' : 'max-w-4xl'} mx-auto p-4 sm:p-6 rounded-2xl transition-all duration-300 theme-${activeThemeId}`}
      style={{
        ...themeVars,
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.textPrimary,
      }}
    >
      {/* Project Selector & Deep-Link Bar */}
      <div 
        className="p-3 border rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
        style={{
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.cardBorder,
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap" style={{ color: currentTheme.colors.textSecondary }}>
              <Layers className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
              <span>Project:</span>
            </Label>
            <Select
              value={selectedProjectId}
              onValueChange={handleProjectSwitch}
            >
              <SelectTrigger 
                className="text-xs font-medium h-8 min-w-[210px] rounded-md border"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.cardBorder,
                  color: currentTheme.colors.textPrimary,
                }}
              >
                <SelectValue placeholder="Select Assessment Project" />
              </SelectTrigger>
              <SelectContent 
                className="border shadow-xl backdrop-blur-md rounded-xl"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  borderColor: currentTheme.colors.cardBorder,
                  color: currentTheme.colors.textPrimary,
                }}
              >
                <SelectItem value="intern-programmer" className="text-xs">
                  Intern Programmer Assessment
                </SelectItem>
                <SelectItem value="full-stack-architect" className="text-xs">
                  Full-Stack Web Architecture
                </SelectItem>
                <SelectItem value="cybersecurity-essentials" className="text-xs">
                  Cybersecurity Fundamentals
                </SelectItem>
                {(initialForm || quizStore.fields.length > 0) && (
                  <SelectItem value="custom-active" className="text-xs">
                    Custom Form ({activeForm.title || 'Builder Active'})
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Active Canonical Slug Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono shadow-2xs"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.cardBorder,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span style={{ color: currentTheme.colors.textSecondary }}>{isPreviewRoute ? '/preview/' : '/f/'}</span>
            <span className="font-bold" style={{ color: currentTheme.colors.primary }}>
              {selectedProjectId === 'custom-active' ? (quizStore.slug || 'custom-form') : selectedProjectId}
            </span>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap" style={{ color: currentTheme.colors.textSecondary }}>
              <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
              <span>Theme:</span>
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
                className="text-xs font-medium h-8 w-[160px] rounded-md border"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.cardBorder,
                  color: currentTheme.colors.textPrimary,
                }}
              >
                <SelectValue placeholder="Select Theme" />
              </SelectTrigger>
              <SelectContent 
                className="border shadow-xl backdrop-blur-md rounded-xl"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  borderColor: currentTheme.colors.cardBorder,
                  color: currentTheme.colors.textPrimary,
                }}
              >
                {Object.values(THEME_PRESETS).map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.name.split(' (')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyProjectLink}
            className="text-xs h-8 gap-1 border"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.cardBorder,
              color: currentTheme.colors.textPrimary,
            }}
          >
            <Share2 className="w-3 h-3" />
            <span>Share Direct URL</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            className="text-xs h-8 gap-1 border"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.cardBorder,
              color: currentTheme.colors.textPrimary,
            }}
          >
            <Zap className="w-3 h-3" />
            <span>Auto Fill</span>
          </Button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Candidate Role & Access Bar */}
      <div 
        className="p-3 border rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors"
        style={{
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.cardBorder,
        }}
      >
        <div className="flex items-center gap-2">
          {session.isAuthenticated ? (
            <>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                ✓ Verified Respondent
              </Badge>
              <span className="text-xs font-semibold" style={{ color: currentTheme.colors.textPrimary }}>{session.respondentEmail}</span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono" style={{ borderColor: currentTheme.colors.primary, color: currentTheme.colors.primary }}>{session.role}</Badge>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs" style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.buttonText }}>Candidate Guest</Badge>
              <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Unauthenticated Respondent</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Input
            placeholder="Invite Access Token..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="h-8 text-xs w-36 font-mono"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.cardBorder,
              color: currentTheme.colors.textPrimary,
            }}
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs hover:opacity-80" 
            onClick={handleVerifyToken}
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.primary,
              color: currentTheme.colors.primary,
            }}
          >
            Verify
          </Button>
          {session.isAuthenticated && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs hover:opacity-80"
              onClick={examStore.clearSession}
              style={{ color: currentTheme.colors.textSecondary }}
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

      {/* Sequential Wizard Runner */}
      {isSequential && currentField ? (
        <Card className={`w-full ${activeThemeId === 'clean-wide' ? 'max-w-3xl' : 'max-w-xl'} mx-auto border-border shadow-lg bg-card animate-in fade-in duration-150`}>
          <CardHeader className="py-4 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-primary">
                Step {stepHistory.length + 1} of ~{visibleFields.length} (Question #{currentStep + 1})
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">{activeForm.formType.replace('_', ' ')}</Badge>
            </div>
            <Progress
              value={Math.min(
                100,
                Math.round(((stepHistory.length + 1) / Math.max(visibleFields.length, stepHistory.length + 1)) * 100)
              )}
              className="h-1.5 mb-2"
            />
            <CardTitle className="text-base font-bold">{currentField.label}</CardTitle>
            {isCurrentFieldRequired && (
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-500 bg-amber-500/10 flex items-center gap-1 w-fit mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Mandatory Response</span>
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {currentField.type !== 'video' && currentField.videoUrl && (
              <RunnerVideoPlayer
                videoUrl={currentField.videoUrl}
                videoCaption={currentField.videoCaption}
                title={currentField.label}
              />
            )}
            {renderFieldInput(currentField, answers[currentField.id], (val) => handleAnswerChange(currentField.id, val))}

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStep === 0}
                onClick={handlePreviousStep}
                className="text-xs"
              >
                Previous
              </Button>

              {isLastVisibleStep ? (
                <Button size="sm" onClick={handleNextStep} className="text-xs bg-emerald-600 hover:bg-emerald-700">
                  Submit Assessment
                </Button>
              ) : (
                <Button size="sm" onClick={handleNextStep} className="text-xs bg-primary">
                  Next Question &rarr;
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Single-Page Form Mode */
        <Card className={`w-full ${activeThemeId === 'clean-wide' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto border-border shadow-lg bg-card animate-in fade-in duration-150`}>
          <CardHeader className="py-4 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{activeForm.formType.replace('_', ' ')}</Badge>
              <Badge variant="secondary" className="text-xs">{activeForm.formAccess}</Badge>
            </div>
            <CardTitle className="text-xl font-bold">{activeForm.title}</CardTitle>
            {activeForm.description && (
              <CardDescription className="text-xs">{activeForm.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Your Full Name</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="bg-background text-xs h-8"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Your Email</label>
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. elena@company.org"
                  className="bg-background text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-3">
              {visibleFields.map((f, idx) => {
                const isFieldRequired = evaluateFieldRequired(f, answers, fields);

                return (
                  <div key={f.id} className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                    <label className="font-semibold text-xs flex items-center justify-between">
                      <span>{idx + 1}. {f.label}</span>
                      {isFieldRequired ? (
                        <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-500 bg-amber-500/10 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          <span>Required</span>
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">Optional</span>
                      )}
                    </label>
                    {f.type !== 'video' && f.videoUrl && (
                      <RunnerVideoPlayer
                        videoUrl={f.videoUrl}
                        videoCaption={f.videoCaption}
                        title={f.label}
                      />
                    )}
                    {renderFieldInput(f, answers[f.id], (val) => handleAnswerChange(f.id, val))}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button onClick={handleSubmit} size="sm" className="bg-primary text-xs font-semibold">
                Submit Response
              </Button>
            </div>
          </CardContent>
        </Card>
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
              <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
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
              ? 'border-primary bg-primary/10 scale-[1.01]'
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
          <span className="text-[10px] text-muted-foreground mt-1 font-mono">
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
            className="h-6 px-1.5 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
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
        <p className="text-[11px] text-muted-foreground mt-1">
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

function renderFieldInput(field: FormField, value: unknown, onChange: (val: unknown) => void) {
  const strValue = typeof value === 'string' ? value : '';

  switch (field.type) {
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
            <span className="text-[11px] text-muted-foreground font-mono truncate max-w-sm block">{field.url || '#'}</span>
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
            className={`font-mono text-xs bg-background h-8 ${!isValid && strValue ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {!isValid && strValue && (
            <span className="text-[11px] text-destructive flex items-center gap-1">
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
        <div className="space-y-1.5">
          {options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                selectedOpts.includes(opt)
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-card hover:bg-muted/40 text-foreground'
              }`}
            >
              <input
                type="checkbox"
                name={`field-${field.id}`}
                value={opt}
                checked={selectedOpts.includes(opt)}
                onChange={(e) => handleChange(opt, e.target.checked)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>{opt}</span>
            </label>
          ))}
          {field.allowOtherOption && (
            <div className="space-y-1.5 pt-0.5">
              <label
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                  hasOther
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card hover:bg-muted/40 text-foreground'
                }`}
              >
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
                  className="text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Other:</span>
                {hasOther && (
                  <Input
                    value={otherValue.trim()}
                    onChange={(e) => handleOtherChange(e.target.value)}
                    placeholder="Type custom answer or click a suggestion below..."
                    className="h-6 text-xs flex-1 max-w-sm"
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
                  <div className="flex flex-wrap items-center gap-1.5 pl-6 pt-0.5 animate-in fade-in duration-150">
                    <span className="text-[11px] text-muted-foreground font-medium">Suggestions:</span>
                    {popularSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOtherChange(sug);
                        }}
                        className="text-[11px] px-2.5 py-0.5 rounded-full border border-border/80 bg-background text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-all font-medium cursor-pointer shadow-2xs"
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

    case 'single_choice':
    case 'true_false': {
      const options = field.options || ['Yes', 'No'];
      const otherPrefix = '__other__:';
      const hasOther = strValue.startsWith(otherPrefix);
      const otherValue = hasOther ? strValue.substring(otherPrefix.length) : '';

      return (
        <div className="space-y-1.5">
          {options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                strValue === opt
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-card hover:bg-muted/40 text-foreground'
              }`}
            >
              <input
                type="radio"
                name={`field-${field.id}`}
                value={opt}
                checked={strValue === opt}
                onChange={() => onChange(opt)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>{opt}</span>
            </label>
          ))}
          {field.allowOtherOption && (
            <div className="space-y-1.5 pt-0.5">
              <label
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                  hasOther
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card hover:bg-muted/40 text-foreground'
                }`}
              >
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value="__other__"
                  checked={hasOther}
                  onChange={() => onChange(otherPrefix + ' ')}
                  className="text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Other:</span>
                {hasOther && (
                  <Input
                    value={otherValue.trim()}
                    onChange={(e) => onChange(otherPrefix + e.target.value)}
                    placeholder="Type custom answer or click a suggestion below..."
                    className="h-6 text-xs flex-1 max-w-sm"
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
                  <div className="flex flex-wrap items-center gap-1.5 pl-6 pt-0.5 animate-in fade-in duration-150">
                    <span className="text-[11px] text-muted-foreground font-medium">Suggestions:</span>
                    {popularSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange(otherPrefix + sug);
                        }}
                        className="text-[11px] px-2.5 py-0.5 rounded-full border border-border/80 bg-background text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-all font-medium cursor-pointer shadow-2xs"
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

    case 'rating': {
      const currentRating = typeof value === 'number' ? value : Number(value) || 0;
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`w-8 h-8 rounded-lg border font-bold text-xs transition ${
                currentRating >= star
                  ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {star}
            </button>
          ))}
        </div>
      );
    }

    case 'short_answer':
    case 'email':
    case 'phone':
    default:
      return (
        <Input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter your response...'}
          className="text-xs bg-background h-8"
        />
      );
  }
}

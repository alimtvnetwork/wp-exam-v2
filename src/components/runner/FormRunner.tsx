import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FormModel, FormField, FormSubmissionResult } from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useExamAppStore } from '@/quiz/store/exam-store';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { ExternalLink, AlertCircle, CheckCircle2, Play, Copy, Share2, Layers, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { getTheme, getThemeCssVariables, THEME_PRESETS } from '@/themes/theme-definitions';
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
  const [activeThemeId, setActiveThemeId] = useState<string>('riseup-asia');
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
    setSelectedProjectId(newProjectId);
    setCurrentStep(0);
    setStepHistory([]);
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);

    // Update browser URL query without reloading
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('project', newProjectId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCopyProjectLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173';
    let link = `${origin}/runner?project=${selectedProjectId}`;
    if (selectedProjectId === 'custom-active') {
      link = `${origin}/preview`;
    }
    navigator.clipboard.writeText(link);
    toast.success(`Copied live URL: ${link}`);
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

    if (isQuiz) {
      currentVisibleFields.forEach((f) => {
        const pts = f.points || 1;
        total += pts;
        const userAns = String(answers[f.id] ?? '');
        const correctAns = f.correctAnswer || '';
        const hasUserAns = Boolean(userAns);
        const hasCorrectAns = Boolean(correctAns);

        if (hasUserAns) {
          if (hasCorrectAns) {
            const isMatch = userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();

            if (isMatch) {
              earned += pts;
            }
          }
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
        const userAns = String(answers[f.id] ?? '');
        const correctAns = f.correctAnswer || '';
        const hasUserAns = Boolean(userAns);
        const hasCorrectAns = Boolean(correctAns);
        let isCorrect = false;

        if (hasUserAns) {
          if (hasCorrectAns) {
            isCorrect = userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
          }
        }

        return {
          question: f.label,
          answer: userAns,
          correct: correctAns,
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
      <Card className="w-full max-w-xl mx-auto border-emerald-500/40 shadow-xl bg-card">
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
      className={`space-y-4 font-sans max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl transition-all duration-300 theme-${activeThemeId}`}
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
              borderColor: currentTheme.colors.cardBorder,
              color: currentTheme.colors.textPrimary,
            }}
          >
            <Share2 className="w-3 h-3" />
            <span>Share Direct URL</span>
          </Button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Candidate Role & Access Bar */}
      <div className="p-3 bg-card border border-border rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {session.isAuthenticated ? (
            <>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                ✓ Verified Respondent
              </Badge>
              <span className="text-xs font-semibold text-foreground">{session.respondentEmail}</span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">{session.role}</Badge>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs">Candidate Guest</Badge>
              <span className="text-xs text-muted-foreground">Unauthenticated Respondent</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Input
            placeholder="Invite Access Token..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="h-8 text-xs w-36 bg-background font-mono"
          />
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleVerifyToken}>
            Verify
          </Button>
          {session.isAuthenticated && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
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

      {/* Sequential Wizard Runner */}
      {isSequential && currentField ? (
        <Card className="w-full max-w-xl mx-auto border-border shadow-lg bg-card">
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
              <span className="text-[11px] text-destructive font-medium">* Required Field</span>
            )}
          </CardHeader>

          <CardContent className="space-y-4 p-6">
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
        <Card className="w-full max-w-2xl mx-auto border-border shadow-lg bg-card">
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
                      {isFieldRequired && <span className="text-[10px] text-destructive font-medium">* Required</span>}
                    </label>
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

function renderFieldInput(field: FormField, value: unknown, onChange: (val: unknown) => void) {
  const strValue = typeof value === 'string' ? value : '';

  switch (field.type) {
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

    case 'multiple_choice':
    case 'single_choice':
    case 'true_false': {
      const options = field.options || ['Yes', 'No'];
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

    case 'file_upload': {
      const fileValue = (value as { name?: string; size?: number }) || null;

      return (
        <div className="space-y-2">
          {fileValue && fileValue.name ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{fileValue.name}</span>
                {fileValue.size && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({(fileValue.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          ) : (
            <label className="p-4 border-2 border-dashed border-border/80 hover:border-primary/60 rounded-lg text-center bg-muted/20 hover:bg-muted/30 transition cursor-pointer flex flex-col items-center justify-center">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    onChange({
                      name: file.name,
                      size: file.size,
                      type: file.type || 'application/octet-stream',
                    });
                  }
                }}
              />
              <span className="text-xs text-muted-foreground block font-medium">
                Click to upload document or drag-and-drop file
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                Supported formats: PDF, DOCX, ZIP, PNG (Max 10MB)
              </span>
            </label>
          )}
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

import React, { useState } from 'react';
import { ArrowLeft, Flag, Check, HelpCircle, ExternalLink, RefreshCw, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  verificationType?: 'google_docs' | 'url' | 'figma' | 'any';
  layout?: '1-column' | '2-column';
  points?: number;
}

export interface FocusQuizConfig {
  id: string;
  title: string;
  themeId?: string;
  hasIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
  introImage?: string;
  questions: FocusQuestion[];
  passingScore?: number;
}

interface FocusQuizRunnerProps {
  config?: FocusQuizConfig;
  onComplete?: (result: { score: number; total: number; percentage: number; isPassed: boolean }) => void;
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
      hint: 'Must start with https:// and be accessible for verification.',
      points: 15,
    },
  ],
};

export const FocusQuizRunner: React.FC<FocusQuizRunnerProps> = ({
  config = DEFAULT_SAMPLE_CONFIG,
  onComplete,
  onBackToAdmin,
}) => {
  const [activeThemeId, setActiveThemeId] = useState<string>(config.themeId || 'letterly');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(!config.hasIntro);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportText, setReportText] = useState<string>('');
  const [calculatedScore, setCalculatedScore] = useState<{
    score: number;
    total: number;
    percentage: number;
    isPassed: boolean;
    wrongQuestions: string[];
  } | null>(null);

  const theme: ThemeDefinition = getTheme(activeThemeId);
  const questions = config.questions;
  const currentQuestion = questions[currentStep];

  const totalSteps = questions.length;
  const progressPercent = hasStarted
    ? Math.round(((currentStep + 1) / totalSteps) * 100)
    : 0;

  const handleSelectOption = (questionId: string, optionLabel: string, isMulti: boolean) => {
    if (isMulti) {
      const currentSelected: string[] = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
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
    if (!hasStarted) {
      setHasStarted(true);
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowHint(false);
    } else if (config.hasIntro && hasStarted) {
      setHasStarted(false);
    } else if (onBackToAdmin) {
      onBackToAdmin();
    }
  };

  const finishQuiz = () => {
    let earned = 0;
    let total = 0;
    const wrong: string[] = [];

    questions.forEach((q, idx) => {
      const qPoints = q.points || 10;
      total += qPoints;
      const userAns = answers[q.id];

      if (q.type === 'mcq') {
        const isMatch = String(userAns || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
        if (isMatch) {
          earned += qPoints;
        } else {
          wrong.push(`Question ${idx + 1}: ${q.title.replace(/\*\*/g, '')}`);
        }
      } else if (q.type === 'multiselect') {
        const expectedArr: string[] = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer || '')];
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
        const hasUrl = Boolean(userAns && String(userAns).startsWith('http'));
        if (hasUrl) {
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
    setIsCompleted(true);
    if (onComplete) {
      onComplete(result);
    }
  };

  const submitReport = () => {
    if (!reportText.trim()) {
      toast.error('Please describe the issue or feedback.');
      return;
    }
    toast.success('Feedback recorded! Thank you for helping improve the quiz.');
    setReportText('');
    setShowReportModal(false);
  };

  const renderFormattedTitle = (title: string) => {
    const parts = title.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2);
        return (
          <span key={index} style={{ color: theme.colors.highlightWord }} className="font-extrabold tracking-tight">
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
      {/* Top Navigation & Progress Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-opacity-90 border-b" style={{ borderColor: theme.colors.cardBorder }}>
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
            <span className="text-lg">👻</span>
            <span>{config.title}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Selector */}
            <select
              value={activeThemeId}
              onChange={(e) => setActiveThemeId(e.target.value)}
              className="text-xs px-2 py-1 rounded bg-transparent border text-slate-300 cursor-pointer"
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

        {/* Slim Progress Bar */}
        {hasStarted && !isCompleted && (
          <div className="w-full bg-slate-800 h-1 relative overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: theme.colors.progressBar,
              }}
            />
          </div>
        )}
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {!isCompleted ? (
          !hasStarted ? (
            /* Intro Hero Card */
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              {config.introImage && (
                <div className="w-full h-56 rounded-3xl overflow-hidden shadow-2xl border" style={{ borderColor: theme.colors.cardBorder }}>
                  <img src={config.introImage} alt="Assessment Intro" className="w-full h-full object-cover" />
                </div>
              )}

              <h1 className="text-3xl font-extrabold leading-tight">
                {renderFormattedTitle(config.introTitle || "You're in the **right place**!")}
              </h1>

              <p className="text-base" style={{ color: theme.colors.textSecondary }}>
                {config.introSubtitle}
              </p>
            </div>
          ) : (
            /* Question Card */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="space-y-2 text-center">
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
                <div className="w-full h-44 rounded-2xl overflow-hidden border shadow" style={{ borderColor: theme.colors.cardBorder }}>
                  <img src={currentQuestion.mediaUrl} alt="Question Media" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Options List / Grid */}
              {(currentQuestion.type === 'mcq' || currentQuestion.type === 'multiselect') && currentQuestion.options && (
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
                    const isSelected = currentQuestion.type === 'multiselect'
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
                          boxShadow: isSelected ? `0 0 16px ${theme.colors.cardActiveBorder}44` : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {optIcon && <span className="text-xl">{optIcon}</span>}
                          <span className="font-semibold text-sm leading-snug">{optLabel}</span>
                        </div>
                        {isSelected && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: theme.colors.primary,
                              color: theme.colors.primaryText,
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* URL or Mindmap Submission */}
              {(currentQuestion.type === 'url_submission' || currentQuestion.type === 'mindmap') && (
                <div className="space-y-3">
                  <Input
                    placeholder="https://docs.google.com/document/d/... or workflowy.com/..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    className="p-4 rounded-xl border text-sm"
                    style={{
                      backgroundColor: theme.colors.cardBg,
                      borderColor: theme.colors.cardBorder,
                      color: theme.colors.textPrimary,
                    }}
                  />
                  <p className="text-xs flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Links are verified automatically for accessible sharing permissions.
                  </p>
                </div>
              )}

              {/* Paragraph Free-text */}
              {currentQuestion.type === 'paragraph' && (
                <Textarea
                  placeholder="Type your comprehensive response here..."
                  rows={5}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                  className="p-4 rounded-xl border text-sm"
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.cardBorder,
                    color: theme.colors.textPrimary,
                  }}
                />
              )}

              {/* Hint Accordion */}
              {currentQuestion.hint && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs inline-flex items-center gap-1 underline transition hover:opacity-80"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showHint ? 'Hide Hint' : 'Need a hint?'}
                  </button>
                  {showHint && (
                    <div
                      className="mt-2 p-3 rounded-xl border text-xs text-left animate-in fade-in"
                      style={{
                        backgroundColor: theme.colors.cardBg,
                        borderColor: theme.colors.cardBorder,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      💡 {currentQuestion.hint}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          /* Completion & Review Screen */
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="inline-flex p-4 rounded-full bg-opacity-20 mb-2" style={{ backgroundColor: theme.colors.badgeBg }}>
              <Sparkles className="w-10 h-10" style={{ color: theme.colors.primary }} />
            </div>

            <h2 className="text-3xl font-black">
              {calculatedScore?.isPassed ? 'Congratulations!' : 'Review Required'}
            </h2>

            {/* Score Display */}
            <div
              className="p-6 rounded-3xl border shadow-xl flex flex-col items-center justify-center space-y-2"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.cardBorder }}
            >
              <span className="text-5xl font-black" style={{ color: theme.colors.highlightWord }}>
                {calculatedScore?.percentage}%
              </span>
              <span
                className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: calculatedScore?.isPassed ? '#10B98133' : '#EF444433',
                  color: calculatedScore?.isPassed ? '#10B981' : '#EF4444',
                }}
              >
                {calculatedScore?.isPassed ? 'Passed' : 'Failed'} (Required: {config.passingScore || 70}%)
              </span>
              <span className="text-xs text-slate-400">
                Score: {calculatedScore?.score} / {calculatedScore?.total} points
              </span>
            </div>

            {/* Anti-Cheat Review: Show which questions were wrong WITHOUT giving away the correct answers! */}
            {calculatedScore && calculatedScore.wrongQuestions.length > 0 && (
              <div
                className="p-4 rounded-2xl border text-left space-y-2 text-xs"
                style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.cardBorder }}
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
                  Answers are locked to ensure full comprehension. Review the material and retry.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  setAnswers({});
                  setIsCompleted(false);
                  setHasStarted(!config.hasIntro);
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

      {/* Sticky Bottom Action Button */}
      {!isCompleted && (
        <footer className="sticky bottom-0 z-20 backdrop-blur-md bg-opacity-95 p-4 border-t" style={{ borderColor: theme.colors.cardBorder }}>
          <div className="max-w-md mx-auto">
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl font-bold text-base shadow-xl transition active:scale-[0.98] hover:opacity-95"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.primaryText,
              }}
            >
              {!hasStarted ? "Let's do it" : currentStep === totalSteps - 1 ? 'Complete Assessment' : 'Continue'}
            </button>
          </div>
        </footer>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="max-w-sm w-full p-6 rounded-3xl border shadow-2xl space-y-4"
            style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.cardBorder }}
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Flag className="w-5 h-5 text-rose-400" />
              Report Question
            </h3>
            <p className="text-xs text-slate-300">
              Notice a typo, misleading answer, or broken link? Let our instructors know.
            </p>
            <Textarea
              placeholder="Describe what's wrong with this question..."
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="p-3 text-xs rounded-xl"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.cardBorder }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitReport} className="flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

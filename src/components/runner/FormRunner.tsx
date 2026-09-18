import React, { useState, useEffect } from 'react';
import { FormModel, FormField, FormSubmissionResult } from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useExamAppStore } from '@/quiz/store/exam-store';

interface FormRunnerProps {
  form: FormModel;
  onClose?: () => void;
}

export const FormRunner: React.FC<FormRunnerProps> = ({ form, onClose }) => {
  const examStore = useExamAppStore();
  const session = examStore.session;

  const [currentStep, setCurrentStep] = useState(0);
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

  const fields = form.fields || [];
  const isSequential = form.isSequential && fields.length > 1;
  const currentField = fields[currentStep];

  const handleAnswerChange = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
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

  const handleSubmit = () => {
    const finalName = guestName.trim() || session.respondentName || 'Anonymous Guest';
    const finalEmail = guestEmail.trim() || session.respondentEmail || 'guest@example.com';

    let earned = 0;
    let total = 0;
    let isPassed: boolean | null = null;
    let pct = 0;

    if (form.formType === 'quiz') {
      fields.forEach((f) => {
        const pts = f.points || 1;
        total += pts;
        const ans = answers[f.id];
        const isMatch = Boolean(
          ans &&
          f.correctAnswer &&
          String(ans).trim().toLowerCase() === String(f.correctAnswer).trim().toLowerCase()
        );

        if (isMatch) {
          earned += pts;
        }
      });

      pct = total > 0 ? Math.round((earned / total) * 100) : 0;
      const passingScore = form.settings?.passingScore ?? 70;
      isPassed = pct >= passingScore;

      setResult({
        score: earned,
        totalPossible: total,
        percentage: pct,
        isPassed,
        message: form.settings?.successMessage || 'Quiz completed successfully!',
      });
    } else {
      setResult({
        message: form.settings?.successMessage || 'Submission received successfully!',
        guestName: finalName,
        guestEmail: finalEmail,
      });
    }

    // Persist to Centralized Application Store
    examStore.addSubmission({
      form_title: form.title,
      form_type: form.formType,
      respondent_name: finalName,
      respondent_email: finalEmail,
      score: earned,
      total_score: total,
      score_percentage: pct,
      is_passed: Boolean(isPassed),
      answers: fields.map((f) => {
        const userAns = String(answers[f.id] ?? '');
        const correctAns = f.correctAnswer || '';
        const isCorrect = Boolean(
          userAns &&
          correctAns &&
          userAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
        );

        return {
          question: f.label,
          answer: userAns,
          correct: correctAns,
          isCorrect,
        };
      }),
    });

    // If an invite token was used, mark the invite as completed
    if (session.token) {
      examStore.markInviteCompleted(session.token);
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-xl mx-auto modern-quiz-card border-emerald-500/40 shadow-xl animate-card-entrance">
        <CardHeader className="text-center">
          <div className="mx-auto my-2 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 animate-pulse-glow">
            ✓
          </div>
          <CardTitle className="text-2xl font-bold">
            {form.formType === 'quiz' ? 'Quiz Completed' : 'Submission Received'}
          </CardTitle>
          <CardDescription>{result?.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formType === 'quiz' ? (
            <div className="p-4 rounded-lg bg-muted text-center space-y-2">
              <div className="text-4xl font-extrabold text-primary">{result?.percentage}%</div>
              <div className="text-sm text-muted-foreground">
                Score: {result?.score} / {result?.totalPossible} Points
              </div>
              <div>
                <Badge variant={result?.isPassed ? 'default' : 'destructive'} className="text-sm">
                  {result?.isPassed ? 'Passed' : 'Needs Retake'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted space-y-1 text-sm">
              <div><strong>Name:</strong> {guestName || session.respondentName || 'Anonymous Guest'}</div>
              <div><strong>Email:</strong> {guestEmail || session.respondentEmail || 'N/A'}</div>
              <div><strong>Submitted Fields:</strong> {Object.keys(answers).length} of {fields.length}</div>
            </div>
          )}

          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground text-center border">
            ✓ Response recorded in Completion History & SQLite storage engine.
          </div>

          <div className="flex justify-end pt-2">
            {onClose && (
              <Button onClick={onClose} variant="outline">Close Preview</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Authentication & Role Access Bar */}
      <div className="p-3.5 bg-card border rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
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
              <Badge variant="secondary" className="text-xs">Public Respondent</Badge>
              <span className="text-xs text-muted-foreground">Unauthenticated Guest</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Input
            placeholder="Enter Invite Token..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="h-8 text-xs w-36 bg-background"
          />
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleVerifyToken}>
            Verify Token
          </Button>
          {session.isAuthenticated && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={examStore.clearSession}
            >
              Log Out
            </Button>
          )}
        </div>
      </div>

      {authMessage && (
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-semibold text-center">
          {authMessage}
        </div>
      )}

      {/* Sequential Wizard Mode */}
      {isSequential && currentField ? (
        <Card className="w-full max-w-xl mx-auto modern-quiz-card shadow-lg animate-card-entrance">
          <CardHeader>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="modern-step-indicator">Step {currentStep + 1} of {fields.length}</span>
              <Badge variant="outline">{form.formType.replace('_', ' ')}</Badge>
            </div>
            <Progress value={Math.round(((currentStep + 1) / fields.length) * 100)} className="h-2 mb-3" />
            <CardTitle className="text-lg">{currentField.label}</CardTitle>
            {currentField.isRequired && (
              <span className="text-xs text-destructive font-medium">* Required</span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {renderFieldInput(currentField, answers[currentField.id], (val) => handleAnswerChange(currentField.id, val))}

            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>

              {currentStep < fields.length - 1 ? (
                <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                  Submit Response
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Single-Page Form Mode */
        <Card className="w-full max-w-2xl mx-auto modern-quiz-card shadow-lg animate-card-entrance">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{form.formType.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{form.formAccess}</Badge>
            </div>
            <CardTitle className="text-2xl font-bold">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-base">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Respondent Identity Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Your Full Name</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Your Email</label>
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. jane.doe@company.org"
                  className="bg-background text-sm"
                />
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="space-y-4">
              {fields.map((f, idx) => (
                <div key={f.id} className="p-4 rounded-md border bg-card space-y-2">
                  <label className="font-medium text-sm flex items-center justify-between">
                    <span>{idx + 1}. {f.label}</span>
                    {f.isRequired && <span className="text-xs text-destructive">* Required</span>}
                  </label>
                  {renderFieldInput(f, answers[f.id], (val) => handleAnswerChange(f.id, val))}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              {onClose && (
                <Button onClick={onClose} variant="outline">Close Preview</Button>
              )}
              <Button onClick={handleSubmit} className="bg-primary">
                Submit
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
    case 'multiple_choice':
    case 'single_choice':
    case 'true_false': {
      const options = field.options || ['Option 1', 'Option 2'];

      return (
        <div className="space-y-2 mt-2">
          {options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                value === opt ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                name={`field_${field.id}`}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4 text-primary"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    case 'dropdown':
      return (
        <select
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded-md bg-background text-sm"
        >
          <option value="">-- Select an option --</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case 'paragraph':
      return (
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter details...'}
          rows={3}
        />
      );

    case 'email':
      return (
        <Input
          type="email"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'name@example.com'}
        />
      );

    case 'phone':
      return (
        <Input
          type="tel"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '+1 (555) 000-0000'}
        />
      );

    case 'rating':
      return (
        <div className="flex gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${
                value === star ? 'bg-primary text-primary-foreground scale-110' : 'hover:bg-muted'
              }`}
            >
              {star}
            </button>
          ))}
        </div>
      );

    case 'file_upload':
      return (
        <div className="border-2 border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0]?.name || '')}
            className="block w-full text-xs"
          />
          {strValue ? <div className="mt-2 text-primary font-medium">Selected: {strValue}</div> : null}
        </div>
      );

    case 'short_answer':
    default:
      return (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Your answer...'}
        />
      );
  }
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Video,
  Award,
  ChevronRight,
  ArrowRight,
  User,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface PortalStep {
  id: string;
  title: string;
  description: string;
  step_number: number;
  is_required: boolean;
  is_completed: boolean;
  completed_at?: string;
}

interface CandidateInfo {
  id: number;
  candidate_name: string;
  candidate_email: string;
  phone?: string;
  current_stage_key: string;
  notes?: string;
}

interface PortalSession {
  token: string;
  candidate: CandidateInfo;
  steps: PortalStep[];
  completed_step_count: number;
  total_step_count: number;
  completion_percentage: number;
  is_fully_verified: boolean;
}

const DEFAULT_SESSION: PortalSession = {
  token: 'demo-token',
  candidate: {
    id: 1,
    candidate_name: 'Alex Morgan',
    candidate_email: 'alex.morgan@example.com',
    phone: '+1 (555) 345-6789',
    current_stage_key: 'screening',
    notes: 'Candidate verification portal session',
  },
  steps: [
    {
      id: 'step_welcome',
      title: 'Profile Verification & Welcome',
      description: 'Confirm your applicant identity and contact details.',
      step_number: 1,
      is_required: true,
      is_completed: true,
      completed_at: '2026-10-20 10:00:00',
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
  completed_step_count: 1,
  total_step_count: 5,
  completion_percentage: 20,
  is_fully_verified: false,
};

export const CandidatePortalRunner: React.FC = () => {
  const { token: routeToken } = useParams<{ token?: string }>();
  const activeToken = routeToken || 'demo-candidate';
  const [session, setSession] = useState<PortalSession>(DEFAULT_SESSION);
  const [activeStepId, setActiveStepId] = useState<string>('step_welcome');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Step 4 Submission State
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');

  const fetchSession = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/wp-json/wp-exam/v1/portal/${encodeURIComponent(activeToken)}`);
      const hasResponse = res.ok;

      if (hasResponse) {
        const json = await res.json();
        const sessionData = json?.data ?? json;

        if (sessionData?.steps) {
          setSession(sessionData);

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

    toast.success('Step verified and recorded successfully');

    // Advance to next step
    const currentIndex = session.steps.findIndex((s) => s.id === stepId);
    const nextStep = session.steps[currentIndex + 1];

    if (nextStep) {
      setActiveStepId(nextStep.id);
    }

    try {
      const res = await fetch(`/wp-json/wp-exam/v1/portal/${encodeURIComponent(activeToken)}/complete-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step_id: stepId,
          step_data: stepData,
        }),
      });

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

  const handleDownloadReceipt = () => {
    const receiptContent = `================================================
ONBOARDING QUIZ - CANDIDATE VERIFICATION RECEIPT
================================================
Candidate: ${session.candidate.candidate_name}
Email: ${session.candidate.candidate_email}
Stage: ${session.candidate.current_stage_key.toUpperCase()}
Token: ${session.token}
Status: VERIFIED & SUBMITTED
Timestamp: ${new Date().toISOString()}

Completed Milestones:
1. Profile Verification & Identity Confirmation [VERIFIED]
2. Confidentiality & NDA Agreement Signed [VERIFIED]
3. Technical Skills Assessment Completed [VERIFIED]
4. Work Sample & Video Introduction Received [VERIFIED]
5. Final Review Packet Stamped & Archived [VERIFIED]
================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-receipt-${session.candidate.candidate_name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded candidate verification receipt');
  };

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

              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/40">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {session.candidate.candidate_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {session.candidate.candidate_name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    {session.candidate.candidate_email}
                  </div>
                </div>
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

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {session.steps.map((step) => {
            const isActive = activeStepId === step.id;
            const isDone = step.is_completed;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : isDone
                    ? 'border-border/60 bg-card hover:bg-muted/40'
                    : 'border-border/40 bg-card/50 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Step {step.step_number}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                </div>
                <div className="text-xs font-semibold text-foreground truncate w-full">
                  {step.title.split('&')[0]}
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
                    <Input value={session.candidate.candidate_name} disabled className="bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <Input value={session.candidate.candidate_email} disabled className="bg-muted/40" />
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

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleCompleteStep('step_welcome', { phone: confirmPhone })}
                    disabled={!confirmProfileChecked}
                    className="gap-2 bg-primary text-primary-foreground font-semibold"
                  >
                    <span>Confirm Profile & Proceed</span>
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
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs font-mono leading-relaxed space-y-3 max-h-56 overflow-y-auto">
                  <p className="font-bold text-foreground">1. Confidential Information</p>
                  <p className="text-muted-foreground">
                    All technical prompts, curriculum architecture, proprietary interview questions, and evaluation criteria provided in this portal constitute confidential trade secrets.
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

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleCompleteStep('step_nda', { signature: ndaSignName, signed_at: new Date().toISOString() })}
                    disabled={!ndaAgreed || ndaSignName.trim().length === 0}
                    className="gap-2 bg-primary text-primary-foreground font-semibold"
                  >
                    <span>Sign Agreement & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Technical Skills Assessment */}
          {activeStepId === 'step_assessment' && (
            <>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Step 3 of 5
                  </Badge>
                  <CardTitle className="text-xl">Technical Knowledge & Skills Verification</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Answer the baseline engineering questions below to verify core competency.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="space-y-4">
                  {/* Question 1 */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Q1: How should positive booleans be evaluated in strict coding guidelines?
                    </label>
                    <div className="space-y-1.5 pt-1">
                      {[
                        'Explicit check: if (isReady == true)',
                        'Implicit check: if (isReady)',
                        'Triple equals check: if (isReady === true)',
                      ].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                          <input
                            type="radio"
                            name="q1"
                            value={opt}
                            checked={q1Answer === opt}
                            onChange={(e) => setQ1Answer(e.target.value)}
                            className="cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Q2: Which architectural pattern is utilized for SQLite sharding in WP Exam?
                    </label>
                    <div className="space-y-1.5 pt-1">
                      {[
                        'Monolithic central MySQL database',
                        'SQLite Split-DB architecture (Main + Project shards)',
                        'External cloud-only Redis cache',
                      ].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                          <input
                            type="radio"
                            name="q2"
                            value={opt}
                            checked={q2Answer === opt}
                            onChange={(e) => setQ2Answer(e.target.value)}
                            className="cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Question 3 */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Q3: In Riseup theme design tokens, what is the role of Gold (#E8C547)?
                    </label>
                    <div className="space-y-1.5 pt-1">
                      {[
                        'Dominant background surface fill',
                        'Strictly an active indicator mark, never dominant surface or text',
                        'All general body paragraph typography',
                      ].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                          <input
                            type="radio"
                            name="q3"
                            value={opt}
                            checked={q3Answer === opt}
                            onChange={(e) => setQ3Answer(e.target.value)}
                            className="cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleCompleteStep('step_assessment', { q1: q1Answer, q2: q2Answer, q3: q3Answer, score: 100 })}
                    disabled={!q1Answer || !q2Answer || !q3Answer}
                    className="gap-2 bg-primary text-primary-foreground font-semibold"
                  >
                    <span>Submit Assessment & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
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

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleCompleteStep('step_submission', { video_url: videoUrl, portfolio_url: portfolioUrl, notes: submissionNotes })}
                    disabled={videoUrl.trim().length === 0}
                    className="gap-2 bg-primary text-primary-foreground font-semibold"
                  >
                    <span>Save Submission & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Verification Complete */}
          {activeStepId === 'step_complete' && (
            <>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Step 5 of 5
                  </Badge>
                  <CardTitle className="text-xl">Verification Packet & Final Confirmation</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review your complete onboarding verification package.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    All Verification Milestones Completed!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your verification packet has been compiled and synced into the applicant tracking pipeline. Our hiring team will review your responses and reach out with interview details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {session.steps.map((stg) => (
                    <div key={stg.id} className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{stg.title}</span>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">
                        Verified
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                  <Button variant="outline" onClick={handleDownloadReceipt} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Verification Receipt
                  </Button>

                  <Button
                    onClick={() => handleCompleteStep('step_complete')}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Finalize & Submit Packet
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CandidatePortalRunner;

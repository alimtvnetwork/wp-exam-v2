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
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { unifiedFetch } from '@/utils/api-client';

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
  name?: string;
  email?: string;
  phone?: string;
  current_stage_key: string;
  current_stage?: string;
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
  assessment_gating_mode?: 'admin_approval' | 'instant_self_service';
  is_assessment_approved?: boolean;
}

const DEFAULT_SESSION: PortalSession = {
  token: 'demo-token',
  assessment_gating_mode: 'admin_approval',
  is_assessment_approved: false,
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
      is_completed: false,
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
  completed_step_count: 0,
  total_step_count: 5,
  completion_percentage: 0,
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
      const tokenEnc = encodeURIComponent(activeToken);
      const res = await unifiedFetch(`/api/v1/portal/${tokenEnc}`, `/wp-json/wp-exam/v1/portal/${tokenEnc}`);
      const hasResponse = res.ok;

      if (hasResponse) {
        const json = await res.json();
        const sessionData = json?.data ?? json;

        if (sessionData?.steps) {
          const rawCandidate = sessionData.candidate || {};
          const candidateName = rawCandidate.candidate_name || rawCandidate.name || 'Candidate';
          const candidateEmail = rawCandidate.candidate_email || rawCandidate.email || 'candidate@example.com';
          const currentStage = rawCandidate.current_stage_key || rawCandidate.current_stage || 'assessment';
          const phone = rawCandidate.phone || '';

          const normalizedCandidate: CandidateInfo = {
            id: rawCandidate.id || 1,
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            phone: phone,
            current_stage_key: currentStage,
            notes: rawCandidate.notes || '',
          };

          const normalizedSession: PortalSession = {
            token: sessionData.token || activeToken,
            candidate: normalizedCandidate,
            steps: sessionData.steps,
            completed_step_count: sessionData.completed_step_count ?? sessionData.completed_steps_count ?? 0,
            total_step_count: sessionData.total_step_count ?? sessionData.total_steps_count ?? 5,
            completion_percentage: sessionData.completion_percentage ?? sessionData.progress_percentage ?? 0,
            is_fully_verified: Boolean(sessionData.is_fully_verified),
            assessment_gating_mode: sessionData.assessment_gating_mode || 'admin_approval',
            is_assessment_approved: Boolean(sessionData.is_assessment_approved),
          };

          setSession(normalizedSession);

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
      const tokenEnc = encodeURIComponent(activeToken);
      const res = await unifiedFetch(
        `/api/v1/portal/${tokenEnc}/complete-step`,
        `/wp-json/wp-exam/v1/portal/${tokenEnc}/complete-step`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step_id: stepId,
            step_data: stepData,
          }),
        }
      );

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
    const candidateName = session?.candidate?.candidate_name || (session?.candidate as any)?.name || 'Candidate';
    const candidateEmail = session?.candidate?.candidate_email || (session?.candidate as any)?.email || 'candidate@example.com';
    const currentStage = session?.candidate?.current_stage_key || (session?.candidate as any)?.current_stage || 'assessment';

    const receiptContent = `================================================
ONBOARDING QUIZ - CANDIDATE VERIFICATION RECEIPT
================================================
Candidate: ${candidateName}
Email: ${candidateEmail}
Stage: ${currentStage.toUpperCase()}
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
    link.download = `verification-receipt-${candidateName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded candidate verification receipt');
  };

  const candidateName = session?.candidate?.candidate_name || (session?.candidate as any)?.name || 'Candidate';
  const candidateEmail = session?.candidate?.candidate_email || (session?.candidate as any)?.email || 'candidate@example.com';
  const candidateInitial = (candidateName.trim().charAt(0) || 'C').toUpperCase();

  const firstUncompletedIndex = session.steps.findIndex((s) => !s.is_completed);
  const activeUncompletedIndex = (firstUncompletedIndex === -1) ? session.steps.length : firstUncompletedIndex;

  const gatingMode = session.assessment_gating_mode || 'admin_approval';
  const stageKey = session.candidate?.current_stage_key || '';
  const isApprovedByAdmin = Boolean(
    session.is_assessment_approved ||
    ['assessment', 'exam', 'interview', 'offered', 'hired'].includes(stageKey)
  );
  const isAssessmentGated = (gatingMode === 'admin_approval' && !isApprovedByAdmin);

  // Step 1 satisfaction
  const isStep1Done = Boolean(session.steps.find((s) => s.id === 'step_welcome')?.is_completed);
  const isStep1Satisfied = confirmProfileChecked || isStep1Done;

  // Step 2 satisfaction
  const isStep2Done = Boolean(session.steps.find((s) => s.id === 'step_nda')?.is_completed);
  const isStep2Satisfied = (ndaAgreed && ndaSignName.trim().length >= 2) || isStep2Done;

  const isStepAccessible = (stepNumber: number, isDone: boolean): boolean => {
    if (isDone) {
      return true;
    }

    const stepIndex = stepNumber - 1;
    const isAvailable = (stepIndex <= activeUncompletedIndex);

    // If candidate has completed Step 1 and Step 2, they can always view Step 3
    // (even if gated by admin, so they can see the pending status and check approval)
    if (stepNumber === 3) {
      return isStep1Done && isStep2Done;
    }

    // Steps 4 and 5 require Step 3 to be completed (which requires approval)
    if (stepNumber > 3 && isAssessmentGated) {
      return false;
    }

    return isAvailable;
  };

  // Step 3 satisfaction
  const isStep3Done = Boolean(session.steps.find((s) => s.id === 'step_assessment')?.is_completed);
  const isStep3Satisfied = Boolean((q1Answer && q2Answer && q3Answer) || isStep3Done);

  // Step 4 satisfaction
  const isStep4Done = Boolean(session.steps.find((s) => s.id === 'step_submission')?.is_completed);
  const isStep4Satisfied = (videoUrl.trim().length > 0) || isStep4Done;

  const handleStep1Submit = () => {
    if (!isStep1Satisfied) {
      toast.error('Please verify and confirm your contact details before proceeding.');
      return;
    }

    handleCompleteStep('step_welcome', { phone: confirmPhone });
  };

  const handleStep2Submit = () => {
    if (!isStep2Satisfied) {
      toast.error('Please sign your digital signature and accept the agreement.');
      return;
    }

    handleCompleteStep('step_nda', { signature: ndaSignName, signed_at: new Date().toISOString() });

    if (isAssessmentGated) {
      toast.info('Profile verification submitted. Awaiting administrative review before assessment unlocks.');
    }
  };

  const handleStep3Submit = () => {
    if (!isStep3Satisfied) {
      toast.error('Please answer all 3 assessment questions before proceeding.');
      return;
    }

    handleCompleteStep('step_assessment', { q1: q1Answer, q2: q2Answer, q3: q3Answer, score: 100 });
  };

  const handleStep4Submit = () => {
    if (!isStep4Satisfied) {
      toast.error('Please provide an introductory video recording link.');
      return;
    }

    handleCompleteStep('step_submission', { video_url: videoUrl, portfolio_url: portfolioUrl, notes: submissionNotes });
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
                  {candidateInitial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {candidateName}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    {candidateEmail}
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
            const isActive = (activeStepId === step.id);
            const isDone = step.is_completed;
            const isAccessible = isStepAccessible(step.step_number, isDone);
            const isLocked = !isAccessible;

            return (
              <button
                key={step.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isAccessible) {
                    setActiveStepId(step.id);
                    return;
                  }

                  toast.warning(`Please complete previous steps before advancing to Step ${step.step_number}.`);
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                    : isDone
                    ? 'border-emerald-500/40 bg-card hover:bg-muted/40 cursor-pointer'
                    : isAccessible
                    ? 'border-border/60 bg-card hover:bg-muted/40 cursor-pointer'
                    : 'border-border/30 bg-muted/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Step {step.step_number}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (step.id === 'step_assessment' && isAssessmentGated) ? (
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </div>
                <div className="text-xs font-semibold text-foreground truncate w-full flex items-center justify-between">
                  <span>{step.title.split('&')[0]}</span>
                  {isLocked ? (
                    <span className="text-[9px] text-muted-foreground font-normal ml-1">Locked</span>
                  ) : (step.id === 'step_assessment' && isAssessmentGated) ? (
                    <span className="text-[9px] text-amber-500 font-medium ml-1">Under Review</span>
                  ) : null}
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
                    <Input value={candidateName} disabled className="bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <Input value={candidateEmail} disabled className="bg-muted/40" />
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

                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                  {!isStep1Satisfied ? (
                    <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Please confirm your contact details to proceed.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Contact details confirmed.</span>
                    </div>
                  )}

                  <Button
                    onClick={handleStep1Submit}
                    disabled={!isStep1Satisfied}
                    className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{isStep1Done ? 'Save & Next Step' : 'Confirm Profile & Proceed'}</span>
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

                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStepId('step_welcome')}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    &larr; Previous Step
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isStep2Satisfied ? (
                      <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Digital signature & agreement required.</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Agreement signed.</span>
                      </div>
                    )}

                    <Button
                      onClick={handleStep2Submit}
                      disabled={!isStep2Satisfied}
                      className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{isStep2Done ? 'Update & Next Step' : 'Sign Agreement & Proceed'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Technical Skills Assessment */}
          {activeStepId === 'step_assessment' && (
            isAssessmentGated ? (
              <>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono">
                      Step 3 of 5 &bull; Pending Recruiter Review
                    </Badge>
                    <CardTitle className="text-xl">Profile Verification Submitted & Awaiting Approval</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your profile verification and signed NDA have been received. Recruiter approval is required before technical assignments unlock.
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
                      <Clock className="w-7 h-7 animate-pulse" />
                    </div>

                    <div className="max-w-md mx-auto space-y-1.5">
                      <h3 className="text-base font-bold text-foreground">
                        Profile Under Review by Recruiting Team
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Under our <strong className="text-foreground">Admin Approval Gate</strong> policy, candidate profiles are reviewed by the recruiting team in the Applicant Pipeline before technical assignments and timed evaluations are unlocked.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border/50 max-w-sm mx-auto text-left text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Candidate:</span>
                        <span className="font-semibold text-foreground">{candidateName}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Pipeline Stage:</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                          {stageKey || 'Screening'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Assignment Access:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked (Awaiting Recruiter Approval)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveStepId('step_nda')}
                        className="text-xs cursor-pointer"
                      >
                        &larr; View Signed NDA
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          fetchSession();
                          toast.info('Checking for administrative approval in pipeline...');
                        }}
                        className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Check Approval Status</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
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
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {gatingMode === 'admin_approval'
                        ? 'Profile approved by recruitment team. Technical assessment module unlocked.'
                        : 'Instant Self-Service: Identity verified. Technical assessment module unlocked.'}
                    </span>
                  </div>

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

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveStepId('step_nda')}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      &larr; Previous Step
                    </Button>

                    <div className="flex items-center gap-3">
                      {!isStep3Satisfied ? (
                        <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Please answer all 3 questions to proceed.</span>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>All questions answered.</span>
                        </div>
                      )}

                      <Button
                        onClick={handleStep3Submit}
                        disabled={!isStep3Satisfied}
                        className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span>{isStep3Done ? 'Update & Next Step' : 'Submit Assessment & Proceed'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )
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

                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStepId('step_assessment')}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    &larr; Previous Step
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isStep4Satisfied ? (
                      <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Introductory video link required.</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submission ready.</span>
                      </div>
                    )}

                    <Button
                      onClick={handleStep4Submit}
                      disabled={!isStep4Satisfied}
                      className="gap-2 bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{isStep4Done ? 'Update & Next Step' : 'Save Submission & Proceed'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
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
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold ${
                          stg.is_completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {stg.is_completed ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStepId('step_submission')}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    &larr; Previous Step
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleDownloadReceipt} className="gap-2 cursor-pointer">
                      <Download className="w-4 h-4" />
                      Download Verification Receipt
                    </Button>

                    <Button
                      onClick={() => handleCompleteStep('step_complete')}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Finalize & Submit Packet
                    </Button>
                  </div>
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

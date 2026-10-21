import React, { useState, useEffect } from 'react';
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
  ChevronRight
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

export interface ApplicantStage {
  id: number;
  stage_key: string;
  stage_name: string;
  display_order: number;
  color_code: string;
}

export interface Applicant {
  id: number;
  candidate_name: string;
  candidate_email: string;
  phone?: string;
  current_stage_key: string;
  form_id?: number;
  submission_id?: number;
  score?: number;
  rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

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
    phone: '+1 (555) 987-6543',
    current_stage_key: 'offered',
    score: 98,
    rating: 5,
    notes: 'Formal offer extended for Senior Frontend Architect role.',
    created_at: '2026-10-14 11:00:00',
  },
];

export const ApplicantPipelineKanban: React.FC = () => {
  const [stages, setStages] = useState<ApplicantStage[]>(DEFAULT_STAGES);
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_MOCK_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterStage, setSelectedFilterStage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // New Candidate Dialog
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStage, setNewStage] = useState('applied');
  const [newNotes, setNewNotes] = useState('');

  // Note/Feedback Dialog
  const [activeFeedbackApplicant, setActiveFeedbackApplicant] = useState<Applicant | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);

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
    } catch {
      // Graceful fallback to initial mock state in dev/standalone mode
    } finally {
      setIsLoading(false);
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
    const candidatePayload: Applicant = {
      id: newId,
      candidate_name: newName.trim(),
      candidate_email: newEmail.trim(),
      phone: newPhone.trim(),
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
      await unifiedFetch('/api/v1/applicants', '/wp-json/wp-exam/v1/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidatePayload.candidate_name,
          candidate_email: candidatePayload.candidate_email,
          phone: candidatePayload.phone,
          stage_key: candidatePayload.current_stage_key,
          notes: candidatePayload.notes,
        }),
      });
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
          rating: feedbackRating,
          notes: feedbackNotes,
        }),
      });
    } catch {
      // Standalone mode
    }
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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
              size="sm"
              onClick={() => setIsNewDialogOpen(true)}
              className="gap-2 bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
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

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 items-start">
        {stages.map((stage, stageIndex) => {
          const stageCandidates = filteredApplicants.filter(
            (app) => app.current_stage_key === stage.stage_key
          );
          const nextStage = stages[stageIndex + 1];

          return (
            <div
              key={stage.stage_key}
              className="flex flex-col rounded-xl bg-card/60 border border-border/60 overflow-hidden shadow-xs"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-border/40 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-background"
                      style={{ backgroundColor: stage.color_code }}
                    />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {stage.stage_name}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                    {stageCandidates.length}
                  </Badge>
                </div>
              </div>

              {/* Candidates Column List */}
              <div className="p-2 space-y-2.5 min-h-[380px] max-h-[650px] overflow-y-auto">
                {stageCandidates.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/50 rounded-lg bg-muted/10 text-muted-foreground text-xs space-y-1">
                    <Briefcase className="w-5 h-5 opacity-40" />
                    <span>No candidates</span>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="group relative bg-card hover:bg-muted/30 border-border/70 hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-xl"
                    >
                      <CardHeader className="p-3 pb-2 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {candidate.candidate_name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              {candidate.candidate_email}
                            </p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
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
                                onClick={() => {
                                  const portalToken = candidate.candidate_email.split('@')[0] || 'demo';
                                  window.open(`/portal/${portalToken}`, '_blank');
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

                      <CardContent className="p-3 pt-0 space-y-2">
                        {candidate.phone && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            <Phone className="w-3 h-3 shrink-0" />
                            {candidate.phone}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-bold text-foreground">
                              {candidate.rating || 5}/5
                            </span>
                          </div>

                          {candidate.score !== undefined && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/40 text-primary">
                              {candidate.score}% score
                            </Badge>
                          )}
                        </div>

                        {candidate.notes && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/40 p-1.5 rounded-md italic">
                            "{candidate.notes}"
                          </p>
                        )}

                        {nextStage && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStageTransition(candidate.id, nextStage.stage_key)}
                            className="w-full h-7 text-[11px] gap-1.5 mt-1 bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-150"
                          >
                            <span>Advance to {nextStage.stage_name}</span>
                            <ArrowRight className="w-3 h-3" />
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
    </div>
  );
};

export default ApplicantPipelineKanban;

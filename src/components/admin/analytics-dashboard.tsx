import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Share2,
  Copy,
  ExternalLink,
  Eye,
  Shield,
  Filter,
  Flag,
  Bug,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface QuestionAnalytics {
  id: string;
  number: number;
  title: string;
  type: string;
  totalAnswers: number;
  failureCount: number;
  failureRate: number;
  hasHighFailureAlert: boolean;
}

export interface ProjectAnalytics {
  projectId: string;
  projectTitle: string;
  totalAssigned: number;
  totalCompleted: number;
  totalFailed: number;
  passRate: number;
  isPublicShared: boolean;
  authenticatedCount: number;
  anonymousCount: number;
  questions: QuestionAnalytics[];
}

export interface QuestionReport {
  id: string;
  project_id: string;
  question_id: string;
  question_title?: string;
  report_type: 'feedback' | 'bug' | 'typo' | 'dispute';
  feedback_text: string;
  user_identifier: string;
  status: 'open' | 'under_review' | 'resolved';
  created_at: string;
}

const SAMPLE_PROJECT_ANALYTICS: ProjectAnalytics[] = [
  {
    projectId: 'proj-onboarding-101',
    projectTitle: 'Staff Onboarding & Security Fundamentals',
    totalAssigned: 84,
    totalCompleted: 68,
    totalFailed: 16,
    passRate: 81,
    isPublicShared: true,
    authenticatedCount: 52,
    anonymousCount: 16,
    questions: [
      {
        id: 'q1',
        number: 1,
        title: 'Two-Factor Authentication Setup Protocol',
        type: 'mcq',
        totalAnswers: 68,
        failureCount: 4,
        failureRate: 6,
        hasHighFailureAlert: false,
      },
      {
        id: 'q2',
        number: 2,
        title: 'Phishing Simulation Link Verification',
        type: 'multiselect',
        totalAnswers: 68,
        failureCount: 31,
        failureRate: 46,
        hasHighFailureAlert: true,
      },
      {
        id: 'q3',
        number: 3,
        title: 'Client Data Redaction Workflowy Architecture',
        type: 'url_submission',
        totalAnswers: 68,
        failureCount: 12,
        failureRate: 18,
        hasHighFailureAlert: false,
      },
      {
        id: 'q4',
        number: 4,
        title: 'Incident Escalation SLA Hierarchy',
        type: 'paragraph',
        totalAnswers: 68,
        failureCount: 29,
        failureRate: 43,
        hasHighFailureAlert: true,
      },
    ],
  },
  {
    projectId: 'proj-wp-architect',
    projectTitle: 'WordPress Core & Plugin Engineering Exam',
    totalAssigned: 42,
    totalCompleted: 30,
    totalFailed: 12,
    passRate: 71,
    isPublicShared: false,
    authenticatedCount: 30,
    anonymousCount: 0,
    questions: [
      {
        id: 'wq1',
        number: 1,
        title: 'Hook Lifecycle Execution Order (plugins_loaded vs init)',
        type: 'mcq',
        totalAnswers: 30,
        failureCount: 7,
        failureRate: 23,
        hasHighFailureAlert: false,
      },
      {
        id: 'wq2',
        number: 2,
        title: 'Non-Destructive Database Schema Migration via ALTER TABLE',
        type: 'paragraph',
        totalAnswers: 30,
        failureCount: 15,
        failureRate: 50,
        hasHighFailureAlert: true,
      },
    ],
  },
];

const INITIAL_REPORTS: QuestionReport[] = [
  {
    id: 'rep_101',
    project_id: 'proj-onboarding-101',
    question_id: 'q2',
    question_title: 'Phishing Simulation Link Verification',
    report_type: 'bug',
    feedback_text: 'Submit button stayed grayed out when using Safari 17 on macOS Sonoma until page refreshed.',
    user_identifier: 'dev-alex@example.com',
    status: 'open',
    created_at: '2026-09-18 11:20',
  },
  {
    id: 'rep_102',
    project_id: 'proj-onboarding-101',
    question_id: 'q4',
    question_title: 'Incident Escalation SLA Hierarchy',
    report_type: 'feedback',
    feedback_text: 'The 2-hour SLA in the prompt contradicts the 4-hour requirement in Section 1 reading docs.',
    user_identifier: 'sarah.ops@example.com',
    status: 'under_review',
    created_at: '2026-09-18 10:45',
  },
  {
    id: 'rep_103',
    project_id: 'proj-wp-architect',
    question_id: 'wq2',
    question_title: 'Non-Destructive Database Schema Migration via ALTER TABLE',
    report_type: 'typo',
    feedback_text: 'Typo in subtitle: "destructve" is misspelled.',
    user_identifier: 'candidate_anon_192.168.1.42',
    status: 'resolved',
    created_at: '2026-09-17 17:15',
  },
];

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<ProjectAnalytics[]>(SAMPLE_PROJECT_ANALYTICS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SAMPLE_PROJECT_ANALYTICS[0].projectId);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Question & Bug Reports State
  const [reports, setReports] = useState<QuestionReport[]>(INITIAL_REPORTS);
  const [reportFilter, setReportFilter] = useState<'all' | 'bug' | 'feedback' | 'typo' | 'dispute'>('all');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wp_exam_question_reports');
      const hasStored = Boolean(stored);

      if (hasStored && stored) {
        const parsed: QuestionReport[] = JSON.parse(stored);
        const hasParsed = Array.isArray(parsed) && parsed.length > 0;

        if (hasParsed) {
          setReports([...parsed, ...INITIAL_REPORTS]);
        }
      }
    } catch {
      // Storage fallback
    }
  }, []);

  const currentProject =
    analyticsData.find((proj) => proj.projectId === selectedProjectId) || analyticsData[0];

  const handleTogglePublicSharing = (projectId: string, isShared: boolean) => {
    setAnalyticsData((prev) =>
      prev.map((proj) => {
        if (proj.projectId === projectId) {
          return { ...proj, isPublicShared: isShared };
        }

        return proj;
      })
    );

    if (isShared) {
      toast.success('Public analytics sharing enabled. Candidates can now preview section difficulty.');
    } else {
      toast.info('Public analytics sharing disabled.');
    }
  };

  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return { ...r, status: 'resolved' as const };
        }

        return r;
      })
    );

    toast.success('Report marked as resolved');
  };

  const handleDismissReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    toast.info('Report dismissed from triage');
  };

  const filteredReports = reports.filter((r) => {
    const isAll = reportFilter === 'all';
    if (isAll) {
      return true;
    }

    return r.report_type === reportFilter;
  });

  const openReportsCount = reports.filter((r) => r.status === 'open').length;
  const bugsCount = reports.filter((r) => r.report_type === 'bug').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Project Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Performance & Question Failure Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Track candidate completion funnels, identify failure hotspots, triage question bug reports, and toggle public difficulty previews.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border">
            <span className="text-xs font-semibold px-2 text-muted-foreground">Course:</span>
            {analyticsData.map((proj) => (
              <Button
                key={proj.projectId}
                variant={selectedProjectId === proj.projectId ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedProjectId(proj.projectId)}
                className="text-xs h-7"
              >
                {proj.projectTitle.split('&')[0].trim()}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            Preview View
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Assigned</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {currentProject.totalAssigned}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Enrolled across active curriculum cohorts</span>
          </div>
        </Card>

        {/* Completed */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {currentProject.totalCompleted}
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round((currentProject.totalCompleted / currentProject.totalAssigned) * 100)}% completion rate
          </div>
        </Card>

        {/* Failed */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Failed / Incomplete</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-400">
            {currentProject.totalFailed}
          </div>
          <div className="text-xs text-muted-foreground">
            Require retake or section review
          </div>
        </Card>

        {/* Pass Rate */}
        <Card className="rounded-2xl border bg-card shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Pass Rate</span>
            <span className="text-xs font-mono font-bold text-amber-400">{currentProject.passRate}%</span>
          </div>
          <div className="text-3xl font-black text-foreground">
            {currentProject.passRate}%
          </div>
          <Progress value={currentProject.passRate} className="h-1.5" />
        </Card>
      </div>

      {/* Public Sharing Control Banner */}
      <Card className="rounded-2xl border bg-card/60 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-sm text-foreground">Public Analytics & Difficulty Preview</span>
              {currentProject.isPublicShared ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                  Publicly Shared
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Internal Only
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, prospective candidates can view the difficulty index and challenge hotspots before taking the assessment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={currentProject.isPublicShared}
              onCheckedChange={(checked) => handleTogglePublicSharing(currentProject.projectId, checked)}
            />
            {currentProject.isPublicShared && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://example.com/analytics/preview/${currentProject.projectId}`
                  );
                  toast.success('Public analytics link copied to clipboard!');
                }}
                className="text-xs h-8"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Link
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Authenticated Submissions: <strong>{currentProject.authenticatedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🕵️ Anonymous Submissions (Survey Mode): <strong>{currentProject.anonymousCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>🌐 Client IP addresses logged for security and anti-abuse verification</span>
          </div>
        </div>
      </Card>

      {/* Question-by-Question Failure Rate Breakdown */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Question-by-Question Failure Rate Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Pinpoint specific questions where candidates stumble. Questions with failure rates &gt; 40% are flagged with High Failure Alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-muted-foreground uppercase border-b bg-muted/40">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Question Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Submissions</th>
                  <th className="p-3 text-right">Failures</th>
                  <th className="p-3 text-right">Failure Rate</th>
                  <th className="p-3 text-center">Difficulty Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentProject.questions.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-bold text-muted-foreground">{q.number}</td>
                    <td className="p-3 font-semibold max-w-sm">{q.title}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {q.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium">{q.totalAnswers}</td>
                    <td className="p-3 text-right font-bold text-rose-400">{q.failureCount}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-bold ${q.hasHighFailureAlert ? 'text-rose-400' : 'text-slate-300'}`}>
                          {q.failureRate}%
                        </span>
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${q.hasHighFailureAlert ? 'bg-rose-500' : 'bg-primary'}`}
                            style={{ width: `${q.failureRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {q.hasHighFailureAlert ? (
                        <Badge className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/30 text-[10px] gap-1 py-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          High Failure Alert
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-muted-foreground py-0.5">
                          Normal
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reported Questions & Bug Triage Card */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-400" />
                Reported Questions & Bug Triage
                <Badge variant="secondary" className="text-xs ml-1">
                  {reports.length} Reports
                </Badge>
                {openReportsCount > 0 && (
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs">
                    {openReportsCount} Open
                  </Badge>
                )}
                {bugsCount > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                    {bugsCount} Technical Bugs
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Candidate-reported typos, ambiguous questions, correct answer disputes, and platform bugs submitted during quiz execution.
              </CardDescription>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl flex-wrap">
              <Button
                variant={reportFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setReportFilter('all')}
                className="text-[11px] h-7 px-2"
              >
                All
              </Button>
              <Button
                variant={reportFilter === 'bug' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setReportFilter('bug')}
                className="text-[11px] h-7 px-2 text-rose-400"
              >
                🐛 Bugs
              </Button>
              <Button
                variant={reportFilter === 'feedback' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setReportFilter('feedback')}
                className="text-[11px] h-7 px-2 text-sky-400"
              >
                💬 Feedback
              </Button>
              <Button
                variant={reportFilter === 'typo' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setReportFilter('typo')}
                className="text-[11px] h-7 px-2 text-amber-400"
              >
                📝 Typos
              </Button>
              <Button
                variant={reportFilter === 'dispute' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setReportFilter('dispute')}
                className="text-[11px] h-7 px-2 text-indigo-400"
              >
                ⚖️ Disputes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-muted-foreground uppercase border-b bg-muted/40">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Target Question / Topic</th>
                  <th className="p-3">Report Description</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReports.map((rep) => {
                  const isResolved = rep.status === 'resolved';

                  return (
                    <tr key={rep.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {rep.created_at}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {rep.report_type === 'bug' && (
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">
                            🐛 Bug
                          </Badge>
                        )}
                        {rep.report_type === 'feedback' && (
                          <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-[10px]">
                            💬 Feedback
                          </Badge>
                        )}
                        {rep.report_type === 'typo' && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                            📝 Typo
                          </Badge>
                        )}
                        {rep.report_type === 'dispute' && (
                          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px]">
                            ⚖️ Dispute
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 font-semibold max-w-xs">
                        <div>{rep.question_title || rep.question_id}</div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {rep.question_id}
                        </span>
                      </td>
                      <td className="p-3 max-w-sm text-foreground leading-relaxed">
                        {rep.feedback_text}
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                        {rep.user_identifier}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {isResolved ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            Resolved
                          </Badge>
                        ) : rep.status === 'under_review' ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                            Under Review
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">
                            Open
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isResolved ? (
                            <span className="text-[11px] text-muted-foreground">Archived</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveReport(rep.id)}
                              className="text-[10px] h-6 px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismissReport(rep.id)}
                            className="text-[10px] h-6 px-2 text-muted-foreground hover:text-rose-400"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Public View Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              Public Candidate Difficulty Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              This is the live view displayed to candidates before taking the assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div className="p-4 rounded-2xl bg-muted/60 border text-center space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Overall Course Difficulty</span>
              <div className="text-2xl font-black text-amber-400">
                {100 - currentProject.passRate}% Difficulty Index
              </div>
              <p className="text-[11px] text-muted-foreground">
                Based on {currentProject.totalCompleted + currentProject.totalFailed} historical evaluations
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Notable Challenge Hotspots:</span>
              <div className="space-y-1.5">
                {currentProject.questions
                  .filter((q) => q.hasHighFailureAlert)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-rose-300">Q{q.number}: {q.title}</span>
                      <Badge className="bg-rose-500 text-white text-[10px]">
                        {q.failureRate}% Fail Rate
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground bg-card p-3 rounded-xl border">
              ℹ️ Candidates are advised to review reading documentation and complete verification checklists before attempting this section.
            </div>

            <Button
              onClick={() => setIsPreviewOpen(false)}
              className="w-full rounded-xl text-xs font-bold"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

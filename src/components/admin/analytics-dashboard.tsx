import React, { useState } from 'react';
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

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<ProjectAnalytics[]>(SAMPLE_PROJECT_ANALYTICS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SAMPLE_PROJECT_ANALYTICS[0].projectId);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

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

  const handleCopyShareLink = (projectId: string) => {
    const url = `${window.location.origin}/analytics/public/${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success('Public analytics link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header and Project Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Performance & Question Failure Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor candidate completion, high-failure alert hotspots, and configure public difficulty previews.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl border w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full"
            >
              {analyticsData.map((proj) => (
                <option key={proj.projectId} value={proj.projectId}>
                  {proj.projectTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Assigned
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{currentProject.totalAssigned}</div>
            <p className="text-xs text-muted-foreground mt-1">Candidates enrolled in curriculum</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-500">{currentProject.totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Passed exam criteria</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Failed
            </CardTitle>
            <XCircle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-500">{currentProject.totalFailed}</div>
            <p className="text-xs text-muted-foreground mt-1">Need review or reassessment</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pass Rate
            </CardTitle>
            <span className="text-xs font-extrabold text-primary">{currentProject.passRate}%</span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-black">{currentProject.passRate}%</div>
            <Progress value={currentProject.passRate} className="h-2 rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Public Analytics Sharing & Anonymous Breakdown Banner */}
      <Card className="rounded-2xl border bg-card/80 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm">Public Analytics & Candidate Difficulty Preview</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Allowing public analytics lets candidates view pass/fail metrics and alert hotspots before starting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Public Access:</span>
              <Switch
                checked={currentProject.isPublicShared}
                onCheckedChange={(checked) => handleTogglePublicSharing(currentProject.projectId, checked)}
              />
            </div>

            {currentProject.isPublicShared && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyShareLink(currentProject.projectId)}
                  className="text-xs h-8 gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs h-8 gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview View
                </Button>
              </div>
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
          <div className="flex items-center gap-1.5 text-slate-400">
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

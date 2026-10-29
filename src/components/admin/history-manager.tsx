import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  ArrowUpDown,
  History,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useExamAppStore, SubmissionHistoryRecord, SubmissionAnswer } from '@/quiz/store/exam-store';
import { STORAGE_KEY_SUBMISSIONS, QuizSubmissionRecord } from '@/components/admin/analytics-dashboard';
import { INITIAL_CATEGORIES } from '@/components/admin/project-hierarchy-manager';
import { SEEDED_FOCUS_QUIZZES } from '@/components/admin/focus-quiz-editor';
import { getJobRoles } from '@/lib/role-assignments';

export const STORAGE_KEY_HISTORY = 'wp_exam_submissions_history';

// Helper to build a dictionary of known questions for title resolution
export const buildQuestionDictionary = (): Record<string, { title: string; correctAnswer?: string | string[] }> => {
  const dict: Record<string, { title: string; correctAnswer?: string | string[] }> = {};

  try {
    // 1. Curriculum project questions
    INITIAL_CATEGORIES.forEach((cat) => {
      cat.projects.forEach((proj) => {
        proj.sections?.forEach((sec) => {
          sec.questions?.forEach((q) => {
            if (q.id) {
              dict[q.id] = { title: q.title, correctAnswer: q.correctAnswer };
            }
          });
        });
      });
    });

    // 2. Focus studio questions
    SEEDED_FOCUS_QUIZZES.forEach((quiz) => {
      quiz.questions?.forEach((q) => {
        if (q.id) {
          dict[q.id] = { title: q.title.replace(/\*\*/g, ''), correctAnswer: q.correctAnswer };
        }
      });
    });

    // 3. Job role assessment questions
    const roles = getJobRoles();
    roles.forEach((r) => {
      r.secondPhaseQuestions?.forEach((q) => {
        if (q.id) {
          dict[q.id] = { title: q.question, correctAnswer: q.correctAnswer };
        }
      });
    });
  } catch {
    // fallback
  }

  return dict;
};

// Convert QuizSubmissionRecord from analytics into a displayable SubmissionHistoryRecord
export const normalizeQuizSubmission = (
  sub: QuizSubmissionRecord,
  qDict: Record<string, { title: string; correctAnswer?: string | string[] }>
): SubmissionHistoryRecord => {
  const answers: SubmissionAnswer[] = [];

  if (sub.answers && typeof sub.answers === 'object') {
    Object.entries(sub.answers).forEach(([qId, val]) => {
      const meta = qDict[qId];
      const qTitle = meta ? meta.title : `Question (${qId})`;
      const isWrong = sub.wrong_question_ids ? sub.wrong_question_ids.includes(qId) : false;
      const isCorrect = !isWrong;

      const expected = meta?.correctAnswer
        ? Array.isArray(meta.correctAnswer)
          ? meta.correctAnswer.join(', ')
          : String(meta.correctAnswer)
        : undefined;

      answers.push({
        question: qTitle,
        answer: Array.isArray(val) ? val.join(', ') : String(val ?? ''),
        correct: expected,
        isCorrect,
      });
    });
  }

  return {
    id: typeof sub.id === 'number' ? sub.id : Number(String(sub.id).replace(/\D/g, '').slice(-8)) || Date.now(),
    form_title: sub.quiz_title || sub.quiz_id || 'Technical Assessment',
    form_type: 'quiz',
    respondent_name: sub.candidate_name || (sub.is_anonymous ? 'Anonymous Candidate' : sub.candidate_email.split('@')[0]),
    respondent_email: sub.candidate_email,
    score: sub.score,
    total_score: sub.total || 100,
    score_percentage: sub.percentage,
    is_passed: sub.is_passed,
    submitted_at: sub.submitted_at ? sub.submitted_at.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
    answers,
  };
};

// Helper: load all merged submissions across storage sources
export const loadAllDynamicSubmissions = (storeSubmissions: SubmissionHistoryRecord[]): SubmissionHistoryRecord[] => {
  const qDict = buildQuestionDictionary();
  const allMap = new Map<string, SubmissionHistoryRecord>();

  // 1. Ingest persisted history
  if (typeof window !== 'undefined') {
    try {
      const rawHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: SubmissionHistoryRecord) => {
            const key = `${item.id}_${item.respondent_email}_${item.form_title}`;
            allMap.set(key, item);
          });
        }
      }
    } catch {
      // fallback
    }

    // 2. Ingest runner quiz submissions
    try {
      const rawQuizSubs = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (rawQuizSubs) {
        const parsed = JSON.parse(rawQuizSubs);
        if (Array.isArray(parsed)) {
          parsed.forEach((sub: QuizSubmissionRecord) => {
            const normalized = normalizeQuizSubmission(sub, qDict);
            const key = `sub_${sub.id}_${sub.candidate_email}`;
            allMap.set(key, normalized);
          });
        }
      }
    } catch {
      // fallback
    }
  }

  // 3. Ingest store submissions
  storeSubmissions.forEach((item) => {
    const key = `${item.id}_${item.respondent_email}_${item.form_title}`;
    const alreadyExists = allMap.has(key);
    if (!alreadyExists) {
      allMap.set(key, item);
    }
  });

  // Convert to array and sort newest first
  const list = Array.from(allMap.values());
  list.sort((a, b) => {
    const timeA = new Date(a.submitted_at).getTime() || 0;
    const timeB = new Date(b.submitted_at).getTime() || 0;
    return timeB - timeA;
  });

  return list;
};

export const HistoryManager: React.FC = () => {
  const examStore = useExamAppStore();

  const [submissions, setSubmissions] = useState<SubmissionHistoryRecord[]>(() =>
    loadAllDynamicSubmissions(examStore.submissions)
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_score' | 'lowest_score'>('newest');
  const [selectedRecord, setSelectedRecord] = useState<SubmissionHistoryRecord | null>(null);

  // Sync telemetry from storage
  const refreshHistory = useCallback(() => {
    const fresh = loadAllDynamicSubmissions(examStore.submissions);
    setSubmissions(fresh);
  }, [examStore.submissions]);

  useEffect(() => {
    const handleSubmissionsUpdated = () => refreshHistory();
    const handleStorage = (e: StorageEvent) => {
      const isRelevant = e.key === STORAGE_KEY_SUBMISSIONS || e.key === STORAGE_KEY_HISTORY;
      if (isRelevant) {
        refreshHistory();
      }
    };

    window.addEventListener('wp_exam_submissions_updated', handleSubmissionsUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('wp_exam_submissions_updated', handleSubmissionsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshHistory]);

  // Persist updated list
  const persistSubmissions = (updated: SubmissionHistoryRecord[]) => {
    setSubmissions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated, null, 2));
      window.dispatchEvent(new Event('wp_exam_submissions_updated'));
    }
  };

  // Delete submission record
  const handleDeleteSubmission = (id: string | number, title: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    persistSubmissions(updated);

    // Also remove from quiz submissions storage if present
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((s: QuizSubmissionRecord) => s.id !== id && String(s.id) !== String(id));
            localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(filtered, null, 2));
          }
        }
      } catch {
        // fallback
      }
    }

    toast.success(`Removed submission record for "${title}".`);
  };

  // Export submissions to CSV
  const handleExportCsv = () => {
    if (submissions.length === 0) {
      toast.info('No submissions available to export.');
      return;
    }

    const headers = ['ID', 'Candidate Name', 'Candidate Email', 'Form / Exam Title', 'Type', 'Score (%)', 'Passed', 'Submitted At'];
    const rows = submissions.map((r) => [
      r.id,
      `"${(r.respondent_name || '').replace(/"/g, '""')}"`,
      `"${(r.respondent_email || '').replace(/"/g, '""')}"`,
      `"${(r.form_title || '').replace(/"/g, '""')}"`,
      r.form_type,
      r.score_percentage,
      r.is_passed ? 'PASSED' : 'FAILED',
      `"${r.submitted_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wp_exam_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported submissions to CSV');
  };

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = submissions.filter((sub) => {
      // Type filter
      const matchesType = typeFilter === 'all' || sub.form_type === typeFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'passed' && sub.is_passed) ||
        (statusFilter === 'failed' && !sub.is_passed);

      // Search query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        sub.respondent_name.toLowerCase().includes(query) ||
        sub.respondent_email.toLowerCase().includes(query) ||
        sub.form_title.toLowerCase().includes(query);

      return matchesType && matchesStatus && matchesSearch;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      }
      if (sortBy === 'highest_score') {
        return b.score_percentage - a.score_percentage;
      }
      if (sortBy === 'lowest_score') {
        return a.score_percentage - b.score_percentage;
      }
      return 0;
    });

    return result;
  }, [submissions, typeFilter, statusFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-card-entrance">
      <Card className="border border-border/80 shadow-2xl rounded-2xl bg-card text-card-foreground backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl font-bold font-heading">
                  Quiz & Form Completion History
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono text-emerald-500 border-emerald-500/30">
                  Live Submissions
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Review candidate submissions, auto-calculated scores, pass/fail thresholds, and answer breakdowns.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="text-xs font-mono">
                {submissions.length} Total Submissions
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshHistory}
                className="h-8 px-2.5 text-xs gap-1"
                title="Refresh submissions from storage"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-8 px-2.5 text-xs gap-1"
                title="Download CSV export"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border/40 mt-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search candidate, email, or exam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold shrink-0">Type:</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="quiz" className="text-xs">Quizzes & Assessments</SelectItem>
                  <SelectItem value="employee_signup" className="text-xs">Employee Sign-Ups</SelectItem>
                  <SelectItem value="survey" className="text-xs">Surveys</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Outcome Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold shrink-0">Outcome:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="All Outcomes" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-xs">All Outcomes</SelectItem>
                  <SelectItem value="passed" className="text-xs">Passed</SelectItem>
                  <SelectItem value="failed" className="text-xs">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold shrink-0">Sort:</span>
              <Select value={sortBy} onValueChange={(val: 'newest' | 'oldest' | 'highest_score' | 'lowest_score') => setSortBy(val)}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="newest" className="text-xs">Newest First</SelectItem>
                  <SelectItem value="oldest" className="text-xs">Oldest First</SelectItem>
                  <SelectItem value="highest_score" className="text-xs">Highest Score</SelectItem>
                  <SelectItem value="lowest_score" className="text-xs">Lowest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredSubmissions.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground text-xs space-y-3">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-foreground text-sm">No matching submission records found.</p>
                <p className="text-muted-foreground mt-0.5">Try clearing filters or search criteria.</p>
              </div>
              {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs h-7"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40 bg-card/60 shadow-sm">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm truncate">{sub.respondent_name}</span>
                      <span className="text-xs text-muted-foreground font-mono">&lt;{sub.respondent_email}&gt;</span>
                      <Badge variant="outline" className="text-[11px] capitalize">
                        {sub.form_type.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={`text-[11px] uppercase font-bold py-0.5 ${
                          sub.is_passed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {sub.is_passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>Exam: <strong className="font-semibold text-foreground">{sub.form_title}</strong></span>
                      <span>•</span>
                      <span>Submitted: <span className="font-mono">{sub.submitted_at}</span></span>
                    </div>

                    <div className="flex items-center gap-3 pt-1 max-w-xs">
                      <Progress value={sub.score_percentage} className="h-1.5 flex-1" />
                      <span className="text-xs font-bold font-mono text-foreground">{sub.score_percentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(sub)}
                      className="text-xs h-8 px-3 gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>View Answers</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubmission(sub.id, sub.form_title)}
                      className="text-xs h-8 w-8 p-0 text-muted-foreground hover:text-rose-400"
                      title="Delete submission record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Detail Modal */}
      {selectedRecord && (
        <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 rounded-3xl border shadow-2xl">
            <DialogHeader className="border-b pb-3 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Submission Answers: {selectedRecord.respondent_name}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    {selectedRecord.form_title} • Submitted: {selectedRecord.submitted_at}
                  </DialogDescription>
                </div>
                <Badge
                  className={`text-xs uppercase font-bold shrink-0 ${
                    selectedRecord.is_passed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {selectedRecord.score_percentage}% ({selectedRecord.is_passed ? 'Passed' : 'Failed'})
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {(selectedRecord.answers || []).length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground italic">
                  No individual question answer records attached to this submission.
                </div>
              ) : (
                (selectedRecord.answers || []).map((ans, idx) => (
                  <div key={idx} className="p-3.5 bg-muted/30 rounded-xl border border-border/60 text-xs space-y-2">
                    <div className="font-semibold text-foreground flex items-start gap-2">
                      <span className="font-mono text-muted-foreground shrink-0">Q{idx + 1}:</span>
                      <span>{ans.question}</span>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-border/40 text-[11px]">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Candidate Choice:</span>
                        <span className="font-medium text-foreground text-right">{ans.answer || '(None provided)'}</span>
                      </div>

                      {ans.correct && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Expected / Correct:</span>
                          <span className="font-mono text-emerald-500 font-semibold text-right">{ans.correct}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          ans.isCorrect
                            ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-rose-500 border-rose-500/30 bg-rose-500/10'
                        }`}
                      >
                        {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="border-t pt-3 shrink-0">
              <Button size="sm" onClick={() => setSelectedRecord(null)} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

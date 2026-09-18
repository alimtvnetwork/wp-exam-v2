import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExamAppStore, SubmissionHistoryRecord } from '@/quiz/store/exam-store';

export const HistoryManager: React.FC = () => {
  const examStore = useExamAppStore();
  const submissions = examStore.submissions;

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<SubmissionHistoryRecord | null>(null);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesType = typeFilter === 'all' || sub.form_type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'passed' && sub.is_passed) ||
      (statusFilter === 'failed' && !sub.is_passed);

    return matchesType && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-card-entrance">
      <Card className="modern-quiz-card border shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold">Quiz & Form Completion History</CardTitle>
              <CardDescription className="text-xs">
                Review candidate submissions, auto-calculated scores, pass/fail thresholds, and answer breakdowns.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {submissions.length} Total Submissions
              </Badge>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-1 border rounded bg-background text-xs font-medium"
              >
                <option value="all">All Types</option>
                <option value="quiz">Quizzes</option>
                <option value="employee_signup">Employee Sign-Ups</option>
                <option value="survey">Surveys</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Outcome:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1 border rounded bg-background text-xs font-medium"
              >
                <option value="all">All Outcomes</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm">
              No matching submission records found.
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden divide-y bg-background">
              {filteredSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{sub.respondent_name}</span>
                      <span className="text-xs text-muted-foreground">&lt;{sub.respondent_email}&gt;</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {sub.form_type.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          sub.is_passed ? 'score-badge-passed' : 'score-badge-failed'
                        }`}
                      >
                        {sub.is_passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Exam: <span className="font-medium text-foreground">{sub.form_title}</span> • Submitted: {sub.submitted_at}
                    </div>

                    {sub.form_type === 'quiz' && (
                      <div className="flex items-center gap-3 pt-1 max-w-xs">
                        <Progress value={sub.score_percentage} className="h-2 flex-1" />
                        <span className="text-xs font-bold font-mono">{sub.score_percentage}%</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRecord(sub)} className="text-xs">
                      View Answers
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card border shadow-2xl rounded-2xl animate-card-entrance overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-bold">Submission Answers: {selectedRecord.respondent_name}</CardTitle>
              <CardDescription className="text-xs">
                {selectedRecord.form_title} • Score: {selectedRecord.score_percentage}%
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {(selectedRecord.answers || []).map((ans, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg border text-xs space-y-1">
                  <div className="font-semibold text-foreground">
                    Q{idx + 1}: {ans.question}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-muted-foreground">Candidate Answer:</span>
                    <span className="font-medium text-foreground">{ans.answer || '(None)'}</span>
                  </div>
                  {ans.correct && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Expected Answer:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{ans.correct}</span>
                    </div>
                  )}
                  <div className="pt-1 flex justify-end">
                    <Badge variant={ans.isCorrect ? 'default' : 'destructive'} className="text-[9px]">
                      {ans.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-3 border-t bg-muted/10 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)} className="text-xs">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

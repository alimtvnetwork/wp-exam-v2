import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SubmissionRecord {
  id: number;
  form_title: string;
  form_type: string;
  respondent_name: string;
  respondent_email: string;
  score: number;
  total_score: number;
  score_percentage: number;
  is_passed: boolean;
  submitted_at: string;
  answers: Array<{
    question: string;
    answer: string;
    correct: string;
    isCorrect: boolean;
  }>;
}

const mockSubmissions: SubmissionRecord[] = [
  {
    id: 101,
    form_title: 'JavaScript & React Developer Assessment',
    form_type: 'quiz',
    respondent_name: 'David Miller',
    respondent_email: 'david.miller@candidate.io',
    score: 90,
    total_score: 100,
    score_percentage: 90,
    is_passed: true,
    submitted_at: '2026-09-18 11:20',
    answers: [
      { question: 'What does HTML stand for?', answer: 'HyperText Markup Language', correct: 'HyperText Markup Language', isCorrect: true },
      { question: 'CSS is used for structuring webpage content.', answer: 'False', correct: 'False', isCorrect: true },
    ],
  },
  {
    id: 102,
    form_title: 'Engineering Onboarding Sign-Up',
    form_type: 'employee_signup',
    respondent_name: 'Elena Rostova',
    respondent_email: 'elena.rostova@company.org',
    score: 100,
    total_score: 100,
    score_percentage: 100,
    is_passed: true,
    submitted_at: '2026-09-17 16:45',
    answers: [
      { question: 'Full Legal Name', answer: 'Elena Rostova', correct: '', isCorrect: true },
      { question: 'Company Email', answer: 'elena.rostova@company.org', correct: '', isCorrect: true },
    ],
  },
  {
    id: 103,
    form_title: 'WordPress Core Architecture Exam',
    form_type: 'quiz',
    respondent_name: 'Marcus Vance',
    respondent_email: 'marcus.v@dev.net',
    score: 55,
    total_score: 100,
    score_percentage: 55,
    is_passed: false,
    submitted_at: '2026-09-16 09:12',
    answers: [
      { question: 'What does HTML stand for?', answer: 'Hyperlink Text Module', correct: 'HyperText Markup Language', isCorrect: false },
    ],
  },
];

export const HistoryManager: React.FC = () => {
  const [submissions] = useState<SubmissionRecord[]>(mockSubmissions);
  const [selectedRecord, setSelectedRecord] = useState<SubmissionRecord | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-card-entrance">
      <Card className="modern-quiz-card border shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold">Quiz & Form Completion History</CardTitle>
              <CardDescription className="text-xs">
                Review candidate submissions, auto-calculated scores, pass/fail thresholds, and answer breakdowns.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs self-start sm:self-auto">
              {submissions.length} Total Submissions
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="border rounded-xl overflow-hidden divide-y bg-background">
            {submissions.map((sub) => (
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
              {selectedRecord.answers.map((ans, i) => (
                <div key={i} className="p-3 border rounded-lg bg-muted/20 space-y-1 text-xs">
                  <div className="font-semibold text-foreground">{ans.question}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Answer:</span>
                    <span className={`font-medium ${ans.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {ans.answer}
                    </span>
                  </div>
                  {ans.correct && !ans.isCorrect && (
                    <div className="text-muted-foreground">
                      Expected: <span className="text-foreground font-medium">{ans.correct}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <div className="p-3 border-t bg-muted/10 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

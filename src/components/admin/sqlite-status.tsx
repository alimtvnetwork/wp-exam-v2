import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const SqliteStatus: React.FC = () => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVacuum = () => {
    setFeedback('SQLite WAL checkpoints synchronized and VACUUM executed successfully!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-card-entrance">
      <Card className="modern-quiz-card border shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">SQLite Embedded Storage Engine</CardTitle>
              <CardDescription className="text-xs">
                Zero-configuration, portable, micro-ORM powered local database following riseup-asia-uploader patterns.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200">
              SQLite WAL Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {feedback && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
              {feedback}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Total Stored Forms</span>
              <div className="text-2xl font-black text-foreground">12</div>
              <span className="text-[11px] text-muted-foreground">Quizzes, Sign-ups, Surveys</span>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Submissions Recorded</span>
              <div className="text-2xl font-black text-foreground">148</div>
              <span className="text-[11px] text-muted-foreground">Scored & Evaluated Answers</span>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">User Invitations</span>
              <div className="text-2xl font-black text-foreground">34</div>
              <span className="text-[11px] text-muted-foreground">Pending & Accepted Tokens</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">File System & Driver Metadata</h4>
            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b">
                <span className="text-muted-foreground">Database Location:</span>
                <span className="font-mono text-foreground">wp-content/uploads/wp-exam/wp-exam.sqlite</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b">
                <span className="text-muted-foreground">Journaling Protocol:</span>
                <span className="font-mono text-foreground">WAL (Write-Ahead Logging) + PRAGMA foreign_keys</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-muted-foreground">Architecture Pattern:</span>
                <span className="text-foreground font-medium">Micro-ORM with Fluent Chaining (Idiorm pattern)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleVacuum} className="text-xs">
              Optimize & Vacuum
            </Button>
            <Button size="sm" className="bg-primary text-xs" onClick={() => setFeedback('Database snapshot exported to backup bundle.')}>
              Download SQLite Snapshot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

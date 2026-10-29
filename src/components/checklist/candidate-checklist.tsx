import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock3, Play, Inbox } from 'lucide-react';
import { unifiedFetch } from '@/utils/api-client';

interface ChecklistItem {
  id: number;
  title: string;
  kind: 'quiz' | 'exam' | 'project';
  status: 'pending' | 'in_progress' | 'completed';
  due_at: string;
  invite_url: string;
}

interface EnvelopeResults {
  items?: ChecklistItem[];
  checklist_url?: string;
}

const KIND_LABELS: Record<ChecklistItem['kind'], string> = {
  quiz: 'Quiz',
  exam: 'Exam',
  project: 'Project',
};

function formatDueDate(dueAt: string): string {
  if (!dueAt) {
    return '';
  }

  const parsed = new Date(dueAt.replace(' ', 'T'));

  if (Number.isNaN(parsed.getTime())) {
    return dueAt;
  }

  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Candidate checklist dashboard — token-scoped, no login.
 * Route: /checklist/:token (registered in src/App.tsx by the lead).
 */
export const CandidateChecklist: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsNotFound(true);

      return;
    }

    let isCancelled = false;

    unifiedFetch(
      `/api/v1/checklist/${encodeURIComponent(token)}`,
      `/wp-json/wp-exam/v1/checklist/${encodeURIComponent(token)}`
    )
      .then((response) => {
        if (response.status === 404) {
          throw new Error('not-found');
        }

        if (!response.ok) {
          throw new Error('request-failed');
        }

        return response.json();
      })
      .then((envelope: { Results?: EnvelopeResults; data?: EnvelopeResults }) => {
        if (isCancelled) {
          return;
        }

        const checklistItems = envelope?.Results?.items ?? envelope?.data?.items ?? [];
        setItems(checklistItems);
        setIsLoading(false);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setIsNotFound(true);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading your checklist…</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-3 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Inbox className="w-8 h-8 text-muted-foreground mx-auto" />

          <h1 className="text-lg font-bold font-heading text-foreground">Checklist not found</h1>

          <p className="text-sm text-muted-foreground">
            This checklist link is invalid or has expired. Please ask your administrator for a new
            invitation.
          </p>
        </div>
      </div>
    );
  }

  const pendingItems = items.filter((item) => item.status !== 'completed');
  const completedItems = items.filter((item) => item.status === 'completed');
  const completedCount = completedItems.length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading">My checklist</h1>

          <p className="text-sm text-muted-foreground">
            {totalCount === 0
              ? 'Your assigned quizzes, exams, and projects will appear here.'
              : `${completedCount} of ${totalCount} complete`}
          </p>

          {totalCount > 0 && (
            <div
              className="h-0.5 w-full rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Checklist progress"
            >
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-300 ease-state"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {totalCount === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
            <Inbox className="w-8 h-8 text-muted-foreground mx-auto" />

            <p className="text-sm font-semibold text-foreground">Nothing assigned yet on this invite link</p>

            <p className="text-sm text-muted-foreground">
              If your administrator assigned an onboarding task or technical assessment, access your personalized assignments hub in the candidate portal.
            </p>

            {token && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  window.location.href = `/portal/${token}`;
                }}
                className="mt-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Go to Candidate Portal & Assignments
              </Button>
            )}
          </div>
        )}

        {pendingItems.length > 0 && (
          <section aria-label="To do" className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              To do ({pendingItems.length})
            </h2>

            <div className="space-y-2">
              {pendingItems.map((item, rowIndex) => (
                <ChecklistRow key={item.id} item={item} rowIndex={rowIndex} />
              ))}
            </div>
          </section>
        )}

        {completedItems.length > 0 && (
          <section aria-label="Done" className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Done ({completedItems.length})
            </h2>

            <div className="space-y-2">
              {completedItems.map((item, rowIndex) => (
                <ChecklistRow key={item.id} item={item} rowIndex={rowIndex} />
              ))}
            </div>
          </section>
        )}

        {totalCount > 0 && completedCount === totalCount && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />

            <p className="text-sm font-bold text-foreground">All done</p>

            <p className="text-sm text-muted-foreground">
              You have completed everything on your checklist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChecklistRow: React.FC<{ item: ChecklistItem; rowIndex: number }> = ({ item, rowIndex }) => {
  const isCompleted = item.status === 'completed';
  const dueLabel = formatDueDate(item.due_at);

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs animate-ppt-slide-forward"
      style={{ animationDelay: `${Math.min(rowIndex, 8) * 70}ms` }}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold truncate ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {item.title}
          </span>

          <Badge variant="outline" className="text-xs uppercase font-mono shrink-0">
            {KIND_LABELS[item.kind] ?? item.kind}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" />
              {dueLabel ? `Due ${dueLabel}` : 'No due date'}
            </span>
          )}
        </div>
      </div>

      {!isCompleted && (
        <Button
          size="sm"
          className="gap-1.5 text-xs font-semibold shrink-0"
          onClick={() => {
            window.location.href = item.invite_url;
          }}
        >
          <Play className="w-3.5 h-3.5" />
          {item.status === 'in_progress' ? 'Resume' : 'Start'}
        </Button>
      )}
    </div>
  );
};

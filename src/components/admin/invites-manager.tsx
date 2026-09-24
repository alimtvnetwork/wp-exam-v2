import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { useExamAppStore } from '@/quiz/store/exam-store';

interface InvitesManagerProps {
  onNavigateToRunner?: () => void;
}

export const InvitesManager: React.FC<InvitesManagerProps> = ({ onNavigateToRunner }) => {
  const store = useQuizStore();
  const examStore = useExamAppStore();
  const invites = examStore.invites;

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('subscriber');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const token = Math.random().toString(36).substring(2, 14);

    const newInvite = examStore.addInvite({
      email: email.trim(),
      role,
      invite_token: token,
      status: 'pending',
    });

    setEmail('');
    setFeedback(`Invitation dispatched to ${newInvite.email} for form: "${store.title}"! Automated invite token generated.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRevoke = (id: number) => {
    examStore.revokeInvite(id);
    setFeedback('Invitation token revoked.');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/runner?invite=${token}`;
    navigator.clipboard.writeText(link);
    setFeedback(`Copied direct invite link: ${link}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTestInRunner = (token: string) => {
    examStore.authenticateWithToken(token);
    if (onNavigateToRunner) {
      onNavigateToRunner();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-card-entrance">
      <Card className="modern-quiz-card border shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-xl font-bold">User Invitations & Role Assignments</CardTitle>
          <CardDescription className="text-xs">
            Invite candidates, employees, or participants to log in and take specific quizzes with automated access tokens.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {feedback && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
              {feedback}
            </div>
          )}

          {/* Invitation Form */}
          <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-xl border">
            <div className="sm:col-span-6 space-y-1.5">
              <Label className="text-xs font-semibold">Respondent Email</Label>
              <Input
                type="email"
                placeholder="e.g. employee@company.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm bg-background"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 p-2 border rounded-md text-sm bg-background font-medium"
              >
                <option value="subscriber">Subscriber (Respondent)</option>
                <option value="contributor">Contributor</option>
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <Button type="submit" className="w-full bg-primary font-semibold">
                Send Invitation
              </Button>
            </div>
          </form>

          {/* Active Invitations List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Active Invitations ({invites.length})</h3>
              <span className="text-xs text-muted-foreground">Tokens expire in 7 days</span>
            </div>

            <div className="border rounded-xl overflow-hidden divide-y bg-background">
              {invites.map((inv) => (
                <div key={inv.id} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{inv.email}</span>
                      <Badge
                        variant={inv.status === 'completed' ? 'default' : 'secondary'}
                        className={`text-[10px] uppercase font-semibold ${
                          inv.status === 'completed' ? 'bg-emerald-600' : ''
                        }`}
                      >
                        {inv.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {inv.role}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Token: <span className="font-mono text-primary font-medium">{inv.invite_token}</span> • Created: {inv.created_at}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {onNavigateToRunner && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTestInRunner(inv.invite_token)}
                        className="text-xs h-8"
                      >
                        🚀 Test in Runner
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(inv.invite_token)}
                      className="text-xs h-8"
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(inv.id)}
                      className="text-xs h-8 text-destructive hover:text-destructive"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

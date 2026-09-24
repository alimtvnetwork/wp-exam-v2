import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <Card className="border border-border/80 shadow-2xl rounded-2xl bg-card text-card-foreground backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/10 p-6">
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
          <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end p-5 bg-background/50 rounded-xl border border-border/60 shadow-inner">
            <div className="sm:col-span-6 space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Respondent Email</Label>
              <Input
                type="email"
                placeholder="e.g. employee@company.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm bg-background border-border"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Assigned Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full h-10 border border-border bg-background text-foreground text-xs font-medium rounded-lg">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border shadow-xl">
                  <SelectItem value="subscriber" className="text-xs">Subscriber (Respondent)</SelectItem>
                  <SelectItem value="contributor" className="text-xs">Contributor</SelectItem>
                  <SelectItem value="author" className="text-xs">Author</SelectItem>
                  <SelectItem value="editor" className="text-xs">Editor</SelectItem>
                  <SelectItem value="administrator" className="text-xs">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-md rounded-lg transition-transform active:scale-[0.98]">
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

            <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40 bg-card/60 shadow-sm">
              {invites.map((inv) => (
                <div key={inv.id} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm hover:bg-muted/10 transition-colors">
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

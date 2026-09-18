import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const EmailSettings: React.FC = () => {
  const [isSmtpEnabled, setIsSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('postmaster@exam.company.org');
  const [smtpPass, setSmtpPass] = useState('••••••••••••');
  const [smtpSecure, setSmtpSecure] = useState('tls');
  const [fromEmail, setFromEmail] = useState('notifications@company.org');
  const [fromName, setFromName] = useState('WP Exam Verification Team');

  const [inviteSubject, setInviteSubject] = useState('Invitation: Complete your evaluation on {quiz_title}');
  const [inviteBody, setInviteBody] = useState(
    "Hello {user_name},\n\nYou have been invited to complete: {quiz_title}.\nPlease click the secure link below to start:\n{invite_url}\n\nBest regards,\nWP Exam Team"
  );

  const [completionSubject, setCompletionSubject] = useState('Results: {quiz_title} - {score_percent}% ({status})');
  const [completionBody, setCompletionBody] = useState(
    "Hello {user_name},\n\nYour submission for {quiz_title} has been evaluated.\n\nFinal Score: {score_percent}%\nResult Status: {status}\n\nThank you for participating!"
  );

  const [testEmail, setTestEmail] = useState('admin@company.org');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Cadence & Recipient Chain Routing
  const [dispatchCadence, setDispatchCadence] = useState<'per_section' | 'end_of_day' | 'end_of_week'>('per_section');
  const [isEmailCandidate, setIsEmailCandidate] = useState<boolean>(true);
  const [isEmailOwner, setIsEmailOwner] = useState<boolean>(true);
  const [isEmailRoles, setIsEmailRoles] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<string>('administrator');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Email gateway, dispatch cadence, and recipient chain saved successfully!');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSendTest = async () => {
    setIsTesting(true);
    setFeedback('Dispatching test verification email...');
    setTimeout(() => {
      setIsTesting(false);
      setFeedback(`Test email sent successfully to ${testEmail}!`);
      setTimeout(() => setFeedback(null), 4000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-card-entrance">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Gateway Configuration */}
        <Card className="modern-quiz-card border shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Email Gateway & Dispatch Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Configure outbound mail transport for invitations, reminders, and quiz completion certificates.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="smtp-toggle" className="text-xs font-semibold cursor-pointer">
                  Custom SMTP
                </Label>
                <Switch
                  id="smtp-toggle"
                  checked={isSmtpEnabled}
                  onCheckedChange={setIsSmtpEnabled}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {feedback && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
                {feedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sender Display Name</Label>
                <Input
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="text-sm bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">From Email Address</Label>
                <Input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="text-sm bg-background"
                />
              </div>
            </div>

            {isSmtpEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">SMTP Host</Label>
                  <Input
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="text-sm bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">SMTP Port</Label>
                  <Input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="text-sm bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Encryption</Label>
                  <select
                    value={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.value)}
                    className="w-full h-10 p-2 border rounded-md text-sm bg-background"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">SMTP Username</Label>
                  <Input
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="text-sm bg-background"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">SMTP Password</Label>
                  <Input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="text-sm bg-background"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Dispatch Cadence & Recipient Chain */}
        <Card className="modern-quiz-card border shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-xl font-bold">Email Dispatch Cadence & Recipient Chain</CardTitle>
            <CardDescription className="text-xs">
              Determine when results are emailed (per section, end of day, end of week) and who receives the notifications.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                1. Delivery Frequency Cadence
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDispatchCadence('per_section')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    dispatchCadence === 'per_section'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-muted hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm block">⚡ Immediate / Per Section</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Dispatched immediately when each section or quiz is completed.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchCadence('end_of_day')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    dispatchCadence === 'end_of_day'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-muted hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm block">📅 End of Day Digest</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Batches all daily completions into a single evening digest email.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchCadence('end_of_week')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    dispatchCadence === 'end_of_week'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-muted hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm block">📊 End of Week Summary</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Aggregates weekly curriculum progress and sends every Friday.
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                2. Notification Recipient Chain
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <div>
                    <span className="text-sm font-semibold block">Email Candidate</span>
                    <span className="text-xs text-muted-foreground block">
                      Send score certificate and completion status to the candidate.
                    </span>
                  </div>
                  <Switch checked={isEmailCandidate} onCheckedChange={setIsEmailCandidate} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <div>
                    <span className="text-sm font-semibold block">Email Project Owner</span>
                    <span className="text-xs text-muted-foreground block">
                      Alert the creator/instructor of the project when candidates complete tasks.
                    </span>
                  </div>
                  <Switch checked={isEmailOwner} onCheckedChange={setIsEmailOwner} />
                </div>

                <div className="p-3 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold block">Email Specific Roles</span>
                      <span className="text-xs text-muted-foreground block">
                        Relay notification copies to all users with a designated WordPress role.
                      </span>
                    </div>
                    <Switch checked={isEmailRoles} onCheckedChange={setIsEmailRoles} />
                  </div>

                  {isEmailRoles && (
                    <div className="pt-2 border-t flex items-center gap-3">
                      <Label className="text-xs font-semibold">Target WordPress Role:</Label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border bg-background"
                      >
                        <option value="administrator">Administrator</option>
                        <option value="editor">Editor</option>
                        <option value="instructor">Instructor / Evaluator</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card className="modern-quiz-card border shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-xl font-bold">Automated Notification Templates</CardTitle>
            <CardDescription className="text-xs">
              Customize email notifications with placeholders: <code className="bg-muted px-1 rounded">{"{quiz_title}"}</code>, <code className="bg-muted px-1 rounded">{"{user_name}"}</code>, <code className="bg-muted px-1 rounded">{"{score_percent}"}</code>, <code className="bg-muted px-1 rounded">{"{invite_url}"}</code>, <code className="bg-muted px-1 rounded">{"{status}"}</code>.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Invite Template */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">1. User Invitation Email</h4>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Subject Line</Label>
                <Input
                  value={inviteSubject}
                  onChange={(e) => setInviteSubject(e.target.value)}
                  className="text-sm bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Email Body</Label>
                <Textarea
                  value={inviteBody}
                  onChange={(e) => setInviteBody(e.target.value)}
                  rows={4}
                  className="text-sm bg-background font-mono"
                />
              </div>
            </div>

            {/* Completion Template */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-bold text-foreground">2. Quiz / Form Completion Certificate Email</h4>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Subject Line</Label>
                <Input
                  value={completionSubject}
                  onChange={(e) => setCompletionSubject(e.target.value)}
                  className="text-sm bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Email Body</Label>
                <Textarea
                  value={completionBody}
                  onChange={(e) => setCompletionBody(e.target.value)}
                  rows={4}
                  className="text-sm bg-background font-mono"
                />
              </div>
            </div>

            {/* Test Email Section */}
            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-muted/20 rounded-xl">
              <div className="flex-1 w-full space-y-1">
                <Label className="text-xs font-semibold">Send Verification Test Email</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="text-sm bg-background"
                  placeholder="admin@company.org"
                />
              </div>
              <div className="self-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendTest}
                  disabled={isTesting}
                  className="text-xs h-10 px-4"
                >
                  {isTesting ? 'Sending...' : 'Dispatch Test'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary font-semibold">
                Save All Email Configurations
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

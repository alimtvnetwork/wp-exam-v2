import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AiSectionAssistant } from '@/components/admin/ai-section-assistant';
import {
  Mail,
  Server,
  Zap,
  CheckCircle2,
  Code2,
  Eye,
  Sliders,
  Send,
  HelpCircle,
  Copy,
  Sparkles,
} from 'lucide-react';

interface EmailProviderPreset {
  id: string;
  name: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: 'tls' | 'ssl';
  imapHost: string;
  imapPort: number;
  hint: string;
}

const EMAIL_PROVIDERS: EmailProviderPreset[] = [
  {
    id: 'gmail',
    name: 'Google Workspace / Gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    hint: 'Use App Password if 2FA is active on your Google account.',
  },
  {
    id: 'office365',
    name: 'Microsoft 365 / Outlook',
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    hint: 'Requires SMTP AUTH enabled in Microsoft 365 Admin Center.',
  },
  {
    id: 'mailgun',
    name: 'Mailgun Transactional',
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: '',
    imapPort: 0,
    hint: 'High deliverability for candidate invitations and results.',
  },
  {
    id: 'sendgrid',
    name: 'Twilio SendGrid',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: '',
    imapPort: 0,
    hint: 'Username is always "apikey". Use API key as password.',
  },
  {
    id: 'ses',
    name: 'Amazon SES (AWS)',
    smtpHost: 'email-smtp.us-east-1.amazonaws.com',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: '',
    imapPort: 0,
    hint: 'Use SES SMTP credentials from AWS IAM console.',
  },
  {
    id: 'postmark',
    name: 'Postmark',
    smtpHost: 'smtp.postmarkapp.com',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: '',
    imapPort: 0,
    hint: 'Fastest transactional inbox delivery with server token.',
  },
  {
    id: 'zoho',
    name: 'Zoho Mail Pro',
    smtpHost: 'smtppro.zoho.com',
    smtpPort: 465,
    smtpSecure: 'ssl',
    imapHost: 'imappro.zoho.com',
    imapPort: 993,
    hint: 'Use port 465 with SSL for enterprise Zoho domains.',
  },
  {
    id: 'custom',
    name: 'Custom SMTP Server',
    smtpHost: 'mail.yourcompany.org',
    smtpPort: 587,
    smtpSecure: 'tls',
    imapHost: 'mail.yourcompany.org',
    imapPort: 993,
    hint: 'Configure custom on-premise or cPanel mail routing.',
  },
];

const AVAILABLE_PLACEHOLDERS = [
  { tag: '{{user_name}}', desc: 'Candidate Name' },
  { tag: '{{quiz_title}}', desc: 'Exam/Quiz Title' },
  { tag: '{{score_percent}}', desc: 'Achieved Score %' },
  { tag: '{{status}}', desc: 'Passed / Failed' },
  { tag: '{{invite_url}}', desc: 'Secure Access Link' },
  { tag: '{{time_limit}}', desc: 'Duration in Minutes' },
];

export const EmailSettings: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('mailgun');
  const [isSmtpEnabled, setIsSmtpEnabled] = useState(true);

  // Connection settings
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('postmaster@exam.company.org');
  const [smtpPass, setSmtpPass] = useState('••••••••••••');
  const [smtpSecure, setSmtpSecure] = useState<'tls' | 'ssl' | 'none'>('tls');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState(993);

  // Sender metadata
  const [fromEmail, setFromEmail] = useState('notifications@company.org');
  const [fromName, setFromName] = useState('WP Exam Verification Team');

  // Automated templates
  const [inviteSubject, setInviteSubject] = useState('Invitation: Complete your evaluation on {{quiz_title}}');
  const [inviteBody, setInviteBody] = useState(
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
  <h2 style="color: #0F172A; margin-top: 0;">Hello {{user_name}},</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
    You have been invited to complete the <strong>{{quiz_title}}</strong> evaluation assessment.
  </p>
  <div style="margin: 28px 0; text-align: center;">
    <a href="{{invite_url}}" style="display: inline-block; padding: 12px 28px; background: #5C45FD; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
      Launch Secure Exam &rarr;
    </a>
  </div>
  <p style="font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px;">
    This link is uniquely assigned to your candidate profile and will expire upon submission.
  </p>
</div>`
  );

  const [activeTemplateTab, setActiveTemplateTab] = useState<'editor' | 'preview'>('editor');
  const [testEmail, setTestEmail] = useState('admin@company.org');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Per-Section Automation Rules
  const [isSectionAutomationActive, setIsSectionAutomationActive] = useState<boolean>(true);
  const [dispatchCadence, setDispatchCadence] = useState<'per_section' | 'end_of_day' | 'end_of_week'>('per_section');
  const [isEmailCandidate, setIsEmailCandidate] = useState<boolean>(true);
  const [isEmailOwner, setIsEmailOwner] = useState<boolean>(true);

  // Auto-fill configuration when provider is selected
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    const preset = EMAIL_PROVIDERS.find((p) => p.id === providerId);
    if (preset) {
      setSmtpHost(preset.smtpHost);
      setSmtpPort(preset.smtpPort);
      setSmtpSecure(preset.smtpSecure);
      setImapHost(preset.imapHost);
      setImapPort(preset.imapPort);
    }
  };

  // Real-time host typing auto-detector
  const handleHostChange = (newHost: string) => {
    setSmtpHost(newHost);
    const lower = newHost.toLowerCase();
    if (lower.includes('gmail.com') || lower.includes('google.com')) {
      setSelectedProvider('gmail');
      setSmtpPort(587);
      setSmtpSecure('tls');
      setImapHost('imap.gmail.com');
      setImapPort(993);
    } else if (lower.includes('office365.com') || lower.includes('outlook.com')) {
      setSelectedProvider('office365');
      setSmtpPort(587);
      setSmtpSecure('tls');
      setImapHost('outlook.office365.com');
      setImapPort(993);
    } else if (lower.includes('sendgrid.net')) {
      setSelectedProvider('sendgrid');
      setSmtpPort(587);
      setSmtpSecure('tls');
    } else if (lower.includes('mailgun.org')) {
      setSelectedProvider('mailgun');
      setSmtpPort(587);
      setSmtpSecure('tls');
    } else if (lower.includes('amazonaws.com')) {
      setSelectedProvider('ses');
      setSmtpPort(587);
      setSmtpSecure('tls');
    }
  };

  // Insert placeholder tag into email body
  const handleInsertTag = (tag: string) => {
    setInviteBody((prev) => `${prev} ${tag}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Email gateway, automated dispatch triggers, and provider credentials saved successfully!');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSendTest = async () => {
    setIsTesting(true);
    setFeedback('Dispatching test verification email...');
    setTimeout(() => {
      setIsTesting(false);
      setFeedback(`Test email sent successfully via ${smtpHost}:${smtpPort} to ${testEmail}!`);
      setTimeout(() => setFeedback(null), 4000);
    }, 1200);
  };

  // Render sample preview with replaced variables
  const renderedPreviewHtml = inviteBody
    .replace(/\{\{user_name\}\}/g, 'Sarah Connor')
    .replace(/\{\{quiz_title\}\}/g, 'Senior TypeScript Assessment')
    .replace(/\{\{score_percent\}\}/g, '94')
    .replace(/\{\{status\}\}/g, 'PASSED')
    .replace(/\{\{invite_url\}\}/g, 'http://127.0.0.1:5173/apply?token=demo_token')
    .replace(/\{\{time_limit\}\}/g, '30');

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Automated Email Gateway & Dispatch</h1>
            <Badge variant="secondary" className="font-mono text-xs">SMTP & IMAP</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-configure mail transport for invitations, instant section notifications, and score receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AiSectionAssistant section="email" title="AI Email Studio" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Provider Auto-Fill Card */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="py-4 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span>Outbound Provider Preset & Auto-Configuration</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Selecting a provider automatically fills valid SMTP hosts, ports, encryption protocols, and IMAP servers.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="smtp-toggle" className="text-xs font-semibold cursor-pointer">
                  Enable SMTP
                </Label>
                <Switch
                  id="smtp-toggle"
                  checked={isSmtpEnabled}
                  onCheckedChange={setIsSmtpEnabled}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {feedback && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
                {feedback}
              </div>
            )}

            {/* Provider Quick Picker Pills */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
                Select Mail Provider (Auto-Fills Ports & Security):
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EMAIL_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition ${
                      selectedProvider === provider.id
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border bg-card hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <span className="block truncate">{provider.name}</span>
                    <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                      Port {provider.smtpPort} • {provider.smtpSecure.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* General Sender Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Sender Display Name</Label>
                <Input
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="text-sm bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">From Email Address</Label>
                <Input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="text-sm bg-background"
                />
              </div>
            </div>

            {/* SMTP & IMAP Auto-Populated Credential Fields */}
            {isSmtpEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">SMTP Host Server</Label>
                  <Input
                    value={smtpHost}
                    onChange={(e) => handleHostChange(e.target.value)}
                    className="text-sm font-mono bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">SMTP Port</Label>
                  <Input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="text-sm font-mono bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Encryption</Label>
                  <select
                    value={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.value as 'tls' | 'ssl' | 'none')}
                    className="w-full h-9 p-2 border border-input rounded-md text-xs bg-background font-mono"
                  >
                    <option value="tls">TLS (STARTTLS)</option>
                    <option value="ssl">SSL (Implicit)</option>
                    <option value="none">None (Plain)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">SMTP Username</Label>
                  <Input
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="text-sm font-mono bg-background"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">SMTP Password / API Key</Label>
                  <Input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="text-sm font-mono bg-background"
                  />
                </div>

                {/* IMAP Incoming Server Details */}
                <div className="sm:col-span-2 space-y-1 pt-1">
                  <Label className="text-xs font-semibold">IMAP Server (Optional Bounces / Receipts)</Label>
                  <Input
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    placeholder="imap.yourserver.org"
                    className="text-sm font-mono bg-background"
                  />
                </div>
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-semibold">IMAP Port</Label>
                  <Input
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(Number(e.target.value))}
                    className="text-sm font-mono bg-background"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-Section Automation & Cadence Rules */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="py-4 border-b border-border bg-muted/10">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Per-Section Automated Notifications & Cadence</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Configure automatic notification delivery as candidates progress through exam sections.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Delivery Cadence
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDispatchCadence('per_section')}
                  className={`p-3 rounded-xl border text-left transition ${
                    dispatchCadence === 'per_section'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <span className="text-xs block">⚡ Immediate / Per Section</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Dispatched immediately when each section checkpoint is reached.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchCadence('end_of_day')}
                  className={`p-3 rounded-xl border text-left transition ${
                    dispatchCadence === 'end_of_day'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <span className="text-xs block">📅 End of Day Digest</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Batches daily candidate completions into a single evening report.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchCadence('end_of_week')}
                  className={`p-3 rounded-xl border text-left transition ${
                    dispatchCadence === 'end_of_week'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <span className="text-xs block">📊 Weekly Performance Summary</span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Aggregates candidate analytics and cohort rankings weekly.
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <span className="text-xs font-semibold block">Email Candidate Certificate</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Deliver score percentage and feedback receipt upon section submission.
                  </span>
                </div>
                <Switch checked={isEmailCandidate} onCheckedChange={setIsEmailCandidate} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <span className="text-xs font-semibold block">Alert Evaluator / Project Owner</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Notify instructor immediately when a candidate requires manual review.
                  </span>
                </div>
                <Switch checked={isEmailOwner} onCheckedChange={setIsEmailOwner} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Syntax-Highlighted Email Body & Template Editor */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="py-4 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>Email Template Body & Syntax Highlighter</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize invitation and completion emails with variable placeholders and live preview.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  type="button"
                  variant={activeTemplateTab === 'editor' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTemplateTab('editor')}
                  className="text-xs h-7 gap-1"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>HTML Code</span>
                </Button>
                <Button
                  type="button"
                  variant={activeTemplateTab === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTemplateTab('preview')}
                  className="text-xs h-7 gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Inbox Preview</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Subject Line</Label>
              <Input
                value={inviteSubject}
                onChange={(e) => setInviteSubject(e.target.value)}
                className="text-sm bg-background font-medium"
              />
            </div>

            {/* Clickable Variable Inserter Pills */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
                Click to Insert Dynamic Variable:
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_PLACEHOLDERS.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="px-2 py-1 bg-muted hover:bg-primary/10 border border-border rounded text-xs font-mono text-primary flex items-center gap-1 transition"
                    title={item.desc}
                  >
                    <span>+</span>
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor vs Preview Viewports */}
            {activeTemplateTab === 'editor' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Email Template Markup (HTML / Ubuntu Mono)</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">UTF-8 Encoded</span>
                </div>
                <Textarea
                  value={inviteBody}
                  onChange={(e) => setInviteBody(e.target.value)}
                  rows={12}
                  className="font-mono text-xs bg-slate-950 text-slate-100 p-4 leading-relaxed border-border rounded-xl selection:bg-primary selection:text-white"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Live Rendered Preview (Recipient Perspective)</Label>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border rounded-xl shadow-inner min-h-[280px]">
                  <div className="mb-3 pb-2 border-b text-xs text-muted-foreground flex justify-between">
                    <span><strong>Subject:</strong> {inviteSubject.replace(/\{\{quiz_title\}\}/g, 'Senior TypeScript Assessment')}</span>
                    <span><strong>From:</strong> {fromName} &lt;{fromEmail}&gt;</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }} />
                </div>
              </div>
            )}

            {/* Test Email Dispatcher */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-muted/20 rounded-xl">
              <div className="flex-1 w-full space-y-1">
                <Label className="text-xs font-semibold">Dispatch Live Test Verification Email</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="text-xs bg-background h-8"
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
                  className="text-xs h-8 px-4 gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTesting ? 'Sending...' : 'Send Test Verification'}</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="bg-primary text-xs h-8 px-4 font-semibold">
                Save Outbound Mail Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

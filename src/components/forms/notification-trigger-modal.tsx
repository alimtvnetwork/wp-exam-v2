import React, { useState, useMemo } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Palette,
  Plus,
  Trash2,
  Check,
  Eye,
  Settings2,
  Copy,
  Sparkles,
  Smartphone,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  NotificationTrigger,
  NotificationChannel,
  NotificationTriggerEvent,
} from '@/lib/types/form';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_MOCK_APPLICANT_DATA,
  interpolateEmailTemplate,
} from '@/lib/templates/email-template';

interface NotificationTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Emerald Choice', hex: '#16a34a' },
  { name: 'Deep Navy', hex: '#0b1220' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Modern Purple', hex: '#7c3aed' },
  { name: 'Sunset Amber', hex: '#ea580c' },
  { name: 'Crimson Rose', hex: '#e11d48' },
];

export const NotificationTriggerModal: React.FC<NotificationTriggerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const store = useQuizStore();
  const formSettings = store.settings || {};
  const currentTriggers = formSettings.notificationTriggers || [];

  const [triggers, setTriggers] = useState<NotificationTrigger[]>(() => {
    if (currentTriggers.length > 0) {
      return currentTriggers;
    }
    // Default initial email trigger
    return [
      {
        id: 'trigger-email-1',
        channel: 'email',
        event: 'on_form_submit',
        to: '{{candidate_email}}',
        fromName: 'WP Exam Admissions',
        fromEmail: 'notifications@example.org',
        replyTo: 'careers@example.org',
        subject: 'Submission Received: {{form_title}} - {{candidate_name}}',
        colorPalette: '#16a34a',
      },
    ];
  });

  const [selectedTriggerId, setSelectedTriggerId] = useState<string>(
    triggers[0]?.id || 'trigger-email-1'
  );
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');

  // Preview mock applicant overrides
  const [mockCandidate, setMockCandidate] = useState({
    name: 'Alex Morgan',
    position: 'Senior Full Stack Developer',
    email: 'alex.morgan@example.org',
    salary: '$6,500 / month',
    score: 85,
  });

  if (!isOpen) {
    return null;
  }

  const activeTrigger =
    triggers.find((t) => t.id === selectedTriggerId) || triggers[0];

  const handleUpdateActiveTrigger = (patch: Partial<NotificationTrigger>) => {
    if (!activeTrigger) {
      return;
    }
    const updated = triggers.map((t) =>
      t.id === activeTrigger.id ? { ...t, ...patch } : t
    );
    setTriggers(updated);
  };

  const handleAddTrigger = (channel: NotificationChannel) => {
    const newId = `trigger-${channel}-${Date.now()}`;
    const newTrigger: NotificationTrigger = {
      id: newId,
      channel,
      event: 'on_form_submit',
      to: channel === 'email' ? '{{candidate_email}}' : '+15550192834',
      fromName: 'WP Exam Admissions',
      fromEmail: 'notifications@example.org',
      subject: `New Notification: {{form_title}}`,
      colorPalette: '#16a34a',
    };
    const nextList = [...triggers, newTrigger];
    setTriggers(nextList);
    setSelectedTriggerId(newId);
    toast.success(`Added new ${channel.toUpperCase()} notification trigger.`);
  };

  const handleDeleteTrigger = (id: string) => {
    const filtered = triggers.filter((t) => t.id !== id);
    setTriggers(filtered);
    if (selectedTriggerId === id && filtered.length > 0) {
      setSelectedTriggerId(filtered[0].id);
    }
    toast.info('Trigger removed.');
  };

  const handleSave = () => {
    store.updateSettings({ notificationTriggers: triggers });
    toast.success('Notification triggers saved successfully!');
    onClose();
  };

  const handleSendTestNotification = () => {
    if (!activeTrigger) {
      return;
    }
    const channelName = activeTrigger.channel.toUpperCase();
    const dest = activeTrigger.to;
    toast.success(`[Test Dispatch] ${channelName} notification queued for ${dest}`);
  };

  // Compute rendered HTML for live preview dock
  const previewHtml = useMemo(() => {
    const template = activeTrigger?.templateHtml || DEFAULT_EMAIL_TEMPLATE;
    const vars: Record<string, string | number> = {
      ...DEFAULT_MOCK_APPLICANT_DATA,
      form_title: store.title || 'Candidate Evaluation Assessment',
      candidate_name: mockCandidate.name,
      job_position: mockCandidate.position,
      candidate_email: mockCandidate.email,
      asking_salary: mockCandidate.salary,
      primary_color: activeTrigger?.colorPalette || '#16a34a',
    };
    return interpolateEmailTemplate(template, vars);
  }, [activeTrigger, store.title, mockCandidate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <Card className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="px-5 py-4 border-b border-border/80 flex flex-row items-center justify-between space-y-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                Notification Triggers &amp; Template Studio
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  Spec 15
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure automated multi-channel alerts (Email, WhatsApp, Telegram) with zero-PII templates.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg border border-border bg-background shadow-xs text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'config'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Configuration
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Email Preview</span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'config' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
              {/* Left Sidebar: Triggers List & Channel Adders */}
              <div className="lg:col-span-4 border-r border-border/80 p-4 space-y-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Configured Triggers ({triggers.length})
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTrigger('email')}
                      className="h-7 px-2 text-[11px] gap-1 hover:border-primary hover:text-primary"
                      title="Add Email Notification"
                    >
                      <Mail className="w-3 h-3 text-primary" />
                      <span>+Email</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTrigger('whatsapp')}
                      className="h-7 px-2 text-[11px] gap-1 hover:border-emerald-500 hover:text-emerald-500"
                      title="Add WhatsApp Notification"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-500" />
                      <span>+WA</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {triggers.map((trig) => {
                    const isSelected = trig.id === activeTrigger?.id;
                    const isEmail = trig.channel === 'email';
                    const isWA = trig.channel === 'whatsapp';

                    return (
                      <div
                        key={trig.id}
                        onClick={() => setSelectedTriggerId(trig.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                            : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isEmail
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : isWA
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                            }`}
                          >
                            {isEmail && <Mail className="w-3.5 h-3.5" />}
                            {isWA && <MessageSquare className="w-3.5 h-3.5" />}
                            {!isEmail && !isWA && <Send className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-foreground truncate">
                              {trig.subject || trig.to || `${trig.channel.toUpperCase()} Alert`}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 capitalize">
                              <span>{trig.channel}</span>
                              <span>•</span>
                              <span>{trig.event.replace(/_/g, ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {triggers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrigger(trig.id);
                            }}
                            className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                            title="Delete Trigger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-background/60 text-xs space-y-1.5 text-muted-foreground">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Dynamic Placeholders</span>
                  </div>
                  <p className="text-[11px]">
                    Use <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-bold">{'{{candidate_name}}'}</code>,{' '}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-bold">{'{{form_title}}'}</code>,{' '}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-bold">{'{{score}}'}</code> in subjects and recipients.
                  </p>
                </div>
              </div>

              {/* Right Side: Active Trigger Configuration Form */}
              <div className="lg:col-span-8 p-5 space-y-5">
                {activeTrigger ? (
                  <div className="space-y-4">
                    {/* Channel & Event Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Notification Channel</Label>
                        <select
                          value={activeTrigger.channel}
                          onChange={(e) =>
                            handleUpdateActiveTrigger({ channel: e.target.value as NotificationChannel })
                          }
                          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
                        >
                          <option value="email">Email Notification (HTML Template)</option>
                          <option value="whatsapp">WhatsApp Alert (Direct Webhook)</option>
                          <option value="telegram">Telegram Bot Dispatch</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Triggering Event</Label>
                        <select
                          value={activeTrigger.event}
                          onChange={(e) =>
                            handleUpdateActiveTrigger({
                              event: e.target.value as NotificationTriggerEvent,
                            })
                          }
                          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
                        >
                          <option value="on_form_submit">On Form Submission (Default)</option>
                          <option value="on_section_complete">On Section / Module Complete</option>
                          <option value="on_score_threshold">On Score Threshold Reached</option>
                          <option value="on_field_answer">On Specific Field Answered</option>
                        </select>
                      </div>
                    </div>

                    {/* Conditional Score Thresholds */}
                    {activeTrigger.event === 'on_score_threshold' && (
                      <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 grid grid-cols-2 gap-3 animate-in fade-in duration-150">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-foreground">Min Passing Score (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={activeTrigger.conditionScoreMin ?? 70}
                            onChange={(e) =>
                              handleUpdateActiveTrigger({ conditionScoreMin: Number(e.target.value) })
                            }
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-foreground">Max Score Boundary (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={activeTrigger.conditionScoreMax ?? 100}
                            onChange={(e) =>
                              handleUpdateActiveTrigger({ conditionScoreMax: Number(e.target.value) })
                            }
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email Specific Settings */}
                    {activeTrigger.channel === 'email' ? (
                      <div className="space-y-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">
                              Recipient To <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              value={activeTrigger.to}
                              onChange={(e) => handleUpdateActiveTrigger({ to: e.target.value })}
                              placeholder="e.g. {{candidate_email}} or hr@example.com"
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">Subject Line</Label>
                            <Input
                              value={activeTrigger.subject || ''}
                              onChange={(e) => handleUpdateActiveTrigger({ subject: e.target.value })}
                              placeholder="e.g. {{form_title}} - {{candidate_name}}"
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">From Name</Label>
                            <Input
                              value={activeTrigger.fromName || ''}
                              onChange={(e) => handleUpdateActiveTrigger({ fromName: e.target.value })}
                              placeholder="WP Exam System"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">From Email</Label>
                            <Input
                              value={activeTrigger.fromEmail || ''}
                              onChange={(e) => handleUpdateActiveTrigger({ fromEmail: e.target.value })}
                              placeholder="notifications@example.org"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Reply-To</Label>
                            <Input
                              value={activeTrigger.replyTo || ''}
                              onChange={(e) => handleUpdateActiveTrigger({ replyTo: e.target.value })}
                              placeholder="support@example.org"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        {/* CC & BCC */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">CC Recipients</Label>
                            <Input
                              value={activeTrigger.cc || ''}
                              onChange={(e) => handleUpdateActiveTrigger({ cc: e.target.value })}
                              placeholder="hiring-team@example.org"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">BCC Recipients</Label>
                            <Input
                              value={activeTrigger.bcc || ''}
                              onChange={(e) => handleUpdateActiveTrigger({ bcc: e.target.value })}
                              placeholder="archive@example.org"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        {/* Brand Theme / Primary Palette Hex */}
                        <div className="space-y-2 pt-2 border-t border-border/80">
                          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-primary" />
                            <span>Template Primary Accent Color</span>
                          </Label>
                          <div className="flex flex-wrap items-center gap-2">
                            {COLOR_PRESETS.map((preset) => {
                              const isCur = (activeTrigger.colorPalette || '#16a34a') === preset.hex;
                              return (
                                <button
                                  key={preset.hex}
                                  type="button"
                                  onClick={() => handleUpdateActiveTrigger({ colorPalette: preset.hex })}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                    isCur
                                      ? 'border-foreground shadow-xs ring-1 ring-foreground/20 font-bold'
                                      : 'border-border/80 hover:border-primary/50'
                                  }`}
                                >
                                  <span
                                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                    style={{ backgroundColor: preset.hex }}
                                  />
                                  <span>{preset.name}</span>
                                </button>
                              );
                            })}
                            <Input
                              type="text"
                              value={activeTrigger.colorPalette || '#16a34a'}
                              onChange={(e) => handleUpdateActiveTrigger({ colorPalette: e.target.value })}
                              className="h-7 w-24 text-xs font-mono px-2"
                              placeholder="#16a34a"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* WhatsApp & Telegram configuration */
                      <div className="space-y-4 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">
                            {activeTrigger.channel === 'whatsapp' ? 'Target WhatsApp Number' : 'Telegram Chat ID / Bot Token'}
                          </Label>
                          <Input
                            value={activeTrigger.to}
                            onChange={(e) => handleUpdateActiveTrigger({ to: e.target.value })}
                            placeholder={
                              activeTrigger.channel === 'whatsapp'
                                ? '+15550192834 or {{candidate_phone}}'
                                : '@channel_id or {{telegram_chat_id}}'
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Message Content</Label>
                          <Textarea
                            rows={5}
                            value={
                              activeTrigger.templateHtml ||
                              `Hello {{candidate_name}}, thank you for submitting your assessment for {{form_title}}. We will review your results promptly.`
                            }
                            onChange={(e) => handleUpdateActiveTrigger({ templateHtml: e.target.value })}
                            className="text-xs font-sans p-3 bg-background resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Select or create a trigger to begin configuration.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Email Preview Dock */
            <div className="p-4 space-y-4">
              {/* Preview Dock Toolbar */}
              <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Candidate:</span>
                    <Input
                      value={mockCandidate.name}
                      onChange={(e) => setMockCandidate({ ...mockCandidate, name: e.target.value })}
                      className="h-7 w-32 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Position:</span>
                    <Input
                      value={mockCandidate.position}
                      onChange={(e) => setMockCandidate({ ...mockCandidate, position: e.target.value })}
                      className="h-7 w-44 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Asking Salary:</span>
                    <Input
                      value={mockCandidate.salary}
                      onChange={(e) => setMockCandidate({ ...mockCandidate, salary: e.target.value })}
                      className="h-7 w-28 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Zero PII Ingested
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestNotification}
                    className="h-7 px-2.5 text-xs gap-1.5 text-foreground hover:text-primary"
                  >
                    <Send className="w-3.5 h-3.5 text-primary" />
                    <span>Send Test Dispatch</span>
                  </Button>
                </div>
              </div>

              {/* Sandboxed Iframe Container */}
              <div className="w-full border border-border rounded-xl bg-white shadow-sm overflow-hidden h-[540px]">
                <iframe
                  title="Sanitized Email Template Live Preview"
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Changes apply to form triggers when saved.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-primary hover:bg-primary/90 font-semibold gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Save Triggers</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

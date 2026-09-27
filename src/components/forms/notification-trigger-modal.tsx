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
  Tablet,
  Monitor,
  CheckCircle2,
  X,
  RefreshCw,
  LayoutTemplate,
  Sliders,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  NotificationTrigger,
  NotificationChannel,
  NotificationTriggerEvent,
  EmailThemeType,
  EmailCustomizationConfig,
  EmailSectionVisibility,
} from '@/lib/types/form';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  EMAIL_THEMES,
  DEFAULT_EMAIL_SECTIONS,
  DEFAULT_MOCK_APPLICANT_DATA,
  generateModularEmailHtml,
} from '@/lib/templates/email-template';

interface NotificationTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationTriggerModal: React.FC<NotificationTriggerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const store = useQuizStore();
  const formSettings = store.settings || {};
  const currentTriggers = formSettings.notificationTriggers || [];
  const currentCustomization = formSettings.emailCustomization;

  const [triggers, setTriggers] = useState<NotificationTrigger[]>(() => {
    if (currentTriggers.length > 0) {
      return currentTriggers;
    }
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

  const [activeTab, setActiveTab] = useState<'triggers' | 'designer' | 'preview'>('triggers');

  // Multi-Screen viewport toggle state
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Email customization state
  const [customization, setCustomization] = useState<EmailCustomizationConfig>(() => ({
    theme: currentCustomization?.theme || 'emerald',
    primaryColor: currentCustomization?.primaryColor || '#16a34a',
    companyName: currentCustomization?.companyName || 'WP Exam Systems',
    headerBannerText:
      currentCustomization?.headerBannerText ||
      'WP Exam System — Official Assessment Submission',
    footerNoteText:
      currentCustomization?.footerNoteText ||
      'Submission recorded securely via WP Exam Application Engine.',
    sections: {
      ...DEFAULT_EMAIL_SECTIONS,
      ...(currentCustomization?.sections || {}),
    },
  }));

  // Preview mock applicant overrides
  const [mockCandidate, setMockCandidate] = useState({
    name: 'Alex Morgan',
    position: 'Senior Full Stack Developer',
    email: 'alex.morgan@example.org',
    salary: '$6,500 / month',
    score: 85,
    phone: '+1 (555) 019-2834',
  });

  // Compute rendered HTML for live preview dock
  const previewHtml = useMemo(() => {
    const userVars: Record<string, string | number> = {
      ...DEFAULT_MOCK_APPLICANT_DATA,
      form_title: store.title || 'Candidate Evaluation Assessment',
      candidate_name: mockCandidate.name,
      job_position: mockCandidate.position,
      candidate_email: mockCandidate.email,
      candidate_phone: mockCandidate.phone,
      asking_salary: mockCandidate.salary,
    };
    return generateModularEmailHtml(customization, userVars);
  }, [customization, store.title, mockCandidate]);

  // Width for multi-screen responsive simulation
  const previewContainerWidth =
    viewportMode === 'mobile'
      ? '360px'
      : viewportMode === 'tablet'
      ? '540px'
      : '100%';

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
      colorPalette: customization.primaryColor || '#16a34a',
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

  const handleUpdateCustomization = (patch: Partial<EmailCustomizationConfig>) => {
    setCustomization((prev) => ({
      ...prev,
      ...patch,
      sections: {
        ...prev.sections,
        ...(patch.sections || {}),
      },
    }));
  };

  const handleToggleSection = (sectionKey: keyof EmailSectionVisibility) => {
    setCustomization((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: !prev.sections[sectionKey],
      },
    }));
  };

  const handleThemeChange = (themeKey: EmailThemeType) => {
    const pal = EMAIL_THEMES[themeKey];
    handleUpdateCustomization({
      theme: themeKey,
      primaryColor: pal.primaryColor,
    });
    if (activeTrigger) {
      handleUpdateActiveTrigger({ colorPalette: pal.primaryColor });
    }
    toast.success(`Switched email template theme to "${pal.name}".`);
  };

  const handleSaveAll = () => {
    store.updateSettings({
      notificationTriggers: triggers,
      emailCustomization: customization,
    });
    toast.success('Notification triggers and email templates saved!');
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


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <Card className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="px-5 py-4 border-b border-border/80 flex flex-row items-center justify-between space-y-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                Email Template Studio &amp; Notification Triggers
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  Spec 16
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Customize email themes, section layouts, and multi-channel alerts (Email, WhatsApp, Telegram).
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg border border-border bg-background shadow-xs text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('triggers')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'triggers'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Triggers &amp; Routing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('designer')}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'designer'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Email Designer</span>
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
                <span>Multi-Screen Preview</span>
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
          {activeTab === 'triggers' && (
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
                              <span>&bull;</span>
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
          )}

          {/* TAB 2: Email Template Designer */}
          {activeTab === 'designer' && (
            <div className="p-6 space-y-6">
              {/* Theme Palette Picker (6 Themes) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Email Template Theme Palette</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select one of 6 professionally calibrated visual themes for candidate email communications.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize font-semibold">
                    Current: {EMAIL_THEMES[customization.theme]?.name}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(Object.keys(EMAIL_THEMES) as EmailThemeType[]).map((themeKey) => {
                    const pal = EMAIL_THEMES[themeKey];
                    const isSelected = customization.theme === themeKey;

                    return (
                      <div
                        key={themeKey}
                        onClick={() => handleThemeChange(themeKey)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-xs'
                            : 'border-border/80 bg-card hover:border-primary/40 hover:bg-accent/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="w-5 h-5 rounded-full shadow-2xs border border-white"
                            style={{ backgroundColor: pal.primaryColor }}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div className="font-semibold text-xs text-foreground">{pal.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{pal.primaryColor}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Header & Branding Controls */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/10 space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Branding &amp; Header Content</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Company / Organization</Label>
                    <Input
                      value={customization.companyName || ''}
                      onChange={(e) => handleUpdateCustomization({ companyName: e.target.value })}
                      placeholder="WP Exam Systems"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Header Banner Text</Label>
                    <Input
                      value={customization.headerBannerText || ''}
                      onChange={(e) => handleUpdateCustomization({ headerBannerText: e.target.value })}
                      placeholder="Official Submission Received"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Footer Disclaimers</Label>
                    <Input
                      value={customization.footerNoteText || ''}
                      onChange={(e) => handleUpdateCustomization({ footerNoteText: e.target.value })}
                      placeholder="Captured by WP Exam Engine"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Modular Section Visibility Toggles */}
              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Modular Email Sections (Toggle Inclusion)</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose which sections are printed and included in the candidate's email report.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Section 1: Applicant Details</div>
                      <div className="text-[10px] text-muted-foreground">Name, role, email, phone, country</div>
                    </div>
                    <Switch
                      checked={customization.sections.showApplicantDetails}
                      onCheckedChange={() => handleToggleSection('showApplicantDetails')}
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Section 2: Profiles &amp; Work Links</div>
                      <div className="text-[10px] text-muted-foreground">GitHub, LinkedIn, Portfolio, CV link</div>
                    </div>
                    <Switch
                      checked={customization.sections.showProfilesAndLinks}
                      onCheckedChange={() => handleToggleSection('showProfilesAndLinks')}
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Section 3: Workstation &amp; Setup</div>
                      <div className="text-[10px] text-muted-foreground">Degree, remote compatibility, specs</div>
                    </div>
                    <Switch
                      checked={customization.sections.showQualifications}
                      onCheckedChange={() => handleToggleSection('showQualifications')}
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Section 4: Technical Statement</div>
                      <div className="text-[10px] text-muted-foreground">Approach narrative, candidate intro</div>
                    </div>
                    <Switch
                      checked={customization.sections.showTechnicalStatement}
                      onCheckedChange={() => handleToggleSection('showTechnicalStatement')}
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Section 5: Compensation</div>
                      <div className="text-[10px] text-muted-foreground">Current salary, asking salary, hours</div>
                    </div>
                    <Switch
                      checked={customization.sections.showCompensation}
                      onCheckedChange={() => handleToggleSection('showCompensation')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Multi-Screen Live Preview */}
          {activeTab === 'preview' && (
            <div className="p-4 space-y-4">
              {/* Preview Dock Toolbar */}
              <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Viewport Screen Width Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-background rounded-lg border border-border shadow-xs">
                  <button
                    type="button"
                    onClick={() => setViewportMode('desktop')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewportMode === 'desktop'
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (680px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('tablet')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewportMode === 'tablet'
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet (540px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('mobile')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewportMode === 'mobile'
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (360px)</span>
                  </button>
                </div>

                {/* Candidate Mock Data Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Applicant:</span>
                    <Input
                      value={mockCandidate.name}
                      onChange={(e) => setMockCandidate({ ...mockCandidate, name: e.target.value })}
                      className="h-7 w-28 text-xs bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Salary:</span>
                    <Input
                      value={mockCandidate.salary}
                      onChange={(e) => setMockCandidate({ ...mockCandidate, salary: e.target.value })}
                      className="h-7 w-24 text-xs bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestNotification}
                    className="h-7 px-2.5 text-xs gap-1 text-foreground hover:text-primary"
                  >
                    <Send className="w-3 h-3 text-primary" />
                    <span>Test Send</span>
                  </Button>
                </div>
              </div>

              {/* Sandboxed Responsive Preview Dock */}
              <div className="w-full flex justify-center bg-muted/40 p-4 rounded-xl border border-border/80 overflow-x-auto min-h-[520px]">
                <div
                  className="bg-white rounded-xl shadow-lg border border-border overflow-hidden transition-all duration-200"
                  style={{ width: previewContainerWidth, height: '520px' }}
                >
                  <iframe
                    title="Sanitized Email Template Multi-Screen Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {activeTab === 'designer'
              ? 'Changes immediately update the live email preview dock.'
              : 'Configured triggers and template customizations persist to form settings.'}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveAll} className="h-8 text-xs bg-primary hover:bg-primary/90 font-semibold gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

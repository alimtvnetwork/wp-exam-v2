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
  Workflow,
  PlusCircle,
  FileCheck,
  FolderOpen,
  AtSign,
  User,
  Shield,
  Clock,
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export interface CascadingLayer {
  id: string;
  name: string;
  to: string;
  recipientType: 'variable' | 'custom';
  subject?: string;
  cc?: string;
  bcc?: string;
  channel: NotificationChannel;
  isEnabled?: boolean;
}

export interface AdvancedNotificationTrigger extends NotificationTrigger {
  recipientType?: 'variable' | 'custom';
  selectedFieldVar?: string;
  layers?: CascadingLayer[];
  isEnabled?: boolean;
}

export interface RulePresetItem {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'custom';
  trigger: AdvancedNotificationTrigger;
}

const SYSTEM_RULE_PRESETS: RulePresetItem[] = [
  {
    id: 'preset-candidate-ack',
    name: 'Candidate Auto-Acknowledgment',
    description: 'Instant branded confirmation receipt sent directly to the candidate email upon submission.',
    category: 'system',
    trigger: {
      id: 'preset-candidate-ack',
      channel: 'email',
      event: 'on_form_submit',
      to: '{{candidate_email}}',
      recipientType: 'variable',
      fromName: 'WP Exam Admissions',
      fromEmail: 'admissions@example.org',
      replyTo: 'careers@example.org',
      subject: 'Confirmation: Your Assessment for {{form_title}} has been received',
      colorPalette: '#16a34a',
      isEnabled: true,
      layers: [
        {
          id: 'layer-dept-alert',
          name: 'Layer 2: Internal Reviewer Alert',
          recipientType: 'custom',
          to: 'recruitment-team@example.org',
          subject: '[New Candidate] {{candidate_name}} submitted {{form_title}}',
          channel: 'email',
          isEnabled: true,
        },
      ],
    },
  },
  {
    id: 'preset-scoring-threshold',
    name: 'High Scorer Fast-Track Notice',
    description: 'Fires when candidate scores 80% or higher, alerting hiring directors and scheduling interview.',
    category: 'system',
    trigger: {
      id: 'preset-scoring-threshold',
      channel: 'email',
      event: 'on_score_threshold',
      conditionScoreMin: 80,
      conditionScoreMax: 100,
      to: 'hiring-directors@example.org',
      recipientType: 'custom',
      fromName: 'WP Exam Evaluation Engine',
      fromEmail: 'evaluations@example.org',
      subject: '★ High Scorer Qualified: {{candidate_name}} (Score: {{score}}%)',
      colorPalette: '#0284c7',
      isEnabled: true,
      layers: [
        {
          id: 'layer-sms-alert',
          name: 'Layer 2: Executive WhatsApp Ping',
          recipientType: 'custom',
          to: '+15550192834',
          subject: 'Priority candidate qualified: {{candidate_name}}',
          channel: 'whatsapp',
          isEnabled: true,
        },
      ],
    },
  },
];

interface VariablePillGroupProps {
  label: string;
  tokens: string[];
  onSelectToken: (token: string) => void;
}

const VariablePillGroup: React.FC<VariablePillGroupProps> = ({
  label,
  tokens,
  onSelectToken,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
      <span className="font-medium text-muted-foreground/80">{label}:</span>
      {tokens.map((token) => (
        <button
          key={token}
          type="button"
          onClick={() => onSelectToken(token)}
          className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 font-mono text-[10px] transition-colors cursor-pointer"
          title={`Click to insert ${token}`}
        >
          +{token}
        </button>
      ))}
    </div>
  );
};

interface CascadingLayerCardProps {
  layer: CascadingLayer;
  index: number;
  availableFieldVars: Array<{ label: string; variable: string }>;
  onUpdate: (patch: Partial<CascadingLayer>) => void;
  onDelete: () => void;
}

const CascadingLayerCard: React.FC<CascadingLayerCardProps> = ({
  layer,
  index,
  availableFieldVars,
  onUpdate,
  onDelete,
}) => {
  const isVariableRecipient = layer.recipientType === 'variable';

  return (
    <div className="p-3.5 rounded-xl border border-border/80 bg-background/80 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">
            Layer {index + 2}
          </Badge>
          <Input
            value={layer.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="h-7 text-xs font-semibold bg-transparent border-0 px-1 focus-visible:ring-0 max-w-[220px]"
            placeholder="Layer Stage Name"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Channel:</span>
            <select
              value={layer.channel}
              onChange={(e) => onUpdate({ channel: e.target.value as NotificationChannel })}
              className="h-6 text-[11px] rounded border border-border bg-card px-1.5 font-medium"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-6 w-6 rounded text-muted-foreground hover:text-destructive"
            title="Delete this cascading layer"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-foreground">Target Recipient (To:)</Label>
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  recipientType: isVariableRecipient ? 'custom' : 'variable',
                })
              }
              className="text-[10px] text-primary hover:underline cursor-pointer"
            >
              {isVariableRecipient ? 'Switch to Custom Email' : 'Switch to Form Field'}
            </button>
          </div>
          {isVariableRecipient ? (
            <Select
              value={layer.to}
              onValueChange={(val) => onUpdate({ to: val })}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Select Form Variable" />
              </SelectTrigger>
              <SelectContent>
                {availableFieldVars.map((v) => (
                  <SelectItem key={v.variable} value={v.variable} className="text-xs">
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={layer.to}
              onChange={(e) => onUpdate({ to: e.target.value })}
              placeholder="e.g. reviewer@example.org"
              className="h-8 text-xs bg-background"
            />
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-foreground">Cascading Subject Line</Label>
          <Input
            value={layer.subject || ''}
            onChange={(e) => onUpdate({ subject: e.target.value })}
            placeholder="e.g. Cascading Alert: {{candidate_name}}"
            className="h-8 text-xs bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">CC Recipients</Label>
          <Input
            value={layer.cc || ''}
            onChange={(e) => onUpdate({ cc: e.target.value })}
            placeholder="cc@company.org"
            className="h-7 text-xs bg-background"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">BCC Recipients</Label>
          <Input
            value={layer.bcc || ''}
            onChange={(e) => onUpdate({ bcc: e.target.value })}
            placeholder="bcc@company.org"
            className="h-7 text-xs bg-background"
          />
        </div>
      </div>
    </div>
  );
};

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
  const storeFields = store.fields || [];

  const [ruleMode, setRuleMode] = useState<'create' | 'presets'>('create');
  const [presetFilter, setPresetFilter] = useState<'all' | 'saved'>('all');
  const [savedCustomPresets, setSavedCustomPresets] = useState<RulePresetItem[]>([]);

  const [triggers, setTriggers] = useState<AdvancedNotificationTrigger[]>(() => {
    const hasInitial = currentTriggers.length > 0;
    if (hasInitial) {
      return currentTriggers.map((t) => ({
        ...t,
        recipientType: t.to && t.to.startsWith('{{') ? 'variable' : 'custom',
        isEnabled: true,
      }));
    }
    return [
      {
        id: 'trigger-email-1',
        channel: 'email',
        event: 'on_form_submit',
        to: '{{candidate_email}}',
        recipientType: 'variable',
        fromName: 'WP Exam Admissions',
        fromEmail: 'notifications@example.org',
        replyTo: 'careers@example.org',
        subject: 'Submission Received: {{form_title}} - {{candidate_name}}',
        colorPalette: '#16a34a',
        isEnabled: true,
        layers: [],
      },
    ];
  });

  const [selectedTriggerId, setSelectedTriggerId] = useState<string>(
    triggers[0]?.id || 'trigger-email-1'
  );

  const [activeTab, setActiveTab] = useState<'triggers' | 'designer' | 'preview'>('triggers');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

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

  const [mockCandidate, setMockCandidate] = useState({
    name: 'Alex Morgan',
    position: 'Senior Full Stack Developer',
    email: 'alex.morgan@example.org',
    salary: '$6,500 / month',
    score: 85,
    phone: '+1 (555) 019-2834',
  });

  const availableFieldVars = useMemo(() => {
    const vars: Array<{ label: string; variable: string }> = [
      { label: 'Candidate Email (Auto-detected)', variable: '{{candidate_email}}' },
      { label: 'Applicant Email', variable: '{{applicant_email}}' },
      { label: 'Candidate Full Name', variable: '{{candidate_name}}' },
      { label: 'Candidate Direct Phone', variable: '{{candidate_phone}}' },
      { label: 'Form Assessment Title', variable: '{{form_title}}' },
      { label: 'Calculated Passing Score', variable: '{{score}}' },
    ];

    storeFields.forEach((field) => {
      const fieldIdToken = `{{field_${field.id}}}`;
      const fieldLabel = field.label || 'Untitled Field';
      vars.push({
        label: `${fieldLabel} (${field.type})`,
        variable: fieldIdToken,
      });
    });

    return vars;
  }, [storeFields]);

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

  const handleUpdateActiveTrigger = (patch: Partial<AdvancedNotificationTrigger>) => {
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
    const newTrigger: AdvancedNotificationTrigger = {
      id: newId,
      channel,
      event: 'on_form_submit',
      to: channel === 'email' ? '{{candidate_email}}' : '+15550192834',
      recipientType: channel === 'email' ? 'variable' : 'custom',
      fromName: 'WP Exam Admissions',
      fromEmail: 'notifications@example.org',
      subject: 'New Notification: {{form_title}}',
      colorPalette: customization.primaryColor || '#16a34a',
      isEnabled: true,
      layers: [],
    };
    const nextList = [...triggers, newTrigger];
    setTriggers(nextList);
    setSelectedTriggerId(newId);
    setRuleMode('create');
    toast.success(`Added new ${channel.toUpperCase()} notification trigger.`);
  };

  const handleDeleteTrigger = (id: string) => {
    const filtered = triggers.filter((t) => t.id !== id);
    setTriggers(filtered);
    const hasRemaining = filtered.length > 0;
    if (selectedTriggerId === id) {
      if (hasRemaining) {
        setSelectedTriggerId(filtered[0].id);
      }
    }
    toast.info('Trigger removed.');
  };

  const handleAddCascadingLayer = () => {
    if (!activeTrigger) {
      return;
    }
    const currentLayers = activeTrigger.layers || [];
    const newLayerNumber = currentLayers.length + 2;
    const newLayer: CascadingLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${newLayerNumber}: Internal Dispatch`,
      to: 'hiring-team@example.org',
      recipientType: 'custom',
      subject: `Cascading Notice: {{form_title}} - {{candidate_name}}`,
      channel: 'email',
      isEnabled: true,
    };
    handleUpdateActiveTrigger({ layers: [...currentLayers, newLayer] });
    toast.success(`Added Cascading Layer ${newLayerNumber}`);
  };

  const handleUpdateLayer = (layerId: string, patch: Partial<CascadingLayer>) => {
    if (!activeTrigger) {
      return;
    }
    const currentLayers = activeTrigger.layers || [];
    const nextLayers = currentLayers.map((l) =>
      l.id === layerId ? { ...l, ...patch } : l
    );
    handleUpdateActiveTrigger({ layers: nextLayers });
  };

  const handleDeleteLayer = (layerId: string) => {
    if (!activeTrigger) {
      return;
    }
    const currentLayers = activeTrigger.layers || [];
    const nextLayers = currentLayers.filter((l) => l.id !== layerId);
    handleUpdateActiveTrigger({ layers: nextLayers });
    toast.info('Cascading layer removed.');
  };

  const handleApplyPreset = (preset: RulePresetItem) => {
    const newId = `trigger-preset-${Date.now()}`;
    const clonedTrigger: AdvancedNotificationTrigger = {
      ...preset.trigger,
      id: newId,
    };
    setTriggers((prev) => [...prev, clonedTrigger]);
    setSelectedTriggerId(newId);
    setRuleMode('create');
    toast.success(`Applied preset: "${preset.name}" as new notification rule.`);
  };

  const handleSaveActiveAsPreset = () => {
    if (!activeTrigger) {
      return;
    }
    const newPresetId = `preset-custom-${Date.now()}`;
    const presetName = activeTrigger.subject || `${activeTrigger.channel.toUpperCase()} Custom Rule`;
    const newPreset: RulePresetItem = {
      id: newPresetId,
      name: presetName,
      description: `User-defined preset configured for ${activeTrigger.channel} channel on ${activeTrigger.event}.`,
      category: 'custom',
      trigger: { ...activeTrigger },
    };
    setSavedCustomPresets((prev) => [...prev, newPreset]);
    toast.success(`Saved rule as custom preset: "${presetName}"`);
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

  const isTriggerActive = Boolean(activeTrigger?.isEnabled ?? true);
  const isEmailChannel = activeTrigger?.channel === 'email';
  const isVariableRecipient = activeTrigger?.recipientType === 'variable';
  const isCustomRecipient = !isVariableRecipient;

  const displayedPresets =
    presetFilter === 'saved'
      ? savedCustomPresets
      : [...SYSTEM_RULE_PRESETS, ...savedCustomPresets];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <Card className="w-full max-w-6xl max-h-[94vh] flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="px-4 sm:px-6 py-3.5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold font-heading text-foreground flex items-center gap-2">
                Email Template Studio &amp; Multi-Layer Triggers
                <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30">
                  Spec 16
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                Configure rule presets, variable recipients, cascading stages, and email theme designs.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="inline-flex items-center p-0.5 rounded-lg border border-border bg-background shadow-xs text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('triggers')}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all ${
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
                className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeTab === 'designer'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Designer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'triggers' && (
            <div className="flex flex-col min-h-[540px]">
              {/* Top Segmented Mode Selector: Create New Rule vs Use Preset */}
              <div className="p-3 sm:px-6 bg-muted/30 border-b border-border/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setRuleMode('create')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      ruleMode === 'create'
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Notification Rule</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleMode('presets')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      ruleMode === 'presets'
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Use Existing Rule Preset</span>
                  </button>
                </div>

                {ruleMode === 'create' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveActiveAsPreset}
                    className="h-7 px-2.5 text-xs gap-1.5 hover:text-primary hover:border-primary/40"
                    title="Save active trigger into your preset library"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
                    <span>Save Current as Preset</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px]">Filter:</span>
                    <button
                      type="button"
                      onClick={() => setPresetFilter('all')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        presetFilter === 'all'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All Presets ({SYSTEM_RULE_PRESETS.length + savedCustomPresets.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetFilter('saved')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        presetFilter === 'saved'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      My Saved ({savedCustomPresets.length})
                    </button>
                  </div>
                )}
              </div>

              {/* View 1: Presets Library View */}
              {ruleMode === 'presets' ? (
                <div className="p-4 sm:p-6 space-y-4">
                  {displayedPresets.length === 0 ? (
                    <Card className="p-8 text-center border-dashed border-border/80 bg-muted/10 rounded-2xl space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">No saved presets found</h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          No saved presets found. Create and save a new rule to build your library.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setRuleMode('create')}
                        className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Switch to Create New Rule</span>
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedPresets.map((preset) => (
                        <Card
                          key={preset.id}
                          className="p-4 border border-border/80 bg-card rounded-xl hover:border-primary/40 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                {preset.trigger.channel === 'email' ? (
                                  <Mail className="w-4 h-4 text-primary" />
                                ) : (
                                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                                )}
                                <span>{preset.name}</span>
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase font-semibold ${
                                  preset.category === 'system'
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}
                              >
                                {preset.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {preset.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
                              <span className="bg-muted px-1.5 py-0.5 rounded">To: {preset.trigger.to}</span>
                              <span className="bg-muted px-1.5 py-0.5 rounded">
                                Event: {preset.trigger.event.replace(/_/g, ' ')}
                              </span>
                              {preset.trigger.layers && preset.trigger.layers.length > 0 && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                  {preset.trigger.layers.length + 1} Stages
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">Ready to load</span>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleApplyPreset(preset)}
                              className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                            >
                              <span>Apply Preset</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* View 2: Create / Active Trigger Configuration */
                <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
                  {/* Left Sidebar: Triggers List & Channel Adders */}
                  <div className="lg:col-span-4 border-r border-border/80 p-4 space-y-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Active Rules ({triggers.length})
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
                        const isTelegram = trig.channel === 'telegram';
                        const isEnabled = Boolean(trig.isEnabled ?? true);
                        const hasLayerCount = trig.layers?.length || 0;

                        return (
                          <div
                            key={trig.id}
                            onClick={() => setSelectedTriggerId(trig.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                                : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/40'
                            } ${isEnabled ? '' : 'opacity-60'}`}
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
                                {isTelegram && <Send className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-foreground truncate">
                                  {trig.subject || trig.to || `${trig.channel.toUpperCase()} Alert`}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 capitalize">
                                  <span>{trig.channel}</span>
                                  <span>&bull;</span>
                                  <span>{trig.event.replace(/_/g, ' ')}</span>
                                  {hasLayerCount > 0 && (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary">
                                      +{hasLayerCount} stage
                                    </Badge>
                                  )}
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
                        <span>Form Field Variables</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Insert dynamic recipient tokens: candidate email, custom manager inputs, or any form field answer dynamically extracted from <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-bold">store.fields</code>.
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Active Trigger Configuration Form */}
                  <div className="lg:col-span-8 p-4 sm:p-5 space-y-5">
                    {activeTrigger ? (
                      <div className="space-y-4">
                        {/* Status Toggle & Basic Identification Banner */}
                        <div className="p-3 rounded-xl border border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                              Rule Status:
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs font-semibold ${
                                isTriggerActive
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {isTriggerActive ? 'Enabled / Active' : 'Disabled (Muted)'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="rule-toggle" className="text-xs text-muted-foreground cursor-pointer">
                              {isTriggerActive ? 'Disable Rule' : 'Enable Rule'}
                            </Label>
                            <Switch
                              id="rule-toggle"
                              checked={isTriggerActive}
                              onCheckedChange={(val) => handleUpdateActiveTrigger({ isEnabled: val })}
                            />
                          </div>
                        </div>

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
                        {isEmailChannel ? (
                          <div className="space-y-4 pt-1">
                            {/* Layer 1: Recipient To with Variable Mapping */}
                            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className="text-[10px] bg-primary text-primary-foreground font-bold">
                                    Stage 1: Primary Dispatch
                                  </Badge>
                                  <span className="text-xs font-bold text-foreground">Recipient Configuration</span>
                                </div>
                                <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateActiveTrigger({ recipientType: 'variable' })}
                                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                                      isVariableRecipient
                                        ? 'bg-card text-foreground font-bold shadow-2xs border border-border'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    Form Field Variable
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateActiveTrigger({ recipientType: 'custom' })}
                                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                                      isCustomRecipient
                                        ? 'bg-card text-foreground font-bold shadow-2xs border border-border'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    Custom Email Address
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-foreground">
                                    Recipient To <span className="text-destructive">*</span>
                                  </Label>
                                  {isVariableRecipient ? (
                                    <Select
                                      value={activeTrigger.to}
                                      onValueChange={(val) =>
                                        handleUpdateActiveTrigger({ to: val, recipientType: 'variable' })
                                      }
                                    >
                                      <SelectTrigger className="h-9 text-xs bg-background">
                                        <SelectValue placeholder="Choose Form Field Variable" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableFieldVars.map((item) => (
                                          <SelectItem key={item.variable} value={item.variable} className="text-xs">
                                            {item.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      value={activeTrigger.to}
                                      onChange={(e) =>
                                        handleUpdateActiveTrigger({ to: e.target.value, recipientType: 'custom' })
                                      }
                                      placeholder="e.g. hr-admissions@example.org"
                                      className="h-9 text-xs bg-background"
                                    />
                                  )}
                                  <VariablePillGroup
                                    label="Quick Insert"
                                    tokens={['{{candidate_email}}', '{{applicant_email}}', '{{candidate_name}}']}
                                    onSelectToken={(token) =>
                                      handleUpdateActiveTrigger({ to: token, recipientType: 'variable' })
                                    }
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-foreground">Subject Line</Label>
                                  <Input
                                    value={activeTrigger.subject || ''}
                                    onChange={(e) => handleUpdateActiveTrigger({ subject: e.target.value })}
                                    placeholder="e.g. {{form_title}} - {{candidate_name}}"
                                    className="h-9 text-xs bg-background"
                                  />
                                  <VariablePillGroup
                                    label="Add token"
                                    tokens={['{{form_title}}', '{{candidate_name}}', '{{score}}']}
                                    onSelectToken={(token) =>
                                      handleUpdateActiveTrigger({
                                        subject: `${activeTrigger.subject || ''} ${token}`.trim(),
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* From Name & From Email */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-border/60">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-foreground">From Name</Label>
                                  <Input
                                    value={activeTrigger.fromName || ''}
                                    onChange={(e) => handleUpdateActiveTrigger({ fromName: e.target.value })}
                                    placeholder="WP Exam System"
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-foreground">From Email</Label>
                                  <Input
                                    value={activeTrigger.fromEmail || ''}
                                    onChange={(e) => handleUpdateActiveTrigger({ fromEmail: e.target.value })}
                                    placeholder="notifications@example.org"
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-foreground">Reply-To</Label>
                                  <Input
                                    value={activeTrigger.replyTo || ''}
                                    onChange={(e) => handleUpdateActiveTrigger({ replyTo: e.target.value })}
                                    placeholder="support@example.org"
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>
                              </div>

                              {/* CC & BCC Support */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">CC Recipients (Comma-separated)</Label>
                                  <Input
                                    value={activeTrigger.cc || ''}
                                    onChange={(e) => handleUpdateActiveTrigger({ cc: e.target.value })}
                                    placeholder="hiring-team@example.org, lead@example.org"
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">BCC Recipients (Audit/Archive)</Label>
                                  <Input
                                    value={activeTrigger.bcc || ''}
                                    onChange={(e) => handleUpdateActiveTrigger({ bcc: e.target.value })}
                                    placeholder="archive@example.org, compliance@example.org"
                                    className="h-8 text-xs bg-background"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Multi-Layer Cascading Notification Stages */}
                            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Workflow className="w-3.5 h-3.5 text-primary" />
                                    <span>Cascading Notification Stages (Multi-Layer Execution)</span>
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground">
                                    Trigger secondary and team dispatches sequentially upon completion of Stage 1.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddCascadingLayer}
                                  className="h-7 px-2.5 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10 font-semibold"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>+ Add Cascading Recipient Layer</span>
                                </Button>
                              </div>

                              {activeTrigger.layers && activeTrigger.layers.length > 0 ? (
                                <div className="space-y-2.5 pt-1">
                                  {activeTrigger.layers.map((layer, idx) => (
                                    <CascadingLayerCard
                                      key={layer.id}
                                      layer={layer}
                                      index={idx}
                                      availableFieldVars={availableFieldVars}
                                      onUpdate={(patch) => handleUpdateLayer(layer.id, patch)}
                                      onDelete={() => handleDeleteLayer(layer.id)}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="p-3 text-center rounded-lg border border-border/70 bg-background/50 text-xs text-muted-foreground">
                                  No cascading layers attached. Click above to add Stage 2 (e.g. Department Lead or Slack Webhook).
                                </div>
                              )}
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
            </div>
          )}

          {/* TAB 2: Email Template Designer */}
          {activeTab === 'designer' && (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Theme Palette Picker (6 Themes) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <span>Desktop</span>
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
                    <span>Tablet</span>
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
                    <span>Mobile</span>
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
        <div className="px-4 sm:px-6 py-3.5 border-t border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {activeTab === 'designer'
              ? 'Changes immediately update the live email preview dock.'
              : 'Configured triggers, presets, and cascading stages persist to form settings.'}
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

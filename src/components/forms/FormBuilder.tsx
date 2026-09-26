import React, { useState, useMemo, useEffect } from 'react';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  FormField,
  FieldType,
  FormType,
  FormAccessType,
} from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormRunner } from '@/components/runner/FormRunner';
import { JsonModal } from './json-modal';
import { GoogleFormsImportModal } from './google-forms-import-modal';
import { DesignValidationPanel, DesignValidationSidebarView } from './design-validation-panel';
import { auditFormDesign, DesignHealthReport } from '@/lib/design-validation-engine';
import { AiSectionAssistant } from './ai-section-assistant';
import { BranchingFlowModal } from './branching-flow-modal';
import { SlugManagementModal } from './slug-management-modal';
import { SortableFieldCard } from './sortable-field-card';
import { FieldPalette } from './field-palette';
import { toast } from 'sonner';
import {
  Eye,
  Save,
  FileJson,
  FileSpreadsheet,
  GitBranch,
  Copy,
  ExternalLink,
  Layers,
  PlusCircle,
  HelpCircle,
  ListOrdered,
  Award,
  Sparkles,
  Settings,
  ArrowUp,
  ArrowDown,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  Wand2,
  ChevronDown,
  Clock,
  CheckCircle2,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const FormBuilder: React.FC = () => {
  const {
    title,
    description,
    slug,
    formType,
    formAccess,
    isSequential,
    settings,
    fields,
    isSaving,
    setTitle,
    setDescription,
    setSlug,
    setFormType,
    setFormAccess,
    setIsSequential,
    updateSettings,
    addField,
    updateField,
    removeField,
    setFields,
    saveForm,
  } = useQuizStore();

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [outlineFilter, setOutlineFilter] = useState<string>('');
  const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<string>('palette');

  const designReport: DesignHealthReport = useMemo(
    () => auditFormDesign(fields, formType, settings),
    [fields, formType, settings]
  );

  // Live Browser Address Bar URL Synchronization without full page reload
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const cleanSlug = slug?.trim();

    if (cleanSlug && cleanSlug.length > 0) {
      const url = new URL(window.location.href);
      const expectedPath = `/admin/form/${encodeURIComponent(cleanSlug)}`;

      if (url.pathname !== expectedPath) {
        const search = url.search;
        const newUrl = `${expectedPath}${search}`;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [slug]);

  const handleImportGoogleForm = (
    data: { title: string; description: string; fields: FormField[] },
    isReplaceMode: boolean,
    openBranchingFlow?: boolean
  ) => {
    if (data.title) {
      setTitle(data.title);
    }

    if (data.description) {
      setDescription(data.description);
    }

    if (isReplaceMode) {
      setFields(data.fields);
    } else {
      setFields([...fields, ...data.fields]);
    }

    if (openBranchingFlow) {
      setIsFlowModalOpen(true);
    }
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) {
      return;
    }
    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);
    setFields(newFields);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      if (active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const targetField = fields[newIndex];
          const newFields = arrayMove(fields, oldIndex, newIndex);

          // Update section group to match target location (or clear if target has no group)
          newFields[newIndex] = { ...newFields[newIndex], group: targetField ? targetField.group : undefined };

          setFields(newFields);
        }
      }
    }
  };

  const handleQuickAdd = (type: FieldType) => {
    const newId = `field-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const defaults: Record<string, Partial<FormField>> = {
      multiple_choice: {
        label: 'Select the best option',
        options: ['Choice A', 'Choice B', 'Choice C'],
        correctAnswer: 'Choice A',
      },
      single_choice: {
        label: 'Select single correct response',
        options: ['Option 1', 'Option 2', 'Option 3'],
        correctAnswer: 'Option 1',
      },
      true_false: {
        label: 'State whether this claim is True or False',
        options: ['True', 'False'],
        correctAnswer: 'True',
      },
      link: {
        label: 'Reference Documentation Link',
        url: 'https://careers.developers-organism.com',
        linkText: 'Open Official Reference',
      },
      regex_text: {
        label: 'Enter Alphanumeric Identification Code',
        placeholder: 'e.g. EMP_8820',
        validationRule: {
          ruleType: 'regex',
          pattern: '^[A-Z]{3}_[0-9]{4}$',
          errorMessage: 'Format must be AAA_0000',
        },
      },
      short_answer: {
        label: 'Provide short response',
        placeholder: 'Enter concise answer...',
      },
      paragraph: {
        label: 'Detailed explanation or commentary',
        placeholder: 'Type detailed response...',
      },
      email: {
        label: 'Candidate Verified Email Address',
        placeholder: 'candidate@company.org',
      },
      phone: {
        label: 'Candidate Direct Phone Number',
        placeholder: '+880 1700 000000',
      },
      whatsapp: {
        label: 'Candidate Direct WhatsApp Number',
        placeholder: '+880 1700 000000',
      },
      dropdown: {
        label: 'Select Engineering Specialty',
        options: ['Frontend React', 'Backend PHP / Laravel', 'Full-Stack Lead', 'DevOps / QA'],
      },
      rating: {
        label: 'Rate your confidence level in modern TypeScript (1-5)',
      },
      file_upload: {
        label: 'Upload CV / Work Samples (PDF, ZIP)',
      },
      video: {
        label: 'Watch the Technical Walkthrough / Video Briefing',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoCaption: 'Watch the briefing video carefully before proceeding.',
      },
    };

    addField({
      id: newId,
      type,
      label: defaults[type]?.label || 'New Question',
      placeholder: defaults[type]?.placeholder || '',
      isRequired: type !== 'video' && type !== 'link',
      options: defaults[type]?.options,
      correctAnswer: defaults[type]?.correctAnswer,
      url: defaults[type]?.url,
      linkText: defaults[type]?.linkText,
      videoUrl: defaults[type]?.videoUrl,
      videoCaption: defaults[type]?.videoCaption,
      validationRule: defaults[type]?.validationRule,
      points: type === 'video' || type === 'link' ? 0 : 10,
    });

    toast.success(`Added ${type.replace('_', ' ')} question`);
  };

  const handleDuplicateField = (id: string) => {
    const target = fields.find((f) => f.id === id);

    if (!target) {
      return;
    }

    const newId = `field-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const duplicated: FormField = {
      ...target,
      id: newId,
      label: `${target.label} (Copy)`,
    };

    const targetIndex = fields.findIndex((f) => f.id === id);
    const newFields = [...fields];
    newFields.splice(targetIndex + 1, 0, duplicated);
    setFields(newFields);
    toast.success('Question duplicated successfully');
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving form to WordPress backend...');
      await saveForm();
      setSaveStatus('Form saved successfully!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSaveStatus(`Saved locally (API simulated: ${message})`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const activeSlug = slug || 'custom-form';

  const handleCopyLiveUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173';
    const liveUrl = `${origin}/f/${activeSlug}`;
    navigator.clipboard.writeText(liveUrl);
    toast.success(`Copied Public Form URL: ${liveUrl}`);
  };

  const scrollToField = (fieldId: string) => {
    const el = document.getElementById(`field-card-${fieldId}`);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Group filter calculation
  const distinctGroups = Array.from(new Set(fields.map((f) => f.group).filter(Boolean))) as string[];
  const displayedFields =
    selectedGroupFilter === 'all'
      ? fields
      : fields.filter((f) => f.group === selectedGroupFilter);

  const totalPoints = fields.reduce((acc, f) => acc + (f.points || 0), 0);
  const requiredCount = fields.filter((f) => f.isRequired).length;

  return (
    <div className="w-full px-3 sm:px-6 pt-1 pb-6 space-y-3.5">
      {/* Top Action Bar with Integrated Live URL & Customizable Slug Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 sm:px-4 sm:py-2.5 bg-card rounded-xl border border-border/80 shadow-xs">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="text-sm h-9 px-3 gap-2 font-medium shrink-0 bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xs cursor-pointer group"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="hidden sm:inline">Back to Admin</span>
            </Button>
            <div className="h-5 w-px bg-border hidden sm:block" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              Form & Assessment <span className="text-primary">Builder</span>
            </h1>
            <Badge variant="secondary" className="text-sm font-mono shrink-0 px-2.5 py-0.5">
              Studio
            </Badge>
          </div>

          {/* Integrated Live URL & Customizable Slug Ribbon */}
          <div className="flex items-center gap-2 flex-wrap text-sm pt-0.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/80 font-mono text-sm text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <button
                type="button"
                onClick={() => setIsSlugModalOpen(true)}
                className="text-foreground/80 hover:text-primary font-bold shrink-0 transition-colors cursor-pointer"
                title="Open Slug Manager"
              >
                /f/
              </button>
              <input
                type="text"
                value={slug || ''}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="form-slug"
                className="bg-transparent border-0 font-mono text-sm text-primary font-semibold focus:outline-none focus:ring-0 w-32 sm:w-44"
                title="Edit customizable URL slug for this form"
              />
              <button
                type="button"
                onClick={() => {
                  if (!title || title.trim().length === 0) {
                    toast.error('Enter form title first');

                    return;
                  }
                  const auto = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                  setSlug(auto);
                  toast.success(`Slug auto-generated: "${auto}"`);
                }}
                className="p-1 hover:text-primary text-muted-foreground transition-colors rounded hover:bg-accent cursor-pointer"
                title="Auto-generate slug from title"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCopyLiveUrl}
                className="p-1 hover:text-foreground text-muted-foreground transition-colors ml-0.5 rounded hover:bg-accent cursor-pointer"
                title="Copy Public Form URL to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSlugModalOpen(true)}
              className="h-9 px-3 text-sm text-foreground bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary gap-1.5 font-medium transition-all cursor-pointer group shadow-2xs"
              title="Open Visual Slug & Canonical URL Inspector"
            >
              <Globe className="w-3.5 h-3.5 text-primary group-hover:text-primary-foreground transition-colors" />
              <span>Slug Manager</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/f/${activeSlug}`, '_blank')}
              className="h-9 px-3 text-sm text-primary hover:bg-primary/10 gap-1.5 font-medium cursor-pointer"
              title="Open Public Candidate URL in New Tab"
            >
              <span>Public</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Compact Aligned Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Design Health Score Pill */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setInspectorTab('audit');
              setIsDesignPanelOpen(true);
            }}
            className="text-sm h-9 px-3.5 gap-2 font-semibold transition-all shadow-xs bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer group"
            title="Inspect form health, design validation warnings, and 1-click auto-fixes"
          >
            <Shield className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
            <span>Health: {designReport.score}%</span>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 h-5 font-bold bg-primary/10 text-primary group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground transition-colors"
            >
              {designReport.grade}
            </Badge>
          </Button>

          {/* Dedicated AI Studio Trigger Button */}
          <AiSectionAssistant section="builder" title="AI Studio" />

          {/* Unified Tools ▾ Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm h-9 px-3.5 gap-2 bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-xs hover:shadow-md transition-all duration-150 font-semibold cursor-pointer group"
                title="Open secondary builder tools and integrations"
              >
                <Wand2 className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                <span>Tools</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover border border-border shadow-xl p-1 text-sm">
              <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Integrations & Tools
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => setIsGoogleModalOpen(true)}
                className="gap-2.5 p-2 rounded-md cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary border border-transparent hover:border-primary/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Import Google Form</div>
                  <div className="text-sm text-muted-foreground">Import fields, auth & customize logic</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsFlowModalOpen(true)}
                className="gap-2.5 p-2 rounded-md cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary border border-transparent hover:border-primary/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <GitBranch className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Branching Flow & DAG</div>
                  <div className="text-sm text-muted-foreground">Visual graph & path simulation</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsJsonModalOpen(true)}
                className="gap-2.5 p-2 rounded-md cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary border border-transparent hover:border-primary/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <FileJson className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">JSON Schema Studio</div>
                  <div className="text-sm text-muted-foreground">Export, backup or edit raw JSON</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/60" />

              <div className="p-1">
                <AiSectionAssistant section="builder" title="AI Section Studio" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dedicated Live Preview Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open('/preview/' + activeSlug + '?test=true', '_blank')}
            className="text-sm h-9 px-3.5 gap-2 bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-xs hover:shadow-md transition-all duration-150 font-semibold cursor-pointer group"
            title="Preview interactive form in a new tab"
          >
            <Eye className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
            <span>Preview</span>
          </Button>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9 px-4 gap-2 font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Form'}</span>
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm text-center font-medium">
          {saveStatus}
        </div>
      )}

      {/* 2-Column Responsive Layout: Google Forms Central Canvas + Sticky Sidebar Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column: Google Forms Canvas */}
        <div className="lg:col-span-8 space-y-5">
          {/* Prominent Google Forms Header Card */}
          <Card className="border border-border/80 bg-card shadow-sm rounded-2xl overflow-hidden animate-sweet-fade-in">
            {/* Top Accent Ribbon (Dynamic Theme Tint) */}
            <div className="h-2.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full" />

            <CardContent className="p-6 sm:p-7 space-y-4">
              {/* Form Title & Description */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Assessment Form"
                  className="w-full text-2xl font-bold bg-transparent border-0 border-b border-border/40 hover:border-border focus:border-primary focus:outline-none transition-colors px-1 py-1 text-foreground placeholder:text-muted-foreground/40"
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Form description..."
                  rows={2}
                  className="w-full text-sm text-muted-foreground bg-transparent border-0 border-b border-border/30 hover:border-border focus:border-primary focus:outline-none transition-colors px-1 py-1 resize-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Status and Configuration Pill Row */}
              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Form Type Select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-foreground text-sm font-semibold shrink-0">Type:</span>
                    <Select
                      value={formType}
                      onValueChange={(val) => setFormType(val as FormType)}
                    >
                      <SelectTrigger className="h-9 w-auto min-w-[235px] shrink-0 text-sm font-semibold bg-background border border-border shadow-2xs cursor-pointer">
                        <SelectValue placeholder="Form Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz" className="text-sm py-2">Knowledge Quiz (Scored)</SelectItem>
                        <SelectItem value="employee_signup" className="text-sm py-2">Candidate Application</SelectItem>
                        <SelectItem value="survey" className="text-sm py-2">Public Survey</SelectItem>
                        <SelectItem value="general_form" className="text-sm py-2">General Multi-Step Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Form Access Select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-foreground text-sm font-semibold shrink-0">Access:</span>
                    <Select
                      value={formAccess}
                      onValueChange={(val) => setFormAccess(val as FormAccessType)}
                    >
                      <SelectTrigger className="h-9 w-auto min-w-[180px] shrink-0 text-sm font-semibold bg-background border border-border shadow-2xs cursor-pointer">
                        <SelectValue placeholder="Access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public" className="text-sm py-2">Public Access</SelectItem>
                        <SelectItem value="authenticated" className="text-sm py-2">Token / Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sequential Progression Switch */}
                  <div className="flex items-center gap-2.5 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
                    <Label htmlFor="sequential-toggle" className="text-sm font-semibold cursor-pointer text-foreground">
                      Sequential
                    </Label>
                    <Switch
                      id="sequential-toggle"
                      checked={isSequential}
                      onCheckedChange={setIsSequential}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Questions & Points Badges */}
                  <div className="flex items-center gap-2 font-mono">
                    <Badge variant="outline" className="text-sm font-bold bg-background px-2.5 py-1">
                      {fields.length} Qs
                    </Badge>
                    <Badge variant="secondary" className="text-sm font-bold bg-primary/10 text-primary border-primary/20 px-2.5 py-1">
                      {totalPoints} Pts
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Filter Toolbar */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Questions & Fields</h2>
              <span className="text-sm text-muted-foreground">({displayedFields.length} of {fields.length})</span>
            </div>

            {distinctGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filter Section:</span>
                <Select
                  value={selectedGroupFilter}
                  onValueChange={setSelectedGroupFilter}
                >
                  <SelectTrigger className="h-8 min-w-[150px] w-auto max-w-[220px] text-sm bg-background">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {distinctGroups.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Drag-and-Drop Sortable Context */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayedFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {displayedFields.map((field, index) => {
                  const isFirstInGroup =
                    field.group &&
                    (index === 0 || displayedFields[index - 1]?.group !== field.group);

                  return (
                    <React.Fragment key={field.id}>
                      {/* Visual Google Forms Section Header Banner */}
                      {isFirstInGroup && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 shadow-xs">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold uppercase tracking-wider text-primary">
                              Section: {field.group}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 gap-1 font-mono font-medium"
                              onClick={() => {
                                const sectionFields = fields.filter((f) => f.group === field.group);
                                const jsonStr = JSON.stringify(sectionFields, null, 2);
                                navigator.clipboard.writeText(jsonStr);
                                toast.success(`Section "${field.group}" JSON copied (${sectionFields.length} questions)!`);
                              }}
                              title="Export all questions in this section as JSON"
                            >
                              <FileJson className="w-3 h-3" />
                              <span>Export Section JSON</span>
                            </Button>
                            <Badge variant="outline" className="text-sm bg-background">
                              Section
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div id={`field-card-${field.id}`}>
                        <SortableFieldCard
                          id={field.id}
                          index={index}
                          field={field}
                          otherFields={fields.filter((f) => f.id !== field.id)}
                          allFields={fields}
                          isQuiz={formType === 'quiz'}
                          designIssues={designReport.issues.filter((i) => i.fieldId === field.id)}
                          onUpdate={(fieldId, updates) => updateField(fieldId, updates)}
                          onRemove={(fieldId) => removeField(fieldId)}
                          onDuplicate={handleDuplicateField}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          {/* Empty State */}
          {displayedFields.length === 0 && (
            <div className="p-10 text-center border-2 border-dashed rounded-xl bg-card border-border/80 text-muted-foreground space-y-3">
              <Sparkles className="w-8 h-8 text-primary mx-auto opacity-60" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-foreground">No questions added yet</p>
                <p className="text-sm max-w-sm mx-auto">
                  Click any question type from the palette on the right to start building your form.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('multiple_choice')}
                className="text-sm gap-1.5 bg-background border border-border text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-all font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Multiple Choice</span>
              </Button>
            </div>
          )}

          {/* Bottom Canvas Quick Add Prompt */}
          {displayedFields.length > 0 && (
            <div className="flex items-center justify-center p-3 border border-dashed border-border/80 rounded-xl bg-muted/10 hover:bg-accent/20 transition-colors">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAdd('multiple_choice')}
                className="text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-all gap-2 font-medium"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Add Multiple Choice Question</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Unified Inspector Dock */}
        <div className="lg:col-span-4 sticky top-6">
          <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
            <Tabs value={inspectorTab} onValueChange={setInspectorTab} className="w-full">
              {/* Sleek Segmented Dock Tabs Header */}
              <div className="p-2 border-b border-border/80 bg-muted/20">
                <TabsList className="grid grid-cols-4 h-10 p-1 bg-muted/60 rounded-xl">
                  <TabsTrigger
                    value="palette"
                    className="text-sm py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Fields</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="text-sm py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer"
                  >
                    <ListOrdered className="w-4 h-4 text-primary" />
                    <span>Outline</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4.5 font-mono font-bold">
                      {fields.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="audit"
                    className="text-sm py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Audit</span>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5 h-4.5 font-mono font-bold bg-primary/10 text-primary"
                    >
                      {designReport.grade}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="text-sm py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-primary" />
                    <span>Config</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Component Palette */}
              <TabsContent value="palette" className="p-3 m-0 focus-visible:outline-none">
                <FieldPalette
                  onAddField={handleQuickAdd}
                  activeCount={fields.length}
                  layoutMode="vertical"
                  isEmbedded={true}
                />
              </TabsContent>

              {/* Tab 2: Questions Outline */}
              <TabsContent value="outline" className="p-3 m-0 space-y-3 focus-visible:outline-none">
                <div className="space-y-2">
                  {/* Outline Search Filter */}
                  <div className="relative">
                    <Input
                      value={outlineFilter}
                      onChange={(e) => setOutlineFilter(e.target.value)}
                      placeholder="Filter questions outline..."
                      className="h-8 text-sm pl-7 pr-7 bg-muted/30 border-border/80 rounded-lg placeholder:text-muted-foreground/70"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    {outlineFilter && (
                      <button
                        type="button"
                        onClick={() => setOutlineFilter('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm p-0.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Scrollable Questions List */}
                  {fields.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No questions in this form yet. Use the Fields tab to add questions.
                    </div>
                  ) : (
                    <div className="max-h-[calc(100vh-380px)] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {fields
                        .map((f, idx) => ({ field: f, index: idx }))
                        .filter(({ field }) => {
                          if (!outlineFilter.trim()) return true;
                          const q = outlineFilter.toLowerCase();
                          return (
                            field.label.toLowerCase().includes(q) ||
                            field.type.toLowerCase().includes(q) ||
                            (field.group && field.group.toLowerCase().includes(q))
                          );
                        })
                        .map(({ field: f, index: idx }) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/40 transition-colors group text-sm shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => scrollToField(f.id)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-left truncate mr-2"
                              title="Click to jump to this question on canvas"
                            >
                              <span className="font-mono text-sm text-muted-foreground w-5 h-5 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border/60">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="truncate text-foreground group-hover:text-primary transition-colors text-xs font-semibold block">
                                  {f.label || 'Untitled Question'}
                                </span>
                                <span className="text-xs text-muted-foreground block truncate capitalize font-mono">
                                  {f.type.replace('_', ' ')}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {f.isRequired && (
                                <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-rose-500/30 text-rose-500 bg-rose-500/10 font-bold" title="Required">
                                  Req
                                </Badge>
                              )}
                              {f.points && f.points > 0 ? (
                                <Badge variant="outline" className="text-xs px-1 py-0 h-4 font-mono bg-primary/5 text-primary border-primary/20">
                                  {f.points}pt
                                </Badge>
                              ) : null}

                              {/* Reorder Buttons */}
                              <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveField(idx, 'up')}
                                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                  title="Move question up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === fields.length - 1}
                                  onClick={() => handleMoveField(idx, 'down')}
                                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                  title="Move question down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Summary Stats Row */}
                  <div className="pt-2 border-t border-border/60 grid grid-cols-4 gap-1.5 text-center text-sm text-muted-foreground">
                    <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                      <span className="block font-bold text-foreground text-sm">{fields.length}</span>
                      <span>Questions</span>
                    </div>
                    <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                      <span className="block font-bold text-foreground text-sm">{requiredCount}</span>
                      <span>Required</span>
                    </div>
                    <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                      <span className="block font-bold text-foreground text-sm">{totalPoints}</span>
                      <span>Points</span>
                    </div>
                    <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                      <span className="block font-bold text-foreground text-sm">
                        ~{Math.max(1, Math.round(fields.length * 1.5))}m
                      </span>
                      <span>Est. Time</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Embedded Design Validation Audit */}
              <TabsContent value="audit" className="p-3 m-0 focus-visible:outline-none">
                <DesignValidationSidebarView
                  report={designReport}
                  fields={fields}
                  onUpdateFields={setFields}
                  onJumpToField={scrollToField}
                  onOpenFullDialog={() => setIsDesignPanelOpen(true)}
                />
              </TabsContent>

              {/* Tab 4: Form Settings / Config */}
              <TabsContent value="settings" className="p-3 m-0 space-y-3 focus-visible:outline-none text-sm">
                {/* 1. Access & Candidate Permissions */}
                <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Access & Security</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Form Access Policy</Label>
                    <Select
                      value={formAccess}
                      onValueChange={(val) => setFormAccess(val as FormAccessType)}
                    >
                      <SelectTrigger className="w-full h-8 text-sm bg-background">
                        <SelectValue placeholder="Select Access Policy" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="public" className="text-sm">
                          🌍 Public (Anyone with link)
                        </SelectItem>
                        <SelectItem value="token" className="text-sm">
                          🔑 Secret Token Required
                        </SelectItem>
                        <SelectItem value="invite_only" className="text-sm">
                          ✉️ Invite Only (White-listed candidates)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 2. Assessment Mode & Scoring Engine */}
                <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span>Assessment & Evaluation</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Evaluation Mode</Label>
                    <Select
                      value={formType}
                      onValueChange={(val) => setFormType(val as FormType)}
                    >
                      <SelectTrigger className="w-full h-8 text-sm bg-background">
                        <SelectValue placeholder="Select Form Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="quiz" className="text-sm">
                          🏆 Graded Knowledge Quiz (Points & Pass/Fail)
                        </SelectItem>
                        <SelectItem value="survey" className="text-sm">
                          📝 Survey / Application Form (No grading)
                        </SelectItem>
                        <SelectItem value="poll" className="text-sm">
                          📊 Live Instant Poll
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quiz Passing Score & Time Limit */}
                  {formType === 'quiz' && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">Pass Threshold:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <Input
                            type="number"
                            value={settings.passingScore ?? 70}
                            onChange={(e) =>
                              updateSettings({ passingScore: Number(e.target.value) || 0 })
                            }
                            className="h-7 w-16 text-sm text-right bg-background"
                          />
                          <span>%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Time Limit:</span>
                        </span>
                        <div className="flex items-center gap-1 font-mono">
                          <Input
                            type="number"
                            value={settings.timeLimitSeconds ?? 600}
                            onChange={(e) =>
                              updateSettings({ timeLimitSeconds: Number(e.target.value) || 0 })
                            }
                            className="h-7 w-20 text-sm text-right bg-background"
                          />
                          <span>sec</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Presentation Pacing */}
                <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground block text-sm">Focus Step-by-Step</span>
                      <span className="text-sm text-muted-foreground">Present 1 question per screen</span>
                    </div>
                    <Switch
                      checked={isSequential}
                      onCheckedChange={setIsSequential}
                    />
                  </div>
                </div>

                {/* Auto-Save Notice */}
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Changes apply immediately and persist automatically.</span>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* JSON Import/Export Modal */}
      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} />

      {/* Google Forms Importer Modal */}
      <GoogleFormsImportModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onImport={handleImportGoogleForm}
      />

      {/* Visual Branching Flow & Dependency Simulation Modal */}
      <BranchingFlowModal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        fields={fields}
      />

      {/* Visual Slug & Canonical URL Management Inspector */}
      <SlugManagementModal
        isOpen={isSlugModalOpen}
        onClose={() => setIsSlugModalOpen(false)}
        currentSlug={slug || ''}
        formTitle={title}
        onUpdateSlug={(newSlug) => setSlug(newSlug)}
      />

      {/* Design Validation & Quality Health Inspector Panel */}
      <DesignValidationPanel
        isOpen={isDesignPanelOpen}
        onClose={() => setIsDesignPanelOpen(false)}
        report={designReport}
        fields={fields}
        onUpdateFields={setFields}
        onJumpToField={scrollToField}
      />
    </div>
  );
};

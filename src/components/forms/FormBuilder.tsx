import React, { useState } from 'react';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  FormField,
  FieldType,
  FormType,
  FormAccessType,
} from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormRunner } from '@/components/runner/FormRunner';
import { JsonModal } from './json-modal';
import { AiSectionAssistant } from '@/components/admin/ai-section-assistant';
import { BranchingFlowModal } from './branching-flow-modal';
import { SortableFieldCard } from './sortable-field-card';
import { FieldPalette } from './field-palette';
import { toast } from 'sonner';
import {
  Eye,
  Save,
  FileJson,
  GitBranch,
  Copy,
  ExternalLink,
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
    formType,
    formAccess,
    isSequential,
    settings,
    fields,
    isSaving,
    setTitle,
    setDescription,
    setFormType,
    setFormAccess,
    setIsSequential,
    updateSettings,
    addField,
    updateField,
    removeField,
    setFields,
    saveForm,
    resetForm,
  } = useQuizStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

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
        setFields(arrayMove(fields, oldIndex, newIndex));
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
    };

    addField({
      id: newId,
      type,
      label: defaults[type]?.label || 'New Question',
      placeholder: defaults[type]?.placeholder || '',
      isRequired: true,
      options: defaults[type]?.options,
      correctAnswer: defaults[type]?.correctAnswer,
      url: defaults[type]?.url,
      linkText: defaults[type]?.linkText,
      validationRule: defaults[type]?.validationRule,
      points: 10,
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

  const handleCopyLiveUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173';
    const liveUrl = `${origin}/preview`;
    navigator.clipboard.writeText(liveUrl);
    toast.success(`Copied Live Form URL: ${liveUrl}`);
  };

  // Group filter calculation
  const distinctGroups = Array.from(new Set(fields.map((f) => f.group).filter(Boolean))) as string[];
  const displayedFields =
    selectedGroupFilter === 'all'
      ? fields
      : fields.filter((f) => f.group === selectedGroupFilter);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Form & Question Builder
            </h1>
            <Badge variant="secondary" className="text-xs font-mono">v2.5</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Design multi-stage assessments, question branching, live regex matching, and scored quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Instruction Studio Button */}
          <AiSectionAssistant section="builder" title="AI Architect" />

          {/* Compacted JSON Import/Export Actions Menu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJsonModalOpen(true)}
            className="text-xs h-8 gap-1.5 border-border"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Actions ▾</span>
          </Button>

          {/* Visual Branching Flow Inspector */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlowModalOpen(true)}
            className="text-xs h-8 gap-1.5 border-border text-primary hover:bg-primary/10"
            title="Inspect visual branching dependency map and simulate candidate path"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branching Flow</span>
          </Button>

          {/* Live Runner Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs h-8 gap-1.5 border-border"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </Button>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary text-xs h-8 gap-1.5 font-semibold">
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Form'}</span>
          </Button>
        </div>
      </div>

      {/* Live Form URL & Direct Access Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/20 rounded-xl border border-border/80">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase">
            ● Live Form URL
          </Badge>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-xs sm:max-w-md">
            {typeof window !== 'undefined' ? `${window.location.origin}/preview` : 'https://wpexam.io/preview'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLiveUrl}
            className="text-xs h-7 px-2.5 gap-1.5 border-border hover:bg-muted"
            title="Copy Public Live URL to Clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Live URL</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open('/preview', '_blank')}
            className="text-xs h-7 px-2.5 gap-1.5 border-border text-primary hover:bg-primary/10"
            title="Open Dedicated Full-Screen Live Preview in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs text-center font-medium">
          {saveStatus}
        </div>
      )}

      {/* Form Details & Workflow Settings Card */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/15">
          <CardTitle className="text-sm font-semibold text-foreground">Form Configuration & Access Rules</CardTitle>
          <CardDescription className="text-xs">Configure purpose, access permissions, and sequential rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold block mb-1">Form Purpose / Type</Label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as FormType)}
                className="w-full h-9 px-2 border border-input rounded-md text-xs bg-background text-foreground font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              >
                <option value="quiz" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Knowledge Quiz (Graded & Scored)</option>
                <option value="employee_signup" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Candidate Application / Onboarding</option>
                <option value="survey" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Public Survey & Evaluation</option>
                <option value="general_form" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">General Multi-Step Form</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold block mb-1">Access Control</Label>
              <select
                value={formAccess}
                onChange={(e) => setFormAccess(e.target.value as FormAccessType)}
                className="w-full h-9 px-2 border border-input rounded-md text-xs bg-background text-foreground font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              >
                <option value="public" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Public (Open to All Candidates)</option>
                <option value="authenticated" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Authenticated / Token Only</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="sequential-toggle" className="text-xs font-semibold cursor-pointer">
                  Sequential Progression
                </Label>
                <Switch
                  id="sequential-toggle"
                  checked={isSequential}
                  onCheckedChange={setIsSequential}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">Presents questions one-at-a-time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="text-xs font-semibold block mb-1">Form Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intern Developer Technical Screening"
                className="font-bold text-sm bg-background text-foreground"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold block mb-1">Description / Subtitle</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary or instructions..."
                className="text-sm bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorized Field Palette (Quick Add Component) */}
      <FieldPalette onAddField={handleQuickAdd} activeCount={fields.length} />

      {/* Fields List Container */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">Fields & Question Sequence</h2>
            <Badge variant="outline" className="font-mono text-xs">{fields.length} items</Badge>
          </div>

          {distinctGroups.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Filter Group:</span>
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="text-xs h-7 px-2 border border-input rounded bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              >
                <option value="all" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">All Groups</option>
                {distinctGroups.map((g) => (
                  <option key={g} value={g} className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Drag-and-Drop Sortable Context */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayedFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {displayedFields.map((field, index) => (
              <SortableFieldCard
                key={field.id}
                id={field.id}
                index={index}
                field={field}
                otherFields={fields.filter((f) => f.id !== field.id)}
                allFields={fields}
                isQuiz={formType === 'quiz'}
                onUpdate={(fieldId, updates) => updateField(fieldId, updates)}
                onRemove={(fieldId) => removeField(fieldId)}
                onDuplicate={handleDuplicateField}
              />
            ))}
          </SortableContext>
        </DndContext>

        {displayedFields.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground space-y-2">
            <p className="font-medium text-sm">No fields found in this view.</p>
            <p className="text-xs">Use the field palette above to add question types, inputs, or verification items.</p>
          </div>
        )}
      </div>

      {/* JSON Import/Export Modal */}
      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} />

      {/* Visual Branching Flow & Dependency Simulation Modal */}
      <BranchingFlowModal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        fields={fields}
      />

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-card rounded-2xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-bold">Interactive Preview</h3>
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
            <FormRunner
              form={{
                title,
                description,
                formType,
                formAccess,
                isSequential,
                isPublished: true,
                settings,
                fields,
              }}
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

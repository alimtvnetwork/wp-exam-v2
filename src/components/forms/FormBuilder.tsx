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
import { FormRunner } from '@/components/runner/FormRunner';
import { JsonModal } from './json-modal';
import { GoogleFormsImportModal } from './google-forms-import-modal';
import { AiSectionAssistant } from '@/components/admin/ai-section-assistant';
import { BranchingFlowModal } from './branching-flow-modal';
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
    addField,
    updateField,
    removeField,
    setFields,
    saveForm,
  } = useQuizStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const handleImportGoogleForm = (
    data: { title: string; description: string; fields: FormField[] },
    isReplaceMode: boolean
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Form & Assessment Builder
            </h1>
            <Badge variant="secondary" className="text-xs font-mono">Google Forms Studio</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Design professional assessments, compound validations, custom branching, and scored quizzes.
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

          {/* Import from Google Forms Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGoogleModalOpen(true)}
            className="text-xs h-8 gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium"
            title="Import questions directly from a Google Form or API"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import Google Form</span>
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

          {/* Live Runner Preview Modal */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs h-8 gap-1.5 border-border"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Modal Preview</span>
          </Button>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 font-semibold"
          >
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

      {/* 2-Column Responsive Layout: Google Forms Central Canvas + Sticky Sidebar Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column: Google Forms Canvas */}
        <div className="lg:col-span-8 space-y-5">
          {/* Prominent Google Forms Header Card */}
          <Card className="border-border bg-card shadow-sm rounded-xl overflow-hidden">
            {/* Top Accent Gradient Ribbon */}
            <div className="h-2.5 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 w-full" />

            <CardContent className="p-5 sm:p-6 space-y-4">
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
                  placeholder="Form description, instructions for candidates, or evaluation criteria..."
                  rows={2}
                  className="w-full text-sm text-muted-foreground bg-transparent border-0 border-b border-border/30 hover:border-border focus:border-primary focus:outline-none transition-colors px-1 py-1 resize-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Status and Configuration Pill Row */}
              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Form Type Select */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium">Type:</span>
                    <Select
                      value={formType}
                      onValueChange={(val) => setFormType(val as FormType)}
                    >
                      <SelectTrigger className="h-7 w-[160px] text-xs bg-background">
                        <SelectValue placeholder="Form Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Knowledge Quiz (Scored)</SelectItem>
                        <SelectItem value="employee_signup">Candidate Application</SelectItem>
                        <SelectItem value="survey">Public Survey</SelectItem>
                        <SelectItem value="general_form">General Multi-Step Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Form Access Select */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium">Access:</span>
                    <Select
                      value={formAccess}
                      onValueChange={(val) => setFormAccess(val as FormAccessType)}
                    >
                      <SelectTrigger className="h-7 w-[140px] text-xs bg-background">
                        <SelectValue placeholder="Access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public Access</SelectItem>
                        <SelectItem value="authenticated">Token / Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sequential Progression Switch */}
                  <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-md border border-border/60">
                    <Label htmlFor="sequential-toggle" className="text-[11px] font-medium cursor-pointer text-muted-foreground">
                      Sequential
                    </Label>
                    <Switch
                      id="sequential-toggle"
                      checked={isSequential}
                      onCheckedChange={setIsSequential}
                      className="scale-75"
                    />
                  </div>

                  {/* Questions & Points Badges */}
                  <div className="flex items-center gap-1.5 font-mono">
                    <Badge variant="outline" className="text-[10px] bg-background">
                      {fields.length} Qs
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      {totalPoints} Pts
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group / Module Filter Toolbar */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Questions & Fields</h2>
              <span className="text-xs text-muted-foreground">({displayedFields.length} of {fields.length})</span>
            </div>

            {distinctGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Filter Section:</span>
                <Select
                  value={selectedGroupFilter}
                  onValueChange={setSelectedGroupFilter}
                >
                  <SelectTrigger className="h-7 w-[140px] text-xs bg-background">
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
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              Section: {field.group}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-background">
                            Module Group
                          </Badge>
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
                <p className="text-xs max-w-sm mx-auto">
                  Click any question type from the palette on the right to start building your form.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('multiple_choice')}
                className="text-xs gap-1.5 border-border"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Multiple Choice</span>
              </Button>
            </div>
          )}

          {/* Bottom Canvas Quick Add Prompt */}
          {displayedFields.length > 0 && (
            <div className="flex items-center justify-center p-3 border border-dashed border-border/80 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAdd('multiple_choice')}
                className="text-xs text-muted-foreground hover:text-foreground gap-2"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Add Multiple Choice Question</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Sidebar with Palette & Navigator */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          {/* Quick Navigator Outline */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">Questions Outline</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {fields.length} items
                </Badge>
              </div>

              {fields.length === 0 ? (
                <p className="text-[11px] text-muted-foreground py-2 text-center">
                  Add questions to see the outline.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {fields.map((f, idx) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => scrollToField(f.id)}
                      className="w-full flex items-center justify-between text-left p-1.5 rounded hover:bg-muted text-xs transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] font-mono text-muted-foreground w-4">
                          {idx + 1}.
                        </span>
                        <span className="truncate text-foreground group-hover:text-primary transition-colors text-[11px]">
                          {f.label || 'Untitled Question'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {f.isRequired && (
                          <span className="text-[9px] text-rose-500 font-bold" title="Required">*</span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {f.points || 0}pt
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Summary Stats Row */}
              <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-center text-[10px] text-muted-foreground">
                <div className="p-1.5 bg-muted/30 rounded border border-border/40">
                  <span className="block font-bold text-foreground">{requiredCount}</span>
                  <span>Required</span>
                </div>
                <div className="p-1.5 bg-muted/30 rounded border border-border/40">
                  <span className="block font-bold text-foreground">{totalPoints}</span>
                  <span>Total Points</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vertical Field Palette */}
          <FieldPalette
            onAddField={handleQuickAdd}
            activeCount={fields.length}
            layoutMode="vertical"
          />
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

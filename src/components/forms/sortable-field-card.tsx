import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FormField,
  FieldType,
  StringMatchRuleType,
  SingleValidationItem,
  VALIDATION_PRESETS,
  evaluateCompoundValidation,
  evaluateFileUploadValidation,
  FileValidationRule,
  FieldActionTrigger,
} from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BranchingRuleEditor } from './branching-rule-editor';
import { QuestionAiStudioModal } from './question-ai-studio-modal';
import {
  GripVertical,
  Trash2,
  SlidersHorizontal,
  GitBranch,
  Copy,
  CheckCircle2,
  Check,
  AlertCircle,
  ExternalLink,
  Code,
  Link as LinkIcon,
  HelpCircle,
  Eye,
  BellRing,
  Plus,
  Phone,
  Mail,
  Layers,
  ChevronDown,
  AlertTriangle,
  UploadCloud,
  FileText,
  FileJson,
  Upload,
  Sparkles,
  X,
  Star,
  Calendar,
  CircleDot,
  CheckSquare,
} from 'lucide-react';
import { DesignValidationIssue } from '@/lib/design-validation-engine';

interface SortableFieldCardProps {
  id: string;
  index: number;
  field: FormField;
  otherFields: FormField[];
  allFields?: FormField[];
  isQuiz: boolean;
  designIssues?: DesignValidationIssue[];
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const SortableFieldCard: React.FC<SortableFieldCardProps> = ({
  id,
  index,
  field,
  otherFields,
  allFields,
  isQuiz,
  designIssues,
  onUpdate,
  onRemove,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);
  const [testInputValue, setTestInputValue] = useState('');

  // Interactive Live Preview Local States
  const [previewTestCountry, setPreviewTestCountry] = useState('+1');
  const [previewTestPhone, setPreviewTestPhone] = useState('');
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState<string>('');
  const [previewMultipleChoices, setPreviewMultipleChoices] = useState<string[]>([]);
  const [previewRating, setPreviewRating] = useState<number>(0);
  const [previewDate, setPreviewDate] = useState<string>('');
  const [previewScale, setPreviewScale] = useState<number>(5);
  const [previewParagraph, setPreviewParagraph] = useState<string>('');
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [previewUploadedFile, setPreviewUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedJson, setPastedJson] = useState('');

  const handleApplyPastedJson = () => {
    try {
      const parsed = JSON.parse(pastedJson);

      if (!parsed || typeof parsed !== 'object') {
        toast.error('Invalid JSON structure: Must be an object');

        return;
      }

      delete parsed.id;
      onUpdate(id, parsed);
      setIsImportModalOpen(false);
      setPastedJson('');
      toast.success('Question updated successfully from JSON!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON syntax';
      toast.error('JSON Parse Error: ' + msg);
    }
  };

  const handleExportJson = () => {
    try {
      const jsonStr = JSON.stringify(field, null, 2);
      navigator.clipboard.writeText(jsonStr);
      toast.success(`Question #${index + 1} JSON copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const isChoiceField =
    field.type === 'multiple_choice' ||
    field.type === 'single_choice' ||
    field.type === 'dropdown';
  const isLinkField = field.type === 'link';
  const isRegexField = field.type === 'regex_text';
  const isFileUploadField = field.type === 'file_upload';
  const isTextInputField =
    field.type === 'short_answer' ||
    field.type === 'paragraph' ||
    field.type === 'email' ||
    field.type === 'regex_text';

  // Normalize validation rules to compound array structure
  const rawRules = field.validationRule?.rules;
  const legacyRule = field.validationRule?.ruleType || field.validationRule?.pattern;
  const activeRules: SingleValidationItem[] = rawRules && rawRules.length > 0
    ? rawRules
    : legacyRule
      ? [
          {
            id: 'rule-legacy',
            ruleType: field.validationRule?.ruleType || 'regex',
            pattern: field.validationRule?.pattern || '',
            errorMessage: field.validationRule?.errorMessage || '',
          },
        ]
      : [];

  const compoundOperator = field.validationRule?.operator || 'AND';

  // Real-time compound validation feedback
  const testFeedback = evaluateCompoundValidation(field.validationRule, testInputValue);

  // Update compound validation rules
  const handleUpdateRules = (updatedRules: SingleValidationItem[], operator = compoundOperator) => {
    onUpdate(id, {
      validationRule: {
        operator,
        rules: updatedRules,
        ruleType: updatedRules[0]?.ruleType,
        pattern: updatedRules[0]?.pattern,
        errorMessage: updatedRules[0]?.errorMessage,
      },
    });
  };

  const handleAddRule = () => {
    const newRule: SingleValidationItem = {
      id: `rule-${Date.now()}`,
      ruleType: 'starts_with',
      pattern: '',
      errorMessage: '',
    };
    handleUpdateRules([...activeRules, newRule]);
  };

  const handleRemoveRule = (ruleId: string) => {
    const updated = activeRules.filter((r) => r.id !== ruleId);
    handleUpdateRules(updated);
  };

  const handleRuleChange = (ruleId: string, updates: Partial<SingleValidationItem>) => {
    const updated = activeRules.map((r) => {
      if (r.id === ruleId) {
        return { ...r, ...updates };
      }
      return r;
    });
    handleUpdateRules(updated);
  };

  // Triggers handling
  const activeTriggers = field.triggers || [];
  const handleAddTrigger = (type: 'email_alert' | 'whatsapp_webhook') => {
    const newTrig: FieldActionTrigger = {
      id: `trig-${Date.now()}`,
      type,
      target: type === 'email_alert' ? 'admin@company.org' : 'https://api.whatsapp.com/send',
    };
    onUpdate(id, { triggers: [...activeTriggers, newTrig] });
  };

  const handleRemoveTrigger = (trigId: string) => {
    onUpdate(id, { triggers: activeTriggers.filter((t) => t.id !== trigId) });
  };

  const getBadgeStyle = (type: FieldType) => {
    switch (type) {
      case 'multiple_choice':
      case 'single_choice':
      case 'true_false':
      case 'dropdown':
      case 'rating':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'short_answer':
      case 'paragraph':
      case 'email':
      case 'phone':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'regex_text':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'link':
      case 'file_upload':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Live WhatsApp preview helper
  const cleanPhone = previewTestPhone.replace(/[^0-9]/g, '').replace(/^0+/, '');
  const previewWhatsAppLink = cleanPhone ? `https://wa.me/${previewTestCountry.replace('+', '')}${cleanPhone}` : '';

  // Dedicated File Validation Helper
  const currentFileValidation: FileValidationRule = field.fileValidation || {
    maxSizeMb: 10,
    allowedExtensions: ['pdf', 'docx', 'zip', 'png', 'jpg'],
    customErrorMessage: '',
  };

  const handleUpdateFileValidation = (updates: Partial<FileValidationRule>) => {
    onUpdate(id, {
      fileValidation: {
        ...currentFileValidation,
        ...updates,
      },
    });
  };

  const handleToggleExtension = (ext: string) => {
    const cleanExt = ext.toLowerCase().replace(/^\./, '');
    const currentExts = currentFileValidation.allowedExtensions || [];
    const hasExt = currentExts.includes(cleanExt);
    const newExts = hasExt
      ? currentExts.filter((e) => e !== cleanExt)
      : [...currentExts, cleanExt];

    handleUpdateFileValidation({ allowedExtensions: newExts });
  };

  const previewFileValidationResult = evaluateFileUploadValidation(
    field.fileValidation,
    previewUploadedFile
  );

  const availableSections = Array.from(
    new Set(
      (allFields || otherFields || [])
        .map((f) => f.group?.trim())
        .filter((g): g is string => Boolean(g && g.length > 0))
    )
  );

  const isFileUploadValidationDrawerOpen = showAdvanced && isFileUploadField;

  let isCompoundValidationDrawerOpen = false;

  if (showAdvanced) {
    if (isTextInputField || isRegexField || isChoiceField || isLinkField) {
      isCompoundValidationDrawerOpen = true;
    }
  } else if (isRegexField) {
    isCompoundValidationDrawerOpen = true;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/card mb-3.5">
      <Card
        className={`transition-all duration-200 border bg-card ${
          isDragging
            ? 'shadow-2xl ring-2 ring-primary border-primary/80 scale-[1.01] bg-card/95'
            : 'border-border/80 hover:border-primary/40 shadow-xs hover:shadow-md'
        }`}
      >
        {/* Card Header */}
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 bg-muted/15 space-y-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Dedicated Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
              title="Drag to reposition question"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Question Index & Badges */}
            <CardTitle className="text-xs font-semibold flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold shrink-0">
                #{index + 1}
              </span>

              {field.isRequired ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 border-amber-500/30 text-amber-500 bg-amber-500/10 font-mono tracking-wide shrink-0 flex items-center gap-1 font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Required
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 border-border/80 text-muted-foreground bg-muted/20 font-mono shrink-0"
                >
                  Optional
                </Badge>
              )}

              <Badge
                variant="outline"
                className={`uppercase text-[10px] tracking-wide font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${getBadgeStyle(
                  field.type
                )}`}
              >
                {field.type.replace('_', ' ')}
              </Badge>

              {field.group && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium flex items-center gap-1 shrink-0">
                  <Layers className="w-3 h-3" /> {field.group}
                </span>
              )}

              {isQuiz && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono shrink-0">
                  {field.points ?? 1} pt{(field.points ?? 1) > 1 ? 's' : ''}
                </span>
              )}

              {isFileUploadField && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono shrink-0">
                  Max {field.fileValidation?.maxSizeMb || 10}MB
                </span>
              )}

              {activeRules.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono shrink-0">
                  {activeRules.length} Rule{activeRules.length > 1 ? 's' : ''}
                </span>
              )}

              {activeTriggers.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono flex items-center gap-1 shrink-0">
                  <BellRing className="w-3 h-3" /> {activeTriggers.length}
                </span>
              )}

              {designIssues && designIssues.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono flex items-center gap-1 shrink-0 ${
                    designIssues.some((i) => i.severity === 'error')
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  }`}
                  title={designIssues.map((i) => `• ${i.title}`).join('\n')}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{designIssues.length} issue{designIssues.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </CardTitle>
          </div>

          {/* Action Toolbar: Compacted to Live Preview + Actions Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Live Test Preview Mode Toggle */}
            <Button
              type="button"
              variant={showLivePreview ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-7 px-2.5 gap-1.5 transition-all ${
                showLivePreview
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
              onClick={() => setShowLivePreview(!showLivePreview)}
              title="Toggle interactive live input preview test"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test Preview</span>
            </Button>

            {/* Inline AI Studio Quick Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2 gap-1.5 border-border text-foreground hover:bg-muted transition-all"
              onClick={() => setIsAiStudioOpen(true)}
              title="Open AI Prompt Instructions & Question JSON Schema"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Studio</span>
            </Button>

            {/* Compact Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`text-xs h-7 px-2.5 gap-1.5 border transition-all font-medium ${
                    showAdvanced || showTriggers || showConditions
                      ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Actions</span>
                  {(showAdvanced || showTriggers || showConditions) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1 bg-popover border border-border shadow-lg">
                <DropdownMenuItem
                  onClick={() => setIsAiStudioOpen(true)}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Studio & Schema</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-mono">
                    JSON
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleExportJson}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Question JSON</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono">
                    Copy
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setPastedJson(JSON.stringify(field, null, 2));
                    setIsImportModalOpen(true);
                  }}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Import / Replace JSON</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                    Paste
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/80" />

                <DropdownMenuItem
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isFileUploadField ? 'File Size & Allowed Formats' : 'Validation Rules'}</span>
                  </div>
                  {isFileUploadField ? (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono">
                      {field.fileValidation?.maxSizeMb || 10}MB
                    </Badge>
                  ) : activeRules.length > 0 ? (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono">
                      {activeRules.length}
                    </Badge>
                  ) : null}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowTriggers(!showTriggers)}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-3.5 h-3.5 text-purple-400" />
                    <span>Notification Triggers</span>
                  </div>
                  {activeTriggers.length > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono">
                      {activeTriggers.length}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowConditions(!showConditions)}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-primary" />
                    <span>Branching & Logic</span>
                  </div>
                  {field.conditions && field.conditions.length > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/30 font-mono">
                      {field.conditions.length}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/80" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs flex items-center gap-2 cursor-pointer py-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Move to Section</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-1 bg-popover border border-border shadow-lg">
                    {availableSections.length > 0 ? (
                      availableSections.map((secName) => (
                        <DropdownMenuItem
                          key={secName}
                          disabled={field.group === secName}
                          onClick={() => onUpdate(id, { group: secName })}
                          className={`text-xs flex items-center justify-between cursor-pointer py-1.5 ${
                            field.group === secName ? 'bg-primary/10 font-bold text-primary' : ''
                          }`}
                        >
                          <span className="truncate">{secName}</span>
                          {field.group === secName && <Check className="w-3.5 h-3.5 text-primary" />}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-2 text-[11px] text-muted-foreground italic">No other sections yet</div>
                    )}
                    <DropdownMenuSeparator className="my-1 border-border/80" />
                    <DropdownMenuItem
                      onClick={() => {
                        const name = window.prompt('Enter new section name:');

                        if (name && name.trim().length > 0) {
                          onUpdate(id, { group: name.trim() });
                          toast.success(`Moved question to new section: "${name.trim()}"`);
                        }
                      }}
                      className="text-xs flex items-center gap-2 cursor-pointer py-1.5 text-primary hover:bg-primary/10 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Section...</span>
                    </DropdownMenuItem>

                    {field.group && (
                      <>
                        <DropdownMenuSeparator className="my-1 border-border/80" />
                        <DropdownMenuItem
                          onClick={() => onUpdate(id, { group: undefined })}
                          className="text-xs flex items-center gap-2 cursor-pointer py-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                          <span>Clear Section</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="my-1 border-border/80" />

                <DropdownMenuItem
                  onClick={() => onDuplicate(id)}
                  className="text-xs flex items-center gap-2 cursor-pointer py-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Duplicate Question</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onRemove(id)}
                  className="text-xs flex items-center gap-2 cursor-pointer py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  <span>Delete Question</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Card Content & Question Editor */}
        <CardContent className="space-y-4 p-4">
          {/* Inline Design Diagnostics Notice */}
          {designIssues && designIssues.length > 0 && (
            <div
              className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                designIssues.some((i) => i.severity === 'error')
                  ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Design & Validation Recommendation:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {designIssues.map((issue) => (
                  <li key={issue.id}>
                    <span className="font-medium">{issue.title}:</span> {issue.recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Primary Question / Field Label */}
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold text-foreground block mb-1">
                Question Text / Prompt
              </Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(id, { label: e.target.value })}
                placeholder="Enter field label or question text..."
                className="font-medium text-sm bg-background text-foreground shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Field Type Selector with Radix Select */}
            <div>
              <Label className="text-xs font-semibold text-foreground block mb-1">Field Type</Label>
              <Select
                value={field.type}
                onValueChange={(val) => onUpdate(id, { type: val as FieldType })}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background text-foreground border border-input rounded-md">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-72">
                  <SelectItem value="multiple_choice" className="text-xs">Multiple Choice</SelectItem>
                  <SelectItem value="single_choice" className="text-xs">Single Choice</SelectItem>
                  <SelectItem value="true_false" className="text-xs">True / False</SelectItem>
                  <SelectItem value="dropdown" className="text-xs">Dropdown Select</SelectItem>
                  <SelectItem value="rating" className="text-xs">Rating Scale (1-5)</SelectItem>
                  <SelectItem value="short_answer" className="text-xs">Short Answer</SelectItem>
                  <SelectItem value="paragraph" className="text-xs">Paragraph Text</SelectItem>
                  <SelectItem value="email" className="text-xs">Email Address</SelectItem>
                  <SelectItem value="phone" className="text-xs">WhatsApp / Phone</SelectItem>
                  <SelectItem value="regex_text" className="text-xs">🔤 Regex Verified Input</SelectItem>
                  <SelectItem value="link" className="text-xs">🔗 Reference Link</SelectItem>
                  <SelectItem value="file_upload" className="text-xs">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Section Grouping */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Layers className="w-3 h-3 text-primary" />
                  <span>Section</span>
                </Label>
                <span className="text-[10px] text-muted-foreground" title="Groups related questions into logical sections">
                  Optional
                </span>
              </div>
              <Input
                value={field.group || ''}
                onChange={(e) => onUpdate(id, { group: e.target.value })}
                placeholder="e.g. Core Skills, Coding"
                className="text-xs h-9 bg-background text-foreground shadow-2xs"
              />
            </div>
          </div>

          {/* Reference Link Field Configuration */}
          {isLinkField && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Reference Link Configuration</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Target Link URL</Label>
                  <Input
                    value={field.url || ''}
                    onChange={(e) => onUpdate(id, { url: e.target.value })}
                    placeholder="https://company.org/spec"
                    className="text-xs h-8 font-mono bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Anchor Label</Label>
                  <Input
                    value={field.linkText || ''}
                    onChange={(e) => onUpdate(id, { linkText: e.target.value })}
                    placeholder="Review Official Guidelines"
                    className="text-xs h-8 bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interactive In-Card Live Test Preview Drawer */}
          {showLivePreview && (
            <div className="p-4 bg-muted/40 rounded-xl border border-primary/30 space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Live Interactive Preview & Validation Test
                </span>
                <span className="text-[10px] text-muted-foreground">Test how candidates interact with this field</span>
              </div>

              {/* Phone / WhatsApp Interactive Live Tester */}
              {field.type === 'phone' && (
                <div className="space-y-2 bg-background/60 p-3 rounded-lg border border-border">
                  <Label className="text-xs font-semibold text-foreground">Candidate WhatsApp Input Simulation:</Label>
                  <div className="flex gap-2">
                    <Select value={previewTestCountry} onValueChange={setPreviewTestCountry}>
                      <SelectTrigger className="w-24 h-9 text-xs bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="+1" className="text-xs">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44" className="text-xs">🇬🇧 +44</SelectItem>
                        <SelectItem value="+880" className="text-xs">🇧🇩 +880</SelectItem>
                        <SelectItem value="+91" className="text-xs">🇮🇳 +91</SelectItem>
                        <SelectItem value="+65" className="text-xs">🇸🇬 +65</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={previewTestPhone}
                      onChange={(e) => setPreviewTestPhone(e.target.value)}
                      placeholder="1712345678"
                      className="text-xs h-9 bg-background flex-1"
                    />
                  </div>
                  {previewWhatsAppLink && (
                    <div className="flex items-center justify-between gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 font-mono">
                      <span className="truncate">{previewWhatsAppLink}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] gap-1 border-emerald-500/30 text-emerald-400"
                        onClick={() => window.open(previewWhatsAppLink, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" /> Test Link
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Rating Scale (1-5) Interactive Preview */}
              {field.type === 'rating' && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Candidate Rating Scale Simulation (1 - 5 Stars):</span>
                    </Label>
                    {previewRating > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewRating(0)}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Reset Rating
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPreviewRating(star)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs transition-all ${
                          previewRating >= star
                            ? 'border-amber-500 bg-amber-500/15 text-amber-500 shadow-xs'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 transition-transform ${
                            previewRating >= star
                              ? 'text-amber-500 fill-amber-500 scale-110'
                              : 'text-muted-foreground/60'
                          }`}
                        />
                        <span>{star}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Selected Rating:</span>
                      {previewRating > 0 ? (
                        <span className="text-amber-500 font-bold font-mono">
                          {previewRating} / 5 {'★'.repeat(previewRating)}{'☆'.repeat(5 - previewRating)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">No rating selected (click a star above to rate)</span>
                      )}
                    </div>
                    {previewRating > 0 && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/10 font-mono">
                        {previewRating === 5
                          ? 'Excellent / Mastery'
                          : previewRating === 4
                          ? 'Very Good'
                          : previewRating === 3
                          ? 'Moderate'
                          : previewRating === 2
                          ? 'Fair'
                          : 'Needs Improvement'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* True / False Interactive Preview */}
              {field.type === 'true_false' && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Binary Choice Simulation:</Label>
                    {previewSelectedChoice && (
                      <button
                        type="button"
                        onClick={() => setPreviewSelectedChoice('')}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Reset Selection
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    {['True', 'False'].map((val) => {
                      const isSelected = previewSelectedChoice === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPreviewSelectedChoice(val)}
                          className={`p-3 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? val === 'True'
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-xs'
                                : 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-xs'
                              : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          }`}
                        >
                          {val === 'True' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>

                  {previewSelectedChoice && (
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs flex items-center justify-between flex-wrap gap-2">
                      <span className="text-muted-foreground">
                        Selected: <strong className="text-foreground">{previewSelectedChoice}</strong>
                      </span>
                      {isQuiz && field.correctAnswer && (
                        <span
                          className={`text-[11px] font-semibold flex items-center gap-1 ${
                            field.correctAnswer === previewSelectedChoice ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {field.correctAnswer === previewSelectedChoice
                            ? '✓ Matches Correct Answer (+points)'
                            : '✗ Incorrect Answer (0 points)'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice Interactive Preview */}
              {field.type === 'multiple_choice' && (
                <div className="space-y-2.5 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-primary" />
                      <span>Multi-Select Checkboxes Simulation:</span>
                    </Label>
                    {previewMultipleChoices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewMultipleChoices([])}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Clear Selected ({previewMultipleChoices.length})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(field.options || []).map((opt, i) => {
                      const isChecked = previewMultipleChoices.includes(opt);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setPreviewMultipleChoices(previewMultipleChoices.filter((c) => c !== opt));
                            } else {
                              setPreviewMultipleChoices([...previewMultipleChoices, opt]);
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isChecked
                              ? 'bg-primary/20 border-primary text-primary font-bold shadow-xs'
                              : 'bg-card border-border hover:bg-muted/40 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                            <span>{opt}</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {previewMultipleChoices.length > 0 && (
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between flex-wrap gap-2">
                      <span>
                        Selected ({previewMultipleChoices.length}): <strong className="text-primary">{previewMultipleChoices.join(', ')}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Single Choice Interactive Preview */}
              {field.type === 'single_choice' && (
                <div className="space-y-2.5 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CircleDot className="w-3.5 h-3.5 text-primary" />
                      <span>Single-Choice Radio Simulation:</span>
                    </Label>
                    {previewSelectedChoice && (
                      <button
                        type="button"
                        onClick={() => setPreviewSelectedChoice('')}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(field.options || []).map((opt, i) => {
                      const isSelected = previewSelectedChoice === opt;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewSelectedChoice(opt)}
                          className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-primary/20 border-primary text-primary font-bold shadow-xs'
                              : 'bg-card border-border hover:bg-muted/40 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                            <span>{opt}</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-muted-foreground/40'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {previewSelectedChoice && (
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between flex-wrap gap-2">
                      <span>
                        Selected: <strong className="text-primary">{previewSelectedChoice}</strong>
                      </span>
                      {isQuiz && field.correctAnswer && (
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            field.correctAnswer === previewSelectedChoice ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {field.correctAnswer === previewSelectedChoice ? '✓ Correct Answer (+points)' : '✗ Incorrect Answer (0 points)'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Dropdown Select Interactive Preview */}
              {field.type === 'dropdown' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border max-w-md">
                  <Label className="text-xs font-semibold text-foreground">Dropdown Selection Simulation:</Label>
                  <Select value={previewSelectedChoice} onValueChange={setPreviewSelectedChoice}>
                    <SelectTrigger className="w-full h-9 text-xs bg-background border-border">
                      <SelectValue placeholder={field.placeholder || 'Select an option...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {(field.options || []).map((opt, i) => (
                        <SelectItem key={i} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {previewSelectedChoice && (
                    <p className="text-[11px] text-muted-foreground">
                      Selected: <strong className="text-primary">{previewSelectedChoice}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Date Field Interactive Preview */}
              {field.type === 'date' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border max-w-sm">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Date Selection Simulation:</span>
                  </Label>
                  <Input
                    type="date"
                    value={previewDate}
                    onChange={(e) => setPreviewDate(e.target.value)}
                    className="text-xs h-9 bg-background"
                  />
                  {previewDate && (
                    <p className="text-[11px] text-muted-foreground">
                      Selected Date: <strong className="text-primary font-mono">{previewDate}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Numerical Scale (1-10) Interactive Preview */}
              {field.type === 'scale' && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Numerical Scale Simulation (1 - 10):</Label>
                    <span className="font-mono text-primary font-bold text-xs">{previewScale} / 10</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPreviewScale(num)}
                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                          previewScale === num
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Link Interactive Preview */}
              {isLinkField && (
                <div className="p-3 bg-background/60 rounded-lg border border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">{field.linkText || 'Open Document'}</span>
                    <span className="text-[11px] text-muted-foreground block font-mono truncate max-w-sm">{field.url || 'No URL configured'}</span>
                  </div>
                  {field.url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-primary/40 text-primary"
                      onClick={() => window.open(field.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" /> Test URL
                    </Button>
                  )}
                </div>
              )}

              {/* File Upload Interactive Test Preview Dropzone */}
              {isFileUploadField && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-primary" />
                      <span>Interactive File Dropzone Preview:</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Max: {currentFileValidation.maxSizeMb || 10}MB ({(currentFileValidation.allowedExtensions || ['pdf', 'docx', 'zip', 'png']).map((e) => e.toUpperCase()).join(', ')})
                    </span>
                  </div>

                  {previewUploadedFile ? (
                    previewFileValidationResult.isValid ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
                              {previewUploadedFile.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span>{(previewUploadedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span className="font-mono text-emerald-400 font-semibold">Valid & Approved</span>
                              <span>•</span>
                              <span>{previewUploadedFile.uploadedAt}</span>
                            </div>
                            <p className="text-[10px] text-emerald-400 mt-0.5">{previewFileValidationResult.message}</p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewUploadedFile(null)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Remove file and test again"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
                              {previewUploadedFile.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span>{(previewUploadedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span className="font-mono text-rose-400 font-semibold">Validation Error</span>
                              <span>•</span>
                              <span>{previewUploadedFile.uploadedAt}</span>
                            </div>
                            <p className="text-[11px] font-medium text-rose-400 mt-0.5">{previewFileValidationResult.message}</p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewUploadedFile(null)}
                          className="h-7 px-2 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                          title="Try another file"
                        >
                          Reset Test
                        </Button>
                      </div>
                    )
                  ) : (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setPreviewUploadedFile({
                            name: file.name,
                            size: file.size,
                            type: file.type || 'application/octet-stream',
                            uploadedAt: new Date().toLocaleTimeString(),
                          });
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
                        isDraggingFile
                          ? 'border-primary bg-primary/10'
                          : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-background/40'
                      }`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPreviewUploadedFile({
                              name: file.name,
                              size: file.size,
                              type: file.type || 'application/octet-stream',
                              uploadedAt: new Date().toLocaleTimeString(),
                            });
                          }
                        }}
                      />
                      <UploadCloud className="w-8 h-8 text-primary/70 mb-2" />
                      <span className="text-xs font-semibold text-foreground">
                        Drag and drop candidate test file here, or{' '}
                        <span className="text-primary underline">browse</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Simulates file upload validation, size inspection & preview
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Paragraph Multi-Line Text Interactive Preview */}
              {field.type === 'paragraph' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Multi-Line Essay Simulation:</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {previewParagraph.length} chars • {previewParagraph.trim() ? previewParagraph.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                  <Textarea
                    value={previewParagraph}
                    onChange={(e) => setPreviewParagraph(e.target.value)}
                    placeholder={field.placeholder || 'Type long-form candidate commentary or essay response...'}
                    rows={3}
                    className="text-xs bg-background text-foreground resize-y"
                  />
                  {previewParagraph && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Input Captured ({previewParagraph.length} chars)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewParagraph('')}
                        className="text-[10px] hover:text-foreground underline transition-colors"
                      >
                        Clear Text
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Short Answer, Email & Regex Fields Live Compound Evaluation Test */}
              {(field.type === 'short_answer' || field.type === 'email' || field.type === 'regex_text') && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">
                      {field.type === 'email' ? 'Email Validation Test Box:' : 'Real-Time Validation Test Box:'}
                    </Label>
                    {testInputValue && (
                      <button
                        type="button"
                        onClick={() => setTestInputValue('')}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Clear Text
                      </button>
                    )}
                  </div>
                  <Input
                    type={field.type === 'email' ? 'email' : 'text'}
                    value={testInputValue}
                    onChange={(e) => setTestInputValue(e.target.value)}
                    placeholder={field.placeholder || (field.type === 'email' ? 'candidate@example.com' : 'Type candidate sample response here...')}
                    className="text-xs h-9 bg-background"
                  />
                  {testInputValue && (
                    <div
                      className={`p-2 rounded border text-xs flex items-center gap-2 ${
                        testFeedback.isValid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {testFeedback.isValid ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback Simulation for Other Field Types (Never Blank) */}
              {!['phone', 'multiple_choice', 'single_choice', 'dropdown', 'rating', 'true_false', 'paragraph', 'short_answer', 'email', 'regex_text', 'date', 'scale', 'link', 'file_upload'].includes(field.type) && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <Label className="text-xs font-semibold text-foreground">Interactive Response Simulation:</Label>
                  <Input
                    value={testInputValue}
                    onChange={(e) => setTestInputValue(e.target.value)}
                    placeholder={field.placeholder || `Enter response for ${field.type.replace('_', ' ')}...`}
                    className="text-xs h-9 bg-background"
                  />
                </div>
              )}
            </div>
          )}

          {/* Dedicated File Upload Validation Configurator */}
          {isFileUploadValidationDrawerOpen && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/80 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">File Upload Validation & Limits</span>
                  <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                    Max {currentFileValidation.maxSizeMb || 10} MB
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">Configures upload restrictions</span>
              </div>

              {/* Max Size Selector & Input */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Maximum Permitted File Size (MB):</span>
                  <span className="text-muted-foreground font-mono text-[11px]">{currentFileValidation.maxSizeMb || 10} MB limit</span>
                </Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[2, 5, 10, 25, 50, 100].map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={(currentFileValidation.maxSizeMb || 10) === size ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-2.5 text-xs font-mono"
                      onClick={() => handleUpdateFileValidation({ maxSizeMb: size })}
                    >
                      {size} MB
                    </Button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[11px] text-muted-foreground">Custom:</span>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={currentFileValidation.maxSizeMb || 10}
                      onChange={(e) => handleUpdateFileValidation({ maxSizeMb: parseInt(e.target.value, 10) || 10 })}
                      className="h-7 w-20 text-xs font-mono bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Allowed File Extensions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Allowed File Extensions:</Label>
                  <span className="text-[10px] text-muted-foreground">Click to toggle formats</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'zip', 'csv', 'json'].map((ext) => {
                    const isSelected = (currentFileValidation.allowedExtensions || []).includes(ext);

                    return (
                      <button
                        key={ext}
                        type="button"
                        onClick={() => handleToggleExtension(ext)}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-bold'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        .{ext}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1">
                  <Label className="text-[10px] text-muted-foreground block mb-1">
                    Custom Allowed Extensions (Comma-separated)
                  </Label>
                  <Input
                    value={(currentFileValidation.allowedExtensions || []).join(', ')}
                    onChange={(e) => {
                      const list = e.target.value
                        .split(',')
                        .map((s) => s.trim().toLowerCase().replace(/^\./, ''))
                        .filter(Boolean);
                      handleUpdateFileValidation({ allowedExtensions: list });
                    }}
                    placeholder="pdf, docx, zip, png"
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
              </div>

              {/* Custom Rejection Error Message */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Custom Rejection Message (Optional):</Label>
                <Input
                  value={currentFileValidation.customErrorMessage || ''}
                  onChange={(e) => handleUpdateFileValidation({ customErrorMessage: e.target.value })}
                  placeholder="e.g. Please provide a PDF or DOCX file under 10 MB."
                  className="h-8 text-xs bg-background"
                />
                <span className="text-[10px] text-muted-foreground">
                  Leave blank to use the system default explanatory error message.
                </span>
              </div>
            </div>
          )}

          {/* Multi-Rule Compound Validation Drawer */}
          {isCompoundValidationDrawerOpen && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Multi-Rule Validation Engine</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {activeRules.length} Rule{activeRules.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Compound Operator Switcher */}
                {activeRules.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-md border border-border text-xs">
                    <span className="text-[10px] text-muted-foreground px-1 font-semibold">Match Logic:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateRules(activeRules, 'AND')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        compoundOperator === 'AND' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      ALL (AND)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateRules(activeRules, 'OR')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        compoundOperator === 'OR' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      ANY (OR)
                    </button>
                  </div>
                )}
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {activeRules.map((rule, ruleIdx) => {
                  const preset = VALIDATION_PRESETS[rule.ruleType];
                  const hasCustomPattern = rule.ruleType === 'starts_with' || rule.ruleType === 'ends_with' || rule.ruleType === 'contains' || rule.ruleType === 'not_contains' || rule.ruleType === 'regex' || rule.ruleType === 'exact';

                  return (
                    <div key={rule.id} className="p-3 bg-background/70 rounded-lg border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground font-mono">Rule #{ruleIdx + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveRule(rule.id)}
                        >
                          ×
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Rule Type Selector */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground block mb-1">Rule Preset / Type</Label>
                          <Select
                            value={rule.ruleType}
                            onValueChange={(val) => {
                              const newType = val as StringMatchRuleType;
                              const p = VALIDATION_PRESETS[newType];
                              handleRuleChange(rule.id, {
                                ruleType: newType,
                                pattern: p?.defaultPattern || '',
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border max-h-56">
                              <SelectItem value="starts_with" className="text-xs">Starts With Prefix</SelectItem>
                              <SelectItem value="ends_with" className="text-xs">Ends With Suffix</SelectItem>
                              <SelectItem value="contains" className="text-xs">Contains Substring</SelectItem>
                              <SelectItem value="not_contains" className="text-xs">Does Not Contain</SelectItem>
                              <SelectItem value="email" className="text-xs">Valid Email Preset</SelectItem>
                              <SelectItem value="phone" className="text-xs">Phone Number Preset</SelectItem>
                              <SelectItem value="url" className="text-xs">Website URL Preset</SelectItem>
                              <SelectItem value="google_drive" className="text-xs">Google Drive Link</SelectItem>
                              <SelectItem value="pdf" className="text-xs">PDF File Link</SelectItem>
                              <SelectItem value="regex" className="text-xs">Custom Regex Pattern</SelectItem>
                              <SelectItem value="exact" className="text-xs">Exact Match</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Pattern / Target Value Input */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground block mb-1">
                            {hasCustomPattern ? 'Target Value / Pattern' : 'Preset Regex (Read-Only)'}
                          </Label>
                          <Input
                            value={rule.pattern}
                            onChange={(e) => handleRuleChange(rule.id, { pattern: e.target.value })}
                            placeholder={preset?.defaultPattern || 'e.g. STU-'}
                            disabled={!hasCustomPattern}
                            className="h-8 text-xs font-mono bg-background"
                          />
                        </div>

                        {/* Custom Error Message Override */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground block mb-1">
                            Error Message Override (Optional)
                          </Label>
                          <Input
                            value={rule.errorMessage || ''}
                            onChange={(e) => handleRuleChange(rule.id, { errorMessage: e.target.value })}
                            placeholder={preset?.defaultMessage || 'Default error text'}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Rule Button & Live Tester */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRule}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Validation Rule
                </Button>

                {/* Inline Tester */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Input
                    value={testInputValue}
                    onChange={(e) => setTestInputValue(e.target.value)}
                    placeholder="Test compound input..."
                    className="h-7 text-xs font-mono bg-background flex-1"
                  />
                  {testInputValue && (
                    <span className={`text-xs flex items-center gap-1 font-semibold ${
                      testFeedback.isValid ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {testFeedback.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Triggers & Notification Drawer */}
          {showTriggers && (
            <div className="p-4 bg-purple-950/20 rounded-xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4" /> Field Action & Notification Triggers
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-purple-200">Alert managers or webhooks</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-[11px] text-purple-300 hover:text-white hover:bg-purple-500/20"
                    onClick={() => setShowTriggers(false)}
                  >
                    Close ✕
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {activeTriggers.map((trig) => (
                  <div key={trig.id} className="p-2.5 bg-background/70 rounded-lg border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      {trig.type === 'email_alert' ? <Mail className="w-3.5 h-3.5 text-sky-400" /> : <Phone className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="font-semibold">{trig.type === 'email_alert' ? 'Email Notification' : 'WhatsApp Webhook'}</span>
                      <span className="font-mono text-muted-foreground text-[11px]">&rarr; {trig.target}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveTrigger(trig.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTrigger('email_alert')}
                  className="h-7 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  <Mail className="w-3 h-3 mr-1" /> + Email Trigger
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTrigger('whatsapp_webhook')}
                  className="h-7 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                >
                  <Phone className="w-3 h-3 mr-1" /> + WhatsApp Webhook
                </Button>
              </div>
            </div>
          )}

          {/* Conditional Branching Drawer */}
          {showConditions && (
            <div className="relative space-y-1.5">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConditions(false)}
                >
                  Close Branching ✕
                </Button>
              </div>
              <BranchingRuleEditor
                field={field}
                otherFields={otherFields}
                allFields={allFields}
                onUpdateConditions={(newConditions, matchMode) => {
                  onUpdate(id, { conditions: newConditions, conditionMatch: matchMode });
                }}
                onUpdateOptionBranching={(newOptionBranching) => {
                  onUpdate(id, { optionBranching: newOptionBranching });
                }}
              />
            </div>
          )}

          {/* Choice Options Editor */}
          {isChoiceField && (
            <div className="p-3.5 bg-muted/20 rounded-xl space-y-2.5 border border-border/80">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Selectable Options & Answers
                </Label>
                {isQuiz && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Select &apos;Mark Correct&apos; for auto-grading
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {(field.options || []).map((opt, optIndex) => {
                  const isCorrect = field.correctAnswer === opt;

                  return (
                    <div key={optIndex} className="flex gap-2 items-center">
                      <span className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] text-muted-foreground font-bold shrink-0">
                        {String.fromCharCode(65 + optIndex)}
                      </span>

                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(field.options || [])];
                          newOpts[optIndex] = e.target.value;
                          onUpdate(id, { options: newOpts });
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                        className="text-xs h-8 bg-background text-foreground flex-1"
                      />

                      {isQuiz && (
                        <Button
                          type="button"
                          variant={isCorrect ? 'default' : 'outline'}
                          size="sm"
                          className={`h-8 text-xs whitespace-nowrap transition-all ${
                            isCorrect
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => onUpdate(id, { correctAnswer: opt })}
                        >
                          {isCorrect ? '✓ Correct Answer' : 'Mark Correct'}
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          const newOpts = field.options?.filter((_, i) => i !== optIndex);
                          onUpdate(id, { options: newOpts });
                        }}
                        title="Delete option"
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 mt-1 text-primary hover:bg-primary/10 border-primary/30"
                onClick={() => {
                  const count = (field.options?.length || 0) + 1;
                  onUpdate(id, {
                    options: [...(field.options || []), `Option ${count}`],
                  });
                }}
              >
                + Add Option
              </Button>
            </div>
          )}

          {/* True / False Specific Correct Answer */}
          {field.type === 'true_false' && isQuiz && (
            <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-border">
              <Label className="text-xs font-semibold text-foreground">Correct Answer:</Label>
              <div className="flex gap-2">
                {['True', 'False'].map((val) => {
                  const isSelected = field.correctAnswer === val;

                  return (
                    <Button
                      key={val}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-7 text-xs font-semibold transition-all ${
                        isSelected
                          ? val === 'True'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() =>
                        onUpdate(id, { correctAnswer: val, options: ['True', 'False'] })
                      }
                    >
                      {val}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Answer Exact Key for Quiz */}
          {field.type === 'short_answer' && isQuiz && (
            <div className="p-3 bg-muted/20 rounded-xl border border-border">
              <Label className="text-xs font-semibold text-foreground block mb-1">
                Exact Correct Answer (Auto-Graded):
              </Label>
              <Input
                value={field.correctAnswer || ''}
                onChange={(e) => onUpdate(id, { correctAnswer: e.target.value })}
                placeholder="e.g. React"
                className="text-xs h-8 bg-background text-foreground font-medium"
              />
            </div>
          )}

          {/* Card Footer: Required Toggle & Points */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-xs">
            <div className="flex items-center gap-3">
              <Switch
                id={`field-required-${id}`}
                checked={field.isRequired}
                onCheckedChange={(checked) => onUpdate(id, { isRequired: checked })}
              />
              <Label
                htmlFor={`field-required-${id}`}
                className="text-xs font-semibold text-foreground cursor-pointer select-none flex items-center gap-2"
              >
                <span>Required Field</span>
                {field.isRequired ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-500 bg-amber-500/10 font-mono flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Mandatory
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/70 text-muted-foreground bg-muted/20 font-mono">
                    Optional
                  </Badge>
                )}
              </Label>
            </div>

            {isQuiz && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground font-medium">Scoring Points:</Label>
                <Input
                  type="number"
                  value={field.points ?? 1}
                  onChange={(e) => onUpdate(id, { points: Number(e.target.value) || 1 })}
                  className="w-16 h-7 text-xs font-mono bg-background text-foreground text-center font-bold"
                  min={1}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-Question AI Instruction Studio & Quick JSON In/Out */}
      <QuestionAiStudioModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        question={field}
        questionIndex={index}
        onUpdateQuestion={(updated) => onUpdate(id, updated)}
      />

      {/* 1-Click JSON Import / Replace Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[540px] bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import / Replace Question JSON</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste a FormField JSON object below to update Question #{index + 1}. You can modify type, label, options, validation, or triggers directly.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">JSON Payload</Label>
            <Textarea
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              rows={12}
              placeholder="Paste FormField JSON object here..."
              className="font-mono text-xs bg-muted/30 border-border text-foreground leading-relaxed resize-y"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleApplyPastedJson}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

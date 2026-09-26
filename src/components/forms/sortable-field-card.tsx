import React, { useState, useRef } from 'react';
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
  parseVideoEmbedUrl,
  BooleanDisplayPreset,
  QuestionDifficulty,
  QuestionCitation,
  CitationPosition,
  RatingIconType,
  RatingScale,
} from '@/lib/types/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RunnerVideoPlayer } from '@/components/runner/FormRunner';
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
import { MultilineListItemsInput } from './multiline-list-items-input';
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
  Circle,
  CircleDot,
  CheckSquare,
  Video,
  Film,
  Image as ImageIcon,
  Heading,
  BookOpen,
  ListOrdered,
  Save,
  Heart,
  ThumbsUp,
  Smile,
} from 'lucide-react';
import { useQuizStore } from '@/quiz/store/useQuizStore';
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
  onReorderToIndex?: (fromIndex: number, toIndex: number) => void;
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
  onReorderToIndex,
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
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [isEditingIndex, setIsEditingIndex] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [showSectionInline, setShowSectionInline] = useState(false);
  const [showPointsOverride, setShowPointsOverride] = useState(false);
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const sectionMenuTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSectionMouseEnter = () => {
    if (sectionMenuTimerRef.current) {
      clearTimeout(sectionMenuTimerRef.current);
      sectionMenuTimerRef.current = null;
    }
    setIsSectionMenuOpen(true);
  };

  const handleSectionMouseLeave = () => {
    sectionMenuTimerRef.current = setTimeout(() => {
      setIsSectionMenuOpen(false);
    }, 250);
  };

  // Interactive Live Preview Local States
  const [previewTestCountry, setPreviewTestCountry] = useState('+1');
  const [previewTestPhone, setPreviewTestPhone] = useState('');
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState<string>('');
  const [previewMultipleChoices, setPreviewMultipleChoices] = useState<string[]>([]);
  const [previewRating, setPreviewRating] = useState<number>(0);
  const [previewDate, setPreviewDate] = useState<string>('');
  const [previewScale, setPreviewScale] = useState<number>(5);
  const [previewParagraph, setPreviewParagraph] = useState<string>('');
  const [previewListItems, setPreviewListItems] = useState<string[]>([]);
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
  const isBooleanField = field.type === 'boolean' || field.type === 'true_false';
  const isRatingField = field.type === 'rating' || field.type === 'rating_feedback';
  const isListItemsField = field.type === 'list_items';
  const isLinkField = field.type === 'link';
  const isVideoField = field.type === 'video';

  const lastSavedSnapshotRef = useRef<string>(JSON.stringify(field));
  const currentQuestionSnapshot = JSON.stringify(field);
  const isQuestionDirty = currentQuestionSnapshot !== lastSavedSnapshotRef.current;

  const handleSaveQuestion = () => {
    lastSavedSnapshotRef.current = JSON.stringify(field);
    const { saveForm } = useQuizStore.getState();
    if (saveForm) {
      saveForm().catch(() => {});
    }
    toast.success(`Question #${index + 1} saved successfully!`);
  };
  const hasAttachedVideo = Boolean(field.videoUrl && field.videoUrl.trim().length > 0);
  const [showVideoConfig, setShowVideoConfig] = useState(Boolean(field.videoUrl));
  const hasAttachedImage = Boolean(field.imageUrl && field.imageUrl.trim().length > 0);
  const [showImageConfig, setShowImageConfig] = useState(Boolean(field.imageUrl));
  const hasAttachedDescription = Boolean(field.description && field.description.trim().length > 0);
  const [showDescription, setShowDescription] = useState(hasAttachedDescription);
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
        return 'bg-primary/10 text-primary border-primary/25';
      case 'rating':
      case 'regex_text':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
      case 'short_answer':
      case 'paragraph':
      case 'email':
      case 'phone':
        return 'bg-muted text-foreground border-border';
      case 'link':
      case 'file_upload':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
      case 'video':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
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

  const sectionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    (allFields || otherFields || []).forEach((f) => {
      if (f.group && f.group.trim().length > 0) {
        const g = f.group.trim();
        counts[g] = (counts[g] || 0) + 1;
      }
    });

    return counts;
  }, [allFields, otherFields]);

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
    <div ref={setNodeRef} style={style} className="relative group/card mb-5">
      <Card
        className={`transition-all duration-200 border bg-card rounded-2xl ${
          isDragging
            ? 'shadow-2xl ring-2 ring-primary border-primary/80 bg-card/95'
            : 'border-border/80 hover:border-primary/40 shadow-xs hover:shadow-md'
        }`}
      >
        {/* Card Header: Drag Handle + Question # on left, Field Type Select on right */}
        <CardHeader className="py-3.5 px-5 sm:px-6 flex flex-row items-center justify-between border-b border-border/60 bg-muted/15 space-y-0 gap-3 rounded-t-2xl">
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

            {/* Interactive Question Index (Click or Double-Click to Directly Type Order Index) */}
            <div className="flex items-center gap-2.5">
              {isEditingIndex ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-bold text-primary">#</span>
                  <input
                    type="number"
                    defaultValue={index + 1}
                    autoFocus
                    min={1}
                    max={allFields ? allFields.length : otherFields.length + 1}
                    onBlur={(e) => {
                      setIsEditingIndex(false);
                      const targetNum = Number(e.target.value);
                      const isValidTarget = targetNum && targetNum >= 1 && onReorderToIndex;
                      if (isValidTarget) {
                        onReorderToIndex(index, targetNum - 1);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingIndex(false);
                        const targetNum = Number((e.target as HTMLInputElement).value);
                        const isValidTarget = targetNum && targetNum >= 1 && onReorderToIndex;
                        if (isValidTarget) {
                          onReorderToIndex(index, targetNum - 1);
                        }
                      } else if (e.key === 'Escape') {
                        setIsEditingIndex(false);
                      }
                    }}
                    className="w-14 h-8 text-xs font-mono font-bold bg-background text-foreground text-center border-2 border-primary rounded-lg focus:outline-none shadow-xs"
                    title="Press Enter to jump to position"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingIndex(true)}
                  onDoubleClick={() => setIsEditingIndex(true)}
                  className="font-mono text-sm px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold shrink-0 flex items-center gap-1 hover:bg-primary/20 hover:border-primary/40 cursor-pointer transition-all shadow-2xs group"
                  title="Click or double-click to type new order index"
                >
                  <span>#{index + 1}</span>
                  {field.isRequired && <span className="text-destructive font-bold ml-0.5">*</span>}
                </button>
              )}

              {/* Per-Question Quick Save Button at Top of Component */}
              <button
                type="button"
                onClick={handleSaveQuestion}
                className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  isQuestionDirty
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-background border-border text-muted-foreground/60 hover:text-foreground opacity-60'
                }`}
                title={isQuestionDirty ? 'Save changes to this question' : 'Question is saved'}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {field.group && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/80 font-medium flex items-center gap-1.5 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-primary" /> {field.group}
                </span>
              )}

              {designIssues && designIssues.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border font-mono flex items-center gap-1 shrink-0 ${
                    designIssues.some((i) => i.severity === 'error')
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  }`}
                  title={designIssues.map((i) => `• ${i.title}`).join('\n')}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{designIssues.length} issue{designIssues.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar: Field Type Selector on Right + Preview & Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
            {/* Field Type Selector (~195px, text-sm font-semibold) */}
            <Select
              value={
                field.type === 'true_false'
                  ? 'boolean'
                  : field.type === 'rating' && field.hasRatingFeedback
                  ? 'rating_feedback'
                  : field.type
              }
              onValueChange={(val) => {
                if (val === 'boolean') {
                  onUpdate(id, {
                    type: 'boolean',
                    options: ['True', 'False'],
                    correctAnswer: field.correctAnswer || 'True',
                    booleanDisplay: field.booleanDisplay || 'true_false',
                  });
                } else if (val === 'list_items') {
                  onUpdate(id, {
                    type: 'list_items',
                    suggestionsPool: field.suggestionsPool || [],
                  });
                } else if (val === 'rating') {
                  onUpdate(id, {
                    type: 'rating',
                    ratingMax: field.ratingMax || 5,
                    ratingIcon: field.ratingIcon || 'star',
                    alignment: field.alignment || 'center',
                    hasRatingFeedback: false,
                  });
                } else if (val === 'rating_feedback') {
                  onUpdate(id, {
                    type: 'rating',
                    ratingMax: field.ratingMax || 5,
                    ratingIcon: field.ratingIcon || 'star',
                    alignment: field.alignment || 'center',
                    hasRatingFeedback: true,
                  });
                } else {
                  onUpdate(id, { type: val as FieldType });
                }
              }}
            >
              <SelectTrigger className="h-10 text-sm bg-background text-foreground border border-input rounded-lg font-semibold w-[205px] shadow-2xs cursor-pointer">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-72">
                <SelectItem value="multiple_choice" className="text-sm py-2 cursor-pointer font-medium">Multiple Choice</SelectItem>
                <SelectItem value="single_choice" className="text-sm py-2 cursor-pointer font-medium">Single Choice</SelectItem>
                <SelectItem value="boolean" className="text-sm py-2 cursor-pointer font-medium">Boolean</SelectItem>
                <SelectItem value="dropdown" className="text-sm py-2 cursor-pointer font-medium">Dropdown Select</SelectItem>
                <SelectItem value="list_items" className="text-sm py-2 cursor-pointer font-medium">List of Items / Links</SelectItem>
                <SelectItem value="rating" className="text-sm py-2 cursor-pointer font-medium">Rating</SelectItem>
                <SelectItem value="rating_feedback" className="text-sm py-2 cursor-pointer font-medium">Rating with Feedback</SelectItem>
                <SelectItem value="short_answer" className="text-sm py-2 cursor-pointer font-medium">Short Answer</SelectItem>
                <SelectItem value="paragraph" className="text-sm py-2 cursor-pointer font-medium">Paragraph Text</SelectItem>
                <SelectItem value="email" className="text-sm py-2 cursor-pointer font-medium">Email Address</SelectItem>
                <SelectItem value="phone" className="text-sm py-2 cursor-pointer font-medium">WhatsApp / Phone</SelectItem>
                <SelectItem value="regex_text" className="text-sm py-2 cursor-pointer font-medium">Regex</SelectItem>
                <SelectItem value="link" className="text-sm py-2 cursor-pointer font-medium">Link</SelectItem>
                <SelectItem value="file_upload" className="text-sm py-2 cursor-pointer font-medium">File Upload</SelectItem>
                <SelectItem value="video" className="text-sm py-2 cursor-pointer font-medium">Video</SelectItem>
              </SelectContent>
            </Select>

            {/* Combined Preview & Actions Segmented Control with Crisp High-Contrast Icon */}
            <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-2xs overflow-hidden h-10 shrink-0">
              {/* Preview Toggle Button */}
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`inline-flex items-center gap-1.5 h-full px-3 text-sm font-semibold transition-all cursor-pointer ${
                  showLivePreview
                    ? 'bg-primary text-primary-foreground shadow-inner'
                    : 'text-foreground hover:bg-accent/80 hover:text-foreground'
                }`}
                title="Toggle interactive live input preview test"
              >
                <Eye className={`w-4 h-4 stroke-[2.2] ${showLivePreview ? 'text-primary-foreground' : 'text-foreground'}`} />
                <span>Preview</span>
              </button>

              {/* Vertical Divider */}
              <div className="w-px h-5 bg-border shrink-0" />

              {/* Actions Dropdown Trigger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 h-full px-2.5 text-sm font-semibold transition-all cursor-pointer ${
                      showAdvanced || showTriggers || showConditions
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'text-foreground hover:bg-accent/80 hover:text-foreground'
                    }`}
                    title="Question Actions & Configuration"
                  >
                    <SlidersHorizontal className="w-4 h-4 stroke-[2] text-foreground" />
                    <span className="hidden sm:inline">Actions</span>
                    {(showAdvanced || showTriggers || showConditions) && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 bg-popover border border-border shadow-lg">
                  {/* Quick toggle item for Live Preview inside the menu as well */}
                  <DropdownMenuItem
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-foreground stroke-[2]" />
                      <span>{showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
                    </div>
                    {showLivePreview && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-border/80" />
                  <DropdownMenuItem
                    onClick={() => setIsAiStudioOpen(true)}
                    className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                  >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Studio & Schema</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                    JSON
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleExportJson}
                  className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    <span>Export Question JSON</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                    Copy
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setPastedJson(JSON.stringify(field, null, 2));
                    setIsImportModalOpen(true);
                  }}
                  className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Import / Replace JSON</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                    Paste
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/80" />

                <DropdownMenuItem
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{isFileUploadField ? 'File Size & Formats' : 'Validation Rules'}</span>
                  </div>
                  {isFileUploadField ? (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                      {field.fileValidation?.maxSizeMb || 10}MB
                    </Badge>
                  ) : activeRules.length > 0 ? (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                      {activeRules.length}
                    </Badge>
                  ) : null}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowTriggers(!showTriggers)}
                  className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4" />
                    <span>Notification Triggers</span>
                  </div>
                  {activeTriggers.length > 0 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                      {activeTriggers.length}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowConditions(!showConditions)}
                  className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span>Branching & Logic</span>
                  </div>
                  {field.conditions && field.conditions.length > 0 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                      {field.conditions.length}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowVideoConfig(!showVideoConfig)}
                  className="text-sm flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>Attach Video / Briefing</span>
                  </div>
                  {field.videoUrl ? (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-primary transition-colors font-mono">
                      Active
                    </Badge>
                  ) : null}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/80" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-sm flex items-center gap-2 cursor-pointer py-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Move to Section</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-1 bg-popover border border-border shadow-lg">
                    {availableSections.length > 0 ? (
                      availableSections.map((secName) => (
                        <DropdownMenuItem
                          key={secName}
                          disabled={field.group === secName}
                          onClick={() => onUpdate(id, { group: secName })}
                          className={`text-sm flex items-center justify-between cursor-pointer py-1.5 ${
                            field.group === secName ? 'bg-primary/10 font-bold text-primary' : ''
                          }`}
                        >
                          <span className="truncate">{secName}</span>
                          {field.group === secName && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-muted-foreground italic">No other sections yet</div>
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
                      className="text-sm flex items-center gap-2 cursor-pointer py-1.5 text-primary hover:bg-primary/10 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Section...</span>
                    </DropdownMenuItem>

                    {field.group && (
                      <>
                        <DropdownMenuSeparator className="my-1 border-border/80" />
                        <DropdownMenuItem
                          onClick={() => onUpdate(id, { group: undefined })}
                          className="text-sm flex items-center gap-2 cursor-pointer py-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                          <span>Clear Section</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="my-1 border-border/80" />

                <DropdownMenuItem
                  onClick={() => onDuplicate(id)}
                  className="text-sm flex items-center gap-2 cursor-pointer py-1.5"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span>Duplicate Question</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onRemove(id)}
                  className="text-sm flex items-center gap-2 cursor-pointer py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span>Delete Question</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Card Content & Question Editor */}
        <CardContent className="space-y-5 p-5 sm:p-6">
          {/* Inline Design Diagnostics Notice */}
          {designIssues && designIssues.length > 0 && (
            <div
              className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                designIssues.some((i) => i.severity === 'error')
                  ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Design & Validation Recommendation:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {designIssues.map((issue) => (
                  <li key={issue.id}>
                    <span className="font-medium">{issue.title}:</span> {issue.recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Google Forms CardBody: Full-width Question Title with Floating Animated Placeholder */}
          <div className="space-y-3">
            {/* Relative container for Title Input + Floating Animated Label */}
            <div className="relative flex items-center">
              <Input
                id={`field-title-${id}`}
                value={field.label}
                onChange={(e) => onUpdate(id, { label: e.target.value })}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                placeholder=""
                className="font-sans font-normal text-sm sm:text-base h-11 pl-4 pr-24 w-full bg-background text-foreground shadow-2xs focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-all"
              />
              {/* Floating animated title indicator gliding smoothly between left placeholder and subtle right-hand hint */}
              <label
                htmlFor={`field-title-${id}`}
                className={`absolute pointer-events-none transition-all duration-300 ease-out select-none flex items-center gap-1 whitespace-nowrap top-1/2 -translate-y-1/2 font-sans ${
                  isTitleFocused || (field.label && field.label.trim().length > 0)
                    ? 'text-xs font-medium text-muted-foreground opacity-85'
                    : 'text-sm sm:text-base font-medium text-muted-foreground/75 opacity-90'
                }`}
                style={{
                  left: isTitleFocused || (field.label && field.label.trim().length > 0)
                    ? 'calc(100% - 64px)'
                    : '16px',
                }}
              >
                <span>Title</span>
                {field.isRequired && <span className="text-destructive font-bold ml-0.5">*</span>}
              </label>
            </div>

            {/* Sub-bar: Inline Section Disclosure Arrow (Under Title) + Unified [+] Add Menu */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSectionInline(!showSectionInline)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                    field.group || showSectionInline
                      ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                      : 'bg-background hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground'
                  }`}
                  title="Toggle section / group assignment"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSectionInline ? 'rotate-180' : ''}`} />
                  <Layers className="w-3.5 h-3.5" />
                  <span>{field.group ? `Section: ${field.group}` : 'Assign Section / Group'}</span>
                </button>

                {field.description && (
                  <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary bg-primary/5">
                    <HelpCircle className="w-3 h-3" /> Has Description
                  </Badge>
                )}
                {field.imageUrl && (
                  <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary bg-primary/5">
                    <ImageIcon className="w-3 h-3" /> Image
                  </Badge>
                )}
                {(field.citations?.length || 0) > 0 && (
                  <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary bg-primary/5">
                    <BookOpen className="w-3 h-3" /> {field.citations?.length} Citation{(field.citations?.length || 0) > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Unified [+] Add Menu combining Description, Image, Citations/To-Dos */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1.5 border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 font-semibold rounded-lg cursor-pointer transition-all duration-150 shadow-2xs group"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Add Context</span>
                    <ChevronDown className="w-3 h-3 opacity-60 group-hover:text-primary transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-popover border border-border shadow-lg p-1 text-xs">
                  <DropdownMenuItem
                    onClick={() => setShowDescription(!showDescription)}
                    className="gap-2 cursor-pointer py-1.5 text-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-primary" />
                    <span>{showDescription ? 'Hide Description' : 'Add / Edit Description'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowImageConfig(!showImageConfig)}
                    className="gap-2 cursor-pointer py-1.5 text-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{showImageConfig ? 'Hide Image Config' : 'Add Question Image'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCitationsModal(true)}
                    className="gap-2 cursor-pointer py-1.5 text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span>Manage Citations & To-Dos</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Inline Full-Width Section Assignment Box when expanded (No max-w-md empty space!) */}
            {showSectionInline && (
              <div
                className="p-3 bg-muted/20 rounded-xl border border-border/80 space-y-2.5 animate-in fade-in-50 duration-150"
                onMouseEnter={handleSectionMouseEnter}
                onMouseLeave={handleSectionMouseLeave}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary shrink-0" />
                  <div className="relative flex-1 flex items-center gap-1.5">
                    <Input
                      list={`section-datalist-${id}`}
                      value={field.group || ''}
                      onChange={(e) => onUpdate(id, { group: e.target.value })}
                      onFocus={() => setIsSectionMenuOpen(true)}
                      placeholder="Type new section or choose from dropdown..."
                      className="text-sm h-9 bg-background text-foreground shadow-2xs flex-1 rounded-lg font-medium"
                    />
                    <datalist id={`section-datalist-${id}`}>
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec} />
                      ))}
                    </datalist>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)}
                      className="h-9 px-2.5 gap-1 text-xs border-border bg-card text-foreground shrink-0 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer rounded-lg shadow-2xs transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>

                    {/* Section menu dropdown */}
                    {isSectionMenuOpen && availableSections.length > 0 && (
                      <div
                        className="absolute left-0 top-full mt-1.5 w-full bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150"
                        onMouseEnter={handleSectionMouseEnter}
                        onMouseLeave={handleSectionMouseLeave}
                      >
                        <div className="px-2.5 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/60 mb-1">
                          <span>Quiz Sections</span>
                          <span className="text-xs font-normal lowercase">{availableSections.length} available</span>
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-0.5">
                          {availableSections.map((sec) => {
                            const count = sectionCounts[sec] || 0;
                            const isSelected = field.group === sec;
                            return (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => {
                                  onUpdate(id, { group: sec });
                                  setIsSectionMenuOpen(false);
                                  toast.success(`Assigned to section: "${sec}"`);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                    : 'hover:bg-accent text-foreground'
                                }`}
                              >
                                <span className="truncate flex-1 pr-2">{sec}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {count} q{count !== 1 ? 's' : ''}
                                  </span>
                                  {isSelected && <Check className="w-4 h-4" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {field.group && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdate(id, { group: undefined })}
                      className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Quick section pills */}
                {availableSections.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Existing:</span>
                    {availableSections.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => onUpdate(id, { group: sec })}
                        className={`text-xs px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                          field.group === sec
                            ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                            : 'bg-background hover:bg-primary/10 hover:border-primary/50 text-foreground border-border/80 font-medium'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expandable Question Description / Hint Accordion */}
            {showDescription && (
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border/80 space-y-2.5 animate-in fade-in-50 duration-150 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary font-sans">
                    <HelpCircle className="w-4 h-4" />
                    <span>Question Description / Candidate Instructions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(id, { description: undefined });
                      setShowDescription(false);
                    }}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Close / Remove Description"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Textarea
                  value={field.description || ''}
                  onChange={(e) => onUpdate(id, { description: e.target.value })}
                  placeholder="Enter optional description, instructions, or candidate guidance..."
                  rows={2}
                  className="text-sm sm:text-base font-sans bg-background text-foreground rounded-lg shadow-2xs resize-y w-full"
                />
              </div>
            )}

            {/* Question Image Configuration Drawer */}
            {(showImageConfig || hasAttachedImage) && (
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border/80 space-y-3 animate-in fade-in-50 duration-150 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary font-sans">
                    <ImageIcon className="w-4 h-4" />
                    <span>Question Illustration / Image</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(id, { imageUrl: undefined, imageCaption: undefined });
                      setShowImageConfig(false);
                    }}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Close / Remove Image Config"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vertical Line-by-Line Inputs (No side-by-side columns) */}
                <div className="space-y-3 font-sans">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground font-sans">Image URL</Label>
                    <Input
                      value={field.imageUrl || ''}
                      onChange={(e) => onUpdate(id, { imageUrl: e.target.value })}
                      placeholder="https://example.com/diagram.png"
                      className="text-sm sm:text-base h-10 font-sans bg-background text-foreground rounded-lg shadow-2xs w-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground font-sans">Optional Caption</Label>
                    <Input
                      value={field.imageCaption || ''}
                      onChange={(e) => onUpdate(id, { imageCaption: e.target.value })}
                      placeholder="e.g. Figure 1: Network Topology Diagram"
                      className="text-sm sm:text-base h-10 font-sans bg-background text-foreground rounded-lg shadow-2xs w-full"
                    />
                  </div>
                </div>

                {hasAttachedImage && (
                  <div className="pt-1">
                    <img
                      src={field.imageUrl}
                      alt={field.imageCaption || field.label}
                      className="max-h-48 rounded-lg border border-border object-contain bg-background/50 mx-auto"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reference Link Field Configuration */}
          {isLinkField && (
            <div className="p-3.5 bg-muted/30 rounded-lg border border-border space-y-3 font-sans">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary font-sans">
                <LinkIcon className="w-4 h-4" />
                <span>Reference Link Configuration</span>
              </div>
              <div className="space-y-3 font-sans">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground font-sans">Target Link URL</Label>
                  <Input
                    value={field.url || ''}
                    onChange={(e) => onUpdate(id, { url: e.target.value })}
                    placeholder="https://company.org/spec"
                    className="text-sm sm:text-base h-10 font-sans bg-background text-foreground rounded-lg shadow-2xs w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground font-sans">Anchor Label</Label>
                  <Input
                    value={field.linkText || ''}
                    onChange={(e) => onUpdate(id, { linkText: e.target.value })}
                    placeholder="Review Official Guidelines"
                    className="text-sm sm:text-base h-10 font-sans bg-background text-foreground rounded-lg shadow-2xs w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Video Walkthrough & Media Configuration */}
          {(isVideoField || showVideoConfig || hasAttachedVideo) && (
            <div className="p-3.5 bg-muted/30 rounded-lg border border-border space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary font-sans">
                  <Video className="w-4 h-4 text-rose-500" />
                  <span>Video Briefing & Media Configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono border-border text-muted-foreground">
                    YouTube • Vimeo • Loom • MP4
                  </Badge>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoConfig(false);
                      onUpdate(id, { videoUrl: undefined, videoCaption: undefined });
                    }}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Detach / Remove Video"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground font-sans">Video Stream or Embed URL</Label>
                  <Input
                    value={field.videoUrl || ''}
                    onChange={(e) => onUpdate(id, { videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct .mp4"
                    className="text-sm sm:text-base h-10 font-mono bg-background text-foreground rounded-lg shadow-2xs w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground font-sans">Optional Video Caption / Prompt Instructions</Label>
                  <Input
                    value={field.videoCaption || ''}
                    onChange={(e) => onUpdate(id, { videoCaption: e.target.value })}
                    placeholder="e.g. Watch until 02:45 before answering below"
                    className="text-sm sm:text-base h-10 font-sans bg-background text-foreground rounded-lg shadow-2xs w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Header / Heading (Elementor-Style) Configuration */}
          {field.type === 'section_header' && (
            <div className="p-3.5 bg-muted/30 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <Heading className="w-4 h-4 text-emerald-500" />
                  <span>Section Header / Heading (Elementor-Style)</span>
                </div>
                <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 text-xs">
                  <span className="text-[11px] text-muted-foreground px-1.5">Align:</span>
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => onUpdate(id, { choiceAlignment: align })}
                      className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium transition-colors ${
                        (field.choiceAlignment || 'left') === align
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">Subtitle / Supporting Description (Optional)</Label>
                <Input
                  value={field.subtitle || ''}
                  onChange={(e) => onUpdate(id, { subtitle: e.target.value })}
                  placeholder="e.g. Please read the technical instructions below before proceeding..."
                  className="text-sm h-9 bg-background text-foreground"
                />
              </div>
            </div>
          )}

          {/* FAQ Accordion (Elementor-Style) Configuration */}
          {field.type === 'faq' && (
            <div className="p-3.5 bg-muted/30 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <span>FAQ Accordion Items</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentItems = field.faqItems || [];
                    onUpdate(id, {
                      faqItems: [
                        ...currentItems,
                        { question: 'Frequently asked question title?', answer: 'Detailed answer explanation.' },
                      ],
                    });
                  }}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                </Button>
              </div>

              <div className="space-y-2.5">
                {(field.faqItems || [
                  { question: 'What is the required notice period for this role?', answer: 'We prioritize candidates who can join immediately or within 30 days.' },
                  { question: 'Is remote work supported?', answer: 'Yes, this role offers 100% remote flexibility with core overlap hours.' },
                ]).map((item, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={item.question}
                        onChange={(e) => {
                          const updated = [...(field.faqItems || [])];
                          if (!updated[idx]) updated[idx] = { question: '', answer: '' };
                          updated[idx] = { ...updated[idx], question: e.target.value };
                          onUpdate(id, { faqItems: updated });
                        }}
                        placeholder="Question title..."
                        className="text-sm h-8 font-semibold bg-background"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = (field.faqItems || []).filter((_, i) => i !== idx);
                          onUpdate(id, { faqItems: updated });
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      value={item.answer}
                      onChange={(e) => {
                        const updated = [...(field.faqItems || [])];
                        if (!updated[idx]) updated[idx] = { question: '', answer: '' };
                        updated[idx] = { ...updated[idx], answer: e.target.value };
                        onUpdate(id, { faqItems: updated });
                      }}
                      placeholder="Answer description..."
                      rows={2}
                      className="text-xs bg-muted/20"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive In-Card Live Test Preview Drawer */}
          {showLivePreview && (
            <div className="p-4 bg-muted/40 rounded-xl border border-primary/30 space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Live Preview
                  </span>
                  <span className="text-sm font-semibold text-foreground flex items-center">
                    <span>{field.label || 'Untitled Question'}</span>
                    {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                  </span>
                </div>
              </div>

              {/* Display Question Description / Instructions if present */}
              {field.description && (
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-foreground flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{field.description}</span>
                </div>
              )}

              {/* Phone / WhatsApp Interactive Live Tester */}
              {field.type === 'phone' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-lg border border-border">
                  <Label className="text-sm font-semibold text-foreground flex items-center">
                    <span>WhatsApp / Phone</span>
                    {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                  </Label>
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
                        className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-400"
                        onClick={() => window.open(previewWhatsAppLink, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" /> Test Link
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Rating Scale & Custom Emoji/Feedback Interactive Preview */}
              {isRatingField && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5 font-sans">
                      {field.ratingIcon === 'heart' ? (
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      ) : field.ratingIcon === 'thumb' ? (
                        <ThumbsUp className="w-4 h-4 text-sky-500 fill-sky-500" />
                      ) : field.ratingIcon === 'smiley' ? (
                        <Smile className="w-4 h-4 text-amber-500" />
                      ) : field.ratingIcon === 'emoji' ? (
                        <span className="text-sm">{field.ratingCustomEmoji || '🎯'}</span>
                      ) : (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      )}
                      <span>
                        Rating ({field.ratingMax || 5} Scale • {field.ratingIcon || 'star'})
                      </span>
                      {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                    </Label>
                    {previewRating > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewRating(0)}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
                      >
                        Reset Rating
                      </button>
                    )}
                  </div>

                  {/* Rating Buttons with Center/Left/Right Alignment */}
                  <div
                    className={`flex items-center gap-2 flex-wrap ${
                      (field.alignment || 'center') === 'center'
                        ? 'justify-center'
                        : field.alignment === 'right'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {Array.from({ length: field.ratingMax || 5 }, (_, i) => i + 1).map((num) => {
                      const isSelected = previewRating >= num;
                      const iconType = field.ratingIcon || 'star';

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPreviewRating(num)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? iconType === 'heart'
                                ? 'border-rose-500 bg-rose-500/15 text-rose-600 shadow-xs'
                                : iconType === 'thumb'
                                ? 'border-sky-500 bg-sky-500/15 text-sky-600 shadow-xs'
                                : 'border-amber-500 bg-amber-500/15 text-amber-600 shadow-xs'
                              : 'border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                          }`}
                        >
                          {iconType === 'heart' ? (
                            <Heart className={`w-4 h-4 transition-colors ${isSelected ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground/60'}`} />
                          ) : iconType === 'thumb' ? (
                            <ThumbsUp className={`w-4 h-4 transition-colors ${isSelected ? 'text-sky-500 fill-sky-500' : 'text-muted-foreground/60'}`} />
                          ) : iconType === 'smiley' ? (
                            <Smile className={`w-4 h-4 transition-colors ${isSelected ? 'text-amber-500' : 'text-muted-foreground/60'}`} />
                          ) : iconType === 'emoji' ? (
                            <span className="text-base leading-none">{field.ratingCustomEmoji || '🎯'}</span>
                          ) : (
                            <Star className={`w-4 h-4 transition-colors ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/60'}`} />
                          )}
                          <span>{num}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Selected Rating:</span>
                      {previewRating > 0 ? (
                        <span className="text-primary font-bold font-mono">
                          {previewRating} / {field.ratingMax || 5}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">No rating selected (click an icon above to rate)</span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Text Area in Preview if enabled */}
                  {field.hasRatingFeedback && (
                    <div className="space-y-1.5 pt-1 animate-in fade-in duration-150 font-sans">
                      <Label className="text-xs font-semibold text-muted-foreground font-sans">
                        Candidate Feedback Commentary:
                      </Label>
                      <Textarea
                        placeholder={field.ratingFeedbackPlaceholder || 'Share any comments or reasons for your rating...'}
                        rows={2}
                        className="text-xs font-sans bg-background"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Universal Boolean Interactive Preview (True/False, Yes/No, Enable/Disable, Agree/Disagree) */}
              {isBooleanField && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  {previewSelectedChoice && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewSelectedChoice('')}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Reset Selection
                      </button>
                    </div>
                  )}

                  {(() => {
                    const preset = field.booleanDisplay || 'true_false';
                    const labels = preset === 'yes_no'
                      ? ['Yes', 'No']
                      : preset === 'enable_disable'
                      ? ['Enable', 'Disable']
                      : preset === 'agree_disagree'
                      ? ['Agree', 'Disagree']
                      : ['True', 'False'];

                    return (
                      <div className={`grid grid-cols-2 gap-3 max-w-sm ${
                        field.choiceAlignment === 'center'
                          ? 'mx-auto'
                          : field.choiceAlignment === 'right'
                          ? 'ml-auto'
                          : ''
                      }`}>
                        {labels.map((val, idx) => {
                          const isSelected = previewSelectedChoice === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setPreviewSelectedChoice(val)}
                              className={`p-3 rounded-xl border text-center text-sm font-medium font-sans transition-all flex items-center justify-center gap-2 ${
                                isSelected
                                  ? idx === 0
                                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-xs'
                                    : 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-xs'
                                  : 'border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                              }`}
                            >
                              {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {previewSelectedChoice && (
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs flex items-center justify-between flex-wrap gap-2">
                      <span className="text-muted-foreground">
                        Selected: <strong className="text-foreground">{previewSelectedChoice}</strong>
                      </span>
                      {isQuiz && (field.correctAnswer || (field.correctAnswers && field.correctAnswers.length > 0)) && (
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            (field.correctAnswer === previewSelectedChoice || field.correctAnswers?.includes(previewSelectedChoice))
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {(field.correctAnswer === previewSelectedChoice || field.correctAnswers?.includes(previewSelectedChoice))
                            ? '✓ Matches Correct Answer (+points)'
                            : '✗ Incorrect Answer (0 points)'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* List of Items Interactive Preview */}
              {isListItemsField && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-primary" />
                      <span>List / Links Live Preview</span>
                    </Label>
                    <span className="text-xs text-muted-foreground">Type items line-by-line or press Enter</span>
                  </div>

                  <MultilineListItemsInput
                    value={previewListItems}
                    onChange={setPreviewListItems}
                    suggestionsPool={field.suggestionsPool || []}
                    placeholder={field.placeholder || 'Type an item or link...'}
                  />
                </div>
              )}

              {/* Multiple Choice Interactive Preview */}
              {field.type === 'multiple_choice' && (
                <div className="space-y-2.5 bg-background/60 p-3.5 rounded-xl border border-border">
                  {previewMultipleChoices.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewMultipleChoices([])}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Clear Selected ({previewMultipleChoices.length})
                      </button>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${
                    field.choiceAlignment === 'center'
                      ? 'text-center'
                      : field.choiceAlignment === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}>
                    {(field.options || []).map((opt, i) => {
                      const isChecked = previewMultipleChoices.includes(opt);
                      const isCenter = field.choiceAlignment === 'center';
                      const isRight = field.choiceAlignment === 'right';

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
                          className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center ${
                            isCenter
                              ? 'justify-center gap-2'
                              : isRight
                              ? 'justify-end flex-row-reverse gap-2'
                              : 'justify-between'
                          } ${
                            isChecked
                              ? 'bg-primary/20 border-primary text-primary font-bold shadow-xs'
                              : 'bg-card border-border hover:bg-accent/40 text-foreground'
                          }`}
                        >
                          <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
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
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
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
                  {previewSelectedChoice && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewSelectedChoice('')}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${
                    field.choiceAlignment === 'center'
                      ? 'text-center'
                      : field.choiceAlignment === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}>
                    {(field.options || []).map((opt, i) => {
                      const isSelected = previewSelectedChoice === opt;
                      const isCenter = field.choiceAlignment === 'center';
                      const isRight = field.choiceAlignment === 'right';

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewSelectedChoice(opt)}
                          className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center ${
                            isCenter
                              ? 'justify-center gap-2'
                              : isRight
                              ? 'justify-end flex-row-reverse gap-2'
                              : 'justify-between'
                          } ${
                            isSelected
                              ? 'bg-primary/20 border-primary text-primary font-bold shadow-xs'
                              : 'bg-card border-border hover:bg-accent/40 text-foreground'
                          }`}
                        >
                          <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
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
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
                      <span>
                        Selected: <strong className="text-primary">{previewSelectedChoice}</strong>
                      </span>
                      {isQuiz && field.correctAnswer && (
                        <span
                          className={`font-semibold text-xs flex items-center gap-1 ${
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
                  <Label className="text-sm font-semibold text-foreground flex items-center">
                    <span>Dropdown</span>
                    {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                  </Label>
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
                    <p className="text-xs text-muted-foreground">
                      Selected: <strong className="text-primary">{previewSelectedChoice}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Date Field Interactive Preview */}
              {field.type === 'date' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border max-w-sm">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Date Picker</span>
                    {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                  </Label>
                  <Input
                    type="date"
                    value={previewDate}
                    onChange={(e) => setPreviewDate(e.target.value)}
                    className="text-xs h-9 bg-background"
                  />
                  {previewDate && (
                    <p className="text-xs text-muted-foreground">
                      Selected Date: <strong className="text-primary font-mono">{previewDate}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Numerical Scale (1-10) Interactive Preview */}
              {field.type === 'scale' && (
                <div className="space-y-3 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground flex items-center">
                      <span>Scale (1 - 10)</span>
                      {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                    </Label>
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
                            : 'border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground'
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
                    <span className="text-xs text-muted-foreground block font-mono truncate max-w-sm">{field.url || 'No URL configured'}</span>
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
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-primary" />
                      <span>File Upload</span>
                      {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">
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
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{(previewUploadedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span className="font-mono text-emerald-400 font-semibold">Valid & Approved</span>
                              <span>•</span>
                              <span>{previewUploadedFile.uploadedAt}</span>
                            </div>
                            <p className="text-xs text-emerald-400 mt-0.5">{previewFileValidationResult.message}</p>
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
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{(previewUploadedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span className="font-mono text-rose-400 font-semibold">Validation Error</span>
                              <span>•</span>
                              <span>{previewUploadedFile.uploadedAt}</span>
                            </div>
                            <p className="text-xs font-medium text-rose-400 mt-0.5">{previewFileValidationResult.message}</p>
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
                          : 'border-border/80 hover:border-primary/50 hover:bg-accent/30 bg-background/40'
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
                      <span className="text-xs text-muted-foreground mt-1">
                        Click to test file selection and preview
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Paragraph Multi-Line Text Interactive Preview */}
              {field.type === 'paragraph' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground flex items-center">
                      <span>Text Area / Paragraph</span>
                      {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Input Captured ({previewParagraph.length} chars)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewParagraph('')}
                        className="text-xs hover:text-foreground underline transition-colors"
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
                    <Label className="text-sm font-semibold text-foreground flex items-center">
                      <span>{field.type === 'email' ? 'Email Address' : 'Input'}</span>
                      {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                    </Label>
                    {testInputValue && (
                      <button
                        type="button"
                        onClick={() => setTestInputValue('')}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
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

              {/* Video Walkthrough / Briefing Interactive Live Preview */}
              {(isVideoField || hasAttachedVideo) && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>Video Stream</span>
                      {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                    </Label>
                    {field.videoUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-primary/40 text-primary"
                        onClick={() => window.open(field.videoUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" /> Open Stream
                      </Button>
                    )}
                  </div>

                  {(() => {
                    const embedInfo = parseVideoEmbedUrl(field.videoUrl);
                    const hasEmbed = Boolean(embedInfo && embedInfo.embedUrl);

                    if (hasEmbed) {
                      return (
                        <div className="space-y-2">
                          <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-black/60 shadow-inner">
                            {embedInfo && embedInfo.isDirectVideo ? (
                              <video
                                controls
                                className="w-full h-full object-contain"
                                src={embedInfo.embedUrl}
                              >
                                Your browser does not support HTML5 video playback.
                              </video>
                            ) : (
                              <iframe
                                className="w-full h-full"
                                src={embedInfo ? embedInfo.embedUrl : ''}
                                title={field.label || 'Question Video'}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            )}
                          </div>
                          {field.videoCaption && (
                            <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                              <span>ℹ️</span>
                              <span>{field.videoCaption}</span>
                            </p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="p-4 rounded-lg border-2 border-dashed border-border/80 text-center space-y-1.5 bg-muted/20">
                        <Film className="w-8 h-8 mx-auto text-muted-foreground/60" />
                        <p className="text-xs font-medium text-foreground">No Video URL Configured</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Paste a valid YouTube (e.g. youtube.com/watch?v=...), Vimeo, Loom, or direct MP4 link in the field editor above to preview playback.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Fallback Simulation for Other Field Types (Never Blank) */}
              {!['phone', 'multiple_choice', 'single_choice', 'dropdown', 'rating', 'rating_feedback', 'true_false', 'paragraph', 'short_answer', 'email', 'regex_text', 'date', 'scale', 'link', 'file_upload', 'video', 'list_items', 'boolean', 'section_header', 'faq'].includes(field.type) && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  <Label className="text-sm font-semibold text-foreground flex items-center">
                    <span>Field Preview</span>
                    {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
                  </Label>
                  <Input
                    value={testInputValue}
                    onChange={(e) => setTestInputValue(e.target.value)}
                    placeholder={field.placeholder || `Enter response for ${field.type.replace('_', ' ')}...`}
                    className="text-xs h-9 bg-background"
                  />
                </div>
              )}

              {/* Section Header (Elementor-Style) Interactive Live Preview */}
              {field.type === 'section_header' && (
                <div className={`p-4 bg-background rounded-xl border border-border shadow-xs ${
                  field.choiceAlignment === 'center'
                    ? 'text-center'
                    : field.choiceAlignment === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}>
                  <h3 className="text-lg font-bold text-foreground font-heading">
                    {field.label || 'Section Header Title'}
                  </h3>
                  {field.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {field.subtitle}
                    </p>
                  )}
                  <div className={`h-1 w-16 bg-primary rounded-full mt-3 ${
                    field.choiceAlignment === 'center'
                      ? 'mx-auto'
                      : field.choiceAlignment === 'right'
                      ? 'ml-auto'
                      : ''
                  }`} />
                </div>
              )}

              {/* FAQ Accordion (Elementor-Style) Interactive Live Preview */}
              {field.type === 'faq' && (
                <div className="space-y-2 bg-background/60 p-3.5 rounded-xl border border-border">
                  {(field.faqItems || [
                    { question: 'What is the required notice period for this role?', answer: 'We prioritize candidates who can join immediately or within 30 days.' },
                    { question: 'Is remote work supported?', answer: 'Yes, this role offers 100% remote flexibility with core overlap hours.' },
                  ]).map((item, idx) => (
                    <details key={idx} className="group rounded-lg border border-border bg-card p-3 transition-colors">
                      <summary className="flex cursor-pointer items-center justify-between font-semibold text-sm text-foreground list-none">
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                          <span>{item.question}</span>
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-2.5 text-xs text-muted-foreground pl-6 leading-relaxed border-t border-border/40 pt-2">
                        {item.answer}
                      </p>
                    </details>
                  ))}
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
                  <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30">
                    Max {currentFileValidation.maxSizeMb || 10} MB
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">Configures upload restrictions</span>
              </div>

              {/* Max Size Selector & Input */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Maximum Permitted File Size (MB):</span>
                  <span className="text-muted-foreground font-mono text-xs">{currentFileValidation.maxSizeMb || 10} MB limit</span>
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
                    <span className="text-xs text-muted-foreground">Custom:</span>
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
                  <Label className="text-sm font-semibold text-foreground">Allowed File Extensions:</Label>
                  <span className="text-xs text-muted-foreground">Click to toggle formats</span>
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
                            : 'bg-background hover:bg-accent text-muted-foreground border-border'
                        }`}
                      >
                        .{ext}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1">
                  <Label className="text-sm text-muted-foreground block mb-1">
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
                <Label className="text-sm font-semibold text-foreground">Custom Rejection Message (Optional):</Label>
                <Input
                  value={currentFileValidation.customErrorMessage || ''}
                  onChange={(e) => handleUpdateFileValidation({ customErrorMessage: e.target.value })}
                  placeholder="e.g. Please provide a PDF or DOCX file under 10 MB."
                  className="h-8 text-xs bg-background"
                />
                <span className="text-xs text-muted-foreground">
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
                  <Badge variant="outline" className="text-xs font-mono">
                    {activeRules.length} Rule{activeRules.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Compound Operator Switcher */}
                {activeRules.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-md border border-border text-xs">
                    <span className="text-xs text-muted-foreground px-1 font-semibold">Match Logic:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateRules(activeRules, 'AND')}
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        compoundOperator === 'AND' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      ALL (AND)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateRules(activeRules, 'OR')}
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
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
                        <span className="text-xs font-bold text-muted-foreground font-mono">Rule #{ruleIdx + 1}</span>
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
                          <Label className="text-sm text-muted-foreground block mb-1">Rule Preset / Type</Label>
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
                          <Label className="text-sm text-muted-foreground block mb-1">
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
                          <Label className="text-sm text-muted-foreground block mb-1">
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
                  <span className="text-xs text-purple-200">Alert managers or webhooks</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-purple-300 hover:text-white hover:bg-purple-500/20"
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
                      <span className="font-mono text-muted-foreground text-xs">&rarr; {trig.target}</span>
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
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
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
            <div className="p-4 bg-muted/20 rounded-xl space-y-3.5 border border-border/80">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm sm:text-base font-medium font-sans text-foreground">
                    Selectable Options & Answers
                  </Label>
                  {isQuiz && (field.correctAnswers?.length || 0) > 0 && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-medium font-sans px-2.5 py-0.5">
                      {field.correctAnswers?.length} Correct Answer{(field.correctAnswers?.length || 0) > 1 ? 's' : ''} Configured
                    </Badge>
                  )}
                </div>

                {/* Choice Alignment Options: Left, Center, Right */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium font-sans text-muted-foreground">Alignment:</span>
                  <div className="flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
                    {(['left', 'center', 'right'] as const).map((align) => {
                      const isSelected = (field.choiceAlignment || 'left') === align;
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => onUpdate(id, { choiceAlignment: align })}
                          className={`px-2.5 py-1 text-xs font-medium font-sans rounded-md capitalize transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-medium font-sans shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {align}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(field.options || []).map((opt, optIndex) => {
                  const currentAnswers = (field.correctAnswers && field.correctAnswers.length > 0)
                    ? field.correctAnswers
                    : field.correctAnswer
                    ? [field.correctAnswer]
                    : [];
                  const isCorrect = currentAnswers.includes(opt);

                  return (
                    <div key={optIndex} className="flex gap-2.5 items-center">
                      <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-sm font-bold shrink-0 transition-colors ${
                        isCorrect
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border text-foreground'
                      }`}>
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
                        className="text-base h-11 px-3.5 bg-background text-foreground flex-1 font-medium rounded-lg"
                      />

                      {isQuiz && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-11 px-4 shrink-0 text-sm font-medium font-sans transition-all duration-150 rounded-lg flex items-center gap-2 cursor-pointer ${
                            isCorrect
                              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-xs'
                              : 'bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary text-muted-foreground border-border/80'
                          }`}
                          onClick={() => {
                            const nextAnswers = isCorrect
                              ? currentAnswers.filter((a) => a !== opt)
                              : [...currentAnswers, opt];
                            onUpdate(id, {
                              correctAnswers: nextAnswers,
                              correctAnswer: nextAnswers[0] || '',
                            });
                          }}
                          title={isCorrect ? 'Marked as correct answer (click to deselect)' : 'Click to mark as correct answer'}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                              <span>Correct Answer</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4 text-muted-foreground/60" />
                              <span>Mark Correct</span>
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-11 w-11 shrink-0 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg transition-colors"
                        onClick={() => {
                          const newOpts = field.options?.filter((_, i) => i !== optIndex);
                          onUpdate(id, { options: newOpts });
                        }}
                        title="Delete option"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}

                {field.allowOtherOption && (
                  <div className="flex gap-2.5 items-center p-3 rounded-lg bg-muted/30 border border-dashed border-border text-sm text-muted-foreground">
                    <span className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center font-mono text-sm text-muted-foreground font-bold shrink-0">
                      {String.fromCharCode(65 + (field.options?.length || 0))}
                    </span>
                    <span className="italic flex-1 font-medium">Other... (Candidate enters custom text)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-sm text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => onUpdate(id, { allowOtherOption: false })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-sm h-10 px-4 text-primary hover:bg-primary/10 border-primary/40 gap-2 font-semibold rounded-lg cursor-pointer"
                  onClick={() => {
                    const count = (field.options?.length || 0) + 1;
                    onUpdate(id, {
                      options: [...(field.options || []), `Option ${count}`],
                    });
                  }}
                >
                  <Plus className="w-4 h-4" /> Add Option
                </Button>

                {!field.allowOtherOption && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-sm h-10 px-4 text-muted-foreground hover:text-foreground gap-2 font-medium cursor-pointer rounded-lg"
                    onClick={() => onUpdate(id, { allowOtherOption: true })}
                  >
                    <Plus className="w-4 h-4" /> Add "Other"
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Universal Boolean Field Configuration (True/False, Yes/No, Enable/Disable, Agree/Disagree) */}
          {isBooleanField && (
            <div className="p-4 bg-muted/20 rounded-xl border border-border/80 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm sm:text-base font-medium font-sans text-foreground">
                    Boolean Display Preset
                  </Label>
                  <Select
                    value={field.booleanDisplay || 'true_false'}
                    onValueChange={(val: BooleanDisplayPreset) => {
                      const labels = val === 'yes_no'
                        ? ['Yes', 'No']
                        : val === 'enable_disable'
                        ? ['Enable', 'Disable']
                        : val === 'agree_disagree'
                        ? ['Agree', 'Disagree']
                        : ['True', 'False'];
                      onUpdate(id, {
                        booleanDisplay: val,
                        options: labels,
                        correctAnswer: labels[0],
                        correctAnswers: [labels[0]],
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-44 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="true_false" className="text-xs">True / False</SelectItem>
                      <SelectItem value="yes_no" className="text-xs">Yes / No</SelectItem>
                      <SelectItem value="enable_disable" className="text-xs">Enable / Disable</SelectItem>
                      <SelectItem value="agree_disagree" className="text-xs">Agree / Disagree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium font-sans text-muted-foreground">Alignment:</span>
                  <div className="flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
                    {(['left', 'center', 'right'] as const).map((align) => {
                      const isSelected = (field.choiceAlignment || 'left') === align;
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => onUpdate(id, { choiceAlignment: align })}
                          className={`px-2.5 py-1 text-xs font-medium font-sans rounded-md capitalize transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-medium font-sans shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {align}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isQuiz && (
                <div className="flex items-center gap-3 pt-1">
                  <Label className="text-sm font-medium font-sans text-foreground">Correct Answer:</Label>
                  <div className="flex gap-2">
                    {(() => {
                      const preset = field.booleanDisplay || 'true_false';
                      const labels = preset === 'yes_no'
                        ? ['Yes', 'No']
                        : preset === 'enable_disable'
                        ? ['Enable', 'Disable']
                        : preset === 'agree_disagree'
                        ? ['Agree', 'Disagree']
                        : ['True', 'False'];
                      return labels.map((val, idx) => {
                        const isSelected = field.correctAnswer === val || field.correctAnswers?.includes(val);
                        return (
                          <Button
                            key={val}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className={`h-9 min-w-24 px-4 justify-center text-sm font-medium font-sans transition-all rounded-lg cursor-pointer ${
                              isSelected
                                ? idx === 0
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                  : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                                : 'text-foreground bg-background hover:bg-muted'
                            }`}
                            onClick={() =>
                              onUpdate(id, {
                                correctAnswer: val,
                                correctAnswers: [val],
                                options: labels,
                              })
                            }
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 mr-1" />}
                            {val}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rating Scale & Display Configuration Panel */}
          {isRatingField && (
            <div className="p-4 bg-muted/20 rounded-xl border border-border/80 space-y-4 font-sans">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm sm:text-base font-medium text-foreground flex items-center gap-1.5 font-sans">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Rating Scale & Display Configuration</span>
                </Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Scale / Max score: 5, 10, 20 */}
                <div className="space-y-1.5 font-sans">
                  <Label className="text-xs font-semibold text-muted-foreground font-sans">Rating Scale</Label>
                  <Select
                    value={String(field.ratingMax || 5)}
                    onValueChange={(val) => onUpdate(id, { ratingMax: Number(val) as RatingScale })}
                  >
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="5" className="text-xs">5 out of 5 (1 - 5)</SelectItem>
                      <SelectItem value="10" className="text-xs">10 out of 10 (1 - 10)</SelectItem>
                      <SelectItem value="20" className="text-xs">20 out of 20 (1 - 20)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Icon / Style: Star, Heart, Thumb, Smiley, Emoji */}
                <div className="space-y-1.5 font-sans">
                  <Label className="text-xs font-semibold text-muted-foreground font-sans">Display Icon</Label>
                  <Select
                    value={field.ratingIcon || 'star'}
                    onValueChange={(val) => onUpdate(id, { ratingIcon: val as RatingIconType })}
                  >
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="star" className="text-xs">⭐ Star</SelectItem>
                      <SelectItem value="heart" className="text-xs">❤️ Heart</SelectItem>
                      <SelectItem value="thumb" className="text-xs">👍 Thumbs Up</SelectItem>
                      <SelectItem value="smiley" className="text-xs">😀 Smiley Face</SelectItem>
                      <SelectItem value="emoji" className="text-xs">✨ Custom Emoji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alignment: Left, Center, Right (Default Center) */}
                <div className="space-y-1.5 font-sans">
                  <Label className="text-xs font-semibold text-muted-foreground font-sans">Alignment</Label>
                  <div className="flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs h-9">
                    {(['left', 'center', 'right'] as const).map((align) => {
                      const isSelected = (field.alignment || 'center') === align;
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => onUpdate(id, { alignment: align })}
                          className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {align}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Custom Emoji input if emoji selected */}
              {field.ratingIcon === 'emoji' && (
                <div className="space-y-1.5 font-sans">
                  <Label className="text-xs font-semibold text-muted-foreground font-sans">Custom Emoji Character</Label>
                  <Input
                    value={field.ratingCustomEmoji || '🎯'}
                    onChange={(e) => onUpdate(id, { ratingCustomEmoji: e.target.value })}
                    placeholder="e.g. 🔥, 🚀, 🎯, 💡"
                    className="text-sm h-9 bg-background w-36 text-center font-sans"
                  />
                </div>
              )}

              {/* Optional Feedback Section Toggle */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`rating-feedback-${id}`} className="text-sm font-semibold text-foreground cursor-pointer font-sans">
                    Include Feedback Text Box
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Candidates can write explanatory feedback or commentary with their rating.
                  </p>
                </div>
                <Switch
                  id={`rating-feedback-${id}`}
                  checked={Boolean(field.hasRatingFeedback)}
                  onCheckedChange={(checked) => onUpdate(id, { hasRatingFeedback: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {field.hasRatingFeedback && (
                <div className="space-y-1.5 animate-in fade-in-50 duration-150 font-sans">
                  <Label className="text-xs font-semibold text-muted-foreground font-sans">Feedback Box Placeholder</Label>
                  <Input
                    value={field.ratingFeedbackPlaceholder || ''}
                    onChange={(e) => onUpdate(id, { ratingFeedbackPlaceholder: e.target.value })}
                    placeholder="e.g. Tell us more about why you chose this rating..."
                    className="text-sm sm:text-base h-10 bg-background font-sans"
                  />
                </div>
              )}
            </div>
          )}

          {/* List of Items Question Configuration */}
          {isListItemsField && (
            <div className="p-4 bg-muted/20 rounded-xl border border-border/80 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm sm:text-base font-medium text-foreground flex items-center gap-1.5 font-sans">
                  <ListOrdered className="w-4 h-4 text-primary" />
                  <span>List of Items Autocomplete Suggestions</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 border-border font-medium"
                    onClick={() => {
                      const csv = (field.suggestionsPool || []).join(', ');
                      navigator.clipboard.writeText(csv);
                      toast.success(`Exported ${field.suggestionsPool?.length || 0} suggestions as CSV to clipboard!`);
                    }}
                    title="Export suggestions as CSV"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Export CSV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 border-border font-medium"
                    onClick={() => {
                      const json = JSON.stringify(field.suggestionsPool || [], null, 2);
                      navigator.clipboard.writeText(json);
                      toast.success(`Exported ${field.suggestionsPool?.length || 0} suggestions as JSON to clipboard!`);
                    }}
                    title="Export suggestions as JSON"
                  >
                    <FileJson className="w-3 h-3" />
                    <span>Export JSON</span>
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Candidates can input multiple items or select from intelligent suggestion pills.
              </p>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Load Preset Library:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'Full-Stack Stack', items: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL'] },
                    { label: 'Cloud & DevOps', items: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'Docker'] },
                    { label: 'Soft Skills', items: ['Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Critical Thinking'] },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdate(id, { suggestionsPool: preset.items })}
                      className="h-6 px-2 text-xs border border-border/70 hover:bg-primary/10 hover:text-primary hover:border-primary"
                    >
                      + {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Suggestion Pool (one suggestion per line):
                </Label>
                <Textarea
                  value={(field.suggestionsPool || []).join('\n')}
                  onChange={(e) => {
                    const pool = e.target.value
                      .split(/\r?\n/)
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0);
                    onUpdate(id, { suggestionsPool: pool });
                  }}
                  placeholder={'React\nVue\nSvelte\nAngular\nNext.js'}
                  rows={4}
                  className="text-sm bg-background text-foreground font-sans resize-y"
                />
                {(field.suggestionsPool?.length || 0) > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs font-semibold text-muted-foreground">Preview Pills ({field.suggestionsPool?.length}):</span>
                    {field.suggestionsPool?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                        +{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Short Answer Exact Key for Quiz */}
          {field.type === 'short_answer' && isQuiz && (
            <div className="p-3.5 bg-muted/20 rounded-xl border border-border">
              <Label className="text-sm font-semibold text-foreground block mb-1.5">
                Exact Correct Answer (Auto-Graded):
              </Label>
              <Input
                value={field.correctAnswer || ''}
                onChange={(e) =>
                  onUpdate(id, {
                    correctAnswer: e.target.value,
                    correctAnswers: e.target.value ? [e.target.value] : [],
                  })
                }
                placeholder="e.g. React"
                className="text-sm h-9 bg-background text-foreground font-medium"
              />
            </div>
          )}
        </CardContent>

        {/* Card Footer: Bottom toolbar dividing settings cleanly */}
        <CardFooter className="py-3.5 px-5 sm:px-6 border-t border-border/60 bg-muted/10 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Required switch with clear label (text-sm font-semibold) and red asterisk */}
            <div className="flex items-center gap-2">
              <Label htmlFor={`footer-req-${id}`} className="text-sm font-semibold cursor-pointer flex items-center">
                <span>Required</span>
                {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
              </Label>
              <Switch
                id={`footer-req-${id}`}
                checked={field.isRequired}
                onCheckedChange={(checked) => onUpdate(id, { isRequired: checked })}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Difficulty Tiers & Points Allocation via Dropdown with Conditional Custom Input */}
            {isQuiz && (
              <div className="flex items-center gap-2 border-l border-border/50 pl-3 sm:pl-4">
                <Label htmlFor={`footer-tier-${id}`} className="text-sm font-semibold text-foreground whitespace-nowrap">
                  Type:
                </Label>
                <Select
                  value={field.customPointsOverride || field.difficulty === 'custom' ? 'custom' : field.difficulty || 'medium'}
                  onValueChange={(val) => {
                    if (val === 'custom') {
                      onUpdate(id, {
                        difficulty: 'custom',
                        customPointsOverride: true,
                        points: field.points || 10,
                      });
                    } else {
                      const diff = val as 'easy' | 'medium' | 'hard';
                      const defaultPts = diff === 'easy' ? 5 : diff === 'medium' ? 10 : 20;
                      onUpdate(id, {
                        difficulty: diff,
                        customPointsOverride: false,
                        points: defaultPts,
                      });
                    }
                  }}
                >
                  <SelectTrigger id={`footer-tier-${id}`} className="h-8 text-xs font-medium w-36 bg-background border-border shadow-2xs">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="easy" className="text-xs">Easy (5 pts)</SelectItem>
                    <SelectItem value="medium" className="text-xs">Medium (10 pts)</SelectItem>
                    <SelectItem value="hard" className="text-xs">Hard (20 pts)</SelectItem>
                    <SelectItem value="custom" className="text-xs font-semibold text-primary">Custom...</SelectItem>
                  </SelectContent>
                </Select>

                {/* If Custom is picked, the text box appears! */}
                {(field.customPointsOverride || field.difficulty === 'custom') && (
                  <div className="flex items-center gap-1 animate-in fade-in-50 duration-150">
                    <Input
                      id={`footer-pts-${id}`}
                      type="number"
                      value={field.points ?? 10}
                      onChange={(e) => onUpdate(id, { points: Math.max(1, Number(e.target.value) || 1) })}
                      className="w-16 h-8 text-xs font-mono bg-background text-center rounded-lg shadow-2xs"
                      min={1}
                      title="Enter custom points"
                    />
                    <span className="text-xs text-muted-foreground font-medium">pts</span>
                  </div>
                )}
              </div>
            )}

            {/* Allow "Other" toggle (text-sm) */}
            {isChoiceField && (
              <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                <Label htmlFor={`footer-other-${id}`} className="text-sm font-semibold cursor-pointer">
                  Allow &quot;Other&quot;
                </Label>
                <Switch
                  id={`footer-other-${id}`}
                  checked={Boolean(field.allowOtherOption)}
                  onCheckedChange={(checked) => onUpdate(id, { allowOtherOption: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            )}

            {activeRules.length > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
                {activeRules.length} Rule{activeRules.length > 1 ? 's' : ''}
              </Badge>
            )}

            {isFileUploadField && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                Max {field.fileValidation?.maxSizeMb || 10}MB
              </Badge>
            )}
          </div>

          {/* Combined Save, Duplicate & Delete Segmented Control */}
          <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-2xs overflow-hidden h-9 ml-auto shrink-0">
            {/* Save Question Button Segment */}
            <button
              type="button"
              onClick={handleSaveQuestion}
              className={`inline-flex items-center justify-center h-full px-2.5 transition-colors cursor-pointer group ${
                isQuestionDirty
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 opacity-70'
              }`}
              title={isQuestionDirty ? 'Save changes to this question' : 'Question is saved'}
            >
              <Save className={`w-4 h-4 ${isQuestionDirty ? 'text-white' : 'text-muted-foreground'}`} />
            </button>

            {/* Subtle Divider */}
            <div className="w-px h-5 bg-border shrink-0" />

            {/* Duplicate Button Segment */}
            <button
              type="button"
              onClick={() => onDuplicate(id)}
              className="inline-flex items-center justify-center h-full px-2.5 text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group"
              title="Duplicate Question"
            >
              <Copy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>

            {/* Subtle Divider */}
            <div className="w-px h-5 bg-border shrink-0" />

            {/* Delete Button Segment */}
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="inline-flex items-center justify-center h-full px-2.5 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer group"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </CardFooter>
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
              <Upload className="w-4 h-4 text-primary" />
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
              className="text-xs gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Citations, Reference Links & Actionable To-Dos Modal */}
      <Dialog open={showCitationsModal} onOpenChange={setShowCitationsModal}>
        <DialogContent className="sm:max-w-[620px] bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Citations, Reference Links & To-Dos</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Attach technical references, guideline links, or mandatory checklist to-dos for Question #{index + 1}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            {(!field.citations || field.citations.length === 0) ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                No citations or to-dos added yet. Click &quot;Add Item&quot; below.
              </div>
            ) : (
              field.citations.map((cite, citeIdx) => (
                <div key={cite.id} className="p-3 bg-muted/20 rounded-xl border border-border/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono text-primary">Item #{citeIdx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = field.citations?.filter((c) => c.id !== cite.id);
                        onUpdate(id, { citations: updated });
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">Title / Action Item</Label>
                      <Input
                        value={cite.title}
                        onChange={(e) => {
                          const updated = [...(field.citations || [])];
                          updated[citeIdx] = { ...cite, title: e.target.value };
                          onUpdate(id, { citations: updated });
                        }}
                        placeholder="e.g. Read RFC 7519 or Clone repository"
                        className="text-xs h-8 bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">Reference URL (Optional)</Label>
                      <Input
                        value={cite.url || ''}
                        onChange={(e) => {
                          const updated = [...(field.citations || [])];
                          updated[citeIdx] = { ...cite, url: e.target.value };
                          onUpdate(id, { citations: updated });
                        }}
                        placeholder="https://example.com/spec"
                        className="text-xs h-8 font-mono bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Position:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(field.citations || [])];
                          updated[citeIdx] = { ...cite, position: cite.position === 'prefix' ? 'suffix' : 'prefix' };
                          onUpdate(id, { citations: updated });
                        }}
                        className="px-2 py-0.5 rounded border border-border bg-background capitalize font-medium text-foreground hover:bg-muted"
                      >
                        {cite.position} Question
                      </button>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(cite.isRequiredCheck)}
                        onChange={(e) => {
                          const updated = [...(field.citations || [])];
                          updated[citeIdx] = { ...cite, isRequiredCheck: e.target.checked };
                          onUpdate(id, { citations: updated });
                        }}
                        className="rounded border-border"
                      />
                      <span>Mandatory checklist to-do (&quot;I have done it&quot;)</span>
                    </label>
                  </div>
                </div>
              ))
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newItem: QuestionCitation = {
                  id: `cite-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  title: '',
                  position: 'prefix',
                  isRequiredCheck: false,
                };
                onUpdate(id, { citations: [...(field.citations || []), newItem] });
              }}
              className="w-full text-xs h-8 border-dashed border-primary/40 text-primary hover:bg-primary/10 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Citation or To-Do
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setShowCitationsModal(false)}
              className="text-xs"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

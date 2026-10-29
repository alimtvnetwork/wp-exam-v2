import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  Clock,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileEdit,
  Layers,
  Settings,
  ShieldAlert,
  PanelRightClose,
  PanelRightOpen,
  Volume2,
  Video,
  FileCheck,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  JobRole,
  AssessmentQuizQuestion,
  AssessmentQuestionType,
  persistJobRoleToServer,
} from '@/lib/role-assignments';

interface JobAssessmentBuilderProps {
  rolesList: JobRole[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  onRolesUpdated: () => void;
}

export const JobAssessmentBuilder: React.FC<JobAssessmentBuilderProps> = ({
  rolesList,
  selectedRoleId,
  onSelectRole,
  onRolesUpdated,
}) => {
  // Current active role
  const selectedRole = useMemo(() => {
    return rolesList.find((r) => r.id === selectedRoleId) || rolesList[0] || null;
  }, [rolesList, selectedRoleId]);

  const questions = useMemo(() => {
    return selectedRole?.secondPhaseQuestions || [];
  }, [selectedRole]);

  // Card expansion state: which card is currently being edited
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Inspector dock state
  const [inspectorTab, setInspectorTab] = useState<'palette' | 'outline' | 'settings'>('palette');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [outlineFilter, setOutlineFilter] = useState<string>('');

  // Live preview dialog state
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState<number>(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({});
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState<number>(600);
  const [previewIsFinished, setPreviewIsFinished] = useState<boolean>(false);

  // Computed summary metrics
  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (q.points || 10), 0);
  }, [questions]);

  const requiredCount = useMemo(() => {
    return questions.filter((q) => q.isRequired !== false).length;
  }, [questions]);

  const estimatedMinutes = useMemo(() => {
    return Math.max(1, Math.round(questions.length * 2.5));
  }, [questions.length]);

  // Save updated questions array to role
  const persistQuestions = (updatedQuestions: AssessmentQuizQuestion[], successMsg?: string) => {
    const hasRole = Boolean(selectedRole);
    if (!hasRole) {
      toast.error('No job role selected');
      return;
    }

    const updatedRole: JobRole = {
      ...selectedRole!,
      secondPhaseQuestions: updatedQuestions,
      isCustom: true,
    };

    persistJobRoleToServer(updatedRole);
    onRolesUpdated();

    if (successMsg) {
      toast.success(successMsg);
    }
  };

  // Add question with a specific preset format
  const handleAddQuestionWithPreset = (format: AssessmentQuestionType) => {
    const isChoice = format === 'mcq' || format === 'media_mcq';
    const isMedia = format === 'media_mcq' || format === 'media_prompt';
    const isOpen = format === 'text_open' || format === 'media_prompt';

    const newId = `${selectedRole?.id || 'role'}_q_${Date.now()}`;
    const newQuestion: AssessmentQuizQuestion = {
      id: newId,
      question: '',
      type: format,
      points: 10,
      isRequired: true,
      options: isChoice ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] : undefined,
      correctAnswer: isChoice ? 'Option 1' : undefined,
      explanation: '',
      mediaType: isMedia ? 'image' : undefined,
      mediaUrl: isMedia ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800' : undefined,
      isOneTimePlay: format === 'media_prompt',
      placeholder: isOpen ? 'Enter detailed technical response here...' : undefined,
      maxWordCount: isOpen ? 300 : undefined,
      helpText: '',
    };

    const nextList = [...questions, newQuestion];
    persistQuestions(nextList, 'New question added to assessment');
    setExpandedQuestionId(newId);
  };

  // Duplicate question
  const handleDuplicateQuestion = (questionId: string) => {
    const original = questions.find((q) => q.id === questionId);
    const hasOriginal = Boolean(original);
    if (!hasOriginal) return;

    const newId = `${selectedRole?.id || 'role'}_q_${Date.now()}`;
    const duplicated: AssessmentQuizQuestion = {
      ...original!,
      id: newId,
      question: `${original!.question} (Copy)`,
      options: original!.options ? [...original!.options] : undefined,
    };

    const targetIdx = questions.findIndex((q) => q.id === questionId);
    const nextList = [...questions];
    nextList.splice(targetIdx + 1, 0, duplicated);

    persistQuestions(nextList, 'Question duplicated');
    setExpandedQuestionId(newId);
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    const hasMultiple = questions.length > 1;
    if (!hasMultiple) {
      toast.error('An assessment must have at least 1 question');
      return;
    }

    const nextList = questions.filter((q) => q.id !== questionId);
    persistQuestions(nextList, 'Question deleted');

    const isCurrentExpanded = expandedQuestionId === questionId;
    if (isCurrentExpanded) {
      setExpandedQuestionId(null);
    }
  };

  // Move question
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const isUp = direction === 'up';
    const isDown = direction === 'down';

    if (isUp) {
      const hasRoomUp = index > 0;
      if (!hasRoomUp) return;
      const nextList = [...questions];
      const temp = nextList[index - 1];
      nextList[index - 1] = nextList[index];
      nextList[index] = temp;
      persistQuestions(nextList);
    }

    if (isDown) {
      const hasRoomDown = index < questions.length - 1;
      if (!hasRoomDown) return;
      const nextList = [...questions];
      const temp = nextList[index + 1];
      nextList[index + 1] = nextList[index];
      nextList[index] = temp;
      persistQuestions(nextList);
    }
  };

  // Update specific question field
  const handleUpdateQuestion = (questionId: string, updates: Partial<AssessmentQuizQuestion>) => {
    const nextList = questions.map((q) => {
      const isTarget = q.id === questionId;
      if (isTarget) {
        return { ...q, ...updates };
      }
      return q;
    });

    persistQuestions(nextList);
  };

  // Options editor helpers
  const handleUpdateOption = (questionId: string, optionIndex: number, text: string) => {
    const target = questions.find((q) => q.id === questionId);
    const hasTarget = Boolean(target && target.options);
    if (!hasTarget) return;

    const nextOptions = [...target!.options!];
    const prevText = nextOptions[optionIndex];
    nextOptions[optionIndex] = text;

    const isCorrectChanged = target!.correctAnswer === prevText;
    const nextCorrect = isCorrectChanged ? text : target!.correctAnswer;

    handleUpdateQuestion(questionId, {
      options: nextOptions,
      correctAnswer: nextCorrect,
    });
  };

  const handleAddOption = (questionId: string) => {
    const target = questions.find((q) => q.id === questionId);
    const hasTarget = Boolean(target);
    if (!hasTarget) return;

    const currentOptions = target!.options || [];
    const nextOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];

    handleUpdateQuestion(questionId, {
      options: nextOptions,
      correctAnswer: target!.correctAnswer || nextOptions[0],
    });
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    const target = questions.find((q) => q.id === questionId);
    const hasTarget = Boolean(target && target.options);
    if (!hasTarget) return;

    const currentOptions = target!.options!;
    const hasMinimum = currentOptions.length > 2;
    if (!hasMinimum) {
      toast.error('Multiple choice questions require at least 2 options');
      return;
    }

    const removedOption = currentOptions[optionIndex];
    const nextOptions = currentOptions.filter((_, idx) => idx !== optionIndex);

    const isRemovedCorrect = target!.correctAnswer === removedOption;
    const nextCorrect = isRemovedCorrect ? nextOptions[0] : target!.correctAnswer;

    handleUpdateQuestion(questionId, {
      options: nextOptions,
      correctAnswer: nextCorrect,
    });
  };

  const handleApplyTrueFalse = (questionId: string) => {
    handleUpdateQuestion(questionId, {
      options: ['True', 'False'],
      correctAnswer: 'True',
    });
    toast.success('Applied True / False template');
  };

  // Launch Live Preview
  const handleLaunchPreview = () => {
    setPreviewQuestionIndex(0);
    setPreviewAnswers({});
    setPreviewSecondsLeft((selectedRole?.durationMinutes || 30) * 60);
    setPreviewIsFinished(false);
    setIsPreviewOpen(true);
  };

  // Scroll to question card on canvas
  const handleScrollToQuestion = (questionId: string) => {
    setExpandedQuestionId(questionId);
    const element = document.getElementById(`assessment-card-${questionId}`);
    const hasElement = Boolean(element);
    if (hasElement) {
      element!.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with Role Selector and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-foreground">
              {selectedRole?.title || 'Assessment Question Builder'}
            </h2>
            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
              {questions.length} Questions
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              {totalPoints} Total Points
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure proctored technical questions, choice options, scoring rubrics, and media attachments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Role Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Role:</span>
            <select
              value={selectedRoleId}
              onChange={(e) => {
                onSelectRole(e.target.value);
                setExpandedQuestionId(null);
              }}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs font-medium max-w-[220px] truncate"
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.secondPhaseQuestions.length} Qs)
                </option>
              ))}
            </select>
          </div>

          {/* Time Limit Pill */}
          <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={selectedRole?.durationMinutes || 30}
              onChange={(e) => {
                const nextMins = Number(e.target.value);
                const updated: JobRole = {
                  ...selectedRole!,
                  durationMinutes: nextMins,
                  isCustom: true,
                };
                persistJobRoleToServer(updated);
                onRolesUpdated();
                toast.success(`Assessment time limit updated to ${nextMins} minutes`);
              }}
              className="rounded border-none bg-transparent text-xs text-foreground font-semibold cursor-pointer focus:outline-none"
            >
              <option value={10}>10 Mins</option>
              <option value={15}>15 Mins</option>
              <option value={20}>20 Mins</option>
              <option value={30}>30 Mins</option>
              <option value={45}>45 Mins</option>
              <option value={60}>60 Mins</option>
              <option value={90}>90 Mins</option>
            </select>
          </div>

          {/* Live Preview Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleLaunchPreview}
            className="h-8 text-xs gap-1.5 border-border bg-card hover:bg-muted font-semibold cursor-pointer shrink-0"
            title="Launch candidate assessment simulator"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Preview Exam</span>
          </Button>

          {/* Add Question Button */}
          <Button
            size="sm"
            onClick={() => handleAddQuestionWithPreset('mcq')}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </Button>
        </div>
      </div>

      {/* 2. Responsive 2-Column Section: Questions Canvas (8 cols) + Inspector Dock (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Questions Canvas */}
        <div className={`${isDockCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
          {/* Empty State */}
          {questions.length === 0 && (
            <div className="p-12 text-center rounded-xl border-2 border-dashed border-border/80 bg-card/60 text-muted-foreground space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">No assessment questions configured for this role</p>
                <p className="text-xs">Add technical competency questions to evaluate candidates for {selectedRole?.title}.</p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <Button size="sm" onClick={() => handleAddQuestionWithPreset('mcq')} className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Multiple Choice
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAddQuestionWithPreset('text_open')} className="text-xs gap-1.5">
                  <FileEdit className="w-3.5 h-3.5" />
                  Add Written Prompt
                </Button>
              </div>
            </div>
          )}

          {/* Questions Stack */}
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;
            const isChoice = q.type === 'mcq' || q.type === 'media_mcq';
            const isMedia = q.type === 'media_mcq' || q.type === 'media_prompt';
            const isOpen = q.type === 'text_open' || q.type === 'media_prompt';

            return (
              <Card
                key={q.id || idx}
                id={`assessment-card-${q.id}`}
                className={`border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-primary shadow-md ring-1 ring-primary/30'
                    : 'border-border/70 bg-card hover:border-border/90 hover:shadow-2xs'
                }`}
              >
                {/* Card Header: Collapsed Preview & Quick Actions */}
                <div
                  className={`p-3.5 flex items-center justify-between gap-3 select-none cursor-pointer transition-colors ${
                    isExpanded ? 'bg-primary/5 border-b border-border/60' : 'bg-card'
                  }`}
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Badge variant="outline" className="font-mono text-[11px] bg-muted/60 shrink-0 font-bold px-2 py-0.5">
                      Q{idx + 1}
                    </Badge>

                    {/* Format Badge */}
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-semibold shrink-0 gap-1 hidden sm:inline-flex"
                    >
                      {q.type === 'media_mcq' && <ImageIcon className="w-3 h-3 text-primary" />}
                      {q.type === 'text_open' && <FileEdit className="w-3 h-3 text-emerald-500" />}
                      {q.type === 'media_prompt' && <Volume2 className="w-3 h-3 text-amber-500" />}
                      {(!q.type || q.type === 'mcq') && <CheckSquare className="w-3 h-3 text-sky-500" />}
                      <span>
                        {q.type === 'media_mcq' && 'Media MCQ'}
                        {q.type === 'text_open' && 'Written Response'}
                        {q.type === 'media_prompt' && '1-Time Media Prompt'}
                        {(!q.type || q.type === 'mcq') && 'Multiple Choice'}
                      </span>
                    </Badge>

                    {/* Question Statement Preview */}
                    <span className="font-semibold text-xs text-foreground truncate">
                      {q.question || <span className="text-muted-foreground italic">Untitled Question (Click to edit)</span>}
                    </span>
                  </div>

                  {/* Right Header Status Pills & Controls */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20">
                      {q.points || 10}pt
                    </Badge>

                    {q.isRequired !== false && (
                      <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-500/20 bg-rose-500/5 font-semibold">
                        Req
                      </Badge>
                    )}

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveQuestion(idx, 'up')}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
                      title="Move Question Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => handleMoveQuestion(idx, 'down')}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
                      title="Move Question Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(q.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      title="Duplicate Question"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={questions.length <= 1}
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-20 cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Collapse Chevron */}
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Card Body: Full Inline Editor */}
                {isExpanded && (
                  <CardContent className="p-4 space-y-4 text-xs bg-card">
                    {/* Format Selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Question Format & Evaluation Type
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'mcq', label: 'Multiple Choice', desc: 'Single correct choice', icon: CheckSquare },
                          { id: 'media_mcq', label: 'Media MCQ', desc: 'Image/Audio/Video choice', icon: ImageIcon },
                          { id: 'text_open', label: 'Written Response', desc: 'Open-ended answer', icon: FileEdit },
                          { id: 'media_prompt', label: 'Media Prompt', desc: '1-Time audio/video prompt', icon: Volume2 },
                        ].map((fmt) => {
                          const isSelected = (q.type || 'mcq') === fmt.id;
                          const IconComp = fmt.icon;

                          return (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => {
                                const newType = fmt.id as AssessmentQuestionType;
                                const willNeedOptions = newType === 'mcq' || newType === 'media_mcq';
                                const willNeedMedia = newType === 'media_mcq' || newType === 'media_prompt';
                                const willNeedOpen = newType === 'text_open' || newType === 'media_prompt';

                                handleUpdateQuestion(q.id, {
                                  type: newType,
                                  options: willNeedOptions ? (q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']) : undefined,
                                  correctAnswer: willNeedOptions ? (q.correctAnswer || 'Option 1') : undefined,
                                  mediaType: willNeedMedia ? (q.mediaType || 'image') : undefined,
                                  mediaUrl: willNeedMedia ? (q.mediaUrl || '') : undefined,
                                  isOneTimePlay: newType === 'media_prompt',
                                  placeholder: willNeedOpen ? (q.placeholder || 'Enter technical response...') : undefined,
                                  maxWordCount: willNeedOpen ? (q.maxWordCount || 300) : undefined,
                                });
                              }}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40'
                                  : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <IconComp className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-xs">{fmt.label}</span>
                              </div>
                              <span className="text-[10px] opacity-75 font-normal">{fmt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Question Prompt / Statement *
                      </Label>
                      <Input
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                        placeholder="e.g. Which design pattern best isolates external API dependency changes?"
                        className="text-xs font-medium"
                      />
                    </div>

                    {/* Question Help Text / Instructions */}
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        Instructions / Hint for Candidate (Optional)
                      </Label>
                      <Input
                        value={q.helpText || ''}
                        onChange={(e) => handleUpdateQuestion(q.id, { helpText: e.target.value })}
                        placeholder="e.g. Consider immutability and asynchronous dispatch lifecycle."
                        className="h-8 text-xs text-muted-foreground"
                      />
                    </div>

                    {/* Points & Required Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/20 border border-border/60">
                      <div>
                        <Label className="text-[11px] text-muted-foreground block mb-1">
                          Scoring Points
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={q.points || 10}
                          onChange={(e) => handleUpdateQuestion(q.id, { points: Number(e.target.value) || 10 })}
                          className="h-8 text-xs font-mono font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-between pt-4 sm:pt-0">
                        <div>
                          <span className="text-xs font-semibold text-foreground block">Mandatory Question</span>
                          <span className="text-[11px] text-muted-foreground">Candidate must answer to complete</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={q.isRequired !== false}
                          onChange={(e) => handleUpdateQuestion(q.id, { isRequired: e.target.checked })}
                          className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Media Configuration & Live Preview */}
                    {isMedia && (
                      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {q.mediaType === 'video' && <Video className="w-4 h-4 text-primary" />}
                            {q.mediaType === 'audio' && <Volume2 className="w-4 h-4 text-primary" />}
                            {(!q.mediaType || q.mediaType === 'image') && <ImageIcon className="w-4 h-4 text-primary" />}
                            <span className="font-semibold text-foreground text-xs">Media Attachment & Direct URL</span>
                          </div>
                          {q.isOneTimePlay && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                              Single Play Enabled
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[11px] text-muted-foreground block mb-1">Media Type</Label>
                            <select
                              value={q.mediaType || 'image'}
                              onChange={(e) => handleUpdateQuestion(q.id, { mediaType: e.target.value as 'image' | 'video' | 'audio' })}
                              className="w-full text-xs h-8 rounded-md border border-border/60 bg-background px-2"
                            >
                              <option value="image">Image (PNG, JPG, WebP, SVG)</option>
                              <option value="video">Video (MP4, WebM)</option>
                              <option value="audio">Audio (MP3, WAV)</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="text-[11px] text-muted-foreground block mb-1">Media Direct URL</Label>
                            <Input
                              value={q.mediaUrl || ''}
                              onChange={(e) => handleUpdateQuestion(q.id, { mediaUrl: e.target.value })}
                              placeholder="https://... or /assets/diagram.png"
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Live Media Player / Image Preview Box */}
                        {Boolean(q.mediaUrl) && (
                          <div className="p-2 rounded-lg bg-background border border-border/60 flex items-center justify-center overflow-hidden max-h-48">
                            {q.mediaType === 'video' && (
                              <video src={q.mediaUrl} controls className="max-h-40 rounded" />
                            )}
                            {q.mediaType === 'audio' && (
                              <audio src={q.mediaUrl} controls className="w-full" />
                            )}
                            {(!q.mediaType || q.mediaType === 'image') && (
                              <img
                                src={q.mediaUrl}
                                alt="Question media preview"
                                className="max-h-40 rounded object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        )}

                        {q.type === 'media_prompt' && (
                          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(q.isOneTimePlay)}
                              onChange={(e) => handleUpdateQuestion(q.id, { isOneTimePlay: e.target.checked })}
                              className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                            />
                            <span className="font-medium text-amber-700 dark:text-amber-300">
                              Enforce Single-Play Restriction (locks playback after 1 listening session)
                            </span>
                          </label>
                        )}
                      </div>
                    )}

                    {/* Choice Options Editor (for Multiple Choice & Media MCQ) */}
                    {isChoice && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-foreground block text-xs">
                            Answer Options & Correct Answer Marker *
                          </Label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApplyTrueFalse(q.id)}
                              className="text-[11px] text-primary hover:underline cursor-pointer"
                            >
                              True / False Preset
                            </button>
                            <span className="text-[11px] text-muted-foreground">•</span>
                            <span className="text-[11px] text-muted-foreground">Select radio for correct answer</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(q.options || []).map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === opt;

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                  isCorrect
                                    ? 'border-emerald-500/70 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                                    : 'border-border/60 bg-muted/20'
                                }`}
                              >
                                <label className="flex items-center gap-2 cursor-pointer shrink-0 px-1">
                                  <input
                                    type="radio"
                                    name={`assessment_correct_${q.id}`}
                                    checked={isCorrect}
                                    onChange={() => handleUpdateQuestion(q.id, { correctAnswer: opt })}
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                                    }`}
                                  >
                                    {isCorrect ? 'Correct' : `Option ${optIdx + 1}`}
                                  </span>
                                </label>

                                <Input
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                                  placeholder={`Option text ${optIdx + 1}...`}
                                  className="h-8 text-xs flex-1"
                                />

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveOption(q.id, optIdx)}
                                  disabled={(q.options || []).length <= 2}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30"
                                  title="Delete Option"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(q.id)}
                          className="h-8 text-xs gap-1.5 cursor-pointer mt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Option</span>
                        </Button>
                      </div>
                    )}

                    {/* Open-Ended Written Constraints */}
                    {isOpen && (
                      <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <FileEdit className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground text-xs">Written Response Constraints</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <Label className="text-[11px] text-muted-foreground block mb-1">Textarea Placeholder</Label>
                            <Input
                              value={q.placeholder || ''}
                              onChange={(e) => handleUpdateQuestion(q.id, { placeholder: e.target.value })}
                              placeholder="e.g. Outline key trade-offs and mitigation strategy..."
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] text-muted-foreground block mb-1">Max Word Count</Label>
                            <Input
                              type="number"
                              min="50"
                              max="2000"
                              step="50"
                              value={q.maxWordCount || 300}
                              onChange={(e) => handleUpdateQuestion(q.id, { maxWordCount: Number(e.target.value) || 300 })}
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Answer Key Explanation & Evaluation Feedback */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Explanation / Evaluation Rationale (Optional)
                      </Label>
                      <Input
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                        placeholder="e.g. Explains why Option A satisfies requirements while avoiding state leaks."
                        className="text-xs text-muted-foreground"
                      />
                    </div>

                    {/* Done / Collapse Button */}
                    <div className="pt-2 flex justify-end border-t border-border/60">
                      <Button
                        size="sm"
                        onClick={() => setExpandedQuestionId(null)}
                        className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done Editing Q{idx + 1}</span>
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Bottom Add Question Bar */}
          <div className="p-4 rounded-xl border border-dashed border-border bg-card/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Ready to add more evaluation criteria? Choose a format to append.
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddQuestionWithPreset('mcq')}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>+ Multiple Choice</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddQuestionWithPreset('media_mcq')}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>+ Media MCQ</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddQuestionWithPreset('text_open')}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>+ Written Response</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Inspector Dock */}
        {isDockCollapsed ? (
          <div className="hidden lg:flex lg:col-span-12 justify-end -mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDockCollapsed(false)}
              className="h-8 px-3 text-xs gap-1.5 border-border bg-card hover:bg-muted font-mono"
              title="Show inspector dock"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span>Show Dock</span>
            </Button>
          </div>
        ) : (
          <div className="lg:col-span-4 sticky top-4 max-h-[calc(100vh-5rem)] flex flex-col">
            <div className="flex justify-end -mb-1 shrink-0 pb-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDockCollapsed(true)}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1.5"
                title="Collapse inspector dock"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
                <span>Hide Dock</span>
              </Button>
            </div>

            <Card className="border border-border bg-card shadow-md rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
              <Tabs
                value={inspectorTab}
                onValueChange={(val) => setInspectorTab(val as 'palette' | 'outline' | 'settings')}
                className="w-full flex flex-col flex-1 min-h-0"
              >
                {/* Dock Header Tabs */}
                <div className="p-2 border-b border-border/80 bg-muted/20 shrink-0">
                  <TabsList className="grid grid-cols-3 h-10 p-1 bg-muted/60 rounded-xl gap-1">
                    <TabsTrigger value="palette" className="text-xs font-semibold gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Palette</span>
                    </TabsTrigger>
                    <TabsTrigger value="outline" className="text-xs font-semibold gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Outline</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs font-semibold gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Config</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Palette / Quick Add */}
                <TabsContent value="palette" className="p-3 m-0 focus-visible:outline-none flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                      Question Formats
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Click to insert a new question directly into this assessment track.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        type: 'mcq' as AssessmentQuestionType,
                        title: 'Standard Multiple Choice',
                        desc: 'Radio options with single correct answer and feedback.',
                        icon: CheckSquare,
                        color: 'text-sky-500',
                      },
                      {
                        type: 'media_mcq' as AssessmentQuestionType,
                        title: 'Media Reference MCQ',
                        desc: 'Includes image, architecture diagram, audio, or video.',
                        icon: ImageIcon,
                        color: 'text-purple-500',
                      },
                      {
                        type: 'text_open' as AssessmentQuestionType,
                        title: 'Written Technical Response',
                        desc: 'Open-ended answer area with word count constraint.',
                        icon: FileEdit,
                        color: 'text-emerald-500',
                      },
                      {
                        type: 'media_prompt' as AssessmentQuestionType,
                        title: '1-Time Media Prompt',
                        desc: 'Audio/Video prompt locked after single listen session.',
                        icon: Volume2,
                        color: 'text-amber-500',
                      },
                    ].map((item) => {
                      const IconComponent = item.icon;

                      return (
                        <div
                          key={item.type}
                          onClick={() => handleAddQuestionWithPreset(item.type)}
                          className="p-2.5 rounded-xl border border-border/70 bg-card hover:bg-accent/40 hover:border-primary/50 transition-all cursor-pointer group space-y-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center">
                                <IconComponent className={`w-3.5 h-3.5 ${item.color}`} />
                              </div>
                              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-8">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted/30 rounded-lg border border-border/40">
                      <span className="block font-bold text-foreground text-sm">{questions.length}</span>
                      <span className="text-muted-foreground text-[10px]">Total Questions</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg border border-border/40">
                      <span className="block font-bold text-foreground text-sm">{totalPoints}</span>
                      <span className="text-muted-foreground text-[10px]">Total Points</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Outline */}
                <TabsContent value="outline" className="p-3 m-0 space-y-3 focus-visible:outline-none flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        value={outlineFilter}
                        onChange={(e) => setOutlineFilter(e.target.value)}
                        placeholder="Filter questions outline..."
                        className="h-8 text-xs pl-7 pr-7 bg-muted/30 border-border/80 rounded-lg placeholder:text-muted-foreground/70"
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      {outlineFilter && (
                        <button
                          type="button"
                          onClick={() => setOutlineFilter('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Scrollable Questions List */}
                    <div className="space-y-1.5 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 custom-scrollbar">
                      {questions
                        .map((q, idx) => ({ question: q, index: idx }))
                        .filter(({ question }) => {
                          if (!outlineFilter.trim()) return true;
                          const query = outlineFilter.toLowerCase();
                          return (
                            question.question.toLowerCase().includes(query) ||
                            (question.type && question.type.toLowerCase().includes(query))
                          );
                        })
                        .map(({ question: q, index: idx }) => (
                          <div
                            key={q.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/40 transition-colors group text-xs shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => handleScrollToQuestion(q.id)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-left truncate mr-2"
                              title="Click to jump to this question on canvas"
                            >
                              <span className="font-mono text-xs text-muted-foreground w-5 h-5 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border/60">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="truncate text-foreground group-hover:text-primary transition-colors text-xs font-semibold block">
                                  {q.question || 'Untitled Question'}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate capitalize font-mono">
                                  {q.type ? q.type.replace('_', ' ') : 'mcq'}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                                {q.points || 10}pt
                              </Badge>

                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveQuestion(idx, 'up')}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                title="Move question up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === questions.length - 1}
                                onClick={() => handleMoveQuestion(idx, 'down')}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                title="Move question down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Summary Stats Row */}
                    <div className="pt-2 border-t border-border/60 grid grid-cols-4 gap-1.5 text-center text-xs text-muted-foreground">
                      <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                        <span className="block font-bold text-foreground text-xs">{questions.length}</span>
                        <span>Questions</span>
                      </div>
                      <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                        <span className="block font-bold text-foreground text-xs">{requiredCount}</span>
                        <span>Required</span>
                      </div>
                      <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                        <span className="block font-bold text-foreground text-xs">{totalPoints}</span>
                        <span>Points</span>
                      </div>
                      <div className="p-1.5 bg-muted/30 rounded-lg border border-border/40">
                        <span className="block font-bold text-foreground text-xs">~{estimatedMinutes}m</span>
                        <span>Est. Time</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Settings / Config */}
                <TabsContent value="settings" className="p-3 m-0 space-y-3.5 focus-visible:outline-none text-xs flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  {/* Assessment Proctored Duration */}
                  <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Proctored Time Limit</span>
                    </div>
                    <select
                      value={selectedRole?.durationMinutes || 30}
                      onChange={(e) => {
                        const nextMins = Number(e.target.value);
                        const updated: JobRole = {
                          ...selectedRole!,
                          durationMinutes: nextMins,
                          isCustom: true,
                        };
                        persistJobRoleToServer(updated);
                        onRolesUpdated();
                        toast.success(`Exam time limit updated to ${nextMins} minutes`);
                      }}
                      className="w-full text-xs h-8 rounded-lg border border-input bg-background px-2"
                    >
                      <option value={10}>10 Minutes (Rapid screening)</option>
                      <option value={15}>15 Minutes (Standard screening)</option>
                      <option value={20}>20 Minutes (Moderate technical exam)</option>
                      <option value={30}>30 Minutes (Deep technical evaluation)</option>
                      <option value={45}>45 Minutes (Comprehensive evaluation)</option>
                      <option value={60}>60 Minutes (Full-stack architecture)</option>
                    </select>
                  </div>

                  {/* Passing Threshold Percent */}
                  <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Passing Threshold</span>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedRole?.passThresholdPercent || 75}%
                      </Badge>
                    </div>
                    <select
                      value={selectedRole?.passThresholdPercent || 75}
                      onChange={(e) => {
                        const nextThreshold = Number(e.target.value);
                        const updated: JobRole = {
                          ...selectedRole!,
                          passThresholdPercent: nextThreshold,
                          isCustom: true,
                        };
                        persistJobRoleToServer(updated);
                        onRolesUpdated();
                        toast.success(`Passing threshold updated to ${nextThreshold}%`);
                      }}
                      className="w-full text-xs h-8 rounded-lg border border-input bg-background px-2"
                    >
                      <option value={60}>60% (Lenient pass criteria)</option>
                      <option value={70}>70% (Standard competency)</option>
                      <option value={75}>75% (Recommended benchmark)</option>
                      <option value={80}>80% (Strict technical bar)</option>
                      <option value={85}>85% (Senior / Principal benchmark)</option>
                    </select>
                  </div>

                  {/* Anti-Cheat Tab Sentinel Notice */}
                  <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>Integrity & Anti-Cheat Sentinel</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      All candidate attempts are monitored with real-time blur/tab-switch detection. Maximum 3 warnings before submission is flagged for review.
                    </p>
                  </div>

                  {/* Auto-Save Notice */}
                  <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>All changes persist automatically to database.</span>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}
      </div>

      {/* 3. Live Assessment Simulator / Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <DialogTitle className="text-sm font-bold">
                  Assessment Candidate Simulation: {selectedRole?.title}
                </DialogTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                Candidate View
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Test how candidates experience the proctored assessment, answer questions, and receive automatic scoring.
            </DialogDescription>
          </DialogHeader>

          {/* Simulation Viewport */}
          {(() => {
            const hasQuestions = questions.length > 0;
            if (!hasQuestions) {
              return (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No questions to preview. Add at least 1 question to the assessment.
                </div>
              );
            }

            if (previewIsFinished) {
              // Calculate score
              let earnedPoints = 0;
              questions.forEach((q) => {
                const answer = previewAnswers[q.id];
                const isChoice = q.type === 'mcq' || q.type === 'media_mcq' || !q.type;
                if (isChoice) {
                  const isCorrect = answer === q.correctAnswer;
                  if (isCorrect) {
                    earnedPoints += (q.points || 10);
                  }
                } else {
                  // Written questions receive credit if answered
                  const hasAnswer = Boolean(answer && answer.trim().length > 0);
                  if (hasAnswer) {
                    earnedPoints += (q.points || 10);
                  }
                }
              });

              const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
              const threshold = selectedRole?.passThresholdPercent || 75;
              const isPassed = scorePercent >= threshold;

              return (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-muted/60">
                    {isPassed ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    ) : (
                      <XCircle className="w-10 h-10 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {isPassed ? 'Assessment Passed!' : 'Assessment Incomplete / Below Threshold'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Candidate scored {earnedPoints} / {totalPoints} points ({scorePercent}%). Passing threshold is {threshold}%.
                    </p>
                  </div>
                  <Progress value={scorePercent} className="h-2 max-w-sm mx-auto" />
                  <div className="pt-2">
                    <Button size="sm" onClick={handleLaunchPreview} className="text-xs">
                      Restart Simulation
                    </Button>
                  </div>
                </div>
              );
            }

            const currentQ = questions[previewQuestionIndex];
            const isChoice = currentQ.type === 'mcq' || currentQ.type === 'media_mcq' || !currentQ.type;
            const isMedia = currentQ.type === 'media_mcq' || currentQ.type === 'media_prompt';
            const isOpen = currentQ.type === 'text_open' || currentQ.type === 'media_prompt';
            const currentAnswer = previewAnswers[currentQ.id] || '';

            return (
              <div className="space-y-4 py-2">
                {/* Simulation HUD Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Question {previewQuestionIndex + 1} of {questions.length}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {currentQ.points || 10} Points
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-primary font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{Math.floor(previewSecondsLeft / 60)}:{(previewSecondsLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <Progress
                  value={((previewQuestionIndex + 1) / questions.length) * 100}
                  className="h-1.5"
                />

                {/* Question Statement */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {currentQ.question}
                  </h3>
                  {currentQ.helpText && (
                    <p className="text-xs text-muted-foreground italic">
                      {currentQ.helpText}
                    </p>
                  )}
                </div>

                {/* Media Preview if attached */}
                {isMedia && Boolean(currentQ.mediaUrl) && (
                  <div className="p-2 rounded-lg bg-muted/30 border border-border flex items-center justify-center max-h-48 overflow-hidden">
                    {currentQ.mediaType === 'video' && (
                      <video src={currentQ.mediaUrl} controls className="max-h-40 rounded" />
                    )}
                    {currentQ.mediaType === 'audio' && (
                      <audio src={currentQ.mediaUrl} controls className="w-full" />
                    )}
                    {(!currentQ.mediaType || currentQ.mediaType === 'image') && (
                      <img src={currentQ.mediaUrl} alt="" className="max-h-40 rounded object-contain" />
                    )}
                  </div>
                )}

                {/* Choice Options */}
                {isChoice && Boolean(currentQ.options) && (
                  <div className="space-y-2">
                    {currentQ.options!.map((opt, optIdx) => {
                      const isSelected = currentAnswer === opt;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            setPreviewAnswers({ ...previewAnswers, [currentQ.id]: opt });
                          }}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary/40'
                              : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Written Response Field */}
                {isOpen && (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={currentAnswer}
                      onChange={(e) => setPreviewAnswers({ ...previewAnswers, [currentQ.id]: e.target.value })}
                      placeholder={currentQ.placeholder || 'Write your response here...'}
                      className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                    />
                    <div className="text-[11px] text-muted-foreground text-right font-mono">
                      Max: {currentQ.maxWordCount || 300} words
                    </div>
                  </div>
                )}

                {/* Simulation Stepper Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={previewQuestionIndex === 0}
                    onClick={() => setPreviewQuestionIndex(previewQuestionIndex - 1)}
                    className="text-xs"
                  >
                    Previous
                  </Button>

                  {previewQuestionIndex < questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setPreviewQuestionIndex(previewQuestionIndex + 1)}
                      className="text-xs"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setPreviewIsFinished(true)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      Submit Simulation
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}

          <DialogFooter className="pt-2 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)} className="text-xs">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { useTheme, THEME_CONFIGS, AppThemeType } from '@/lib/theme-context';
import {
  BooleanDisplayPreset,
  QuestionDifficulty,
  QuestionLayoutMode,
  FormType,
  FormAccessType,
} from '@/lib/types/form';
import {
  Settings,
  SlidersHorizontal,
  Award,
  Clock,
  ShieldAlert,
  Palette,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface CentralQuizConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CentralQuizConfigModal: React.FC<CentralQuizConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    batchApplyConfig,
    fields,
    formType,
    setFormType,
    formAccess,
    setFormAccess,
    isSequential,
    setIsSequential,
  } = useQuizStore();

  const { theme: currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('defaults');

  const totalPoints = fields.reduce((acc, f) => acc + (f.points || 0), 0);
  const requiredCount = fields.filter((f) => f.isRequired).length;

  const handleDifficultyChange = (val: string) => {
    if (val === 'custom') {
      updateSettings({
        defaultDifficulty: 'custom',
        defaultPoints: settings.defaultPoints || 10,
      });
      return;
    }

    const diff = val as QuestionDifficulty;
    const defaultPts = diff === 'easy' ? 5 : diff === 'medium' ? 10 : 20;
    updateSettings({
      defaultDifficulty: diff,
      defaultPoints: defaultPts,
    });
  };

  const handleApplyAllDefaults = () => {
    const diff = settings.defaultDifficulty || 'medium';
    let pts = settings.defaultPoints !== undefined ? settings.defaultPoints : 10;
    if (settings.defaultPoints === undefined) {
      pts = diff === 'easy' ? 5 : diff === 'medium' ? 10 : diff === 'hard' ? 20 : 10;
    }

    batchApplyConfig({
      points: pts,
      difficulty: diff,
      choiceAlignment: settings.defaultAlignment || 'center',
      booleanDisplay: settings.defaultBooleanPreset || 'true_false',
      isRequired: settings.defaultQuestionsRequired ?? true,
      allowOtherOption: Boolean(settings.defaultAllowOtherOption),
      questionLayout: settings.defaultQuestionLayout || 'standard',
    });

    toast.success(`Synchronized central defaults across all ${fields.length} questions!`);
  };

  const handleSyncPointsOnly = () => {
    const pts = settings.defaultPoints !== undefined ? settings.defaultPoints : 10;
    batchApplyConfig({ points: pts });
    toast.success(`Updated points to ${pts} pts on all questions`);
  };

  const handleSyncAlignmentOnly = () => {
    const align = settings.defaultAlignment || 'center';
    batchApplyConfig({ choiceAlignment: align });
    toast.success(`Aligned choices to "${align}" on all questions`);
  };

  const handleSyncBooleanPresetOnly = () => {
    const preset = settings.defaultBooleanPreset || 'true_false';
    batchApplyConfig({ booleanDisplay: preset });
    toast.success(`Updated boolean format to "${preset.replace('_', ' ')}" across all binary questions`);
  };

  const handleSyncRequiredOnly = () => {
    const req = settings.defaultQuestionsRequired ?? true;
    batchApplyConfig({ isRequired: req });
    toast.success(`Set required to ${req ? 'Mandatory' : 'Optional'} across all questions`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-card border border-border shadow-2xl p-0 gap-0 rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground font-heading">
                  Centralized Quiz Configuration
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Global assessment defaults, inheritance rules, anti-cheat security &amp; batch synchronization.
                </DialogDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50">
              <span>{fields.length} Qs</span>
              <span>&bull;</span>
              <span>{totalPoints} Pts</span>
              <span>&bull;</span>
              <span>Pass {settings.passingScore ?? 70}%</span>
            </div>
          </div>
        </DialogHeader>

        {/* Tabbed Configuration Architecture */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-5 pt-3 border-b border-border/60 bg-muted/10">
            <TabsList className="grid grid-cols-5 h-9 p-0.5 bg-muted/60 rounded-xl">
              <TabsTrigger value="defaults" className="text-xs gap-1.5 font-medium py-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Defaults</span>
              </TabsTrigger>
              <TabsTrigger value="timing" className="text-xs gap-1.5 font-medium py-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Timing</span>
              </TabsTrigger>
              <TabsTrigger value="grading" className="text-xs gap-1.5 font-medium py-1">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Grading</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs gap-1.5 font-medium py-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="theme" className="text-xs gap-1.5 font-medium py-1">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Palette</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Question Defaults & Inheritance */}
          <TabsContent value="defaults" className="p-5 space-y-4 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Difficulty & Points */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    <span>Default Difficulty &amp; Points</span>
                  </Label>
                  <Badge variant="outline" className="text-xs font-mono font-medium text-primary">
                    {settings.defaultPoints ?? 10} pts
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={settings.defaultDifficulty || 'medium'}
                    onValueChange={handleDifficultyChange}
                  >
                    <SelectTrigger className="h-9 text-xs flex-1 bg-background text-foreground border-border">
                      <SelectValue placeholder="Select Tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="easy" className="text-xs">Easy (5 pts)</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium (10 pts)</SelectItem>
                      <SelectItem value="hard" className="text-xs">Hard (20 pts)</SelectItem>
                      <SelectItem value="custom" className="text-xs font-semibold text-primary">Custom Points...</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={settings.defaultPoints ?? 10}
                      onChange={(e) =>
                        updateSettings({
                          defaultPoints: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-20 h-9 text-xs font-mono text-center bg-background border-border font-semibold"
                      min={0}
                    />
                    <span className="text-xs text-muted-foreground font-medium">pts</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Newly generated or added questions will automatically inherit this point score.
                </p>
              </div>

              {/* Default Boolean Display Preset */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Default Boolean / Binary Format</span>
                </Label>
                <Select
                  value={settings.defaultBooleanPreset || 'true_false'}
                  onValueChange={(val: BooleanDisplayPreset) =>
                    updateSettings({ defaultBooleanPreset: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border">
                    <SelectValue placeholder="Select Binary Style" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="true_false" className="text-xs">True / False</SelectItem>
                    <SelectItem value="yes_no" className="text-xs">Yes / No</SelectItem>
                    <SelectItem value="agree_disagree" className="text-xs">Agree / Disagree</SelectItem>
                    <SelectItem value="enable_disable" className="text-xs">Enable / Disable</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Controls how binary True/False questions render default answer pills across the assessment.
                </p>
              </div>

              {/* Default Choice Alignment */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <AlignCenter className="w-4 h-4 text-primary" />
                  <span>Default Choice &amp; Option Alignment</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'left', label: 'Left', icon: AlignLeft },
                    { key: 'center', label: 'Center', icon: AlignCenter },
                    { key: 'right', label: 'Right', icon: AlignRight },
                  ].map(({ key, label, icon: Icon }) => {
                    const isSelected = (settings.defaultAlignment || 'center') === key;
                    return (
                      <Button
                        key={key}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          updateSettings({ defaultAlignment: key as 'left' | 'center' | 'right' })
                        }
                        className={`h-9 text-xs gap-1.5 cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Establishes the default text &amp; button alignment for multiple choice and binary options.
                </p>
              </div>

              {/* Default Question Layout Architecture */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Default Question Display Layout</span>
                </Label>
                <Select
                  value={settings.defaultQuestionLayout || 'standard'}
                  onValueChange={(val: QuestionLayoutMode) =>
                    updateSettings({ defaultQuestionLayout: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border">
                    <SelectValue placeholder="Select Layout Mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="standard" className="text-xs">
                      Standard Quiz (Single Card Stack)
                    </SelectItem>
                    <SelectItem value="presentation_split" className="text-xs">
                      Presentation Split-Screen (Dual Column)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Determines whether candidates see a traditional card stack or a side-by-side presentation view.
                </p>
              </div>
            </div>

            {/* Toggle Row: Mandatory and Allow Other */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/20">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Default Mandatory Questions
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    New questions require an answer by default
                  </span>
                </div>
                <Switch
                  checked={settings.defaultQuestionsRequired ?? true}
                  onCheckedChange={(checked) =>
                    updateSettings({ defaultQuestionsRequired: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/20">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Allow &quot;Other&quot; by Default
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Multiple choice questions include custom input
                  </span>
                </div>
                <Switch
                  checked={Boolean(settings.defaultAllowOtherOption)}
                  onCheckedChange={(checked) =>
                    updateSettings({ defaultAllowOtherOption: checked })
                  }
                />
              </div>
            </div>

            {/* 1-Click Batch Synchronization Panel */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-bold text-foreground">
                    Batch Synchronize to Existing Questions ({fields.length})
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyAllDefaults}
                  className="h-8 px-3 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground shadow-xs cursor-pointer hover:bg-primary/90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Universal Sync (All Defaults)</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update existing questions in this quiz to match the central configuration above in one click:
              </p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncPointsOnly}
                  className="h-7 text-xs px-2.5 bg-background border-border text-foreground hover:bg-muted"
                >
                  Sync Points ({settings.defaultPoints ?? 10} pts)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncAlignmentOnly}
                  className="h-7 text-xs px-2.5 bg-background border-border text-foreground hover:bg-muted"
                >
                  Sync Alignment ({settings.defaultAlignment || 'center'})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncBooleanPresetOnly}
                  className="h-7 text-xs px-2.5 bg-background border-border text-foreground hover:bg-muted"
                >
                  Sync Binary Preset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncRequiredOnly}
                  className="h-7 text-xs px-2.5 bg-background border-border text-foreground hover:bg-muted"
                >
                  Sync Mandatory Status
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Timing & Progression */}
          <TabsContent value="timing" className="p-5 space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Timer Execution Mode</span>
              </Label>
              <Select
                value={settings.timerMode || 'global'}
                onValueChange={(val: 'none' | 'global' | 'per_question' | 'per_tier') =>
                  updateSettings({ timerMode: val })
                }
              >
                <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="global" className="text-xs">⏱️ Global Timer (Entire Exam)</SelectItem>
                  <SelectItem value="per_question" className="text-xs">⏳ Per-Question Timer</SelectItem>
                  <SelectItem value="per_tier" className="text-xs">⚡ Difficulty-Based Timers (Easy/Med/Hard)</SelectItem>
                  <SelectItem value="none" className="text-xs">🚫 Untimed (Self-Paced / No Limit)</SelectItem>
                </SelectContent>
              </Select>

              {/* Global Duration */}
              {(settings.timerMode || 'global') === 'global' && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Total Exam Duration:</span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={settings.timeLimitSeconds ?? 600}
                      onChange={(e) =>
                        updateSettings({ timeLimitSeconds: Math.max(10, Number(e.target.value) || 0) })
                      }
                      className="h-8 w-24 text-xs font-mono text-center bg-background border-border font-semibold"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      sec ({Math.round((settings.timeLimitSeconds ?? 600) / 60)} min)
                    </span>
                  </div>
                </div>
              )}

              {/* Per-Question Duration */}
              {settings.timerMode === 'per_question' && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Duration Per Question:</span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={settings.perQuestionSeconds ?? 60}
                      onChange={(e) =>
                        updateSettings({ perQuestionSeconds: Math.max(5, Number(e.target.value) || 0) })
                      }
                      className="h-8 w-20 text-xs font-mono text-center bg-background border-border font-semibold"
                    />
                    <span className="text-xs text-muted-foreground font-mono">sec</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pacing & Progression */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    {isSequential ? 'Sequential Progression' : 'Free Navigation'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isSequential
                      ? 'Candidates must complete questions sequentially 1-by-1'
                      : 'Candidates can freely jump between questions using the sidebar'}
                  </span>
                </div>
                <Switch checked={isSequential} onCheckedChange={setIsSequential} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    Shuffle Question Order
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Randomize question sequence for each candidate
                  </span>
                </div>
                <Switch
                  checked={Boolean(settings.shuffleQuestions)}
                  onCheckedChange={(checked) => updateSettings({ shuffleQuestions: checked })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    Shuffle Option Choices
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Randomize choice order (A, B, C...) within each question
                  </span>
                </div>
                <Switch
                  checked={Boolean(settings.shuffleOptions)}
                  onCheckedChange={(checked) => updateSettings({ shuffleOptions: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Grading & Assessment */}
          <TabsContent value="grading" className="p-5 space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Assessment Type &amp; Grading Engine</span>
              </Label>
              <Select value={formType} onValueChange={(val: FormType) => setFormType(val)}>
                <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="quiz" className="text-xs">🏆 Graded Assessment (Points, Pass/Fail &amp; Feedback)</SelectItem>
                  <SelectItem value="survey" className="text-xs">📝 Survey / Feedback Form (Ungraded)</SelectItem>
                  <SelectItem value="poll" className="text-xs">📊 Live Instant Poll</SelectItem>
                </SelectContent>
              </Select>

              {formType === 'quiz' && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Minimum Passing Score:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <Input
                      type="number"
                      value={settings.passingScore ?? 70}
                      onChange={(e) =>
                        updateSettings({
                          passingScore: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                        })
                      }
                      className="h-8 w-20 text-xs text-center bg-background border-border font-semibold"
                      min={0}
                      max={100}
                    />
                    <span className="text-xs text-muted-foreground font-semibold">%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
              <Label className="text-xs font-semibold text-foreground">Completion / Success Message</Label>
              <Textarea
                value={settings.successMessage || 'Thank you! Your response has been recorded.'}
                onChange={(e) => updateSettings({ successMessage: e.target.value })}
                rows={2}
                className="text-xs bg-background text-foreground border-border resize-none"
                placeholder="Message displayed to candidates upon exam submission..."
              />
            </div>
          </TabsContent>

          {/* Tab 4: Security & Access */}
          <TabsContent value="security" className="p-5 space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Form Access &amp; Candidate Permissions</span>
              </Label>
              <Select value={formAccess} onValueChange={(val: FormAccessType) => setFormAccess(val)}>
                <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="public" className="text-xs">🌍 Public (Open to anyone with URL link)</SelectItem>
                  <SelectItem value="token" className="text-xs">🔑 Secret Access Token Required</SelectItem>
                  <SelectItem value="invite_only" className="text-xs">✉️ Invite Only (White-listed candidates)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  Fullscreen Anti-Cheat Lock
                </span>
                <span className="text-xs text-muted-foreground">
                  Enforces full-screen mode and detects window tab switching
                </span>
              </div>
              <Switch
                checked={Boolean(settings.enableFullscreenLock)}
                onCheckedChange={(checked) => updateSettings({ enableFullscreenLock: checked })}
              />
            </div>
          </TabsContent>

          {/* Tab 5: Theme & Palette */}
          <TabsContent value="theme" className="p-5 space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Presentation Palette &amp; Brand Styling</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {Object.values(THEME_CONFIGS).map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as AppThemeType)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-accent/40 shadow-xs'
                          : 'border-border/80 bg-background hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground truncate">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{t.tagline}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Configuration changes auto-save into active exam session.
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-lg"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

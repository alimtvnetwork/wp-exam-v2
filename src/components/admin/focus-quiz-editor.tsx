import React, { useState, useEffect } from 'react';
import {
  FocusQuizConfig,
  FocusQuestion,
  ReadingPage,
  ChecklistItem,
} from '@/components/runner/FocusQuizRunner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { toast } from 'sonner';
import {
  PlayCircle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ListChecks,
  HelpCircle,
  FileJson,
  Layers,
  ExternalLink,
} from 'lucide-react';

const STORAGE_KEY = 'wp_exam_saved_focus_quiz';

const INITIAL_FOCUS_CONFIG: FocusQuizConfig = {
  id: 'custom-focus-quiz',
  title: 'Engineering Technical Assessment',
  themeId: 'purple',
  hasIntro: true,
  introTitle: "You're in the **right place**!",
  introSubtitle: 'To tailor the assessment to your background, please complete the sequential steps.',
  introImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  passingScore: 70,
  emailCadence: 'per_section',
  readingSection: {
    title: 'Module 1: Architectural Guidelines & Coding Standards',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    pages: [
      {
        pageNumber: 1,
        title: 'Split SQLite Database Architecture',
        content: 'Candidates must respect multi-tenant database isolation. Each project maintains its own isolated database file.',
      },
      {
        pageNumber: 2,
        title: 'Strict Boolean Conventions',
        content: 'Evaluate booleans implicitly without explicit true comparisons. Never combine positive and negative conditions.',
      },
    ],
  },
  checklistSection: {
    title: 'Pre-Assessment Readiness Checklist',
    subtitle: 'Ensure your environment meets the minimum standards before initiating the timed section.',
    items: [
      { id: 'item-1', label: 'Local environment running PHP 8.2+ or Node.js 18+', isMandatory: true },
      { id: 'item-2', label: 'Stable internet connection with camera/screen access', isMandatory: true },
      { id: 'item-3', label: 'GitHub repository or Google Docs work link ready for submission', isMandatory: false },
    ],
  },
  questions: [
    {
      id: 'fq-1',
      type: 'mcq',
      title: 'Which database pattern provides complete data isolation per assessment project?',
      subtitle: 'Select the optimal architectural model for multi-tenant candidate data.',
      options: [
        'Single monolithic MySQL database with shared tables',
        'Split SQLite engine with per-project database files',
        'In-memory JavaScript array without persistence',
        'Flat JSON file stored on desktop',
      ],
      correctAnswer: 'Split SQLite engine with per-project database files',
      points: 25,
      hint: 'Refer to Spec 21 app database architecture guidelines.',
    },
    {
      id: 'fq-2',
      type: 'multiselect',
      title: 'Which boolean evaluation patterns are strictly prohibited in our coding standard?',
      subtitle: 'Select all violations.',
      options: [
        'if (isReady == true)',
        'if (isReady)',
        'if (isFirst && !isSecond)',
        'if (hasPermission)',
      ],
      correctAnswer: ['if (isReady == true)', 'if (isFirst && !isSecond)'],
      points: 25,
      hint: 'Positive booleans must be evaluated implicitly, and mixed polarity is banned.',
    },
    {
      id: 'fq-3',
      type: 'paragraph',
      title: 'Explain the benefits of distraction-free focus assessments for technical candidates.',
      subtitle: 'Provide a concise 2-3 paragraph answer.',
      points: 25,
      hint: 'Discuss cognitive load, linear progression, and immediate feedback.',
    },
    {
      id: 'fq-4',
      type: 'url_submission',
      title: 'Submit your Google Docs or Workflowy architectural proposal link',
      subtitle: 'Ensure public read-access is granted to the review panel.',
      verificationType: 'google_docs',
      points: 25,
      hint: 'The link must begin with https://docs.google.com/ or https://workflowy.com/',
    },
  ],
};

interface FocusQuizEditorProps {
  onLaunchRunner: (config: FocusQuizConfig) => void;
}

export const FocusQuizEditor: React.FC<FocusQuizEditorProps> = ({ onLaunchRunner }) => {
  const [config, setConfig] = useState<FocusQuizConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback to initial config
        }
      }
    }

    return INITIAL_FOCUS_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'general' | 'intro' | 'reading' | 'checklist' | 'questions'>('general');

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config, null, 2));
    }

    toast.success('Focus Quiz configuration saved successfully!');
  };

  const handleReset = () => {
    setConfig(INITIAL_FOCUS_CONFIG);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FOCUS_CONFIG, null, 2));
    }

    toast.info('Reset to default Focus Quiz template');
  };

  const handleLaunch = () => {
    handleSave();
    onLaunchRunner(config);
  };

  const handleAddQuestion = (type: FocusQuestion['type']) => {
    const newQuestion: FocusQuestion = {
      id: `fq-${Date.now()}`,
      type,
      title: 'New Assessment Question',
      subtitle: 'Provide clear instructions for the candidate',
      points: 10,
      options: type === 'mcq' || type === 'multiselect' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      correctAnswer: type === 'mcq' ? 'Option 1' : undefined,
    };

    setConfig((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));

    toast.success(`Added new ${type} question`);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<FocusQuestion>) => {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  };

  const handleRemoveQuestion = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));

    toast.info('Question removed');
  };

  const handleAddReadingPage = () => {
    const currentPages = config.readingSection?.pages || [];
    const newPage: ReadingPage = {
      pageNumber: currentPages.length + 1,
      title: `Topic ${currentPages.length + 1}`,
      content: 'Enter instructional reading content for candidates...',
    };

    setConfig((prev) => ({
      ...prev,
      readingSection: {
        title: prev.readingSection?.title || 'Instructional Briefing',
        videoUrl: prev.readingSection?.videoUrl,
        pages: [...currentPages, newPage],
      },
    }));
  };

  const handleRemoveReadingPage = (index: number) => {
    const currentPages = config.readingSection?.pages || [];
    const updated = currentPages.filter((_, i) => i !== index);

    setConfig((prev) => ({
      ...prev,
      readingSection: prev.readingSection
        ? {
            ...prev.readingSection,
            pages: updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
          }
        : undefined,
    }));
  };

  const handleAddChecklistItem = () => {
    const currentItems = config.checklistSection?.items || [];
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: 'New mandatory candidate verification check',
      isMandatory: true,
    };

    setConfig((prev) => ({
      ...prev,
      checklistSection: {
        title: prev.checklistSection?.title || 'Pre-Assessment Checklist',
        subtitle: prev.checklistSection?.subtitle,
        items: [...currentItems, newItem],
      },
    }));
  };

  const handleRemoveChecklistItem = (id: string) => {
    const currentItems = config.checklistSection?.items || [];

    setConfig((prev) => ({
      ...prev,
      checklistSection: prev.checklistSection
        ? {
            ...prev.checklistSection,
            items: currentItems.filter((i) => i.id !== id),
          }
        : undefined,
    }));
  };

  const totalPoints = config.questions.reduce((acc, q) => acc + (q.points || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Studio Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Focus Quiz Authoring Studio
            </h1>
            <Badge variant="secondary" className="text-xs font-mono">Focus Engine</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create sequential, 4-stage distraction-free candidate assessments with video briefings and checklists.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs h-8 gap-1.5 border-border text-muted-foreground hover:text-foreground"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="text-xs h-8 gap-1.5 border-border"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            onClick={handleLaunch}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 font-semibold"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Preview in Runner</span>
          </Button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[11px] text-muted-foreground block">Active Theme</span>
          <span className="text-sm font-bold capitalize text-primary">{config.themeId || 'purple'}</span>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[11px] text-muted-foreground block">Passing Threshold</span>
          <span className="text-sm font-bold text-foreground">{config.passingScore || 70}%</span>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[11px] text-muted-foreground block">Questions</span>
          <span className="text-sm font-bold text-foreground">{config.questions.length} items</span>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[11px] text-muted-foreground block">Max Possible Score</span>
          <span className="text-sm font-bold text-foreground">{totalPoints} pts</span>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/80 pb-2 overflow-x-auto">
        <Button
          type="button"
          variant={activeTab === 'general' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('general')}
          className="text-xs h-8 gap-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. General Rules</span>
        </Button>

        <Button
          type="button"
          variant={activeTab === 'intro' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('intro')}
          className="text-xs h-8 gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>2. Welcome Screen</span>
        </Button>

        <Button
          type="button"
          variant={activeTab === 'reading' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reading')}
          className="text-xs h-8 gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>3. Video & Reading</span>
        </Button>

        <Button
          type="button"
          variant={activeTab === 'checklist' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('checklist')}
          className="text-xs h-8 gap-1.5"
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>4. Pre-Test Checklist</span>
        </Button>

        <Button
          type="button"
          variant={activeTab === 'questions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('questions')}
          className="text-xs h-8 gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>5. Assessment Questions ({config.questions.length})</span>
        </Button>
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === 'general' && (
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/15">
            <CardTitle className="text-sm font-semibold">General Assessment Rules</CardTitle>
            <CardDescription className="text-xs">Configure title, passing score, email notification cadence, and visual theme.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quiz Title</Label>
                <Input
                  value={config.title}
                  onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Senior Frontend Architecture Screening"
                  className="text-xs h-9 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Unique Quiz Slug / ID</Label>
                <Input
                  value={config.id}
                  onChange={(e) => setConfig((p) => ({ ...p, id: e.target.value }))}
                  placeholder="e.g. senior-frontend-v1"
                  className="text-xs h-9 bg-background font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Visual Theme Preset</Label>
                <Select
                  value={config.themeId || 'purple'}
                  onValueChange={(val) => setConfig((p) => ({ ...p, themeId: val }))}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">Purple Theme (Deep Purple & Focus)</SelectItem>
                    <SelectItem value="riseup-asia">Rise Up Asia (Gold & Modern Dark)</SelectItem>
                    <SelectItem value="dracula">Dracula (Vibrant Purple & Slate)</SelectItem>
                    <SelectItem value="vscode-dark">VS Code Dark (Professional Slate)</SelectItem>
                    <SelectItem value="microsoft-blue">Microsoft Fluent Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Passing Threshold (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={config.passingScore || 70}
                  onChange={(e) => setConfig((p) => ({ ...p, passingScore: Number(e.target.value) }))}
                  className="text-xs h-9 bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Welcome Screen */}
      {activeTab === 'intro' && (
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/15">
            <CardTitle className="text-sm font-semibold">Welcome & Candidate Introduction</CardTitle>
            <CardDescription className="text-xs">First screen presented to candidates before briefing and questions begin.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="has-intro-toggle" className="text-xs font-semibold cursor-pointer">
                  Enable Welcome Intro Screen
                </Label>
                <p className="text-[11px] text-muted-foreground">Presents a hero card with motivational text before questions.</p>
              </div>
              <Switch
                id="has-intro-toggle"
                checked={config.hasIntro ?? true}
                onCheckedChange={(val) => setConfig((p) => ({ ...p, hasIntro: val }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intro Title / Headline (Markdown Supported)</Label>
              <Input
                value={config.introTitle || ''}
                onChange={(e) => setConfig((p) => ({ ...p, introTitle: e.target.value }))}
                placeholder="You're in the **right place**!"
                className="text-xs h-9 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intro Subtitle / Instructions</Label>
              <Textarea
                value={config.introSubtitle || ''}
                onChange={(e) => setConfig((p) => ({ ...p, introSubtitle: e.target.value }))}
                placeholder="Explain the assessment goals and expectations..."
                rows={3}
                className="text-xs bg-background resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intro Hero Image URL</Label>
              <Input
                value={config.introImage || ''}
                onChange={(e) => setConfig((p) => ({ ...p, introImage: e.target.value }))}
                placeholder="https://images.unsplash.com/photo-..."
                className="text-xs h-9 bg-background"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Reading Material & Video */}
      {activeTab === 'reading' && (
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/15 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Video Briefing & Reading Material</CardTitle>
              <CardDescription className="text-xs">Instructional materials candidates must review prior to answering questions.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddReadingPage}
              className="text-xs h-7 gap-1 border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic Page</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Section Title</Label>
                <Input
                  value={config.readingSection?.title || ''}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      readingSection: {
                        title: e.target.value,
                        videoUrl: p.readingSection?.videoUrl,
                        pages: p.readingSection?.pages || [],
                      },
                    }))
                  }
                  placeholder="Module 1: Architecture Guidelines"
                  className="text-xs h-9 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Briefing Video Embed URL (YouTube / Vimeo)</Label>
                <Input
                  value={config.readingSection?.videoUrl || ''}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      readingSection: {
                        title: p.readingSection?.title || 'Instructional Briefing',
                        videoUrl: e.target.value,
                        pages: p.readingSection?.pages || [],
                      },
                    }))
                  }
                  placeholder="https://www.youtube-nocookie.com/embed/..."
                  className="text-xs h-9 bg-background"
                />
              </div>
            </div>

            {/* Reading Pages List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold block text-foreground">Reading Pages ({config.readingSection?.pages.length || 0})</span>
              {config.readingSection?.pages.map((page, idx) => (
                <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary">Page {page.pageNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReadingPage(idx)}
                      className="text-xs h-6 px-1.5 text-rose-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={page.title}
                    onChange={(e) => {
                      const updated = [...(config.readingSection?.pages || [])];
                      updated[idx].title = e.target.value;
                      setConfig((p) => ({
                        ...p,
                        readingSection: {
                          title: p.readingSection?.title || '',
                          videoUrl: p.readingSection?.videoUrl,
                          pages: updated,
                        },
                      }));
                    }}
                    placeholder="Page Title"
                    className="text-xs h-8 bg-background font-semibold"
                  />
                  <Textarea
                    value={page.content}
                    onChange={(e) => {
                      const updated = [...(config.readingSection?.pages || [])];
                      updated[idx].content = e.target.value;
                      setConfig((p) => ({
                        ...p,
                        readingSection: {
                          title: p.readingSection?.title || '',
                          videoUrl: p.readingSection?.videoUrl,
                          pages: updated,
                        },
                      }));
                    }}
                    placeholder="Detailed page text..."
                    rows={2}
                    className="text-xs bg-background resize-none"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Pre-Test Checklist */}
      {activeTab === 'checklist' && (
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/15 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Pre-Assessment Readiness Checklist</CardTitle>
              <CardDescription className="text-xs">Candidates must review and check these items before advancing.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddChecklistItem}
              className="text-xs h-7 gap-1 border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Checklist Item</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Checklist Header Title</Label>
                <Input
                  value={config.checklistSection?.title || ''}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      checklistSection: {
                        title: e.target.value,
                        subtitle: p.checklistSection?.subtitle,
                        items: p.checklistSection?.items || [],
                      },
                    }))
                  }
                  placeholder="Pre-Assessment Readiness Checklist"
                  className="text-xs h-9 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Checklist Subtitle / Notice</Label>
                <Input
                  value={config.checklistSection?.subtitle || ''}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      checklistSection: {
                        title: p.checklistSection?.title || '',
                        subtitle: e.target.value,
                        items: p.checklistSection?.items || [],
                      },
                    }))
                  }
                  placeholder="Ensure your environment meets the minimum standards..."
                  className="text-xs h-9 bg-background"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {config.checklistSection?.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-muted/20 border border-border rounded-lg">
                  <Input
                    value={item.label}
                    onChange={(e) => {
                      const updated = (config.checklistSection?.items || []).map((i) =>
                        i.id === item.id ? { ...i, label: e.target.value } : i
                      );
                      setConfig((p) => ({
                        ...p,
                        checklistSection: {
                          title: p.checklistSection?.title || '',
                          subtitle: p.checklistSection?.subtitle,
                          items: updated,
                        },
                      }));
                    }}
                    placeholder="Checklist condition..."
                    className="text-xs h-8 bg-background flex-1"
                  />

                  <div className="flex items-center gap-1.5">
                    <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Mandatory</Label>
                    <Switch
                      checked={item.isMandatory ?? true}
                      onCheckedChange={(val) => {
                        const updated = (config.checklistSection?.items || []).map((i) =>
                          i.id === item.id ? { ...i, isMandatory: val } : i
                        );
                        setConfig((p) => ({
                          ...p,
                          checklistSection: {
                            title: p.checklistSection?.title || '',
                            subtitle: p.checklistSection?.subtitle,
                            items: updated,
                          },
                        }));
                      }}
                      className="scale-75"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-xs h-7 px-1.5 text-rose-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Assessment Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Scored Questions ({config.questions.length})</span>
              <Badge variant="outline" className="text-[10px]">{totalPoints} total points</Badge>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('mcq')}
                className="text-xs h-7 gap-1 border-border"
              >
                <Plus className="w-3 h-3" />
                <span>MCQ</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('multiselect')}
                className="text-xs h-7 gap-1 border-border"
              >
                <Plus className="w-3 h-3" />
                <span>Multi-Select</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('paragraph')}
                className="text-xs h-7 gap-1 border-border"
              >
                <Plus className="w-3 h-3" />
                <span>Paragraph</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('url_submission')}
                className="text-xs h-7 gap-1 border-border"
              >
                <Plus className="w-3 h-3" />
                <span>URL Link</span>
              </Button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {config.questions.map((q, idx) => (
              <Card key={q.id} className="border-border bg-card shadow-xs">
                <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/15 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-mono">Q{idx + 1}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">{q.type.replace('_', ' ')}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-mono">Points:</span>
                      <Input
                        type="number"
                        min={0}
                        value={q.points || 0}
                        onChange={(e) => handleUpdateQuestion(q.id, { points: Number(e.target.value) })}
                        className="w-16 h-7 text-xs bg-background font-mono text-center"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-xs h-7 px-1.5 text-rose-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Question Prompt</Label>
                    <Input
                      value={q.title}
                      onChange={(e) => handleUpdateQuestion(q.id, { title: e.target.value })}
                      placeholder="Question prompt..."
                      className="text-xs h-9 bg-background font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Subtitle / Clarification</Label>
                    <Input
                      value={q.subtitle || ''}
                      onChange={(e) => handleUpdateQuestion(q.id, { subtitle: e.target.value })}
                      placeholder="Additional context or guidance..."
                      className="text-xs h-8 bg-background"
                    />
                  </div>

                  {/* Options builder for MCQ and MultiSelect */}
                  {(q.type === 'mcq' || q.type === 'multiselect') && (
                    <div className="space-y-2 pt-1">
                      <Label className="text-xs font-semibold block">Options & Choices</Label>
                      {Array.isArray(q.options) &&
                        q.options.map((opt, optIdx) => {
                          const optLabel = typeof opt === 'string' ? opt : opt.label;
                          const isCorrect =
                            q.type === 'mcq'
                              ? q.correctAnswer === optLabel
                              : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optLabel);

                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant={isCorrect ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  if (q.type === 'mcq') {
                                    handleUpdateQuestion(q.id, { correctAnswer: optLabel });
                                  } else {
                                    const current = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
                                    const exists = current.includes(optLabel);
                                    const next = exists
                                      ? current.filter((c) => c !== optLabel)
                                      : [...current, optLabel];
                                    handleUpdateQuestion(q.id, { correctAnswer: next });
                                  }
                                }}
                                className="text-[10px] h-7 w-24 px-2 shrink-0 justify-center whitespace-nowrap"
                                title="Mark as correct answer"
                              >
                                {isCorrect ? 'Correct ✓' : 'Mark Correct'}
                              </Button>

                              <Input
                                value={optLabel}
                                onChange={(e) => {
                                  const updated = [...q.options!];
                                  if (typeof updated[optIdx] === 'string') {
                                    updated[optIdx] = e.target.value;
                                  } else {
                                    updated[optIdx] = { ...(updated[optIdx] as object), label: e.target.value };
                                  }
                                  handleUpdateQuestion(q.id, { options: updated });
                                }}
                                className="text-xs h-7 bg-background"
                              />

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = q.options!.filter((_, i) => i !== optIdx);
                                  handleUpdateQuestion(q.id, { options: updated });
                                }}
                                className="text-xs h-7 px-1 text-muted-foreground hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current = Array.isArray(q.options) ? [...q.options] : [];
                          current.push(`Choice ${current.length + 1}`);
                          handleUpdateQuestion(q.id, { options: current });
                        }}
                        className="text-xs h-7 gap-1 text-primary hover:bg-primary/10"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </Button>
                    </div>
                  )}

                  {/* Verification selector for URL submission */}
                  {q.type === 'url_submission' && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold">Enforced Work Platform</Label>
                      <Select
                        value={q.verificationType || 'google_docs'}
                        onValueChange={(val) =>
                          handleUpdateQuestion(q.id, {
                            verificationType: val as FocusQuestion['verificationType'],
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Verification Platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google_docs">Google Docs Document</SelectItem>
                          <SelectItem value="workflowy">Workflowy Outline</SelectItem>
                          <SelectItem value="xmind">XMind / Mindmap</SelectItem>
                          <SelectItem value="figma">Figma Canvas</SelectItem>
                          <SelectItem value="url">Any Public HTTPS URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

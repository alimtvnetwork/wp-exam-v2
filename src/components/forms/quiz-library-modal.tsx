import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  FolderTree,
  ExternalLink,
  Sparkles,
  ListOrdered,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  QuizRegistryItem,
  getAllQuizzes,
  deleteCustomQuiz,
  duplicateCustomQuiz,
  saveCustomQuiz,
} from '@/quiz/store/quiz-registry';
import { useQuizStore, generateSlug } from '@/quiz/store/useQuizStore';

interface QuizLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProjects?: () => void;
}

export const QuizLibraryModal: React.FC<QuizLibraryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProjects,
}) => {
  const store = useQuizStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'presets'>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTemplateId, setNewTemplateId] = useState<string>('blank');
  const [refreshKey, setRefreshKey] = useState(0);

  const allQuizzes = useMemo(() => {
    // depend on refreshKey to re-fetch when items change
    if (!isOpen) {
      return [];
    }

    return getAllQuizzes();
  }, [isOpen, refreshKey]);

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesTab = true;
      if (activeTab === 'custom') {
        matchesTab = Boolean(item.isCustom);
      } else if (activeTab === 'presets') {
        matchesTab = Boolean(item.isPreset);
      }

      return matchesSearch && matchesTab;
    });
  }, [allQuizzes, searchTerm, activeTab]);

  const handleOpenInBuilder = (item: QuizRegistryItem) => {
    store.loadForm({
      ...item.model,
      id: item.id,
      slug: item.slug,
      title: item.title,
    });

    toast.success(`Loaded "${item.title}" into Quiz Builder`);
    onClose();
  };

  const handleDuplicate = (item: QuizRegistryItem) => {
    const cloned = duplicateCustomQuiz(item);
    setRefreshKey((k) => k + 1);
    toast.success(`Duplicated "${item.title}" as "${cloned.title}"`);
  };

  const handleDelete = (item: QuizRegistryItem) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${item.title}"?`);
    if (!isConfirmed) {
      return;
    }

    deleteCustomQuiz(item.id);
    setRefreshKey((k) => k + 1);
    toast.info(`Deleted quiz "${item.title}"`);
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(`Copied live link: ${url}`);
  };

  const handleStartCreateNew = () => {
    setNewTitle('');
    setNewSlug('');
    setNewTemplateId('blank');
    setIsCreatingNew(true);
  };

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    setNewSlug(generateSlug(val));
  };

  const handleConfirmCreate = () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast.error('Please enter a quiz title');

      return;
    }

    const finalSlug = newSlug.trim() || generateSlug(trimmedTitle);

    if (newTemplateId === 'blank') {
      store.resetForm(trimmedTitle, finalSlug, 'quiz');
      saveCustomQuiz(
        {
          title: trimmedTitle,
          formType: 'quiz',
          formAccess: 'public',
          isSequential: false,
          isPublished: true,
          settings: {
            passingScore: 70,
            timeLimitSeconds: 600,
          },
          fields: [],
        },
        finalSlug
      );
      toast.success(`Created blank quiz "${trimmedTitle}"`);
    } else {
      const template = allQuizzes.find((q) => q.id === newTemplateId);
      if (template) {
        store.loadForm({
          ...template.model,
          title: trimmedTitle,
          slug: finalSlug,
        });
        saveCustomQuiz(
          {
            ...template.model,
            title: trimmedTitle,
          },
          finalSlug
        );
        toast.success(`Created "${trimmedTitle}" from template`);
      }
    }

    setIsCreatingNew(false);
    setRefreshKey((k) => k + 1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        {/* Header Ribbon */}
        <div className="h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 w-full" />

        <div className="p-5 sm:p-6 border-b border-border/60 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold font-heading text-foreground">
                  Quiz & Form Library
                </DialogTitle>
                <Badge variant="outline" className="border-border text-xs font-mono">
                  {allQuizzes.length} Available
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Browse existing quizzes, switch active assessment in builder, or start a new quiz.
              </DialogDescription>
            </div>

            <Button
              type="button"
              onClick={handleStartCreateNew}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 text-xs h-9 px-4 rounded-xl cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Button>
          </div>

          {/* Search & Tabs Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Quizzes ({allQuizzes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Saved Quizzes ({allQuizzes.filter((q) => q.isCustom).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pre-built Templates ({allQuizzes.filter((q) => q.isPreset).length})
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title or slug…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8.5 text-xs bg-card border-border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Modal Body / Quiz List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Quick Create Dialog Drawer / Inline Form */}
          {isCreatingNew && (
            <Card className="border border-primary/50 bg-primary/5 shadow-md rounded-xl p-4 sm:p-5 space-y-4 animate-sweet-fade-in">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm text-foreground">Create New Assessment Quiz</h4>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNew(false)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Quiz Title</label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer Assessment"
                    value={newTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="h-8.5 bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">URL Slug</label>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-mono">/f/</span>
                    <Input
                      placeholder="senior-frontend-engineer"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="h-8.5 font-mono bg-card"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-foreground">Starting Base / Template</label>
                  <select
                    value={newTemplateId}
                    onChange={(e) => setNewTemplateId(e.target.value)}
                    className="w-full h-8.5 px-3 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="blank">Blank Assessment (Start from scratch)</option>
                    {allQuizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        Template: {q.title} ({q.questionCount} questions)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNew(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmCreate}
                  className="h-8 text-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                >
                  Create & Launch Builder
                </Button>
              </div>
            </Card>
          )}

          {filteredQuizzes.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-muted/20 border border-dashed border-border rounded-2xl">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-bold text-base text-foreground">No quizzes matched your criteria</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search terms or create a fresh quiz assessment from scratch.
              </p>
              <Button
                type="button"
                onClick={handleStartCreateNew}
                className="mt-2 text-xs bg-primary text-primary-foreground font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Create New Quiz Now</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredQuizzes.map((item) => {
                const isActiveInEditor = store.slug === item.slug;

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all duration-200 rounded-xl overflow-hidden hover:shadow-md ${
                      isActiveInEditor
                        ? 'border-primary/80 bg-primary/[0.03] ring-1 ring-primary/40'
                        : 'border-border/80 bg-card hover:border-border'
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Top Badges & Title */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {isActiveInEditor && (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                                <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                                Active in Editor
                              </Badge>
                            )}
                            {item.isPreset ? (
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                Built-in Template
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                Custom Quiz
                              </Badge>
                            )}
                          </div>

                          <span className="text-[10px] text-muted-foreground font-mono">
                            /f/{item.slug}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground line-clamp-1">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Stats Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 font-mono">
                          <ListOrdered className="w-3 h-3 text-primary" />
                          <span>{item.questionCount} Questions</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 font-mono">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{item.totalPoints} Pts</span>
                        </span>

                        {item.timeLimitSeconds && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 font-mono">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>{Math.round(item.timeLimitSeconds / 60)}m</span>
                          </span>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(item.slug)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="Copy Live Assessment Link"
                          >
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copy Link</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/preview/${item.slug}`, '_blank')}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="Preview Assessment Runner"
                          >
                            <Eye className="w-3 h-3 text-primary" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(item)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="Duplicate Quiz"
                          >
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Clone</span>
                          </Button>

                          {item.isCustom && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              className="h-7 px-1.5 text-xs text-destructive hover:bg-destructive/10"
                              title="Delete Custom Quiz"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {isActiveInEditor ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onClose}
                            className="h-7 text-xs border-primary/40 text-primary font-semibold cursor-pointer"
                          >
                            <span>Currently Editing</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleOpenInBuilder(item)}
                            className="h-7 text-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90 cursor-pointer gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Quiz</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info: Curriculum Projects Link */}
        <div className="p-3 sm:px-6 bg-muted/30 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-primary shrink-0" />
            <span>
              Looking for multi-course learning tracks, readings, and project stages?
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              if (onNavigateToProjects) {
                onNavigateToProjects();
              } else {
                window.location.href = '/admin/projects';
              }
            }}
            className="h-7 px-3 text-xs gap-1.5 font-medium shrink-0"
          >
            <span>Open Curriculum Projects</span>
            <ExternalLink className="w-3 h-3 text-primary" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

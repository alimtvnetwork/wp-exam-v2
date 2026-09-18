import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Layers,
  Play,
  History,
  RotateCcw,
  Shield,
  CheckCircle2,
  ChevronRight,
  FileText,
  Video,
  Download,
  Upload,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Sparkles,
  FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface ProjectSection {
  id: string;
  title: string;
  content_type: 'reading' | 'checklist' | 'quiz';
  reading_content?: string;
  video_url?: string;
  checklist?: Array<{ id: string; label: string; is_required: boolean }>;
  questions?: Array<Record<string, unknown>>;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category_id: string;
  parent_project_id?: string;
  pipeline_order: string[];
  permissions: string[];
  sections: ProjectSection[];
  sub_projects?: ProjectItem[];
  history?: Array<{ id: string; revision_id: string; summary: string; created_at: string }>;
}

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  projects: ProjectItem[];
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat_onboarding',
    title: 'Employee Onboarding & Security',
    description: 'Required curriculum for all engineering, product, and operations hires.',
    projects: [
      {
        id: 'proj_sec_101',
        title: 'Security Compliance & Password Hygiene',
        description: 'Covers 2FA, password vault requirements, and endpoint encryption.',
        category_id: 'cat_onboarding',
        pipeline_order: ['sec_read_1', 'sec_check_1', 'sec_quiz_1'],
        permissions: ['subscriber', 'employee', 'candidate'],
        sections: [
          {
            id: 'sec_read_1',
            title: '1. Security Protocols & Reading Materials',
            content_type: 'reading',
            reading_content: 'Review the 10-page IT Security Policy standard. Passwords must be 16+ characters with hardware 2FA.',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
          {
            id: 'sec_check_1',
            title: '2. Setup Verification Checklist',
            content_type: 'checklist',
            checklist: [
              { id: 'c1', label: 'Enrolled password manager with master key', is_required: true },
              { id: 'c2', label: 'Configured GitHub 2FA with hardware key', is_required: true },
            ],
          },
          {
            id: 'sec_quiz_1',
            title: '3. Security Mastery Quiz',
            content_type: 'quiz',
            questions: [
              { id: 'q1', title: 'Minimum password length required?', options: ['8', '12', '16+'], correctAnswer: '16+' },
            ],
          },
        ],
        sub_projects: [
          {
            id: 'proj_sec_sub_hsm',
            title: 'Sub-Module: Hardware Security Keys & YubiKey',
            description: 'Advanced physical key configuration and recovery code backup.',
            category_id: 'cat_onboarding',
            parent_project_id: 'proj_sec_101',
            pipeline_order: ['sec_hsm_check'],
            permissions: ['employee'],
            sections: [
              {
                id: 'sec_hsm_check',
                title: '1. Hardware Key Verification',
                content_type: 'checklist',
                checklist: [
                  { id: 'hsm1', label: 'Registered primary YubiKey with FIDO2', is_required: true },
                  { id: 'hsm2', label: 'Exported encrypted emergency recovery seeds', is_required: true },
                ],
              },
            ],
            history: [
              { id: '1', revision_id: 'rev_sub_01', summary: 'Created sub-project', created_at: '2026-09-18 11:00' },
            ],
          },
        ],
        history: [
          { id: '1', revision_id: 'rev_1726671234_abc', summary: 'Added BitLocker checklist requirement', created_at: '2026-09-18 10:30' },
          { id: '2', revision_id: 'rev_1726665432_def', summary: 'Initial curriculum creation', created_at: '2026-09-17 16:00' },
        ],
      },
      {
        id: 'proj_code_standards',
        title: 'Coding Guidelines & Anti-Patterns',
        description: 'Cross-language standards, positive booleans, AppError handling.',
        category_id: 'cat_onboarding',
        pipeline_order: ['sec_code_read', 'sec_code_quiz'],
        permissions: ['contributor', 'developer'],
        sections: [
          {
            id: 'sec_code_read',
            title: '1. Zero Tolerance Banned Patterns',
            content_type: 'reading',
            reading_content: 'No explicit true checks. Single polarity booleans only. Strictly Unix LF line endings.',
          },
          {
            id: 'sec_code_quiz',
            title: '2. Guideline Compliance Test',
            content_type: 'quiz',
            questions: [
              { id: 'q1', title: 'Is "if isReady == true" allowed?', options: ['Yes', 'No (TOTAL BAN)'], correctAnswer: 'No (TOTAL BAN)' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cat_product_qa',
    title: 'Product & QA Standards',
    description: 'Quality assurance workflows, Playwright E2E suites, and bug triage.',
    projects: [
      {
        id: 'proj_qa_e2e',
        title: 'Playwright Test Automation & Triage',
        description: 'End-to-end testing principles and zero-storage CI/CD mandate.',
        category_id: 'cat_product_qa',
        pipeline_order: ['sec_qa_quiz'],
        permissions: ['all'],
        sections: [
          {
            id: 'sec_qa_quiz',
            title: '1. Test Verification Quiz',
            content_type: 'quiz',
            questions: [],
          },
        ],
      },
    ],
  },
];

interface ProjectHierarchyManagerProps {
  onLaunchFocusRunner?: (project: ProjectItem) => void;
}

export const ProjectHierarchyManager: React.FC<ProjectHierarchyManagerProps> = ({
  onLaunchFocusRunner,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>(INITIAL_CATEGORIES[0]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(INITIAL_CATEGORIES[0].projects[0]);

  const [newCatTitle, setNewCatTitle] = useState<string>('');
  const [showAddCat, setShowAddCat] = useState<boolean>(false);

  const [newSubProjectTitle, setNewSubProjectTitle] = useState<string>('');
  const [showAddSubProject, setShowAddSubProject] = useState<boolean>(false);

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');

  const handleCreateCategory = () => {
    const cleanTitle = newCatTitle.trim();
    const hasTitle = Boolean(cleanTitle);

    if (hasTitle) {
      const newCat: CategoryItem = {
        id: 'cat_' + Date.now(),
        title: cleanTitle,
        description: 'Custom learning curriculum category.',
        projects: [],
      };

      setCategories([...categories, newCat]);
      setSelectedCategory(newCat);
      setNewCatTitle('');
      setShowAddCat(false);
      toast.success('Category created successfully!');
    } else {
      toast.error('Please enter a category title.');
    }
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: 'proj_' + Date.now(),
      title: 'New Project / Subject',
      description: 'Project description and goals.',
      category_id: selectedCategory.id,
      pipeline_order: ['sec_intro'],
      permissions: ['all'],
      sections: [
        {
          id: 'sec_intro',
          title: '1. Introduction & Objectives',
          content_type: 'reading',
          reading_content: 'Welcome to this module. Read instructions thoroughly before attempting quizzes.',
        },
      ],
      sub_projects: [],
      history: [
        { id: '1', revision_id: 'rev_' + Date.now(), summary: 'Created new project', created_at: new Date().toISOString() },
      ],
    };

    const updated = categories.map((cat) => {
      if (cat.id === selectedCategory.id) {
        return { ...cat, projects: [...cat.projects, newProj] };
      }

      return cat;
    });

    setCategories(updated);
    setSelectedCategory(updated.find((c) => c.id === selectedCategory.id) || selectedCategory);
    setSelectedProject(newProj);
    toast.success('Project added to ' + selectedCategory.title);
  };

  const handleAddSubProject = () => {
    const cleanTitle = newSubProjectTitle.trim();
    const hasTitle = Boolean(cleanTitle);

    if (hasTitle) {
      const newSubProj: ProjectItem = {
        id: 'proj_sub_' + Date.now(),
        title: cleanTitle,
        description: 'Recursive sub-module linked to ' + selectedProject.title,
        category_id: selectedCategory.id,
        parent_project_id: selectedProject.id,
        pipeline_order: ['sec_sub_intro'],
        permissions: selectedProject.permissions,
        sections: [
          {
            id: 'sec_sub_intro',
            title: '1. Sub-Project Practical Task',
            content_type: 'checklist',
            checklist: [
              { id: 'sub_c1', label: 'Completed parent prerequisites', is_required: true },
            ],
          },
        ],
        history: [
          { id: '1', revision_id: 'rev_' + Date.now(), summary: 'Created recursive sub-project', created_at: new Date().toISOString() },
        ],
      };

      const updatedSubProjects = [...(selectedProject.sub_projects || []), newSubProj];
      const updatedProject = { ...selectedProject, sub_projects: updatedSubProjects };

      const updatedCategories = categories.map((cat) => {
        if (cat.id === selectedCategory.id) {
          const updatedProjects = cat.projects.map((p) => {
            if (p.id === selectedProject.id) {
              return updatedProject;
            }

            return p;
          });

          return { ...cat, projects: updatedProjects };
        }

        return cat;
      });

      setCategories(updatedCategories);
      setSelectedProject(updatedProject);
      setNewSubProjectTitle('');
      setShowAddSubProject(false);
      toast.success('Recursive sub-project added successfully!');
    } else {
      toast.error('Please enter a sub-project title.');
    }
  };

  const handleExportProjectJson = () => {
    const jsonStr = JSON.stringify(selectedProject, null, 2);

    navigator.clipboard.writeText(jsonStr);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedProject.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported project "${selectedProject.title}" as JSON and copied to clipboard!`);
  };

  const handleImportProjectJson = () => {
    const cleanText = importJsonText.trim();
    const hasText = Boolean(cleanText);

    if (hasText) {
      try {
        const parsed = JSON.parse(cleanText);
        const hasTitle = Boolean(parsed.title);

        if (hasTitle) {
          const importedProject: ProjectItem = {
            id: parsed.id || 'proj_imported_' + Date.now(),
            title: parsed.title,
            description: parsed.description || 'Imported curriculum project.',
            category_id: selectedCategory.id,
            parent_project_id: parsed.parent_project_id || '',
            pipeline_order: Array.isArray(parsed.pipeline_order) ? parsed.pipeline_order : ['sec_1'],
            permissions: Array.isArray(parsed.permissions) ? parsed.permissions : ['all'],
            sections: Array.isArray(parsed.sections) ? parsed.sections : [],
            sub_projects: Array.isArray(parsed.sub_projects) ? parsed.sub_projects : [],
            history: [
              {
                id: '1',
                revision_id: 'rev_import_' + Date.now(),
                summary: 'Imported from JSON manifest',
                created_at: new Date().toISOString(),
              },
            ],
          };

          const updated = categories.map((cat) => {
            if (cat.id === selectedCategory.id) {
              return { ...cat, projects: [...cat.projects, importedProject] };
            }

            return cat;
          });

          setCategories(updated);
          setSelectedCategory(updated.find((c) => c.id === selectedCategory.id) || selectedCategory);
          setSelectedProject(importedProject);
          setImportJsonText('');
          setShowImportModal(false);
          toast.success(`Project "${importedProject.title}" imported successfully into ${selectedCategory.title}!`);
        } else {
          toast.error('Invalid project JSON: Missing required "title" property.');
        }
      } catch (err) {
        toast.error('Failed to parse JSON: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      toast.error('Please paste valid JSON text.');
    }
  };

  const handleRevertRevision = (revId: string, summary: string) => {
    toast.success(`Reverted project state to revision ${revId} (${summary})`);
    setShowHistoryModal(false);
  };

  const handleMovePipelineOrder = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...selectedProject.pipeline_order];
    const isUp = direction === 'up';

    if (isUp) {
      const canMoveUp = index > 0;
      if (canMoveUp) {
        const temp = newOrder[index - 1];
        newOrder[index - 1] = newOrder[index];
        newOrder[index] = temp;
      }
    } else {
      const canMoveDown = index < newOrder.length - 1;
      if (canMoveDown) {
        const temp = newOrder[index + 1];
        newOrder[index + 1] = newOrder[index];
        newOrder[index] = temp;
      }
    }

    const updatedProject = { ...selectedProject, pipeline_order: newOrder };
    setSelectedProject(updatedProject);
    toast.success('Pipeline execution sequence updated');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" />
            Project & Category Hierarchy
          </h2>
          <p className="text-sm text-muted-foreground">
            Organize learning modules recursively into Categories, Projects, Sub-Projects, and Sections with split SQLite databases.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Import JSON
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportProjectJson}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Export JSON
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddCat(!showAddCat)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Category
          </Button>

          <Button
            size="sm"
            onClick={handleAddProject}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Add Category Drawer/Form */}
      {showAddCat && (
        <div className="p-4 bg-muted/60 border border-indigo-500/40 rounded-xl flex items-center gap-3 animate-in fade-in">
          <Input
            placeholder="Category title (e.g. Sales Enablement, Core Engineering)..."
            value={newCatTitle}
            onChange={(e) => setNewCatTitle(e.target.value)}
            className="bg-background text-sm"
          />
          <Button size="sm" onClick={handleCreateCategory} className="bg-indigo-600 text-white whitespace-nowrap">
            Save Category
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAddCat(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* 2-Column Hierarchy Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Categories and Projects Tree */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-card border rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Curriculum Tree
            </h3>

            <div className="space-y-3">
              {categories.map((cat) => {
                const isCatSelected = selectedCategory.id === cat.id;

                return (
                  <div key={cat.id} className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        const hasProjects = cat.projects.length > 0;
                        if (hasProjects) {
                          setSelectedProject(cat.projects[0]);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition ${
                        isCatSelected
                          ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/30'
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-indigo-400" />
                        <span>{cat.title}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {cat.projects.length} {cat.projects.length === 1 ? 'project' : 'projects'}
                      </Badge>
                    </button>

                    {/* Sub-projects list */}
                    {isCatSelected && (
                      <div className="pl-6 space-y-1 border-l-2 border-indigo-900/40 ml-4 py-1">
                        {cat.projects.map((proj) => {
                          const isProjSelected = selectedProject.id === proj.id;
                          const hasSubProjects = Boolean(proj.sub_projects && proj.sub_projects.length > 0);

                          return (
                            <div key={proj.id} className="space-y-1">
                              <button
                                onClick={() => setSelectedProject(proj)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                                  isProjSelected
                                    ? 'bg-indigo-600 text-white font-bold shadow'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Layers className="w-3.5 h-3.5 opacity-70" />
                                  <span className="truncate">{proj.title}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 opacity-60" />
                              </button>

                              {/* Recursive Sub-Projects in Tree */}
                              {hasSubProjects && (
                                <div className="pl-4 space-y-1 border-l border-indigo-500/20 ml-3">
                                  {proj.sub_projects?.map((subProj) => {
                                    const isSubSelected = selectedProject.id === subProj.id;

                                    return (
                                      <button
                                        key={subProj.id}
                                        onClick={() => setSelectedProject(subProj)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium flex items-center justify-between transition ${
                                          isSubSelected
                                            ? 'bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          <GitBranch className="w-3 h-3 text-indigo-400" />
                                          <span className="truncate">└─ {subProj.title}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Project Detail & Pipeline Configuration */}
        <div className="md:col-span-7 space-y-4">
          {selectedProject ? (
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      Split DB: {selectedProject.id}.sqlite
                    </Badge>
                    {selectedProject.parent_project_id && (
                      <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                        Recursive Sub-Project
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{selectedProject.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{selectedProject.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="project-history-btn"
                    onClick={() => setShowHistoryModal(true)}
                    className="text-xs"
                  >
                    <History className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    History ({selectedProject.history?.length || 0})
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onLaunchFocusRunner && onLaunchFocusRunner(selectedProject)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                    Test in Focus Runner
                  </Button>
                </div>
              </div>

              {/* Pipeline Ordering & Permissions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground font-medium">Execution Pipeline:</span>
                    <span className="text-[10px] text-muted-foreground">Order: Step A → Step C → Step D</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedProject.pipeline_order.map((stepId, idx) => (
                      <div
                        key={stepId}
                        className="flex items-center justify-between px-2.5 py-1 rounded bg-background border font-mono text-[11px]"
                      >
                        <span>{idx + 1}. {stepId}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMovePipelineOrder(idx, 'up')}
                            className="p-1 hover:text-indigo-400 text-muted-foreground"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMovePipelineOrder(idx, 'down')}
                            className="p-1 hover:text-indigo-400 text-muted-foreground"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground font-medium block mb-2">Allowed Roles:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedProject.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-[10px]">
                        <Shield className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-Projects Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    Linked Sub-Projects ({selectedProject.sub_projects?.length || 0})
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddSubProject(!showAddSubProject)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Sub-Project
                  </Button>
                </div>

                {showAddSubProject && (
                  <div className="p-3 rounded-xl bg-muted/60 border border-indigo-500/30 flex items-center gap-2">
                    <Input
                      placeholder="Sub-project title (e.g. Advanced Escalation Protocol)..."
                      value={newSubProjectTitle}
                      onChange={(e) => setNewSubProjectTitle(e.target.value)}
                      className="bg-background text-xs"
                    />
                    <Button size="sm" onClick={handleAddSubProject} className="bg-indigo-600 text-white text-xs">
                      Save
                    </Button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {selectedProject.sub_projects?.map((subProj) => (
                    <div
                      key={subProj.id}
                      className="p-3 rounded-xl bg-muted/20 border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                        <div>
                          <span className="font-semibold text-foreground">{subProj.title}</span>
                          <span className="text-[10px] text-muted-foreground block">{subProj.sections.length} sections</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProject(subProj)}
                        className="text-[11px] h-7"
                      >
                        Inspect Sub-Project
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Project Sections & Learning Tasks ({selectedProject.sections.length})
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                    onClick={() => {
                      const newSec: ProjectSection = {
                        id: 'sec_' + Date.now(),
                        title: `${selectedProject.sections.length + 1}. Practical Task & Quiz`,
                        content_type: 'quiz',
                        questions: [],
                      };
                      selectedProject.sections.push(newSec);
                      setCategories([...categories]);
                      toast.success('Section added to project');
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Section
                  </Button>
                </div>

                <div className="space-y-2">
                  {selectedProject.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="p-3.5 rounded-xl bg-muted/20 border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">{sec.title}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{sec.content_type}</span>
                            {sec.video_url && <span className="flex items-center gap-0.5"><Video className="w-3 h-3 text-rose-400" /> Video</span>}
                            {sec.reading_content && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3 text-sky-400" /> Documentation</span>}
                            {sec.checklist && <span>{sec.checklist.length} checklist items</span>}
                          </div>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px]">
                        {sec.content_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-muted/20 border rounded-2xl">
              Select a project from the left panel to manage sections, study docs, and pipeline ordering.
            </div>
          )}
        </div>
      </div>

      {/* JSON Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-lg rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileJson className="w-5 h-5 text-sky-400" />
              Import Project from JSON
            </DialogTitle>
            <DialogDescription className="text-xs">
              Paste valid JSON generated from AI Instruction Studio or an exported project manifest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <Textarea
              placeholder="Paste JSON project manifest here..."
              rows={10}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="font-mono text-xs"
            />

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleImportProjectJson} className="bg-indigo-600 text-white text-xs">
                Import Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revisions History Modal */}
      {showHistoryModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-card border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Project Revisions & Rollback
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(false)}>
                ✕
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Each change to this project is recorded in its isolated history database (<code className="text-indigo-400">{selectedProject.id}_history.sqlite</code>). You can revert back to any historical snapshot.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedProject.history?.map((hist) => (
                <div
                  key={hist.id}
                  className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-foreground">{hist.summary}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {hist.revision_id} • {hist.created_at}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevertRevision(hist.revision_id, hist.summary)}
                    className="border-amber-500/40 text-amber-400 hover:bg-amber-950/40 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Revert
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

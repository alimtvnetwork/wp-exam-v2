import React, { useState } from 'react';
import { FolderTree, Plus, Layers, Play, History, RotateCcw, Shield, CheckCircle2, ChevronRight, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  pipeline_order: string[];
  permissions: string[];
  sections: ProjectSection[];
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
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const handleCreateCategory = () => {
    if (!newCatTitle.trim()) {
      toast.error('Please enter a category title.');
      return;
    }
    const newCat: CategoryItem = {
      id: 'cat_' + Date.now(),
      title: newCatTitle.trim(),
      description: 'Custom learning curriculum category.',
      projects: [],
    };
    setCategories([...categories, newCat]);
    setSelectedCategory(newCat);
    setNewCatTitle('');
    setShowAddCat(false);
    toast.success('Category created successfully!');
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

  const handleRevertRevision = (revId: string, summary: string) => {
    toast.success(`Reverted project state to revision ${revId} (${summary})`);
    setShowHistoryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" />
            Project & Category Hierarchy
          </h2>
          <p className="text-sm text-slate-400">
            Organize learning modules recursively into Categories, Projects, Sub-Projects, and Sections with split SQLite databases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddCat(!showAddCat)}
            className="border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>

          <Button
            size="sm"
            onClick={handleAddProject}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Add Category Drawer/Form */}
      {showAddCat && (
        <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl flex items-center gap-3 animate-in fade-in">
          <Input
            placeholder="Category title (e.g. Sales Enablement, Core Engineering)..."
            value={newCatTitle}
            onChange={(e) => setNewCatTitle(e.target.value)}
            className="bg-slate-950 border-slate-700 text-sm"
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
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
                        if (cat.projects.length > 0) {
                          setSelectedProject(cat.projects[0]);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition ${
                        isCatSelected ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-indigo-400" />
                        <span>{cat.title}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-400">
                        {cat.projects.length} {cat.projects.length === 1 ? 'project' : 'projects'}
                      </Badge>
                    </button>

                    {/* Sub-projects list */}
                    {isCatSelected && (
                      <div className="pl-6 space-y-1 border-l-2 border-indigo-900/40 ml-4 py-1">
                        {cat.projects.map((proj) => {
                          const isProjSelected = selectedProject.id === proj.id;
                          return (
                            <button
                              key={proj.id}
                              onClick={() => setSelectedProject(proj)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                                isProjSelected
                                  ? 'bg-indigo-600 text-white font-bold shadow'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Layers className="w-3.5 h-3.5 opacity-70" />
                                <span className="truncate">{proj.title}</span>
                              </div>
                              <ChevronRight className="w-3 h-3 opacity-60" />
                            </button>
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    Split DB: {selectedProject.id}.sqlite
                  </Badge>
                  <h3 className="text-xl font-bold text-white">{selectedProject.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedProject.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="project-history-btn"
                    onClick={() => setShowHistoryModal(true)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
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
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Execution Pipeline:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedProject.sections.map((sec, idx) => (
                      <React.Fragment key={sec.id}>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">
                          {sec.title.split('.')[0] || `S${idx + 1}`}
                        </span>
                        {idx < selectedProject.sections.length - 1 && (
                          <span className="text-indigo-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Allowed Roles:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedProject.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                        <Shield className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sections / Sub-projects list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
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
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-200">{sec.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{sec.content_type}</span>
                            {sec.video_url && <span className="flex items-center gap-0.5"><Video className="w-3 h-3 text-rose-400" /> Video</span>}
                            {sec.reading_content && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3 text-sky-400" /> Documentation</span>}
                            {sec.checklist && <span>{sec.checklist.length} checklist items</span>}
                          </div>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                        {sec.content_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
              Select a project from the left panel to manage sections, study docs, and pipeline ordering.
            </div>
          )}
        </div>
      </div>

      {/* Revisions History Modal */}
      {showHistoryModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Project Revisions & Rollback
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(false)}>
                ✕
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              Each change to this project is recorded in its isolated history database (<code className="text-indigo-300">{selectedProject.id}_history.sqlite</code>). You can revert back to any historical snapshot.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedProject.history?.map((hist) => (
                <div
                  key={hist.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{hist.summary}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
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

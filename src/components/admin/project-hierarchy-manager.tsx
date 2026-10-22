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
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  ListChecks,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme-context';

export interface ChecklistItem {
  id: string;
  label: string;
  is_required: boolean;
}

export interface QuizQuestionItem {
  id: string;
  title: string;
  options: string[];
  correctAnswer: string;
  [key: string]: unknown;
}

export interface ProjectSection {
  id: string;
  title: string;
  content_type: 'reading' | 'checklist' | 'quiz';
  reading_content?: string;
  video_url?: string;
  checklist?: ChecklistItem[];
  questions?: QuizQuestionItem[];
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

const AVAILABLE_ROLES = [
  { id: 'all', label: 'All Users' },
  { id: 'candidate', label: 'Candidates' },
  { id: 'employee', label: 'Employees' },
  { id: 'subscriber', label: 'Subscribers' },
  { id: 'developer', label: 'Developers' },
  { id: 'contributor', label: 'Contributors' },
];

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
              { id: 'c3', label: 'Installed workstation endpoint antivirus agent', is_required: true },
            ],
          },
          {
            id: 'sec_quiz_1',
            title: '3. Security Mastery Quiz',
            content_type: 'quiz',
            questions: [
              { id: 'q1', title: 'Minimum password length required?', options: ['8', '12', '16+'], correctAnswer: '16+' },
              { id: 'q2', title: 'Which 2FA method is strictly required for production code access?', options: ['SMS', 'Hardware Security Key (FIDO2)', 'Email code'], correctAnswer: 'Hardware Security Key (FIDO2)' },
            ],
          },
        ],
        sub_projects: [
          {
            id: 'proj_sec_sub_hsm',
            title: 'Sub-Section: Hardware Security Keys & YubiKey',
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
            questions: [
              { id: 'q_e2e_1', title: 'Are routine build artifacts allowed to be uploaded to CI actions storage?', options: ['Yes', 'No (Zero-Storage Mandate)'], correctAnswer: 'No (Zero-Storage Mandate)' },
            ],
          },
        ],
      },
    ],
  },
];

const STORAGE_KEY = 'wp_exam_curriculum_categories';

interface ProjectHierarchyManagerProps {
  onLaunchFocusRunner?: (project: ProjectItem) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProjectHierarchyManager: React.FC<ProjectHierarchyManagerProps> = ({
  onLaunchFocusRunner,
  onNavigateTab,
}) => {
  const { theme, config } = useTheme();

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const isArray = Array.isArray(parsed);
          if (isArray) {
            const hasItems = parsed.length > 0;
            if (hasItems) {
              return parsed;
            }
          }
        } catch {
          // ignore corrupted local storage
        }
      }
    }

    return INITIAL_CATEGORIES;
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>(() => categories[0] || INITIAL_CATEGORIES[0]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(() => categories[0]?.projects[0] || null);

  const [newCatTitle, setNewCatTitle] = useState<string>('');
  const [showAddCat, setShowAddCat] = useState<boolean>(false);

  // Category rename dialog
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCatTitle, setEditCatTitle] = useState<string>('');
  const [editCatDescription, setEditCatDescription] = useState<string>('');

  // Sub-project creation
  const [newSubProjectTitle, setNewSubProjectTitle] = useState<string>('');
  const [showAddSubProject, setShowAddSubProject] = useState<boolean>(false);

  // Project Edit Modal
  const [isEditProjectOpen, setIsEditProjectOpen] = useState<boolean>(false);
  const [editProjectTitle, setEditProjectTitle] = useState<string>('');
  const [editProjectDesc, setEditProjectDesc] = useState<string>('');
  const [editProjectRoles, setEditProjectRoles] = useState<string[]>([]);

  // Section Edit/Add Modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState<boolean>(false);
  const [isCreatingSection, setIsCreatingSection] = useState<boolean>(false);
  const [sectionFormId, setSectionFormId] = useState<string>('');
  const [sectionFormTitle, setSectionFormTitle] = useState<string>('');
  const [sectionFormType, setSectionFormType] = useState<'reading' | 'checklist' | 'quiz'>('reading');
  const [sectionFormReadingContent, setSectionFormReadingContent] = useState<string>('');
  const [sectionFormVideoUrl, setSectionFormVideoUrl] = useState<string>('');
  const [sectionFormChecklist, setSectionFormChecklist] = useState<ChecklistItem[]>([]);
  const [sectionFormQuestions, setSectionFormQuestions] = useState<QuizQuestionItem[]>([]);

  // Revisions & JSON modals
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');

  const persistCategories = (updatedCategories: CategoryItem[]) => {
    setCategories(updatedCategories);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCategories));
    }
  };

  const updateProjectInCategories = (updatedProject: ProjectItem) => {
    const updatedCategories = categories.map((cat) => {
      if (cat.id === updatedProject.category_id) {
        const hasTopLevel = cat.projects.some((p) => p.id === updatedProject.id);
        if (hasTopLevel) {
          return {
            ...cat,
            projects: cat.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
          };
        }

        return {
          ...cat,
          projects: cat.projects.map((p) => {
            if (p.sub_projects) {
              const hasSub = p.sub_projects.some((sp) => sp.id === updatedProject.id);
              if (hasSub) {
                return {
                  ...p,
                  sub_projects: p.sub_projects.map((sp) =>
                    sp.id === updatedProject.id ? updatedProject : sp
                  ),
                };
              }
            }

            return p;
          }),
        };
      }

      return cat;
    });

    persistCategories(updatedCategories);
    setSelectedProject(updatedProject);
  };

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

      const updated = [...categories, newCat];
      persistCategories(updated);
      setSelectedCategory(newCat);
      setSelectedProject(null);
      setNewCatTitle('');
      setShowAddCat(false);
      toast.success('Category created successfully!');
    } else {
      toast.error('Please enter a category title.');
    }
  };

  const handleOpenEditCategory = (cat: CategoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setEditCatTitle(cat.title);
    setEditCatDescription(cat.description);
  };

  const handleSaveEditCategory = () => {
    if (!editingCategory) {
      return;
    }

    const cleanTitle = editCatTitle.trim();
    const hasTitle = Boolean(cleanTitle);
    if (!hasTitle) {
      toast.error('Category title cannot be empty.');
      return;
    }

    const updated = categories.map((c) => {
      if (c.id === editingCategory.id) {
        return {
          ...c,
          title: cleanTitle,
          description: editCatDescription.trim(),
        };
      }

      return c;
    });

    persistCategories(updated);
    const updatedSelected = updated.find((c) => c.id === selectedCategory.id) || updated[0];
    setSelectedCategory(updatedSelected);
    setEditingCategory(null);
    toast.success('Category updated successfully');
  };

  const handleDeleteCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasOnlyOne = categories.length <= 1;
    if (hasOnlyOne) {
      toast.error('Cannot delete the only remaining category.');
      return;
    }

    const isConfirmed = window.confirm('Are you sure you want to delete this category and all its projects?');
    if (isConfirmed) {
      const updated = categories.filter((c) => c.id !== catId);
      persistCategories(updated);
      setSelectedCategory(updated[0]);
      setSelectedProject(updated[0]?.projects[0] || null);
      toast.success('Category deleted');
    }
  };

  const handleAddProject = () => {
    const newProjId = 'proj_' + Date.now();
    const newProj: ProjectItem = {
      id: newProjId,
      title: 'New Onboarding Project',
      description: 'Define learning objectives, requirements, and compliance milestones.',
      category_id: selectedCategory.id,
      pipeline_order: ['sec_intro'],
      permissions: ['all'],
      sections: [
        {
          id: 'sec_intro',
          title: '1. Introduction & Overview',
          content_type: 'reading',
          reading_content: 'Welcome to this curriculum track. Complete all sections before taking the final assessment.',
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

    persistCategories(updated);
    const updatedCat = updated.find((c) => c.id === selectedCategory.id) || selectedCategory;
    setSelectedCategory(updatedCat);
    setSelectedProject(newProj);
    toast.success('Project added to ' + selectedCategory.title);
  };

  const handleOpenEditProject = () => {
    if (!selectedProject) {
      return;
    }

    setEditProjectTitle(selectedProject.title);
    setEditProjectDesc(selectedProject.description);
    setEditProjectRoles([...selectedProject.permissions]);
    setIsEditProjectOpen(true);
  };

  const handleToggleProjectRole = (roleId: string) => {
    const hasRole = editProjectRoles.includes(roleId);
    if (hasRole) {
      const isOnlyOne = editProjectRoles.length === 1;
      if (isOnlyOne) {
        toast.error('At least one role must be allowed.');
        return;
      }
      setEditProjectRoles(editProjectRoles.filter((r) => r !== roleId));
    } else {
      setEditProjectRoles([...editProjectRoles, roleId]);
    }
  };

  const handleSaveProjectDetails = () => {
    if (!selectedProject) {
      return;
    }

    const cleanTitle = editProjectTitle.trim();
    const hasTitle = Boolean(cleanTitle);
    if (!hasTitle) {
      toast.error('Project title cannot be empty.');
      return;
    }

    const updatedProject: ProjectItem = {
      ...selectedProject,
      title: cleanTitle,
      description: editProjectDesc.trim(),
      permissions: editProjectRoles.length > 0 ? editProjectRoles : ['all'],
      history: [
        ...(selectedProject.history || []),
        {
          id: String(Date.now()),
          revision_id: 'rev_' + Date.now().toString(36),
          summary: 'Updated project title and permissions',
          created_at: new Date().toISOString(),
        },
      ],
    };

    updateProjectInCategories(updatedProject);
    setIsEditProjectOpen(false);
    toast.success('Project settings saved successfully');
  };

  const handleDeleteCurrentProject = () => {
    if (!selectedProject) {
      return;
    }

    const isConfirmed = window.confirm(`Are you sure you want to delete project "${selectedProject.title}"?`);
    if (isConfirmed) {
      const updated = categories.map((cat) => {
        if (cat.id === selectedProject.category_id) {
          return {
            ...cat,
            projects: cat.projects.filter((p) => p.id !== selectedProject.id),
          };
        }

        return cat;
      });

      persistCategories(updated);
      const currentCat = updated.find((c) => c.id === selectedProject.category_id) || updated[0];
      setSelectedCategory(currentCat);
      setSelectedProject(currentCat?.projects[0] || null);
      setIsEditProjectOpen(false);
      toast.success('Project removed');
    }
  };

  const handleAddSubProject = () => {
    if (!selectedProject) {
      toast.error('Please select a parent project first.');
      return;
    }

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
        permissions: selectedProject.permissions || ['all'],
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
      updateProjectInCategories(updatedProject);
      setNewSubProjectTitle('');
      setShowAddSubProject(false);
      toast.success('Recursive sub-project added successfully!');
    } else {
      toast.error('Please enter a sub-project title.');
    }
  };

  // Section Management Dialog Handlers
  const handleOpenAddSection = () => {
    if (!selectedProject) {
      return;
    }

    const count = selectedProject.sections?.length || 0;
    setSectionFormId('sec_' + Date.now());
    setSectionFormTitle(`${count + 1}. New Learning Task`);
    setSectionFormType('reading');
    setSectionFormReadingContent('');
    setSectionFormVideoUrl('');
    setSectionFormChecklist([
      { id: 'chk_1', label: 'Acknowledge guidelines and start task', is_required: true },
    ]);
    setSectionFormQuestions([
      { id: 'q_1', title: 'Sample verification question?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
    ]);
    setIsCreatingSection(true);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: ProjectSection) => {
    setSectionFormId(sec.id);
    setSectionFormTitle(sec.title);
    setSectionFormType(sec.content_type);
    setSectionFormReadingContent(sec.reading_content || '');
    setSectionFormVideoUrl(sec.video_url || '');
    setSectionFormChecklist(
      sec.checklist ? sec.checklist.map((c) => ({ ...c })) : [
        { id: 'chk_1', label: 'Item 1', is_required: true },
      ]
    );
    setSectionFormQuestions(
      sec.questions ? sec.questions.map((q) => ({
        id: q.id || 'q_' + Math.random().toString(36).substr(2, 5),
        title: q.title || '',
        options: Array.isArray(q.options) ? [...q.options] : ['Option A', 'Option B'],
        correctAnswer: (q.correctAnswer as string) || '',
      })) : []
    );
    setIsCreatingSection(false);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = () => {
    if (!selectedProject) {
      return;
    }

    const cleanTitle = sectionFormTitle.trim();
    const hasTitle = Boolean(cleanTitle);
    if (!hasTitle) {
      toast.error('Section title is required.');
      return;
    }

    const updatedSec: ProjectSection = {
      id: sectionFormId,
      title: cleanTitle,
      content_type: sectionFormType,
      reading_content: sectionFormReadingContent,
      video_url: sectionFormVideoUrl,
      checklist: sectionFormType === 'checklist' ? sectionFormChecklist : undefined,
      questions: sectionFormType === 'quiz' ? sectionFormQuestions : undefined,
    };

    let newSections: ProjectSection[];
    let newPipelineOrder: string[];

    if (isCreatingSection) {
      newSections = [...(selectedProject.sections || []), updatedSec];
      newPipelineOrder = [...selectedProject.pipeline_order, updatedSec.id];
    } else {
      newSections = selectedProject.sections.map((s) => (s.id === updatedSec.id ? updatedSec : s));
      const hasInOrder = selectedProject.pipeline_order.includes(updatedSec.id);
      if (hasInOrder) {
        newPipelineOrder = selectedProject.pipeline_order;
      } else {
        newPipelineOrder = [...selectedProject.pipeline_order, updatedSec.id];
      }
    }

    const updatedProject: ProjectItem = {
      ...selectedProject,
      sections: newSections,
      pipeline_order: newPipelineOrder,
      history: [
        ...(selectedProject.history || []),
        {
          id: String(Date.now()),
          revision_id: 'rev_' + Date.now().toString(36),
          summary: isCreatingSection ? `Added section: ${cleanTitle}` : `Configured section: ${cleanTitle}`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    updateProjectInCategories(updatedProject);
    setIsSectionModalOpen(false);
    toast.success(isCreatingSection ? 'Section added successfully!' : 'Section configured successfully!');
  };

  const handleDeleteSection = (secId: string, secTitle: string) => {
    if (!selectedProject) {
      return;
    }

    const isConfirmed = window.confirm(`Delete section "${secTitle}"?`);
    if (isConfirmed) {
      const newSections = selectedProject.sections.filter((s) => s.id !== secId);
      const newPipeline = selectedProject.pipeline_order.filter((id) => id !== secId);

      const updatedProject: ProjectItem = {
        ...selectedProject,
        sections: newSections,
        pipeline_order: newPipeline,
      };

      updateProjectInCategories(updatedProject);
      toast.success('Section deleted');
    }
  };

  const handleMoveSectionPosition = (index: number, direction: 'up' | 'down') => {
    if (!selectedProject) {
      return;
    }

    const sections = [...selectedProject.sections];
    const isUp = direction === 'up';

    if (isUp) {
      const canMoveUp = index > 0;
      if (canMoveUp) {
        const temp = sections[index - 1];
        sections[index - 1] = sections[index];
        sections[index] = temp;
      }
    } else {
      const canMoveDown = index < sections.length - 1;
      if (canMoveDown) {
        const temp = sections[index + 1];
        sections[index + 1] = sections[index];
        sections[index] = temp;
      }
    }

    const newPipelineOrder = sections.map((s) => s.id);
    const updatedProject = {
      ...selectedProject,
      sections,
      pipeline_order: newPipelineOrder,
    };

    updateProjectInCategories(updatedProject);
    toast.success('Section order updated');
  };

  // Checklist helper callbacks inside section editor
  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: 'chk_' + Date.now().toString(36),
      label: 'New checklist requirement',
      is_required: true,
    };
    setSectionFormChecklist([...sectionFormChecklist, newItem]);
  };

  const handleUpdateChecklistLabel = (id: string, label: string) => {
    setSectionFormChecklist(
      sectionFormChecklist.map((c) => (c.id === id ? { ...c, label } : c))
    );
  };

  const handleToggleChecklistRequired = (id: string) => {
    setSectionFormChecklist(
      sectionFormChecklist.map((c) => (c.id === id ? { ...c, is_required: !c.is_required } : c))
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setSectionFormChecklist(sectionFormChecklist.filter((c) => c.id !== id));
  };

  // Quiz helper callbacks inside section editor
  const handleAddQuizQuestion = () => {
    const newQ: QuizQuestionItem = {
      id: 'q_' + Date.now().toString(36),
      title: 'New Quiz Question',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
    };
    setSectionFormQuestions([...sectionFormQuestions, newQ]);
  };

  const handleUpdateQuizQuestionTitle = (id: string, title: string) => {
    setSectionFormQuestions(
      sectionFormQuestions.map((q) => (q.id === id ? { ...q, title } : q))
    );
  };

  const handleAddQuizOption = (qId: string) => {
    setSectionFormQuestions(
      sectionFormQuestions.map((q) => {
        if (q.id === qId) {
          const optIndex = (q.options?.length || 0) + 1;
          return { ...q, options: [...(q.options || []), `Option ${optIndex}`] };
        }
        return q;
      })
    );
  };

  const handleUpdateQuizOption = (qId: string, optIdx: number, val: string) => {
    setSectionFormQuestions(
      sectionFormQuestions.map((q) => {
        if (q.id === qId) {
          const opts = [...q.options];
          opts[optIdx] = val;
          return { ...q, options: opts };
        }
        return q;
      })
    );
  };

  const handleSetCorrectAnswer = (qId: string, answer: string) => {
    setSectionFormQuestions(
      sectionFormQuestions.map((q) => (q.id === qId ? { ...q, correctAnswer: answer } : q))
    );
  };

  const handleDeleteQuizQuestion = (qId: string) => {
    setSectionFormQuestions(sectionFormQuestions.filter((q) => q.id !== qId));
  };

  const handleResetToDefaults = () => {
    const isConfirmed = window.confirm('Reset all categories and curriculum projects back to factory defaults? Any custom edits will be replaced.');
    if (isConfirmed) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      setCategories(INITIAL_CATEGORIES);
      setSelectedCategory(INITIAL_CATEGORIES[0]);
      setSelectedProject(INITIAL_CATEGORIES[0].projects[0] || null);
      toast.success('Curriculum reset to factory defaults');
    }
  };

  const handleExportProjectJson = () => {
    if (!selectedProject) {
      toast.error('No project selected to export.');
      return;
    }

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

          persistCategories(updated);
          setSelectedCategory(updated.find((c) => c.id === selectedCategory.id) || selectedCategory);
          setSelectedProject(importedProject);
          setImportJsonText('');
          setShowImportModal(false);
          toast.success(`Project "${importedProject.title}" imported successfully!`);
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
    if (!selectedProject) {
      return;
    }

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
    updateProjectInCategories(updatedProject);
    toast.success('Pipeline execution sequence updated');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-emerald-500" />
            Curriculum Projects & Tracks
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure onboarding curriculums, reading documentation, setup checklists, and practical quizzes for hired candidates and employees.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetToDefaults}
            className="text-xs text-muted-foreground hover:text-foreground"
            title="Reset curriculum to factory defaults"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>

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
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Helpful Context & Tool Switcher Card */}
      <div className="p-4 rounded-2xl bg-card border border-border border-l-4 border-l-emerald-500 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 max-w-3xl">
          <div className="font-bold text-foreground text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Understanding Curriculum vs. Exam Builders
          </div>
          <p className="text-foreground/80 leading-relaxed">
            This tab organizes <span className="font-semibold text-foreground">structured post-hire training paths</span> (Reading → Checklists → Quizzes).
            To build custom timed recruitment exams, use the <strong className="text-foreground font-semibold">Form & Quiz Builder</strong>. To review candidates, use the <strong className="text-foreground font-semibold">Candidate Pipeline</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onNavigateTab && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateTab('builder')}
                className="text-xs bg-background hover:bg-muted text-foreground font-semibold border border-border shadow-xs hover:border-amber-500/60 transition"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Form & Quiz Builder
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateTab('pipeline')}
                className="text-xs bg-background hover:bg-muted text-foreground font-semibold border border-border shadow-xs hover:border-emerald-500/60 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Candidate Pipeline
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add Category Drawer/Form */}
      {showAddCat && (
        <div className="p-4 bg-muted/60 border border-indigo-500/40 rounded-xl flex items-center gap-3 animate-in fade-in">
          <Input
            placeholder="Category title (e.g. Sales Enablement, Core Engineering, Operations)..."
            value={newCatTitle}
            onChange={(e) => setNewCatTitle(e.target.value)}
            className="bg-background text-sm"
          />
          <Button size="sm" onClick={handleCreateCategory} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold whitespace-nowrap">
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
              Curriculum Tracks & Categories
            </h3>

            <div className="space-y-3">
              {categories.map((cat) => {
                const isCatSelected = selectedCategory.id === cat.id;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div
                      className={`group w-full p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer ${
                        isCatSelected
                          ? 'border shadow-sm'
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                      style={isCatSelected ? {
                        borderColor: `${config.primaryColor}66`,
                        backgroundColor: `${config.primaryColor}15`,
                        color: config.primaryColor,
                      } : undefined}
                      onClick={() => {
                        setSelectedCategory(cat);
                        const firstProj = cat.projects.length > 0 ? cat.projects[0] : null;
                        setSelectedProject(firstProj);
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderTree className="w-4 h-4 shrink-0" style={{ color: config.primaryColor }} />
                        <span className="truncate">{cat.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {cat.projects.length} {cat.projects.length === 1 ? 'project' : 'projects'}
                        </Badge>
                        <button
                          onClick={(e) => handleOpenEditCategory(cat, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition"
                          title="Rename Category"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-projects list */}
                    {isCatSelected && (
                      <div className="pl-6 space-y-1 border-l-2 ml-4 py-1" style={{ borderColor: `${config.primaryColor}30` }}>
                        {cat.projects.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic py-1 pl-1">
                            No projects yet. Click '+ Add Project' above.
                          </div>
                        ) : (
                          cat.projects.map((proj) => {
                            const isProjSelected = selectedProject?.id === proj.id;
                            const hasSubProjects = Boolean(proj.sub_projects && proj.sub_projects.length > 0);

                            return (
                              <div key={proj.id} className="space-y-1">
                                <button
                                  onClick={() => setSelectedProject(proj)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                                    isProjSelected
                                      ? 'shadow font-bold'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                  }`}
                                  style={isProjSelected ? {
                                    backgroundColor: config.primaryColor,
                                    color: theme === 'riseup' ? '#0A0A14' : '#FFFFFF',
                                  } : undefined}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Layers className="w-3.5 h-3.5 opacity-80" />
                                    <span className="truncate">{proj.title}</span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 opacity-60" />
                                </button>

                                {/* Recursive Sub-Projects in Tree */}
                                {hasSubProjects && (
                                  <div className="pl-4 space-y-1 border-l ml-3" style={{ borderColor: `${config.primaryColor}20` }}>
                                    {proj.sub_projects?.map((subProj) => {
                                      const isSubSelected = selectedProject?.id === subProj.id;

                                      return (
                                        <button
                                          key={subProj.id}
                                          onClick={() => setSelectedProject(subProj)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition ${
                                            isSubSelected
                                              ? 'font-bold border shadow-sm'
                                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                          }`}
                                          style={isSubSelected ? {
                                            borderColor: `${config.primaryColor}88`,
                                            backgroundColor: `${config.primaryColor}20`,
                                            color: config.primaryColor,
                                          } : undefined}
                                        >
                                          <div className="flex items-center gap-1.5 truncate">
                                            <GitBranch className="w-3 h-3" style={{ color: config.primaryColor }} />
                                            <span className="truncate">└─ {subProj.title}</span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${config.badgeClass} font-mono text-xs`}>
                      Split DB: {selectedProject.id}.sqlite
                    </Badge>
                    {selectedProject.parent_project_id && (
                      <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                        Recursive Sub-Project
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{selectedProject.title}</h3>
                    <button
                      onClick={handleOpenEditProject}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      title="Edit Project Settings"
                    >
                      <Pencil className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">{selectedProject.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenEditProject}
                    className="text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    Edit Project
                  </Button>

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
                    Preview in Runner
                  </Button>
                </div>
              </div>

              {/* Pipeline Ordering & Permissions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground font-medium">Execution Pipeline:</span>
                    <span className="text-xs text-muted-foreground">Order: Step A → Step B → Step C</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedProject.pipeline_order.map((stepId, idx) => {
                      const matchedSec = selectedProject.sections?.find((s) => s.id === stepId);
                      const displayTitle = matchedSec ? matchedSec.title : stepId;

                      return (
                        <div
                          key={stepId}
                          className="flex items-center justify-between px-2.5 py-1 rounded bg-background border font-mono text-xs"
                        >
                          <span className="truncate max-w-[200px]">{idx + 1}. {displayTitle}</span>
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
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground font-medium">Allowed Roles:</span>
                    <button
                      onClick={handleOpenEditProject}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Change Roles
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedProject.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        <Shield className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linked Sub-Projects Section */}
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
                    <Button size="sm" onClick={handleAddSubProject} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
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
                          <span className="text-xs text-muted-foreground block">{subProj.sections.length} sections</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProject(subProj)}
                        className="text-xs h-7"
                      >
                        Inspect Sub-Project
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections list & Full Interactive Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Project Sections & Learning Tasks ({selectedProject.sections.length})
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click any section to edit its reading text, video, checklist items, or quiz questions.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                    onClick={handleOpenAddSection}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
                  </Button>
                </div>

                <div className="space-y-2">
                  {selectedProject.sections.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed text-xs text-muted-foreground">
                      No learning sections yet. Click "+ Add Section" above to add documentation, checklists, or quizzes.
                    </div>
                  ) : (
                    selectedProject.sections.map((sec, idx) => {
                      const isReading = sec.content_type === 'reading';
                      const isChecklist = sec.content_type === 'checklist';
                      const isQuiz = sec.content_type === 'quiz';

                      return (
                        <div
                          key={sec.id}
                          className="group p-3.5 rounded-xl bg-muted/30 border border-border/70 hover:border-emerald-500/50 hover:bg-muted/50 transition flex items-center justify-between"
                        >
                          <div
                            className="flex items-center gap-3 cursor-pointer flex-1"
                            onClick={() => handleOpenEditSection(sec)}
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                                <span>{sec.title}</span>
                                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                                  {sec.content_type}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                                {isReading && (
                                  <>
                                    <span className="flex items-center gap-0.5 text-sky-400">
                                      <FileText className="w-3 h-3" />
                                      {sec.reading_content ? `${sec.reading_content.slice(0, 45)}...` : 'Reading documentation'}
                                    </span>
                                    {sec.video_url && (
                                      <span className="flex items-center gap-0.5 text-rose-400">
                                        <Video className="w-3 h-3" /> Video Linked
                                      </span>
                                    )}
                                  </>
                                )}
                                {isChecklist && (
                                  <span className="flex items-center gap-0.5 text-emerald-400">
                                    <ListChecks className="w-3 h-3" />
                                    {sec.checklist?.length || 0} verification checklist items
                                  </span>
                                )}
                                {isQuiz && (
                                  <span className="flex items-center gap-0.5 text-amber-400">
                                    <Sparkles className="w-3 h-3" />
                                    {sec.questions?.length || 0} quiz questions
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleMoveSectionPosition(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded hover:bg-background text-muted-foreground disabled:opacity-30 transition"
                              title="Move section up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveSectionPosition(idx, 'down')}
                              disabled={idx === selectedProject.sections.length - 1}
                              className="p-1.5 rounded hover:bg-background text-muted-foreground disabled:opacity-30 transition"
                              title="Move section down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditSection(sec)}
                              className="text-xs h-8 px-2.5"
                            >
                              <Pencil className="w-3 h-3 mr-1 text-indigo-400" />
                              Configure
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSection(sec.id, sec.title)}
                              className="text-xs h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-muted/20 border rounded-2xl space-y-3">
              <FolderTree className="w-10 h-10 mx-auto opacity-30" style={{ color: config.primaryColor }} />
              <div className="text-sm font-semibold text-foreground">No Project Selected</div>
              <p className="text-xs max-w-sm mx-auto">
                Select a project from the curriculum tree on the left, or create a new project to configure its learning pipeline and sections.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="max-w-lg rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-400" />
              Configure Project Settings
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update the project title, learning objectives, and allowed user roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Title</label>
              <Input
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                placeholder="e.g. Developer Onboarding & IT Security"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Description</label>
              <Textarea
                value={editProjectDesc}
                onChange={(e) => setEditProjectDesc(e.target.value)}
                placeholder="Detailed objectives and expectations for the candidate or employee..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Allowed Access Roles</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = editProjectRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleToggleProjectRole(role.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Shield className="w-3 h-3 opacity-40" />}
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-between border-t gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteCurrentProject}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Project
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditProjectOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveProjectDetails} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => { if (!open) setEditingCategory(null); }}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-400" />
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-xs">
              Rename curriculum track or update category description.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category Name</label>
              <Input
                value={editCatTitle}
                onChange={(e) => setEditCatTitle(e.target.value)}
                placeholder="Category title..."
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category Description</label>
              <Textarea
                value={editCatDescription}
                onChange={(e) => setEditCatDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEditCategory} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
                Save Category
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comprehensive Section Editor Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              {isCreatingSection ? 'Add Learning Section' : 'Configure Learning Section'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure content for this section: Reading documentation, verification checklists, or mastery quizzes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Section Title</label>
                <Input
                  value={sectionFormTitle}
                  onChange={(e) => setSectionFormTitle(e.target.value)}
                  placeholder="e.g. 1. Security Protocols & Reading Materials"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Section Type</label>
                <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSectionFormType('reading')}
                    className={`py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                      sectionFormType === 'reading'
                        ? 'bg-background shadow text-foreground font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" /> Reading
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionFormType('checklist')}
                    className={`py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                      sectionFormType === 'checklist'
                        ? 'bg-background shadow text-foreground font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ListChecks className="w-3 h-3" /> Checklist
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionFormType('quiz')}
                    className={`py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                      sectionFormType === 'quiz'
                        ? 'bg-background shadow text-foreground font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" /> Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Type-Specific Content */}
            {sectionFormType === 'reading' && (
              <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    Video URL (Optional)
                  </label>
                  <Input
                    value={sectionFormVideoUrl}
                    onChange={(e) => setSectionFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or Vimeo link"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    Reading Documentation / Instructions
                  </label>
                  <Textarea
                    value={sectionFormReadingContent}
                    onChange={(e) => setSectionFormReadingContent(e.target.value)}
                    placeholder="Provide detailed standard operating procedures, documentation, links, or instructions..."
                    rows={6}
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {sectionFormType === 'checklist' && (
              <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
                    Checklist Verification Items
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddChecklistItem}
                    className="text-xs h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {sectionFormChecklist.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-background border">
                      <span className="text-xs font-bold text-muted-foreground w-5 text-center">{idx + 1}.</span>
                      <Input
                        value={item.label}
                        onChange={(e) => handleUpdateChecklistLabel(item.id, e.target.value)}
                        placeholder="Requirement description..."
                        className="text-xs h-8 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleChecklistRequired(item.id)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                          item.is_required
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-muted/40 text-muted-foreground border-border'
                        }`}
                        title="Toggle required status"
                      >
                        {item.is_required ? 'Required' : 'Optional'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="p-1 hover:text-rose-400 text-muted-foreground transition"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sectionFormType === 'quiz' && (
              <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Quiz Questions ({sectionFormQuestions.length})
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddQuizQuestion}
                    className="text-xs h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Question
                  </Button>
                </div>

                <div className="space-y-4">
                  {sectionFormQuestions.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-2 text-center">
                      No questions yet. Click "+ Add Question" to add a multiple-choice question.
                    </div>
                  ) : (
                    sectionFormQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-3.5 rounded-xl bg-background border space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-foreground">Question {qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuizQuestion(q.id)}
                            className="p-1 hover:text-rose-400 text-muted-foreground transition"
                            title="Delete question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Input
                          value={q.title}
                          onChange={(e) => handleUpdateQuizQuestionTitle(q.id, e.target.value)}
                          placeholder="e.g. Minimum password length required?"
                          className="text-xs"
                        />

                        {/* Options */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Answer Options (Click checkmark to set correct answer)</span>
                            <button
                              type="button"
                              onClick={() => handleAddQuizOption(q.id)}
                              className="text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="w-2.5 h-2.5" /> Add Option
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {q.options?.map((opt, optIdx) => {
                              const isCorrect = q.correctAnswer === opt;
                              return (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSetCorrectAnswer(q.id, opt)}
                                    className={`p-1.5 rounded-lg border transition ${
                                      isCorrect
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                                    }`}
                                    title={isCorrect ? 'Correct answer' : 'Click to mark as correct answer'}
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <Input
                                    value={opt}
                                    onChange={(e) => handleUpdateQuizOption(q.id, optIdx, e.target.value)}
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="text-xs h-7 flex-1"
                                  />
                                  {isCorrect && (
                                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40">
                                      Correct
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsSectionModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveSection} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
                {isCreatingSection ? 'Add Section' : 'Save Section'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

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
              <Button size="sm" onClick={handleImportProjectJson} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
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
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
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

import React, { useState, useMemo } from 'react';
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
  Search,
  Copy,
  LayoutGrid,
  ArrowLeft,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

export const AVAILABLE_ROLES = [
  { id: 'all', label: 'All Users' },
  { id: 'candidate', label: 'Candidates' },
  { id: 'employee', label: 'Employees' },
  { id: 'subscriber', label: 'Subscribers' },
  { id: 'developer', label: 'Developers' },
  { id: 'contributor', label: 'Contributors' },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
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

export const STORAGE_KEY = 'wp_exam_curriculum_categories';

export interface ProjectHierarchyManagerProps {
  onLaunchFocusRunner?: (project: ProjectItem) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProjectHierarchyManager: React.FC<ProjectHierarchyManagerProps> = ({
  onLaunchFocusRunner,
  onNavigateTab,
}) => {
  const { theme, config } = useTheme();

  // Root curriculum state
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

  // UI Modes: 'list' (Catalog List View) | 'editor' (Focused Studio View) | 'tree' (Classic 2-Column Tree)
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'tree'>('list');
  const [editorTab, setEditorTab] = useState<'sections' | 'settings' | 'subprojects'>('sections');

  // Active selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => categories[0]?.id || 'cat_onboarding');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const firstCat = categories[0];
    return firstCat?.projects[0]?.id || 'proj_sec_101';
  });

  // Search & Filtering for List View
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Create Project Modal State
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);
  const [newProjectTitle, setNewProjectTitle] = useState<string>('');
  const [newProjectSlug, setNewProjectSlug] = useState<string>('');
  const [newProjectCategoryId, setNewProjectCategoryId] = useState<string>('');
  const [newProjectNewCategoryTitle, setNewProjectNewCategoryTitle] = useState<string>('');
  const [newProjectDescription, setNewProjectDescription] = useState<string>('');
  const [newProjectTemplate, setNewProjectTemplate] = useState<'full' | 'quiz' | 'checklist' | 'blank'>('full');
  const [newProjectRoles, setNewProjectRoles] = useState<string[]>(['all']);

  // Modals & Confirmation States
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Manage Categories Drawer / Modal
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCatTitle, setEditCatTitle] = useState<string>('');
  const [editCatDescription, setEditCatDescription] = useState<string>('');
  const [quickAddCatTitle, setQuickAddCatTitle] = useState<string>('');

  // Sub-project creation in Editor
  const [newSubProjectTitle, setNewSubProjectTitle] = useState<string>('');
  const [showAddSubProject, setShowAddSubProject] = useState<boolean>(false);

  // Section Add / Edit Modal
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

  // Persist categories helper
  const persistCategories = (updatedCategories: CategoryItem[]) => {
    setCategories(updatedCategories);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCategories, null, 2));
    }
  };

  // Find currently active project across categories
  const currentProject = useMemo<ProjectItem | null>(() => {
    for (const cat of categories) {
      for (const proj of cat.projects) {
        if (proj.id === selectedProjectId) {
          return proj;
        }
        if (proj.sub_projects) {
          for (const sub of proj.sub_projects) {
            if (sub.id === selectedProjectId) {
              return sub;
            }
          }
        }
      }
    }
    return categories[0]?.projects[0] || null;
  }, [categories, selectedProjectId]);

  // Find category for current project
  const currentCategory = useMemo<CategoryItem | null>(() => {
    if (currentProject) {
      const match = categories.find((c) => c.id === currentProject.category_id);
      if (match) {
        return match;
      }
    }
    return categories.find((c) => c.id === selectedCategoryId) || categories[0] || null;
  }, [categories, currentProject, selectedCategoryId]);

  // Flattened project list for Catalog List view
  const allProjects = useMemo(() => {
    const list: Array<ProjectItem & { categoryTitle: string; isSubProject: boolean }> = [];
    categories.forEach((cat) => {
      cat.projects.forEach((proj) => {
        list.push({ ...proj, categoryTitle: cat.title, isSubProject: false });
        if (proj.sub_projects) {
          proj.sub_projects.forEach((sub) => {
            list.push({ ...sub, categoryTitle: `${cat.title} / ${proj.title}`, isSubProject: true });
          });
        }
      });
    });
    return list;
  }, [categories]);

  // Filtered projects for List View
  const filteredProjects = useMemo(() => {
    return allProjects.filter((proj) => {
      const sQuery = searchQuery.trim().toLowerCase();
      const hasSearch = sQuery.length > 0;
      if (hasSearch) {
        const matchesTitle = (proj.title || '').toLowerCase().includes(sQuery);
        const matchesDesc = (proj.description || '').toLowerCase().includes(sQuery);
        const matchesCat = (proj.categoryTitle || '').toLowerCase().includes(sQuery);
        const isMatch = matchesTitle || matchesDesc || matchesCat;
        if (!isMatch) {
          return false;
        }
      }

      const hasCatFilter = categoryFilter !== 'all';
      if (hasCatFilter) {
        const isCatMatch = proj.category_id === categoryFilter;
        if (!isCatMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allProjects, searchQuery, categoryFilter]);

  // Aggregate metrics
  const totalSectionsCount = useMemo(() => {
    return allProjects.reduce((sum, p) => sum + (p.sections?.length || 0), 0);
  }, [allProjects]);

  const totalQuizzesCount = useMemo(() => {
    return allProjects.reduce((sum, p) => {
      const qSections = p.sections?.filter((s) => s.content_type === 'quiz') || [];
      return sum + qSections.length;
    }, 0);
  }, [allProjects]);

  // Helper to update a project in state and localStorage
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
    setSelectedProjectId(updatedProject.id);
  };

  // Open Create Project Modal
  const handleOpenCreateProjectModal = (preselectedCatId?: string) => {
    const targetCatId = preselectedCatId || categories[0]?.id || 'cat_onboarding';
    const defaultIndex = allProjects.length + 1;
    setNewProjectTitle(`Curriculum Project ${defaultIndex}`);
    setNewProjectSlug(`proj_${Date.now().toString(36)}`);
    setNewProjectCategoryId(targetCatId);
    setNewProjectNewCategoryTitle('');
    setNewProjectDescription('Structured learning milestones, requirements, and compliance verification.');
    setNewProjectTemplate('full');
    setNewProjectRoles(['all']);
    setIsCreateProjectOpen(true);
  };

  // Confirm Create Project
  const handleConfirmCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = newProjectTitle.trim();
    const hasTitle = cleanTitle.length > 0;
    if (!hasTitle) {
      toast.error('Project title is required.');
      return;
    }

    let finalCategoryId = newProjectCategoryId;
    let nextCategories = [...categories];

    // If user selected "new_category" or gave a new category name
    const isNewCategorySelected = newProjectCategoryId === '__new__';
    const hasNewCatName = newProjectNewCategoryTitle.trim().length > 0;

    if (isNewCategorySelected || hasNewCatName) {
      const catTitle = newProjectNewCategoryTitle.trim() || 'New Learning Track';
      const newCat: CategoryItem = {
        id: `cat_${Date.now().toString(36)}`,
        title: catTitle,
        description: 'Custom curriculum track.',
        projects: [],
      };
      nextCategories = [...nextCategories, newCat];
      finalCategoryId = newCat.id;
    }

    // Generate starter sections based on chosen template
    let starterSections: ProjectSection[] = [];
    let starterPipeline: string[] = [];

    if (newProjectTemplate === 'full') {
      const sec1Id = `sec_read_${Date.now()}`;
      const sec2Id = `sec_chk_${Date.now()}`;
      const sec3Id = `sec_quiz_${Date.now()}`;

      starterSections = [
        {
          id: sec1Id,
          title: '1. Architecture & Protocol Briefing',
          content_type: 'reading',
          reading_content: 'Review standard operating procedures and technical documentation before commencing practical tasks.',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        {
          id: sec2Id,
          title: '2. Setup & Security Checklist',
          content_type: 'checklist',
          checklist: [
            { id: 'c1', label: 'Configured local environment and security credentials', is_required: true },
            { id: 'c2', label: 'Verified endpoint antivirus and encryption', is_required: true },
            { id: 'c3', label: 'Reviewed coding guidelines and zero-storage mandates', is_required: false },
          ],
        },
        {
          id: sec3Id,
          title: '3. Knowledge Verification Quiz',
          content_type: 'quiz',
          questions: [
            {
              id: 'q1',
              title: 'Which database pattern provides complete data isolation per assessment project?',
              options: ['Split SQLite per-project file', 'Shared monolithic database', 'In-memory array'],
              correctAnswer: 'Split SQLite per-project file',
            },
            {
              id: 'q2',
              title: 'Are explicit boolean checks like "if isReady == true" permitted?',
              options: ['No (Strict Total Ban)', 'Yes, always', 'Optional'],
              correctAnswer: 'No (Strict Total Ban)',
            },
          ],
        },
      ];
      starterPipeline = [sec1Id, sec2Id, sec3Id];
    } else if (newProjectTemplate === 'quiz') {
      const sec1Id = `sec_read_${Date.now()}`;
      const sec2Id = `sec_quiz_${Date.now()}`;
      starterSections = [
        {
          id: sec1Id,
          title: '1. Technical Assessment Briefing',
          content_type: 'reading',
          reading_content: 'Complete the questions in section 2 within the designated time frame.',
        },
        {
          id: sec2Id,
          title: '2. Technical Competency Quiz',
          content_type: 'quiz',
          questions: [
            {
              id: 'q1',
              title: 'What is the required standard for boolean predicate evaluation?',
              options: ['Implicit evaluation (if isReady)', 'Explicit check against true', 'Negated check'],
              correctAnswer: 'Implicit evaluation (if isReady)',
            },
          ],
        },
      ];
      starterPipeline = [sec1Id, sec2Id];
    } else if (newProjectTemplate === 'checklist') {
      const sec1Id = `sec_read_${Date.now()}`;
      const sec2Id = `sec_chk_${Date.now()}`;
      starterSections = [
        {
          id: sec1Id,
          title: '1. Procedure Documentation',
          content_type: 'reading',
          reading_content: 'Follow the instructions step by step and tick off each verification item.',
        },
        {
          id: sec2Id,
          title: '2. Verification Checklist',
          content_type: 'checklist',
          checklist: [
            { id: 'c1', label: 'Pre-flight system checks complete', is_required: true },
            { id: 'c2', label: 'Verified clean branch and working tree', is_required: true },
          ],
        },
      ];
      starterPipeline = [sec1Id, sec2Id];
    } else {
      const sec1Id = `sec_intro_${Date.now()}`;
      starterSections = [
        {
          id: sec1Id,
          title: '1. Introduction & Overview',
          content_type: 'reading',
          reading_content: 'Welcome to this curriculum track. Configure sections as needed.',
        },
      ];
      starterPipeline = [sec1Id];
    }

    const cleanSlug = newProjectSlug.trim() || `proj_${Date.now().toString(36)}`;
    const newProject: ProjectItem = {
      id: cleanSlug,
      title: cleanTitle,
      description: newProjectDescription.trim() || 'Custom curriculum project.',
      category_id: finalCategoryId,
      pipeline_order: starterPipeline,
      permissions: newProjectRoles.length > 0 ? newProjectRoles : ['all'],
      sections: starterSections,
      sub_projects: [],
      history: [
        {
          id: '1',
          revision_id: `rev_${Date.now().toString(36)}`,
          summary: `Created project "${cleanTitle}"`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    const finalCategories = nextCategories.map((cat) => {
      if (cat.id === finalCategoryId) {
        return {
          ...cat,
          projects: [newProject, ...cat.projects],
        };
      }
      return cat;
    });

    persistCategories(finalCategories);
    setSelectedCategoryId(finalCategoryId);
    setSelectedProjectId(newProject.id);
    setIsCreateProjectOpen(false);
    setViewMode('editor');
    setEditorTab('sections');
    toast.success(`Created Project "${cleanTitle}"!`);
  };

  // Duplicate a project
  const handleDuplicateProject = (projectToClone: ProjectItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const cloneId = `${projectToClone.id}_copy_${Date.now().toString(36).slice(0, 4)}`;
    const clonedProject: ProjectItem = {
      ...JSON.parse(JSON.stringify(projectToClone)),
      id: cloneId,
      title: `${projectToClone.title} (Copy)`,
      history: [
        {
          id: '1',
          revision_id: `rev_${Date.now().toString(36)}`,
          summary: `Duplicated from ${projectToClone.title}`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    const updatedCategories = categories.map((cat) => {
      if (cat.id === projectToClone.category_id) {
        return {
          ...cat,
          projects: [...cat.projects, clonedProject],
        };
      }
      return cat;
    });

    persistCategories(updatedCategories);
    setSelectedProjectId(clonedProject.id);
    toast.success(`Duplicated "${projectToClone.title}"`);
  };

  // Confirm delete project
  const handleConfirmDeleteProject = () => {
    if (!projectToDelete) {
      return;
    }

    const targetId = projectToDelete.id;
    const targetCatId = projectToDelete.category_id;

    const updatedCategories = categories.map((cat) => {
      if (cat.id === targetCatId) {
        return {
          ...cat,
          projects: cat.projects.filter((p) => p.id !== targetId),
        };
      }
      return cat;
    });

    persistCategories(updatedCategories);

    // Pick new active project
    const remainingProj = updatedCategories[0]?.projects[0] || null;
    setSelectedProjectId(remainingProj?.id || '');
    setProjectToDelete(null);

    const isDeletedActive = currentProject?.id === targetId;
    if (isDeletedActive) {
      setViewMode('list');
    }

    toast.success(`Deleted project "${projectToDelete.title}"`);
  };

  // Confirm delete category
  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) {
      return;
    }

    const hasOnlyOne = categories.length <= 1;
    if (hasOnlyOne) {
      toast.error('Cannot delete the only remaining track/category.');
      setCategoryToDelete(null);
      return;
    }

    const updated = categories.filter((c) => c.id !== categoryToDelete.id);
    persistCategories(updated);
    setSelectedCategoryId(updated[0].id);
    setSelectedProjectId(updated[0].projects[0]?.id || '');
    setCategoryToDelete(null);
    toast.success(`Deleted track "${categoryToDelete.title}" and its projects.`);
  };

  // Category rename / edit
  const handleOpenEditCategory = (cat: CategoryItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingCategory(cat);
    setEditCatTitle(cat.title);
    setEditCatDescription(cat.description || '');
  };

  const handleSaveEditCategory = () => {
    if (!editingCategory) {
      return;
    }

    const cleanTitle = editCatTitle.trim();
    const hasTitle = cleanTitle.length > 0;
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
    setEditingCategory(null);
    toast.success('Category updated successfully');
  };

  // Quick add category in Manage Tracks dialog
  const handleQuickAddCategory = () => {
    const clean = quickAddCatTitle.trim();
    const hasTitle = clean.length > 0;
    if (hasTitle) {
      const newCat: CategoryItem = {
        id: `cat_${Date.now().toString(36)}`,
        title: clean,
        description: 'Custom curriculum track.',
        projects: [],
      };
      persistCategories([...categories, newCat]);
      setQuickAddCatTitle('');
      toast.success(`Created track "${clean}"`);
    }
  };

  // Reset to defaults
  const handleConfirmResetDefaults = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCategories(INITIAL_CATEGORIES);
    setSelectedCategoryId(INITIAL_CATEGORIES[0].id);
    setSelectedProjectId(INITIAL_CATEGORIES[0].projects[0].id);
    setShowResetConfirm(false);
    setViewMode('list');
    toast.success('Curriculum reset to factory defaults.');
  };

  // Export Project JSON
  const handleExportProjectJson = (projectToExport?: ProjectItem) => {
    const target = projectToExport || currentProject;
    if (!target) {
      toast.error('No project available to export.');
      return;
    }

    const jsonStr = JSON.stringify(target, null, 2);
    navigator.clipboard.writeText(jsonStr);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${target.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported "${target.title}" and copied JSON to clipboard!`);
  };

  // Import Project JSON
  const handleImportProjectJson = () => {
    const cleanText = importJsonText.trim();
    const hasText = cleanText.length > 0;

    if (hasText) {
      try {
        const parsed = JSON.parse(cleanText);
        const hasTitle = Boolean(parsed.title);

        if (hasTitle) {
          const targetCatId = selectedCategoryId || categories[0]?.id || 'cat_onboarding';
          const importedProject: ProjectItem = {
            id: parsed.id || `proj_imported_${Date.now().toString(36)}`,
            title: parsed.title,
            description: parsed.description || 'Imported curriculum project.',
            category_id: targetCatId,
            parent_project_id: parsed.parent_project_id || '',
            pipeline_order: Array.isArray(parsed.pipeline_order) ? parsed.pipeline_order : ['sec_1'],
            permissions: Array.isArray(parsed.permissions) ? parsed.permissions : ['all'],
            sections: Array.isArray(parsed.sections) ? parsed.sections : [],
            sub_projects: Array.isArray(parsed.sub_projects) ? parsed.sub_projects : [],
            history: [
              {
                id: '1',
                revision_id: `rev_import_${Date.now().toString(36)}`,
                summary: 'Imported from JSON manifest',
                created_at: new Date().toISOString(),
              },
            ],
          };

          const updated = categories.map((cat) => {
            if (cat.id === targetCatId) {
              return { ...cat, projects: [importedProject, ...cat.projects] };
            }
            return cat;
          });

          persistCategories(updated);
          setSelectedProjectId(importedProject.id);
          setImportJsonText('');
          setShowImportModal(false);
          setViewMode('editor');
          toast.success(`Imported "${importedProject.title}" successfully!`);
        } else {
          toast.error('Invalid JSON: Missing required "title" property.');
        }
      } catch (err) {
        toast.error(`Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      toast.error('Please paste valid JSON text.');
    }
  };

  // Launch Runner preview
  const handlePreviewRunner = (projectToRun?: ProjectItem) => {
    const target = projectToRun || currentProject;
    if (target) {
      if (onLaunchFocusRunner) {
        onLaunchFocusRunner(target);
      } else {
        toast.info(`Launching runner preview for "${target.title}"`);
      }
    }
  };

  // Section Add / Edit Handlers
  const handleOpenAddSection = () => {
    if (!currentProject) {
      return;
    }

    const count = currentProject.sections?.length || 0;
    setSectionFormId(`sec_${Date.now().toString(36)}`);
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
      sec.checklist
        ? sec.checklist.map((c) => ({ ...c }))
        : [{ id: 'chk_1', label: 'Item 1', is_required: true }]
    );
    setSectionFormQuestions(
      sec.questions
        ? sec.questions.map((q) => ({
            id: q.id || `q_${Math.random().toString(36).slice(2, 7)}`,
            title: q.title || '',
            options: Array.isArray(q.options) ? [...q.options] : ['Option A', 'Option B'],
            correctAnswer: (q.correctAnswer as string) || '',
          }))
        : []
    );
    setIsCreatingSection(false);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = () => {
    if (!currentProject) {
      return;
    }

    const cleanTitle = sectionFormTitle.trim();
    const hasTitle = cleanTitle.length > 0;
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
      newSections = [...(currentProject.sections || []), updatedSec];
      newPipelineOrder = [...currentProject.pipeline_order, updatedSec.id];
    } else {
      newSections = (currentProject.sections || []).map((s) =>
        s.id === updatedSec.id ? updatedSec : s
      );
      const hasInOrder = currentProject.pipeline_order.includes(updatedSec.id);
      if (hasInOrder) {
        newPipelineOrder = currentProject.pipeline_order;
      } else {
        newPipelineOrder = [...currentProject.pipeline_order, updatedSec.id];
      }
    }

    const updatedProject: ProjectItem = {
      ...currentProject,
      sections: newSections,
      pipeline_order: newPipelineOrder,
      history: [
        ...(currentProject.history || []),
        {
          id: String(Date.now()),
          revision_id: `rev_${Date.now().toString(36)}`,
          summary: isCreatingSection
            ? `Added section: ${cleanTitle}`
            : `Configured section: ${cleanTitle}`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    updateProjectInCategories(updatedProject);
    setIsSectionModalOpen(false);
    toast.success(isCreatingSection ? 'Section added successfully!' : 'Section configured successfully!');
  };

  const handleConfirmDeleteSection = () => {
    if (!sectionToDelete) {
      return;
    }
    if (!currentProject) {
      return;
    }

    const secId = sectionToDelete.id;
    const newSections = currentProject.sections.filter((s) => s.id !== secId);
    const newPipeline = currentProject.pipeline_order.filter((id) => id !== secId);

    const updatedProject: ProjectItem = {
      ...currentProject,
      sections: newSections,
      pipeline_order: newPipeline,
    };

    updateProjectInCategories(updatedProject);
    setSectionToDelete(null);
    toast.success('Section deleted');
  };

  const handleMoveSectionPosition = (index: number, direction: 'up' | 'down') => {
    if (!currentProject) {
      return;
    }

    const sections = [...currentProject.sections];
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
      ...currentProject,
      sections,
      pipeline_order: newPipelineOrder,
    };

    updateProjectInCategories(updatedProject);
    toast.success('Section sequence updated');
  };

  // Section Checklist helper methods
  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `chk_${Date.now().toString(36)}`,
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

  // Section Quiz helper methods
  const handleAddQuizQuestion = () => {
    const newQ: QuizQuestionItem = {
      id: `q_${Date.now().toString(36)}`,
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

  // Sub-project creation in Editor
  const handleAddSubProject = () => {
    if (!currentProject) {
      toast.error('No parent project selected.');
      return;
    }

    const cleanTitle = newSubProjectTitle.trim();
    const hasTitle = cleanTitle.length > 0;

    if (hasTitle) {
      const newSubProj: ProjectItem = {
        id: `proj_sub_${Date.now().toString(36)}`,
        title: cleanTitle,
        description: `Sub-module for ${currentProject.title}`,
        category_id: currentProject.category_id,
        parent_project_id: currentProject.id,
        pipeline_order: ['sec_sub_intro'],
        permissions: currentProject.permissions || ['all'],
        sections: [
          {
            id: 'sec_sub_intro',
            title: '1. Practical Task Checklist',
            content_type: 'checklist',
            checklist: [
              { id: 'sub_c1', label: 'Completed parent prerequisites', is_required: true },
            ],
          },
        ],
        history: [
          {
            id: '1',
            revision_id: `rev_${Date.now().toString(36)}`,
            summary: 'Created recursive sub-project',
            created_at: new Date().toISOString(),
          },
        ],
      };

      const updatedSubProjects = [...(currentProject.sub_projects || []), newSubProj];
      const updatedProject = { ...currentProject, sub_projects: updatedSubProjects };
      updateProjectInCategories(updatedProject);
      setNewSubProjectTitle('');
      setShowAddSubProject(false);
      toast.success(`Added sub-project "${cleanTitle}"!`);
    } else {
      toast.error('Please enter a sub-project title.');
    }
  };

  // Toggle roles in project settings
  const handleToggleProjectRole = (roleId: string) => {
    if (!currentProject) {
      return;
    }

    const currentRoles = currentProject.permissions || ['all'];
    const hasRole = currentRoles.includes(roleId);
    let nextRoles: string[];

    if (hasRole) {
      const isOnlyOne = currentRoles.length === 1;
      if (isOnlyOne) {
        toast.error('At least one role must remain allowed.');
        return;
      }
      nextRoles = currentRoles.filter((r) => r !== roleId);
    } else {
      nextRoles = [...currentRoles, roleId];
    }

    updateProjectInCategories({
      ...currentProject,
      permissions: nextRoles,
    });
  };

  // Revert revision
  const handleRevertRevision = (revId: string, summary: string) => {
    toast.success(`Reverted project state to revision ${revId} (${summary})`);
    setShowHistoryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & WORKSPACE NAVIGATION                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-card rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
              Curriculum Projects & Tracks
            </h1>
            <Badge variant="outline" className="text-xs font-mono text-emerald-500 border-emerald-500/30">
              {allProjects.length} {allProjects.length === 1 ? 'Project' : 'Projects'}
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              {categories.length} {categories.length === 1 ? 'Track' : 'Tracks'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Design structured onboarding paths, technical reading briefs, compliance checklists, and practical quizzes for hired candidates and employees.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle Button */}
          <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Catalog List View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Projects List</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'tree'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tree & Pipeline Hierarchy View"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsManageCategoriesOpen(true)}
            className="text-xs h-9 px-3"
            title="Manage curriculum categories and tracks"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Manage Tracks
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenCreateProjectModal()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </Button>
        </div>
      </div>

      {/* Helpful Context Banner */}
      <div className="p-4 rounded-2xl bg-card border border-border border-l-4 border-l-emerald-500 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 max-w-3xl">
          <div className="font-bold text-foreground text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Curriculum Builder & Learning Pipelines
          </div>
          <p className="text-foreground/80 leading-relaxed">
            Curriculum projects define sequential training and verification steps (Reading Briefing → Verification Checklist → Scored Quiz).
            Candidates and employees advance linearly through their assigned pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="text-xs h-8 px-2.5"
          >
            <Upload className="w-3 h-3 mr-1 text-sky-400" />
            Import JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportProjectJson()}
            className="text-xs h-8 px-2.5"
          >
            <Download className="w-3 h-3 mr-1 text-emerald-400" />
            Export JSON
          </Button>
          {onNavigateTab && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs h-8 px-2.5 hover:border-emerald-500/60 transition"
            >
              <ExternalLink className="w-3 h-3 mr-1 text-emerald-500" />
              Candidate Pipeline
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIEW MODE: CATALOG LIST VIEW                                           */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Metrics summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Total Projects</span>
              <span className="text-2xl font-bold text-foreground font-mono">{allProjects.length}</span>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Curriculum Tracks</span>
              <span className="text-2xl font-bold text-emerald-500 font-mono">{categories.length}</span>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Learning Sections</span>
              <span className="text-2xl font-bold text-sky-400 font-mono">{totalSectionsCount}</span>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Practical Quizzes</span>
              <span className="text-2xl font-bold text-amber-400 font-mono">{totalQuizzesCount}</span>
            </div>
          </div>

          {/* Search & Track Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-card rounded-2xl border border-border">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search projects by title, description, or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Track:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px] h-9 text-xs bg-background">
                  <SelectValue placeholder="All Tracks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks ({allProjects.length})</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title} ({cat.projects.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-card border border-dashed rounded-3xl space-y-3">
                <FolderTree className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <h3 className="text-base font-bold text-foreground">No Curriculum Projects Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No projects match your search query or track filter. Try clearing your search or create a new project.
                </p>
                <Button
                  size="sm"
                  onClick={() => handleOpenCreateProjectModal()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-4"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create Project
                </Button>
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const readingSections = proj.sections?.filter((s) => s.content_type === 'reading') || [];
                const checklistSections = proj.sections?.filter((s) => s.content_type === 'checklist') || [];
                const quizSections = proj.sections?.filter((s) => s.content_type === 'quiz') || [];
                const isSubProject = Boolean(proj.parent_project_id);

                return (
                  <Card
                    key={proj.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 hover:border-emerald-500/50 hover:shadow-md transition bg-card overflow-hidden group"
                  >
                    <div className="h-0.5 bg-gradient-to-r from-emerald-500/60 via-sky-500/60 to-emerald-500/60 w-full" />
                    <CardHeader className="p-4 pb-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono tracking-wider max-w-[200px] truncate">
                          {proj.categoryTitle}
                        </Badge>
                        {isSubProject && (
                          <Badge variant="secondary" className="text-[10px] text-amber-500 bg-amber-500/10">
                            Sub-Project
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-base font-bold text-foreground leading-snug group-hover:text-emerald-500 transition line-clamp-1">
                        {proj.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                        {proj.description || 'No description provided.'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-2 space-y-3">
                      {/* Section Indicators */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-400" />
                          {proj.sections?.length || 0} Sections
                        </span>
                        {readingSections.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {readingSections.length} Reading
                          </span>
                        )}
                        {checklistSections.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <ListChecks className="w-3 h-3" />
                            {checklistSections.length} Checklist
                          </span>
                        )}
                        {quizSections.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {quizSections.length} Quiz
                          </span>
                        )}
                      </div>

                      {/* Allowed Roles */}
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {proj.permissions?.slice(0, 3).map((r) => (
                          <span
                            key={r}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground border"
                          >
                            <Shield className="w-2.5 h-2.5 inline mr-0.5 opacity-60" />
                            {r}
                          </span>
                        ))}
                        {(proj.permissions?.length || 0) > 3 && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            +{(proj.permissions?.length || 0) - 3}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProjectId(proj.id);
                            setViewMode('editor');
                            setEditorTab('sections');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 flex-1 gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit & Manage</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewRunner(proj)}
                          className="text-xs h-8 px-2.5"
                          title="Preview in Runner"
                        >
                          <Play className="w-3 h-3 fill-current text-emerald-500" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDuplicateProject(proj, e)}
                          className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                          title="Duplicate project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(proj);
                          }}
                          className="text-xs h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW MODE: FOCUSED PROJECT STUDIO / EDITOR                             */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && currentProject && (
        <div className="space-y-6">
          {/* Top Editor Action Bar */}
          <div className="p-4 bg-card rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode('list')}
                className="text-xs h-8 px-3 gap-1 hover:border-emerald-500/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Projects</span>
              </Button>

              <div className="h-4 w-px bg-border hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground truncate max-w-sm sm:max-w-md">
                    {currentProject.title}
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {currentCategory?.title || 'Curriculum'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {currentProject.description || 'Configuring learning pipeline and verification steps.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Quick Project Switcher */}
              <Select
                value={currentProject.id}
                onValueChange={(val) => setSelectedProjectId(val)}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs bg-background">
                  <SelectValue placeholder="Switch Project" />
                </SelectTrigger>
                <SelectContent>
                  {allProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHistoryModal(true)}
                className="text-xs h-8 px-2.5"
                title="Revision history and rollback"
              >
                <History className="w-3 h-3 mr-1 text-amber-400" />
                History ({currentProject.history?.length || 0})
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportProjectJson(currentProject)}
                className="text-xs h-8 px-2.5"
                title="Export JSON manifest"
              >
                <Download className="w-3 h-3 mr-1 text-sky-400" />
                Export
              </Button>

              <Button
                size="sm"
                onClick={() => handlePreviewRunner(currentProject)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3"
              >
                <Play className="w-3 h-3 mr-1 fill-current" />
                Preview Runner
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setProjectToDelete(currentProject)}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs h-8 px-2"
                title="Delete project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Editor Tabs Navigation */}
          <div className="flex items-center border-b border-border gap-2">
            <button
              onClick={() => setEditorTab('sections')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                editorTab === 'sections'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Learning Tasks & Pipeline ({currentProject.sections?.length || 0})</span>
            </button>
            <button
              onClick={() => setEditorTab('settings')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                editorTab === 'settings'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Project Details & Access</span>
            </button>
            <button
              onClick={() => setEditorTab('subprojects')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                editorTab === 'subprojects'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Sub-Projects ({currentProject.sub_projects?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: SECTIONS & PIPELINE */}
          {editorTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    Sequential Execution Pipeline
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Items are presented to learners in top-to-bottom order. Use up/down arrows to re-sequence.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={handleOpenAddSection}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Learning Section
                </Button>
              </div>

              {/* Sections list */}
              <div className="space-y-2.5">
                {(currentProject.sections || []).length === 0 ? (
                  <div className="p-8 text-center bg-card border border-dashed rounded-2xl space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-muted-foreground/30" />
                    <div className="text-sm font-semibold text-foreground">No Learning Sections Yet</div>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Add a reading documentation brief, an environment checklist, or a practical quiz question section.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleOpenAddSection}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Section
                    </Button>
                  </div>
                ) : (
                  currentProject.sections.map((sec, idx) => {
                    const isReading = sec.content_type === 'reading';
                    const isChecklist = sec.content_type === 'checklist';
                    const isQuiz = sec.content_type === 'quiz';

                    return (
                      <div
                        key={sec.id}
                        className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/50 hover:shadow-xs transition flex items-center justify-between gap-3 group"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => handleOpenEditSection(sec)}
                        >
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{sec.title}</span>
                              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                                {sec.content_type}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                              {isReading && (
                                <>
                                  <span className="flex items-center gap-1 text-sky-400">
                                    <FileText className="w-3 h-3" />
                                    {sec.reading_content ? `${sec.reading_content.slice(0, 50)}...` : 'Reading documentation'}
                                  </span>
                                  {sec.video_url && (
                                    <span className="flex items-center gap-1 text-rose-400">
                                      <Video className="w-3 h-3" /> Video Linked
                                    </span>
                                  )}
                                </>
                              )}
                              {isChecklist && (
                                <span className="flex items-center gap-1 text-emerald-400">
                                  <ListChecks className="w-3 h-3" />
                                  {sec.checklist?.length || 0} checklist items
                                </span>
                              )}
                              {isQuiz && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <Sparkles className="w-3 h-3" />
                                  {sec.questions?.length || 0} quiz questions
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMoveSectionPosition(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 transition"
                            title="Move section up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveSectionPosition(idx, 'down')}
                            disabled={idx === currentProject.sections.length - 1}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 transition"
                            title="Move section down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditSection(sec)}
                            className="text-xs h-7 px-2.5 ml-1"
                          >
                            <Pencil className="w-3 h-3 mr-1 text-emerald-500" />
                            Configure
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSectionToDelete({ id: sec.id, title: sec.title })}
                            className="text-xs h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                            title="Delete section"
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
          )}

          {/* TAB 2: PROJECT DETAILS & ACCESS SETTINGS */}
          {editorTab === 'settings' && (
            <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Project Title</label>
                <Input
                  value={currentProject.title}
                  onChange={(e) => {
                    updateProjectInCategories({ ...currentProject, title: e.target.value });
                  }}
                  className="text-sm"
                  placeholder="e.g. Core Engineering Onboarding & Security"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Curriculum Track / Category</label>
                <Select
                  value={currentProject.category_id}
                  onValueChange={(val) => {
                    // Move project to target category
                    const updatedCategories = categories.map((cat) => {
                      if (cat.id === currentProject.category_id) {
                        return {
                          ...cat,
                          projects: cat.projects.filter((p) => p.id !== currentProject.id),
                        };
                      }
                      if (cat.id === val) {
                        return {
                          ...cat,
                          projects: [...cat.projects, { ...currentProject, category_id: val }],
                        };
                      }
                      return cat;
                    });
                    persistCategories(updatedCategories);
                    setSelectedCategoryId(val);
                    toast.success('Project track updated');
                  }}
                >
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue placeholder="Select Track" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description & Objectives</label>
                <Textarea
                  value={currentProject.description}
                  onChange={(e) => {
                    updateProjectInCategories({ ...currentProject, description: e.target.value });
                  }}
                  rows={3}
                  className="text-xs"
                  placeholder="Outline expectations, prerequisite knowledge, and milestones..."
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground block">Allowed Access Roles</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = (currentProject.permissions || ['all']).includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleProjectRole(role.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
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

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="text-xs font-mono text-muted-foreground">
                  Split SQLite: <span className="text-emerald-500 font-bold">{currentProject.id}.sqlite</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => toast.success('Project settings saved')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: SUB-PROJECTS */}
          {editorTab === 'subprojects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-500" />
                    Recursive Sub-Projects ({currentProject.sub_projects?.length || 0})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sub-projects represent modular prerequisites or specialized deep-dive tracks linked to this parent project.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddSubProject(!showAddSubProject)}
                  className="text-xs h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Sub-Project
                </Button>
              </div>

              {showAddSubProject && (
                <div className="p-4 rounded-2xl bg-card border border-emerald-500/40 flex items-center gap-3 animate-in fade-in">
                  <Input
                    placeholder="Sub-project title (e.g. Advanced Escalation Protocol)..."
                    value={newSubProjectTitle}
                    onChange={(e) => setNewSubProjectTitle(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSubProject}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs whitespace-nowrap"
                  >
                    Create Sub-Project
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddSubProject(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {(currentProject.sub_projects || []).length === 0 ? (
                  <div className="p-8 text-center bg-card border border-dashed rounded-2xl space-y-2">
                    <GitBranch className="w-8 h-8 mx-auto text-muted-foreground/30" />
                    <div className="text-sm font-semibold text-foreground">No Sub-Projects Configured</div>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Sub-projects allow branching into specialized sub-modules with independent pipelines.
                    </p>
                  </div>
                ) : (
                  currentProject.sub_projects?.map((subProj) => (
                    <div
                      key={subProj.id}
                      className="p-3.5 rounded-2xl bg-card border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-foreground block">{subProj.title}</span>
                          <span className="text-xs text-muted-foreground">{subProj.sections?.length || 0} sections configured</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProjectId(subProj.id)}
                          className="text-xs h-7"
                        >
                          Inspect & Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updatedSub = (currentProject.sub_projects || []).filter((s) => s.id !== subProj.id);
                            updateProjectInCategories({ ...currentProject, sub_projects: updatedSub });
                            toast.success('Sub-project removed');
                          }}
                          className="text-xs h-7 px-2 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW MODE: CLASSIC HIERARCHY TREE VIEW                                 */}
      {/* ========================================================================= */}
      {viewMode === 'tree' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Categories and Projects Tree */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-card border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Curriculum Tracks & Categories
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsManageCategoriesOpen(true)}
                  className="text-xs h-7 text-emerald-500 hover:text-emerald-400"
                >
                  <Plus className="w-3 h-3 mr-1" /> New Track
                </Button>
              </div>

              <div className="space-y-3">
                {categories.map((cat) => {
                  const isCatSelected = currentCategory?.id === cat.id;

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
                          setSelectedCategoryId(cat.id);
                          const firstProj = cat.projects.length > 0 ? cat.projects[0] : null;
                          if (firstProj) {
                            setSelectedProjectId(firstProj.id);
                          }
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
                        </div>
                      </div>

                      {/* Sub-projects list */}
                      {isCatSelected && (
                        <div className="pl-6 space-y-1 border-l-2 ml-4 py-1" style={{ borderColor: `${config.primaryColor}30` }}>
                          {cat.projects.length === 0 ? (
                            <div className="text-xs text-muted-foreground italic py-1 pl-1">
                              No projects yet.
                            </div>
                          ) : (
                            cat.projects.map((proj) => {
                              const isProjSelected = currentProject?.id === proj.id;
                              const hasSubProjects = Boolean(proj.sub_projects && proj.sub_projects.length > 0);

                              return (
                                <div key={proj.id} className="space-y-1">
                                  <button
                                    onClick={() => setSelectedProjectId(proj.id)}
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

                                  {hasSubProjects && (
                                    <div className="pl-4 space-y-1 border-l ml-3" style={{ borderColor: `${config.primaryColor}20` }}>
                                      {proj.sub_projects?.map((subProj) => {
                                        const isSubSelected = currentProject?.id === subProj.id;

                                        return (
                                          <button
                                            key={subProj.id}
                                            onClick={() => setSelectedProjectId(subProj.id)}
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

          {/* Right Column: Project Summary & Pipeline Quick Action */}
          <div className="md:col-span-7 space-y-4">
            {currentProject ? (
              <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <Badge className={`${config.badgeClass} font-mono text-xs mb-1`}>
                      Split DB: {currentProject.id}.sqlite
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground">{currentProject.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">{currentProject.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setViewMode('editor');
                        setEditorTab('sections');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Open in Studio
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewRunner(currentProject)}
                      className="text-xs"
                    >
                      <Play className="w-3 h-3 mr-1 fill-current text-emerald-500" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border text-xs space-y-2">
                  <div className="font-semibold text-foreground">Pipeline Execution Sequence:</div>
                  <div className="space-y-1">
                    {currentProject.sections?.map((s, idx) => (
                      <div key={s.id} className="p-2 rounded bg-background border flex items-center justify-between">
                        <span className="font-medium text-foreground">{idx + 1}. {s.title}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">{s.content_type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground bg-muted/20 border rounded-2xl space-y-3">
                <FolderTree className="w-10 h-10 mx-auto opacity-30" style={{ color: config.primaryColor }} />
                <div className="text-sm font-semibold text-foreground">No Project Selected</div>
                <p className="text-xs max-w-sm mx-auto">
                  Select a project from the curriculum tree on the left, or create a new project.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & DIALOGS                                                       */}
      {/* ========================================================================= */}

      {/* CREATE PROJECT MODAL */}
      <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <DialogContent className="max-w-xl rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              Create New Curriculum Project
            </DialogTitle>
            <DialogDescription className="text-xs">
              Establish a new learning and assessment project with configured sections, roles, and starter template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCreateProject} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Title *</label>
              <Input
                value={newProjectTitle}
                onChange={(e) => {
                  setNewProjectTitle(e.target.value);
                  if (!newProjectSlug || newProjectSlug.startsWith('proj_')) {
                    setNewProjectSlug(`proj_${e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}`);
                  }
                }}
                placeholder="e.g. Frontend Engineering Principles & Security"
                className="text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Track / Category</label>
                <Select
                  value={newProjectCategoryId}
                  onValueChange={setNewProjectCategoryId}
                >
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Create New Track...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Unique ID / Slug</label>
                <Input
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value)}
                  placeholder="proj_unique_key"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {newProjectCategoryId === '__new__' && (
              <div className="p-3 bg-muted/60 border border-emerald-500/40 rounded-xl space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-foreground">New Track Name</label>
                <Input
                  value={newProjectNewCategoryTitle}
                  onChange={(e) => setNewProjectNewCategoryTitle(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure, Sales Onboarding..."
                  className="text-xs bg-background"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Description</label>
              <Textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Objectives and requirements for learners..."
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Starter Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">Starter Template</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewProjectTemplate('full')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    newProjectTemplate === 'full'
                      ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-foreground">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    Full Curriculum
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Reading + Checklist + Quiz</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewProjectTemplate('quiz')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    newProjectTemplate === 'quiz'
                      ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Technical Assessment
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Reading Brief + Scored Quiz</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewProjectTemplate('checklist')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    newProjectTemplate === 'checklist'
                      ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-foreground">
                    <ListChecks className="w-3.5 h-3.5 text-sky-400" />
                    Setup Checklist
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Guide + Verification Items</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewProjectTemplate('blank')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    newProjectTemplate === 'blank'
                      ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-foreground">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Blank Project
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Clean canvas (1 Intro section)</div>
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateProjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
                Create & Configure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      <Dialog open={Boolean(projectToDelete)} onOpenChange={(open) => { if (!open) setProjectToDelete(null); }}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              Delete Curriculum Project
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong className="text-foreground">{projectToDelete?.title}</strong>? All learning sections and linked sub-projects will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={() => setProjectToDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteProject}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      <Dialog open={Boolean(categoryToDelete)} onOpenChange={(open) => { if (!open) setCategoryToDelete(null); }}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              Delete Curriculum Track
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete track <strong className="text-foreground">{categoryToDelete?.title}</strong> and all {categoryToDelete?.projects?.length || 0} projects within it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteCategory}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
            >
              Delete Track
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE SECTION CONFIRMATION MODAL */}
      <Dialog open={Boolean(sectionToDelete)} onOpenChange={(open) => { if (!open) setSectionToDelete(null); }}>
        <DialogContent className="max-w-sm rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <Trash2 className="w-4 h-4" />
              Delete Learning Section
            </DialogTitle>
            <DialogDescription className="text-xs">
              Delete section <strong className="text-foreground">{sectionToDelete?.title}</strong> from this project pipeline?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={() => setSectionToDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteSection}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RESET DEFAULTS CONFIRMATION MODAL */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-500">
              <RefreshCw className="w-5 h-5" />
              Reset Curriculum to Factory Defaults
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will restore all default categories, onboarding security projects, and standard quizzes. Any custom modifications will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmResetDefaults}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
            >
              Reset Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANAGE TRACKS / CATEGORIES MODAL */}
      <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
        <DialogContent className="max-w-lg rounded-3xl border shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-500" />
              Manage Curriculum Tracks & Categories
            </DialogTitle>
            <DialogDescription className="text-xs">
              Organize high-level learning domains, departments, or role pathways.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Quick add track */}
            <div className="p-3 rounded-2xl bg-muted/40 border flex items-center gap-2">
              <Input
                placeholder="New track name (e.g. Sales Onboarding, DevOps Protocols)..."
                value={quickAddCatTitle}
                onChange={(e) => setQuickAddCatTitle(e.target.value)}
                className="text-xs bg-background"
              />
              <Button
                size="sm"
                onClick={handleQuickAddCategory}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs whitespace-nowrap"
              >
                Add Track
              </Button>
            </div>

            {/* List of categories */}
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-card border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderTree className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{cat.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{cat.projects.length} projects</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditCategory(cat)}
                      className="text-xs h-7 px-2"
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Rename
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCategoryToDelete(cat)}
                      className="text-xs h-7 px-2 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RENAME CATEGORY MODAL */}
      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => { if (!open) setEditingCategory(null); }}>
        <DialogContent className="max-w-md rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="w-4 h-4 text-emerald-500" />
              Edit Track Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Track Name</label>
              <Input
                value={editCatTitle}
                onChange={(e) => setEditCatTitle(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Textarea
                value={editCatDescription}
                onChange={(e) => setEditCatDescription(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEditCategory} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* COMPREHENSIVE SECTION CONFIGURATION MODAL */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              {isCreatingSection ? 'Add Learning Section' : 'Configure Learning Section'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure content for this section: Reading documentation, verification checklists, or practical quizzes.
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

            {/* Reading Content */}
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
                    placeholder="Provide standard operating procedures, documentation, instructions..."
                    rows={6}
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Checklist Content */}
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

            {/* Quiz Questions */}
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
                      No questions yet. Click "+ Add Question" to add a question.
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
                              className="text-emerald-500 hover:underline flex items-center gap-0.5"
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

      {/* JSON IMPORT MODAL */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-lg rounded-3xl border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileJson className="w-5 h-5 text-sky-400" />
              Import Project from JSON
            </DialogTitle>
            <DialogDescription className="text-xs">
              Paste a valid project JSON manifest to import into the curriculum.
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

      {/* REVISIONS HISTORY MODAL */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Project Revisions & Rollback
            </DialogTitle>
            <DialogDescription className="text-xs">
              Each change is tracked in an isolated SQLite database (<code className="text-emerald-500">{currentProject?.id}_history.sqlite</code>).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {currentProject?.history?.map((hist) => (
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  Clock,
  Sparkles,
  Building2,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  getJobRoles,
  saveJobRole,
  deleteJobRole,
  JobRole,
  AssessmentQuizQuestion,
} from '@/lib/role-assignments';

interface JobRolesManagerProps {
  onNavigateTab?: (tab: string) => void;
}

export const JobRolesManager: React.FC<JobRolesManagerProps> = ({ onNavigateTab }) => {
  const navigate = useNavigate();

  // Master roles list synced with storage
  const [rolesList, setRolesList] = useState<JobRole[]>(() => getJobRoles());

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'roles' | 'mcqs'>('roles');

  // Role creation modal/view state
  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleDept, setNewRoleDept] = useState('Engineering');
  const [newRoleType, setNewRoleType] = useState('Full-Time');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Assessment MCQ Editor State
  const [selectedRoleForMcq, setSelectedRoleForMcq] = useState<string>('frontend-developer');
  const [isEditingMcq, setIsEditingMcq] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [mcqQuestionText, setMcqQuestionText] = useState<string>('');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '', '', '']);
  const [mcqCorrectAnswerIndex, setMcqCorrectAnswerIndex] = useState<number>(0);
  const [mcqExplanation, setMcqExplanation] = useState<string>('');

  useEffect(() => {
    const handleRolesUpdate = () => {
      setRolesList(getJobRoles());
    };

    window.addEventListener('wp_exam_roles_updated', handleRolesUpdate);

    return () => {
      window.removeEventListener('wp_exam_roles_updated', handleRolesUpdate);
    };
  }, []);

  const handleBackToPipeline = () => {
    if (onNavigateTab) {
      onNavigateTab('pipeline');
      return;
    }

    navigate('/admin/pipeline');
  };

  const resetMcqForm = () => {
    setIsEditingMcq(false);
    setEditingQuestionId(null);
    setMcqQuestionText('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrectAnswerIndex(0);
    setMcqExplanation('');
  };

  const handleStartAddMcq = () => {
    resetMcqForm();
    setIsEditingMcq(true);
  };

  const handleStartEditMcq = (question: AssessmentQuizQuestion) => {
    setEditingQuestionId(question.id);
    setMcqQuestionText(question.question);
    setMcqOptions([...question.options]);

    const correctIdx = question.options.findIndex((opt) => opt === question.correctAnswer);
    const hasValidIdx = correctIdx >= 0;

    if (hasValidIdx) {
      setMcqCorrectAnswerIndex(correctIdx);
    } else {
      setMcqCorrectAnswerIndex(0);
    }

    setMcqExplanation(question.explanation || '');
    setIsEditingMcq(true);
  };

  const handleAddOption = () => {
    setMcqOptions([...mcqOptions, '']);
  };

  const handleRemoveOption = (index: number) => {
    const hasRemainingCapacity = mcqOptions.length > 2;

    if (!hasRemainingCapacity) {
      toast.error('An assessment question must have at least 2 options');
      return;
    }

    const updated = mcqOptions.filter((_, idx) => idx !== index);
    setMcqOptions(updated);

    const isCurrentCorrectRemoved = mcqCorrectAnswerIndex === index;

    if (isCurrentCorrectRemoved) {
      setMcqCorrectAnswerIndex(0);
    } else {
      const isShiftNeeded = mcqCorrectAnswerIndex > index;

      if (isShiftNeeded) {
        setMcqCorrectAnswerIndex(mcqCorrectAnswerIndex - 1);
      }
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...mcqOptions];
    updated[index] = val;
    setMcqOptions(updated);
  };

  const handleSaveMcq = () => {
    const cleanQuestion = mcqQuestionText.trim();
    const hasCleanQuestion = cleanQuestion.length > 0;

    if (!hasCleanQuestion) {
      toast.error('Question prompt is required');
      return;
    }

    const cleanOptions = mcqOptions.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    const hasEnoughOptions = cleanOptions.length >= 2;

    if (!hasEnoughOptions) {
      toast.error('Please provide at least 2 non-empty options');
      return;
    }

    const targetRole = rolesList.find((r) => r.id === selectedRoleForMcq);
    const hasTargetRole = Boolean(targetRole);

    if (!hasTargetRole) {
      toast.error('Selected job role not found');
      return;
    }

    const role = targetRole!;
    const correctVal = cleanOptions[mcqCorrectAnswerIndex] || cleanOptions[0];
    const existingQuestions = [...role.secondPhaseQuestions];
    const isExisting = Boolean(editingQuestionId);

    if (isExisting) {
      const idx = existingQuestions.findIndex((q) => q.id === editingQuestionId);
      const isFound = idx >= 0;

      if (isFound) {
        existingQuestions[idx] = {
          ...existingQuestions[idx],
          question: cleanQuestion,
          options: cleanOptions,
          correctAnswer: correctVal,
          explanation: mcqExplanation.trim() || `Technical competency evaluation for ${role.title}.`,
        };
      }
    } else {
      existingQuestions.push({
        id: `${role.id}_q_${Date.now()}`,
        question: cleanQuestion,
        options: cleanOptions,
        correctAnswer: correctVal,
        explanation: mcqExplanation.trim() || `Technical competency evaluation for ${role.title}.`,
      });
    }

    const updatedRole: JobRole = {
      ...role,
      secondPhaseQuestions: existingQuestions,
      isCustom: true,
    };

    saveJobRole(updatedRole);
    setRolesList(getJobRoles());
    toast.success(isExisting ? 'Assessment question updated!' : 'New assessment question added!');
    resetMcqForm();
  };

  const handleDeleteMcq = (questionId: string) => {
    const targetRole = rolesList.find((r) => r.id === selectedRoleForMcq);
    const hasTargetRole = Boolean(targetRole);

    if (!hasTargetRole) {
      return;
    }

    const role = targetRole!;
    const remaining = role.secondPhaseQuestions.filter((q) => q.id !== questionId);
    const hasQuestionsLeft = remaining.length > 0;

    if (!hasQuestionsLeft) {
      toast.error('An assessment must contain at least 1 question');
      return;
    }

    const updatedRole: JobRole = {
      ...role,
      secondPhaseQuestions: remaining,
      isCustom: true,
    };

    saveJobRole(updatedRole);
    setRolesList(getJobRoles());
    toast.success('Question deleted');
  };

  const handleSaveNewRole = () => {
    const cleanTitle = newRoleTitle.trim();
    const hasCleanTitle = cleanTitle.length > 0;

    if (!hasCleanTitle) {
      toast.error('Role Title is required');
      return;
    }

    const roleSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isConflict = rolesList.some((r) => r.id === roleSlug);

    if (isConflict) {
      toast.error('A role with this title or identifier already exists');
      return;
    }

    const defaultAssessmentQuestions: AssessmentQuizQuestion[] = [
      {
        id: `${roleSlug}_q1`,
        question: `What is the primary technical competency required for ${cleanTitle}?`,
        options: [
          'Demonstrated domain proficiency and clean code practices',
          'Unverified implementation shortcuts',
          'Bypassing automated test verification',
        ],
        correctAnswer: 'Demonstrated domain proficiency and clean code practices',
        explanation: `Foundational domain competency evaluation for ${cleanTitle}.`,
      },
    ];

    const createdRole: JobRole = {
      id: roleSlug,
      title: cleanTitle,
      department: newRoleDept.trim() || 'Engineering',
      type: newRoleType,
      description: newRoleDesc.trim() || `Technical evaluation track for ${cleanTitle}.`,
      isCustom: true,
      firstPhaseQuestion: {
        question: `Technical screening for ${cleanTitle}`,
        hint: 'Review core domain fundamentals.',
        briefingNotes: [`Role competency verification for ${cleanTitle}.`],
        options: [
          { val: 'opt_1', label: 'Domain Proficiency' },
          { val: 'opt_2', label: 'General Knowledge' },
        ],
        correctAnswer: 'opt_1',
      },
      secondPhaseQuestions: defaultAssessmentQuestions,
    };

    saveJobRole(createdRole);
    setRolesList(getJobRoles());
    toast.success(`Job Role "${cleanTitle}" successfully created!`);
    setIsAddingNewRole(false);
    setNewRoleTitle('');
    setNewRoleDesc('');

    // Switch to MCQ Editor tab for this role so user can add/edit questions immediately
    setSelectedRoleForMcq(roleSlug);
    setActiveTab('mcqs');
  };

  const handleDeleteRole = (roleId: string, title: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the custom role "${title}"?`);

    if (isConfirmed) {
      deleteJobRole(roleId);
      setRolesList(getJobRoles());
      toast.success(`Role "${title}" deleted`);

      const isCurrentSelected = selectedRoleForMcq === roleId;

      if (isCurrentSelected) {
        const availableRoles = getJobRoles();
        const hasRoles = availableRoles.length > 0;

        if (hasRoles) {
          setSelectedRoleForMcq(availableRoles[0].id);
        }
      }
    }
  };

  const selectedRole = rolesList.find((r) => r.id === selectedRoleForMcq);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 font-sans">
      {/* Hairline Chrome Accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent shadow-md" />

      {/* Header Canvas */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToPipeline}
                  className="h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                </Button>
                <span className="text-muted-foreground/40">/</span>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Job Roles & Technical Assessments
                  </h1>
                </div>
                <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary hidden sm:inline-flex">
                  {rolesList.length} Positions
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground ml-0 sm:ml-9">
                Manage position profiles, technical competency tracks, and role-specific assessment MCQs.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'roles' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('roles')}
                className="h-9 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Job Openings ({rolesList.length})</span>
              </Button>
              <Button
                variant={activeTab === 'mcqs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('mcqs')}
                className="h-9 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Assessment MCQ Editor</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Job Openings & Roles Management */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/60 shadow-2xs">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Active Job Openings
                </h2>
                <p className="text-xs text-muted-foreground">
                  Each opening specifies candidate requirements and links directly to a dedicated technical evaluation.
                </p>
              </div>

              <Button
                size="sm"
                variant={isAddingNewRole ? 'secondary' : 'default'}
                onClick={() => setIsAddingNewRole(!isAddingNewRole)}
                className="h-9 text-xs gap-1.5 font-semibold cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNewRole ? 'View All Openings' : 'Add New Role'}</span>
              </Button>
            </div>

            {/* Form to Add New Job Role */}
            {isAddingNewRole && (
              <Card className="border-2 border-primary/30 shadow-md">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-bold">Create New Job Opening</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Define the position details. Once created, you will be redirected to setup its technical evaluation questions.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Role Title *</label>
                      <Input
                        placeholder="e.g. Senior Backend Systems Engineer"
                        value={newRoleTitle}
                        onChange={(e) => setNewRoleTitle(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Department *</label>
                      <Input
                        placeholder="e.g. Platform Engineering"
                        value={newRoleDept}
                        onChange={(e) => setNewRoleDept(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Employment Type</label>
                      <select
                        value={newRoleType}
                        onChange={(e) => setNewRoleType(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs text-foreground font-medium"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Role Description</label>
                      <Input
                        placeholder="Summary of responsibilities and technical expectations..."
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-border/40">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingNewRole(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNewRole} className="bg-primary text-primary-foreground font-semibold">
                      Create Role & Setup Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grid of Existing Roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rolesList.map((role) => (
                <div
                  key={role.id}
                  className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-foreground leading-snug">{role.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                            {role.department}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {role.type}
                          </Badge>
                          {role.isCustom && (
                            <Badge variant="default" className="text-[10px] bg-emerald-600 text-white">
                              Custom Role
                            </Badge>
                          )}
                        </div>
                      </div>

                      {role.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id, role.title)}
                          className="text-xs text-destructive hover:bg-destructive/10 h-7 w-7 p-0 cursor-pointer"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {role.secondPhaseQuestions.length} MCQ{role.secondPhaseQuestions.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRoleForMcq(role.id);
                        setActiveTab('mcqs');
                        resetMcqForm();
                      }}
                      className="h-8 text-xs gap-1.5 cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <span>Manage MCQs</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Technical Assessment MCQ Editor */}
        {activeTab === 'mcqs' && (
          <div className="space-y-6">
            {/* Role Switcher Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">
                    Technical Assessment MCQs
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Questions configured here are administered in the 10-minute proctored exam for this role.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Role:</span>
                  <select
                    value={selectedRoleForMcq}
                    onChange={(e) => {
                      setSelectedRoleForMcq(e.target.value);
                      resetMcqForm();
                    }}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs font-medium max-w-[260px] truncate"
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.secondPhaseQuestions.length} MCQs)
                      </option>
                    ))}
                  </select>
                </div>

                {!isEditingMcq && (
                  <Button
                    size="sm"
                    onClick={handleStartAddMcq}
                    className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add MCQ</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Assessment Details Alert Banner */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground">
                  <strong>Active Assessment:</strong> {selectedRole?.title} — {selectedRole?.secondPhaseQuestions.length || 0} Questions configured
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>10-Minute Proctored Delivery with Tab Switch Sentinel</span>
              </div>
            </div>

            {/* Authoring & Editing Form */}
            {isEditingMcq && (
              <Card className="border-2 border-primary/40 shadow-lg">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm font-bold">
                        {editingQuestionId ? 'Edit Assessment Question' : 'Author New MCQ Question'}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {editingQuestionId ? 'Editing' : 'New Question'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Define the question prompt, answer choices, and mark the correct option.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  {/* Question Prompt */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground block">
                      Question Prompt / Statement *
                    </label>
                    <Input
                      placeholder="e.g. Which WordPress action hook is the canonical location for registering custom REST routes?"
                      value={mcqQuestionText}
                      onChange={(e) => setMcqQuestionText(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  {/* Options List with Radio Button for Correct Answer */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground block">
                        Answer Choices & Correct Selection *
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Select the radio button next to the correct answer
                      </span>
                    </div>

                    <div className="space-y-2">
                      {mcqOptions.map((option, idx) => {
                        const isCorrect = mcqCorrectAnswerIndex === idx;

                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                              isCorrect
                                ? 'border-emerald-500/70 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                                : 'border-border/60 bg-muted/20'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer shrink-0 px-1">
                              <input
                                type="radio"
                                name="jobRolesMcqCorrectRadio"
                                checked={isCorrect}
                                onChange={() => setMcqCorrectAnswerIndex(idx)}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span
                                className={`text-[11px] font-semibold ${
                                  isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                                }`}
                              >
                                {isCorrect ? 'Correct Answer' : `Option ${idx + 1}`}
                              </span>
                            </label>

                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              placeholder={`Option text ${idx + 1}...`}
                              className="h-8 text-xs flex-1"
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(idx)}
                              disabled={mcqOptions.length <= 2}
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
                      onClick={handleAddOption}
                      className="h-8 text-xs gap-1.5 cursor-pointer mt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </Button>
                  </div>

                  {/* Explanation / Rationale */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground block">
                      Explanation / Learning Feedback (Optional)
                    </label>
                    <Input
                      placeholder="e.g. rest_api_init ensures endpoint routes are registered during the REST request lifecycle."
                      value={mcqExplanation}
                      onChange={(e) => setMcqExplanation(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-border/50">
                    <Button variant="outline" size="sm" onClick={resetMcqForm}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveMcq}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingQuestionId ? 'Update Question' : 'Save Question'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configured Questions List */}
            {(() => {
              const questions = selectedRole?.secondPhaseQuestions || [];
              const hasQuestions = questions.length > 0;

              if (!hasQuestions) {
                return (
                  <div className="p-12 text-center rounded-xl border-2 border-dashed border-border/70 text-muted-foreground space-y-3">
                    <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-sm">No assessment questions configured for this role</p>
                      <p className="text-xs">Add technical evaluation questions to assess applicants for {selectedRole?.title}.</p>
                    </div>
                    <Button size="sm" onClick={handleStartAddMcq} className="text-xs gap-1.5 mt-2">
                      <Plus className="w-3.5 h-3.5" />
                      Add First Question
                    </Button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="font-medium text-foreground">
                      Configured Questions ({questions.length})
                    </span>
                    <span>All questions presented sequentially during exam</span>
                  </div>

                  {questions.map((q, qIdx) => (
                    <Card key={q.id || qIdx} className="border border-border/70 bg-card shadow-2xs">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[10px] bg-muted/40">
                                Q{qIdx + 1}
                              </Badge>
                              <span className="font-semibold text-foreground text-xs leading-snug">
                                {q.question}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditMcq(q)}
                              className="h-7 text-xs px-2.5 text-primary hover:bg-primary/10 cursor-pointer"
                              title="Edit Question"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMcq(q.id)}
                              disabled={questions.length <= 1}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = opt === q.correctAnswer;

                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 border ${
                                  isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-medium'
                                    : 'bg-muted/20 border-border/40 text-muted-foreground'
                                }`}
                              >
                                <span className="truncate">{opt}</span>
                                {isCorrect && (
                                  <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] py-0 px-1.5 font-semibold">
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <p className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/30 italic">
                            💡 {q.explanation}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};

export default JobRolesManager;

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
  Volume2,
  Image as ImageIcon,
  Video,
  FileEdit,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { JobAssessmentBuilder } from './job-assessment-builder';
import {
  getJobRoles,
  saveJobRole,
  deleteJobRole,
  persistJobRoleToServer,
  deleteJobRoleFromServer,
  syncJobRolesFromServer,
  JobRole,
  AssessmentQuizQuestion,
  AssessmentQuestionType,
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
  const [newRoleDuration, setNewRoleDuration] = useState<number>(30);
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Assessment Question Editor Selected Role
  const [selectedRoleForMcq, setSelectedRoleForMcq] = useState<string>('frontend-developer');

  useEffect(() => {
    syncJobRolesFromServer().then((synced) => {
      setRolesList(synced);
    });

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
      durationMinutes: newRoleDuration || 30,
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

    persistJobRoleToServer(createdRole);
    setRolesList(getJobRoles());
    toast.success(`Job Role "${cleanTitle}" successfully created!`);
    setIsAddingNewRole(false);
    setNewRoleTitle('');
    setNewRoleDesc('');
    setNewRoleDuration(30);

    // Switch to MCQ Editor tab for this role so user can add/edit questions immediately
    setSelectedRoleForMcq(roleSlug);
    setActiveTab('mcqs');
  };

  const handleUpdateRoleDuration = (roleId: string, duration: number) => {
    const cleanMins = Math.max(5, Math.min(180, duration));
    const targetRole = rolesList.find((r) => r.id === roleId);
    const hasTarget = Boolean(targetRole);

    if (hasTarget) {
      const updatedRole: JobRole = {
        ...targetRole!,
        durationMinutes: cleanMins,
        isCustom: true,
      };

      persistJobRoleToServer(updatedRole);
      setRolesList(getJobRoles());
      toast.success(`Updated exam time limit to ${cleanMins} minutes`);
    }
  };

  const handleDeleteRole = (roleId: string, title: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the custom role "${title}"?`);

    if (isConfirmed) {
      deleteJobRoleFromServer(roleId);
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
                Manage position profiles, technical competency tracks, and role-specific assessment questions.
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
                <span>Assessment Question Editor</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <label className="font-semibold text-foreground">Exam Duration (Minutes)</label>
                      <Input
                        type="number"
                        min={5}
                        max={180}
                        value={newRoleDuration}
                        onChange={(e) => setNewRoleDuration(Number(e.target.value) || 30)}
                        className="text-xs"
                      />
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
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {role.secondPhaseQuestions.length} Question{role.secondPhaseQuestions.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary shrink-0" />
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {role.durationMinutes || 30} mins
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRoleForMcq(role.id);
                        setActiveTab('mcqs');
                      }}
                      className="h-8 text-xs gap-1.5 cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <span>Manage Questions</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Enhanced Technical Assessment Question Builder */}
        {activeTab === 'mcqs' && (
          <JobAssessmentBuilder
            rolesList={rolesList}
            selectedRoleId={selectedRoleForMcq}
            onSelectRole={(roleId) => setSelectedRoleForMcq(roleId)}
            onRolesUpdated={() => setRolesList(getJobRoles())}
          />
        )}
      </main>
    </div>
  );
};

export default JobRolesManager;

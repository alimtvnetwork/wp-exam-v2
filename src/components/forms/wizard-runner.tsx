import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ExternalLink, 
  Save, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Phone, 
  Mail, 
  Briefcase, 
  Play, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Bug, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  FileText,
  Star,
  Calendar,
  Layers,
  Link as LinkIcon,
  CheckSquare,
  Code,
  Globe,
  Building2,
} from 'lucide-react';
import { useTheme, AppThemeType } from '@/lib/theme-context';
import { PhoneWithCountrySelect } from '@/components/ui/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface JobPositionOption {
  id: string;
  title: string;
  department: string;
  type: string;
}

const AVAILABLE_JOB_POSITIONS: JobPositionOption[] = [
  { id: 'intern-programmer', title: 'Intern Programmer', department: 'Engineering', type: 'Internship' },
  { id: 'junior-software-engineer', title: 'Junior Software Engineer', department: 'Engineering', type: 'Full-Time' },
  { id: 'frontend-developer', title: 'Frontend Developer (React / TypeScript)', department: 'Frontend', type: 'Full-Time' },
  { id: 'full-stack-architect', title: 'Full-Stack Web Architect (React & Go)', department: 'Engineering', type: 'Full-Time' },
  { id: 'backend-systems-engineer', title: 'Backend Systems Engineer (Go & SQLite / Cloud)', department: 'Platform', type: 'Full-Time' },
  { id: 'wordpress-specialist', title: 'WordPress & WooCommerce Core Developer', department: 'CMS Engineering', type: 'Full-Time' },
  { id: 'devops-cloud-engineer', title: 'DevOps & Cloud Infrastructure Engineer', department: 'Operations', type: 'Full-Time' },
  { id: 'qa-automation-specialist', title: 'QA & Test Automation Specialist (Vitest & Playwright)', department: 'Quality Assurance', type: 'Full-Time' },
  { id: 'product-uiux-designer', title: 'Senior Product UI/UX Designer', department: 'Product Design', type: 'Full-Time' },
  { id: 'ai-llm-engineer', title: 'AI & LLM Application Systems Engineer', department: 'AI Lab', type: 'Full-Time' },
  { id: 'database-architect', title: 'Database Architect (Split SQLite & Postgres)', department: 'Platform Data', type: 'Full-Time' },
  { id: 'cybersecurity-analyst', title: 'Application Security & Penetration Tester', department: 'Security', type: 'Full-Time' },
  { id: 'mobile-app-developer', title: 'Mobile Application Developer (React Native / iOS)', department: 'Mobile', type: 'Full-Time' },
  { id: 'technical-writer', title: 'Technical Documentation & Spec Engineer', department: 'Content Engineering', type: 'Full-Time' },
  { id: 'solutions-architect', title: 'Enterprise Solutions Architect & Lead', department: 'Engineering Leadership', type: 'Full-Time' },
];

const THEME_OPTIONS: { id: AppThemeType; name: string }[] = [
  { id: 'green-choice', name: 'Green Choice (Emerald Botanical)' },
  { id: 'clean-wide', name: 'Clean Wide White (Indigo & Slate)' },
  { id: 'riseup', name: 'Rise Up Asia (Warm Gold & Navy)' },
  { id: 'dracula', name: 'Antigravity Dracula (Dark Purple)' },
  { id: 'purple', name: 'Purple Theme (Deep Purple & Violet)' },
  { id: 'obsidian', name: 'VS Code Dark (Slate & Cyan)' },
  { id: 'clean', name: 'Clean Light (Enterprise Clean)' },
];

export const WizardRunner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { theme, setTheme } = useTheme();

  // Job Position Selection State
  const [selectedJob, setSelectedJob] = useState<JobPositionOption>(() => {
    const jobParam = searchParams.get('job') || searchParams.get('role');
    if (jobParam) {
      const match = AVAILABLE_JOB_POSITIONS.find(
        (j) => j.id.toLowerCase() === jobParam.toLowerCase() ||
               j.title.toLowerCase().includes(jobParam.toLowerCase())
      );
      if (match) return match;
    }
    return AVAILABLE_JOB_POSITIONS[0];
  });

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [isJobPopoverOpen, setIsJobPopoverOpen] = useState(false);

  // Form State across 9 Steps
  // Step 1: Position & Domain
  const [seniorityLevel, setSeniorityLevel] = useState<string>('Senior');
  const [workCommitment, setWorkCommitment] = useState<string>('Full-Time (40 hrs/wk)');

  // Step 2: Personal & Contact Information
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+880 ');
  const [locationCity, setLocationCity] = useState<string>('Dhaka, Bangladesh');

  // Step 3: Availability & Notice Period
  const [isOpenToWork, setIsOpenToWork] = useState<string>('yes');
  const [noticePeriod, setNoticePeriod] = useState<string>('1 Month');
  const [earliestStartDate, setEarliestStartDate] = useState<string>('Immediately');
  const [workPreference, setWorkPreference] = useState<string>('remote');

  // Step 4: Professional Experience
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('3');
  const [currentCompany, setCurrentCompany] = useState<string>('');
  const [currentRoleTitle, setCurrentRoleTitle] = useState<string>('');
  const [responsibilitiesSummary, setResponsibilitiesSummary] = useState<string>('');

  // Step 5: Portfolios & Engineering Profiles
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [linkedInUrl, setLinkedInUrl] = useState<string>('');
  const [personalWebsiteUrl, setPersonalWebsiteUrl] = useState<string>('');

  // Step 6: Core Technical Stack Self-Assessment
  const [frontendRating, setFrontendRating] = useState<number>(4);
  const [backendRating, setBackendRating] = useState<number>(5);
  const [databaseRating, setDatabaseRating] = useState<number>(4);
  const [devopsRating, setDevopsRating] = useState<number>(3);

  // Step 7: Technical Screening Briefing
  const [hasWatchedVideo, setHasWatchedVideo] = useState<boolean>(false);
  const [isBriefingNotesExpanded, setIsBriefingNotesExpanded] = useState<boolean>(false);
  const [isQuestionHintExpanded, setIsQuestionHintExpanded] = useState<boolean>(false);

  // Step 8: Technical System Design Assessment
  const [selectedMcq, setSelectedMcq] = useState<string>('split-sqlite');
  const [selectedStandards, setSelectedStandards] = useState<string[]>([
    'positive-boolean',
    'result-wrapper',
    'vertical-lines',
  ]);
  const [architectureExplanation, setArchitectureExplanation] = useState<string>('');

  // Step 9: Final Review, Declaration & Terms
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // Debug Mode State
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  // Validation States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftToken, setDraftToken] = useState<string>('');
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Filtered job list for searchable combobox
  const filteredJobs = useMemo(() => {
    if (!jobSearchQuery.trim()) return AVAILABLE_JOB_POSITIONS;
    const q = jobSearchQuery.toLowerCase();
    return AVAILABLE_JOB_POSITIONS.filter(
      (j) => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q) || j.type.toLowerCase().includes(q)
    );
  }, [jobSearchQuery]);

  const handleSelectJob = (job: JobPositionOption) => {
    setSelectedJob(job);
    setIsJobPopoverOpen(false);
    setJobSearchQuery('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('job', job.id);
      return next;
    });
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!selectedJob) {
        errors.selectedJob = 'Please select a target job position.';
      }
    }

    if (currentStep === 2) {
      if (!fullName.trim()) {
        errors.fullName = 'Full legal name is required.';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!emailRegex.test(email)) {
        errors.email = 'Please provide a valid email address.';
      }
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      if (cleanDigits.length < 7) {
        errors.phone = 'Valid phone number with country code is required.';
      }
      if (!locationCity.trim()) {
        errors.locationCity = 'Current city and country of residence is required.';
      }
    }

    if (currentStep === 3) {
      if (isOpenToWork === 'no' && !noticePeriod) {
        errors.noticePeriod = 'Please specify your required notice period.';
      }
    }

    if (currentStep === 4) {
      if (!yearsOfExperience || Number(yearsOfExperience) < 0) {
        errors.yearsOfExperience = 'Years of relevant experience is required.';
      }
    }

    if (currentStep === 5) {
      if (!portfolioUrl.trim()) {
        errors.portfolioUrl = 'GitHub profile URL is mandatory.';
      } else {
        const urlRegex = /^https?:\/\/.+/i;
        if (!urlRegex.test(portfolioUrl.trim())) {
          errors.portfolioUrl = 'GitHub profile URL must begin with http:// or https://';
        }
      }
    }

    if (currentStep === 6) {
      if (frontendRating <= 0 || backendRating <= 0 || databaseRating <= 0) {
        errors.ratings = 'Please rate all required skill domains.';
      }
    }

    if (currentStep === 7) {
      if (!hasWatchedVideo) {
        errors.hasWatchedVideo = 'Please confirm you have watched the technical briefing.';
      }
    }

    if (currentStep === 8) {
      if (!selectedMcq) {
        errors.selectedMcq = 'Please select an architectural pattern.';
      }
    }

    if (currentStep === 9) {
      if (!termsAccepted) {
        errors.termsAccepted = 'You must confirm the legal accuracy declaration to submit.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 9) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please complete all required fields indicated by red asterisks.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ⚡ Test Fill & Next Step QA Automation Engine (All 9 Steps)
  const handleTestFillAndNext = () => {
    if (currentStep === 1) {
      setSeniorityLevel('Senior Fullstack');
      setWorkCommitment('Full-Time (40 hrs/wk)');
      setFormErrors({});
      setCurrentStep(2);
      toast.success('Step 1 auto-filled! Proceeding to Step 2 Contact Details...');
      return;
    }

    if (currentStep === 2) {
      if (!fullName) setFullName('Alexandra Chen');
      if (!email) setEmail('alexandra.chen@tech-org.io');
      if (!phone || phone === '+880 ') setPhone('+880 1712345678');
      if (!locationCity) setLocationCity('Dhaka, Bangladesh');
      setFormErrors({});
      setCurrentStep(3);
      toast.success('Step 2 auto-filled! Proceeding to Step 3 Availability...');
      return;
    }

    if (currentStep === 3) {
      setIsOpenToWork('yes');
      setNoticePeriod('Immediate');
      setEarliestStartDate('Immediately');
      setWorkPreference('remote');
      setFormErrors({});
      setCurrentStep(4);
      toast.success('Step 3 auto-filled! Proceeding to Step 4 Experience...');
      return;
    }

    if (currentStep === 4) {
      setYearsOfExperience('4');
      setCurrentCompany('Global Systems Engineering Lab');
      setCurrentRoleTitle('Senior Software Engineer');
      setResponsibilitiesSummary('Architected split-sqlite multi-tenant microservices, React dashboards, and zero-defect QA pipelines.');
      setFormErrors({});
      setCurrentStep(5);
      toast.success('Step 4 auto-filled! Proceeding to Step 5 Code Portfolios...');
      return;
    }

    if (currentStep === 5) {
      setPortfolioUrl('https://github.com/alexandra-chen-dev');
      setLinkedInUrl('https://linkedin.com/in/alexandra-chen-engineer');
      setPersonalWebsiteUrl('https://alexandra-chen.dev');
      setFormErrors({});
      setCurrentStep(6);
      toast.success('Step 5 auto-filled! Proceeding to Step 6 Technical Self-Rating...');
      return;
    }

    if (currentStep === 6) {
      setFrontendRating(5);
      setBackendRating(5);
      setDatabaseRating(4);
      setDevopsRating(4);
      setFormErrors({});
      setCurrentStep(7);
      toast.success('Step 6 auto-filled! Proceeding to Step 7 Video Briefing...');
      return;
    }

    if (currentStep === 7) {
      setHasWatchedVideo(true);
      setFormErrors({});
      setCurrentStep(8);
      toast.success('Step 7 auto-filled! Proceeding to Step 8 System Design MCQ...');
      return;
    }

    if (currentStep === 8) {
      setSelectedMcq('split-sqlite');
      setSelectedStandards(['positive-boolean', 'result-wrapper', 'vertical-lines']);
      setArchitectureExplanation('Split SQLite architecture provides complete tenant data isolation with zero database locking, fast file copies, and deterministic testing.');
      setFormErrors({});
      setCurrentStep(9);
      toast.success('Step 8 auto-filled! Proceeding to Step 9 Final Review...');
      return;
    }

    if (currentStep === 9) {
      setTermsAccepted(true);
      setIsSubmitted(true);
      toast.success('Application submitted via Fast Test mode!');
      return;
    }
  };

  const handleSaveDraft = () => {
    const token = 'dft_' + Math.random().toString(36).substring(2, 10);
    setDraftToken(token);
    setIsDraftSaved(true);
    toast.success('Application draft saved successfully.');
    setTimeout(() => setIsDraftSaved(false), 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setIsSubmitted(true);
      toast.success('Application successfully submitted!');
    }
  };

  return (
    <div className="form-wizard-container w-full max-w-4xl mx-auto p-5 sm:p-8 rounded-2xl shadow-xl bg-card border border-border text-foreground transition-all duration-300 font-body antialiased">
      {/* Top Header Bar: Exit Action, Theme Selector & Debug Mode */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-border/80 gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="h-9 px-3 gap-1.5 rounded-xl border border-border bg-background text-foreground hover:bg-accent font-semibold text-xs cursor-pointer"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Portal</span>
          </Button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                Candidate <span className="text-primary">Application</span>
              </h2>
              <Badge variant="outline" className="text-xs font-mono py-0.5 border-primary/40 text-primary">
                Live Assessment
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedJob.department} • {selectedJob.type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Debug Mode Toggle */}
          <Button
            type="button"
            variant={isDebugMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`h-9 px-3 text-xs gap-1.5 rounded-xl font-semibold cursor-pointer ${
              isDebugMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-border'
            }`}
            title="Toggle Debug Simulator"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug</span>
          </Button>

          {/* Theme Selector */}
          <div className="flex items-center space-x-1.5">
            <Select 
              value={theme} 
              onValueChange={(val) => setTheme(val as AppThemeType)}
            >
              <SelectTrigger className="h-9 text-xs w-[200px] rounded-xl border border-border bg-background text-foreground font-semibold shadow-xs cursor-pointer">
                <SelectValue placeholder="Select Theme" />
              </SelectTrigger>
              <SelectContent className="border border-border shadow-xl bg-card text-foreground rounded-xl">
                {THEME_OPTIONS.map((t) => (
                  <SelectItem 
                    key={t.id} 
                    value={t.id}
                    className="text-xs cursor-pointer focus:bg-accent/40 font-medium"
                  >
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Debug Mode Panel (When Active) */}
      {isDebugMode && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 font-heading">
              <Bug className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Developer Debug Mode & Step Simulator
            </span>
            <span className="font-mono text-muted-foreground">Step {currentStep} of 9</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-muted-foreground mr-1">Jump Step:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={currentStep === s ? 'default' : 'outline'}
                onClick={() => setCurrentStep(s)}
                className="h-7 px-2 text-xs font-mono font-bold"
              >
                #{s}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleTestFillAndNext}
              className="h-7 px-2.5 text-xs font-semibold bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-400 ml-1"
            >
              ⚡ Fill & Jump Next
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bar & Steps Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2.5 overflow-x-auto pb-1 gap-1">
          {[
            { num: 1, title: 'Position' },
            { num: 2, title: 'Contact' },
            { num: 3, title: 'Availability' },
            { num: 4, title: 'Experience' },
            { num: 5, title: 'Portfolio' },
            { num: 6, title: 'Skills' },
            { num: 7, title: 'Briefing' },
            { num: 8, title: 'Assessment' },
            { num: 9, title: 'Review' },
          ].map(({ num, title }) => {
            const isCompleted = num < currentStep;
            const isCurrent = num === currentStep;

            return (
              <div 
                key={num} 
                className="flex items-center space-x-1.5 shrink-0 cursor-pointer"
                onClick={() => setCurrentStep(num)}
                title={`Jump to Step ${num}: ${title}`}
              >
                <div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-colors font-heading ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
                <span className={`text-xs font-semibold hidden lg:inline font-heading ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden border border-border/40">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Draft Notification Banner */}
      {isDraftSaved && (
        <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draft saved! Resume token: <code className="font-mono bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">{draftToken}</code></span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsDraftSaved(false)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Contents */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Target Position & Role Preferences */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Step 1: Target Position & Role Specifications</span>
              </h3>

              {/* Searchable Job Position Selection */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Job Position Applied For <span className="text-red-500 font-bold ml-1">*</span>
                </label>

                <Popover open={isJobPopoverOpen} onOpenChange={setIsJobPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 px-3.5 justify-between text-sm rounded-xl border border-input bg-background text-foreground font-medium shadow-2xs hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Briefcase className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-bold text-foreground">{selectedJob.title}</span>
                        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                          ({selectedJob.department} • {selectedJob.type})
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-96 p-2 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-50 space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                      <Input
                        value={jobSearchQuery}
                        onChange={(e) => setJobSearchQuery(e.target.value)}
                        placeholder="Search open tech positions..."
                        className="h-9 pl-9 text-xs bg-muted/40 border-border"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                      {filteredJobs.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No positions match "{jobSearchQuery}".
                        </div>
                      ) : (
                        filteredJobs.map((job) => {
                          const isSelected = job.id === selectedJob.id;
                          return (
                            <button
                              key={job.id}
                              type="button"
                              onClick={() => handleSelectJob(job)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/15 text-primary font-bold'
                                  : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-sm">{job.title}</div>
                                <div className="text-xs text-muted-foreground">{job.department}</div>
                              </div>
                              <Badge variant="outline" className="text-xs font-mono shrink-0 ml-2">
                                {job.type}
                              </Badge>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Seniority Level */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Target Seniority Level <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {['Junior / Associate', 'Mid-Level Specialist', 'Senior Fullstack', 'Staff / Lead Architect'].map((level) => (
                    <label
                      key={level}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                        seniorityLevel === level
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-card text-foreground hover:bg-accent/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="seniorityLevel"
                        value={level}
                        checked={seniorityLevel === level}
                        onChange={() => setSeniorityLevel(level)}
                        className="text-primary h-3.5 w-3.5"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Commitment */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Work Commitment Expected <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {['Full-Time (40 hrs/wk)', 'Part-Time (20 hrs/wk)', 'Contract / Milestone'].map((comm) => (
                    <label
                      key={comm}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                        workCommitment === comm
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-card text-foreground hover:bg-accent/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="workCommitment"
                        value={comm}
                        checked={workCommitment === comm}
                        onChange={() => setWorkCommitment(comm)}
                        className="text-primary h-3.5 w-3.5"
                      />
                      <span>{comm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Candidate Contact & Location Details */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <User className="w-5 h-5 text-primary" />
                <span>Step 2: Candidate Contact & Location Details</span>
              </h3>

              {/* Full Legal Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Full Legal Name <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <Input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder="e.g. Alexandra Chen"
                  className={`h-11 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 ${
                    formErrors.fullName ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  }`}
                  required
                />
                {formErrors.fullName && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Email Address <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <div className="relative">
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="alexandra@example.com"
                    className={`h-11 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 ${
                      formErrors.email ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                    }`}
                    required
                  />
                  <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone Input with Country Flags */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Phone Number (with Country Code) <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <PhoneWithCountrySelect
                  value={phone}
                  onChange={(val) => {
                    setPhone(val);
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  className={formErrors.phone ? 'border-destructive' : ''}
                />
                {formErrors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* City and Country of Residence */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Current City & Country of Residence <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <Input 
                  type="text" 
                  value={locationCity} 
                  onChange={(e) => {
                    setLocationCity(e.target.value);
                    if (formErrors.locationCity) setFormErrors((prev) => ({ ...prev, locationCity: '' }));
                  }}
                  placeholder="e.g. Dhaka, Bangladesh or Berlin, Germany"
                  className={`h-11 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 ${
                    formErrors.locationCity ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  }`}
                  required
                />
                {formErrors.locationCity && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.locationCity}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Availability & Work Model Preferences */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Step 3: Availability & Work Model Preferences</span>
              </h3>

              {/* Immediate Availability Radio Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Are you currently open to work immediately? <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                    isOpenToWork === 'yes' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'
                  }`}>
                    <input 
                      type="radio" 
                      name="openToWork" 
                      value="yes" 
                      checked={isOpenToWork === 'yes'}
                      onChange={() => setIsOpenToWork('yes')}
                      className="text-primary h-4 w-4"
                    />
                    <span>Yes, ready immediately</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                    isOpenToWork === 'no' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'
                  }`}>
                    <input 
                      type="radio" 
                      name="openToWork" 
                      value="no" 
                      checked={isOpenToWork === 'no'}
                      onChange={() => setIsOpenToWork('no')}
                      className="text-primary h-4 w-4"
                    />
                    <span>No, currently in a notice period</span>
                  </label>
                </div>
              </div>

              {/* Notice Period Selection (If in notice period) */}
              {isOpenToWork === 'no' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-sm font-semibold text-foreground">
                    Required Notice Period <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                    <SelectTrigger className="h-10 text-sm rounded-xl border border-input bg-background text-foreground">
                      <SelectValue placeholder="Select Notice Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2 Weeks">2 Weeks Notice</SelectItem>
                      <SelectItem value="1 Month">1 Month Notice</SelectItem>
                      <SelectItem value="2 Months">2 Months Notice</SelectItem>
                      <SelectItem value="3 Months">3 Months Notice</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.noticePeriod && (
                    <p className="text-xs text-destructive mt-1">{formErrors.noticePeriod}</p>
                  )}
                </div>
              )}

              {/* Earliest Start Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Earliest Feasible Start Date
                </label>
                <Input 
                  type="text" 
                  value={earliestStartDate} 
                  onChange={(e) => setEarliestStartDate(e.target.value)}
                  placeholder="e.g. Immediately or within 14 days"
                  className="h-10 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Work Model Preference */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Preferred Work Setup <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'remote', label: '100% Fully Remote', desc: 'Work from home or anywhere' },
                    { id: 'hybrid', label: 'Hybrid Flexible', desc: 'Partial in-office collaboration' },
                    { id: 'onsite', label: 'On-Site HQ', desc: 'Daily in-office presence' }
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                        workPreference === item.id
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-card text-foreground hover:bg-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="workPreference"
                          value={item.id}
                          checked={workPreference === item.id}
                          onChange={() => setWorkPreference(item.id)}
                          className="text-primary h-3.5 w-3.5"
                        />
                        <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 pl-5.5 font-normal">{item.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Professional Experience & Background */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Step 4: Professional Experience & Background</span>
              </h3>

              {/* Years of Experience */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Years of Relevant Software Experience <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <Input 
                  type="number" 
                  min="0"
                  max="40"
                  value={yearsOfExperience}
                  onChange={(e) => {
                    setYearsOfExperience(e.target.value);
                    if (formErrors.yearsOfExperience) setFormErrors((prev) => ({ ...prev, yearsOfExperience: '' }));
                  }}
                  className={`w-full sm:w-48 h-10 px-3.5 text-sm bg-background border rounded-xl text-foreground font-mono ${
                    formErrors.yearsOfExperience ? 'border-destructive' : 'border-input'
                  }`}
                  required
                />
                {formErrors.yearsOfExperience && (
                  <p className="text-xs text-destructive mt-1">{formErrors.yearsOfExperience}</p>
                )}
              </div>

              {/* Current or Most Recent Company */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Current or Most Recent Organization
                </label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={currentCompany} 
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Acme Tech Labs or Freelance"
                    className="h-10 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60"
                  />
                  <Building2 className="absolute right-3.5 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Current or Most Recent Role Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Current or Most Recent Job Title
                </label>
                <Input 
                  type="text" 
                  value={currentRoleTitle} 
                  onChange={(e) => setCurrentRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="h-10 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Key Responsibilities Summary */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Summary of Core Responsibilities & Achievements
                </label>
                <Textarea 
                  value={responsibilitiesSummary} 
                  onChange={(e) => setResponsibilitiesSummary(e.target.value)}
                  placeholder="Briefly describe key systems, architectures, or contributions you have driven..."
                  className="min-h-[100px] text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 resize-y"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Code Portfolios & Online Presence */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Code className="w-5 h-5 text-primary" />
                <span>Step 5: Code Portfolios & Public Profiles</span>
              </h3>

              {/* GitHub Profile URL (Mandatory) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    GitHub Profile URL <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">Mandatory for code review</span>
                </div>
                <div className="relative">
                  <Input 
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => {
                      setPortfolioUrl(e.target.value);
                      if (formErrors.portfolioUrl) setFormErrors((prev) => ({ ...prev, portfolioUrl: '' }));
                    }}
                    placeholder="https://github.com/username"
                    className={`h-11 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 ${
                      formErrors.portfolioUrl ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                    }`}
                    required
                  />
                  <LinkIcon className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {formErrors.portfolioUrl && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.portfolioUrl}</span>
                  </p>
                )}
              </div>

              {/* LinkedIn Profile URL */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Input 
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="h-10 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60"
                  />
                  <Globe className="absolute right-3.5 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Personal Portfolio / Blog URL */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Personal Portfolio / Tech Blog URL
                </label>
                <Input 
                  type="url"
                  value={personalWebsiteUrl}
                  onChange={(e) => setPersonalWebsiteUrl(e.target.value)}
                  placeholder="https://yourname.dev"
                  className="h-10 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Technical Competency & Domain Self-Ratings */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Step 6: Technical Competency & Domain Self-Ratings</span>
              </h3>

              <p className="text-xs text-muted-foreground">
                Rate your proficiency across key engineering domains (1 = Beginner, 5 = Expert).
              </p>

              <div className="space-y-4 pt-1">
                {[
                  {
                    id: 'frontend',
                    title: 'Frontend Architecture & Modern React / TypeScript',
                    desc: 'Tailwind CSS, Shadcn UI primitives, responsive design, bundle optimization',
                    val: frontendRating,
                    setter: setFrontendRating
                  },
                  {
                    id: 'backend',
                    title: 'Backend Systems & API Architecture',
                    desc: 'Node.js, PHP / WordPress core, Go microservices, REST / GraphQL APIs',
                    val: backendRating,
                    setter: setBackendRating
                  },
                  {
                    id: 'database',
                    title: 'Database Architecture & Split-DB Design',
                    desc: 'SQLite, MySQL, schema migrations, tenant isolation, concurrency',
                    val: databaseRating,
                    setter: setDatabaseRating
                  },
                  {
                    id: 'devops',
                    title: 'DevOps, CI/CD & Test Automation',
                    desc: 'GitHub Actions, automated QA runners, regression safety, zero-artifact rules',
                    val: devopsRating,
                    setter: setDevopsRating
                  }
                ].map((skill) => (
                  <div key={skill.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {skill.title} <span className="text-red-500 font-bold ml-1">*</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{skill.desc}</div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 sm:pt-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => skill.setter(star)}
                            className="p-1 rounded hover:bg-accent cursor-pointer transition-colors"
                            title={`Rate ${star} / 5`}
                          >
                            <Star
                              className={`w-6 h-6 transition-all ${
                                star <= skill.val
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted-foreground/30 hover:text-amber-400'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-mono font-bold ml-2 w-6 text-foreground">
                          {skill.val > 0 ? `${skill.val}/5` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formErrors.ratings && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{formErrors.ratings}</span>
                </p>
              )}
            </div>
          )}

          {/* STEP 7: Technical Architecture Briefing */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Video className="w-5 h-5 text-primary" />
                <span>Step 7: Technical Architecture Briefing & Overview</span>
              </h3>

              {/* Elementor-Style Rich Video Briefing Block */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground font-heading">
                    <Video className="w-4 h-4 text-primary" />
                    <span>Technical Architecture Walkthrough</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBriefingNotesExpanded(!isBriefingNotesExpanded)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isBriefingNotesExpanded ? 'Hide Briefing Notes' : 'View Briefing Notes'}</span>
                    {isBriefingNotesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="aspect-video w-full rounded-xl bg-card border border-border/80 flex flex-col items-center justify-center p-6 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-inner">
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-foreground font-heading">
                    Architecture & System Design Briefing
                  </span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    Technical briefing outlining the Split SQLite multi-tenant data architecture, WAL journaling concurrency, and prompt architect quality gates.
                  </p>
                </div>

                {isBriefingNotesExpanded && (
                  <div className="p-3.5 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1.5 animate-in fade-in duration-150">
                    <span className="font-bold text-foreground block">Key Concepts Covered:</span>
                    <p>• Root metadata coordination with isolated project tenant stores (`project_&lt;id&gt;.db`).</p>
                    <p>• Write-Ahead Logging (WAL) concurrency and zero-lock contention across concurrent candidate exam runs.</p>
                    <p>• Bounded subtask execution and zero-artifact CI/CD reporting mandates.</p>
                  </div>
                )}
              </div>

              {/* Mandatory Video Watched Confirmation */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm">
                  <input 
                    type="checkbox"
                    checked={hasWatchedVideo}
                    onChange={(e) => {
                      setHasWatchedVideo(e.target.checked);
                      if (formErrors.hasWatchedVideo) setFormErrors((prev) => ({ ...prev, hasWatchedVideo: '' }));
                    }}
                    className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
                    required
                  />
                  <span className="text-foreground leading-relaxed">
                    I have reviewed and understood the technical briefing video and engineering architectural overview. <span className="text-red-500 font-bold ml-1">*</span>
                  </span>
                </label>
                {formErrors.hasWatchedVideo && (
                  <p className="text-xs text-destructive mt-1 pl-7">{formErrors.hasWatchedVideo}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: System Design & Engineering Assessment */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span>Step 8: System Design & Engineering Assessment</span>
              </h3>

              {/* Technical Multiple Choice Question */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Which database design pattern isolates tenant workloads while keeping schema queries lean? <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuestionHintExpanded(!isQuestionHintExpanded)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 ml-2"
                  >
                    <span>Hint</span>
                    {isQuestionHintExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {isQuestionHintExpanded && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary animate-in fade-in duration-150">
                    💡 <strong>Hint:</strong> Think about local single-file SQLite databases where each project has its own dedicated database file.
                  </div>
                )}

                <div className="space-y-2.5">
                  {[
                    { val: 'split-sqlite', label: 'Split SQLite (root.db + project_<id>.db in WAL mode)' },
                    { val: 'monolithic-csv', label: 'Monolithic Unindexed CSV Flat File' },
                    { val: 'shared-table', label: 'Single giant table without index partition' }
                  ].map((opt, optIdx) => (
                    <label 
                      key={opt.val} 
                      className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                        selectedMcq === opt.val 
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                          : 'border-border bg-card text-foreground hover:bg-accent/40'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        selectedMcq === opt.val 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-muted/60 border-border text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <input 
                        type="radio" 
                        name="db_pattern" 
                        value={opt.val}
                        checked={selectedMcq === opt.val}
                        onChange={() => {
                          setSelectedMcq(opt.val);
                          if (formErrors.selectedMcq) setFormErrors((prev) => ({ ...prev, selectedMcq: '' }));
                        }}
                        className="text-primary h-4 w-4"
                      />
                      <span className="flex-1">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {formErrors.selectedMcq && (
                  <p className="text-xs text-destructive mt-1">{formErrors.selectedMcq}</p>
                )}
              </div>

              {/* Architectural Standards Compliance Checklist */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Select Architectural Quality Standards You Have Mastered
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'positive-boolean', title: 'Strict Positive Boolean', desc: 'is / has naming, implicit evaluations' },
                    { id: 'result-wrapper', title: 'Monadic Result Wrapper', desc: 'No bare void returns; structured AppError metadata' },
                    { id: 'vertical-lines', title: 'Vertical Line Gaps', desc: 'Blank lines before if, after }, and around blocks' },
                    { id: 'file-micro-batch', title: '5-8 File Micro-Batching', desc: 'Bounded refactors with isolated unit tests' }
                  ].map((std) => {
                    const isChecked = selectedStandards.includes(std.id);
                    return (
                      <label
                        key={std.id}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border bg-card text-foreground hover:bg-accent/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStandards([...selectedStandards, std.id]);
                            } else {
                              setSelectedStandards(selectedStandards.filter((s) => s !== std.id));
                            }
                          }}
                          className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-semibold">{std.title}</div>
                          <div className="text-xs text-muted-foreground font-normal">{std.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Architectural Justification */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Architecture Justification & Design Decision Rationale
                </label>
                <Textarea
                  value={architectureExplanation}
                  onChange={(e) => setArchitectureExplanation(e.target.value)}
                  placeholder="Explain why your chosen database architecture and code standards best safeguard multi-tenant isolation..."
                  className="min-h-[100px] text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 resize-y"
                />
              </div>
            </div>
          )}

          {/* STEP 9: Comprehensive Review & Final Legal Submission */}
          {currentStep === 9 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Step 9: Review & Submit Application</span>
              </h3>

              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4 text-sm">
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground text-base">
                      Target Role: <span className="text-primary">{selectedJob.title}</span>
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary">
                    {selectedJob.department} • {selectedJob.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Full Legal Name</span>
                    <span className="font-semibold text-foreground">{fullName || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Email Address</span>
                    <span className="font-semibold text-foreground font-mono truncate block">{email || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Phone Contact</span>
                    <span className="font-semibold text-foreground font-mono">{phone || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Location / Residence</span>
                    <span className="font-semibold text-foreground truncate block">{locationCity || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Seniority & Commitment</span>
                    <span className="font-semibold text-foreground text-xs">{seniorityLevel} • {workCommitment}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Availability & Setup</span>
                    <span className="font-semibold text-foreground text-xs">
                      {isOpenToWork === 'yes' ? 'Ready Immediately' : `Notice: ${noticePeriod}`} • {workPreference}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Experience & Company</span>
                    <span className="font-semibold text-foreground font-mono text-xs">
                      {yearsOfExperience} yrs • {currentCompany || 'Independent'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border col-span-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground block">Mandatory GitHub Profile</span>
                    <span className="font-semibold text-primary font-mono text-xs truncate block">{portfolioUrl || 'None provided'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                    <span className="text-xs text-muted-foreground block">Frontend</span>
                    <span className="font-bold text-amber-500 font-mono text-sm">{frontendRating}/5 ⭐</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                    <span className="text-xs text-muted-foreground block">Backend</span>
                    <span className="font-bold text-amber-500 font-mono text-sm">{backendRating}/5 ⭐</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                    <span className="text-xs text-muted-foreground block">Database</span>
                    <span className="font-bold text-amber-500 font-mono text-sm">{databaseRating}/5 ⭐</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                    <span className="text-xs text-muted-foreground block">DevOps</span>
                    <span className="font-bold text-amber-500 font-mono text-sm">{devopsRating}/5 ⭐</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border">
                  <span className="text-xs text-muted-foreground block">System Design Selection</span>
                  <span className="font-semibold text-primary font-mono text-xs">{selectedMcq}</span>
                </div>
              </div>

              {/* Legal Declaration Accuracy Checkbox */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm">
                  <input 
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (formErrors.termsAccepted) setFormErrors((prev) => ({ ...prev, termsAccepted: '' }));
                    }}
                    className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
                    required
                  />
                  <span className="text-foreground leading-relaxed">
                    I solemnly declare that all provided candidate credentials, portfolio links, and responses are authentic and truthful. <span className="text-red-500 font-bold ml-1">*</span>
                  </span>
                </label>
                {formErrors.termsAccepted && (
                  <p className="text-xs text-destructive mt-1 pl-7">{formErrors.termsAccepted}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-6 border-t border-border gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-10 px-4 text-xs font-semibold rounded-xl gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="h-10 px-4 text-xs font-semibold rounded-xl gap-1.5 bg-muted/60"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* ⚡ Fast Test Auto-Fill Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestFillAndNext}
                className="h-10 px-4 text-xs font-bold rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 gap-1.5 cursor-pointer shadow-xs"
                title="Auto-fill valid responses for this step and proceed immediately"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>⚡ Test Fill & Next</span>
              </Button>

              {currentStep < 9 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="h-10 px-6 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </Button>
              )}
            </div>
          </div>
        </form>
      ) : (
        /* Submission Success Confirmation */
        <div className="p-8 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-bold font-heading text-foreground">Application Submitted Successfully!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your application for <strong className="text-foreground font-semibold">{selectedJob.title}</strong> has been logged into the exam scoring engine.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
              }}
              className="h-10 px-5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
            >
              Start New Application
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="h-10 px-5 text-xs font-semibold rounded-xl border border-border"
            >
              Return to Website
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardRunner;

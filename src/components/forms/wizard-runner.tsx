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
  FileText 
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

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+880 ');
  const [isOpenToWork, setIsOpenToWork] = useState<string>('yes');
  const [noticePeriod, setNoticePeriod] = useState<string>('1 Month');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('2');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [selectedMcq, setSelectedMcq] = useState<string>('split-sqlite');
  const [hasConfirmedFaq, setHasConfirmedFaq] = useState<boolean>(false);

  // Expandable Description / FAQ States
  const [isBriefingNotesExpanded, setIsBriefingNotesExpanded] = useState(false);
  const [isQuestionHintExpanded, setIsQuestionHintExpanded] = useState(false);

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
    }

    if (currentStep === 2) {
      if (isOpenToWork === 'no' && !noticePeriod) {
        errors.noticePeriod = 'Please specify your required notice period.';
      }
      if (!yearsOfExperience || Number(yearsOfExperience) < 0) {
        errors.yearsOfExperience = 'Years of relevant experience is required.';
      }
      if (!portfolioUrl.trim()) {
        errors.portfolioUrl = 'GitHub profile URL is mandatory.';
      } else {
        const urlRegex = /^https?:\/\/.+/i;
        if (!urlRegex.test(portfolioUrl.trim())) {
          errors.portfolioUrl = 'Portfolio / GitHub URL must begin with http:// or https://';
        }
      }
    }

    if (currentStep === 3) {
      if (!selectedMcq) {
        errors.selectedMcq = 'Please select a technical assessment answer.';
      }
      if (!hasConfirmedFaq) {
        errors.hasConfirmedFaq = 'You must confirm terms to advance to review.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
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

  // ⚡ Test Fill & Next Step QA Automation Engine
  const handleTestFillAndNext = () => {
    if (currentStep === 1) {
      if (!fullName) setFullName('Alexandra Chen');
      if (!email) setEmail('alexandra.chen@tech-org.io');
      if (!phone || phone === '+880 ') setPhone('+880 1712345678');
      setFormErrors({});
      setCurrentStep(2);
      toast.success('Step 1 auto-filled! Proceeding to Step 2...');
      return;
    }

    if (currentStep === 2) {
      setIsOpenToWork('yes');
      setYearsOfExperience('3');
      setPortfolioUrl('https://github.com/alexandra-chen-dev');
      setFormErrors({});
      setCurrentStep(3);
      toast.success('Step 2 auto-filled! Proceeding to Step 3...');
      return;
    }

    if (currentStep === 3) {
      setSelectedMcq('split-sqlite');
      setHasConfirmedFaq(true);
      setFormErrors({});
      setCurrentStep(4);
      toast.success('Step 3 auto-filled! Proceeding to Step 4 Review...');
      return;
    }

    if (currentStep === 4) {
      setIsSubmitted(true);
      toast.success('Application submitted via Fast Test mode!');
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
            <span className="font-mono text-muted-foreground">Step {currentStep} of 4</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-muted-foreground mr-1">Jump Step:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={currentStep === Math.min(s, 4) ? 'default' : 'outline'}
                onClick={() => setCurrentStep(Math.min(s, 4))}
                className="h-7 px-2 text-xs font-mono font-bold"
                title={s > 4 ? `Simulate Step #${s}` : `Jump to Step #${s}`}
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
          <div className="text-xs text-muted-foreground font-mono pt-1 border-t border-amber-500/20">
            Payload: {[fullName, email, phone, yearsOfExperience, portfolioUrl, selectedMcq].filter(Boolean).length} answers recorded
          </div>
        </div>
      )}

      {/* Progress Bar & Steps Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2.5">
          {['1. Personal Info', '2. Experience', '3. Knowledge & FAQ', '4. Review & Submit'].map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={title} className="flex items-center space-x-2">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors font-heading ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                <span className={`text-xs sm:text-sm font-semibold hidden md:inline font-heading ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden border border-border/40">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
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
          {/* STEP 1: Target Position & Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Step 1: Target Position & Contact Information</span>
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
            </div>
          )}

          {/* STEP 2: Experience & Qualifications */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Step 2: Experience & Qualifications</span>
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
                    <span>No, in a notice period</span>
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
                </div>
              )}

              {/* Experience Input — Always Accessible to Eliminate Buggy Feeling */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Years of Relevant Experience <span className="text-red-500 font-bold ml-1">*</span>
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

              {/* Portfolio or GitHub URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Portfolio or GitHub URL <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">e.g. github.com/profile</span>
                </div>
                <Input 
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => {
                    setPortfolioUrl(e.target.value);
                    if (formErrors.portfolioUrl) setFormErrors((prev) => ({ ...prev, portfolioUrl: '' }));
                  }}
                  placeholder="https://github.com/my-profile"
                  className={`h-11 px-3.5 text-sm bg-background border rounded-xl text-foreground placeholder:text-muted-foreground/60 ${
                    formErrors.portfolioUrl ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  }`}
                  required
                />
                {formErrors.portfolioUrl && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.portfolioUrl}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Technical Screening & Questions */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span>Step 3: Technical Screening & Questions</span>
              </h3>

              {/* Elementor-Style Rich Video Briefing Block */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground font-heading">
                    <Video className="w-4 h-4 text-primary" />
                    <span>Technical Briefing Video</span>
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
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-inner">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <span className="text-sm font-bold text-foreground font-heading">
                    Architecture & System Design Briefing
                  </span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Interactive engineering briefing regarding split-DB SQLite architecture and multi-tenant sharding.
                  </p>
                </div>

                {isBriefingNotesExpanded && (
                  <div className="p-3.5 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1.5 animate-in fade-in duration-150">
                    <span className="font-bold text-foreground block">Key Concepts Covered:</span>
                    <p>• Root metadata coordination with isolated project tenant stores (`project_&lt;id&gt;.db`).</p>
                    <p>• Write-Ahead Logging (WAL) concurrency and zero-lock contention across candidate exam runs.</p>
                  </div>
                )}
              </div>

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

              {/* Agreement Checkbox */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm">
                  <input 
                    type="checkbox"
                    checked={hasConfirmedFaq}
                    onChange={(e) => {
                      setHasConfirmedFaq(e.target.checked);
                      if (formErrors.hasConfirmedFaq) setFormErrors((prev) => ({ ...prev, hasConfirmedFaq: '' }));
                    }}
                    className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
                    required
                  />
                  <span className="text-foreground leading-relaxed">
                    I confirm that all information provided is accurate and agree to the candidate scoring terms and conditions. <span className="text-red-500 font-bold ml-1">*</span>
                  </span>
                </label>
                {formErrors.hasConfirmedFaq && (
                  <p className="text-xs text-destructive mt-1 pl-7">{formErrors.hasConfirmedFaq}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Final Submission */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-lg font-bold border-b border-border pb-2.5 flex items-center gap-2 text-foreground font-heading">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Step 4: Review & Submit</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Full Legal Name</span>
                    <span className="font-semibold text-foreground">{fullName || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Email Address</span>
                    <span className="font-semibold text-foreground font-mono">{email || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Phone Contact</span>
                    <span className="font-semibold text-foreground font-mono">{phone || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Immediate Work Status</span>
                    <span className="font-semibold text-foreground">
                      {isOpenToWork === 'yes' ? 'Yes, immediately ready' : `Notice period: ${noticePeriod}`}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Experience Level</span>
                    <span className="font-semibold text-foreground font-mono">{yearsOfExperience} years</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-xs text-muted-foreground block">Portfolio / GitHub</span>
                    <span className="font-semibold text-foreground font-mono truncate block">{portfolioUrl || 'None provided'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border">
                  <span className="text-xs text-muted-foreground block">Technical Screening Solution</span>
                  <span className="font-semibold text-primary font-mono text-xs">{selectedMcq}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Submission records your candidate answers securely into the WordPress and SQLite database.
                </span>
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

              {currentStep < 4 ? (
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

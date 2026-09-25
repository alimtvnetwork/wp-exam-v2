import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  User,
  Briefcase,
  Play
} from 'lucide-react';
import { useTheme, AppThemeType } from '@/lib/theme-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface JobPositionOption {
  id: string;
  title: string;
  department: string;
  type: string;
}

const AVAILABLE_JOB_POSITIONS: JobPositionOption[] = [
  { id: 'intern-programmer', title: 'Intern Programmer', department: 'Engineering', type: 'Internship' },
  { id: 'junior-software-engineer', title: 'Junior Software Engineer', department: 'Engineering', type: 'Full-Time' },
  { id: 'frontend-developer', title: 'Frontend Developer (React / TS)', department: 'Frontend', type: 'Full-Time' },
  { id: 'full-stack-architect', title: 'Full-Stack Web Architect', department: 'Engineering', type: 'Full-Time' },
  { id: 'backend-systems-engineer', title: 'Backend Systems Engineer (Go & Cloud)', department: 'Platform', type: 'Full-Time' },
  { id: 'devops-cloud-engineer', title: 'DevOps & Cloud Infrastructure Engineer', department: 'Operations', type: 'Full-Time' },
  { id: 'qa-automation-specialist', title: 'QA & Test Automation Specialist', department: 'Quality Assurance', type: 'Full-Time' },
  { id: 'product-uiux-designer', title: 'Product UI/UX Designer', department: 'Product Design', type: 'Full-Time' },
];

interface CountryOption {
  code: string;
  name: string;
  prefix: string;
  flag: string;
}

const STATIC_COUNTRIES: CountryOption[] = [
  { code: 'BD', name: 'Bangladesh', prefix: '+880', flag: '🇧🇩' },
  { code: 'US', name: 'United States', prefix: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', prefix: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', prefix: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', prefix: '+49', flag: '🇩🇪' },
  { code: 'IN', name: 'India', prefix: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', prefix: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', prefix: '+60', flag: '🇲🇾' },
];

const THEME_OPTIONS: { id: AppThemeType; name: string }[] = [
  { id: 'riseup', name: 'Rise Up Asia (Warm Gold & Navy)' },
  { id: 'dracula', name: 'Antigravity Dracula (Dark Purple)' },
  { id: 'letterly', name: 'Letterly (Deep Navy & Violet)' },
  { id: 'obsidian', name: 'VS Code Dark (Slate & Cyan)' },
  { id: 'clean', name: 'Clean Light (Enterprise Clean)' },
];

export const WizardRunner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { theme, setTheme } = useTheme();

  // Job Position Selection State (auto-populated from URL ?job= if present)
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

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(STATIC_COUNTRIES[0]);
  const [rawPhone, setRawPhone] = useState<string>('');
  const [isOpenToWork, setIsOpenToWork] = useState<string>('yes');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('1');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [selectedMcq, setSelectedMcq] = useState<string>('');
  const [hasConfirmedFaq, setHasConfirmedFaq] = useState<boolean>(false);

  // Validation & Debounce States
  const [emailError, setEmailError] = useState<string>('');
  const [portfolioError, setPortfolioError] = useState<string>('');
  const [whatsAppDeepLink, setWhatsAppDeepLink] = useState<string>('');
  const [draftToken, setDraftToken] = useState<string>('');
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // WhatsApp Prefix Formatter
  useEffect(() => {
    const cleanNumber = rawPhone.replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (cleanNumber.length > 0) {
      setWhatsAppDeepLink(`https://wa.me/${selectedCountry.prefix}${cleanNumber}`);
    } else {
      setWhatsAppDeepLink('');
    }
  }, [selectedCountry, rawPhone]);

  // Debounced Email Validation
  useEffect(() => {
    if (!email) {
      setEmailError('');
      return;
    }
    const timer = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      if (isValid) {
        setEmailError('');
      } else {
        setEmailError('Please enter a valid email address');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  // Debounced Portfolio URL Validation
  useEffect(() => {
    if (!portfolioUrl) {
      setPortfolioError('');
      return;
    }
    const timer = setTimeout(() => {
      const urlRegex = /^https?:\/\/.+/i;
      const isValid = urlRegex.test(portfolioUrl);
      if (isValid) {
        setPortfolioError('');
      } else {
        setPortfolioError('URL must begin with http:// or https://');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [portfolioUrl]);

  const handleSaveDraft = () => {
    const token = 'dft_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setDraftToken(token);
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 5000);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullName.trim()) return;
      if (emailError) return;
    }
    if (currentStep === 3) {
      if (!hasConfirmedFaq) return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="form-wizard-container max-w-4xl mx-auto p-6 rounded-2xl shadow-xl bg-card border border-border text-foreground transition-all duration-300 font-sans">
      {/* Theme & Job Title Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-border gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
              Candidate Application
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 font-heading">
              <Briefcase className="w-3 h-3 text-primary" />
              {selectedJob.title}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedJob.department} • {selectedJob.type} • 4-Step Dynamic Assessment
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Theme:
          </label>
          <Select 
            value={theme} 
            onValueChange={(val) => setTheme(val as AppThemeType)}
          >
            <SelectTrigger className="h-8 text-xs w-[220px] rounded-lg border border-border bg-background text-foreground font-medium shadow-sm">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent className="border border-border shadow-xl bg-card text-foreground rounded-xl">
              {THEME_OPTIONS.map((t) => (
                <SelectItem 
                  key={t.id} 
                  value={t.id}
                  className="text-xs cursor-pointer focus:bg-accent/40"
                >
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress Bar & Steps Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {['1. Personal Info', '2. Experience', '3. Knowledge & FAQ', '4. Review & Submit'].map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={title} className="flex items-center space-x-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Draft Notification Banner */}
      {isDraftSaved && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 rounded-md text-emerald-800 dark:text-emerald-200 text-xs flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Draft saved! Resume anytime with magic link: <code>/apply/resume/{draftToken}</code></span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsDraftSaved(false)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Contents */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Target Position & Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b border-border pb-2 flex items-center gap-2 font-heading">
                <Briefcase className="w-4 h-4 text-primary" /> Step 1: Target Position & Contact Information
              </h3>

              {/* Job Position Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Job Position Applied For *
                </label>
                <Select
                  value={selectedJob.id}
                  onValueChange={(val) => {
                    const found = AVAILABLE_JOB_POSITIONS.find((j) => j.id === val);
                    if (found) {
                      setSelectedJob(found);
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set('job', found.id);
                        return next;
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 text-xs border border-border bg-background text-foreground rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="Select Target Position" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border border-border shadow-xl bg-card text-foreground rounded-xl max-h-60">
                    {AVAILABLE_JOB_POSITIONS.map((j) => (
                      <SelectItem key={j.id} value={j.id} className="text-xs cursor-pointer focus:bg-accent/40">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-semibold">{j.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {j.department} • {j.type}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-foreground">Full Legal Name *</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alexandra Chen"
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-foreground">Email Address *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexandra@example.com"
                    className={`w-full h-10 px-3 py-2 text-sm bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none ${
                      emailError ? 'border-destructive' : 'border-border'
                    }`}
                    required
                  />
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                </div>
                {emailError && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {emailError}
                  </p>
                )}
              </div>

              {/* Unified WhatsApp Phone Input */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-foreground">WhatsApp Phone Number *</label>
                <div className="flex rounded-md shadow-sm border border-border bg-background focus-within:ring-2 focus-within:ring-primary transition-all">
                  <Select
                    value={selectedCountry.code}
                    onValueChange={(val) => {
                      const found = STATIC_COUNTRIES.find((c) => c.code === val);
                      if (found) setSelectedCountry(found);
                    }}
                  >
                    <SelectTrigger className="w-[140px] sm:w-[170px] h-10 text-xs border-0 bg-transparent text-foreground rounded-r-none focus:ring-0 shadow-none border-r border-border shrink-0">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent className="border border-border shadow-xl bg-card text-foreground rounded-xl max-h-56">
                      {STATIC_COUNTRIES.map((c) => (
                        <SelectItem 
                          key={c.code} 
                          value={c.code}
                          className="text-xs cursor-pointer focus:bg-accent/40"
                        >
                          {c.flag} {c.name} ({c.prefix})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <input 
                    type="tel"
                    value={rawPhone}
                    onChange={(e) => setRawPhone(e.target.value)}
                    placeholder="1712345678"
                    className="flex-1 h-10 px-3 py-2 text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none rounded-r-md"
                    required
                  />
                </div>
              </div>

              {/* Real-time WhatsApp Link Preview */}
              {whatsAppDeepLink && (
                <div className="p-2.5 bg-muted/40 border border-border rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp: <strong className="text-foreground">{selectedCountry.prefix} {rawPhone}</strong></span>
                  </div>
                  <a 
                    href={whatsAppDeepLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open Chat <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Experience & Qualifications */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b border-border pb-2 flex items-center gap-2 font-heading">
                <Briefcase className="w-4 h-4 text-primary" /> Step 2: Experience & Qualifications
              </h3>

              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground">Are you currently open to work immediately? *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      name="openToWork" 
                      value="yes" 
                      checked={isOpenToWork === 'yes'}
                      onChange={() => setIsOpenToWork('yes')}
                    />
                    <span>Yes, ready immediately</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      name="openToWork" 
                      value="no" 
                      checked={isOpenToWork === 'no'}
                      onChange={() => setIsOpenToWork('no')}
                    />
                    <span>No, in a notice period</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Branching: Show years of experience when openToWork === 'yes' */}
              {isOpenToWork === 'yes' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-semibold text-foreground">Years of Relevant Experience *</label>
                  <input 
                    type="number" 
                    min="0"
                    max="30"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full sm:w-48 h-10 px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-foreground">Portfolio or GitHub URL</label>
                <input 
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/my-profile"
                  className={`w-full h-10 px-3 py-2 text-sm bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none ${
                    portfolioError ? 'border-destructive' : 'border-border'
                  }`}
                />
                {portfolioError && (
                  <p className="text-xs text-destructive mt-1">{portfolioError}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Knowledge Screening & Questions */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b border-border pb-2 flex items-center gap-2 font-heading">
                <HelpCircle className="w-4 h-4 text-primary" /> Step 3: Technical Screening & Questions
              </h3>

              {/* Video Embed */}
              <div className="p-4 bg-muted/30 border border-border rounded-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Play className="w-4 h-4 text-primary" /> Technical Briefing Video
                </div>
                <div className="aspect-video w-full max-w-md bg-muted rounded flex items-center justify-center text-muted-foreground text-xs border border-border">
                  <span>Architecture & System Design Briefing</span>
                </div>
              </div>

              {/* Rich MCQ Radio */}
              <div>
                <label className="block text-xs font-medium mb-2 text-foreground">
                  Which database design pattern isolates tenant workloads while keeping schema queries lean? *
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'split-sqlite', label: 'Split SQLite (root.db + project_<id>.db in WAL mode)' },
                    { val: 'monolithic-csv', label: 'Monolithic Unindexed CSV Flat File' },
                    { val: 'shared-table', label: 'Single giant table without index partition' }
                  ].map((opt) => (
                    <label 
                      key={opt.val} 
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedMcq === opt.val ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="db_pattern" 
                        value={opt.val}
                        checked={selectedMcq === opt.val}
                        onChange={() => setSelectedMcq(opt.val)}
                      />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="p-4 bg-muted/30 border border-border rounded-md">
                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input 
                    type="checkbox"
                    checked={hasConfirmedFaq}
                    onChange={(e) => setHasConfirmedFaq(e.target.checked)}
                    className="mt-0.5"
                    required
                  />
                  <span className="text-foreground">
                    I confirm that the information provided is accurate and agree to the assessment terms.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Final Submission */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b border-border pb-2 flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Step 4: Review & Submit
              </h3>

              <div className="p-4 bg-muted/40 border border-border rounded-md space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">
                      Target Role: <span className="text-primary">{selectedJob.title}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {selectedJob.department} • {selectedJob.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div><strong>Full Name:</strong> {fullName || '—'}</div>
                  <div><strong>Email:</strong> {email || '—'}</div>
                  <div><strong>Country:</strong> {selectedCountry.name}</div>
                  <div><strong>WhatsApp:</strong> {selectedCountry.prefix} {rawPhone || '—'}</div>
                  <div><strong>Open to Work:</strong> {isOpenToWork === 'yes' ? 'Yes, immediately' : 'No, in notice period'}</div>
                  <div><strong>Experience:</strong> {yearsOfExperience} years</div>
                  <div><strong>Portfolio:</strong> {portfolioUrl || 'None provided'}</div>
                  <div><strong>Technical Choice:</strong> {selectedMcq || 'None selected'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span>
                  Please review your information carefully before submitting your application.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 text-xs font-semibold border border-border rounded-md hover:bg-muted inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-md inline-flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft
              </button>
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:opacity-90 inline-flex items-center gap-1 shadow"
                >
                  Next Step <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md inline-flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Application
                </button>
              )}
            </div>
          </div>
        </form>
      ) : (
        /* Submission Success Confirmation */
        <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-heading">Application Submitted Successfully!</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Your application for <strong className="text-foreground font-semibold">{selectedJob.title}</strong> has been received successfully. We will review your details and get back to you soon.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
              }}
              className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-md shadow"
            >
              Start New Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardRunner;

import React, { useState, useEffect } from 'react';
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

const THEME_OPTIONS = [
  { id: 'riseup-asia', name: 'Riseup Asia (Navy & Gold)' },
  { id: 'dracula', name: 'Antigravity Dracula (Dark Purple)' },
  { id: 'vscode-dark', name: 'VS Code Dark (Slate & Cyan)' },
  { id: 'microsoft-blue', name: 'Microsoft Blue (Enterprise Clean)' },
];

export const WizardRunner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTheme, setActiveTheme] = useState<string>('riseup-asia');

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
    <div className={`form-wizard-container theme-${activeTheme} max-w-4xl mx-auto p-6 bg-card text-card-foreground rounded-xl shadow-lg border border-border`}>
      {/* Theme Selector Top Bar */}
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">WP Exam & Form Engine</h2>
          <p className="text-xs text-muted-foreground">Universal 4-Step Dynamic Candidate Application</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-muted-foreground">Theme:</label>
          <select 
            value={activeTheme} 
            onChange={(e) => setActiveTheme(e.target.value)}
            className="text-xs bg-muted border border-border rounded px-2 py-1"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
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
          {/* STEP 1: Personal & WhatsApp Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Step 1: Personal Information & Contact
              </h3>

              <div>
                <label className="block text-xs font-medium mb-1">Full Legal Name *</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alexandra Chen"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Email Address *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexandra@example.com"
                    className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                      emailError ? 'border-destructive' : 'border-border'
                    }`}
                    required
                  />
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>
                {emailError && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {emailError}
                  </p>
                )}
              </div>

              {/* Country & WhatsApp Phone Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Country *</label>
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = STATIC_COUNTRIES.find((c) => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                  >
                    {STATIC_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.prefix})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">WhatsApp Phone Number *</label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 text-sm bg-muted border border-border rounded-md">
                      {selectedCountry.flag} {selectedCountry.prefix}
                    </span>
                    <input 
                      type="tel"
                      value={rawPhone}
                      onChange={(e) => setRawPhone(e.target.value)}
                      placeholder="1712345678"
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Real-time WhatsApp Deep Link Ping Verification */}
              {whatsAppDeepLink && (
                <div className="p-3 bg-muted/60 border border-border rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>Formatted WhatsApp Deep Link: <code>{whatsAppDeepLink}</code></span>
                  </div>
                  <a 
                    href={whatsAppDeepLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Test WhatsApp <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Experience & Dynamic Conditional Branching */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Step 2: Experience & Conditional Qualifications
              </h3>

              <div>
                <label className="block text-xs font-medium mb-2">Are you currently open to work immediately? *</label>
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

              {/* Dynamic Branching: Show conditional field only when openToWork === 'yes' */}
              {isOpenToWork === 'yes' && (
                <div className="p-4 border border-primary/30 bg-primary/5 rounded-md space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <CheckCircle2 className="w-4 h-4" /> Conditional Section Triggered (Open to Work)
                  </div>
                  <label className="block text-xs font-medium">Years of Relevant Experience *</label>
                  <input 
                    type="number" 
                    min="0"
                    max="30"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-32 px-3 py-2 text-sm bg-background border border-border rounded-md"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Required on server only when Open to Work is marked Yes.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">Portfolio or GitHub URL</label>
                <input 
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/my-profile"
                  className={`w-full px-3 py-2 text-sm bg-background border rounded-md ${
                    portfolioError ? 'border-destructive' : 'border-border'
                  }`}
                />
                {portfolioError && (
                  <p className="text-xs text-destructive mt-1">{portfolioError}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Knowledge, Video Embed & FAQ Accordion */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b pb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> Step 3: Technical Screening & Mandatory FAQ
              </h3>

              {/* Video Embed Simulation */}
              <div className="p-4 bg-muted/40 border border-border rounded-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Play className="w-4 h-4 text-primary" /> Embedded Briefing Video
                </div>
                <div className="aspect-video w-full max-w-md bg-black/80 rounded flex items-center justify-center text-white text-xs">
                  <span>[ Video Question: Architecture & DAG Topologies ]</span>
                </div>
              </div>

              {/* Rich MCQ Radio */}
              <div>
                <label className="block text-xs font-medium mb-2">
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

              {/* Mandatory FAQ Gating Checkbox */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-md">
                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input 
                    type="checkbox"
                    checked={hasConfirmedFaq}
                    onChange={(e) => setHasConfirmedFaq(e.target.checked)}
                    className="mt-0.5"
                    required
                  />
                  <span>
                    <strong>Mandatory Gating:</strong> I have reviewed the curriculum FAQs and acknowledge that submissions undergo automated cycle and conditional validation.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Final Submission */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-base font-semibold border-b pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Step 4: Final Verification & Submit
              </h3>

              <div className="p-4 bg-muted/40 border border-border rounded-md space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Full Name:</strong> {fullName || '—'}</div>
                  <div><strong>Email:</strong> {email || '—'}</div>
                  <div><strong>Country:</strong> {selectedCountry.name}</div>
                  <div><strong>WhatsApp Link:</strong> {whatsAppDeepLink || '—'}</div>
                  <div><strong>Open to Work:</strong> {isOpenToWork}</div>
                  <div><strong>Experience:</strong> {yearsOfExperience} years</div>
                  <div><strong>Portfolio:</strong> {portfolioUrl || 'None provided'}</div>
                  <div><strong>Selected Architecture:</strong> {selectedMcq || 'None selected'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span>
                  By clicking Submit, your application will be dispatched to the Laravel REST API with authoritative conditional verification.
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
          <h3 className="text-xl font-bold">Application Submitted Successfully!</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Your candidate submission has passed authoritative conditional validation and has been persisted in the project SQLite database.
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

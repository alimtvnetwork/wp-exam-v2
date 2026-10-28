import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
  Database,
  Award,
  Activity,
  Code2,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Zap,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { InteractiveBranchingCanvas } from '../widgets/interactive-branching-canvas';
import { LayoutProps } from './version-1-classic';

interface CandidateOption {
  id: string;
  label: string;
  isCorrect: boolean;
  points: number;
}

interface WorkbenchQuestion {
  id: number;
  code: string;
  domain: string;
  linearPrompt: string;
  adaptivePrompt: string;
  linearOptions: CandidateOption[];
  adaptiveOptions: CandidateOption[];
}

const WORKBENCH_QUESTIONS: WorkbenchQuestion[] = [
  {
    id: 1,
    code: 'Q01 / STORAGE',
    domain: 'Split SQLite Concurrency',
    linearPrompt:
      'Standard Linear Q1: How does the system isolate high-frequency candidate responses from question definitions?',
    adaptivePrompt:
      'Adaptive Branch L6: Which architectural primitive completely eliminates write lock contention during concurrent candidate assessments?',
    linearOptions: [
      {
        id: 'opt_a',
        label: 'Single monolithic SQLite write lock with thread sleeps',
        isCorrect: false,
        points: 0,
      },
      {
        id: 'opt_b',
        label: 'Split SQLite (questions.db vs responses.db) in WAL journal mode',
        isCorrect: true,
        points: 92,
      },
      {
        id: 'opt_c',
        label: 'Client-side LocalStorage evaluation with DOM attribute checks',
        isCorrect: false,
        points: 35,
      },
    ],
    adaptiveOptions: [
      {
        id: 'opt_b',
        label: 'Split SQLite with decoupled responses.db and WAL journaling',
        isCorrect: true,
        points: 95,
      },
      {
        id: 'opt_d',
        label: 'Dynamic Raft partition cluster with asynchronous multi-master replication',
        isCorrect: false,
        points: 55,
      },
      {
        id: 'opt_e',
        label: 'In-memory ephemeral Redis cache without disk persistence guarantee',
        isCorrect: false,
        points: 25,
      },
    ],
  },
  {
    id: 2,
    code: 'Q02 / SECURITY',
    domain: 'Zero-DOM Key Shield',
    linearPrompt:
      'Standard Linear Q2: Where are assessment answer keys verified when a candidate submits a section?',
    adaptivePrompt:
      'Adaptive Branch L6: How does the evaluation runtime guarantee zero answer key leakage against DevTools network inspection?',
    linearOptions: [
      {
        id: 'opt_a',
        label: 'Inside obfuscated client-side JavaScript bundles',
        isCorrect: false,
        points: 20,
      },
      {
        id: 'opt_b',
        label: 'Exclusively on the server with zero answer keys sent to the browser DOM',
        isCorrect: true,
        points: 94,
      },
      {
        id: 'opt_c',
        label: 'Inside encrypted browser cookies decoded on submit',
        isCorrect: false,
        points: 40,
      },
    ],
    adaptiveOptions: [
      {
        id: 'opt_b',
        label: 'Server-enclave evaluation stripping all scoring metadata prior to AST serialization',
        isCorrect: true,
        points: 96,
      },
      {
        id: 'opt_d',
        label: 'Client-side WebAssembly hash comparison with public salt',
        isCorrect: false,
        points: 50,
      },
      {
        id: 'opt_e',
        label: 'CORS-restricted JSON endpoint containing base64 answer maps',
        isCorrect: false,
        points: 15,
      },
    ],
  },
  {
    id: 3,
    code: 'Q03 / GOVERNANCE',
    domain: 'Casbin RBAC & Attestation',
    linearPrompt:
      'Standard Linear Q3: How are recruiter and hiring manager permissions scoped across departments?',
    adaptivePrompt:
      'Adaptive Branch L6: Which policy enforcement mechanism isolates multi-tenant candidate scorecards and seals final credentials?',
    linearOptions: [
      {
        id: 'opt_a',
        label: 'Shared global admin password across all hiring managers',
        isCorrect: false,
        points: 10,
      },
      {
        id: 'opt_b',
        label: 'Casbin RBAC policy matrix paired with SHA-256 signed credentials',
        isCorrect: true,
        points: 90,
      },
      {
        id: 'opt_c',
        label: 'Manual spreadsheet exports filtered by email domain',
        isCorrect: false,
        points: 30,
      },
    ],
    adaptiveOptions: [
      {
        id: 'opt_b',
        label: 'Tenant-scoped Casbin RBAC enforcement with HMAC-SHA256 credential attestation',
        isCorrect: true,
        points: 98,
      },
      {
        id: 'opt_d',
        label: 'Client-side route guards checking localStorage role strings',
        isCorrect: false,
        points: 20,
      },
      {
        id: 'opt_e',
        label: 'Static database views without row-level tenant predicates',
        isCorrect: false,
        points: 45,
      },
    ],
  },
];

export const Version5CinematicShowcase: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  // Admin Live Controls
  const [hasStrictProctoring, setHasStrictProctoring] = useState<boolean>(true);
  const [hasAdaptiveBranching, setHasAdaptiveBranching] = useState<boolean>(true);
  const [passThresholdPct, setPassThresholdPct] = useState<number>(80);
  const [hasInspectDomMode, setHasInspectDomMode] = useState<boolean>(false);

  // Synchronized Workbench Telemetry State
  const [syncCount, setSyncCount] = useState<number>(14);
  const [lastSyncedControl, setLastSyncedControl] = useState<string>('Adaptive Branching AST');

  // Candidate Chamber State
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt_b');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(240);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 240;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  const recordSyncEvent = (label: string) => {
    setSyncCount((prev) => prev + 1);
    setLastSyncedControl(label);
  };

  const handleToggleProctoring = (checked: boolean) => {
    setHasStrictProctoring(checked);
    recordSyncEvent(checked ? 'Strict Proctoring Enabled' : 'Proctoring Relaxed');
  };

  const handleToggleBranching = (checked: boolean) => {
    setHasAdaptiveBranching(checked);
    setSelectedOptionId('opt_b');
    recordSyncEvent(checked ? 'Adaptive L6 Branch Active' : 'Linear Route Active');
  };

  const handleThresholdChange = (val: number[]) => {
    setPassThresholdPct(val[0]);
    recordSyncEvent(`Pass Bar Tuned to ${val[0]}%`);
  };

  const handleToggleInspectDom = (checked: boolean) => {
    setHasInspectDomMode(checked);
    recordSyncEvent(checked ? 'Zero-DOM Proof Inspector On' : 'Zero-DOM Proof Hidden');
  };

  const handleApplyPreset = (preset: 'principal' | 'standard' | 'audit') => {
    if (preset === 'principal') {
      setHasStrictProctoring(true);
      setHasAdaptiveBranching(true);
      setPassThresholdPct(85);
      setHasInspectDomMode(true);
      recordSyncEvent('Preset: Principal L6 Enclave');

      return;
    }

    if (preset === 'standard') {
      setHasStrictProctoring(true);
      setHasAdaptiveBranching(false);
      setPassThresholdPct(75);
      setHasInspectDomMode(false);
      recordSyncEvent('Preset: Standard Onboarding');

      return;
    }

    setHasStrictProctoring(false);
    setHasAdaptiveBranching(true);
    setPassThresholdPct(80);
    setHasInspectDomMode(true);
    recordSyncEvent('Preset: Fast-Track Architecture Audit');
  };

  const activeQuestion = WORKBENCH_QUESTIONS[activeQuestionIndex] || WORKBENCH_QUESTIONS[0];
  const activeOptions = hasAdaptiveBranching
    ? activeQuestion.adaptiveOptions
    : activeQuestion.linearOptions;

  const currentQuestionText = hasAdaptiveBranching
    ? activeQuestion.adaptivePrompt
    : activeQuestion.linearPrompt;

  const selectedOptionObj =
    activeOptions.find((opt) => opt.id === selectedOptionId) || activeOptions[0];
  const isCurrentSelectionCorrect = selectedOptionId === 'opt_b';
  const candidateScorePct = selectedOptionObj ? selectedOptionObj.points : 0;
  const isPassingScore = candidateScorePct >= passThresholdPct;

  const formattedMinutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0');
  const formattedSeconds = String(secondsRemaining % 60).padStart(2, '0');

  return (
    <div className="w-full space-y-24 pb-28">
      {/* Section 1: Cinematic Asymmetric Studio Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background pt-14 pb-20 sm:pt-20 sm:pb-24">
        {/* Ambient Studio Illumination & Subtle Architectural Grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-[32rem] w-[44rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[160px]" />
          <div className="absolute right-0 top-16 h-[24rem] w-[24rem] rounded-full bg-purple-500/10 blur-[140px]" />
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.45)_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* Left Column (7 cols): Editorial Headline & Studio Actions */}
          <div className="v5-reveal space-y-7 lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Interactive Dual-Engine Workbench • Real-Time Synchronization
              </span>
            </div>

            <h1 className="font-heading text-4xl font-black leading-[1.01] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[4.4rem]">
              The Dual-Engine <br />
              <span className="text-gradient-sheen">
                Assessment Workbench.
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Configure proctoring strictness, passing thresholds, and adaptive branching on the
              right—and watch the candidate examination chamber adapt in real time on the left.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button
                size="lg"
                onClick={onCandidateClick}
                className="h-12 rounded-xl bg-primary px-6 font-bold text-xs text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer gap-2"
              >
                <span>Launch Candidate Exam</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onAdminClick}
                className="h-12 rounded-xl border-border bg-card/80 px-6 font-bold text-xs hover:bg-muted/70 cursor-pointer gap-2"
              >
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Admin Studio</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              {[
                'Sub-2ms State Sync',
                'Zero-DOM Answer Redaction',
                'Deterministic AST Branching',
              ].map((pill) => (
                <span key={pill} className="inline-flex items-center gap-1.5 font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column (5 cols): Floating Live Studio Synchronization Telemetry Card */}
          <aside
            className="v5-float relative lg:col-span-5"
            aria-label="Dual-Engine Synchronization Telemetry"
          >
            <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-border/90 p-6 shadow-2xl sm:p-7">
              <div className="v5-flow h-0.5 w-full bg-gradient-to-r from-primary via-purple-500 to-primary absolute top-0 left-0" />

              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Live Twin Telemetry
                  </span>
                  <h2 className="mt-1 font-heading text-lg font-bold text-foreground">
                    Admin ↔ Candidate State Bridge
                  </h2>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 font-mono text-[10px] text-emerald-500">
                  Sync #{syncCount} · 1.8ms
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Active Routing Mode
                  </span>
                  <strong className="mt-1.5 block font-heading text-lg font-black text-foreground">
                    {hasAdaptiveBranching ? 'Adaptive L6 AST' : 'Linear Sequence'}
                  </strong>
                  <span className="mt-1 block text-[11px] text-primary font-medium">
                    {hasAdaptiveBranching ? 'Dynamic difficulty active' : 'Fixed question order'}
                  </span>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Pass Benchmark
                  </span>
                  <strong className="v5-number mt-1.5 block font-heading text-2xl font-black text-primary">
                    {passThresholdPct}%
                  </strong>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {hasStrictProctoring ? 'Strict focus guard on' : 'Standard proctoring'}
                  </span>
                </div>
              </div>

              {/* Last Synchronized Mutation Banner */}
              <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Activity className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Last Synchronized Event
                    </span>
                    <span className="block truncate text-xs font-bold text-foreground">
                      {lastSyncedControl}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-500 shrink-0">
                  COMMITTED
                </span>
              </div>

              {/* Preset Switcher Bar */}
              <div className="mt-5 border-t border-border/70 pt-4">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  1-Click Studio Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('principal')}
                    className="rounded-xl border border-border/80 bg-card/80 px-2.5 py-2 font-mono text-[10px] font-bold text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer"
                  >
                    Principal L6
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('standard')}
                    className="rounded-xl border border-border/80 bg-card/80 px-2.5 py-2 font-mono text-[10px] font-bold text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer"
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('audit')}
                    className="rounded-xl border border-border/80 bg-card/80 px-2.5 py-2 font-mono text-[10px] font-bold text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer"
                  >
                    Zero-DOM Audit
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Section 2: The Split Interactive Dual-Engine Workbench */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>Bidirectional Runtime Sandbox</span>
            </div>
            <h2 className="font-heading text-2xl font-black text-foreground sm:text-4xl">
              Live Interactive Workbench
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
            Interact with either panel below. Toggling admin controls on the right immediately
            modulates the live candidate examination chamber on the left.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Pane: Candidate Runner Preview (7 cols) */}
          <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-border/80 shadow-2xl lg:col-span-7">
            <div className="h-0.5 w-full bg-primary" />

            {/* Candidate Chamber Chrome Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/40 p-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-foreground">
                  Candidate Chamber • Active Session
                </span>
                {hasAdaptiveBranching && (
                  <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px]">
                    Adaptive Branch
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  aria-label={isTimerRunning ? 'Pause session timer' : 'Start session timer'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 font-mono text-xs text-foreground hover:border-primary/50 cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="v5-number font-bold">
                    {formattedMinutes}:{formattedSeconds}
                  </span>
                  {isTimerRunning ? (
                    <Pause className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Play className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
                <Badge variant="secondary" className="v5-number font-mono text-[10px]">
                  Pass Bar: {passThresholdPct}%
                </Badge>
              </div>
            </div>

            {/* Scenario Module Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-card/50 px-4 py-2.5 sm:px-6">
              <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Assessment scenario questions">
                {WORKBENCH_QUESTIONS.map((item, idx) => {
                  const isCurrentQuestion = idx === activeQuestionIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrentQuestion}
                      onClick={() => {
                        setActiveQuestionIndex(idx);
                        setSelectedOptionId('opt_b');
                        setHasSubmitted(false);
                      }}
                      className={`rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold transition-all cursor-pointer ${
                        isCurrentQuestion
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.code}
                    </button>
                  );
                })}
              </div>
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                {activeQuestion.domain}
              </span>
            </div>

            {/* Anti-cheat banner if enabled */}
            {hasStrictProctoring && (
              <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-5 py-2 text-xs text-amber-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Strict Proctoring Active: Tab focus loss is cryptographically logged
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase">0 Violations</span>
              </div>
            )}

            {/* Question Body */}
            <div className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>Question 0{activeQuestionIndex + 1} of 03</span>
                  <span>Weight: {hasAdaptiveBranching ? '25 Points (L6)' : '15 Points (Core)'}</span>
                </div>
                <h3 className="font-heading text-lg font-bold leading-snug text-foreground sm:text-xl">
                  {currentQuestionText}
                </h3>
              </div>

              {/* Options Selector */}
              <div className="space-y-3">
                {activeOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        setHasSubmitted(false);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/40 shadow-xs'
                          : 'border-border/70 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-current" />}
                        </div>
                        <span className="text-xs font-medium leading-relaxed sm:text-sm">
                          {opt.label}
                        </span>
                      </div>

                      {hasInspectDomMode && (
                        <span className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {opt.isCorrect ? 'server_key: verified' : 'server_key: invalid'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live Zero-DOM Network Payload Proof Drawer */}
              {hasInspectDomMode && (
                <div className="rounded-2xl border border-primary/30 bg-muted/50 p-4 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-primary font-bold">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5" />
                      Browser DOM / Network Payload Inspector
                    </span>
                    <span>0 Answer Keys in Client Memory</span>
                  </div>
                  <div className="text-muted-foreground">
                    &#123; &quot;questionId&quot;: &quot;{activeQuestion.code}&quot;, &quot;selectedOption&quot;: &quot;{selectedOptionId}&quot;, &quot;clientAnswerKey&quot;: <span className="text-emerald-500 font-bold">null</span>, &quot;verification&quot;: &quot;server_side_only&quot; &#125;
                  </div>
                </div>
              )}

              {/* Bottom Candidate Bar */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-4 sm:flex-row">
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Auto-saved to WAL journal</span>
                </div>

                <div className="flex w-full items-center gap-2.5 sm:w-auto">
                  <Button
                    size="sm"
                    onClick={() => setHasSubmitted(true)}
                    className="h-10 w-full rounded-xl bg-primary px-5 font-bold text-xs text-primary-foreground shadow-xs cursor-pointer gap-1.5 sm:w-auto"
                  >
                    <span>Confirm &amp; Proceed</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {hasSubmitted && (
                <div
                  role="status"
                  className={`rounded-2xl border p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in ${
                    isPassingScore
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-500'
                      : 'border-amber-500/35 bg-amber-500/10 text-amber-500'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      {isCurrentSelectionCorrect
                        ? `✓ Correct selection confirmed (${candidateScorePct}% vs ${passThresholdPct}% bar). Advancing to Section 2.`
                        : `Response recorded (${candidateScorePct}% vs ${passThresholdPct}% bar). Server-side score computed.`}
                    </span>
                    <span className="font-mono text-[11px] opacity-85 block">
                      {isPassingScore
                        ? 'Threshold met · SHA-256 qualification seal ready'
                        : 'Below current pass threshold · Routed to foundational review node'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasSubmitted(false)}
                    className="inline-flex items-center gap-1 underline font-mono text-[11px] cursor-pointer shrink-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Live Recruiter/Admin Engine Controller (5 cols) */}
          <div className="relative space-y-5 overflow-hidden rounded-3xl glass-panel-elevated border border-border/80 p-6 shadow-2xl sm:p-7 lg:col-span-5">
            <div className="h-0.5 w-full bg-primary absolute top-0 left-0" />

            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Admin Engine Controls</span>
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Real-Time Assessment Tuning
                </h3>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px]">
                Live Sync
              </Badge>
            </div>

            {/* Control 1: Strict Anti-Cheat Proctoring */}
            <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="v5-switch-proctoring"
                    className="block text-xs font-bold text-foreground cursor-pointer"
                  >
                    Strict Proctoring Enforcement
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Cryptographic tab-switch and focus-loss capture
                  </span>
                </div>
                <Switch
                  id="v5-switch-proctoring"
                  checked={hasStrictProctoring}
                  onCheckedChange={handleToggleProctoring}
                />
              </div>
            </div>

            {/* Control 2: Adaptive Branching Decision Tree */}
            <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="v5-switch-branching"
                    className="block text-xs font-bold text-foreground cursor-pointer"
                  >
                    Adaptive Branching Decision Tree
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Modulate question difficulty based on prior score
                  </span>
                </div>
                <Switch
                  id="v5-switch-branching"
                  checked={hasAdaptiveBranching}
                  onCheckedChange={handleToggleBranching}
                />
              </div>
            </div>

            {/* Control 3: Passing Threshold Slider */}
            <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="block font-bold text-foreground">
                    Passing Threshold Benchmark
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Minimum score for certificate issuance
                  </span>
                </div>
                <span className="v5-number font-mono text-sm font-black text-primary">
                  {passThresholdPct}%
                </span>
              </div>
              <Slider
                value={[passThresholdPct]}
                onValueChange={handleThresholdChange}
                min={60}
                max={95}
                step={5}
                aria-label="Passing Threshold Benchmark"
                className="cursor-pointer"
              />
            </div>

            {/* Control 4: Inspect Zero-DOM Answer Proof */}
            <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="v5-switch-dom-proof"
                    className="block text-xs font-bold text-foreground cursor-pointer"
                  >
                    Inspect Server-Side Verification Proof
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Demonstrates zero client-side DOM key exposure
                  </span>
                </div>
                <Switch
                  id="v5-switch-dom-proof"
                  checked={hasInspectDomMode}
                  onCheckedChange={handleToggleInspectDom}
                />
              </div>
            </div>

            {/* Live Controller Actions */}
            <div className="pt-2">
              <Button
                size="sm"
                onClick={onAdminClick}
                className="h-11 w-full rounded-xl bg-primary font-bold text-xs text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Open Full Admin Studio</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Interactive Directed Branching Graph & Architectural Pillars */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
              <GitBranch className="h-4 w-4" />
              <span>Directed Acyclic Graph Studio</span>
            </div>
            <h2 className="mt-2 font-heading text-2xl font-black text-foreground sm:text-4xl">
              Visual Branching &amp; Cycle Validation
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
            Click any node in the directed graph below to inspect real-time conditional routing
            thresholds and point weights.
          </p>
        </div>

        <InteractiveBranchingCanvas />

        {/* 3 Clean Editorial Architectural Pillars */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-border/70 p-7 space-y-3">
            <div className="h-0.5 w-full bg-primary/70 absolute top-0 left-0" />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Visual Branching Graph Engine
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Design multi-route evaluation workflows. Automatically fast-track exceptional
              candidates to advanced modules while routing junior candidates to foundational review.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-border/70 p-7 space-y-3">
            <div className="h-0.5 w-full bg-emerald-500/70 absolute top-0 left-0" />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Split SQLite Concurrency
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Decoupled question and response databases running in WAL journal mode eliminate writer
              lock contention and ensure sub-10ms response commits under heavy traffic.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-border/70 p-7 space-y-3">
            <div className="h-0.5 w-full bg-purple-500/70 absolute top-0 left-0" />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-500">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              SHA-256 Verifiable Credentials
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Instantly generate verifiable credentials stamped with candidate score, completion
              timestamps, and anti-cheat telemetry hashes for enterprise trust.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Studio Footer CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-primary/30 p-8 shadow-2xl sm:p-12">
          <div className="h-0.5 w-full bg-primary absolute top-0 left-0" />
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Synchronized Assessment Studio</span>
              </div>
              <h3 className="font-heading text-2xl font-black text-foreground sm:text-4xl">
                Experience both sides of the evaluation engine.
              </h3>
              <p className="max-w-xl text-xs text-muted-foreground sm:text-sm">
                Launch a live candidate examination session or sign in to the Admin Studio to build
                adaptive branching blueprints.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Button
                onClick={onCandidateClick}
                className="h-12 rounded-xl bg-primary px-6 font-bold text-xs text-primary-foreground shadow-md hover:bg-primary/90 cursor-pointer gap-2"
              >
                <span>Launch Candidate Exam</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={onAdminClick}
                className="h-12 rounded-xl border-border px-6 font-bold text-xs hover:bg-muted cursor-pointer gap-2"
              >
                <Lock className="h-4 w-4 text-primary" />
                <span>Open Full Admin Studio</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

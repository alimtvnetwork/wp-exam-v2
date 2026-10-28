import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  Fingerprint,
  Gauge,
  KeyRound,
  LockKeyhole,
  Play,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutProps } from './version-1-classic';

type SimulationStage = 'idle' | 'request' | 'scoring' | 'signed';

interface PipelineStep {
  title: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    title: 'Token verified',
    label: '01 / Authenticate',
    description: 'Single-use access is validated before assessment content is released.',
    icon: KeyRound,
  },
  {
    title: 'Session isolated',
    label: '02 / Contain',
    description: 'Each candidate runs inside a tenant-scoped, policy-governed boundary.',
    icon: LockKeyhole,
  },
  {
    title: 'Scoring committed',
    label: '03 / Evaluate',
    description: 'Answers are scored server-side and journaled without exposing keys.',
    icon: Database,
  },
  {
    title: 'Result signed',
    label: '04 / Attest',
    description: 'A tamper-evident result is issued for downstream hiring decisions.',
    icon: Fingerprint,
  },
];

const CONSOLE_ROWS = [
  { time: '09:42:16.122', event: 'session.accepted', detail: 'edge/eu-west-03', tone: 'text-cyan-300' },
  { time: '09:42:16.128', event: 'policy.resolved', detail: 'tenant_7f2 · strict', tone: 'text-emerald-300' },
  { time: '09:42:16.134', event: 'runtime.isolated', detail: 'sandbox/c-18420', tone: 'text-cyan-300' },
  { time: '09:42:16.139', event: 'score.committed', detail: 'wal · durable', tone: 'text-amber-300' },
];

export const Version6TelemetryHub: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  const [candidateToken, setCandidateToken] = useState('TOK-OPS-18420');
  const [simulationStage, setSimulationStage] = useState<SimulationStage>('idle');
  const [latencyMs, setLatencyMs] = useState(2.14);
  const [commitCount, setCommitCount] = useState(18420);
  const timerIds = useRef<number[]>([]);

  const hasValidToken = candidateToken.trim().length >= 6;
  const isSimulationBusy = simulationStage === 'request' || simulationStage === 'scoring';
  const isSimulationComplete = simulationStage === 'signed';

  useEffect(() => {
    return () => {
      timerIds.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const clearSimulationTimers = () => {
    timerIds.current.forEach((timerId) => window.clearTimeout(timerId));
    timerIds.current = [];
  };

  const handleRunSimulation = () => {
    clearSimulationTimers();
    setSimulationStage('request');

    const nextLatency = Number((Math.random() * 1.1 + 1.35).toFixed(2));
    const scoringTimer = window.setTimeout(() => setSimulationStage('scoring'), 650);
    const signedTimer = window.setTimeout(() => {
      setLatencyMs(nextLatency);
      setCommitCount((currentCount) => currentCount + 1);
      setSimulationStage('signed');
    }, 1450);

    timerIds.current = [scoringTimer, signedTimer];
  };

  const handleCandidateEnter = () => {
    if (hasValidToken) {
      onCandidateClick();
    }
  };

  const getStageClassName = (stage: SimulationStage) => {
    if (simulationStage === stage) {
      return 'border-cyan-400/70 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]';
    }

    if (isSimulationComplete) {
      return 'border-emerald-400/40 bg-emerald-400/5 text-emerald-100';
    }

    return 'border-white/10 bg-white/[0.025] text-slate-400';
  };

  return (
    <main className="w-full overflow-hidden bg-[#05090d] text-slate-100">
      <section className="relative border-b border-cyan-400/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 top-0 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[150px]" />
          <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-amber-400/[0.06] blur-[120px]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(34,211,238,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.06)_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:grid-cols-12 lg:gap-8 lg:pt-28">
          <div className="v6-reveal motion-reduce:animate-none lg:col-span-7">
            <Badge className="mb-7 border border-cyan-300/25 bg-cyan-400/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200 hover:bg-cyan-400/[0.08]">
              <CircleDot className="mr-2 h-3 w-3 fill-emerald-400 text-emerald-400" aria-hidden="true" />
              Assessment operations · online
            </Badge>

            <h1 className="max-w-4xl font-heading text-4xl font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              Run every assessment like a
              <span className="block text-cyan-300">mission-critical system.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Launch secure candidate sessions, observe scoring in real time, and deliver
              audit-ready results from one operational command center.
            </p>

            <div className="mt-9 max-w-2xl rounded-2xl border border-cyan-300/20 bg-slate-950/75 p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-4">
              <label htmlFor="v6-candidate-token" className="mb-2.5 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                Candidate access token
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Input
                    id="v6-candidate-token"
                    value={candidateToken}
                    onChange={(event) => setCandidateToken(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleCandidateEnter();
                      }
                    }}
                    aria-describedby="v6-token-help"
                    autoComplete="off"
                    placeholder="Enter your secure token"
                    className="h-12 border-white/10 bg-white/[0.04] pr-11 font-mono text-sm text-white placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20"
                  />
                  {hasValidToken && (
                    <CheckCircle2 aria-label="Token format accepted" className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  )}
                </div>
                <Button
                  onClick={handleCandidateEnter}
                  disabled={!hasValidToken}
                  className="h-12 shrink-0 bg-cyan-300 px-5 font-bold text-slate-950 shadow-lg shadow-cyan-950/50 hover:bg-cyan-200"
                >
                  Start assessment
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div id="v6-token-help" className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Encrypted in transit · Single-session access</span>
                <button
                  type="button"
                  onClick={onAdminClick}
                  className="w-fit font-semibold text-cyan-300 transition-colors hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  Open admin control room <ChevronRight className="inline h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <aside className="v6-float motion-reduce:animate-none relative lg:col-span-5 lg:pl-5" aria-label="Operational proof">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#091118]/95 p-5 shadow-2xl shadow-black/60 sm:p-7">
              <div aria-hidden="true" className="v6-scan motion-reduce:animate-none absolute inset-x-0 top-0 h-px bg-cyan-300/80" />
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Live control plane</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">Global assessment health</p>
                </div>
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <span aria-hidden="true" className="v6-signal motion-reduce:animate-none h-2 w-2 rounded-full bg-emerald-400" />
                  All systems nominal
                </span>
              </div>

              <div className="py-7">
                <div className="flex items-end gap-3">
                  <strong className="font-heading text-6xl font-black tracking-[-0.06em] text-white sm:text-7xl">99.98</strong>
                  <span className="pb-2 text-xl font-bold text-cyan-300">%</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Verified completion integrity across active sessions</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <Clock3 className="mb-3 h-4 w-4 text-cyan-300" aria-hidden="true" />
                  <strong className="text-xl text-white">{latencyMs} ms</strong>
                  <p className="mt-1 text-[11px] text-slate-500">Commit latency</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <Users className="mb-3 h-4 w-4 text-amber-300" aria-hidden="true" />
                  <strong className="text-xl text-white">2,408</strong>
                  <p className="mt-1 text-[11px] text-slate-500">Sessions today</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[10px] text-slate-500">
                <div className="mb-2 flex items-center justify-between">
                  <span>THROUGHPUT / 60 MIN</span>
                  <span className="text-emerald-300">+12.4%</span>
                </div>
                <div aria-hidden="true" className="flex h-14 items-end gap-1">
                  {[34, 48, 39, 58, 53, 72, 62, 84, 70, 91, 77, 96].map((height, index) => (
                    <span
                      key={`${height}-${index}`}
                      className="v6-shimmer motion-reduce:animate-none flex-1 rounded-sm bg-cyan-300/50"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="operations-title">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">Operational visibility</p>
            <h2 id="operations-title" className="mt-3 max-w-2xl font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
              See the decision system work.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Follow every handoff from request receipt to a durable, signed result.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071017] shadow-2xl lg:col-span-7">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <Terminal className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                ops-stream / production
              </div>
              <span className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
                <span aria-hidden="true" className="v6-signal motion-reduce:animate-none h-1.5 w-1.5 rounded-full bg-emerald-400" />
                STREAMING
              </span>
            </div>
            <div className="min-h-[360px] p-4 font-mono text-[11px] sm:p-6 sm:text-xs">
              <div className="mb-5 grid grid-cols-[5.75rem_1fr] gap-3 text-slate-600 sm:grid-cols-[7rem_1fr_1fr]">
                <span>TIMESTAMP</span><span>EVENT</span><span className="hidden sm:block">CONTEXT</span>
              </div>
              <div className="space-y-1">
                {CONSOLE_ROWS.map((row) => (
                  <div key={row.event} className="grid grid-cols-[5.75rem_1fr] gap-3 rounded-lg px-2 py-3 hover:bg-white/[0.03] sm:grid-cols-[7rem_1fr_1fr]">
                    <span className="text-slate-600">{row.time}</span>
                    <span className={row.tone}>{row.event}</span>
                    <span className="col-start-2 text-slate-500 sm:col-start-auto">{row.detail}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-5 text-cyan-300">
                <span className="text-slate-600">$</span>
                <span>awaiting next assessment event</span>
                <span aria-hidden="true" className="v6-signal motion-reduce:animate-none h-3 w-1.5 bg-cyan-300" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-300/15 bg-[#0a1219] p-5 shadow-2xl sm:p-7 lg:col-span-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">Interactive simulation</p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">Trace a secure evaluation</h3>
              </div>
              <Gauge className="h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
            </div>

            <div className="mt-7 space-y-3">
              {[
                { stage: 'request' as const, icon: Play, title: 'Request received', detail: 'Token + response envelope' },
                { stage: 'scoring' as const, icon: ServerCog, title: 'Isolated scoring', detail: 'Server-side policy runtime' },
                { stage: 'signed' as const, icon: Fingerprint, title: 'Signed result', detail: `Commit #${commitCount}` },
              ].map((item, index) => {
                const StageIcon = item.icon;

                return (
                  <div key={item.stage} className={`relative flex items-center gap-4 rounded-xl border p-4 transition-colors ${getStageClassName(item.stage)}`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-black/20">
                      {isSimulationComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : <StageIcon className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] opacity-60">{item.detail}</span>
                    </span>
                    <span className="font-mono text-[10px] opacity-50">0{index + 1}</span>
                  </div>
                );
              })}
            </div>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-5 min-h-16 rounded-xl border border-white/10 bg-black/25 p-4 font-mono text-xs"
            >
              {simulationStage === 'idle' && <span className="text-slate-500">Ready to dispatch a sample assessment response.</span>}
              {simulationStage === 'request' && <span className="text-cyan-300">Routing encrypted request to isolated runtime…</span>}
              {simulationStage === 'scoring' && <span className="text-amber-300">Scoring server-side and preparing durable commit…</span>}
              {isSimulationComplete && (
                <span className="text-emerald-300">
                  Result signed · {latencyMs} ms latency · commit #{commitCount}
                </span>
              )}
            </div>

            <Button
              onClick={handleRunSimulation}
              disabled={isSimulationBusy}
              className="mt-5 h-12 w-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
            >
              {isSimulationBusy ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Activity className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {isSimulationBusy ? 'Simulation running' : isSimulationComplete ? 'Run another simulation' : 'Run secure simulation'}
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">Trust pipeline</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
              Proof at every operational boundary.
            </h2>
          </div>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {PIPELINE_STEPS.map((step) => {
              const StepIcon = step.icon;

              return (
                <li key={step.title} className="group bg-[#080e13] p-6 transition-colors hover:bg-cyan-400/[0.045] sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300">{step.label}</span>
                    <StepIcon className="h-5 w-5 text-slate-500 transition-colors group-hover:text-cyan-300" aria-hidden="true" />
                  </div>
                  <h3 className="mt-10 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="relative px-4 py-20 sm:px-6 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-72 max-w-4xl rounded-full bg-cyan-500/[0.07] blur-[140px]" />
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#091219] px-5 py-14 text-center shadow-2xl sm:px-10 sm:py-20">
          <Sparkles className="mx-auto h-6 w-6 text-amber-300" aria-hidden="true" />
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
            Turn assessment operations into a competitive advantage.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Give candidates a focused experience and give your team the control, evidence, and speed to hire with confidence.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={onCandidateClick}
              className="h-12 bg-cyan-300 px-6 font-bold text-slate-950 hover:bg-cyan-200"
            >
              Begin candidate assessment
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              onClick={onAdminClick}
              variant="outline"
              className="h-12 border-white/15 bg-white/[0.03] px-6 font-bold text-white hover:bg-white/[0.08] hover:text-white"
            >
              Explore admin operations
              <ShieldCheck className="ml-2 h-4 w-4 text-emerald-300" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

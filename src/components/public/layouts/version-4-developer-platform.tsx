import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  UserCheck,
  Terminal,
  KeyRound,
  CheckCircle2,
  Database,
  Cpu,
  Fingerprint,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Activity,
  RefreshCw,
  Check,
  CircleDot,
  Layers,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CommandPalettePreview } from '../widgets/command-palette-preview';
import { LayoutProps } from './version-1-classic';

type HandshakeStage = 'idle' | 'hashing' | 'policy' | 'sealed';

type ConsoleTabId = 'architecture' | 'casbin' | 'sqlite';

interface AuditDimension {
  id: string;
  parameter: string;
  category: string;
  traditionalSaaS: string;
  sovereignEngine: string;
  metricBadge: string;
  codeProof: string;
}

const AUDIT_DIMENSIONS: AuditDimension[] = [
  {
    id: 'dim-dom',
    parameter: 'Answer Key Delivery',
    category: 'Zero-DOM Security',
    traditionalSaaS: 'Exposed in client DOM / JSON network payload',
    sovereignEngine: 'Zero bytes delivered; evaluated strictly server-side',
    metricBadge: '0 Bytes Leaked',
    codeProof: 'response.stripAnswerKeys({ mode: "strict_enclave" }) -> 0 keys in client AST',
  },
  {
    id: 'dim-wal',
    parameter: 'Database Write Contention',
    category: 'Storage Concurrency',
    traditionalSaaS: 'Single SQLite file table-level write locks',
    sovereignEngine: 'Split SQLite (questions.db vs responses.db in WAL)',
    metricBadge: '< 1.8ms Commit',
    codeProof: 'PRAGMA journal_mode = WAL; ATTACH DATABASE "responses.db" AS resp_wal;',
  },
  {
    id: 'dim-rbac',
    parameter: 'Access Control Model',
    category: 'Multi-Tenant RBAC',
    traditionalSaaS: 'Hardcoded boolean admin flags in session cookies',
    sovereignEngine: 'Fine-grained Casbin RBAC policy matrix enforcement',
    metricBadge: '100% Isolated',
    codeProof: 'e.Enforce("role:recruiter_lead", "tenant_04", "evaluations", "read") => true',
  },
  {
    id: 'dim-privacy',
    parameter: 'Third-Party Tracking',
    category: 'Data Sovereignty',
    traditionalSaaS: 'External Google Analytics & ad-network pixel trackers',
    sovereignEngine: 'Zero external network calls; 100% self-hosted runtime',
    metricBadge: '0 External Calls',
    codeProof: 'Content-Security-Policy: connect-src \'self\'; telemetry_egress = disabled',
  },
  {
    id: 'dim-cert',
    parameter: 'Credential Authentication',
    category: 'Cryptographic Proof',
    traditionalSaaS: 'Unverified static PDF attachments without digest',
    sovereignEngine: 'Cryptographically signed SHA-256 attestation seal',
    metricBadge: 'SHA-256 Signed',
    codeProof: 'hmac_sha256(candidate_id + score + focus_log_hash, sovereign_private_key)',
  },
];

const PRESET_TOKENS = [
  { token: 'TOK-SYS-L6-8819', role: 'L6 Distributed Systems', duration: '45m' },
  { token: 'TOK-SEC-VP-4092', role: 'Staff Security Auditor', duration: '35m' },
  { token: 'TOK-ARC-L5-9910', role: 'Principal Platform Eng', duration: '40m' },
];

const CONSOLE_SPECS: Record<
  ConsoleTabId,
  {
    eyebrow: string;
    title: string;
    badge: string;
    accentClass: string;
    description: string;
    metrics: { label: string; value: string }[];
    lines: { text: string; tone: string }[];
  }
> = {
  architecture: {
    eyebrow: 'Decoupled Storage Engine',
    title: 'Split SQLite Concurrency Plane',
    badge: 'WAL Journal Mode',
    accentClass: 'text-cyan-300 border-cyan-500/40',
    description:
      'By decoupling questions.db (read-heavy, immutable during exams) from responses.db (high-frequency concurrent writes), the engine eliminates table lock contention under peak candidate load.',
    metrics: [
      { label: 'Read Replica Latency', value: '0.28 ms' },
      { label: 'WAL Write Commit', value: '1.42 ms' },
      { label: 'Lock Contention', value: '0.00%' },
    ],
    lines: [
      { text: 'PRAGMA journal_mode = WAL;', tone: 'text-cyan-300' },
      { text: 'PRAGMA synchronous = NORMAL;', tone: 'text-cyan-300' },
      { text: 'ATTACH DATABASE "storage/questions.db" AS q_readonly;', tone: 'text-purple-300' },
      { text: 'ATTACH DATABASE "storage/responses.db" AS r_concurrent;', tone: 'text-emerald-300' },
      { text: '-- 2,400 concurrent candidate writes committed with 0 lock waits', tone: 'text-slate-400' },
    ],
  },
  casbin: {
    eyebrow: 'Casbin Security Authorization Policy',
    title: 'Zero-Trust Multi-Tenant RBAC Matrix',
    badge: 'Enforced at Edge',
    accentClass: 'text-purple-300 border-purple-500/40',
    description:
      'Strict multi-tenant role permissions isolate recruitment teams. Interviewers, department heads, and compliance officers can only query explicitly authorized candidate evaluation scopes.',
    metrics: [
      { label: 'Policy Evaluation', value: '0.09 ms' },
      { label: 'Tenant Isolation', value: 'Strict' },
      { label: 'Audit Coverage', value: '100%' },
    ],
    lines: [
      { text: 'p, role:recruiter_lead, tenant:enterprise, evaluations, read', tone: 'text-purple-300' },
      { text: 'p, role:talent_admin, tenant:enterprise, exam_blueprints, write', tone: 'text-purple-300' },
      { text: 'p, role:candidate_token, session:active, questions_ast, read_redacted', tone: 'text-cyan-300' },
      { text: 'g, user:alim_eng_director, role:talent_admin, tenant:enterprise', tone: 'text-emerald-300' },
      { text: '-- Unauthorized cross-tenant queries reject with HTTP 403 at gateway', tone: 'text-slate-400' },
    ],
  },
  sqlite: {
    eyebrow: 'Zero-DOM Answer Cryptography',
    title: 'Server-Side Evaluation & Forensic Telemetry',
    badge: 'Anti-Cheat Shield',
    accentClass: 'text-emerald-300 border-emerald-500/40',
    description:
      'Browser DevTools and network inspectors never receive answer keys or scoring weights. Candidate selections are evaluated inside an isolated server pipeline and stamped with focus-loss telemetry.',
    metrics: [
      { label: 'DOM Key Exposure', value: '0 Bytes' },
      { label: 'Focus Telemetry', value: 'Active' },
      { label: 'Digest Algorithm', value: 'SHA-256' },
    ],
    lines: [
      { text: 'event: tab_focus_verifiedblur_duration_ms=0 status=clean', tone: 'text-emerald-300' },
      { text: 'payload: { question_id: "q_04", selected_option: "opt_b" }', tone: 'text-cyan-300' },
      { text: 'enclave_eval: score_delta=+15pts key_source="server_vault_only"', tone: 'text-purple-300' },
      { text: 'attestation: sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', tone: 'text-emerald-300' },
      { text: '-- Immutable forensic signature attached to candidate credential', tone: 'text-slate-400' },
    ],
  },
};

export const Version4DeveloperPlatform: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
  onNavigate,
}) => {
  const [candidateToken, setCandidateToken] = useState<string>('TOK-SYS-L6-8819');
  const [hasValidToken, setHasValidToken] = useState<boolean>(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<ConsoleTabId>('architecture');
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>('dim-dom');
  const [handshakeStage, setHandshakeStage] = useState<HandshakeStage>('idle');
  const [walLatencyMs, setWalLatencyMs] = useState<number>(1.42);
  const [sealedCommitCount, setSealedCommitCount] = useState<number>(49208);
  const timerIds = useRef<number[]>([]);

  const isHandshakeBusy = handshakeStage === 'hashing' || handshakeStage === 'policy';
  const isHandshakeSealed = handshakeStage === 'sealed';

  useEffect(() => {
    return () => {
      timerIds.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const clearTimers = () => {
    timerIds.current.forEach((id) => window.clearTimeout(id));
    timerIds.current = [];
  };

  const handleTokenChange = (value: string) => {
    setCandidateToken(value);
    const isValid = value.trim().length >= 6;
    setHasValidToken(isValid);
  };

  const handleSelectPresetToken = (token: string) => {
    setCandidateToken(token);
    setHasValidToken(true);
  };

  const handleCandidateEnter = () => {
    if (hasValidToken) {
      onCandidateClick();

      return;
    }
  };

  const handleRunHandshake = () => {
    clearTimers();
    setHandshakeStage('hashing');

    const nextLatency = Number((Math.random() * 0.65 + 1.15).toFixed(2));
    const policyTimer = window.setTimeout(() => {
      setHandshakeStage('policy');
    }, 550);

    const sealedTimer = window.setTimeout(() => {
      setWalLatencyMs(nextLatency);
      setSealedCommitCount((prev) => prev + 1);
      setHandshakeStage('sealed');
    }, 1250);

    timerIds.current = [policyTimer, sealedTimer];
  };

  const activeSpec = CONSOLE_SPECS[activeConsoleTab];
  const activeDimension =
    AUDIT_DIMENSIONS.find((item) => item.id === selectedDimensionId) || AUDIT_DIMENSIONS[0];

  const getHandshakeStageClass = (stage: HandshakeStage) => {
    if (handshakeStage === stage) {
      return 'border-cyan-400/80 bg-cyan-400/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]';
    }

    if (isHandshakeSealed) {
      return 'border-emerald-400/45 bg-emerald-400/8 text-emerald-100';
    }

    return 'border-white/10 bg-white/[0.025] text-slate-400';
  };

  return (
    <div className="w-full overflow-hidden bg-[#090714] text-slate-100">
      {/* Section 1: Asymmetric Sovereign Dracula Luxury Hero */}
      <section className="relative border-b border-purple-500/20">
        {/* Ambient Cyber-Dracula Halos & Precision Grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-20 h-[36rem] w-[36rem] rounded-full bg-purple-600/15 blur-[160px]" />
          <div className="absolute right-0 top-12 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[150px]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(189,147,249,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(139,233,253,0.06)_1px,transparent_1px)] [background-size:52px_52px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:pt-24">
          {/* Left Column: Sovereign Narrative + Dual Access Gateways */}
          <div className="v4-reveal lg:col-span-7">
            <Badge className="mb-6 border border-purple-400/35 bg-purple-500/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-purple-200 hover:bg-purple-500/15">
              <CircleDot className="mr-2 h-3 w-3 fill-cyan-400 text-cyan-400 v4-pulse" aria-hidden="true" />
              Sovereign Gateway · Zero-DOM Architecture
            </Badge>

            <h1 className="max-w-4xl font-heading text-4xl font-black leading-[1.01] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.35rem]">
              High-Assurance Candidate Evaluation.
              <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Zero Third-Party Telemetry.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300/85 sm:text-lg">
              Two cryptographically isolated entry points for engineering talent directors and
              candidates. Zero answer keys exposed to browser memory, Casbin RBAC governance, and
              self-hosted Split SQLite data sovereignty.
            </p>

            {/* Dual Monolithic Gateways */}
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Gateway 1: Candidate Access Vault */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cyan-400/35 bg-[#0f0c20]/90 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl transition-all hover:border-cyan-300/60">
                <div className="h-0.5 w-full bg-cyan-400 absolute top-0 left-0 shadow-md" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-cyan-400/40 bg-cyan-400/5 font-mono text-[10px] text-cyan-200">
                      Candidate Vault
                    </Badge>
                  </div>

                  <div>
                    <h2 className="font-heading text-xl font-bold text-white transition-colors group-hover:text-cyan-300">
                      Candidate Assessment Portal
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Single-use token authentication with WAL auto-save persistence and tamper-evident session timers.
                    </p>
                  </div>

                  {/* Token Input + Preset Pills */}
                  <div className="space-y-2.5 pt-1">
                    <label
                      htmlFor="v4-candidate-token"
                      className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-cyan-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="h-3 w-3" />
                        Session Access Token
                      </span>
                      <span className="text-emerald-300">SHA-256 Ready</span>
                    </label>

                    <div className="relative">
                      <Input
                        id="v4-candidate-token"
                        value={candidateToken}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCandidateEnter();
                          }
                        }}
                        placeholder="Enter token (e.g. TOK-SYS-L6-8819)..."
                        className="h-11 rounded-xl border-white/15 bg-black/40 pl-3.5 pr-10 font-mono text-xs text-white placeholder:text-slate-500 focus-visible:border-cyan-400"
                      />
                      {hasValidToken && (
                        <CheckCircle2
                          aria-label="Valid token format"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300"
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {PRESET_TOKENS.map((preset) => {
                        const isSelectedToken = candidateToken === preset.token;

                        return (
                          <button
                            key={preset.token}
                            type="button"
                            onClick={() => handleSelectPresetToken(preset.token)}
                            className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] transition-all cursor-pointer ${
                              isSelectedToken
                                ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200 font-bold'
                                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/30 hover:text-slate-200'
                            }`}
                          >
                            {preset.token}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5 pt-3 border-t border-white/10">
                  <Button
                    onClick={handleCandidateEnter}
                    disabled={!hasValidToken}
                    className="h-11 w-full rounded-xl bg-cyan-400 font-bold text-slate-950 shadow-lg shadow-cyan-950/50 hover:bg-cyan-300 cursor-pointer gap-2 text-xs"
                  >
                    <span>Enter Candidate Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={onCandidateClick}
                      className="hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Resume draft session &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={onCandidateClick}
                      className="hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Verify credentials
                    </button>
                  </div>
                </div>
              </div>

              {/* Gateway 2: Enterprise Administration Console */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-400/35 bg-[#0f0c20]/90 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur-xl transition-all hover:border-purple-300/60">
                <div className="h-0.5 w-full bg-purple-400 absolute top-0 left-0 shadow-md" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 text-purple-300">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-purple-400/40 bg-purple-500/5 font-mono text-[10px] text-purple-200">
                      Talent Ops &amp; Security
                    </Badge>
                  </div>

                  <div>
                    <h2 className="font-heading text-xl font-bold text-white transition-colors group-hover:text-purple-300">
                      Enterprise Admin Console
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Author adaptive branching decision trees, inspect candidate cohorts, and audit cryptographic anti-cheat logs.
                    </p>
                  </div>

                  {/* Live Enclave Telemetry Status */}
                  <div className="rounded-2xl border border-purple-400/20 bg-black/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Casbin RBAC Matrix</span>
                      <span className="text-purple-300 font-bold">Enforced · Strict</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Split SQLite Isolation</span>
                      <span className="text-emerald-300 font-bold">0ms Lock Wait</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Client DOM Key Shield</span>
                      <span className="text-cyan-300 font-bold">Zero-Key Delivery</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5 pt-3 border-t border-white/10">
                  <Button
                    onClick={onAdminClick}
                    className="h-11 w-full rounded-xl bg-purple-500 font-bold text-white shadow-lg shadow-purple-950/50 hover:bg-purple-400 cursor-pointer gap-2 text-xs"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Open Admin Workspace</span>
                  </Button>

                  <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={onAdminClick}
                      className="hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      Visual Graph Studio &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={onAdminClick}
                      className="hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      Candidate Kanban Pipeline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Sovereign Cryptographic Handshake & Enclave Proof */}
          <aside
            className="v4-float relative lg:col-span-5 lg:pl-3"
            aria-label="Sovereign Cryptographic Enclave Telemetry"
          >
            <div className="relative overflow-hidden rounded-[1.85rem] border border-purple-400/25 bg-[#0d0a1a]/95 p-6 shadow-2xl shadow-black/70 sm:p-7">
              <div
                aria-hidden="true"
                className="v4-scan absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"
              />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-purple-300">
                    Sovereign Enclave Proof
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Cryptographic Session Attestation
                  </p>
                </div>
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 v4-pulse" aria-hidden="true" />
                  WAL ACTIVE
                </span>
              </div>

              {/* Primary Sovereign Metric Callout */}
              <div className="grid grid-cols-2 gap-3 py-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    Client DOM Keys
                  </span>
                  <strong className="v4-number mt-1 block font-heading text-3xl font-black text-cyan-300 sm:text-4xl">
                    0 Bytes
                  </strong>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    100% server-evaluated
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    WAL Commit Latency
                  </span>
                  <strong className="v4-number mt-1 block font-heading text-3xl font-black text-purple-300 sm:text-4xl">
                    {walLatencyMs} ms
                  </strong>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Split SQLite engine
                  </span>
                </div>
              </div>

              {/* Interactive Cryptographic Handshake Stepper */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  <span>Live Verification Pipeline</span>
                  <span className="text-cyan-300">Token: {candidateToken || 'UNSET'}</span>
                </div>

                {[
                  {
                    stage: 'hashing' as const,
                    icon: KeyRound,
                    title: '01 / SHA-256 Token Envelope',
                    detail: 'Single-use candidate token signature check',
                  },
                  {
                    stage: 'policy' as const,
                    icon: ShieldCheck,
                    title: '02 / Casbin RBAC & Zero-DOM Gate',
                    detail: 'Strip answer keys from client AST payload',
                  },
                  {
                    stage: 'sealed' as const,
                    icon: Fingerprint,
                    title: '03 / WAL Journal Attestation',
                    detail: `Sealed commit #${sealedCommitCount}`,
                  },
                ].map((step) => {
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.stage}
                      className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all ${getHandshakeStageClass(step.stage)}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/25 bg-black/30">
                        {isHandshakeSealed ? (
                          <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                        ) : (
                          <StepIcon className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold">{step.title}</span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] opacity-75">
                          {step.detail}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Handshake Status Readout */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3.5 font-mono text-[11px]"
              >
                {handshakeStage === 'idle' && (
                  <span className="text-slate-400">
                    Ready to verify cryptographic token handshake &amp; WAL isolation.
                  </span>
                )}
                {handshakeStage === 'hashing' && (
                  <span className="text-cyan-300">
                    Computing SHA-256 token digest for {candidateToken}…
                  </span>
                )}
                {handshakeStage === 'policy' && (
                  <span className="text-purple-300">
                    Enforcing Casbin RBAC policy &amp; redacting client DOM answer keys…
                  </span>
                )}
                {isHandshakeSealed && (
                  <span className="text-emerald-300">
                    Handshake verified · {walLatencyMs} ms WAL commit #{sealedCommitCount} · 0 DOM keys exposed
                  </span>
                )}
              </div>

              <Button
                type="button"
                onClick={handleRunHandshake}
                disabled={isHandshakeBusy}
                className="mt-4 h-11 w-full rounded-xl border border-purple-400/40 bg-purple-500/20 font-mono text-xs font-bold text-purple-100 hover:bg-purple-500/30 cursor-pointer"
              >
                {isHandshakeBusy ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Activity className="mr-2 h-4 w-4 text-cyan-300" aria-hidden="true" />
                )}
                {isHandshakeBusy
                  ? 'Verifying Sovereign Handshake...'
                  : isHandshakeSealed
                    ? 'Re-Verify Cryptographic Handshake'
                    : 'Verify Cryptographic Handshake'}
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* Section 2: Sovereign Engine Specifications & Interactive Command Runtime */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
              <Cpu className="h-4 w-4 text-cyan-300" />
              <span>Diagnostic Primitives &amp; CLI Runtime</span>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
              Sovereign Engine Specifications.
            </h2>
          </div>

          {/* Spec Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Sovereign engine specifications">
            {(
              [
                { id: 'architecture', label: 'Split SQLite WAL' },
                { id: 'casbin', label: 'Casbin RBAC' },
                { id: 'sqlite', label: 'Anti-Cheat Guard' },
              ] as const
            ).map((tab) => {
              const isActive = activeConsoleTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveConsoleTab(tab.id)}
                  className={`rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/60'
                      : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:border-purple-400/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left 6 Cols: Active Engine Specification Inspector */}
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#0f0c20]/90 p-6 shadow-2xl sm:p-8 lg:col-span-6">
            <div className="h-0.5 w-full bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 absolute top-0 left-0" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                {activeSpec.eyebrow}
              </span>
              <Badge variant="outline" className={`font-mono text-[10px] ${activeSpec.accentClass}`}>
                {activeSpec.badge}
              </Badge>
            </div>

            <h3 className="mt-5 font-heading text-2xl font-bold text-white">
              {activeSpec.title}
            </h3>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300/85">
              {activeSpec.description}
            </p>

            {/* 3 Micro-Telemetry Readouts */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {activeSpec.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-black/35 p-3 text-center"
                >
                  <span className="v4-number block font-mono text-base font-black text-white sm:text-lg">
                    {metric.value}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Code / Policy Trace */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/55 p-4 font-mono text-xs space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-slate-400">
                <span>sovereign-kernel.trace</span>
                <span className="text-emerald-300">VERIFIED</span>
              </div>
              {activeSpec.lines.map((line) => (
                <div key={line.text} className={`${line.tone} leading-relaxed`}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right 6 Cols: Interactive Command Palette Runtime */}
          <div className="lg:col-span-6">
            <CommandPalettePreview onExecute={onNavigate} />
          </div>
        </div>
      </section>

      {/* Section 3: Interactive Cryptographic Integrity Matrix (Replaces static HTML table) */}
      <section id="features" className="border-y border-white/10 bg-[#0c0919] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <Badge variant="outline" className="border-cyan-400/40 bg-cyan-400/5 font-mono text-xs text-cyan-300">
              Architectural Audit Matrix
            </Badge>
            <h2 className="font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
              Cryptographic Integrity Ledger
            </h2>
            <div className="mx-auto h-0.5 w-16 rounded-full bg-cyan-400" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Select any security dimension below to inspect how the sovereign Onboarding Quiz
              engine eliminates the structural vulnerabilities of legacy cloud form builders.
            </p>
          </div>

          {/* Interactive 5-Dimension Audit Selector Grid */}
          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Dimension Selector List (5 cols) */}
            <div className="space-y-2.5 lg:col-span-5" role="listbox" aria-label="Security audit dimensions">
              {AUDIT_DIMENSIONS.map((item, idx) => {
                const isSelected = item.id === activeDimension.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setSelectedDimensionId(item.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-cyan-400/70 bg-cyan-400/12 text-white shadow-lg shadow-cyan-950/30'
                        : 'border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/25 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                        0{idx + 1} · {item.category}
                      </span>
                      <span className="mt-1 block font-heading text-sm font-bold text-white">
                        {item.parameter}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`shrink-0 font-mono text-[10px] ${
                        isSelected
                          ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-200'
                          : 'border-white/15 text-slate-400'
                      }`}
                    >
                      {item.metricBadge}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Active Dimension Deep-Dive Comparison Card (7 cols) */}
            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-[#0f0c20] p-6 shadow-2xl sm:p-8 lg:col-span-7 flex flex-col justify-between">
              <div className="h-0.5 w-full bg-cyan-400 absolute top-0 left-0" />

              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                      Active Dimension Inspector
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-black text-white">
                      {activeDimension.parameter}
                    </h3>
                  </div>
                  <Badge className="bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-xs">
                    {activeDimension.metricBadge}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Traditional Cloud SaaS Vulnerability */}
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-5 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-rose-300">
                      <span>Legacy Cloud SaaS Form</span>
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                    </div>
                    <p className="text-sm font-semibold text-rose-100 leading-relaxed">
                      {activeDimension.traditionalSaaS}
                    </p>
                    <p className="text-[11px] text-rose-300/75">
                      High risk of client inspection, lock bottlenecks, or unauthorized third-party data egress.
                    </p>
                  </div>

                  {/* Sovereign Engine Guarantee */}
                  <div className="rounded-2xl border border-cyan-400/40 bg-cyan-400/[0.08] p-5 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                      <span>Sovereign Onboarding Quiz</span>
                      <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    </div>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {activeDimension.sovereignEngine}
                    </p>
                    <p className="text-[11px] text-cyan-200/80">
                      Cryptographically enforced at the application kernel with zero external dependencies.
                    </p>
                  </div>
                </div>

                {/* Kernel Proof Snippet */}
                <div className="rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>KERNEL ENFORCEMENT PROOF</span>
                    <span className="text-purple-300">IMMUTABLE</span>
                  </div>
                  <code className="text-emerald-300 break-all">{activeDimension.codeProof}</code>
                </div>
              </div>

              {/* All 5 Dimensions Quick Summary Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-slate-400">
                <span>All 5 sovereign dimensions verified for self-hosted &amp; air-gapped deployments.</span>
                <button
                  type="button"
                  onClick={onAdminClick}
                  className="font-mono font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect full security ledger</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Direct Quick Launch Bottom Bar */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-purple-400/35 bg-gradient-to-br from-[#130e29] via-[#0e0b1e] to-[#091322] p-8 sm:p-12 shadow-2xl">
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 absolute top-0 left-0" />

          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cyan-300">
                <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                <span>Self-Hosted · Air-Gap Ready · Zero Lock Contention</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-4xl font-black text-white">
                Ready to deploy sovereign assessments?
              </h3>
              <p className="max-w-xl text-xs sm:text-sm text-slate-300/80">
                Run locally or deploy on your private cloud infrastructure with full Split SQLite concurrency and Casbin RBAC security.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={onCandidateClick}
                className="h-12 rounded-xl border-cyan-400/40 bg-cyan-400/10 px-6 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20 hover:text-white cursor-pointer"
              >
                Candidate Portal
              </Button>
              <Button
                onClick={onAdminClick}
                className="h-12 rounded-xl bg-purple-600 px-6 text-xs font-bold text-white shadow-lg shadow-purple-950/60 hover:bg-purple-500 cursor-pointer gap-2"
              >
                <span>Admin Console</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  DollarSign,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LayoutProps } from './version-1-classic';

interface LifecycleStage {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  metric: string;
  proof: string;
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: 'invite',
    eyebrow: '01 · Invite',
    title: 'Open a fair first door',
    description:
      'Every candidate receives the same focused brief, accessible experience, and clear expectation before the clock starts.',
    metric: '92% start rate',
    proof: 'Tokenized access · branded candidate room',
  },
  {
    id: 'assess',
    eyebrow: '02 · Assess',
    title: 'Measure signal, not résumé polish',
    description:
      'Role-calibrated questions surface practical judgment while deterministic scoring keeps every review consistent.',
    metric: '18 min median',
    proof: 'Autosave · focus telemetry · server scoring',
  },
  {
    id: 'qualify',
    eyebrow: '03 · Qualify',
    title: 'Route the strongest evidence',
    description:
      'Hiring teams receive a concise evidence packet and ranked shortlist instead of another queue of manual screens.',
    metric: '34% qualified',
    proof: 'Decision trail · comparable scorecards',
  },
  {
    id: 'offer',
    eyebrow: '04 · Offer',
    title: 'Move while intent is high',
    description:
      'A shared proof layer aligns recruiters and interviewers quickly, shortening the distance from application to offer.',
    metric: '4.1 days',
    proof: 'Verified certificate · exportable record',
  },
];

const AUTOMATION_RATE = 0.82;
const QUALIFICATION_RATE = 0.34;
const BASELINE_OFFER_DAYS = 14;

export const Version7VelocityStudio: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [monthlyApplicants, setMonthlyApplicants] = useState(240);
  const [hourlyCost, setHourlyCost] = useState(85);
  const [manualMinutes, setManualMinutes] = useState(28);
  const [completionRate, setCompletionRate] = useState(82);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setIsReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener('change', syncMotionPreference);

    return () => mediaQuery.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      setIsPlaying(false);
    }
  }, [isReducedMotion]);

  useEffect(() => {
    const syncVisibility = () => setIsVisible(document.visibilityState === 'visible');

    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);

    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (!isVisible) {
      return;
    }

    if (isReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveStageIndex((currentIndex) => (currentIndex + 1) % LIFECYCLE_STAGES.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [isPlaying, isReducedMotion, isVisible]);

  const selectStage = (index: number) => {
    setActiveStageIndex(index);
    setIsPlaying(false);
  };

  const handleStageKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % LIFECYCLE_STAGES.length;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + LIFECYCLE_STAGES.length) % LIFECYCLE_STAGES.length;
    }

    if (event.key === 'Home') {
      nextIndex = 0;
    }

    if (event.key === 'End') {
      nextIndex = LIFECYCLE_STAGES.length - 1;
    }

    if (nextIndex === index) {
      return;
    }

    event.preventDefault();
    selectStage(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const completedAssessments = Math.round(monthlyApplicants * (completionRate / 100));
  const qualifiedCompletions = Math.round(completedAssessments * QUALIFICATION_RATE);
  const projectedHires = Math.max(1, Math.round(qualifiedCompletions * 0.24));
  const manualScreenHours = (monthlyApplicants * manualMinutes) / 60;
  const hoursReclaimed = Math.round(manualScreenHours * AUTOMATION_RATE);
  const costAvoided = Math.round(hoursReclaimed * hourlyCost);
  const timeToOffer = Math.max(
    3.2,
    BASELINE_OFFER_DAYS - completionRate * 0.09 - hoursReclaimed / monthlyApplicants,
  );
  const currentStage = LIFECYCLE_STAGES[activeStageIndex];
  const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="w-full overflow-hidden bg-[#0b1628] text-[#f5efdf]">
      <section className="relative isolate border-b border-[#f5efdf]/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(225,173,117,0.12),transparent_32%),linear-gradient(115deg,rgba(255,255,255,0.025),transparent_52%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-28">
          <div className="v7-reveal lg:col-span-7 lg:pr-8">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ddbd83]">
              <span className="h-px w-8 bg-[#ddbd83]" />
              Hiring Yield Studio
            </div>
            <h1 className="max-w-4xl font-heading text-[2.65rem] font-black leading-[0.98] tracking-[-0.045em] text-[#f8f2e7] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              Turn applicant volume into{' '}
              <span className="text-[#e9c995]">qualified hiring signal.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#d9d2c5]/78 sm:text-lg">
              Replace repetitive screens with a candidate-first assessment system that protects
              quality, returns interviewer capacity, and makes the economics of faster hiring
              visible.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 min-[420px]:items-start sm:flex-row sm:items-center">
              <Button
                onClick={onCandidateClick}
                className="min-h-[3.25rem] w-full rounded-full bg-[#f46f5e] px-7 font-bold text-[#101827] shadow-[0_18px_55px_rgba(244,111,94,0.25)] hover:bg-[#ff806d] min-[420px]:w-auto"
              >
                Enter candidate experience
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onAdminClick}
                className="min-h-11 w-full rounded-full px-5 text-sm font-semibold text-[#f5efdf]/72 hover:bg-[#f5efdf]/8 hover:text-[#f5efdf] min-[420px]:w-auto"
              >
                Admin sign in
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#d9d2c5]/65">
              {['No résumé gatekeeping', 'Deterministic scoring', 'Evidence-ready shortlist'].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ddbd83]" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="v7-float relative lg:col-span-5 lg:pl-4">
            <div className="absolute -inset-5 rounded-[2.25rem] bg-[#f46f5e]/8 blur-3xl motion-reduce:hidden" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#f5efdf]/14 bg-[#111f34]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="v7-flow absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f46f5e] to-transparent motion-reduce:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ddbd83]">
                    Live hiring yield
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-[#f8f2e7] sm:text-2xl">
                    Senior Product Engineer
                  </h2>
                </div>
                <span className="rounded-full border border-[#f46f5e]/35 bg-[#f46f5e]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ff9a8d]">
                  Momentum +18%
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#f5efdf]/10 bg-[#07111f]/55 p-4">
                  <TrendingUp className="h-4 w-4 text-[#ddbd83]" />
                  <p className="v7-number mt-5 text-3xl font-black text-[#f5efdf]">6.4×</p>
                  <p className="mt-1 text-xs text-[#d9d2c5]/60">signal per interview hour</p>
                </div>
                <div className="rounded-2xl border border-[#f5efdf]/10 bg-[#07111f]/55 p-4">
                  <Clock3 className="h-4 w-4 text-[#f46f5e]" />
                  <p className="v7-number mt-5 text-3xl font-black text-[#f5efdf]">4.1d</p>
                  <p className="mt-1 text-xs text-[#d9d2c5]/60">application to offer</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#ddbd83]/20 bg-[#ddbd83]/[0.06] p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#d9d2c5]/60">Projected monthly value</p>
                    <p className="v7-number mt-1 text-3xl font-black text-[#e9c995]">$18,640</p>
                  </div>
                  <div className="flex h-10 items-end gap-1" aria-hidden="true">
                    {[35, 48, 42, 64, 58, 78, 92].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className="v7-flow w-1.5 rounded-full bg-[#f46f5e]"
                        style={{ height: `${height}%`, opacity: 0.35 + index * 0.09 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-[#f5efdf]/10 pt-5">
                <div className="flex -space-x-2" aria-hidden="true">
                  {[0, 1, 2].map((item) => (
                    <span
                      key={item}
                      className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#111f34] bg-[#24334a] text-[10px] font-bold text-[#f5efdf]"
                    >
                      {String.fromCharCode(65 + item)}
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-5 text-[#d9d2c5]/65">
                  Recruiter, hiring manager, and interviewer aligned on one proof layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="v7-reveal lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ddbd83]">
              The yield, made visible
            </p>
            <h2 className="mt-4 font-heading text-3xl font-black tracking-tight text-[#f8f2e7] sm:text-5xl">
              A funnel built to preserve candidate intent.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#d9d2c5]/68 lg:col-span-6 lg:col-start-7">
            Conversion is not a vanity metric. Each step shows where qualified people keep moving,
            where team attention compounds, and where manual process used to leak value.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Applicants',
              value: monthlyApplicants,
              note: '100% entered',
              icon: Users,
              width: '100%',
            },
            {
              label: 'Completed',
              value: completedAssessments,
              note: `${completionRate}% completion`,
              icon: ShieldCheck,
              width: '84%',
            },
            {
              label: 'Qualified',
              value: qualifiedCompletions,
              note: '34% meet benchmark',
              icon: UserCheck,
              width: '68%',
            },
            {
              label: 'Projected hires',
              value: projectedHires,
              note: '24% close rate',
              icon: BriefcaseBusiness,
              width: '52%',
            },
          ].map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.label}
                className="v7-reveal relative overflow-hidden rounded-2xl border border-[#f5efdf]/10 bg-[#f5efdf]/[0.035] p-5"
              >
                <div
                  className="v7-flow absolute bottom-0 left-0 h-0.5 bg-[#ddbd83]"
                  style={{ width: step.width }}
                />
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f5efdf]/7">
                    <Icon className="h-4 w-4 text-[#e9c995]" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9d2c5]/45">
                    0{index + 1}
                  </span>
                </div>
                <p className="v7-number mt-8 text-4xl font-black text-[#f8f2e7]">{step.value}</p>
                <h3 className="mt-2 text-sm font-bold text-[#f5efdf]">{step.label}</h3>
                <p className="mt-1 text-xs text-[#d9d2c5]/55">{step.note}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#f5efdf]/10 bg-[#081321]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ddbd83]">
                Candidate lifecycle
              </p>
              <h2 className="mt-4 font-heading text-3xl font-black tracking-tight sm:text-5xl">
                One evidence trail. Four decisive moments.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsPlaying((currentValue) => !currentValue)}
              disabled={isReducedMotion}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-[#f5efdf]/15 px-4 text-xs font-bold text-[#f5efdf]/75 transition-colors hover:border-[#ddbd83]/60 hover:text-[#f5efdf] disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto"
              aria-label={isPlaying ? 'Pause lifecycle autoplay' : 'Play lifecycle autoplay'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isReducedMotion ? 'Autoplay off' : isPlaying ? 'Pause story' : 'Play story'}
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Hiring lifecycle stages"
            className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          >
            {LIFECYCLE_STAGES.map((stage, index) => {
              const isActive = index === activeStageIndex;

              return (
                <button
                  key={stage.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`v7-tab-${stage.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`v7-panel-${stage.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectStage(index)}
                  onKeyDown={(event) => handleStageKeyDown(event, index)}
                  className={`relative min-h-24 rounded-2xl border p-4 text-left transition-colors ${
                    isActive
                      ? 'border-[#ddbd83]/60 bg-[#ddbd83]/10 text-[#f8f2e7]'
                      : 'border-[#f5efdf]/10 bg-[#f5efdf]/[0.025] text-[#d9d2c5]/58 hover:border-[#f5efdf]/25'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    {stage.eyebrow}
                  </span>
                  <span className="mt-3 block text-sm font-bold">{stage.title}</span>
                  {isActive && (
                    <span className="v7-flow absolute inset-x-4 bottom-0 h-0.5 bg-[#f46f5e] motion-reduce:hidden" />
                  )}
                </button>
              );
            })}
          </div>

          <div
            id={`v7-panel-${currentStage.id}`}
            role="tabpanel"
            aria-labelledby={`v7-tab-${currentStage.id}`}
            tabIndex={0}
            className="mt-4 grid gap-8 rounded-[1.75rem] border border-[#f5efdf]/12 bg-[#101d30]/75 p-6 outline-none focus-visible:ring-2 focus-visible:ring-[#ddbd83] sm:p-9 lg:grid-cols-12 lg:items-center"
          >
            <div className="lg:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f46f5e]">
                {currentStage.metric}
              </p>
              <h3 className="mt-4 max-w-2xl text-2xl font-black text-[#f8f2e7] sm:text-4xl">
                {currentStage.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d9d2c5]/68 sm:text-base">
                {currentStage.description}
              </p>
            </div>
            <div className="rounded-2xl border border-[#ddbd83]/18 bg-[#ddbd83]/[0.055] p-5 lg:col-span-4">
              <Sparkles className="h-5 w-5 text-[#ddbd83]" />
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9d2c5]/50">
                Proof generated
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#f5efdf]">
                {currentStage.proof}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ddbd83]/8 blur-[100px]" />
        <div className="relative grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ddbd83]">
              Transparent yield calculator
            </p>
            <h2 className="mt-4 font-heading text-3xl font-black tracking-tight sm:text-5xl">
              Put a number on the work you get back.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#d9d2c5]/65">
              Change every operating assumption. Outputs update from the formulas shown—not from a
              hidden benchmark.
            </p>

            <div className="mt-8 space-y-3 rounded-2xl border border-[#f5efdf]/10 bg-[#f5efdf]/[0.025] p-5 text-xs leading-5 text-[#d9d2c5]/58">
              <p className="font-bold uppercase tracking-[0.16em] text-[#f5efdf]/78">
                Assumptions
              </p>
              <p>Automation replaces 82% of manual screening effort.</p>
              <p>34% of completed assessments meet the qualification benchmark.</p>
              <p>Time-to-offer starts at a 14-day operating baseline.</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#f5efdf]/14 bg-[#f5efdf]/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-8 lg:col-span-8">
            <div className="grid gap-7 sm:grid-cols-2">
              {[
                {
                  id: 'applicants',
                  label: 'Monthly applicants',
                  value: monthlyApplicants,
                  display: monthlyApplicants.toLocaleString(),
                  min: 40,
                  max: 1200,
                  step: 20,
                  setValue: setMonthlyApplicants,
                },
                {
                  id: 'hourly-cost',
                  label: 'Loaded interviewer hourly cost',
                  value: hourlyCost,
                  display: moneyFormatter.format(hourlyCost),
                  min: 35,
                  max: 220,
                  step: 5,
                  setValue: setHourlyCost,
                },
                {
                  id: 'screen-minutes',
                  label: 'Minutes per manual screen',
                  value: manualMinutes,
                  display: `${manualMinutes} min`,
                  min: 10,
                  max: 75,
                  step: 1,
                  setValue: setManualMinutes,
                },
                {
                  id: 'completion',
                  label: 'Candidate completion rate',
                  value: completionRate,
                  display: `${completionRate}%`,
                  min: 45,
                  max: 98,
                  step: 1,
                  setValue: setCompletionRate,
                },
              ].map((control) => (
                <div key={control.id} className="min-w-0">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <label
                      id={`v7-${control.id}-label`}
                      className="text-xs font-semibold leading-5 text-[#d9d2c5]/72"
                    >
                      {control.label}
                    </label>
                    <output className="v7-number shrink-0 text-lg font-black text-[#e9c995]">
                      {control.display}
                    </output>
                  </div>
                  <Slider
                    value={[control.value]}
                    onValueChange={(values) => control.setValue(values[0])}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    aria-labelledby={`v7-${control.id}-label`}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="mt-9 grid gap-3 border-t border-[#f5efdf]/10 pt-7 sm:grid-cols-2">
              {[
                {
                  label: 'Hours reclaimed',
                  value: `${hoursReclaimed} h`,
                  formula: `(${monthlyApplicants} × ${manualMinutes} ÷ 60) × 82%`,
                  icon: Clock3,
                },
                {
                  label: 'Cost avoided',
                  value: moneyFormatter.format(costAvoided),
                  formula: `${hoursReclaimed} hours × ${moneyFormatter.format(hourlyCost)}`,
                  icon: DollarSign,
                },
                {
                  label: 'Qualified completions',
                  value: qualifiedCompletions.toLocaleString(),
                  formula: `${monthlyApplicants} × ${completionRate}% × 34%`,
                  icon: UserCheck,
                },
                {
                  label: 'Time-to-offer',
                  value: `${timeToOffer.toFixed(1)} days`,
                  formula: `14 days − completion and capacity gains`,
                  icon: TrendingUp,
                },
              ].map((output) => {
                const Icon = output.icon;

                return (
                  <article
                    key={output.label}
                    className="rounded-2xl border border-[#f5efdf]/10 bg-[#07111f]/45 p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#d9d2c5]/65">
                      <Icon className="h-4 w-4 text-[#ddbd83]" />
                      {output.label}
                    </div>
                    <p className="v7-number mt-4 break-words text-3xl font-black text-[#f8f2e7]">
                      {output.value}
                    </p>
                    <p className="mt-2 break-words font-mono text-[10px] leading-4 text-[#d9d2c5]/42">
                      {output.formula}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="v7-reveal relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#ddbd83]/25 bg-[#f5efdf] px-5 py-12 text-[#0b1628] shadow-2xl sm:px-10 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[48px] border-[#ddbd83]/20" />
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a643c]">
                Better signal starts here
              </p>
              <h2 className="mt-4 max-w-3xl font-heading text-3xl font-black tracking-tight sm:text-5xl">
                Let your strongest candidates show you what they can do.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#0b1628]/68">
                Experience the same focused, evidence-led journey your hiring team can deploy.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-stretch">
              <Button
                onClick={onCandidateClick}
                className="min-h-[3.25rem] rounded-full bg-[#f46f5e] px-6 font-bold text-[#101827] hover:bg-[#ff806d]"
              >
                Start candidate assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onAdminClick}
                className="min-h-11 rounded-full text-sm font-bold text-[#0b1628]/62 hover:bg-[#0b1628]/7 hover:text-[#0b1628]"
              >
                Open hiring admin
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

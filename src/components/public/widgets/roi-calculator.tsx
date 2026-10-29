import React, { useState, useId } from 'react';
import {
  Calculator,
  ArrowRight,
  DollarSign,
  Clock,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const RoiCalculator: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [candidateCount, setCandidateCount] = useState<number>(220);
  const [screeningHours, setScreeningHours] = useState<number>(3.0);
  const [currency, setCurrency] = useState<'$' | '€' | '£'>('$');
  const candidateInputId = useId();
  const hoursInputId = useId();

  // Financial & efficiency formulas
  const hourlyRate = currency === '$' ? 48 : currency === '€' ? 44 : 38;
  const automatedEfficiencyFactor = 0.74; // 74% administrative overhead eliminated
  const hoursSavedMonthly = Math.round(candidateCount * screeningHours * automatedEfficiencyFactor);
  const dollarsSavedMonthly = Math.round(hoursSavedMonthly * hourlyRate);
  const annualizedSavings = Math.round(dollarsSavedMonthly * 12);
  const accelerationMultiplier = 3.8; // 3.8x faster time-to-decision

  return (
    <div className="w-full rounded-3xl glass-panel-elevated overflow-hidden relative shadow-2xl">
      <div className="h-0.5 w-full bg-primary/70" />

      {/* Background ambient glow inside card */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-6 sm:p-10 space-y-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Executive Yield Model • Real-Time Calculation</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground font-heading tracking-tight">
              Quantify Your Recruitment Efficiency
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Automated branching assessments, cryptographic proctoring, and instant SQLite scoring eliminate manual evaluation fatigue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
            {/* Currency Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
              {(['$', '€', '£'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    currency === curr
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border text-xs font-mono text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Baseline: {currency}{hourlyRate}/hr</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Column */}
          <div className="lg:col-span-6 space-y-7">
            {/* Slider 1: Monthly Candidates */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={candidateInputId} className="font-bold text-foreground flex items-center gap-2">
                  <span>Monthly Candidates Evaluated</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(All Job Roles)</span>
                </label>
                <span className="font-mono font-bold text-primary text-sm px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 shadow-2xs">
                  {candidateCount.toLocaleString()} applicants
                </span>
              </div>
              <input
                id={candidateInputId}
                type="range"
                min="20"
                max="2000"
                step="20"
                value={candidateCount}
                onChange={(e) => setCandidateCount(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>20</span>
                <span>500</span>
                <span>1,000</span>
                <span>2,000+</span>
              </div>
            </div>

            {/* Slider 2: Hours Spent Per Candidate */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={hoursInputId} className="font-bold text-foreground flex items-center gap-2">
                  <span>Manual Review Hours Per Candidate</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Grading &amp; Sync)</span>
                </label>
                <span className="font-mono font-bold text-primary text-sm px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 shadow-2xs">
                  {screeningHours.toFixed(1)} hrs
                </span>
              </div>
              <input
                id={hoursInputId}
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={screeningHours}
                onChange={(e) => setScreeningHours(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>30 mins</span>
                <span>2.0 hrs</span>
                <span>4.0 hrs</span>
                <span>6.0 hrs</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="leading-relaxed">
                Replaces manual review rounds, email back-and-forths, and test scoring with deterministic server-evaluated workflows.
              </span>
            </div>
          </div>

          {/* Results Display Column */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 bg-muted/20 p-5 sm:p-7 rounded-3xl border border-border/80">
            {/* Metric 1: Hours Saved */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Monthly Hours Reclaimed</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-foreground font-heading">
                {hoursSavedMonthly.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">hrs/mo</span>
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 pt-1">
                <TrendingUp className="w-3 h-3" /> 74% admin overhead cut
              </span>
            </div>

            {/* Metric 2: Dollars Saved */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span>Monthly Direct Savings</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-primary font-heading">
                {currency}{dollarsSavedMonthly.toLocaleString()}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono block pt-1">
                {currency}{annualizedSavings.toLocaleString()} / year
              </span>
            </div>

            {/* Metric 3: Speed Acceleration & Payback */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BadgePercent className="w-3.5 h-3.5 text-primary" />
                <span>Payback Horizon</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground font-heading">
                11 <span className="text-xs font-bold text-primary">Days</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold block pt-1">
                680% Estimated Enterprise ROI
              </span>
            </div>

            {/* Metric 4 & CTA Card */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Ready to Deploy?
                </span>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  Integrate Split SQLite assessment workflows with your hiring pipeline.
                </p>
              </div>

              <Button
                size="sm"
                onClick={onCtaClick}
                className="w-full text-xs font-bold h-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5 rounded-xl"
              >
                <span>Deploy Engine</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

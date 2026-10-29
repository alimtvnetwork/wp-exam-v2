import React, { useState } from 'react';
import { KeyRound, GitFork, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JourneyStep {
  step: number;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
  metrics: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    title: 'Tokenized Candidate Invites',
    tagline: 'Zero-password friction with single-use cryptographic tokens.',
    badge: 'Stage 01: Ingestion',
    icon: KeyRound,
    details: [
      'Time-limited candidate tokens prevent unauthorized access and replay attacks.',
      'One-click resume capability with encrypted local storage snapshots.',
      'Automated SMTP/Amazon SES invitation emails with branded templates.',
    ],
    metrics: '99.8% Invitation Delivery',
  },
  {
    step: 2,
    title: 'Adaptive Multi-Section Exam',
    tagline: 'Branching questions that adapt to individual competency levels.',
    badge: 'Stage 02: Execution',
    icon: GitFork,
    details: [
      'Dynamic question routing based on previous answers and passing thresholds.',
      'Distraction-free Focus Runner mode with ambient timers and optical clarity.',
      'Multi-section prerequisites ensuring foundational skills before advanced tiers.',
    ],
    metrics: '< 10ms Question Switch Latency',
  },
  {
    step: 3,
    title: 'Anti-Cheat & Proctoring Guard',
    tagline: 'Active focus tracking, answer stripping, and token invalidation.',
    badge: 'Stage 03: Verification',
    icon: ShieldCheck,
    details: [
      'Sensitive correct-answer data is never leaked to the client DOM or API payload.',
      'Tab-switch counting and focus loss telemetry logged directly to audit trail.',
      'Attempt limits with automated lockouts upon policy infraction.',
    ],
    metrics: 'Zero-DOM Leak Architecture',
  },
  {
    step: 4,
    title: 'Instant Scoring & Certification',
    tagline: 'Automated certificate issuance, score digests, and HR sync.',
    badge: 'Stage 04: Completion',
    icon: Award,
    details: [
      'Instant pass/fail determination based on weighted multi-section thresholds.',
      'Printable and downloadable PDF certificates generated upon passing.',
      'Real-time webhook and WordPress database event triggers for ATS pipelines.',
    ],
    metrics: '100% Automated Grading',
  },
];

export const CandidateJourneyStepper: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const activeStep = JOURNEY_STEPS[activeStepIndex];
  const ActiveIcon = activeStep.icon;

  return (
    <div className="w-full rounded-3xl glass-panel-elevated overflow-hidden shadow-2xl relative">
      <div className="h-0.5 w-full bg-primary/70" />

      {/* Stepper Tabs with Connected Glow Line */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border/70 bg-muted/30">
        {JOURNEY_STEPS.map((step, idx) => {
          const isSelected = activeStepIndex === idx;
          const Icon = step.icon;

          return (
            <button
              key={step.step}
              type="button"
              onClick={() => setActiveStepIndex(idx)}
              className={`p-5 text-left transition-all cursor-pointer border-b-2 relative ${
                isSelected
                  ? 'border-primary bg-card/90 text-foreground shadow-xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isSelected ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.step}
                </div>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </h5>
            </button>
          );
        })}
      </div>

      {/* Active Step Details Canvas */}
      <div className="p-8 sm:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1.5">
            <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary px-2.5 py-0.5 rounded-full">
              {activeStep.badge}
            </Badge>
            <h4 className="text-2xl sm:text-3xl font-black text-foreground font-heading flex items-center gap-3">
              <ActiveIcon className="w-7 h-7 text-primary" />
              <span>{activeStep.title}</span>
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              {activeStep.tagline}
            </p>
          </div>

          <div className="text-right self-start sm:self-center shrink-0">
            <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary font-bold border border-primary/25 shadow-2xs">
              {activeStep.metrics}
            </span>
          </div>
        </div>

        {/* Feature Checkpoints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeStep.details.map((detail, idx) => (
            <div
              key={detail}
              className="p-5 rounded-2xl bg-muted/40 border border-border/70 space-y-3 hover:border-primary/50 transition-all shadow-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-[11px] font-mono font-bold flex items-center justify-center">
                0{idx + 1}
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

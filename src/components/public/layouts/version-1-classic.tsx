import React from 'react';
import {
  Shield,
  Layers,
  Sparkles,
  GitBranch,
  Mail,
  Play,
  Database,
  Lock,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizSimulator } from '@/components/simulation/quiz-simulator';

const featureCards = [
  {
    icon: Layers,
    iconClassName: 'bg-primary/10 text-primary',
    title: 'Multi-Section Architecture',
    description: 'Curriculum structured into sections with prerequisite gating and passing thresholds.',
  },
  {
    icon: GitBranch,
    iconClassName: 'bg-sky-500/10 text-sky-400',
    title: 'Visual Branching Logic',
    description: 'Interactive node graph detecting cyclic paths in real time with condition-based progression.',
  },
  {
    icon: Database,
    iconClassName: 'bg-emerald-500/10 text-emerald-400',
    title: 'Split SQLite Storage',
    description: 'Hybrid multi-database model for zero lock contention and offline local sync.',
  },
  {
    icon: Mail,
    iconClassName: 'bg-purple-500/10 text-purple-400',
    title: 'Email & Certificate Automation',
    description: 'Automated score digests, certificates, and SMTP/SES delivery presets.',
  },
  {
    icon: Shield,
    iconClassName: 'bg-rose-500/10 text-rose-400',
    title: 'Role Access & Anti-Cheat',
    description: 'Token-based candidate authentication with attempt limits and anti-cheat answer stripping.',
  },
  {
    icon: Sparkles,
    iconClassName: 'bg-amber-500/10 text-amber-400',
    title: 'AI Studio & JSON Engine',
    description: 'Embedded prompt templates and 1-click JSON import/export for automated question generation.',
  },
];

const metricCards = [
  { value: 'Real-Time', label: 'Validation & Scoring' },
  { value: '< 10ms', label: 'Instant Edge Response' },
  { value: '5 Themes', label: 'Fluid Customization' },
];

export interface LayoutProps {
  onAdminClick: () => void;
  onCandidateClick: () => void;
  onNavigate: (path: string) => void;
  isAuthenticated: boolean;
}

export const Version1Classic: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
  onNavigate,
}) => {
  return (
    <div className="w-full space-y-24 pb-24">
      {/* Hero Section with Ambient Glow */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 border-b border-border/60 bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-halo-emerald blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboarding assessments, simplified</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.04] font-heading">
            Onboard Faster with <br />
            <span className="text-gradient-sheen">
              Intelligent Quizzes
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Design onboarding assessments, branching quizzes, and feedback forms with instant scoring and fluid enterprise theming.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              onClick={() => onNavigate('/apply')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-12 px-8 gap-2.5 shadow-xl shadow-primary/25 cursor-pointer rounded-2xl transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Assessment</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onCandidateClick}
              className="font-bold text-sm h-12 px-7 gap-2.5 border-border hover:bg-muted/70 rounded-2xl cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Candidate Portal</span>
            </Button>
          </div>

          {/* Quick Metrics Bar with Elevated Glassmorphism */}
          <div className="grid grid-cols-3 gap-5 max-w-3xl mx-auto pt-8">
            {metricCards.map((metric) => (
              <div key={metric.label} className="p-5 rounded-2xl glass-panel text-center shadow-xs">
                <div className="h-0.5 w-full bg-primary/60 rounded-full mb-3" />
                <span className="text-2xl sm:text-3xl font-black text-primary block font-heading">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-10" />
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
            Key Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground font-heading">Platform Features</h2>
          <div className="mx-auto h-0.5 w-16 bg-primary/70 rounded-full" />
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Engineered for high throughput, evaluation precision, and candidate security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {featureCards.map((card) => (
            <div key={card.title} className="rounded-3xl glass-panel-elevated overflow-hidden hover:border-primary/60 transition-all shadow-lg hover:-translate-y-1 duration-300">
              <div className="h-0.5 w-full bg-primary/70" />
              <div className="p-8 space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconClassName}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-heading">{card.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
            Try a Demo
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground font-heading">
            See Conditional Quizzes in Action
          </h2>
          <div className="mx-auto h-0.5 w-16 bg-primary/70 rounded-full" />
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Walk through a live simulation — answer questions and watch the quiz
            adapt, with a guided story explaining every branching decision.
          </p>
          <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 shadow-2xl">
            <QuizSimulator fixtureSlug="branching-onboarding" />
          </div>
        </div>
      </section>

      {/* Backend Administration Gateway Callout */}
      <section className="py-16 bg-muted/20 border-y border-border/60">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
            Admin Console
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground font-heading">
            Manage Exams, Questions &amp; Scoring Models
          </h2>
          <div className="mx-auto h-0.5 w-16 bg-primary/70 rounded-full" />
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Author forms, inspect candidate submissions, and customize logic from the admin console.
          </p>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={onAdminClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-12 px-8 gap-2.5 shadow-xl shadow-primary/25 cursor-pointer rounded-2xl"
            >
              <Lock className="w-4 h-4" />
              <span>Open Admin Dashboard &rarr;</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

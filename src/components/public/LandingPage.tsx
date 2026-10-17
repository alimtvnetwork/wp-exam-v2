import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  Sparkles,
  GitBranch,
  Mail,
  Play,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLoginModal, useAdminAuth } from '@/components/auth/AdminLoginModal';
import { QuizSimulator } from '@/components/simulation/quiz-simulator';
import { ThemeSwitcher } from '@/lib/theme-context';
import onboardingQuizLogo from '@/assets/onboarding-quiz-logo.svg';

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
  { value: '< 10ms', label: 'Instant Response' },
  { value: '5 Themes', label: 'Fluid Customization' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans antialiased">
      {/* Top Enterprise Navigation */}
      <header className="border-b border-border/60 backdrop-blur-md bg-background/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={onboardingQuizLogo}
              alt="Onboarding Quiz"
              className="w-9 h-9 rounded-xl shadow-md ring-1 ring-border/50"
            />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-foreground flex items-center gap-1.5 font-heading">
                Onboarding Quiz
                <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono py-0">
                  Enterprise
                </Badge>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors cursor-pointer">Features</a>
            <button type="button" onClick={() => navigate('/admin?tab=builder')} className="hover:text-foreground transition-colors cursor-pointer">
              Form Builder
            </button>
            <button type="button" onClick={() => navigate('/apply')} className="hover:text-foreground transition-colors cursor-pointer">
              Candidate Portal
            </button>
            <button type="button" onClick={() => navigate('/runner')} className="hover:text-foreground transition-colors cursor-pointer">
              Live Preview
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeSwitcher />
            <Button
              size="sm"
              onClick={handleAdminClick}
              className="text-xs h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-bold rounded-xl shadow-md shadow-primary/20 cursor-pointer transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-primary-foreground" />
              <span>{isAuthenticated ? 'Admin Console' : 'Admin Login'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-border/60 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboarding assessments, simplified</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-tight font-heading">
            Onboard Faster with <br />
            <span className="text-primary">
              Intelligent Quizzes
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Design onboarding assessments, branching quizzes, and feedback forms with instant scoring and fluid themes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/apply')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-11 px-6 gap-2 shadow-lg shadow-primary/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Assessment</span>
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
            {metricCards.map((metric) => (
              <div key={metric.label} className="p-3.5 rounded-xl bg-card border border-border shadow-md">
                <div className="h-0.5 w-full bg-primary/60 rounded-full mb-3" />
                <span className="text-2xl font-black text-primary block font-heading">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-12">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
            Key Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground font-heading">Platform Features</h2>
          <div className="mx-auto h-0.5 w-16 bg-primary/70 rounded-full" />
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Engineered for high throughput, evaluation precision, and candidate security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card) => (
            <div key={card.title} className="rounded-2xl bg-card border border-border shadow-md overflow-hidden hover:border-primary/50 transition-all">
              <div className="h-0.5 w-full bg-primary/70" />
              <div className="p-6 space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconClassName}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground font-heading">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-14 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
            Try a Demo
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            See Conditional Quizzes in Action
          </h2>
          <div className="mx-auto h-0.5 w-16 bg-primary/70 rounded-full" />
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Walk through a live simulation — answer questions and watch the quiz
            adapt, with a guided story explaining every branching decision.
          </p>
          <QuizSimulator fixtureSlug="branching-onboarding" />
        </div>
      </section>

      {/* Backend Administration Gateway Callout */}
      <section className="py-14 bg-muted/20 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">
            Admin Console
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Manage Exams, Questions & Scoring Models
          </h2>
          <div className="mx-auto h-0.5 w-16 bg-primary/70 rounded-full" />
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Author forms, inspect candidate submissions, and customize logic from the admin console.
          </p>

          <div className="pt-1">
            <Button
              size="lg"
              onClick={handleAdminClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-11 px-6 gap-2 shadow-lg shadow-primary/20"
            >
              <Lock className="w-4 h-4" />
              <span>Open Admin Dashboard &rarr;</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={onboardingQuizLogo}
              alt=""
              className="w-5 h-5 rounded-md"
            />
            <span className="font-bold text-foreground font-heading">Onboarding Quiz</span>
            <span>•</span>
            <span>Enterprise Assessment Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button type="button" onClick={() => navigate('/apply')} className="hover:text-foreground">
              Candidate Portal
            </button>
            <button type="button" onClick={() => navigate('/admin?tab=builder')} className="hover:text-foreground">
              Form Builder
            </button>
            <button type="button" onClick={handleAdminClick} className="hover:text-primary">
              Admin Login
            </button>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => navigate('/admin')}
      />
    </div>
  );
};

export default LandingPage;

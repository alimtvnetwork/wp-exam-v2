import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  Sparkles,
  GitBranch,
  Cpu,
  Mail,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Lock,
  Play,
  FileText,
  Database,
  Globe,
  Award,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLoginModal, useAdminAuth } from '@/components/auth/AdminLoginModal';
import { ThemeSwitcher, useTheme } from '@/lib/theme-context';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, config } = useTheme();

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
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-base shadow-lg shadow-primary/20">
              WP
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-foreground flex items-center gap-1.5 font-heading">
                WP Exam
                <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-mono py-0">
                  Enterprise
                </Badge>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <button type="button" onClick={() => navigate('/admin?tab=builder')} className="hover:text-primary transition-colors">
              Form Builder
            </button>
            <button type="button" onClick={() => navigate('/apply')} className="hover:text-primary transition-colors">
              Candidate Portal
            </button>
            <button type="button" onClick={() => navigate('/runner')} className="hover:text-primary transition-colors">
              Live Preview
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeSwitcher />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdminClick}
              className="text-xs h-9 px-3.5 border-border hover:bg-muted gap-1.5 font-bold rounded-xl"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Admin Console' : 'Admin Login'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-border/60 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Assessment & Form Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-tight font-heading">
            Intelligent Exams & <br />
            <span className="text-primary">
              Dynamic Forms
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build interactive assessments, branching quizzes, and dynamic forms with instant validation, fluid themes, and candidate scoring workflows.
          </p>

          {/* Action Gateway Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/apply')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-11 px-6 gap-2 shadow-lg shadow-primary/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Assessment</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/admin?tab=builder')}
              className="border-border bg-card hover:bg-muted text-foreground text-sm h-11 px-6 gap-2"
            >
              <Layers className="w-4 h-4 text-primary" />
              <span>Open Form Builder</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/runner')}
              className="border-border bg-card hover:bg-muted text-foreground text-sm h-11 px-6 gap-2"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              <span>Live Preview</span>
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-2xl font-black text-primary block font-mono font-heading">Real-Time</span>
              <span className="text-xs text-muted-foreground">Validation & Scoring</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-2xl font-black text-sky-400 block font-mono font-heading">&lt; 10ms</span>
              <span className="text-xs text-muted-foreground">Instant Response</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-2xl font-black text-emerald-400 block font-mono font-heading">5 Themes</span>
              <span className="text-xs text-muted-foreground">Fluid Customization</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-2xl font-black text-purple-400 block font-mono font-heading">Enterprise</span>
              <span className="text-xs text-muted-foreground">Multi-Section Engine</span>
            </div>
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
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Engineered for high throughput, evaluation precision, and candidate security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">Multi-Section Architecture</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curriculum structured into sections with prerequisite gating and passing thresholds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">Visual Branching Logic</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive node graph detecting cyclic paths in real time with condition-based progression.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">Split SQLite Storage</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hybrid multi-database model for zero lock contention and offline local sync.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">Email & Certificate Automation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated score digests, certificates, and SMTP/SES delivery presets.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">Role Access & Anti-Cheat</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Token-based candidate authentication with attempt limits and anti-cheat answer stripping.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">AI Studio & JSON Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Embedded prompt templates and 1-click JSON import/export for automated question generation.
            </p>
          </div>
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
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Access the administrative console to author forms, inspect candidate submissions, and customize logic.
          </p>

          <div className="pt-1">
            <Button
              size="lg"
              onClick={handleAdminClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-11 px-8 gap-2 shadow-lg shadow-primary/20"
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
            <span className="font-bold text-foreground font-heading">WP Exam Engine</span>
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

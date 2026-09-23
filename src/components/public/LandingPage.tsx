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
    <div className="min-h-screen bg-[#0A0A14] text-[#F8FAFC] selection:bg-[#FFAD01] selection:text-[#0A0A14] font-sans antialiased">
      {/* Top Enterprise Navigation */}
      <header className="border-b border-[#292942]/60 backdrop-blur-md bg-[#0A0A14]/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFAD01] to-[#D97706] flex items-center justify-center font-black text-[#0A0A14] text-base shadow-lg shadow-[#FFAD01]/20">
              WP
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                WP Exam
                <Badge variant="outline" className="border-[#FFAD01]/40 text-[#FFAD01] text-[10px] font-mono py-0">
                  v2.5 Enterprise
                </Badge>
              </span>
              <p className="text-[10px] text-[#94A3B8] leading-none hidden sm:block">Universal Assessment & Dynamic Form Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#CBD5E1]">
            <a href="#features" className="hover:text-[#FFAD01] transition-colors">Features</a>
            <a href="#architecture" className="hover:text-[#FFAD01] transition-colors">Architecture</a>
            <button type="button" onClick={() => navigate('/apply')} className="hover:text-[#FFAD01] transition-colors">
              Candidate Wizard
            </button>
            <button type="button" onClick={() => navigate('/forms/canvas')} className="hover:text-[#FFAD01] transition-colors">
              Visual DAG Canvas
            </button>
            <button type="button" onClick={() => navigate('/runner')} className="hover:text-[#FFAD01] transition-colors">
              Live Runner
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdminClick}
              className="text-xs h-8 px-3.5 border-[#FFAD01]/40 text-[#FFAD01] hover:bg-[#FFAD01]/10 gap-1.5 font-bold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Admin Console' : 'Admin Login'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-[#292942]/40 bg-gradient-to-b from-[#0A0A14] via-[#101026] to-[#0A0A14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFAD01]/10 border border-[#FFAD01]/30 text-[#FFAD01] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Theme Presentation Engine • Split SQLite Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            The Enterprise Platform for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFAD01] via-[#FBBF24] to-[#F59E0B]">
              Exams, Dynamic Forms & Audits
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">
            WP Exam delivers a modern 4-tier curriculum framework, visual DAG dependency trees,
            dynamic candidate evaluation wizards with WhatsApp formatting, and zero-collision Split SQLite storage.
          </p>

          {/* Action Gateway Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/apply')}
              className="bg-[#FFAD01] hover:bg-[#F59E0B] text-[#0A0A14] font-black text-sm h-11 px-6 gap-2 shadow-xl shadow-[#FFAD01]/25"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Try Candidate Application (/apply)</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/forms/canvas')}
              className="border-[#292942] bg-[#141422] hover:bg-[#1E1E32] text-white text-sm h-11 px-6 gap-2"
            >
              <GitBranch className="w-4 h-4 text-[#FFAD01]" />
              <span>Explore Visual DAG Canvas</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/runner')}
              className="border-[#292942] bg-[#141422] hover:bg-[#1E1E32] text-white text-sm h-11 px-6 gap-2"
            >
              <Zap className="w-4 h-4 text-[#38BDF8]" />
              <span>Project Live Runner</span>
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="p-3.5 rounded-xl bg-[#141422]/70 border border-[#292942]/60">
              <span className="text-2xl font-black text-[#FFAD01] block font-mono">11/11</span>
              <span className="text-xs text-[#94A3B8]">CI Quality Gates Passed</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141422]/70 border border-[#292942]/60">
              <span className="text-2xl font-black text-[#38BDF8] block font-mono">47 Tests</span>
              <span className="text-xs text-[#94A3B8]">185 Verified Assertions</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141422]/70 border border-[#292942]/60">
              <span className="text-2xl font-black text-emerald-400 block font-mono">&lt; 15ms</span>
              <span className="text-xs text-[#94A3B8]">Split SQLite Latency</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141422]/70 border border-[#292942]/60">
              <span className="text-2xl font-black text-[#A78BFA] block font-mono">100%</span>
              <span className="text-xs text-[#94A3B8]">Zero CI Storage Usage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="architecture" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-14">
          <Badge variant="outline" className="border-[#FFAD01]/40 text-[#FFAD01] text-xs">
            System Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">How the WP Exam Engine Operates</h2>
          <p className="text-sm text-[#94A3B8] max-w-2xl mx-auto">
            Engineered for high enterprise throughput, pedagogical precision, and candidate security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#141422] border border-[#292942] hover:border-[#FFAD01]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFAD01]/10 text-[#FFAD01] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">4-Tier Learning Hierarchy</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Curriculum structured seamlessly into Categories, Projects, Sections, and Gated Questionnaires.
              Guarantees sequential progression and prerequisites verification.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#141422] border border-[#292942] hover:border-[#38BDF8]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual DAG Dependency Canvas</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Interactive node graph that detects cyclic dependencies in real time, displays conditional field branching,
              and renders step progression topology.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#141422] border border-[#292942] hover:border-emerald-500/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Split SQLite Architecture</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Hybrid multi-database model combining WordPress MySQL with isolated SQLite user shards for
              zero lock contention, offline sync, and instant recovery.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-[#141422] border border-[#292942] hover:border-[#A78BFA]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Provider Email Automation</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Auto-fills SMTP & IMAP presets for Gmail, Microsoft 365, Mailgun, and Amazon SES.
              Includes syntax-highlighted score certificates and per-section cadence rules.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-[#141422] border border-[#292942] hover:border-[#F43F5E]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/10 text-[#F43F5E] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Candidate Invites & RBAC Access</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Role-based token authentication (`Subscriber`, `Contributor`, `Evaluator`) with attempt limits,
              anti-cheat answer stripping, and token lifecycle management.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-[#141422] border border-[#292942] hover:border-[#F59E0B]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Instruction Studio</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dedicated AI studio embedded in every section. Copy pre-engineered prompts and verified JSON
              schemas for ChatGPT, Claude, and Google Antigravity.
            </p>
          </div>
        </div>
      </section>

      {/* Backend Administration Teaser Callout */}
      <section className="py-16 bg-[#101026] border-y border-[#292942]/60">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Badge variant="outline" className="border-[#FFAD01]/40 text-[#FFAD01] text-xs">
            Administrator Gateway
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to configure quizzes, projects, and email gateways?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
            Log in to the administrative console using the default test credentials (<code className="text-[#FFAD01] font-mono">admin</code> / <code className="text-[#FFAD01] font-mono">admin</code>).
          </p>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleAdminClick}
              className="bg-[#FFAD01] hover:bg-[#F59E0B] text-[#0A0A14] font-black text-sm h-11 px-8 gap-2 shadow-lg shadow-[#FFAD01]/20"
            >
              <Lock className="w-4 h-4" />
              <span>Open Admin Dashboard &rarr;</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#292942]/40 py-8 bg-[#0A0A14] text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">WP Exam & Universal Form Engine</span>
            <span>•</span>
            <span>Rise Up Asia & Developers Organism Edition</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button type="button" onClick={() => navigate('/apply')} className="hover:text-white">
              Candidate Portal
            </button>
            <button type="button" onClick={() => navigate('/forms/canvas')} className="hover:text-white">
              DAG Tree
            </button>
            <button type="button" onClick={handleAdminClick} className="hover:text-[#FFAD01]">
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

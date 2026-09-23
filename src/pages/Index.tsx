import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizEditor } from '../quiz/components/QuizEditor';
import { FormRunner } from '@/components/runner/FormRunner';
import { FocusQuizRunner } from '@/components/runner/FocusQuizRunner';
import { InvitesManager } from '@/components/admin/invites-manager';
import { HistoryManager } from '@/components/admin/history-manager';
import { EmailSettings } from '@/components/admin/email-settings';
import { SqliteStatus } from '@/components/admin/sqlite-status';
import { ProjectHierarchyManager } from '@/components/admin/project-hierarchy-manager';
import { AIInstructionStudio } from '@/components/admin/ai-instruction-studio';
import { BackupManager } from '@/components/admin/backup-manager';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { useAdminAuth } from '@/components/auth/AdminLoginModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Layers,
  Palette,
  ExternalLink,
  LogOut,
  FolderTree,
  FileEdit,
  Mail,
  Users,
  History,
  BarChart3,
  Sparkles,
  Database,
  Archive,
  Target,
  PlayCircle,
  KeyRound,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

type AdminTab =
  | 'builder'
  | 'projects'
  | 'focus-runner'
  | 'runner'
  | 'invites'
  | 'history'
  | 'analytics'
  | 'email'
  | 'ai-studio'
  | 'backups'
  | 'storage';

type ThemeId = 'riseup-asia' | 'letterly' | 'obsidian' | 'light';

export const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('builder');
  const [activeTheme, setActiveTheme] = useState<ThemeId>('riseup-asia');
  const store = useQuizStore();

  // Login form states for unauthenticated users
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('admin');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = login(loginUser, loginPass);

    if (isSuccess) {
      toast.success('Admin authentication verified!');
      setLoginError(null);
    } else {
      setLoginError('Invalid credentials. Default test credentials: admin / admin.');
    }
  };

  // If not authenticated, render professional admin login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A14] text-white flex items-center justify-center p-4 font-sans selection:bg-[#FFAD01] selection:text-[#0A0A14]">
        <div className="w-full max-w-md bg-[#141422] border border-[#292942] rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFAD01]/10 border border-[#FFAD01]/30 text-[#FFAD01] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">WP Exam Console</h1>
            <p className="text-xs text-[#94A3B8]">
              Restricted administrative portal for curriculum authoring and candidate scoring.
            </p>
          </div>

          <form onSubmit={handleInlineLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#CBD5E1]">Username</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                <Input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="pl-9 bg-[#0A0A14] border-[#292942] text-xs h-9 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#CBD5E1]">Password</Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                <Input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="pl-9 bg-[#0A0A14] border-[#292942] text-xs h-9 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0A14] border border-[#292942] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#FFAD01] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Credentials:</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                User: <code className="text-white font-mono bg-[#1E1E32] px-1 rounded">admin</code> |
                Password: <code className="text-white font-mono bg-[#1E1E32] px-1 rounded">admin</code>
              </p>
            </div>

            <Button type="submit" className="w-full bg-[#FFAD01] hover:bg-[#F59E0B] text-[#0A0A14] font-bold text-xs h-10">
              Sign In to Administration &rarr;
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-[#94A3B8] hover:text-[#FFAD01] transition"
              >
                &larr; Return to Public Website
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Theme container classes
  const themeClassMap: Record<ThemeId, string> = {
    'riseup-asia': 'theme-riseup-asia bg-[#0A0A14] text-[#F8FAFC]',
    letterly: 'theme-letterly bg-[#0F0E1E] text-white',
    obsidian: 'theme-dark bg-[#090D16] text-[#F8FAFC]',
    light: 'theme-light bg-slate-50 text-slate-900',
  };

  return (
    <div className={`min-h-screen ${themeClassMap[activeTheme]} transition-colors duration-300 font-sans`}>
      {/* Enterprise Administrative Header */}
      <header className="border-b border-border/80 bg-card/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shadow">
              WP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">WP Exam Console</span>
                <Badge variant="outline" className="text-[10px] font-mono py-0">v2.5 Enterprise</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block font-mono">
                Split SQLite WAL • Multi-Theme Engine
              </p>
            </div>
          </div>

          {/* Theme Switcher & Actions */}
          <div className="flex items-center gap-3">
            {/* Global Theme Selector */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
              <Palette className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value as ThemeId)}
                className="text-xs font-semibold bg-transparent border-0 pr-2 py-0.5 focus:ring-0 cursor-pointer"
              >
                <option value="riseup-asia">Rise Up Asia (Gold & Navy)</option>
                <option value="letterly">Letterly (Deep Indigo)</option>
                <option value="obsidian">Obsidian Slate (High Contrast)</option>
                <option value="light">Enterprise Clean Paper (Light)</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs h-8 gap-1.5 border-border hidden sm:flex"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Portal</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-xs h-8 gap-1 text-muted-foreground hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Structured Domain Navigation Bar (Eliminates the childish flat pills) */}
        <div className="border-t border-border/60 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-1.5 gap-6">
            {/* Group 1: Curriculum & Authoring */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2">
                Authoring:
              </span>
              <Button
                variant={activeTab === 'builder' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('builder')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Form Builder</span>
              </Button>
              <Button
                variant={activeTab === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('projects')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Projects Tree</span>
              </Button>
            </div>

            {/* Group 2: Candidate Delivery */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2">
                Delivery:
              </span>
              <Button
                variant={activeTab === 'focus-runner' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('focus-runner')}
                className="text-xs h-7 px-2.5 gap-1.5 font-bold"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Focus Quiz</span>
              </Button>
              <Button
                variant={activeTab === 'runner' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('runner')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Runner</span>
              </Button>
              <Button
                variant={activeTab === 'invites' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('invites')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Candidate Invites</span>
              </Button>
            </div>

            {/* Group 3: Operations & Data */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2">
                Operations:
              </span>
              <Button
                variant={activeTab === 'email' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('email')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Gateway</span>
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('history')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit History</span>
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('analytics')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </Button>
              <Button
                variant={activeTab === 'storage' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('storage')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>SQLite DB</span>
              </Button>
              <Button
                variant={activeTab === 'backups' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('backups')}
                className="text-xs h-7 px-2.5 gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Backups</span>
              </Button>
            </div>

            {/* Group 4: AI Prompt Engineering */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant={activeTab === 'ai-studio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('ai-studio')}
                className="text-xs h-7 px-2.5 gap-1.5 border-primary/40 text-primary"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Studio</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'builder' && <QuizEditor />}

        {activeTab === 'projects' && (
          <div className="max-w-6xl mx-auto">
            <ProjectHierarchyManager onLaunchFocusRunner={() => setActiveTab('focus-runner')} />
          </div>
        )}

        {activeTab === 'focus-runner' && (
          <div className="max-w-xl mx-auto py-2">
            <FocusQuizRunner onBackToAdmin={() => setActiveTab('projects')} />
          </div>
        )}

        {activeTab === 'runner' && (
          <div className="max-w-4xl mx-auto py-2">
            <FormRunner
              form={{
                title: store.title,
                description: store.description,
                formType: store.formType,
                formAccess: store.formAccess,
                isSequential: store.isSequential,
                isPublished: true,
                settings: store.settings,
                fields: store.fields,
              }}
              onClose={() => setActiveTab('builder')}
            />
          </div>
        )}

        {activeTab === 'invites' && (
          <div className="max-w-4xl mx-auto">
            <InvitesManager onNavigateToRunner={() => setActiveTab('runner')} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <HistoryManager />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto">
            <AnalyticsDashboard />
          </div>
        )}

        {activeTab === 'email' && (
          <div className="max-w-4xl mx-auto">
            <EmailSettings />
          </div>
        )}

        {activeTab === 'ai-studio' && (
          <div className="max-w-4xl mx-auto">
            <AIInstructionStudio />
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="max-w-5xl mx-auto">
            <SqliteStatus />
          </div>
        )}

        {activeTab === 'backups' && (
          <div className="max-w-5xl mx-auto">
            <BackupManager />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

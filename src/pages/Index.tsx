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
import { ThemeSwitcher, useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WpAdminSidebar, AdminTab } from '@/components/admin/wp-admin-sidebar';
import {
  Shield,
  ExternalLink,
  LogOut,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('builder');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
  const themeClassMap: Record<string, string> = {
    riseup: 'theme-riseup-asia bg-[#0A0A14] text-[#F8FAFC]',
    letterly: 'theme-letterly bg-[#0F0E1E] text-white',
    obsidian: 'theme-dark bg-[#090D16] text-[#F8FAFC]',
    clean: 'theme-light bg-slate-50 text-slate-900',
  };

  return (
    <div className={`min-h-screen ${themeClassMap[theme] || themeClassMap.riseup} transition-colors duration-300 font-sans`}>
      {/* WordPress Top Admin Bar */}
      <header className="h-12 border-b border-[#292942] bg-[#0E0E18] sticky top-0 z-40 px-3 sm:px-4 flex items-center justify-between">
        {/* Left Side: Brand, Portal Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FFAD01] text-[#0A0A14] font-black text-xs flex items-center justify-center font-serif shadow-xs">
              W
            </div>
            <span className="font-bold text-xs tracking-tight text-white hidden sm:inline">
              WP Exam Console
            </span>
            <Badge variant="outline" className="text-[9px] font-mono py-0 border-[#292942] text-[#94A3B8]">
              v2.5
            </Badge>
          </div>

          <div className="h-4 w-px bg-[#292942] hidden sm:block" />

          {/* Quick link to public site */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs h-7 px-2 gap-1.5 text-[#94A3B8] hover:text-[#FFAD01] hover:bg-[#1E1E32]"
            title="Visit Public Candidate Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-xs">Visit Portal</span>
          </Button>
        </div>

        {/* Right Side: Theme Switcher, Howdy Admin, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher />

          <div className="h-4 w-px bg-[#292942]" />

          {/* User Profile */}
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="hidden md:inline">Howdy,</span>
            <span className="font-semibold text-white">admin</span>
            <div className="w-5 h-5 rounded-full bg-[#1E1E32] border border-[#292942] flex items-center justify-center text-[#FFAD01]">
              <User className="w-3 h-3" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-xs h-7 px-2 gap-1 text-[#94A3B8] hover:text-red-400 hover:bg-[#1E1E32]"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </header>

      {/* WordPress 2-Column Administrative Dashboard */}
      <div className="flex min-h-[calc(100vh-48px)]">
        {/* Persistent Left-Hand Admin Sidebar */}
        <WpAdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigateHome={() => navigate('/')}
        />

        {/* Fluid Right Content Canvas */}
        <main className="flex-1 min-w-0 bg-background/50 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

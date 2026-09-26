import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { QuizEditor } from '../quiz/components/QuizEditor';
import { FormRunner } from '@/components/runner/FormRunner';
import { FocusQuizRunner, FocusQuizConfig } from '@/components/runner/FocusQuizRunner';
import { FocusQuizEditor } from '@/components/admin/focus-quiz-editor';
import { InvitesManager } from '@/components/admin/invites-manager';
import { HistoryManager } from '@/components/admin/history-manager';
import { EmailSettings } from '@/components/admin/email-settings';
import { SqliteStatus } from '@/components/admin/sqlite-status';
import { ProjectHierarchyManager, ProjectItem } from '@/components/admin/project-hierarchy-manager';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: routeSlug, tab: routeTab } = useParams<{ slug?: string; tab?: string }>();
  const tabFromUrl = (routeTab || searchParams.get('tab')) as AdminTab;
  const [activeTab, setActiveTabState] = useState<AdminTab>(tabFromUrl || 'builder');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedFocusProject, setSelectedFocusProject] = useState<FocusQuizConfig | undefined>(undefined);
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { theme } = useTheme();
  const store = useQuizStore();

  useEffect(() => {
    if (routeSlug) {
      if (routeSlug !== store.slug) {
        store.setSlug(routeSlug);
      }
    }
  }, [routeSlug, store]);

  const handleLaunchFocusProject = (project: ProjectItem) => {
    const focusConfig: FocusQuizConfig = {
      id: project.id,
      title: project.title,
      questions: [],
    };
    setSelectedFocusProject(focusConfig);
    handleSelectTab('focus-runner');
  };

  const handleSelectTab = (newTab: AdminTab) => {
    setActiveTabState(newTab);
    
    if (newTab === 'builder' && store.slug) {
      navigate(`/admin/form/${store.slug}`);
    } else {
      navigate(`/admin/${newTab}`);
    }
  };

  useEffect(() => {
    const currentTabInUrl = (routeTab || searchParams.get('tab')) as AdminTab;
    if (currentTabInUrl && currentTabInUrl !== activeTab) {
      setActiveTabState(currentTabInUrl);
    }
  }, [routeTab, searchParams, activeTab]);

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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-primary-foreground">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">WP Exam Console</h1>
            <p className="text-sm text-muted-foreground">
              Restricted administrative portal for curriculum authoring and candidate scoring.
            </p>
          </div>

          <form onSubmit={handleInlineLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Username</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="pl-9 bg-background border-border text-sm h-9 text-foreground font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Password</Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="pl-9 bg-background border-border text-sm h-9 text-foreground font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-sm space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Credentials:</span>
              </div>
              <p className="text-xs text-muted-foreground">
                User: <code className="text-foreground font-mono bg-muted px-1 rounded">admin</code> |
                Password: <code className="text-foreground font-mono bg-muted px-1 rounded">admin</code>
              </p>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-10 shadow-xs">
              Sign In to Administration &rarr;
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-primary transition"
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
    riseup: 'theme-riseup-asia bg-background text-foreground',
    purple: 'theme-purple bg-background text-foreground',
    dracula: 'theme-dracula bg-background text-foreground',
    obsidian: 'theme-obsidian bg-background text-foreground',
    clean: 'theme-clean bg-background text-foreground',
    'clean-wide': 'theme-clean-wide bg-background text-foreground',
  };

  return (
    <div className={`min-h-screen ${themeClassMap[theme] || themeClassMap.riseup} transition-colors duration-300 font-sans`}>
      {/* WordPress Top Admin Bar */}
      <header className="h-12 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 flex items-center justify-between">
        {/* Left Side: Brand, Portal Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground font-black text-sm flex items-center justify-center font-serif shadow-xs">
              W
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground hidden sm:inline">
              WP Exam Console
            </span>
            <Badge variant="outline" className="text-xs font-mono py-0 border-border text-muted-foreground">
              v2.5
            </Badge>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Quick link to public site */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-sm h-7 px-2 gap-1.5 text-muted-foreground hover:text-primary hover:bg-muted"
            title="Visit Public Candidate Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-sm">Visit Portal</span>
          </Button>
        </div>

        {/* Right Side: Theme Switcher, Howdy Admin, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher />

          <div className="h-4 w-px bg-border" />

          {/* User Profile */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="hidden md:inline">Howdy,</span>
            <span className="font-semibold text-foreground">admin</span>
            <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-primary">
              <User className="w-3 h-3" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-sm h-7 px-2 gap-1 text-muted-foreground hover:text-destructive hover:bg-muted"
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
          onSelectTab={handleSelectTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigateHome={() => navigate('/')}
        />

        {/* Fluid Right Content Canvas */}
        <main className="flex-1 min-w-0 bg-background/50 overflow-y-auto">
          <div className="p-0">
            {activeTab === 'builder' && <QuizEditor />}

            {activeTab === 'focus-editor' && (
              <div className="max-w-5xl mx-auto">
                <FocusQuizEditor
                  onLaunchRunner={(cfg) => {
                    setSelectedFocusProject(cfg);
                    handleSelectTab('focus-runner');
                  }}
                />
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="max-w-6xl mx-auto">
                <ProjectHierarchyManager onLaunchFocusRunner={handleLaunchFocusProject} />
              </div>
            )}

            {activeTab === 'focus-runner' && (
              <div className="max-w-xl mx-auto py-2">
                <FocusQuizRunner
                  config={
                    selectedFocusProject ||
                    (() => {
                      if (typeof window !== 'undefined') {
                        const saved = localStorage.getItem('wp_exam_saved_focus_quiz');
                        if (saved) {
                          try {
                            return JSON.parse(saved);
                          } catch {
                            // Fallback to default
                          }
                        }
                      }
                      return undefined;
                    })()
                  }
                  onBackToAdmin={() => handleSelectTab('focus-editor')}
                />
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
                  onClose={() => handleSelectTab('builder')}
                />
              </div>
            )}

            {activeTab === 'invites' && (
              <div className="max-w-4xl mx-auto">
                <InvitesManager onNavigateToRunner={() => handleSelectTab('runner')} />
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

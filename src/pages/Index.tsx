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
import { ThemeBuilder } from '@/components/theme-builder';
import { GuidedTourManager, GuidedTourReplayButton } from '@/components/onboarding/guided-tour';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { useAdminAuth } from '@/components/auth/AdminLoginModal';
import { ThemeSwitcher, useTheme, AppThemeType } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WpAdminSidebar, AdminTab } from '@/components/admin/wp-admin-sidebar';
import onboardingQuizLogo from '@/assets/onboarding-quiz-logo.svg';
import {
  ExternalLink,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';

export const Index: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: routeSlug, tab: routeTab } = useParams<{ slug?: string; tab?: string }>();
  const tabFromUrl = (routeTab || searchParams.get('tab')) as AdminTab;
  const [activeTab, setActiveTabState] = useState<AdminTab>(tabFromUrl || 'builder');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previousTab, setPreviousTab] = useState<AdminTab>(activeTab);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedFocusProject, setSelectedFocusProject] = useState<FocusQuizConfig | undefined>(undefined);
  const { isAdmin, isVerified, verify, logout } = useAdminAuth();
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

  // Tab-content transition: play the outgoing panel's exit animation, then swap.
  useEffect(() => {
    if (activeTab === previousTab) {
      setIsLeaving(false);

      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPreviousTab(activeTab);

      return;
    }

    setIsLeaving(true);
    const swapTimer = window.setTimeout(() => {
      setPreviousTab(activeTab);
      setIsLeaving(false);
    }, 150);

    return () => {
      window.clearTimeout(swapTimer);
    };
  }, [activeTab, previousTab]);

  // Admin access is delegated to the WordPress session: the server reports
  // whether the current user can manage options. No credential form exists
  // here by design (see 07-security-hardening-spec.md).
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryAccess = async () => {
    setIsRetrying(true);
    await verify();
    setIsRetrying(false);
  };

  // While the server verdict is pending, show a verifying screen.
  if (!isVerified || isRetrying) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying administrator access…</p>
        </div>
      </div>
    );
  }

  // If not an administrator, explain and point at WordPress sign-in.
  // No credential fields are rendered here — WordPress owns authentication.
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-primary-foreground">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-md overflow-hidden">
          <div className="h-0.5 w-full bg-primary/70" />
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-muted border border-border text-primary flex items-center justify-center mx-auto overflow-hidden shadow-xs ring-1 ring-border/50">
                <img
                  src={onboardingQuizLogo}
                  alt="Onboarding Quiz"
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground font-heading">Onboarding Quiz Console</h1>
              <p className="text-sm text-muted-foreground">
                Restricted to WordPress administrators.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-sm space-y-1">
              <p className="text-xs text-muted-foreground">
                Sign in to WordPress as an administrator, then retry. Your
                WordPress session is the only credential this console accepts —
                there is no separate admin password.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-10 shadow-xs"
                onClick={() => {
                  window.location.href = '/wp-login.php';
                }}
              >
                Sign in to WordPress &rarr;
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm h-10"
                onClick={handleRetryAccess}
                disabled={isRetrying}
              >
                Retry verification
              </Button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                &larr; Return to Public Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Theme container classes
  const themeClassMap: Record<AppThemeType, string> = {
    riseup: 'theme-riseup-asia bg-background text-foreground',
    purple: 'theme-purple bg-background text-foreground',
    dracula: 'theme-dracula bg-background text-foreground',
    obsidian: 'theme-obsidian bg-background text-foreground',
    'vscode-navy-gold': 'theme-vscode-navy-gold bg-background text-foreground',
    clean: 'theme-clean bg-background text-foreground',
    'clean-wide': 'theme-clean-wide bg-background text-foreground',
    'sweet-digs': 'theme-sweet-digs bg-background text-foreground',
    'green-choice': 'theme-green-choice bg-background text-foreground',
  };

  return (
    <div className={`min-h-screen ${themeClassMap[theme] || themeClassMap.riseup} transition-colors duration-300 font-sans`}>
      <GuidedTourManager />

      {/* WordPress Top Admin Bar */}
      <header className="h-12 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 flex items-center justify-between">
        {/* Left Side: Brand, Portal Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={onboardingQuizLogo}
              alt=""
              title="Onboarding Quiz"
              className="w-7 h-7 rounded-lg shrink-0 shadow-xs ring-1 ring-border/50"
            />
            <span className="font-bold text-sm tracking-tight text-foreground hidden sm:inline">
              Onboarding Quiz
            </span>
            <Badge variant="outline" className="text-xs font-mono py-0 border-border text-muted-foreground">
              v2.5
            </Badge>
          </div>
        </div>

        {/* Right Side: Theme Switcher + account overflow menu (≤3 primary items) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GuidedTourReplayButton />

          <ThemeSwitcher />

          <div className="h-4 w-px bg-border" />

          {/* Account menu: secondary actions (portal link, log out) live here */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Account menu"
                className="h-8 w-8 p-0 rounded-full hover:bg-accent/50 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-foreground">
                  <User className="w-3.5 h-3.5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover border border-border shadow-xl p-1 text-xs">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5">
                Howdy, administrator
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 border-border/60" />
              <DropdownMenuItem
                onClick={() => navigate('/')}
                className="gap-2 cursor-pointer py-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span>Visit Public Portal</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="gap-2 cursor-pointer py-1.5 text-destructive focus:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <div key={activeTab} className={isLeaving ? 'animate-tab-panel-out' : 'animate-tab-panel-in'}>
              {previousTab === 'builder' && <QuizEditor />}

              {previousTab === 'focus-editor' && (
                <div className="max-w-5xl mx-auto">
                  <FocusQuizEditor
                    onLaunchRunner={(cfg) => {
                      setSelectedFocusProject(cfg);
                      handleSelectTab('focus-runner');
                    }}
                  />
                </div>
              )}

              {previousTab === 'projects' && (
                <div className="max-w-6xl mx-auto">
                  <ProjectHierarchyManager onLaunchFocusRunner={handleLaunchFocusProject} />
                </div>
              )}

              {previousTab === 'focus-runner' && (
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

              {previousTab === 'runner' && (
                <div className="w-full max-w-7xl mx-auto py-1 px-1 sm:px-2">
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

              {previousTab === 'invites' && (
                <div className="max-w-4xl mx-auto">
                  <InvitesManager onNavigateToRunner={() => handleSelectTab('runner')} />
                </div>
              )}

              {previousTab === 'history' && (
                <div className="max-w-4xl mx-auto">
                  <HistoryManager />
                </div>
              )}

              {previousTab === 'analytics' && (
                <div className="max-w-6xl mx-auto">
                  <AnalyticsDashboard />
                </div>
              )}

              {previousTab === 'email' && (
                <div className="max-w-4xl mx-auto">
                  <EmailSettings />
                </div>
              )}

              {previousTab === 'ai-studio' && (
                <div className="max-w-4xl mx-auto">
                  <AIInstructionStudio />
                </div>
              )}

              {previousTab === 'storage' && (
                <div className="max-w-5xl mx-auto">
                  <SqliteStatus />
                </div>
              )}

              {previousTab === 'backups' && (
                <div className="max-w-5xl mx-auto">
                  <BackupManager />
                </div>
              )}

              {previousTab === 'theme-builder' && (
                <div className="max-w-7xl mx-auto">
                  <ThemeBuilder />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

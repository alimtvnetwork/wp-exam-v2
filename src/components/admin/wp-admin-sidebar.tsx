import React, { useState, useEffect, useRef } from 'react';
import {
  FileEdit,
  FolderTree,
  Sparkles,
  Target,
  PlayCircle,
  Users,
  BarChart3,
  History,
  Mail,
  Archive,
  Database,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Settings,
  Palette,
  ExternalLink,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import onboardingQuizLogo from '@/assets/onboarding-quiz-logo.svg';

export type AdminTab =
  | 'builder'
  | 'focus-editor'
  | 'projects'
  | 'focus-runner'
  | 'runner'
  | 'pipeline'
  | 'invites'
  | 'history'
  | 'analytics'
  | 'email'
  | 'ai-studio'
  | 'backups'
  | 'storage'
  | 'theme-builder';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'amber';
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Authoring & Curriculum',
    items: [
      {
        id: 'builder',
        label: 'Form & Quiz Builder',
        icon: FileEdit,
        badge: 'v2.5',
        badgeVariant: 'amber',
        description: 'Drag & drop form designer',
      },
      {
        id: 'focus-editor',
        label: 'Focus Quiz Studio',
        icon: Target,
        badge: 'New',
        badgeVariant: 'secondary',
        description: '4-stage sequential quiz authoring',
      },
      {
        id: 'projects',
        label: 'Curriculum Projects',
        icon: FolderTree,
        description: 'Hierarchical learning tracks',
      },
      {
        id: 'ai-studio',
        label: 'AI Instruction Studio',
        icon: Sparkles,
        badge: 'AI',
        badgeVariant: 'default',
        description: 'Prompt architect & code generator',
      },
    ],
  },
  {
    title: 'Candidate Delivery',
    items: [
      {
        id: 'focus-runner',
        label: 'Focus Quiz Runner',
        icon: Target,
        badge: 'Distraction-Free',
        badgeVariant: 'secondary',
        description: '4-stage candidate assessment',
      },
      {
        id: 'runner',
        label: 'Live Form Runner',
        icon: PlayCircle,
        description: 'Direct interactive preview',
      },
      {
        id: 'pipeline',
        label: 'Applicant Pipeline',
        icon: UserCheck,
        badge: 'Kanban',
        badgeVariant: 'amber',
        description: 'Recruitment stage transitions',
      },
      {
        id: 'invites',
        label: 'Candidate Invites',
        icon: Users,
        description: 'Token auth & magic links',
      },
    ],
  },
  {
    title: 'Operations & Triage',
    items: [
      {
        id: 'analytics',
        label: 'Analytics & Scoring',
        icon: BarChart3,
        description: 'Passing metrics & statistics',
      },
      {
        id: 'history',
        label: 'Audit Trail & History',
        icon: History,
        description: 'SQLite split-DB logs & rollback',
      },
      {
        id: 'email',
        label: 'Email Gateway',
        icon: Mail,
        badge: 'Active',
        badgeVariant: 'secondary',
        description: 'Cadence notifications & dispatch',
      },
    ],
  },
  {
    title: 'System & Engine',
    items: [
      {
        id: 'backups',
        label: 'Backup Manager',
        icon: Archive,
        description: 'Automated database snapshots',
      },
      {
        id: 'storage',
        label: 'SQLite Split-DB',
        icon: Database,
        badge: 'WAL',
        badgeVariant: 'outline',
        description: 'Multi-shard engine status',
      },
      {
        id: 'theme-builder',
        label: 'Theme Builder',
        icon: Palette,
        badge: 'New',
        badgeVariant: 'secondary',
        description: 'Live theme token studio',
      },
    ],
  },
];

interface WpAdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigateHome?: () => void;
}

export const WpAdminSidebar: React.FC<WpAdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onNavigateHome,
}) => {
  const buttonRefs = useRef(new Map<AdminTab, HTMLButtonElement | null>());
  const hasPlacedIndicatorRef = useRef(false);
  const [expandKey, setExpandKey] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    if (isCollapsed) {
      return;
    }

    setExpandKey((prevKey) => prevKey + 1);
  }, [isCollapsed]);

  useEffect(() => {
    const activeButton = buttonRefs.current.get(activeTab);

    if (!activeButton) {
      setIndicatorStyle({ opacity: 0 });

      return;
    }

    const nextStyle: React.CSSProperties = {
      height: Math.max(activeButton.offsetHeight - 12, 0),
      transform: `translateY(${activeButton.offsetTop + 6}px)`,
      opacity: 1,
    };

    if (!hasPlacedIndicatorRef.current) {
      nextStyle.transition = 'opacity 0.2s var(--ease-state)';
      hasPlacedIndicatorRef.current = true;
    }

    setIndicatorStyle(nextStyle);
  }, [activeTab, isCollapsed]);

  return (
    <aside
      className={`relative flex flex-col bg-card border-r border-border transition-[width] duration-300 ease-[var(--ease-out-editorial)] overflow-hidden z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* WordPress Admin Brand Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-border bg-muted/30">
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
        >
          <img
            src={onboardingQuizLogo}
            alt="Onboarding Quiz"
            title="Onboarding Quiz"
            className="w-8 h-8 rounded-lg shrink-0 shadow-xs ring-1 ring-border/50 group-hover:ring-primary/50 transition-all duration-200"
          />

          <div
            key={`brand-${expandKey}`}
            className={`sidebar-label min-w-0 flex-1 overflow-hidden ${
              isCollapsed ? 'is-collapsed' : 'animate-sidebar-label-in'
            }`}
            aria-hidden={isCollapsed}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                Onboarding Quiz
              </span>
              <span className="text-xs px-1 rounded bg-muted text-primary font-mono border border-border">
                v2.5
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              Admin Console
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          title="Collapse Sidebar"
          tabIndex={isCollapsed ? -1 : undefined}
          aria-hidden={isCollapsed}
          className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-[opacity,transform,background-color,color] duration-200 ease-[var(--ease-state)] cursor-pointer ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="relative flex-1 overflow-y-auto py-3 space-y-4 px-2 custom-scrollbar">
        <span
          aria-hidden="true"
          className="admin-active-indicator pointer-events-none z-10 top-0"
          style={indicatorStyle}
        />

        {NAV_SECTIONS.map((section, sectionIdx) => {
          const showDivider = isCollapsed && sectionIdx > 0;

          return (
            <div key={sectionIdx} className="space-y-1">
              <div
                key={`section-header-${sectionIdx}-${expandKey}`}
                className={`sidebar-label px-2.5 pb-1 ${
                  isCollapsed
                    ? 'is-collapsed'
                    : `animate-sidebar-label-in stagger-${Math.min(sectionIdx + 1, 6)}`
                }`}
                aria-hidden={isCollapsed}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 font-mono flex items-center gap-1.5">
                  {section.title}
                </span>
              </div>

              <div
                className={`mx-1 overflow-hidden transition-[opacity] duration-200 ease-[var(--ease-state)] ${
                  showDivider ? 'my-2 border-t border-border opacity-100' : 'my-0 h-0 opacity-0'
                }`}
                aria-hidden={!showDivider}
              />

              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      ref={(element) => {
                        buttonRefs.current.set(item.id, element);
                      }}
                      onClick={() => onSelectTab(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-[var(--ease-state)] group cursor-pointer ${
                        isActive
                          ? 'bg-primary/15 text-foreground font-semibold shadow-xs ring-1 ring-primary/40'
                          : 'text-foreground/85 hover:text-foreground hover:bg-primary/10 hover:translate-x-1 hover:border-l-2 hover:border-primary/60'
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-primary'
                        }`}
                      />

                      <div
                        key={`nav-label-${item.id}-${expandKey}`}
                        className={`sidebar-label flex-1 flex items-center justify-between overflow-hidden ${
                          isCollapsed
                            ? 'is-collapsed'
                            : `animate-sidebar-item-in stagger-${Math.min(itemIdx + 1, 6)}`
                        }`}
                        aria-hidden={isCollapsed}
                      >
                        <span className="truncate group-hover:text-foreground group-hover:font-semibold transition-all">{item.label}</span>

                        {item.badge && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ml-1.5 transition-colors ${
                              item.badgeVariant === 'amber'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : item.badgeVariant === 'secondary'
                                ? 'bg-primary/20 text-primary border border-primary/30 font-semibold'
                                : 'bg-muted/80 text-foreground/80 border border-border'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer & Collapse Toggle */}
      <div className="p-2 border-t border-border bg-muted/20">
        <div className="relative h-8">
          <div
            className={`absolute inset-0 flex items-center justify-between px-2 text-xs text-muted-foreground transition-[opacity,transform] duration-200 ease-[var(--ease-state)] ${
              isCollapsed ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'
            }`}
            aria-hidden={isCollapsed}
          >
            <span className="font-mono text-xs">Onboarding Quiz v2.5</span>
            <button
              type="button"
              onClick={onToggleCollapse}
              tabIndex={isCollapsed ? -1 : undefined}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-mono text-xs"
            >
              <span>Collapse</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            tabIndex={isCollapsed ? undefined : -1}
            aria-hidden={!isCollapsed}
            className={`absolute inset-0 w-full rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-[opacity,transform,background-color,color] duration-200 ease-[var(--ease-state)] cursor-pointer ${
              isCollapsed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

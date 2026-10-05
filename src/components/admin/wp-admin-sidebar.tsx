import React, { useState } from 'react';
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
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import onboardingQuizLogo from '@/assets/onboarding-quiz-logo.svg';

export type AdminTab =
  | 'builder'
  | 'focus-editor'
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
  return (
    <aside
      className={`relative flex flex-col bg-card border-r border-border transition-all duration-300 z-30 select-none ${
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

          {!isCollapsed && (
            <div className="overflow-hidden">
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
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 px-2 custom-scrollbar">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 font-mono flex items-center gap-1.5">
                  {section.title}
                </span>
              </div>
            )}

            {isCollapsed && sectionIdx > 0 && (
              <div className="my-2 border-t border-border mx-1" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'bg-primary/15 text-foreground font-semibold shadow-xs ring-1 ring-primary/40 border-l-2 border-primary'
                        : 'text-foreground/80 hover:text-foreground hover:bg-muted/70 hover:translate-x-1 hover:border-l-2 hover:border-primary/40'
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />
                    )}

                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-primary'
                      }`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="truncate group-hover:underline group-hover:underline-offset-2 transition-all">{item.label}</span>

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
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer & Collapse Toggle */}
      <div className="p-2 border-t border-border bg-muted/20">
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
            <span className="font-mono text-xs">Onboarding Quiz v2.5</span>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-mono text-xs"
            >
              <span>Collapse</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

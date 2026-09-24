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

export type AdminTab =
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
      className={`relative flex flex-col bg-[#141422] border-r border-[#292942] transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* WordPress Admin Brand Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#292942]/80 bg-[#0E0E18]">
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="WP Exam Console"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFAD01] to-[#D97706] text-[#0A0A14] font-black text-sm flex items-center justify-center shadow-md shadow-[#FFAD01]/10 group-hover:scale-105 transition-transform shrink-0">
            WP
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-white group-hover:text-[#FFAD01] transition-colors">
                  WP Exam
                </span>
                <span className="text-[10px] px-1 rounded bg-[#292942] text-[#FFAD01] font-mono">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-mono truncate">
                Admin Console
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#292942] transition-colors"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
                  {section.title}
                </span>
              </div>
            )}

            {isCollapsed && sectionIdx > 0 && (
              <div className="my-2 border-t border-[#292942]/60 mx-1" />
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
                    className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#FFAD01]/15 text-[#FFF1D6] font-semibold shadow-xs'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-[#1E1E32]/70'
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#FFAD01]" />
                    )}

                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#FFAD01]'
                          : 'text-[#94A3B8] group-hover:text-white'
                      }`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="truncate">{item.label}</span>

                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium shrink-0 ml-1.5 ${
                              item.badgeVariant === 'amber'
                                ? 'bg-[#FFAD01]/20 text-[#FFAD01] border border-[#FFAD01]/30'
                                : item.badgeVariant === 'secondary'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-[#292942] text-[#CBD5E1]'
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
      <div className="p-2 border-t border-[#292942]/80 bg-[#0E0E18]">
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#292942] transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#94A3B8]">
            <span className="font-mono text-[10px]">WP Admin UI v2.5</span>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1 font-mono text-[10px]"
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

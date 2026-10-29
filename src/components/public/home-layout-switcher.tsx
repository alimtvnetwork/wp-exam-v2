import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutTemplate,
  Check,
  Sparkles,
  Layers,
  Route,
  Rows3,
  PenLine,
  Radio,
  Flame,
  ChevronDown,
  X,
  Palette,
} from 'lucide-react';
import { AppThemeType } from '@/lib/theme-context';

export type HomeLayoutType = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7';

export interface HomeLayoutOption {
  id: HomeLayoutType;
  title: string;
  tagline: string;
  badgeText: string;
  signatureTheme: AppThemeType;
  themeName: string;
  themeDotColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const HOME_LAYOUT_OPTIONS: HomeLayoutOption[] = [
  {
    id: 'v1',
    title: 'V1: Classic Enterprise',
    tagline: 'Grounded enterprise portal & simulator',
    badgeText: 'Classic',
    signatureTheme: 'green-choice',
    themeName: 'Green Choice',
    themeDotColor: '#16A34A',
    icon: Layers,
  },
  {
    id: 'v2',
    title: 'V2: Live Test-Drive Hub',
    tagline: 'Interactive 3-question mini-exam & live scoring',
    badgeText: 'Test-Drive',
    signatureTheme: 'purple',
    themeName: 'Electric Purple',
    themeDotColor: '#5C45FD',
    icon: Sparkles,
  },
  {
    id: 'v3',
    title: 'V3: Transit Map',
    tagline: 'Roles drawn as lines, test sections as stops',
    badgeText: 'Map',
    signatureTheme: 'riseup',
    themeName: 'Night Map & Line Colours',
    themeDotColor: '#2FBF71',
    icon: Route,
  },
  {
    id: 'v4',
    title: 'V4: Results Board',
    tagline: 'Split-flap scoreboard of candidate results',
    badgeText: 'Board',
    signatureTheme: 'dracula',
    themeName: 'Black & Signal Orange',
    themeDotColor: '#FF5A1F',
    icon: Rows3,
  },
  {
    id: 'v5',
    title: 'V5: Answer Sheet',
    tagline: 'A printed exam paper, marked in red pen',
    badgeText: 'Paper',
    signatureTheme: 'clean-wide',
    themeName: 'Paper & Red Pen',
    themeDotColor: '#C8202F',
    icon: PenLine,
  },
  {
    id: 'v6',
    title: 'V6: Operations Command Center',
    tagline: 'Live assessment control, verification & trust pipeline',
    badgeText: 'Operations',
    signatureTheme: 'obsidian',
    themeName: 'Obsidian Cyan',
    themeDotColor: '#38BDF8',
    icon: Radio,
  },
  {
    id: 'v7',
    title: 'V7: Hiring Yield Studio',
    tagline: 'Candidate conversion, lifecycle proof & ROI modeling',
    badgeText: 'Yield',
    signatureTheme: 'vscode-navy-gold',
    themeName: 'Navy Gold & Radiant Coral',
    themeDotColor: '#F43F5E',
    icon: Flame,
  },
];

export const LAYOUT_SIGNATURE_THEMES: Record<HomeLayoutType, AppThemeType> = {
  v1: 'green-choice',
  v2: 'purple',
  v3: 'riseup',
  v4: 'dracula',
  v5: 'clean-wide',
  v6: 'obsidian',
  v7: 'vscode-navy-gold',
};

const STORAGE_KEY = 'wp_exam_home_layout';

export const getStoredLayout = (): HomeLayoutType => {
  if (typeof window === 'undefined') {
    return 'v1';
  }

  // 1. Check URL search param first (?layout=v2 or ?v=2)
  const params = new URLSearchParams(window.location.search);
  const layoutParam = params.get('layout') || params.get('v');

  if (layoutParam) {
    const normalized = layoutParam.startsWith('v') ? layoutParam : `v${layoutParam}`;
    if (HOME_LAYOUT_OPTIONS.some((opt) => opt.id === normalized)) {
      return normalized as HomeLayoutType;
    }
  }

  // 2. Check local storage
  const saved = localStorage.getItem(STORAGE_KEY) as HomeLayoutType | null;
  if (saved) {
    if (HOME_LAYOUT_OPTIONS.some((opt) => opt.id === saved)) {
      return saved;
    }
  }

  return 'v1';
};

export const setStoredLayout = (layout: HomeLayoutType): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, layout);

    // Update URL param without refreshing page
    const url = new URL(window.location.href);
    url.searchParams.set('layout', layout);
    window.history.replaceState({}, '', url.toString());
  }
};

interface HomeLayoutSwitcherProps {
  currentLayout: HomeLayoutType;
  onSelectLayout: (layout: HomeLayoutType) => void;
  variant?: 'header' | 'floating';
}

export const HomeLayoutSwitcher: React.FC<HomeLayoutSwitcherProps> = ({
  currentLayout,
  onSelectLayout,
  variant = 'header',
}) => {
  const currentOption = HOME_LAYOUT_OPTIONS.find((opt) => opt.id === currentLayout) || HOME_LAYOUT_OPTIONS[0];
  const CurrentIcon = currentOption.icon;
  const [isDismissed, setIsDismissed] = useState(false);

  if (variant === 'floating') {
    if (isDismissed) {
      return (
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          aria-label="Open Layout Switcher"
          className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-card/95 border border-primary/50 text-primary shadow-xl backdrop-blur-md hover:scale-105 transition-all cursor-pointer ring-1 ring-primary/20"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>
      );
    }

    return (
      <aside
        aria-label="Home page switcher dock"
        className="no-scrollbar fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-card/95 border border-border shadow-2xl backdrop-blur-md ring-1 ring-border/50 text-foreground animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div className="flex shrink-0 items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground border-r border-border/60">
          <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Theme Presets:</span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {HOME_LAYOUT_OPTIONS.map((opt) => {
            const isSelected = opt.id === currentLayout;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectLayout(opt.id)}
                className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
                title={`${opt.title} (${opt.themeName}) — ${opt.tagline}`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block border border-black/20"
                  style={{ backgroundColor: opt.themeDotColor }}
                />
                <Icon className="w-3 h-3" />
                <span>{opt.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Hide floating layout switcher dock"
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer ml-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </aside>
    );
  }

  // Header Dropdown Variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-xl border-border bg-card/70 hover:bg-muted hover:border-primary/50 cursor-pointer shadow-2xs transition-all"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
            style={{ backgroundColor: currentOption.themeDotColor }}
          />
          <CurrentIcon className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline font-bold">{currentOption.badgeText}</span>
          <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {currentOption.id.toUpperCase()}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-popover border border-border shadow-2xl p-1.5 text-xs">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1 flex items-center justify-between">
          <span>Home Layouts &amp; Signature Themes</span>
          <Badge variant="outline" className="text-[9px] font-mono py-0 border-primary/30 text-primary">
            7 Distinct Styles
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-border/60" />

        {HOME_LAYOUT_OPTIONS.map((opt) => {
          const isSelected = opt.id === currentLayout;
          const Icon = opt.icon;

          return (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => onSelectLayout(opt.id)}
              className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary/10 border border-primary/30 text-foreground font-semibold'
                  : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">{opt.title}</span>
                    <span
                      className="w-2 h-2 rounded-full inline-block border border-black/20"
                      style={{ backgroundColor: opt.themeDotColor }}
                    />
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>

                <div className="flex items-center gap-1 mt-0.5">
                  <Palette className="w-2.5 h-2.5 text-primary shrink-0" />
                  <span className="text-[10px] font-medium text-primary">
                    Theme: {opt.themeName}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {opt.tagline}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

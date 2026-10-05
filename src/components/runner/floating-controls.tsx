import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, Clock, GripVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { THEME_PRESETS, getTheme } from '@/lib/themes';
import { QuestionLayoutMode } from '@/lib/types/form';
import { toast } from 'sonner';

export interface PresenterHUDProps {
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeThemeShortName: string;
  runnerViewMode: 'default' | 'standard' | 'presentation_split';
  setRunnerViewMode: (mode: 'default' | 'standard' | 'presentation_split') => void;
  effectiveLayoutMode: string;
  isSidebarVisible: boolean;
  setIsSidebarVisible: (visible: boolean) => void;
  timeLeftSeconds: number | null;

  showSlideNumbers?: boolean;
  onToggleSlideNumbers?: (show: boolean) => void;
  currentFieldId?: string;
  currentFieldLayout?: QuestionLayoutMode;
  onUpdateLayout?: (mode: QuestionLayoutMode, applyToAll: boolean) => void;
}

const formatTimerDisplay = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const PresenterHUD: React.FC<PresenterHUDProps> = ({
  activeThemeId,
  setActiveThemeId,
  activeThemeShortName,
  runnerViewMode,
  setRunnerViewMode,
  effectiveLayoutMode,
  isSidebarVisible,
  setIsSidebarVisible,
  timeLeftSeconds,
  showSlideNumbers,
  onToggleSlideNumbers,
  currentFieldId,
  currentFieldLayout,
  onUpdateLayout,
}) => {
  return (
    <TooltipProvider>
      <motion.div
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.03, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
        className="fixed z-50 bottom-6 right-6 flex items-center gap-1.5 p-1 bg-card/85 backdrop-blur-xl border border-border/40 shadow-lg hover:shadow-xl rounded-xl select-none touch-none cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 border-r border-border/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest cursor-grab active:cursor-grabbing select-none touch-none hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
              title="Drag to reposition HUD anywhere on screen"
              aria-label="Drag to reposition HUD"
              role="button"
              tabIndex={0}
            >
              <GripVertical className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <span>HUD</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">Drag to reposition HUD</TooltipContent>
        </Tooltip>

        {timeLeftSeconds !== null && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-semibold cursor-default ${
            timeLeftSeconds < 60
              ? 'bg-destructive/10 text-destructive animate-pulse'
              : 'bg-muted/60 text-muted-foreground'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimerDisplay(timeLeftSeconds)}</span>
          </div>
        )}

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  aria-label="View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-[13rem] border border-border/40 bg-popover text-popover-foreground z-[10000]">
            <DropdownMenuItem
              onSelect={() => {
                onUpdateLayout?.('centered', false);
                setRunnerViewMode('presentation_split');
                toast.info('Switched to Centered Slide');
              }}
              className={effectiveLayoutMode === 'centered' ? 'bg-accent text-foreground' : undefined}
            >
              Centered slide
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                onUpdateLayout?.('presentation_split', false);
                setRunnerViewMode('presentation_split');
                toast.info('Switched to Split Right');
              }}
              className={effectiveLayoutMode === 'presentation_split' ? 'bg-accent text-foreground' : undefined}
            >
              Split right
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                onUpdateLayout?.('split_left', false);
                setRunnerViewMode('presentation_split');
                toast.info('Switched to Split Left');
              }}
              className={effectiveLayoutMode === 'split_left' ? 'bg-accent text-foreground' : undefined}
            >
              Split left
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                onUpdateLayout?.('standard', false);
                setRunnerViewMode('standard');
                toast.info('Switched to Standard Quiz View');
              }}
              className={effectiveLayoutMode === 'standard' ? 'bg-accent text-foreground' : undefined}
            >
              Standard quiz
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-border/40" />

            <DropdownMenuItem
              onSelect={() => {
                onUpdateLayout?.(currentFieldLayout || 'centered', true);
                toast.success('Saved layout to all slides');
              }}
              className="cursor-pointer text-xs font-semibold text-primary"
            >
              Save Layout to All Slides
            </DropdownMenuItem>

            {onToggleSlideNumbers && (
              <DropdownMenuItem
                onSelect={() => onToggleSlideNumbers(!showSlideNumbers)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>Slide Numbers</span>
                {showSlideNumbers && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="my-1 border-border/40" />

            <DropdownMenuItem
              onSelect={() => setIsSidebarVisible(!isSidebarVisible)}
              className={isSidebarVisible ? 'bg-accent text-foreground' : undefined}
            >
              Questions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  aria-label={activeThemeShortName}
                >
                  <Palette className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{activeThemeShortName}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-[12rem] border border-border/40 bg-popover text-popover-foreground z-[10000]">
            {Object.values(THEME_PRESETS).map((themePreset) => (
              <DropdownMenuItem
                key={themePreset.id}
                onSelect={() => {
                  setActiveThemeId(themePreset.id);
                  const nextTheme = getTheme(themePreset.id);
                  document.documentElement.setAttribute('data-theme', nextTheme.id);
                }}
                className={activeThemeId === themePreset.id ? 'bg-accent text-foreground' : undefined}
              >
                {themePreset.name.split(' (')[0]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </TooltipProvider>
  );
};

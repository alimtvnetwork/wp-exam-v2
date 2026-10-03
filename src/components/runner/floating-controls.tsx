import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { THEME_PRESETS, getTheme } from '@/lib/themes';
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
}) => {
  return (
    <TooltipProvider>
      <motion.div
        drag
        dragMomentum={false}
        className="fixed z-50 bottom-8 right-8 flex items-center gap-2 p-2 bg-card/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl cursor-move"
      >
        <div className="px-2 border-r border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center h-full cursor-move">
          HUD
        </div>

        {timeLeftSeconds !== null && (
          <Badge variant="outline" className={`font-mono text-xs gap-1 font-semibold cursor-default ${
            timeLeftSeconds < 60 ? 'border-destructive text-destructive bg-destructive/10 animate-pulse' : 'border-border text-foreground'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimerDisplay(timeLeftSeconds)}</span>
          </Badge>
        )}

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 cursor-pointer"
                  aria-label="View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-[12rem] border border-border bg-popover text-popover-foreground">
            <DropdownMenuItem
              onSelect={() => {
                setRunnerViewMode('standard');
                toast.info('Switched to Standard Quiz View');
              }}
              className={effectiveLayoutMode === 'standard' ? 'bg-accent text-foreground' : undefined}
            >
              Quiz format
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setRunnerViewMode('presentation_split');
                setIsSidebarVisible(false);
                toast.info('Switched to Presentation Slide format');
              }}
              className={effectiveLayoutMode === 'presentation_split' ? 'bg-accent text-foreground' : undefined}
            >
              Presentation slide
            </DropdownMenuItem>
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
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 cursor-pointer"
                  aria-label={activeThemeShortName}
                >
                  <Palette className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{activeThemeShortName}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-[12rem] border border-border bg-popover text-popover-foreground">
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

/**
 * ThemeBuilder — live HTML theme builder modeled on the awansoft-v10 builder.
 *
 * - Draft: every inspector edit updates the in-memory draft and repaints the
 *   preview canvas instantly through scoped CSS variables (no reload, no
 *   effect on the app). The draft is debounced into localStorage.
 * - Apply: promotes the draft to the active theme — variables are written to
 *   `:root` with a `data-theme="custom"` marker and persisted, so the theme
 *   survives reloads (re-applied on mount by `activation.ts`).
 * - Reset: restores the built-in defaults and clears the active custom theme.
 * - Export: downloads the draft as JSON.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, Download, Eye, Palette, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { SaveStatus, ThemeBuilderArea, ThemeDraft } from './types';
import { createDefaultDraft, cloneTokens } from './default-theme';
import { loadDraft, saveDraft, saveActiveTheme, clearActiveTheme } from './storage';
import { activateTheme, deactivateTheme, hasActiveCustomTheme } from './theme-engine';
import { applyPersistedActiveTheme } from './activation';
import { playThemeTransition } from '@/lib/theme-context';
import { ThemePreview } from './theme-preview';
import { ColorEditor } from './editors/color-editor';
import { RadiusEditor } from './editors/radius-editor';
import { FontEditor } from './editors/font-editor';
import { SpacingEditor } from './editors/spacing-editor';

const UBUNTU = 'Ubuntu, sans-serif';

const AREA_TABS: { id: ThemeBuilderArea; label: string }[] = [
  { id: 'colors', label: 'Colors' },
  { id: 'radius', label: 'Radius' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'spacing', label: 'Spacing' },
];

function statusLabel(status: SaveStatus): string {
  switch (status) {
    case 'clean':
      return 'No changes';

    case 'dirty':
      return 'Unsaved changes';

    case 'saving':
      return 'Saving…';

    case 'saved':
      return 'Draft saved';

    case 'error':
      return 'Save failed';
  }
}

export const ThemeBuilder: React.FC = () => {
  const [draft, setDraft] = useState<ThemeDraft>(() => loadDraft());
  const [status, setStatus] = useState<SaveStatus>('clean');
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [activeArea, setActiveArea] = useState<ThemeBuilderArea>('colors');
  const [canvasPulseKey, setCanvasPulseKey] = useState<number>(0);
  const lastSavedRef = useRef<string>(JSON.stringify(draft.tokens));
  const saveTimerRef = useRef<number | null>(null);

  // Re-apply the last promoted theme (if any) once per mount.
  useEffect(() => {
    applyPersistedActiveTheme();
    setIsApplied(hasActiveCustomTheme());
  }, []);

  // Debounced draft persistence — the awansoft "saving → saved" cycle.
  useEffect(() => {
    const serialized = JSON.stringify(draft.tokens);
    const isUnchanged = serialized === lastSavedRef.current;

    if (isUnchanged) {

      return;
    }

    setStatus('dirty');
    setIsApplied(false);

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    setStatus('saving');

    saveTimerRef.current = window.setTimeout(() => {
      const didSave = saveDraft(draft);

      if (didSave) {
        lastSavedRef.current = serialized;
        setStatus('saved');
      } else {
        setStatus('error');
      }

      saveTimerRef.current = null;
    }, 500);

    return () => {

      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [draft]);

  const updateTokens = useCallback((mutate: (draft: ThemeDraft) => void) => {
    setDraft((prev) => {
      const next: ThemeDraft = { ...prev, tokens: cloneTokens(prev.tokens) };

      mutate(next);

      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    playThemeTransition(() => {
      activateTheme(draft.tokens);
    });
    saveActiveTheme(draft.tokens);
    setIsApplied(true);
    setCanvasPulseKey((key) => key + 1);
  }, [draft.tokens]);

  const handleReset = useCallback(() => {
    const fresh = createDefaultDraft();

    setDraft(fresh);
    lastSavedRef.current = JSON.stringify(fresh.tokens);
    saveDraft(fresh);
    clearActiveTheme();

    playThemeTransition(() => {
      deactivateTheme();
    });

    setIsApplied(false);
    setStatus('saved');
  }, []);

  const handleExport = useCallback(() => {
    const payload = JSON.stringify(draft, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `theme-${draft.name || 'custom'}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [draft]);

  const hasUnsavedChanges = status === 'dirty' || status === 'saving';

  return (
    <div className="flex h-[calc(100vh-48px)] min-h-[560px] flex-col bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Palette className="h-4 w-4" />
          </span>

          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight" style={{ fontFamily: UBUNTU }}>
              Theme Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Draft, preview, and apply app themes
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Badge variant={hasUnsavedChanges ? 'secondary' : 'outline'} className="font-mono text-xs">
            {statusLabel(status)}
          </Badge>

          {isApplied && (
            <Badge variant="default" className="gap-1 text-xs">
              <Check className="h-3 w-3" />
              Active
            </Badge>
          )}

          <Separator orientation="vertical" className="h-6" />

          <Button type="button" variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle style={{ fontFamily: UBUNTU }}>
                  Reset theme to defaults?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This discards the draft, removes the active custom theme, and
                  restores the shipped default tokens. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset theme</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="button" size="sm" onClick={handleApply}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Apply theme
          </Button>
        </div>
      </div>

      {/* Workspace: preview canvas + side inspector */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[320px] flex-1 overflow-y-auto border-b border-border lg:border-b-0">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-background/80 px-4 py-2 backdrop-blur-xs">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              Live preview — draft scope
            </span>
          </div>

          <div
            key={canvasPulseKey}
            className={canvasPulseKey === 0 ? undefined : 'theme-transition-canvas-pulse'}
          >
            <ThemePreview tokens={draft.tokens} />
          </div>
        </div>

        <aside className="flex w-full flex-col border-border bg-card lg:w-[400px] lg:border-l">
          <div className="flex items-center gap-2 px-4 pb-1 pt-4">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold" style={{ fontFamily: UBUNTU }}>
              Token inspector
            </h2>
          </div>

          <Tabs
            value={activeArea}
            onValueChange={(value) => setActiveArea(value as ThemeBuilderArea)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="px-4 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                {AREA_TABS.map((tab) => {

                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-4">
                <TabsContent value="colors" className="mt-0">
                  <ColorEditor
                    colors={draft.tokens.colors}
                    onChange={(colors) => updateTokens((next) => {
                      next.tokens.colors = colors;
                    })}
                  />
                </TabsContent>

                <TabsContent value="radius" className="mt-0">
                  <RadiusEditor
                    radius={draft.tokens.radius}
                    onChange={(radius) => updateTokens((next) => {
                      next.tokens.radius = radius;
                    })}
                  />
                </TabsContent>

                <TabsContent value="fonts" className="mt-0">
                  <FontEditor
                    fonts={draft.tokens.fonts}
                    onChange={(fonts) => updateTokens((next) => {
                      next.tokens.fonts = fonts;
                    })}
                  />
                </TabsContent>

                <TabsContent value="spacing" className="mt-0">
                  <SpacingEditor
                    spacing={draft.tokens.spacing}
                    onChange={(spacing) => updateTokens((next) => {
                      next.tokens.spacing = spacing;
                    })}
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
};

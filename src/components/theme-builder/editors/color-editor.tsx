/**
 * Colors editor — the analogue of the awansoft per-area text/icon editors,
 * adapted to theme color tokens. Each token gets a native color picker plus a
 * hex field; both write into the draft and the preview repaints instantly via
 * CSS variables.
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLOR_TOKENS } from '../types';
import type { ThemeColors } from '../types';
import { normalizeHex } from '../color-utils';

interface ColorEditorProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

export const ColorEditor: React.FC<ColorEditorProps> = ({ colors, onChange }) => {
  const handleTokenChange = (id: keyof ThemeColors, raw: string) => {
    const normalized = normalizeHex(raw);

    if (!normalized) {

      return;
    }

    onChange({ ...colors, [id]: normalized });
  };

  return (
    <div className="space-y-1">
      {COLOR_TOKENS.map((meta) => {
        const value = colors[meta.id];

        return (
          <div
            key={meta.id}
            className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 hover:border-primary/50 transition-colors"
          >
            <input
              type="color"
              value={value}
              aria-label={`${meta.label} color picker`}
              onChange={(event) => handleTokenChange(meta.id, event.target.value)}
              className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />

            <div className="min-w-0 flex-1">
              <Label className="text-xs font-semibold leading-tight">{meta.label}</Label>
              <p className="truncate text-xs text-muted-foreground">{meta.hint}</p>
            </div>

            <Input
              value={value}
              spellCheck={false}
              aria-label={`${meta.label} hex value`}
              onChange={(event) => handleTokenChange(meta.id, event.target.value)}
              className="h-8 w-20 shrink-0 font-mono text-xs uppercase"
            />
          </div>
        );
      })}
    </div>
  );
};

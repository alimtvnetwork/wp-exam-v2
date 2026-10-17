/**
 * Colors editor — the analogue of the awansoft per-area text/icon editors,
 * adapted to theme color tokens. Each token gets a native color picker, a
 * preset swatch strip (animated selection ring + checkmark), and a hex field
 * that commits on blur/Enter with a 150ms tint pulse; all write into the
 * draft and the preview repaints instantly via CSS variables.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLOR_TOKENS } from '../types';
import type { ThemeColors } from '../types';
import { normalizeHex } from '../color-utils';

const QUICK_SWATCHES = [
  '#5c45fd',
  '#16a34a',
  '#2563eb',
  '#e8c547',
  '#bd93f9',
  '#f7f1e6',
  '#191a21',
  '#ffffff',
];

const PULSE_MS = 160;

interface ColorEditorProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

interface HexFieldProps {
  value: string;
  label: string;
  onCommit: (hex: string) => void;
}

const HexField: React.FC<HexFieldProps> = ({ value, label, onCommit }) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const commit = () => {
    const normalized = normalizeHex(text);

    if (!normalized) {
      setText(value);

      return;
    }

    if (normalized !== value) {
      onCommit(normalized);
    } else {
      setText(value);
    }
  };

  return (
    <Input
      value={text}
      spellCheck={false}
      aria-label={`${label} hex value`}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {

        if (event.key === 'Enter') {
          commit();
        }
      }}
      className="h-8 w-20 shrink-0 font-mono text-xs uppercase"
    />
  );
};

export const ColorEditor: React.FC<ColorEditorProps> = ({ colors, onChange }) => {
  const [pulsedToken, setPulsedToken] = useState<keyof ThemeColors | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  useEffect(() => {

    return () => {

      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, []);

  const triggerPulse = (id: keyof ThemeColors) => {
    setPulsedToken(id);

    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }

    pulseTimerRef.current = window.setTimeout(() => {
      setPulsedToken(null);
      pulseTimerRef.current = null;
    }, PULSE_MS);
  };

  const handleTokenChange = (id: keyof ThemeColors, raw: string, shouldPulse: boolean) => {
    const normalized = normalizeHex(raw);

    if (!normalized) {

      return;
    }

    onChange({ ...colors, [id]: normalized });

    if (shouldPulse) {
      triggerPulse(id);
    }
  };

  return (
    <div className="space-y-1">
      {COLOR_TOKENS.map((meta) => {
        const value = colors[meta.id];
        const isPulsed = pulsedToken === meta.id;

        return (
          <div
            key={meta.id}
            className={`flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 hover:border-primary/50 transition-colors ${isPulsed ? 'theme-transition-tint-pulse' : ''}`}
          >
            <input
              type="color"
              value={value}
              aria-label={`${meta.label} color picker`}
              onChange={(event) => handleTokenChange(meta.id, event.target.value, false)}
              className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />

            <div className="min-w-0 flex-1">
              <Label className="text-xs font-semibold leading-tight">{meta.label}</Label>
              <p className="truncate text-xs text-muted-foreground">{meta.hint}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`${meta.label} preset swatches`}>
              {QUICK_SWATCHES.map((swatch) => {
                const isSwatchSelected = swatch.toLowerCase() === value.toLowerCase();

                return (
                  <button
                    key={swatch}
                    type="button"
                    aria-label={`Apply ${swatch} to ${meta.label}`}
                    aria-pressed={isSwatchSelected}
                    onClick={() => handleTokenChange(meta.id, swatch, false)}
                    style={{ backgroundColor: swatch }}
                    className={`theme-transition-swatch flex h-5 w-5 items-center justify-center rounded-full border border-border/80 ${isSwatchSelected ? 'is-selected' : ''}`}
                  >
                    {isSwatchSelected && (
                      <Check
                        className="theme-transition-swatch-check h-3 w-3 text-white"
                        strokeWidth={3}
                        style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.8))' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <HexField
              value={value}
              label={meta.label}
              onCommit={(hex) => handleTokenChange(meta.id, hex, true)}
            />
          </div>
        );
      })}
    </div>
  );
};

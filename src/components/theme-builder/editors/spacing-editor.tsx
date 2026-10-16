/**
 * Spacing editor — card padding, component gap, and section gap sliders.
 * Drives `--tb-card-padding`, `--tb-gap`, and `--tb-section-gap`, consumed by
 * the preview canvas through CSS variables.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ThemeSpacing } from '../types';

interface SpacingEditorProps {
  spacing: ThemeSpacing;
  onChange: (spacing: ThemeSpacing) => void;
}

const FIELDS: {
  id: keyof ThemeSpacing;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { id: 'cardPadding', label: 'Card padding', hint: 'Inner padding of cards', min: 8, max: 48, step: 2 },
  { id: 'gap', label: 'Component gap', hint: 'Space between sibling components', min: 4, max: 32, step: 2 },
  { id: 'sectionGap', label: 'Section gap', hint: 'Space between preview sections', min: 8, max: 64, step: 4 },
];

export const SpacingEditor: React.FC<SpacingEditorProps> = ({ spacing, onChange }) => {

  return (
    <div className="space-y-6">
      {FIELDS.map((field) => {
        const value = spacing[field.id];

        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">{field.label}</Label>
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{value}px</span>
            </div>

            <Slider
              min={field.min}
              max={field.max}
              step={field.step}
              value={[value]}
              aria-label={field.label}
              onValueChange={(values) => onChange({ ...spacing, [field.id]: values[0] ?? value })}
            />

            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>{field.min}px</span>
              <span>{field.max}px</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

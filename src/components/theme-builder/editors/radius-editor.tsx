/**
 * Radius editor — slider plus quick presets. Drives `--radius`, from which the
 * shadcn sm/md/lg radii derive (`calc(var(--radius) - 2px)` etc.).
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface RadiusEditorProps {
  radius: number;
  onChange: (radius: number) => void;
}

const PRESETS: { label: string; value: number }[] = [
  { label: 'Sharp', value: 0 },
  { label: 'Subtle', value: 0.25 },
  { label: 'Default', value: 0.5 },
  { label: 'Soft', value: 0.75 },
  { label: 'Round', value: 1 },
  { label: 'Pill', value: 1.5 },
];

export const RadiusEditor: React.FC<RadiusEditorProps> = ({ radius, onChange }) => {

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Base radius</Label>
          <span className="font-mono text-xs text-muted-foreground">{radius.toFixed(2)}rem</span>
        </div>

        <Slider
          min={0}
          max={1.5}
          step={0.05}
          value={[radius]}
          aria-label="Base radius"
          onValueChange={(values) => onChange(values[0] ?? radius)}
        />

        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>0rem</span>
          <span>1.5rem</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Presets</Label>

        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = Math.abs(preset.value - radius) < 0.001;

            return (
              <Button
                key={preset.label}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(preset.value)}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          Cards, buttons, and inputs preview at
          <span className="font-mono text-foreground"> {radius.toFixed(2)}rem</span> base
          radius. Smaller components derive automatically (md = base − 2px,
          sm = base − 4px).
        </p>
      </div>
    </div>
  );
};

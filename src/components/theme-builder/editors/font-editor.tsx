/**
 * Font editor — heading and body family selects. Drives `--font-heading` and
 * `--font-body`, consumed by the preview canvas through CSS variables.
 * Ubuntu stays the default heading family per the repo theming standard.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FONT_CHOICES } from '../types';
import type { ThemeFonts } from '../types';

interface FontEditorProps {
  fonts: ThemeFonts;
  onChange: (fonts: ThemeFonts) => void;
}

export const FontEditor: React.FC<FontEditorProps> = ({ fonts, onChange }) => {
  const renderSelect = (
    id: 'heading' | 'body',
    label: string,
    hint: string,
    current: string,
  ) => {

    return (
      <div className="space-y-2">
        <div>
          <Label className="text-xs font-semibold">{label}</Label>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <Select value={current} onValueChange={(value) => onChange({ ...fonts, [id]: value })}>
          <SelectTrigger aria-label={label}>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {FONT_CHOICES.map((choice) => {

              return (
                <SelectItem key={choice.value} value={choice.value}>
                  <span style={{ fontFamily: choice.value }}>{choice.label}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <p
          key={current}
          className="theme-transition-font-preview-in rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
          style={{ fontFamily: current }}
        >
          The quick brown fox jumps over the lazy dog 0123456789
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSelect('heading', 'Heading font', 'h1–h6 inside themed surfaces', fonts.heading)}
      {renderSelect('body', 'Body font', 'Paragraphs and UI copy', fonts.body)}
    </div>
  );
};

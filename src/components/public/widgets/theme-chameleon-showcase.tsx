import React, { useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ThemePreviewItem {
  id: string;
  name: string;
  bgHex: string;
  cardHex: string;
  primaryHex: string;
  textHex: string;
  tagline: string;
}

const PREVIEW_THEMES: ThemePreviewItem[] = [
  {
    id: 'riseup',
    name: 'Riseup Asia',
    bgHex: '#0A0A14',
    cardHex: '#141424',
    primaryHex: '#F7F1E6',
    textHex: '#F7F1E6',
    tagline: 'Dark Navy & Cream Luxury',
  },
  {
    id: 'dracula',
    name: 'Dracula Neon',
    bgHex: '#191A21',
    cardHex: '#282A36',
    primaryHex: '#BD93F9',
    textHex: '#F8F8F2',
    tagline: 'Cyber Neon & Purple Glow',
  },
  {
    id: 'purple',
    name: 'Electric Purple',
    bgHex: '#0F0E1E',
    cardHex: '#18162F',
    primaryHex: '#5C45FD',
    textHex: '#FFFFFF',
    tagline: 'Electric Violet & Deep Indigo',
  },
  {
    id: 'green-choice',
    name: 'Green Choice',
    bgHex: '#F4F8F5',
    cardHex: '#FFFFFF',
    primaryHex: '#16A34A',
    textHex: '#13201B',
    tagline: 'Emerald Botanical & Sage',
  },
  {
    id: 'clean-wide',
    name: 'Clean Wide',
    bgHex: '#FFFFFF',
    cardHex: '#F8FAFC',
    primaryHex: '#4F46E5',
    textHex: '#0F172A',
    tagline: 'Minimalist Enterprise Indigo',
  },
  {
    id: 'vscode-dark',
    name: 'VS Code Dark',
    bgHex: '#0D1117',
    cardHex: '#161B22',
    primaryHex: '#38BDF8',
    textHex: '#E6EDF3',
    tagline: 'Obsidian Slate & Sky Cyan',
  },
];

export const ThemeChameleonShowcase: React.FC = () => {
  const [activeThemeId, setActiveThemeId] = useState<string>('riseup');
  const activeTheme = PREVIEW_THEMES.find((t) => t.id === activeThemeId) || PREVIEW_THEMES[0];

  return (
    <div className="w-full rounded-3xl glass-panel-elevated overflow-hidden shadow-2xl relative">
      <div className="h-0.5 w-full bg-primary/70" />

      <div className="p-8 sm:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              <Palette className="w-3.5 h-3.5" />
              <span>Fluid Theme Chameleon Studio</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
              One Engine. Endless Visual Identities.
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Every candidate runner, quiz card, and admin dashboard automatically adapts to your exact corporate palette.
            </p>
          </div>

          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono self-start sm:self-auto px-3 py-1 rounded-full">
            Zero CSS Clashes
          </Badge>
        </div>

        {/* Swatch Selector Row */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {PREVIEW_THEMES.map((theme) => {
            const isSelected = activeThemeId === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveThemeId(theme.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/15 text-foreground ring-1 ring-primary/40 shadow-sm'
                    : 'border-border/80 bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 inline-flex items-center justify-center shadow-xs shrink-0"
                  style={{ backgroundColor: theme.primaryHex }}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-black" />}
                </span>
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>

        {/* Live Card Morphing Canvas */}
        <div
          className="rounded-3xl p-8 sm:p-12 transition-colors duration-400 border shadow-inner space-y-6"
          style={{
            backgroundColor: activeTheme.bgHex,
            borderColor: activeTheme.primaryHex + '33',
            color: activeTheme.textHex,
          }}
        >
          <div className="flex items-center justify-between text-xs border-b pb-4" style={{ borderColor: activeTheme.primaryHex + '22' }}>
            <span className="font-mono opacity-70 tracking-wider">THEME ENGINE PREVIEW // {activeTheme.tagline.toUpperCase()}</span>
            <span
              className="px-3 py-1 rounded-xl text-xs font-bold"
              style={{
                backgroundColor: activeTheme.primaryHex + '25',
                color: activeTheme.primaryHex,
              }}
            >
              Active Palette
            </span>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 border shadow-xl space-y-5"
            style={{
              backgroundColor: activeTheme.cardHex,
              borderColor: activeTheme.primaryHex + '40',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono opacity-60">QUESTION 02 OF 08</span>
              <span className="text-xs font-bold" style={{ color: activeTheme.primaryHex }}>
                High Priority Section
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold font-heading leading-snug">
              Select the optimal caching strategy for high-concurrency candidate submissions.
            </h4>

            <div className="space-y-2.5">
              {[
                { label: 'A', text: 'Split SQLite with local-first WAL mode', selected: true },
                { label: 'B', text: 'Centralized monolithic synchronous disk writes', selected: false },
                { label: 'C', text: 'Client-side ephemeral cookies without database sync', selected: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all"
                  style={{
                    backgroundColor: item.selected ? activeTheme.primaryHex + '18' : 'transparent',
                    borderColor: item.selected ? activeTheme.primaryHex : activeTheme.primaryHex + '22',
                    color: activeTheme.textHex,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center border"
                      style={{
                        borderColor: item.selected ? activeTheme.primaryHex : activeTheme.primaryHex + '44',
                        backgroundColor: item.selected ? activeTheme.primaryHex : 'transparent',
                        color: item.selected ? activeTheme.bgHex : activeTheme.textHex,
                      }}
                    >
                      {item.label}
                    </span>
                    <span>{item.text}</span>
                  </div>

                  {item.selected && (
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: activeTheme.primaryHex }}
                    >
                      Selected
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: activeTheme.primaryHex,
                  color: activeTheme.bgHex,
                }}
              >
                Confirm &amp; Proceed &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Built-in default theme.
 *
 * Values mirror the light `:root` block in `src/index.css` (converted from
 * their HSL triplets to hex), so "Reset" returns the app to its shipped look.
 */

import type { ThemeDraft, ThemeTokens } from './types';
import { hslTripletToHex } from './color-utils';

export const DEFAULT_TOKENS: ThemeTokens = {
  colors: {
    primary: hslTripletToHex('222.2 47.4% 11.2%'),
    primaryForeground: hslTripletToHex('210 40% 98%'),
    secondary: hslTripletToHex('210 40% 96.1%'),
    secondaryForeground: hslTripletToHex('222.2 47.4% 11.2%'),
    accent: hslTripletToHex('210 40% 96.1%'),
    accentForeground: hslTripletToHex('222.2 47.4% 11.2%'),
    background: hslTripletToHex('0 0% 100%'),
    foreground: hslTripletToHex('222.2 84% 4.9%'),
    card: hslTripletToHex('0 0% 100%'),
    cardForeground: hslTripletToHex('222.2 84% 4.9%'),
    popover: hslTripletToHex('0 0% 100%'),
    popoverForeground: hslTripletToHex('222.2 84% 4.9%'),
    muted: hslTripletToHex('210 40% 96.1%'),
    mutedForeground: hslTripletToHex('215.4 16.3% 46.9%'),
    border: hslTripletToHex('214.3 31.8% 91.4%'),
    input: hslTripletToHex('214.3 31.8% 91.4%'),
    ring: hslTripletToHex('222.2 84% 4.9%'),
    destructive: hslTripletToHex('0 84.2% 60.2%'),
    destructiveForeground: hslTripletToHex('210 40% 98%'),
  },
  radius: 0.5,
  fonts: {
    heading: 'Ubuntu, sans-serif',
    body: 'Inter, sans-serif',
  },
  spacing: {
    cardPadding: 24,
    gap: 16,
    sectionGap: 32,
  },
};

export function createDefaultDraft(): ThemeDraft {

  return {
    version: 1,
    name: 'custom-theme',
    updatedAt: new Date().toISOString(),
    tokens: structuredClone(DEFAULT_TOKENS),
  };
}

export function cloneTokens(tokens: ThemeTokens): ThemeTokens {

  return structuredClone(tokens);
}

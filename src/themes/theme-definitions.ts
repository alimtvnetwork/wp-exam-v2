/**
 * Multi-Theme Catalog and CSS Variable Engine.
 * Supports Letterly (Indigo/Navy), Rise Up Asia (Bright Gold Amber), Dark (Slate), and White (Light),
 * plus dynamic JSON theme injector.
 */

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  appearance: 'dark' | 'light';
  colors: {
    background: string;
    cardBg: string;
    cardBorder: string;
    cardHover: string;
    cardActiveBorder: string;
    cardActiveBg: string;
    primary: string;
    primaryText: string;
    highlightWord: string;
    textPrimary: string;
    textSecondary: string;
    progressBar: string;
    badgeBg: string;
  };
}

export const THEME_PRESETS: Record<string, ThemeDefinition> = {
  letterly: {
    id: 'letterly',
    name: 'Letterly (Deep Navy & Violet)',
    description: 'Modern focus UI inspired by Letterly — vivid indigo on deep violet-navy with warm amber accents.',
    appearance: 'dark',
    colors: {
      background: '#0F0E1E',
      cardBg: '#18162F',
      cardBorder: '#2C2852',
      cardHover: '#232043',
      cardActiveBorder: '#6366F1',
      cardActiveBg: '#28235A',
      primary: '#5C45FD',
      primaryText: '#FFFFFF',
      highlightWord: '#FBBF24',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      progressBar: '#5C45FD',
      badgeBg: '#2D285A',
    },
  },

  'bright-gold': {
    id: 'bright-gold',
    name: 'Rise Up Asia (Bright Gold)',
    description: 'Rise Up Asia signature brand — vivid amber on near-black with cream typography.',
    appearance: 'dark',
    colors: {
      background: '#0A0A14',
      cardBg: '#141422',
      cardBorder: '#292942',
      cardHover: '#1E1E32',
      cardActiveBorder: '#FFAD01',
      cardActiveBg: '#2A230F',
      primary: '#FFAD01',
      primaryText: '#0A0A14',
      highlightWord: '#FFAD01',
      textPrimary: '#FFF1D6',
      textSecondary: '#B8A990',
      progressBar: '#FFAD01',
      badgeBg: '#33270A',
    },
  },

  dark: {
    id: 'dark',
    name: 'Obsidian Slate',
    description: 'High-contrast charcoal slate with sky blue accents for code and technical quizzes.',
    appearance: 'dark',
    colors: {
      background: '#090D16',
      cardBg: '#111827',
      cardBorder: '#1F2937',
      cardHover: '#1E293B',
      cardActiveBorder: '#38BDF8',
      cardActiveBg: '#0F2840',
      primary: '#38BDF8',
      primaryText: '#090D16',
      highlightWord: '#38BDF8',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      progressBar: '#38BDF8',
      badgeBg: '#1E293B',
    },
  },

  white: {
    id: 'white',
    name: 'Clean Paper Light',
    description: 'Ultra-clean white background with crisp borders and deep indigo typography.',
    appearance: 'light',
    colors: {
      background: '#F8FAFC',
      cardBg: '#FFFFFF',
      cardBorder: '#E2E8F0',
      cardHover: '#F1F5F9',
      cardActiveBorder: '#4F46E5',
      cardActiveBg: '#EEF2FF',
      primary: '#4F46E5',
      primaryText: '#FFFFFF',
      highlightWord: '#4F46E5',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      progressBar: '#4F46E5',
      badgeBg: '#E0E7FF',
    },
  },
};

export const DEFAULT_THEME_ID = 'letterly';

export function getTheme(id: string): ThemeDefinition {
  const hasPreset = Boolean(THEME_PRESETS[id]);
  return hasPreset ? THEME_PRESETS[id] : THEME_PRESETS[DEFAULT_THEME_ID];
}

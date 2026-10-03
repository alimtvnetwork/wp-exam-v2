/**
 * Multi-Theme Catalog and CSS Variable Engine.
 * Supports Purple (Indigo/Violet), Riseup (Cream & Gold Amber), Antigravity Dracula,
 * VS Code Dark (Slate & Cyan), and Clean Light / Paper.
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
  purple: {
    id: 'purple',
    name: 'Purple Theme (Deep Purple & Violet)',
    description: 'Modern focus UI with vivid electric indigo on deep violet-navy with warm amber accents.',
    appearance: 'dark',
    colors: {
      background: '#0F0E1E',
      cardBg: '#18162F',
      cardBorder: '#3A3568',
      cardHover: '#262348',
      cardActiveBorder: '#818CF8',
      cardActiveBg: 'rgba(92, 69, 253, 0.20)',
      primary: '#5C45FD',
      primaryText: '#FFFFFF',
      highlightWord: '#FBBF24',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      progressBar: '#5C45FD',
      badgeBg: 'rgba(92, 69, 253, 0.25)',
    },
  },

  'riseup-asia': {
    id: 'riseup-asia',
    name: 'Riseup (Gold & Navy)',
    description: 'Riseup signature brand — cream controls on midnight navy, gold only as the choice mark.',
    appearance: 'dark',
    colors: {
      background: '#0A0A14',
      cardBg: '#141424',
      cardBorder: '#2A2A44',
      cardHover: '#1C1C30',
      cardActiveBorder: '#E8C547',
      cardActiveBg: 'rgba(232, 197, 71, 0.12)',
      primary: '#F7F1E6',
      primaryText: '#0A0A14',
      highlightWord: '#E8C547',
      textPrimary: '#FFF1D6',
      textSecondary: '#94A3B8',
      progressBar: '#3A3A55',
      badgeBg: 'rgba(232, 197, 71, 0.12)',
    },
  },

  dracula: {
    id: 'dracula',
    name: 'Antigravity Dracula (Dark Purple & Neon)',
    description: 'High-contrast vampire palette — deep purple-black canvas, neon green accents, and glowing purple borders.',
    appearance: 'dark',
    colors: {
      background: '#191A21',
      cardBg: '#282A36',
      cardBorder: '#44475A',
      cardHover: '#343746',
      cardActiveBorder: '#BD93F9',
      cardActiveBg: '#383A59',
      primary: '#BD93F9',
      primaryText: '#282A36',
      highlightWord: '#50FA7B',
      textPrimary: '#F8F8F2',
      textSecondary: '#6272A4',
      progressBar: '#BD93F9',
      badgeBg: '#44475A',
    },
  },

  'vscode-dark': {
    id: 'vscode-dark',
    name: 'VS Code Dark (Obsidian & Cyan)',
    description: 'High-contrast charcoal slate with neon cyan accents for code and technical assessment suites.',
    appearance: 'dark',
    colors: {
      background: '#0D1117',
      cardBg: '#161B22',
      cardBorder: '#30363D',
      cardHover: '#21262D',
      cardActiveBorder: '#38BDF8',
      cardActiveBg: '#0D2D44',
      primary: '#38BDF8',
      primaryText: '#0D1117',
      highlightWord: '#38BDF8',
      textPrimary: '#F0F6FC',
      textSecondary: '#8B949E',
      progressBar: '#38BDF8',
      badgeBg: '#21262D',
    },
  },

  'vscode-navy-gold': {
    id: 'vscode-navy-gold',
    name: 'Navy Gold',
    description: 'Dark VS Code background with cream controls and gold highlight',
    appearance: 'dark',
    colors: {
      background: '#0D1117',
      cardBg: '#161B22',
      cardBorder: '#30363D',
      cardHover: '#21262D',
      cardActiveBorder: '#E8C547',
      cardActiveBg: 'rgba(232, 197, 71, 0.12)',
      primary: '#F0F6FC',
      primaryText: '#0D1117',
      highlightWord: '#E8C547',
      textPrimary: '#F0F6FC',
      textSecondary: '#8B949E',
      progressBar: '#30363D',
      badgeBg: 'rgba(240, 246, 252, 0.12)',
    },
  },

  'microsoft-blue': {
    id: 'microsoft-blue',
    name: 'Clean Paper Light (Enterprise Sapphire)',
    description: 'Ultra-clean white background with crisp slate borders and deep sapphire blue typography.',
    appearance: 'light',
    colors: {
      background: '#F8FAFC',
      cardBg: '#FFFFFF',
      cardBorder: '#E2E8F0',
      cardHover: '#F1F5F9',
      cardActiveBorder: '#2563EB',
      cardActiveBg: '#EFF6FF',
      primary: '#2563EB',
      primaryText: '#FFFFFF',
      highlightWord: '#2563EB',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      progressBar: '#2563EB',
      badgeBg: '#DBEAFE',
    },
  },

  'green-choice': {
    id: 'green-choice',
    name: 'Green Choice (Emerald Eco-Luxury)',
    description: 'Modern botanical editorial theme with lush emerald green, soft sage surfaces, obsidian spruce typography, and zero-clash harmony.',
    appearance: 'light',
    colors: {
      background: '#F4F8F5',
      cardBg: '#FFFFFF',
      cardBorder: '#E1EAE5',
      cardHover: '#F0FDF4',
      cardActiveBorder: '#16A34A',
      cardActiveBg: '#DCFCE7',
      primary: '#16A34A',
      primaryText: '#FFFFFF',
      highlightWord: '#16A34A',
      textPrimary: '#13201B',
      textSecondary: '#6A7F75',
      progressBar: '#16A34A',
      badgeBg: '#DCFCE7',
    },
  },

  'sweet-digs': {
    id: 'sweet-digs',
    name: 'Green Choice (Emerald Eco-Luxury)',
    description: 'Modern botanical editorial theme with lush emerald green, soft sage surfaces, obsidian spruce typography, and zero-clash harmony.',
    appearance: 'light',
    colors: {
      background: '#F4F8F5',
      cardBg: '#FFFFFF',
      cardBorder: '#E1EAE5',
      cardHover: '#F0FDF4',
      cardActiveBorder: '#16A34A',
      cardActiveBg: '#DCFCE7',
      primary: '#16A34A',
      primaryText: '#FFFFFF',
      highlightWord: '#16A34A',
      textPrimary: '#13201B',
      textSecondary: '#6A7F75',
      progressBar: '#16A34A',
      badgeBg: '#DCFCE7',
    },
  },
};

// Aliases for seamless backward compatibility across different views
export const THEME_ALIASES: Record<string, string> = {
  letterly: 'purple',
  riseup: 'riseup-asia',
  'bright-gold': 'riseup-asia',
  obsidian: 'vscode-dark',
  dark: 'vscode-dark',
  clean: 'microsoft-blue',
  white: 'microsoft-blue',
  sweet: 'sweet-digs',
  'sweet-digs-finder': 'sweet-digs',
  'sweet-digs': 'sweet-digs',
  emerald: 'sweet-digs',
  'green-choice': 'green-choice',
  green: 'green-choice',
  'navy-gold': 'vscode-navy-gold',
  'vscode-navy-gold': 'vscode-navy-gold',
};

export const DEFAULT_THEME_ID = 'green-choice';

export function getTheme(id: string): ThemeDefinition {
  const normalizedId = THEME_ALIASES[id] || id;
  const hasPreset = Boolean(THEME_PRESETS[normalizedId]);
  return hasPreset ? THEME_PRESETS[normalizedId] : THEME_PRESETS[DEFAULT_THEME_ID];
}

export function getThemeCssVariables(theme: ThemeDefinition): Record<string, string> {
  return {
    '--wp-exam-bg': theme.colors.background,
    '--wp-exam-card': theme.colors.cardBg,
    '--wp-exam-card-border': theme.colors.cardBorder,
    '--wp-exam-card-hover': theme.colors.cardHover,
    '--wp-exam-primary': theme.colors.primary,
    '--wp-exam-primary-text': theme.colors.primaryText,
    '--wp-exam-highlight': theme.colors.highlightWord,
    '--wp-exam-text-primary': theme.colors.textPrimary,
    '--wp-exam-text-secondary': theme.colors.textSecondary,
    '--wp-exam-progress-bar': theme.colors.progressBar,
    '--wp-exam-badge-bg': theme.colors.badgeBg,
  };
}

/**
 * Multi-Theme Catalog and CSS Variable Engine for WP Exam.
 * Supports Clean Wide White (Vivid Indigo & Crisp Slate), Clean Light,
 * Purple (Indigo/Violet), Riseup (Cream & Gold Amber), Antigravity Dracula,
 * and VS Code Dark (Obsidian & Cyan).
 */

export interface ThemeColors {
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
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  appearance: 'dark' | 'light';
  colors: ThemeColors;
  hslValues?: Record<string, string>;
}

export const THEME_PRESETS: Record<string, ThemeDefinition> = {
  'clean-wide': {
    id: 'clean-wide',
    name: 'Clean Wide White (Vivid Indigo & Slate)',
    description: 'Pure crisp white card background with subtle slate borders, deep slate text, and vivid indigo primary accent.',
    appearance: 'light',
    colors: {
      background: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#E2E8F0',
      cardHover: '#F8FAFC',
      cardActiveBorder: '#4F46E5',
      cardActiveBg: '#EEF2FF',
      primary: '#4F46E5',
      primaryText: '#FFFFFF',
      highlightWord: '#4F46E5',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      progressBar: '#4F46E5',
      badgeBg: '#EEF2FF',
    },
    hslValues: {
      '--primary': '243 75% 59%',
      '--primary-foreground': '0 0% 100%',
      '--background': '0 0% 100%',
      '--foreground': '222 47% 11%',
      '--card': '0 0% 100%',
      '--card-foreground': '222 47% 11%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222 47% 11%',
      '--border': '214 32% 91%',
      '--input': '214 32% 91%',
      '--ring': '243 75% 59%',
      '--accent': '243 75% 96%',
      '--accent-foreground': '243 75% 45%',
      '--secondary': '214 32% 95%',
      '--secondary-foreground': '222 47% 11%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215 16% 47%',
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
    hslValues: {
      '--primary': '142 71% 45%',
      '--primary-foreground': '0 0% 100%',
      '--background': '140 20% 97%',
      '--foreground': '160 20% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '160 20% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '160 20% 10%',
      '--border': '150 13% 91%',
      '--input': '150 13% 91%',
      '--ring': '142 71% 45%',
      '--accent': '142 60% 93%',
      '--accent-foreground': '142 71% 30%',
      '--secondary': '142 60% 93%',
      '--secondary-foreground': '142 71% 30%',
      '--muted': '150 14% 96%',
      '--muted-foreground': '160 9% 46%',
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
    hslValues: {
      '--primary': '142 71% 45%',
      '--primary-foreground': '0 0% 100%',
      '--background': '140 20% 97%',
      '--foreground': '160 20% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '160 20% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '160 20% 10%',
      '--border': '150 13% 91%',
      '--input': '150 13% 91%',
      '--ring': '142 71% 45%',
      '--accent': '142 60% 93%',
      '--accent-foreground': '142 71% 30%',
      '--secondary': '142 60% 93%',
      '--secondary-foreground': '142 71% 30%',
      '--muted': '150 14% 96%',
      '--muted-foreground': '160 9% 46%',
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
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      progressBar: '#3A3A55',
      badgeBg: 'rgba(232, 197, 71, 0.12)',
    },
    hslValues: {
      '--primary': '40 43% 92%',
      '--primary-foreground': '240 33% 6%',
      '--background': '240 33% 6%',
      '--foreground': '40 100% 92%',
      '--card': '240 28% 11%',
      '--card-foreground': '40 100% 92%',
      '--popover': '240 28% 11%',
      '--popover-foreground': '40 100% 92%',
      '--border': '240 24% 21%',
      '--input': '240 24% 21%',
      '--ring': '47 78% 59%',
      '--accent': '246 32% 19%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '246 32% 19%',
      '--secondary-foreground': '0 0% 100%',
      '--muted': '240 25% 16%',
      '--muted-foreground': '38 22% 64%',
    },
  },

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
    hslValues: {
      '--primary': '248 98% 63%',
      '--primary-foreground': '0 0% 100%',
      '--background': '246 35% 9%',
      '--foreground': '0 0% 100%',
      '--card': '245 36% 14%',
      '--card-foreground': '0 0% 100%',
      '--popover': '245 36% 14%',
      '--popover-foreground': '0 0% 100%',
      '--border': '246 34% 28%',
      '--input': '246 34% 28%',
      '--ring': '248 98% 63%',
      '--accent': '246 32% 24%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '246 32% 19%',
      '--secondary-foreground': '0 0% 100%',
      '--muted': '246 32% 19%',
      '--muted-foreground': '240 15% 75%',
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
    hslValues: {
      '--primary': '265 89% 78%',
      '--primary-foreground': '231 15% 18%',
      '--background': '231 15% 12%',
      '--foreground': '60 30% 96%',
      '--card': '231 15% 18%',
      '--card-foreground': '60 30% 96%',
      '--popover': '231 15% 18%',
      '--popover-foreground': '60 30% 96%',
      '--border': '232 14% 31%',
      '--input': '232 14% 31%',
      '--ring': '265 89% 78%',
      '--accent': '135 94% 65%',
      '--accent-foreground': '231 15% 11%',
      '--secondary': '232 14% 24%',
      '--secondary-foreground': '60 30% 96%',
      '--muted': '232 14% 24%',
      '--muted-foreground': '225 27% 51%',
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
    hslValues: {
      '--primary': '199 89% 60%',
      '--primary-foreground': '220 26% 7%',
      '--background': '220 26% 7%',
      '--foreground': '210 56% 96%',
      '--card': '215 21% 11%',
      '--card-foreground': '210 56% 96%',
      '--popover': '215 21% 11%',
      '--popover-foreground': '210 56% 96%',
      '--border': '215 12% 21%',
      '--input': '215 12% 21%',
      '--ring': '199 89% 60%',
      '--accent': '199 89% 60%',
      '--accent-foreground': '220 26% 7%',
      '--secondary': '215 15% 15%',
      '--secondary-foreground': '210 56% 96%',
      '--muted': '215 15% 15%',
      '--muted-foreground': '215 9% 58%',
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
    hslValues: {
      '--primary': '210 56% 96%',
      '--primary-foreground': '220 26% 7%',
      '--background': '220 26% 7%',
      '--foreground': '210 56% 96%',
      '--card': '220 20% 11%',
      '--card-foreground': '210 56% 96%',
      '--popover': '220 20% 11%',
      '--popover-foreground': '210 56% 96%',
      '--border': '215 14% 21%',
      '--input': '215 14% 21%',
      '--ring': '47 78% 59%',
      '--accent': '215 14% 24%',
      '--accent-foreground': '210 56% 96%',
      '--secondary': '215 14% 19%',
      '--secondary-foreground': '210 56% 96%',
      '--muted': '215 14% 19%',
      '--muted-foreground': '215 14% 65%',
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
    hslValues: {
      '--primary': '221 83% 53%',
      '--primary-foreground': '0 0% 100%',
      '--background': '210 40% 98%',
      '--foreground': '222 47% 11%',
      '--card': '0 0% 100%',
      '--card-foreground': '222 47% 11%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222 47% 11%',
      '--border': '214 32% 91%',
      '--input': '214 32% 91%',
      '--ring': '221 83% 53%',
      '--accent': '210 40% 96.1%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--secondary': '210 40% 96.1%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215 16% 47%',
    },
  },
};

export const THEME_ALIASES: Record<string, string> = {
  letterly: 'purple',
  riseup: 'riseup-asia',
  'bright-gold': 'riseup-asia',
  obsidian: 'vscode-dark',
  dark: 'vscode-dark',
  clean: 'microsoft-blue',
  white: 'clean-wide',
  wide: 'clean-wide',
  'wide-white': 'clean-wide',
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

export function getTheme(id?: string): ThemeDefinition {
  if (!id) {
    return THEME_PRESETS['green-choice'] || Object.values(THEME_PRESETS)[0];
  }
  const normalizedId = THEME_ALIASES[id] || id;
  const preset = THEME_PRESETS[normalizedId];
  if (preset) {
    return preset;
  }

  return THEME_PRESETS['green-choice'] || Object.values(THEME_PRESETS)[0];
}

export function getThemeCssVariables(theme?: ThemeDefinition): Record<string, string> {
  const safeTheme = theme || getTheme();

  if (!safeTheme || !safeTheme.colors) {
    return {};
  }

  return {
    '--wp-exam-bg': safeTheme.colors.background || '#FFFFFF',
    '--wp-exam-card': safeTheme.colors.cardBg || '#FFFFFF',
    '--wp-exam-card-border': safeTheme.colors.cardBorder || '#E2E8F0',
    '--wp-exam-card-hover': safeTheme.colors.cardHover || '#F8FAFC',
    '--wp-exam-primary': safeTheme.colors.primary || '#16A34A',
    '--wp-exam-primary-text': safeTheme.colors.primaryText || '#FFFFFF',
    '--wp-exam-highlight': safeTheme.colors.highlightWord || '#16A34A',
    '--wp-exam-text-primary': safeTheme.colors.textPrimary || '#0F172A',
    '--wp-exam-text-secondary': safeTheme.colors.textSecondary || '#64748B',
    '--wp-exam-progress-bar': safeTheme.colors.progressBar || '#16A34A',
    '--wp-exam-badge-bg': safeTheme.colors.badgeBg || '#DCFCE7',
    '--wp-exam-question-title': safeTheme.colors.textPrimary || '#FFFFFF',
    ...(safeTheme.hslValues || {}),
  };
}

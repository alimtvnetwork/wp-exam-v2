import React, { createContext, useContext, useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type AppThemeType = 'riseup' | 'dracula' | 'purple' | 'obsidian' | 'vscode-navy-gold' | 'clean' | 'clean-wide' | 'sweet-digs' | 'green-choice';

export interface ThemeConfig {
  id: AppThemeType;
  name: string;
  tagline: string;
  primaryColor: string;
  bgColor: string;
  cardColor: string;
  borderColor: string;
  accentColor: string;
  badgeClass: string;
  hslValues: Record<string, string>;
}

export const THEME_CONFIGS: Record<AppThemeType, ThemeConfig> = {
  'green-choice': {
    id: 'green-choice',
    name: 'Green Choice',
    tagline: 'Emerald Botanical & Warm Sage',
    primaryColor: '#16A34A',
    bgColor: '#F4F8F5',
    cardColor: '#FFFFFF',
    borderColor: '#E1EAE5',
    accentColor: '#16A34A',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
    name: 'Green Choice',
    tagline: 'Emerald Botanical & Warm Sage',
    primaryColor: '#16A34A',
    bgColor: '#F4F8F5',
    cardColor: '#FFFFFF',
    borderColor: '#E1EAE5',
    accentColor: '#16A34A',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
  'clean-wide': {
    id: 'clean-wide',
    name: 'Clean Wide White',
    tagline: 'Vivid Indigo & Deep Slate',
    primaryColor: '#4F46E5',
    bgColor: '#FFFFFF',
    cardColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    accentColor: '#4F46E5',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
  riseup: {
    id: 'riseup',
    name: 'Riseup',
    tagline: 'Warm Gold & Midnight Navy',
    primaryColor: '#F7F1E6',
    bgColor: '#0A0A14',
    cardColor: '#141424',
    borderColor: '#2A2A44',
    accentColor: '#E8C547',
    badgeClass: 'bg-secondary text-foreground border-border',
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
  dracula: {
    id: 'dracula',
    name: 'Antigravity Dracula',
    tagline: 'Dark Purple & Neon Green',
    primaryColor: '#BD93F9',
    bgColor: '#191A21',
    cardColor: '#282A36',
    borderColor: '#44475A',
    accentColor: '#50FA7B',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    hslValues: {
      '--primary': '265 89% 78%',
      '--primary-foreground': '231 15% 11%',
      '--background': '231 15% 11%',
      '--foreground': '60 30% 96%',
      '--card': '231 15% 18%',
      '--card-foreground': '60 30% 96%',
      '--popover': '231 15% 18%',
      '--popover-foreground': '60 30% 96%',
      '--secondary': '232 14% 24%',
      '--secondary-foreground': '60 30% 96%',
      '--border': '232 14% 31%',
      '--input': '232 14% 31%',
      '--ring': '265 89% 78%',
      '--accent': '232 14% 24%',
      '--accent-foreground': '60 30% 96%',
      '--muted': '232 14% 24%',
      '--muted-foreground': '225 25% 70%',
    },
  },
  purple: {
    id: 'purple',
    name: 'Purple Theme',
    tagline: 'Electric Indigo & Deep Violet',
    primaryColor: '#5C45FD',
    bgColor: '#0F0E1E',
    cardColor: '#18162F',
    borderColor: '#3A3568',
    accentColor: '#8C7CFF',
    badgeClass: 'bg-indigo-500/20 text-white border-indigo-400/40',
    hslValues: {
      '--primary': '247 98% 63%',
      '--primary-foreground': '0 0% 100%',
      '--background': '246 35% 9%',
      '--foreground': '0 0% 100%',
      '--card': '245 36% 14%',
      '--card-foreground': '0 0% 100%',
      '--popover': '245 36% 14%',
      '--popover-foreground': '0 0% 100%',
      '--secondary': '246 32% 19%',
      '--secondary-foreground': '0 0% 100%',
      '--border': '246 34% 28%',
      '--input': '246 34% 28%',
      '--ring': '247 98% 63%',
      '--accent': '246 32% 24%',
      '--accent-foreground': '0 0% 100%',
      '--muted': '246 32% 19%',
      '--muted-foreground': '240 15% 75%',
    },
  },
  obsidian: {
    id: 'obsidian',
    name: 'VS Code Obsidian',
    tagline: 'Obsidian Slate & Cyan Neon',
    primaryColor: '#38BDF8',
    bgColor: '#0D1117',
    cardColor: '#161B22',
    borderColor: '#30363D',
    accentColor: '#38BDF8',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    hslValues: {
      '--primary': '199 89% 48%',
      '--primary-foreground': '216 28% 7%',
      '--background': '216 28% 7%',
      '--foreground': '212 50% 96%',
      '--card': '215 21% 11%',
      '--card-foreground': '212 50% 96%',
      '--popover': '215 21% 11%',
      '--popover-foreground': '212 50% 96%',
      '--secondary': '215 15% 15%',
      '--secondary-foreground': '212 50% 96%',
      '--border': '213 12% 21%',
      '--input': '213 12% 21%',
      '--ring': '199 89% 48%',
      '--accent': '215 21% 18%',
      '--accent-foreground': '212 50% 96%',
      '--muted': '214 15% 16%',
      '--muted-foreground': '215 20% 70%',
    },
  },
  'vscode-navy-gold': {
    id: 'vscode-navy-gold',
    name: 'Navy Gold',
    tagline: 'Obsidian Navy & Cream',
    primaryColor: '#F0F6FC',
    bgColor: '#0D1117',
    cardColor: '#161B22',
    borderColor: '#30363D',
    accentColor: '#E8C547',
    badgeClass: 'bg-secondary text-foreground border-border',
    hslValues: {
      '--primary': '210 56% 96%',
      '--primary-foreground': '220 26% 7%',
      '--background': '220 26% 7%',
      '--foreground': '210 56% 96%',
      '--card': '220 20% 11%',
      '--card-foreground': '210 56% 96%',
      '--popover': '220 20% 11%',
      '--popover-foreground': '210 56% 96%',
      '--secondary': '215 14% 19%',
      '--secondary-foreground': '210 56% 96%',
      '--border': '215 14% 21%',
      '--input': '215 14% 21%',
      '--ring': '47 78% 59%',
      '--accent': '215 14% 24%',
      '--accent-foreground': '210 56% 96%',
      '--muted': '215 14% 19%',
      '--muted-foreground': '215 14% 65%',
    },
  },
  clean: {
    id: 'clean',
    name: 'Clean Light',
    tagline: 'Corporate Slate & Sapphire',
    primaryColor: '#2563EB',
    bgColor: '#F8FAFC',
    cardColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    accentColor: '#3B82F6',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
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

export const ORDERED_THEME_KEYS: AppThemeType[] = [
  'green-choice',
  'clean-wide',
  'clean',
  'riseup',
  'dracula',
  'purple',
  'obsidian',
  'vscode-navy-gold',
];

interface ThemeContextType {
  theme: AppThemeType;
  setTheme: (theme: AppThemeType) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'green-choice',
  setTheme: () => {},
  config: THEME_CONFIGS['green-choice'],
});

const STORAGE_KEY = 'wpexam_active_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppThemeType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'letterly') {
      return 'purple';
    }

    if (saved === 'sweet-digs') {
      return 'green-choice';
    }

    if (saved && saved in THEME_CONFIGS) {
      return saved as AppThemeType;
    }

    return 'green-choice';
  });

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS['green-choice'];

  const setTheme = (newTheme: AppThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--wp-exam-primary', config.primaryColor);
    root.style.setProperty('--wp-exam-bg', config.bgColor);
    root.style.setProperty('--wp-exam-card', config.cardColor);
    root.style.setProperty('--wp-exam-card-border', config.borderColor);
    root.style.setProperty('--wp-exam-accent', config.accentColor);
    root.style.setProperty('--color-theme-primary', config.primaryColor);
    root.style.setProperty('--color-theme-bg', config.bgColor);
    root.style.setProperty('--color-theme-card', config.cardColor);
    root.style.setProperty('--color-theme-border', config.borderColor);
    root.style.setProperty('--color-theme-accent', config.accentColor);

    // Propagate standard Tailwind HSL color tokens
    if (config.hslValues) {
      Object.entries(config.hslValues).forEach(([cssKey, hslValue]) => {
        root.style.setProperty(cssKey, hslValue);
      });
    }

    const allThemeClasses = [
      'theme-green-choice',
      'theme-sweet-digs',
      'theme-clean',
      'theme-clean-wide',
      'theme-purple',
      'theme-letterly',
      'theme-dracula',
      'theme-obsidian',
      'theme-vscode-dark',
      'theme-vscode-navy-gold',
      'theme-riseup',
      'theme-riseup-asia',
    ];
    root.classList.remove(...allThemeClasses);
    root.classList.add(`theme-${theme}`);
    if (theme === 'green-choice') {
      root.classList.add('theme-sweet-digs');
    }
    if (theme === 'purple') {
      root.classList.add('theme-letterly');
    }
    if (theme === 'obsidian') {
      root.classList.add('theme-vscode-dark');
    }
    if (theme === 'riseup') {
      root.classList.add('theme-riseup-asia');
    }

    if (theme === 'clean' || theme === 'clean-wide' || theme === 'sweet-digs' || theme === 'green-choice') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme, config]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme, config } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 px-3.5 text-sm gap-2 rounded-xl border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground font-semibold shadow-xs transition-all cursor-pointer ${className || ''}`}
        >
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-border/80"
            style={{ backgroundColor: config.primaryColor }}
          />
          <span className="hidden sm:inline font-semibold">{config.name}</span>
          <Palette className="w-4 h-4 opacity-70 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-1.5 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl backdrop-blur-md"
      >
        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
          Select Presentation Theme
        </div>
        {ORDERED_THEME_KEYS.map((themeKey) => {
          const item = THEME_CONFIGS[themeKey];
          const isSelected = theme === themeKey || (theme === 'sweet-digs' && themeKey === 'green-choice');

          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full border border-border/80 shadow-xs shrink-0"
                  style={{ backgroundColor: item.primaryColor }}
                />
                <div>
                  <div className="font-semibold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.tagline}</div>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

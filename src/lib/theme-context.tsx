import React, { createContext, useContext, useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type AppThemeType = 'riseup' | 'dracula' | 'purple' | 'obsidian' | 'clean';

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
  riseup: {
    id: 'riseup',
    name: 'Rise Up Asia',
    tagline: 'Warm Gold & Midnight Navy',
    primaryColor: '#FFAD01',
    bgColor: '#0A0A14',
    cardColor: '#121224',
    borderColor: '#2A2A44',
    accentColor: '#FFAD01',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    hslValues: {
      '--primary': '41 100% 50%',
      '--primary-foreground': '240 33% 6%',
      '--background': '240 33% 6%',
      '--foreground': '210 40% 98%',
      '--card': '240 33% 11%',
      '--card-foreground': '210 40% 98%',
      '--popover': '240 33% 11%',
      '--popover-foreground': '210 40% 98%',
      '--border': '240 24% 22%',
      '--input': '240 24% 22%',
      '--ring': '41 100% 50%',
      '--accent': '41 100% 50%',
      '--accent-foreground': '240 33% 6%',
      '--muted': '240 20% 16%',
      '--muted-foreground': '215 20% 65%',
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
      '--border': '232 14% 31%',
      '--input': '232 14% 31%',
      '--ring': '265 89% 78%',
      '--accent': '135 94% 65%',
      '--accent-foreground': '231 15% 11%',
      '--muted': '232 14% 24%',
      '--muted-foreground': '225 15% 65%',
    },
  },
  purple: {
    id: 'purple',
    name: 'Purple Theme',
    tagline: 'Electric Indigo & Deep Violet',
    primaryColor: '#5C45FD',
    bgColor: '#0F0E1E',
    cardColor: '#171530',
    borderColor: '#35306B',
    accentColor: '#8C7CFF',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    hslValues: {
      '--primary': '247 98% 63%',
      '--primary-foreground': '0 0% 100%',
      '--background': '244 36% 9%',
      '--foreground': '210 40% 98%',
      '--card': '244 38% 14%',
      '--card-foreground': '210 40% 98%',
      '--popover': '244 38% 14%',
      '--popover-foreground': '210 40% 98%',
      '--border': '245 38% 31%',
      '--input': '245 38% 31%',
      '--ring': '247 98% 63%',
      '--accent': '247 100% 74%',
      '--accent-foreground': '244 36% 9%',
      '--muted': '245 25% 18%',
      '--muted-foreground': '215 20% 65%',
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
      '--border': '213 12% 21%',
      '--input': '213 12% 21%',
      '--ring': '199 89% 48%',
      '--accent': '199 89% 48%',
      '--accent-foreground': '216 28% 7%',
      '--muted': '214 15% 16%',
      '--muted-foreground': '215 20% 65%',
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
      '--accent': '217 91% 60%',
      '--accent-foreground': '0 0% 100%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215 16% 47%',
    },
  },
};

interface ThemeContextType {
  theme: AppThemeType;
  setTheme: (theme: AppThemeType) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'riseup',
  setTheme: () => {},
  config: THEME_CONFIGS.riseup,
});

const STORAGE_KEY = 'wpexam_active_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppThemeType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'letterly') {
      return 'purple';
    }

    if (saved && saved in THEME_CONFIGS) {
      return saved as AppThemeType;
    }

    return 'riseup';
  });

  const config = THEME_CONFIGS[theme];

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

    if (theme === 'clean') {
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
          className={`h-9 px-3 text-xs gap-2 rounded-xl border font-medium transition ${className || ''}`}
          style={{
            borderColor: config.borderColor,
            backgroundColor: `${config.cardColor}CC`,
          }}
        >
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: config.primaryColor }}
          />
          <span className="hidden sm:inline font-semibold">{config.name}</span>
          <Palette className="w-3.5 h-3.5 opacity-60 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md"
        style={{
          backgroundColor: config.cardColor,
          borderColor: config.borderColor,
        }}
      >
        <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
          Select Presentation Theme
        </div>
        {(Object.keys(THEME_CONFIGS) as AppThemeType[]).map((themeKey) => {
          const item = THEME_CONFIGS[themeKey];
          const isSelected = theme === themeKey;

          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer focus:bg-accent/40"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: item.primaryColor }}
                />
                <div>
                  <div className="font-semibold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.tagline}</div>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

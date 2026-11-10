import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeAccent = 'teal' | 'violet' | 'blue' | 'black';

export interface ThemeConfig {
  id: ThemeAccent;
  name: string;
  accent: string;
  accentHover: string;
  accentSecondary: string;
  accentTertiary: string;
  rgb: string;
  gradientClass: string;
  glowColor: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const THEMES: Record<ThemeAccent, ThemeConfig> = {
  teal: {
    id: 'teal',
    name: 'Teal (Clinical)',
    accent: '#00E5CC',
    accentHover: '#34eed8',
    accentSecondary: '#4FA3FF',
    accentTertiary: '#C084FC',
    rgb: '0, 229, 204',
    gradientClass: 'from-[#00E5CC] via-[#4FA3FF] to-[#C084FC]',
    glowColor: 'rgba(0, 229, 204, 0.45)',
    dotColor: '#00E5CC',
    badgeBg: 'rgba(0, 229, 204, 0.1)',
    badgeBorder: 'rgba(0, 229, 204, 0.35)',
    badgeText: '#00E5CC',
  },
  violet: {
    id: 'violet',
    name: 'Violet (Amethyst)',
    accent: '#C084FC',
    accentHover: '#D8B4FE',
    accentSecondary: '#A855F7',
    accentTertiary: '#F43F5E',
    rgb: '192, 132, 252',
    gradientClass: 'from-[#C084FC] via-[#A855F7] to-[#F43F5E]',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    dotColor: '#C084FC',
    badgeBg: 'rgba(192, 132, 252, 0.12)',
    badgeBorder: 'rgba(192, 132, 252, 0.35)',
    badgeText: '#C084FC',
  },
  blue: {
    id: 'blue',
    name: 'Blue (Cobalt)',
    accent: '#38BDF8',
    accentHover: '#7DD3FC',
    accentSecondary: '#60A5FA',
    accentTertiary: '#818CF8',
    rgb: '56, 189, 248',
    gradientClass: 'from-[#38BDF8] via-[#60A5FA] to-[#818CF8]',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    dotColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    badgeBorder: 'rgba(56, 189, 248, 0.35)',
    badgeText: '#38BDF8',
  },
  black: {
    id: 'black',
    name: 'Black (Monochrome)',
    accent: '#F8FAFC',
    accentHover: '#FFFFFF',
    accentSecondary: '#E2E8F0',
    accentTertiary: '#94A3B8',
    rgb: '248, 250, 252',
    gradientClass: 'from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8]',
    glowColor: 'rgba(255, 255, 255, 0.35)',
    dotColor: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    badgeBorder: 'rgba(255, 255, 255, 0.3)',
    badgeText: '#F8FAFC',
  },
};

interface ThemeContextType {
  theme: ThemeAccent;
  setTheme: (theme: ThemeAccent) => void;
  config: ThemeConfig;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'teal',
  setTheme: () => {},
  config: THEMES.teal,
  allThemes: Object.values(THEMES),
});

const STORAGE_KEY = 'dentx_accent_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeAccent>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeAccent;
      if (stored && THEMES[stored]) {
        return stored;
      }
    }
    return 'teal';
  });

  const applyTheme = (t: ThemeAccent) => {
    const cfg = THEMES[t] || THEMES.teal;
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', t);
      root.style.setProperty('--accent-color', cfg.accent);
      root.style.setProperty('--accent-hover', cfg.accentHover);
      root.style.setProperty('--accent-rgb', cfg.rgb);
      root.style.setProperty('--accent-glow', cfg.glowColor);
      root.style.setProperty(
        '--accent-gradient',
        `linear-gradient(to right, ${cfg.accent}, ${cfg.accentSecondary}, ${cfg.accentTertiary})`
      );
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeAccent) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        config: THEMES[theme] || THEMES.teal,
        allThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

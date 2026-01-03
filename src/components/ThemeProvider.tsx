import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThemeColors } from '@/types/restaurant';
import { DEFAULT_COLORS } from '@/lib/color-utils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  storageKey?: string;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  storageKey = 'theme',
  defaultTheme = 'dark' 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as Theme;
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  // Fetch restaurant theme colors (only for client theme)
  const { data: themeColors } = useQuery({
    queryKey: ['restaurant-theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('theme_colors')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data?.theme_colors as ThemeColors) || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Apply custom theme colors
  useEffect(() => {
    const root = document.documentElement;
    const colors = themeColors || {};
    
    if (colors.primary) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--accent', colors.primary);
      root.style.setProperty('--ring', colors.primary);
    } else {
      root.style.setProperty('--primary', DEFAULT_COLORS.primary!);
      root.style.setProperty('--accent', DEFAULT_COLORS.accent!);
      root.style.setProperty('--ring', DEFAULT_COLORS.primary!);
    }
    
    if (colors.background) {
      root.style.setProperty('--background', colors.background);
    } else {
      root.style.removeProperty('--background');
    }
    
    if (colors.card) {
      root.style.setProperty('--card', colors.card);
    } else {
      root.style.removeProperty('--card');
    }

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
    };
  }, [themeColors]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

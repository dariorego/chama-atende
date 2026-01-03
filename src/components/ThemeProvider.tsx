import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThemeColors } from '@/types/restaurant';
import { DEFAULT_COLORS } from '@/lib/color-utils';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
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

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme colors or defaults
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
      root.style.setProperty('--background', DEFAULT_COLORS.background!);
    }
    
    if (colors.card) {
      root.style.setProperty('--card', colors.card);
    } else {
      root.style.setProperty('--card', DEFAULT_COLORS.card!);
    }

    // Cleanup on unmount - reset to default
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
    };
  }, [themeColors]);

  return <>{children}</>;
}

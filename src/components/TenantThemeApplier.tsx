import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';

/**
 * Applies tenant-specific brand colors (primary, secondary, background)
 * as CSS variables on the document root. Must be mounted inside TenantProvider.
 */
export function TenantThemeApplier() {
  const { tenant } = useTenant();

  useEffect(() => {
    const root = document.documentElement;
    const colors = (tenant?.theme_colors as Record<string, string> | null) || {};

    const apply = (key: string, value?: string) => {
      if (value) root.style.setProperty(key, value);
      else root.style.removeProperty(key);
    };

    // Primary drives buttons, links, accents, rings
    apply('--primary', colors.primary);
    apply('--accent', colors.primary);
    apply('--ring', colors.primary);

    // Secondary — supporting brand surface
    apply('--secondary', colors.secondary);

    // Background — main app surface + card fallback
    apply('--background', colors.background);
    apply('--card', colors.background);

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
    };
  }, [tenant?.theme_colors]);

  return null;
}
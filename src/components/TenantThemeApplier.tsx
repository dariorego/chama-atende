import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';

function parseHsl(v?: string): { h: number; s: number; l: number } | null {
  if (!v) return null;
  const m = v.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);
  if (!m) return null;
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

const fmt = (h: number, s: number, l: number) =>
  `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;

/** Auto-pick a readable foreground (near-white or near-black) for a given HSL bg. */
function contrastOn(hsl?: string): string | undefined {
  const c = parseHsl(hsl);
  if (!c) return undefined;
  return c.l >= 60 ? '220 25% 12%' : '0 0% 100%';
}

/**
 * Applies tenant-specific brand colors as CSS variables on the document root
 * so every module (client + admin: sidebar, buttons, links, cards, rings)
 * reflects the same identity. Must be mounted inside TenantProvider.
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

    const primary = colors.primary;
    const secondary = colors.secondary;
    const background = colors.background;

    // Primary — buttons, links, accents, focus rings
    apply('--primary', primary);
    apply('--primary-foreground', contrastOn(primary));
    apply('--accent', primary);
    apply('--accent-foreground', contrastOn(primary));
    apply('--ring', primary);

    // Secondary — supporting brand surface
    apply('--secondary', secondary);
    apply('--secondary-foreground', contrastOn(secondary));

    // Background — main app surface + card fallback
    apply('--background', background);
    apply('--card', background);
    apply('--card-foreground', contrastOn(background));
    apply('--popover', background);
    apply('--popover-foreground', contrastOn(background));
    apply('--foreground', contrastOn(background));

    // Sidebar tokens (admin layout) — mirror the tenant identity
    apply('--sidebar-background', background);
    apply('--sidebar-foreground', contrastOn(background));
    apply('--sidebar-primary', primary);
    apply('--sidebar-primary-foreground', contrastOn(primary));
    apply('--sidebar-accent', secondary);
    apply('--sidebar-accent-foreground', contrastOn(secondary));
    apply('--sidebar-ring', primary);

    return () => {
      [
        '--primary', '--primary-foreground',
        '--accent', '--accent-foreground', '--ring',
        '--secondary', '--secondary-foreground',
        '--background', '--card', '--card-foreground',
        '--popover', '--popover-foreground', '--foreground',
        '--sidebar-background', '--sidebar-foreground',
        '--sidebar-primary', '--sidebar-primary-foreground',
        '--sidebar-accent', '--sidebar-accent-foreground',
        '--sidebar-ring',
      ].forEach((k) => root.style.removeProperty(k));
    };
  }, [tenant?.theme_colors]);

  return null;
}
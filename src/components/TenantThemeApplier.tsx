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

/** Ajusta a luminosidade de uma cor HSL mantendo matiz/saturação. */
function withLightness(hsl?: string, l?: number, s?: number): string | undefined {
  const c = parseHsl(hsl);
  if (!c || l === undefined) return undefined;
  return fmt(c.h, s ?? c.s, l);
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
    const foreground = colors.foreground;

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
    const fg = foreground || contrastOn(background);
    apply('--background', background);
    apply('--card', background);
    apply('--card-foreground', fg);
    apply('--popover', background);
    apply('--popover-foreground', fg);
    apply('--foreground', fg);

    // Sidebar tokens (admin layout) — mirror the tenant identity
    apply('--sidebar-background', background);
    apply('--sidebar-foreground', fg);
    apply('--sidebar-primary', primary);
    apply('--sidebar-primary-foreground', contrastOn(primary));
    apply('--sidebar-accent', secondary);
    apply('--sidebar-accent-foreground', contrastOn(secondary));
    apply('--sidebar-ring', primary);

    // Tokens editoriais (hub, cardápio, cards) — seguem a identidade do tenant
    const heroBase =
      (parseHsl(secondary)?.l ?? 100) <= 40 ? secondary : primary;
    const hero = withLightness(heroBase, 15);
    // Acento editorial: escurece cores muito claras para manter legibilidade
    const accentL = parseHsl(primary)?.l ?? 50;
    apply('--ed-gold', accentL > 62 ? withLightness(primary, 48) : primary);
    apply('--ed-hero', hero);
    apply('--ed-hero-fg', hero ? '0 0% 100%' : undefined);
    apply('--ed-fg', foreground || withLightness(primary, 18));
    apply('--ed-bg', background);
    apply('--ed-surface', withLightness(background, 99, 30) || background);

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
        '--ed-gold', '--ed-hero', '--ed-hero-fg',
        '--ed-fg', '--ed-bg', '--ed-surface',
      ].forEach((k) => root.style.removeProperty(k));
    };
  }, [tenant?.theme_colors]);

  return null;
}
// Color utility functions for HSL/HEX conversion

export interface ThemeColors {
  primary?: string;
  background?: string;
  card?: string;
  accent?: string;
}

// Default theme colors (HSL format without hsl() wrapper)
export const DEFAULT_COLORS: ThemeColors = {
  primary: '142 85% 49%',
  background: '220 20% 8%',
  card: '220 18% 12%',
  accent: '142 85% 49%',
};

/**
 * Convert HEX color to HSL string format
 * @param hex - HEX color string (e.g., "#22c55e")
 * @returns HSL string without wrapper (e.g., "142 85% 49%")
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Convert HSL string to HEX color
 * @param hsl - HSL string without wrapper (e.g., "142 85% 49%")
 * @returns HEX color string (e.g., "#22c55e")
 */
export function hslToHex(hsl: string): string {
  const parts = hsl.split(' ');
  const h = parseInt(parts[0]) / 360;
  const s = parseInt(parts[1]?.replace('%', '') || '0') / 100;
  const l = parseInt(parts[2]?.replace('%', '') || '0') / 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

import { CVThemeConfig } from '@/types/cvBuilder';

export interface ThemeStylesOutput {
  fontFamily: string;
  fontSizeClass: string;
  sectionGapClass: string;
  itemGapClass: string;
  subItemGapClass: string;
  avatarRadius: string;
}

export function getThemeStyles(theme?: Partial<CVThemeConfig>): ThemeStylesOutput {
  const fontFamily = theme?.fontFamily || 'Inter, sans-serif';

  // Font size scale
  let fontSizeClass = 'text-[12.5px] leading-relaxed';
  if (theme?.fontSize === 'small') {
    fontSizeClass = 'text-[11.5px] leading-normal';
  } else if (theme?.fontSize === 'large') {
    fontSizeClass = 'text-[13.5px] leading-relaxed';
  }

  // Spacing scale
  let sectionGapClass = 'gap-5';
  let itemGapClass = 'space-y-3.5';
  let subItemGapClass = 'space-y-1.5';
  if (theme?.spacing === 'compact') {
    sectionGapClass = 'gap-3.5';
    itemGapClass = 'space-y-2.5';
    subItemGapClass = 'space-y-1';
  } else if (theme?.spacing === 'relaxed') {
    sectionGapClass = 'gap-7';
    itemGapClass = 'space-y-5';
    subItemGapClass = 'space-y-2.5';
  }

  // Avatar Shape
  let avatarRadius = '9999px'; // circle default
  if (theme?.avatarShape === 'rounded') {
    avatarRadius = '16px';
  } else if (theme?.avatarShape === 'square') {
    avatarRadius = '4px';
  }

  return {
    fontFamily,
    fontSizeClass,
    sectionGapClass,
    itemGapClass,
    subItemGapClass,
    avatarRadius,
  };
}

/**
 * Converts a hex color like '#1e40af' to an rgba string with given alpha.
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(30, 64, 175, ${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) return `rgba(30, 64, 175, ${alpha})`;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lightens or darkens a hex color by a given percentage (-100 to 100)
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  if (!hex || typeof hex !== 'string') return '#1e40af';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

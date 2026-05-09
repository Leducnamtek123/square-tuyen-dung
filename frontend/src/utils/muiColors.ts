/**
 * MUI v6 Safe Color Utilities
 *
 * Problem: MUI v6 returns CSS variable strings from theme.palette (e.g.
 * `var(--mui-palette-info-main, #64748b)`) instead of raw hex values.
 * The `alpha()` utility from @mui/material/styles cannot parse CSS variable
 * strings → throws MUI Error #9 and crashes the entire page.
 *
 * Solution: Use hardcoded rgba() values that match the theme palette defined
 * in src/themeConfigs/defaultTheme.ts.
 *
 * Usage:
 *   // Before (broken in MUI v6):
 *   bgcolor: pc.primary( 0.08)
 *
 *   // After (safe):
 *   bgcolor: pc.primary(0.08)
 */

// ── Raw hex colors matching defaultTheme.ts ──────────────────────────────────
const HEX = {
  primary: '#1a407d',       // navy — logo shadow
  primaryLight: '#2aa9e1',  // sky blue — logo fill
  secondary: '#10b981',     // emerald
  success: '#059669',
  error: '#dc2626',
  warning: '#f59e0b',
  info: '#2aa9e1',          // same as primary.light
  divider: '#c3ddfd',       // grey[200]
  actionDisabled: '#a4cafe',// grey[300]
  bgDefault: '#f0f7ff',
  bgPaper: '#ffffff',
} as const;

/** Parse hex #rrggbb or #rgb → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgba(hex: string, opacity: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ── Palette color functions ───────────────────────────────────────────────────
/**
 * Palette color functions — drop-in replacements for alpha(theme.palette.X.main, n).
 *
 * @example
 *   bgcolor: pc.primary(0.08)       // 'rgba(26, 64, 125, 0.08)'
 *   borderColor: pc.info(0.15)      // 'rgba(42, 169, 225, 0.15)'
 */
const pc = {
  primary:        (opacity: number) => rgba(HEX.primary, opacity),
  primaryLight:   (opacity: number) => rgba(HEX.primaryLight, opacity),
  secondary:      (opacity: number) => rgba(HEX.secondary, opacity),
  success:        (opacity: number) => rgba(HEX.success, opacity),
  error:          (opacity: number) => rgba(HEX.error, opacity),
  warning:        (opacity: number) => rgba(HEX.warning, opacity),
  info:           (opacity: number) => rgba(HEX.info, opacity),
  divider:        (opacity: number) => rgba(HEX.divider, opacity),
  actionDisabled: (opacity: number) => rgba(HEX.actionDisabled, opacity),
  bgDefault:      (opacity: number) => rgba(HEX.bgDefault, opacity),
  bgPaper:        (opacity: number) => rgba(HEX.bgPaper, opacity),
} as const;

export default pc;

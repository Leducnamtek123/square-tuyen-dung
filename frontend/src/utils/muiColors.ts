/**
 * MUI v6 Safe Color Utilities
 *
 * Use hardcoded rgba() helpers that match the neutral-first theme palette.
 */

const HEX = {
  primary: '#0f172a',
  primaryLight: '#334155',
  secondary: '#10b981',
  success: '#059669',
  error: '#dc2626',
  warning: '#f59e0b',
  info: '#0f172a',
  divider: '#e2e8f0',
  actionDisabled: '#94a3b8',
  bgDefault: '#ffffff',
  bgPaper: '#ffffff',
} as const;

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

const pc = {
  primary: (opacity: number) => rgba(HEX.primary, opacity),
  primaryLight: (opacity: number) => rgba(HEX.primaryLight, opacity),
  secondary: (opacity: number) => rgba(HEX.secondary, opacity),
  success: (opacity: number) => rgba(HEX.success, opacity),
  error: (opacity: number) => rgba(HEX.error, opacity),
  warning: (opacity: number) => rgba(HEX.warning, opacity),
  info: (opacity: number) => rgba(HEX.info, opacity),
  divider: (opacity: number) => rgba(HEX.divider, opacity),
  actionDisabled: (opacity: number) => rgba(HEX.actionDisabled, opacity),
  bgDefault: (opacity: number) => rgba(HEX.bgDefault, opacity),
  bgPaper: (opacity: number) => rgba(HEX.bgPaper, opacity),
} as const;

export default pc;

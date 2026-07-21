const mode = 'light';

// Neutral-first UI palette. Pink is reserved for the logo asset only.
const colors = {
  primary: {
    light: '#334155',
    main: '#0f172a',
    dark: '#111827',
    contrastText: '#ffffff',
    background: 'rgba(15, 23, 42, 0.06)',
    gradient: 'linear-gradient(45deg, #0f172a 30%, #334155 90%)',
  },
  secondary: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
    background: 'rgba(16, 185, 129, 0.07)',
    backgroundHover: 'rgba(16, 185, 129, 0.12)',
    gradient: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  },
  hot: {
    main: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
    background: 'rgba(245, 158, 11, 0.1)',
    contrastText: '#ffffff',
  },
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    contrastText: '#ffffff',
    background: 'rgba(5, 150, 105, 0.06)',
  },
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
    contrastText: '#ffffff',
    background: 'rgba(220, 38, 38, 0.06)',
    '50': 'rgba(220, 38, 38, 0.06)',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0f172a',
    light: '#334155',
    dark: '#111827',
    contrastText: '#ffffff',
    background: 'rgba(15, 23, 42, 0.06)',
  },
  grey: {
    50:  '#ffffff',
    100: '#f8fafc',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1f2937',
    900: '#0f172a',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
    placeholder: '#94a3b8',
    italic: { fontStyle: 'italic' },
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  feedback: {
    button: {
      background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
      hover: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
      shadow: 'rgba(15, 23, 42, 0.22)',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    },
    dialog: {
      border: 'rgba(15, 23, 42, 0.12)',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    }
  },
} as const;

const customShadows = {
  small:    '0px 2px 8px rgba(15, 23, 42, 0.04), 0px 1px 2px rgba(15, 23, 42, 0.02)',
  medium:   '0px 8px 24px rgba(15, 23, 42, 0.06), 0px 2px 8px rgba(15, 23, 42, 0.04)',
  large:    '0px 24px 48px rgba(15, 23, 42, 0.08), 0px 12px 24px rgba(15, 23, 42, 0.06)',
  card:     '0px 12px 32px rgba(15, 23, 42, 0.06), 0px 4px 12px rgba(15, 23, 42, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
  feedback: '0 16px 48px rgba(15, 23, 42, 0.10), 0 8px 24px rgba(15, 23, 42, 0.08)',
  z1:  '0px 4px 12px rgba(15, 23, 42, 0.04)',
  z8:  '0px 12px 24px rgba(15, 23, 42, 0.06)',
  z12: '0px 16px 32px rgba(15, 23, 42, 0.08)',
  z16: '0px 24px 48px rgba(15, 23, 42, 0.1)',
  z20: '0px 32px 64px rgba(15, 23, 42, 0.12)',
  z24: '0px 40px 80px rgba(15, 23, 42, 0.14)',
} as const;

const defaultTheme = {
  mode,
  palette: colors,
  customShadows,
  typography: {
    fontFamily: "'Be Vietnam Pro', var(--font-be-vietnam-pro), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.005em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
} as const;

export default defaultTheme;

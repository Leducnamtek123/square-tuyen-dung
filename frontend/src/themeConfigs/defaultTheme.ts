const mode = 'light';

// Premium Enterprise SaaS palette inspired by Linear, Stripe Dashboard & Ashby ATS
const colors = {
  primary: {
    light: '#3B82F6',
    main: '#2563EB',
    dark: '#1D4ED8',
    contrastText: '#ffffff',
    background: 'rgba(37, 99, 235, 0.08)',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  },
  secondary: {
    main: '#6B7280',
    light: '#9CA3AF',
    dark: '#374151',
    contrastText: '#ffffff',
    background: 'rgba(107, 114, 128, 0.08)',
    backgroundHover: 'rgba(107, 114, 128, 0.12)',
  },
  hot: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    background: 'rgba(245, 158, 11, 0.08)',
    contrastText: '#ffffff',
  },
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    contrastText: '#ffffff',
    background: 'rgba(34, 197, 94, 0.08)',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#ffffff',
    background: 'rgba(239, 68, 68, 0.08)',
    '50': 'rgba(239, 68, 68, 0.08)',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#ffffff',
    background: 'rgba(245, 158, 11, 0.08)',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#ffffff',
    background: 'rgba(59, 130, 246, 0.08)',
  },
  grey: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    placeholder: '#9CA3AF',
    italic: { fontStyle: 'italic' },
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  divider: '#E5E7EB',
  feedback: {
    button: {
      background: '#2563EB',
      hover: '#1D4ED8',
      shadow: 'rgba(37, 99, 235, 0.25)',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    },
    dialog: {
      border: '#E5E7EB',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    }
  },
} as const;

const customShadows = {
  small:    '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
  medium:   '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
  large:    '0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -4px rgba(0, 0, 0, 0.05)',
  card:     '0px 1px 3px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px -1px rgba(0, 0, 0, 0.04)',
  feedback: '0px 12px 32px rgba(37, 99, 235, 0.12)',
  z1:  '0px 1px 3px rgba(0, 0, 0, 0.05)',
  z8:  '0px 8px 16px rgba(0, 0, 0, 0.06)',
  z12: '0px 12px 24px rgba(0, 0, 0, 0.08)',
  z16: '0px 16px 32px rgba(0, 0, 0, 0.1)',
  z20: '0px 20px 40px rgba(0, 0, 0, 0.12)',
  z24: '0px 24px 48px rgba(0, 0, 0, 0.14)',
} as const;

const defaultTheme = {
  mode,
  palette: colors,
  customShadows,
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontSize: '32px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#111827' }, // Page title
    h2: { fontSize: '22px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.015em', color: '#111827' }, // Section title
    h3: { fontSize: '18px', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em', color: '#111827' }, // Card title
    h4: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4, color: '#111827' },
    h5: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: '#111827' },
    h6: { fontSize: '12px', fontWeight: 600, lineHeight: 1.4, color: '#6B7280' },
    body1: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, color: '#111827' }, // Body
    body2: { fontSize: '13px', fontWeight: 400, lineHeight: 1.5, color: '#6B7280' },
    caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, color: '#6B7280' }, // Caption
    button: { fontSize: '14px', fontWeight: 600, textTransform: 'none', letterSpacing: '0' }, // Button
  },
} as const;

export default defaultTheme;

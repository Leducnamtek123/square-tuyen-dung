const mode = 'light';

// Define colors — extracted from Square logo SVG (public/square-icons/logo.svg)
// Logo colors: #2aa9e1 (sky blue fill), #1a407d (navy shadow), #0f397f (deep navy text)
const colors = {
  primary: {
    light: '#2aa9e1',    // Sky blue — logo main square fill
    main: '#1a407d',     // Navy blue — logo shadow/depth
    dark: '#0f397f',     // Deep navy — logo text color
    contrastText: '#ffffff',
    background: 'rgba(42, 169, 225, 0.07)',
    gradient: 'linear-gradient(45deg, #2aa9e1 30%, #1a407d 90%)',
  },
  secondary: {
    main: '#10b981',     // Emerald — growth & opportunity
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
    background: 'rgba(16, 185, 129, 0.07)',
    backgroundHover: 'rgba(16, 185, 129, 0.12)',
    gradient: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
  },
  hot: {
    main: '#f59e0b',     // Amber — urgent jobs badge
    light: '#fcd34d',
    dark: '#d97706',
    background: 'rgba(245, 158, 11, 0.1)',
    contrastText: '#ffffff',
  },
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    background: 'rgba(5, 150, 105, 0.06)',
  },
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
    background: 'rgba(220, 38, 38, 0.06)',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#2aa9e1',     // matches primary.light — cohesive
    light: '#38bdf8',
    dark: '#1a407d',
    background: 'rgba(42, 169, 225, 0.06)',
  },
  grey: {
    50:  '#f0f7ff',
    100: '#e1effe',
    200: '#c3ddfd',
    300: '#a4cafe',
    400: '#76a9fa',
    500: '#3f83f8',
    600: '#1c64f2',
    700: '#1a56db',
    800: '#1e429f',
    900: '#0f397f',
  },
  text: {
    primary: '#0f397f',
    secondary: '#3f6fc6',
    disabled: '#a4cafe',
    placeholder: '#a4cafe',
    italic: { fontStyle: 'italic' },
  },
  background: {
    default: '#f0f7ff',
    paper: '#ffffff',
  },
  feedback: {
    button: {
      background: 'linear-gradient(135deg, #2aa9e1 0%, #1a407d 100%)',
      hover: 'linear-gradient(135deg, #1a407d 0%, #0f397f 100%)',
      shadow: 'rgba(42, 169, 225, 0.35)',
      gradient: 'linear-gradient(135deg, #2aa9e1 0%, #1a407d 100%)',
    },
    dialog: {
      border: 'rgba(42, 169, 225, 0.15)',
      gradient: 'linear-gradient(135deg, #2aa9e1 0%, #1a407d 100%)',
    }
  },
} as const;

const customShadows = {
  small:    '0px 2px 4px rgba(26, 64, 125, 0.06)',
  medium:   '0px 4px 10px rgba(26, 64, 125, 0.10)',
  large:    '0px 8px 24px rgba(26, 64, 125, 0.14)',
  card:     '0px 4px 20px rgba(26, 64, 125, 0.08)',
  feedback: '0 8px 32px rgba(42, 169, 225, 0.18)',
  // Standard elevation levels for premium components
  z1:  '0px 2px 8px rgba(26, 64, 125, 0.08)',
  z8:  '0px 8px 16px rgba(26, 64, 125, 0.10)',
  z12: '0px 12px 24px rgba(26, 64, 125, 0.12)',
  z16: '0px 16px 32px rgba(26, 64, 125, 0.14)',
  z20: '0px 20px 40px rgba(26, 64, 125, 0.16)',
  z24: '0px 24px 48px rgba(26, 64, 125, 0.18)',
} as const;

const defaultTheme = {
  mode,
  palette: colors,
  customShadows,
} as const;

export default defaultTheme;

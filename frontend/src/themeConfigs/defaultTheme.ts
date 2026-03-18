const mode = 'light';

// Define colors
const colors = {
  primary: {
    main: '#1976d2', // Blue
    light: '#42a5f5', // Light blue
    dark: '#1565c0', // Dark blue
    contrastText: '#ffffff',
    background: 'rgba(25, 118, 210, 0.05)',
    gradient: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
  },
  secondary: {
    main: '#ff9800', // Orange
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#ffffff',
    background: '#fffaf5',
    backgroundHover: '#fff5e6',
    gradient: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
  },
  hot: {
    main: '#ff3b3b',
    light: '#ff6b6b',
    dark: '#cc2f2f',
    background: 'rgba(255, 59, 59, 0.1)',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32', // Green
    light: '#4caf50',
    dark: '#1b5e20',
    background: 'rgba(46, 125, 50, 0.05)',
  },
  error: {
    main: '#d32f2f', // Red
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#fca34d', // Orange
    light: '#fdb872',
    dark: '#f88c1a',
  },
  info: {
    main: '#0288d1', // Blue
    light: '#03a9f4',
    dark: '#01579b',
    background: 'rgba(2, 136, 209, 0.05)',
  },
  grey: {
    50: '#f8f9fa',
    100: '#f0f1f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  text: {
    primary: '#212529',
    secondary: '#6c757d',
    disabled: '#adb5bd',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
  },
} as const;

const defaultTheme = {
  mode,
  colors,
} as const;

export default defaultTheme;

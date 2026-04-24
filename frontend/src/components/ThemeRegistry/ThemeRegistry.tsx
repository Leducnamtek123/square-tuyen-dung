'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';
import defaultTheme from '../../themeConfigs/defaultTheme';
import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const baseTheme = createTheme(defaultTheme as ThemeOptions);

/**
 * Extend theme with MuiAlert overrides to prevent MUI v6 from calling
 * alpha() on CSS variable strings (which causes MUI error #9).
 * We use hardcoded rgba values that match our theme palette.
 */
const theme = createTheme(baseTheme, {
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: { severity?: string } }) => ({
          ...(ownerState.severity === 'success' && {
            backgroundColor: 'rgba(5, 150, 105, 0.08)',
            color: '#047857',
            '& .MuiAlert-icon': { color: '#059669' },
          }),
          ...(ownerState.severity === 'error' && {
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            color: '#b91c1c',
            '& .MuiAlert-icon': { color: '#dc2626' },
          }),
          ...(ownerState.severity === 'warning' && {
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: '#d97706',
            '& .MuiAlert-icon': { color: '#f59e0b' },
          }),
          ...(ownerState.severity === 'info' && {
            backgroundColor: 'rgba(42, 169, 225, 0.08)',
            color: '#1a407d',
            '& .MuiAlert-icon': { color: '#2aa9e1' },
          }),
        }),
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}

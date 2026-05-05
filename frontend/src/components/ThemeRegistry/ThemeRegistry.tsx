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
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(26, 64, 125, 0.12)',
          backdropFilter: 'blur(14px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid',
          borderColor: 'rgba(26, 64, 125, 0.10)',
          boxShadow: '0 10px 30px rgba(26, 64, 125, 0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease',
        },
        contained: {
          boxShadow: '0 10px 24px rgba(26, 64, 125, 0.18)',
          '&:hover': {
            boxShadow: '0 14px 30px rgba(26, 64, 125, 0.22)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
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

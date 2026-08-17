'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';
import defaultTheme from '../../themeConfigs/defaultTheme';
import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const baseTheme = createTheme(defaultTheme as ThemeOptions);
const BUTTON_RADIUS = 'var(--sq-button-radius)';

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
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(14px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid',
          borderColor: 'rgba(226, 232, 240, 0.95)',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          display: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: BUTTON_RADIUS,
          textTransform: 'none',
          minHeight: 42,
          paddingInline: 18,
          fontWeight: 800,
          letterSpacing: 0,
          transition:
            'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease, filter 180ms ease',
          '&:focus-visible': {
            outline: '3px solid rgba(15, 23, 42, 0.18)',
            outlineOffset: 2,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '& .MuiButton-startIcon': {
            marginRight: 8,
            marginLeft: -2,
          },
        },
        sizeSmall: {
          minHeight: 34,
          paddingInline: 14,
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          minHeight: 48,
          paddingInline: 24,
          fontSize: '0.95rem',
        },
        contained: {
          color: '#ffffff',
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.14)',
          '&:hover': {
            boxShadow: '0 10px 22px rgba(15, 23, 42, 0.18)',
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'rgba(226, 232, 240, 0.95)',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: '#F8FAFC',
            borderColor: '#CBD5E1',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
            '&:hover': {
              backgroundColor: '#1D4ED8',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: '#F1F5F9',
            color: '#0F172A',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#E2E8F0',
              boxShadow: 'none',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'error' },
          style: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
            '&:hover': {
              backgroundColor: '#B91C1C',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.3)',
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: '#2563EB',
            color: '#2563EB',
            '&:hover': {
              borderColor: '#1D4ED8',
              backgroundColor: '#EFF6FF',
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            borderColor: 'rgba(16, 185, 129, 0.28)',
            color: '#047857',
            '&:hover': {
              borderColor: 'rgba(16, 185, 129, 0.42)',
              backgroundColor: 'rgba(236, 253, 245, 0.95)',
            },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: BUTTON_RADIUS,
          transition: 'transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: '3px solid rgba(15, 23, 42, 0.18)',
            outlineOffset: 2,
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
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            color: '#0f172a',
            '& .MuiAlert-icon': { color: '#0f172a' },
          }),
        }),
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: any }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}

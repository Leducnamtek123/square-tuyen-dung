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
            outline: '3px solid rgba(42, 169, 225, 0.2)',
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
          boxShadow: '0 8px 18px rgba(26, 64, 125, 0.16)',
          '&:hover': {
            boxShadow: '0 10px 22px rgba(26, 64, 125, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderWidth: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 8px 18px rgba(26, 64, 125, 0.1)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(42, 169, 225, 0.08)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: '#1a407d',
            '&:hover': {
              backgroundColor: '#0f397f',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: '#10b981',
            boxShadow: '0 8px 18px rgba(16, 185, 129, 0.16)',
            '&:hover': {
              backgroundColor: '#059669',
              boxShadow: '0 10px 22px rgba(16, 185, 129, 0.2)',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'info' },
          style: {
            backgroundColor: '#2aa9e1',
            boxShadow: '0 8px 18px rgba(42, 169, 225, 0.16)',
            '&:hover': {
              backgroundColor: '#1a407d',
              boxShadow: '0 10px 22px rgba(42, 169, 225, 0.2)',
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: 'rgba(26, 64, 125, 0.22)',
            color: '#0f397f',
            '&:hover': {
              borderColor: 'rgba(26, 64, 125, 0.36)',
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
              backgroundColor: 'rgba(236, 253, 245, 0.88)',
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
            outline: '3px solid rgba(42, 169, 225, 0.24)',
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

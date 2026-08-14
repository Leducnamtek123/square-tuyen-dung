'use client';

import React from 'react';
import { Box, Container, Paper, Breakpoint } from '@mui/material';
import OnboardingHeader from './OnboardingHeader';

interface OnboardingShellProps {
  children: React.ReactNode;
  headerAppName?: string;
  maxWidth?: Breakpoint | false;
}

export default function OnboardingShell({
  children,
  headerAppName = 'InfoHR',
  maxWidth = 'md',
}: OnboardingShellProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(241, 245, 249, 0.5) 0px, transparent 50%)
        `,
      }}
    >
      <OnboardingHeader appName={headerAppName} />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, sm: 5, md: 7 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth={maxWidth} sx={{ width: '100%', px: { xs: 0, sm: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: { xs: '16px', sm: '24px' },
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 20px 25px -5px rgba(15, 23, 42, 0.03)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {children}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

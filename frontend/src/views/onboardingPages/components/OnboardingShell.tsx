'use client';

import React from 'react';
import { Box, Container, Paper, Breakpoint } from '@mui/material';
import OnboardingHeader from './OnboardingHeader';
import DottedWorldMapBackground from './DottedWorldMapBackground';

interface OnboardingShellProps {
  children: React.ReactNode;
  headerAppName?: string;
  maxWidth?: Breakpoint | false;
  onSkip?: () => void;
  isSkipping?: boolean;
  showSkip?: boolean;
}

export default function OnboardingShell({
  children,
  headerAppName = 'InfoHR',
  maxWidth = 'md',
  onSkip,
  isSkipping = false,
  showSkip = false,
}: OnboardingShellProps) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#F8FAFC',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Subtle Dotted World Map Background Pattern Layer (Brand-blue dots with soft edge fading) */}
      <DottedWorldMapBackground
        dotColor="#2563eb"
        mapOpacity={0.38}
        dotRadius={1.65}
      />

      {/* 2. Soft Ambient Lighting / Vignette Radial Glow centered on content */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `
            radial-gradient(ellipse 75% 55% at 50% 18%, rgba(37, 99, 235, 0.07) 0%, rgba(59, 130, 246, 0.03) 45%, transparent 75%),
            radial-gradient(circle at 10% 90%, rgba(37, 99, 235, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* 3. Header: Floating semi-transparent with blur so grid pattern flows naturally */}
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <OnboardingHeader
          appName={headerAppName}
          onSkip={onSkip}
          isSkipping={isSkipping}
          showSkip={showSkip}
        />
      </Box>

      {/* 4. Main content stage */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, sm: 5, md: 6 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth={maxWidth} sx={{ width: '100%', px: { xs: 0, sm: 2 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: { xs: '16px', sm: '24px' },
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.07), 0 4px 12px rgba(0, 0, 0, 0.02)',
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


'use client';

import React from 'react';
import { Box, Stack, Typography, LinearProgress, useTheme, useMediaQuery } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

interface EmployerStepperProps {
  activeStep: number;
  steps: string[];
}

export default function EmployerStepper({ activeStep, steps }: EmployerStepperProps) {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const totalSteps = steps.length;
  const progressPercent = ((activeStep + 1) / totalSteps) * 100;

  if (isMobile) {
    return (
      <Box sx={{ mb: 3.5, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {t('employerOnboarding.stepCounter', { current: activeStep + 1, total: totalSteps })}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
            {steps[activeStep] || ''}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4.5, width: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative' }}>
        {/* Background Connecting Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 18,
            left: '5%',
            right: '5%',
            height: 2,
            backgroundColor: '#E2E8F0',
            zIndex: 0,
          }}
        />
        {/* Active Connecting Progress Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 18,
            left: '5%',
            width: `${(activeStep / (totalSteps - 1)) * 90}%`,
            height: 2,
            backgroundColor: '#2563EB',
            transition: 'width 0.3s ease',
            zIndex: 0,
          }}
        />

        {steps.map((stepLabel, index) => {
          const isCompleted = activeStep > index;
          const isActive = activeStep === index;

          return (
            <Stack
              key={stepLabel}
              alignItems="center"
              spacing={1}
              sx={{ zIndex: 1, minWidth: 80, cursor: 'default' }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: isCompleted ? '#10B981' : isActive ? '#2563EB' : '#FFFFFF',
                  color: isCompleted || isActive ? '#FFFFFF' : '#64748B',
                  border: isCompleted
                    ? '2px solid #10B981'
                    : isActive
                    ? '2px solid #2563EB'
                    : '2px solid #CBD5E1',
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(37, 99, 235, 0.15)'
                    : isCompleted
                    ? '0 0 0 4px rgba(16, 185, 129, 0.12)'
                    : 'none',
                }}
              >
                {isCompleted ? <CheckIcon sx={{ fontSize: 20 }} /> : index + 1}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0F172A' : isCompleted ? '#10B981' : '#64748B',
                  textAlign: 'center',
                  maxWidth: 120,
                  lineHeight: 1.2,
                  fontSize: '0.8125rem',
                }}
              >
                {stepLabel}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

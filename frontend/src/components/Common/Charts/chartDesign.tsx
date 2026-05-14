'use client';

import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import pc from '@/utils/muiColors';

type ChartSize = number | string;

type ChartStateProps = {
  height?: ChartSize;
  label?: string;
};

type CartesianOptionsConfig = {
  stacked?: boolean;
  displayLegend?: boolean;
  yStacked?: boolean;
};

const chartSize = (size?: ChartSize) => {
  if (typeof size === 'number') return `${size}px`;
  return size;
};

export const chartColors = {
  navy: '#1a407d',
  deepNavy: '#0f397f',
  sky: '#2aa9e1',
  emerald: '#10b981',
  mint: '#34d399',
  amber: '#f59e0b',
  gold: '#fbbf24',
  red: '#ef4444',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  slate: '#475569',
  grid: '#dbeafe',
  surface: '#ffffff',
} as const;

export const rgba = (hex: string, opacity: number) => {
  const clean = hex.replace('#', '');
  const value = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const chartCardSx: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
  borderRadius: 2,
  boxShadow: (theme) => theme.customShadows?.z1,
  border: '1px solid',
  borderColor: 'divider',
  height: '100%',
  bgcolor: 'background.paper',
  overflow: 'hidden',
};

export const chartTitleSx: SxProps<Theme> = {
  color: 'text.primary',
  fontSize: { xs: '1rem', sm: '1.125rem' },
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1.35,
};

export const chartAreaSx = (height: ChartSize = 320): SxProps<Theme> => ({
  position: 'relative',
  height: chartSize(height),
  minHeight: chartSize(height),
  width: '100%',
});

export const makeVerticalGradient = (topColor: string, bottomColor: string, fallbackColor = topColor) => {
  return (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return fallbackColor;

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    return gradient;
  };
};

export const makeLineFill = (color: string) => {
  return makeVerticalGradient(rgba(color, 0.2), rgba(color, 0.02), rgba(color, 0.08));
};

export const makeBarFill = (color: string) => {
  return makeVerticalGradient(rgba(color, 0.92), rgba(color, 0.58), rgba(color, 0.82));
};

const compactNumber = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value);

const tooltipValue = (context: any) => {
  const parsed = context.parsed;
  if (typeof parsed === 'number') return parsed;
  if (typeof parsed?.y === 'number') return parsed.y;
  if (typeof parsed?.x === 'number') return parsed.x;
  return Number(context.raw ?? 0);
};

export const createCartesianOptions = (theme: Theme, config: CartesianOptionsConfig = {}) => {
  const stacked = config.stacked ?? false;

  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 80,
    animation: {
      duration: 850,
      easing: 'easeOutQuart' as const,
    },
    transitions: {
      active: {
        animation: {
          duration: 220,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    layout: {
      padding: { top: 8, right: 10, bottom: 0, left: 2 },
    },
    plugins: {
      legend: {
        display: config.displayLegend ?? true,
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          padding: 18,
          usePointStyle: true,
          pointStyle: 'circle',
          color: chartColors.slate,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
            weight: 700,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: chartColors.surface,
        titleColor: chartColors.deepNavy,
        bodyColor: chartColors.slate,
        borderColor: rgba(chartColors.navy, 0.12),
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: theme.typography.fontFamily,
          size: 12,
          weight: 800,
        },
        bodyFont: {
          family: theme.typography.fontFamily,
          size: 12,
          weight: 600,
        },
        callbacks: {
          label: (context: any) => {
            const label = context.dataset?.label ? `${context.dataset.label}: ` : '';
            return `${label}${compactNumber(tooltipValue(context))}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked,
        border: { display: false },
        grid: { display: false, drawTicks: false },
        ticks: {
          color: chartColors.slate,
          padding: 10,
          maxRotation: 0,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
            weight: 700,
          },
        },
      },
      y: {
        stacked: config.yStacked ?? stacked,
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: pc.divider(0.48),
          drawTicks: false,
        },
        ticks: {
          color: chartColors.slate,
          padding: 10,
          precision: 0,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
            weight: 700,
          },
          callback: (value: string | number) => compactNumber(Number(value)),
        },
      },
    },
  };
};

export const createDoughnutOptions = (theme: Theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  radius: '90%',
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 900,
    easing: 'easeOutQuart' as const,
  },
  layout: {
    padding: 4,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      align: 'center' as const,
      labels: {
        boxWidth: 8,
        boxHeight: 8,
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        color: chartColors.slate,
        font: {
          family: theme.typography.fontFamily,
          size: 12,
          weight: 700,
        },
      },
    },
    tooltip: {
      backgroundColor: chartColors.surface,
      titleColor: chartColors.deepNavy,
      bodyColor: chartColors.slate,
      borderColor: rgba(chartColors.navy, 0.12),
      borderWidth: 1,
      cornerRadius: 10,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: (context: any) => {
          const value = Number(context.parsed ?? context.raw ?? 0);
          const values = Array.isArray(context.dataset?.data) ? context.dataset.data : [];
          const total = values.reduce((sum: number, item: unknown) => sum + Number(item || 0), 0);
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${context.label}: ${compactNumber(value)} (${percent}%)`;
        },
      },
    },
  },
});

export const ChartLoadingState = ({ height = 320, label }: ChartStateProps) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    spacing={1.5}
    aria-busy="true"
    sx={{
      height: chartSize(height),
      minHeight: chartSize(height),
      borderRadius: 2,
      bgcolor: pc.primaryLight(0.04),
      background: `linear-gradient(180deg, ${pc.primaryLight(0.07)} 0%, ${pc.bgPaper(0.92)} 100%)`,
      border: '1px dashed',
      borderColor: pc.divider(0.75),
    }}
  >
    <Box
      sx={{
        position: 'relative',
        width: 58,
        height: 58,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        bgcolor: pc.bgPaper(0.92),
        boxShadow: `0 12px 28px ${pc.primary(0.12)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: `1px solid ${pc.primaryLight(0.22)}`,
          animation: 'sq-chart-loading-pulse 1.4s ease-in-out infinite',
          animationDuration: '1.4s !important',
          animationIterationCount: 'infinite !important',
        },
        '@keyframes sq-chart-loading-pulse': {
          '0%, 100%': { opacity: 0.35, transform: 'scale(0.92)' },
          '50%': { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      <CircularProgress
        disableShrink
        size={34}
        thickness={4.5}
        sx={{
          color: chartColors.sky,
          animationDuration: '1.4s !important',
          animationIterationCount: 'infinite !important',
        }}
      />
    </Box>
    {label ? (
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0 }}>
        {label}
      </Typography>
    ) : null}
  </Stack>
);

export const ChartEmptyState = ({ height = 320, label }: ChartStateProps) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    spacing={1}
    sx={{
      height: chartSize(height),
      minHeight: chartSize(height),
      bgcolor: pc.actionDisabled(0.05),
      borderRadius: 2,
      border: '1px dashed',
      borderColor: pc.divider(0.8),
    }}
  >
    <InsertChartOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
    {label ? (
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, textAlign: 'center' }}>
        {label}
      </Typography>
    ) : null}
  </Stack>
);

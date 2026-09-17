import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  CircularProgress,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import type { OperationPayload, OperationStatus } from './types';

export interface OperationProgressProps {
  operation?: OperationPayload | null;
  onOpenDetail?: () => void;
  size?: 'sm' | 'md';
  showPercentage?: boolean;
  showCurrentStep?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
}

const STATUS_COLORS: Record<OperationStatus, string> = {
  running: '#2563EB',
  completed: '#10B981',
  failed: '#EF4444',
  queued: '#94A3B8',
  cancelled: '#64748B',
};

export const OperationProgress: React.FC<OperationProgressProps> = ({
  operation,
  onOpenDetail,
  size = 'md',
  showPercentage = true,
  showCurrentStep = true,
  className,
  sx,
}) => {
  const theme = useTheme();

  if (!operation) {
    return null;
  }

  const { status, progress = 0, title, steps = [], currentStepKey } = operation;
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.queued;

  // Resolve current step
  const currentStep =
    (currentStepKey && steps.find((s) => s.key === currentStepKey)) ||
    steps.find((s) => s.status === 'running') ||
    (status === 'completed' ? steps[steps.length - 1] : null);

  const isSmall = size === 'sm';
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const renderStatusIcon = () => {
    const iconSize = isSmall ? 18 : 22;
    switch (status) {
      case 'running':
        return (
          <CircularProgress
            size={isSmall ? 16 : 20}
            thickness={4.5}
            sx={{ color: statusColor, flexShrink: 0 }}
          />
        );
      case 'completed':
        return (
          <CheckCircleRoundedIcon
            sx={{ color: statusColor, fontSize: iconSize, flexShrink: 0 }}
          />
        );
      case 'failed':
        return (
          <ErrorRoundedIcon
            sx={{ color: statusColor, fontSize: iconSize, flexShrink: 0 }}
          />
        );
      case 'cancelled':
        return (
          <CancelRoundedIcon
            sx={{ color: statusColor, fontSize: iconSize, flexShrink: 0 }}
          />
        );
      case 'queued':
      default:
        return (
          <ScheduleRoundedIcon
            sx={{ color: statusColor, fontSize: iconSize, flexShrink: 0 }}
          />
        );
    }
  };

  const getPercentageText = () => {
    if (status === 'completed') {
      return '✓ Hoàn tất';
    }
    return `${clampedProgress}%`;
  };

  return (
    <Box
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 1 : 1.5,
        height: isSmall ? 32 : 40,
        px: isSmall ? 1.25 : 1.75,
        borderRadius: 2,
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.03)',
        border: `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.08)'
        }`,
        maxWidth: '100%',
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      {/* Status Icon */}
      {renderStatusIcon()}

      {/* Title & Current Step Label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant={isSmall ? 'caption' : 'body2'}
          sx={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        {showCurrentStep && currentStep && (
          <Typography
            variant={isSmall ? 'caption' : 'body2'}
            sx={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: 'text.secondary',
              display: { xs: 'none', sm: 'inline' },
              fontWeight: 400,
            }}
          >
            · {currentStep.label}
          </Typography>
        )}
      </Box>

      {/* Mini Progress Bar */}
      <Box
        sx={{
          width: { xs: 50, sm: 80, md: 100 },
          minWidth: 40,
          flexShrink: 0,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={clampedProgress}
          sx={{
            height: isSmall ? 4 : 6,
            borderRadius: 3,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: statusColor,
              transition: 'transform 0.4s ease',
            },
          }}
        />
      </Box>

      {/* Percentage / Status Badge */}
      {showPercentage && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: isSmall ? '0.7rem' : '0.75rem',
            color: statusColor,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {getPercentageText()}
        </Typography>
      )}

      {/* Action / Xem chi tiết */}
      {onOpenDetail && (
        <Button
          size="small"
          variant="text"
          onClick={onOpenDetail}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: isSmall ? 12 : 14 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: isSmall ? '0.75rem' : '0.8125rem',
            px: 0.75,
            py: 0.25,
            minWidth: 'auto',
            whiteSpace: 'nowrap',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          Xem chi tiết
        </Button>
      )}
    </Box>
  );
};

export default OperationProgress;

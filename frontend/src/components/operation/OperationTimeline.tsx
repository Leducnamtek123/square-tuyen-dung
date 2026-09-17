import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Alert,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import dayjs from 'dayjs';
import type { OperationPayload, OperationStatus, OperationStep, OperationStepStatus } from './types';

export interface OperationTimelineProps {
  operation?: OperationPayload | null;
  onRetryStep?: (stepKey: string) => void;
  onRetry?: () => void;
  onOpenDetail?: () => void;
  expandable?: boolean;
  defaultExpanded?: boolean;
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

const STATUS_LABELS: Record<OperationStatus, string> = {
  running: 'Đang thực hiện',
  completed: 'Hoàn tất',
  failed: 'Thất bại',
  queued: 'Đang chờ',
  cancelled: 'Đã hủy',
};

function formatDuration(startedAt?: string | null, completedAt?: string | null): string | null {
  if (!startedAt) return null;
  const start = dayjs(startedAt);
  const end = completedAt ? dayjs(completedAt) : dayjs();
  const diffSec = end.diff(start, 'second');
  if (diffSec < 0) return null;
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const remSec = diffSec % 60;
  return `${mins}m ${remSec}s`;
}

export const OperationTimeline: React.FC<OperationTimelineProps> = ({
  operation,
  onRetryStep,
  onRetry,
  onOpenDetail,
  expandable = false,
  defaultExpanded = true,
  className,
  sx,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  if (!operation) {
    return null;
  }

  const {
    title,
    status,
    progress = 0,
    steps = [],
    createdAt,
    finishedAt,
  } = operation;

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.queued;
  const statusLabel = STATUS_LABELS[status] || status;
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const totalDuration = formatDuration(createdAt, finishedAt);

  const renderStepCircle = (stepStatus: OperationStepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <CheckRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        );
      case 'running':
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              zIndex: 1,
              '@keyframes pulseRing': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.5)',
                },
                '70%': {
                  boxShadow: '0 0 0 8px rgba(37, 99, 235, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)',
                },
              },
              animation: 'pulseRing 1.6s infinite',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#ffffff',
              }}
            />
          </Box>
        );
      case 'failed':
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        );
      case 'skipped':
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 2,
                bgcolor: '#ffffff',
                borderRadius: 1,
              }}
            />
          </Box>
        );
      case 'pending':
      default:
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2px solid #94A3B8',
              bgcolor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              zIndex: 1,
            }}
          />
        );
    }
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {title}
            </Typography>
            <Chip
              size="small"
              label={statusLabel}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                color: statusColor,
                bgcolor: `${statusColor}18`,
                border: `1px solid ${statusColor}33`,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {totalDuration && (
              <Typography variant="caption" color="text.secondary">
                {finishedAt ? `Thời gian: ${totalDuration}` : `Đang chạy: ${totalDuration}`}
              </Typography>
            )}

            {onRetry && status === 'failed' && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={onRetry}
                startIcon={<ReplayRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.25,
                  px: 1,
                }}
              >
                Thử lại
              </Button>
            )}

            {onOpenDetail && (
              <Button
                size="small"
                variant="outlined"
                onClick={onOpenDetail}
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.25,
                  px: 1,
                }}
              >
                Xem chi tiết
              </Button>
            )}

            {expandable && (
              <IconButton
                size="small"
                onClick={() => setExpanded((prev) => !prev)}
                aria-label="toggle expand"
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <ExpandMoreRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Overall progress bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={clampedProgress}
            sx={{
              height: 7,
              borderRadius: 3.5,
              flexGrow: 1,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3.5,
                bgcolor: statusColor,
                transition: 'transform 0.4s ease',
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: statusColor,
              minWidth: 36,
              textAlign: 'right',
            }}
          >
            {clampedProgress}%
          </Typography>
        </Box>
      </Box>

      {/* Stepper Timeline Body */}
      <Collapse in={!expandable || expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}>
          {steps.map((step: OperationStep, index: number) => {
            const isLast = index === steps.length - 1;
            const stepDuration = formatDuration(step.startedAt, step.completedAt);

            return (
              <Box
                key={step.key}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  position: 'relative',
                  minHeight: isLast ? 40 : 64,
                }}
              >
                {/* Left: Circle & Connector */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mr: 2,
                    alignSelf: 'stretch',
                  }}
                >
                  {renderStepCircle(step.status)}
                  {!isLast && (
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        my: 0.5,
                        bgcolor:
                          step.status === 'completed'
                            ? '#10B981'
                            : theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.12)',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  )}
                </Box>

                {/* Right: Step Content */}
                <Box sx={{ flexGrow: 1, pb: isLast ? 0 : 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color:
                          step.status === 'pending'
                            ? 'text.secondary'
                            : 'text.primary',
                      }}
                    >
                      {step.label}
                    </Typography>

                    {stepDuration && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                      >
                        {stepDuration}
                      </Typography>
                    )}
                  </Box>

                  {/* Live Detail text */}
                  {step.detail && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mt: 0.25,
                      }}
                    >
                      {step.detail}
                    </Typography>
                  )}

                  {/* Result Summary */}
                  {step.resultSummary && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'inline-block',
                        mt: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        fontWeight: 600,
                      }}
                    >
                      {step.resultSummary}
                    </Typography>
                  )}

                  {/* Error Message & Retry Step */}
                  {step.errorMessage && (
                    <Box sx={{ mt: 1 }}>
                      <Alert
                        severity="error"
                        action={
                          onRetryStep && (
                            <Button
                              color="inherit"
                              size="small"
                              startIcon={<ReplayRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => onRetryStep(step.key)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            >
                              Thử lại
                            </Button>
                          )
                        }
                        sx={{
                          py: 0.25,
                          px: 1.5,
                          fontSize: '0.8rem',
                          alignItems: 'center',
                        }}
                      >
                        {step.errorMessage}
                      </Alert>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );

  return (
    <Card
      className={className}
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(0, 0, 0, 0.08)',
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'background.paper'
            : '#ffffff',
        ...sx,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        {content}
      </CardContent>
    </Card>
  );
};

export default OperationTimeline;

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Paper,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type { ProgressiveActivityProps } from './types';
import type { StepStatus } from '@/types/exchange';

function getStepIcon(stepStatus: StepStatus) {
  switch (stepStatus) {
    case 'completed':
      return <CheckCircleIcon sx={{ fontSize: 20, color: '#10B981' }} />;
    case 'failed':
      return <ErrorOutlineIcon sx={{ fontSize: 20, color: '#EF4444' }} />;
    case 'running':
      return <CircularProgress size={18} thickness={5} sx={{ color: '#0284C7' }} />;
    case 'pending':
    default:
      return <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />;
  }
}

export const ProgressiveActivity: React.FC<ProgressiveActivityProps> = ({
  steps,
  progress,
  currentStepText,
  status,
  jobId,
  title,
  subtitle,
  totalRows,
  processedRows,
  errorCount,
  elapsedSeconds,
  onCancel,
}) => {
  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds < 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.1rem' }}>
              {title || 'Đang thực hiện tiến trình...'}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {jobId && (
              <Chip
                label={`ID: ${jobId}`}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderColor: '#E5E7EB',
                  color: '#4B5563',
                  backgroundColor: '#F9FAFB',
                }}
              />
            )}
            {elapsedSeconds !== undefined && (
              <Chip
                icon={<TimerOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label={formatTime(elapsedSeconds)}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  borderColor: '#E5E7EB',
                  color: '#6B7280',
                  backgroundColor: '#F9FAFB',
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Global Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
              {currentStepText || 'Đang xử lý...'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: status === 'failed' ? '#EF4444' : '#0284C7',
                fontSize: '0.875rem',
              }}
            >
              {Math.min(100, Math.max(0, Math.round(progress)))}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor:
                  status === 'failed'
                    ? '#EF4444'
                    : status === 'completed'
                    ? '#10B981'
                    : '#0284C7',
                transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              },
            }}
          />
        </Box>

        {/* Metric counters if available */}
        {(totalRows !== undefined || errorCount !== undefined) && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              p: 1.5,
              mb: 3,
              borderRadius: '10px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #F3F4F6',
            }}
          >
            {totalRows !== undefined && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <LayersOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 600 }}>
                  Dữ liệu:{' '}
                  <Box component="span" sx={{ color: '#111827' }}>
                    {processedRows ?? 0} / {totalRows} dòng
                  </Box>
                </Typography>
              </Stack>
            )}

            {errorCount !== undefined && errorCount > 0 && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600 }}>
                  Lỗi phát hiện: {errorCount}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        {/* Sequential Step List */}
        <Stack spacing={1.5} sx={{ pl: 0.5 }}>
          {steps.map((step, index) => {
            const isCurrent = step.status === 'running';
            const isDone = step.status === 'completed';
            const isErr = step.status === 'failed';

            return (
              <Stack
                key={step.id || index}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{
                  p: 1.25,
                  borderRadius: '8px',
                  backgroundColor: isCurrent ? 'rgba(2, 132, 199, 0.05)' : 'transparent',
                  border: isCurrent ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid transparent',
                  transition: 'background-color 200ms ease',
                }}
              >
                <Box sx={{ mt: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getStepIcon(step.status)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                      color: isErr
                        ? '#DC2626'
                        : isCurrent
                        ? '#0369A1'
                        : isDone
                        ? '#1F2937'
                        : '#6B7280',
                      fontSize: '0.875rem',
                    }}
                  >
                    {step.label}
                  </Typography>
                  {step.detail && (
                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 0.25 }}>
                      {step.detail}
                    </Typography>
                  )}
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {/* Cancel button if abortable */}
        {onCancel && status === 'running' && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onCancel}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: '#D1D5DB',
                color: '#4B5563',
              }}
            >
              Hủy tiến trình
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
export default ProgressiveActivity;

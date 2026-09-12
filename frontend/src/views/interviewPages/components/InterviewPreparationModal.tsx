'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  LinearProgress,
  CircularProgress,
  Button,
} from '@mui/material';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { AilaLogo } from '@/components/Common/AilaLogo';

export type PreparationStepStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface PreparationStepState {
  room: PreparationStepStatus;
  script: PreparationStepStatus;
  agent: PreparationStepStatus;
}

export interface InterviewPreparationModalProps {
  open: boolean;
  steps: PreparationStepState;
  progress: number;
  currentMessage: string;
  errorMessage?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  isMock?: boolean;
}

export const InterviewPreparationModal: React.FC<InterviewPreparationModalProps> = ({
  open,
  steps,
  progress,
  currentMessage,
  errorMessage,
  onRetry,
  onCancel,
  isMock = false,
}) => {
  const stepItems = [
    {
      key: 'room',
      title: 'Chuẩn bị phòng phỏng vấn',
      icon: <MeetingRoomOutlinedIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
      status: steps.room,
      pendingText: 'Đang chờ...',
      processingText: 'Đang xử lý...',
      completedText: 'Đã sẵn sàng',
      errorText: 'Lỗi kết nối',
    },
    {
      key: 'script',
      title: 'Chuẩn bị kịch bản phỏng vấn',
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
      status: steps.script,
      pendingText: 'Đang chờ...',
      processingText: 'Đang xử lý...',
      completedText: 'Đã sẵn sàng',
      errorText: 'Lỗi tải kịch bản',
    },
    {
      key: 'agent',
      title: 'Agent tham gia phỏng vấn',
      icon: <AilaLogo size={18} variant="mark" />,
      status: steps.agent,
      pendingText: 'Đang chờ...',
      processingText: 'Đang kết nối...',
      completedText: 'Đã tham gia phòng',
      errorText: 'Lỗi kết nối Agent',
    },
  ];

  const hasError = !!errorMessage || steps.room === 'error' || steps.script === 'error' || steps.agent === 'error';

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: 440,
          m: 2,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          bgcolor: '#ffffff',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      {/* Header with Brand Gradient & AILA Logo */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
          pt: 4,
          pb: 3.5,
          px: 3,
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Centered AILA Badge */}
        <Box
          sx={{
            width: 58,
            height: 58,
            mx: 'auto',
            mb: 2,
            borderRadius: '18px',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          <AilaLogo size={32} variant="mark" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
            mb: 0.75,
            color: '#ffffff',
          }}
        >
          Đang chuẩn bị phòng phỏng vấn
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(239, 246, 255, 0.9)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          Vui lòng chờ trong giây lát...
        </Typography>
      </Box>

      {/* Body: Checklist */}
      <DialogContent sx={{ px: 3, pt: 3, pb: 3.5 }}>
        <Stack spacing={2.25}>
          {stepItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isProcessing = item.status === 'processing';
            const isFailed = item.status === 'error';

            let subtitle = item.pendingText;
            if (isProcessing) subtitle = item.processingText;
            if (isCompleted) subtitle = item.completedText;
            if (isFailed) subtitle = item.errorText;

            return (
              <Box
                key={item.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.25,
                  borderRadius: '16px',
                  bgcolor: isProcessing ? '#f8fafc' : isCompleted ? '#f0fdf4' : 'transparent',
                  border: isProcessing
                    ? '1px solid #e2e8f0'
                    : isCompleted
                    ? '1px solid #dcfce7'
                    : '1px solid transparent',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Left: Icon and Label */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      bgcolor: isCompleted ? '#dcfce7' : '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: isCompleted ? '#15803d' : '#0f172a',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: isCompleted
                          ? '#16a34a'
                          : isProcessing
                          ? '#2563eb'
                          : isFailed
                          ? '#dc2626'
                          : '#94a3b8',
                      }}
                    >
                      {subtitle}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Status Indicator */}
                <Box sx={{ flexShrink: 0, ml: 1.5, display: 'flex', alignItems: 'center' }}>
                  {isProcessing ? (
                    <CircularProgress size={20} sx={{ color: '#2563eb' }} thickness={4.5} />
                  ) : isCompleted ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 22, color: '#16a34a' }} />
                  ) : isFailed ? (
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 22, color: '#dc2626' }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: '#cbd5e1' }} />
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>

        {/* Error Alert if any */}
        {hasError && (
          <Box sx={{ mt: 2.5, p: 1.5, borderRadius: '12px', bgcolor: '#fef2f2', border: '1px solid #fee2e2' }}>
            <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 600, display: 'block', mb: 1.5 }}>
              {errorMessage || 'Đã có lỗi xảy ra trong quá trình chuẩn bị phòng phỏng vấn.'}
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              {onCancel && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onCancel}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: '#64748b',
                    borderColor: '#cbd5e1',
                  }}
                >
                  Đóng
                </Button>
              )}
              {onRetry && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onRetry}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' },
                  }}
                >
                  Thử lại
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {/* Footer: Progress and status text */}
        {!hasError && (
          <Box sx={{ mt: 3.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.25,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {currentMessage}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#2563eb',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, progress))}
              sx={{
                height: 7,
                borderRadius: '999px',
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                  transition: 'transform 0.4s ease',
                },
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InterviewPreparationModal;

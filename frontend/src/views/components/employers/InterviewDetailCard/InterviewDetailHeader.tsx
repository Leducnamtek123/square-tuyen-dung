import React from 'react';
import { alpha, Box, Button, Chip, Stack, Typography, Tooltip, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import type { TFunction } from 'i18next';
import type { InterviewSession } from '../../../../types/models';

type Props = {
  session: InterviewSession;
  effectiveStatus?: string | null;
  canJoinLiveRoom: boolean;
  canObserve: boolean;
  isSessionActive: boolean;
  sseConnected: boolean;
  observerLoading: boolean;
  onBack: () => void;
  onTriggerObserver: () => void;
  onForceEndInterview: () => void;
  onJoinRoom: () => void;
  t: TFunction;
};

const getStatusColor = (status: string | undefined): 'success' | 'primary' | 'error' | 'info' | 'warning' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'cancelled':
      return 'error';
    case 'processing':
      return 'info';
    case 'scheduled':
      return 'warning';
    default:
      return 'default';
  }
};

const InterviewDetailHeader = ({
  session,
  effectiveStatus,
  canJoinLiveRoom,
  canObserve,
  isSessionActive,
  sseConnected,
  observerLoading,
  onBack,
  onTriggerObserver,
  onForceEndInterview,
  onJoinRoom,
  t,
}: Props) => {
  const normalizedStatus = effectiveStatus ?? undefined;
  const themeStatus = getStatusColor(normalizedStatus);
  const statusDefaultValue = effectiveStatus ? effectiveStatus.replaceAll('_', ' ').toUpperCase() : '';
  const statusTranslationKey = effectiveStatus ? `interview:interviewListCard.statuses.${effectiveStatus}` : undefined;

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 5 }}>
        <IconButton
          onClick={onBack}
          sx={{
            color: 'text.secondary',
            bgcolor: alpha('#000', 0.04),
            borderRadius: 1.5,
            '&:hover': { bgcolor: alpha('#1976d2', 0.08), color: 'primary.main' },
            transition: 'all 0.2s',
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="subtitle2"
          onClick={onBack}
          sx={{
            fontWeight: 900,
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {t('interview:interviewDetail.actions.backToList')}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={4} mb={8}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1.5px' }}>
              {t('interview:interviewDetail.title')}
            </Typography>
            <Chip
              label={statusTranslationKey ? t(statusTranslationKey, { defaultValue: statusDefaultValue }) : statusDefaultValue}
              size="small"
              sx={{
                fontWeight: 900,
                borderRadius: 1.5,
                px: 1,
                bgcolor:
                  themeStatus === 'default'
                    ? alpha('#64748b', 0.08)
                    : alpha(`var(--mui-palette-${themeStatus}-main, #64748b)` as any, 0.08),
                color: themeStatus === 'default' ? 'text.secondary' : `${themeStatus}.main`,
                border: '1px solid',
                borderColor:
                  themeStatus === 'default'
                    ? alpha('#64748b', 0.1)
                    : alpha(`var(--mui-palette-${themeStatus}-main, #64748b)` as any, 0.1),
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
              }}
            />
            {isSessionActive && sseConnected && (
              <Chip
                icon={
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: '10px !important',
                      color: '#22c55e !important',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%,100%': { opacity: 1 },
                        '50%': { opacity: 0.3 },
                      },
                    }}
                  />
                }
                label="LIVE"
                size="small"
                sx={{
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  letterSpacing: 1.5,
                  height: 24,
                  bgcolor: alpha('#22c55e', 0.08),
                  color: '#22c55e',
                  border: '1px solid',
                  borderColor: alpha('#22c55e', 0.15),
                }}
              />
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              {t('interview:interviewDetail.label.roomCode')}:
            </Typography>
            <Box sx={{ fontWeight: 900, color: 'primary.main', bgcolor: alpha('#1976d2', 0.06), px: 2, py: 0.75, borderRadius: 1.5, letterSpacing: '1px', fontSize: '0.95rem', border: '1px dashed', borderColor: alpha('#1976d2', 0.2) }}>
              {session.roomName}
            </Box>
            <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600, ml: { sm: 1 } }}>
              ID: <Box component="span" sx={{ color: 'text.secondary', fontWeight: 800 }}>{session.id}</Box>
            </Typography>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          {canObserve && (
            <Tooltip title="Kết thúc ngay lập tức buổi phỏng vấn này" arrow placement="top">
              <Button
                variant="outlined"
                onClick={onForceEndInterview}
                startIcon={<StopCircleIcon />}
                sx={{
                  borderRadius: 3,
                  minWidth: { xs: '100%', sm: 200 },
                  fontWeight: 900,
                  py: 2,
                  px: 3,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderColor: alpha('#ef4444', 0.4),
                  color: 'error.main',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'error.main',
                    bgcolor: alpha('#ef4444', 0.04),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {t('common:actions.stop', { defaultValue: 'Kết thúc' })}
              </Button>
            </Tooltip>
          )}

          {canObserve && (
            <Tooltip title="Quan sát ẩn — ứng viên không biết bạn đang xem" arrow placement="top">
              <Button
                variant="outlined"
                onClick={onTriggerObserver}
                disabled={observerLoading}
                startIcon={<VisibilityOffIcon />}
                sx={{
                  borderRadius: 3,
                  minWidth: { xs: '100%', sm: 200 },
                  fontWeight: 900,
                  py: 2,
                  px: 3,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderColor: alpha('#f59e0b', 0.4),
                  color: 'warning.main',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'warning.main',
                    bgcolor: alpha('#f59e0b', 0.04),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {t('common:actions.observe', { defaultValue: 'Observer Mode' })}
              </Button>
            </Tooltip>
          )}

          <Tooltip title={!canJoinLiveRoom ? t('interview:interviewDetail.tooltips.cannotJoin') : ''} arrow placement="top">
            <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
              <Button
                variant="contained"
                disabled={!canJoinLiveRoom}
                onClick={onJoinRoom}
                startIcon={<PlayCircleOutlineIcon />}
                sx={{
                  borderRadius: 3,
                  minWidth: { xs: '100%', md: 280 },
                  boxShadow: (theme) => theme.customShadows?.primary,
                  fontWeight: 900,
                  py: 2,
                  px: 4,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows?.primary,
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                {t('common:actions.joinNow')}
              </Button>
            </Box>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  );
};

export default InterviewDetailHeader;

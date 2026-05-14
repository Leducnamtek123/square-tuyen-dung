import React from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import type { InterviewSession } from '../../../../types/models';

type Props = {
  session: InterviewSession;
  effectiveStatus?: string | null;
  canJoinLiveRoom: boolean;
  canObserve: boolean;
  isSessionActive: boolean;
  sseConnected: boolean;
  observerLoading: boolean;
  joinLoading?: boolean;
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
    case 'interrupted':
      return 'warning';
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

const statusChipColors: Record<string, { bg: string; border: string }> = {
  success: { bg: pc.success(0.08), border: pc.success(0.18) },
  primary: { bg: pc.primary(0.08), border: pc.primary(0.16) },
  error: { bg: pc.error(0.08), border: pc.error(0.16) },
  info: { bg: pc.info(0.08), border: pc.info(0.16) },
  warning: { bg: pc.warning(0.08), border: pc.warning(0.18) },
  default: { bg: pc.actionDisabled(0.12), border: pc.divider(0.7) },
};

const InterviewDetailHeader = ({
  session,
  effectiveStatus,
  canJoinLiveRoom,
  canObserve,
  isSessionActive,
  sseConnected,
  observerLoading,
  joinLoading = false,
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
  const isInterrupted = normalizedStatus === 'interrupted';
  const chipColors = statusChipColors[themeStatus] ?? statusChipColors.default;
  const subtitle = [session.candidateName, session.jobName].filter(Boolean).join(' | ');

  const actionButtonSx = {
    borderRadius: 2,
    minHeight: 42,
    px: 2,
    fontWeight: 800,
    textTransform: 'none',
    fontSize: '0.9rem',
    boxShadow: 'none',
    whiteSpace: 'nowrap',
  } as const;

  return (
    <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton
          onClick={onBack}
          size="small"
          sx={{
            width: 34,
            height: 34,
            color: 'text.secondary',
            bgcolor: pc.primary(0.05),
            
            border: '1px solid',
            borderColor: pc.primary(0.08),
            '&:hover': { bgcolor: pc.primary(0.1), color: 'primary.main' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          onClick={onBack}
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {t('interview:interviewDetail.actions.backToList')}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'flex-end' }}
        spacing={2.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25, flexWrap: 'wrap' }}>
            <Chip
              label={statusTranslationKey ? t(statusTranslationKey, { defaultValue: statusDefaultValue }) : statusDefaultValue}
              size="small"
              sx={{
                height: 26,
                fontWeight: 800,
                borderRadius: 1.5,
                px: 0.5,
                bgcolor: chipColors.bg,
                color: themeStatus === 'default' ? 'text.secondary' : `${themeStatus}.main`,
                border: '1px solid',
                borderColor: chipColors.border,
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                letterSpacing: 0,
              }}
            />
            {isInterrupted && (
              <Chip
                label={t('interview:interviewDetail.status.interruptedResume', { defaultValue: 'Interrupted, can resume' })}
                size="small"
                sx={{
                  height: 26,
                  fontWeight: 800,
                  borderRadius: 1.5,
                  bgcolor: pc.warning(0.08),
                  color: 'warning.main',
                  border: '1px solid',
                  borderColor: pc.warning(0.18),
                  fontSize: '0.72rem',
                  letterSpacing: 0,
                }}
              />
            )}
            {isSessionActive && sseConnected && (
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: '9px !important', color: '#22c55e !important' }} />}
                label={t('employer:interviewLive.candidateCard.live')}
                size="small"
                sx={{
                  height: 26,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: 0,
                  bgcolor: pc.success(0.08),
                  color: 'success.main',
                  border: '1px solid',
                  borderColor: pc.success(0.18),
                }}
              />
            )}
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: 0, mb: 0.75 }}>
            {t('interview:interviewDetail.title')}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650, mb: 1.75 }}>
              {subtitle}
            </Typography>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {t('interview:interviewDetail.label.roomCode')}
            </Typography>
            <Box
              sx={{
                fontWeight: 850,
                color: 'primary.main',
                bgcolor: pc.primary(0.06),
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                fontSize: '0.9rem',
                border: '1px solid',
                borderColor: pc.primary(0.14),
                letterSpacing: 0,
              }}
            >
              {session.roomName}
            </Box>
            <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 650 }}>
              ID: <Box component="span" sx={{ color: 'text.secondary', fontWeight: 800 }}>{session.id}</Box>
            </Typography>
          </Stack>

          {isInterrupted && (
            <Typography variant="body2" sx={{ mt: 1.5, color: 'warning.main', fontWeight: 650 }}>
              {t('interview:interviewDetail.messages.interruptedResumeHint', {
                defaultValue: 'The interview was interrupted. The candidate may return shortly to continue.',
              })}
            </Typography>
          )}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          {canObserve && (
            <Tooltip title={t('interview:interviewDetail.tooltips.forceEndNow')} arrow placement="top">
              <Button
                variant="outlined"
                onClick={onForceEndInterview}
                startIcon={<StopCircleIcon />}
                sx={{
                  ...actionButtonSx,
                  minWidth: { xs: '100%', sm: 118 },
                  borderColor: pc.error(0.28),
                  color: 'error.main',
                  '&:hover': {
                    borderColor: 'error.main',
                    bgcolor: pc.error(0.04),
                    boxShadow: 'none',
                  },
                }}
              >
                {t('common:actions.stop')}
              </Button>
            </Tooltip>
          )}

          {canObserve && (
            <Tooltip title={t('interview:interviewDetail.tooltips.observeHidden', { defaultValue: 'Observe silently' })} arrow placement="top">
              <Button
                variant="outlined"
                onClick={onTriggerObserver}
                disabled={observerLoading}
                startIcon={<VisibilityOffIcon />}
                sx={{
                  ...actionButtonSx,
                  minWidth: { xs: '100%', sm: 128 },
                  borderColor: pc.warning(0.3),
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.main',
                    bgcolor: pc.warning(0.04),
                    boxShadow: 'none',
                  },
                }}
              >
                {t('common:actions.observe')}
              </Button>
            </Tooltip>
          )}

          <Tooltip title={!canJoinLiveRoom ? t('interview:interviewDetail.tooltips.cannotJoin') : ''} arrow placement="top">
            <Box sx={{ width: { xs: '100%', lg: 'auto' } }}>
              <Button
                variant="contained"
                disabled={!canJoinLiveRoom || joinLoading}
                onClick={onJoinRoom}
                startIcon={joinLoading ? undefined : <PlayCircleOutlineIcon />}
                sx={{
                  ...actionButtonSx,
                  minWidth: { xs: '100%', lg: 180 },
                  px: 2.5,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 'none',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                {joinLoading ? t('interview:interviewDetail.actions.joinAsHrLoading') : t('common:actions.joinNow')}
              </Button>
            </Box>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};

export default InterviewDetailHeader;

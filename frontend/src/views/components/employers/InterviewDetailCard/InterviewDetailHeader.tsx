import React, { useState } from 'react';
import { Avatar, Box, Button, Chip, IconButton, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import type { InterviewSession } from '@/types/models';
import { ProductTourTrigger } from '@/components/Features/ProductTour';
import toastMessages from '@/utils/toastMessages';

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

const statusChipColors: Record<string, { bg: string; border: string; color: string }> = {
  success: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)', color: '#16a34a' },
  primary: { bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.25)', color: '#2563eb' },
  error: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)', color: '#dc2626' },
  info: { bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.25)', color: '#0284c7' },
  warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', color: '#d97706' },
  default: { bg: 'rgba(100, 116, 139, 0.08)', border: 'rgba(100, 116, 139, 0.25)', color: '#475569' },
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
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const normalizedStatus = effectiveStatus ?? undefined;
  const themeStatus = getStatusColor(normalizedStatus);
  const statusTranslationKey = effectiveStatus ? `interview:interviewListCard.statuses.${effectiveStatus}` : undefined;
  const isInterrupted = normalizedStatus === 'interrupted';
  const chipColors = statusChipColors[themeStatus] ?? statusChipColors.default;

  const handleCopyRoom = async () => {
    const roomCode = session?.roomName || String(session?.id ?? '');
    if (!roomCode) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        toastMessages.success(t('common:messages.copied', { defaultValue: 'Đã sao chép mã phòng!' }));
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const getCandidateInitials = (name?: string | null) => {
    if (!name) return 'UV';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'UV';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase() || 'UV';
    return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || 'UV';
  };

  return (
    <Box
      sx={{
        mb: 3.5,
        p: { xs: 2.5, md: 3 },
        bgcolor: 'background.paper',
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Navigation Row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            aria-label="Quay lại danh sách"
            onClick={onBack}
            size="small"
            sx={{
              width: 36,
              height: 36,
              color: 'text.secondary',
              bgcolor: '#F1F5F9',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: pc.primary(0.08),
                color: 'primary.main',
                borderColor: pc.primary(0.2),
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="body2"
              onClick={onBack}
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                cursor: 'pointer',
                transition: 'color 0.15s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {t('interview:interviewDetail.actions.backToList')}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              /
            </Typography>
            <Chip
              label={`#IV-${session.id}`}
              size="small"
              sx={{
                height: 22,
                fontWeight: 800,
                fontSize: '0.6875rem',
                borderRadius: '6px',
                bgcolor: '#F1F5F9',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          </Stack>
        </Stack>

        <ProductTourTrigger tourKey="employer_interview_detail" variant="chip" label="Hướng dẫn báo cáo" />
      </Stack>

      {/* Main Dossier Header: Avatar + Meta + Action CTAs */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={3}
      >
        {/* Left: Avatar + Candidate Identity */}
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            sx={{
              width: { xs: 56, sm: 68 },
              height: { xs: 56, sm: 68 },
              borderRadius: 3,
              fontWeight: 900,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              bgcolor: 'primary.main',
              color: '#FFFFFF',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.25)',
              border: '2px solid #FFFFFF',
              flexShrink: 0,
            }}
          >
            {getCandidateInitials(session.candidateName)}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            {/* Badges Bar */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75, flexWrap: 'wrap', gap: 0.75 }}>
              <Chip
                label={statusTranslationKey ? t(statusTranslationKey) : ''}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 800,
                  borderRadius: 1.5,
                  px: 0.5,
                  bgcolor: chipColors.bg,
                  color: chipColors.color,
                  border: '1px solid',
                  borderColor: chipColors.border,
                  textTransform: 'uppercase',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.04em',
                }}
              />

              {session.isLive ? (
                <Chip
                  icon={<VideoCameraFrontOutlinedIcon sx={{ fontSize: '14px !important', color: '#2563eb !important' }} />}
                  label="Phỏng vấn Trực tiếp"
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                    border: '1px solid',
                    borderColor: 'rgba(37, 99, 235, 0.18)',
                    fontSize: '0.72rem',
                  }}
                />
              ) : (
                <Chip
                  icon={<SmartToyOutlinedIcon sx={{ fontSize: '14px !important', color: '#6366f1 !important' }} />}
                  label="Phỏng vấn AI Voice"
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    color: '#6366f1',
                    border: '1px solid',
                    borderColor: 'rgba(99, 102, 241, 0.18)',
                    fontSize: '0.72rem',
                  }}
                />
              )}

              {isSessionActive && sseConnected && (
                <Chip
                  icon={
                    <FiberManualRecordIcon
                      sx={{
                        fontSize: '9px !important',
                        color: '#22c55e !important',
                        animation: 'headerLivePulse 2s infinite',
                        '@keyframes headerLivePulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                      }}
                    />
                  }
                  label={t('employer:interviewLive.candidateCard.live')}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(34, 197, 94, 0.08)',
                    color: '#16a34a',
                    border: '1px solid',
                    borderColor: 'rgba(34, 197, 94, 0.25)',
                  }}
                />
              )}

              {isInterrupted && (
                <Chip
                  label={t('interview:interviewDetail.status.interruptedResume')}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 800,
                    borderRadius: 1.5,
                    bgcolor: pc.warning(0.08),
                    color: 'warning.main',
                    border: '1px solid',
                    borderColor: pc.warning(0.2),
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Stack>

            {/* Candidate Name */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 850,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                mb: 0.5,
                fontSize: { xs: '1.35rem', sm: '1.65rem' },
              }}
            >
              {session.candidateName || t('interview:interviewDetail.title')}
            </Typography>

            {/* Job Title & Room Code Snippet */}
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
              {session.jobName && (
                <Stack direction="row" alignItems="center" spacing={0.6}>
                  <WorkOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {session.jobName}
                  </Typography>
                </Stack>
              )}

              {session.roomName && (
                <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép mã phòng'} arrow placement="top">
                  <Box
                    onClick={handleCopyRoom}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.6,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1.5,
                      bgcolor: '#F8FAFC',
                      border: '1px dashed',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: pc.primary(0.05), borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      Phòng: {session.roomName}
                    </Typography>
                    {copied ? (
                      <CheckIcon sx={{ fontSize: 13, color: 'success.main' }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    )}
                  </Box>
                </Tooltip>
              )}
            </Stack>

            {isInterrupted && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'warning.main', fontWeight: 700 }}>
                {t('interview:interviewDetail.messages.interruptedResumeHint')}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Right: High-Hierarchy Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems="center"
          sx={{ width: { xs: '100%', lg: 'auto' }, flexShrink: 0 }}
        >
          {canObserve && (
            <Tooltip title={t('interview:interviewDetail.tooltips.forceEndNow')} arrow placement="top">
              <Button
                variant="outlined"
                onClick={onForceEndInterview}
                startIcon={<StopCircleIcon />}
                sx={{
                  borderRadius: 2.5,
                  minHeight: 44,
                  px: 2,
                  fontWeight: 750,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  borderColor: alpha(theme.palette.error.main, 0.25),
                  color: 'error.main',
                  bgcolor: alpha(theme.palette.error.main, 0.03),
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: 'error.main',
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                {t('common:actions.stop')}
              </Button>
            </Tooltip>
          )}

          {canObserve && (
            <Tooltip title={t('interview:interviewDetail.tooltips.observeHidden')} arrow placement="top">
              <Button
                variant="outlined"
                onClick={onTriggerObserver}
                disabled={observerLoading}
                startIcon={<VisibilityOffIcon />}
                sx={{
                  borderRadius: 2.5,
                  minHeight: 44,
                  px: 2.25,
                  fontWeight: 750,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  bgcolor: '#FFFFFF',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: pc.primary(0.03),
                  },
                }}
              >
                {t('common:actions.observe')}
              </Button>
            </Tooltip>
          )}

          <Tooltip title={!canJoinLiveRoom ? t('interview:interviewDetail.tooltips.cannotJoin') : ''} arrow placement="top">
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                disabled={!canJoinLiveRoom || joinLoading}
                onClick={onJoinRoom}
                startIcon={joinLoading ? undefined : <PlayCircleOutlineIcon />}
                sx={{
                  borderRadius: 2.5,
                  minHeight: 44,
                  minWidth: { xs: '100%', sm: 190 },
                  px: 3,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  letterSpacing: '0.01em',
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.45)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                    boxShadow: 'none',
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


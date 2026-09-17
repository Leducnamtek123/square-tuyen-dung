import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { useTranslation } from 'react-i18next';
import { type InterviewSession } from '@/types/models';
import { ElapsedTimer, LiveObserverVisualizer, normalizeStatus } from './InterviewLiveCandidateCardPresence';
import { AIInterviewLayout } from '@/views/interviewPages/AIInterviewLayout';
import { InterviewRecordingBadge } from '@/views/interviewPages/components/InterviewRecordingBadge';
import employerAiSettingService from '@/services/employerAiSettingService';
import pc from '@/utils/muiColors';

type Props = {
  session: InterviewSession;
  connectionDetails: { token: string; serverUrl: string } | null;
  loadingToken: boolean;
  tokenError: string | null;
  isForceEnding: boolean;
  fullscreenOpen: boolean;
  isLive: boolean;
  hrPresenceDetails: { token: string; serverUrl: string } | null;
  hrPresenceLoading: boolean;
  onForceEnd: (session: InterviewSession) => void;
  onOpenFullscreen: () => void;
  onCloseFullscreen: () => void;
  onJoinAsHR: () => void;
  onLeaveHR: () => void;
};

const InterviewLiveCandidateCardPanel = ({
  session,
  connectionDetails,
  loadingToken,
  tokenError,
  isForceEnding,
  fullscreenOpen,
  isLive,
  hrPresenceDetails,
  hrPresenceLoading,
  onForceEnd,
  onOpenFullscreen,
  onCloseFullscreen,
  onJoinAsHR,
  onLeaveHR,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const normalizedStatus = normalizeStatus(session.status);
  const statusLabel = normalizedStatus ? t(`interview:interviewListCard.statuses.${normalizedStatus}`) : '';

  // -- Fullscreen HR Presence dialog ------------------------------------------
  if (hrPresenceDetails) {
    return (
      <Dialog
        open={true}
        onClose={onLeaveHR}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#020617',
            backgroundImage: 'radial-gradient(circle at top, rgba(56,189,248,0.08), transparent 60%)',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100dvh' }}>
          <Box
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: { xs: 1.25, sm: 2 },
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(10,14,26,0.86)',
              backdropFilter: 'blur(8px)',
              gap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t('employer:interviewLive.candidateCard.presenceTitle')}: {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.55)',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {t('employer:interviewLive.candidateCard.presenceSubtitle')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" sx={{ flexShrink: 0 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <InterviewRecordingBadge />
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CloseIcon />}
                onClick={onLeaveHR}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  color: '#f87171',
                  borderColor: 'rgba(248,113,113,0.4)',
                  borderRadius: '10px',
                  px: { xs: 1.25, sm: 2 },
                  minHeight: { xs: 36, sm: 32 },
                }}
              >
                {t('employer:interviewLive.candidateCard.presenceExit')}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <LiveKitRoom
              token={hrPresenceDetails.token}
              serverUrl={hrPresenceDetails.serverUrl}
              connect={true}
              audio={false}
              video={false}
              onDisconnected={onLeaveHR}
              style={{ height: '100%', width: '100%' }}
            >
              <AIInterviewLayout
                onEndSession={onLeaveHR}
                avatarId={employerAiSettingService.resolveActiveAvatarId()}
                avatarImageUrl={employerAiSettingService.resolveActiveAvatarUrl()}
                avatarBackgroundUrl={employerAiSettingService.resolveActiveBackgroundUrl()}
                interviewerName={employerAiSettingService.getSettings().interviewerName}
              />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Studio Viewport Screen */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 260, sm: 280 },
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#080c14',
          border: '1px solid #1a2234',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 24px -4px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Top Floating Telemetry Overlay inside Viewport */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.35,
              borderRadius: '6px',
              bgcolor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: isLive ? '#34d399' : '#94a3b8',
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}
          >
            <FiberManualRecordIcon
              sx={{
                fontSize: 8,
                color: isLive ? '#10b981' : '#64748b',
                animation: isLive ? 'radarPulse 1.5s infinite' : 'none',
              }}
            />
            {isLive ? 'LIVE FEED' : 'STANDBY'}
          </Box>

          {connectionDetails && (
            <Tooltip title={t('employer:interviewLive.candidateCard.maximize')} arrow>
              <IconButton
                size="small"
                onClick={onOpenFullscreen}
                sx={{
                  pointerEvents: 'auto',
                  bgcolor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  width: 28,
                  height: 28,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'rgba(37, 99, 235, 0.9)',
                    borderColor: '#3b82f6',
                  },
                }}
              >
                <FullscreenIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Video Canvas / Live Content / Smart Standby */}
        {loadingToken ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <CircularProgress size={28} thickness={4} sx={{ color: '#3b82f6' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {t('employer:interviewLive.candidateCard.connecting')}
            </Typography>
          </Box>
        ) : tokenError ? (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Alert
              severity="warning"
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              {tokenError}
            </Alert>
          </Box>
        ) : connectionDetails ? (
          <LiveKitRoom
            token={connectionDetails.token}
            serverUrl={connectionDetails.serverUrl}
            connect={isLive}
            audio={false}
            video={false}
            style={{ width: '100%', height: '100%' }}
          >
            <LiveObserverVisualizer compact />
          </LiveKitRoom>
        ) : (
          /* Smart Standby State */
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 50% 35%, rgba(37, 99, 235, 0.14) 0%, #080c14 70%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2.5,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                bgcolor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  animation: 'radarPulse 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                },
                '@keyframes radarPulse': {
                  '0%': { transform: 'scale(0.8)', opacity: 1 },
                  '100%': { transform: 'scale(1.8)', opacity: 0 },
                },
              }}
            >
              <VideocamOutlinedIcon sx={{ fontSize: 24, color: '#60a5fa' }} />
            </Box>

            <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em', textAlign: 'center' }}>
              {t('employer:interviewLive.candidateCard.waitingSignal', 'Đang chờ tín hiệu...')}
            </Typography>

            <Typography variant="caption" sx={{ color: '#94a3b8', maxWidth: 360, textAlign: 'center', lineHeight: 1.5, mb: 2, fontSize: '0.78rem' }}>
              {t('employer:interviewLive.candidateCard.waitingSignalHint', 'Khi ứng viên bật camera hoặc mic, preview sẽ hiện ở đây')}
            </Typography>

            {/* Live Telemetry Status Chips */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                Camera: Chờ mở
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                Micrô: Chờ mở
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '6px',
                  bgcolor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#34d399',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                Phòng AI: Sẵn sàng
              </Box>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Card Action Controls */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Tooltip title={t('employer:interviewLive.candidateCard.joinPresenceTooltip', 'Vào phòng với tư cách Nhà tuyển dụng - ứng viên sẽ thấy bạn')} arrow>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={hrPresenceLoading ? <CircularProgress size={15} color="inherit" /> : <MeetingRoomIcon sx={{ fontSize: 16 }} />}
                onClick={onJoinAsHR}
                disabled={hrPresenceLoading || !isLive}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  borderRadius: '9px',
                  bgcolor: '#2563eb',
                  px: 1.75,
                  py: 0.65,
                  minHeight: 34,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' },
                }}
              >
                {hrPresenceLoading
                  ? t('employer:interviewLive.candidateCard.joinPresenceLoading', 'Đang kết nối...')
                  : t('employer:interviewLive.candidateCard.joinPresence', 'Tham gia phòng')}
              </Button>
            </span>
          </Tooltip>

          {connectionDetails && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<FullscreenIcon sx={{ fontSize: 17 }} />}
              onClick={onOpenFullscreen}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: '9px',
                color: '#1e293b',
                borderColor: '#cbd5e1',
                bgcolor: '#ffffff',
                px: 1.75,
                py: 0.65,
                minHeight: 34,
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc',
                  boxShadow: 'none',
                },
              }}
            >
              {t('employer:interviewLive.candidateCard.maximize', 'Phóng to')}
            </Button>
          )}
        </Stack>

        {normalizedStatus === 'in_progress' && (
          <Tooltip title="Kết thúc buổi phỏng vấn của ứng viên này" arrow>
            <span>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={isForceEnding ? <CircularProgress size={14} color="inherit" /> : <StopCircleIcon sx={{ fontSize: 16 }} />}
                onClick={() => onForceEnd(session)}
                disabled={isForceEnding}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '9px',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  px: 1.5,
                  py: 0.65,
                  minHeight: 34,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.06)',
                    borderColor: '#ef4444',
                    color: '#dc2626',
                  },
                }}
              >
                {t('employer:interviewLive.candidateCard.end', 'Kết thúc')}
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>

      {/* Fullscreen Observer Dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={onCloseFullscreen}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#020617',
            backgroundImage: 'radial-gradient(circle at top, rgba(56,189,248,0.08), transparent 60%)',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100dvh' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(10,14,26,0.86)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 900 }}>
                {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                {session.jobName || 'N/A'} · {statusLabel}
              </Typography>
            </Box>
            <IconButton aria-label="Đóng" onClick={onCloseFullscreen} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, p: 3, minHeight: 0 }}>
            {connectionDetails ? (
              <LiveKitRoom token={connectionDetails.token} serverUrl={connectionDetails.serverUrl} connect={isLive} audio={false} video={false}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.6fr) minmax(320px, 0.8fr)' }, gap: 2, height: '100%' }}>
                  <Paper elevation={0} sx={{ minHeight: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', bgcolor: '#020617' }}>
                    <LiveObserverVisualizer compact={false} />
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(15,23,42,0.9)', overflow: 'auto' }}>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900, mb: 2 }}>
                      {t('employer:interviewLive.candidateCard.liveSession')}
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.candidate')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.position')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.jobName || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.room')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {isLive ? 'Trực tuyến (Live)' : 'Phòng phỏng vấn AI'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.time')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          <ElapsedTimer startTime={session.startTime} />
                        </Typography>
                      </Box>
                      {normalizedStatus === 'in_progress' && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={isForceEnding ? <CircularProgress size={14} color="inherit" /> : <StopCircleIcon />}
                          onClick={() => onForceEnd(session)}
                          disabled={isForceEnding}
                          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px' }}
                        >
                          {t('employer:interviewLive.candidateCard.endSession')}
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              </LiveKitRoom>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>{t('employer:interviewLive.candidateCard.noConnectionDetails')}</Alert>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InterviewLiveCandidateCardPanel;

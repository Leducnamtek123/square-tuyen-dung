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
import { type InterviewSession } from '../../../../types/models';
import { ElapsedTimer, LiveObserverVisualizer, normalizeStatus } from './InterviewLiveCandidateCardPresence';
import { AIInterviewLayout } from '../../../interviewPages/AIInterviewLayout';
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

  // ── Fullscreen HR Presence dialog ──────────────────────────────────────────
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
                {t('employer:interviewLive.candidateCard.presenceTitle')}: {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                {t('employer:interviewLive.candidateCard.presenceSubtitle')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CloseIcon />}
              onClick={onLeaveHR}
              sx={{ textTransform: 'none', fontWeight: 800, color: '#f87171', borderColor: 'rgba(248,113,113,0.4)', borderRadius: '10px' }}
            >
              {t('employer:interviewLive.candidateCard.presenceExit')}
            </Button>
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
              <AIInterviewLayout onEndSession={onLeaveHR} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Box
        sx={{
          borderRadius: 3.5,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#38BDF8', 0.15),
          bgcolor: '#0B1120',
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.12) 0%, rgba(2,6,23,0.95) 75%)',
          minHeight: 280,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Floating Mini-Action Bar */}
        <Box
          sx={{
            p: 1.75,
            borderBottom: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.06)',
            bgcolor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              icon={
                <FiberManualRecordIcon
                  sx={{
                    fontSize: '9px !important',
                    color: isLive ? '#22c55e !important' : '#94a3b8 !important',
                    animation: isLive ? 'radarPulse 1.5s infinite' : 'none',
                    '@keyframes radarPulse': {
                      '0%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.35)', opacity: 0.5 },
                      '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                  }}
                />
              }
              label={isLive ? t('employer:interviewLive.candidateCard.live') : statusLabel || 'Chờ bắt đầu'}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                height: 26,
                borderRadius: '8px',
                bgcolor: isLive ? alpha('#22c55e', 0.12) : 'rgba(255,255,255,0.06)',
                color: isLive ? '#4ade80' : 'rgba(255,255,255,0.75)',
                border: '1px solid',
                borderColor: isLive ? alpha('#22c55e', 0.3) : 'rgba(255,255,255,0.1)',
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={t('employer:interviewLive.candidateCard.joinPresenceTooltip')} arrow>
              <span>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<MeetingRoomIcon sx={{ fontSize: 16 }} />}
                  onClick={onJoinAsHR}
                  disabled={hrPresenceLoading || !isLive}
                  sx={{
                    fontWeight: 750,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    bgcolor: '#0284c7',
                    color: '#ffffff',
                    px: 1.75,
                    py: 0.6,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0369a1', boxShadow: 'none' },
                  }}
                >
                  {hrPresenceLoading
                    ? t('employer:interviewLive.candidateCard.joinPresenceLoading')
                    : t('employer:interviewLive.candidateCard.joinPresence')}
                </Button>
              </span>
            </Tooltip>

            {connectionDetails && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<FullscreenIcon sx={{ fontSize: 16 }} />}
                onClick={onOpenFullscreen}
                sx={{
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.85)',
                  borderColor: 'rgba(255,255,255,0.18)',
                  px: 1.5,
                  py: 0.6,
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    bgcolor: 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                {t('employer:interviewLive.candidateCard.maximize')}
              </Button>
            )}

            {normalizedStatus === 'in_progress' && (
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<StopCircleIcon sx={{ fontSize: 16 }} />}
                onClick={() => onForceEnd(session)}
                disabled={isForceEnding}
                sx={{
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  color: '#f87171',
                  px: 1.5,
                  '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
                }}
              >
                {t('employer:interviewLive.candidateCard.end')}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Video Canvas / Live Content / Smart Standby */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {loadingToken ? (
            <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center' }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={32} thickness={4} sx={{ color: '#38bdf8' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                  {t('employer:interviewLive.candidateCard.connecting')}
                </Typography>
              </Stack>
            </Box>
          ) : tokenError ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="warning" sx={{ borderRadius: 2.5 }}>{tokenError}</Alert>
            </Box>
          ) : connectionDetails ? (
            <LiveKitRoom token={connectionDetails.token} serverUrl={connectionDetails.serverUrl} connect={isLive} audio={false} video={false}>
              <LiveObserverVisualizer compact />
            </LiveKitRoom>
          ) : (
            /* Smart Standby State */
            <Box
              sx={{
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
                position: 'relative',
              }}
            >
              {/* Animated Radar Pulse Core */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: alpha('#38BDF8', 0.1),
                  border: '1px solid',
                  borderColor: alpha('#38BDF8', 0.3),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    animation: 'radarRing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  },
                  '@keyframes radarRing': {
                    '0%': { transform: 'scale(0.8)', opacity: 1 },
                    '100%': { transform: 'scale(1.8)', opacity: 0 },
                  },
                }}
              >
                <VideocamOutlinedIcon sx={{ fontSize: 28, color: '#38BDF8' }} />
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, letterSpacing: '-0.01em', mb: 0.5 }}>
                Đang chờ tín hiệu phòng phỏng vấn
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', maxWidth: 360, lineHeight: 1.6, display: 'block' }}>
                Hệ thống sẽ tự động bắt sóng và truyền hình ảnh/âm thanh khi ứng viên tham gia vào phòng phỏng vấn.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>
                          {session.roomName || 'N/A'}
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
                          startIcon={<StopCircleIcon />}
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

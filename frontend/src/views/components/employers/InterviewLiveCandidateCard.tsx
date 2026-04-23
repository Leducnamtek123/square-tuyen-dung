'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PersonIcon from '@mui/icons-material/Person';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import WorkIcon from '@mui/icons-material/Work';
import { useTranslation } from 'react-i18next';
import { LiveKitRoom, BarVisualizer, VideoTrack, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

import interviewService from '../../../services/interviewService';
import { type InterviewSession } from '../../../types/models';

const ACTIVE_STATUSES = new Set(['in_progress', 'calibration', 'connecting', 'active']);
const normalizeStatus = (status: string) => status.trim().toLowerCase();

const getSafeLiveKitUrl = () => {
  if (typeof window === 'undefined') return '';

  const envUrl = (process.env.NEXT_PUBLIC_LIVEKIT_URL || '').trim();
  if (envUrl.startsWith('wss://')) {
    return envUrl.replace(/\/$/, '');
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;

  if (envUrl && (envUrl.startsWith('http') || envUrl.startsWith('ws'))) {
    try {
      const url = new URL(envUrl);
      url.protocol = protocol;
      return url.toString().replace(/\/$/, '');
    } catch {
      // fall through to proxy path
    }
  }

  const path = envUrl && envUrl.startsWith('/') ? envUrl : (envUrl || '/livekit');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${protocol}//${host}${cleanPath}`.replace(/\/$/, '');
};

const getStatusColor = (status: string): 'success' | 'primary' | 'info' | 'error' | 'warning' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
    case 'calibration':
    case 'connecting':
    case 'active':
      return 'primary';
    case 'scheduled':
      return 'info';
    case 'processing':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const formatElapsed = (startTime: string | null | undefined) => {
  if (!startTime) return '--:--';
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ElapsedTimer: React.FC<{ startTime: string | null | undefined }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(() => formatElapsed(startTime));

  useEffect(() => {
    if (!startTime) {
      setElapsed('--:--');
      return;
    }
    const update = () => setElapsed(formatElapsed(startTime));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 900,
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: 'primary.main',
        letterSpacing: 1,
      }}
    >
      {elapsed}
    </Typography>
  );
};

const LiveObserverVisualizer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const audioTracks = useTracks([Track.Source.Microphone]);
  const videoTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);
  const minHeight = compact ? 220 : 360;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        position: 'relative',
      }}
    >
      {screenTracks.length > 0 && (
        <Box
          sx={{
            width: '100%',
            flex: 1,
            minHeight,
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha('#22c55e', 0.25),
            bgcolor: '#000',
          }}
        >
          <VideoTrack
            trackRef={screenTracks[0]}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <Chip
            label="SCREEN"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 900,
              fontSize: '0.6rem',
              letterSpacing: 1,
              bgcolor: alpha('#22c55e', 0.9),
              color: '#fff',
              height: 22,
            }}
          />
        </Box>
      )}

      {videoTracks.length > 0 ? (
        <Box
          sx={{
            width: screenTracks.length > 0 ? 180 : '100%',
            height: screenTracks.length > 0 ? 135 : minHeight,
            maxHeight: screenTracks.length > 0 ? 135 : minHeight,
            position: screenTracks.length > 0 ? 'absolute' : 'relative',
            bottom: screenTracks.length > 0 ? 16 : 'auto',
            right: screenTracks.length > 0 ? 16 : 'auto',
            zIndex: 2,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha('#a855f7', 0.35),
            boxShadow: screenTracks.length > 0 ? '0 8px 32px rgba(0,0,0,0.45)' : 'none',
            bgcolor: '#000',
          }}
        >
          <VideoTrack
            trackRef={videoTracks[0]}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ) : audioTracks.length > 0 ? (
        <Stack spacing={1.5} alignItems="center" sx={{ py: 2 }}>
          <Box sx={{ height: 92, width: '100%', maxWidth: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarVisualizer barCount={15} style={{ height: '60px', width: '200px' }} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#22c55e',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FiberManualRecordIcon sx={{ fontSize: 8, animation: 'pulse 1.5s infinite' }} />
            Live Audio
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1.5} alignItems="center" sx={{ py: 2 }}>
          <Box
            sx={{
              width: '100%',
              minHeight,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: alpha('#60a5fa', 0.28),
              bgcolor: alpha('#0f172a', 0.55),
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 900, mb: 0.5 }}>
                Đang chờ tín hiệu
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Khi ứng viên bật camera hoặc mic, preview sẽ hiện ở đây
              </Typography>
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

interface InterviewLiveCandidateCardProps {
  session: InterviewSession;
  onForceEnd: (session: InterviewSession) => void;
  isForceEnding?: boolean;
}

const InterviewLiveCandidateCard: React.FC<InterviewLiveCandidateCardProps> = ({
  session,
  onForceEnd,
  isForceEnding = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const [connectionDetails, setConnectionDetails] = useState<{ token: string; serverUrl: string } | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const normalizedStatus = normalizeStatus(session.status);
  const isLive = ACTIVE_STATUSES.has(normalizedStatus);

  useEffect(() => {
    let alive = true;

    const loadToken = async () => {
      if (!isLive || !session.id) {
        setConnectionDetails(null);
        setTokenError(null);
        setLoadingToken(false);
        return;
      }

      setLoadingToken(true);
      setTokenError(null);

      try {
        const details = await interviewService.getObserverToken(session.id);
        if (!alive) return;

        const serverUrl = details.serverUrl || details.server_url || details.url || getSafeLiveKitUrl();

        setConnectionDetails({
          token: details.token,
          serverUrl,
        });
      } catch (err) {
        if (!alive) return;
        setConnectionDetails(null);
        setTokenError(err instanceof Error ? err.message : 'Không thể lấy token quan sát.');
      } finally {
        if (alive) setLoadingToken(false);
      }
    };

    loadToken();

    return () => {
      alive = false;
    };
  }, [isLive, session.id, normalizedStatus]);

  useEffect(() => {
    if (!isLive) {
      setLoadingToken(false);
      setConnectionDetails(null);
      setTokenError(null);
      setFullscreenOpen(false);
    }
  }, [isLive]);

  const statusLabel = t(`interview:interviewListCard.statuses.${session.status}`, {
    defaultValue: normalizedStatus?.replaceAll('_', ' ')?.toUpperCase(),
  });

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.12),
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: isLive
              ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.2)}, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.2)})`
              : `linear-gradient(90deg, ${alpha(theme.palette.success.main, 0.15)}, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.15)})`,
          }}
        />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 1.75 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
                {session.candidateName || 'Unknown candidate'}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WorkIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {session.jobName || 'N/A'}
              </Typography>
            </Stack>
          </Box>

          <Stack alignItems="flex-end" spacing={0.5}>
              <Chip
              label={statusLabel}
              color={getStatusColor(normalizedStatus)}
              size="small"
              sx={{ fontWeight: 900, fontSize: '0.65rem', height: 22 }}
            />
            <ElapsedTimer startTime={session.startTime} />
          </Stack>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {session.roomName || t('interview:interviewDetail.label.roomCode', { defaultValue: 'Room' })}
        </Typography>

        <Box
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.9),
            bgcolor: alpha('#020617', 0.98),
            minHeight: 280,
          }}
        >
          {loadingToken ? (
            <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>
              <Stack spacing={1.5} alignItems="center">
                <CircularProgress size={28} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Đang kết nối realtime...
                </Typography>
              </Stack>
            </Box>
          ) : tokenError ? (
            <Box sx={{ minHeight: 280, p: 2 }}>
              <Alert severity="warning">{tokenError}</Alert>
            </Box>
          ) : connectionDetails ? (
            <LiveKitRoom
              token={connectionDetails.token}
              serverUrl={connectionDetails.serverUrl}
              connect={isLive}
              audio={false}
              video={false}
            >
              <Box sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Chip
                    icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#22c55e !important' }} />}
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
                      borderColor: alpha('#22c55e', 0.16),
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FullscreenIcon />}
                      onClick={() => setFullscreenOpen(true)}
                      sx={{ fontWeight: 800, textTransform: 'none' }}
                    >
                      Phóng to
                    </Button>
              {normalizedStatus === 'in_progress' && (
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        startIcon={<StopCircleIcon />}
                        onClick={() => onForceEnd(session)}
                        disabled={isForceEnding}
                        sx={{ fontWeight: 800, textTransform: 'none' }}
                      >
                        Kết thúc
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <LiveObserverVisualizer compact />
              </Box>
            </LiveKitRoom>
          ) : (
            <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center', p: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Phiên này chưa sẵn sàng để kết nối realtime.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#020617',
            backgroundImage: 'radial-gradient(circle at top, rgba(56,189,248,0.08), transparent 60%)',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(10,14,26,0.86)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 900 }}>
                {session.candidateName || 'Unknown candidate'}
              </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                          {session.jobName || 'N/A'} · {statusLabel}
                      </Typography>
            </Box>
            <IconButton onClick={() => setFullscreenOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, p: 3, minHeight: 0 }}>
            {connectionDetails ? (
              <LiveKitRoom
                token={connectionDetails.token}
                serverUrl={connectionDetails.serverUrl}
                connect={isLive}
                audio={false}
                video={false}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.6fr) minmax(320px, 0.8fr)' }, gap: 2, height: '100%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      minHeight: 0,
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.08)',
                      bgcolor: '#020617',
                    }}
                  >
                    <LiveObserverVisualizer compact={false} />
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.08)',
                      bgcolor: 'rgba(15,23,42,0.9)',
                      overflow: 'auto',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                      Phiên live
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          Ứng viên
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.candidateName || 'Unknown candidate'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          Vị trí
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.jobName || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          Phòng
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.roomName || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          Thời gian
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
                          sx={{ textTransform: 'none', fontWeight: 800 }}
                        >
                          Kết thúc phiên
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              </LiveKitRoom>
            ) : (
              <Alert severity="warning">Chưa có connection details để mở fullscreen.</Alert>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InterviewLiveCandidateCard;

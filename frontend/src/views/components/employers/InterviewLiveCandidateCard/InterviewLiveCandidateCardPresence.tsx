import React, { useEffect, useState } from 'react';
import { Avatar, Box, Chip, CircularProgress, Stack, Typography, alpha } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import { LiveKitRoom, BarVisualizer, VideoTrack, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useTranslation } from 'react-i18next';
import interviewService from '../../../../services/interviewService';
import { type InterviewSession } from '../../../../types/models';

const ACTIVE_STATUSES = new Set(['in_progress', 'calibration', 'connecting', 'active', 'interrupted']);
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

const formatElapsed = (startTime: string | null | undefined, now = Date.now()) => {
  if (!startTime) return '--:--';
  const elapsed = Math.max(0, Math.floor((now - new Date(startTime).getTime()) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const ElapsedTimer: React.FC<{ startTime: string | null | undefined }> = ({ startTime }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const elapsed = formatElapsed(startTime, now);

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

type LiveObserverVisualizerProps = {
  compact?: boolean;
};

export const LiveObserverVisualizer: React.FC<LiveObserverVisualizerProps> = ({ compact = false }) => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
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
            label={t('employer:interviewLive.candidateCard.screenShare')}
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
            {t('employer:interviewLive.candidateCard.liveAudioNoVideo')}
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
                {t('employer:interviewLive.candidateCard.waitingSignal')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('employer:interviewLive.candidateCard.waitingSignalHint')}
              </Typography>
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export { ACTIVE_STATUSES, normalizeStatus, getSafeLiveKitUrl };

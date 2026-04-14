'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Button,
  alpha,
  useTheme,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useTranslation } from 'react-i18next';

import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  TrackLoop, 
  useTracks, 
  BarVisualizer,
  VideoTrack,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import type { SSETranscript } from '../../../employerPages/InterviewPages/hooks/useInterviewSSE';

interface InterviewObserverDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: number | string;
  candidateName?: string | null;
  jobName?: string | null;
  liveTranscripts: SSETranscript[];
  liveStatus: string | null;
  sseConnected: boolean;
  /** LiveKit connection details for audio streaming */
  connectionDetails?: { token: string; serverUrl: string } | null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/** Live video + audio visualizer for observer mode */
const LiveObserverVisualizer = () => {
  const audioTracks = useTracks([Track.Source.Microphone]);
  const videoTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      {/* Screen share - takes priority if present */}
      {screenTracks.length > 0 && (
        <Box sx={{ 
          width: '100%', 
          flex: 1, 
          position: 'relative', 
          borderRadius: 2, 
          overflow: 'hidden',
          border: '2px solid',
          borderColor: alpha('#22c55e', 0.3),
          bgcolor: '#000',
        }}>
          <VideoTrack
            trackRef={screenTracks[0]}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <Chip
            label="SCREEN SHARE"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 900,
              fontSize: '0.6rem',
              letterSpacing: 1,
              bgcolor: alpha('#22c55e', 0.85),
              color: '#fff',
              height: 22,
            }}
          />
        </Box>
      )}

      {/* Camera video */}
      {videoTracks.length > 0 ? (
        <Box sx={{ 
          width: screenTracks.length > 0 ? 180 : '100%', 
          height: screenTracks.length > 0 ? 135 : '100%',
          maxHeight: screenTracks.length > 0 ? 135 : 320,
          position: screenTracks.length > 0 ? 'absolute' : 'relative',
          bottom: screenTracks.length > 0 ? 16 : 'auto',
          right: screenTracks.length > 0 ? 16 : 'auto',
          zIndex: 2,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: alpha('#a855f7', 0.4),
          boxShadow: screenTracks.length > 0 ? '0 8px 32px rgba(0,0,0,0.6)' : 'none',
          bgcolor: '#000',
        }}>
          <VideoTrack
            trackRef={videoTracks[0]}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {screenTracks.length > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                bottom: 4, 
                left: 8, 
                color: '#fff', 
                fontWeight: 800, 
                fontSize: '0.55rem',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              Candidate
            </Typography>
          )}
        </Box>
      ) : (
        /* Fallback: audio visualization when no video */
        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
          {audioTracks.length > 0 ? (
            <>
              <Box sx={{ height: 100, width: '100%', maxWidth: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarVisualizer barCount={15} style={{ height: '60px', width: '200px' }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, animation: 'pulse 1.5s infinite' }} />
                Live Audio — No Video
              </Typography>
            </>
          ) : (
            <>
              <VolumeUpIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                Waiting for Audio/Video Tracks...
              </Typography>
            </>
          )}
        </Stack>
      )}

      {/* Live status indicator */}
      {(videoTracks.length > 0 || screenTracks.length > 0) && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
          <Typography variant="caption" sx={{ 
            color: '#22c55e', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: 2,
            fontSize: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'rgba(0,0,0,0.6)',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
          }}>
            <FiberManualRecordIcon sx={{ fontSize: 8, animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            LIVE
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const InterviewObserverDialog: React.FC<InterviewObserverDialogProps> = ({
  open,
  onClose,
  sessionId,
  candidateName,
  jobName,
  liveTranscripts,
  liveStatus,
  sseConnected,
  connectionDetails,
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const transcriptEndRef = React.useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveTranscripts]);

  // Elapsed timer
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statusText = liveStatus || 'in_progress';

  const DialogInner = (
    <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(10,14,26,0.8)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
              px: 2,
              py: 0.75,
              borderRadius: 2,
            }}
          >
            <VisibilityOffIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'warning.main', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>{t('common:auto.InterviewObserverDialog_observer_mode_daff', `Observer Mode`)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800 }}>
              {candidateName || 'Candidate'} — {jobName || 'Interview'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FiberManualRecordIcon
                sx={{
                  fontSize: 10,
                  color: sseConnected ? '#22c55e' : '#ef4444',
                  animation: sseConnected ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                {sseConnected ? 'Live' : 'Reconnecting...'} • {formatTime(elapsed)}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip
            label={statusText.replaceAll('_', ' ').toUpperCase()}
            size="small"
            sx={{
              fontWeight: 900,
              bgcolor: statusText === 'in_progress' ? alpha('#22c55e', 0.15) : alpha('#94a3b8', 0.15),
              color: statusText === 'in_progress' ? '#22c55e' : '#94a3b8',
              border: '1px solid',
              borderColor: statusText === 'in_progress' ? alpha('#22c55e', 0.3) : alpha('#94a3b8', 0.2),
              fontSize: '0.65rem',
              letterSpacing: 1.5,
            }}
          />
          <Button
            onClick={onClose}
            variant="contained"
            size="small"
            sx={{
              bgcolor: alpha('#ef4444', 0.15),
              color: '#f87171',
              fontWeight: 900,
              fontSize: '0.7rem',
              letterSpacing: 1,
              textTransform: 'uppercase',
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#ef4444', 0.3),
              '&:hover': { bgcolor: alpha('#ef4444', 0.25) },
            }}
          >{t('common:auto.InterviewObserverDialog_end_observation_130a', `End Observation`)}</Button>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Video + Audio Visualizer */}
        <Box
          sx={{
            width: { xs: '0%', md: '55%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(56,189,248,0.08) 0%, transparent 70%)',
            }}
          />
          <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {connectionDetails ? (
              <LiveObserverVisualizer />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 800, mb: 1 }}>{t('common:auto.InterviewObserverDialog_audio_disabled_a82b', `Audio Monitoring Disabled`)}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{t('common:auto.InterviewObserverDialog_check_server_config_to_e_e72a', `Check server configuration to enable real-time listening.`)}</Typography>
              </Box>
            )}
            
            {!connectionDetails && (
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 1 }}>{t('common:auto.InterviewObserverDialog__hidden_observer_mode_72e9', `🔇 Hidden Observer Mode`)}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontWeight: 600, maxWidth: 280, display: 'block', mx: 'auto' }}>{t('common:auto.InterviewObserverDialog_you_are_observing_this_intervi_7cb3', `You are observing this interview silently. The candidate cannot see or hear you.`)}</Typography>
              </Box>
            )}
            <RoomAudioRenderer />
          </Box>
        </Box>

          {/* Right: Live Transcript */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>{t('common:auto.InterviewObserverDialog_live_transcript_b857', `Live Transcript`)}</Typography>
                <Chip
                  label={`${liveTranscripts.length} messages`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    bgcolor: alpha('#0ea5e9', 0.1),
                    color: '#0ea5e9',
                    border: '1px solid',
                    borderColor: alpha('#0ea5e9', 0.2),
                  }}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 3,
                py: 2,
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
              }}
            >
              {liveTranscripts.length > 0 ? (
                <Stack spacing={3}>
                  {liveTranscripts.map((t, idx) => {
                    const isAI = t.speakerRole === 'ai_agent';
                    return (
                      <Stack key={t.id || idx} direction="row" spacing={1.5} alignItems="flex-start">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isAI ? alpha('#0ea5e9', 0.2) : alpha('#a855f7', 0.2),
                            border: '1.5px solid',
                            borderColor: isAI ? alpha('#0ea5e9', 0.3) : alpha('#a855f7', 0.3),
                          }}
                        >
                          {isAI ? <SmartToyIcon sx={{ fontSize: 16, color: '#0ea5e9' }} /> : <PersonIcon sx={{ fontSize: 16, color: '#a855f7' }} />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: isAI ? '#0ea5e9' : '#a855f7', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1.5 }}>
                            {isAI ? 'AI Interviewer' : 'Candidate'}
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 0.5,
                              p: 2,
                              bgcolor: isAI ? alpha('#0ea5e9', 0.06) : alpha('#a855f7', 0.06),
                              borderRadius: isAI ? '0 12px 12px 12px' : '12px 0 12px 12px',
                              border: '1px solid',
                              borderColor: isAI ? alpha('#0ea5e9', 0.1) : alpha('#a855f7', 0.1),
                            }}
                          >
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.8, fontSize: '0.85rem' }}>
                              {t.content}
                            </Typography>
                          </Paper>
                        </Box>
                      </Stack>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{t('common:auto.InterviewObserverDialog_waiting_for_conversation_to_be_3e38', `Waiting for conversation to begin...`)}</Typography>
                  <Box
                    sx={{
                      mt: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: alpha('#0ea5e9', 0.4),
                          animation: 'dotBounce 1.4s infinite ease-in-out both',
                          animationDelay: `${i * 0.16}s`,
                          '@keyframes dotBounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: '#0a0e1a',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(56,189,248,0.07) 0%, transparent 60%)',
        },
      }}
    >
      {connectionDetails ? (
        <LiveKitRoom
          token={connectionDetails.token}
          serverUrl={connectionDetails.serverUrl}
          connect={open}
          audio={false} // Observer doesn't publish audio
          video={false} // Observer doesn't publish video
        >
          {DialogInner}
        </LiveKitRoom>
      ) : (
        DialogInner
      )}
    </Dialog>
  );
};

export default InterviewObserverDialog;

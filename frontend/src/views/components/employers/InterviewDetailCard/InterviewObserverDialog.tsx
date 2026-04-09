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
  /** LiveKit connection details (optional — for audio streaming) */
  connectionDetails?: { token: string; serverUrl: string } | null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'warning.main', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Observer Mode
              </Typography>
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
            >
              End Observation
            </Button>
          </Stack>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Audio Visualizer Placeholder */}
          <Box
            sx={{
              width: { xs: '0%', md: '45%' },
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
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  border: '3px solid',
                  borderColor: sseConnected ? alpha('#22c55e', 0.3) : alpha('#94a3b8', 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  bgcolor: alpha('#0ea5e9', 0.05),
                  animation: sseConnected ? 'pulseRing 3s infinite' : 'none',
                  '@keyframes pulseRing': {
                    '0%, 100%': { boxShadow: `0 0 0 0px ${alpha('#22c55e', 0.2)}` },
                    '50%': { boxShadow: `0 0 0 15px ${alpha('#22c55e', 0)}` },
                  },
                }}
              >
                <VolumeUpIcon sx={{ fontSize: 64, color: alpha('#0ea5e9', 0.5) }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 1 }}>
                🔇 Hidden Observer Mode
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontWeight: 600, maxWidth: 280, display: 'block', mx: 'auto' }}>
                You are observing this interview silently. The candidate cannot see or hear you.
              </Typography>
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
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>
                  Live Transcript
                </Typography>
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
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                    Waiting for conversation to begin...
                  </Typography>
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
    </Dialog>
  );
};

export default InterviewObserverDialog;

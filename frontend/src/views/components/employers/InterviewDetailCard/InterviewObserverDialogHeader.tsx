import React from 'react';
import { alpha, Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import pc from '@/utils/muiColors';

type Props = {
  candidateName?: string | null;
  jobName?: string | null;
  liveStatus: string | null;
  sseConnected: boolean;
  elapsedLabel: string;
  onClose: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const InterviewObserverDialogHeader = ({ candidateName, jobName, liveStatus, sseConnected, elapsedLabel, onClose, t }: Props) => {
  const theme = useTheme();
  const statusText = liveStatus || 'in_progress';

  return (
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
            bgcolor: pc.warning( 0.1),
            border: '1px solid',
            borderColor: pc.warning( 0.2),
            px: 2,
            py: 0.75,
            borderRadius: 2,
          }}
        >
          <VisibilityOffIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'warning.main', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {t('employer:interviewLive.candidateCard.observerMode')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800 }}>
            {candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')} - {jobName || t('employer:interviewLive.candidateCard.unknownJob')}
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
              {sseConnected ? t('employer:interviewLive.candidateCard.live') : t('employer:interviewLive.candidateCard.reconnecting')} - {elapsedLabel}
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
          {t('employer:interviewLive.candidateCard.endObservation')}
        </Button>
      </Stack>
    </Box>
  );
};

export default InterviewObserverDialogHeader;

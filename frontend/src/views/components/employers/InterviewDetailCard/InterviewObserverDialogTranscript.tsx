import React from 'react';
import { alpha, Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import type { SSETranscript } from '../../../employerPages/InterviewPages/hooks/useInterviewSSE';

type Props = {
  liveTranscripts: SSETranscript[];
  t: (key: string, options?: Record<string, unknown>) => string;
};

const InterviewObserverDialogTranscript = ({ liveTranscripts, t }: Props) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>
          {t('common:auto.InterviewObserverDialog_live_transcript_b857', { defaultValue: 'Live Transcript' })}
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
          {liveTranscripts.map((item, idx) => {
            const isAI = item.speakerRole === 'ai_agent';
            return (
              <Stack key={item.id || idx} direction="row" spacing={1.5} alignItems="flex-start">
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
                      {item.content}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
            {t('common:auto.InterviewObserverDialog_waiting_for_conversation_to_be_3e38', { defaultValue: 'Waiting for conversation to begin...' })}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
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
);

export default InterviewObserverDialogTranscript;

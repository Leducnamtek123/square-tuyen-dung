import React from 'react';
import { alpha, Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useParticipants, useTranscriptions } from '@livekit/components-react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import type { TextStreamData } from '@livekit/components-core';
import { type Participant } from 'livekit-client';
import { isLiveKitAgentParticipant, sanitizeInterviewText } from '@/views/interviewPages/livekitParticipant';

type Props = {
  t: (key: string, options?: Record<string, unknown>) => string;
};

type TranscriptItem = {
  id: string;
  name: string;
  content: string;
  timestamp: number;
  isAI: boolean;
  isLocal: boolean;
};

const mapTranscriptions = (items: TextStreamData[], participants: Participant[]): TranscriptItem[] => {
  return items.map((item) => {
    const participant = participants.find((p) => p.identity === item.participantInfo.identity);
    const isAI = isLiveKitAgentParticipant(participant);
    const isLocal = participant?.isLocal === true;

    return {
      id: `${item.streamInfo.id}`,
      name: isAI ? 'AI Interviewer' : isLocal ? 'You' : participant?.name || participant?.identity || 'Guest',
      content: item.text,
      timestamp: item.streamInfo.timestamp,
      isAI,
      isLocal,
    };
  });
};

const InterviewObserverDialogTranscript = ({ t }: Props) => {
  const participants = useParticipants();
  const transcriptions = useTranscriptions();
  const liveTranscripts = React.useMemo(() => mapTranscriptions(transcriptions, participants), [participants, transcriptions]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>
          {t('employer:interviewLive.candidateCard.liveTranscript')}
        </Typography>
        <Chip
          label={`${liveTranscripts.length} ${t('common:labels.messages')}`}
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
          {liveTranscripts.map((item) => {
            return (
              <Stack key={`${item.id}-${item.timestamp}-${item.content}`} direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: item.isAI ? alpha('#0ea5e9', 0.2) : alpha('#a855f7', 0.2),
                    border: '1.5px solid',
                    borderColor: item.isAI ? alpha('#0ea5e9', 0.3) : alpha('#a855f7', 0.3),
                  }}
                >
                  {item.isAI ? <SmartToyIcon sx={{ fontSize: 16, color: '#0ea5e9' }} /> : <PersonIcon sx={{ fontSize: 16, color: '#a855f7' }} />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: item.isAI ? '#0ea5e9' : '#a855f7', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1.5 }}>
                    {item.name}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 0.5,
                      p: 2,
                      bgcolor: item.isAI ? alpha('#0ea5e9', 0.06) : alpha('#a855f7', 0.06),
                      borderRadius: item.isAI ? '0 12px 12px 12px' : '12px 0 12px 12px',
                      border: '1px solid',
                      borderColor: item.isAI ? alpha('#0ea5e9', 0.1) : alpha('#a855f7', 0.1),
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.8, fontSize: '0.85rem' }}>
                      {sanitizeInterviewText(item.content)}
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
            {t('employer:interviewLive.candidateCard.waitingForConversation')}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {['dot-1', 'dot-2', 'dot-3'].map((key, index) => (
              <Box
                key={key}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: alpha('#0ea5e9', 0.4),
                  animation: 'dotBounce 1.4s infinite ease-in-out both',
                  animationDelay: `${index * 0.16}s`,
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
};

export default InterviewObserverDialogTranscript;

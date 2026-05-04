import React from 'react';
import { alpha, Box, Chip, Stack, Typography } from '@mui/material';
import { ChatEntry, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { getParticipantRole } from '@/views/interviewPages/livekitParticipant';

type Props = {
  t: (key: string, options?: Record<string, unknown>) => string;
};

const InterviewObserverDialogTranscript = ({ t }: Props) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);

  const normalizedMessages = React.useMemo(() => {
    return messages.map((item) => {
      const role = getParticipantRole(item.from);
      const name =
        role === 'agent'
          ? t('interviewDetail.label.interviewer')
          : role === 'employer'
            ? t('liveRoom.participants.employer')
            : role === 'observer'
              ? t('liveRoom.participants.observer')
              : role === 'candidate'
                ? t('liveRoom.participants.candidate')
                : item.from?.name || item.from?.identity || t('liveRoom.participants.guest');

      return {
        ...item,
        from: {
          ...item.from,
          name,
        },
      };
    });
  }, [messages, t]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>
            {t('employer:interviewLive.candidateCard.liveTranscript')}
          </Typography>
          <Chip
            label={`${normalizedMessages.length} ${t('common:labels.messages')}`}
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
        {normalizedMessages.length > 0 ? (
          <Stack spacing={2}>
            {normalizedMessages.map((message) => (
              <Box
                key={message.id}
                component="ul"
                className="lk-list"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha('#0ea5e9', 0.12),
                  bgcolor: alpha('#020617', 0.5),
                }}
              >
                <ChatEntry entry={message as any} />
              </Box>
            ))}
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

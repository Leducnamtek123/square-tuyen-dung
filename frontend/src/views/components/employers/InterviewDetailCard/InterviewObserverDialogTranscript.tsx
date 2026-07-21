import React from 'react';
import { alpha, Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import { useInterviewMessages } from '@/views/interviewPages/useInterviewMessages';
import { getParticipantCompanyName, getParticipantRole, sanitizeInterviewText } from '@/views/interviewPages/livekitParticipant';

type Props = {
  t: (key: string, options?: Record<string, unknown>) => string;
};

type TranscriptRow = {
  id: string;
  speaker: 'interviewer' | 'employer' | 'observer' | 'candidate' | 'guest';
  speakerName: string;
  content: string;
  timestamp: number;
  isLocal: boolean;
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const mapMessages = (
  items: ReturnType<typeof useInterviewMessages>['messages'],
  t: Props['t'],
): TranscriptRow[] =>
  items.map((item) => {
    const participant = item.from;
    const role = getParticipantRole(participant);
    const companyName = getParticipantCompanyName(participant);
    const isLocal = participant?.isLocal === true;

    const speakerName =
      role === 'agent'
        ? t('interviewDetail.label.interviewer')
        : role === 'employer'
          ? companyName || t('liveRoom.participants.employer')
          : role === 'observer'
            ? t('liveRoom.participants.observer')
            : role === 'candidate'
              ? t('liveRoom.participants.candidate')
              : participant?.name || participant?.identity || t('liveRoom.participants.guest');

    return {
      id: item.id,
      speaker: role === 'agent' ? 'interviewer' : role,
      speakerName: isLocal ? t('liveRoom.participants.you') : speakerName,
      content: sanitizeInterviewText(item.message),
      timestamp: item.timestamp,
      isLocal,
    };
  });

const InterviewObserverDialogTranscript = ({ t }: Props) => {
  const { messages } = useInterviewMessages();
  const rows = React.useMemo(() => mapMessages(messages, t), [messages, t]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>
            {t('employer:interviewLive.candidateCard.liveTranscript')}
          </Typography>
          <Chip
            label={`${rows.length} ${t('common:labels.messages')}`}
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
        {rows.length > 0 ? (
          <Stack spacing={2.5}>
            {rows.map((row) => {
              const isAI = row.speaker === 'interviewer';
              const isEmployer = row.speaker === 'employer';
              const isObserver = row.speaker === 'observer';
              const isCandidate = row.speaker === 'candidate';

              return (
                <Stack key={`${row.id}-${row.timestamp}`} direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: isAI
                        ? alpha('#0ea5e9', 0.2)
                        : isEmployer
                          ? alpha('#f59e0b', 0.2)
                          : isObserver
                            ? alpha('#64748b', 0.2)
                            : isCandidate
                              ? alpha('#22c55e', 0.2)
                              : alpha('#a855f7', 0.2),
                      border: '1.5px solid',
                      borderColor: isAI
                        ? alpha('#0ea5e9', 0.3)
                        : isEmployer
                          ? alpha('#f59e0b', 0.3)
                          : isObserver
                            ? alpha('#64748b', 0.3)
                            : isCandidate
                              ? alpha('#22c55e', 0.3)
                              : alpha('#a855f7', 0.3),
                    }}
                  >
                    {isAI ? (
                      <SmartToyIcon sx={{ fontSize: 18, color: '#0ea5e9' }} />
                    ) : (
                      <PersonIcon
                        sx={{
                          fontSize: 18,
                          color: isEmployer ? '#f59e0b' : isObserver ? '#94a3b8' : isCandidate ? '#22c55e' : '#a855f7',
                        }}
                      />
                    )}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 900,
                          color: isAI
                            ? '#0ea5e9'
                            : isEmployer
                              ? '#f59e0b'
                              : isObserver
                                ? '#94a3b8'
                                : isCandidate
                                  ? '#22c55e'
                                  : '#a855f7',
                          textTransform: 'uppercase',
                          fontSize: '0.65rem',
                          letterSpacing: 1.5,
                        }}
                      >
                        {row.speakerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
                        {formatTime(row.timestamp)}
                      </Typography>
                    </Stack>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: isAI
                          ? alpha('#0ea5e9', 0.06)
                          : isEmployer
                            ? alpha('#f59e0b', 0.06)
                            : isObserver
                              ? alpha('#64748b', 0.06)
                              : isCandidate
                                ? alpha('#22c55e', 0.06)
                                : alpha('#a855f7', 0.06),
                        borderRadius: '0 12px 12px 12px',
                        border: '1px solid',
                        borderColor: isAI
                          ? alpha('#0ea5e9', 0.1)
                          : isEmployer
                            ? alpha('#f59e0b', 0.1)
                            : isObserver
                              ? alpha('#64748b', 0.1)
                              : isCandidate
                                ? alpha('#22c55e', 0.1)
                                : alpha('#a855f7', 0.1),
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.8, fontSize: '0.9rem' }}
                      >
                        {row.content}
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

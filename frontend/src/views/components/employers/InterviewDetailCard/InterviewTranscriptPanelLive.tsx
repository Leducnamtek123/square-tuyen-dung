import React, { useEffect, useRef } from 'react';
import { Box, Paper, Stack, Typography, Divider, Avatar, Chip } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useParticipants, useTranscriptions } from '@livekit/components-react';
import type { TextStreamData } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import type { i18n, TFunction } from 'i18next';

import { InterviewSession, InterviewTranscript } from '@/types/models';
import pc from '@/utils/muiColors';

interface InterviewTranscriptPanelProps {
  session: InterviewSession;
  t: TFunction;
  i18n: i18n;
}

type TranscriptItem = {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  id: number | string;
  isLive: boolean;
};

const isRoleMatch = (participant: Participant | undefined, terms: string[]) => {
  const identity = participant?.identity?.toLowerCase() ?? '';
  const name = participant?.name?.toLowerCase() ?? '';
  return terms.some((term) => identity.includes(term) || name.includes(term));
};

const mapLiveTranscripts = (items: TextStreamData[], participants: Participant[]): TranscriptItem[] => {
  return items.map((item) => {
    const participant = participants.find((p) => p.identity === item.participantInfo.identity);
    const isInterviewer = isRoleMatch(participant, ['agent', 'interviewer']);

    return {
      speaker: isInterviewer ? 'interviewer' : 'candidate',
      text: item.text,
      timestamp: new Date(item.streamInfo.timestamp).toLocaleTimeString(),
      id: item.streamInfo.id,
      isLive: true,
    };
  });
};

const InterviewTranscriptPanelLive: React.FC<InterviewTranscriptPanelProps> = ({ session, t, i18n }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const participants = useParticipants();
  const transcriptions = useTranscriptions();

  const mergedTranscripts = React.useMemo(() => {
    const existingTranscripts = Array.isArray(session.transcripts) ? session.transcripts : [];
    const existingIds = new Set(existingTranscripts.map((transcript: InterviewTranscript) => transcript.id));
    const liveOnly = mapLiveTranscripts(transcriptions, participants).filter((item) => !existingIds.has(item.id));

    const mapped: TranscriptItem[] = existingTranscripts.map((transcript: InterviewTranscript) => ({
      speaker: transcript.speakerRole === 'ai_agent' ? 'interviewer' : 'candidate',
      text: transcript.content || transcript.text || '',
      timestamp: transcript.createAt ? new Date(transcript.createAt).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '',
      id: transcript.id,
      isLive: false,
    }));

    return [...mapped, ...liveOnly];
  }, [i18n.language, participants, session.transcripts, transcriptions]);

  useEffect(() => {
    if (transcriptions.length > 0 && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptions.length]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 1200,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => theme.customShadows?.z1,
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <ForumIcon color="primary" sx={{ fontSize: 24 }} />
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
          {t('interviewDetail.subtitle.transcript')}
        </Typography>
        <Chip
          icon={
            <FiberManualRecordIcon
              sx={{
                fontSize: '10px !important',
                color: '#22c55e !important',
                animation: 'livePulse 2s infinite',
                '@keyframes livePulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
          }
          label={t('employer:interviewLive.candidateCard.live')}
          size="small"
          sx={{
            fontWeight: 900,
            height: 24,
            fontSize: '0.65rem',
            letterSpacing: 1.5,
            bgcolor: 'rgba(34, 197, 94, 0.08)',
            color: '#22c55e',
            border: '1px solid',
            borderColor: 'rgba(34, 197, 94, 0.15)',
          }}
        />

        {mergedTranscripts.length > 0 && (
          <Chip
            label={`${mergedTranscripts.length} ${t('common:labels.messages')}`}
            size="small"
            sx={{
              ml: 'auto',
              fontWeight: 900,
              height: 24,
              fontSize: '0.75rem',
              bgcolor: pc.primary(0.08),
              color: 'primary.main',
              letterSpacing: '0.5px',
              border: '1px solid',
              borderColor: pc.primary(0.1),
            }}
          />
        )}
      </Stack>

      <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 2,
          mr: -2,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: pc.divider(0.5), borderRadius: '10px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {mergedTranscripts.length > 0 ? (
          <Stack spacing={6}>
            {mergedTranscripts.map((item) => {
              const isInterviewer = item.speaker === 'interviewer';
              const isNewLive = item.isLive;
              return (
                <Stack
                  key={`${item.id}-${item.timestamp}-${item.speaker}`}
                  direction="row"
                  spacing={3}
                  alignItems="flex-start"
                  sx={{
                    animation: isNewLive ? 'fadeSlideIn 0.5s ease-out' : 'none',
                    '@keyframes fadeSlideIn': {
                      from: { opacity: 0, transform: 'translateY(12px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: isInterviewer ? 'primary.main' : 'secondary.main',
                      boxShadow: (theme) => (isInterviewer ? theme.customShadows?.primary : theme.customShadows?.secondary),
                      border: '2.5px solid',
                      borderColor: isInterviewer ? 'rgba(42, 169, 225, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                    }}
                  >
                    {isInterviewer ? <SmartToyIcon sx={{ fontSize: 24 }} /> : <PersonIcon sx={{ fontSize: 24 }} />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 900,
                          color: isInterviewer ? 'primary.main' : 'secondary.main',
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: 1.5,
                        }}
                      >
                        {isInterviewer ? t('interviewDetail.label.interviewer') : t('interviewDetail.label.candidate')}
                      </Typography>
                      {isNewLive && (
                        <Chip
                          label={t('employer:interviewLive.candidateCard.newBadge')}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.55rem',
                            fontWeight: 900,
                            letterSpacing: 1,
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            border: '1px solid',
                            borderColor: 'rgba(245, 158, 11, 0.2)',
                          }}
                        />
                      )}
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.disabled' }}>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                          {item.timestamp}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: isInterviewer ? pc.primary(0.03) : pc.actionDisabled(0.03),
                        borderRadius: isInterviewer ? '0px 20px 20px 20px' : '20px 0px 20px 20px',
                        border: '1px solid',
                        borderColor: isInterviewer ? pc.primary(0.1) : pc.divider(0.5),
                        boxShadow: (theme) => (isInterviewer ? 'none' : theme.customShadows?.z1),
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 2, color: 'text.primary', fontWeight: 700, fontSize: '0.95rem' }}>
                        {item.text}
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              );
            })}
            <div ref={transcriptEndRef} />
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 15, opacity: 0.6 }}>
            <ForumIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 3, opacity: 0.2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 900, letterSpacing: '0.5px' }}>
              {t('interviewDetail.messages.noTranscript')}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontWeight: 600 }}>
              {t('interviewDetail.messages.noTranscriptDesc')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default InterviewTranscriptPanelLive;

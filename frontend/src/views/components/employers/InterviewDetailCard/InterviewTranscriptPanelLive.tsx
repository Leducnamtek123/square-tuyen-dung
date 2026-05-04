import React, { useEffect, useRef } from 'react';
import { Box, Paper, Stack, Typography, Divider, Chip } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { i18n, TFunction } from 'i18next';
import { ChatEntry, useSessionContext, useSessionMessages, type ReceivedMessage } from '@livekit/components-react';

import { InterviewSession, InterviewTranscript } from '@/types/models';
import { getParticipantRole } from '@/views/interviewPages/livekitParticipant';
import pc from '@/utils/muiColors';

interface InterviewTranscriptPanelProps {
  session: InterviewSession;
  t: TFunction;
  i18n: i18n;
}

type LiveEntry = ReceivedMessage;

const mapLiveMessages = (
  items: ReturnType<typeof useSessionMessages>['messages'],
  t: TFunction,
): LiveEntry[] => {
  return items.map((item) => {
    const role = getParticipantRole(item.from);
    const speakerName =
      role === 'agent'
        ? t('interviewDetail.label.interviewer')
        : role === 'employer'
          ? t('liveRoom.participants.employer')
          : role === 'observer'
            ? t('liveRoom.participants.observer', 'Quan sát viên')
            : role === 'candidate'
              ? t('liveRoom.participants.candidate')
              : item.from?.name || item.from?.identity || t('liveRoom.participants.guest');

    return {
      ...item,
      from: {
        ...item.from,
        name: speakerName,
      },
    } as LiveEntry;
  });
};

const mapHistoryMessages = (session: InterviewSession, t: TFunction, i18n: i18n): LiveEntry[] => {
  const existingTranscripts = Array.isArray(session.transcripts) ? session.transcripts : [];
  return existingTranscripts.map((transcript: InterviewTranscript) => {
    const isInterviewer = transcript.speakerRole === 'ai_agent';
    const speakerName = isInterviewer
      ? t('interviewDetail.label.interviewer')
      : t('interviewDetail.label.candidate');

    return {
      id: String(transcript.id),
      timestamp: transcript.createAt ? new Date(transcript.createAt).getTime() : Date.now(),
      message: transcript.content || transcript.text || '',
      type: 'chatMessage',
      from: {
        isLocal: false,
        name: speakerName,
        identity: String(transcript.id),
      },
      editTimestamp: undefined,
    } as LiveEntry;
  });
};

const InterviewTranscriptPanelLive: React.FC<InterviewTranscriptPanelProps> = ({ session, t, i18n }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const liveSession = useSessionContext();
  const { messages: liveMessages } = useSessionMessages(liveSession);

  const mergedTranscripts = React.useMemo(() => {
    const existingMessages = mapHistoryMessages(session, t, i18n);
    const existingIds = new Set(existingMessages.map((message) => message.id));
    const liveOnly = mapLiveMessages(liveMessages, t).filter((item) => !existingIds.has(item.id));
    return [...existingMessages, ...liveOnly];
  }, [i18n, liveMessages, session, t]);

  useEffect(() => {
    if (liveMessages.length > 0 && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveMessages.length]);

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
          <div className="space-y-4">
            {mergedTranscripts.map((item) => (
              <Box
                key={`${item.id}-${item.timestamp}`}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(2, 6, 23, 0.2)',
                  p: 1.5,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>
                    {new Date(item.timestamp).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                  </Typography>
                  {item.type === 'chatMessage' && (
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
                        ml: 'auto',
                      }}
                    />
                  )}
                </Stack>
                <ChatEntry entry={item as any} />
              </Box>
            ))}
            <div ref={transcriptEndRef} />
          </div>
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

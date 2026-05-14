import React, { useEffect, useRef } from 'react';
import { alpha, Avatar, Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { i18n, TFunction } from 'i18next';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';

import { InterviewSession, InterviewTranscript } from '@/types/models';
import { getParticipantCompanyName, getParticipantRole, sanitizeInterviewText } from '@/views/interviewPages/livekitParticipant';
import { useInterviewMessages } from '@/views/interviewPages/useInterviewMessages';
import pc from '@/utils/muiColors';

interface InterviewTranscriptPanelProps {
  session: InterviewSession;
  t: TFunction;
  i18n: i18n;
}

type TimelineItem = {
  id: string;
  speaker: 'interviewer' | 'employer' | 'observer' | 'candidate' | 'guest';
  speakerName: string;
  content: string;
  timestamp: number;
  isLive: boolean;
};

const formatTime = (timestamp: number, language: string) =>
  new Date(timestamp).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

const mapLiveMessages = (items: ReturnType<typeof useInterviewMessages>['messages'], t: TFunction): TimelineItem[] =>
  items.map((item) => {
    const participant = item.from;
    const role = getParticipantRole(participant);
    const companyName = getParticipantCompanyName(participant);

    return {
      id: item.id,
      speaker:
        role === 'agent'
          ? 'interviewer'
          : role === 'employer'
            ? 'employer'
            : role === 'observer'
              ? 'observer'
              : role === 'candidate'
                ? 'candidate'
                : 'guest',
      speakerName:
        role === 'agent'
          ? t('interviewDetail.label.interviewer')
          : role === 'employer'
            ? companyName || t('liveRoom.participants.employer')
            : role === 'observer'
              ? t('liveRoom.participants.observer', 'Quan sát viên')
              : role === 'candidate'
                ? t('liveRoom.participants.candidate')
                : participant?.name || participant?.identity || t('liveRoom.participants.guest'),
      content: sanitizeInterviewText(item.message),
      timestamp: item.timestamp,
      isLive: true,
    };
  });

const mapHistoryMessages = (session: InterviewSession, t: TFunction): TimelineItem[] => {
  const existingTranscripts = Array.isArray(session.transcripts) ? session.transcripts : [];

  return existingTranscripts.map((transcript: InterviewTranscript) => ({
    id: String(transcript.id),
    speaker: transcript.speakerRole === 'ai_agent' ? 'interviewer' : 'candidate',
    speakerName:
      transcript.speakerRole === 'ai_agent'
        ? t('interviewDetail.label.interviewer')
        : t('interviewDetail.label.candidate'),
    content: sanitizeInterviewText(transcript.content || transcript.text || ''),
    timestamp: transcript.createAt ? new Date(transcript.createAt).getTime() : Date.now(),
    isLive: false,
  }));
};

const InterviewTranscriptPanelLive: React.FC<InterviewTranscriptPanelProps> = ({ session, t, i18n }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const liveSession = useSessionContext();
  const { messages: sessionMessages } = useSessionMessages(liveSession);
  const { messages: liveMessages } = useInterviewMessages();

  const mergedTranscripts = React.useMemo(() => {
    const history = mapHistoryMessages(session, t);
    const historyIds = new Set(history.map((item) => item.id));
    const live = mapLiveMessages(liveMessages, t).filter((item) => !historyIds.has(item.id));
    const liveChat = sessionMessages.flatMap((message) => {
      if (historyIds.has(message.id)) return [];
      const role = getParticipantRole(message.from);
      return [{
        id: message.id,
        speaker:
          role === 'agent'
            ? 'interviewer'
            : role === 'employer'
              ? 'employer'
              : role === 'observer'
                ? 'observer'
                : role === 'candidate'
                  ? 'candidate'
                  : 'guest',
        speakerName:
          role === 'agent'
            ? t('interviewDetail.label.interviewer')
            : role === 'employer'
              ? getParticipantCompanyName(message.from) || t('liveRoom.participants.employer')
              : role === 'observer'
                ? t('liveRoom.participants.observer', 'Quan sát viên')
                : role === 'candidate'
                  ? t('liveRoom.participants.candidate')
                  : message.from?.name || message.from?.identity || t('liveRoom.participants.guest'),
        content: sanitizeInterviewText(message.message),
        timestamp: message.timestamp,
        isLive: true,
      } as TimelineItem];
    });

    return [...history, ...live, ...liveChat].sort((a, b) => a.timestamp - b.timestamp);
  }, [liveMessages, session, sessionMessages, t]);

  useEffect(() => {
    if (mergedTranscripts.length > 0 && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mergedTranscripts.length]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 900,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
        <ForumIcon color="primary" sx={{ fontSize: 22 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: 0 }}>
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
            fontWeight: 850,
            height: 24,
            fontSize: '0.72rem',
            letterSpacing: 0,
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
              fontWeight: 850,
              height: 24,
              fontSize: '0.75rem',
              bgcolor: pc.primary(0.08),
              color: 'primary.main',
              letterSpacing: 0,
              border: '1px solid',
              borderColor: pc.primary(0.1),
            }}
          />
        )}
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

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
          <Stack spacing={2.5}>
            {mergedTranscripts.map((item) => {
              const isInterviewer = item.speaker === 'interviewer';
              const isEmployer = item.speaker === 'employer';
              const isObserver = item.speaker === 'observer';
              const isCandidate = item.speaker === 'candidate';

              return (
                <Stack
                  key={`${item.id}-${item.timestamp}-${item.isLive ? 'live' : 'history'}`}
                  direction="row"
                  spacing={1.75}
                  alignItems="flex-start"
                  sx={{
                    animation: item.isLive ? 'fadeSlideIn 0.5s ease-out' : 'none',
                    '@keyframes fadeSlideIn': {
                      from: { opacity: 0, transform: 'translateY(12px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: isInterviewer
                        ? 'primary.main'
                        : isEmployer
                          ? 'warning.main'
                          : isObserver
                            ? 'grey.600'
                            : isCandidate
                              ? 'success.main'
                              : 'secondary.main',
                      boxShadow: 'none',
                      border: '2px solid',
                      borderColor: isInterviewer
                        ? 'rgba(42, 169, 225, 0.5)'
                        : isEmployer
                          ? 'rgba(245, 158, 11, 0.5)'
                          : isObserver
                            ? 'rgba(148, 163, 184, 0.5)'
                            : isCandidate
                              ? 'rgba(34, 197, 94, 0.5)'
                              : 'rgba(16, 185, 129, 0.5)',
                    }}
                  >
                    {isInterviewer ? <SmartToyIcon sx={{ fontSize: 20 }} /> : <PersonIcon sx={{ fontSize: 20 }} />}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 850,
                          color: isInterviewer ? 'primary.main' : 'secondary.main',
                          fontSize: '0.78rem',
                          letterSpacing: 0,
                        }}
                      >
                        {item.speakerName}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.disabled' }}>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 750 }}>
                          {formatTime(item.timestamp, i18n.language)}
                        </Typography>
                      </Stack>
                      {item.isLive && (
                        <Chip
                          label={t('employer:interviewLive.candidateCard.newBadge')}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 850,
                            letterSpacing: 0,
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            border: '1px solid',
                            borderColor: 'rgba(245, 158, 11, 0.2)',
                          }}
                        />
                      )}
                    </Stack>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: isInterviewer ? pc.primary(0.03) : pc.actionDisabled(0.03),
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isInterviewer ? pc.primary(0.1) : pc.divider(0.5),
                        boxShadow: 'none',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 1.75, color: 'text.primary', fontWeight: 650 }}
                      >
                        {item.content}
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              );
            })}
            <div ref={transcriptEndRef} />
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
            <ForumIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.25 }} />
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 850, letterSpacing: 0 }}>
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

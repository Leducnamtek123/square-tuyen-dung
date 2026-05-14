import React, { useEffect, useRef } from 'react';
import { Box, Paper, Stack, Typography, Divider, Avatar, Chip } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { InterviewSession } from '@/types/models';

import { i18n, TFunction } from 'i18next';
import type { SSETranscript } from '../../../employerPages/InterviewPages/hooks/useInterviewSSE';
import type { InterviewTranscript } from '@/types/models';
import pc from '@/utils/muiColors';

interface InterviewTranscriptPanelProps {
  session: InterviewSession;
  t: TFunction;
  i18n: i18n;
  liveTranscripts?: SSETranscript[];
  isLive?: boolean;
}

type TranscriptItem = {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  id: number | string;
  isLive: boolean;
};

const EMPTY_LIVE_TRANSCRIPTS: SSETranscript[] = [];

const InterviewTranscriptPanel: React.FC<InterviewTranscriptPanelProps> = ({ session, t, i18n, liveTranscripts = EMPTY_LIVE_TRANSCRIPTS, isLive = false }) => {
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Merge existing + live transcripts, deduplicate by id
    const mergedTranscripts = React.useMemo(() => {
        const existingTranscripts = Array.isArray(session.transcripts) ? session.transcripts : [];
        const existingIds = new Set(existingTranscripts.map((transcript: InterviewTranscript) => transcript.id));
        const liveOnly = liveTranscripts.filter((lt) => !existingIds.has(lt.id));
        const mapped: TranscriptItem[] = existingTranscripts.map((transcript: InterviewTranscript) => ({
            speaker: transcript.speakerRole === 'ai_agent' ? 'interviewer' : 'candidate',
            text: transcript.content || transcript.text || '',
            timestamp: transcript.createAt ? new Date(transcript.createAt).toLocaleTimeString() : '',
            id: transcript.id,
            isLive: false,
        }));
        const liveMapped: TranscriptItem[] = liveOnly.map((lt) => ({
            speaker: lt.speakerRole === 'ai_agent' ? 'interviewer' : 'candidate',
            text: lt.content,
            timestamp: lt.createAt ? new Date(lt.createAt).toLocaleTimeString() : '',
            id: lt.id,
            isLive: true,
        }));
        return [...mapped, ...liveMapped];
    }, [liveTranscripts, session.transcripts]);

    // Auto-scroll when new live transcripts appear
    useEffect(() => {
        if (liveTranscripts.length > 0 && transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [liveTranscripts.length]);

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
                overflow: 'hidden'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
                <ForumIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: 0 }}>
                    {t('interviewDetail.subtitle.transcript')}
                </Typography>

                {/* Live indicator */}
                {isLive && (
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
                )}

                {mergedTranscripts.length > 0 && (
                        <Chip 
                        label={`${mergedTranscripts.length} ${t('common:labels.messages')}`} 
                        size="small" 
                        sx={{ 
                            ml: 'auto', 
                            fontWeight: 850, 
                            height: 24, 
                            fontSize: '0.75rem',
                            bgcolor: pc.primary( 0.08),
                            color: 'primary.main',
                            letterSpacing: 0,
                            border: '1px solid',
                            borderColor: pc.primary( 0.1)
                        }} 
                    />
                )}
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                pr: 2, 
                mr: -2,
                '&::-webkit-scrollbar': { width: '6px' }, 
                '&::-webkit-scrollbar-thumb': { bgcolor: pc.divider( 0.5), borderRadius: '10px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
            }}>
                {mergedTranscripts.length > 0 ? (
                    <Stack spacing={2.5}>
                        {mergedTranscripts.map((item) => {
                            const isInterviewer = item.speaker === 'interviewer';
                            const isNewLive = item.isLive;
                            return (
                                <Stack
                                    key={`${item.id}-${item.timestamp}-${item.speaker}`}
                                    direction="row"
                                    spacing={1.75}
                                    alignItems="flex-start"
                                    sx={{
                                        animation: isNewLive ? 'fadeSlideIn 0.5s ease-out' : 'none',
                                        '@keyframes fadeSlideIn': {
                                            from: { opacity: 0, transform: 'translateY(12px)' },
                                            to: { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    <Avatar sx={{ 
                                        width: 36, 
                                        height: 36, 
                                        bgcolor: isInterviewer ? 'primary.main' : 'secondary.main',
                                        boxShadow: 'none',
                                        border: '2px solid',
                                        borderColor: isInterviewer ? pc.primary(0.18) : pc.secondary(0.18)
                                    }}>
                                        {isInterviewer ? <SmartToyIcon sx={{ fontSize: 20 }} /> : <PersonIcon sx={{ fontSize: 20 }} />}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 850, color: isInterviewer ? 'primary.main' : 'secondary.main', fontSize: '0.78rem', letterSpacing: 0 }}>
                                                {isInterviewer ? t('interviewDetail.label.interviewer') : t('interviewDetail.label.candidate')}
                                            </Typography>
                                            {isNewLive && (
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
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.disabled' }}>
                                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 750 }}>
                                                    {item.timestamp}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Paper 
                                            elevation={0}
                                            sx={{ 
                                                p: 2, 
                                                bgcolor: isInterviewer ? pc.primary( 0.03) : pc.actionDisabled( 0.03), 
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: isInterviewer ? pc.primary( 0.1) : pc.divider( 0.5),
                                                boxShadow: 'none'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ lineHeight: 1.75, color: 'text.primary', fontWeight: 650 }}>
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

export default InterviewTranscriptPanel;



// @ts-nocheck
import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface Props {
  [key: string]: any;
}



const InterviewTranscriptPanel = ({ session, t, i18n }) => {
    return (
        <Paper sx={{
            p: 0,
            overflow: 'hidden',
            height: session.ai_overall_score !== null ? '50vh' : '75vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Box sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.history')}</Typography>
                {session.status === 'in_progress' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{
                            width: 8,
                            height: 8,
                            bgcolor: 'error.main',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s infinite'
                        }} />
                        <Typography variant="caption" color="error" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>{t('interviewDetail.label.liveMonitoring')}</Typography>
                    </Stack>
                )}
            </Box>

            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                bgcolor: 'background.paper',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 }
            }}>
                {Array.isArray(session.transcripts) && session.transcripts.length > 0 ? session.transcripts.map((t_msg, index) => (
                    <Box key={index} sx={{
                        alignSelf: t_msg.speaker_role === 'ai_agent' ? 'flex-start' : 'flex-end',
                        maxWidth: { xs: '90%', sm: '80%' }
                    }}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: t_msg.speaker_role === 'ai_agent' ? 'background.neutral' : 'primary.main',
                            color: t_msg.speaker_role === 'ai_agent' ? 'text.primary' : 'primary.contrastText',
                            position: 'relative',
                            boxShadow: (theme) => t_msg.speaker_role === 'ai_agent' ? 'none' : theme.shadows[1]
                        }}>
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{t_msg.content}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{
                            mt: 0.75,
                            display: 'block',
                            textAlign: t_msg.speaker_role === 'ai_agent' ? 'left' : 'right',
                            color: 'text.secondary',
                            opacity: 0.8,
                            fontWeight: 500
                        }}>
                            {t_msg.speaker_role === 'ai_agent' ? t('interviewDetail.label.aiInterviewer') : t('interviewDetail.label.candidateSmall')} - {new Date(t_msg.create_at).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Box>
                )) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <Stack alignItems="center" spacing={1}>
                            <Typography variant="body2">{t('interviewDetail.messages.noHistory')}</Typography>
                        </Stack>
                    </Box>
                )}
                <div id="transcript-end" />
            </Box>
        </Paper>
    );
};

export default InterviewTranscriptPanel;

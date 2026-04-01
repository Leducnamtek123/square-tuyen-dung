import React from 'react';
import { Box, Paper, Stack, Typography, Divider, Avatar, Chip, alpha, useTheme } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { InterviewSession } from '@/types/models';

import { i18n, TFunction } from 'i18next';

interface InterviewTranscriptPanelProps {
  session: InterviewSession;
  t: TFunction;
  i18n: i18n;
}

const InterviewTranscriptPanel: React.FC<InterviewTranscriptPanelProps> = ({ session, t, i18n }) => {
    const theme = useTheme();
    const transcripts = session.transcripts || [];

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
                overflow: 'hidden'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <ForumIcon color="primary" sx={{ fontSize: 24 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.subtitle.transcript')}
                </Typography>
                {transcripts.length > 0 && (
                    <Chip 
                        label={`${transcripts.length} ${t('common:labels.messages', { defaultValue: 'messages' })}`} 
                        size="small" 
                        sx={{ 
                            ml: 'auto', 
                            fontWeight: 900, 
                            height: 24, 
                            fontSize: '0.75rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            letterSpacing: '0.5px',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.1)
                        }} 
                    />
                )}
            </Stack>

            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                pr: 2, 
                mr: -2,
                '&::-webkit-scrollbar': { width: '6px' }, 
                '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.divider, 0.5), borderRadius: '10px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
            }}>
                {transcripts.length > 0 ? (
                    <Stack spacing={6}>
                        {transcripts.map((itemRaw, idx) => {
                            const item = itemRaw as Record<string, string>;
                            const isInterviewer = item.speaker === 'interviewer';
                            return (
                                <Stack key={idx} direction="row" spacing={3} alignItems="flex-start">
                                    <Avatar sx={{ 
                                        width: 44, 
                                        height: 44, 
                                        bgcolor: isInterviewer ? 'primary.main' : 'secondary.main',
                                        boxShadow: (theme) => isInterviewer ? theme.customShadows?.primary : theme.customShadows?.secondary,
                                        border: '2.5px solid',
                                        borderColor: isInterviewer ? alpha(theme.palette.primary.light, 0.5) : alpha(theme.palette.secondary.light, 0.5)
                                    }}>
                                        {isInterviewer ? <SmartToyIcon sx={{ fontSize: 24 }} /> : <PersonIcon sx={{ fontSize: 24 }} />}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: isInterviewer ? 'primary.main' : 'secondary.main', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1.5 }}>
                                                {isInterviewer ? t('interviewDetail.label.interviewer') : t('interviewDetail.label.candidate')}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.disabled' }}>
                                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                                    {item.timestamp || ''}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Paper 
                                            elevation={0}
                                            sx={{ 
                                                p: 3, 
                                                bgcolor: isInterviewer ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.action.disabled, 0.03), 
                                                borderRadius: isInterviewer ? '0px 20px 20px 20px' : '20px 0px 20px 20px',
                                                border: '1px solid',
                                                borderColor: isInterviewer ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.divider, 0.5),
                                                boxShadow: (theme) => isInterviewer ? 'none' : theme.customShadows?.z1
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
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 15, opacity: 0.6 }}>
                        <ForumIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 3, opacity: 0.2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 900, letterSpacing: '0.5px' }}>
                            {t('interviewDetail.messages.noTranscript')}
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontWeight: 600 }}>
                            {t('interviewDetail.messages.noTranscriptDesc', { defaultValue: 'No conversations recorded for this session.' })}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default InterviewTranscriptPanel;

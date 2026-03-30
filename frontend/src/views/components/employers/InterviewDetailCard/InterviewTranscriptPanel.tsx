import React from 'react';
import { Box, Paper, Stack, Typography, Divider, Avatar } from '@mui/material';
import { InterviewSession } from '@/types/models';

interface InterviewTranscriptPanelProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
  i18n: any;
}

const InterviewTranscriptPanel: React.FC<InterviewTranscriptPanelProps> = ({ session, t, i18n }) => {
    const transcripts = session.transcripts || [];

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: 600,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.transcript')}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' } }}>
                {transcripts.length > 0 ? (
                    <Stack spacing={3}>
                        {transcripts.map((item, idx) => (
                            <Stack key={idx} direction="row" spacing={2} alignItems="flex-start">
                                <Avatar sx={{ width: 32, height: 32, bgcolor: item.speaker === 'interviewer' ? 'primary.main' : 'secondary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {item.speaker === 'interviewer' ? 'AI' : 'C'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                            {item.speaker === 'interviewer' ? t('interviewDetail.label.interviewer') : t('interviewDetail.label.candidate')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.timestamp || ''}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                                        {item.text}
                                    </Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        {t('interviewDetail.messages.noTranscript')}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default InterviewTranscriptPanel;

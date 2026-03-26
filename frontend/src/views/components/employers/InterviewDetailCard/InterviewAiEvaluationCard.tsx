import React from 'react';
import { Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { InterviewSession } from './index';

interface InterviewAiEvaluationCardProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
  onTriggerAi: () => void;
}

const InterviewAiEvaluationCard: React.FC<InterviewAiEvaluationCardProps> = ({ session, t, onTriggerAi }) => {
    const hasResult = session.ai_overall_score !== null && session.ai_overall_score !== undefined;

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.grey?.[50] || '#f4f6f8'} 0%, ${theme.palette.background.paper} 100%)`,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.aiEvaluation')}</Typography>
            {hasResult ? (
                <Box sx={{ py: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h2" color="primary" sx={{ fontWeight: 800 }}>
                            {session.ai_overall_score}<Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>/10</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                            OVERALL SCORE
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('interviewDetail.label.technicalScore')}</Typography>
                            <Chip label={`${session.ai_technical_score || 0}/10`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('interviewDetail.label.communicationScore')}</Typography>
                            <Chip label={`${session.ai_communication_score || 0}/10`} size="small" color="info" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                    </Stack>

                    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}>
                            "{session.ai_summary || t('interviewDetail.messages.aiGenerating')}"
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onTriggerAi}
                        sx={{ mt: 3, borderRadius: 2 }}
                    >
                        {t('interviewDetail.actions.retryAi')}
                    </Button>
                </Box>
            ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    {session.status === 'processing' ? (
                        <>
                            <CircularProgress size={28} sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {t('interviewDetail.messages.aiAnalyzing')}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {session.status === 'completed' ? t('interviewDetail.messages.aiGenerating') : t('interviewDetail.messages.notEnded')}
                            </Typography>
                            {session.status === 'completed' && (
                                <Button
                                    variant="contained"
                                    onClick={onTriggerAi}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t('interviewDetail.actions.retryAi')}
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default InterviewAiEvaluationCard;

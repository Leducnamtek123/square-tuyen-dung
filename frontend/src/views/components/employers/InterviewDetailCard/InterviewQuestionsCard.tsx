import React from 'react';
import { Box, Divider, Paper, Typography, Stack, Chip } from '@mui/material';
import { InterviewSession } from '@/types/models';

interface InterviewQuestionsCardProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
}

const InterviewQuestionsCard: React.FC<InterviewQuestionsCardProps> = ({ session, t }) => {
    const questions = session.questions || [];
    
    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.questions')}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
                {questions.length > 0 ? (
                    questions.map((q, idx) => (
                        <Box key={idx} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                            <Stack direction="row" spacing={1.5}>
                                <Chip label={idx + 1} size="small" color="primary" sx={{ fontWeight: 700, height: 20, minWidth: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {q.text || q.questionText || (q as any).content}
                                </Typography>
                            </Stack>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        {t('interviewDetail.messages.noQuestions')}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

export default InterviewQuestionsCard;

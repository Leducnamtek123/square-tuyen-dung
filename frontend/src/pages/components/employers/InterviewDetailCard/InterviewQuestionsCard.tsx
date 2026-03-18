// @ts-nocheck
import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';

interface Props {
  [key: string]: any;
}



const InterviewQuestionsCard = ({ session, t }) => {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                {t('interviewDetail.actions.questionList')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {session.questions?.length > 0 ? session.questions.map((q, idx) => (
                    <Box key={q.id || idx} sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                            Q{idx + 1}:
                        </Typography>
                        <Typography variant="body2">{q.text}</Typography>
                    </Box>
                )) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {t('interviewDetail.messages.noQuestions')}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default InterviewQuestionsCard;

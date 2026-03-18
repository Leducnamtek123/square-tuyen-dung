// @ts-nocheck
import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';

interface Props {
  [key: string]: any;
}



const InterviewInfoCard = ({ session, t, i18n }) => {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.info')}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('interviewDetail.label.candidate')}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{session.candidateName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {session.candidateEmail || session.candidate_email || '---'}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('interviewDetail.label.position')}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{session.jobName || 'N/A'}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('interviewDetail.label.type')}</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {(session.type || session.interview_type || 'N/A')?.toUpperCase()}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('interviewDetail.label.schedule')}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                        {new Date(session.scheduledAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default InterviewInfoCard;

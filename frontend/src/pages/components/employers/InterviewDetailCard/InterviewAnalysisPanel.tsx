import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { InterviewSession } from './index';

interface InterviewAnalysisPanelProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
}

const InterviewAnalysisPanel: React.FC<InterviewAnalysisPanelProps> = ({ session, t }) => {
    if (session.ai_overall_score === null || session.ai_overall_score === undefined) {
        return null;
    }

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme: any) => theme.shadows[1],
            background: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.label.detailedAnalysis')}</Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
                        {t('interviewDetail.label.strengths')}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 1, '& li': { mb: 1, fontSize: '0.875rem', color: 'text.secondary', listStyleType: 'disc' } }}>
                        {Array.isArray(session.ai_strengths) ? session.ai_strengths.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                        )) : (session.ai_strengths ? <li style={{ listStyleType: 'none', marginLeft: -16 }}>{session.ai_strengths}</li> : <li>---</li>)}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="error.main" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%' }} />
                        {t('interviewDetail.label.weaknesses')}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 1, '& li': { mb: 1, fontSize: '0.875rem', color: 'text.secondary', listStyleType: 'disc' } }}>
                        {Array.isArray(session.ai_weaknesses) ? session.ai_weaknesses.map((w: string, i: number) => (
                            <li key={i}>{w}</li>
                        )) : (session.ai_weaknesses ? <li style={{ listStyleType: 'none', marginLeft: -16 }}>{session.ai_weaknesses}</li> : <li>---</li>)}
                    </Box>
                </Grid>
            </Grid>

            {session.ai_detailed_feedback && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.label.feedback')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {typeof session.ai_detailed_feedback === 'string' ? session.ai_detailed_feedback : JSON.stringify(session.ai_detailed_feedback, null, 2)}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default InterviewAnalysisPanel;

import React from 'react';
import { Box, Divider, Paper, Typography, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { InterviewSession } from '@/types/models';

interface InterviewAnalysisPanelProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
}

const InterviewAnalysisPanel: React.FC<InterviewAnalysisPanelProps> = ({ session, t }) => {
    const strengthsRaw = session.aiStrengths || session.ai_strengths;
    const strengths: string[] = Array.isArray(strengthsRaw) 
        ? strengthsRaw.filter((s): s is string => typeof s === 'string') 
        : (typeof strengthsRaw === 'string' ? strengthsRaw.split('\n').filter(Boolean) : []);
        
    const weaknessesRaw = session.aiWeaknesses || session.ai_weaknesses;
    const weaknesses: string[] = Array.isArray(weaknessesRaw)
        ? weaknessesRaw.filter((w): w is string => typeof w === 'string')
        : (typeof weaknessesRaw === 'string' ? weaknessesRaw.split('\n').filter(Boolean) : []);

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.analysis')}</Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                        <Typography variant="subtitle2" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                            <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: 20 }} />
                            {t('interviewDetail.label.strengths')}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                            {strengths.length > 0 ? strengths.map((item, idx) => (
                                <ListItem key={idx} sx={{ px: 0, alignItems: 'flex-start' }}>
                                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', lineHeight: 1.6 }} />
                                </ListItem>
                            )) : (
                                <Typography variant="body2" color="text.secondary">{t('interviewDetail.messages.noData')}</Typography>
                            )}
                        </List>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                        <Typography variant="subtitle2" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                            <ErrorOutlineIcon sx={{ mr: 1, fontSize: 20 }} />
                            {t('interviewDetail.label.weaknesses')}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                            {weaknesses.length > 0 ? weaknesses.map((item, idx) => (
                                <ListItem key={idx} sx={{ px: 0, alignItems: 'flex-start' }}>
                                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', lineHeight: 1.6 }} />
                                </ListItem>
                            )) : (
                                <Typography variant="body2" color="text.secondary">{t('interviewDetail.messages.noData')}</Typography>
                            )}
                        </List>
                    </Stack>
                </Grid>

                <Grid size={12}>
                    <Box sx={{ mt: 2, p: 2.5, bgcolor: 'background.neutral', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.label.detailedFeedback')}</Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                            {session.aiDetailedFeedback || session.ai_detailed_feedback || t('interviewDetail.messages.noDetails')}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default InterviewAnalysisPanel;

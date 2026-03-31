import React from 'react';
import { Box, Divider, Paper, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, alpha, useTheme } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FeedIcon from '@mui/icons-material/Feed';
import { InterviewSession } from '@/types/models';

interface InterviewAnalysisPanelProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
}

const InterviewAnalysisPanel: React.FC<InterviewAnalysisPanelProps> = ({ session, t }) => {
    const theme = useTheme();
    const strengthsRaw = session.aiStrengths || session.ai_strengths;
    const strengths: string[] = Array.isArray(strengthsRaw) 
        ? strengthsRaw.filter((s): s is string => typeof s === 'string') 
        : (typeof strengthsRaw === 'string' ? strengthsRaw.split('\n').filter(Boolean) : []);
        
    const weaknessesRaw = session.aiWeaknesses || session.ai_weaknesses;
    const weaknesses: string[] = Array.isArray(weaknessesRaw)
        ? weaknessesRaw.filter((w): w is string => typeof w === 'string')
        : (typeof weaknessesRaw === 'string' ? weaknessesRaw.split('\n').filter(Boolean) : []);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme: any) => theme.customShadows?.z1,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <AnalyticsIcon color="primary" sx={{ fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.subtitle.analysis')}
                </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />
            
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2.5}>
                        <Typography variant="subtitle2" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.75rem' }}>
                            <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: 18 }} />
                            {t('interviewDetail.label.strengths')}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                            {strengths.length > 0 ? strengths.map((item, idx) => (
                                <ListItem 
                                    key={idx} 
                                    sx={{ 
                                        px: 2.5, 
                                        py: 2, 
                                        alignItems: 'flex-start', 
                                        bgcolor: alpha(theme.palette.success.main, 0.04), 
                                        borderRadius: 3, 
                                        mb: 1.5, 
                                        border: '1px solid', 
                                        borderColor: alpha(theme.palette.success.main, 0.1) 
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', lineHeight: 1.6, fontWeight: 700, color: 'success.dark' }} />
                                </ListItem>
                            )) : (
                                <Box sx={{ py: 6, textAlign: 'center', bgcolor: alpha(theme.palette.action.disabled, 0.03), borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>{t('interviewDetail.messages.noData')}</Typography>
                                </Box>
                            )}
                        </List>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2.5}>
                        <Typography variant="subtitle2" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.75rem' }}>
                            <ErrorOutlineIcon sx={{ mr: 1, fontSize: 18 }} />
                            {t('interviewDetail.label.weaknesses')}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                            {weaknesses.length > 0 ? weaknesses.map((item, idx) => (
                                <ListItem 
                                    key={idx} 
                                    sx={{ 
                                        px: 2.5, 
                                        py: 2, 
                                        alignItems: 'flex-start', 
                                        bgcolor: alpha(theme.palette.error.main, 0.04), 
                                        borderRadius: 3, 
                                        mb: 1.5, 
                                        border: '1px solid', 
                                        borderColor: alpha(theme.palette.error.main, 0.1) 
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                        <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', lineHeight: 1.6, fontWeight: 700, color: 'error.dark' }} />
                                </ListItem>
                            )) : (
                                <Box sx={{ py: 6, textAlign: 'center', bgcolor: alpha(theme.palette.action.disabled, 0.03), borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>{t('interviewDetail.messages.noData')}</Typography>
                                </Box>
                            )}
                        </List>
                    </Stack>
                </Grid>

                <Grid size={12}>
                    <Box sx={{ 
                        p: 5, 
                        bgcolor: alpha(theme.palette.primary.main, 0.02), 
                        borderRadius: 4, 
                        borderLeft: '8px solid', 
                        borderLeftColor: 'primary.main', 
                        boxShadow: (theme: any) => theme.customShadows?.z1,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        borderLeftWidth: '8px'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                            <FeedIcon color="primary" sx={{ fontSize: 24 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'primary.main', fontSize: '0.85rem' }}>
                                {t('interviewDetail.label.detailedFeedback')}
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ lineHeight: 2, color: 'text.primary', fontWeight: 700, whiteSpace: 'pre-wrap' }}>
                            {session.aiDetailedFeedback || session.ai_detailed_feedback || t('interviewDetail.messages.noDetails')}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default InterviewAnalysisPanel;

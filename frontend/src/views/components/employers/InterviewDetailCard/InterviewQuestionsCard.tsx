import React from 'react';
import { Box, Divider, Paper, Typography, Stack, Chip, alpha, useTheme } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import { InterviewSession } from '@/types/models';

interface InterviewQuestionsCardProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
}

const InterviewQuestionsCard: React.FC<InterviewQuestionsCardProps> = ({ session, t }) => {
    const theme = useTheme();
    const questions = session.questions || [];
    
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
                <QuizIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.subtitle.questions')}
                </Typography>
                <Chip 
                    label={questions.length} 
                    size="small" 
                    sx={{ 
                        ml: 1, 
                        fontWeight: 900, 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        color: 'primary.main',
                        height: 20,
                        fontSize: '0.75rem',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1)
                    }} 
                />
            </Stack>

            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

            <Stack spacing={2.5}>
                {questions.length > 0 ? (
                    questions.map((q, idx) => (
                        <Box 
                            key={idx} 
                            sx={{ 
                                p: 3, 
                                bgcolor: alpha(theme.palette.action.disabled, 0.03), 
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                    transform: 'translateX(4px)',
                                    boxShadow: (theme: any) => theme.customShadows?.z8
                                },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                <Box 
                                    sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        borderRadius: 1.5, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        fontWeight: 900,
                                        fontSize: '0.85rem',
                                        boxShadow: (theme: any) => theme.customShadows?.primary,
                                        flexShrink: 0
                                    }} 
                                >
                                    {idx + 1}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.8, pt: 0.5 }}>
                                    {q.text || q.questionText || (q as any).content}
                                </Typography>
                            </Stack>
                        </Box>
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8, bgcolor: alpha(theme.palette.action.disabled, 0.04), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                        <HelpOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800 }}>
                            {t('interviewDetail.messages.noQuestions')}
                        </Typography>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

export default InterviewQuestionsCard;

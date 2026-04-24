import React from 'react';
import { Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography, LinearProgress, alpha, useTheme } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { InterviewSession } from '@/types/models';
import { TFunction } from 'i18next';
import pc from '@/utils/muiColors';

interface InterviewAiEvaluationCardProps {
  session: InterviewSession;
  effectiveStatus?: string;
  t: TFunction;
  onTriggerAi: () => void;
  isTriggeringAi?: boolean;
}

const InterviewAiEvaluationCard: React.FC<InterviewAiEvaluationCardProps> = ({ session, effectiveStatus, t, onTriggerAi, isTriggeringAi = false }) => {
    const theme = useTheme();
    const hasResult = (session.aiOverallScore ?? session.ai_overall_score) !== null && (session.aiOverallScore ?? session.ai_overall_score) !== undefined;
    const isProcessing = effectiveStatus === 'processing' || session.status === 'processing';

    return (
        <Paper 
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: (theme) => theme.palette.mode === 'dark' 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${pc.bgPaper( 0.8)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${pc.bgPaper( 1)} 100%)`,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => theme.customShadows?.z1,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{ 
                    p: 0.75, 
                    borderRadius: 1.5, 
                    bgcolor: pc.primary( 0.1), 
                    color: 'primary.main',
                    display: 'flex'
                }}>
                    <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.subtitle.aiEvaluation')}
                </Typography>
            </Stack>

            {hasResult ? (
                <Box sx={{ py: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography variant="h1" color="primary" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-3px', fontSize: '4.5rem' }}>
                            {session.aiOverallScore ?? session.ai_overall_score}<Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 800, color: 'text.disabled', ml: 1, letterSpacing: 0 }}>/10</Box>
                        </Typography>
                        <Chip 
                            label="AI OVERALL QUALITY" 
                            size="small" 
                            sx={{ 
                                fontWeight: 900, 
                                fontSize: '0.65rem', 
                                height: 22, 
                                letterSpacing: 1.5, 
                                borderRadius: 1.5,
                                bgcolor: pc.primary( 0.1),
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: pc.primary( 0.15),
                                px: 1
                            }} 
                        />
                    </Box>

                    <Divider sx={{ mb: 5, borderStyle: 'dashed' }} />

                    <Stack spacing={4}>
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                    <PsychologyIcon sx={{ fontSize: 18, color: 'primary.main' }} /> {t('interviewDetail.label.technicalScore')}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1rem' }}>
                                    {(session.aiTechnicalScore ?? session.ai_technical_score) || 0}<Box component="span" sx={{ color: 'text.disabled', ml: 0.25, fontWeight: 700, fontSize: '0.8rem' }}>/10</Box>
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={((session.aiTechnicalScore ?? session.ai_technical_score) || 0) * 10} 
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5, 
                                    bgcolor: pc.primary( 0.05),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        backgroundImage: (theme) => `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                                    }
                                }}
                            />
                        </Box>
                        
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                    <AutoAwesomeIcon sx={{ fontSize: 18, color: 'info.main' }} /> {t('interviewDetail.label.communicationScore')}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'info.main', fontSize: '1rem' }}>
                                    {(session.aiCommunicationScore ?? session.ai_communication_score) || 0}<Box component="span" sx={{ color: 'text.disabled', ml: 0.25, fontWeight: 700, fontSize: '0.8rem' }}>/10</Box>
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={((session.aiCommunicationScore ?? session.ai_communication_score) || 0) * 10} 
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5, 
                                    bgcolor: pc.info( 0.05),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        backgroundImage: (theme) => `linear-gradient(to right, ${theme.palette.info.light}, ${theme.palette.info.main})`,
                                        bgcolor: 'info.main'
                                    }
                                }}
                            />
                        </Box>
                    </Stack>

                    <Box sx={{ 
                        mt: 6, 
                        p: 3, 
                        bgcolor: pc.actionDisabled( 0.05), 
                        borderRadius: 3, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        position: 'relative'
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 2, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                            "{session.aiSummary || session.ai_summary || t('interviewDetail.messages.aiGenerating')}"
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onTriggerAi}
                        disabled={isTriggeringAi}
                        startIcon={<AutoAwesomeIcon />}
                        sx={{ 
                            mt: 5, 
                            borderRadius: 3, 
                            fontWeight: 900, 
                            borderStyle: 'dashed',
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            borderWidth: '1.5px',
                            '&:hover': {
                                borderWidth: '1.5px',
                                bgcolor: pc.primary( 0.04)
                            }
                        }}
                    >
                        {t('interviewDetail.actions.retryAi')}
                    </Button>
                </Box>
            ) : (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    {isProcessing ? (
                        <>
                            <CircularProgress size={48} thickness={5} sx={{ mb: 4, color: 'primary.main' }} />
                            <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>
                                {t('interviewDetail.messages.aiAnalyzing')}
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 2, fontWeight: 700 }}>
                                {t('interviewDetail.messages.aiAnalyzingDesc')}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Box sx={{ mb: 4, position: 'relative', display: 'inline-flex' }}>
                                <AutoAwesomeIcon sx={{ fontSize: 72, color: 'text.disabled', opacity: 0.15 }} />
                                <CircularProgress
                                    variant="determinate"
                                    value={100}
                                    size={96}
                                    sx={{ color: 'divider', position: 'absolute', top: -12, left: -12, opacity: 0.5 }}
                                />
                            </Box>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontWeight: 800, maxWidth: 300, mx: 'auto', lineHeight: 1.8 }}>
                                {effectiveStatus === 'completed' || session.status === 'completed' ? t('interviewDetail.messages.aiNeedsTrigger') : t('interviewDetail.messages.notEnded')}
                            </Typography>
                            {(effectiveStatus === 'completed' || session.status === 'completed') && (
                                <Button
                                    variant="contained"
                                    onClick={onTriggerAi}
                                    disabled={isTriggeringAi}
                                    startIcon={<AutoAwesomeIcon />}
                                    sx={{ 
                                        borderRadius: 3, 
                                        fontWeight: 900, 
                                        boxShadow: (theme) => theme.customShadows?.primary,
                                        px: 6,
                                        py: 2,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    {t('interviewDetail.actions.triggerAi')}
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

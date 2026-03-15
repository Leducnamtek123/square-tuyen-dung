import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, Chip, Button, CircularProgress, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import interviewService from '../../../../services/interviewService';
import { transformInterviewSession } from '../../../../utils/transformers';

const InterviewDetailCard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const recordingUrl = session?.recordingUrl || session?.recording_url || null;

    const fetchDetail = useCallback(async () => {
        try {
            const res = await interviewService.getSessionDetail(id);
            setSession(transformInterviewSession(res));
        } catch (error) {
            console.error('Error fetching session detail', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();

        // Polling every 5 seconds if session is active
        let interval;
        if (session?.status === 'in_progress') {
            interval = setInterval(fetchDetail, 5000);
        }

        return () => clearInterval(interval);
    }, [fetchDetail, session?.status]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

    if (!session) return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">{t('interviewDetail.messages.notFound')}</Typography>
            <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>{t('common:actions.close')}</Button>
        </Box>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'cancelled': return 'error';
            default: return 'warning';
        }
    };

    return (
        <Box sx={{
            px: { xs: 1, sm: 2 },
            py: { xs: 2, sm: 2 },
            backgroundColor: 'background.paper',
            borderRadius: 2
        }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}
            >
                {t('interviewDetail.actions.backToList')}
            </Button>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                spacing={2}
                mb={4}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {t('interviewDetail.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                        {t('interviewDetail.label.roomCode')}: <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{session.room_name}</Box> | ID: {session.id}
                    </Typography>
                </Box>
                <Chip
                    label={t(`interviewLive.statuses.${session.status}`, { defaultValue: session.status?.replaceAll('_', ' ')?.toUpperCase() })}
                    color={getStatusColor(session.status)}
                    sx={{
                        fontWeight: 700,
                        px: 1,
                        borderRadius: 1.5,
                        boxShadow: (theme) => theme.customShadows?.small || theme.shadows[1]
                    }}
                />
            </Stack>
            <Grid container spacing={3}>
                {/* Left Column: Info & Evaluation */}
                <Grid
                    size={{
                        xs: 12,
                        md: 4
                    }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: (theme) => theme.customShadows?.card || 1
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
                                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{new Date(session.scheduledAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {recordingUrl && (
                            <Paper sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: (theme) => theme.customShadows?.card || 1
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                                    {t('interviewDetail.subtitle.recording')}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box
                                        component="video"
                                        src={recordingUrl}
                                        controls
                                        preload="metadata"
                                        sx={{
                                            width: '100%',
                                            borderRadius: 2,
                                            backgroundColor: 'grey.900'
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        component="a"
                                        href={recordingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {t('interviewDetail.actions.openRecording')}
                                    </Button>
                                </Box>
                            </Paper>
                        )}

                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.grey?.[50] || '#f4f6f8'} 0%, ${theme.palette.background.paper} 100%)`,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: (theme) => theme.customShadows?.card || theme.shadows[1]
                        }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.aiEvaluation')}</Typography>
                            {session.ai_overall_score !== null && session.ai_overall_score !== undefined ? (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="h2" color="primary" sx={{ fontWeight: 800 }}>
                                        {session.ai_overall_score}<Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>/10</Box>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500, color: 'text.secondary' }}>
                                        {session.ai_summary || t('interviewDetail.messages.aiGenerating')}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            mt: 3,
                                            borderRadius: 2,
                                            background: (theme) => theme.palette.primary?.gradient || theme.palette.primary.main,
                                            boxShadow: (theme) => theme.customShadows?.small || theme.shadows[1]
                                        }}
                                    >
                                        {t('interviewDetail.actions.viewReport')}
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <CircularProgress size={28} sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {session.status === 'completed' ? t('interviewDetail.messages.aiAnalyzing') : t('interviewDetail.messages.notEnded')}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Grid>

                {/* Right Column: Transcript */}
                <Grid
                    size={{
                        xs: 12,
                        md: 8
                    }}>
                    <Paper sx={{
                        p: 0,
                        overflow: 'hidden',
                        height: { xs: '60vh', md: '75vh' },
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: (theme) => theme.customShadows?.card || theme.shadows[1]
                    }}>
                        <Box sx={{
                            p: 2.5,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.history')}</Typography>
                            {session.status === 'in_progress' && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        bgcolor: 'error.main',
                                        borderRadius: '50%',
                                        animation: 'pulse 1.5s infinite'
                                    }} />
                                    <Typography variant="caption" color="error" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>{t('interviewDetail.label.liveMonitoring')}</Typography>
                                </Stack>
                            )}
                        </Box>

                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: { xs: 2, sm: 3 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            bgcolor: 'background.paper',
                            '&::-webkit-scrollbar': { width: 6 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 }
                        }}>
                            {Array.isArray(session.transcripts) && session.transcripts.length > 0 ? session.transcripts.map((t_msg, index) => (
                                <Box key={index} sx={{
                                    alignSelf: t_msg.speaker_role === 'ai_agent' ? 'flex-start' : 'flex-end',
                                    maxWidth: { xs: '90%', sm: '80%' }
                                }}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: t_msg.speaker_role === 'ai_agent' ? 'background.neutral' : 'primary.main',
                                        color: t_msg.speaker_role === 'ai_agent' ? 'text.primary' : 'primary.contrastText',
                                        position: 'relative',
                                        boxShadow: (theme) => t_msg.speaker_role === 'ai_agent' ? 'none' : (theme.customShadows?.small || theme.shadows[1])
                                    }}>
                                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{t_msg.content}</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{
                                        mt: 0.75,
                                        display: 'block',
                                        textAlign: t_msg.speaker_role === 'ai_agent' ? 'left' : 'right',
                                        color: 'text.secondary',
                                        opacity: 0.8,
                                        fontWeight: 500
                                    }}>
                                        {t_msg.speaker_role === 'ai_agent' ? t('interviewDetail.label.aiInterviewer') : t('interviewDetail.label.candidateSmall')} • {new Date(t_msg.create_at).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            )) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <Stack alignItems="center" spacing={1}>
                                        <Typography variant="body2">{t('interviewDetail.messages.noHistory')}</Typography>
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </Box>
    );
};

export default InterviewDetailCard;

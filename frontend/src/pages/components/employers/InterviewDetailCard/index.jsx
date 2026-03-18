import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, Chip, Button, CircularProgress, Stack, TextField, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import interviewService from '../../../../services/interviewService';
import { transformInterviewSession } from '../../../../utils/transformers';
import { ROUTES } from '../../../../configs/constants';

const InterviewDetailCard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingEval, setSubmittingEval] = useState(false);
    const [evalForm, setEvalForm] = useState({
        attitude_score: 0,
        professional_score: 0,
        result: 'pending',
        comments: '',
        proposed_salary: 0
    });

    const recordingUrl = session?.recordingUrl || session?.recording_url || null;

    const fetchDetail = useCallback(async () => {
        try {
            const res = await interviewService.getSessionDetail(id);
            const transformed = transformInterviewSession(res);
            setSession(transformed);
            
            // Pre-fill form if evaluation already exists
            if (transformed.evaluations?.length > 0) {
                const lastEval = transformed.evaluations[transformed.evaluations.length - 1];
                setEvalForm({
                    attitude_score: lastEval.attitude_score || 0,
                    professional_score: lastEval.professional_score || 0,
                    result: lastEval.result || 'pending',
                    comments: lastEval.comments || '',
                    proposed_salary: lastEval.proposed_salary || 0
                });
            }
        } catch (error) {
            console.error('Error fetching session detail', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleEvalChange = (e) => {
        const { name, value } = e.target;
        setEvalForm(prev => ({ ...prev, [name]: value }));
    };

    const submitHRInfo = async () => {
        setSubmittingEval(true);
        try {
            await interviewService.submitEvaluation({
                interview: id,
                ...evalForm,
                overall_score: (Number(evalForm.attitude_score) + Number(evalForm.professional_score)) / 2
            });
            await fetchDetail();
        } catch (error) {
            console.error('Error submitting evaluation', error);
        } finally {
            setSubmittingEval(false);
        }
    };

    useEffect(() => {
        fetchDetail();

        // Polling if session is active or AI assessment is still processing
        let interval;
        const resultReady = session?.ai_overall_score !== null && session?.ai_overall_score !== undefined;
        const needsPolling = session?.status === 'in_progress' || ((session?.status === 'completed' || session?.status === 'processing') && !resultReady);

        if (needsPolling) {
            interval = setInterval(fetchDetail, 5000);
        }

        return () => clearInterval(interval);
    }, [fetchDetail, session?.status, session?.ai_overall_score]);

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
            case 'processing': return 'info';
            default: return 'warning';
        }
    };

    const canJoinLiveRoom = !!session?.id && session.status !== 'cancelled' && session.status !== 'completed';

    const currentEval = session.evaluations?.length > 0 ? session.evaluations[session.evaluations.length - 1] : null;

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
                        boxShadow: (theme) => theme.shadows[1]
                    }}
                />
                <Button
                    variant="contained"
                    disabled={!canJoinLiveRoom}
                    onClick={() => navigate(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', session.id)}`)}
                    sx={{ borderRadius: 2, minWidth: 180 }}
                >
                    {t('common:actions.joinNow')}
                </Button>
            </Stack>

            <Grid container spacing={3}>
                {/* Left Column: Info & AI Evaluation & HR Evaluation */}
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
                                boxShadow: (theme) => theme.shadows[1]
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

                        {/* AI Score Card */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.grey?.[50] || '#f4f6f8'} 0%, ${theme.palette.background.paper} 100%)`,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: (theme) => theme.shadows[1]
                        }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>{t('interviewDetail.subtitle.aiEvaluation')}</Typography>
                            {session.ai_overall_score !== null && session.ai_overall_score !== undefined ? (
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
                                        onClick={async () => {
                                            try {
                                                await interviewService.triggerAiEvaluation(session.id);
                                                fetchDetail();
                                            } catch (e) { console.error(e); }
                                        }}
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
                                                    onClick={async () => {
                                                        try {
                                                            await interviewService.triggerAiEvaluation(session.id);
                                                            fetchDetail();
                                                        } catch (e) { console.error(e); }
                                                    }}
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

                        {/* HR Evaluation Form */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: (theme) => theme.shadows[1],
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : '#fff'
                        }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                {t('interviewDetail.actions.hrEvaluation')}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={2.5}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label={t('interviewDetail.actions.attitudeScore')}
                                        name="attitude_score"
                                        type="number"
                                        fullWidth
                                        value={evalForm.attitude_score}
                                        onChange={handleEvalChange}
                                        slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                                    />
                                    <TextField
                                        label={t('interviewDetail.actions.professionalScore')}
                                        name="professional_score"
                                        type="number"
                                        fullWidth
                                        value={evalForm.professional_score}
                                        onChange={handleEvalChange}
                                        slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                                    />
                                </Stack>
                                <TextField
                                    select
                                    label={t('interviewDetail.actions.resultLabel')}
                                    name="result"
                                    fullWidth
                                    value={evalForm.result}
                                    onChange={handleEvalChange}
                                >
                                    <MenuItem value="pending">{t('interviewDetail.actions.pending')}</MenuItem>
                                    <MenuItem value="passed">{t('interviewDetail.actions.passed')}</MenuItem>
                                    <MenuItem value="failed">{t('interviewDetail.actions.failed')}</MenuItem>
                                </TextField>
                                <TextField
                                    label={t('interviewDetail.actions.comments')}
                                    name="comments"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={evalForm.comments}
                                    onChange={handleEvalChange}
                                />
                                <TextField
                                    label={t('interviewDetail.actions.proposedSalary')}
                                    name="proposed_salary"
                                    type="number"
                                    fullWidth
                                    value={evalForm.proposed_salary}
                                    onChange={handleEvalChange}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    disabled={submittingEval || session.status !== 'completed'}
                                    onClick={submitHRInfo}
                                    sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}
                                >
                                    {submittingEval ? <CircularProgress size={24} color="inherit" /> : t('interviewDetail.actions.submitEvaluation')}
                                </Button>
                            </Stack>
                        </Paper>

                        {/* Questions List Section */}
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
                    </Box>
                </Grid>

                {/* Right Column: Detailed Analysis & Transcript */}
                <Grid
                    size={{
                        xs: 12,
                        md: 8
                    }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Detailed Analysis Section (if results ready) */}
                        {session.ai_overall_score !== null && (
                            <Paper sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: (theme) => theme.shadows[1],
                                background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
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
                                            {Array.isArray(session.ai_strengths) ? session.ai_strengths.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            )) : (session.ai_strengths ? <li style={{listStyleType: 'none', marginLeft: -16}}>{session.ai_strengths}</li> : <li>---</li>)}
                                        </Box>
                                    </Grid>
                                    
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="error.main" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%' }} />
                                            {t('interviewDetail.label.weaknesses')}
                                        </Typography>
                                        <Box component="ul" sx={{ pl: 2, mt: 1, '& li': { mb: 1, fontSize: '0.875rem', color: 'text.secondary', listStyleType: 'disc' } }}>
                                            {Array.isArray(session.ai_weaknesses) ? session.ai_weaknesses.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            )) : (session.ai_weaknesses ? <li style={{listStyleType: 'none', marginLeft: -16}}>{session.ai_weaknesses}</li> : <li>---</li>)}
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
                        )}

                        {/* Transcript History */}
                        <Paper sx={{
                            p: 0,
                            overflow: 'hidden',
                            height: session.ai_overall_score !== null ? '50vh' : '75vh',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: (theme) => theme.shadows[1]
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
                                            boxShadow: (theme) => t_msg.speaker_role === 'ai_agent' ? 'none' : theme.shadows[1]
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
                                <div id="transcript-end" />
                            </Box>
                        </Paper>
                    </Box>
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

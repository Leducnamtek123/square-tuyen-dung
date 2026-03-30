'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Typography, Grid2 as Grid } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../configs/constants';
import InterviewAiEvaluationCard from './InterviewAiEvaluationCard';
import InterviewAnalysisPanel from './InterviewAnalysisPanel';
import InterviewHrEvaluationForm from './InterviewHrEvaluationForm';
import InterviewInfoCard from './InterviewInfoCard';
import InterviewQuestionsCard from './InterviewQuestionsCard';
import InterviewRecordingCard from './InterviewRecordingCard';
import InterviewTranscriptPanel from './InterviewTranscriptPanel';
import { useInterviewDetail, useInterviewMutations } from '../hooks/useEmployerQueries';
import interviewService from '../../../../services/interviewService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';

export interface EvalFormType {
  attitude_score: number | string;
  professional_score: number | string;
  result: string;
  comments: string;
  proposed_salary: number | string;
}

const InterviewDetailCard = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useRouter();
    const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
    
    const [evalForm, setEvalForm] = useState<EvalFormType>({
        attitude_score: 0,
        professional_score: 0,
        result: 'pending',
        comments: '',
        proposed_salary: 0
    });

    // Polling logic: Refetch every 5s if session is active or processing
    const { data: session, isLoading: loading } = useInterviewDetail(id);
    const { isMutating: isInterviewMutating } = useInterviewMutations();
    
    const [isSubmittingEval, setIsSubmittingEval] = useState(false);

    useEffect(() => {
        if (session?.evaluations?.length) {
            const lastEval = session.evaluations[session.evaluations.length - 1];
            setEvalForm({
                attitude_score: lastEval.attitude_score || lastEval.attitudeScore || 0,
                professional_score: lastEval.professional_score || lastEval.professionalScore || 0,
                result: lastEval.result || 'pending',
                comments: lastEval.comments || '',
                proposed_salary: lastEval.proposed_salary || lastEval.proposedSalary || 0
            });
        }
    }, [session]);

    const handleEvalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEvalForm(prev => ({ ...prev, [name]: value }));
    };

    const submitHRInfo = async () => {
        setIsSubmittingEval(true);
        try {
            await interviewService.submitEvaluation({
                interview: Number(id),
                attitudeScore: Number(evalForm.attitude_score),
                professionalScore: Number(evalForm.professional_score),
                overallScore: (Number(evalForm.attitude_score) + Number(evalForm.professional_score)) / 2,
                result: evalForm.result as any,
                comments: evalForm.comments,
                proposedSalary: Number(evalForm.proposed_salary),
            });
            toastMessages.success(t('interview:interviewDetail.messages.evaluationSuccess'));
        } catch (error) {
            errorHandling(error as AxiosError<{ errors?: ApiError }>);
        } finally {
            setIsSubmittingEval(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    if (!session) return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">{t('interview:interviewDetail.messages.notFound')}</Typography>
            <Button onClick={() => navigate.back()} sx={{ mt: 2 }}>{t('common:actions.close')}</Button>
        </Box>
    );

    const getStatusColor = (status: string | undefined): "success" | "primary" | "error" | "info" | "warning" => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'cancelled': return 'error';
            case 'processing': return 'info';
            default: return 'warning';
        }
    };

    const canJoinLiveRoom = session.status !== 'cancelled' && session.status !== 'completed';
    const recordingUrl = session.recordingUrl || (session as any).recording_url || null;

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate.back()} sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
                {t('interview:interviewDetail.actions.backToList')}
            </Button>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={4}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {t('interview:interviewDetail.title')}
                        </Typography>
                        <Chip
                            label={t(`interview:interviewLive.statuses.${session.status}`, { defaultValue: session.status?.replaceAll('_', ' ')?.toUpperCase() })}
                            color={getStatusColor(session.status)}
                            size="small"
                            sx={{ fontWeight: 700, borderRadius: '6px' }}
                        />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {t('interview:interviewDetail.label.roomCode')}: <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{session.roomName}</Box> | ID: {session.id}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    disabled={!canJoinLiveRoom}
                    onClick={() => navigate.push(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', session.id.toString())}`)}
                    sx={{ borderRadius: 2, minWidth: 180, boxShadow: 'none' }}
                >
                    {t('common:actions.joinNow')}
                </Button>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <InterviewInfoCard session={session} t={t} i18n={i18n} />
                        <InterviewRecordingCard recordingUrl={recordingUrl} t={t} />
                        <InterviewAiEvaluationCard
                            session={session}
                            t={t}
                            onTriggerAi={async () => {
                                try {
                                    await interviewService.triggerAiEvaluation(session.id);
                                    toastMessages.success(t('interview:interviewDetail.messages.aiTriggerSuccess'));
                                } catch (e) {
                                    errorHandling(e as AxiosError<{ errors?: ApiError }>);
                                }
                            }}
                        />
                        <InterviewHrEvaluationForm
                            evalForm={evalForm}
                            onChange={handleEvalChange}
                            onSubmit={submitHRInfo}
                            disabled={isSubmittingEval || session.status !== 'completed'}
                            submitting={isSubmittingEval}
                            t={t}
                        />
                        <InterviewQuestionsCard session={session} t={t} />
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        <InterviewAnalysisPanel session={session} t={t} />
                        <InterviewTranscriptPanel session={session} t={t} i18n={i18n} />
                    </Stack>
                </Grid>
            </Grid>
            
            {(isInterviewMutating || isSubmittingEval) && <BackdropLoading />}
        </Box>
    );
};

export default InterviewDetailCard;

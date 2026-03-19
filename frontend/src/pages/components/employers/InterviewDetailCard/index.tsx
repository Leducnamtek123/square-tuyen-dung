import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import interviewService from '../../../../services/interviewService';
import { transformInterviewSession } from '../../../../utils/transformers';
import { ROUTES } from '../../../../configs/constants';
import InterviewAiEvaluationCard from './InterviewAiEvaluationCard';
import InterviewAnalysisPanel from './InterviewAnalysisPanel';
import InterviewHrEvaluationForm from './InterviewHrEvaluationForm';
import InterviewInfoCard from './InterviewInfoCard';
import InterviewQuestionsCard from './InterviewQuestionsCard';
import InterviewRecordingCard from './InterviewRecordingCard';
import InterviewTranscriptPanel from './InterviewTranscriptPanel';

export interface Evaluation {
  attitude_score: number;
  professional_score: number;
  result: string;
  comments: string;
  proposed_salary: number;
}

export interface InterviewSession {
  id: number;
  status: string;
  room_name: string;
  ai_overall_score?: number | null;
  ai_technical_score?: number | null;
  ai_communication_score?: number | null;
  ai_summary?: string | null;
  ai_strengths?: string[] | string;
  ai_weaknesses?: string[] | string;
  ai_detailed_feedback?: string | any;
  recordingUrl?: string;
  recording_url?: string;
  evaluations?: Evaluation[];
  candidateName?: string;
  candidateEmail?: string;
  candidate_email?: string;
  jobName?: string;
  type?: string;
  interview_type?: string;
  scheduledAt?: string;
  questions?: any[];
  transcripts?: any[];
}

export interface EvalFormType {
  attitude_score: number | string;
  professional_score: number | string;
  result: string;
  comments: string;
  proposed_salary: number | string;
}



const InterviewDetailCard = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
    const [evalForm, setEvalForm] = useState<EvalFormType>({
        attitude_score: 0,
        professional_score: 0,
        result: 'pending',
        comments: '',
        proposed_salary: 0
    });

    const { data: session, isLoading: loading } = useQuery<InterviewSession>({
        queryKey: ['interview-session-detail', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await interviewService.getSessionDetail(id as string) as any;
            return transformInterviewSession(res) as InterviewSession;
        },
        refetchInterval: (query) => {
            const currentSession = query.state.data;
            if (!currentSession) return false;

            const resultReady = currentSession.ai_overall_score !== null && currentSession.ai_overall_score !== undefined;
            const needsPolling = currentSession.status === 'in_progress'
                || ((currentSession.status === 'completed' || currentSession.status === 'processing') && !resultReady);
            return needsPolling ? 5000 : false;
        },
    });

    const submitEvaluationMutation = useMutation({
        mutationFn: (payload: EvalFormType & { interview: string | undefined }) => interviewService.submitEvaluation(payload as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interview-session-detail', id] });
        },
    });

    const triggerAiMutation = useMutation({
        mutationFn: (sessionId: number | string) => interviewService.triggerAiEvaluation(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interview-session-detail', id] });
        },
    });

    const recordingUrl = session?.recordingUrl || session?.recording_url || null;

    useEffect(() => {
        if (!session?.evaluations?.length) {
            return;
        }
        const lastEval = session.evaluations[session.evaluations.length - 1];
        setEvalForm({
            attitude_score: lastEval.attitude_score || 0,
            professional_score: lastEval.professional_score || 0,
            result: lastEval.result || 'pending',
            comments: lastEval.comments || '',
            proposed_salary: lastEval.proposed_salary || 0
        });
    }, [session?.id, session?.evaluations]);

    const handleEvalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEvalForm(prev => ({ ...prev, [name]: value }));
    };

    const submitHRInfo = async () => {
        try {
            await submitEvaluationMutation.mutateAsync({
                interview: id,
                ...evalForm,
            });
        } catch (error) {
            console.error('Error submitting evaluation', error);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

    if (!session) return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">{t('interviewDetail.messages.notFound')}</Typography>
            <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>{t('common:actions.close')}</Button>
        </Box>
    );

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'cancelled': return 'error';
            case 'processing': return 'info';
            default: return 'warning';
        }
    };

    const canJoinLiveRoom = !!session?.id && session.status !== 'cancelled' && session.status !== 'completed';

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
                    onClick={() => navigate(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', session.id.toString())}`)}
                    sx={{ borderRadius: 2, minWidth: 180 }}
                >
                    {t('common:actions.joinNow')}
                </Button>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <InterviewInfoCard session={session} t={t} i18n={i18n} />
                        <InterviewRecordingCard recordingUrl={recordingUrl} t={t} />
                        <InterviewAiEvaluationCard
                            session={session}
                            t={t}
                            onTriggerAi={async () => {
                                try {
                                    await triggerAiMutation.mutateAsync(session.id);
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                        />
                        <InterviewHrEvaluationForm
                            evalForm={evalForm}
                            onChange={handleEvalChange}
                            onSubmit={submitHRInfo}
                            disabled={submitEvaluationMutation.isPending || session.status !== 'completed'}
                            submitting={submitEvaluationMutation.isPending}
                            t={t}
                        />
                        <InterviewQuestionsCard session={session} t={t} />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <InterviewAnalysisPanel session={session} t={t} />
                        <InterviewTranscriptPanel session={session} t={t} i18n={i18n} />
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

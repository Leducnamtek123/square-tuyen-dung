'use client';
import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Button, 
    Chip, 
    Stack, 
    Typography, 
    Grid2 as Grid, 
    Skeleton, 
    Paper, 
    IconButton, 
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
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
    const theme = useTheme();
    
    const [evalForm, setEvalForm] = useState<EvalFormType>({
        attitude_score: 0,
        professional_score: 0,
        result: 'pending',
        comments: '',
        proposed_salary: 0
    });

    // Data Fetching & Mutations
    const { data: session, isLoading: loading } = useInterviewDetail(id);
    const { submitEvaluation, isMutating: isInterviewMutating } = useInterviewMutations();
    
    const [isTriggeringAi, setIsTriggeringAi] = useState(false);

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
        try {
            await submitEvaluation({
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
            // Error handled by mutation hook
        }
    };

    const handleTriggerAi = async () => {
        if (!session?.id) return;
        setIsTriggeringAi(true);
        try {
            await interviewService.triggerAiEvaluation(session.id);
            toastMessages.success(t('interview:interviewDetail.messages.aiTriggerSuccess'));
        } catch (e) {
            errorHandling(e as AxiosError<{ errors?: ApiError }>);
        } finally {
            setIsTriggeringAi(false);
        }
    };

    const getStatusColor = (status: string | undefined): "success" | "primary" | "error" | "info" | "warning" | "default" => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'cancelled': return 'error';
            case 'processing': return 'info';
            case 'scheduled': return 'warning';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={4}>
                            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={4}>
                            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
                            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!session) {
        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    textAlign: 'center', 
                    py: 12, 
                    borderRadius: 4, 
                    bgcolor: 'background.neutral',
                    border: '1px dashed',
                    borderColor: 'divider'
                }}
            >
                <Typography color="text.secondary" variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {t('interview:interviewDetail.messages.notFound')}
                </Typography>
                <Typography color="text.disabled" variant="body2" sx={{ fontWeight: 600, mb: 4 }}>
                    {t('interview:interviewDetail.messages.notFoundDesc')}
                </Typography>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate.back()} 
                    sx={{ 
                        borderRadius: 2.5, 
                        fontWeight: 800,
                        px: 4,
                        py: 1.25,
                        textTransform: 'none'
                    }}
                    variant="contained"
                    color="primary"
                >
                    {t('interview:interviewDetail.actions.backToList')}
                </Button>
            </Paper>
        );
    }

    const canJoinLiveRoom = session.status !== 'cancelled' && session.status !== 'completed';
    const recordingUrl = session.recordingUrl || (session as any).recording_url || null;
    const statusColor = getStatusColor(session.status);

    return (
        <Paper
            elevation={0}
            sx={{ 
                p: { xs: 3, sm: 6 }, 
                backgroundColor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: (theme: any) => theme.customShadows?.z1,
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 5 }}>
                <IconButton 
                    onClick={() => navigate.back()} 
                    sx={{ 
                        color: 'text.secondary', 
                        bgcolor: alpha(theme.palette.action.active, 0.04),
                        borderRadius: 1.5,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
                        transition: 'all 0.2s'
                    }}
                >
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography 
                    variant="subtitle2" 
                    onClick={() => navigate.back()}
                    sx={{ 
                        fontWeight: 900, 
                        color: 'text.secondary', 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                    }}
                >
                    {t('interview:interviewDetail.actions.backToList')}
                </Typography>
            </Stack>
            
            <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', md: 'center' }} 
                spacing={4} 
                mb={8}
            >
                <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                        <Typography variant="h2" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1.5px' }}>
                            {t('interview:interviewDetail.title')}
                        </Typography>
                        <Chip
                            label={t(`interview:interviewLive.statuses.${session.status}`, { 
                                defaultValue: session.status?.replaceAll('_', ' ')?.toUpperCase() 
                            })}
                            size="small"
                            sx={{ 
                                fontWeight: 900, 
                                borderRadius: 1.5, 
                                px: 1,
                                bgcolor: statusColor === 'default' ? alpha(theme.palette.action.disabled, 0.08) : alpha(theme.palette[statusColor].main, 0.08),
                                color: statusColor === 'default' ? 'text.secondary' : `${statusColor}.main`,
                                border: '1px solid',
                                borderColor: statusColor === 'default' ? alpha(theme.palette.action.disabled, 0.1) : alpha(theme.palette[statusColor].main, 0.1),
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: '0.5px'
                            }}
                        />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                            {t('interview:interviewDetail.label.roomCode')}: 
                        </Typography>
                        <Box sx={{ 
                            fontWeight: 900, 
                            color: 'primary.main', 
                            bgcolor: alpha(theme.palette.primary.main, 0.06), 
                            px: 2, 
                            py: 0.75, 
                            borderRadius: 1.5, 
                            letterSpacing: '1px',
                            fontSize: '0.95rem',
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.primary.main, 0.2)
                        }}>
                            {session.roomName}
                        </Box> 
                        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600, ml: { sm: 1 } }}>
                            ID: <Box component="span" sx={{ color: 'text.secondary', fontWeight: 800 }}>{session.id}</Box>
                        </Typography>
                    </Stack>
                </Box>
                <Tooltip title={!canJoinLiveRoom ? t('interview:interviewDetail.tooltips.cannotJoin') : ''} arrow placement="top">
                    <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                        <Button
                            variant="contained"
                            disabled={!canJoinLiveRoom}
                            onClick={() => navigate.push(`/${ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', session.id.toString())}`)}
                            startIcon={<PlayCircleOutlineIcon />}
                            sx={{ 
                                borderRadius: 3, 
                                minWidth: { xs: '100%', md: 280 }, 
                                boxShadow: (theme: any) => theme.customShadows?.primary, 
                                fontWeight: 900,
                                py: 2,
                                px: 4,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme: any) => theme.customShadows?.primary
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled'
                                }
                            }}
                        >
                            {t('common:actions.joinNow')}
                        </Button>
                    </Box>
                </Tooltip>
            </Stack>

            <Grid container spacing={5}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={5}>
                        <InterviewInfoCard session={session} t={t} i18n={i18n} />
                        <InterviewRecordingCard recordingUrl={recordingUrl} t={t} />
                        <InterviewAiEvaluationCard
                            session={session}
                            t={t}
                            onTriggerAi={handleTriggerAi}
                        />
                        <InterviewHrEvaluationForm
                            evalForm={evalForm}
                            onChange={handleEvalChange}
                            onSubmit={submitHRInfo}
                            disabled={isInterviewMutating || session.status !== 'completed'}
                            submitting={isInterviewMutating}
                            t={t}
                        />
                        <InterviewQuestionsCard session={session} t={t} />
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Stack spacing={5}>
                        <InterviewAnalysisPanel session={session} t={t} />
                        <InterviewTranscriptPanel session={session} t={t} i18n={i18n} />
                    </Stack>
                </Grid>
            </Grid>
            
            {(isInterviewMutating || isTriggeringAi) && <BackdropLoading />}
        </Paper>
    );
};

export default InterviewDetailCard;

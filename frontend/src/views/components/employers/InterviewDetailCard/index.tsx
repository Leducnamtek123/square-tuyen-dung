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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../../../../configs/constants';
import InterviewAiEvaluationCard from './InterviewAiEvaluationCard';
import InterviewAnalysisPanel from './InterviewAnalysisPanel';
import InterviewHrEvaluationForm from './InterviewHrEvaluationForm';
import InterviewInfoCard from './InterviewInfoCard';
import InterviewQuestionsCard from './InterviewQuestionsCard';
import InterviewRecordingCard from './InterviewRecordingCard';
import InterviewTranscriptPanel from './InterviewTranscriptPanel';
import InterviewObserverDialog from './InterviewObserverDialog';
import { useInterviewDetail, useInterviewMutations } from '../hooks/useEmployerQueries';
import { useInterviewSSE } from '../../../employerPages/InterviewPages/hooks/useInterviewSSE';
import interviewService from '../../../../services/interviewService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { InterviewSession } from '../../../../types/models';

export interface EvalFormType {
  attitude_score: number | string;
  professional_score: number | string;
  result: 'passed' | 'failed' | 'pending';
  comments: string;
  proposed_salary: number | string;
}

const ACTIVE_STATUSES = ['in_progress', 'calibration', 'processing', 'connecting', 'active'];

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

    const queryClient = useQueryClient();

    // Data Fetching & Mutations
    const { data: session, isLoading: loading } = useInterviewDetail(id);
    const { submitEvaluation, isMutating: isInterviewMutating } = useInterviewMutations();
    
    const [isTriggeringAi, setIsTriggeringAi] = useState(false);
    const [observerOpen, setObserverOpen] = useState(false);

    // SSE for live updates
    const isSessionActive = session ? ACTIVE_STATUSES.includes(session.status) : false;
    const { liveTranscripts, liveStatus, connected: sseConnected } = useInterviewSSE({
        sessionId: session?.id,
        enabled: isSessionActive,
    });

    // Effective status (SSE may update it in real-time)
    const effectiveStatus = liveStatus || session?.status;

    useEffect(() => {
        if (liveStatus && session?.status && liveStatus !== session.status) {
            if (liveStatus === 'completed') {
                queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
            }
        }
    }, [liveStatus, session?.status, queryClient, id]);

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
                attitude_score: Number(evalForm.attitude_score),
                professional_score: Number(evalForm.professional_score),
                overall_score: (Number(evalForm.attitude_score) + Number(evalForm.professional_score)) / 2,
                result: evalForm.result,
                comments: evalForm.comments,
                proposed_salary: Number(evalForm.proposed_salary),
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
            queryClient.setQueryData<InterviewSession>(['interviewDetail', id], (prev) => (
                prev ? { ...prev, status: 'processing' } : prev
            ));
            queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
            queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
            toastMessages.success(t('interview:interviewDetail.messages.aiTriggerSuccess'));
        } catch (e) {
            errorHandling(e as AxiosError<{ errors?: ApiError }>);
        } finally {
            setIsTriggeringAi(false);
        }
    };

    const [connectionDetails, setConnectionDetails] = useState<{ token: string; serverUrl: string } | null>(null);
    const [observerLoading, setObserverLoading] = useState(false);

    const handleObserverMode = async () => {
        if (!session?.id) return;
        setObserverLoading(true);
        try {
            // 1. Fetch live observer token from backend
            const details = await interviewService.getObserverToken(session.id);
            
            // 2. Extract server URL (backend returns different keys sometimes)
            const serverUrl = details.serverUrl || details.server_url || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
            
            setConnectionDetails({
                token: details.token,
                serverUrl: serverUrl
            });
            
            // 3. Open the dialog
            setObserverOpen(true);
        } catch (e) {
            errorHandling(e as AxiosError<{ errors?: ApiError }>);
        } finally {
            setObserverLoading(false);
        }
    };

    const handleForceEndInterview = async () => {
        if (!session?.roomName) return;
        if (!window.confirm(t('interview:interviewDetail.messages.confirmForceEnd', { defaultValue: 'Bạn có chắc chắn muốn kết thúc buổi phỏng vấn này ngay lập tức không?' }))) return;
        
        try {
            await interviewService.updateSessionStatus(session.roomName, 'completed');
            toastMessages.success(t('interview:interviewDetail.messages.forceEndSuccess', { defaultValue: 'Đã yêu cầu kết thúc buổi phỏng vấn' }));
            queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
        } catch (e) {
            errorHandling(e as AxiosError<{ errors?: ApiError }>);
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

    const canJoinLiveRoom = effectiveStatus !== 'cancelled' && effectiveStatus !== 'completed';
    const canObserve = effectiveStatus === 'in_progress';
    const recordingUrl = session.recordingUrl || session.recording_url || null;
    const statusColor = getStatusColor(effectiveStatus);

    return (
        <Paper
            elevation={0}
            sx={{ 
                p: { xs: 3, sm: 6 }, 
                backgroundColor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: (theme) => theme.customShadows?.z1,
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
                            label={t(`interview:interviewListCard.statuses.${effectiveStatus}`, { 
                                defaultValue: effectiveStatus?.replaceAll('_', ' ')?.toUpperCase() 
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
                        {/* SSE Live indicator */}
                        {isSessionActive && sseConnected && (
                            <Chip
                                icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#22c55e !important', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />}
                                label="LIVE"
                                size="small"
                                sx={{
                                    fontWeight: 900,
                                    fontSize: '0.65rem',
                                    letterSpacing: 1.5,
                                    height: 24,
                                    bgcolor: alpha('#22c55e', 0.08),
                                    color: '#22c55e',
                                    border: '1px solid',
                                    borderColor: alpha('#22c55e', 0.15),
                                }}
                            />
                        )}
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

                {/* Action Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    {/* Stop Interview Button */}
                    {canObserve && (
                        <Tooltip title="Kết thúc ngay lập tức buổi phỏng vấn này" arrow placement="top">
                            <Button
                                variant="outlined"
                                onClick={handleForceEndInterview}
                                startIcon={<StopCircleIcon />}
                                sx={{ 
                                    borderRadius: 3, 
                                    minWidth: { xs: '100%', sm: 200 },
                                    fontWeight: 900,
                                    py: 2,
                                    px: 3,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderColor: alpha(theme.palette.error.main, 0.4),
                                    color: 'error.main',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'error.main',
                                        bgcolor: alpha(theme.palette.error.main, 0.04),
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                {t('common:actions.stop', { defaultValue: 'Kết thúc' })}
                            </Button>
                        </Tooltip>
                    )}

                    {/* Observer Mode Button */}
                    {canObserve && (
                        <Tooltip title="Quan sát ẩn — ứng viên không biết bạn đang xem" arrow placement="top">
                            <Button
                                variant="outlined"
                                onClick={handleObserverMode}
                                disabled={observerLoading}
                                startIcon={<VisibilityOffIcon />}
                                sx={{ 
                                    borderRadius: 3, 
                                    minWidth: { xs: '100%', sm: 200 },
                                    fontWeight: 900,
                                    py: 2,
                                    px: 3,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderColor: alpha(theme.palette.warning.main, 0.4),
                                    color: 'warning.main',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'warning.main',
                                        bgcolor: alpha(theme.palette.warning.main, 0.04),
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                {t('common:actions.observe', { defaultValue: 'Observer Mode' })}
                            </Button>
                        </Tooltip>
                    )}

                    {/* Join Room Button */}
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
                                    boxShadow: (theme) => theme.customShadows?.primary, 
                                    fontWeight: 900,
                                    py: 2,
                                    px: 4,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: (theme) => theme.customShadows?.primary
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
            </Stack>

            <Grid container spacing={5}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={5}>
                        <InterviewInfoCard session={session} t={t} i18n={i18n} />
                        <InterviewRecordingCard recordingUrl={recordingUrl} t={t} />
                        <InterviewAiEvaluationCard
                            session={session}
                            effectiveStatus={effectiveStatus}
                            t={t}
                            onTriggerAi={handleTriggerAi}
                            isTriggeringAi={isTriggeringAi}
                        />
                        <InterviewHrEvaluationForm
                            evalForm={evalForm}
                            onChange={handleEvalChange}
                            onSubmit={submitHRInfo}
                            disabled={isInterviewMutating || effectiveStatus !== 'completed'}
                            submitting={isInterviewMutating}
                            t={t}
                        />
                        <InterviewQuestionsCard session={session} t={t} />
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Stack spacing={5}>
                        <InterviewAnalysisPanel session={session} t={t} />
                        <InterviewTranscriptPanel
                            session={session}
                            t={t}
                            i18n={i18n}
                            liveTranscripts={liveTranscripts}
                            isLive={isSessionActive && sseConnected}
                        />
                    </Stack>
                </Grid>
            </Grid>
            
            {(isInterviewMutating || isTriggeringAi) && <BackdropLoading />}

            <InterviewObserverDialog
                open={observerOpen}
                onClose={() => setObserverOpen(false)}
                sessionId={session.id}
                candidateName={session.candidateName}
                jobName={session.jobName}
                liveTranscripts={liveTranscripts}
                liveStatus={liveStatus}
                sseConnected={sseConnected}
                connectionDetails={connectionDetails}
            />
        </Paper>
    );
};

export default InterviewDetailCard;

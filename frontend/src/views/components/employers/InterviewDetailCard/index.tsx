'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Chip, Grid2 as Grid, Paper, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { LiveKitRoom, RoomAudioRenderer, SessionProvider, useSession } from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { AIInterviewLayout } from '@/views/interviewPages/AIInterviewLayout';
import InterviewAiEvaluationCard from './InterviewAiEvaluationCard';
import InterviewAnalysisPanel from './InterviewAnalysisPanel';
import InterviewHrEvaluationForm from './InterviewHrEvaluationForm';
import InterviewInfoCard from './InterviewInfoCard';
import InterviewQuestionsCard from './InterviewQuestionsCard';
import InterviewRecordingCard from './InterviewRecordingCard';
import InterviewTranscriptPanel from './InterviewTranscriptPanel';
import InterviewTranscriptPanelLive from './InterviewTranscriptPanelLive';
import InterviewObserverDialog from './InterviewObserverDialog';
import InterviewDetailHeader from './InterviewDetailHeader';
import {
  buildEvaluationPayload,
  createEvaluationFormFromEvaluation,
  getEvaluationFormValidationError,
} from './evaluationFormValidation';
import { useInterviewDetail, useInterviewMutations } from '../hooks/useEmployerQueries';
import { useInterviewSSE } from '@/views/employerPages/InterviewPages/hooks/useInterviewSSE';
import interviewService from '@/services/interviewService';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import errorHandling from '@/utils/errorHandling';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { useTourAutoStart } from '@/components/Features/ProductTour';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';
import type { InterviewSession } from '@/types/models';
import type { EvalFormType } from './types';

const ACTIVE_STATUSES = ['scheduled', 'calibration', 'in_progress'];

function InterviewSessionBridge({
  connectionDetails,
  children,
}: {
  connectionDetails: { token: string; serverUrl: string };
  children: any;
}) {
  const tokenSource = React.useMemo(() => {
    return TokenSource.custom(async () => ({
      participantToken: connectionDetails.token,
      serverUrl: connectionDetails.serverUrl,
    }));
  }, [connectionDetails.serverUrl, connectionDetails.token]);

  const session = useSession(tokenSource);

  return <SessionProvider session={session}>{children}</SessionProvider>;
}

type State = {
  evalForm: EvalFormType;
  isTriggeringAi: boolean;
  observerOpen: boolean;
  connectionDetails: { token: string; serverUrl: string } | null;
  observerLoading: boolean;
  hrConnectionDetails: { token: string; serverUrl: string } | null;
  hrLoading: boolean;
  hrConnected: boolean;
};

type Action =
  | { type: 'set_eval'; payload: EvalFormType }
  | { type: 'set_triggering_ai'; payload: boolean }
  | { type: 'set_observer_open'; payload: boolean }
  | { type: 'set_connection_details'; payload: { token: string; serverUrl: string } | null }
  | { type: 'set_observer_loading'; payload: boolean }
  | { type: 'set_hr_connection_details'; payload: { token: string; serverUrl: string } | null }
  | { type: 'set_hr_loading'; payload: boolean }
  | { type: 'set_hr_connected'; payload: boolean };

const initialState: State = {
  evalForm: {
    attitude_score: 0,
    professional_score: 0,
    result: 'pending',
    comments: '',
    proposed_salary: 0,
  },
  isTriggeringAi: false,
  observerOpen: false,
  connectionDetails: null,
  observerLoading: false,
  hrConnectionDetails: null,
  hrLoading: false,
  hrConnected: false,
};

const getLocalLiveKitUrl = () => {
  if (typeof window === 'undefined') return '';
  const envUrl = (process.env.NEXT_PUBLIC_LIVEKIT_URL || '').trim();
  if (!envUrl) return '';
  if (envUrl.startsWith('ws')) return envUrl.replace(/\/$/, '');
  try {
    const url = new URL(envUrl);
    url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return envUrl;
  }
};

const resolveLiveKitServerUrl = (details: { serverUrl?: string }) => {
  const localUrl = getLocalLiveKitUrl();

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    localUrl
  ) {
    return localUrl;
  }

  return details.serverUrl || localUrl;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_eval':
      return { ...state, evalForm: action.payload };
    case 'set_triggering_ai':
      return { ...state, isTriggeringAi: action.payload };
    case 'set_observer_open':
      return { ...state, observerOpen: action.payload };
    case 'set_connection_details':
      return { ...state, connectionDetails: action.payload };
    case 'set_observer_loading':
      return { ...state, observerLoading: action.payload };
    case 'set_hr_connection_details':
      return { ...state, hrConnectionDetails: action.payload };
    case 'set_hr_loading':
      return { ...state, hrLoading: action.payload };
    case 'set_hr_connected':
      return { ...state, hrConnected: action.payload };
    default:
      return state;
  }
};

const InterviewDetailSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1440, mx: 'auto' }}>
    <Skeleton variant="text" width={220} height={36} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 2 }} />
        </Stack>
      </Grid>
    </Grid>
  </Box>
);

const InterviewDetailNotFound = ({
  title,
  description,
  actionLabel,
  onBack,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onBack: () => void;
}) => (
  <Paper elevation={0} sx={{ textAlign: 'center', py: 10, px: 3, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
    <Typography color="text.primary" variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: 0 }}>
      {title}
    </Typography>
    <Typography color="text.disabled" variant="body2" sx={{ fontWeight: 600, mb: 4 }}>
      {description}
    </Typography>
    <Button variant="contained" onClick={onBack} sx={{ fontWeight: 800, px: 3, textTransform: 'none' }}>
      {actionLabel}
    </Button>
  </Paper>
);

const InterviewDetailCard = () => {
  const { id } = useParams<{ id: string }>();
  const { back } = useRouter();
  const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
  const queryClient = useQueryClient();
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = React.useState<number>(0);

  // Auto-start interview detail evaluation tour on first visit
  useTourAutoStart('employer_interview_detail', 1000);

  const { data: session, isLoading: loading } = useInterviewDetail(id);
  const { submitEvaluation, isMutating: isInterviewMutating } = useInterviewMutations();
  const isSessionActive = session ? ACTIVE_STATUSES.includes(session.status) : false;
  const { liveStatus, connected: sseConnected } = useInterviewSSE({
    sessionId: session?.id,
    enabled: isSessionActive,
  });
  const effectiveStatus = liveStatus || session?.status;

  React.useEffect(() => {
    if (isSessionActive) {
      setActiveTab(1); // Auto-switch to live transcript when session is active
    }
  }, [isSessionActive]);

  React.useEffect(() => {
    if (liveStatus && session?.status && liveStatus !== session.status && liveStatus === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
    }
  }, [liveStatus, session?.status, queryClient, id]);

  React.useEffect(() => {
    if (!Array.isArray(session?.evaluations) || session.evaluations.length === 0) return;
    const lastEval = session.evaluations[session.evaluations.length - 1];
    if (!lastEval) return;
    dispatch({
      type: 'set_eval',
      payload: createEvaluationFormFromEvaluation(lastEval),
    });
  }, [session]);

  React.useEffect(() => {
    if (isSessionActive || !state.connectionDetails) return;
    dispatch({ type: 'set_connection_details', payload: null });
    dispatch({ type: 'set_observer_open', payload: false });
  }, [isSessionActive, state.connectionDetails]);

  const ensureObserverConnection = React.useCallback(
    async (openAfterConnect: boolean) => {
      if (!session?.id) return false;
      if (state.connectionDetails) {
        if (openAfterConnect) {
          dispatch({ type: 'set_observer_open', payload: true });
        }
        return true;
      }

      dispatch({ type: 'set_observer_loading', payload: true });
      try {
        const details = await interviewService.getObserverToken(session.id);
        const serverUrl = resolveLiveKitServerUrl(details);
        dispatch({ type: 'set_connection_details', payload: { token: details.token, serverUrl } });
        if (openAfterConnect) {
          dispatch({ type: 'set_observer_open', payload: true });
        }
        return true;
      } catch (e) {
        errorHandling(e as AxiosError<{ errors?: ApiError }>);
        return false;
      } finally {
        dispatch({ type: 'set_observer_loading', payload: false });
      }
    },
    [session?.id, state.connectionDetails]
  );

  React.useEffect(() => {
    if (effectiveStatus !== 'in_progress' || state.connectionDetails || state.observerLoading) return;
    void ensureObserverConnection(false);
  }, [ensureObserverConnection, effectiveStatus, state.connectionDetails, state.observerLoading]);

  const handleEvalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch({ type: 'set_eval', payload: { ...state.evalForm, [name]: value } as EvalFormType });
  };

  const submitHRInfo = async () => {
    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      return;
    }

    const validationError = getEvaluationFormValidationError(state.evalForm);
    if (validationError) {
      toastMessages.error(t(`interview:interviewDetail.messages.${validationError}`));
      return;
    }

    try {
      await submitEvaluation(buildEvaluationPayload(parsedId, state.evalForm));
      toastMessages.success(t('interview:interviewDetail.messages.evaluationSuccess'));
    } catch {
      // mutation hook handles errors
    }
  };

  const handleTriggerAi = async () => {
    if (!session?.id) return;
    dispatch({ type: 'set_triggering_ai', payload: true });
    try {
      await interviewService.triggerAiEvaluation(session.id);
      queryClient.setQueryData<InterviewSession>(['interviewDetail', id], (prev) => (prev ? { ...prev, status: 'processing' } : prev));
      queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
      toastMessages.success(t('interview:interviewDetail.messages.aiTriggerSuccess'));
    } catch (e) {
      errorHandling(e as AxiosError<{ errors?: ApiError }>);
    } finally {
      dispatch({ type: 'set_triggering_ai', payload: false });
    }
  };

  const handleObserverMode = async () => {
    await ensureObserverConnection(true);
  };

  const handleForceEndInterview = () => {
    if (!session?.roomName) return;
    confirmModal(
      async () => {
        try {
          await interviewService.updateSessionStatus(session.roomName, 'completed');
          toastMessages.success(t('interview:interviewDetail.messages.forceEndSuccess'));
          queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
        } catch (e) {
          errorHandling(e as AxiosError<{ errors?: ApiError }>);
        }
      },
      t('interview:interviewDetail.forceEndTitle', { defaultValue: 'Kết thúc phỏng vấn' }),
      t('interview:interviewDetail.messages.confirmForceEnd'),
      'warning'
    );
  };

  const handleJoinAsHR = React.useCallback(async () => {
    if (!session?.id) return;
    dispatch({ type: 'set_hr_loading', payload: true });
    try {
      const details = await interviewService.getHrPresenceToken(session.id);
      const serverUrl = resolveLiveKitServerUrl(details);
      dispatch({ type: 'set_hr_connection_details', payload: { token: details.token, serverUrl } });
      dispatch({ type: 'set_hr_connected', payload: true });
    } catch (e) {
      errorHandling(e as AxiosError<{ errors?: ApiError }>);
    } finally {
      dispatch({ type: 'set_hr_loading', payload: false });
    }
  }, [session?.id]);

  if (loading) {
    return <InterviewDetailSkeleton />;
  }

  if (!session) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1440, mx: 'auto' }}>
        <InterviewDetailNotFound
          title={t('interview:interviewDetail.messages.notFound')}
          description={t('interview:interviewDetail.messages.notFoundDesc')}
          actionLabel={t('interview:interviewDetail.actions.backToList')}
          onBack={() => back()}
        />
      </Box>
    );
  }

  const canJoinLiveRoom = effectiveStatus !== 'cancelled' && effectiveStatus !== 'completed';
  const canObserve = effectiveStatus === 'in_progress';
  const recordingUrl = session.recordingUrl || session.recording_url || null;
  const liveKitReady = Boolean(isSessionActive && state.connectionDetails);

  // Phiên làm việc toàn màn hình của Nhà tuyển dụng
  if (state.hrConnected && state.hrConnectionDetails) {
    return (
      <Paper elevation={0} sx={{ position: 'fixed', inset: 0, zIndex: 1300, borderRadius: 0, bgcolor: '#020617' }}>
        <LiveKitRoom
          token={state.hrConnectionDetails.token}
          serverUrl={state.hrConnectionDetails.serverUrl}
          connect={true}
          audio={false}
          video={false}
          onDisconnected={() => {
            dispatch({ type: 'set_hr_connected', payload: false });
            dispatch({ type: 'set_hr_connection_details', payload: null });
          }}
          style={{ height: '100%', width: '100%' }}
        >
          <InterviewSessionBridge connectionDetails={state.hrConnectionDetails}>
            <AIInterviewLayout
              onEndSession={async () => {
                dispatch({ type: 'set_hr_connected', payload: false });
                dispatch({ type: 'set_hr_connection_details', payload: null });
              }}
            />
            <RoomAudioRenderer />
          </InterviewSessionBridge>
        </LiveKitRoom>
      </Paper>
    );
  }

  const detailContent = (
    <>
      <InterviewDetailHeader
        session={session}
        effectiveStatus={effectiveStatus}
        canJoinLiveRoom={canJoinLiveRoom}
        canObserve={canObserve}
        isSessionActive={isSessionActive}
        sseConnected={sseConnected}
        observerLoading={state.observerLoading}
        joinLoading={state.hrLoading}
        onBack={() => back()}
        onTriggerObserver={handleObserverMode}
        onForceEndInterview={handleForceEndInterview}
        onJoinRoom={() => handleJoinAsHR()}
        t={t}
      />

      <Grid container spacing={3}>
        {/* Left Column (35%): Candidate Dossier & Quick Evaluation */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <InterviewInfoCard session={session} t={t} i18n={i18n} />
            <Box data-tour="interview-detail-score">
              <InterviewAiEvaluationCard
                session={session}
                effectiveStatus={effectiveStatus}
                t={t}
                onTriggerAi={handleTriggerAi}
                isTriggeringAi={state.isTriggeringAi}
              />
            </Box>
            <Box data-tour="interview-detail-actions">
              <InterviewHrEvaluationForm
                evalForm={state.evalForm}
                onChange={handleEvalChange}
                onSubmit={submitHRInfo}
                disabled={isInterviewMutating || effectiveStatus !== 'completed'}
                submitting={isInterviewMutating}
                t={t}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Right Column (65%): Tabbed Executive Workspace */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            {/* Tab Navigation Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 0.75,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .MuiTab-root': {
                    minHeight: 40,
                    py: 1,
                    px: 2.25,
                    borderRadius: 2,
                    fontWeight: 750,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    color: 'text.secondary',
                    transition: 'all 0.15s ease-in-out',
                    '&.Mui-selected': {
                      color: 'primary.main',
                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                      fontWeight: 850,
                    },
                    '&:hover:not(.Mui-selected)': {
                      bgcolor: '#F8FAFC',
                      color: 'text.primary',
                    },
                  },
                }}
              >
                <Tab
                  icon={<AnalyticsOutlinedIcon sx={{ fontSize: 19 }} />}
                  iconPosition="start"
                  label={t('interviewDetail.subtitle.analysis', { defaultValue: 'Phân tích AI' })}
                />
                <Tab
                  icon={<ForumOutlinedIcon sx={{ fontSize: 19 }} />}
                  iconPosition="start"
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <span>{t('interviewDetail.subtitle.transcript', { defaultValue: 'Bản ghi hội thoại' })}</span>
                      {Array.isArray(session.transcripts) && session.transcripts.length > 0 && (
                        <Chip
                          label={session.transcripts.length}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            bgcolor: activeTab === 1 ? 'primary.main' : '#E2E8F0',
                            color: activeTab === 1 ? '#FFFFFF' : 'text.secondary',
                          }}
                        />
                      )}
                    </Stack>
                  }
                />
                <Tab
                  icon={<VideoLibraryOutlinedIcon sx={{ fontSize: 19 }} />}
                  iconPosition="start"
                  label={t('interviewDetail.subtitle.recording', { defaultValue: 'Bản ghi hình' })}
                />
                <Tab
                  icon={<QuizOutlinedIcon sx={{ fontSize: 19 }} />}
                  iconPosition="start"
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <span>{t('interviewDetail.subtitle.questions', { defaultValue: 'Bộ câu hỏi' })}</span>
                      {Array.isArray(session.questions) && session.questions.length > 0 && (
                        <Chip
                          label={session.questions.length}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            bgcolor: activeTab === 3 ? 'primary.main' : '#E2E8F0',
                            color: activeTab === 3 ? '#FFFFFF' : 'text.secondary',
                          }}
                        />
                      )}
                    </Stack>
                  }
                />
              </Tabs>
            </Paper>

            {/* Tab 0: AI Analysis & Radar Insights */}
            <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
              <InterviewAnalysisPanel session={session} t={t} />
            </Box>

            {/* Tab 1: Live / Post-Interview Transcript */}
            <Box data-tour="interview-detail-transcript" sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
              {liveKitReady ? (
                <InterviewTranscriptPanelLive session={session} t={t} i18n={i18n} />
              ) : (
                <InterviewTranscriptPanel session={session} t={t} i18n={i18n} />
              )}
            </Box>

            {/* Tab 2: Media & Video Recording */}
            <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
              <InterviewRecordingCard recordingUrl={recordingUrl} isCompleted={effectiveStatus === 'completed'} t={t} />
            </Box>

            {/* Tab 3: Question Bank & Rubric */}
            <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
              <InterviewQuestionsCard session={session} t={t} />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {(isInterviewMutating || state.isTriggeringAi) && <BackdropLoading />}
      {liveKitReady && (
        <InterviewObserverDialog
          open={state.observerOpen}
          onClose={() => dispatch({ type: 'set_observer_open', payload: false })}
          sessionId={session.id}
          candidateName={session.candidateName}
          jobName={session.jobName}
          liveStatus={liveStatus}
          sseConnected={sseConnected}
        />
      )}
    </>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1440, mx: 'auto' }}>
      {liveKitReady ? (
        <LiveKitRoom
          token={state.connectionDetails!.token}
          serverUrl={state.connectionDetails!.serverUrl}
          connect={true}
          audio={false}
          video={false}
          options={{ adaptiveStream: true }}
        >
          <InterviewSessionBridge connectionDetails={state.connectionDetails!}>
            {detailContent}
          </InterviewSessionBridge>
        </LiveKitRoom>
      ) : (
        detailContent
      )}
    </Box>
  );
};

export default InterviewDetailCard;

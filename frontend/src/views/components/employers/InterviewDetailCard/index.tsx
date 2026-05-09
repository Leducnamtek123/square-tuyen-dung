'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Grid2 as Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { LiveKitRoom, SessionProvider, useSession } from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { AIInterviewLayout } from '../../../interviewPages/AIInterviewLayout';
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
import { useInterviewDetail, useInterviewMutations } from '../hooks/useEmployerQueries';
import { useInterviewSSE } from '../../../employerPages/InterviewPages/hooks/useInterviewSSE';
import interviewService from '../../../../services/interviewService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { InterviewSession } from '../../../../types/models';

interface EvalFormType {
  attitude_score: number | string;
  professional_score: number | string;
  result: 'passed' | 'failed' | 'pending';
  comments: string;
  proposed_salary: number | string;
}

const ACTIVE_STATUSES = ['scheduled', 'calibration', 'in_progress'];

function InterviewSessionBridge({
  connectionDetails,
  children,
}: {
  connectionDetails: { token: string; serverUrl: string };
  children: React.ReactNode;
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

const InterviewDetailCard = () => {
  const { id } = useParams<{ id: string }>();
  const { back } = useRouter();
  const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
  const queryClient = useQueryClient();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { data: session, isLoading: loading } = useInterviewDetail(id);
  const { submitEvaluation, isMutating: isInterviewMutating } = useInterviewMutations();
  const isSessionActive = session ? ACTIVE_STATUSES.includes(session.status) : false;
  const { liveStatus, connected: sseConnected } = useInterviewSSE({
    sessionId: session?.id,
    enabled: isSessionActive,
  });
  const effectiveStatus = liveStatus || session?.status;

  React.useEffect(() => {
    if (liveStatus && session?.status && liveStatus !== session.status && liveStatus === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['interviewDetail', id] });
    }
  }, [liveStatus, session?.status, queryClient, id]);

  React.useEffect(() => {
    if (!session?.evaluations?.length) return;
    const lastEval = session.evaluations[session.evaluations.length - 1];
    dispatch({
      type: 'set_eval',
      payload: {
        attitude_score: lastEval.attitude_score || lastEval.attitudeScore || 0,
        professional_score: lastEval.professional_score || lastEval.attitudeScore || 0,
        result: lastEval.result || 'pending',
        comments: lastEval.comments || '',
        proposed_salary: lastEval.proposed_salary || lastEval.proposedSalary || 0,
      },
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
        const serverUrl = details.serverUrl || details.server_url || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
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
    try {
      await submitEvaluation({
        interview: Number(id),
        attitudeScore: Number(state.evalForm.attitude_score),
        professionalScore: Number(state.evalForm.professional_score),
        overallScore: (Number(state.evalForm.attitude_score) + Number(state.evalForm.professional_score)) / 2,
        result: state.evalForm.result,
        comments: state.evalForm.comments,
        proposedSalary: Number(state.evalForm.proposed_salary),
      });
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

  const handleJoinAsHR = React.useCallback(async () => {
    if (!session?.id) return;
    dispatch({ type: 'set_hr_loading', payload: true });
    try {
      const details = await interviewService.getHrPresenceToken(session.id);
      const serverUrl = details.serverUrl || details.server_url || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
      dispatch({ type: 'set_hr_connection_details', payload: { token: details.token, serverUrl } });
      dispatch({ type: 'set_hr_connected', payload: true });
    } catch (e) {
      errorHandling(e as AxiosError<{ errors?: ApiError }>);
    } finally {
      dispatch({ type: 'set_hr_loading', payload: false });
    }
  }, [session?.id]);

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
      <Paper elevation={0} sx={{ textAlign: 'center', py: 12, borderRadius: 4, bgcolor: 'background.neutral', border: '1px dashed', borderColor: 'divider' }}>
        <Typography color="text.secondary" variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {t('interview:interviewDetail.messages.notFound')}
        </Typography>
        <Typography color="text.disabled" variant="body2" sx={{ fontWeight: 600, mb: 4 }}>
          {t('interview:interviewDetail.messages.notFoundDesc')}
        </Typography>
        <Box component="button" onClick={() => back()} sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, py: 1.25, textTransform: 'none' }}>
          {t('interview:interviewDetail.actions.backToList')}
        </Box>
      </Paper>
    );
  }

  const canJoinLiveRoom = effectiveStatus !== 'cancelled' && effectiveStatus !== 'completed';
  const canObserve = effectiveStatus === 'in_progress';
  const recordingUrl = session.recordingUrl || session.recording_url || null;
  const liveKitReady = Boolean(isSessionActive && state.connectionDetails);

  // ── HR Presence fullscreen session ──────────────────────────────────────
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

      <Grid container spacing={5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={5}>
            <InterviewInfoCard session={session} t={t} i18n={i18n} />
            <InterviewAiEvaluationCard session={session} effectiveStatus={effectiveStatus} t={t} onTriggerAi={handleTriggerAi} isTriggeringAi={state.isTriggeringAi} />
            <InterviewHrEvaluationForm
              evalForm={state.evalForm}
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
            <InterviewRecordingCard recordingUrl={recordingUrl} isCompleted={effectiveStatus === 'completed'} t={t} />
            <InterviewAnalysisPanel session={session} t={t} />
            {liveKitReady ? (
              <InterviewTranscriptPanelLive session={session} t={t} i18n={i18n} />
            ) : (
              <InterviewTranscriptPanel session={session} t={t} i18n={i18n} />
            )}
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
    <Paper elevation={0} sx={{ p: { xs: 3, sm: 6 }, backgroundColor: 'background.paper', borderRadius: 4, boxShadow: (theme) => theme.customShadows?.z1, border: '1px solid', borderColor: 'divider' }}>
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
    </Paper>
  );
};

export default InterviewDetailCard;

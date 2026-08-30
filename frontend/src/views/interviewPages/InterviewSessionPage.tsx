'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import {
  LiveKitRoom,
  SessionProvider,
  useSession,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { TokenSource } from 'livekit-client';

import interviewService from '../../services/interviewService';
import tokenService from '../../services/tokenService';
import { transformInterviewSession } from '../../utils/transformers';
import type { InterviewSession } from '../../types/models';
import { PreflightRoom } from './PreflightRoom';
import { AIInterviewLayout } from './AIInterviewLayout';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/configs/images';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getSafeLiveKitUrl = (preferLocal = false) => {
  if (typeof window === 'undefined') return '';
  const envUrl = (process.env.NEXT_PUBLIC_LIVEKIT_URL || '').trim();

  if (envUrl.startsWith('wss://')) return envUrl.replace(/\/$/, '');

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (envUrl && (envUrl.startsWith('http') || envUrl.startsWith('ws'))) {
    try {
      const url = new URL(envUrl);
      url.protocol = protocol;
      return url.toString().replace(/\/$/, '');
    } catch (urlErr) {
      console.warn('[LiveKit URL] Invalid env URL:', urlErr);
    }
  }

  if (preferLocal) {
    const host = window.location.host;
    return `${protocol}//${host}/livekit`.replace(/\/$/, '');
  }

  const path = envUrl && envUrl.startsWith('/') ? envUrl : envUrl || '/livekit';
  const host = window.location.host;
  return `${protocol}//${host}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '');
};

const normalizeRole = (role: string) => {
  if (role === 'admin') return 'admin';
  if (role === 'employer') return 'employer';
  return 'jobseeker';
};

const getErrorDetail = (err: unknown): string | null => {
  const ax = err as { response?: { data?: { errors?: { detail?: string[] | string } } }; message?: string };
  const detail = ax?.response?.data?.errors?.detail;
  if (Array.isArray(detail) && detail.length > 0) return String(detail[0]);
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (ax?.message) return ax.message;
  return null;
};

const statusClassMap: Record<string, string> = {
  scheduled:   'border-sky-200 bg-sky-50 text-sky-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
  processing:  'border-amber-200 bg-amber-50 text-amber-700',
  completed:   'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled:   'border-rose-200 bg-rose-50 text-rose-700',
  interrupted: 'border-amber-200 bg-amber-50 text-amber-700',
};

const JOINABLE_STATUSES = ['scheduled', 'calibration', 'in_progress', 'interrupted'];
const END_SESSION_STATUS_TIMEOUT_MS = 8000;
const PROCESSING_STATUS_REFRESH_MS = 3000;
const INTERVIEW_AUDIO_CAPTURE_OPTIONS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  voiceIsolation: true,
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('end_session_timeout')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type InterviewSessionPageProps = {
  participantRole?: 'jobseeker' | 'employer' | 'admin' | string;
};

type LiveKitConnectionDetails = {
  token: string;
  serverUrl: string;
};

type SessionPageState = {
  loading: boolean;
  starting: boolean;
  error: string;
  showPreflight: boolean;
  connectRoom: boolean;
  connectionDetails?: LiveKitConnectionDetails;
  session: InterviewSession | null;
  sessionInviteToken: string;
};

type SessionPageAction =
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-starting'; value: boolean }
  | { type: 'set-error'; value: string }
  | { type: 'set-show-preflight'; value: boolean }
  | { type: 'set-connect-room'; value: boolean }
  | { type: 'set-connection-details'; value?: LiveKitConnectionDetails }
  | { type: 'set-session'; value: InterviewSession | null }
  | { type: 'set-session-status'; value: string }
  | { type: 'set-session-invite-token'; value: string };

type FetchSessionDetailsOptions = {
  showLoading?: boolean;
};

const initialState: SessionPageState = {
  loading: true,
  starting: false,
  error: '',
  showPreflight: false,
  connectRoom: false,
  connectionDetails: undefined,
  session: null,
  sessionInviteToken: '',
};

const reducer = (state: SessionPageState, action: SessionPageAction): SessionPageState => {
  switch (action.type) {
    case 'set-loading':            return { ...state, loading: action.value };
    case 'set-starting':           return { ...state, starting: action.value };
    case 'set-error':              return { ...state, error: action.value };
    case 'set-show-preflight':     return { ...state, showPreflight: action.value };
    case 'set-connect-room':       return { ...state, connectRoom: action.value };
    case 'set-connection-details': return { ...state, connectionDetails: action.value };
    case 'set-session':            return { ...state, session: action.value };
    case 'set-session-status':     return { ...state, session: state.session ? { ...state.session, status: action.value } : state.session };
    case 'set-session-invite-token': return { ...state, sessionInviteToken: action.value };
  default:                       return state;
  }
};

function InterviewSessionBridge({
  connectionDetails,
  children,
}: {
  connectionDetails: LiveKitConnectionDetails;
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

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function InterviewSessionLoading({ label }: { label: string }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f8fafc] text-slate-800">
      <div className="flex flex-col items-center gap-3 text-center">
        <CircularProgress size={36} sx={{ color: '#0284c7' }} />
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </main>
  );
}

function InterviewSessionError({
  message,
  actionLabel,
  onBackHome,
}: {
  message: string;
  actionLabel: string;
  onBackHome: () => void;
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f8fafc] px-6">
      <section className="w-full max-w-lg rounded-2xl border border-rose-200 bg-rose-50/80 p-8 text-center text-rose-900 shadow-sm">
        <p className="mb-6 text-lg font-medium">{message}</p>
        <Button variant="contained" sx={{ bgcolor: '#0284c7', color: '#fff', '&:hover': { bgcolor: '#0369a1' } }} onClick={onBackHome}>
          {actionLabel}
        </Button>
      </section>
    </main>
  );
}

function ActiveInterviewRoom({
  connectionDetails,
  sessionTitle,
  jobLabel,
  candidateLabel,
  statusClass,
  statusText,
  participantRole,
  formattedSchedule,
  timeLabel,
  onDisconnected,
  onEndSession,
}: {
  connectionDetails: LiveKitConnectionDetails;
  sessionTitle: string;
  jobLabel: string;
  candidateLabel: string;
  statusClass: string;
  statusText: string;
  participantRole: string;
  formattedSchedule?: string | false;
  timeLabel: string;
  onDisconnected: () => void;
  onEndSession: () => Promise<void>;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#f1f5f9] text-slate-900">
      <header className="relative z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src={IMAGES.getTextLogo('dark')}
            alt="InfoHR"
            width={90}
            height={28}
            style={{ height: 24, width: 'auto', objectFit: 'contain' }}
            priority
          />
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 md:text-base">{sessionTitle}</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{jobLabel} • {candidateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', statusClass)}>
            {statusText}
          </span>
        </div>
      </header>

      <div className="flex-1" style={{ height: 'calc(100dvh - 57px)', minHeight: 'calc(100dvh - 57px)' }}>
        <LiveKitRoom
          token={connectionDetails.token}
          serverUrl={connectionDetails.serverUrl}
          connect={true}
          video={participantRole === 'jobseeker'}
          audio={participantRole === 'jobseeker' ? INTERVIEW_AUDIO_CAPTURE_OPTIONS : false}
          onDisconnected={onDisconnected}
          style={{ height: '100%' }}
        >
          <InterviewSessionBridge connectionDetails={connectionDetails}>
            <AIInterviewLayout onEndSession={onEndSession} />
            <RoomAudioRenderer />
          </InterviewSessionBridge>
        </LiveKitRoom>
      </div>

      {formattedSchedule && (
        <p className="border-t border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-500">
          {timeLabel} &bull; {formattedSchedule}
        </p>
      )}
    </main>
  );
}

type WaitingRoomViewState = {
  isInterrupted: boolean;
  showPreflight: boolean;
  starting: boolean;
  isJoinable: boolean;
};

type WaitingRoomLabels = {
  interruptedResumeHint: string;
  sessionTitle: string;
  jobLabel: string;
  candidateLabel: string;
  statusText: string;
  readyTitle: string;
  unavailableTitle: string;
  readyBody: string;
  unavailableBody: string;
  startInterview: string;
  back: string;
  backHome: string;
  time: string;
};

type WaitingRoomActions = {
  onJoin: () => Promise<void>;
  onCancelPreflight: () => void;
  onShowPreflight: () => void;
  onBack: () => void;
  onBackHome: () => void;
};

function InterviewWaitingRoom({
  viewState,
  labels,
  statusClass,
  error,
  formattedSchedule,
  actions,
}: {
  viewState: WaitingRoomViewState;
  labels: WaitingRoomLabels;
  statusClass: string;
  error: string;
  formattedSchedule?: string | false;
  actions: WaitingRoomActions;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#f8fafc] text-slate-800">
      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3.5 backdrop-blur-xl md:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src={IMAGES.getTextLogo('dark')}
              alt="InfoHR"
              width={100}
              height={32}
              style={{ height: 26, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 md:text-base">{labels.sessionTitle}</h1>
            <p className="text-xs font-medium text-slate-500">{labels.jobLabel} • {labels.candidateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm', statusClass)}>
            {labels.statusText}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[350px] w-[600px] rounded-full bg-sky-500/8 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[250px] w-[400px] rounded-full bg-cyan-500/6 blur-[100px]" />

        <div className="relative z-10 w-full max-w-xl">
          {viewState.isInterrupted && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '14px', bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
              {labels.interruptedResumeHint}
            </Alert>
          )}

          {viewState.showPreflight ? (
            <PreflightRoom
              onJoin={actions.onJoin}
              onCancel={actions.onCancelPreflight}
              starting={viewState.starting}
            />
          ) : (
            <div className="relative flex flex-col items-center gap-6 rounded-3xl border border-slate-200/90 bg-white/95 p-8 text-center shadow-[0_25px_50px_-12px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,1)_inset] backdrop-blur-2xl md:p-10">
              <div className="relative flex h-[80px] w-[200px] items-center justify-center">
                <Image
                  src={IMAGES.getTextLogo('dark')}
                  alt="InfoHR"
                  width={240}
                  height={80}
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  priority
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                  {viewState.isJoinable ? labels.readyTitle : labels.unavailableTitle}
                </h2>
                {error && (
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-600">{error}</p>
                )}
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-600">
                  {viewState.isJoinable ? labels.readyBody : labels.unavailableBody}
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-3 pt-2">
                {viewState.isJoinable ? (
                  <>
                    <Button
                      variant="contained"
                      onClick={actions.onShowPreflight}
                      disabled={viewState.starting}
                      sx={{
                        width: '100%',
                        maxWidth: '280px',
                        py: 1.5,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'none',
                        boxShadow: '0 4px 18px rgba(14, 165, 233, 0.35)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                          boxShadow: '0 6px 22px rgba(14, 165, 233, 0.5)',
                        },
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      {viewState.starting ? <CircularProgress size={20} color="inherit" /> : labels.startInterview}
                    </Button>
                    <Button
                      variant="text"
                      onClick={actions.onBack}
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'none',
                        '&:hover': { color: '#0f172a' },
                      }}
                    >
                      {labels.back}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={actions.onBackHome}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '12px',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { background: '#0369a1' },
                    }}
                  >
                    {labels.backHome}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {formattedSchedule && (
        <footer className="border-t border-slate-200/80 bg-white/60 py-2.5 text-center text-xs text-slate-500">
          {labels.time} • {formattedSchedule}
        </footer>
      )}
    </main>
  );
}

const InterviewSessionPage = ({ participantRole = 'jobseeker' }: InterviewSessionPageProps) => {
  const normalizedRole = normalizeRole(participantRole);
  const { id: routeId } = useParams<{ id?: string }>();
  const { push, back } = useRouter();
  const { t, i18n } = useTranslation(['interview', 'common']);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const finalizeOnDisconnectRef = React.useRef(false);
  const tRef = React.useRef(t);

  React.useEffect(() => {
    tRef.current = t;
  }, [t]);

  const roomName   = state.session?.roomName;
  const isJoinable = !!state.session && JOINABLE_STATUSES.includes(state.session.status);
  const isInterrupted = state.session?.status === 'interrupted';

  // â”€â”€ Fetch session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchSessionDetails = React.useCallback(async (options: FetchSessionDetailsOptions = {}) => {
    const showLoading = options.showLoading ?? true;
    const translate = tRef.current;
    try {
      if (showLoading) {
        dispatch({ type: 'set-loading', value: true });
      }
      dispatch({ type: 'set-error', value: '' });

      let detailRaw: unknown;
      let inviteToken = '';

      if (normalizedRole === 'jobseeker') {
        inviteToken = routeId || '';
        if (!inviteToken) throw new Error(translate('errors.missingInvite'));
        detailRaw = await interviewService.getSessionDetailByInviteToken(inviteToken);
      } else {
        if (!routeId) throw new Error(translate('errors.missingSessionId'));
        detailRaw = await interviewService.getSessionDetail(routeId);
        inviteToken = (detailRaw as { inviteToken?: string } | null)?.inviteToken || '';
      }

      const mapped = transformInterviewSession(detailRaw);
      if (!mapped) throw new Error(translate('errors.invalidSession'));

      dispatch({ type: 'set-session', value: mapped });
      dispatch({
        type: 'set-session-invite-token',
        value:
          inviteToken ||
          mapped.inviteToken ||
          (detailRaw as { invite_token?: string } | null)?.invite_token ||
          '',
      });
    } catch (err) {
      if (showLoading) {
        dispatch({ type: 'set-error', value: err instanceof Error ? err.message : translate('errors.invalidSession') });
      }
    } finally {
      if (showLoading) {
        dispatch({ type: 'set-loading', value: false });
      }
    }
  }, [normalizedRole, routeId]);

  React.useEffect(() => { fetchSessionDetails(); }, [fetchSessionDetails]);

  React.useEffect(() => {
    if (state.session?.status !== 'processing') return undefined;

    const intervalId = window.setInterval(() => {
      void fetchSessionDetails({ showLoading: false });
    }, PROCESSING_STATUS_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchSessionDetails, state.session?.status]);

  // â”€â”€ Start / terminate session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const initiateInterviewSession = React.useCallback(async () => {
    const translate = tRef.current;
    try {
      dispatch({ type: 'set-starting', value: true });
      dispatch({ type: 'set-error', value: '' });

      if (!state.sessionInviteToken) throw new Error(translate('errors.missingInvite'));
      if (normalizedRole !== 'jobseeker' && !routeId) throw new Error(translate('errors.missingSessionId'));

      const latestRaw =
        normalizedRole === 'jobseeker'
          ? await interviewService.getSessionDetailByInviteToken(state.sessionInviteToken)
          : await interviewService.getSessionDetail(routeId as string);
      const latestSession = transformInterviewSession(latestRaw);
      if (!latestSession) throw new Error(translate('errors.invalidSession'));

      dispatch({ type: 'set-session', value: latestSession });
      dispatch({
        type: 'set-session-invite-token',
        value:
          latestSession.inviteToken ||
          (latestRaw as { invite_token?: string } | null)?.invite_token ||
          state.sessionInviteToken,
      });

      if (!JOINABLE_STATUSES.includes(latestSession.status)) {
        throw new Error(
          translate('errors.sessionNotReadyForJoin', {
            status: translate(`interviewListCard.statuses.${latestSession.status}`),
          })
        );
      }

      const tokenData =
        normalizedRole === 'jobseeker'
          ? await interviewService.getLiveKitToken(state.sessionInviteToken)
          : await interviewService.getHrPresenceToken(routeId as string);
      if (!tokenData?.token) throw new Error(translate('errors.tokenMissing'));

      const isLocalOrigin =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      let urlToUse = getSafeLiveKitUrl(isLocalOrigin);
      const returnedUrl = tokenData.serverUrl;
      if (!isLocalOrigin && returnedUrl) {
        const isInternal =
          returnedUrl.includes('localhost') ||
          returnedUrl.includes('127.0.0.1') ||
          returnedUrl.includes('livekit:');
        if (!isInternal) {
          try {
            const url = new URL(returnedUrl);
            url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            urlToUse = url.toString().replace(/\/$/, '');
          } catch (urlErr) {
            console.warn('[LiveKit URL] Invalid server URL returned from backend:', urlErr);
          }
        }
      }

      const targetRoomName = latestSession.roomName || roomName;
      if (targetRoomName && (state.sessionInviteToken || tokenService.getAccessTokenFromCookie())) {
        try {
          const updatedStatus = await interviewService.updateSessionStatus(
            targetRoomName,
            'in_progress',
            { inviteToken: state.sessionInviteToken }
          );
          if (updatedStatus?.status) {
            dispatch({ type: 'set-session-status', value: updatedStatus.status });
          }
        } catch (statusErr) {
          console.warn('[InterviewSession] Failed to update session status to in_progress:', statusErr);
        }
      }

      dispatch({ type: 'set-connection-details', value: { token: tokenData.token, serverUrl: urlToUse } });
      dispatch({ type: 'set-connect-room', value: true });
    } catch (err) {
      dispatch({ type: 'set-error', value: getErrorDetail(err) || translate('errors.invalidSession') });
    } finally {
      dispatch({ type: 'set-starting', value: false });
    }
  }, [normalizedRole, roomName, routeId, state.sessionInviteToken]);

  const handleDisconnected = React.useCallback(() => {
    dispatch({ type: 'set-connect-room', value: false });
    dispatch({ type: 'set-connection-details', value: undefined });
    dispatch({ type: 'set-show-preflight', value: false });
    finalizeOnDisconnectRef.current = false;
  }, []);

  const finalizeInterviewSession = React.useCallback(async () => {
    if (!roomName) return;
    finalizeOnDisconnectRef.current = true;
    dispatch({ type: 'set-error', value: '' });
    dispatch({ type: 'set-session-status', value: 'processing' });
    dispatch({ type: 'set-connect-room', value: false });
    dispatch({ type: 'set-connection-details', value: undefined });
    dispatch({ type: 'set-show-preflight', value: false });

    try {
      await withTimeout(
        interviewService.updateSessionStatus(roomName, 'completed', { inviteToken: state.sessionInviteToken }),
        END_SESSION_STATUS_TIMEOUT_MS
      );
      window.setTimeout(() => {
        void fetchSessionDetails({ showLoading: false });
      }, PROCESSING_STATUS_REFRESH_MS);
    } catch (err) {
      finalizeOnDisconnectRef.current = false;
      dispatch({
        type: 'set-error',
        value: getErrorDetail(err) || tRef.current('errors.endSessionFailed'),
      });
    }
  }, [fetchSessionDetails, roomName, state.sessionInviteToken]);

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (state.loading) {
    return <InterviewSessionLoading label={t('loading')} />;
  }

  // â”€â”€ Error (no session) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (state.error && !state.session) {
    return (
      <InterviewSessionError
        message={state.error}
        actionLabel={t('common:actions.backHome')}
        onBackHome={() => push('/')}
      />
    );
  }

  // â”€â”€ Derived display values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const statusKey = (state.session?.status || 'scheduled').toLowerCase();
  const displayStatusKey =
    state.connectRoom && state.connectionDetails && ['scheduled', 'calibration', 'interrupted'].includes(statusKey)
      ? 'in_progress'
      : statusKey;
  const isProcessing = statusKey === 'processing';
  const statusText = t(`interviewListCard.statuses.${displayStatusKey}`);
  const statusClass = statusClassMap[displayStatusKey] || 'border-white/15 bg-white/10 text-zinc-200';
  const formattedSchedule = state.session?.scheduledAt
    ? new Date(state.session.scheduledAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
    : undefined;

  const jobLabel       = state.session?.jobName       || t('common:labels.job');
  const candidateLabel = state.session?.candidateName || t('interviewListCard.candidate');
  const sessionTitle   = isJoinable
    ? normalizedRole === 'jobseeker'
      ? t('readyTitle')
      : t('interviewDetail.title', { ns: 'employer' })
    : isProcessing
      ? t('processingTitle')
      : t('unavailableTitle');

  // â”€â”€â”€ Active video conference (LiveKit VideoConference) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (state.connectRoom && state.connectionDetails) {
    return (
      <ActiveInterviewRoom
        connectionDetails={state.connectionDetails}
        sessionTitle={sessionTitle}
        jobLabel={jobLabel}
        candidateLabel={candidateLabel}
        statusClass={statusClass}
        statusText={statusText}
        participantRole={normalizedRole}
        formattedSchedule={formattedSchedule}
        timeLabel={t('common:labels.time')}
        onDisconnected={handleDisconnected}
        onEndSession={finalizeInterviewSession}
      />
    );
  }

  // â”€â”€â”€ Preflight / waiting room â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <InterviewWaitingRoom
      viewState={{
        isInterrupted,
        showPreflight: state.showPreflight,
        starting: state.starting,
        isJoinable,
      }}
      labels={{
        interruptedResumeHint: t('interview:interviewDetail.messages.interruptedResumeHint'),
        sessionTitle,
        jobLabel,
        candidateLabel,
        statusText,
        readyTitle: t('readyTitle'),
        unavailableTitle: isProcessing ? t('processingTitle') : t('sessionNotJoinable'),
        readyBody: t('readyBody'),
        unavailableBody: isProcessing ? t('processingBody') : t('sessionNotJoinableBody'),
        startInterview: t('startInterview'),
        back: t('common:actions.back'),
        backHome: t('common:actions.backHome'),
        time: t('common:labels.time'),
      }}
      statusClass={statusClass}
      error={state.error}
      formattedSchedule={formattedSchedule}
      actions={{
        onJoin: initiateInterviewSession,
        onCancelPreflight: () => dispatch({ type: 'set-show-preflight', value: false }),
        onShowPreflight: () => dispatch({ type: 'set-show-preflight', value: true }),
        onBack: () => back(),
        onBackHome: () => push('/'),
      }}
    />
  );
};

export default InterviewSessionPage;

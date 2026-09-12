'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AilaLogo } from '@/components/Common/AilaLogo';

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';

import interviewService from '@/services/interviewService';
import tokenService from '@/services/tokenService';
import { transformInterviewSession } from '@/utils/transformers';
import type { InterviewSession, Question } from '@/types/models';
import { PreflightRoom } from './PreflightRoom';
import { AIInterviewLayout } from './AIInterviewLayout';
import { InterviewCompletedView } from './components/InterviewCompletedView';
import { InterviewRecordingBadge } from './components/InterviewRecordingBadge';
import {
  InterviewPreparationModal,
  PreparationStepState,
} from './components/InterviewPreparationModal';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/configs/images';
import DottedWorldMapBackground from '@/views/onboardingPages/components/DottedWorldMapBackground';

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

function resolveLiveKitServerUrl(returnedUrl?: string): string {
  const isLocalOrigin =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  let urlToUse = getSafeLiveKitUrl(isLocalOrigin);
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
  return urlToUse;
}

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

// ─── Component ──────────────────────────────────────────────────────────────────

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
        <Button
          variant="default"
          onClick={onBackHome}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 active:scale-98"
        >
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
  questions,
  onDisconnected,
  onEndSession,
  isMock,
  session,
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
  questions?: Question[];
  onDisconnected: () => void;
  onEndSession: () => Promise<void>;
  isMock?: boolean;
  session?: InterviewSession | null;
}) {
  const sessionMeta = ((session?.sessionMetadata || session?.session_metadata || {}) as Record<string, any>);
  const avatarImageUrl = sessionMeta.avatar_image_url || sessionMeta.avatarImageUrl || null;
  const avatarBackgroundUrl = sessionMeta.avatar_background_url || sessionMeta.avatarBackgroundUrl || null;
  const avatarBackdrop = sessionMeta.avatar_backdrop || sessionMeta.avatarBackdrop || 'modern_office';
  const interviewerName = sessionMeta.interviewer_name || sessionMeta.interviewerName || (isMock ? 'Trợ lý AI AILA' : 'Trợ lý AI Phỏng vấn');

  return (
    <main className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#f8fafc] text-slate-900">
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-xl md:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Image
            src={IMAGES.getTextLogo('dark')}
            alt="InfoHR"
            width={90}
            height={28}
            style={{ height: 24, width: 'auto', objectFit: 'contain' }}
          />
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 md:text-base">{sessionTitle}</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {jobLabel ? `${jobLabel} • ` : ''}{candidateLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {formattedSchedule && (
            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">
              <span className="size-1.5 rounded-full bg-slate-400" /> {formattedSchedule}
            </span>
          )}
          {isMock ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-xs">
              <AilaLogo size={13} variant="mark" /> Phiên luyện tập AILA thực chiến
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-xs">
              <ApartmentOutlinedIcon sx={{ fontSize: 13 }} /> Phỏng vấn chính thức
            </span>
          )}
          <InterviewRecordingBadge />
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-xs">
            {statusText}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col min-h-0 h-full w-full overflow-hidden">
        <LiveKitRoom
          token={connectionDetails.token}
          serverUrl={connectionDetails.serverUrl}
          connect={true}
          video={participantRole === 'jobseeker'}
          audio={participantRole === 'jobseeker' ? INTERVIEW_AUDIO_CAPTURE_OPTIONS : false}
          onDisconnected={onDisconnected}
          className="flex flex-1 flex-col min-h-0 h-full w-full overflow-hidden"
          style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
          <AIInterviewLayout
            onEndSession={onEndSession}
            questions={questions}
            avatarImageUrl={avatarImageUrl}
            avatarBackgroundUrl={avatarBackgroundUrl}
            avatarBackdrop={avatarBackdrop}
            interviewerName={interviewerName}
          />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </main>
  );
}

type WaitingRoomViewState = {
  isInterrupted: boolean;
  showPreflight: boolean;
  starting: boolean;
  isJoinable: boolean;
  session: InterviewSession | null;
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
  const isMock =
    viewState.session?.sessionType === 'mock' ||
    (viewState.session as any)?.type === 'practice' ||
    (!viewState.session?.jobPost && !viewState.session?.companyName);

  return (
    <main className="relative flex min-h-[100dvh] flex-col bg-[#f8fafc] text-slate-800 overflow-x-hidden">
      {/* Subtle Dotted World Map Background Pattern */}
      <DottedWorldMapBackground
        dotColor="#2563eb"
        mapOpacity={0.32}
        dotRadius={1.6}
      />

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
            />
          </div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 md:text-base">{labels.sessionTitle}</h1>
            <p className="text-xs font-medium text-slate-500">{labels.jobLabel ? `${labels.jobLabel} • ` : ''}{labels.candidateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isMock ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-2xs">
              <AilaLogo size={13} variant="mark" /> Luyện tập AILA thực chiến
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-2xs">
              <ApartmentOutlinedIcon sx={{ fontSize: 13 }} /> Phỏng vấn chính thức
            </span>
          )}
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

        <div className={cn("relative z-10 w-full transition-all duration-300", viewState.showPreflight ? "max-w-5xl" : "max-w-xl")}>
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
              session={viewState.session}
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
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                  {viewState.isJoinable
                    ? isMock
                      ? 'Phòng Luyện tập Phỏng vấn AI'
                      : labels.readyTitle
                    : labels.unavailableTitle}
                </h2>
                {error && (
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-600">{error}</p>
                )}
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                  {viewState.isJoinable
                    ? isMock
                      ? 'Chào mừng bạn đến với phiên luyện tập tự do cùng Trợ lý AI AILA. Buổi luyện tập hoàn toàn riêng tư, không chia sẻ với nhà tuyển dụng.'
                      : labels.readyBody
                    : labels.unavailableBody}
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-3 pt-2">
                {viewState.isJoinable ? (
                  <>
                    <Button
                      variant="default"
                      size="lg"
                      onClick={actions.onShowPreflight}
                      disabled={viewState.starting}
                      className="w-full max-w-[300px] h-12 rounded-xl bg-blue-600 font-bold text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-[0.98] border-0"
                    >
                      {viewState.starting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : isMock ? (
                        'Bắt đầu luyện tập với AI'
                      ) : (
                        labels.startInterview
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={actions.onBack}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 border-0 bg-transparent"
                    >
                      {labels.back}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={actions.onBackHome}
                    className="w-full max-w-[280px] h-11 rounded-xl bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700 active:scale-98"
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

  // Preparation Modal States
  const [prepModalOpen, setPrepModalOpen] = React.useState(false);
  const [prepSteps, setPrepSteps] = React.useState<PreparationStepState>({
    room: 'pending',
    script: 'pending',
    agent: 'pending',
  });
  const [prepProgress, setPrepProgress] = React.useState(10);
  const [prepMessage, setPrepMessage] = React.useState('Đang chuẩn bị phòng phỏng vấn...');
  const [prepError, setPrepError] = React.useState<string | undefined>(undefined);

  const roomName   = state.session?.roomName;
  const rawStatus  = (state.session?.status || 'scheduled').toLowerCase();
  const isJoinable = !!state.session && JOINABLE_STATUSES.includes(rawStatus);
  const isInterrupted = rawStatus === 'interrupted';

  const prefetchedConnectionRef = React.useRef<{
    promise: Promise<LiveKitConnectionDetails | null> | null;
    data: LiveKitConnectionDetails | null;
    key: string;
  }>({ promise: null, data: null, key: '' });

  const prefetchToken = React.useCallback(async (inviteToken: string, id?: string): Promise<LiveKitConnectionDetails | null> => {
    const key = `${normalizedRole}:${inviteToken || id || ''}`;
    if (prefetchedConnectionRef.current.key === key && prefetchedConnectionRef.current.data) {
      return prefetchedConnectionRef.current.data;
    }
    if (prefetchedConnectionRef.current.key === key && prefetchedConnectionRef.current.promise) {
      return prefetchedConnectionRef.current.promise;
    }

    const fetchPromise = (async () => {
      try {
        const tokenData =
          normalizedRole === 'jobseeker'
            ? await interviewService.getLiveKitToken(inviteToken)
            : await interviewService.getHrPresenceToken(id as string);
        if (!tokenData?.token) return null;
        const details: LiveKitConnectionDetails = {
          token: tokenData.token,
          serverUrl: resolveLiveKitServerUrl(tokenData.serverUrl),
        };
        prefetchedConnectionRef.current.data = details;
        return details;
      } catch (err) {
        console.warn('[InterviewSession] Background token prefetch deferred or failed:', err);
        return null;
      }
    })();

    prefetchedConnectionRef.current = {
      promise: fetchPromise,
      data: null,
      key,
    };
    return fetchPromise;
  }, [normalizedRole]);

  React.useEffect(() => {
    if (!isJoinable || state.connectRoom) return;
    const tokenOrId = normalizedRole === 'jobseeker' ? state.sessionInviteToken : routeId;
    if (tokenOrId) {
      void prefetchToken(state.sessionInviteToken, routeId);
    }
  }, [isJoinable, normalizedRole, prefetchToken, routeId, state.connectRoom, state.sessionInviteToken]);

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
        try {
          detailRaw = await interviewService.getSessionDetailByInviteToken(inviteToken);
        } catch (inviteErr: unknown) {
          if (routeId && /^\d+$/.test(routeId)) {
            detailRaw = await interviewService.getSessionDetail(routeId);
          } else {
            throw inviteErr;
          }
        }
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

  React.useEffect(() => {
    if (!state.connectRoom || !roomName) return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const detailRaw = normalizedRole === 'jobseeker'
          ? (state.sessionInviteToken ? await interviewService.getSessionDetailByInviteToken(state.sessionInviteToken) : null)
          : (routeId ? await interviewService.getSessionDetail(routeId) : null);
        if (detailRaw) {
          const status = (detailRaw as any)?.status?.toLowerCase();
          if (status === 'completed' || status === 'processing') {
            dispatch({ type: 'set-session-status', value: status });
            dispatch({ type: 'set-connect-room', value: false });
            dispatch({ type: 'set-connection-details', value: undefined });
            void fetchSessionDetails({ showLoading: false });
          }
        }
      } catch {
        // silent check
      }
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [state.connectRoom, roomName, normalizedRole, state.sessionInviteToken, routeId, fetchSessionDetails]);

  // Auto-refresh completed/processing session until AI evaluation is loaded
  React.useEffect(() => {
    const statusKey = (state.session?.status || '').toLowerCase();
    const hasAiScore = state.session?.aiOverallScore != null;
    if (statusKey !== 'processing' && (statusKey !== 'completed' || hasAiScore)) {
      return undefined;
    }

    let pollCount = 0;
    const pollInterval = window.setInterval(async () => {
      pollCount += 1;
      await fetchSessionDetails({ showLoading: false });
      if (pollCount >= 15) {
        window.clearInterval(pollInterval);
      }
    }, 3000);

    return () => window.clearInterval(pollInterval);
  }, [state.session?.status, state.session?.aiOverallScore, fetchSessionDetails]);

  // â”€â”€ Start / terminate session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const initiateInterviewSession = React.useCallback(async () => {
    const translate = tRef.current;
    try {
      dispatch({ type: 'set-starting', value: true });
      dispatch({ type: 'set-error', value: '' });

      if (!state.sessionInviteToken && normalizedRole === 'jobseeker') {
        throw new Error(translate('errors.missingInvite'));
      }
      if (normalizedRole !== 'jobseeker' && !routeId) {
        throw new Error(translate('errors.missingSessionId'));
      }

      // 0. Open Preparation Checklist Modal
      setPrepModalOpen(true);
      setPrepSteps({ room: 'processing', script: 'pending', agent: 'pending' });
      setPrepProgress(15);
      setPrepMessage('Đang chuẩn bị phòng phỏng vấn...');
      setPrepError(undefined);

      // 1. Stage 1: Room & LiveKit Token Setup
      let connectionDetails = prefetchedConnectionRef.current.data;
      if (!connectionDetails && prefetchedConnectionRef.current.promise) {
        connectionDetails = await prefetchedConnectionRef.current.promise;
      }

      if (!connectionDetails?.token) {
        const tokenData =
          normalizedRole === 'jobseeker'
            ? await interviewService.getLiveKitToken(state.sessionInviteToken)
            : await interviewService.getHrPresenceToken(routeId as string);
        if (!tokenData?.token) throw new Error(translate('errors.tokenMissing'));
        connectionDetails = {
          token: tokenData.token,
          serverUrl: resolveLiveKitServerUrl(tokenData.serverUrl),
        };
      }

      // Mark Room step complete, start Script step
      setPrepSteps({ room: 'completed', script: 'processing', agent: 'pending' });
      setPrepProgress(45);
      setPrepMessage('Đang chuẩn bị kịch bản phỏng vấn...');

      // 2. Stage 2: Questions & Session Context
      let currentSession = state.session;
      if (!currentSession?.questions || currentSession.questions.length === 0) {
        await fetchSessionDetails({ showLoading: false });
      }
      await new Promise((res) => setTimeout(res, 400));

      // Mark Script step complete, start Agent step
      setPrepSteps({ room: 'completed', script: 'completed', agent: 'processing' });
      setPrepProgress(75);
      setPrepMessage('Agent đang tham gia phòng phỏng vấn...');

      // 3. Stage 3: Agent Readiness & in_progress Status
      const targetRoomName = state.session?.roomName || roomName;
      if (targetRoomName && (state.sessionInviteToken || tokenService.getAccessTokenFromCookie())) {
        try {
          const updatedStatus = await withTimeout(
            interviewService.updateSessionStatus(targetRoomName, 'in_progress', {
              inviteToken: state.sessionInviteToken,
            }),
            8000
          );
          if (updatedStatus?.status) {
            dispatch({ type: 'set-session-status', value: updatedStatus.status });
          }
        } catch (statusErr) {
          console.warn('[InterviewSession] Session status sync:', statusErr);
        }
      }

      await new Promise((res) => setTimeout(res, 600));

      // All Steps Complete
      setPrepSteps({ room: 'completed', script: 'completed', agent: 'completed' });
      setPrepProgress(100);
      setPrepMessage('Mọi thứ đã sẵn sàng!');

      // Brief pause so candidate sees 100% completion & all green checkmarks
      await new Promise((res) => setTimeout(res, 450));

      setPrepModalOpen(false);
      dispatch({ type: 'set-connection-details', value: connectionDetails });
      dispatch({ type: 'set-connect-room', value: true });
    } catch (err) {
      const errDetail = getErrorDetail(err) || translate('errors.invalidSession');
      setPrepSteps((prev) => ({
        ...prev,
        room: prev.room === 'processing' ? 'error' : prev.room,
        script: prev.script === 'processing' ? 'error' : prev.script,
        agent: prev.agent === 'processing' ? 'error' : prev.agent,
      }));
      setPrepError(errDetail);
      dispatch({ type: 'set-error', value: errDetail });
    } finally {
      dispatch({ type: 'set-starting', value: false });
    }
  }, [
    fetchSessionDetails,
    normalizedRole,
    roomName,
    routeId,
    state.session,
    state.sessionInviteToken,
  ]);

  const handleDisconnected = React.useCallback(() => {
    dispatch({ type: 'set-connect-room', value: false });
    dispatch({ type: 'set-connection-details', value: undefined });
    dispatch({ type: 'set-show-preflight', value: false });
    finalizeOnDisconnectRef.current = false;
    prefetchedConnectionRef.current = { promise: null, data: null, key: '' };
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

  const isMock =
    state.session?.sessionType === 'mock' ||
    (state.session as any)?.type === 'practice' ||
    (!state.session?.jobPost && !state.session?.companyName);

  const jobLabel = isMock
    ? 'Luyện tập kỹ năng phỏng vấn AI'
    : (state.session?.jobName?.trim() || '');
  const candidateLabel = state.session?.candidateName || t('interviewListCard.candidate');
  const activeRoomTitle = isMock
    ? 'Phiên luyện tập cùng Trợ lý AI AILA'
    : (state.session?.jobName?.trim() ||
      (normalizedRole === 'jobseeker'
        ? t('activeRoomTitle')
        : t('interviewDetail.title', { ns: 'employer' })));
  const sessionTitle = state.connectRoom
    ? activeRoomTitle
    : isJoinable
      ? (isMock
          ? 'Phòng Luyện tập Phỏng vấn AI'
          : (normalizedRole === 'jobseeker'
              ? t('readyTitle')
              : t('interviewDetail.title', { ns: 'employer' })))
      : isProcessing
        ? t('processingTitle')
        : t('unavailableTitle');

  // ─── Active video conference (LiveKit VideoConference) ────────────────

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
        questions={state.session?.questions || []}
        onDisconnected={handleDisconnected}
        onEndSession={finalizeInterviewSession}
        isMock={isMock}
        session={state.session}
      />
    );
  }

  // ─── Completed or Processing: Show Results / Completion View ─────────────────
  if (statusKey === 'completed' || isProcessing) {
    return (
      <InterviewCompletedView
        session={state.session}
        isProcessing={isProcessing}
        myInterviewsPath={localizeRoutePath('/phong-van-cua-toi', i18n.language)}
        practicePath={localizeRoutePath('/practice', i18n.language)}
        onBackHome={() => push('/')}
      />
    );
  }

  // ─── Preflight / waiting room ──────────────────────────────────────────

  return (
    <>
      <InterviewWaitingRoom
        viewState={{
          isInterrupted,
          showPreflight: state.showPreflight,
          starting: state.starting,
          isJoinable,
          session: state.session,
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
      <InterviewPreparationModal
        open={prepModalOpen}
        steps={prepSteps}
        progress={prepProgress}
        currentMessage={prepMessage}
        errorMessage={prepError}
        onRetry={initiateInterviewSession}
        onCancel={() => setPrepModalOpen(false)}
        isMock={isMock}
      />
    </>
  );
};

export default InterviewSessionPage;

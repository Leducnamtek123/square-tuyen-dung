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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getSafeLiveKitUrl = (preferLocal = false) => {
  if (typeof window === 'undefined') return '';
  if (preferLocal) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/livekit`.replace(/\/$/, '');
  }
  const envUrl = (process.env.NEXT_PUBLIC_LIVEKIT_URL || '').trim();
  if (envUrl.startsWith('wss://')) return envUrl.replace(/\/$/, '');

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;

  if (envUrl && (envUrl.startsWith('http') || envUrl.startsWith('ws'))) {
    try {
      const url = new URL(envUrl);
      url.protocol = protocol;
      return url.toString().replace(/\/$/, '');
    } catch {}
  }

  const path = envUrl && envUrl.startsWith('/') ? envUrl : envUrl || '/livekit';
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
  scheduled:   'border-sky-400/30 bg-sky-500/15 text-sky-200',
  in_progress: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
  processing:  'border-amber-400/30 bg-amber-500/15 text-amber-200',
  completed:   'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  cancelled:   'border-rose-400/30 bg-rose-500/15 text-rose-200',
  interrupted: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
};

const JOINABLE_STATUSES = ['scheduled', 'calibration', 'in_progress', 'interrupted'];

// ─── Types ────────────────────────────────────────────────────────────────────

type InterviewSessionPageProps = {
  role?: 'jobseeker' | 'employer' | 'admin' | string;
};

type SessionPageState = {
  loading: boolean;
  starting: boolean;
  error: string;
  showPreflight: boolean;
  connectRoom: boolean;
  connectionDetails?: { token: string; serverUrl: string };
  session: InterviewSession | null;
  sessionInviteToken: string;
};

type SessionPageAction =
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-starting'; value: boolean }
  | { type: 'set-error'; value: string }
  | { type: 'set-show-preflight'; value: boolean }
  | { type: 'set-connect-room'; value: boolean }
  | { type: 'set-connection-details'; value?: { token: string; serverUrl: string } }
  | { type: 'set-session'; value: InterviewSession | null }
  | { type: 'set-session-invite-token'; value: string };

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
    case 'set-session-invite-token': return { ...state, sessionInviteToken: action.value };
  default:                       return state;
  }
};

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

// ─── Component ────────────────────────────────────────────────────────────────

const InterviewSessionPage = ({ role = 'jobseeker' }: InterviewSessionPageProps) => {
  const normalizedRole = normalizeRole(role);
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useRouter();
  const { t, i18n } = useTranslation(['interview', 'common']);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const finalizeOnDisconnectRef = React.useRef(false);

  const roomName   = state.session?.roomName;
  const isJoinable = !!state.session && JOINABLE_STATUSES.includes(state.session.status);
  const isInterrupted = state.session?.status === 'interrupted';

  // ── Fetch session ────────────────────────────────────────────────────────

  const fetchSessionDetails = React.useCallback(async () => {
    try {
      dispatch({ type: 'set-loading', value: true });
      dispatch({ type: 'set-error', value: '' });

      let detailRaw: unknown;
      let inviteToken = '';

      if (normalizedRole === 'jobseeker') {
        inviteToken = routeId || '';
        if (!inviteToken) throw new Error(t('errors.missingInvite'));
        detailRaw = await interviewService.getSessionDetailByInviteToken(inviteToken);
      } else {
        if (!routeId) throw new Error(t('errors.missingSessionId'));
        detailRaw = await interviewService.getSessionDetail(routeId);
        inviteToken = (detailRaw as { inviteToken?: string } | null)?.inviteToken || '';
      }

      const mapped = transformInterviewSession(detailRaw);
      if (!mapped) throw new Error(t('errors.invalidSession'));

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
      dispatch({ type: 'set-error', value: err instanceof Error ? err.message : t('errors.invalidSession') });
    } finally {
      dispatch({ type: 'set-loading', value: false });
    }
  }, [normalizedRole, routeId, t]);

  React.useEffect(() => { fetchSessionDetails(); }, [fetchSessionDetails]);

  // ── Start / terminate session ─────────────────────────────────────────────

  const initiateInterviewSession = React.useCallback(async () => {
    try {
      dispatch({ type: 'set-starting', value: true });
      dispatch({ type: 'set-error', value: '' });

      if (!state.sessionInviteToken) throw new Error(t('errors.missingInvite'));
      if (normalizedRole !== 'jobseeker' && !routeId) throw new Error(t('errors.missingSessionId'));

      const latestRaw =
        normalizedRole === 'jobseeker'
          ? await interviewService.getSessionDetailByInviteToken(state.sessionInviteToken)
          : await interviewService.getSessionDetail(routeId as string);
      const latestSession = transformInterviewSession(latestRaw);
      if (!latestSession) throw new Error(t('errors.invalidSession'));

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
          t('errors.sessionNotReadyForJoin', {
            status: t(`interviewListCard.statuses.${latestSession.status}`),
          })
        );
      }

      const tokenData =
        normalizedRole === 'jobseeker'
          ? await interviewService.getLiveKitToken(state.sessionInviteToken)
          : await interviewService.getHrPresenceToken(routeId as string);
      if (!tokenData?.token) throw new Error(t('errors.tokenMissing'));

      const isLocalOrigin =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      let urlToUse = getSafeLiveKitUrl(isLocalOrigin);
      const returnedUrl = tokenData.serverUrl || tokenData.server_url || tokenData.url;
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
          } catch {}
        }
      }

      if (roomName && tokenService.getAccessTokenFromCookie()) {
        await interviewService.updateSessionStatus(roomName, 'in_progress').catch(() => {});
      }

      dispatch({ type: 'set-connection-details', value: { token: tokenData.token, serverUrl: urlToUse } });
      dispatch({ type: 'set-connect-room', value: true });
    } catch (err) {
      dispatch({ type: 'set-error', value: getErrorDetail(err) || t('errors.invalidSession') });
    } finally {
      dispatch({ type: 'set-starting', value: false });
    }
  }, [normalizedRole, roomName, routeId, state.sessionInviteToken, t]);

  const handleDisconnected = React.useCallback(() => {
    dispatch({ type: 'set-connect-room', value: false });
    dispatch({ type: 'set-connection-details', value: undefined });
    finalizeOnDisconnectRef.current = false;
  }, []);

  const finalizeInterviewSession = React.useCallback(async () => {
    if (!roomName) return;
    finalizeOnDisconnectRef.current = true;
    try {
      await interviewService.updateSessionStatus(roomName, 'completed');
    } catch {
      finalizeOnDisconnectRef.current = false;
    }
  }, [roomName]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (state.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020617] text-slate-100">
        <div className="flex flex-col items-center gap-3 text-center">
          <CircularProgress size={36} sx={{ color: '#38bdf8' }} />
          <p className="text-sm text-slate-400">{t('loading')}</p>
        </div>
      </main>
    );
  }

  // ── Error (no session) ────────────────────────────────────────────────────

  if (state.error && !state.session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020617] px-6">
        <section className="w-full max-w-lg rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100">
          <p className="mb-6 text-lg font-medium">{state.error}</p>
          <Button variant="contained" sx={{ bgcolor: '#e11d48', '&:hover': { bgcolor: '#be123c' } }} onClick={() => navigate.push('/')}>
            {t('common:actions.backHome')}
          </Button>
        </section>
      </main>
    );
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const statusKey   = (state.session?.status || 'scheduled').toLowerCase();
  const statusText  = t(`interviewListCard.statuses.${statusKey}`, { defaultValue: statusKey.replaceAll('_', ' ') });
  const statusClass = statusClassMap[statusKey] || 'border-white/15 bg-white/10 text-slate-200';
  const formattedSchedule =
    state.session?.scheduledAt &&
    new Date(state.session.scheduledAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');

  const jobLabel       = state.session?.jobName       || t('common:labels.job');
  const candidateLabel = state.session?.candidateName || t('interviewListCard.candidate');
  const sessionTitle   = isJoinable
    ? normalizedRole === 'jobseeker'
      ? t('readyTitle')
      : t('interviewDetail.title', { ns: 'employer' })
    : t('unavailableTitle');

  // ─── Active video conference (LiveKit VideoConference) ────────────────────

  if (state.connectRoom && state.connectionDetails) {
    return (
      <main className="flex min-h-screen flex-col bg-[#020617] text-slate-100">
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between border-b border-white/5 bg-[#020617]/90 px-4 py-3 backdrop-blur-xl md:px-6">
          <div>
            <h1 className="text-sm font-bold text-white md:text-base">{sessionTitle}</h1>
            <p className="mt-0.5 text-xs text-slate-400">{jobLabel} | {candidateLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest', statusClass)}>
              {statusText}
            </span>
          </div>
        </header>

        {/* LiveKit room — uses VideoConference which handles layout, tiles, controls */}
        <div className="flex-1" style={{ height: 'calc(100vh - 57px)' }}>
          <LiveKitRoom
            token={state.connectionDetails.token}
            serverUrl={state.connectionDetails.serverUrl}
            connect={true}
            video={normalizedRole === 'jobseeker'}
            audio={true}
            onDisconnected={handleDisconnected}
            style={{ height: '100%' }}
          >
            <InterviewSessionBridge connectionDetails={state.connectionDetails}>
              <AIInterviewLayout onEndSession={finalizeInterviewSession} />
              <RoomAudioRenderer />
            </InterviewSessionBridge>
          </LiveKitRoom>
        </div>

        {formattedSchedule && (
          <p className="px-4 py-2 text-xs text-slate-500">
            {t('common:labels.time')} &bull; {formattedSchedule}
          </p>
        )}
      </main>
    );
  }

  // ─── Preflight / waiting room ─────────────────────────────────────────────

  return (
    <main className="dark min-h-screen bg-[#020617] px-4 py-4 text-slate-100 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">

        {isInterrupted && (
          <Alert severity="warning" sx={{ borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24' }}>
            {t('interview:interviewDetail.messages.interruptedResumeHint', {
              defaultValue: 'Kết nối vừa bị ngắt tạm thời. Bạn có thể bấm join lại để tiếp tục buổi phỏng vấn.',
            })}
          </Alert>
        )}

        {/* Session header card */}
        <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl md:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_60%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">{sessionTitle}</h1>
              <p className="mt-1 text-sm font-medium text-slate-400">{jobLabel} | {candidateLabel}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn('inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm', statusClass)}>
                {statusText}
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <section className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_0_100px_rgba(0,0,0,0.5)]">

          {state.showPreflight ? (
            /* ── Preflight device check ── */
            <div className="relative flex h-full min-h-[520px] items-center justify-center px-6 py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_52%)]" />
              <PreflightRoom
                onJoin={initiateInterviewSession}
                onCancel={() => dispatch({ type: 'set-show-preflight', value: false })}
                starting={state.starting}
              />
            </div>
          ) : (
            /* ── Waiting / not-yet-joinable ── */
            <div className="relative flex h-full min-h-[520px] items-center justify-center px-6 py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_52%)]" />
              <div className="relative flex w-full max-w-2xl flex-col items-center gap-10 text-center">

                {/* Logo */}
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-1000 group-hover:bg-cyan-500/20" />
                  <div className="relative z-10 flex h-[180px] w-[180px] items-center justify-center opacity-70 transition-all duration-1000 group-hover:opacity-100 md:h-[260px] md:w-[260px]">
                    <Image
                      src="/square-icons/logo.svg"
                      alt="Square"
                      width={180}
                      height={180}
                      style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                </div>

                {/* Title & error */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    {isJoinable ? t('readyTitle') : t('sessionNotJoinable')}
                  </h2>
                  {state.error && (
                    <p className="text-sm font-bold uppercase tracking-widest text-rose-400">{state.error}</p>
                  )}
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
                    {isJoinable ? t('readyBody') : t('sessionNotJoinableBody')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-3">
                  {isJoinable ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => dispatch({ type: 'set-show-preflight', value: true })}
                        disabled={state.starting}
                        sx={{
                          height: 56,
                          borderRadius: '1rem',
                          background: '#0ea5e9',
                          px: 6,
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          boxShadow: '0 0 30px rgba(14,165,233,0.3)',
                          '&:hover': { background: '#38bdf8' },
                          '&:disabled': { opacity: 0.5 },
                        }}
                      >
                        {state.starting ? <CircularProgress size={22} color="inherit" /> : t('startInterview')}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => navigate.back()}
                        sx={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', '&:hover': { color: 'white' } }}
                      >
                        {t('common:actions.back')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => navigate.push('/')}
                      sx={{ height: 48, borderRadius: '1rem', background: '#1e293b', px: 5, fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', '&:hover': { background: '#334155' } }}
                    >
                      {t('common:actions.backHome')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {formattedSchedule && (
          <p className="text-xs text-slate-500">
            {t('common:labels.time')} &bull; {formattedSchedule}
          </p>
        )}
      </div>
    </main>
  );
};

export default InterviewSessionPage;

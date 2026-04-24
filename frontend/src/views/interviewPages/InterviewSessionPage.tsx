'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';

import { App as VoiceAssistantApp } from '../../components/Features/VoiceAssistant/components/app/app';
import { APP_CONFIG_DEFAULTS } from '../../components/Features/VoiceAssistant/app-config';
import interviewService from '../../services/interviewService';
import tokenService from '../../services/tokenService';
import { transformInterviewSession } from '../../utils/transformers';
import type { InterviewSession } from '../../types/models';
import { PreflightRoom } from './PreflightRoom';
import { cn } from '@/lib/utils';

const getSafeLiveKitUrl = () => {
  if (typeof window === 'undefined') return '';
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

  const path = envUrl && envUrl.startsWith('/') ? envUrl : (envUrl || '/livekit');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${protocol}//${host}${cleanPath}`.replace(/\/$/, '');
};

const normalizeRole = (role: string) => {
  if (role === 'admin') return 'admin';
  if (role === 'employer') return 'employer';
  return 'jobseeker';
};

const statusClassMap: Record<string, string> = {
  scheduled: 'border-sky-400/30 bg-sky-500/15 text-sky-200',
  in_progress: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
  processing: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
  completed: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  cancelled: 'border-rose-400/30 bg-rose-500/15 text-rose-200',
};

type InterviewSessionPageProps = {
  role?: 'jobseeker' | 'employer' | 'admin' | string;
};

const JOINABLE_STATUSES = ['scheduled', 'calibration', 'in_progress'];

const getErrorDetail = (err: unknown): string | null => {
  const maybeAxios = err as {
    response?: { data?: { errors?: { detail?: string[] | string } } };
    message?: string;
  };

  const detail = maybeAxios?.response?.data?.errors?.detail;
  if (Array.isArray(detail) && detail.length > 0) return String(detail[0]);
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (maybeAxios?.message) return maybeAxios.message;
  return null;
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
    case 'set-loading':
      return { ...state, loading: action.value };
    case 'set-starting':
      return { ...state, starting: action.value };
    case 'set-error':
      return { ...state, error: action.value };
    case 'set-show-preflight':
      return { ...state, showPreflight: action.value };
    case 'set-connect-room':
      return { ...state, connectRoom: action.value };
    case 'set-connection-details':
      return { ...state, connectionDetails: action.value };
    case 'set-session':
      return { ...state, session: action.value };
    case 'set-session-invite-token':
      return { ...state, sessionInviteToken: action.value };
    default:
      return state;
  }
};

const InterviewSessionPage = ({ role = 'jobseeker' }: InterviewSessionPageProps) => {
  const normalizedRole = normalizeRole(role);
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useRouter();
  const { t, i18n } = useTranslation(['interview', 'common']);
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const roomName = state.session?.roomName;
  const isJoinable = !!state.session && JOINABLE_STATUSES.includes(state.session.status);

  const sessionTitle = React.useMemo(() => {
    if (!isJoinable) return t('unavailableTitle', { defaultValue: 'Session Unavailable' });
    if (normalizedRole === 'jobseeker') return t('readyTitle', { defaultValue: 'Ready to start interview' });
    return t('interviewDetail.title', { ns: 'employer', defaultValue: 'Interview session' });
  }, [normalizedRole, t, isJoinable]);

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
        if (!routeId) throw new Error(t('errors.missingSessionId', { defaultValue: 'Missing session ID.' }));
        detailRaw = await interviewService.getSessionDetail(routeId);
        inviteToken = (detailRaw as { inviteToken?: string } | null)?.inviteToken || '';
      }

      const mappedSession = transformInterviewSession(detailRaw);
      if (!mappedSession) throw new Error(t('errors.invalidSession'));

      dispatch({ type: 'set-session', value: mappedSession });
      dispatch({
        type: 'set-session-invite-token',
        value: inviteToken || mappedSession.inviteToken || (detailRaw as { invite_token?: string } | null)?.invite_token || '',
      });
    } catch (err) {
      dispatch({ type: 'set-error', value: err instanceof Error ? err.message : t('errors.invalidSession') });
    } finally {
      dispatch({ type: 'set-loading', value: false });
    }
  }, [normalizedRole, routeId, t]);

  React.useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  const initiateInterviewSession = React.useCallback(async () => {
    try {
      dispatch({ type: 'set-starting', value: true });
      dispatch({ type: 'set-error', value: '' });

      if (!state.sessionInviteToken) {
        throw new Error(t('errors.missingInvite', { defaultValue: 'Missing interview invite code.' }));
      }

      if (normalizedRole !== 'jobseeker' && !routeId) {
        throw new Error(t('errors.missingSessionId', { defaultValue: 'Missing session ID.' }));
      }

      const latestRaw =
        normalizedRole === 'jobseeker'
          ? await interviewService.getSessionDetailByInviteToken(state.sessionInviteToken)
          : await interviewService.getSessionDetail(routeId as string);
      const latestSession = transformInterviewSession(latestRaw);
      if (!latestSession) throw new Error(t('errors.invalidSession'));

      dispatch({ type: 'set-session', value: latestSession });
      dispatch({
        type: 'set-session-invite-token',
        value: latestSession.inviteToken || (latestRaw as { invite_token?: string } | null)?.invite_token || state.sessionInviteToken,
      });

      if (!JOINABLE_STATUSES.includes(latestSession.status)) {
        throw new Error(
          t('errors.sessionNotReadyForJoin', {
            defaultValue: 'Khong the vao phong luc nay vi phien dang o trang thai {{status}}.',
            status: t(`interviewListCard.statuses.${latestSession.status}`, {
              defaultValue: latestSession.status?.replaceAll('_', ' '),
            }),
          }),
        );
      }

      const tokenData = await interviewService.getLiveKitToken(state.sessionInviteToken);
      if (!tokenData?.token) {
        throw new Error(t('errors.tokenMissing', { defaultValue: 'Connection token missing. Please try again.' }));
      }

      let urlToUse = getSafeLiveKitUrl();
      const returnedUrl = tokenData.serverUrl || tokenData.server_url || tokenData.url;
      if (returnedUrl) {
        const isInternal = returnedUrl.includes('localhost') || returnedUrl.includes('127.0.0.1') || returnedUrl.includes('livekit:');
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
      dispatch({ type: 'set-error', value: getErrorDetail(err) || t('errors.invalidSession', { defaultValue: 'Cannot start interview.' }) });
    } finally {
      dispatch({ type: 'set-starting', value: false });
    }
  }, [normalizedRole, roomName, routeId, state.sessionInviteToken, t]);

  const terminateInterviewSession = React.useCallback(async () => {
    dispatch({ type: 'set-connect-room', value: false });
    dispatch({ type: 'set-connection-details', value: undefined });
    try {
      if (roomName) {
        await interviewService.updateSessionStatus(roomName, 'completed');
      }
    } catch {}
  }, [roomName]);

  React.useEffect(() => {
    if (!state.connectRoom) return;
    return () => {};
  }, [state.connectRoom]);

  if (state.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          <p className="text-sm text-slate-300">{t('loading', { defaultValue: 'Waiting for system...' })}</p>
        </div>
      </main>
    );
  }

  if (state.error && !state.session) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6">
        <section className="w-full max-w-lg rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100">
          <p className="mb-6 text-lg font-medium">{state.error}</p>
          <Button variant="contained" className="bg-rose-600 hover:bg-rose-700" onClick={() => navigate.push('/')}>
            {t('common:actions.backHome', { defaultValue: 'Back home' })}
          </Button>
        </section>
      </main>
    );
  }

  const statusKey = (state.session?.status || 'scheduled').toLowerCase();
  const statusText = t(`interviewListCard.statuses.${statusKey}`, { defaultValue: statusKey.replaceAll('_', ' ') });
  const statusClass = statusClassMap[statusKey] || 'border-white/15 bg-white/10 text-slate-200';
  const formattedSchedule =
    state.session?.scheduledAt && new Date(state.session.scheduledAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');

  const jobLabel = state.session?.jobName || t('common:labels.job', { defaultValue: 'Job' });
  const candidateLabel = state.session?.candidateName || t('interviewListCard.candidate', { defaultValue: 'Candidate' });

  return (
    <main className="dark min-h-screen bg-slate-950 px-4 py-4 text-slate-100 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl md:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_60%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">{sessionTitle}</h1>
              <p className="mt-1 text-sm font-medium text-slate-400">
                {jobLabel} | {candidateLabel}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn('inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm', statusClass)}>
                {statusText}
              </span>
              {state.connectRoom && (
                <>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <Button
                    variant="contained"
                    color="error"
                    onClick={terminateInterviewSession}
                    className="h-9 rounded-xl px-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-95"
                  >
                    {t('controls.end', { defaultValue: 'End call' })}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="relative h-[75vh] min-h-[600px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-1000">
          {state.connectRoom && state.connectionDetails ? (
            <VoiceAssistantApp
              appConfig={{
                ...APP_CONFIG_DEFAULTS,
                supportsVideoInput: normalizedRole === 'jobseeker',
                supportsChatInput: normalizedRole === 'jobseeker',
              }}
              connectionDetails={state.connectionDetails}
              onDisconnect={terminateInterviewSession}
            />
          ) : state.showPreflight ? (
            <div className="relative flex h-full items-center justify-center px-6 transition-all duration-500">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_52%)]" />
              <PreflightRoom
                onJoin={initiateInterviewSession}
                onCancel={() => dispatch({ type: 'set-show-preflight', value: false })}
                starting={state.starting}
              />
            </div>
          ) : (
            <div className="relative flex h-full items-center justify-center px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_52%)]" />
              <div className="relative flex w-full max-w-2xl flex-col items-center gap-10 text-center">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-1000 group-hover:bg-cyan-500/20" />
                  <div className="relative z-10 flex h-[220px] w-[220px] items-center justify-center opacity-70 transition-all duration-1000 group-hover:opacity-100 md:h-[320px] md:w-[320px]">
                    <Image
                      src="/square-icons/logo.svg"
                      alt="Square"
                      width={200}
                      height={200}
                      style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    {isJoinable
                      ? t('readyTitle', { defaultValue: 'Ready to start interview' })
                      : t('sessionNotJoinable', { defaultValue: 'Session Unavailable' })}
                  </h2>
                  {state.error && <p className="text-sm font-bold uppercase tracking-widest text-rose-400">{state.error}</p>}
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
                    {isJoinable
                      ? t('readyBody', {
                          defaultValue: 'Join the interview room. Your camera and microphone will only be shared when you choose.',
                        })
                      : t(`errors.unjoinableByStatus.${statusKey}`, {
                          defaultValue: t('sessionNotJoinableBody', {
                            defaultValue: 'This interview session has already ended or been cancelled.',
                          }),
                        })}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  {isJoinable ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => dispatch({ type: 'set-show-preflight', value: true })}
                        disabled={state.starting}
                        className="h-14 rounded-2xl bg-cyan-500 px-12 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 hover:shadow-cyan-400/30 active:scale-[0.98] disabled:opacity-50"
                      >
                        {state.starting
                          ? t('loading', { defaultValue: 'Waiting for system...' })
                          : t('startInterview', { defaultValue: 'Start Connecting' })}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => navigate.back()}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
                      >
                        {t('common:actions.back', { defaultValue: 'Go back' })}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => navigate.push('/')}
                      className="h-12 rounded-2xl bg-slate-800 px-10 text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:bg-slate-700"
                    >
                      {t('common:actions.backHome', { defaultValue: 'Back home' })}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {formattedSchedule && (
          <p className="text-xs text-slate-300">
            {t('common:labels.time', { defaultValue: 'Time' })} &bull; {formattedSchedule}
          </p>
        )}
      </div>
    </main>
  );
};

export default InterviewSessionPage;

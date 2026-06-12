'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash,
  faPhoneSlash, faDesktop, faComment, faUser, faRobot,
  faCheckCircle, faExclamationTriangle, faEye,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { IMAGES } from '@/configs/images';
import { ROUTES } from '@/configs/routeConfig';
import { localizeRoutePath } from '@/configs/routeLocalization';

// ─── Fake data ────────────────────────────────────────────────────────────────
const FAKE_SESSION = {
  jobName: 'Frontend Engineer – React/Next.js',
  candidateName: 'Lê Đức Nam',
  roomCode: 'SQ-2026-C219012',
  scheduledAt: '2026-04-25T14:00:00',
  status: 'in_progress',
};

type Step = 'waiting' | 'preflight' | 'connected';

// ─── Step labels ──────────────────────────────────────────────────────────────
const STEPS: { key: Step; labelKey: string; descKey: string }[] = [
  {
    key: 'waiting',
    labelKey: 'pages.interviewPreview.steps.waiting.label',
    descKey: 'pages.interviewPreview.steps.waiting.desc',
  },
  {
    key: 'preflight',
    labelKey: 'pages.interviewPreview.steps.preflight.label',
    descKey: 'pages.interviewPreview.steps.preflight.desc',
  },
  {
    key: 'connected',
    labelKey: 'pages.interviewPreview.steps.connected.label',
    descKey: 'pages.interviewPreview.steps.connected.desc',
  },
];

import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';

// ─── Mock Participant Tile ────────────────────────────────────────────────────
function MockTile({ name, isAI = false, isSelf = false, speaking = false }: {
  name: string; isAI?: boolean; isSelf?: boolean; speaking?: boolean;
}) {
  const { t } = useTranslation('admin');

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl border bg-[#0f172a] overflow-hidden aspect-video
      ${speaking ? 'border-cyan-400/60 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]' : 'border-white/8'}`}>
      {/* Fake video bg */}
      <div className={`absolute inset-0 ${isAI ? 'bg-zinc-950' : isSelf ? 'bg-gradient-to-br from-zinc-800 to-zinc-900' : 'bg-gradient-to-br from-blue-950 to-zinc-900'}`} />
      {/* Avatar / Visualizer */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {isAI ? (
           <AgentAudioVisualizerAura 
             state={speaking ? 'speaking' : 'listening'} 
             size="lg" 
             color="#8b5cf6" 
           />
        ) : (
          <div className={`flex size-16 items-center justify-center rounded-full border text-2xl
            ${isSelf ? 'border-cyan-400/30 bg-cyan-500/10 text-zinc-200' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200'}`}>
            <FontAwesomeIcon icon={faUser} />
          </div>
        )}
      </div>
      {/* Speaking pulse */}
      {speaking && (
        <div className="absolute inset-0 animate-pulse rounded-2xl border border-cyan-400/20" />
      )}
      {/* Name bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center gap-1.5">
          {isAI && <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-violet-300">AI</span>}
          {isSelf && <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-cyan-300">{t('pages.interviewPreview.connected.you')}</span>}
          <span className="text-xs font-semibold text-white">{name}</span>
          {speaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Waiting ────────────────────────────────────────────────────────────
function WaitingStep({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation('admin');

  return (
    <div className="relative flex h-full min-h-[520px] items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_52%)]" />
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-10 text-center">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-700 group-hover:bg-cyan-500/25" />
          <div className="relative z-10 flex h-[96px] w-[240px] max-w-[70vw] items-center justify-center opacity-90 transition-opacity group-hover:opacity-100 md:h-[120px] md:w-[320px]">
            <Image
              src={IMAGES.getTextLogo('light')}
              alt="Square"
              width={320}
              height={107}
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              priority
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{t('pages.interviewPreview.waiting.title')}</h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400">
            {t('pages.interviewPreview.waiting.description')}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button variant="contained" onClick={onNext}
            sx={{ height: 56, background: '#0ea5e9', px: 6, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: '0 0 30px rgba(14,165,233,0.3)', '&:hover': { background: '#38bdf8' } }}>
            {t('pages.interviewPreview.waiting.start')}
          </Button>
          <p className="text-[11px] text-zinc-500">{t('pages.interviewPreview.waiting.scheduled', { time: '25/04/2026, 14:00' })}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Preflight ──────────────────────────────────────────────────────────
function PreflightStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { t } = useTranslation('admin');
  const [micOk] = useState(true);
  const [camOk] = useState(true);
  const volume = 45;

  return (
    <div className="relative flex h-full min-h-[520px] items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_52%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[560px] rounded-[2rem] border border-cyan-400/20 bg-[#020617]/90 p-8 text-center shadow-[0_0_50px_rgba(56,189,248,0.1)]">
        <h2 className="mb-1 text-2xl font-semibold uppercase tracking-widest text-white">{t('pages.interviewPreview.preflight.title')}</h2>
        <p className="mb-8 text-sm text-zinc-400">{t('pages.interviewPreview.preflight.description')}</p>

        <div className="mb-8 flex flex-col gap-4">
          {/* Mic */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className={`flex size-12 items-center justify-center rounded-full border text-lg ${micOk ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300'}`}>
              <FontAwesomeIcon icon={micOk ? faMicrophone : faMicrophoneSlash} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{t('pages.interviewPreview.preflight.microphone')}</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${volume}%` }} />
              </div>
            </div>
            <FontAwesomeIcon icon={micOk ? faCheckCircle : faExclamationTriangle}
              className={micOk ? 'text-emerald-400' : 'text-rose-400'} />
          </div>

          {/* Camera */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className={`flex size-12 items-center justify-center rounded-full border text-lg ${camOk ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300'}`}>
              <FontAwesomeIcon icon={camOk ? faVideo : faVideoSlash} />
            </div>
            <div className="flex-1 text-left">
              {/* Fake camera preview */}
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-800">
                <div className="flex h-full items-center justify-center text-zinc-500 text-xs">
                  <FontAwesomeIcon icon={faUser} className="mr-2" /> {t('pages.interviewPreview.preflight.cameraPreview')}
                </div>
              </div>
            </div>
            <FontAwesomeIcon icon={camOk ? faCheckCircle : faExclamationTriangle}
              className={camOk ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outlined" onClick={onBack}
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', px: 4, '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' } }}>
            {t('pages.interviewPreview.actions.back')}
          </Button>
          <Button variant="contained" onClick={onNext}
            sx={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', fontWeight: 900, px: 5, boxShadow: '0 4px 20px rgba(14,165,233,0.4)', '&:hover': { background: 'linear-gradient(135deg,#38bdf8,#3b82f6)' } }}>
            {t('pages.interviewPreview.actions.joinRoom')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Connected (mock VideoConference) ───────────────────────────────────
function ConnectedStep({ onEnd }: { onEnd: () => void }) {
  const { t } = useTranslation('admin');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [isCompactChatView, setIsCompactChatView] = useState(false);
  const [time, setTime] = useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const update = () => setIsCompactChatView(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const FAKE_MESSAGES = [
    { from: 'AI', textKey: 'pages.interviewPreview.connected.chatMessages.aiGreeting' },
    { from: 'candidate', textKey: 'pages.interviewPreview.connected.chatMessages.candidateReady' },
    { from: 'AI', textKey: 'pages.interviewPreview.connected.chatMessages.reactQuestion' },
    { from: 'candidate', textKey: 'pages.interviewPreview.connected.chatMessages.reactExperience' },
  ];

  return (
    <div className="flex h-full min-h-[600px] flex-col bg-[#020617]">
      {/* Video grid */}
      <div className={`flex flex-1 gap-2 p-3 ${chatOpen ? 'sm:pr-[312px]' : ''} transition-all duration-300`}>
        {!(chatOpen && isCompactChatView) && (
        <div className="grid flex-1 grid-cols-2 gap-2 content-center">
          <MockTile name={t('pages.interviewPreview.connected.aiInterviewer')} isAI speaking />
          <MockTile name={FAKE_SESSION.candidateName} isSelf />
          <div className="col-span-2 rounded-2xl border border-white/5 bg-[#0b1221] p-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faEye} className="text-zinc-500" />
            <span className="text-xs text-zinc-500">{t('pages.interviewPreview.connected.observerNotice')}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">LIVE</span>
              <span className="ml-3 text-[11px] text-zinc-500 font-mono">{fmt(time)}</span>
            </div>
          </div>
          </div>
        )}

        {/* Chat panel */}
        {chatOpen && (
          <div className="absolute inset-0 w-full border-l border-white/8 bg-[#0b1120] flex flex-col sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-[312px]">
            <div className="border-b border-white/8 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white">{t('pages.interviewPreview.connected.chatTitle')}</p>
                <div className="flex shrink-0 items-center gap-2 sm:hidden">
                  <button
                    type="button"
                    aria-label={t('pages.interviewPreview.aria.closeChat')}
                    onClick={() => setChatOpen(false)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
                    <span>{t('pages.interviewPreview.aria.closeChat')}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={t('pages.interviewPreview.connected.end')}
                    onClick={onEnd}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/20 px-3 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/30"
                  >
                    <FontAwesomeIcon icon={faPhoneSlash} className="text-[11px]" />
                    <span>{t('pages.interviewPreview.connected.end')}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {FAKE_MESSAGES.map((m) => (
                <div key={`${m.from}-${m.textKey}`} className={`flex gap-2 ${m.from === 'candidate' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full text-xs
                    ${m.from === 'AI' ? 'bg-violet-500/20 text-violet-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    <FontAwesomeIcon icon={m.from === 'AI' ? faRobot : faUser} />
                  </div>
                  <div className={`max-w-[200px] rounded-xl px-3 py-2 text-xs text-zinc-200
                    ${m.from === 'candidate' ? 'bg-cyan-500/15 border border-cyan-400/15' : 'bg-white/5 border border-white/8'}`}>
                    {t(m.textKey)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/8 p-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-500">{t('pages.interviewPreview.connected.messageInput')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className={`flex items-center justify-center gap-3 border-t border-white/8 bg-[#020617]/90 px-4 py-3 backdrop-blur-xl ${chatOpen && isCompactChatView ? 'hidden' : ''}`}>
        <button type="button" aria-label={micOn ? t('pages.interviewPreview.aria.turnMicrophoneOff') : t('pages.interviewPreview.aria.turnMicrophoneOn')} onClick={() => setMicOn(!micOn)}
          className={`flex size-11 items-center justify-center rounded-[var(--sq-button-radius)] border transition-all
            ${micOn ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}>
          <FontAwesomeIcon icon={micOn ? faMicrophone : faMicrophoneSlash} />
        </button>
        <button type="button" aria-label={camOn ? t('pages.interviewPreview.aria.turnCameraOff') : t('pages.interviewPreview.aria.turnCameraOn')} onClick={() => setCamOn(!camOn)}
          className={`flex size-11 items-center justify-center rounded-[var(--sq-button-radius)] border transition-all
            ${camOn ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}>
          <FontAwesomeIcon icon={camOn ? faVideo : faVideoSlash} />
        </button>
        <button type="button" aria-label={t('pages.interviewPreview.aria.shareScreen')} className="flex size-11 items-center justify-center rounded-[var(--sq-button-radius)] border border-white/15 bg-white/8 text-white hover:bg-white/15 transition-all">
          <FontAwesomeIcon icon={faDesktop} />
        </button>
        <button type="button" aria-label={chatOpen ? t('pages.interviewPreview.aria.closeChat') : t('pages.interviewPreview.aria.openChat')} onClick={() => setChatOpen(!chatOpen)}
          className={`flex size-11 items-center justify-center rounded-[var(--sq-button-radius)] border transition-all
            ${chatOpen ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300' : 'border-white/15 bg-white/8 text-white hover:bg-white/15'}`}>
          <FontAwesomeIcon icon={faComment} />
        </button>
        <div className="mx-2 h-6 w-px bg-white/10" />
        <button type="button" onClick={onEnd}
          className="flex h-11 items-center gap-2 rounded-[var(--sq-button-radius)] border border-rose-400/40 bg-rose-500/20 px-5 text-sm font-semibold text-rose-300 hover:bg-rose-500/30 transition-all">
          <FontAwesomeIcon icon={faPhoneSlash} />
          {t('pages.interviewPreview.connected.end')}
        </button>
      </div>
    </div>
  );
}

// ─── Main Preview Page ────────────────────────────────────────────────────────
export default function InterviewPreviewPage() {
  const { t, i18n } = useTranslation('admin');
  const [step, setStep] = useState<Step>('waiting');
  const previewRoute = localizeRoutePath(`/${ROUTES.ADMIN.INTERVIEW_PREVIEW}`, i18n.language);

  const statusChip = {
    waiting: { label: t('pages.interviewPreview.status.waiting'), color: '#0ea5e9' },
    preflight: { label: t('pages.interviewPreview.status.preflight'), color: '#f59e0b' },
    connected: { label: t('pages.interviewPreview.status.connected'), color: '#10b981' },
  }[step];

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-6 text-white">
      {/* Admin top bar */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-zinc-900/50 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{t('pages.interviewPreview.header.eyebrow')}</p>
          <h1 className="text-base font-semibold text-white">{t('pages.interviewPreview.header.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-400/30 bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-amber-200">
            {t('pages.interviewPreview.header.previewMode')}
          </span>
          <Chip label={statusChip.label} size="small"
            sx={{ bgcolor: `${statusChip.color}22`, color: statusChip.color, border: `1px solid ${statusChip.color}44`, fontWeight: 700, fontSize: '0.7rem' }} />
        </div>
      </div>

      {/* Step switcher */}
      <div className="mb-4 flex gap-2 rounded-2xl border border-white/8 bg-zinc-900/40 p-2">
        {STEPS.map(s => (
          <button key={s.key} type="button" onClick={() => setStep(s.key)}
            className={`flex-1 rounded-[var(--sq-button-radius)] px-3 py-2.5 text-left transition-all duration-200
              ${step === s.key ? 'bg-cyan-500/15 border border-cyan-400/30' : 'border border-transparent hover:bg-white/5'}`}>
            <p className={`text-xs font-semibold ${step === s.key ? 'text-cyan-300' : 'text-zinc-400'}`}>{t(s.labelKey)}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{t(s.descKey)}</p>
          </button>
        ))}
      </div>

      {/* Session info bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-zinc-900/40 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('pages.interviewPreview.session.position')}</p>
          <p className="text-sm font-semibold text-white">{FAKE_SESSION.jobName}</p>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('pages.interviewPreview.session.candidate')}</p>
          <p className="text-sm font-semibold text-white">{FAKE_SESSION.candidateName}</p>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('pages.interviewPreview.session.room')}</p>
          <p className="text-sm font-mono font-semibold text-cyan-300">{FAKE_SESSION.roomCode}</p>
        </div>
        <div className="ml-auto">
          {step !== 'connected' && (
            <Button variant="contained" size="small" onClick={() => setStep('connected')}
              sx={{ background: '#0ea5e9', fontWeight: 700, fontSize: '0.7rem', '&:hover': { background: '#38bdf8' } }}>
              {t('pages.interviewPreview.actions.jumpToRoom')}
            </Button>
          )}
        </div>
      </div>

      {/* Main stage */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        {step === 'waiting'   && <WaitingStep   onNext={() => setStep('preflight')} />}
        {step === 'preflight' && <PreflightStep onNext={() => setStep('connected')} onBack={() => setStep('waiting')} />}
        {step === 'connected' && <ConnectedStep onEnd={() => setStep('waiting')} />}
      </div>

      {/* Footer note */}
      <p className="mt-3 text-center text-[10px] text-zinc-600">
        {t('pages.interviewPreview.footerNote')}{' '}
        <code className="text-zinc-500">{previewRoute}</code>
      </p>
    </div>
  );
}

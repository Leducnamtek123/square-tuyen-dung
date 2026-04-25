'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash,
  faPhoneSlash, faDesktop, faComment, faUser, faRobot,
  faCheckCircle, faExclamationTriangle, faEye,
} from '@fortawesome/free-solid-svg-icons';

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
const STEPS: { key: Step; label: string; desc: string }[] = [
  { key: 'waiting',   label: '1. Phòng chờ',        desc: 'Trước khi kiểm tra thiết bị' },
  { key: 'preflight', label: '2. Kiểm tra thiết bị', desc: 'Kiểm tra mic / camera' },
  { key: 'connected', label: '3. Trong phòng PV',    desc: 'Giao diện phỏng vấn live' },
];

// ─── Mock Participant Tile ────────────────────────────────────────────────────
function MockTile({ name, isAI = false, isSelf = false, speaking = false }: {
  name: string; isAI?: boolean; isSelf?: boolean; speaking?: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl border bg-[#0f172a] overflow-hidden aspect-video
      ${speaking ? 'border-cyan-400/60 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]' : 'border-white/8'}`}>
      {/* Fake video bg */}
      <div className={`absolute inset-0 ${isAI ? 'bg-gradient-to-br from-violet-900/40 to-cyan-900/30' : isSelf ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-950 to-slate-900'}`} />
      {/* Avatar */}
      <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border text-2xl
        ${isAI ? 'border-violet-400/40 bg-violet-500/20 text-violet-300' : 'border-cyan-400/30 bg-cyan-500/10 text-slate-200'}`}>
        <FontAwesomeIcon icon={isAI ? faRobot : faUser} />
      </div>
      {/* Speaking pulse */}
      {speaking && (
        <div className="absolute inset-0 animate-pulse rounded-2xl border border-cyan-400/20" />
      )}
      {/* Name bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center gap-1.5">
          {isAI && <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-300">AI</span>}
          {isSelf && <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-300">Bạn</span>}
          <span className="text-xs font-semibold text-white">{name}</span>
          {speaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Waiting ────────────────────────────────────────────────────────────
function WaitingStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative flex h-full min-h-[520px] items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_52%)]" />
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-10 text-center">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-700 group-hover:bg-cyan-500/25" />
          <div className="relative z-10 flex h-[200px] w-[200px] items-center justify-center opacity-80 transition-opacity group-hover:opacity-100">
            <Image src="/square-icons/logo.svg" alt="Square" width={160} height={160}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Sẵn sàng bắt đầu phỏng vấn</h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
            Kiểm tra thiết bị của bạn trước khi tham gia phòng phỏng vấn với AI và nhà tuyển dụng.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button variant="contained" onClick={onNext}
            sx={{ height: 56, borderRadius: '1rem', background: '#0ea5e9', px: 6, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: '0 0 30px rgba(14,165,233,0.3)', '&:hover': { background: '#38bdf8' } }}>
            Kiểm tra thiết bị &amp; Vào phòng
          </Button>
          <p className="text-[11px] text-slate-500">Đã lên lịch: 25/04/2026, 14:00</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Preflight ──────────────────────────────────────────────────────────
function PreflightStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [micOk] = useState(true);
  const [camOk] = useState(true);
  const volume = 45;

  return (
    <div className="relative flex h-full min-h-[520px] items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_52%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[560px] rounded-[2rem] border border-cyan-400/20 bg-[#020617]/90 p-8 text-center shadow-[0_0_50px_rgba(56,189,248,0.1)]">
        <h2 className="mb-1 text-2xl font-black uppercase tracking-widest text-white">Kiểm tra thiết bị</h2>
        <p className="mb-8 text-sm text-slate-400">Đảm bảo micro và camera hoạt động trước khi vào phòng.</p>

        <div className="mb-8 flex flex-col gap-4">
          {/* Mic */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg ${micOk ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300'}`}>
              <FontAwesomeIcon icon={micOk ? faMicrophone : faMicrophoneSlash} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">Microphone</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${volume}%` }} />
              </div>
            </div>
            <FontAwesomeIcon icon={micOk ? faCheckCircle : faExclamationTriangle}
              className={micOk ? 'text-emerald-400' : 'text-rose-400'} />
          </div>

          {/* Camera */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg ${camOk ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300'}`}>
              <FontAwesomeIcon icon={camOk ? faVideo : faVideoSlash} />
            </div>
            <div className="flex-1 text-left">
              {/* Fake camera preview */}
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-800">
                <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                  <FontAwesomeIcon icon={faUser} className="mr-2" /> Camera preview
                </div>
              </div>
            </div>
            <FontAwesomeIcon icon={camOk ? faCheckCircle : faExclamationTriangle}
              className={camOk ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outlined" onClick={onBack}
            sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: 'white', px: 4, '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' } }}>
            Quay lại
          </Button>
          <Button variant="contained" onClick={onNext}
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', fontWeight: 900, px: 5, boxShadow: '0 4px 20px rgba(14,165,233,0.4)', '&:hover': { background: 'linear-gradient(135deg,#38bdf8,#3b82f6)' } }}>
            Vào phòng phỏng vấn
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Connected (mock VideoConference) ───────────────────────────────────
function ConnectedStep({ onEnd }: { onEnd: () => void }) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [time, setTime] = useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const FAKE_MESSAGES = [
    { from: 'AI', text: 'Xin chào! Tôi là trợ lý phỏng vấn AI. Hãy bắt đầu nhé.' },
    { from: 'Candidate', text: 'Dạ, tôi sẵn sàng ạ.' },
    { from: 'AI', text: 'Bạn có thể mô tả kinh nghiệm làm việc với React.js của mình không?' },
    { from: 'Candidate', text: 'Tôi đã có 3 năm kinh nghiệm với React, chủ yếu làm việc tại các startup...' },
  ];

  return (
    <div className="flex h-full min-h-[600px] flex-col bg-[#020617]">
      {/* Video grid */}
      <div className={`flex flex-1 gap-2 p-3 ${chatOpen ? 'pr-[320px]' : ''} transition-all duration-300`}>
        <div className="grid flex-1 grid-cols-2 gap-2 content-center">
          <MockTile name="AI Interviewer" isAI speaking />
          <MockTile name={FAKE_SESSION.candidateName} isSelf />
          <div className="col-span-2 rounded-2xl border border-white/5 bg-[#0b1221] p-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faEye} className="text-slate-500" />
            <span className="text-xs text-slate-500">Nhà tuyển dụng đang quan sát phiên phỏng vấn này</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">LIVE</span>
              <span className="ml-3 text-[11px] text-slate-500 font-mono">{fmt(time)}</span>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-[312px] border-l border-white/8 bg-[#0b1120] flex flex-col">
            <div className="border-b border-white/8 px-4 py-3">
              <p className="text-sm font-bold text-white">Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {FAKE_MESSAGES.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.from === 'Candidate' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs
                    ${m.from === 'AI' ? 'bg-violet-500/20 text-violet-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    <FontAwesomeIcon icon={m.from === 'AI' ? faRobot : faUser} />
                  </div>
                  <div className={`max-w-[200px] rounded-xl px-3 py-2 text-xs text-slate-200
                    ${m.from === 'Candidate' ? 'bg-cyan-500/15 border border-cyan-400/15' : 'bg-white/5 border border-white/8'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/8 p-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-500">Nhập tin nhắn...</div>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-center gap-3 border-t border-white/8 bg-[#020617]/90 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => setMicOn(!micOn)}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
            ${micOn ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}>
          <FontAwesomeIcon icon={micOn ? faMicrophone : faMicrophoneSlash} />
        </button>
        <button onClick={() => setCamOn(!camOn)}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
            ${camOn ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}>
          <FontAwesomeIcon icon={camOn ? faVideo : faVideoSlash} />
        </button>
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white hover:bg-white/15 transition-all">
          <FontAwesomeIcon icon={faDesktop} />
        </button>
        <button onClick={() => setChatOpen(!chatOpen)}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
            ${chatOpen ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300' : 'border-white/15 bg-white/8 text-white hover:bg-white/15'}`}>
          <FontAwesomeIcon icon={faComment} />
        </button>
        <div className="mx-2 h-6 w-px bg-white/10" />
        <button onClick={onEnd}
          className="flex h-11 items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-5 text-sm font-bold text-rose-300 hover:bg-rose-500/30 transition-all">
          <FontAwesomeIcon icon={faPhoneSlash} />
          Kết thúc
        </button>
      </div>
    </div>
  );
}

// ─── Main Preview Page ────────────────────────────────────────────────────────
export default function InterviewPreviewPage() {
  const [step, setStep] = useState<Step>('waiting');

  const statusChip = {
    waiting:   { label: 'Chờ vào phòng', color: '#0ea5e9' },
    preflight: { label: 'Kiểm tra thiết bị', color: '#f59e0b' },
    connected: { label: 'Đang phỏng vấn', color: '#10b981' },
  }[step];

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-6 text-white">
      {/* Admin top bar */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-slate-900/50 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Preview</p>
          <h1 className="text-base font-bold text-white">Interview Flow – Fake Data</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-400/30 bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-200">
            Preview Mode
          </span>
          <Chip label={statusChip.label} size="small"
            sx={{ bgcolor: `${statusChip.color}22`, color: statusChip.color, border: `1px solid ${statusChip.color}44`, fontWeight: 700, fontSize: '0.7rem' }} />
        </div>
      </div>

      {/* Step switcher */}
      <div className="mb-4 flex gap-2 rounded-2xl border border-white/8 bg-slate-900/40 p-2">
        {STEPS.map(s => (
          <button key={s.key} onClick={() => setStep(s.key)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-left transition-all duration-200
              ${step === s.key ? 'bg-cyan-500/15 border border-cyan-400/30' : 'border border-transparent hover:bg-white/5'}`}>
            <p className={`text-xs font-bold ${step === s.key ? 'text-cyan-300' : 'text-slate-400'}`}>{s.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Session info bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Vị trí</p>
          <p className="text-sm font-semibold text-white">{FAKE_SESSION.jobName}</p>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ứng viên</p>
          <p className="text-sm font-semibold text-white">{FAKE_SESSION.candidateName}</p>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Phòng</p>
          <p className="text-sm font-mono font-semibold text-cyan-300">{FAKE_SESSION.roomCode}</p>
        </div>
        <div className="ml-auto">
          {step !== 'connected' && (
            <Button variant="contained" size="small" onClick={() => setStep('connected')}
              sx={{ borderRadius: '10px', background: '#0ea5e9', fontWeight: 700, fontSize: '0.7rem', '&:hover': { background: '#38bdf8' } }}>
              Nhảy đến phòng PV →
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
      <p className="mt-3 text-center text-[10px] text-slate-600">
        Dữ liệu hoàn toàn là fake — chỉ để xem giao diện. Truy cập:{' '}
        <code className="text-slate-500">/admin/interview-preview</code>
      </p>
    </div>
  );
}

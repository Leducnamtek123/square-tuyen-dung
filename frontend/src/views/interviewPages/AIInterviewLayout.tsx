import React, { useState, useEffect } from 'react';
import {
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
  TrackReferenceOrPlaceholder,
  LayoutContextProvider,
  useCreateLayoutContext,
  useRoomContext,
  useLocalParticipant,
  Chat
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash,
  faDesktop,
  faComment,
  faEye,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useLiveTimer() {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return fmt(time);
}

// ─── Custom Control Bar ───────────────────────────────────────────────────────
function CustomControlBar({ chatOpen, setChatOpen }: { chatOpen: boolean; setChatOpen: (v: boolean) => void }) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const { t } = useTranslation(['interview']);

  const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleCam = () => localParticipant.setCameraEnabled(!isCameraEnabled);
  const toggleScreen = () => localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  const onEnd = () => room.disconnect();

  return (
    <div className="flex items-center justify-center gap-3 border-t border-white/8 bg-[#020617]/90 px-4 py-3 backdrop-blur-xl">
      <button onClick={toggleMic}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${isMicrophoneEnabled ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}>
        <FontAwesomeIcon icon={isMicrophoneEnabled ? faMicrophone : faMicrophoneSlash} />
      </button>
      <button onClick={toggleCam}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${isCameraEnabled ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}>
        <FontAwesomeIcon icon={isCameraEnabled ? faVideo : faVideoSlash} />
      </button>
      <button onClick={toggleScreen}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${isScreenShareEnabled ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300' : 'border-white/15 bg-white/8 text-white hover:bg-white/15'}`}>
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
        {t('controls.end', 'Kết thúc')}
      </button>
    </div>
  );
}

// ─── Custom Participant Tile ──────────────────────────────────────────────────
function AIParticipantTile({ trackRef, ...props }: { trackRef?: TrackReferenceOrPlaceholder; [key: string]: any }) {
  const p = trackRef?.participant;
  const isAgent = p?.identity?.toLowerCase().includes('agent') || p?.name?.toLowerCase().includes('agent');
  const isSelf = p?.isLocal;
  const isSpeaking = p?.isSpeaking;

  // Render for AI Agent
  if (isAgent) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[#0f172a] rounded-2xl overflow-hidden border border-white/8 shadow-[0_0_0_2px_rgba(14,165,233,0)] transition-all data-[speaking=true]:border-cyan-400/60 data-[speaking=true]:shadow-[0_0_0_2px_rgba(14,165,233,0.3)]" data-speaking={isSpeaking}>
        <div className="absolute inset-0 bg-slate-950" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <AgentAudioVisualizerAura 
            audioTrack={trackRef as any} 
            state={isSpeaking ? 'speaking' : 'listening'} 
            size="lg" 
            color="#8b5cf6" 
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 z-20">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-300">AI</span>
            <span className="text-xs font-semibold text-white">{p?.name || p?.identity || 'AI Interviewer'}</span>
            {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
          </div>
        </div>
      </div>
    );
  }

  // Render for Human Participant
  return (
    <div className={`relative flex h-full w-full items-center justify-center bg-[#0f172a] rounded-2xl overflow-hidden border ${isSpeaking ? 'border-cyan-400/60 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]' : 'border-white/8'} transition-all`} data-speaking={isSpeaking}>
      <div className={`absolute inset-0 ${isSelf ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-950 to-slate-900'} z-0`} />
      
      {/* LiveKit's ParticipantTile to handle actual video/audio track rendering */}
      <div className="relative z-10 w-full h-full [&>.lk-participant-tile]:!rounded-none [&>.lk-participant-tile]:!bg-transparent [&_.lk-participant-metadata]:!hidden">
        <ParticipantTile {...props} trackRef={trackRef} className="w-full h-full object-cover" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5">
          {isSelf && <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-300">Bạn</span>}
          <span className="text-xs font-semibold text-white">{p?.name || p?.identity || 'Ứng viên'}</span>
          {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[312px] md:w-[320px] h-full border-l border-white/8 bg-[#0b1120] flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="border-b border-white/8 px-4 py-3 bg-[#0b1120]">
        <p className="text-sm font-bold text-white">Chat</p>
      </div>
      <div className="flex-1 overflow-hidden [&>.lk-chat]:h-full [&_.lk-chat-form]:border-t [&_.lk-chat-form]:border-white/8 [&_.lk-chat-entry]:bg-white/5 [&_.lk-chat-entry]:text-xs [&_.lk-chat-entry]:text-white">
        <Chat />
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export function AIInterviewLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const timeFormatted = useLiveTimer();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [], onlySubscribed: false },
  );

  const layoutContext = useCreateLayoutContext();
  if (layoutContext?.widget?.state) {
    layoutContext.widget.state.showChat = chatOpen;
  }

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="relative flex h-full w-full bg-[#020617] overflow-hidden">
        {/* Main Video Area */}
        <div className={`flex flex-1 flex-col h-full transition-all duration-300 ${chatOpen ? 'pr-[312px] md:pr-[320px]' : ''}`}>
          <div className="flex-1 p-2 flex flex-col gap-2 min-h-0">
            <div className="flex-1 min-h-0">
              <GridLayout tracks={tracks}>
                <AIParticipantTile />
              </GridLayout>
            </div>
            
            {/* Employer Observing Bar */}
            <div className="shrink-0 rounded-2xl border border-white/5 bg-[#0b1221] p-4 flex items-center gap-3 mx-2 mb-2">
              <FontAwesomeIcon icon={faEye} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Nhà tuyển dụng đang quan sát phiên phỏng vấn này</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 tracking-widest">LIVE</span>
                <span className="ml-2 text-[11px] text-slate-400 font-mono font-medium">{timeFormatted}</span>
              </div>
            </div>
          </div>

          <CustomControlBar chatOpen={chatOpen} setChatOpen={setChatOpen} />
        </div>

        {/* Side panel */}
        {chatOpen && <ChatPanel />}
      </div>
    </LayoutContextProvider>
  );
}

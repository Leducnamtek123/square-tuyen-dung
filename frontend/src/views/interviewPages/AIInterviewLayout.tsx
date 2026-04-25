import React, { useState, useEffect } from 'react';
import {
  GridLayout,
  ParticipantTile,
  useTracks,
  TrackReferenceOrPlaceholder,
  LayoutContextProvider,
  useCreateLayoutContext,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
  Chat,
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
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const CHAT_STYLES = `
  .lk-chat {
    width: 100% !important;
    height: 100% !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .lk-chat-header {
    display: none !important;
  }
  .lk-chat-messages {
    padding: 1rem !important;
    background: transparent !important;
  }
  .lk-chat-entry {
    margin-bottom: 1rem !important;
  }
  .lk-chat-entry .lk-participant-name {
    font-size: 0.75rem !important;
    color: #94a3b8 !important;
    font-weight: 600 !important;
    margin-bottom: 0.25rem !important;
  }
  .lk-chat-entry .lk-message-body {
    font-size: 0.875rem !important;
    color: #f1f5f9 !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    padding: 0.5rem 0.75rem !important;
    border-radius: 0.75rem !important;
    border-top-left-radius: 0.25rem !important;
    display: inline-block !important;
    word-break: break-word !important;
  }
  .lk-chat-form {
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
    padding: 1rem !important;
    background: #0b1120 !important;
    display: flex !important;
    gap: 0.5rem !important;
    margin: 0 !important;
  }
  .lk-chat-form-input {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #f1f5f9 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 0.5rem !important;
    padding: 0.5rem 0.75rem !important;
    font-size: 0.875rem !important;
    flex: 1 !important;
  }
  .lk-chat-form-input:focus {
    border-color: #38bdf8 !important;
    outline: none !important;
  }
  .lk-button.lk-chat-form-button {
    background: #0ea5e9 !important;
    color: white !important;
    border-radius: 0.5rem !important;
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    padding: 0.5rem 1rem !important;
    border: none !important;
    cursor: pointer !important;
    transition: background 0.2s !important;
  }
  .lk-button.lk-chat-form-button:hover {
    background: #38bdf8 !important;
  }
`;

function useLiveTimer() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(time % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function CustomControlBar({
  chatOpen,
  setChatOpen,
}: {
  chatOpen: boolean;
  setChatOpen: (value: boolean) => void;
}) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const { t } = useTranslation(['interview']);

  const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleCam = () => localParticipant.setCameraEnabled(!isCameraEnabled);
  const toggleScreen = () => localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  const onEnd = () => room.disconnect();

  return (
    <div className="flex items-center justify-center gap-3 border-t border-white/8 bg-[#020617]/90 px-4 py-3 backdrop-blur-xl">
      <button
        onClick={toggleMic}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${isMicrophoneEnabled ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}
      >
        <FontAwesomeIcon icon={isMicrophoneEnabled ? faMicrophone : faMicrophoneSlash} />
      </button>
      <button
        onClick={toggleCam}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${isCameraEnabled ? 'border-white/15 bg-white/8 text-white hover:bg-white/15' : 'border-rose-400/40 bg-rose-500/20 text-rose-300'}`}
      >
        <FontAwesomeIcon icon={isCameraEnabled ? faVideo : faVideoSlash} />
      </button>
      <button
        onClick={toggleScreen}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${isScreenShareEnabled ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300' : 'border-white/15 bg-white/8 text-white hover:bg-white/15'}`}
      >
        <FontAwesomeIcon icon={faDesktop} />
      </button>
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all
          ${chatOpen ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300' : 'border-white/15 bg-white/8 text-white hover:bg-white/15'}`}
      >
        <FontAwesomeIcon icon={faComment} />
      </button>
      <div className="mx-2 h-6 w-px bg-white/10" />
      <button
        onClick={onEnd}
        className="flex h-11 items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-5 text-sm font-bold text-rose-300 transition-all hover:bg-rose-500/30"
      >
        <FontAwesomeIcon icon={faPhoneSlash} />
        {t('controls.end', 'Kết thúc')}
      </button>
    </div>
  );
}

function isRoleMatch(participant: any, terms: string[]) {
  const identity = participant?.identity?.toLowerCase() ?? '';
  const name = participant?.name?.toLowerCase() ?? '';
  return terms.some((term) => identity.includes(term) || name.includes(term));
}

function AIParticipantTile({ trackRef, ...props }: { trackRef?: TrackReferenceOrPlaceholder; [key: string]: any }) {
  const participant = trackRef?.participant;
  const isAgent = isRoleMatch(participant, ['agent', 'interviewer']);
  const isSelf = participant?.isLocal;
  const isSpeaking = participant?.isSpeaking;
  const isEmployer = isRoleMatch(participant, ['employer', 'admin']);

  let displayName = participant?.name || participant?.identity || 'Ứng viên';
  if (isEmployer) displayName = 'Nhà tuyển dụng';
  if (isAgent) displayName = 'AI Interviewer';

  if (isAgent) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#0f172a] shadow-[0_0_0_2px_rgba(14,165,233,0)] transition-all data-[speaking=true]:border-cyan-400/60 data-[speaking=true]:shadow-[0_0_0_2px_rgba(14,165,233,0.3)]"
        data-speaking={isSpeaking}
      >
        <div className="absolute inset-0 bg-slate-950" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <AgentAudioVisualizerAura
            audioTrack={trackRef as any}
            state={isSpeaking ? 'speaking' : 'listening'}
            size="lg"
            color="#8b5cf6"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-300">
              AI
            </span>
            <span className="text-xs font-semibold text-white">{displayName}</span>
            {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border bg-[#0f172a] transition-all ${isSpeaking ? 'border-cyan-400/60 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]' : 'border-white/8'}`}
      data-speaking={isSpeaking}
    >
      <div className={`absolute inset-0 ${isSelf ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-950 to-slate-900'} z-0`} />

      <div className="relative z-10 h-full w-full [&>.lk-participant-tile]:!rounded-none [&>.lk-participant-tile]:!bg-transparent [&_.lk-participant-metadata]:!hidden">
        <ParticipantTile {...props} trackRef={trackRef} className="h-full w-full object-cover" />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center gap-1.5">
          {isSelf && (
            <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-300">
              Bạn
            </span>
          )}
          {isEmployer && !isSelf && (
            <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">
              Nhà tuyển dụng
            </span>
          )}
          <span className="text-xs font-semibold text-white">{displayName}</span>
          {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
        </div>
      </div>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="absolute right-0 top-0 bottom-0 z-30 flex h-full w-[312px] flex-col border-l border-white/8 bg-[#0b1120] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:w-[320px]">
      <div className="shrink-0 border-b border-white/8 bg-[#0b1120] px-4 py-3">
        <p className="text-sm font-bold text-white">Chat</p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <style>{CHAT_STYLES}</style>
        <Chat />
      </div>
    </div>
  );
}

export function AIInterviewLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const timeFormatted = useLiveTimer();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const rawTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [], onlySubscribed: false },
  );

  const layoutContext = useCreateLayoutContext();

  useEffect(() => {
    if (layoutContext?.widget?.state) {
      layoutContext.widget.state.showChat = chatOpen;
    }
  }, [layoutContext, chatOpen]);

  const isLocalEmployer = isRoleMatch(localParticipant, ['employer', 'admin']);
  const otherEmployerCount = participants.filter((participant) => !participant.isLocal && isRoleMatch(participant, ['employer', 'admin'])).length;
  const candidatePresent = participants.some((participant) => !isRoleMatch(participant, ['employer', 'admin', 'agent', 'interviewer']));

  let finalTracks = rawTracks.filter((track) => {
    const participant = track.participant;
    const isEmployer = isRoleMatch(participant, ['employer', 'admin']);

    if (isEmployer && track.source === Track.Source.Camera && !track.publication) {
      return false;
    }

    return true;
  });

  const agentParticipant = participants.find((participant) => isRoleMatch(participant, ['agent', 'interviewer']));
  if (agentParticipant) {
    const hasAgentTrack = finalTracks.some((track) => track.participant.sid === agentParticipant.sid);
    if (!hasAgentTrack) {
      finalTracks.push({
        participant: agentParticipant,
        source: Track.Source.Camera,
      } as any);
    }
  }

  const employerWithCamera = finalTracks.find((track) => isRoleMatch(track.participant, ['employer', 'admin']) && track.publication);
  if (employerWithCamera) {
    finalTracks = finalTracks.filter((track) => !isRoleMatch(track.participant, ['agent', 'interviewer']));
  }

  let showObservingBar = false;
  let observingMessage = '';
  let observingIcon = faEye;

  if (isLocalEmployer) {
    showObservingBar = true;
    if (candidatePresent) {
      observingMessage = 'Bạn đang quan sát phiên phỏng vấn này';
    } else {
      observingMessage = 'Đang chờ ứng viên tham gia phòng...';
      observingIcon = faSpinner;
    }
  } else if (otherEmployerCount > 0 && !employerWithCamera) {
    showObservingBar = true;
    observingMessage = 'Nhà tuyển dụng đang quan sát phiên phỏng vấn này';
  }

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="relative flex h-full w-full overflow-hidden bg-[#020617]">
        <div className={`flex flex-1 flex-col h-full transition-all duration-300 ${chatOpen ? 'pr-[312px] md:pr-[320px]' : ''}`}>
          <div className="flex flex-1 flex-col gap-2 min-h-0 p-2">
            <div className="min-h-0 flex-1">
              <GridLayout tracks={finalTracks}>
                <AIParticipantTile />
              </GridLayout>
            </div>

            {showObservingBar && (
              <div className="mx-2 mb-2 flex shrink-0 items-center gap-3 rounded-2xl border border-white/5 bg-[#0b1221] p-4">
                <FontAwesomeIcon
                  icon={observingIcon}
                  className={observingIcon === faSpinner ? 'animate-spin text-cyan-400' : 'text-slate-500'}
                />
                <span className="text-xs font-medium text-slate-500">{observingMessage}</span>
                <div className="ml-auto flex items-center gap-2">
                  {candidatePresent && <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />}
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400">
                    {candidatePresent ? 'LIVE' : 'WAITING'}
                  </span>
                  <span className="ml-2 font-mono text-[11px] font-medium text-slate-400">{timeFormatted}</span>
                </div>
              </div>
            )}
          </div>

          <CustomControlBar chatOpen={chatOpen} setChatOpen={setChatOpen} />
        </div>

        {chatOpen && <ChatPanel />}
      </div>
    </LayoutContextProvider>
  );
}

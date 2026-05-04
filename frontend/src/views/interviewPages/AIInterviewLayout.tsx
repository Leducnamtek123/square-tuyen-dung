import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import {
  BarVisualizer,
  ChatEntry,
  useTracks,
  TrackReferenceOrPlaceholder,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
  useVoiceAssistant,
  VideoTrack,
  type AgentState,
  type ReceivedMessage,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { getParticipantRole, isLiveKitAgentParticipant } from './livekitParticipant';
import { useInterviewMessages } from './useInterviewMessages';
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
  onEndSession,
}: {
  chatOpen: boolean;
  setChatOpen: (value: boolean) => void;
  onEndSession?: () => Promise<void> | void;
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const { t } = useTranslation(['interview']);

  const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleCam = () => localParticipant.setCameraEnabled(!isCameraEnabled);
  const toggleScreen = () => localParticipant.setScreenShareEnabled(!isScreenShareEnabled);

  const onEnd = async () => {
    if (onEndSession) {
      try {
        await onEndSession();
      } catch {
        // Keep disconnect flow resilient if finalization fails.
      }
    }
  };

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

function AIParticipantTile({
  trackRef,
  audioTrack,
  agentState,
  agentIdentity,
  agentSid,
  hasDetectedAgent,
  variant,
  candidateLabel,
  ...props
}: {
  trackRef?: TrackReferenceOrPlaceholder;
  audioTrack?: any;
  agentState?: AgentState;
  agentIdentity?: string;
  agentSid?: string;
  hasDetectedAgent?: boolean;
  variant: 'agent' | 'candidate';
  candidateLabel: string;
  [key: string]: any;
}) {
  const participant = trackRef?.participant;
  const isSelf = participant?.isLocal;
  const isSpeaking = participant?.isSpeaking;
  const role = participant ? getParticipantRole(participant) : (variant === 'candidate' ? 'candidate' : 'guest');
  const isEmployer = role === 'employer';
  const isAgentByVoiceAssistant =
    Boolean(agentSid && participant?.sid === agentSid) ||
    Boolean(agentIdentity && participant?.identity === agentIdentity);
  const isAgent = variant === 'agent' || role === 'agent' || isAgentByVoiceAssistant;
  const hasPublication = Boolean(trackRef?.publication);
  const shouldRenderSyntheticAgent =
    !isAgent &&
    !isEmployer &&
    !isSelf &&
    !hasPublication &&
    (props?.hasAgentTranscript || hasDetectedAgent);
  const { t } = useTranslation(['interview']);

  let displayName = participant?.name || participant?.identity || '';
  if (isAgent) displayName = t('liveRoom.participants.aiInterviewer');
  else if (isEmployer) displayName = t('liveRoom.participants.employer');
  else if (isSelf) displayName = t('liveRoom.participants.you');
  else if (shouldRenderSyntheticAgent) displayName = t('liveRoom.participants.aiInterviewer');
  else if (!displayName) {
    if (variant === 'candidate') displayName = candidateLabel;
    else if (role === 'observer') displayName = t('liveRoom.participants.observer', 'Quan sát viên');
    else displayName = t('liveRoom.participants.guest');
  }

  const visualizerState: AgentState = agentState ?? (isSpeaking ? 'speaking' : 'listening');
  if (isAgent || shouldRenderSyntheticAgent) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#0f172a] shadow-[0_0_0_2px_rgba(14,165,233,0)] transition-all data-[speaking=true]:border-cyan-400/60 data-[speaking=true]:shadow-[0_0_0_2px_rgba(14,165,233,0.3)]"
        data-speaking={isSpeaking}
      >
        <div className="absolute inset-0 bg-slate-950" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <BarVisualizer
            track={audioTrack}
            state={visualizerState}
            barCount={5}
            options={{ minHeight: 18, maxHeight: 100 }}
            style={{ height: 72, width: 144, gap: 8 }}
            className="lk-audio-bar-visualizer rounded-full border border-white/10 bg-slate-950/40 px-5 py-4"
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

  if (!trackRef?.publication) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border bg-[#0f172a] transition-all ${isSpeaking ? 'border-cyan-400/60 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]' : 'border-white/8'}`}
        data-speaking={isSpeaking}
      >
        <div className={`absolute inset-0 ${isSelf ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-950 to-slate-900'} z-0`} />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10 text-5xl text-white/45 shadow-2xl shadow-black/30">
            {isAgent ? 'AI' : '👤'}
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <div className="flex items-center gap-1.5">
            {isSelf && (
              <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-300">
                {t('liveRoom.chips.you')}
              </span>
            )}
            {variant === 'candidate' && !isSelf && !isEmployer && (
              <span className="rounded bg-slate-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-200">
                {candidateLabel}
              </span>
            )}
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

      <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl">
        <VideoTrack
          trackRef={trackRef as any}
          className={`h-full w-full object-cover ${isSelf ? 'scale-x-[-1]' : ''}`}
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center gap-1.5">
          {isSelf && (
            <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-300">
              {t('liveRoom.chips.you')}
            </span>
          )}
          {isEmployer && !isSelf && (
            <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">
              {t('liveRoom.chips.employer')}
            </span>
          )}
          {variant === 'candidate' && !isSelf && !isEmployer && (
            <span className="rounded bg-slate-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-200">
              {candidateLabel}
            </span>
          )}
          <span className="text-xs font-semibold text-white">{displayName}</span>
          {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  onSend,
  chatDraft,
  setChatDraft,
  isSending,
  agentState,
}: {
  messages: ReceivedMessage[];
  onSend: () => void;
  chatDraft: string;
  setChatDraft: React.Dispatch<React.SetStateAction<string>>;
  isSending: boolean;
  agentState?: AgentState;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation(['interview']);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <div className="absolute right-0 top-0 bottom-0 z-30 flex h-full w-[352px] flex-col overflow-hidden border-l border-white/8 bg-[#0b1120] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:w-[380px]">
      <div className="shrink-0 border-b border-white/8 bg-[#0b1120]/96 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">{t('liveRoom.chat.title')}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t('liveRoom.chat.subtitle', 'Voice and messages share the same timeline.')}</p>
          </div>
          <Stack direction="row" spacing={1} alignItems="center">
            {agentState && ['thinking', 'connecting', 'initializing', 'pre-connect-buffering'].includes(agentState) && (
              <BarVisualizer
                state={agentState}
                barCount={4}
                style={{ height: 24, width: 64 }}
                options={{ minHeight: 30, maxHeight: 100 }}
              />
            )}
            <Chip
              label={t('liveRoom.chat.messagesCount', { count: messages.length })}
              size="small"
              sx={{
                fontWeight: 900,
                bgcolor: alpha('#0ea5e9', 0.16),
                color: '#7dd3fc',
                border: '1px solid',
                borderColor: alpha('#0ea5e9', 0.28),
              }}
            />
          </Stack>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              p: 2,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 3 },
            }}
          >
            {messages.length > 0 ? (
              <ul className="lk-list flex flex-col gap-3 px-1">
                {messages.map((entry) => (
                  <ChatEntry key={entry.id} entry={entry as any} />
                ))}
              </ul>
            ) : (
              <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>
                    {t('liveRoom.chat.noMessages')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('liveRoom.chat.noMessagesDesc')}
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>

          <Box
            component="form"
            onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              onSend();
            }}
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              bgcolor: 'rgba(2, 6, 23, 0.9)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Stack direction="row" spacing={1}>
              <input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder={t('liveRoom.chat.placeholder')}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/8"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!chatDraft.trim() || isSending}
                sx={{
                  borderRadius: 2.5,
                  minWidth: 76,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: '#38bdf8',
                  '&:hover': { bgcolor: '#0ea5e9' },
                  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)' },
                }}
              >
                {t('liveRoom.chat.send')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </div>
    </div>
  );
}

type AIInterviewLayoutProps = {
  onEndSession?: () => Promise<void> | void;
};

export function AIInterviewLayout({ onEndSession }: AIInterviewLayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const timeFormatted = useLiveTimer();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const voiceAssistant = useVoiceAssistant();
  const room = useRoomContext();
  const { messages, send, isSending } = useInterviewMessages();
  const { t } = useTranslation(['interview']);
  const candidateLabel = t('liveRoom.participants.candidate');
  const hasAgentTranscript = messages.some((message) => message.type === 'agentTranscript');
  const agentIdentity = voiceAssistant.agent?.identity;
  const agentSid = voiceAssistant.agent?.sid;

  const rawTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [], onlySubscribed: false },
  );

  const isLocalEmployer = getParticipantRole(localParticipant) === 'employer';
  const otherEmployerCount = participants.filter((participant) => !participant.isLocal && getParticipantRole(participant) === 'employer').length;
  const candidatePresent = participants.some((participant) => getParticipantRole(participant) === 'candidate');

  let finalTracks = rawTracks.filter((track) => {
    const participant = track.participant;
    const isEmployer = getParticipantRole(participant) === 'employer';

    if (isEmployer && track.source === Track.Source.Camera && !track.publication) {
      return false;
    }

    return true;
  });

  const agentParticipant =
    voiceAssistant.agent ?? participants.find((participant) => getParticipantRole(participant) === 'agent');
  if (agentParticipant) {
    const hasAgentTrack = finalTracks.some((track) => track.participant.sid === agentParticipant.sid);
    if (!hasAgentTrack) {
      finalTracks.push({
        participant: agentParticipant,
        source: Track.Source.Camera,
      } as any);
    }
  }

  const candidateTrack =
    finalTracks.find((track) => {
      const role = getParticipantRole(track.participant);
      return track.participant?.isLocal || role === 'candidate';
    }) ?? undefined;
  const agentTrack =
    finalTracks.find((track) => {
      const role = getParticipantRole(track.participant);
      const identity = track.participant?.identity ?? '';
      return role === 'agent' || identity === agentIdentity || track.participant?.sid === agentSid;
    }) ?? undefined;

  const employerWithCamera = finalTracks.find((track) => getParticipantRole(track.participant) === 'employer' && track.publication);
  if (employerWithCamera) {
    finalTracks = finalTracks.filter((track) => !isLiveKitAgentParticipant(track.participant));
  }

  let showObservingBar = false;
  let observingMessage = '';
  let observingIcon = faEye;

  if (isLocalEmployer) {
    showObservingBar = true;
    if (candidatePresent) {
      observingMessage = t('liveRoom.observingBar.hrObserving');
    } else {
      observingMessage = t('liveRoom.observingBar.hrWaiting');
      observingIcon = faSpinner;
    }
  } else if (otherEmployerCount > 0 && !employerWithCamera) {
    showObservingBar = true;
    observingMessage = t('liveRoom.observingBar.employerObserving');
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#020617]">
      <div className={`flex flex-1 flex-col h-full transition-all duration-300 ${chatOpen ? 'pr-[312px] md:pr-[320px]' : ''}`}>
        <div className="flex flex-1 flex-col gap-2 min-h-0 p-2">
          <div className="min-h-0 flex-1">
            <div className="grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-2">
              <AIParticipantTile
                variant="candidate"
                candidateLabel={candidateLabel}
                trackRef={candidateTrack}
                hasAgentTranscript={false}
                hasDetectedAgent={false}
                agentState={voiceAssistant.state}
                agentIdentity={agentIdentity}
                agentSid={agentSid}
              />
              <AIParticipantTile
                variant="agent"
                candidateLabel={candidateLabel}
                trackRef={agentTrack}
                audioTrack={voiceAssistant.audioTrack}
                hasAgentTranscript={hasAgentTranscript}
                hasDetectedAgent={Boolean(agentParticipant)}
                agentState={voiceAssistant.state}
                agentIdentity={agentIdentity}
                agentSid={agentSid}
              />
            </div>
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
                  {candidatePresent ? t('liveRoom.observingBar.live') : t('liveRoom.observingBar.waiting')}
                </span>
                <span className="ml-2 font-mono text-[11px] font-medium text-slate-400">{timeFormatted}</span>
              </div>
            </div>
          )}
        </div>

        <CustomControlBar
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          onEndSession={async () => {
            try {
              await onEndSession?.();
            } finally {
              room.disconnect();
            }
          }}
        />
      </div>

      {chatOpen && (
        <ChatPanel
          messages={messages}
          agentState={voiceAssistant.state}
          onSend={async () => {
            const text = chatDraft.trim();
            if (!text) return;
            await send(text, { topic: 'lk.chat' });
            setChatDraft('');
          }}
          chatDraft={chatDraft}
          setChatDraft={setChatDraft}
          isSending={isSending}
        />
      )}
    </div>
  );
}

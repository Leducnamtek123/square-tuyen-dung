import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography, alpha } from '@mui/material';
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
  useChat,
  useTranscriptions,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import { isLiveKitAgentIdentity, isLiveKitAgentParticipant, sanitizeInterviewText } from './livekitParticipant';
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
  const room = useRoomContext();
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
        // If finalization fails, fall through and still disconnect gracefully.
      }
    }
    room.disconnect();
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

function isRoleMatch(participant: any, terms: string[]) {
  const identity = participant?.identity?.toLowerCase() ?? '';
  const name = participant?.name?.toLowerCase() ?? '';
  return terms.some((term) => identity.includes(term) || name.includes(term));
}

function AIParticipantTile({ trackRef, ...props }: { trackRef?: TrackReferenceOrPlaceholder; [key: string]: any }) {
  const participant = trackRef?.participant;
  const isSelf = participant?.isLocal;
  const isSpeaking = participant?.isSpeaking;
  const isEmployer = isRoleMatch(participant, ['employer', 'admin']);
  const isAgent = isLiveKitAgentParticipant(participant);
  const { t } = useTranslation(['interview']);

  let displayName = participant?.name || participant?.identity || '';
  if (isAgent) displayName = t('liveRoom.participants.aiInterviewer');
  else if (isEmployer) displayName = t('liveRoom.participants.employer');
  else if (isSelf) displayName = t('liveRoom.participants.you');
  else if (!displayName) displayName = t('liveRoom.participants.candidate');

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
              {t('liveRoom.chips.you')}
            </span>
          )}
          {isEmployer && !isSelf && (
            <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">
              {t('liveRoom.chips.employer')}
            </span>
          )}
          <span className="text-xs font-semibold text-white">{displayName}</span>
          {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-cyan-400" />}
        </div>
      </div>
    </div>
  );
}

type TimelineEntry = {
  id: string;
  name: string;
  message: string;
  timestamp: number;
  isLocal: boolean;
  isAgent: boolean;
  type?: 'transcript' | 'chat';
};

function formatTimelineTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimelineMessage({
  entry,
  live = false,
}: {
  entry: TimelineEntry;
  live?: boolean;
}) {
  const alignRight = entry.isLocal && !entry.isAgent;
  const displayMessage = sanitizeInterviewText(entry.message);
  const { t } = useTranslation(['interview']);

  return (
    <Stack
      spacing={0.75}
      alignItems={alignRight ? 'flex-end' : 'flex-start'}
      sx={{ width: '100%' }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          alignSelf: alignRight ? 'flex-end' : 'flex-start',
          flexWrap: 'wrap',
          justifyContent: alignRight ? 'flex-end' : 'flex-start',
        }}
      >
        <Chip
          label={entry.isAgent ? t('liveRoom.chips.ai') : entry.isLocal ? t('liveRoom.chips.you') : t('liveRoom.participants.guest')}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.58rem',
            fontWeight: 900,
            letterSpacing: 1.1,
            bgcolor: entry.isAgent
              ? alpha('#8b5cf6', 0.18)
              : entry.isLocal
                ? alpha('#0ea5e9', 0.18)
                : alpha('#94a3b8', 0.12),
            color: entry.isAgent
              ? '#c4b5fd'
              : entry.isLocal
                ? '#7dd3fc'
                : '#cbd5e1',
            border: '1px solid',
            borderColor: entry.isAgent
              ? alpha('#8b5cf6', 0.28)
              : entry.isLocal
                ? alpha('#0ea5e9', 0.24)
                : alpha('#94a3b8', 0.16),
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          {entry.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
          {formatTimelineTime(entry.timestamp)}
        </Typography>
        {live && (
          <Chip
            label={t('liveRoom.chips.live')}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.55rem',
              fontWeight: 900,
              bgcolor: alpha('#22c55e', 0.12),
              color: '#22c55e',
              border: '1px solid',
              borderColor: alpha('#22c55e', 0.18),
            }}
          />
        )}
      </Stack>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '100%',
          width: 'fit-content',
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: entry.isAgent
            ? alpha('#8b5cf6', 0.16)
            : entry.isLocal
              ? alpha('#0ea5e9', 0.16)
              : alpha('#334155', 0.5),
          bgcolor: entry.isAgent
            ? alpha('#8b5cf6', 0.08)
            : entry.isLocal
              ? alpha('#0ea5e9', 0.08)
              : alpha('#020617', 0.7),
          color: '#fff',
          boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
          lineHeight: 1.75,
          fontWeight: 600,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, whiteSpace: 'pre-wrap' }}>
          {displayMessage}
        </Typography>
      </Paper>
    </Stack>
  );
}

function ChatPanel({
  transcriptEntries,
  chatEntries,
  onSend,
  chatDraft,
  setChatDraft,
  isSending,
}: {
  transcriptEntries: TimelineEntry[];
  chatEntries: TimelineEntry[];
  onSend: () => void;
  chatDraft: string;
  setChatDraft: React.Dispatch<React.SetStateAction<string>>;
  isSending: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation(['interview']);

  const combinedEntries = React.useMemo(() => {
    const transcripts = transcriptEntries.map(e => ({ ...e, type: 'transcript' as const }));
    const chats = chatEntries.map(e => ({ ...e, type: 'chat' as const }));
    return [...transcripts, ...chats].sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptEntries, chatEntries]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [combinedEntries.length]);

  return (
    <div className="absolute right-0 top-0 bottom-0 z-30 flex h-full w-[352px] flex-col overflow-hidden border-l border-white/8 bg-[#0b1120] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:w-[380px]">
      <div className="shrink-0 border-b border-white/8 bg-[#0b1120]/96 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-white">{t('liveRoom.chat.title')}</p>
          <Chip
            label={t('liveRoom.chat.messagesCount', { count: combinedEntries.length })}
            size="small"
            sx={{
              fontWeight: 900,
              bgcolor: alpha('#0ea5e9', 0.16),
              color: '#7dd3fc',
              border: '1px solid',
              borderColor: alpha('#0ea5e9', 0.28),
            }}
          />
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
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 3 },
            }}
          >
            {combinedEntries.length > 0 ? (
              combinedEntries.map((entry) => (
                <TimelineMessage key={`${entry.type}-${entry.id}`} entry={entry} live={entry.type === 'transcript'} />
              ))
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
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/8"
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
  const room = useRoomContext();
  const chatOptions = React.useMemo(() => ({ room, channelTopic: 'lk.chat' }), [room]);
  const chat = useChat(chatOptions);
  const transcriptions = useTranscriptions();
  const { t } = useTranslation(['interview']);

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
  const candidatePresent = participants.some(
    (participant) => !isRoleMatch(participant, ['employer', 'admin']) && !isLiveKitAgentParticipant(participant),
  );

  let finalTracks = rawTracks.filter((track) => {
    const participant = track.participant;
    const isEmployer = isRoleMatch(participant, ['employer', 'admin']);

    if (isEmployer && track.source === Track.Source.Camera && !track.publication) {
      return false;
    }

    return true;
  });

  const agentParticipant = participants.find((participant) => isLiveKitAgentParticipant(participant));
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
    finalTracks = finalTracks.filter((track) => !isLiveKitAgentParticipant(track.participant));
  }

  const aiName = t('liveRoom.participants.aiInterviewer');
  const youName = t('liveRoom.participants.you');
  const guestName = t('liveRoom.participants.guest');

  const transcriptEntries = React.useMemo<TimelineEntry[]>(() => {
    return transcriptions.map((item) => {
      const participant = participants.find((p) => p.identity === item.participantInfo.identity);
      const isAgent = isLiveKitAgentParticipant(participant) || isLiveKitAgentIdentity(item.participantInfo.identity);
      const isLocal = participant?.isLocal ?? item.participantInfo.identity === localParticipant.identity;
      const name = isAgent
        ? aiName
        : isLocal
          ? youName
          : participant?.name || participant?.identity || item.participantInfo.identity || guestName;

      return {
        id: `${item.streamInfo.id}`,
        name,
        message: item.text,
        timestamp: item.streamInfo.timestamp,
        isLocal,
        isAgent,
      };
    });
  }, [localParticipant.identity, participants, transcriptions, aiName, youName, guestName]);

  const roomChatEntries = React.useMemo<TimelineEntry[]>(() => {
    return chat.chatMessages.map((message) => {
      const participant = message.from;
      const isAgent = isLiveKitAgentParticipant(participant);
      const isLocal = participant?.isLocal === true;
      const name = isAgent
        ? aiName
        : isLocal
          ? youName
          : participant?.name || participant?.identity || guestName;

      return {
        id: message.id,
        name,
        message: message.message,
        timestamp: message.timestamp,
        isLocal,
        isAgent,
        type: 'chat',
      };
    });
  }, [chat.chatMessages, aiName, youName, guestName]);

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
                    {candidatePresent ? t('liveRoom.observingBar.live') : t('liveRoom.observingBar.waiting')}
                  </span>
                  <span className="ml-2 font-mono text-[11px] font-medium text-slate-400">{timeFormatted}</span>
                </div>
              </div>
            )}
          </div>

          <CustomControlBar chatOpen={chatOpen} setChatOpen={setChatOpen} onEndSession={onEndSession} />
        </div>

        {chatOpen && (
          <ChatPanel
            transcriptEntries={transcriptEntries}
            chatEntries={roomChatEntries}
            onSend={async () => {
              const text = chatDraft.trim();
              if (!text) return;
              try {
                await chat.send(text, { topic: 'lk.chat' });
                setChatDraft('');
              } finally {
                // useChat handles sending state internally
              }
            }}
            chatDraft={chatDraft}
            setChatDraft={setChatDraft}
            isSending={chat.isSending}
          />
        )}
      </div>
    </LayoutContextProvider>
  );
}

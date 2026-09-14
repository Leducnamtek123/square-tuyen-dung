import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography, alpha } from '@mui/material';
import {
  BarVisualizer,
  TrackReferenceOrPlaceholder,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
  useVoiceAssistant,
  StartAudio,
  VideoTrack,
  type AgentState,
  type ReceivedMessage,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faDesktop,
  faEye,
  faMicrophone,
  faMicrophoneSlash,
  faPhoneSlash,
  faSpinner,
  faUser,
  faXmark,
  faVideo,
  faVideoSlash,
  faChevronLeft,
  faChevronRight,
  faLightbulb,
  faMapLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import { AgentAudioVisualizerAura } from '@/components/Features/AgentsUI/agent-audio-visualizer-aura';
import { LiveAudioVisualizerContainer } from './components/LiveAudioVisualizerContainer';
import { InterviewAvatar } from './components/avatar/InterviewAvatar';
import { LiveMicActivityBadge } from './components/LiveMicActivityBadge';
import { AilaLogo } from '@/components/Common/AilaLogo';
import { useLiveAudioTrackAnalyzer } from './hooks/useLiveAudioTrackAnalyzer';
import {
  getParticipantCompanyName,
  getParticipantRole,
  isLiveKitAgentParticipant,
  sanitizeInterviewText,
} from './livekitParticipant';
import { useInterviewMessages } from './useInterviewMessages';
import type { Question } from '@/types/models';
import { useInterviewQuestionHUD, QUESTION_CONTROL_TOPIC } from './useInterviewQuestionHUD';
import { InterviewHintsDrawer } from './components/InterviewHintsDrawer';
import { InterviewRoadmapDrawer } from './components/InterviewRoadmapDrawer';
import { InterviewQuestionCard } from './components/InterviewQuestionCard';
import { ProductTourTrigger, useTourAutoStart } from '@/components/Features/ProductTour';

const AI_CONTROL_TOPIC = 'square.interview.ai_control';
const AI_TAKEOVER_TOPIC = 'square.interview.ai_takeover';

type ChatComposerMode = 'chat' | 'aiControl' | 'takeover';

type TakeoverControlPayload = {
  action?: 'acquire' | 'release';
};

const isEmployerIdentity = (identity?: string | null) =>
  Boolean(identity?.toLowerCase().startsWith('employer-'));

const parseTakeoverControlPayload = (value: string): TakeoverControlPayload | null => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as TakeoverControlPayload;
    }
  } catch {
    return null;
  }

  return null;
};

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
  const [ending, setEnding] = useState(false);

  return (
    <div className="flex items-center justify-center px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl ring-1 ring-slate-100">
        <button
          type="button"
          aria-label={isMicrophoneEnabled ? t('controls.muteMicrophone') : t('controls.unmuteMicrophone')}
          onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
          className={`flex size-11 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer
            ${isMicrophoneEnabled ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm' : 'border-rose-500/50 bg-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}
        >
          <FontAwesomeIcon icon={isMicrophoneEnabled ? faMicrophone : faMicrophoneSlash} />
        </button>
        <button
          type="button"
          aria-label={isCameraEnabled ? t('controls.turnCameraOff') : t('controls.turnCameraOn')}
          onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
          className={`flex size-11 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer
            ${isCameraEnabled ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm' : 'border-rose-500/50 bg-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}
        >
          <FontAwesomeIcon icon={isCameraEnabled ? faVideo : faVideoSlash} />
        </button>
        <button
          type="button"
          aria-label={isScreenShareEnabled ? t('controls.stopScreenShare') : t('controls.startScreenShare')}
          onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
          className={`flex size-11 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer
            ${isScreenShareEnabled ? 'border-sky-500/50 bg-sky-500/20 text-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm'}`}
        >
          <FontAwesomeIcon icon={faDesktop} />
        </button>
        <button
          type="button"
          aria-label={chatOpen ? t('liveRoom.chat.close') : t('liveRoom.chat.open')}
          onClick={() => setChatOpen(!chatOpen)}
          className={`flex size-11 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer
            ${chatOpen ? 'border-sky-500/50 bg-sky-500/20 text-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm'}`}
        >
          <FontAwesomeIcon icon={faComment} />
        </button>
        <div className="mx-1.5 h-6 w-px bg-slate-200" />
        <button
          type="button"
          onClick={async () => {
            if (ending) return;
            setEnding(true);
            try {
              await onEndSession?.();
            } catch {
              // keep disconnect flow resilient
            } finally {
              setEnding(false);
            }
          }}
          disabled={ending}
          className={`flex h-11 items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-600 hover:bg-rose-700 px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)] transition-all duration-150 active:scale-[0.98] cursor-pointer ${
            ending ? 'cursor-wait opacity-70' : ''
          }`}
        >
          <FontAwesomeIcon icon={ending ? faSpinner : faPhoneSlash} className={ending ? 'animate-spin' : undefined} />
          {ending ? t('controls.ending') : t('controls.end')}
        </button>
      </div>
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
  avatarId,
  avatarImageUrl,
  avatarBackgroundUrl,
  avatarBackdrop,
  interviewerName,
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
  avatarId?: string;
  avatarImageUrl?: string | null;
  avatarBackgroundUrl?: string | null;
  avatarBackdrop?: string | null;
  interviewerName?: string;
  [key: string]: any;
}) {
  const { isMicrophoneEnabled } = useLocalParticipant();
  const participant = trackRef?.participant;
  const isSelf = participant?.isLocal;
  const isSpeaking = participant?.isSpeaking;
  const role = participant ? getParticipantRole(participant) : (variant === 'candidate' ? 'candidate' : 'guest');
  const isEmployer = role === 'employer';
  const employerCompanyName = getParticipantCompanyName(participant);
  const isAgentByVoiceAssistant =
    Boolean(agentSid && participant?.sid === agentSid) ||
    Boolean(agentIdentity && participant?.identity === agentIdentity);
  const isAgent = variant === 'agent' || role === 'agent' || isAgentByVoiceAssistant;
  const hasPublication = Boolean(trackRef?.publication);
  const shouldRenderSyntheticAgent = !isAgent && !isEmployer && !isSelf && !hasPublication && (props?.hasAgentTranscript || hasDetectedAgent);
  const { t } = useTranslation(['interview']);

  let displayName = interviewerName || participant?.name || participant?.identity || '';
  if (isAgent || shouldRenderSyntheticAgent) displayName = interviewerName || t('liveRoom.participants.aiInterviewer');
  else if (isEmployer) displayName = employerCompanyName || t('liveRoom.participants.employer');
  else if (isSelf) displayName = t('liveRoom.participants.you');
  else if (!displayName) {
    if (variant === 'candidate') displayName = candidateLabel;
    else if (role === 'observer') displayName = t('liveRoom.participants.observer');
    else displayName = t('liveRoom.participants.guest');
  }

  const visualizerState: AgentState = agentState ?? (isSpeaking ? 'speaking' : 'listening');
  const candidateAnalyzer = useLiveAudioTrackAnalyzer(audioTrack, { isSpeakingHint: isSpeaking });

  if (isAgent || shouldRenderSyntheticAgent) {
    return (
      <InterviewAvatar
        audioTrack={audioTrack?.publication?.track ?? audioTrack}
        voiceAssistantState={visualizerState}
        isSpeakingHint={isSpeaking}
        sessionStatus={props?.sessionStatus}
        interviewerName={displayName}
        avatarId={avatarId}
        avatarImageUrl={avatarImageUrl}
        avatarBackgroundUrl={avatarBackgroundUrl}
        avatarBackdrop={avatarBackdrop}
      />
    );
  }

  const isMuted = !trackRef?.publication || trackRef.publication.isMuted || !trackRef.publication.track;

  if (isMuted) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all ${isSpeaking ? 'border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.25)]' : ''}`}
        data-speaking={isSpeaking}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 z-0" />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-4">
          <div className="flex size-16 sm:size-20 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-2xl text-slate-600 shadow-sm">
            {isAgent ? 'AI' : <FontAwesomeIcon icon={faUser} className="text-xl sm:text-2xl text-slate-500" />}
          </div>
          {/* Live Audio Visualizer for Candidate when Camera is Off */}
          <div className="w-full max-w-[240px]">
            <LiveAudioVisualizerContainer
              audioTrack={audioTrack}
              isSpeakingHint={isSpeaking}
              color="#0284c7"
              secondaryColor="#4f46e5"
              defaultMode="bar"
              allowModeSwitch={true}
              role="candidate"
              height={56}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white/95 via-white/50 to-transparent px-4 py-3">
          <div className="flex items-center gap-2">
            {isSelf ? (
              <span className="rounded bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {t('liveRoom.chips.you')}
              </span>
            ) : (
              <>
                {variant === 'candidate' && !isEmployer && (
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-700">
                    {candidateLabel}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-800">{displayName}</span>
              </>
            )}
            {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-sky-500" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl transition-all ${isSpeaking ? 'border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.35)]' : ''}`}
      data-speaking={isSpeaking}
    >
      <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl">
        <VideoTrack trackRef={trackRef as any} className={`h-full w-full object-cover ${isSelf ? 'scale-x-[-1]' : ''}`} />
        {/* Floating live mic activity badge over video */}
        <div className="absolute top-3 right-3 z-30">
          <LiveMicActivityBadge analyzer={candidateAnalyzer} isMuted={isSelf ? !isMicrophoneEnabled : false} />
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          {isSelf ? (
            <span className="rounded bg-sky-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {t('liveRoom.chips.you')}
            </span>
          ) : (
            <>
              {variant === 'candidate' && !isEmployer && (
                <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                  {candidateLabel}
                </span>
              )}
              <span className="text-xs font-semibold text-white">{displayName}</span>
            </>
          )}
          {isSpeaking && <FontAwesomeIcon icon={faMicrophone} className="ml-auto text-[10px] text-sky-300" />}
        </div>
      </div>
    </div>
  );
}

function formatTimelineTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

type TimelineMessageType = 'userTranscript' | 'agentTranscript' | 'chatMessage';

function isTranscriptMessage(message: { type?: TimelineMessageType }) {
  return message.type === 'userTranscript' || message.type === 'agentTranscript';
}

function TimelineMessage({
  entry,
}: {
  entry: { id: string; timestamp: number; message: string; from?: { isLocal?: boolean; name?: string; identity?: string } | null; type?: TimelineMessageType };
}) {
  const { t } = useTranslation(['interview']);
  const isTranscript = isTranscriptMessage(entry);
  const isAgent = entry.type === 'agentTranscript';
  const isLocal = entry.from?.isLocal === true;
  const participantRole = entry.from ? getParticipantRole(entry.from as any) : 'guest';
  const employerCompanyName = getParticipantCompanyName(entry.from as any) || t('liveRoom.participants.employer');
  const isEmployer = participantRole === 'employer';
  const isCandidate = participantRole === 'candidate';
  const alignRight = isLocal && !isAgent;
  const chipLabel = isAgent
    ? t('liveRoom.chips.ai')
    : isLocal
      ? t('liveRoom.chips.you')
      : isEmployer
        ? t('liveRoom.chips.employer')
        : isCandidate
          ? t('liveRoom.participants.candidate')
          : isTranscript
            ? t('liveRoom.chips.live')
            : t('liveRoom.participants.guest');

  const customParticipantName =
    isEmployer && employerCompanyName !== t('liveRoom.participants.employer')
      ? employerCompanyName
      : entry.from?.name;
  const showDisplayName =
    !isAgent &&
    !isLocal &&
    Boolean(customParticipantName && customParticipantName.trim().toLowerCase() !== chipLabel.trim().toLowerCase());

  return (
    <Stack spacing={0.75} alignItems={alignRight ? 'flex-end' : 'flex-start'} sx={{ width: '100%' }}>
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
          icon={isAgent ? <AilaLogo size={11} variant="mark" /> : undefined}
          label={chipLabel}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.58rem',
            fontWeight: 900,
            letterSpacing: 1.1,
            bgcolor: isAgent
              ? alpha('#0ea5e9', 0.1)
              : isLocal
                ? alpha('#0ea5e9', 0.1)
                : isEmployer
                  ? alpha('#f59e0b', 0.12)
                  : isCandidate || isTranscript
                    ? alpha('#22c55e', 0.1)
                    : alpha('#64748b', 0.1),
            color: isAgent
              ? '#0284c7'
              : isLocal
                ? '#0284c7'
                : isEmployer
                  ? '#d97706'
                  : isCandidate || isTranscript
                    ? '#16a34a'
                    : '#475569',
            border: '1px solid',
            borderColor: isAgent
              ? alpha('#0ea5e9', 0.25)
              : isLocal
                ? alpha('#0ea5e9', 0.2)
                : isEmployer
                  ? alpha('#f59e0b', 0.25)
                  : isCandidate || isTranscript
                    ? alpha('#22c55e', 0.2)
                    : alpha('#64748b', 0.18),
            '& .MuiChip-icon': {
              ml: 0.5,
              mr: -0.25,
            },
          }}
        />
        {showDisplayName && (
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
            {customParticipantName}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
          {formatTimelineTime(entry.timestamp)}
        </Typography>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          maxWidth: '92%',
          width: 'fit-content',
          px: 2,
          py: 1.25,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isTranscript
            ? alpha('#22c55e', 0.28)
            : isAgent
              ? '#e2e8f0'
              : isLocal
                ? alpha('#0284c7', 0.28)
                : '#e2e8f0',
          bgcolor: isTranscript
            ? '#f0fdf4'
            : isAgent
              ? '#ffffff'
              : isLocal
                ? '#f0f9ff'
                : '#f8fafc',
          color: '#1e293b',
          boxShadow: isAgent
            ? '0 1px 4px rgba(0,0,0,0.06)'
            : '0 1px 2px rgba(0,0,0,0.04)',
          lineHeight: 1.7,
          fontWeight: 500,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <Typography variant="body2" sx={{ color: isLocal ? '#0369a1' : isAgent ? '#1e293b' : '#334155', fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.8125rem' }}>
          {sanitizeInterviewText(entry.message)}
        </Typography>
      </Paper>
    </Stack>
  );
}

function ChatPanel({
  messages,
  onSend,
  chatDraft,
  setChatDraft,
  isSending,
  composerMode,
  setComposerMode,
  canControlAI,
  isControlSending,
  takeoverActive,
  isTakeoverSending,
  onTakeoverAcquire,
  onTakeoverRelease,
  onCloseChat,
  onEndSession,
  agentState,
  isCompactChatView,
}: {
  messages: ReceivedMessage[];
  onSend: () => void;
  chatDraft: string;
  setChatDraft: React.Dispatch<React.SetStateAction<string>>;
  isSending: boolean;
  composerMode: ChatComposerMode;
  setComposerMode: (value: ChatComposerMode) => void;
  canControlAI: boolean;
  isControlSending: boolean;
  takeoverActive: boolean;
  isTakeoverSending: boolean;
  onTakeoverAcquire: () => void;
  onTakeoverRelease: () => void;
  onCloseChat: () => void;
  onEndSession?: () => Promise<void> | void;
  agentState?: AgentState;
  isCompactChatView: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation(['interview']);
  const sending = composerMode === 'aiControl' ? isControlSending : isSending;
  const inputPlaceholder =
    composerMode === 'aiControl'
      ? t('liveRoom.chat.aiControlPlaceholder')
      : t('liveRoom.chat.placeholder');
  const sendLabel =
    composerMode === 'aiControl'
      ? t('liveRoom.chat.aiControlSend')
      : t('liveRoom.chat.send');

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <div
      className={`absolute z-30 flex w-full flex-col overflow-hidden border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl sm:left-auto sm:right-3 sm:top-2.5 sm:bottom-2.5 sm:w-[350px] md:w-[370px] lg:w-[380px] sm:rounded-2xl sm:border ${
        isCompactChatView
          ? 'inset-x-0 bottom-0 h-[62dvh] rounded-t-[32px] border-t border-l-0 shadow-[0_-18px_48px_rgba(0,0,0,0.12)]'
          : 'inset-0 h-full sm:h-[calc(100%-20px)]'
      }`}
    >
      {isCompactChatView && (
        <div className="flex justify-center border-b border-slate-200/80 px-4 pt-3">
          <div className="h-1.5 w-14 rounded-full bg-slate-300" />
        </div>
      )}
      <div className="shrink-0 border-b border-slate-200/90 bg-slate-50/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800">{t('liveRoom.chat.title')}</p>
              <span className="rounded-full border border-sky-500/30 bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold text-sky-600">
                {t('liveRoom.chat.messagesCount', { count: messages.length })}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 truncate">{t('liveRoom.chat.subtitle')}</p>
          </div>
          <button
            type="button"
            aria-label={t('liveRoom.chat.close')}
            onClick={onCloseChat}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 active:scale-95 cursor-pointer shadow-xs"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-slate-50/50">
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              p: 2,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
            }}
          >
            {messages.length > 0 ? (
              <Stack spacing={2}>
                {messages.map((entry) => (
                  <TimelineMessage key={`${entry.type}-${entry.id}`} entry={entry as any} />
                ))}
              </Stack>
            ) : (
              <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ color: '#1e293b', fontWeight: 800 }}>
                    {t('liveRoom.chat.noMessages')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {t('liveRoom.chat.noMessagesDesc')}
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>

          <Box
            component="form"
            onSubmit={(event: React.SyntheticEvent<HTMLFormElement>) => {
              event.preventDefault();
              if (composerMode === 'takeover') return;
              onSend();
            }}
            sx={{
              p: 1.5,
              borderTop: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              backdropFilter: 'blur(12px)',
            }}
          >
            {canControlAI && (
              <ToggleButtonGroup
                exclusive
                size="small"
                value={composerMode}
                onChange={(_, value: ChatComposerMode | null) => {
                  if (value) setComposerMode(value);
                }}
                sx={{
                  mb: 1,
                  '& .MuiToggleButton-root': {
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    px: 1.25,
                    py: 0.5,
                    gap: 0.75,
                    fontSize: '0.7rem',
                    fontWeight: 850,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      bgcolor: alpha('#0284c7', 0.1),
                      borderColor: alpha('#0284c7', 0.35),
                      color: '#0284c7',
                    },
                  },
                }}
              >
                <ToggleButton value="chat">
                  <FontAwesomeIcon icon={faComment} />
                  {t('liveRoom.chat.chatMode')}
                </ToggleButton>
                <ToggleButton value="aiControl">
                  <FontAwesomeIcon icon={faMicrophone} />
                  {t('liveRoom.chat.aiControlMode')}
                </ToggleButton>
                <ToggleButton value="takeover">
                  <FontAwesomeIcon icon={faVideo} />
                  {t('liveRoom.chat.takeoverMode')}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            {composerMode === 'takeover' ? (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: takeoverActive ? alpha('#22c55e', 0.28) : alpha('#f59e0b', 0.22),
                  bgcolor: takeoverActive ? alpha('#22c55e', 0.08) : alpha('#f59e0b', 0.08),
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={takeoverActive ? t('liveRoom.chat.takeoverActive') : t('liveRoom.chat.takeoverInactive')}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        bgcolor: takeoverActive ? alpha('#22c55e', 0.16) : alpha('#f59e0b', 0.16),
                        color: takeoverActive ? '#16a34a' : '#d97706',
                        border: '1px solid',
                        borderColor: takeoverActive ? alpha('#22c55e', 0.28) : alpha('#f59e0b', 0.28),
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 900 }}>
                      {t('liveRoom.chat.takeoverTitle')}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {t('liveRoom.chat.takeoverHint')}
                  </Typography>
                  <Button
                    type="button"
                    variant="contained"
                    disabled={isTakeoverSending}
                    onClick={takeoverActive ? onTakeoverRelease : onTakeoverAcquire}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: takeoverActive ? '#ef4444' : '#22c55e',
                      '&:hover': { bgcolor: takeoverActive ? '#dc2626' : '#16a34a' },
                    }}
                  >
                    {isTakeoverSending
                      ? t('liveRoom.chat.takeoverSending')
                      : takeoverActive
                        ? t('liveRoom.chat.takeoverRelease')
                        : t('liveRoom.chat.takeoverAcquire')}
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack direction="row" spacing={1}>
                <input
                  aria-label={inputPlaceholder}
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  placeholder={inputPlaceholder}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!chatDraft.trim() || sending}
                  sx={{
                    borderRadius: '12px',
                    minWidth: 72,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    bgcolor: '#2563eb',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                    '&:hover': { bgcolor: '#1d4ed8' },
                    '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                  }}
                >
                  {sendLabel}
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </div>
    </div>
  );
}

type AIInterviewLayoutProps = {
  onEndSession?: () => Promise<void> | void;
  questions?: Question[];
  defaultDurationSeconds?: number;
  avatarId?: string;
  avatarImageUrl?: string | null;
  avatarBackgroundUrl?: string | null;
  avatarBackdrop?: string | null;
  interviewerName?: string;
};

export function AIInterviewLayout({
  onEndSession,
  questions: propQuestions,
  defaultDurationSeconds,
  avatarId,
  avatarImageUrl,
  avatarBackgroundUrl,
  avatarBackdrop,
  interviewerName,
}: AIInterviewLayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [composerMode, setComposerMode] = useState<ChatComposerMode>('chat');
  const [isControlSending, setIsControlSending] = useState(false);
  const [takeoverOwnerIdentity, setTakeoverOwnerIdentity] = useState<string | null>(null);
  const [isTakeoverSending, setIsTakeoverSending] = useState(false);
  const [isCompactChatView, setIsCompactChatView] = useState(false);
  const [isFinishingTransition, setIsFinishingTransition] = useState(false);
  const timeFormatted = useLiveTimer();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const voiceAssistant = useVoiceAssistant();
  const room = useRoomContext();
  const hud = useInterviewQuestionHUD({
    initialQuestions: propQuestions,
    defaultDurationSeconds: defaultDurationSeconds || 120,
    room,
    onCompleteInterview: () => {
      void onEndSession?.();
    },
  });
  const { messages, send, isSending } = useInterviewMessages();
  const { t } = useTranslation(['interview']);
  const candidateLabel = t('liveRoom.participants.candidate');

  // Auto-start product tour on first visit
  useTourAutoStart('interview_ai_live', 1200);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const update = () => setIsCompactChatView(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);
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

  const audioTracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { updateOnlyOn: [], onlySubscribed: false },
  );

  const localParticipantRole = getParticipantRole(localParticipant);
  const isLocalEmployer = localParticipantRole === 'employer';
  const takeoverActive = Boolean(takeoverOwnerIdentity);
  const otherEmployerCount = participants.filter((participant) => !participant.isLocal && getParticipantRole(participant) === 'employer').length;
  const candidatePresent = participants.some((participant) => getParticipantRole(participant) === 'candidate');

  let finalTracks = rawTracks.filter((track) => {
    const participant = track.participant;
    const isEmployer = getParticipantRole(participant) === 'employer';
    return !(isEmployer && track.source === Track.Source.Camera && !track.publication);
  });

  const agentParticipant = voiceAssistant.agent ?? participants.find((participant) => getParticipantRole(participant) === 'agent');
  if (agentParticipant && !finalTracks.some((track) => track.participant.sid === agentParticipant.sid)) {
    finalTracks.push({ participant: agentParticipant, source: Track.Source.Camera } as any);
  }

  const candidateTrack =
    finalTracks.find((track) => getParticipantRole(track.participant) === 'candidate') ??
    (!isLocalEmployer ? finalTracks.find((track) => track.participant?.isLocal) : undefined);
  const agentTrack =
    finalTracks.find((track) => {
      const role = getParticipantRole(track.participant);
      const identity = track.participant?.identity ?? '';
      return role === 'agent' || identity === agentIdentity || track.participant?.sid === agentSid;
    }) ?? undefined;

  const candidateAudioTrack =
    audioTracks.find((track) => track.participant.isLocal || getParticipantRole(track.participant) === 'candidate') ??
    (localParticipant.getTrackPublication(Track.Source.Microphone)?.track
      ? ({ participant: localParticipant, publication: localParticipant.getTrackPublication(Track.Source.Microphone), source: Track.Source.Microphone } as any)
      : undefined);

  const agentAudioTrack =
    voiceAssistant.audioTrack ??
    audioTracks.find(
      (track) =>
        getParticipantRole(track.participant) === 'agent' ||
        track.participant.identity === agentIdentity ||
        (agentSid && track.participant.sid === agentSid) ||
        isLiveKitAgentParticipant(track.participant),
    ) ??
    undefined;

  const employerWithCamera =
    finalTracks.find((track) => (
      getParticipantRole(track.participant) === 'employer' &&
      track.publication &&
      (!takeoverOwnerIdentity || track.participant.identity === takeoverOwnerIdentity)
    )) ??
    finalTracks.find((track) => getParticipantRole(track.participant) === 'employer' && track.publication);
  if (employerWithCamera) {
    finalTracks = finalTracks.filter((track) => !isLiveKitAgentParticipant(track.participant));
  }
  const secondaryTrack = takeoverActive && employerWithCamera ? employerWithCamera : agentTrack;
  const secondaryVariant: 'agent' | 'candidate' = takeoverActive && employerWithCamera ? 'candidate' : 'agent';

  let showObservingBar = false;
  let observingMessage = '';
  let observingIcon = faEye;

  if (isLocalEmployer) {
    showObservingBar = true;
    observingMessage = candidatePresent ? t('liveRoom.observingBar.hrObserving') : t('liveRoom.observingBar.hrWaiting');
    observingIcon = candidatePresent ? faEye : faSpinner;
  } else if (otherEmployerCount > 0 && !employerWithCamera) {
    showObservingBar = true;
    observingMessage = t('liveRoom.observingBar.employerObserving');
  }

  useEffect(() => {
    if (!isLocalEmployer && (composerMode === 'aiControl' || composerMode === 'takeover')) {
      setComposerMode('chat');
    }
  }, [composerMode, isLocalEmployer]);

  useEffect(() => {
    const handleTakeoverControl = async (
      reader: { readAll: () => Promise<string> },
      participantInfo: { identity: string },
    ) => {
      if (!isEmployerIdentity(participantInfo.identity)) return;

      const payload = parseTakeoverControlPayload(await reader.readAll());
      if (payload?.action === 'acquire') {
        setTakeoverOwnerIdentity(participantInfo.identity);
      } else if (payload?.action === 'release') {
        setTakeoverOwnerIdentity((currentIdentity) => (
          !currentIdentity || currentIdentity === participantInfo.identity ? null : currentIdentity
        ));
      }
    };

    try {
      room.registerTextStreamHandler(AI_TAKEOVER_TOPIC, handleTakeoverControl);
    } catch {
      room.unregisterTextStreamHandler(AI_TAKEOVER_TOPIC);
      room.registerTextStreamHandler(AI_TAKEOVER_TOPIC, handleTakeoverControl);
    }

    return () => {
      room.unregisterTextStreamHandler(AI_TAKEOVER_TOPIC);
    };
  }, [room]);

  useEffect(() => {
    if (!room || typeof room.registerTextStreamHandler !== 'function') return;

    const handleQuestionControl = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const text = await reader.readAll();
        const payload = JSON.parse(text);
        if (payload?.action === 'session_completed') {
          console.log('[AIInterviewLayout] Received session_completed event from AI Agent');
          setIsFinishingTransition(true);
          setTimeout(() => {
            void onEndSession?.();
          }, 3500);
        }
      } catch (err) {
        console.warn('[AIInterviewLayout] Error parsing question control event:', err);
      }
    };

    try {
      room.registerTextStreamHandler(QUESTION_CONTROL_TOPIC, handleQuestionControl);
    } catch {
      // Ignore
    }

    return () => {
      try {
        if (typeof room.unregisterTextStreamHandler === 'function') {
          room.unregisterTextStreamHandler(QUESTION_CONTROL_TOPIC);
        }
      } catch {
        // Ignore
      }
    };
  }, [room, onEndSession]);

  useEffect(() => {
    if (!takeoverOwnerIdentity) return;
    const takeoverOwnerStillPresent =
      takeoverOwnerIdentity === localParticipant.identity ||
      participants.some((participant) => participant.identity === takeoverOwnerIdentity);
    if (!takeoverOwnerStillPresent) {
      setTakeoverOwnerIdentity(null);
    }
  }, [localParticipant.identity, participants, takeoverOwnerIdentity]);

  const sendTakeoverControl = React.useCallback(async (action: 'acquire' | 'release') => {
    if (!isLocalEmployer) return;
    setIsTakeoverSending(true);
    try {
      await room.localParticipant.sendText(JSON.stringify({ action }), {
        topic: AI_TAKEOVER_TOPIC,
        attributes: { kind: 'employer_takeover', action },
      });
      if (action === 'acquire') {
        setTakeoverOwnerIdentity(localParticipant.identity);
        await localParticipant.setMicrophoneEnabled(true);
      } else {
        setTakeoverOwnerIdentity(null);
        await localParticipant.setMicrophoneEnabled(false);
      }
    } finally {
      setIsTakeoverSending(false);
    }
  }, [isLocalEmployer, localParticipant, room.localParticipant]);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#f8fafc]">
      {/* Left Drawer: Gợi ý trả lời & Mẹo quan trọng */}
      <InterviewHintsDrawer
        open={hud.hintsDrawerOpen}
        onClose={() => hud.setHintsDrawerOpen(false)}
        question={hud.currentQuestion}
      />

      {/* Right Drawer: Lộ trình phỏng vấn */}
      <InterviewRoadmapDrawer
        open={hud.roadmapDrawerOpen}
        onClose={() => hud.setRoadmapDrawerOpen(false)}
        questions={hud.questions}
        currentIndex={hud.currentIndex}
        onSelectQuestion={hud.goToQuestion}
        completedIds={hud.completedQuestionIds}
      />

      {/* Floating Left Tab: Gợi ý */}
      {!hud.hintsDrawerOpen && (
        <button
          type="button"
          onClick={() => hud.setHintsDrawerOpen(true)}
          aria-label="Mở gợi ý trả lời"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 rounded-r-xl border-y border-r border-slate-200 bg-white/95 py-3.5 px-2 text-amber-600 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:px-2.5 active:scale-95 group"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100">
            <FontAwesomeIcon icon={faLightbulb} className="text-xs" />
          </div>
          <span className="[writing-mode:vertical-lr] text-[11px] font-bold tracking-widest text-slate-700 group-hover:text-amber-600">
            Gợi ý
          </span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-slate-400 group-hover:text-amber-600" />
        </button>
      )}

      {/* Tab nổi bên phải: Lộ trình phỏng vấn */}
      {!hud.roadmapDrawerOpen && (
        <button
          type="button"
          onClick={() => hud.setRoadmapDrawerOpen(true)}
          aria-label="Mở lộ trình phỏng vấn"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 rounded-l-xl border-y border-l border-slate-200 bg-white/95 py-3.5 px-2 text-indigo-600 shadow-2xl backdrop-blur-md transition-all hover:bg-white hover:px-2.5 active:scale-95 group"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
            <FontAwesomeIcon icon={faMapLocationDot} className="text-xs" />
          </div>
          <span className="[writing-mode:vertical-lr] text-[11px] font-bold tracking-widest text-slate-700 group-hover:text-indigo-600">
            Lộ trình
          </span>
          <FontAwesomeIcon icon={faChevronLeft} className="text-[9px] text-slate-400 group-hover:text-indigo-600" />
        </button>
      )}

      <div className={`flex flex-1 flex-col h-full min-h-0 w-full transition-all duration-300 ${chatOpen ? 'sm:pr-[374px] md:pr-[394px] lg:pr-[404px]' : ''} ${chatOpen && isCompactChatView ? 'pb-[58dvh]' : ''}`}>
        <div className="flex flex-1 flex-col gap-2 min-h-0 h-full p-2 overflow-hidden">
          {/* Top HUD: Question Card with live Countdown Timer */}
          {hud.currentQuestion && (
            <InterviewQuestionCard
              question={hud.currentQuestion}
              currentIndex={hud.currentIndex}
              totalQuestions={hud.totalQuestions}
              formattedTime={hud.formattedTime}
              isLowTime={hud.isLowTime}
              progressPercent={hud.progressPercent}
              hintsDrawerOpen={hud.hintsDrawerOpen}
              roadmapDrawerOpen={hud.roadmapDrawerOpen}
              onToggleHints={() => hud.setHintsDrawerOpen((prev) => !prev)}
              onToggleRoadmap={() => hud.setRoadmapDrawerOpen((prev) => !prev)}
              onNextQuestion={hud.nextQuestion}
            />
          )}

          <div className="min-h-0 flex-1 w-full">
            <div className="grid h-full min-h-0 w-full grid-cols-1 gap-2 lg:grid-cols-2">
              <AIParticipantTile
                variant="candidate"
                candidateLabel={candidateLabel}
                trackRef={candidateTrack}
                audioTrack={candidateAudioTrack}
                hasAgentTranscript={false}
                hasDetectedAgent={false}
                agentState={voiceAssistant.state}
                agentIdentity={agentIdentity}
                agentSid={agentSid}
              />
              <div data-tour="interview-agent" className="h-full min-h-0">
                <AIParticipantTile
                  variant={secondaryVariant}
                  candidateLabel={candidateLabel}
                  trackRef={secondaryTrack}
                  audioTrack={secondaryVariant === 'agent' ? agentAudioTrack : candidateAudioTrack}
                  hasAgentTranscript={hasAgentTranscript}
                  hasDetectedAgent={secondaryVariant === 'agent' && Boolean(agentParticipant)}
                  agentState={voiceAssistant.state}
                  agentIdentity={agentIdentity}
                  agentSid={agentSid}
                  avatarId={avatarId}
                  avatarImageUrl={avatarImageUrl}
                  avatarBackgroundUrl={avatarBackgroundUrl}
                  avatarBackdrop={avatarBackdrop}
                  interviewerName={interviewerName}
                  sessionStatus={isFinishingTransition ? 'completed' : undefined}
                />
              </div>
            </div>
            {isFinishingTransition && (
              <div className="pointer-events-none mt-2 flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-xl border border-sky-500/40 bg-slate-900/90 px-5 py-2.5 text-white shadow-xl backdrop-blur-md">
                  <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold">
                    Buổi phỏng vấn đã hoàn tất. Hệ thống đang tiến hành tổng hợp kết quả đánh giá...
                  </span>
                </div>
              </div>
            )}
          </div>

          {showObservingBar && (
            <div className="mx-2 mb-2 flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <FontAwesomeIcon icon={observingIcon} className={observingIcon === faSpinner ? 'animate-spin text-sky-500' : 'text-slate-400'} />
              <span className="text-xs font-medium text-slate-700">{observingMessage}</span>
              <div className="ml-auto flex items-center gap-2">
                {candidatePresent && <div className="size-2 animate-pulse rounded-full bg-emerald-500" />}
                <span className="text-[10px] font-bold tracking-widest text-emerald-600">
                  {candidatePresent ? t('liveRoom.observingBar.live') : t('liveRoom.observingBar.waiting')}
                </span>
                <span className="ml-2 font-mono text-[11px] font-medium text-slate-500">{timeFormatted}</span>
              </div>
            </div>
          )}
        </div>

        <div data-tour="interview-controls" className="relative shrink-0">
          <CustomControlBar
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
            onEndSession={async () => {
              const finalizePromise = onEndSession?.();
              room.disconnect();
              await finalizePromise;
            }}
          />
        </div>
      </div>

      {/* Floating Hướng dẫn button at bottom right replacing ChatBot */}
      <div className={`fixed bottom-5 right-5 z-30 transition-all duration-300 ${chatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ProductTourTrigger
          tourKey="interview_ai_live"
          variant="chip"
          label="Hướng dẫn"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            color: '#2563eb',
            borderColor: '#e2e8f0',
            borderRadius: '16px',
            px: 1.75,
            py: 0.9,
            fontWeight: 700,
            fontSize: '0.8125rem',
            boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            '&:hover': { bgcolor: '#f8fafc', boxShadow: '0 6px 24px rgba(37,99,235,0.15)', borderColor: '#bfdbfe' },
          }}
        />
      </div>

      {chatOpen && (
        <ChatPanel
          messages={messages}
          agentState={voiceAssistant.state}
          isCompactChatView={isCompactChatView}
          onSend={async () => {
            const text = chatDraft.trim();
            if (!text) return;
            if (composerMode === 'aiControl' && isLocalEmployer) {
              setIsControlSending(true);
              try {
                await room.localParticipant.sendText(text, {
                  topic: AI_CONTROL_TOPIC,
                  attributes: { kind: 'employer_instruction' },
                });
                setChatDraft('');
              } finally {
                setIsControlSending(false);
              }
              return;
            }

            await send(text, { topic: 'lk.chat' });
            setChatDraft('');
          }}
          chatDraft={chatDraft}
          setChatDraft={setChatDraft}
          isSending={isSending}
          composerMode={composerMode}
          setComposerMode={setComposerMode}
          canControlAI={isLocalEmployer}
          isControlSending={isControlSending}
          takeoverActive={takeoverActive}
          isTakeoverSending={isTakeoverSending}
          onTakeoverAcquire={() => {
            void sendTakeoverControl('acquire');
          }}
          onTakeoverRelease={() => {
            void sendTakeoverControl('release');
          }}
          onCloseChat={() => setChatOpen(false)}
          onEndSession={onEndSession}
        />
      )}
      <StartAudio label={t('controls.enableAudio')} />
    </div>
  );
}

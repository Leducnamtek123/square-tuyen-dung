'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  useVoiceAssistant,
  useTracks,
  useLocalParticipant,
  useChat,
  useRoomContext,
  type TrackReference,
  VideoTrack,
} from '@livekit/components-react';
import {
  AgentAudioVisualizerAura,
  AgentChatTranscript,
  AgentControlBar,
} from '@/components/Features/AgentsUi';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const MotionContainer = motion.create('div');
const MotionBottom = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
} as const;

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
} as const;

const classNames = {
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-slate-950 pointer-events-none bg-gradient-to-b to-transparent',
        top && 'bg-gradient-to-b',
        bottom && 'bg-gradient-to-t',
        className
      )}
    />
  );
}

function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface InterviewAgentViewProps {
  onDisconnect: () => void;
  sessionInfo: {
    jobName?: string;
    candidateName?: string;
  };
}

const InterviewAgentView = ({ onDisconnect, sessionInfo }: InterviewAgentViewProps) => {
  const { t } = useTranslation('interview');
  const room = useRoomContext();
  const { state: agentState, audioTrack: agentAudioTrack, videoTrack: agentVideoTrack } = useVoiceAssistant();
  const { chatMessages } = useChat({ room });
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = isTranscriptVisible ? 0 : 0.15;
  const isAvatar = agentVideoTrack !== undefined;

  // Transcript messages conversion
  const transcriptMessages = useMemo(() => {
    return chatMessages.map((msg) => ({
      id: msg.id,
      timestamp: msg.timestamp,
      from: msg.from,
      message: msg.message,
    }));
  }, [chatMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleDeviceError = useCallback((error: any) => {
    console.error('Device error in InterviewAgentView:', error);
  }, []);

  return (
    <section className="bg-slate-950 relative z-10 h-full w-full overflow-hidden text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl opacity-30" />
        <div className="absolute -bottom-32 right-[-8%] h-80 w-[36rem] rounded-full bg-indigo-500/10 blur-3xl opacity-20" />
      </div>

      {/* Chat Transcript Layer */}
      <div
        className={cn(
          'fixed inset-0 z-20 grid grid-cols-1 grid-rows-1 transition-opacity duration-300',
          !isTranscriptVisible && 'pointer-events-none opacity-0'
        )}
      >
        <Fade top className="absolute inset-x-4 top-0 h-40 z-30" />
        <div 
          ref={scrollAreaRef}
          className="overflow-y-auto px-4 pt-40 pb-[150px] md:px-6 md:pb-[200px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none"
        >
          <div className="mx-auto max-w-2xl">
             <AgentChatTranscript 
                agentState={agentState} 
                messages={transcriptMessages} 
                className="space-y-3"
              />
          </div>
        </div>
      </div>

      {/* Main Layout (Tile Layout) */}
      <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-10 md:top-12 md:bottom-40">
        <div className="relative mx-auto h-full max-w-2xl px-4 md:px-0">
          <div className={cn(classNames.grid)}>
            {/* Agent Tile */}
            <div
              className={cn([
                'grid',
                !isTranscriptVisible && classNames.agentChatClosed,
                isTranscriptVisible && hasSecondTile && classNames.agentChatOpenWithSecondTile,
                isTranscriptVisible && !hasSecondTile && classNames.agentChatOpenWithoutSecondTile,
              ])}
            >
              <AnimatePresence mode="popLayout">
                {!isAvatar && (
                  <MotionContainer
                    key="agent-audio"
                    layoutId="agent"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: isTranscriptVisible ? 1 : 4.5, // Scaled up when transcript hidden
                    }}
                    transition={{
                      ...ANIMATION_TRANSITION,
                      delay: animationDelay,
                    }}
                    className={cn(
                      'aspect-square h-[90px] w-[90px] rounded-md transition-all duration-300 flex items-center justify-center',
                      isTranscriptVisible && 'bg-white/[0.03] border border-white/10 shadow-lg'
                    )}
                  >
                    <AgentAudioVisualizerAura
                      state={agentState}
                      audioTrack={agentAudioTrack}
                      size="md"
                      className="w-full h-full"
                    />
                  </MotionContainer>
                )}

                {isAvatar && agentVideoTrack && (
                  <MotionContainer
                    key="agent-video"
                    layoutId="avatar"
                    initial={{
                      scale: 1,
                      opacity: 0,
                      filter: 'blur(20px)',
                    }}
                    animate={{
                       opacity: 1,
                       filter: 'blur(0px)',
                       borderRadius: isTranscriptVisible ? 8 : 24,
                    }}
                    transition={{
                      ...ANIMATION_TRANSITION,
                      delay: animationDelay,
                      filter: { duration: 1 },
                    }}
                    className={cn(
                      'overflow-hidden bg-black shadow-2xl',
                      isTranscriptVisible ? 'h-[90px] w-[90px]' : 'h-full w-full'
                    )}
                  >
                    <VideoTrack
                      trackRef={agentVideoTrack}
                      className={cn(isTranscriptVisible && 'size-[90px] object-cover')}
                    />
                  </MotionContainer>
                )}
              </AnimatePresence>
            </div>

            {/* Second Tile (Camera / Screen Share) */}
            <div
              className={cn([
                'grid',
                isTranscriptVisible && classNames.secondTileChatOpen,
                !isTranscriptVisible && classNames.secondTileChatClosed,
              ])}
            >
              <AnimatePresence>
                {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
                  <MotionContainer
                    key="local-video"
                    layout="position"
                    layoutId="camera"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      ...ANIMATION_TRANSITION,
                      delay: animationDelay,
                    }}
                    className="shadow-xl"
                  >
                    <VideoTrack
                      trackRef={cameraTrack || screenShareTrack!}
                      className="bg-slate-900 aspect-square w-[90px] rounded-md object-cover border border-white/10"
                    />
                  </MotionContainer>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar Area */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        <div className="relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            variant="livekit"
            controls={{
              microphone: true,
              camera: true,
              chat: true,
              screenShare: true,
              leave: true,
            }}
            isConnected={true}
            isChatOpen={isTranscriptVisible}
            onIsChatOpenChange={setIsTranscriptVisible}
            onDisconnect={onDisconnect}
            onDeviceError={handleDeviceError}
            className="shadow-2xl border-white/10 bg-black/40 backdrop-blur-3xl"
          />
        </div>
      </MotionBottom>
    </section>
  );
};

export default InterviewAgentView;

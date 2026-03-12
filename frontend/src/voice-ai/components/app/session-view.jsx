import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import { ChatTranscript } from '@/voice-ai/components/app/chat-transcript';
import { PreConnectMessage } from '@/voice-ai/components/app/preconnect-message';
import { TileLayout } from '@/voice-ai/components/app/tile-layout';
import { AgentControlBar } from '@/voice-ai/components/livekit/agent-control-bar/agent-control-bar';
import { cn } from '@/voice-ai/lib/utils';

const MotionBottom = motion.create('div');

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
};

export function Fade({ top = false, bottom = false, className }) {
  return (
    <div
      className={cn(
        'from-slate-950/90 pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

export function SessionView({ appConfig, ...props }) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const MAX_MESSAGES = 300;
  const visibleMessages = useMemo(
    () => (messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages),
    [messages]
  );
  const lastMessageIsLocal =
    visibleMessages.at(-1)?.from?.isLocal === true && chatOpen === true;

  const controls = useMemo(
    () => ({
      leave: true,
      microphone: true,
      chat: appConfig.supportsChatInput,
      camera: appConfig.supportsVideoInput,
      screenShare: appConfig.supportsVideoInput,
    }),
    [appConfig.supportsChatInput, appConfig.supportsVideoInput]
  );

  return (
    <section className="relative z-10 h-full w-full overflow-hidden bg-slate-950" {...props}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-[-10%] h-96 w-[36rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]" />
      </div>

      {chatOpen && (
        <div className="fixed inset-0 z-20 grid grid-cols-1 grid-rows-1">
          <Fade top className="absolute inset-x-4 top-0 h-40" />
          <ChatTranscript
            messages={visibleMessages}
            followOutput={lastMessageIsLocal ? 'smooth' : false}
            listClassName="mx-auto max-w-3xl space-y-3"
          />
        </div>
      )}

      <TileLayout chatOpen={chatOpen} />

      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-4 bottom-0 z-40 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && !chatOpen && (
          <PreConnectMessage messages={visibleMessages} className="pb-4" />
        )}
        <div className="relative mx-auto max-w-3xl pb-3 md:pb-10">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            controls={controls}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onChatOpenChange={setChatOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
}

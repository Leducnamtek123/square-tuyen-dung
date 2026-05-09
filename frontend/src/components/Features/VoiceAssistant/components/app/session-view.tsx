'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { ChatEntry, useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/components/Features/VoiceAssistant/app-config';
import { PreConnectMessage } from '@/components/Features/VoiceAssistant/components/app/preconnect-message';
import { TileLayout } from '@/components/Features/VoiceAssistant/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/Features/VoiceAssistant/components/livekit/agent-control-bar/agent-control-bar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';
import type { Transition } from 'motion/react';

const MotionBottom = m.div;

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
    ease: 'easeOut' as Transition['ease'],
  },
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
        'from-background via-background/60 pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
  onDisconnect?: () => void;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative z-10 h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_42%)]" {...props}>
        {/* Chat Transcript */}
        <div
          className={cn(
            'absolute top-0 bottom-[135px] flex w-full flex-col md:bottom-[170px]',
            !chatOpen && 'pointer-events-none'
          )}
        >
          <Fade top className="absolute inset-x-0 top-0 h-40" />
          <ScrollArea
            ref={scrollAreaRef}
            className="mx-auto w-full max-w-3xl px-4 pt-40 pb-[150px] md:px-6 md:pb-[200px]"
          >
            {chatOpen && (
              <ul className="lk-list space-y-3 rounded-[28px] border border-white/8 bg-zinc-950/30 p-4 backdrop-blur-xl transition-opacity duration-300 ease-out md:p-6">
                {messages.map((entry) => (
                  <ChatEntry key={entry.id} entry={entry as any} />
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        {/* Tile Layout */}
        <TileLayout chatOpen={chatOpen} />

        {/* Bottom */}
        <MotionBottom
          {...BOTTOM_VIEW_MOTION_PROPS}
          className="absolute inset-x-3 bottom-0 z-50 md:inset-x-12"
        >
          {appConfig.isPreConnectBufferEnabled && (
            <PreConnectMessage messages={messages} className="pb-4" />
          )}
          <div className="relative mx-auto max-w-3xl pb-3 md:pb-12">
            <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
            <AgentControlBar
              controls={controls}
              isConnected={session.isConnected}
              onDisconnect={() => {
                session.end();
                if (props.onDisconnect) props.onDisconnect();
              }}
              onChatOpenChange={setChatOpen}
            />
          </div>
        </MotionBottom>
      </section>
    </LazyMotion>
  );
};

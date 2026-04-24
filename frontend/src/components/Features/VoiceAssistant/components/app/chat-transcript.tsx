'use client';

import { AnimatePresence, LazyMotion, domAnimation, m, type HTMLMotionProps } from 'motion/react';
import { type ReceivedMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/Features/VoiceAssistant/components/livekit/chat-entry';

const MotionContainer = m.div;
const MotionChatEntry = m.create(ChatEntry);
const EMPTY_MESSAGES: ReceivedMessage[] = [];

const CONTAINER_MOTION_PROPS: HTMLMotionProps<"div"> = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        ease: 'easeOut',
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS: HTMLMotionProps<"li"> = {
  variants: {
    hidden: {
      opacity: 0,
      translateY: 10,
    },
    visible: {
      opacity: 1,
      translateY: 0,
    },
  },
};

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedMessage[];
}

export function ChatTranscript({
  hidden = false,
  messages = EMPTY_MESSAGES,
  ...props
}: ChatTranscriptProps & Omit<HTMLMotionProps<'div'>, 'ref'>) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {!hidden && (
          <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
            {messages.map((receivedMessage) => {
              const { id, timestamp, from, message } = receivedMessage;
              const locale = navigator?.language ?? 'en-US';
              const messageOrigin = from?.isLocal ? 'local' : 'remote';
              const hasBeenEdited =
                receivedMessage.type === 'chatMessage' && !!receivedMessage.editTimestamp;

              return (
                <MotionChatEntry
                  key={id}
                  locale={locale}
                  timestamp={timestamp}
                  message={message}
                  messageOrigin={messageOrigin}
                  hasBeenEdited={hasBeenEdited}
                  {...MESSAGE_MOTION_PROPS}
                />
              );
            })}
          </MotionContainer>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import { ChatEntry } from '@/voice-ai/components/livekit/chat-entry';
import { cn } from '@/voice-ai/lib/utils';

const MotionContainer = motion.create('div');

const CONTAINER_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: 0,
    },
    hidden: {
      opacity: 0,
      translateY: 6,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.4,
    ease: 'easeOut',
  },
};

export function ChatTranscript({ hidden = false, messages = [], className, ...props }) {
  const entries = messages.map((message) => {
    const locale = message?.from?.isLocal ? 'you' : 'assistant';

    return (
      <ChatEntry
        key={message?.id}
        locale={locale}
        message={message?.message ?? ''}
        timestamp={message?.timestamp ?? Date.now()}
        name={message?.from?.name ?? undefined}
        className={cn(hidden && 'opacity-0 pointer-events-none')}
      />
    );
  });

  return (
    <AnimatePresence>
      {messages.length > 0 && (
        <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
          <ul className={cn('flex flex-col gap-4', className)}>{entries}</ul>
        </MotionContainer>
      )}
    </AnimatePresence>
  );
}

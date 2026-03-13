import React from 'react';
import { motion } from 'motion/react';
import { Virtuoso } from 'react-virtuoso';
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

const Scroller = React.forwardRef(function Scroller({ className, itemKey, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('overflow-y-auto px-4 pt-36 pb-[180px] md:px-6 md:pb-[220px]', className)}
      {...props}
    />
  );
});

const List = React.forwardRef(function List({ className, itemKey, ...props }, ref) {
  return <ul ref={ref} className={cn('flex flex-col gap-4', className)} {...props} />;
});

export const ChatTranscript = React.memo(function ChatTranscript({
  messages = [],
  listClassName,
  followOutput,
  ...props
}) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
      <Virtuoso
        data={messages}
        itemContent={(index, message) => {
          const locale = message?.from?.isLocal ? 'you' : 'assistant';
          return (
            <ChatEntry
              key={message?.id}
              locale={locale}
              message={message?.message ?? ''}
              timestamp={message?.timestamp ?? Date.now()}
              name={message?.from?.name ?? undefined}
            />
          );
        }}
        itemKey={(index) => messages[index]?.id ?? index}
        followOutput={followOutput}
        components={{
          Scroller,
          List: React.forwardRef(function ChatList(listProps, ref) {
            return <List ref={ref} {...listProps} className={cn(listProps.className, listClassName)} />;
          }),
        }}
      />
    </MotionContainer>
  );
});

import { AnimatePresence, motion } from 'motion/react';
import { ShimmerText } from '@/voice-ai/components/livekit/shimmer-text';
import { cn } from '@/voice-ai/lib/utils';

const MotionMessage = motion.create('div');

const MESSAGE_MOTION_PROPS = {
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

export function PreConnectMessage({ className, messages = [] }) {
  const message = messages.at(-1);
  const preconnectMessage =
    message?.from?.isAgent === true && message?.message ? message?.message : undefined;

  return (
    <AnimatePresence>
      {preconnectMessage && (
        <MotionMessage {...MESSAGE_MOTION_PROPS} className={cn('text-center', className)}>
          <ShimmerText className="text-sm font-semibold">{preconnectMessage}</ShimmerText>
        </MotionMessage>
      )}
    </AnimatePresence>
  );
}

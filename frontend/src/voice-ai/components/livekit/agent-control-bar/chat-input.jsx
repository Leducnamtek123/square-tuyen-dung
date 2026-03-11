import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PaperPlaneRightIcon, SpinnerIcon } from '@phosphor-icons/react';
import { Button } from '@/voice-ai/components/livekit/button';
import { cn } from '@/voice-ai/lib/utils';

const MotionContainer = motion.create('div');

const CHAT_MOTION_PROPS = {
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

export function ChatInput({ chatOpen, isAgentAvailable = true, onSend }) {
  const { t } = useTranslation('interview');
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (chatOpen && inputRef.current) inputRef.current.focus();
  }, [chatOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !onSend) return;
    setIsSending(true);
    await onSend(message);
    setMessage('');
    setIsSending(false);
  };

  return (
    <MotionContainer {...CHAT_MOTION_PROPS} className="mb-2">
      <form className="flex w-full gap-2" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={cn(
            'border-input bg-background text-foreground flex h-10 w-full rounded-full border px-4 text-xs',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          type="text"
          placeholder={t('voiceAi.chat.placeholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isAgentAvailable || isSending}
          inert={(!isAgentAvailable || isSending) ? 'true' : undefined}
        />
        <Button
          type="submit"
          variant="primary"
          size="icon"
          disabled={!isAgentAvailable || !message.trim() || isSending}
          title={isSending ? t('voiceAi.chat.sending') : t('voiceAi.chat.send')}
        >
          {isSending ? (
            <SpinnerIcon className="animate-spin" weight="bold" />
          ) : (
            <PaperPlaneRightIcon weight="bold" />
          )}
        </Button>
      </form>
    </MotionContainer>
  );
}

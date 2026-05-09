'use client';

import { useEffect, useRef, useState } from 'react';
import { LazyMotion, m, domAnimation } from 'motion/react';
import { PaperPlaneRightIcon, SpinnerIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/Features/VoiceAssistant/components/livekit/button';
import { cn } from '@/lib/utils';

const MOTION_PROPS = {
  variants: {
    hidden: {
      height: 0,
      opacity: 0,
      marginBottom: 0,
    },
    visible: {
      height: 'auto',
      opacity: 1,
      marginBottom: 12,
    },
  },
  initial: 'hidden',
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
} as const;

interface ChatInputProps {
  chatOpen: boolean;
  isAgentAvailable?: boolean;
  onSend?: (message: string) => void;
}

export function ChatInput({
  chatOpen,
  isAgentAvailable = false,
  onSend = async () => {},
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSending(true);
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const isDisabled = isSending || !isAgentAvailable || message.trim().length === 0;

  useEffect(() => {
    if (chatOpen && isAgentAvailable) return;
    // when not disabled refocus on input
    inputRef.current?.focus();
  }, [chatOpen, isAgentAvailable]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        inert={!chatOpen}
        {...MOTION_PROPS}
        animate={chatOpen ? 'visible' : 'hidden'}
        className="border-input/40 flex w-full items-start overflow-hidden border-b"
      >
        <form
          onSubmit={handleSubmit}
          className="mb-3 flex grow items-end gap-2 rounded-[24px] border border-white/8 bg-zinc-950/50 p-2 text-sm shadow-inner shadow-black/20"
        >
          <input
            ref={inputRef}
            type="text"
            value={message}
            disabled={!chatOpen}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            className={cn(
              'h-11 flex-1 bg-transparent px-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          <Button
            size="icon"
            type="submit"
            disabled={isDisabled}
            variant={isDisabled ? 'secondary' : 'primary'}
            title={isSending ? 'Sending...' : 'Send'}
            className="self-start rounded-[18px]"
          >
            {isSending ? (
              <SpinnerIcon className="animate-spin" weight="bold" />
            ) : (
              <PaperPlaneRightIcon weight="bold" />
            )}
          </Button>
        </form>
      </m.div>
    </LazyMotion>
  );
}

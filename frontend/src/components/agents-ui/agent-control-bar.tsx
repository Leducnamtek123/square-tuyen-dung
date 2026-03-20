'use client';;
import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { useChat } from '@livekit/components-react';
import { Track } from 'livekit-client';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { motion, type HTMLMotionProps } from 'motion/react';

import { cn } from '@/lib/utils';
import { AgentDisconnectButton } from '@/components/agents-ui/agent-disconnect-button';
import { AgentTrackControl } from '@/components/agents-ui/agent-track-control';
import {
  AgentTrackToggle,
  agentTrackToggleVariants,
} from '@/components/agents-ui/agent-track-toggle';
import { Button } from '@/ui/button';
import { useInputControls, usePublishPermissions } from '@/hooks/agents-ui/use-agent-control-bar';

type AgentControlBarProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'outline' | 'livekit' | string;
  controls?: Partial<{
    microphone: boolean;
    camera: boolean;
    screenShare: boolean;
    chat: boolean;
    leave: boolean;
  }>;
  isChatOpen?: boolean;
  isConnected?: boolean;
  saveUserChoices?: boolean;
  onDisconnect?: () => void;
  onDeviceError?: (error: unknown) => void;
  onIsChatOpenChange?: (open: boolean) => void;
};

const resolveButtonVariant = (variant: string | undefined) => {
  switch (variant) {
    case 'outline':
      return 'outline';
    case 'ghost':
      return 'ghost';
    case 'destructive':
      return 'destructive';
    default:
      return 'default';
  }
};

const LK_TOGGLE_VARIANT_1 = [
  'data-[state=off]:bg-accent data-[state=off]:hover:bg-foreground/10',
  'data-[state=off]:[&_~_button]:bg-accent data-[state=off]:[&_~_button]:hover:bg-foreground/10',
  'data-[state=off]:border-border data-[state=off]:hover:border-foreground/12',
  'data-[state=off]:[&_~_button]:border-border data-[state=off]:[&_~_button]:hover:border-foreground/12',
  'data-[state=off]:text-destructive data-[state=off]:hover:text-destructive data-[state=off]:focus:text-destructive',
  'data-[state=off]:focus-visible:ring-foreground/12 data-[state=off]:focus-visible:border-ring',
  'dark:data-[state=off]:[&_~_button]:bg-accent dark:data-[state=off]:[&_~_button]:hover:bg-foreground/10',
];

const LK_TOGGLE_VARIANT_2 = [
  'data-[state=off]:bg-accent data-[state=off]:hover:bg-foreground/10',
  'data-[state=off]:border-border data-[state=off]:hover:border-foreground/12',
  'data-[state=off]:focus-visible:border-ring data-[state=off]:focus-visible:ring-foreground/12',
  'data-[state=off]:text-foreground data-[state=off]:hover:text-foreground data-[state=off]:focus:text-foreground',
  'data-[state=on]:bg-blue-500/20 data-[state=on]:hover:bg-blue-500/30',
  'data-[state=on]:border-blue-700/10 data-[state=on]:text-blue-700 data-[state=on]:ring-blue-700/30',
  'data-[state=on]:focus-visible:border-blue-700/50',
  'dark:data-[state=on]:bg-blue-500/20 dark:data-[state=on]:text-blue-300',
];

const MOTION_PROPS: HTMLMotionProps<'div'> = {
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
    ease: [0.16, 1, 0.3, 1],
  },
};

type AgentChatInputProps = {
  chatOpen: boolean;
  onSend?: (message: string) => Promise<void> | void;
  className?: string;
};

function AgentChatInput({
  chatOpen,
  onSend = async () => {},
  className
}: AgentChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const isDisabled = isSending || message.trim().length === 0;

  const handleSend = async () => {
    if (isDisabled) {
      return;
    }

    try {
      setIsSending(true);
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleButtonClick = async () => {
    if (isDisabled) return;
    await handleSend();
  };

  useEffect(() => {
    if (chatOpen) return;
    // when not disabled refocus on input
    inputRef.current?.focus();
  }, [chatOpen]);

  return (
    <div
      className={cn('mb-3 flex grow items-end gap-2 rounded-md pl-1 text-sm', className)}>
      <textarea
        autoFocus
        ref={inputRef}
        value={message}
        disabled={!chatOpen || isSending}
        placeholder="Type something..."
        onKeyDown={handleKeyDown}
        onChange={(e) => setMessage(e.target.value)}
        className="field-sizing-content max-h-16 min-h-8 flex-1 resize-none py-2 [scrollbar-width:thin] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" />
      <Button
        size="icon"
        disabled={isDisabled}
        variant={resolveButtonVariant(isDisabled ? 'outline' : 'default')}
        title={isSending ? 'Sending...' : 'Send'}
        onClick={handleButtonClick}
        className="self-end disabled:cursor-not-allowed">
        {isSending ? (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <SendIcon fontSize="small" />
        )}
      </Button>
    </div>
  );
}

/**
 * A control bar specifically designed for voice assistant interfaces. Provides controls for
 * microphone, camera, screen share, chat, and disconnect. Includes an expandable chat input for
 * text-based interaction with the agent.
 *
 * @example
 *
 * ```tsx
 * <AgentControlBar
 *   variant="livekit"
 *   isConnected={true}
 *   onDisconnect={() => handleDisconnect()}
 *   controls={{
 *     microphone: true,
 *     camera: true,
 *     screenShare: false,
 *     chat: true,
 *     leave: true,
 *   }}
 * />;
 * ```
 *
 * @extends ComponentProps<'div'>
 */
export function AgentControlBar({
  variant = 'default',
  controls,
  isChatOpen = false,
  isConnected = false,
  saveUserChoices = true,
  onDisconnect,
  onDeviceError,
  onIsChatOpenChange,
  className,
  ...props
}: AgentControlBarProps) {
  const { send } = useChat();
  const publishPermissions = usePublishPermissions();
  const [isChatOpenUncontrolled, setIsChatOpenUncontrolled] = useState(isChatOpen);
  const {
    microphoneTrack,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  } = useInputControls({ onDeviceError, saveUserChoices });

  const handleSendMessage = async (message: string) => {
    await send(message);
  };

  const visibleControls = {
    leave: controls?.leave ?? true,
    microphone: controls?.microphone ?? publishPermissions.microphone,
    screenShare: controls?.screenShare ?? publishPermissions.screenShare,
    camera: controls?.camera ?? publishPermissions.camera,
    chat: controls?.chat ?? publishPermissions.data,
  };

  const isEmpty = Object.values(visibleControls).every((value) => !value);

  if (isEmpty) {
    console.warn('AgentControlBar: `visibleControls` contains only false values.');
    return null;
  }

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'bg-background border-input/50 dark:border-muted flex flex-col border p-3 drop-shadow-md/3',
        variant === 'livekit' ? 'rounded-[31px]' : 'rounded-lg',
        className
      )}
      {...props}>
      <motion.div
        {...MOTION_PROPS}
        {...({ inert: !(isChatOpen || isChatOpenUncontrolled) ? '' : undefined } as any)}
        animate={isChatOpen || isChatOpenUncontrolled ? 'visible' : 'hidden'}
        className="border-input/50 flex w-full items-start overflow-hidden border-b">
        <AgentChatInput
          chatOpen={isChatOpen || isChatOpenUncontrolled}
          onSend={handleSendMessage}
          className={cn(variant === 'livekit' && '[&_button]:rounded-full')} />
      </motion.div>
      <div className="flex gap-1">
        <div className="flex grow gap-1">
          {/* Toggle Microphone */}
          {visibleControls.microphone && (
            <AgentTrackControl
              variant={variant === 'outline' ? 'outline' : 'default'}
              kind="audioinput"
              aria-label="Toggle microphone"
              source={Track.Source.Microphone}
              pressed={microphoneToggle.enabled}
              disabled={microphoneToggle.pending}
              audioTrack={microphoneTrack}
              onPressedChange={microphoneToggle.toggle}
              onActiveDeviceChange={handleAudioDeviceChange}
              onMediaDeviceError={handleMicrophoneDeviceSelectError}
              className={cn(variant === 'livekit' && [
                LK_TOGGLE_VARIANT_1,
                'rounded-full [&_button:first-child]:rounded-l-full [&_button:last-child]:rounded-r-full',
              ])} />
          )}

          {/* Toggle Camera */}
          {visibleControls.camera && (
            <AgentTrackControl
              variant={variant === 'outline' ? 'outline' : 'default'}
              kind="videoinput"
              aria-label="Toggle camera"
              source={Track.Source.Camera}
              pressed={cameraToggle.enabled}
              pending={cameraToggle.pending}
              disabled={cameraToggle.pending}
              onPressedChange={cameraToggle.toggle}
              onMediaDeviceError={handleCameraDeviceSelectError}
              onActiveDeviceChange={handleVideoDeviceChange}
              className={cn(variant === 'livekit' && [
                LK_TOGGLE_VARIANT_1,
                'rounded-full [&_button:first-child]:rounded-l-full [&_button:last-child]:rounded-r-full',
              ])} />
          )}

          {/* Toggle Screen Share */}
          {visibleControls.screenShare && (
            <AgentTrackToggle
              variant={variant === 'outline' ? 'outline' : 'default'}
              aria-label="Toggle screen share"
              source={Track.Source.ScreenShare}
              pressed={screenShareToggle.enabled}
              disabled={screenShareToggle.pending}
              onPressedChange={screenShareToggle.toggle}
              className={cn(variant === 'livekit' && [LK_TOGGLE_VARIANT_2, 'rounded-full'])} />
          )}

          {/* Toggle Transcript */}
          {visibleControls.chat && (
            <button
              type="button"
              aria-pressed={isChatOpen || isChatOpenUncontrolled}
              aria-label="Toggle transcript"
              onClick={() => {
                const nextState = !(isChatOpen || isChatOpenUncontrolled);
                if (!onIsChatOpenChange) setIsChatOpenUncontrolled(nextState);
                else onIsChatOpenChange(nextState);
              }}
              data-state={(isChatOpen || isChatOpenUncontrolled) ? 'on' : 'off'}
              className={agentTrackToggleVariants({
                variant: variant === 'outline' ? 'outline' : 'default',
                className: cn(variant === 'livekit' && [LK_TOGGLE_VARIANT_2, 'rounded-full']),
              })}>
              <ChatBubbleOutlineIcon />
            </button>
          )}
        </div>

        {/* Disconnect */}
        {visibleControls.leave && (
          <AgentDisconnectButton
            onClick={onDisconnect}
            disabled={!isConnected}
            className={cn(variant === 'livekit' &&
              'bg-destructive/10 dark:bg-destructive/10 text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/20 focus:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/4 rounded-full font-mono text-xs font-bold tracking-wider')}>
            <span className="hidden md:inline">END CALL</span>
            <span className="inline md:hidden">END</span>
          </AgentDisconnectButton>
        )}
      </div>
    </div>
  );
}

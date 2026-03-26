'use client';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/Features/AiElements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/Features/AiElements/message';
import { AgentChatIndicator } from '@/components/Features/AgentsUi/agent-chat-indicator';
import { AnimatePresence } from 'motion/react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type AgentChatMessage = {
  id: string | number;
  timestamp: number | string | Date;
  from?: { isLocal?: boolean };
  message?: ReactNode;
};

type AgentChatTranscriptProps = {
  agentState?: 'thinking' | 'idle' | string;
  messages?: AgentChatMessage[];
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

/**
 * A chat transcript component that displays a conversation between the user and agent.
 * Shows messages with timestamps and origin indicators, plus a thinking indicator
 * when the agent is processing.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentChatTranscript
 *   agentState={agentState}
 *   messages={chatMessages}
 * />
 * ```
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent>
        {messages.map((receivedMessage) => {
          const { id, timestamp, from, message } = receivedMessage;
          const locale = navigator?.language ?? 'en-US';
          const messageOrigin = from?.isLocal ? 'user' : 'assistant';
          const time = new Date(timestamp);
          const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

          return (
            <Message key={id} title={title} from={messageOrigin}>
              <MessageContent>
                <MessageResponse>{message}</MessageResponse>
              </MessageContent>
            </Message>
          );
        })}
        <AnimatePresence>
          {agentState === 'thinking' && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}

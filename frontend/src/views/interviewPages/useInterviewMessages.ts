import React from 'react';
import { useChat, useParticipants, useRoomContext, useTranscriptions } from '@livekit/components-react';
import type {
  ReceivedAgentTranscriptionMessage,
  ReceivedChatMessage,
  ReceivedMessage,
  ReceivedUserTranscriptionMessage,
  TextStreamData,
} from '@livekit/components-core';
import type { SendTextOptions } from 'livekit-client';
import { isLiveKitAgentIdentity, isLiveKitAgentParticipant } from './livekitParticipant';

type InterviewMessagesResult = {
  messages: ReceivedMessage[];
  send: (message: string, options?: SendTextOptions) => Promise<ReceivedChatMessage>;
  isSending: boolean;
};

const CHAT_OPTIONS = { channelTopic: 'lk.chat' };
const MAX_TIMELINE_MESSAGES = 80;

function messageKey(message: ReceivedMessage): string {
  return `${message.type}-${message.id}`;
}

export function mapTranscriptions(
  transcriptions: TextStreamData[],
  localIdentity: string,
  participants: ReturnType<typeof useParticipants>,
): Array<ReceivedUserTranscriptionMessage | ReceivedAgentTranscriptionMessage> {
  const agentParticipant = participants.find((participant) => isLiveKitAgentParticipant(participant));

  return transcriptions.map((transcription) => {
    const participantInfo = transcription.participantInfo;
    const participant = participants.find((p) => p.identity === participantInfo.identity);
    const identity = participantInfo.identity ?? '';
    const isLocal = identity === localIdentity;
    const isAgent =
      isLiveKitAgentParticipant(participant) ||
      isLiveKitAgentIdentity(identity) ||
      Boolean(agentParticipant && agentParticipant.identity === identity);

    if (isLocal) {
      return {
        type: 'userTranscript',
        message: transcription.text,
        id: transcription.streamInfo.id,
        timestamp: transcription.streamInfo.timestamp,
        from: participant,
      };
    }

    if (isAgent) {
      return {
        type: 'agentTranscript',
        message: transcription.text,
        id: transcription.streamInfo.id,
        timestamp: transcription.streamInfo.timestamp,
        from: agentParticipant ?? participant,
      };
    }

    return {
      type: 'userTranscript',
      message: transcription.text,
      id: transcription.streamInfo.id,
      timestamp: transcription.streamInfo.timestamp,
      from: participant,
    };
  });
}

export function useInterviewMessages(): InterviewMessagesResult {
  const room = useRoomContext();
  const participants = useParticipants();
  const transcriptions = useTranscriptions({ room });
  const chatOptions = React.useMemo(() => ({ room, ...CHAT_OPTIONS }), [room]);
  const chat = useChat(chatOptions);

  const transcriptionMessages = React.useMemo(() => {
    return mapTranscriptions(transcriptions, room.localParticipant.identity, participants);
  }, [participants, room.localParticipant.identity, transcriptions]);

  const receivedMessages = React.useMemo<ReceivedMessage[]>(() => {
    const byId = new Map<string, ReceivedMessage>();
    for (const message of [...transcriptionMessages, ...chat.chatMessages]) {
      byId.set(messageKey(message), message);
    }
    return Array.from(byId.values()).slice(-MAX_TIMELINE_MESSAGES);
  }, [chat.chatMessages, transcriptionMessages]);

  const messageFirstReceivedTimeMapRef = React.useRef(new Map<string, Date>());
  const sortedReceivedMessages = React.useMemo(() => {
    const now = new Date();
    for (const message of receivedMessages) {
      const key = messageKey(message);
      if (messageFirstReceivedTimeMapRef.current.has(key)) {
        continue;
      }

      messageFirstReceivedTimeMapRef.current.set(key, now);
    }
    const activeKeys = new Set(receivedMessages.map(messageKey));
    for (const key of messageFirstReceivedTimeMapRef.current.keys()) {
      if (!activeKeys.has(key)) {
        messageFirstReceivedTimeMapRef.current.delete(key);
      }
    }

    return receivedMessages.toSorted((a, b) => {
      const aFirstReceivedAt = messageFirstReceivedTimeMapRef.current.get(messageKey(a));
      const bFirstReceivedAt = messageFirstReceivedTimeMapRef.current.get(messageKey(b));
      if (typeof aFirstReceivedAt === 'undefined' || typeof bFirstReceivedAt === 'undefined') {
        return 0;
      }

      return aFirstReceivedAt.getTime() - bFirstReceivedAt.getTime();
    });
  }, [receivedMessages]);

  return React.useMemo(
    () => ({
      messages: sortedReceivedMessages,
      send: chat.send,
      isSending: chat.isSending,
    }),
    [chat.isSending, chat.send, sortedReceivedMessages],
  );
}

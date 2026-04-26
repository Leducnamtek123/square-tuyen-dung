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

function mapTranscriptions(
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

    return {
      type: 'agentTranscript',
      message: transcription.text,
      id: transcription.streamInfo.id,
      timestamp: transcription.streamInfo.timestamp,
      from: isAgent ? agentParticipant : participant,
    };
  });
}

export function useInterviewMessages(): InterviewMessagesResult {
  const room = useRoomContext();
  const participants = useParticipants();
  const transcriptions = useTranscriptions({ room });
  const chat = useChat({ room, ...CHAT_OPTIONS });

  const transcriptionMessages = React.useMemo(() => {
    return mapTranscriptions(transcriptions, room.localParticipant.identity, participants);
  }, [participants, room.localParticipant.identity, transcriptions]);

  const receivedMessages = React.useMemo<ReceivedMessage[]>(() => {
    return [...transcriptionMessages, ...chat.chatMessages];
  }, [chat.chatMessages, transcriptionMessages]);

  const messageFirstReceivedTimeMapRef = React.useRef(new Map<ReceivedMessage['id'], Date>());
  const sortedReceivedMessages = React.useMemo(() => {
    const now = new Date();
    for (const message of receivedMessages) {
      if (messageFirstReceivedTimeMapRef.current.has(message.id)) {
        continue;
      }

      messageFirstReceivedTimeMapRef.current.set(message.id, now);
    }

    return [...receivedMessages].sort((a, b) => {
      const aFirstReceivedAt = messageFirstReceivedTimeMapRef.current.get(a.id);
      const bFirstReceivedAt = messageFirstReceivedTimeMapRef.current.get(b.id);
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

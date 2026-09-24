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
import { isLiveKitAgentIdentity, isLiveKitAgentParticipant, getParticipantRole } from './livekitParticipant';

type InterviewMessagesResult = {
  messages: ReceivedMessage[];
  send: (message: string, options?: SendTextOptions) => Promise<ReceivedChatMessage>;
  isSending: boolean;
};

const CHAT_OPTIONS = { channelTopic: 'lk.chat' };
const AVATAR_EVENT_TOPIC = 'interview_avatar_event';
const MAX_TIMELINE_MESSAGES = 80;

const STT_HALLUCINATION_PATTERNS = [
  /ghi[eề]n\s*m[iì]\s*g[oõ]/i,
  /subscribe/i,
  /subcribe/i,
  /[đd][aă]ng\s*k[yý]\s*k[eê]nh/i,
  /like\s*v[aà]\s*share/i,
  /like\s*v[aà]\s*sub/i,
  /c[aả]m\s*ơ\s*n\s*c[aá]c\s*b[aạ]n\s*[đd][aã]\s*(theo\s*d[oõ]i|xem)/i,
  /h[eẹ]n\s*g[aặ]p\s*l[aạ]i\s*c[aá]c\s*b[aạ]n/i,
  /ch[uú]c\s*c[aá]c\s*b[aạ]n\s*m[oộ]t\s*ng[aà]y/i,
  /b[aấ]m\s*chu[oô]ng\s*th[oô]ng\s*b[aá]o/i,
  /chia\s*s[eẻ]\s*video/i,
  /video\s*h[aấ]p\s*d[aẫ]n/i,
  /kh[oô]ng\s*b[oỏ]\s*l[oỡ]/i,
  /nh[uữ]ng\s*video\s*ti[eế]p\s*theo/i,
];

export function isSttHallucination(text?: string | null): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().trim();
  return STT_HALLUCINATION_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isAgentMessage(msg: ReceivedMessage): boolean {
  if (msg.type === 'agentTranscript') return true;
  if (isLiveKitAgentIdentity(msg.from?.identity)) return true;
  if (isLiveKitAgentParticipant(msg.from)) return true;
  if (getParticipantRole(msg.from as any) === 'agent') return true;
  return false;
}

export function normalizeMessageText(text?: string | null): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?:;]+/g, '')
    .replace(/\s+/g, ' ');
}

function messageKey(message: ReceivedMessage): string {
  return `${message.type}-${message.id}`;
}

export function mapTranscriptions(
  transcriptions: TextStreamData[],
  localIdentity: string,
  participants: ReturnType<typeof useParticipants>,
): Array<ReceivedUserTranscriptionMessage | ReceivedAgentTranscriptionMessage> {
  const agentParticipant = participants.find((participant) => isLiveKitAgentParticipant(participant));

  return transcriptions
    .filter((transcription) => !isSttHallucination(transcription.text))
    .map((transcription) => {
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
  const [avatarMessages, setAvatarMessages] = React.useState<ReceivedMessage[]>([]);

  // Lắng nghe sự kiện avatar lipsync từ LiveKit Room để đồng bộ câu nói của AI vào khung chat
  React.useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant?: any, _kind?: any, topic?: string) => {
      if (topic !== AVATAR_EVENT_TOPIC) return;
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (data?.type === 'lipsync_video' && data?.text) {
          const msgText = String(data.text).trim();
          if (msgText && !isSttHallucination(msgText)) {
            const agentParticipant =
              participants.find((p) => isLiveKitAgentParticipant(p)) ?? participant;
            const norm = normalizeMessageText(msgText);
            setAvatarMessages((prev) => {
              const isDuplicate = prev.some(
                (m) => normalizeMessageText(m.message) === norm,
              );
              if (isDuplicate) return prev;
              const newMsg: ReceivedMessage = {
                type: 'agentTranscript',
                id: `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                message: msgText,
                timestamp: Date.now(),
                from: agentParticipant,
              };
              return [...prev.slice(-30), newMsg];
            });
          }
        }
      } catch (err) {
        console.warn('[useInterviewMessages] Failed to parse avatar event:', err);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, participants]);

  const transcriptionMessages = React.useMemo(() => {
    return mapTranscriptions(transcriptions, room.localParticipant.identity, participants);
  }, [participants, room.localParticipant.identity, transcriptions]);

  const receivedMessages = React.useMemo<ReceivedMessage[]>(() => {
    const byId = new Map<string, ReceivedMessage>();
    const seenAgentTexts = new Set<string>();
    const seenUserTimestamps = new Map<string, number>();

    const addMessage = (msg: ReceivedMessage) => {
      if (isSttHallucination(msg.message)) return;
      const normText = normalizeMessageText(msg.message);
      if (!normText) return;

      const isAgent = isAgentMessage(msg);

      if (isAgent) {
        // Đối với Agent, loại bỏ hoàn toàn các phát biểu trùng lặp (ví dụ do gửi cả avatar_event và lk.chat,
        // hoặc lời chào/câu hỏi bị lặp lại sau khi thí sinh kết nối lại)
        if (seenAgentTexts.has(normText)) {
          return;
        }
        seenAgentTexts.add(normText);
      } else {
        // Đối với ứng viên, chỉ lọc nếu cùng câu nói xuất hiện dày đặc trong 3s (do STT stream dup)
        const lastSeen = seenUserTimestamps.get(normText);
        if (lastSeen && Math.abs(msg.timestamp - lastSeen) < 3000) {
          return;
        }
        seenUserTimestamps.set(normText, msg.timestamp);
      }

      byId.set(messageKey(msg), msg);
    };

    // Ưu tiên chat.chatMessages trước (chính thống từ LiveKit Chat), sau đó tới avatarMessages và transcriptions
    for (const msg of [...chat.chatMessages, ...avatarMessages, ...transcriptionMessages]) {
      addMessage(msg);
    }
    return Array.from(byId.values()).slice(-MAX_TIMELINE_MESSAGES);
  }, [chat.chatMessages, transcriptionMessages, avatarMessages]);

  // Sắp xếp các tin nhắn nghiêm ngặt theo thời gian thực (msg.timestamp) tăng dần
  const sortedReceivedMessages = React.useMemo(() => {
    return [...receivedMessages].sort((a, b) => {
      const timeDiff = (a.timestamp || 0) - (b.timestamp || 0);
      if (timeDiff !== 0) return timeDiff;
      return (a.id || '').localeCompare(b.id || '');
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

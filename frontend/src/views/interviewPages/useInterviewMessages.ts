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

export function normalizeMessageTimestamp(timestamp?: number | null, fallback = Date.now()): number {
  if (timestamp === undefined || timestamp === null || isNaN(timestamp) || timestamp <= 0) {
    return fallback;
  }
  // Convert seconds to milliseconds if needed (e.g. 1.7e9 vs 1.7e12)
  if (timestamp < 1e11) {
    return timestamp * 1000;
  }
  return timestamp;
}

export function isAgentMessage(msg: ReceivedMessage): boolean {
  if (msg.type === 'agentTranscript') return true;
  const attrs = (msg as any).attributes;
  if (attrs?.role === 'agent' || attrs?.role === 'ai' || attrs?.sender === 'ai') return true;
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

export interface ProcessTimelineState {
  metaMap: Map<string, { order: number; effectiveTimestamp: number }>;
  orderCounter: number;
  latestTimestamp: number;
  recentAgentTurns: Array<{ normText: string; effectiveTimestamp: number; localReceivedAt: number; id: string }>;
  recentUserTurns: Array<{ normText: string; effectiveTimestamp: number; localReceivedAt: number }>;
}

export function createInitialProcessTimelineState(): ProcessTimelineState {
  return {
    metaMap: new Map(),
    orderCounter: 0,
    latestTimestamp: 0,
    recentAgentTurns: [],
    recentUserTurns: [],
  };
}

export function processInterviewTimeline(
  rawMessages: ReceivedMessage[],
  state: ProcessTimelineState,
  maxMessages = MAX_TIMELINE_MESSAGES,
): ReceivedMessage[] {
  const result: ReceivedMessage[] = [];
  const now = Date.now();

  // Dọn dẹp các phát biểu gần đây đã quá 15s để tránh chiếm bộ nhớ
  state.recentAgentTurns = state.recentAgentTurns.filter(
    (t) => Math.abs(now - t.localReceivedAt) < 15000,
  );
  state.recentUserTurns = state.recentUserTurns.filter(
    (t) => Math.abs(now - t.localReceivedAt) < 15000,
  );

  for (const msg of rawMessages) {
    if (!msg || !msg.message) continue;
    if (isSttHallucination(msg.message)) continue;

    const normText = normalizeMessageText(msg.message);
    if (!normText) continue;

    const key = messageKey(msg);
    const isAgent = isAgentMessage(msg);
    const rawTs = normalizeMessageTimestamp(msg.timestamp, now);

    let meta = state.metaMap.get(key);

    if (!meta) {
      // Tin nhắn mới: cấp phát số thứ tự xuất hiện (order) tăng dần
      state.orderCounter += 1;
      const order = state.orderCounter;

      // Bảo vệ tính đơn điệu & chống lệch đồng hồ (Clock Skew Protection):
      // Nếu tin nhắn đến sau nhưng có timestamp gửi từ server/máy khác nhỏ hơn mốc thời gian
      // của các tin nhắn trước đó (ví dụ máy chủ chạy chậm 2-3 phút), ta tự động nâng timestamp
      // của tin nhắn này lên tối thiểu bằng latestTimestamp + 1s để AI không bao giờ bị xếp ngược lên trên đầu tin nhắn của thí sinh!
      let effectiveTimestamp = rawTs;
      if (effectiveTimestamp < state.latestTimestamp) {
        effectiveTimestamp = Math.max(now, state.latestTimestamp + 1000);
      }

      // Kiểm tra trùng lặp giữa các kênh (ví dụ: avatar_event và lk.chat cùng gửi 1 câu nói của AI)
      if (isAgent) {
        const duplicateAgentTurn = state.recentAgentTurns.find(
          (t) => t.normText === normText && Math.abs(effectiveTimestamp - t.effectiveTimestamp) < 8000,
        );
        if (duplicateAgentTurn) {
          // Đã có phát biểu này trong timeline gần đây, liên kết key này vào turn đó để không sinh bong bóng trùng
          state.metaMap.set(key, {
            order: state.metaMap.get(duplicateAgentTurn.id)?.order ?? state.orderCounter,
            effectiveTimestamp: duplicateAgentTurn.effectiveTimestamp,
          });
          continue;
        }
      } else {
        // Lọc trùng STT của ứng viên trong khoảng thời gian ngắn 3s
        const duplicateUserTurn = state.recentUserTurns.find(
          (t) => t.normText === normText && Math.abs(effectiveTimestamp - t.effectiveTimestamp) < 3000,
        );
        if (duplicateUserTurn) {
          continue;
        }
      }

      state.latestTimestamp = Math.max(state.latestTimestamp, effectiveTimestamp);
      meta = { order, effectiveTimestamp };
      state.metaMap.set(key, meta);

      if (isAgent) {
        state.recentAgentTurns.push({ normText, effectiveTimestamp, localReceivedAt: now, id: key });
      } else {
        state.recentUserTurns.push({ normText, effectiveTimestamp, localReceivedAt: now });
      }
    }

    result.push({
      ...msg,
      timestamp: meta.effectiveTimestamp,
    });
  }

  // Sắp xếp các tin nhắn: ưu tiên effectiveTimestamp tăng dần, sau đó theo thứ tự xuất hiện (order)
  result.sort((a, b) => {
    const timeDiff = (a.timestamp || 0) - (b.timestamp || 0);
    if (timeDiff !== 0) return timeDiff;
    const orderA = state.metaMap.get(messageKey(a))?.order ?? 0;
    const orderB = state.metaMap.get(messageKey(b))?.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.id || '').localeCompare(b.id || '');
  });

  return result.slice(-maxMessages);
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

  // Giữ trạng thái thứ tự và mốc thời gian của timeline ổn định xuyên suốt phiên phỏng vấn
  const timelineStateRef = React.useRef<ProcessTimelineState>(createInitialProcessTimelineState());

  // Reset timeline nếu chuyển sang phòng phỏng vấn khác
  const prevRoomRef = React.useRef(room);
  if (prevRoomRef.current !== room) {
    prevRoomRef.current = room;
    timelineStateRef.current = createInitialProcessTimelineState();
  }

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

  const messages = React.useMemo(() => {
    const rawList = [...chat.chatMessages, ...avatarMessages, ...transcriptionMessages];
    return processInterviewTimeline(rawList, timelineStateRef.current, MAX_TIMELINE_MESSAGES);
  }, [chat.chatMessages, avatarMessages, transcriptionMessages]);

  return React.useMemo(
    () => ({
      messages,
      send: chat.send,
      isSending: chat.isSending,
    }),
    [chat.isSending, chat.send, messages],
  );
}

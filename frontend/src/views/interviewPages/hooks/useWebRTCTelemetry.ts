'use client';

import { useEffect, useRef, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, ConnectionQuality, DisconnectReason } from 'livekit-client';
import interviewService from '@/services/interviewService';

export interface WebRTCTelemetryState {
  isReconnecting: boolean;
  reconnectCount: number;
  lastDowntimeSeconds: number | null;
  connectionQuality: ConnectionQuality | null;
}

interface UseWebRTCTelemetryProps {
  sessionId?: string | number | null;
  inviteToken?: string | null;
  participantIdentity?: string | null;
  enabled?: boolean;
}

/**
 * useWebRTCTelemetry Hook
 * Listens to LiveKit Room reconnection & disconnection events in real-time,
 * tracks network downtime, and auto-logs telemetry to the backend.
 */
export function useWebRTCTelemetry({
  sessionId,
  inviteToken,
  participantIdentity,
  enabled = true,
}: UseWebRTCTelemetryProps): WebRTCTelemetryState {
  const room = useRoomContext();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [lastDowntimeSeconds, setLastDowntimeSeconds] = useState<number | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);

  const reconnectStartRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef<number>(0);

  useEffect(() => {
    if (!room || !sessionId || !enabled) return;

    const handleReconnecting = () => {
      const now = Date.now();
      reconnectStartRef.current = now;
      reconnectAttemptRef.current += 1;
      setIsReconnecting(true);
      setReconnectCount(reconnectAttemptRef.current);

      const identity = participantIdentity || room.localParticipant?.identity || '';

      interviewService
        .recordConnectionLog(
          sessionId,
          {
            eventType: 'reconnecting',
            participantIdentity: identity,
            reconnectAttempt: reconnectAttemptRef.current,
            metadata: {
              timestamp: new Date(now).toISOString(),
              roomName: room.name,
            },
          },
          inviteToken || undefined
        )
        .catch((err) => {
          console.warn('[WebRTCTelemetry] Failed to log reconnecting event:', err);
        });
    };

    const handleReconnected = () => {
      const now = Date.now();
      const startTime = reconnectStartRef.current ?? now;
      const downtimeSeconds = Math.max(0, Math.round(((now - startTime) / 1000) * 10) / 10);

      reconnectStartRef.current = null;
      setIsReconnecting(false);
      setLastDowntimeSeconds(downtimeSeconds);

      const identity = participantIdentity || room.localParticipant?.identity || '';

      interviewService
        .recordConnectionLog(
          sessionId,
          {
            eventType: 'reconnected',
            participantIdentity: identity,
            downtimeSeconds,
            reconnectAttempt: reconnectAttemptRef.current,
            metadata: {
              timestamp: new Date(now).toISOString(),
              roomName: room.name,
              downtimeSeconds,
            },
          },
          inviteToken || undefined
        )
        .catch((err) => {
          console.warn('[WebRTCTelemetry] Failed to log reconnected event:', err);
        });
    };

    const handleDisconnected = (reason?: DisconnectReason) => {
      setIsReconnecting(false);
      const identity = participantIdentity || room.localParticipant?.identity || '';

      // Chỉ gửi log disconnected nếu không phải là client chủ động rời phòng bình thường
      if (reason !== DisconnectReason.CLIENT_INITIATED) {
        interviewService
          .recordConnectionLog(
            sessionId,
            {
              eventType: 'disconnected',
              participantIdentity: identity,
              reason: reason ? String(reason) : 'unexpected_disconnect',
              metadata: {
                disconnectReason: reason,
                roomName: room.name,
              },
            },
            inviteToken || undefined
          )
          .catch((err) => {
            console.warn('[WebRTCTelemetry] Failed to log disconnected event:', err);
          });
      }
    };

    const handleConnectionQualityChanged = (
      quality: ConnectionQuality,
      participant: { isLocal?: boolean }
    ) => {
      if (participant?.isLocal) {
        setConnectionQuality(quality);
      }
    };

    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ConnectionQualityChanged, handleConnectionQualityChanged);

    return () => {
      room.off(RoomEvent.Reconnecting, handleReconnecting);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.ConnectionQualityChanged, handleConnectionQualityChanged);
    };
  }, [room, sessionId, inviteToken, participantIdentity, enabled]);

  return {
    isReconnecting,
    reconnectCount,
    lastDowntimeSeconds,
    connectionQuality,
  };
}

export default useWebRTCTelemetry;

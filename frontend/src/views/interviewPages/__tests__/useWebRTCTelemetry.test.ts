/**
 * @jest-environment jsdom
 */

import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

import { renderHook, act } from '@testing-library/react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, ConnectionQuality, DisconnectReason } from 'livekit-client';
import { useWebRTCTelemetry } from '../hooks/useWebRTCTelemetry';
import interviewService from '@/services/interviewService';

jest.mock('@livekit/components-react', () => ({
  useRoomContext: jest.fn(),
}));

jest.mock('@/services/interviewService', () => ({
  recordConnectionLog: jest.fn().mockResolvedValue({}),
}));

describe('useWebRTCTelemetry', () => {
  let mockRoom: any;
  let listeners: Record<string, ((...args: any[]) => void)[]>;

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = {};

    mockRoom = {
      name: 'room-test-123',
      localParticipant: { identity: 'participant-candidate-1' },
      on: jest.fn((event: string, callback: (...args: any[]) => void) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(callback);
      }),
      off: jest.fn((event: string, callback: (...args: any[]) => void) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((cb) => cb !== callback);
        }
      }),
    };

    (useRoomContext as jest.Mock).mockReturnValue(mockRoom);
  });

  it('registers room event listeners on mount and unregisters on unmount', () => {
    const { unmount } = renderHook(() =>
      useWebRTCTelemetry({ sessionId: 101, inviteToken: 'test-token' })
    );

    expect(mockRoom.on).toHaveBeenCalledWith(RoomEvent.Reconnecting, expect.any(Function));
    expect(mockRoom.on).toHaveBeenCalledWith(RoomEvent.Reconnected, expect.any(Function));
    expect(mockRoom.on).toHaveBeenCalledWith(RoomEvent.Disconnected, expect.any(Function));
    expect(mockRoom.on).toHaveBeenCalledWith(RoomEvent.ConnectionQualityChanged, expect.any(Function));

    unmount();

    expect(mockRoom.off).toHaveBeenCalledWith(RoomEvent.Reconnecting, expect.any(Function));
    expect(mockRoom.off).toHaveBeenCalledWith(RoomEvent.Reconnected, expect.any(Function));
    expect(mockRoom.off).toHaveBeenCalledWith(RoomEvent.Disconnected, expect.any(Function));
    expect(mockRoom.off).toHaveBeenCalledWith(RoomEvent.ConnectionQualityChanged, expect.any(Function));
  });

  it('handles Reconnecting event and calls recordConnectionLog with attempt number', () => {
    const { result } = renderHook(() =>
      useWebRTCTelemetry({ sessionId: 101, inviteToken: 'test-token' })
    );

    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.reconnectCount).toBe(0);

    act(() => {
      listeners[RoomEvent.Reconnecting]?.[0]?.();
    });

    expect(result.current.isReconnecting).toBe(true);
    expect(result.current.reconnectCount).toBe(1);
    expect(interviewService.recordConnectionLog).toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        eventType: 'reconnecting',
        participantIdentity: 'participant-candidate-1',
        reconnectAttempt: 1,
      }),
      'test-token'
    );
  });

  it('handles Reconnected event and logs calculated downtime', () => {
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(10000) // Reconnecting start
      .mockReturnValueOnce(15000); // Reconnected end (5s diff)

    const { result } = renderHook(() =>
      useWebRTCTelemetry({ sessionId: 101, inviteToken: 'test-token' })
    );

    act(() => {
      listeners[RoomEvent.Reconnecting]?.[0]?.();
    });

    act(() => {
      listeners[RoomEvent.Reconnected]?.[0]?.();
    });

    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.lastDowntimeSeconds).toBe(5);
    expect(interviewService.recordConnectionLog).toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        eventType: 'reconnected',
        downtimeSeconds: 5,
        reconnectAttempt: 1,
      }),
      'test-token'
    );
  });

  it('does not log disconnected if client initiated, but logs if unexpected', () => {
    renderHook(() =>
      useWebRTCTelemetry({ sessionId: 101, inviteToken: 'test-token' })
    );

    // Client initiated -> should NOT call recordConnectionLog
    act(() => {
      listeners[RoomEvent.Disconnected]?.[0]?.(DisconnectReason.CLIENT_INITIATED);
    });
    expect(interviewService.recordConnectionLog).not.toHaveBeenCalled();

    // Unexpected server close or drop -> should call recordConnectionLog
    act(() => {
      listeners[RoomEvent.Disconnected]?.[0]?.(DisconnectReason.SERVER_SHUTDOWN);
    });
    expect(interviewService.recordConnectionLog).toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        eventType: 'disconnected',
        participantIdentity: 'participant-candidate-1',
      }),
      'test-token'
    );
  });

  it('updates connectionQuality when local participant quality changes', () => {
    const { result } = renderHook(() =>
      useWebRTCTelemetry({ sessionId: 101 })
    );

    act(() => {
      listeners[RoomEvent.ConnectionQualityChanged]?.[0]?.(ConnectionQuality.Excellent, { isLocal: true });
    });

    expect(result.current.connectionQuality).toBe(ConnectionQuality.Excellent);
  });
});

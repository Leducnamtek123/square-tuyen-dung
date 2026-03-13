import * as React from 'react';
import { RoomEvent, setLogLevel } from 'livekit-client';
import { useRoomContext, useSessionContext } from '@livekit/components-react';

export const useDebugMode = (options = {}) => {
  const room = useRoomContext();
  const session = useSessionContext();
  const logLevel = options.logLevel ?? 'debug';
  const enabled = options.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) {
      setLogLevel('silent');
      return;
    }

    setLogLevel(logLevel ?? 'debug');

    // @ts-expect-error this is a global variable
    window.__lk_room = room;

    if (!room) return;

    const originalDisconnect = room.disconnect?.bind(room);
    if (originalDisconnect) {
      room.disconnect = async (...args) => {
        console.warn('[LiveKit] room.disconnect called', {
          args,
          stack: new Error('room.disconnect').stack,
        });
        return originalDisconnect(...args);
      };
    }

    const originalEnd = session?.end?.bind(session);
    if (originalEnd) {
      session.end = async (...args) => {
        console.warn('[LiveKit] session.end called', {
          args,
          stack: new Error('session.end').stack,
        });
        return originalEnd(...args);
      };
    }

    const onDisconnected = (reason) => {
      console.warn('[LiveKit] room disconnected', { reason });
    };
    const onConnectionStateChanged = (state) => {
      console.debug('[LiveKit] connection state', state);
    };
    const onParticipantDisconnected = (participant) => {
      console.warn('[LiveKit] participant disconnected', {
        identity: participant?.identity,
        sid: participant?.sid,
      });
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.ConnectionStateChanged, onConnectionStateChanged);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.ConnectionStateChanged, onConnectionStateChanged);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      if (originalDisconnect) room.disconnect = originalDisconnect;
      if (originalEnd) session.end = originalEnd;
      // @ts-expect-error this is a global variable
      window.__lk_room = undefined;
      setLogLevel('silent');
    };
  }, [room, session, enabled, logLevel]);
};

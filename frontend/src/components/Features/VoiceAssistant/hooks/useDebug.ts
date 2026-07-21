'use client';

import * as React from 'react';
import { LogLevel, setLogLevel as updateLiveKitLogLevel } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';

export const useDebugMode = (options: { logLevel?: LogLevel; enabled?: boolean } = {}) => {
  const room = useRoomContext();
  const logLevel = options.logLevel ?? 'debug';
  const enabled = options.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) {
      updateLiveKitLogLevel('silent');
      return;
    }

    updateLiveKitLogLevel(logLevel ?? 'debug');

    // @ts-expect-error this is a global variable
    window.__lk_room = room;

    return () => {
      // @ts-expect-error this is a global variable
      window.__lk_room = undefined;
      updateLiveKitLogLevel('silent');
    };
  }, [room, enabled, logLevel]);
};

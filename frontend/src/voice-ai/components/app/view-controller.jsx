import { useEnsureRoom, useSessionContext, useStartAudio } from '@livekit/components-react';

import { SessionView } from '@/voice-ai/components/app/session-view';
import { WelcomeView } from '@/voice-ai/components/app/welcome-view';

export function ViewController({ appConfig }) {
  const { isConnected, start, room } = useSessionContext();
  const roomEnsured = useEnsureRoom(room);
  const { mergedProps: startAudioProps, canPlayAudio } = useStartAudio({
    room: roomEnsured,
    props: {},
  });

  const handleStart = async () => {
    try {
      if (!canPlayAudio && typeof startAudioProps.onClick === 'function') {
        startAudioProps.onClick();
      }
      await start();
    } catch (error) {
      console.error('[LiveKit] Failed to start session', error);
    }
  };

  if (!isConnected) {
    return <WelcomeView startButtonText={appConfig.startButtonText} onStartCall={handleStart} />;
  }

  return <SessionView appConfig={appConfig} />;
}

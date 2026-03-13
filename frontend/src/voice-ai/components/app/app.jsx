'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from '@livekit/components-react';

import { ViewController } from '@/voice-ai/components/app/view-controller';
import { Toaster } from '@/voice-ai/components/livekit/toaster';
import { useAgentErrors } from '@/voice-ai/hooks/useAgentErrors';
import { useDebugMode } from '@/voice-ai/hooks/useDebug';
import { getSandboxTokenSource } from '@/voice-ai/lib/utils';

const LIVEKIT_DEBUG_ENABLED = import.meta.env.VITE_LIVEKIT_DEBUG === '1';

function AppSetup() {
  useDebugMode({
    enabled: LIVEKIT_DEBUG_ENABLED,
    logLevel: 'warn',
  });
  useAgentErrors();

  return null;
}

export function App({ appConfig, tokenSource: tokenSourceOverride, startAudioLabel }) {
  const tokenSource = useMemo(() => {
    if (tokenSourceOverride) return tokenSourceOverride;
    return getSandboxTokenSource(appConfig);
  }, [appConfig, tokenSourceOverride]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} />
      </main>
      <StartAudio label={startAudioLabel} />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}

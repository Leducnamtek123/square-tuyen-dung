'use client';

import { useEffect, useMemo, useRef } from 'react';
import { TokenSource } from 'livekit-client';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from '@livekit/components-react';
import { SessionView } from '@/components/Features/VoiceAssistant/components/app/session-view';
import { Toaster } from '@/components/Features/VoiceAssistant/components/livekit/toaster';
import type { AppConfig } from '@/components/Features/VoiceAssistant/app-config';
import { useAgentErrors } from '@/components/Features/VoiceAssistant/hooks/useAgentErrors';
import { useDebugMode } from '@/components/Features/VoiceAssistant/hooks/useDebug';
import { useSessionContext } from '@livekit/components-react';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  // useAgentErrors(); // Disabled to prevent premature disconnects if backend doesn't emit valid agent RPC states
  
  return null;
}

function AutoConnect() {
  const { isConnected, start } = useSessionContext();
  const hasStarted = useRef(false);
  
  useEffect(() => {
    if (!isConnected && !hasStarted.current) {
      console.log('[VoiceAssistantApp] AutoConnect: calling start()');
      hasStarted.current = true;
      start().catch(err => {
        console.error('[VoiceAssistantApp] AutoConnect failed:', err);
      });
    }
  }, [isConnected, start]);

  return null;
}

interface AppProps {
  appConfig: AppConfig;
  connectionDetails: { token: string; serverUrl: string };
  onDisconnect?: () => void;
}

export function App({ appConfig, connectionDetails, onDisconnect }: AppProps) {
  const tokenSource = useMemo(() => {
    return TokenSource.custom(async () => ({
      participantToken: connectionDetails.token,
      serverUrl: connectionDetails.serverUrl,
    }));
  }, [connectionDetails]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <AutoConnect />
      <main className="grid h-full grid-cols-1 place-content-center">
        {session.isConnected ? (
          <SessionView appConfig={appConfig} className="w-full h-full" onDisconnect={onDisconnect} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-slate-400 gap-4">
             <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
             <p className="text-sm font-mono tracking-widest text-cyan-300">CONNECTING VOICE AI...</p>
          </div>
        )}
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}

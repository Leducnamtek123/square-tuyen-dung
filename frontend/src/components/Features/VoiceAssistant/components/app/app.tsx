'use client';

import { useMemo } from 'react';
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

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

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

  /* Auto-start connection upon mount */
  useMemo(() => {
    if (session.connectionState === 'disconnected' && !(session as any).startAttempted) {
      setTimeout(() => {
        session.start().catch(console.error);
      }, 0);
      // hack: flag it so we don't retry endlessly in strict mode
      (session as any).startAttempted = true;
    }
  }, [session]);

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="grid h-full grid-cols-1 place-content-center">
        {session.isConnected ? (
          <SessionView appConfig={appConfig} className="w-full h-full" onDisconnect={onDisconnect} />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-8 text-center text-slate-400">
             <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          </div>
        )}
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}

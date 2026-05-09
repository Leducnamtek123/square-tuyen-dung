'use client';

import { useEffect, useMemo, useRef } from 'react';
import { TokenSource } from 'livekit-client';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
  useSessionContext,
} from '@livekit/components-react';
import { useTranslation } from 'react-i18next';
import { SessionView } from '@/components/Features/VoiceAssistant/components/app/session-view';
import { Toaster } from '@/components/Features/VoiceAssistant/components/livekit/toaster';
import type { AppConfig } from '@/components/Features/VoiceAssistant/app-config';
import { useDebugMode } from '@/components/Features/VoiceAssistant/hooks/useDebug';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  // useAgentErrors(); // Disabled to prevent premature disconnects if backend doesn't emit valid agent RPC states

  return null;
}

function AutoConnect({ onError }: { onError?: (err: unknown) => void }) {
  const { isConnected, start } = useSessionContext();
  const hasStarted = useRef(false);
  const connectionAttempted = useRef(false);

  useEffect(() => {
    // Only attempt to start once per mount
    if (!isConnected && !hasStarted.current && !connectionAttempted.current) {
      connectionAttempted.current = true;

      start().then(() => {
        hasStarted.current = true;
      }).catch(err => {
        console.error('[VoiceAssistantApp] AutoConnect failed:', err);
        if (onError) onError(err);
      });
    }
  }, [isConnected, start, onError]);

  return null;
}

interface AppProps {
  appConfig: AppConfig;
  connectionDetails: { token: string; serverUrl: string };
  onDisconnect?: () => void;
}

export function App({ appConfig, connectionDetails, onDisconnect }: AppProps) {
  const { t } = useTranslation('voiceAssistant');
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
      <AutoConnect onError={onDisconnect} />
      <main className="grid h-full min-h-full grid-cols-1 place-content-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_42%),linear-gradient(180deg,#020617_0%,#020617_100%)]">
        {session.isConnected ? (
          <SessionView appConfig={appConfig} className="w-full h-full" onDisconnect={onDisconnect} />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 py-10">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/55 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl md:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%)]" />
              <div className="relative mx-auto flex size-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10">
                <div className="size-8 animate-spin rounded-full border-2 border-cyan-300/25 border-t-cyan-300" />
              </div>
              <p className="relative mt-5 text-xs font-black uppercase tracking-[0.35em] text-cyan-200/80">
                {t('connectingTitle')}
              </p>
              <p className="relative mt-3 text-sm leading-6 text-zinc-300">
                {t('connectingDescription')}
              </p>
            </div>
          </div>
        )}
      </main>
      <StartAudio label={t('startAudio')} />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}

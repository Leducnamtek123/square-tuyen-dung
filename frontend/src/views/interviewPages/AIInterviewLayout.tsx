import React from 'react';
import {
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks,
  RoomAudioRenderer,
  TrackReferenceOrPlaceholder,
  LayoutContextProvider,
  useCreateLayoutContext,
  useLayoutContext,
  Chat
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

function AIParticipantTile({ trackRef, ...props }: { trackRef?: TrackReferenceOrPlaceholder; [key: string]: any }) {
  const p = trackRef?.participant;
  const isAgent = p?.identity?.toLowerCase().includes('agent') || p?.name?.toLowerCase().includes('agent');
  const isSpeaking = p?.isSpeaking;

  if (isAgent) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[#0f172a] rounded-2xl overflow-hidden border border-white/8 shadow-[0_0_0_2px_rgba(14,165,233,0)] transition-all data-[speaking=true]:border-cyan-400/60 data-[speaking=true]:shadow-[0_0_0_2px_rgba(14,165,233,0.3)]" data-speaking={isSpeaking}>
        <div className="absolute inset-0 bg-slate-950" />
        
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <AgentAudioVisualizerAura 
            audioTrack={trackRef as any} 
            state={isSpeaking ? 'speaking' : 'listening'} 
            size="lg" 
            color="#8b5cf6" 
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 z-20">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-300">AI</span>
            <span className="text-xs font-semibold text-white">{p?.name || p?.identity || 'AI Interviewer'}</span>
          </div>
        </div>
      </div>
    );
  }

  return <ParticipantTile {...props} trackRef={trackRef} />;
}

function ChatPanel() {
  const layoutContext = useLayoutContext();
  const showChat = layoutContext?.widget?.state?.showChat;
  
  if (!showChat) return null;
  
  return (
    <div className="w-[320px] h-full border-l border-white/10 bg-[#020617]">
      <Chat />
    </div>
  );
}

export function AIInterviewLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [], onlySubscribed: false },
  );

  const layoutContext = useCreateLayoutContext();

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="flex h-full w-full bg-[#020617]">
        <div className="flex flex-1 flex-col h-full">
          <div className="flex-1 p-2">
            <GridLayout tracks={tracks}>
              <AIParticipantTile />
            </GridLayout>
          </div>
          <div className="border-t border-white/8 bg-[#020617]/90 px-4 py-3 backdrop-blur-xl">
            <ControlBar variation="minimal" />
          </div>
        </div>
        <ChatPanel />
      </div>
    </LayoutContextProvider>
  );
}

import React, { useState, useMemo } from "react";
import { 
  AgentAudioVisualizerAura,
  AgentAudioVisualizerBar,
  AgentAudioVisualizerGrid,
  AgentAudioVisualizerRadial,
  AgentAudioVisualizerWave,
  AgentChatTranscript,
  AgentControlBar,
} from "@/components/Features/AgentsUi";
import { 
  useAgent, 
  useChat,
  useRoomContext,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface InterviewAgentViewProps {
  onDisconnect: () => void;
  sessionInfo: {
    jobName?: string;
    candidateName?: string;
  };
}

const InterviewAgentView = ({ onDisconnect, sessionInfo }: InterviewAgentViewProps) => {
  const { t } = useTranslation("interview");
  console.log("InterviewAgentView: starting render");
  const room = useRoomContext();
  console.log("InterviewAgentView: room context", !!room);
  
  // Construct a SessionStub to pass to useAgent, bypassing the SessionContext requirement.
  // SessionStub needs: connectionState, room, internal
  const sessionStub = useMemo(() => ({
    connectionState: room?.state ?? 'disconnected',
    room,
    internal: { agentDispatch: undefined },
  }), [room, room?.state]);
  const agent = useAgent(sessionStub as any) as any;
  console.log("InterviewAgentView: agent hook successful, state:", agent?.state);
  const state = agent?.state || 'connecting';
  const agentParticipant = agent?.agentParticipant;
  const { chatMessages } = useChat({ room });
  console.log("InterviewAgentView: chat hook successful, messages:", chatMessages?.length);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Parse metadata for interview stage and progress
  const { stage, currentQuestion, totalQuestions } = useMemo(() => {
    const metadata = agentParticipant?.metadata;
    if (!metadata || !metadata.startsWith("STAGE:")) {
      return { stage: "INTRODUCTION", currentQuestion: 0, totalQuestions: 0 };
    }
    const content = metadata.replace("STAGE:", "");
    // Format can be "STAGE:TECHNICAL|1/5" or just "STAGE:INTRODUCTION"
    const [stageName, progress] = content.split("|");
    let current = 0;
    let total = 0;
    if (progress && progress.includes("/")) {
      const [c, t] = progress.split("/").map(Number);
      current = c;
      total = t;
    }
    return { stage: stageName, currentQuestion: current, totalQuestions: total };
  }, [agentParticipant?.metadata]);

  const stages = ["INTRODUCTION", "EXPERIENCE", "TECHNICAL", "BEHAVIORAL", "CLOSING"];
  const currentStageIndex = stages.indexOf(stage);

  // Format messages for AgentChatTranscript
  const formattedMessages = useMemo(() => {
    return chatMessages.map(msg => ({
      id: msg.id,
      timestamp: msg.timestamp,
      from: msg.from,
      message: msg.message
    }));
  }, [chatMessages]);

  const agentAudioTrack = useMemo(() => {
    return agentParticipant?.getTrackPublication("microphone")?.audioTrack;
  }, [agentParticipant]);

  const visualizerVariant = (process.env.NEXT_PUBLIC_LIVEKIT_VISUALIZER || "aura")
    .toString()
    .toLowerCase();

  const renderVisualizer = () => {
    const commonProps = {
      state,
      audioTrack: agentAudioTrack,
      className: "relative transition-all duration-700",
    };

    switch (visualizerVariant) {
      case "bar":
        return <AgentAudioVisualizerBar {...commonProps} size="lg" className="h-[180px] w-[300px]" />;
      case "grid":
        return <AgentAudioVisualizerGrid {...commonProps} size="lg" rowCount={7} columnCount={7} />;
      case "radial":
        return <AgentAudioVisualizerRadial {...commonProps} size="lg" barCount={24} />;
      case "wave":
        return <AgentAudioVisualizerWave {...commonProps} size="lg" className="h-[160px] w-[420px]" />;
      default:
        return (
          <AgentAudioVisualizerAura
            {...commonProps}
            size="xl"
            className="drop-shadow-[0_0_30px_rgba(31,213,249,0.2)]"
          />
        );
    }
  };

  return (
    <section className="relative h-full w-full overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-[-8%] h-80 w-[36rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.8),rgba(2,6,23,0.98))]" />
      </div>

      <div className="absolute left-6 top-6 z-20 flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-white/90">
          {sessionInfo?.jobName || t("agentView.technicalInterview")}
        </h2>
        <p className="text-xs uppercase tracking-[0.22em] text-white/45">
          Live Session | {sessionInfo?.candidateName || t("agentView.candidate")}
        </p>
      </div>

      {/* Stage Progress Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 hidden md:block">
        <div className="flex items-center justify-between gap-2">
          {stages.map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={cn(
                  "h-1 w-full rounded-full transition-all duration-500",
                  idx <= currentStageIndex ? "bg-cyan-400" : "bg-white/10"
                )} />
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-widest transition-colors duration-500",
                  idx <= currentStageIndex ? "text-cyan-400" : "text-white/20"
                )}>
                  {t(`stages.${s}`)}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Question Counter for Technical Stage */}
      {stage === "TECHNICAL" && totalQuestions > 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md"
          >
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              {t("stages.currentQuestion", { current: currentQuestion, total: totalQuestions })}
            </span>
          </motion.div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-12">
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className={cn(
               "absolute inset-0 blur-3xl rounded-full transition-all duration-1000 opacity-20",
               state === 'speaking' ? "bg-cyan-500 scale-110" : 
               state === 'thinking' ? "bg-blue-500 scale-105" : "bg-white/5"
            )} />

            {renderVisualizer()}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-300"
          >
             <div className="flex items-center gap-3">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                  state === 'speaking' ? "bg-cyan-400 animate-pulse" : 
                  state === 'thinking' ? "bg-blue-400 animate-bounce" : 
                  state === 'listening' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20"
                )} />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  {state === 'speaking' ? t('agentView.agentSpeaking') : 
                   state === 'thinking' ? t('agentView.agentThinking') : 
                   state === 'listening' ? t('agentView.listening') : t('agentView.ready')}
                </span>
             </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pointer-events-none fixed bottom-32 right-6 top-6 z-40 flex w-80 flex-col md:w-[400px]"
          >
            <div className="pointer-events-auto flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]/80 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h3 className="font-bold text-sm uppercase tracking-widest opacity-80">{t('agentView.transcript')}</h3>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                >
                   X
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                <AgentChatTranscript 
                  agentState={state} 
                  messages={formattedMessages} 
                  className="h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-4 bottom-0 z-30 flex justify-center pb-8 md:inset-x-12 md:pb-10">
        <div className="w-full max-w-3xl">
          <AgentControlBar 
            variant="livekit"
            isConnected={true}
            isChatOpen={isChatOpen}
            onIsChatOpenChange={setIsChatOpen}
            onDisconnect={onDisconnect}
            onDeviceError={(err) => console.error(err)}
            controls={{ microphone: true, camera: false, chat: true, screenShare: false, leave: true }}
            className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 bg-black/40 backdrop-blur-3xl p-4 rounded-full"
          />
        </div>
      </div>
    </section>
  );
};

export default InterviewAgentView;


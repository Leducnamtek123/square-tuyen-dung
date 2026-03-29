import React, { useState, useMemo, useCallback } from "react";
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
  useVoiceAssistant, 
  useChat,
  useRoomContext,
  AudioTrack,
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
  const room = useRoomContext();
  
  const { state, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const agentParticipant = agentAudioTrack?.participant;
  const { chatMessages } = useChat({ room });
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  
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

  // Parse chat messages for the transcript component
  const transcriptMessages = useMemo(() => {
    return chatMessages.map(msg => ({
      id: msg.id,
      timestamp: msg.timestamp,
      from: msg.from,
      message: msg.message
    }));
  }, [chatMessages]);

  const handleDeviceError = useCallback((error: any) => {
    console.error("Device error in InterviewAgentView:", error);
  }, []);


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
    <section className="relative h-full w-full overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-center">
      {/* Explicit Agent Audio Track */}
      {agentAudioTrack && <AudioTrack trackRef={agentAudioTrack} />}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl opacity-50" />
        <div className="absolute -bottom-32 right-[-8%] h-80 w-[36rem] rounded-full bg-indigo-500/15 blur-3xl opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.4),rgba(2,6,23,1))]" />
      </div>

      {/* Stage Progress Bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-6 hidden md:block">
        <div className="flex items-center justify-between gap-4">
          {stages.map((s, idx) => (
            <div key={s} className="flex flex-col gap-2 flex-1">
              <div className={cn(
                "h-1.5 w-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(34,211,238,0.1)]",
                idx <= currentStageIndex ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/20" : "bg-white/5"
              )} />
              <span className={cn(
                "text-[9px] uppercase font-black tracking-[0.2em] transition-all duration-500 text-center",
                idx <= currentStageIndex ? "text-cyan-400 opacity-100" : "text-white/20 opacity-50"
              )}>
                {t(`stages.${s}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Question Counter for Technical Stage */}
      {stage === "TECHNICAL" && totalQuestions > 0 && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="px-5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
          >
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.25em]">
              {t("stages.currentQuestion", { current: currentQuestion, total: totalQuestions })}
            </span>
          </motion.div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="relative group">
            <div className={cn(
               "absolute inset-0 blur-[100px] rounded-full transition-all duration-1000 opacity-30 scale-150",
               state === 'speaking' ? "bg-cyan-500 animate-pulse" : 
               state === 'thinking' ? "bg-blue-500 animate-pulse" : "bg-transparent"
            )} />

            <div className="relative z-10 transform scale-110 md:scale-125 transition-transform duration-700">
              {renderVisualizer()}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 px-8 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 group hover:border-white/[0.15]"
          >
             <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={cn(
                    "w-3 h-3 rounded-full transition-all duration-500",
                    state === 'speaking' ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" : 
                    state === 'thinking' ? "bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]" : 
                    state === 'listening' ? "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]" : "bg-white/10"
                  )} />
                  {state !== 'idle' && (
                    <div className={cn(
                      "absolute inset-0 rounded-full animate-ping opacity-40",
                      state === 'speaking' ? "bg-cyan-400" : 
                      state === 'thinking' ? "bg-blue-400" : 
                      state === 'listening' ? "bg-emerald-400" : ""
                    )} />
                  )}
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">
                  {state === 'speaking' ? t('agentView.agentSpeaking') : 
                   state === 'thinking' ? t('agentView.agentThinking') : 
                   state === 'listening' ? t('agentView.listening') : t('agentView.ready')}
                </span>
             </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isTranscriptVisible && (
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
                  onClick={() => setIsTranscriptVisible(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                >
                   X
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                <AgentChatTranscript 
                  agentState={state} 
                  messages={transcriptMessages} 
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
            isChatOpen={isTranscriptVisible}
            onIsChatOpenChange={setIsTranscriptVisible}
            onDisconnect={onDisconnect}
            onDeviceError={handleDeviceError}
            controls={{ microphone: true, camera: false, chat: true, screenShare: false, leave: true }}
            className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 bg-black/40 backdrop-blur-3xl p-4 rounded-full"
          />
        </div>
      </div>
    </section>
  );
};

export default InterviewAgentView;


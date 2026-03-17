import React, { useState, useMemo } from "react";
import { 
  AgentAudioVisualizerAura,
  AgentChatTranscript,
  AgentControlBar,
} from "../agents-ui";
import { 
  useAgent, 
  useChat,
  useRoomContext,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * InterviewAgentView Component
 * A premium, voice-first interview interface using LiveKit Agents UI.
 */
const InterviewAgentView = ({ onDisconnect, sessionInfo }) => {
  const room = useRoomContext();
  const { state, agentParticipant } = useAgent();
  const { chatMessages } = useChat({ room });
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  return (
    <div className="relative flex flex-col h-full w-full bg-[#0b1220] text-white overflow-hidden font-sans rounded-2xl">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-1/4 w-[700px] h-[700px] bg-indigo-500/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(31,213,249,0.03),transparent_70%)]" />
      </div>

      {/* Header Info */}
      <div className="absolute top-6 left-6 z-20">
         <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-white/90">
              {sessionInfo?.jobName || "Technical Interview"}
            </h2>
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-white/40 uppercase tracking-widest">
                 Live Session
               </span>
               <span className="w-1 h-1 bg-white/20 rounded-full" />
               <span className="text-sm font-medium text-white/40">
                 {sessionInfo?.candidateName || "Candidate"}
               </span>
            </div>
         </div>
      </div>

      {/* Main Content: Audio Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 p-12">
        <div className="relative flex flex-col items-center">
          <div className="relative group">
            {/* Glow effect behind visualizer */}
            <div className={cn(
               "absolute inset-0 blur-3xl rounded-full transition-all duration-1000 opacity-20",
               state === 'speaking' ? "bg-cyan-500 scale-110" : 
               state === 'thinking' ? "bg-blue-500 scale-105" : "bg-white/5"
            )} />
            
            <AgentAudioVisualizerAura 
              state={state} 
              audioTrack={agentAudioTrack} 
              size="xl" 
              className="relative transition-all duration-700 drop-shadow-[0_0_30px_rgba(31,213,249,0.2)]"
            />
          </div>
          
          {/* Status Badge */}
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
                  {state === 'speaking' ? 'Agent is speaking' : 
                   state === 'thinking' ? 'Agent is thinking' : 
                   state === 'listening' ? 'Listening...' : 'Ready'}
                </span>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Chat Transcript Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-8 top-8 bottom-32 w-80 md:w-[400px] z-40 flex flex-col pointer-events-none"
          >
            <div className="flex-1 bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden pointer-events-auto shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h3 className="font-bold text-sm uppercase tracking-widest opacity-80">Transcript</h3>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                >
                   X
                </button>
              </div>
              <div className="flex-1 p-6 overflow-hidden">
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

      {/* Bottom Controls Area */}
      <div className="relative z-30 pb-12 px-8 flex justify-center">
        <div className="w-full max-w-3xl transition-all duration-500">
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
    </div>
  );
};

export default InterviewAgentView;


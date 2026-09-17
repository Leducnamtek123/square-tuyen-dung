'use client';

import { useMemo, useState, useEffect } from 'react';
import type { AgentState } from '@livekit/components-react';
import {
  AvatarState,
  getAvatarAssetPaths,
  getSpeakingCycleFrames,
  resolveAvatarState,
} from './avatarStates';

export interface UseAvatarStateOptions {
  avatarId?: string;
  voiceAssistantState?: AgentState;
  isSpeaking?: boolean;
  audioLevel?: number;
  sessionStatus?: string;
  contextHint?: string;
}

export interface AvatarStateOutput {
  state: AvatarState;
  assetSrc: string;
  isSpeaking: boolean;
}

/**
 * Controller hook to derive the exact 2.5D Avatar presentation state from LiveKit events.
 * Handles speaking multi-frame loops seamlessly with zero CPU overhead.
 */
export function useAvatarState({
  avatarId,
  voiceAssistantState,
  isSpeaking = false,
  sessionStatus,
  contextHint,
}: UseAvatarStateOptions): AvatarStateOutput {
  const [speakingFrameIndex, setSpeakingFrameIndex] = useState(0);

  const avatarAssetPaths = useMemo(() => getAvatarAssetPaths(avatarId), [avatarId]);
  const speakingCycleFrames = useMemo(() => getSpeakingCycleFrames(avatarId), [avatarId]);

  // 1. Derive canonical AvatarState
  const state: AvatarState = useMemo(() => {
    return resolveAvatarState({
      voiceAssistantState,
      isSpeaking,
      sessionStatus,
      contextHint,
    });
  }, [sessionStatus, voiceAssistantState, isSpeaking, contextHint]);

  // 2. Loop through speaking frames when AI is vocalizing
  const isAgentSpeaking = state === 'speaking';

  useEffect(() => {
    if (!isAgentSpeaking) {
      setSpeakingFrameIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setSpeakingFrameIndex((prev) => (prev + 1) % speakingCycleFrames.length);
    }, 165);

    return () => clearInterval(interval);
  }, [isAgentSpeaking, speakingCycleFrames.length]);

  // 3. Natural human eye blinking micro-cycle (every 4.2s for 140ms)
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (isAgentSpeaking) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 140);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, [isAgentSpeaking]);

  // 4. Resolve actual asset image path
  const assetSrc = useMemo(() => {
    if (state === 'speaking') {
      return speakingCycleFrames[speakingFrameIndex] || avatarAssetPaths.speaking;
    }
    if (isBlinking && (state === 'idle' || state === 'listening')) {
      return avatarAssetPaths.blink;
    }
    return avatarAssetPaths[state] || avatarAssetPaths.idle;
  }, [state, speakingFrameIndex, isBlinking, speakingCycleFrames, avatarAssetPaths]);

  return {
    state,
    assetSrc,
    isSpeaking: isAgentSpeaking,
  };
}

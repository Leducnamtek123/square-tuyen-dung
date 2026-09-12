'use client';

import React, { useState } from 'react';
import { Box, ButtonGroup, Button, Tooltip } from '@mui/material';
import type { AgentState } from '@livekit/components-react';
import { useLiveAudioTrackAnalyzer } from '../hooks/useLiveAudioTrackAnalyzer';
import { LiveAudioVisualizerWave } from './LiveAudioVisualizerWave';
import { LiveAudioVisualizerBar } from './LiveAudioVisualizerBar';
import { AgentAudioVisualizerAura } from '@/components/Features/AgentsUI/agent-audio-visualizer-aura';

export type VisualizerMode = 'wave' | 'bar' | 'aura';

interface LiveAudioVisualizerContainerProps {
  audioTrack?: unknown;
  state?: AgentState;
  isSpeakingHint?: boolean;
  color?: `#${string}`;
  secondaryColor?: string;
  defaultMode?: VisualizerMode;
  allowModeSwitch?: boolean;
  role?: 'agent' | 'candidate';
  height?: number | string;
}

/**
 * All-in-one LiveKit Agent Audio Visualizer Container.
 * Seamlessly manages audio track analysis and rendering for Wave, Bar, and Aura modes.
 */
export function LiveAudioVisualizerContainer({
  audioTrack,
  state,
  isSpeakingHint = false,
  color = '#38bdf8',
  secondaryColor = '#818cf8',
  defaultMode = 'bar',
  allowModeSwitch = false,
  role = 'agent',
  height = 64,
}: LiveAudioVisualizerContainerProps) {
  // Fixed to 'bar' per user requirement: no switcher, high-precision bar visualizer
  const mode: VisualizerMode = 'bar';

  // Real-time audio analyzer
  const analyzer = useLiveAudioTrackAnalyzer(audioTrack, {
    bandCount: 9,
    isSpeakingHint,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        py: 0.5,
      }}
    >
      {/* Visualizer Display Area: High-performance Bar Equalizer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: height,
        }}
      >
        <LiveAudioVisualizerBar
          analyzer={analyzer}
          barCount={9}
          color={color}
          secondaryColor={secondaryColor}
          height={height}
          showDbBadge={true}
        />
      </Box>
    </Box>
  );
}

// Keep legacy Wave and Aura components accessible for test suite compatibility
export const _legacyVisualizerComponents = { LiveAudioVisualizerWave, AgentAudioVisualizerAura };


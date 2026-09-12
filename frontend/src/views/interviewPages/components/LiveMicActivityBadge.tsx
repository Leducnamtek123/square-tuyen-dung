'use client';

import React from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import type { AudioAnalyzerResult } from '../hooks/useLiveAudioTrackAnalyzer';

interface LiveMicActivityBadgeProps {
  analyzer: AudioAnalyzerResult;
  isMuted?: boolean;
}

/**
 * Floating glassmorphic microphone activity badge for video tile overlays.
 * Displays real-time audio dB level and mini equalizer bars when speaking.
 */
export function LiveMicActivityBadge({ analyzer, isMuted = false }: LiveMicActivityBadgeProps) {
  const { isSpeaking, dbLevel, bands } = analyzer;
  const miniBars = bands.slice(0, 5);

  if (isMuted) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: '9999px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
        }}
      >
        <FontAwesomeIcon icon={faMicrophoneSlash} style={{ fontSize: '11px' }} />
        <span style={{ fontSize: '11px', fontWeight: 600 }}>Tắt mic</span>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: '9999px',
        backgroundColor: isSpeaking ? 'rgba(14, 165, 233, 0.22)' : 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: isSpeaking ? 'rgba(56, 189, 248, 0.55)' : 'rgba(51, 65, 85, 0.6)',
        boxShadow: isSpeaking ? '0 0 14px rgba(14, 165, 233, 0.35)' : 'none',
        transition: 'all 0.18s ease',
      }}
    >
      <FontAwesomeIcon
        icon={faMicrophone}
        style={{
          fontSize: '11px',
          color: isSpeaking ? '#38bdf8' : '#94a3b8',
          filter: isSpeaking ? 'drop-shadow(0 0 4px #38bdf8)' : 'none',
          transition: 'all 0.18s ease',
        }}
      />

      {/* Mini 5-bar voice activity equalizer */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '12px' }}>
        {miniBars.map((b, idx) => {
          const heightPx = isSpeaking ? Math.max(3, Math.min(12, Math.round(b * 12 + 2))) : 3;
          return (
            <Box
              key={idx}
              sx={{
                width: '2.5px',
                height: `${heightPx}px`,
                borderRadius: '9999px',
                backgroundColor: isSpeaking ? '#38bdf8' : '#64748b',
                transition: 'height 0.08s ease',
              }}
            />
          );
        })}
      </Box>

      {/* Live dB meter */}
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 600,
          color: isSpeaking ? '#e0f2fe' : '#94a3b8',
        }}
      >
        {isSpeaking ? `${dbLevel} dB` : '-55 dB'}
      </span>
    </Box>
  );
}

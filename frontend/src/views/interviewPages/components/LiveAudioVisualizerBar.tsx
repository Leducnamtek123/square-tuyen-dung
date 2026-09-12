'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import type { AudioAnalyzerResult } from '../hooks/useLiveAudioTrackAnalyzer';

interface LiveAudioVisualizerBarProps {
  analyzer: AudioAnalyzerResult;
  barCount?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
  height?: number | string;
  showDbBadge?: boolean;
}

/**
 * Multiband Equalizer Bar visualizer matching LiveKit Agent UI.
 * Individual rounded pill bars jump and scale dynamically with acoustic dB levels.
 * Uses hardware-accelerated GPU transforms with zero React re-renders for 60fps smoothness and no memory leaks.
 */
export function LiveAudioVisualizerBar({
  analyzer,
  barCount = 9,
  color = '#38bdf8',
  secondaryColor = '#6366f1',
  className = '',
  height = 140,
  showDbBadge = true,
}: LiveAudioVisualizerBarProps) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dbBadgeTextRef = useRef<HTMLSpanElement | null>(null);
  const dbBadgeDotRef = useRef<HTMLDivElement | null>(null);

  // Static array to generate bar elements once
  const initialBars = React.useMemo(() => new Array(barCount).fill(0), [barCount]);

  useEffect(() => {
    let animId: number;
    let isDisposed = false;

    const tick = () => {
      if (isDisposed) return;
      const current = analyzer.latestRef?.current || analyzer;
      const { bands = [], volume = 0, isSpeaking = false, dbLevel = -60 } = current;

      const displayBands: number[] = [];
      const half = Math.floor(barCount / 2);

      for (let i = 0; i < barCount; i++) {
        const distFromCenter = Math.abs(i - half) / Math.max(1, half);
        const bandIdx = Math.min(bands.length - 1, Math.floor(distFromCenter * bands.length));
        const bandVal = bands[bandIdx] || 0.08;
        const weight = 1.0 - distFromCenter * 0.25;
        const barHeight = isSpeaking
          ? Math.max(12, Math.min(100, (bandVal * 0.75 + volume * 0.4) * weight * 100))
          : Math.max(8, bandVal * 40);

        displayBands.push(barHeight);

        const barEl = barRefs.current[i];
        if (barEl) {
          const scale = Math.max(0.12, Math.min(1.0, barHeight / 100));
          barEl.style.transform = `scaleY(${scale})`;
          if (isSpeaking) {
            barEl.style.opacity = '1';
            barEl.style.boxShadow = `0 0 10px ${color}aa`;
          } else {
            barEl.style.opacity = '0.45';
            barEl.style.boxShadow = 'none';
          }
        }
      }

      if (dbBadgeTextRef.current) {
        dbBadgeTextRef.current.textContent = isSpeaking ? `${dbLevel} dB` : 'Đang lắng nghe...';
      }
      if (dbBadgeDotRef.current) {
        dbBadgeDotRef.current.style.backgroundColor = isSpeaking ? color : '#64748b';
        dbBadgeDotRef.current.style.boxShadow = isSpeaking ? `0 0 8px ${color}` : 'none';
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
    };
  }, [analyzer, barCount, color]);

  const { isSpeaking, dbLevel } = analyzer;
  const isCompact = typeof height === 'number' && height <= 32;
  const barWidth = isCompact ? '3px' : '4.5px';
  const barMaxHeight = isCompact ? `${Math.max(10, (height as number) - 4)}px` : '32px';
  const barGap = isCompact ? '3px' : '5px';
  const barsContainerHeight = isCompact ? `${height}px` : '36px';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isCompact ? 0 : 1.25,
        height,
        width: '100%',
        overflow: 'hidden',
      }}
      className={className}
    >
      {/* Equalizer Bars Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: barGap,
          height: barsContainerHeight,
          px: isCompact ? 0 : 1,
          overflow: 'hidden',
        }}
      >
        {initialBars.map((_, idx) => (
          <Box
            key={idx}
            ref={(el: HTMLDivElement | null) => {
              barRefs.current[idx] = el;
            }}
            sx={{
              width: barWidth,
              height: barMaxHeight,
              borderRadius: '9999px',
              background: `linear-gradient(to top, ${secondaryColor}, ${color})`,
              transformOrigin: 'center',
              transform: 'scaleY(0.15)',
              willChange: 'transform, opacity, box-shadow',
              transition: 'opacity 0.15s ease',
            }}
          />
        ))}
      </Box>

      {/* Live dB / Activity Badge */}
      {showDbBadge && !isCompact && (
        <Box
          sx={{
            px: 1.25,
            py: 0.25,
            borderRadius: '9999px',
            backgroundColor: isSpeaking ? 'rgba(14, 165, 233, 0.08)' : '#f1f5f9',
            border: '1px solid',
            borderColor: isSpeaking ? 'rgba(56, 189, 248, 0.4)' : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            transition: 'all 0.2s ease',
          }}
        >
          <Box
            ref={dbBadgeDotRef}
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: isSpeaking ? color : '#94a3b8',
              boxShadow: isSpeaking ? `0 0 6px ${color}` : 'none',
              transition: 'background-color 0.2s ease',
            }}
          />
          <span
            ref={dbBadgeTextRef}
            style={{
              fontSize: '10.5px',
              fontFamily: 'monospace',
              fontWeight: 600,
              color: isSpeaking ? '#0284c7' : '#64748b',
            }}
          >
            {isSpeaking ? `${dbLevel} dB` : 'Đang lắng nghe...'}
          </span>
        </Box>
      )}
    </Box>
  );
}


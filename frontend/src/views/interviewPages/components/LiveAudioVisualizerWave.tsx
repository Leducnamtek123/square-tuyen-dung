'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import type { AudioAnalyzerResult } from '../hooks/useLiveAudioTrackAnalyzer';

interface LiveAudioVisualizerWaveProps {
  analyzer: AudioAnalyzerResult;
  color?: string;
  secondaryColor?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  showDbBadge?: boolean;
}

/**
 * High-performance fluid sine-wave visualizer inspired by LiveKit Agent UI.
 * Renders multiple harmonic sinusoidal layers that pulse and ripple dynamically with speech frequencies.
 */
export function LiveAudioVisualizerWave({
  analyzer,
  color = '#38bdf8',
  secondaryColor = '#818cf8',
  className = '',
  width = '100%',
  height = 140,
  showDbBadge = true,
}: LiveAudioVisualizerWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef(0);
  const animIdRef = useRef<number | null>(null);
  const analyzerRef = useRef(analyzer);
  analyzerRef.current = analyzer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const { volume, isSpeaking, bands } = analyzerRef.current;

      // Increase phase speed when speaking
      const speed = isSpeaking ? 6.5 + volume * 5 : 2.0;
      phaseRef.current += dt * speed;
      const phase = phaseRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Base amplitude scales dynamically with volume
      const baseAmp = isSpeaking
        ? Math.min(h * 0.44, 12 + volume * (h * 0.42))
        : 6 + Math.sin(phase * 1.5) * 2.5;

      // Draw helper function for a smooth windowed sine wave
      const drawWave = (
        wavePhase: number,
        frequency: number,
        amplitude: number,
        strokeColor: string,
        lineWidth: number,
        harmonicOffset = 0,
      ) => {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const step = 2;
        const totalPoints = Math.floor(w / step);

        for (let i = 0; i <= totalPoints; i++) {
          const x = i * step;
          // Normalized horizontal position 0 to 1
          const normX = x / w;

          // Hanning window function so ends gently taper to flat line at left/right edges
          const windowFunc = Math.sin(Math.PI * normX);
          const taper = Math.pow(windowFunc, 2.2);

          // Multiband influence on harmonic frequency
          const bandIdx = Math.min(bands.length - 1, Math.floor(normX * bands.length));
          const bandEnergy = bands[bandIdx] || 0.1;

          // Sinusoidal wave equation with frequency modulation
          const sinVal =
            Math.sin(normX * frequency * Math.PI * 2 + wavePhase) * 0.75 +
            Math.sin(normX * (frequency * 1.6) * Math.PI * 2 + wavePhase * 1.3 + harmonicOffset) *
              0.25 *
              (1 + bandEnergy);

          const y = midY - sinVal * amplitude * taper;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      // 1. Ambient Glow Wave (blurred cyan/indigo)
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      drawWave(
        phase * 0.85,
        2.2,
        baseAmp * 0.85,
        'rgba(56, 189, 248, 0.28)',
        lineWidthForSize(h) * 1.6,
        1.2,
      );

      // 2. Secondary Harmonic Wave (Indigo / Violet)
      ctx.shadowBlur = 8;
      ctx.shadowColor = secondaryColor;
      drawWave(
        phase * 1.15 + 1.6,
        3.1,
        baseAmp * 0.75,
        'rgba(129, 140, 248, 0.55)',
        lineWidthForSize(h) * 0.8,
        0.8,
      );

      // 3. Core Vibrant Foreground Wave
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      drawWave(
        phase,
        2.5,
        baseAmp,
        color,
        lineWidthForSize(h),
        0,
      );

      ctx.shadowBlur = 0;
      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [color, secondaryColor]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        position: 'relative',
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        width={360}
        height={120}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          maxHeight: '130px',
          display: 'block',
        }}
      />
      {showDbBadge && (
        <Box
          sx={{
            mt: 0.5,
            px: 1.5,
            py: 0.3,
            borderRadius: '9999px',
            backgroundColor: analyzer.isSpeaking
              ? 'rgba(14, 165, 233, 0.18)'
              : 'rgba(51, 65, 85, 0.4)',
            border: '1px solid',
            borderColor: analyzer.isSpeaking
              ? 'rgba(56, 189, 248, 0.45)'
              : 'rgba(71, 85, 105, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transition: 'all 0.2s ease',
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: analyzer.isSpeaking ? '#38bdf8' : '#64748b',
              boxShadow: analyzer.isSpeaking ? '0 0 8px #38bdf8' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: analyzer.isSpeaking ? '#e0f2fe' : '#94a3b8' }}>
            {analyzer.isSpeaking ? `${analyzer.dbLevel} dB` : 'Đang lắng nghe...'}
          </span>
        </Box>
      )}
    </Box>
  );
}

function lineWidthForSize(height: number): number {
  if (height >= 180) return 3.5;
  if (height >= 120) return 3.0;
  return 2.4;
}

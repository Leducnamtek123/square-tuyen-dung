'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { type MotionProps, motion } from 'motion/react';
import { useTrackVolume, type TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { cn } from '@/lib/utils';

const MotionDiv = motion.div;

interface AgentAudioVisualizerAuraProps extends MotionProps {
  audioTrack?: TrackReferenceOrPlaceholder;
  color?: `#${string}`;
  colorShift?: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export function AgentAudioVisualizerAura({
  audioTrack,
  color = '#38bdf8',
  colorShift = 0.25,
  className,
  variant = 'default',
  style,
  ...props
}: AgentAudioVisualizerAuraProps) {
  const activeAudioTrack =
    audioTrack && 'publication' in audioTrack && audioTrack.publication ? audioTrack : undefined;
  const volume = useTrackVolume(activeAudioTrack);

  const intensity = Math.max(0.12, Math.min(1, volume * 1.8));
  const glow = useMemo(() => {
    const accent = color;
    const outer = `${accent}33`;
    const inner = `${accent}55`;
    const core = `${accent}80`;

    return {
      background: `radial-gradient(circle at center,
        ${core} 0%,
        ${inner} 22%,
        ${outer} 42%,
        rgba(2, 6, 23, 0) 72%
      )`,
      boxShadow: `
        0 0 0 1px rgba(255,255,255,0.05) inset,
        0 0 32px ${accent}26,
        0 0 90px ${accent}12
      `,
      filter: `hue-rotate(${Math.round(colorShift * 140)}deg) saturate(${1 + intensity * 0.6})`,
    } as CSSProperties;
  }, [color, colorShift, intensity]);

  return (
    <MotionDiv
      {...props}
      className={cn(
        variant === 'compact'
          ? 'relative flex h-6 w-[44px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 backdrop-blur-xl'
          : 'relative flex aspect-square size-[300px] items-center justify-center overflow-hidden rounded-full',
        variant === 'compact'
          ? 'shadow-[0_0_24px_rgba(56,189,248,0.14)]'
          : 'bg-transparent md:size-[450px]',
        className
      )}
      style={{
        ...style,
        ...glow,
      }}
      animate={{
        scale: 1 + intensity * 0.02,
      }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 28,
        mass: 1,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === 'compact'
              ? 'radial-gradient(circle at center, rgba(56, 189, 248, 0.28) 0%, rgba(56, 189, 248, 0.12) 42%, rgba(2, 6, 23, 0) 78%)'
              : 'radial-gradient(circle at center, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.08) 30%, rgba(2, 6, 23, 0) 70%)',
        }}
      />

      <MotionDiv
        className={cn(
          'absolute rounded-full blur-2xl',
          variant === 'compact' ? 'inset-[10%]' : 'inset-[16%]'
        )}
        style={{
          background:
            variant === 'compact'
              ? 'radial-gradient(circle at center, rgba(56, 189, 248, 0.5) 0%, rgba(56, 189, 248, 0.18) 42%, rgba(2, 6, 23, 0) 76%)'
              : 'radial-gradient(circle at center, rgba(56, 189, 248, 0.3) 0%, rgba(56, 189, 248, 0.14) 35%, rgba(2, 6, 23, 0) 72%)',
        }}
        animate={{
          scale: variant === 'compact' ? 0.94 + intensity * 0.12 : 0.86 + intensity * 0.18,
          opacity: variant === 'compact' ? 0.45 + intensity * 0.55 : 0.65 + intensity * 0.35,
        }}
        transition={{
          type: 'spring',
          stiffness: 180,
          damping: 18,
        }}
      />

      <MotionDiv
        className={cn(
          'absolute rounded-full border border-cyan-200/20 bg-cyan-400/10 backdrop-blur-md',
          variant === 'compact' ? 'inset-[24%] shadow-[0_0_24px_rgba(56,189,248,0.16)]' : 'inset-[28%] shadow-[0_0_60px_rgba(56,189,248,0.2)]'
        )}
        animate={{
          scale: variant === 'compact' ? 0.96 + intensity * 0.08 : 0.92 + intensity * 0.12,
          boxShadow: [
            '0 0 20px rgba(56,189,248,0.10)',
            '0 0 60px rgba(56,189,248,0.28)',
          ],
        }}
        transition={{
          type: 'spring',
          stiffness: 160,
          damping: 16,
        }}
      />

      <MotionDiv
        className={cn(
          'absolute rounded-full border border-white/15 bg-slate-950/30',
          variant === 'compact' ? 'inset-[40%]' : 'inset-[38%]'
        )}
        animate={{
          scale: variant === 'compact' ? 0.98 + intensity * 0.04 : 0.9 + intensity * 0.06,
        }}
        transition={{
          type: 'spring',
          stiffness: 240,
          damping: 26,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_42%,rgba(2,6,23,0.05)_62%,rgba(2,6,23,0.18)_100%)]" />
    </MotionDiv>
  );
}

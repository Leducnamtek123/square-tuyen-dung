'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { AgentState } from '@livekit/components-react';
import { useAvatarState } from './AvatarStateController';
import { AvatarImage } from './AvatarImage';
import { AVATAR_STATE_META } from './avatarStates';
import { LiveAudioVisualizerBar } from '../LiveAudioVisualizerBar';
import { useLiveAudioTrackAnalyzer } from '../../hooks/useLiveAudioTrackAnalyzer';

interface InterviewAvatarProps {
  audioTrack?: unknown;
  voiceAssistantState?: AgentState;
  isSpeakingHint?: boolean;
  sessionStatus?: string;
  interviewerName?: string;
  avatarImageUrl?: string | null;
  avatarBackgroundUrl?: string | null;
  avatarBackdrop?: string | null;
  className?: string;
}

/**
 * Production-ready Lightweight 2.5D AI Interviewer Avatar Component.
 * Employs pre-rendered high-end 3D-styled image states, GPU CSS micro-animations,
 * custom studio backdrop environments, and minimalist top-right audio activity indicator.
 */
export function InterviewAvatar({
  audioTrack,
  voiceAssistantState,
  isSpeakingHint = false,
  sessionStatus,
  interviewerName = 'Trợ lý AI AILA',
  avatarImageUrl,
  avatarBackgroundUrl,
  avatarBackdrop = 'modern_office',
  className = '',
}: InterviewAvatarProps) {
  const { state, assetSrc, isSpeaking } = useAvatarState({
    voiceAssistantState,
    isSpeaking: isSpeakingHint,
    sessionStatus,
  });

  const meta = AVATAR_STATE_META[state] || AVATAR_STATE_META.idle;

  // Real-time audio analyzer for minimalist top-right audio activity pill
  const analyzer = useLiveAudioTrackAnalyzer(audioTrack, {
    bandCount: 5,
    isSpeakingHint: isSpeaking,
  });

  // Dynamic studio background configuration
  const resolveStudioBackground = () => {
    const defaultOfficeBg = '/images/avatar/ai-interview-office-bg.jpg';
    const bgUrl = avatarBackgroundUrl || defaultOfficeBg;

    return {
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.14)), url("${bgUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 40%',
      backgroundColor: '#0f172a',
    };
  };

  const studioBg = resolveStudioBackground();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '16px',
        ...studioBg,
        border: '1px solid',
        borderColor: isSpeaking ? '#0ea5e9' : '#e2e8f0',
        boxShadow: isSpeaking
          ? '0 0 24px rgba(14, 165, 233, 0.22), 0 4px 16px rgba(0, 0, 0, 0.04)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className={className}
    >
      {/* Subtle Studio Ambient Lighting to make character pop from background */}
      <Box
        sx={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%',
          height: '68%',
          borderRadius: '50%',
          background: isSpeaking
            ? 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)',
          pointerEvents: 'none',
          filter: 'blur(28px)',
          zIndex: 4,
          transition: 'background 0.4s ease',
        }}
      />

      {/* Main Avatar Character Frame with GPU Breathing Animation */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: { xs: '86%', sm: '82%', md: '78%', lg: '76%' },
          maxHeight: { xs: '86%', sm: '82%', md: '78%', lg: '76%' },
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 10,
          '@keyframes avatarBreathing': {
            '0%': { transform: 'translateX(-50%) translateY(0px) scale(1)' },
            '50%': { transform: 'translateX(-50%) translateY(-2.5px) scale(1.008)' },
            '100%': { transform: 'translateX(-50%) translateY(0px) scale(1)' },
          },
          animation: isSpeaking
            ? 'avatarBreathing 2.4s ease-in-out infinite'
            : 'avatarBreathing 4s ease-in-out infinite',
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        {avatarImageUrl ? (
          <Box
            component="img"
            src={avatarImageUrl}
            alt={interviewerName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              filter: 'drop-shadow(0 10px 24px rgba(15, 23, 42, 0.12))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <AvatarImage
            src={assetSrc}
            state={state}
            alt={`${interviewerName} - ${meta.labelVi}`}
          />
        )}
      </Box>

      {/* Top-Left Floating State Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.45,
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid #e2e8f0',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.25s ease',
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: meta.dotColor,
            boxShadow: `0 0 8px ${meta.dotColor}`,
            '@keyframes dotPulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.4, transform: 'scale(0.85)' },
            },
            animation: isSpeaking ? 'dotPulse 1.2s ease-in-out infinite' : 'none',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '0.2px',
          }}
        >
          {meta.labelVi}
        </Typography>
      </Box>

      {/* Bottom-Right Floating Minimalist Voice Visualizer Pill */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.25,
          py: 0.4,
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid #e2e8f0',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '28px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <LiveAudioVisualizerBar
            analyzer={analyzer}
            barCount={4}
            color="#2563eb"
            secondaryColor="#3b82f6"
            height={14}
            showDbBadge={false}
          />
        </Box>
      </Box>
    </Box>
  );
}


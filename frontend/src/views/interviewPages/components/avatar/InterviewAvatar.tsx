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
  avatarId?: string;
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
  avatarId,
  avatarImageUrl,
  avatarBackgroundUrl,
  avatarBackdrop = 'modern_office',
  className = '',
}: InterviewAvatarProps) {
  const isCustomUploadedImage = Boolean(
    avatarImageUrl &&
    !avatarImageUrl.includes('/assets/images/avatar/') &&
    avatarId !== 'expert_male' &&
    avatarId !== 'aila_recruiter'
  );

  const effectiveAvatarId = avatarId || (avatarImageUrl?.includes('expert_male') ? 'expert_male' : 'aila_recruiter');

  const { state, assetSrc, isSpeaking } = useAvatarState({
    avatarId: effectiveAvatarId,
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
      backgroundImage: `url("${bgUrl}")`,
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
        backgroundColor: '#0f172a',
        border: '1px solid',
        borderColor: isSpeaking ? '#0ea5e9' : '#e2e8f0',
        boxShadow: isSpeaking
          ? '0 0 24px rgba(14, 165, 233, 0.22), 0 4px 16px rgba(0, 0, 0, 0.04)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className={className}
    >
      {/* Studio Background Layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          ...studioBg,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Avatar Character Frame */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: { xs: '88%', sm: '85%', md: '82%', lg: '80%' },
          maxHeight: { xs: '88%', sm: '85%', md: '82%', lg: '80%' },
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 10,
          '@keyframes avatarBreathing': {
            '0%': { transform: 'translateX(-50%) translateY(0px)' },
            '50%': { transform: 'translateX(-50%) translateY(-1.5px)' },
            '100%': { transform: 'translateX(-50%) translateY(0px)' },
          },
          animation: isSpeaking
            ? 'avatarBreathing 2.6s ease-in-out infinite'
            : 'avatarBreathing 4.5s ease-in-out infinite',
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        {isCustomUploadedImage && avatarImageUrl ? (
          <Box
            component="img"
            src={avatarImageUrl}
            alt={interviewerName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <AvatarImage
            avatarId={effectiveAvatarId}
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


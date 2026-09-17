'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { PRELOAD_AVATAR_STATES, getAvatarAssetPaths, AVATAR_ASSET_PATHS, AvatarState } from './avatarStates';

interface AvatarImageProps {
  src: string;
  state: AvatarState;
  avatarId?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

/**
 * High-performance 2.5D Avatar Image renderer with zero-flicker dual-buffer crossfade.
 * Preloads essential state assets immediately and respects prefers-reduced-motion.
 */
export function AvatarImage({
  src,
  state,
  avatarId,
  alt = 'AI Interviewer Avatar',
  className = '',
}: AvatarImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const preloadedMapRef = useRef<Set<string>>(new Set());

  // 1. Preloading of core avatar states for active avatar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const paths = getAvatarAssetPaths(avatarId);
    PRELOAD_AVATAR_STATES.forEach((st) => {
      const path = paths[st];
      if (path && !preloadedMapRef.current.has(path)) {
        const img = new window.Image();
        img.src = path;
        preloadedMapRef.current.add(path);
      }
    });
  }, [avatarId]);

  // 2. Smooth crossfade when src changes
  useEffect(() => {
    if (src === currentSrc) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCurrentSrc(src);
      setPrevSrc(null);
      setIsCrossFading(false);
      setHasError(false);
      return;
    }

    // Instant swap for speaking frames and eye blinks to avoid ghosting or blurry mouth
    const isSpeakingTransition = src.includes('speaking') || currentSrc.includes('speaking');
    const isBlinkTransition = src.includes('blink') || currentSrc.includes('blink');

    if (isSpeakingTransition || isBlinkTransition) {
      setCurrentSrc(src);
      setPrevSrc(null);
      setIsCrossFading(false);
      setHasError(false);
      return;
    }

    // Preload incoming image before fading for major state transitions
    const incomingImg = new window.Image();
    incomingImg.src = src;
    incomingImg.onload = () => {
      setPrevSrc(currentSrc);
      setCurrentSrc(src);
      setIsCrossFading(true);
      setHasError(false);

      const timer = setTimeout(() => {
        setPrevSrc(null);
        setIsCrossFading(false);
      }, 120);

      return () => clearTimeout(timer);
    };

    incomingImg.onerror = () => {
      console.warn(`[InterviewAvatar] Asset failed to load: ${src}`);
      setHasError(true);
    };
  }, [src, currentSrc]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      className={className}
    >
      {/* Previous fading-out image buffer */}
      {prevSrc && isCrossFading && (
        <Box
          component="img"
          src={prevSrc}
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0,
            transition: 'opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Current active image buffer */}
      <Box
        component="img"
        src={hasError ? (getAvatarAssetPaths(avatarId).idle || AVATAR_ASSET_PATHS.idle) : currentSrc}
        alt={alt}
        onError={() => {
          console.warn(`[InterviewAvatar] Primary image load error for state: ${state}`);
          setHasError(true);
        }}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'bottom center',
          opacity: 1,
          transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      />
    </Box>
  );
}

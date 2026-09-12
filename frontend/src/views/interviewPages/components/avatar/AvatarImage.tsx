'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { PRELOAD_AVATAR_STATES, AVATAR_ASSET_PATHS, AvatarState } from './avatarStates';

interface AvatarImageProps {
  src: string;
  state: AvatarState;
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
  alt = 'AI Interviewer Avatar',
  className = '',
}: AvatarImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const preloadedMapRef = useRef<Set<string>>(new Set());

  // 1. One-time preloading of core avatar states
  useEffect(() => {
    if (typeof window === 'undefined') return;

    PRELOAD_AVATAR_STATES.forEach((st) => {
      const path = AVATAR_ASSET_PATHS[st];
      if (path && !preloadedMapRef.current.has(path)) {
        const img = new window.Image();
        img.src = path;
        preloadedMapRef.current.add(path);
      }
    });
  }, []);

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

    // Preload incoming image before fading
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
            filter: 'drop-shadow(0 10px 24px rgba(15, 23, 42, 0.08))',
          }}
        />
      )}

      {/* Current active image buffer */}
      <Box
        component="img"
        src={hasError ? AVATAR_ASSET_PATHS.idle : currentSrc}
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
          filter: 'drop-shadow(0 10px 24px rgba(15, 23, 42, 0.09))',
          willChange: 'transform',
        }}
      />
    </Box>
  );
}

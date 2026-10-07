'use client';

import React from 'react';
import { Box } from '@mui/material';

interface AnimatedFlameProps {
  size?: number;
  className?: string;
}

/**
 * AnimatedFlame Component
 * Displays a realistic multi-layered burning flame ("cục lửa bốc cháy animation")
 * with swaying body, dancing inner flame tongue, hot core, and rising embers.
 */
export const AnimatedFlame: React.FC<AnimatedFlameProps> = ({ size = 20, className }) => {
  return (
    <Box
      component="span"
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        position: 'relative',
        userSelect: 'none',
        lineHeight: 1,
        verticalAlign: 'middle',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          animation: 'flameBodyDance 1.6s infinite ease-in-out',
          transformOrigin: '50% 90%',
          willChange: 'transform',
          filter: 'drop-shadow(0 0 3px rgba(249, 115, 22, 0.65)) drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))',
          '@keyframes flameBodyDance': {
            '0%': {
              transform: 'scale(1) rotate(0deg)',
            },
            '25%': {
              transform: 'scale(1.05, 0.95) rotate(-2.5deg)',
            },
            '50%': {
              transform: 'scale(0.97, 1.04) rotate(2deg)',
            },
            '75%': {
              transform: 'scale(1.04, 1.01) rotate(-1.5deg)',
            },
            '100%': {
              transform: 'scale(1) rotate(0deg)',
            },
          },
        }}
      >
        <defs>
          {/* Outer Layer Gradient: Fiery Red to Bright Orange */}
          <linearGradient id="flameOuterGrad" x1="12" y1="24" x2="12" y2="1" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="40%" stopColor="#EF4444" />
            <stop offset="75%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Inner Layer Gradient: Orange to Golden Amber */}
          <linearGradient id="flameInnerGrad" x1="12.5" y1="23" x2="12.5" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          {/* Core Layer Gradient: Warm Gold to Hot White */}
          <linearGradient id="flameCoreGrad" x1="12.5" y1="22" x2="12.5" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="70%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* 1. Outer Chubby Flame Silhouette (Bụng tròn mập r=9 + twin lively fire tongues) */}
        <path
          d="M19.3 10.1c-1.4-.9-2.8-1.6-3.9-2.7-1.7-1.7-2.4-3.8-2.4-5.9 0-.5-.4-1-1-1s-1 .4-1 1c0 2.9-1.6 5.4-3.5 7-1.9 1.6-3.5 3.7-3.5 6.5 0 5 4 9 9 9s9-4 9-9c0-1.8-.5-3.5-1.7-4.9z"
          fill="url(#flameOuterGrad)"
        />

        {/* 2. Dancing Plump Inner Flame */}
        <Box
          component="path"
          d="M12.5 8.5c-2 2.6-4.5 5.2-4.5 8.5 0 3.3 2 5.5 4.5 5.5s4.5-2.2 4.5-5.5c0-3.3-2.5-5.9-4.5-8.5z"
          fill="url(#flameInnerGrad)"
          sx={{
            transformOrigin: '12.5px 17px',
            animation: 'innerFlameLick 0.9s infinite ease-in-out',
            '@keyframes innerFlameLick': {
              '0%': { transform: 'scale(1, 1) translateY(0)' },
              '40%': { transform: 'scale(0.94, 1.1) translateY(-0.6px)' },
              '75%': { transform: 'scale(1.05, 0.95) translateY(0.3px)' },
              '100%': { transform: 'scale(1, 1) translateY(0)' },
            },
          }}
        />

        {/* 3. White-Hot Center Core */}
        <Box
          component="path"
          d="M12.5 13.5c-1.2 1.6-2.2 3.1-2.2 4.8 0 1.8 1 3.2 2.2 3.2s2.2-1.4 2.2-3.2c0-1.7-1-3.2-2.2-4.8z"
          fill="url(#flameCoreGrad)"
          sx={{
            transformOrigin: '12.5px 18px',
            animation: 'corePulse 0.7s infinite alternate ease-in-out',
            '@keyframes corePulse': {
              '0%': { opacity: 0.85, transform: 'scale(0.95)' },
              '100%': { opacity: 1, transform: 'scale(1.1)' },
            },
          }}
        />

        {/* 4. Rising Flame Embers (Tia lửa bốc cháy) */}
        <Box
          component="circle"
          cx="11.5"
          cy="3.5"
          r="0.8"
          fill="#FEF08A"
          sx={{
            transformOrigin: '11.5px 3.5px',
            animation: 'emberFloat1 1.4s infinite ease-out',
            '@keyframes emberFloat1': {
              '0%': { transform: 'translate(0, 0) scale(1)', opacity: 0 },
              '20%': { opacity: 1 },
              '70%': { opacity: 0.7 },
              '100%': { transform: 'translate(-2px, -6px) scale(0.2)', opacity: 0 },
            },
          }}
        />

        <Box
          component="circle"
          cx="13.5"
          cy="2"
          r="0.75"
          fill="#F59E0B"
          sx={{
            transformOrigin: '13.5px 2px',
            animation: 'emberFloat2 1.7s infinite ease-out 0.4s',
            '@keyframes emberFloat2': {
              '0%': { transform: 'translate(0, 0) scale(1)', opacity: 0 },
              '25%': { opacity: 1 },
              '75%': { opacity: 0.6 },
              '100%': { transform: 'translate(2.5px, -7px) scale(0.2)', opacity: 0 },
            },
          }}
        />

        <Box
          component="circle"
          cx="9.5"
          cy="5.5"
          r="0.6"
          fill="#F97316"
          sx={{
            transformOrigin: '9.5px 5.5px',
            animation: 'emberFloat3 1.2s infinite ease-out 0.8s',
            '@keyframes emberFloat3': {
              '0%': { transform: 'translate(0, 0) scale(1)', opacity: 0 },
              '30%': { opacity: 0.9 },
              '80%': { opacity: 0.5 },
              '100%': { transform: 'translate(-1.5px, -5px) scale(0.2)', opacity: 0 },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default AnimatedFlame;

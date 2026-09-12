import React from 'react';
import { Box, Avatar } from '@mui/material';
import { CHATBOT_ICONS } from '@/configs/images';

export interface AilaLogoProps {
  size?: number;
  variant?: 'mark' | 'avatar' | 'glyph' | 'full';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AILA AI Brand Mark & Mascot Component
 * Displays the official AILA AI robot mascot across InfoHR AI Interview platform.
 */
export const AilaLogo: React.FC<AilaLogoProps> = ({
  size = 16,
  variant = 'mark',
  className,
  style,
}) => {
  const iconSrc =
    typeof CHATBOT_ICONS.JOB_SEEKER === 'string'
      ? CHATBOT_ICONS.JOB_SEEKER
      : (CHATBOT_ICONS.JOB_SEEKER as any)?.src || '/assets/icons/job_seeker_chatbot_icon.gif';

  // 1. Avatar Variant for large AI profile representations (40px - 56px)
  if (variant === 'avatar') {
    return (
      <Box
        className={className}
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
      >
        <Avatar
          src={iconSrc}
          alt="AILA AI"
          sx={{
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.28) + 'px',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            bgcolor: '#0f172a',
            p: 0.5,
          }}
        />
        {/* Subtle Online Pulse Dot */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: Math.max(7, Math.round(size * 0.22)),
            height: Math.max(7, Math.round(size * 0.22)),
            borderRadius: '50%',
            bgcolor: '#10b981',
            border: '1.5px solid #0f172a',
            boxShadow: '0 0 6px #10b981',
          }}
        />
      </Box>
    );
  }

  // 2. Full Wordmark Variant (Robot + "AILA" + "AI")
  if (variant === 'full') {
    return (
      <Box
        className={className}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          lineHeight: 1,
          flexShrink: 0,
          ...style,
        }}
      >
        <Box
          component="img"
          src={iconSrc}
          alt="AILA AI"
          sx={{
            width: size,
            height: size,
            objectFit: 'contain',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: `${Math.round(size * 0.95)}px`,
              letterSpacing: '-0.03em',
              color: 'inherit',
            }}
          >
            AILA
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: `${Math.max(9, Math.round(size * 0.55))}px`,
              letterSpacing: '0.04em',
              padding: '1px 4px',
              borderRadius: '4px',
              background: 'rgba(59, 130, 246, 0.18)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            AI
          </span>
        </Box>
      </Box>
    );
  }

  // 3. Mark & Glyph: Official mascot icon image with crisp pixel-perfect scaling
  return (
    <Box
      component="img"
      src={iconSrc}
      alt="AILA AI"
      className={className}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

export default AilaLogo;


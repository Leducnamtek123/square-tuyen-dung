'use client';

import React, { memo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { WORLD_MAP_DOTS } from './worldMapCoordinates';

interface DottedWorldMapBackgroundProps extends BoxProps {
  /** Dot fill color, defaults to brand-blue (#2563eb) */
  dotColor?: string;
  /** Opacity of the dotted map, defaults to subtle 0.38 */
  mapOpacity?: number;
  /** Dot radius in SVG coordinates, defaults to 1.65 */
  dotRadius?: number;
}

/**
 * Subtle dotted world map background pattern composed of brand-blue dots
 * with soft radial edge fading, positioned behind content.
 */
function DottedWorldMapBackground({
  dotColor = '#2563eb',
  mapOpacity = 0.38,
  dotRadius = 1.65,
  sx,
  ...rest
}: DottedWorldMapBackgroundProps) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Soft radial edge fading so dots dissolve seamlessly toward the margins
        maskImage:
          'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 65%, transparent 95%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 65%, transparent 95%)',
        ...sx,
      }}
      {...rest}
    >
      <svg
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%',
          opacity: mapOpacity,
        }}
      >
        <g fill={dotColor}>
          {WORLD_MAP_DOTS.map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r={dotRadius} />
          ))}
        </g>
      </svg>
    </Box>
  );
}

export default memo(DottedWorldMapBackground);

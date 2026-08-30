'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import type { StaticImageData } from 'next/image';

export interface MuiImageCustomProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | StaticImageData | null | undefined;
  fallbackSrc?: string | StaticImageData;
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  duration?: number;
  showLoading?: boolean | React.ReactNode;
  shift?: 'top' | 'bottom' | 'left' | 'right' | false | null;
  distance?: string | number;
  shiftDuration?: number;
  easing?: string;
  errorIcon?: boolean | React.ReactNode;
  sx?: SxProps<Theme>;
}

const resolveSrc = (src: string | StaticImageData | null | undefined): string => {
  if (!src) return '';
  if (typeof src === 'string') return src;
  if (typeof src === 'object' && 'src' in src && typeof src.src === 'string') {
    return src.src;
  }
  return '';
};

export const MuiImageCustom: React.FC<MuiImageCustomProps> = ({
  src,
  fallbackSrc,
  fit = 'contain',
  alt = '',
  loading = 'lazy',
  width,
  height,
  onError,
  sx,
  style,
  // Accepted for backward compatibility with mui-image props
  duration: _duration,
  showLoading: _showLoading,
  shift: _shift,
  distance: _distance,
  shiftDuration: _shiftDuration,
  easing: _easing,
  errorIcon: _errorIcon,
  ...rest
}) => {
  const resolvedSrc = resolveSrc(src);
  const resolvedFallback = resolveSrc(fallbackSrc);

  const initialSrc = resolvedSrc || resolvedFallback || '';
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    const nextSrc = resolveSrc(src) || resolveSrc(fallbackSrc) || '';
    setCurrentSrc(nextSrc);
    setHasFailed(false);
  }, [src, fallbackSrc]);

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (resolvedFallback && !hasFailed && currentSrc !== resolvedFallback) {
        setHasFailed(true);
        setCurrentSrc(resolvedFallback);
      }
      if (onError) {
        onError(event);
      }
    },
    [resolvedFallback, hasFailed, currentSrc, onError]
  );

  return (
    <Box
      component="img"
      src={currentSrc || resolvedFallback || undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      onError={handleError}
      style={{
        objectFit: fit,
        maxWidth: '100%',
        ...style,
      }}
      sx={{
        display: 'inline-block',
        verticalAlign: 'middle',
        transition: 'opacity 0.15s ease',
        ...sx,
      }}
      {...rest}
    />
  );
};

export default React.memo(MuiImageCustom);

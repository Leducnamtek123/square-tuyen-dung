'use client';

import React from 'react';
import Image from 'mui-image';
import type { StaticImageData } from 'next/image';

const ImageWithLoading = Image as React.ElementType;
type MuiImageBaseProps = React.ComponentPropsWithoutRef<typeof ImageWithLoading>;

type MuiImageCustomProps = Omit<MuiImageBaseProps, 'src' | 'onError'> & {
  loading?: 'lazy' | 'eager';
  src: string | StaticImageData | null | undefined;
  fallbackSrc?: string | StaticImageData;
  onError?: MuiImageBaseProps['onError'];
};

type ImageWithFallbackProps = Omit<MuiImageCustomProps, 'fallbackSrc' | 'src'> & {
  fallbackSrc: string;
  src: string;
};

const resolveSrc = (src: string | StaticImageData | null | undefined): string => {
  if (!src) return '';
  if (typeof src === 'string') return src;
  return src.src; // StaticImageData
};

const ImageWithFallback = ({
  loading,
  src,
  fallbackSrc,
  onError,
  ...rest
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = React.useState(false);
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  const handleError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallbackSrc && !hasError) {
        setHasError(true);
      }
      if (onError) {
        onError(event);
      }
    },
    [fallbackSrc, hasError, onError]
  );

  return (
    <ImageWithLoading
      key={imageSrc || 'empty-src'}
      loading={loading}
      fit="contain"
      duration={150}
      easing="ease-in"
      showLoading={false}
      errorIcon={true}
      shift={null}
      distance="100px"
      shiftDuration={600}
      src={imageSrc}
      onError={handleError}
      {...rest}
    />
  );
};

const MuiImageCustom = (props: MuiImageCustomProps) => {
  const {
    loading = 'lazy',
    src,
    fallbackSrc,
    onError,
    ...rest
  } = props;

  const resolvedFallback = resolveSrc(fallbackSrc);
  const resolvedSrc = resolveSrc(src) || resolvedFallback || '';

  return (
    <ImageWithFallback
      key={resolvedSrc || 'empty-src'}
      loading={loading}
      fallbackSrc={resolvedFallback}
      src={resolvedSrc}
      onError={onError}
      {...rest}
    />
  );
};

export default React.memo(MuiImageCustom);




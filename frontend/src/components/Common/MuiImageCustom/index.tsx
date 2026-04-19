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

const resolveSrc = (src: string | StaticImageData | null | undefined): string => {
  if (!src) return '';
  if (typeof src === 'string') return src;
  return src.src; // StaticImageData
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
  const [imageSrc, setImageSrc] = React.useState(resolveSrc(src) || resolvedFallback || '');

  React.useEffect(() => {
    setImageSrc(resolveSrc(src) || resolvedFallback || '');
  }, [src, resolvedFallback]);

  const handleError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (resolvedFallback && imageSrc !== resolvedFallback) {
        setImageSrc(resolvedFallback);
      }
      if (onError) {
        onError(event);
      }
    },
    [imageSrc, onError, resolvedFallback]
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

export default React.memo(MuiImageCustom);




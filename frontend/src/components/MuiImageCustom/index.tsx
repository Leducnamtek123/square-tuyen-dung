import React from 'react';
import Image from 'mui-image';

interface MuiImageCustomProps {
  loading?: 'lazy' | 'eager';
  src: string | null | undefined;
  fallbackSrc?: string;
  onError?: (event: any) => void;
  [key: string]: any;
}

const ImageWithLoading = Image as any;

const MuiImageCustom = (props: MuiImageCustomProps) => {

  const {
    loading = 'lazy',
    src,
    fallbackSrc,
    onError,
    ...rest
  } = props;

  const [imageSrc, setImageSrc] = React.useState(src || fallbackSrc || '');

  React.useEffect(() => {
    setImageSrc(src || fallbackSrc || '');
  }, [src, fallbackSrc]);

  const handleError = React.useCallback(
    (event: any) => {
      if (fallbackSrc && imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
      if (onError) {
        onError(event);
      }
    },
    [fallbackSrc, imageSrc, onError]
  );

  return (

    <ImageWithLoading

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

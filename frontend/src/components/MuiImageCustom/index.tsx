// @ts-nocheck
import React from 'react';

import Image from 'mui-image';

interface Props {
  [key: string]: any;
}



const MuiImageCustom = (props: Props) => {

  const {
    loading = 'lazy',
    src,
    fallbackSrc,
    onError,
    ...rest
  } = props;

  const [imageSrc, setImageSrc] = React.useState(src);

  React.useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleError = React.useCallback(
    (event) => {
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

    <Image

      loading={loading}

      fit="contain"

      duration={500}

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

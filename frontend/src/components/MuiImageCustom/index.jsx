import React from 'react';

import Image from 'mui-image';

const MuiImageCustom = (props) => {

  const { loading = 'lazy', ...rest } = props;

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

      {...rest}

    />

  );

};

export default React.memo(MuiImageCustom);

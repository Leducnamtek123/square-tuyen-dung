// @ts-nocheck
import * as React from 'react';

import Backdrop from '@mui/material/Backdrop';

import Fade from '@mui/material/Fade';

import { LOADING_IMAGES } from '../../../configs/constants';

interface Props {
  [key: string]: any;
}



const BackdropLoading = ({ bgColor = 'rgba(0, 0, 0, 0.4)', open = true }: Props) => {

  return (

    <Backdrop

      sx={{

        color: '#fff',

        backgroundColor: bgColor,

        position: 'fixed',

      }}

      style={{
        zIndex: 9999,
      }}
      open={open}
      slots={{ transition: Fade }}
      slotProps={{ transition: { timeout: 100 } }}
    >

      <img 

        src={LOADING_IMAGES.LOADING_SPINNER}

        alt="Loading ..."

        style={{

          width: '100px',

          height: 'auto',

          animation: 'spin 2s linear infinite'

        }}

      />

    </Backdrop>

  );

};

export default React.memo(BackdropLoading);

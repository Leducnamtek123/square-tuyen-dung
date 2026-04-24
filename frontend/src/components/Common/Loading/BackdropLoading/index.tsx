import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Image from 'next/image';
import { LOADING_IMAGES } from '@/configs/constants';

interface BackdropLoadingProps {
  bgColor?: string;
  open?: boolean;
}

const BackdropLoading = ({ bgColor = 'rgba(0, 0, 0, 0.4)', open = true }: BackdropLoadingProps) => {

  return (

    <Backdrop

      sx={{
        color: '#fff',
        backgroundColor: bgColor,
        position: 'fixed',
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
      open={open}
      transitionDuration={300}
    >

      <Image
        src={LOADING_IMAGES.LOADING_SPINNER}
        alt="Loading ..."
        width={100}
        height={100}
        style={{
          width: '100px',
          height: 'auto',
          animation: 'spin 1s linear infinite',
        }}
      />

    </Backdrop>

  );

};

export default React.memo(BackdropLoading);

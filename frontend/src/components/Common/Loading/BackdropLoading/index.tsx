import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
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

      <Box
        sx={{
          width: 100,
          height: 100,
          display: 'grid',
          placeItems: 'center',
          animation: 'sq-backdrop-spin 900ms linear infinite',
          animationDuration: '900ms !important',
          animationIterationCount: 'infinite !important',
          animationTimingFunction: 'linear !important',
          '@keyframes sq-backdrop-spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        }}
      >
        <Image
          src={LOADING_IMAGES.LOADING_SPINNER}
          alt="Loading ..."
          width={100}
          height={100}
          style={{
            width: '100px',
            height: 'auto',
            display: 'block',
          }}
        />
      </Box>

    </Backdrop>

  );

};

export default React.memo(BackdropLoading);

'use client';

import React from 'react';
import { Box, styled } from '@mui/material';
import Image from 'next/image';

interface AuthShowcasePanelProps {
  variant: 'employer' | 'candidate';
}

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '560px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F8FAFC',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  '&:hover': {
    '& .banner-image': {
      transform: 'scale(1.025)',
    },
  },
}));

const ImageWrapper = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '560px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const AuthShowcasePanel: React.FC<AuthShowcasePanelProps> = ({ variant }) => {
  const isEmployer = variant === 'employer';

  const imageSrc = isEmployer
    ? '/images/banners/auth-employer-banner.jpg'
    : '/images/banners/auth-candidate-banner.jpg';

  const altText = isEmployer
    ? 'InfoHR - Tuyển dụng nhân tài đột phá cùng AI'
    : 'InfoHR - Ứng tuyển 1 chạm mọi lúc mọi nơi';

  return (
    <BannerContainer
      sx={{
        background: isEmployer
          ? 'linear-gradient(165deg, #090E1A 0%, #0F172A 50%, #172554 100%)'
          : 'linear-gradient(165deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)',
      }}
    >
      <ImageWrapper>
        <Image
          src={imageSrc}
          alt={altText}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className="banner-image"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </ImageWrapper>
    </BannerContainer>
  );
};

export default AuthShowcasePanel;


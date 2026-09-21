'use client';

import React, { useState } from 'react';
import { Box, styled } from '@mui/material';
import Image from 'next/image';
import candidateBanner from '@/assets/images/banners/auth-candidate-banner.webp';
import employerBanner from '@/assets/images/banners/auth-employer-banner.webp';

interface AuthShowcasePanelProps {
  variant: 'employer' | 'candidate';
}

// Micro LQIP base64 blur thumbnails (0ms render, zero layout shift)
const CANDIDATE_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADQAwCdASoQABUAPzmEuVOvKKWisAgB4CcJbAC06CHQTgHms8txVMAA/rBUsyjQUR+g4CBKIJqZdRzTSjvi3sMJBJPe9Qy+sKxcYV4M66HcrYxGwjbYatWK+BpkB8ux2m1ddFqTuWGrXbFtXMwwnKI3FXL8AA==';

const EMPLOYER_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAABQBACdASoQABUAPzmEuVOvKKWisAgB4CcJbACdMoCGABT+UJvGnQA2JYegAP7APuJHCjtdSaypFf695iguTHKntuFdehrMIsq+ks8TKJlagMmx+BOlvrgvgGf14vsfDhubsMlByQVy2T/QMhvEpueGWNTkazmCszUAFOvc8n4wAA==';

const BannerContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '600px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0F172A',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  '&:hover': {
    '& .banner-image': {
      transform: 'scale(1.02)',
    },
  },
}));

const ImageWrapper = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '600px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const AuthShowcasePanel: React.FC<AuthShowcasePanelProps> = ({ variant }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isEmployer = variant === 'employer';

  const activeBanner = isEmployer ? employerBanner : candidateBanner;
  const blurDataUrl = isEmployer ? EMPLOYER_BLUR_DATA_URL : CANDIDATE_BLUR_DATA_URL;

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
          src={activeBanner}
          alt={altText}
          fill
          priority
          fetchPriority="high"
          decoding="async"
          placeholder="blur"
          blurDataURL={blurDataUrl}
          sizes="(max-width: 900px) 1px, 540px"
          className="banner-image"
          onLoad={() => setIsLoaded(true)}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isLoaded ? 1 : 0,
            transition:
              'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </ImageWrapper>
    </BannerContainer>
  );
};

export default AuthShowcasePanel;


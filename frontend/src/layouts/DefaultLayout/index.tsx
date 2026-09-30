'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container } from "@mui/material";
import Header from '../components/commons/Header';
import Footer from '../components/commons/Footer';
import OnboardingProgressBanner from '@/views/onboardingPages/components/OnboardingProgressBanner';
import { useAppSelector } from '@/hooks/useAppStore';
import { ROLES_NAME } from '@/configs/constants';

const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/employer/login',
  '/employer/register',
  '/employer/forgot-password',
  '/employer/reset-password',
];

const DefaultLayout = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname() || '';
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.endsWith(p));
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

  const cleanPath = pathname.replace(/^\/(vi|en)/, '');
  const isFullBleedPage =
    cleanPath === '/practice' ||
    cleanPath.startsWith('/practice/') ||
    cleanPath === '/luyen-phong-van' ||
    cleanPath.startsWith('/luyen-phong-van/') ||
    cleanPath === '/phong-van-thu' ||
    cleanPath.startsWith('/phong-van-thu/');

  const [isCandidateSkipped, setIsCandidateSkipped] = React.useState(false);
  const [isEmployerSkipped, setIsEmployerSkipped] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCandidateSkipped(sessionStorage.getItem('infohr_onboarding_banner_dismissed_candidate') === 'false');
      setIsEmployerSkipped(sessionStorage.getItem('infohr_onboarding_banner_dismissed_employer') === 'false');
    }
  }, [pathname]);

  const showCandidateBanner =
    !isAuthPage &&
    !isFullBleedPage &&
    (isCandidateSkipped ||
      (isAuthenticated &&
        currentUser?.roleName === ROLES_NAME.JOB_SEEKER &&
        (currentUser?.isOnboarded === false || currentUser?.onboardingStep === -1)));

  const showEmployerBanner =
    !isAuthPage &&
    !isFullBleedPage &&
    (isEmployerSkipped ||
      (isAuthenticated &&
        currentUser?.roleName === ROLES_NAME.EMPLOYER &&
        (currentUser?.isOnboarded === false || currentUser?.onboardingStep === -1)));

  return (
    <Box sx={{ backgroundColor: isAuthPage ? { xs: '#FFFFFF', sm: 'inherit' } : 'inherit' }}>
      <Header />

      {showCandidateBanner && <OnboardingProgressBanner role="candidate" />}
      {showEmployerBanner && <OnboardingProgressBanner role="employer" />}

      <Container
        component="main"
        maxWidth={isFullBleedPage ? false : 'xl'}
        disableGutters={isAuthPage || isFullBleedPage}
        sx={{
          paddingLeft: isFullBleedPage
            ? 0
            : isAuthPage
            ? { xs: 0, sm: 4, md: 6, lg: 8, xl: 8 }
            : { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          paddingRight: isFullBleedPage
            ? 0
            : isAuthPage
            ? { xs: 0, sm: 4, md: 6, lg: 8, xl: 8 }
            : { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          pb: isFullBleedPage ? 0 : isAuthPage ? { xs: 3, md: 4 } : { xs: 8, md: 4 },
        }}
      >
        {children}
      </Container>

      <Footer />
    </Box>
  );
};

export default DefaultLayout;

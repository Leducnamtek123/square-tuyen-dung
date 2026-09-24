'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import tokenService from '@/services/tokenService';
import { canAccessJobSeekerPortal } from '@/utils/accessControl';
import PracticeLandingPage from '@/views/defaultPages/PracticeLandingPage';
import CandidatePracticePage from '@/views/jobSeekerPages/PracticePage/CandidatePracticePage';

import { Box, CircularProgress } from '@mui/material';

/**
 * Adaptive Practice Page Client:
 * - When logged in as Candidate (Job Seeker): Renders CandidatePracticePage.
 *   Layout shell (JobSeekerLayout) is provided persistently by (candidate)/layout.tsx without unmounting or global loading.
 * - When guest / unauthenticated: Renders PracticeLandingPage.
 *   Layout shell (DefaultLayout) is provided by JobSeekerLayout adaptive delegation.
 */
export const PracticePageClient: React.FC = () => {
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
  const token = typeof window !== 'undefined' ? tokenService.getAccessTokenFromCookie() : null;
  const hasAuthToken = Boolean(token || isAuthenticated);

  // When logged in as Candidate (Job Seeker): render CandidatePracticePage
  if (hasAuthToken && currentUser && canAccessJobSeekerPortal(currentUser)) {
    return (
      <React.Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={36} />
          </Box>
        }
      >
        <CandidatePracticePage />
      </React.Suspense>
    );
  }

  // When auth token exists but currentUser is in-flight: show spinner instead of flashing landing page
  if (hasAuthToken && !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  // When guest / unauthenticated / non-candidate: render PracticeLandingPage
  return <PracticeLandingPage />;
};

export default PracticePageClient;

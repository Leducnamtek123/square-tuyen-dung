'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import tokenService from '@/services/tokenService';
import { canAccessJobSeekerPortal } from '@/utils/accessControl';
import PracticeLandingPage from '@/views/defaultPages/PracticeLandingPage';
import CandidatePracticePage from '@/views/jobSeekerPages/PracticePage/CandidatePracticePage';

/**
 * Adaptive Practice Page Client:
 * - When logged in as Candidate (Job Seeker): Renders CandidatePracticePage.
 *   Layout shell (JobSeekerLayout) is provided persistently by (candidate)/layout.tsx without unmounting or global loading.
 * - When guest / unauthenticated: Renders PracticeLandingPage.
 *   Layout shell (DefaultLayout) is provided by JobSeekerLayout adaptive delegation.
 */
export const PracticePageClient: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [isCandidate, setIsCandidate] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const token = tokenService.getAccessTokenFromCookie();
    return Boolean(token && currentUser && canAccessJobSeekerPortal(currentUser));
  });

  useEffect(() => {
    const token = tokenService.getAccessTokenFromCookie();
    setIsCandidate(Boolean(token && currentUser && canAccessJobSeekerPortal(currentUser)));
  }, [currentUser]);

  if (isCandidate) {
    return (
      <React.Suspense fallback={null}>
        <CandidatePracticePage />
      </React.Suspense>
    );
  }

  return <PracticeLandingPage />;
};

export default PracticePageClient;

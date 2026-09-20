'use client';

import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import { useAppSelector } from '@/redux/hooks';
import tokenService from '@/services/tokenService';
import { canAccessJobSeekerPortal } from '@/utils/accessControl';
import PracticeLandingPage from '@/views/defaultPages/PracticeLandingPage';
import CandidatePracticePage from '@/views/jobSeekerPages/PracticePage/CandidatePracticePage';

/**
 * Adaptive Practice Page Layout:
 * - When logged in as Candidate (Job Seeker): Seamlessly keeps candidate inside Candidate Dashboard
 *   (JobSeekerLayout) with CandidateSidebar and mounts CandidatePracticePage.
 * - When guest / unauthenticated: Shows the public marketing landing page (PracticeLandingPage) with DefaultLayout.
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
      <JobSeekerLayout>
        <CandidatePracticePage />
      </JobSeekerLayout>
    );
  }

  return (
    <DefaultLayout>
      <PracticeLandingPage />
    </DefaultLayout>
  );
};

export default PracticePageClient;

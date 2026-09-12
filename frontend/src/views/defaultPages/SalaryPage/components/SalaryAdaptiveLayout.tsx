'use client';

import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import { useAppSelector } from '@/redux/hooks';
import tokenService from '@/services/tokenService';
import { canAccessJobSeekerPortal } from '@/utils/accessControl';
import SalaryBenchmarkPage from '../SalaryBenchmarkPage';

export const SalaryAdaptiveLayout: React.FC = () => {
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
        <SalaryBenchmarkPage />
      </JobSeekerLayout>
    );
  }

  return (
    <DefaultLayout>
      <SalaryBenchmarkPage />
    </DefaultLayout>
  );
};

export default SalaryAdaptiveLayout;

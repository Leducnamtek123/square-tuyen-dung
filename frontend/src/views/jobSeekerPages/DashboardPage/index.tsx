'use client';

import React, { useRef } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TabTitle } from '../../../utils/generalFunction';
import { APP_NAME } from '../../../configs/constants';
import { useAppSelector } from '@/redux/hooks';
import jobPostActivityService from '../../../services/jobPostActivityService';
import {
  useSavedJobs,
  useCompaniesFollowed,
  useResumeViewed,
} from '../../components/jobSeekers/hooks/useJobSeekerQueries';

import CandidateTopKpiRow from '../../components/jobSeekers/CandidateDashboardMain/CandidateTopKpiRow';
import CandidateCvScoreCard from '../../components/jobSeekers/CandidateDashboardMain/CandidateCvScoreCard';
import CandidateActivityChartCard from '../../components/jobSeekers/CandidateDashboardMain/CandidateActivityChartCard';
import CandidateRecommendedJobsCard from '../../components/jobSeekers/CandidateDashboardMain/CandidateRecommendedJobsCard';
import AiRecommendedJobsSection from '../../components/jobSeekers/CandidateDashboardMain/AiRecommendedJobsSection';

const DashboardPage = () => {
  const { t } = useTranslation('jobSeeker');
  const containerRef = useRef<HTMLDivElement>(null);
  TabTitle(t('dashboard.pageTitle', { appName: APP_NAME }));

  const { currentUser } = useAppSelector((state) => state.user);

  // 1. Fetch Real Applied Jobs Count
  const { data: appliedData } = useQuery({
    queryKey: ['dashboardAppliedJobsCount'],
    queryFn: async () => {
      const res = await jobPostActivityService.getJobPostActivity({ pageSize: 1 });
      return res?.count || 0;
    },
    staleTime: 60_000,
  });

  // 2. Fetch Real Saved Jobs Count
  const { data: savedData } = useSavedJobs({ pageSize: 1 });

  // 3. Fetch Real Followed Companies Count
  const { data: followedData } = useCompaniesFollowed({ pageSize: 1 });

  // 4. Fetch Real Employer Resume Viewed Count
  const { data: viewedData } = useResumeViewed({ pageSize: 1 });

  const stats = React.useMemo(() => {
    return {
      appliedCount: appliedData ?? 0,
      savedCount: savedData?.count ?? 0,
      viewedCount: viewedData?.count ?? 0,
      followingCount: followedData?.count ?? 0,
    };
  }, [appliedData, savedData?.count, viewedData?.count, followedData?.count]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.gsap-candidate-kpi',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, clearProps: 'transform' }
      )
        .fromTo(
          '.gsap-candidate-row2',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.12, clearProps: 'transform' },
          '-=0.3'
        )
        .fromTo(
          '.gsap-candidate-ai-section',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' },
          '-=0.3'
        )
        .fromTo(
          '.gsap-candidate-jobs-card',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' },
          '-=0.3'
        );
    },
    { scope: containerRef }
  );

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Row 1: Top 4 Real API KPI Cards */}
      <Box className="gsap-candidate-kpi">
        <CandidateTopKpiRow user={currentUser} stats={stats} />
      </Box>

      {/* Row 2: CV Score Card & Activity Chart Card */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }} className="gsap-candidate-row2">
          <CandidateCvScoreCard viewedCount={stats.viewedCount} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }} className="gsap-candidate-row2">
          <CandidateActivityChartCard stats={stats} />
        </Grid>
      </Grid>

      {/* Row 3: AI Smart Job Recommendations Section */}
      <Box className="gsap-candidate-ai-section">
        <AiRecommendedJobsSection />
      </Box>

      {/* Row 4: Recommended Jobs Full Width Section */}
      <Box className="gsap-candidate-jobs-card">
        <CandidateRecommendedJobsCard />
      </Box>
    </Box>
  );
};

export default DashboardPage;

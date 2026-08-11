'use client';

import React from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Row 1: Top 4 Real API KPI Cards */}
      <CandidateTopKpiRow user={currentUser} stats={stats} />

      {/* Row 2: CV Score Card & Activity Chart Card */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CandidateCvScoreCard viewedCount={stats.viewedCount} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <CandidateActivityChartCard stats={stats} />
        </Grid>
      </Grid>

      {/* Row 3: AI Smart Job Recommendations Section */}
      <AiRecommendedJobsSection />

      {/* Row 4: Recommended Jobs Full Width Section */}
      <Box>
        <CandidateRecommendedJobsCard />
      </Box>
    </Box>
  );
};

export default DashboardPage;

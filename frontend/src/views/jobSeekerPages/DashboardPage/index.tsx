'use client';

import React, { useRef, useState } from 'react';
import { Box, Grid2 as Grid, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from '@/utils/gsapHelpers';
import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME } from '@/configs/constants';
import { useAppSelector } from '@/redux/hooks';
import jobPostActivityService from '@/services/jobPostActivityService';
import {
  useSavedJobs,
  useCompaniesFollowed,
  useResumeViewed,
} from '@/views/components/jobSeekers/hooks/useJobSeekerQueries';

import CandidateTopKpiRow from '@/views/components/jobSeekers/CandidateDashboardMain/CandidateTopKpiRow';
import CandidateCvScoreCard from '@/views/components/jobSeekers/CandidateDashboardMain/CandidateCvScoreCard';
import CandidateActivityChartCard from '@/views/components/jobSeekers/CandidateDashboardMain/CandidateActivityChartCard';
import CandidateRecommendedJobsCard from '@/views/components/jobSeekers/CandidateDashboardMain/CandidateRecommendedJobsCard';
import AiRecommendedJobsSection from '@/views/components/jobSeekers/CandidateDashboardMain/AiRecommendedJobsSection';
import { ProductTourTrigger, useTourAutoStart } from '@/components/Features/ProductTour';

registerGsapPlugins();

const KPI_QUERY_PARAMS = Object.freeze({ pageSize: 1 });

const DashboardPage = () => {
  const { t } = useTranslation('jobSeeker');
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobFeedTab, setJobFeedTab] = useState<'ai' | 'recommended'>('ai');
  TabTitle(t('dashboard.pageTitle', { appName: APP_NAME }));

  // Auto-start candidate dashboard tour on first visit
  useTourAutoStart('candidate_dashboard', 800);

  const { currentUser } = useAppSelector((state) => state.user);

  // 1. Fetch Real Applied Jobs Count
  const { data: appliedData } = useQuery({
    queryKey: ['dashboardAppliedJobsCount'],
    queryFn: async () => {
      const res = await jobPostActivityService.getJobPostActivity(KPI_QUERY_PARAMS);
      return res?.count || 0;
    },
    staleTime: 60_000,
  });

  // 2. Fetch Real Saved Jobs Count
  const { data: savedData } = useSavedJobs(KPI_QUERY_PARAMS);

  // 3. Fetch Real Followed Companies Count
  const { data: followedData } = useCompaniesFollowed(KPI_QUERY_PARAMS);

  // 4. Fetch Real Employer Resume Viewed Count
  const { data: viewedData } = useResumeViewed(KPI_QUERY_PARAMS);

  const stats = React.useMemo(() => {
    return {
      appliedCount: appliedData ?? 0,
      savedCount: savedData?.count ?? 0,
      viewedCount: viewedData?.count ?? 0,
      followingCount: followedData?.count ?? 0,
    };
  }, [appliedData, savedData?.count, viewedData?.count, followedData?.count]);

  const hasAnimatedRef = useRef(false);

  // Entrance animation runs ONLY ONCE on mount
  useGSAP(
    () => {
      if (hasAnimatedRef.current) {
        gsap.set(
          '.gsap-candidate-kpi, .gsap-candidate-row2, .gsap-candidate-ai-section, .gsap-candidate-jobs-card',
          { opacity: 1, y: 0, clearProps: 'all' }
        );
        return;
      }
      hasAnimatedRef.current = true;

      const mm = gsap.matchMedia();

      // -- Desktop Breakpoint (≥769px) ---------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          '.gsap-candidate-kpi',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, clearProps: 'all' }
        )
          .fromTo(
            '.gsap-candidate-row2',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, stagger: 0.12, clearProps: 'all' },
            '-=0.3'
          )
          .fromTo(
            '.gsap-candidate-ai-section',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' },
            '-=0.3'
          )
          .fromTo(
            '.gsap-candidate-jobs-card',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' },
            '-=0.3'
          );
      });

      // -- Mobile Breakpoint (≤768px) ----------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl.fromTo(
          '.gsap-candidate-kpi',
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }
        )
          .fromTo(
            '.gsap-candidate-row2',
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, clearProps: 'all' },
            '-=0.25'
          )
          .fromTo(
            '.gsap-candidate-ai-section',
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' },
            '-=0.25'
          )
          .fromTo(
            '.gsap-candidate-jobs-card',
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' },
            '-=0.25'
          );
      });

      // -- Reduced Motion -----------------------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        gsap.set(
          '.gsap-candidate-kpi, .gsap-candidate-row2, .gsap-candidate-ai-section, .gsap-candidate-jobs-card',
          { opacity: 1, y: 0, clearProps: 'all' }
        );
      });
    },
    { scope: containerRef, dependencies: [stats], revertOnUpdate: true }
  );

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Bar with Tour Trigger */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <ProductTourTrigger tourKey="candidate_dashboard" variant="chip" label="Hướng dẫn bảng điều khiển" />
      </Box>

      {/* Row 1: Top 4 Real API KPI Cards */}
      <Box data-tour="candidate-kpi" className="gsap-candidate-kpi">
        <CandidateTopKpiRow user={currentUser} stats={stats} />
      </Box>

      {/* Row 2: CV Score Card & Activity Chart Card */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }} className="gsap-candidate-row2">
          <CandidateCvScoreCard viewedCount={stats.viewedCount} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }} className="gsap-candidate-row2">
          <Box data-tour="candidate-activity-chart">
            <CandidateActivityChartCard stats={stats} />
          </Box>
        </Grid>
      </Grid>

      {/* Row 3 & 4: Unified Smart Job Feed Section with Segmented Switcher */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
              Cơ hội việc làm dành cho bạn
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Việc làm phù hợp với kinh nghiệm và hồ sơ CV của bạn
            </Typography>
          </Box>

          <ToggleButtonGroup
            size="small"
            value={jobFeedTab}
            exclusive
            onChange={(_, val) => val && setJobFeedTab(val)}
            sx={{
              bgcolor: '#F1F5F9',
              p: '3px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.6,
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'none',
                border: 'none',
                borderRadius: '8px !important',
                color: '#64748B',
                transition: 'all 0.15s ease-in-out',
                '&.Mui-selected': {
                  bgcolor: '#FFFFFF',
                  color: '#2563EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  fontWeight: 800,
                },
              },
            }}
          >
            <ToggleButton value="ai">Gợi ý bởi AI</ToggleButton>
            <ToggleButton value="recommended">Việc làm phù hợp</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* AI Smart Job Recommendations Section */}
        <Box
          data-tour="candidate-ai-jobs"
          className="gsap-candidate-ai-section"
          sx={{ display: jobFeedTab === 'ai' ? 'block' : 'none' }}
        >
          <AiRecommendedJobsSection />
        </Box>

        {/* Recommended Jobs Full Width Section */}
        <Box
          className="gsap-candidate-jobs-card"
          sx={{ display: jobFeedTab === 'recommended' ? 'block' : 'none' }}
        >
          <CandidateRecommendedJobsCard />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;

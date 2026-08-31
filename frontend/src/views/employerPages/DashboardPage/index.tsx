'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid, Box, Typography, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from "@/utils/gsapHelpers";
import { TabTitle } from '@/utils/generalFunction';
import EmployerQuantityStatistics from '@/views/components/employers/EmployerQuantityStatistics';
import RecruitmentChart from '@/views/components/employers/charts/RecruitmentChart';
import CandidateChart from '@/views/components/employers/charts/CandidateChart';
import ApplicationChart from '@/views/components/employers/charts/ApplicationChart';
import HiringAcademicChart from '@/views/components/employers/charts/HiringAcademicChart';
import InterviewStatsChart from '@/views/components/employers/charts/InterviewStatsChart';
import RecentApplicationsWidget from '@/views/components/employers/RecentApplicationsWidget';

registerGsapPlugins();

const DashboardPage = () => {
  const { t } = useTranslation('employer');
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<number>(30);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  TabTitle(t('dashboard.pageTitle'));

  const { startDate, endDate } = useMemo(() => ({
    startDate: dayjs().subtract(days, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  }), [days]);

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: number | null
  ) => {
    if (newDays !== null) {
      setDays(newDays);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employerGeneralStatistics'] }),
      queryClient.invalidateQueries({ queryKey: ['employerApplicationStatistics'] }),
      queryClient.invalidateQueries({ queryKey: ['employerCandidateStatistics'] }),
      queryClient.invalidateQueries({ queryKey: ['employerRecruitmentStatistics'] }),
      queryClient.invalidateQueries({ queryKey: ['employerRecruitmentByRank'] }),
      queryClient.invalidateQueries({ queryKey: ['employerInterviewStatistics'] }),
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop Breakpoint (≥769px) ─────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          ".gsap-emp-header",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }
        )
          .fromTo(
            ".gsap-emp-kpi",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
            "-=0.2"
          )
          .fromTo(
            ".gsap-emp-hero-row",
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, clearProps: 'all' },
            "-=0.25"
          )
          .fromTo(
            ".gsap-emp-action-row",
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, clearProps: 'all' },
            "-=0.25"
          )
          .fromTo(
            ".gsap-emp-chart-card",
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
              clearProps: 'all',
            },
            "-=0.25"
          );
      });

      // ── Mobile Breakpoint (≤768px) ──────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl.fromTo(
          ".gsap-emp-header",
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, clearProps: 'all' }
        )
          .fromTo(
            ".gsap-emp-kpi",
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' },
            "-=0.2"
          )
          .fromTo(
            ".gsap-emp-hero-row",
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' },
            "-=0.2"
          )
          .fromTo(
            ".gsap-emp-action-row",
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' },
            "-=0.2"
          )
          .fromTo(
            ".gsap-emp-chart-card",
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.06,
              ease: "power2.out",
              clearProps: 'all',
            },
            "-=0.2"
          );
      });

      // ── Reduced Motion ───────────────────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        gsap.set(
          ".gsap-emp-header, .gsap-emp-kpi, .gsap-emp-hero-row, .gsap-emp-action-row, .gsap-emp-chart-card",
          { opacity: 1, y: 0, clearProps: 'all' }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <Box ref={containerRef} sx={{ width: '100%', pb: { xs: 4, sm: 6 } }}>
      {/* Header Section with Global Period Filter & Refresh */}
      <Box
        className="gsap-emp-header"
        sx={{
          mb: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              lineHeight: 1.2,
            }}
          >
            {t('dashboard.pageTitle')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Thống kê hiệu quả tuyển dụng, phỏng vấn AI và nguồn ứng viên thời gian thực
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            size="small"
            value={days}
            exclusive
            onChange={handlePeriodChange}
            sx={{
              bgcolor: '#F8FAFC',
              p: 0.5,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                color: '#64748B',
                '&.Mui-selected': {
                  bgcolor: '#FFFFFF',
                  color: '#2563EB',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                },
              },
            }}
          >
            <ToggleButton value={7}>7 ngày</ToggleButton>
            <ToggleButton value={30}>30 ngày</ToggleButton>
            <ToggleButton value={90}>3 tháng</ToggleButton>
            <ToggleButton value={365}>1 năm</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2.5,
              borderColor: '#E2E8F0',
              color: '#334155',
              bgcolor: '#FFFFFF',
              px: 1.75,
              py: 0.65,
              fontSize: '0.8125rem',
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* ROW 1: KPI Core Metric Summary Cards (4 Columns) */}
        <Grid size={12} className="gsap-emp-kpi">
          <EmployerQuantityStatistics />
        </Grid>

        {/* ROW 2: Hero Bento Grid - Application Trend (7 Cols) & Recruitment Funnel (5 Cols) */}
        <Grid size={{ xs: 12, lg: 7 }} className="gsap-emp-hero-row">
          <ApplicationChart
            title={t('dashboard.applicationChart')}
            startDate={startDate}
            endDate={endDate}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} className="gsap-emp-hero-row">
          <RecruitmentChart
            title={t('dashboard.recruitmentChart')}
            startDate={startDate}
            endDate={endDate}
          />
        </Grid>

        {/* ROW 3: Actionable Operations - Recent Applications (7 Cols) & Interview Analytics (5 Cols) */}
        <Grid size={{ xs: 12, lg: 7 }} className="gsap-emp-action-row">
          <RecentApplicationsWidget />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} className="gsap-emp-action-row">
          <InterviewStatsChart
            title={t('dashboard.interviewChart')}
            startDate={startDate}
            endDate={endDate}
          />
        </Grid>

        {/* ROW 4: Demographics & Candidate Growth (6 / 6 Columns) */}
        <Grid size={{ xs: 12, md: 6 }} className="gsap-emp-chart-card">
          <CandidateChart
            title={t('dashboard.candidateChart')}
            startDate={startDate}
            endDate={endDate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} className="gsap-emp-chart-card">
          <HiringAcademicChart
            title={t('dashboard.academicChart')}
            startDate={startDate}
            endDate={endDate}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

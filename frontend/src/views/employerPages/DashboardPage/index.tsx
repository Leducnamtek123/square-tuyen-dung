'use client';

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid, Box } from "@mui/material";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { TabTitle } from '../../../utils/generalFunction';
import EmployerQuantityStatistics from '../../components/employers/EmployerQuantityStatistics';
import RecruitmentChart from '../../components/employers/charts/RecruitmentChart';
import CandidateChart from '../../components/employers/charts/CandidateChart';
import ApplicationChart from '../../components/employers/charts/ApplicationChart';
import HiringAcademicChart from '../../components/employers/charts/HiringAcademicChart';
import InterviewStatsChart from '../../components/employers/charts/InterviewStatsChart';

const DashboardPage = () => {
  const { t } = useTranslation('employer');
  const containerRef = useRef<HTMLDivElement>(null);
  TabTitle(t('dashboard.pageTitle'));

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        ".gsap-emp-kpi",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' }
      )
        .fromTo(
          ".gsap-emp-hero-chart",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' },
          "-=0.3"
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
            clearProps: 'transform',
          },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  return (
    <Box ref={containerRef} sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* KPI Summary Row */}
        <Grid size={12} className="gsap-emp-kpi">
          <EmployerQuantityStatistics />
        </Grid>

        {/* Hero Chart Row: Recruitment Pipeline Overview (12 Columns) */}
        <Grid size={12} className="gsap-emp-hero-chart">
          <RecruitmentChart title={t('dashboard.recruitmentChart')} />
        </Grid>

        {/* Analytics Row 1: Interviews & Applications (6 / 6 Columns) */}
        <Grid size={{ xs: 12, md: 6 }} className="gsap-emp-chart-card">
          <InterviewStatsChart title={t('dashboard.interviewChart')} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} className="gsap-emp-chart-card">
          <ApplicationChart title={t('dashboard.applicationChart')} />
        </Grid>

        {/* Analytics Row 2: Candidate Demographics & Academic Level (6 / 6 Columns) */}
        <Grid size={{ xs: 12, md: 6 }} className="gsap-emp-chart-card">
          <CandidateChart title={t('dashboard.candidateChart')} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} className="gsap-emp-chart-card">
          <HiringAcademicChart title={t('dashboard.academicChart')} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

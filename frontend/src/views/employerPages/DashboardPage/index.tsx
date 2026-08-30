'use client';

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid, Box } from "@mui/material";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from "@/utils/gsapHelpers";
import { TabTitle } from '../../../utils/generalFunction';
import EmployerQuantityStatistics from '../../components/employers/EmployerQuantityStatistics';
import RecruitmentChart from '../../components/employers/charts/RecruitmentChart';
import CandidateChart from '../../components/employers/charts/CandidateChart';
import ApplicationChart from '../../components/employers/charts/ApplicationChart';
import HiringAcademicChart from '../../components/employers/charts/HiringAcademicChart';
import InterviewStatsChart from '../../components/employers/charts/InterviewStatsChart';
import RecentApplicationsWidget from '../../components/employers/RecentApplicationsWidget';

registerGsapPlugins();

const DashboardPage = () => {
  const { t } = useTranslation('employer');
  const containerRef = useRef<HTMLDivElement>(null);
  TabTitle(t('dashboard.pageTitle'));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop Breakpoint (≥769px) ─────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          ".gsap-emp-kpi",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' }
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
          ".gsap-emp-kpi",
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }
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
          ".gsap-emp-kpi, .gsap-emp-hero-row, .gsap-emp-action-row, .gsap-emp-chart-card",
          { opacity: 1, y: 0, clearProps: 'all' }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <Box ref={containerRef} sx={{ width: '100%', pb: { xs: 4, sm: 6 } }}>
      <Grid container spacing={{ xs: 2.5, sm: 3, md: 3.5 }}>
        {/* ROW 1: KPI Core Metric Summary Cards (4 Columns) */}
        <Grid size={12} className="gsap-emp-kpi">
          <EmployerQuantityStatistics />
        </Grid>

        {/* ROW 2: Hero Bento Grid - Application Trend (7 Cols) & Recruitment Funnel (5 Cols) */}
        <Grid size={{ xs: 12, lg: 7 }} className="gsap-emp-hero-row">
          <ApplicationChart title={t('dashboard.applicationChart')} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} className="gsap-emp-hero-row">
          <RecruitmentChart title={t('dashboard.recruitmentChart')} />
        </Grid>

        {/* ROW 3: Actionable Operations - Recent Applications (7 Cols) & Interview Analytics (5 Cols) */}
        <Grid size={{ xs: 12, lg: 7 }} className="gsap-emp-action-row">
          <RecentApplicationsWidget />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} className="gsap-emp-action-row">
          <InterviewStatsChart title={t('dashboard.interviewChart')} />
        </Grid>

        {/* ROW 4: Demographics & Candidate Growth (6 / 6 Columns) */}
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

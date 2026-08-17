'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid, Box } from "@mui/material";
import { TabTitle } from '../../../utils/generalFunction';
import EmployerQuantityStatistics from '../../components/employers/EmployerQuantityStatistics';
import RecruitmentChart from '../../components/employers/charts/RecruitmentChart';
import CandidateChart from '../../components/employers/charts/CandidateChart';
import ApplicationChart from '../../components/employers/charts/ApplicationChart';
import HiringAcademicChart from '../../components/employers/charts/HiringAcademicChart';
import InterviewStatsChart from '../../components/employers/charts/InterviewStatsChart';

const DashboardPage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('dashboard.pageTitle'));

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* KPI Summary Row */}
        <Grid size={12}>
          <EmployerQuantityStatistics />
        </Grid>

        {/* Hero Chart Row: Recruitment Pipeline Overview (12 Columns) */}
        <Grid size={12}>
          <RecruitmentChart title={t('dashboard.recruitmentChart')} />
        </Grid>

        {/* Analytics Row 1: Interviews & Applications (6 / 6 Columns) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InterviewStatsChart title={t('dashboard.interviewChart')} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ApplicationChart title={t('dashboard.applicationChart')} />
        </Grid>

        {/* Analytics Row 2: Candidate Demographics & Academic Level (6 / 6 Columns) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CandidateChart title={t('dashboard.candidateChart')} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <HiringAcademicChart title={t('dashboard.academicChart')} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

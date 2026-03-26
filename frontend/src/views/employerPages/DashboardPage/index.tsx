import React from 'react';

import { useTranslation } from 'react-i18next';

import Grid from "@mui/material/Grid2";

import { TabTitle } from '../../../utils/generalFunction';

import EmployerQuantityStatistics from '../../components/employers/EmployerQuantityStatistics';

import RecruitmentChart from '../../components/employers/charts/RecruitmentChart';

import CandidateChart from '../../components/employers/charts/CandidateChart';

import ApplicationChart from '../../components/employers/charts/ApplicationChart';

import HiringAcademicChart from '../../components/employers/charts/HiringAcademicChart';



const DashboardPage = () => {

  const { t } = useTranslation('employer');

  TabTitle(t('dashboard.pageTitle'))

  return (

    <>

      <Grid container spacing={2}>

        <Grid size={12}>

          {/* Start: EmployerQuantityStatistics */}

          <EmployerQuantityStatistics />

          {/* End: EmployerQuantityStatistics */}

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 12,

            lg: 6

          }}>

          {/* Start: RecruitmentChart */}

          <RecruitmentChart title={t('dashboard.recruitmentChart')} />

          {/* End: RecruitmentChart */}

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 12,

            lg: 6

          }}>

          {/* Start: CandidateChart */}

          <CandidateChart title={t('dashboard.candidateChart')} />

          {/* End: CandidateChart */}

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 12,

            lg: 6

          }}>

          {/* Start: ApplicationChart */}

          <ApplicationChart title={t('dashboard.applicationChart')} />

          {/* End: ApplicationChart */}

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 12,

            lg: 6

          }}>

          {/* Start: HiringAcademicChart */}

          <HiringAcademicChart title={t('dashboard.academicChart')} />

          {/* End: HiringAcademicChart */}

        </Grid>

      </Grid>

    </>

  );

};

export default DashboardPage;

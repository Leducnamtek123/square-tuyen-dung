'use client';

import React from 'react';
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { TabTitle } from '../../../utils/generalFunction';
import JobSeekerQuantityStatistics from '../../components/jobSeekers/JobSeekerQuantityStatistics';
import SidebarProfile from '../../components/jobSeekers/SidebarProfile';
import SidebarViewTotal from '../../components/jobSeekers/SidebarViewTotal';
import SuggestedJobPostCard from '../../components/defaults/SuggestedJobPostCard';
import ActivityChart from '../../components/jobSeekers/charts';
import JobApplicationCard from '../../components/jobSeekers/JobApplicationCard';

const DashboardPage = () => {

  const { t } = useTranslation('jobSeeker');

  TabTitle(t('dashboard.pageTitle'))

  return (

    <Box>

      <Grid container spacing={2}>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 5,

            lg: 3,

            xl: 3

          }}>

          <Stack spacing={2}>

            <Card sx={{ p: 2 }}>

              {/* Start: Sidebar profile */}

              <SidebarProfile />

              {/* End: Sidebar profile */}

            </Card>

            <Card sx={{ p: 2 }}>

              {/* Start: Sidebar view total */}

              <SidebarViewTotal />

              {/* End: Sidebar view total */}

            </Card>

            <Card sx={{ p: 2 }}>

              {/* Start: JobApplicationCard */}

              <JobApplicationCard />

              {/* End: JobApplicationCard */}

            </Card>

          </Stack>

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 7,

            lg: 9,

            xl: 9

          }}>

          <Stack spacing={2}>

            <Box>

              {/* Start: JobSeekerQuantityStatistics */}

              <JobSeekerQuantityStatistics />

              {/* End: JobSeekerQuantityStatistics */}

            </Box>

            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => theme.customShadows?.z1,
                overflow: 'hidden',
              }}
            >

              <Stack>

                <Box sx={{ mb: 2 }}>

                  <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0 }}>{t('dashboard.yourActivity')}</Typography>

                </Box>

                <Box>

                  {/* Start: ActivityChart */}

                  <ActivityChart />

                  {/* End: ActivityChart */}

                </Box>

              </Stack>

            </Card>

            <Card sx={{ p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 } }}>

              <Stack>

                <Box sx={{ mb: 2 }}>

                  <Typography variant="h6">{t('dashboard.suggestedJobs')}</Typography>

                </Box>

                <Box>

                  {/* Start: SuggestedJobPostCard */}

                  <SuggestedJobPostCard pageSize={10} />

                  {/* End: SuggestedJobPostCard */}

                </Box>

              </Stack>

            </Card>

          </Stack>

        </Grid>

      </Grid>

    </Box>

  );

};

export default DashboardPage;

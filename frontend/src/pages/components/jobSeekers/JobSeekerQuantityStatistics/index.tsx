// @ts-nocheck
import React from 'react';

import { Card, CardContent, Stack, Typography, Skeleton } from "@mui/material";

import Grid from "@mui/material/Grid2";

import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';

import defaultTheme from '../../../../themeConfigs/defaultTheme';

import statisticService from '../../../../services/statisticService';

import { useTranslation } from 'react-i18next';

interface Props {
  [key: string]: any;
}



const StatItem = ({ title, value, color, background, Icon, loading }) => (

  <Card

    sx={{

      borderRadius: 2,

      boxShadow: defaultTheme.customShadows.small,

      height: '100%',

      background,

    }}

  >

    <CardContent>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>

        <Icon sx={{ fontSize: 22, color }} />

        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: defaultTheme.palette.grey[700] }}>

          {title}

        </Typography>

      </Stack>

      {loading ? (

        <Skeleton width={80} height={32} />

      ) : (

        <Typography sx={{ color, fontSize: '2rem', fontWeight: 700 }}>

          {value ?? 0}

        </Typography>

      )}

    </CardContent>

  </Card>

);

const JobSeekerQuantityStatistics = () => {

  const { t } = useTranslation('jobSeeker');

  const [isLoading, setIsLoading] = React.useState(true);

  const [data, setData] = React.useState(null);

  React.useEffect(() => {

    const statistics = async () => {

      setIsLoading(true);

      try {

        const resData = await statisticService.jobSeekerGeneralStatistics();

        setData(resData.data);

      } catch (error) {

        console.error('Error: ', error);

      } finally {

        setIsLoading(false);

      }

    };

    statistics();

  }, []);

  return (

    <Grid container spacing={3}>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('appliedJobs')}

          value={data?.totalApply}

          color={defaultTheme.palette.success.main}

          background={`linear-gradient(135deg, ${defaultTheme.palette.success.background} 0%, rgba(46, 125, 50, 0.1) 100%)`}

          Icon={AssignmentTurnedInOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('savedJobs')}

          value={data?.totalSave}

          color={defaultTheme.palette.primary.main}

          background={`linear-gradient(135deg, ${defaultTheme.palette.primary.background} 0%, ${defaultTheme.palette.primary.background} 100%)`}

          Icon={BookmarkOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('employersViewedProfile')}

          value={data?.totalView}

          color={defaultTheme.palette.info.main}

          background={`linear-gradient(135deg, ${defaultTheme.palette.info.background} 0%, ${defaultTheme.palette.info.background} 100%)`}

          Icon={VisibilityOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 6,

          lg: 3

        }}>

        <StatItem

          title={t('followedCompanies')}

          value={data?.totalFollow}

          color={defaultTheme.palette.hot.main}

          background={`linear-gradient(135deg, ${defaultTheme.palette.hot.background} 0%, ${defaultTheme.palette.hot.background} 100%)`}

          Icon={FavoriteBorderOutlinedIcon}

          loading={isLoading}

        />

      </Grid>

    </Grid>

  );

};

export default JobSeekerQuantityStatistics;

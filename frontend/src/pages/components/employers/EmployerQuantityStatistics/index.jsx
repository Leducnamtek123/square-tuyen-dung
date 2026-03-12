/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Stack, Typography, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

import statisticService from '../../../../services/statisticService';

const StatItem = ({ title, value, color, Icon, loading }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      height: '100%',
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Icon sx={{ fontSize: 22, color }} />
        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>
          {title}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton width={80} height={32} />
      ) : (
        <Typography sx={{ color, fontSize: '1.8rem', fontWeight: 700 }}>
          {value ?? 0}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const EmployerQuantityStatistics = () => {
  const { t } = useTranslation('employer');
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const statistics = async () => {
      setIsLoading(true);
      try {
        const resData = await statisticService.employerGeneralStatistics();
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
          title={t('statItem.title.totaljobposts', 'Total Job Posts')}
          value={data?.totalJobPost}
          color="#3f8600"
          Icon={DescriptionOutlinedIcon}
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
          title={t('statItem.title.pendingjobposts', 'Pending Job Posts')}
          value={data?.totalJobPostingPendingApproval}
          color="#ff9800"
          Icon={AccessTimeOutlinedIcon}
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
          title={t('statItem.title.expiredjobposts', 'Expired Job Posts')}
          value={data?.totalJobPostExpired}
          color="#cf1322"
          Icon={HighlightOffOutlinedIcon}
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
          title={t('statItem.title.totalapplications', 'Total Applications')}
          value={data?.totalApply}
          color="#00b0ff"
          Icon={GroupsOutlinedIcon}
          loading={isLoading}
        />
      </Grid>
    </Grid>
  );
};

export default EmployerQuantityStatistics;

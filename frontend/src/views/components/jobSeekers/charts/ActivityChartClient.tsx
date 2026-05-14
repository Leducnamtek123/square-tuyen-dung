'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LineChartClient from '@/components/Common/Charts/LineChartClient';
import {
  ChartEmptyState,
  ChartLoadingState,
  chartAreaSx,
  chartColors,
  createCartesianOptions,
  makeLineFill,
} from '@/components/Common/Charts/chartDesign';
import { useJobSeekerActivityStatistics } from '../hooks/useJobSeekerQueries';

const ActivityChartClient = () => {
  const { t } = useTranslation('jobSeeker');
  const theme = useTheme();
  const { data, isLoading } = useJobSeekerActivityStatistics();
  const options = React.useMemo(() => createCartesianOptions(theme), [theme]);

  const dataOptions = React.useMemo(() => {
    const datasetMeta = [
      {
        title: data?.title1,
        data: data?.data1 || [],
        color: chartColors.sky,
      },
      {
        title: data?.title2,
        data: data?.data2 || [],
        color: chartColors.emerald,
      },
      {
        title: data?.title3,
        data: data?.data3 || [],
        color: chartColors.amber,
      },
    ];

    return {
      labels: data?.labels || [],
      datasets: datasetMeta.map(({ title, data: values, color }) => ({
        label: t(`activityChart.labels.${String(title || '').toLowerCase().replace(/\s+/g, '')}`, { defaultValue: title }),
        data: values,
        borderColor: color,
        backgroundColor: makeLineFill(color),
        fill: true,
        tension: 0.38,
        cubicInterpolationMode: 'monotone' as const,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHitRadius: 14,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
      })),
    };
  }, [data, t]);

  const hasChartData = React.useMemo(() => {
    if (!data?.labels?.length) return false;
    return [data.data1, data.data2, data.data3].some((series) => (series || []).some((value) => Number(value) > 0));
  }, [data]);

  return (
    <Box sx={{ px: { xs: 0, sm: 1, md: 1, lg: 1, xl: 1 } }}>
      <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 360 }}>
        {isLoading ? (
          <ChartLoadingState height={330} label={t('activityChart.loading', { defaultValue: 'Loading chart' })} />
        ) : !hasChartData ? (
          <ChartEmptyState height={330} label={t('noDataForStatistics')} />
        ) : (
          <Box sx={chartAreaSx(330)}>
            <LineChartClient options={options} data={dataOptions} height="100%" />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default ActivityChartClient;

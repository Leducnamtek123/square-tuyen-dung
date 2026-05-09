'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, CircularProgress, Typography } from '@mui/material';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import { useJobSeekerActivityStatistics } from '../hooks/useJobSeekerQueries';
import defaultTheme from '../../../../themeConfigs/defaultTheme';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#212529',
      bodyColor: '#212529',
      borderColor: '#e9ecef',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: '#f0f1f5',
      },
    },
  },
};

type ActivityChartData = {
  labels: string[];
  datasets: Array<Record<string, unknown>>;
};

type LineChartComponent = React.ComponentType<{
  options: typeof options;
  data: ActivityChartData;
  height: number;
}>;

const ActivityChartClient = () => {
  const { t } = useTranslation('jobSeeker');
  const { data, isLoading } = useJobSeekerActivityStatistics();
  const [LineChart, setLineChart] = React.useState<LineChartComponent | null>(null);

  React.useEffect(() => {
    let isActive = true;

    const loadChart = async () => {
      const [
        {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend,
        },
        { Line },
      ] = await Promise.all([
        import('chart.js'),
        import('react-chartjs-2'),
      ]);

      ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
      if (isActive) {
        setLineChart(() => Line as unknown as LineChartComponent);
      }
    };

    loadChart().catch(console.error);

    return () => {
      isActive = false;
    };
  }, []);

  const dataOptions = React.useMemo(() => {
    return {
      labels: data?.labels || [],
      datasets: [
        {
          label: t(`activityChart.labels.${String(data?.title1 || '').toLowerCase().replace(/\s+/g, '')}`, { defaultValue: data?.title1 }),
          data: data?.data1 || [],
          borderColor: defaultTheme.palette.primary.main,
          backgroundColor: defaultTheme.palette.primary.light,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: defaultTheme.palette.primary.main,
        },
        {
          label: t(`activityChart.labels.${String(data?.title2 || '').toLowerCase().replace(/\s+/g, '')}`, { defaultValue: data?.title2 }),
          data: data?.data2 || [],
          borderColor: defaultTheme.palette.secondary.main,
          backgroundColor: defaultTheme.palette.secondary.light,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: defaultTheme.palette.secondary.main,
        },
        {
          label: t(`activityChart.labels.${String(data?.title3 || '').toLowerCase().replace(/\s+/g, '')}`, { defaultValue: data?.title3 }),
          data: data?.data3 || [],
          borderColor: defaultTheme.palette.info.main,
          backgroundColor: defaultTheme.palette.info.light,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: defaultTheme.palette.info.main,
        },
      ],
    };
  }, [data, t]);

  return (
    <Box sx={{ px: { xs: 0, sm: 1, md: 1, lg: 1, xl: 1 } }}>
      <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 360 }}>
        {isLoading ? (
          <CircularProgress sx={{ color: 'primary.main' }} />
        ) : !data ? (
          <Stack alignItems="center" spacing={1}>
            <InsertChartOutlinedIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {t('noDataForStatistics')}
            </Typography>
          </Stack>
        ) : !LineChart ? (
          <CircularProgress sx={{ color: 'primary.main' }} />
        ) : (
          <LineChart options={options} data={dataOptions} height={320} />
        )}
      </Stack>
    </Box>
  );
};

export default ActivityChartClient;

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  Stack,
  Tooltip as MuiTooltip,
  Typography,
  Paper,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TimerIcon from '@mui/icons-material/Timer';
import dayjs, { Dayjs } from 'dayjs';
import BarChartClient from '@/components/Common/Charts/BarChartClient';
import {
  ChartEmptyState,
  ChartLoadingState,
  chartAreaSx,
  chartCardSx,
  chartColors,
  chartTitleSx,
  createCartesianOptions,
  makeBarFill,
} from '@/components/Common/Charts/chartDesign';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerInterviewStatistics } from '../../hooks/useEmployerQueries';

interface InterviewStatsChartProps {
  title: string;
}

const InterviewStatsChart = ({ title }: InterviewStatsChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createCartesianOptions(theme, { stacked: true }), [theme]);
  const [allowSubmit, setAllowSubmit] = React.useState(false);
  const [selectedDateRange, setSelectedDateRange] = React.useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(6, 'month'),
    dayjs(),
  ]);

  const queryParams = React.useMemo(
    () => ({
      startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD'),
      endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD'),
    }),
    [selectedDateRange]
  );

  const { data, isLoading } = useEmployerInterviewStatistics(queryParams);

  const chartData = React.useMemo(() => {
    return {
      labels: data?.labels || [],
      datasets: [
        {
          label: t('interviewChart.labels.completed', 'Completed'),
          data: data?.completedData || [],
          backgroundColor: makeBarFill(chartColors.emerald),
          hoverBackgroundColor: chartColors.emerald,
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 34,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.scheduled', 'Scheduled'),
          data: data?.scheduledData || [],
          backgroundColor: makeBarFill(chartColors.sky),
          hoverBackgroundColor: chartColors.sky,
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 34,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.inProgress', 'In Progress'),
          data: data?.inProgressData || [],
          backgroundColor: makeBarFill(chartColors.amber),
          hoverBackgroundColor: chartColors.amber,
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 34,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.cancelled', 'Cancelled'),
          data: data?.cancelledData || [],
          backgroundColor: makeBarFill(chartColors.red),
          hoverBackgroundColor: chartColors.red,
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 34,
          stack: 'Stack 0',
        },
      ],
    };
  }, [data, t]);

  const hasChartData = React.useMemo(() => {
    if (!data?.labels?.length) return false;
    return [data.completedData, data.scheduledData, data.inProgressData, data.cancelledData].some((series) =>
      (series || []).some((value) => Number(value) > 0)
    );
  }, [data]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Paper
      elevation={0}
      sx={chartCardSx}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={chartTitleSx}>
            {title}
          </Typography>
          <MuiTooltip
            title={t('interviewChart.tooltip', 'Interview performance breakdown by month')}
            arrow
            placement="top"
          >
            <InfoIcon sx={{ color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} />
          </MuiTooltip>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Summary chips */}
        {data && !isLoading && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label={`${t('interviewChart.passed', 'Passed')}: ${data.passedCount}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: alpha('#00c853', 0.1),
                color: '#00c853',
                border: '1px solid',
                borderColor: alpha('#00c853', 0.2),
              }}
            />
            <Chip
              icon={<CancelIcon sx={{ fontSize: 16 }} />}
              label={`${t('interviewChart.failed', 'Failed')}: ${data.failedCount}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: alpha('#ff5630', 0.1),
                color: '#ff5630',
                border: '1px solid',
                borderColor: alpha('#ff5630', 0.2),
              }}
            />
            <Chip
              icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
              label={`${t('interviewChart.pending', 'Pending')}: ${data.pendingCount}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: alpha('#ffab00', 0.1),
                color: '#ffab00',
                border: '1px solid',
                borderColor: alpha('#ffab00', 0.2),
              }}
            />
            <Chip
              icon={<TimerIcon sx={{ fontSize: 16 }} />}
              label={`${t('interviewChart.avgDuration', 'Avg Duration')}: ${formatDuration(data.avgDurationSeconds)}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: alpha('#2979ff', 0.1),
                color: '#2979ff',
                border: '1px solid',
                borderColor: alpha('#2979ff', 0.2),
              }}
            />
          </Stack>
        )}

        <Box>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mb={3}>
            <RangePickerCustom
              allowSubmit={allowSubmit}
              setAllowSubmit={setAllowSubmit}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
              maxRangeMonths={6}
              resetRangeMonths={6}
            />
          </Stack>

          <Box sx={chartAreaSx(320)}>
            {isLoading ? (
              <ChartLoadingState height="100%" label={t('interviewChart.loading', { defaultValue: 'Loading chart' })} />
            ) : !hasChartData ? (
              <ChartEmptyState height="100%" label={t('interviewChart.noData', 'No interview data available')} />
            ) : (
              <BarChartClient options={options} data={chartData} height="100%" />
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default InterviewStatsChart;

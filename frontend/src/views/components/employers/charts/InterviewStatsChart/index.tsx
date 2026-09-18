import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
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
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
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
import RangePickerCustom from '@/components/Common/Controls/RangePickerCustom';
import { useEmployerInterviewStatistics } from '@/views/components/employers/hooks/useEmployerQueries';

interface InterviewStatsChartProps {
  title: string;
  startDate?: string;
  endDate?: string;
}

const InterviewStatsChart = ({ title, startDate, endDate }: InterviewStatsChartProps) => {
  const { t, i18n } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(
    () => createCartesianOptions(theme, { stacked: true, language: i18n.language, displayLegend: true }),
    [i18n.language, theme]
  );

  const queryParams = React.useMemo(() => {
    if (startDate && endDate) {
      return { startDate, endDate };
    }
    return {
      startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
    };
  }, [startDate, endDate]);

  const { data, isLoading } = useEmployerInterviewStatistics(queryParams);

  const chartData = React.useMemo(() => {
    return {
      labels: data?.labels || [],
      datasets: [
        {
          label: t('interviewChart.labels.completed'),
          data: data?.completedData || [],
          backgroundColor: makeBarFill(chartColors.emerald),
          hoverBackgroundColor: chartColors.emerald,
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 32,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.scheduled'),
          data: data?.scheduledData || [],
          backgroundColor: makeBarFill(chartColors.sky),
          hoverBackgroundColor: chartColors.sky,
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 32,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.inProgress'),
          data: data?.inProgressData || [],
          backgroundColor: makeBarFill(chartColors.amber),
          hoverBackgroundColor: chartColors.amber,
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 32,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.cancelled'),
          data: data?.cancelledData || [],
          backgroundColor: makeBarFill(chartColors.red),
          hoverBackgroundColor: chartColors.red,
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.62,
          barPercentage: 0.74,
          maxBarThickness: 32,
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
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2.5,
              bgcolor: '#ECFDF5',
              color: '#10B981',
            }}
          >
            <VideocamOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
              Thống kê kết quả và thời lượng các buổi phỏng vấn
            </Typography>
          </Box>
        </Stack>

        <MuiTooltip title={t('interviewChart.tooltip')} arrow placement="top">
          <InfoIcon sx={{ color: '#94A3B8', cursor: 'pointer', fontSize: 18, '&:hover': { color: '#2563EB' } }} />
        </MuiTooltip>
      </Box>

      {/* Summary chips */}
      {data && !isLoading && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
            label={`${t('interviewChart.passed')}: ${data.passedCount || 0}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: '#DCFCE7',
              color: '#166534',
              border: '1px solid #BBF7D0',
            }}
          />
          <Chip
            icon={<CancelIcon sx={{ fontSize: '14px !important', color: '#DC2626 !important' }} />}
            label={`${t('interviewChart.failed')}: ${data.failedCount || 0}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #FECACA',
            }}
          />
          <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: '14px !important', color: '#D97706 !important' }} />}
            label={`${t('interviewChart.pending')}: ${data.pendingCount || 0}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          />
          <Chip
            icon={<TimerIcon sx={{ fontSize: '14px !important', color: '#2563EB !important' }} />}
            label={`${t('interviewChart.avgDuration')}: ${formatDuration(data.avgDurationSeconds || 0)}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
            }}
          />
        </Stack>
      )}

      {/* Chart Canvas */}
      <Box sx={{ height: 260, minHeight: 260, width: '100%', position: 'relative', flexGrow: 1 }}>
        {isLoading ? (
          <ChartLoadingState height="100%" label={t('interviewChart.loading')} />
        ) : !hasChartData ? (
          <ChartEmptyState height="100%" label={t('interviewChart.noData')} />
        ) : (
          <BarChartClient options={options} data={chartData} height="100%" />
        )}
      </Box>
    </Paper>
  );
};

export default InterviewStatsChart;

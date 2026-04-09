import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  Stack,
  Tooltip as MuiTooltip,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TimerIcon from '@mui/icons-material/Timer';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartData,
  ChartOptions,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs, { Dayjs } from 'dayjs';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerInterviewStatistics } from '../../hooks/useEmployerQueries';

interface InterviewStatsChartProps {
  title: string;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12, weight: 600 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#212529',
      bodyColor: '#212529',
      padding: 12,
      boxPadding: 6,
      borderColor: 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 12, weight: 500 } },
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { font: { size: 12, weight: 500 } },
    },
  },
};

const InterviewStatsChart = ({ title }: InterviewStatsChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
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

  const chartData = React.useMemo<ChartData<'bar'>>(() => {
    return {
      labels: data?.labels || [],
      datasets: [
        {
          label: t('interviewChart.labels.completed', 'Completed'),
          data: data?.completedData || [],
          backgroundColor: 'rgba(0, 200, 83, 0.85)',
          borderRadius: 4,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.scheduled', 'Scheduled'),
          data: data?.scheduledData || [],
          backgroundColor: 'rgba(41, 121, 255, 0.85)',
          borderRadius: 4,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.inProgress', 'In Progress'),
          data: data?.inProgressData || [],
          backgroundColor: 'rgba(255, 171, 0, 0.85)',
          borderRadius: 4,
          stack: 'Stack 0',
        },
        {
          label: t('interviewChart.labels.cancelled', 'Cancelled'),
          data: data?.cancelledData || [],
          backgroundColor: 'rgba(255, 86, 48, 0.85)',
          borderRadius: 4,
          stack: 'Stack 0',
        },
      ],
    };
  }, [data, t]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 4,
        boxShadow: (theme) => theme.customShadows?.z1,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
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
            />
          </Stack>

          <Box sx={{ position: 'relative', minHeight: 320 }}>
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 320 }}>
                <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
              </Stack>
            ) : !data ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: 320,
                  bgcolor: alpha(theme.palette.action.disabled, 0.05),
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <InsertChartOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {t('interviewChart.noData', 'No interview data available')}
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ height: 320 }}>
                <Bar options={options} data={chartData} />
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default InterviewStatsChart;

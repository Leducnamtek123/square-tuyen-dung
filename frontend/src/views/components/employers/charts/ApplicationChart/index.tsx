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
  alpha,
  useTheme
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import dayjs from 'dayjs';
import BarChartClient from '@/components/Common/Charts/BarChartClient';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerApplicationStatistics } from '../../hooks/useEmployerQueries';
import pc from '@/utils/muiColors';

interface ApplicationChartProps {
  title: string;
}

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
        font: { size: 12, weight: 600 }
      }
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
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12, weight: 500 } }
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { font: { size: 12, weight: 500 } }
    }
  }
};

const ApplicationChart = ({ title }: ApplicationChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const [allowSubmit, setAllowSubmit] = React.useState(false);
  const [selectedDateRange, setSelectedDateRange] = React.useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs(new Date()).subtract(1, 'month'),
    dayjs(new Date()),
  ]);

  const queryParams = React.useMemo(() => ({
    startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD'),
  }), [selectedDateRange]);

  const { data, isLoading: queryLoading } = useEmployerApplicationStatistics(queryParams);

  const dataOptions = React.useMemo(() => {
    const title2 = String(data?.title2 ?? '');
    const title2Key = title2.toLowerCase().replace(/\s+/g, '');
    const title1 = String(data?.title1 ?? '');
    const title1Key = title1.toLowerCase().replace(/\s+/g, '');
    return ({
      labels: data?.labels || [],
      datasets: [
        {
          type: 'line' as const,
          label: t(`applicationChart.labels.${title2Key}`, { defaultValue: title2 }),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light || 'rgba(25, 118, 210, 0.1)',
          data: data?.data2 || [],
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
        },
        {
          type: 'bar' as const,
          label: t(`applicationChart.labels.${title1Key}`, { defaultValue: title1 }),
          backgroundColor: theme.palette.secondary.main,
          data: data?.data1 || [],
          borderRadius: 4,
          barThickness: 12,
          maxBarThickness: 12
        },
      ],
    });
  }, [data, t, theme]);

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
        bgcolor: 'background.paper'
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
            {title}
          </Typography>
          <MuiTooltip title={t('applicationChart.title')} arrow placement="top">
            <InfoIcon sx={{ color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} />
          </MuiTooltip>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

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
            {queryLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 320 }}>
                <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
              </Stack>
            ) : !data ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: 320,
                  bgcolor: pc.actionDisabled( 0.05),
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <InsertChartOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {t('applicationChart.noData')}
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ height: 320 }}>
                <BarChartClient options={options} data={dataOptions} />
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ApplicationChart;
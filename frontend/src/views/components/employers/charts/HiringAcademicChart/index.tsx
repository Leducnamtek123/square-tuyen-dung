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
import PieChartClient from '@/components/Common/Charts/PieChartClient';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerRecruitmentByRank } from '../../hooks/useEmployerQueries';

interface HiringAcademicChartProps {
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
  }
};

const HiringAcademicChart = ({ title }: HiringAcademicChartProps) => {
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

  const { data, isLoading: queryLoading } = useEmployerRecruitmentByRank(queryParams);

  const dataOptions = React.useMemo(() => {
    const labels = data?.labels?.map((label: string) => {
      const safeLabel = String(label ?? '');
      const labelKey = safeLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
      return t(`hiringAcademicChart.labels.${labelKey}`, { defaultValue: safeLabel });
    }) || [];

    return {
      labels: labels,
      datasets: [
        {
          label: t('hiringAcademicChart.applicationCount'),
          data: data?.data || [],
          backgroundColor: [
            'rgba(255, 152, 0, 0.9)',  // secondary
            'rgba(25, 118, 210, 0.9)', // primary
            'rgba(46, 125, 50, 0.9)',  // success
            'rgba(2, 136, 209, 0.9)',  // info
            'rgba(211, 47, 47, 0.9)',  // error
          ],
          borderWidth: 0,
          borderRadius: 4,
          spacing: 2,
          hoverOffset: 4
        },
      ],
    };
  }, [data, t]);

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
          <MuiTooltip title={t('hiringAcademicChart.title')} arrow placement="top">
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
            ) : (!data || !data.data || data.data.length === 0) ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: 320,
                  bgcolor: alpha(theme.palette.action.disabled, 0.05),
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <InsertChartOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {t('hiringAcademicChart.noData')}
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ height: 320 }}>
                <PieChartClient data={dataOptions} options={options} height={300} />
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default HiringAcademicChart;

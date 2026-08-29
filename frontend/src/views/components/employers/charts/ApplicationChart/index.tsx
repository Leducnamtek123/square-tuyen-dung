import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Stack, 
  Tooltip as MuiTooltip, 
  Typography, 
  Paper,
  useTheme
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import dayjs from 'dayjs';
import LineChartClient from '@/components/Common/Charts/LineChartClient';
import {
  ChartEmptyState,
  ChartLoadingState,
  chartAreaSx,
  chartCardSx,
  chartColors,
  chartTitleSx,
  createCartesianOptions,
  makeLineFill,
  rgba,
} from '@/components/Common/Charts/chartDesign';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerApplicationStatistics } from '../../hooks/useEmployerQueries';

interface ApplicationChartProps {
  title: string;
}

const ApplicationChart = ({ title }: ApplicationChartProps) => {
  const { t, i18n } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createCartesianOptions(theme, { language: i18n.language, displayLegend: true }), [i18n.language, theme]);
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

    return {
      labels: data?.labels || [],
      datasets: [
        {
          label: t(`applicationChart.labels.${title2Key}`, { defaultValue: title2 }),
          borderColor: chartColors.sky,
          backgroundColor: makeLineFill(chartColors.sky),
          data: data?.data2 || [],
          fill: true,
          tension: 0.38,
          cubicInterpolationMode: 'monotone' as const,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointHitRadius: 14,
          pointBackgroundColor: chartColors.sky,
          pointHoverBackgroundColor: '#FFFFFF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
        },
        {
          label: t(`applicationChart.labels.${title1Key}`, { defaultValue: title1 }),
          borderColor: chartColors.emerald,
          backgroundColor: rgba(chartColors.emerald, 0.08),
          data: data?.data1 || [],
          fill: true,
          tension: 0.38,
          cubicInterpolationMode: 'monotone' as const,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 2,
          pointHoverRadius: 5,
          pointHitRadius: 14,
          pointBackgroundColor: chartColors.emerald,
          pointHoverBackgroundColor: '#FFFFFF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [data, t]);

  const hasChartData = React.useMemo(() => {
    if (!data?.labels?.length) return false;
    return [data.data1, data.data2].some((series) => (series || []).some((value) => Number(value) > 0));
  }, [data]);

  return (
    <Paper elevation={0} sx={chartCardSx}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
              }}
            >
              <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={chartTitleSx}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Biến động lượt ứng tuyển và việc làm theo dòng thời gian
              </Typography>
            </Box>
          </Stack>

          <MuiTooltip title={t('applicationChart.title')} arrow placement="top">
            <InfoIcon sx={{ color: '#98A2B3', cursor: 'pointer', fontSize: 18, '&:hover': { color: '#2563EB' } }} />
          </MuiTooltip>
        </Box>

        <RangePickerCustom
          allowSubmit={allowSubmit}
          setAllowSubmit={setAllowSubmit}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
        />

        <Box sx={chartAreaSx(260)}>
          {queryLoading ? (
            <ChartLoadingState height="100%" label={t('applicationChart.loading')} />
          ) : !hasChartData ? (
            <ChartEmptyState height="100%" label={t('applicationChart.noData')} />
          ) : (
            <LineChartClient options={options} data={dataOptions} height="100%" />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ApplicationChart;

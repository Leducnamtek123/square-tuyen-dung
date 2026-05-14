import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Divider, 
  Stack, 
  Tooltip as MuiTooltip, 
  Typography, 
  Paper,
  useTheme
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import dayjs from 'dayjs';
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
  makeLineFill,
} from '@/components/Common/Charts/chartDesign';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerApplicationStatistics } from '../../hooks/useEmployerQueries';

interface ApplicationChartProps {
  title: string;
}

const ApplicationChart = ({ title }: ApplicationChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createCartesianOptions(theme), [theme]);
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
          borderColor: chartColors.sky,
          backgroundColor: makeLineFill(chartColors.sky),
          data: data?.data2 || [],
          fill: true,
          tension: 0.38,
          cubicInterpolationMode: 'monotone' as const,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 14,
          pointBackgroundColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: chartColors.sky,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
        },
        {
          type: 'bar' as const,
          label: t(`applicationChart.labels.${title1Key}`, { defaultValue: title1 }),
          backgroundColor: makeBarFill(chartColors.emerald),
          hoverBackgroundColor: chartColors.emerald,
          data: data?.data1 || [],
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.58,
          barPercentage: 0.72,
          maxBarThickness: 34,
        },
      ],
    });
  }, [data, t]);

  const hasChartData = React.useMemo(() => {
    if (!data?.labels?.length) return false;
    return [data.data1, data.data2].some((series) => (series || []).some((value) => Number(value) > 0));
  }, [data]);

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

          <Box sx={chartAreaSx(320)}>
            {queryLoading ? (
              <ChartLoadingState height="100%" label={t('applicationChart.loading', { defaultValue: 'Loading chart' })} />
            ) : !hasChartData ? (
              <ChartEmptyState height="100%" label={t('applicationChart.noData')} />
            ) : (
              <BarChartClient options={options} data={dataOptions} height="100%" />
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ApplicationChart;

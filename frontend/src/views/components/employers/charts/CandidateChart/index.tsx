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
} from '@/components/Common/Charts/chartDesign';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerCandidateStatistics } from '../../hooks/useEmployerQueries';

interface CandidateChartProps {
  title: string;
}

const CandidateChart = ({ title }: CandidateChartProps) => {
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

  const { data, isLoading: queryLoading } = useEmployerCandidateStatistics(queryParams);

  const dataOptions = React.useMemo(() => {
    const title1 = String(data?.title1 ?? '');
    const title1Key = title1.toLowerCase().replace(/\s+/g, '');
    const title2 = String(data?.title2 ?? '');
    const title2Key = title2.toLowerCase().replace(/\s+/g, '');
    return ({
      labels: data?.labels || [],
      datasets: [
        {
          label: t(`candidateChart.labels.${title1Key}`, { defaultValue: title1 }),
          data: data?.data1 || [],
          borderColor: chartColors.emerald,
          backgroundColor: makeLineFill(chartColors.emerald),
          fill: true,
          borderWidth: 3,
          tension: 0.38,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 14,
          pointBackgroundColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: chartColors.emerald,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
        },
        {
          label: t(`candidateChart.labels.${title2Key}`, { defaultValue: title2 }),
          data: data?.data2 || [],
          borderColor: chartColors.sky,
          backgroundColor: makeLineFill(chartColors.sky),
          fill: true,
          borderWidth: 3,
          tension: 0.38,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 14,
          pointBackgroundColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: chartColors.sky,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
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
          <MuiTooltip title={t('candidateChart.title')} arrow placement="top">
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
              <ChartLoadingState height="100%" label={t('candidateChart.loading', { defaultValue: 'Loading chart' })} />
            ) : !hasChartData ? (
              <ChartEmptyState height="100%" label={t('candidateChart.noData')} />
            ) : (
              <LineChartClient data={dataOptions} options={options} height="100%" />
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default CandidateChart;

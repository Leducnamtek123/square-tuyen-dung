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
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
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
          pointRadius: 2,
          pointHoverRadius: 6,
          pointHitRadius: 14,
          pointBackgroundColor: chartColors.emerald,
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: '#fff',
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
          pointRadius: 2,
          pointHoverRadius: 6,
          pointHitRadius: 14,
          pointBackgroundColor: chartColors.sky,
          pointHoverBackgroundColor: '#fff',
          pointBorderColor: '#fff',
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
    <Paper elevation={0} sx={chartCardSx}>
      <Box>
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
              <PeopleOutlineIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={chartTitleSx}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Tương quan ứng viên tiềm năng và hồ sơ mới
              </Typography>
            </Box>
          </Stack>

          <MuiTooltip title={t('candidateChart.title')} arrow placement="top">
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
            <ChartLoadingState height="100%" label={t('candidateChart.loading')} />
          ) : !hasChartData ? (
            <ChartEmptyState height="100%" label={t('candidateChart.noData')} />
          ) : (
            <LineChartClient data={dataOptions} options={options} height="100%" />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default CandidateChart;

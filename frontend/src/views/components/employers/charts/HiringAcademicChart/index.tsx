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
import PieChartClient from '@/components/Common/Charts/PieChartClient';
import {
  ChartEmptyState,
  ChartLoadingState,
  chartAreaSx,
  chartCardSx,
  chartColors,
  chartTitleSx,
  createDoughnutOptions,
  rgba,
} from '@/components/Common/Charts/chartDesign';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';
import { useEmployerRecruitmentByRank } from '../../hooks/useEmployerQueries';

interface HiringAcademicChartProps {
  title: string;
}

const HiringAcademicChart = ({ title }: HiringAcademicChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createDoughnutOptions(theme), [theme]);
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
            rgba(chartColors.sky, 0.92),
            rgba(chartColors.emerald, 0.92),
            rgba(chartColors.amber, 0.92),
            rgba(chartColors.violet, 0.92),
            rgba(chartColors.red, 0.9),
          ],
          hoverBackgroundColor: [
            chartColors.sky,
            chartColors.emerald,
            chartColors.amber,
            chartColors.violet,
            chartColors.red,
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          borderRadius: 6,
          spacing: 3,
          hoverOffset: 8
        },
      ],
    };
  }, [data, t]);

  const hasChartData = React.useMemo(() => Boolean(data?.data?.some((value: unknown) => Number(value) > 0)), [data]);

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

          <Box sx={chartAreaSx(320)}>
            {queryLoading ? (
              <ChartLoadingState height="100%" label={t('hiringAcademicChart.loading', { defaultValue: 'Loading chart' })} />
            ) : !hasChartData ? (
              <ChartEmptyState height="100%" label={t('hiringAcademicChart.noData')} />
            ) : (
              <PieChartClient data={dataOptions} options={options} height="100%" />
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default HiringAcademicChart;

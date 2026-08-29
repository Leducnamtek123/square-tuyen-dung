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
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
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
  const { t, i18n } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createDoughnutOptions(theme, i18n.language), [i18n.language, theme]);
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
                bgcolor: '#F5F3FF',
                color: '#8B5CF6',
              }}
            >
              <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={chartTitleSx}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Phân bổ hồ sơ ứng tuyển theo trình độ học vấn
              </Typography>
            </Box>
          </Stack>

          <MuiTooltip title={t('hiringAcademicChart.title')} arrow placement="top">
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
            <ChartLoadingState height="100%" label={t('hiringAcademicChart.loading')} />
          ) : !hasChartData ? (
            <ChartEmptyState height="100%" label={t('hiringAcademicChart.noData')} />
          ) : (
            <PieChartClient data={dataOptions} options={options} height="100%" />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default HiringAcademicChart;

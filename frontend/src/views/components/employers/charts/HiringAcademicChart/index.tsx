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
  chartColors,
  createDoughnutOptions,
  rgba,
} from '@/components/Common/Charts/chartDesign';
import { useEmployerRecruitmentByRank } from '@/views/components/employers/hooks/useEmployerQueries';

interface HiringAcademicChartProps {
  title: string;
  startDate?: string;
  endDate?: string;
}

const HiringAcademicChart = ({ title, startDate, endDate }: HiringAcademicChartProps) => {
  const { t, i18n } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createDoughnutOptions(theme, i18n.language), [i18n.language, theme]);

  const queryParams = React.useMemo(() => {
    if (startDate && endDate) {
      return { startDate, endDate };
    }
    return {
      startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
    };
  }, [startDate, endDate]);

  const { data, isLoading: queryLoading } = useEmployerRecruitmentByRank(queryParams);

  const dataOptions = React.useMemo(() => {
    const labels =
      data?.labels?.map((label: string) => {
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
          hoverOffset: 8,
        },
      ],
    };
  }, [data, t]);

  const hasChartData = React.useMemo(() => Boolean(data?.data?.some((value: unknown) => Number(value) > 0)), [data]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2.5,
              bgcolor: '#F5F3FF',
              color: '#8B5CF6',
            }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
              Phân bổ hồ sơ ứng tuyển theo trình độ học vấn
            </Typography>
          </Box>
        </Stack>

        <MuiTooltip title={t('hiringAcademicChart.title')} arrow placement="top">
          <InfoIcon sx={{ color: '#94A3B8', cursor: 'pointer', fontSize: 18, '&:hover': { color: '#2563EB' } }} />
        </MuiTooltip>
      </Box>

      <Box sx={{ height: 260, minHeight: 260, width: '100%', position: 'relative', flexGrow: 1 }}>
        {queryLoading ? (
          <ChartLoadingState height="100%" label={t('hiringAcademicChart.loading')} />
        ) : !hasChartData ? (
          <ChartEmptyState height="100%" label={t('hiringAcademicChart.noData')} />
        ) : (
          <PieChartClient data={dataOptions} options={options} height="100%" />
        )}
      </Box>
    </Paper>
  );
};

export default HiringAcademicChart;

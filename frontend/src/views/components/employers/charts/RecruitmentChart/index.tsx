/*

Project Recruitment System - Part of Project Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.

*/

import React from "react";
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
import InfoIcon from "@mui/icons-material/Info";
import dayjs, { Dayjs } from "dayjs";
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
} from '@/components/Common/Charts/chartDesign';
import RangePickerCustom from "../../../../../components/Common/Controls/RangePickerCustom";
import { useEmployerRecruitmentStatistics } from '../../hooks/useEmployerQueries';

interface RecruitmentChartProps {
  title: string;
}

const colors = [
  chartColors.sky,
  chartColors.emerald,
  chartColors.amber,
  chartColors.violet,
  chartColors.cyan,
  chartColors.red,
];

const RecruitmentChart = ({ title }: RecruitmentChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const options = React.useMemo(() => createCartesianOptions(theme, { stacked: true }), [theme]);
  const [allowSubmit, setAllowSubmit] = React.useState(false);
  const [selectedDateRange, setSelectedDateRange] = React.useState<[Dayjs | null, Dayjs | null]>([
    dayjs(new Date()).subtract(1, "month"),
    dayjs(new Date()),
  ]);

  const queryParams = React.useMemo(() => ({
    startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD'),
  }), [selectedDateRange]);

  const { data, isLoading: queryLoading } = useEmployerRecruitmentStatistics(queryParams);

  const dataOptions = React.useMemo(() => {
    const safeData = data || [];
    const datasets: Array<Record<string, unknown>> = [];

    for (let i = safeData.length - 1; i >= 0; i--) {
      const labelText = safeData[i]?.label;
      const labelKey = String(labelText ?? '')
        .toLowerCase()
        .replace(/\s+/g, '');

      datasets.push({
        label: t(`recruitmentChart.labels.${labelKey}`, { defaultValue: labelText }),
        data: (safeData[i]?.data || []),
        backgroundColor: makeBarFill(colors[i % colors.length]),
        hoverBackgroundColor: colors[i % colors.length],
        stack: "Stack 0",
        borderRadius: 8,
        borderSkipped: false,
        categoryPercentage: 0.64,
        barPercentage: 0.72,
        maxBarThickness: 42
      });
    }

    return {
      labels: [""],
      datasets,
    };
  }, [data, t]);

  const hasChartData = React.useMemo(() => {
    if (!data?.length) return false;
    return data.some((item) => (item?.data || []).some((value: unknown) => Number(value) > 0));
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
          <MuiTooltip title={t('recruitmentChart.title')} arrow placement="top">
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
              <ChartLoadingState height="100%" label={t('recruitmentChart.loading', { defaultValue: 'Loading chart' })} />
            ) : !hasChartData ? (
              <ChartEmptyState height="100%" label={t('recruitmentChart.noData')} />
            ) : (
              <BarChartClient options={options} data={dataOptions} height="100%" />
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default RecruitmentChart;

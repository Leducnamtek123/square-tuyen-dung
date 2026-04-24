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
  CircularProgress,
  Paper,
  alpha,
  useTheme
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import dayjs, { Dayjs } from "dayjs";
import BarChartClient from '@/components/Common/Charts/BarChartClient';
import RangePickerCustom from "../../../../../components/Common/Controls/RangePickerCustom";
import { useEmployerRecruitmentStatistics } from '../../hooks/useEmployerQueries';
import pc from '@/utils/muiColors';

interface RecruitmentChartProps {
  title: string;
}

const colors = [
  "rgba(255, 159, 64, 0.9)",
  "rgba(255, 206, 86, 0.9)",
  "rgba(153, 102, 255, 0.9)",
  "rgba(54, 162, 235, 0.9)",
  "rgba(75, 192, 192, 0.9)",
  "rgba(255, 99, 132, 0.9)",
];

const options = {
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: "circle",
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
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 12, weight: 500 } }
    },
    y: {
      stacked: true,
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { font: { size: 12, weight: 500 } }
    }
  }
};

const RecruitmentChart = ({ title }: RecruitmentChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
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
    const datasets: Array<{
      label: string | undefined;
      data: unknown[];
      backgroundColor: string | undefined;
      stack: string;
      borderRadius: number;
      barThickness: number;
      maxBarThickness: number;
    }> = [];

    for (let i = safeData.length - 1; i >= 0; i--) {
      const labelText = safeData[i]?.label;
      const labelKey = String(labelText ?? '')
        .toLowerCase()
        .replace(/\s+/g, '');

      datasets.push({
        label: t(`recruitmentChart.labels.${labelKey}`, { defaultValue: labelText }),
        data: (safeData[i]?.data || []),
        backgroundColor: colors[i],
        stack: "Stack 0",
        borderRadius: 4,
        barThickness: 12,
        maxBarThickness: 12
      });
    }

    return {
      labels: [""],
      datasets,
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

          <Box sx={{ position: 'relative', minHeight: 320 }}>
            {queryLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 320 }}>
                <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
              </Stack>
            ) : (!data || data.length === 0) ? (
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
                    {t('recruitmentChart.noData')}
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

export default RecruitmentChart;
'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Stack,
  LinearProgress,
  useTheme,
  Tooltip as MuiTooltip,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import InfoIcon from '@mui/icons-material/Info';
import dayjs, { Dayjs } from 'dayjs';
import PieChartClient from '@/components/Common/Charts/PieChartClient';
import {
  ChartEmptyState,
  ChartLoadingState,
  chartCardSx,
  chartColors,
  chartTitleSx,
  createDoughnutOptions,
} from '@/components/Common/Charts/chartDesign';
import { useEmployerRecruitmentStatistics } from '../../hooks/useEmployerQueries';
import RangePickerCustom from '../../../../../components/Common/Controls/RangePickerCustom';

interface RecruitmentChartProps {
  title: string;
}

const STAGE_COLORS: Record<string, string> = {
  chờxácnhận: chartColors.amber,
  pending: chartColors.amber,
  đãliênhệ: chartColors.cyan,
  contacted: chartColors.cyan,
  đãlàmbàitest: chartColors.sky,
  tested: chartColors.sky,
  đãphỏngvấn: chartColors.violet,
  interviewed: chartColors.violet,
  đãtuyểndụng: chartColors.emerald,
  hired: chartColors.emerald,
  khôngđượcchọn: chartColors.red,
  notselected: chartColors.red,
};

const DEFAULT_COLORS = [
  chartColors.emerald,
  chartColors.sky,
  chartColors.violet,
  chartColors.cyan,
  chartColors.amber,
  chartColors.red,
];

const RecruitmentChart = ({ title }: RecruitmentChartProps) => {
  const { t, i18n } = useTranslation('employer');
  const theme = useTheme();
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(1, 'month'),
    dayjs(),
  ]);

  const queryParams = useMemo(() => ({
    startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD'),
  }), [selectedDateRange]);

  const { data, isLoading } = useEmployerRecruitmentStatistics(queryParams);

  const funnelItems = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, idx) => {
      const rawLabel = String(item.label || '').trim();
      const normalizedKey = rawLabel.toLowerCase().replace(/\s+/g, '');
      const count = Number(item.data?.[0] ?? 0);
      const color = STAGE_COLORS[normalizedKey] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

      return {
        key: normalizedKey,
        label: t(`recruitmentChart.labels.${normalizedKey}`, { defaultValue: rawLabel }),
        count,
        color,
      };
    });
  }, [data, t]);

  const totalCount = useMemo(() => {
    return funnelItems.reduce((acc, item) => acc + item.count, 0);
  }, [funnelItems]);

  const chartData = useMemo(() => {
    return {
      labels: funnelItems.map((item) => item.label),
      datasets: [
        {
          data: funnelItems.map((item) => item.count),
          backgroundColor: funnelItems.map((item) => item.color),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }, [funnelItems]);

  const doughnutOptions = useMemo(() => {
    return createDoughnutOptions(theme, i18n.language);
  }, [theme, i18n.language]);

  return (
    <Paper elevation={0} sx={chartCardSx}>
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
              bgcolor: '#F0FDF4',
              color: '#10B981',
            }}
          >
            <FilterAltOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={chartTitleSx}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Phân bổ ứng viên qua từng vòng tuyển dụng
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {!isLoading && totalCount > 0 && (
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: '8px',
                bgcolor: '#F1F5F9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
              }}
            >
              Tổng: {totalCount.toLocaleString('vi-VN')} CV
            </Box>
          )}
          <MuiTooltip title={t('recruitmentChart.tooltip', { defaultValue: 'Phễu phân bổ ứng viên qua các giai đoạn tuyển dụng' })} arrow placement="top">
            <InfoIcon sx={{ color: '#98A2B3', cursor: 'pointer', fontSize: 18, '&:hover': { color: '#2563EB' } }} />
          </MuiTooltip>
        </Stack>
      </Box>

      {/* Date Filter Row */}
      <RangePickerCustom
        allowSubmit={allowSubmit}
        setAllowSubmit={setAllowSubmit}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
      />

      {/* Body Content */}
      {isLoading ? (
        <ChartLoadingState height="260px" label={t('recruitmentChart.loading')} />
      ) : funnelItems.length === 0 || totalCount === 0 ? (
        <ChartEmptyState height="260px" label={t('recruitmentChart.noData', { defaultValue: 'Chưa có dữ liệu phễu tuyển dụng' })} />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 3,
            flexGrow: 1,
            mt: 1,
            py: 1,
          }}
        >
          {/* Doughnut Chart */}
          <Box
            sx={{
              width: { xs: '100%', sm: 170 },
              height: 170,
              flexShrink: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PieChartClient data={chartData} options={doughnutOptions} />
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A', lineHeight: 1 }}>
                {totalCount}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                Ứng viên
              </Typography>
            </Box>
          </Box>

          {/* Progress List */}
          <Stack spacing={1.5} sx={{ flexGrow: 1, width: '100%' }}>
            {funnelItems.map((item) => {
              const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

              return (
                <Box key={item.key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                        {item.label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
                      {item.count} <Typography component="span" sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>({pct}%)</Typography>
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default RecruitmentChart;

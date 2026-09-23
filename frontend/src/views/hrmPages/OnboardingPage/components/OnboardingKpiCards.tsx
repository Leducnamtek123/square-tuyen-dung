import React from 'react';
import { Box, Card, Typography, Stack, Skeleton, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import type { OnboardingStatsResponse } from '@/services/hrmService';
import pc from '@/utils/muiColors';

interface Props {
  stats?: OnboardingStatsResponse;
  loading?: boolean;
  selectedFilterStage?: string;
  onFilterClick?: (stage: string) => void;
}

export const OnboardingKpiCards: React.FC<Props> = ({
  stats,
  loading = false,
  selectedFilterStage,
  onFilterClick,
}) => {
  const total = stats?.total_onboarding ?? stats?.totalOnboarding ?? 0;
  const pendingDocs = stats?.pending_preboarding_docs ?? stats?.pendingPreboardingDocs ?? 0;
  const upcomingDayOne = stats?.upcoming_day_one_7d ?? stats?.upcomingDayOne7d ?? 0;
  const probationDue = stats?.probation_due_15d ?? stats?.probationDue15d ?? 0;

  const cards = [
    {
      id: 'ALL',
      title: 'Đang Onboarding',
      value: total,
      subtitle: 'Nhân sự mới trong quy trình',
      icon: <RocketLaunchIcon sx={{ fontSize: 26, color: '#3b82f6' }} />,
      bgColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.25)',
      activeBorder: '#3b82f6',
      filterVal: '',
    },
    {
      id: 'PREBOARDING_DOCS',
      title: 'Chờ duyệt Hồ sơ',
      value: pendingDocs,
      subtitle: 'CCCD, bằng cấp, STK cần duyệt',
      icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 26, color: '#f59e0b' }} />,
      bgColor: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      activeBorder: '#f59e0b',
      filterVal: 'PREBOARDING_DOCS',
      badge: pendingDocs > 0 ? `${pendingDocs} cần xử lý` : undefined,
      badgeColor: 'warning' as const,
    },
    {
      id: 'UPCOMING_DAY_ONE',
      title: 'Sắp nhận việc (7 ngày)',
      value: upcomingDayOne,
      subtitle: 'Chuẩn bị thiết bị & chỗ ngồi',
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 26, color: '#06b6d4' }} />,
      bgColor: 'rgba(6, 182, 212, 0.08)',
      borderColor: 'rgba(6, 182, 212, 0.25)',
      activeBorder: '#06b6d4',
      filterVal: 'INTERNAL_PREP',
    },
    {
      id: 'PROBATION_EVALUATION',
      title: 'Cần đánh giá Thử việc',
      value: probationDue,
      subtitle: 'Hết hạn thử việc trong 15 ngày',
      icon: <GavelOutlinedIcon sx={{ fontSize: 26, color: '#10b981' }} />,
      bgColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      activeBorder: '#10b981',
      filterVal: 'PROBATION_EVALUATION',
      badge: probationDue > 0 ? 'Sắp đến hạn' : undefined,
      badgeColor: 'success' as const,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((c) => {
        const isSelected = selectedFilterStage === c.filterVal && c.filterVal !== '';

        return (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => onFilterClick && onFilterClick(c.filterVal)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                backgroundColor: 'background.paper',
                border: '1.5px solid',
                borderColor: isSelected ? c.activeBorder : pc.divider(0.85),
                boxShadow: isSelected
                  ? `0 6px 20px ${c.bgColor}`
                  : '0 2px 8px rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 24px ${c.bgColor}`,
                  borderColor: c.activeBorder,
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: c.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {c.icon}
                </Box>
                {c.badge && (
                  <Chip
                    size="small"
                    label={c.badge}
                    color={c.badgeColor}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                )}
              </Stack>

              {loading ? (
                <Skeleton width="60%" height={38} sx={{ my: 0.5 }} />
              ) : (
                <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                  {c.value}
                </Typography>
              )}

              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {c.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {c.subtitle}
              </Typography>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

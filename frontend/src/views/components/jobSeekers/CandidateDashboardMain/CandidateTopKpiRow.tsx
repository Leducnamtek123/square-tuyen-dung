'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Grid2 as Grid,
  Typography,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { User } from '@/types/models';
import { localizeRoutePath } from '@/configs/routeLocalization';

interface CandidateTopKpiRowProps {
  user?: User | null;
  stats?: {
    appliedCount?: number;
    savedCount?: number;
    viewedCount?: number;
    followingCount?: number;
  };
}

const CandidateTopKpiRow = ({ stats }: CandidateTopKpiRowProps) => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);
  const appliedCount = stats?.appliedCount ?? 0;
  const savedCount = stats?.savedCount ?? 0;
  const viewedCount = stats?.viewedCount ?? 0;
  const followingCount = stats?.followingCount ?? 0;

  const kpis = [
    {
      title: t('jobSeeker:candidateDashboard.kpi.appliedTitle', { defaultValue: 'Việc làm đã ứng tuyển' }),
      value: appliedCount,
      subtext: t('jobSeeker:candidateDashboard.kpi.appliedSubtext', { defaultValue: 'Hồ sơ đang chờ phản hồi' }),
      icon: <WorkOutlineIcon sx={{ color: '#16a34a' }} />,
      bgColor: '#f0fdf4',
      path: '/my-jobs?tab=2',
    },
    {
      title: t('jobSeeker:candidateDashboard.kpi.savedTitle', { defaultValue: 'Việc làm đã lưu' }),
      value: savedCount,
      subtext: t('jobSeeker:candidateDashboard.kpi.savedSubtext', { defaultValue: 'Công việc yêu thích của bạn' }),
      icon: <BookmarkBorderIcon sx={{ color: '#2563eb' }} />,
      bgColor: '#eff6ff',
      path: '/my-jobs?tab=1',
    },
    {
      title: t('jobSeeker:candidateDashboard.kpi.viewedTitle', { defaultValue: 'Nhà tuyển dụng đã xem' }),
      value: viewedCount,
      subtext: t('jobSeeker:candidateDashboard.kpi.viewedSubtext', { defaultValue: 'Trong 30 ngày gần đây' }),
      icon: <RemoveRedEyeOutlinedIcon sx={{ color: '#4f46e5' }} />,
      bgColor: '#eef2ff',
      path: '/my-company',
    },
    {
      title: t('jobSeeker:candidateDashboard.kpi.followingTitle', { defaultValue: 'Công ty đang theo dõi' }),
      value: followingCount,
      subtext: t('jobSeeker:candidateDashboard.kpi.followingSubtext', { defaultValue: 'Quan tâm đến bạn' }),
      icon: <FavoriteBorderIcon sx={{ color: '#ea580c' }} />,
      bgColor: '#fff7ed',
      path: '/companies',
    },
  ];

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%' }}>
      {kpis.map((kpi) => (
        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={kpi.title}>
          <Card
            component={Link}
            href={localizeRoutePath(kpi.path, i18n.language)}
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 2.5 },
              borderRadius: { xs: '16px', sm: '20px' },
              border: '1px solid rgba(226, 232, 240, 0.85)',
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, border-color 180ms ease',
              height: '100%',
              minWidth: 0,
              '&:hover': {
                borderColor: '#2563eb',
                transform: 'translateY(-3px)',
                boxShadow: '0 20px 35px -5px rgba(37, 99, 235, 0.12)',
              },
              '&:active': {
                transform: 'scale(0.99)',
              },
            }}
          >
            <Box sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.25 }, mb: 0.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: { xs: 32, sm: 38 },
                    height: { xs: 32, sm: 38 },
                    borderRadius: { xs: '10px', sm: '12px' },
                    backgroundColor: kpi.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    '& svg': {
                      fontSize: { xs: 18, sm: 22 },
                    },
                  }}
                >
                  {kpi.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: { xs: '0.775rem', sm: '0.825rem' },
                    lineHeight: 1.3,
                    minWidth: 0,
                    overflowWrap: 'break-word',
                  }}
                >
                  {kpi.title}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: { xs: '0.675rem', sm: '0.725rem' },
                  display: { xs: 'none', sm: 'block' },
                  lineHeight: 1.2,
                  minWidth: 0,
                }}
              >
                {kpi.subtext}
              </Typography>
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-mono)',
                fontSize: { xs: '1.35rem', sm: '1.625rem' },
                letterSpacing: '-0.02em',
                ml: { xs: 0, sm: 1 },
                mt: { xs: 1, sm: 0 },
                alignSelf: { xs: 'flex-end', sm: 'center' },
              }}
            >
              {kpi.value}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CandidateTopKpiRow;

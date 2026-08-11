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
  const { i18n } = useTranslation('common');
  const appliedCount = stats?.appliedCount ?? 0;
  const savedCount = stats?.savedCount ?? 0;
  const viewedCount = stats?.viewedCount ?? 0;
  const followingCount = stats?.followingCount ?? 0;

  const kpis = [
    {
      title: 'Việc làm đã ứng tuyển',
      value: appliedCount,
      subtext: 'Hồ sơ đang chờ phản hồi',
      icon: <WorkOutlineIcon sx={{ color: '#16a34a' }} />,
      bgColor: '#f0fdf4',
      path: '/my-jobs?tab=2',
    },
    {
      title: 'Việc làm đã lưu',
      value: savedCount,
      subtext: 'Công việc yêu thích của bạn',
      icon: <BookmarkBorderIcon sx={{ color: '#2563eb' }} />,
      bgColor: '#eff6ff',
      path: '/my-jobs?tab=1',
    },
    {
      title: 'Nhà tuyển dụng đã xem',
      value: viewedCount,
      subtext: 'Trong 30 ngày gần đây',
      icon: <RemoveRedEyeOutlinedIcon sx={{ color: '#4f46e5' }} />,
      bgColor: '#eef2ff',
      path: '/my-jobs?tab=1',
    },
    {
      title: 'Công ty đang theo dõi',
      value: followingCount,
      subtext: 'Quan tâm đến bạn',
      icon: <FavoriteBorderIcon sx={{ color: '#ea580c' }} />,
      bgColor: '#fff7ed',
      path: '/companies',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ width: '100%' }}>
      {kpis.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.title}>
          <Card
            component={Link}
            href={localizeRoutePath(kpi.path, i18n.language)}
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease-in-out',
              height: '100%',
              '&:hover': {
                borderColor: '#2563eb',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px -4px rgba(37,99,235,0.12)',
              },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: kpi.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {kpi.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: '0.8rem',
                    lineHeight: 1.3,
                  }}
                >
                  {kpi.title}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.725rem',
                  display: 'block',
                  lineHeight: 1.2,
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
                fontSize: '1.5rem',
                ml: 1,
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

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ROUTES } from '@/configs/constants';
import { getPreferredLanguage } from '@/configs/portalRouting';
import { localizeRoutePath } from '@/configs/routeLocalization';
import type { AdminGeneralStats } from '@/services/statisticService';

interface PendingActionWidgetProps {
  stats?: AdminGeneralStats;
  loading?: boolean;
}

export default function PendingActionWidget({ stats, loading = false }: PendingActionWidgetProps) {
  const router = useRouter();
  const lang = getPreferredLanguage();

  const pendingJobs = stats?.totalJobPostsPending || 0;
  const pendingVerifications = stats?.totalCompanyVerificationsPending || 0;
  const totalReports = (stats?.totalCompanyVerificationsRejected || 0) + (stats?.totalJobPostsRejected || 0);

  const items = [
    {
      id: 'jobs',
      title: 'Tin tuyển dụng chờ duyệt',
      count: pendingJobs,
      desc: 'Cần kiểm duyệt tiêu chuẩn nội dung và AI trust score',
      route: ROUTES.ADMIN.JOBS,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 20 }} />,
      urgent: pendingJobs > 0,
    },
    {
      id: 'verifications',
      title: 'Xác thực doanh nghiệp (KYC)',
      count: pendingVerifications,
      desc: 'Hồ sơ đăng ký kinh doanh và giấy phép đang chờ xử lý',
      route: ROUTES.ADMIN.COMPANY_VERIFICATIONS,
      color: '#10B981',
      bgColor: '#ECFDF5',
      icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} />,
      urgent: pendingVerifications > 0,
    },
    {
      id: 'reports',
      title: 'Báo cáo & Tố cáo vi phạm',
      count: totalReports,
      desc: 'Báo cáo nghi vấn gian lận hoặc nội dung vi phạm',
      route: ROUTES.ADMIN.TRUST_REPORTS,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 20 }} />,
      urgent: totalReports > 0,
    },
  ];

  const handleNavigate = (route: string) => {
    const localized = localizeRoutePath(`/${route}`, lang);
    router.push(localized);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
          Việc cần xử lý ngay
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.8125rem' }}>
          Các mục cần phê duyệt hoặc xác minh của Admin
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => handleNavigate(item.route)}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid #F1F5F9',
              bgcolor: '#FAFAFA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              '&:hover': {
                bgcolor: '#F1F5F9',
                borderColor: '#CBD5E1',
                transform: 'translateX(3px)',
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: item.bgColor,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {item.desc}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 2,
                  bgcolor: item.urgent ? '#FEE2E2' : '#F1F5F9',
                  color: item.urgent ? '#DC2626' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {loading ? '...' : item.count}
              </Box>
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

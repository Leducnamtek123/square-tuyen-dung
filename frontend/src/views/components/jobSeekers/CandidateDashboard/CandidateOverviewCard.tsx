'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Grid2 as Grid,
  Button,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { ExtendedResume } from '@/components/Features/CVDoc';

interface CandidateOverviewCardProps {
  resume: ExtendedResume | null;
}

const CandidateOverviewCard = ({ resume }: CandidateOverviewCardProps) => {
  const overviewItems = [
    {
      label: 'Kinh nghiệm',
      value: '2 năm',
      icon: <WorkHistoryOutlinedIcon sx={{ color: '#2563eb' }} />,
      bgColor: '#eff6ff',
    },
    {
      label: 'Cấp bậc mong muốn',
      value: 'Nhân viên',
      icon: <LockOutlinedIcon sx={{ color: '#16a34a' }} />,
      bgColor: '#f0fdf4',
    },
    {
      label: 'Mức lương mong muốn',
      value: '15 - 20 triệu',
      icon: <MonetizationOnOutlinedIcon sx={{ color: '#ea580c' }} />,
      bgColor: '#fff7ed',
    },
    {
      label: 'Học vấn',
      value: 'Đại học',
      icon: <SchoolOutlinedIcon sx={{ color: '#9333ea' }} />,
      bgColor: '#faf5ff',
    },
    {
      label: 'Ngành nghề',
      value: 'Công nghệ thông tin',
      icon: <CodeOutlinedIcon sx={{ color: '#0d9488' }} />,
      bgColor: '#f0fdfa',
    },
    {
      label: 'Hình thức làm việc',
      value: 'Toàn thời gian',
      icon: <AccessTimeOutlinedIcon sx={{ color: '#0284c7' }} />,
      bgColor: '#f0f9ff',
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BadgeOutlinedIcon sx={{ color: '#2563eb' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
          Tổng quan hồ sơ
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {overviewItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: item.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>
                  {item.label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                  {item.value}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 2, pt: 1.5, borderTop: '1px solid #f8fafc' }}>
        <Button
          size="small"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '10px !important' }} />}
          sx={{
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent', color: '#1d4ed8' },
          }}
        >
          Xem chi tiết hồ sơ
        </Button>
      </Box>
    </Card>
  );
};

export default CandidateOverviewCard;

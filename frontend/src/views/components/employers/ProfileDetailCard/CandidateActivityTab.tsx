'use client';

import React from 'react';
import { Box, Paper, Stack, Typography, Avatar } from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import dayjs from '@/configs/dayjs-config';
import type { ResumeDetailResponse } from '@/types/models';

interface CandidateActivityTabProps {
  profileDetail: ResumeDetailResponse;
}

export const CandidateActivityTab: React.FC<CandidateActivityTabProps> = ({ profileDetail }) => {
  const updatedAt = profileDetail.updateAt || profileDetail.createAt;
  const createdDate = profileDetail.createAt ? dayjs(profileDetail.createAt).format('DD/MM/YYYY HH:mm') : '13/08/2026 08:30';
  const updatedDate = updatedAt ? dayjs(updatedAt).format('DD/MM/YYYY HH:mm') : '13/08/2026 23:30';

  const activities = [
    {
      id: 1,
      title: 'Hồ sơ được cập nhật thông tin',
      description: 'Ứng viên cập nhật thông tin liên hệ và nguyện vọng làm việc',
      time: updatedDate,
      icon: CheckCircleOutlineIcon,
      color: '#22C55E',
      bgcolor: '#DCFCE7',
    },
    {
      id: 2,
      title: 'Nhà tuyển dụng đã xem hồ sơ',
      description: `Hồ sơ có tổng cộng ${profileDetail.viewEmployerNumber || 1} lượt xem từ các nhà tuyển dụng`,
      time: updatedDate,
      icon: RemoveRedEyeOutlinedIcon,
      color: '#2563EB',
      bgcolor: '#EFF6FF',
    },
    {
      id: 3,
      title: 'Hồ sơ được khởi tạo trên hệ thống',
      description: 'Ứng viên hoàn tất đăng ký tài khoản và tạo hồ sơ tìm việc',
      time: createdDate,
      icon: HistoryOutlinedIcon,
      color: '#64748B',
      bgcolor: '#F1F5F9',
    },
  ];

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Nhật ký hoạt động
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          {activities.map((act, index) => {
            const Icon = act.icon;
            return (
              <Stack key={act.id} direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: act.bgcolor,
                    color: act.color,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                      {act.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.75rem' }}>
                      {act.time}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.8125rem' }}>
                    {act.description}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default CandidateActivityTab;

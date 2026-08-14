'use client';

import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AddIcon from '@mui/icons-material/Add';
import type { ResumeDetailResponse } from '@/types/models';
import toastMessages from '@/utils/toastMessages';

interface CandidateInterviewTabProps {
  profileDetail: ResumeDetailResponse;
}

export const CandidateInterviewTab: React.FC<CandidateInterviewTabProps> = ({ profileDetail }) => {
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
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
              <MicNoneOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
              Lịch sử phỏng vấn & Đánh giá
            </Typography>
          </Stack>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => toastMessages.info('Tính năng lên lịch phỏng vấn')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              bgcolor: '#2563EB',
            }}
          >
            Lên lịch phỏng vấn
          </Button>
        </Stack>

        <Box
          sx={{
            py: 6,
            px: 2,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            textAlign: 'center',
          }}
        >
          <EventOutlinedIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ color: '#334155', fontWeight: 700 }}>
            Chưa có lịch phỏng vấn nào được tạo cho ứng viên này
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, maxWidth: 460, mx: 'auto' }}>
            Nhà tuyển dụng có thể lên lịch phỏng vấn trực tuyến hoặc đánh giá qua Voice AI bot.
          </Typography>
        </Box>
      </Paper>
    </Stack>
  );
};

export default CandidateInterviewTab;

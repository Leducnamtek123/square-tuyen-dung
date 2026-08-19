'use client';

import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AddIcon from '@mui/icons-material/Add';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import type { ResumeDetailResponse } from '@/types/models';
import toastMessages from '@/utils/toastMessages';

interface CandidateInterviewTabProps {
  profileDetail: ResumeDetailResponse;
}

export const CandidateInterviewTab: React.FC<CandidateInterviewTabProps> = ({ profileDetail }) => {
  const theme = useTheme();

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MicNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
                Lịch sử & Quy trình Phỏng vấn
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Theo dõi tiến trình các vòng phỏng vấn AI và đánh giá từ hội đồng tuyển dụng
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => toastMessages.info('Tính năng lên lịch phỏng vấn')}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 750,
              fontSize: '0.8125rem',
              px: 2.25,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Lên lịch phỏng vấn
          </Button>
        </Stack>

        {/* Workflow Timeline Cards */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* Round 1: AI Screening */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SmartToyOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
                    Vòng 1: Khảo sát & Phỏng vấn AI (Voice Bot)
                  </Typography>
                  <Chip label="Tự động" size="small" sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700, bgcolor: 'action.hover' }} />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontWeight: 500 }}>
                  Đánh giá sơ bộ năng lực chuyên môn, phản xạ tiếng Anh và phong thái giao tiếp.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label="Sẵn sàng gửi link"
              size="small"
              sx={{
                fontWeight: 750,
                fontSize: '0.75rem',
                borderRadius: '8px',
                bgcolor: alpha('#16a34a', 0.1),
                color: '#16a34a',
                border: '1px solid',
                borderColor: alpha('#16a34a', 0.2),
              }}
            />
          </Box>

          {/* Round 2: Technical Live Interview */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
                    Vòng 2: Phỏng vấn Chuyên môn Trực tiếp (Live)
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontWeight: 500 }}>
                  Trao đổi chuyên sâu cùng Trưởng bộ phận & HR Manager qua video call trực tuyến.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label="Chưa xếp lịch"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '8px',
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            />
          </Box>
        </Stack>

        {/* Guidance Box */}
        <Box
          sx={{
            py: 4,
            px: 3,
            borderRadius: 3,
            bgcolor: 'action.hover',
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <EventOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 750 }}>
            Chưa có biên bản phỏng vấn nào được ghi nhận cho ứng viên này
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 500, mx: 'auto', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            Sau khi ứng viên hoàn thành buổi phỏng vấn AI hoặc Live, toàn bộ video ghi âm, bảng điểm năng lực và bản gỡ băng (transcript) sẽ tự động xuất hiện tại đây.
          </Typography>
        </Box>
      </Paper>
    </Stack>
  );
};

export default CandidateInterviewTab;

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Grid2 as Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import { useTranslation } from 'react-i18next';
import type { EmployerFullFormValues } from '../schemas/employerOnboardingSchema';

interface StepEmployerCompleteProps {
  formData: EmployerFullFormValues;
  cityName: string;
  onPostJob: () => void;
  onViewDashboard: () => void;
}

export default function StepEmployerComplete({
  formData,
  cityName,
  onPostJob,
  onViewDashboard,
}: StepEmployerCompleteProps) {
  const { t } = useTranslation('employer');

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      {/* Celebration Header */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#DCFCE7',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)',
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
        {t('employerOnboarding.step4.title', 'Chào mừng bạn gia nhập InfoHR!')}
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 540, mx: 'auto', mb: 3 }}>
        {t('employerOnboarding.step4.subtitle', 'Hồ sơ doanh nghiệp đã được thiết lập thành công. Bạn có thể bắt đầu đăng tin và tuyển dụng nhân tài ngay bây giờ.')}
      </Typography>

      {/* Free Platform Banner */}
      <Alert
        severity="success"
        icon={<CheckCircleRoundedIcon fontSize="inherit" />}
        sx={{
          mb: 3.5,
          borderRadius: 3,
          textAlign: 'left',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          '& .MuiAlert-icon': { color: '#16A34A' },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Hệ thống hỗ trợ Nhà tuyển dụng đăng tin và quản lý ứng viên hoàn toàn <strong>miễn phí không giới hạn</strong>.
        </Typography>
      </Alert>

      {/* Company Summary Card */}
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          borderRadius: 3.5,
          textAlign: 'left',
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Avatar
            src={formData.logoUrl || ''}
            variant="rounded"
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : <BusinessIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
              {formData.companyName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {formData.taxCode ? `MST: ${formData.taxCode} • ` : ''}
              {formData.fieldOperation || 'Xây dựng & Kiến trúc'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PersonOutlineIcon fontSize="small" sx={{ color: '#64748B' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {t('employerOnboarding.step4.recruiter', 'Đại diện tuyển dụng')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {formData.recruiterName} {formData.recruiterTitle ? `(${formData.recruiterTitle})` : ''}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocationOnOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {t('employerOnboarding.step4.location', 'Địa chỉ trụ sở')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {formData.address ? `${formData.address}, ` : ''}{cityName || 'Toàn quốc'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <VerifiedUserOutlinedIcon
                fontSize="small"
                sx={{ color: formData.gpkdFileName ? '#16A34A' : '#94A3B8' }}
              />
              <Typography variant="body2" sx={{ color: '#475569' }}>
                <strong>{t('employerOnboarding.step4.verificationStatus', 'Trạng thái xác thực')}:</strong>{' '}
                {formData.gpkdFileName ? (
                  <Box component="span" sx={{ color: '#16A34A', fontWeight: 700 }}>
                    {t('employerOnboarding.step4.verifiedPending', 'Đã nộp GPKD (Chờ duyệt tích xanh)')}
                  </Box>
                ) : (
                  <Box component="span" sx={{ color: '#64748B' }}>
                    {t('employerOnboarding.step4.notSubmitted', 'Chưa nộp GPKD (Có thể xác thực sau trong Cài đặt)')}
                  </Box>
                )}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onPostJob}
          startIcon={<PostAddIcon />}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
          }}
        >
          {t('employerOnboarding.step4.postJob', 'Đăng tin Tuyển dụng ngay')}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          size="large"
          onClick={onViewDashboard}
          startIcon={<DashboardOutlinedIcon />}
          sx={{
            borderRadius: 3,
            px: 3.5,
            py: 1.5,
            fontWeight: 700,
            borderColor: '#CBD5E1',
            color: '#334155',
          }}
        >
          {t('employerOnboarding.step4.dashboard', 'Vào Bảng điều khiển')}
        </Button>
      </Stack>
    </Box>
  );
}

'use client';

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Chip,
  Stack,
  Autocomplete,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useTranslation } from 'react-i18next';
import type { EmployerStep2Values } from '../schemas/employerOnboardingSchema';

interface StepRecruiterProfileProps {
  values: EmployerStep2Values;
  onChange: (field: keyof EmployerStep2Values, value: any) => void;
  errors: Record<string, string>;
}

const COMMON_HIRING_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'UI/UX Designer',
  'Nhân viên Kinh doanh (Sales)',
  'Chuyên viên Marketing',
  'Kế toán tổng hợp',
  'Chuyên viên Nhân sự (HR)',
  'Quản lý Dự án (PM)',
  'Chăm sóc khách hàng (CSKH)',
];

export default function StepRecruiterProfile({
  values,
  onChange,
  errors,
}: StepRecruiterProfileProps) {
  const { t } = useTranslation('employer');

  return (
    <Box>
      {/* Step Header */}
      <Box sx={{ mb: 3.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BadgeOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            {t('employerOnboarding.step2.title', 'Thông tin Đại diện Tuyển dụng')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748B', pl: { xs: 0, sm: 6 } }}>
          {t('employerOnboarding.step2.subtitle', 'Thông tin người phụ trách giúp ứng viên và hệ thống liên hệ trao đổi công việc dễ dàng')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Recruiter Full Name */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step2.recruiterName', 'Họ và tên người phụ trách')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step2.recruiterNamePlaceholder', 'VD: Nguyễn Văn A')}
            value={values.recruiterName}
            onChange={(e) => onChange('recruiterName', e.target.value)}
            error={Boolean(errors.recruiterName)}
            helperText={errors.recruiterName || ''}
            FormHelperTextProps={{
              sx: { color: errors.recruiterName ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Recruiter Job Title */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step2.recruiterTitle', 'Chức danh / Vị trí công tác')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step2.recruiterTitlePlaceholder', 'VD: Trưởng phòng Tuyển dụng, HR Manager...')}
            value={values.recruiterTitle || ''}
            onChange={(e) => onChange('recruiterTitle', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Phone Number */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step2.recruiterPhone', 'Số điện thoại liên hệ / Zalo')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step2.recruiterPhonePlaceholder', 'VD: 0912345678')}
            value={values.recruiterPhone || ''}
            onChange={(e) => onChange('recruiterPhone', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step2.recruiterEmail', 'Email nhận thông báo ứng tuyển')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step2.recruiterEmailPlaceholder', 'recruitment@company.vn')}
            value={values.recruiterEmail || ''}
            onChange={(e) => onChange('recruiterEmail', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Hiring Needs Tags */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step2.hiringNeeds', 'Nhu cầu tuyển dụng trọng tâm')}
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={COMMON_HIRING_ROLES}
            value={values.hiringNeeds || []}
            onChange={(_, newValue) => onChange('hiringNeeds', newValue)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    '& .MuiChip-deleteIcon': {
                      color: '#3B82F6',
                      '&:hover': { color: '#1D4ED8' },
                    },
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={values.hiringNeeds?.length ? '' : t('employerOnboarding.step2.hiringNeedsPlaceholder', 'Nhập vị trí/ngành cần tuyển (VD: Frontend, Kế toán, Sales...)')}
                helperText={t('employerOnboarding.step2.hiringNeedsHelper', 'Nhập và nhấn Enter để thêm các vị trí ưu tiên tuyển dụng')}
                FormHelperTextProps={{ sx: { color: '#64748B', mx: 0, mt: 0.5 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    p: 1.25,
                    '&:hover': { backgroundColor: '#FFFFFF' },
                    '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Company Description / Culture */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step2.description', 'Giới thiệu ngắn về môi trường làm việc & văn hóa')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t('employerOnboarding.step2.descriptionPlaceholder', 'Mô tả điểm nổi bật về phúc lợi, môi trường làm việc, văn hóa doanh nghiệp...')}
            value={values.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

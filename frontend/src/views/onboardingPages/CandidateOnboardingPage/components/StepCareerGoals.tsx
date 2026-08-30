'use client';

import React from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  ButtonBase,
  Paper,
  Autocomplete,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useTranslation } from 'react-i18next';
import type { CandidateStep1Values } from '../schemas/candidateOnboardingSchema';
import type { SelectOption } from '@/types/models';

interface StepCareerGoalsProps {
  values: CandidateStep1Values;
  onChange: (field: keyof CandidateStep1Values, value: any) => void;
  errors: Record<string, string>;
  careersList: SelectOption[];
  citiesList: SelectOption[];
}

export default function StepCareerGoals({
  values,
  onChange,
  errors,
  careersList,
  citiesList,
}: StepCareerGoalsProps) {
  const { t } = useTranslation('jobSeeker');

  const workplaceOptions = [
    { value: 1, label: t('onboarding.step1.workplaceOnsite', 'Tại văn phòng (Onsite)'), icon: <ApartmentIcon fontSize="small" /> },
    { value: 2, label: t('onboarding.step1.workplaceHybrid', 'Linh hoạt (Hybrid)'), icon: <HomeWorkOutlinedIcon fontSize="small" /> },
    { value: 3, label: t('onboarding.step1.workplaceRemote', 'Từ xa (Remote)'), icon: <PublicIcon fontSize="small" /> },
  ];

  const selectedCareer = careersList.find((c) => Number(c.id) === Number(values.careerId)) || null;
  const selectedCity = citiesList.find((ct) => Number(ct.id) === Number(values.cityId)) || null;

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
            <WorkOutlineIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            {t('onboarding.step1.title', 'Mục tiêu & Nguyện vọng nghề nghiệp')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748B', pl: { xs: 0, sm: 6 } }}>
          {t('onboarding.step1.subtitle', 'Chỉ mất 1 phút để thiết lập mục tiêu tìm việc và nhận các cơ hội việc làm phù hợp nhất')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Field 1: Desired Job Title */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step1.desiredJobTitle', 'Bạn đang tìm công việc gì?')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
          </Typography>
          <TextField
            fullWidth
            placeholder={t('onboarding.step1.desiredJobTitlePlaceholder', 'VD: Chuyên viên Marketing, Kỹ sư phần mềm, Quản trị nhân sự...')}
            value={values.desiredJobTitle}
            onChange={(e) => onChange('desiredJobTitle', e.target.value)}
            error={Boolean(errors.desiredJobTitle)}
            helperText={errors.desiredJobTitle || t('onboarding.step1.desiredJobTitleHelper', 'Nhập tên vị trí chức danh bạn mong muốn ứng tuyển')}
            slotProps={{
              formHelperText: {
                sx: { color: errors.desiredJobTitle ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
              },
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

        {/* Field 2: Primary Industry / Career */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step1.career', 'Ngành nghề chính')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
          </Typography>
          <Autocomplete
            options={careersList}
            getOptionLabel={(option) => option.name || ''}
            value={selectedCareer}
            onChange={(_, newValue) => onChange('careerId', newValue ? newValue.id : '')}
            isOptionEqualToValue={(option, val) => Number(option.id) === Number(val.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('onboarding.step1.careerPlaceholder', 'Chọn ngành nghề chuyên môn...')}
                error={Boolean(errors.careerId)}
                helperText={errors.careerId || t('onboarding.step1.careerHelper', 'Lĩnh vực ngành nghề phù hợp chuyên môn của bạn')}
                slotProps={{
                  formHelperText: {
                    sx: { color: errors.careerId ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
                  },
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
            )}
          />
        </Grid>

        {/* Field 3: Working Location / City */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step1.city', 'Bạn muốn làm việc ở đâu?')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
          </Typography>
          <Autocomplete
            options={citiesList}
            getOptionLabel={(option) => option.name || ''}
            value={selectedCity}
            onChange={(_, newValue) => onChange('cityId', newValue ? newValue.id : '')}
            isOptionEqualToValue={(option, val) => Number(option.id) === Number(val.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('onboarding.step1.cityPlaceholder', 'Chọn Tỉnh / Thành phố...')}
                error={Boolean(errors.cityId)}
                helperText={errors.cityId || t('onboarding.step1.cityHelper', 'Địa điểm bạn ưu tiên làm việc')}
                slotProps={{
                  formHelperText: {
                    sx: { color: errors.cityId ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
                  },
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
            )}
          />
        </Grid>

        {/* Field 4: Workplace Type Pills */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
            {t('onboarding.step1.workplaceType', 'Hình thức làm việc ưu tiên')}
          </Typography>
          <Grid container spacing={1.5}>
            {workplaceOptions.map((opt) => {
              const isSelected = Number(values.typeOfWorkplace) === opt.value;
              return (
                <Grid size={{ xs: 12, sm: 4 }} key={opt.value}>
                  <ButtonBase
                    onClick={() => onChange('typeOfWorkplace', opt.value)}
                    sx={{
                      width: '100%',
                      p: 1.75,
                      borderRadius: 2.5,
                      border: '1.5px solid',
                      borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : '#F8FAFC',
                      color: isSelected ? '#2563EB' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : '#FFFFFF',
                      },
                    }}
                  >
                    {opt.icon}
                    {opt.label}
                  </ButtonBase>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

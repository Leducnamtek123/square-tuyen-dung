'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  TextField,
  Chip,
  Stack,
  ButtonBase,
  Autocomplete,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { useTranslation } from 'react-i18next';
import type { CandidateStep2Values } from '../schemas/candidateOnboardingSchema';
import type { SelectOption } from '@/types/models';

interface StepSkillsExperienceProps {
  values: CandidateStep2Values;
  onChange: (field: keyof CandidateStep2Values, value: any) => void;
  errors: Record<string, string>;
  experienceOptions: SelectOption[];
  academicLevelOptions: SelectOption[];
}

export default function StepSkillsExperience({
  values,
  onChange,
  errors,
  experienceOptions,
  academicLevelOptions,
}: StepSkillsExperienceProps) {
  const { t } = useTranslation('jobSeeker');
  const [skillInput, setSkillInput] = useState('');
  const [showCustomSalary, setShowCustomSalary] = useState(
    Boolean(
      !values.isSalaryNegotiable &&
        values.salaryMin &&
        values.salaryMax &&
        ![
          '0-10000000',
          '10000000-15000000',
          '15000000-25000000',
          '25000000-50000000',
        ].includes(`${values.salaryMin}-${values.salaryMax}`),
    ),
  );

  const salaryQuickRanges = [
    { label: t('onboarding.step2.salaryBelow10', '< 10 triệu'), min: 0, max: 10000000, negotiable: false },
    { label: t('onboarding.step2.salary10To15', '10 - 15 triệu'), min: 10000000, max: 15000000, negotiable: false },
    { label: t('onboarding.step2.salary15To25', '15 - 25 triệu'), min: 15000000, max: 25000000, negotiable: false },
    { label: t('onboarding.step2.salaryAbove25', '> 25 triệu'), min: 25000000, max: 50000000, negotiable: false },
    { label: t('onboarding.step2.salaryNegotiable', 'Thỏa thuận'), min: 0, max: 0, negotiable: true },
  ];

  const handleAddSkillsFromText = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const tokens = rawText
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!tokens.length) return;

    const currentSkills = values.skills || [];
    const newUniqueSkills: string[] = [];

    tokens.forEach((token) => {
      const exists = currentSkills.some((s) => s.toLowerCase() === token.toLowerCase()) ||
        newUniqueSkills.some((s) => s.toLowerCase() === token.toLowerCase());
      if (!exists) {
        newUniqueSkills.push(token);
      }
    });

    if (newUniqueSkills.length > 0) {
      onChange('skills', [...currentSkills, ...newUniqueSkills]);
    }
    setSkillInput('');
  };

  const handleSelectSalaryQuick = (range: { min: number; max: number; negotiable: boolean }) => {
    setShowCustomSalary(false);
    onChange('isSalaryNegotiable', range.negotiable);
    onChange('salaryMin', range.min);
    onChange('salaryMax', range.max);
  };

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
            <PsychologyOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            {t('onboarding.step2.title', 'Kỹ năng & Kinh nghiệm làm việc')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748B', pl: { xs: 0, sm: 6 } }}>
          {t('onboarding.step2.subtitle', 'Kỹ năng và mức lương mong muốn giúp hệ thống đề xuất việc làm chuẩn xác nhất')}
        </Typography>
      </Box>

      <Grid container spacing={3.5}>
        {/* Field 1: Skills Free-form Input & Tag Chips */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step2.skillsLabel', 'Kỹ năng thế mạnh của bạn')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
          </Typography>

          <Autocomplete
            multiple
            freeSolo
            options={[] as string[]}
            value={values.skills || []}
            inputValue={skillInput}
            onInputChange={(_, newInputValue, reason) => {
              if (reason === 'input') {
                if (newInputValue.includes(',') || newInputValue.includes(';')) {
                  handleAddSkillsFromText(newInputValue);
                } else {
                  setSkillInput(newInputValue);
                }
              } else if (reason === 'clear' || reason === 'reset') {
                setSkillInput('');
              }
            }}
            onChange={(_, newValue) => {
              // Deduplicate and trim values
              const sanitized = Array.from(
                new Set(
                  newValue
                    .map((item) => (typeof item === 'string' ? item.trim() : ''))
                    .filter(Boolean),
                ),
              );
              onChange('skills', sanitized);
            }}
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
                placeholder={
                  values.skills?.length
                    ? t('onboarding.step2.skillsAddMorePlaceholder', 'Nhập thêm kỹ năng rồi nhấn Enter...')
                    : t(
                        'onboarding.step2.skillsPlaceholder',
                        'Nhập kỹ năng rồi nhấn Enter (VD: AutoCAD, Quản lý dự án, Giám sát thi công...)',
                      )
                }
                error={Boolean(errors.skills)}
                helperText={
                  errors.skills ||
                  t(
                    'onboarding.step2.skillsHelper',
                    'Nhập các kỹ năng chuyên môn của bạn (nhấn Enter hoặc dấu phẩy để thêm)',
                  )
                }
                slotProps={{
                  formHelperText: {
                    sx: { color: errors.skills ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
                  },
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    if (skillInput.trim()) {
                      handleAddSkillsFromText(skillInput);
                    }
                  }
                }}
                onBlur={() => {
                  if (skillInput.trim()) {
                    handleAddSkillsFromText(skillInput);
                  }
                }}
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

        {/* Field 2: Experience */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step2.experienceLabel', 'Số năm kinh nghiệm làm việc')}
          </Typography>
          <FormControl fullWidth>
            <Select
              value={values.experience || 1}
              onChange={(e) => onChange('experience', Number(e.target.value))}
              sx={{
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              }}
            >
              {(experienceOptions?.length ? experienceOptions : [
                { id: 1, name: 'Chưa có kinh nghiệm' },
                { id: 2, name: 'Dưới 1 năm' },
                { id: 3, name: '1 năm' },
                { id: 4, name: '2 năm' },
                { id: 5, name: '3 năm' },
                { id: 6, name: '4 năm' },
                { id: 7, name: '5 năm' },
                { id: 8, name: 'Trên 5 năm' },
              ]).map((exp) => (
                <MenuItem key={String(exp.id)} value={Number(exp.id)}>
                  {exp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Field 3: Academic Level */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step2.academicLevelLabel', 'Trình độ học vấn cao nhất')}
          </Typography>
          <FormControl fullWidth>
            <Select
              value={values.academicLevel || 3}
              onChange={(e) => onChange('academicLevel', Number(e.target.value))}
              sx={{
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              }}
            >
              {(academicLevelOptions?.length ? academicLevelOptions : [
                { id: 1, name: 'Sau đại học' },
                { id: 2, name: 'Đại học' },
                { id: 3, name: 'Cao đẳng' },
                { id: 4, name: 'Trung cấp / Nghề' },
                { id: 5, name: 'Trung học phổ thông' },
                { id: 6, name: 'Chứng chỉ nghề' },
              ]).map((ac) => (
                <MenuItem key={String(ac.id)} value={Number(ac.id)}>
                  {ac.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Field 4: Salary Expectation */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
            {t('onboarding.step2.salaryLabel', 'Mức lương mong muốn (VNĐ / tháng)')}
          </Typography>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {salaryQuickRanges.map((range) => {
              const isSelected =
                !showCustomSalary &&
                (range.negotiable
                  ? values.isSalaryNegotiable
                  : !values.isSalaryNegotiable &&
                    Number(values.salaryMin) === range.min &&
                    Number(values.salaryMax) === range.max);

              return (
                <Grid size={{ xs: 6, sm: 2.4 }} key={range.label}>
                  <ButtonBase
                    onClick={() => handleSelectSalaryQuick(range)}
                    sx={{
                      width: '100%',
                      py: 1.5,
                      px: 1,
                      borderRadius: 2.5,
                      border: '1.5px solid',
                      borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : '#F8FAFC',
                      color: isSelected ? '#2563EB' : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.8125rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : '#FFFFFF',
                      },
                    }}
                  >
                    {range.label}
                  </ButtonBase>
                </Grid>
              );
            })}
          </Grid>

          {/* Custom Salary Inputs */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <ButtonBase
              onClick={() => {
                setShowCustomSalary(!showCustomSalary);
                if (!showCustomSalary) {
                  onChange('isSalaryNegotiable', false);
                }
              }}
              sx={{
                color: showCustomSalary ? '#2563EB' : '#64748B',
                fontWeight: 600,
                fontSize: '0.8125rem',
                textDecoration: 'underline',
              }}
            >
              {showCustomSalary ? 'Ẩn mức lương tùy chỉnh' : '+ Nhập mức lương cụ thể (Tùy chỉnh)'}
            </ButtonBase>
          </Stack>

          {showCustomSalary && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('onboarding.step2.salaryMin', 'Lương tối thiểu')}
                  placeholder={t('onboarding.step2.salaryMinPlaceholder', 'VD: 10,000,000')}
                  value={values.salaryMin || ''}
                  onChange={(e) => onChange('salaryMin', Number(e.target.value))}
                  error={Boolean(errors.salaryMin || errors.salaryMax)}
                  helperText={errors.salaryMin || ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      backgroundColor: '#FFFFFF',
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('onboarding.step2.salaryMax', 'Lương tối đa')}
                  placeholder={t('onboarding.step2.salaryMaxPlaceholder', 'VD: 20,000,000')}
                  value={values.salaryMax || ''}
                  onChange={(e) => onChange('salaryMax', Number(e.target.value))}
                  error={Boolean(errors.salaryMax)}
                  helperText={errors.salaryMax || ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      backgroundColor: '#FFFFFF',
                    },
                  }}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

'use client';

import React from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Control } from 'react-hook-form';
import SingleSelectSearchCustom from '@/components/Common/Controls/SingleSelectSearchCustom';
import type { SelectOption } from '@/types/models';
import type { JobPostSearchFormValues } from './types';

export type JobPostSearchAdvancedFiltersProps = {
  open: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  control: Control<JobPostSearchFormValues>;
  cityId: JobPostSearchFormValues['cityId'];
  districtId: JobPostSearchFormValues['districtId'];
  districtOptions: SelectOption[];
  wardOptions: SelectOption[];
  localizedJobTypeOptions: SelectOption[];
  localizedTypeOfWorkplaceOptions: SelectOption[];
  localizedPositionOptions: SelectOption[];
  localizedExperienceOptions: SelectOption[];
  localizedGenderOptions: SelectOption[];
  onReset: () => void;
  onToggleAdvancedFilter: () => void;
  onApply?: () => void;
  activeFilterCount?: number;
};

const FilterSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      p: 2,
      borderRadius: '14px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
      <Box sx={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
        {title}
      </Typography>
    </Box>
    <Stack spacing={1.5}>{children}</Stack>
  </Box>
);

const JobPostSearchAdvancedFilters: React.FC<JobPostSearchAdvancedFiltersProps> = ({
  open,
  t,
  control,
  cityId,
  districtId,
  districtOptions,
  wardOptions,
  localizedJobTypeOptions,
  localizedTypeOfWorkplaceOptions,
  localizedPositionOptions,
  localizedExperienceOptions,
  localizedGenderOptions,
  onReset,
  onToggleAdvancedFilter,
  onApply,
  activeFilterCount = 0,
}) => {
  const handleApply = () => {
    if (onApply) {
      onApply();
    }
    onToggleAdvancedFilter();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onToggleAdvancedFilter}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440, md: 480 },
          maxWidth: '100vw',
          backgroundColor: '#ffffff',
          borderRadius: { xs: '16px 16px 0 0', sm: '20px 0 0 20px' },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.15)',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {/* ── Sticky Header ────────────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TuneRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.2 }}>
                {t('jobSearch.advancedFilter', { defaultValue: 'Bộ lọc nâng cao' })}
              </Typography>
              {activeFilterCount > 0 && (
                <Chip
                  label={`${activeFilterCount}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', display: 'block', mt: 0.25 }}>
              {activeFilterCount > 0
                ? `Đang áp dụng ${activeFilterCount} tiêu chí lọc`
                : 'Tùy chỉnh tiêu chí tìm việc làm chi tiết'}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.75} alignItems="center">
          {activeFilterCount > 0 && (
            <Tooltip title="Đặt lại tất cả bộ lọc">
              <IconButton
                aria-label={t('jobSearch.resetFiltersAria')}
                size="small"
                onClick={onReset}
                sx={{
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  p: 0.75,
                  '&:hover': {
                    color: '#ef4444',
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca',
                  },
                }}
              >
                <DeleteForeverIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Đóng bộ lọc">
            <IconButton
              aria-label={t('jobSearch.closeAdvancedFiltersAria')}
              size="small"
              onClick={onToggleAdvancedFilter}
              sx={{
                color: '#64748b',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                p: 0.75,
                '&:hover': {
                  color: '#0f172a',
                  backgroundColor: '#f1f5f9',
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── Scrollable Body ──────────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Section 1: Detailed Location */}
        <FilterSection
          title="Vị trí & Khu vực chi tiết"
          icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Quận / Huyện
            </Typography>
            <SingleSelectSearchCustom
              name="districtId"
              placeholder={t('jobSearch.allDistricts', { defaultValue: 'Tất cả quận/huyện' })}
              disabled={!cityId}
              disabledPlaceholder={t('jobSearch.selectCityFirst', { defaultValue: 'Vui lòng chọn Tỉnh/Thành phố trước' })}
              control={control}
              options={districtOptions}
              noOptionsText={!cityId ? t('jobSearch.selectCityFirst', { defaultValue: 'Vui lòng chọn Tỉnh/Thành phố trước' }) : undefined}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Phường / Xã
            </Typography>
            <SingleSelectSearchCustom
              name="wardId"
              placeholder={t('jobSearch.allWards', { defaultValue: 'Tất cả phường/xã' })}
              disabled={!districtId}
              disabledPlaceholder={t('jobSearch.selectDistrictFirst', { defaultValue: 'Vui lòng chọn Quận/Huyện trước' })}
              control={control}
              options={wardOptions}
              noOptionsText={!districtId ? t('jobSearch.selectDistrictFirst', { defaultValue: 'Vui lòng chọn Quận/Huyện trước' }) : undefined}
            />
          </Box>
        </FilterSection>

        {/* Section 2: Position & Experience */}
        <FilterSection
          title="Cấp bậc & Kinh nghiệm"
          icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Cấp bậc chuyên môn
            </Typography>
            <SingleSelectSearchCustom
              name="positionId"
              placeholder={t('jobSearch.allPositions', { defaultValue: 'Tất cả cấp bậc' })}
              control={control}
              options={localizedPositionOptions}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Số năm kinh nghiệm
            </Typography>
            <SingleSelectSearchCustom
              name="experienceId"
              placeholder={t('jobSearch.allExperiences', { defaultValue: 'Tất cả kinh nghiệm' })}
              control={control}
              options={localizedExperienceOptions}
            />
          </Box>
        </FilterSection>

        {/* Section 3: Job Type & Workplace */}
        <FilterSection
          title="Môi trường & Hình thức làm việc"
          icon={<BusinessOutlinedIcon sx={{ fontSize: 18 }} />}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Hình thức làm việc
            </Typography>
            <SingleSelectSearchCustom
              name="jobTypeId"
              placeholder={t('jobSearch.allJobTypes', { defaultValue: 'Tất cả hình thức' })}
              control={control}
              options={localizedJobTypeOptions}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Nơi làm việc
            </Typography>
            <SingleSelectSearchCustom
              name="typeOfWorkplaceId"
              placeholder={t('jobSearch.allWorkplaces', { defaultValue: 'Tất cả nơi làm việc' })}
              control={control}
              options={localizedTypeOfWorkplaceOptions}
            />
          </Box>
        </FilterSection>

        {/* Section 4: Other criteria */}
        <FilterSection
          title="Tiêu chí bổ sung"
          icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Yêu cầu giới tính
            </Typography>
            <SingleSelectSearchCustom
              name="genderId"
              placeholder={t('jobSearch.allGenders', { defaultValue: 'Tất cả giới tính' })}
              control={control}
              options={localizedGenderOptions}
            />
          </Box>
        </FilterSection>
      </Box>

      {/* ── Sticky Footer Actions ────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={onReset}
          startIcon={<RestartAltRoundedIcon />}
          sx={{
            py: 1.2,
            borderRadius: '12px',
            borderColor: '#cbd5e1',
            color: '#475569',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          {t('jobSearch.resetFiltersAria', { defaultValue: 'Đặt lại' })}
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
          startIcon={<CheckRoundedIcon />}
          sx={{
            py: 1.2,
            borderRadius: '12px',
            backgroundColor: '#2563eb',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
            },
          }}
        >
          {activeFilterCount > 0 ? `Áp dụng (${activeFilterCount})` : 'Áp dụng bộ lọc'}
        </Button>
      </Box>
    </Drawer>
  );
};

export default JobPostSearchAdvancedFilters;

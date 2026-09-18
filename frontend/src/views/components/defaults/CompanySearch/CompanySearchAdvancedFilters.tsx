'use client';

import React from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { Control } from 'react-hook-form';
import SingleSelectSearchCustom from '@/components/Common/Controls/SingleSelectSearchCustom';
import type { SelectOption } from '@/types/models';

export interface CompanySearchFormValues {
  kw: string;
  cityId: string;
  employeeSize: string;
}

export interface CompanySearchAdvancedFiltersProps {
  open: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  control: Control<CompanySearchFormValues>;
  cityOptions: SelectOption[];
  employeeSizeOptions: SelectOption[];
  onReset: () => void;
  onToggleAdvancedFilter: () => void;
  onApply?: () => void;
  activeFilterCount?: number;
}

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

const CompanySearchAdvancedFilters: React.FC<CompanySearchAdvancedFiltersProps> = ({
  open,
  t,
  control,
  cityOptions,
  employeeSizeOptions,
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
          width: { xs: '100%', sm: 400 },
          maxWidth: '100vw',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterAltIcon sx={{ color: '#2563eb', fontSize: '1.35rem' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
            {t('companySearch.filterDrawerTitle', { defaultValue: 'Bộ lọc nâng cao' })}
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#2563eb',
                color: '#ffffff',
              }}
            />
          )}
        </Stack>

        <Tooltip title={t('common.actions.close', { defaultValue: 'Đóng' })} arrow>
          <IconButton
            size="small"
            onClick={onToggleAdvancedFilter}
            aria-label={t('common.actions.close', { defaultValue: 'Đóng' })}
            sx={{
              color: '#64748b',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#f1f5f9', color: '#0f172a' },
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Body: Filter Controls */}
      <Box
        sx={{
          p: 3,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Tỉnh thành */}
        <FilterSection
          title={t('companySearch.filterLocation', { defaultValue: 'Địa điểm / Tỉnh thành' })}
          icon={<LocationOnOutlinedIcon sx={{ fontSize: '1.15rem' }} />}
        >
          <SingleSelectSearchCustom
            name="cityId"
            placeholder={t('companySearch.allCities', { defaultValue: 'Tất cả tỉnh thành' })}
            control={control}
            options={cityOptions}
          />
        </FilterSection>

        {/* Quy mô nhân sự */}
        <FilterSection
          title={t('companySearch.filterEmployeeSize', { defaultValue: 'Quy mô nhân sự' })}
          icon={<BusinessOutlinedIcon sx={{ fontSize: '1.15rem' }} />}
        >
          <SingleSelectSearchCustom
            name="employeeSize"
            placeholder={t('companySearch.allEmployeeSizes', { defaultValue: 'Tất cả quy mô nhân sự' })}
            control={control}
            options={employeeSizeOptions}
          />
        </FilterSection>
      </Box>

      {/* Footer: Action Buttons */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={onReset}
            startIcon={<RestartAltRoundedIcon />}
            sx={{
              flex: 1,
              borderRadius: '12px',
              borderColor: '#e2e8f0',
              color: '#64748b',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.1,
              '&:hover': {
                borderColor: '#ef4444',
                backgroundColor: '#fef2f2',
                color: '#ef4444',
              },
            }}
          >
            {t('companySearch.resetFilters', { defaultValue: 'Xóa bộ lọc' })}
          </Button>

          <Button
            variant="contained"
            onClick={handleApply}
            startIcon={<CheckRoundedIcon />}
            sx={{
              flex: 1.5,
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            {t('companySearch.applyFilters', { defaultValue: 'Áp dụng' })}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default CompanySearchAdvancedFilters;

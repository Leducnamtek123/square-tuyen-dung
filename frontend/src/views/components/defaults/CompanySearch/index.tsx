'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Stack,
  IconButton,
  Box,
  Badge,
  Chip,
  Tooltip,
  Grid2 as Grid,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import InputBaseSearchCompanyCustom from '@/components/Common/Controls/InputBaseSearchCompanyCustom';
import SingleSelectSearchCustom from '@/components/Common/Controls/SingleSelectSearchCustom';
import { resetSearchCompany, searchCompany, type CompanyFilter } from '@/redux/filterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { useConfig } from '@/hooks/useConfig';
import CompanySearchAdvancedFilters, { CompanySearchFormValues } from './CompanySearchAdvancedFilters';

const CompanySearch = () => {
  const { t } = useTranslation('public');
  const dispatch = useAppDispatch();
  const { allConfig } = useConfig();
  const { companyFilter } = useAppSelector((state) => state.filter);
  const [showAdvanceFilter, setShowAdvanceFilter] = React.useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<CompanySearchFormValues>({
    defaultValues: {
      kw: '',
      cityId: '',
      employeeSize: '',
    },
  });

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      kw: companyFilter?.kw || '',
      cityId: companyFilter?.cityId || '',
      employeeSize: companyFilter?.employeeSize || '',
    }));
  }, [companyFilter, reset]);

  const cityId = useWatch({ control, name: 'cityId' });
  const employeeSize = useWatch({ control, name: 'employeeSize' });

  const activeAdvancedFilterCount = React.useMemo(() => {
    let count = 0;
    if (cityId) count++;
    if (employeeSize) count++;
    return count;
  }, [cityId, employeeSize]);

  const handleFilter = (data: CompanySearchFormValues) => {
    dispatch(
      searchCompany({
        ...companyFilter,
        kw: data.kw,
        cityId: data.cityId,
        employeeSize: data.employeeSize,
        page: 1,
      } as CompanyFilter)
    );
  };

  const handleReset = () => {
    reset({
      kw: '',
      cityId: '',
      employeeSize: '',
    });
    dispatch(resetSearchCompany());
  };

  const handleToggleFilterDrawer = () => {
    setShowAdvanceFilter((prev) => !prev);
  };

  const cityOptions = allConfig?.cityOptions || [];
  const employeeSizeOptions = allConfig?.employeeSizeOptions || [];

  return (
    <Box sx={{ width: '100%', maxWidth: '1100px', mx: 'auto' }}>
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          boxShadow: '0 20px 45px rgba(37, 99, 235, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
          background: '#ffffff',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          borderRadius: '24px',
          width: '100%',
        }}
      >
        <Box component="form" onSubmit={handleSubmit(handleFilter)}>
          <Grid container spacing={2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 5.5,
                lg: 5.5,
                xl: 5.5,
              }}
            >
              <InputBaseSearchCompanyCustom
                name="kw"
                placeholder={t('companySearch.searchPlaceholder')}
                control={control}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3.5,
                lg: 3.5,
                xl: 3.5,
              }}
            >
              <SingleSelectSearchCustom
                name="cityId"
                placeholder={t('companySearch.allCities')}
                control={control}
                options={cityOptions}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
                lg: 3,
                xl: 3,
              }}
            >
              <Stack direction="row" spacing={1.2} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SearchIcon sx={{ fontSize: 19 }} />}
                  sx={{
                    flex: 1,
                    height: 48,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    whiteSpace: 'nowrap',
                    px: { xs: 2, sm: 2.5 },
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.28)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 10px 22px rgba(37, 99, 235, 0.38)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  {t('companySearch.searchButton')}
                </Button>

                {/* Nút Bộ lọc - Click để mở ngăn kéo bộ lọc */}
                <Tooltip title={t('companySearch.openFiltersAria', { defaultValue: 'Mở bộ lọc tìm công ty' })} arrow>
                  <IconButton
                    aria-label={t('companySearch.openFiltersAria', { defaultValue: 'Mở bộ lọc tìm công ty' })}
                    onClick={handleToggleFilterDrawer}
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      background: activeAdvancedFilterCount > 0 ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${activeAdvancedFilterCount > 0 ? '#bfdbfe' : '#e2e8f0'}`,
                      color: activeAdvancedFilterCount > 0 ? '#1d4ed8' : '#475569',
                      borderRadius: '999px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#eff6ff',
                        color: '#2563eb',
                        borderColor: '#93c5fd',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Badge badgeContent={activeAdvancedFilterCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 16, minWidth: 16 } }}>
                      <FilterAltIcon sx={{ fontSize: 20 }} />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Nút Đặt lại - Reset bộ lọc */}
                <Tooltip title={t('companySearch.resetFiltersAria')} arrow>
                  <IconButton
                    aria-label={t('companySearch.resetFiltersAria')}
                    onClick={handleReset}
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      borderRadius: '999px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#fef2f2',
                        color: '#ef4444',
                        borderColor: '#fca5a5',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <RestartAltRoundedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Active Filter Chips Bar */}
      {activeAdvancedFilterCount > 0 && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.25,
            px: 2,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box component="span" sx={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 700, mr: 0.5 }}>
            {t('companySearch.activeFilters', { defaultValue: 'Đang lọc' })}:
          </Box>

          {cityId && (
            <Chip
              size="small"
              label={`Địa điểm: ${cityOptions.find((c) => String(c.id) === String(cityId))?.name || cityId}`}
              onDelete={() => {
                setValue('cityId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {employeeSize && (
            <Chip
              size="small"
              label={`Quy mô: ${employeeSizeOptions.find((e) => String(e.id) === String(employeeSize))?.name || employeeSize}`}
              onDelete={() => {
                setValue('employeeSize', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          <Button
            size="small"
            onClick={handleReset}
            sx={{
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              p: 0.5,
              ml: 'auto',
              minWidth: 0,
              '&:hover': { backgroundColor: 'transparent', color: '#b91c1c' },
            }}
          >
            {t('companySearch.clearAll', { defaultValue: 'Xóa tất cả' })}
          </Button>
        </Box>
      )}

      {/* Advanced Filter Drawer */}
      <CompanySearchAdvancedFilters
        open={showAdvanceFilter}
        t={t}
        control={control}
        cityOptions={cityOptions}
        employeeSizeOptions={employeeSizeOptions}
        onReset={handleReset}
        onToggleAdvancedFilter={handleToggleFilterDrawer}
        onApply={handleSubmit(handleFilter)}
        activeFilterCount={activeAdvancedFilterCount}
      />
    </Box>
  );
};

export default CompanySearch;

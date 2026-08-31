'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, Button, Stack, IconButton, Box, Grid2 as Grid } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InputBaseSearchCompanyCustom from '@/components/Common/Controls/InputBaseSearchCompanyCustom';
import SingleSelectSearchCustom from '@/components/Common/Controls/SingleSelectSearchCustom';
import { resetSearchCompany, searchCompany, type CompanyFilter } from '@/redux/filterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { useConfig } from '@/hooks/useConfig';

const CompanySearch = () => {
  const { t } = useTranslation('public');
  const dispatch = useAppDispatch();
  const { allConfig } = useConfig();
  const { companyFilter } = useAppSelector((state) => state.filter);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      kw: '',
      cityId: '',
    },
  });

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      ...companyFilter,
    }));
  }, [companyFilter, reset]);

  const handleFilter = (data: { kw: string; cityId: string }) => {
    dispatch(searchCompany({ ...companyFilter, ...data } as CompanyFilter));
  };

  const handleReset = () => {
    dispatch(resetSearchCompany());
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        boxShadow: '0 20px 45px rgba(37, 99, 235, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
        background: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '1100px',
        mx: 'auto',
      }}
    >
      <Box component="form" onSubmit={handleSubmit(handleFilter)}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 6,
              lg: 6,
              xl: 6,
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
              sm: 7,
              md: 3.5,
              lg: 3.5,
              xl: 3.5,
            }}
          >
            <SingleSelectSearchCustom
              name="cityId"
              placeholder={t('companySearch.allCities')}
              control={control}
              options={allConfig?.cityOptions || []}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 5,
              md: 2.5,
              lg: 2.5,
              xl: 2.5,
            }}
          >
            <Stack direction="row" spacing={1.5} justifyContent="flex-start" alignItems="center">
              <Button
                variant="contained"
                type="submit"
                startIcon={<SearchIcon />}
                sx={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  px: 3,
                  py: 1.2,
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.35)',
                  },
                }}
              >
                {t('companySearch.searchButton')}
              </Button>

              <IconButton
                aria-label={t('companySearch.resetFiltersAria')}
                onClick={handleReset}
                sx={{
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  color: '#2563eb',
                  borderRadius: '14px',
                  p: 1.2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <FilterAltIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default CompanySearch;

import React from 'react';
import { Button, Card, IconButton, Stack, Typography } from '@mui/material';

import { Grid2 as Grid } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import { Control } from 'react-hook-form';
import SingleSelectSearchCustom from '../../../../components/Common/Controls/SingleSelectSearchCustom';
import type { SelectOption } from '../../../../types/models';
import type { JobPostSearchFormValues } from './types';

type JobPostSearchAdvancedFiltersProps = {
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
};

const JobPostSearchAdvancedFilters = ({
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
}: JobPostSearchAdvancedFiltersProps) => {
  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2 },
        boxShadow: '0 10px 28px rgba(15, 57, 127, 0.07)',
        mt: 1.5,
        border: '1px solid rgba(26, 64, 125, 0.1)',
        borderRadius: 4,
        backgroundColor: 'background.paper',
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 1,
            xl: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 800, color: 'text.primary' }}>
            {t('jobSearch.advancedFilter')}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="positionId"
            placeholder={t('jobSearch.allPositions')}
            control={control}
            options={localizedPositionOptions}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="experienceId"
            placeholder={t('jobSearch.allExperiences')}
            control={control}
            options={localizedExperienceOptions}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="districtId"
            placeholder={t('jobSearch.allDistricts')}
            disabled={!cityId}
            disabledPlaceholder={t('jobSearch.selectCityFirst')}
            control={control}
            options={districtOptions}
            noOptionsText={!cityId ? t('jobSearch.selectCityFirst') : undefined}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="wardId"
            placeholder={t('jobSearch.allWards')}
            disabled={!districtId}
            disabledPlaceholder={t('jobSearch.selectDistrictFirst')}
            control={control}
            options={wardOptions}
            noOptionsText={!districtId ? t('jobSearch.selectDistrictFirst') : undefined}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="jobTypeId"
            placeholder={t('jobSearch.allJobTypes')}
            control={control}
            options={localizedJobTypeOptions}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="typeOfWorkplaceId"
            placeholder={t('jobSearch.allWorkplaces')}
            control={control}
            options={localizedTypeOfWorkplaceOptions}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <SingleSelectSearchCustom
            name="genderId"
            placeholder={t('jobSearch.allGenders')}
            control={control}
            options={localizedGenderOptions}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 1,
            xl: 1,
          }}
        >
          <Stack direction="row" justifyContent={{ xs: 'flex-end', lg: 'center', xl: 'center' }}>
            <IconButton
              color="primary"
              aria-label={t('jobSearch.resetFiltersAria')}
              onClick={onReset}
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                mr: 1,
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.16)' },
              }}
            >
              <DeleteForeverIcon color="secondary" />
            </IconButton>
            <IconButton
              color="primary"
              aria-label={t('jobSearch.closeAdvancedFiltersAria')}
              onClick={onToggleAdvancedFilter}
              sx={{
                bgcolor: 'rgba(220, 38, 38, 0.08)',
                '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.14)' },
              }}
            >
              <ClearIcon color="error" />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>

      {/* Mobile Action Controls */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          display: { xs: 'flex', lg: 'none' },
          mt: 2,
          pt: 1.5,
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onReset}
          startIcon={<DeleteForeverIcon />}
          sx={{
            borderRadius: 2.5,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            borderColor: '#e2e8f0',
          }}
        >
          {t('jobSearch.resetFiltersAria')}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onToggleAdvancedFilter}
          sx={{
            borderRadius: 2.5,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          }}
        >
          {t('common:actions.apply')}
        </Button>
      </Stack>
    </Card>
  );
};

export default JobPostSearchAdvancedFilters;

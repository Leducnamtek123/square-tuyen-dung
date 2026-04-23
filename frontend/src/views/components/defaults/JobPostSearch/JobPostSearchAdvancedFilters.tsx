import React from 'react';
import { Card, IconButton, Stack, Typography } from '@mui/material';
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
        p: 2,
        boxShadow: 3,
        mt: -1,
      }}
    >
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 1,
            xl: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ pt: 1, fontSize: 14 }} color="GrayText">
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
            <IconButton color="primary" aria-label="reset" onClick={onReset}>
              <DeleteForeverIcon color="secondary" />
            </IconButton>
            <IconButton color="primary" aria-label="clear" onClick={onToggleAdvancedFilter}>
              <ClearIcon color="error" />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default JobPostSearchAdvancedFilters;

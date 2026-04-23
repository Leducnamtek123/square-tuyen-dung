import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Box, Button, Card, Stack } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useTranslation } from 'react-i18next';
import InputBaseSearchHomeCustom from '../../../../components/Common/Controls/InputBaseSearchHomeCustom';
import SingleSelectSearchCustom from '../../../../components/Common/Controls/SingleSelectSearchCustom';
import {
  resetSearchJobPostFilter,
  searchJobPost,
  JobPostFilter,
} from '../../../../redux/filterSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useAppStore';
import { useConfig } from '@/hooks/useConfig';
import { SelectOption } from '../../../../types/models';
import type { JobPostSearchFormValues } from './types';
import { useJobPostSearchLocationOptions } from './useJobPostSearchLocationOptions';
import JobPostSearchAdvancedFilters from './JobPostSearchAdvancedFilters';

const JobPostSearch = () => {
  const { t } = useTranslation(['public', 'common']);
  const dispatch = useAppDispatch();
  const { allConfig } = useConfig();
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const [showAdvanceFilter, setShowAdvanceFilter] = React.useState(false);
  const { control, handleSubmit, reset, getValues } = useForm<JobPostSearchFormValues>({
    defaultValues: {
      kw: '',
      careerId: '',
      cityId: '',
      districtId: '',
      wardId: '',
      positionId: '',
      experienceId: '',
      jobTypeId: '',
      typeOfWorkplaceId: '',
      genderId: '',
    },
  });

  const localizeOptions = React.useCallback(
    (options: SelectOption[], prefix: string) => {
      return (options || []).map((option) => ({
        ...option,
        name:
          t(`${prefix}.${option.id}`, { defaultValue: '' }) ||
          t(`choices.${option.name}`, { defaultValue: '' }) ||
          option.name,
      }));
    },
    [t]
  );

  const localizedJobTypeOptions = React.useMemo(
    () => localizeOptions(allConfig?.jobTypeOptions || [], 'jobSearch.jobTypeOptions'),
    [allConfig?.jobTypeOptions, localizeOptions]
  );

  const localizedTypeOfWorkplaceOptions = React.useMemo(
    () => localizeOptions(allConfig?.typeOfWorkplaceOptions || [], 'jobSearch.workplaceOptions'),
    [allConfig?.typeOfWorkplaceOptions, localizeOptions]
  );

  const localizedPositionOptions = React.useMemo(
    () => localizeOptions(allConfig?.positionOptions || [], 'jobSearch.positionOptions'),
    [allConfig?.positionOptions, localizeOptions]
  );

  const localizedExperienceOptions = React.useMemo(
    () => localizeOptions(allConfig?.experienceOptions || [], 'jobSearch.experienceOptions'),
    [allConfig?.experienceOptions, localizeOptions]
  );

  const localizedGenderOptions = React.useMemo(
    () => localizeOptions(allConfig?.genderOptions || [], 'jobSearch.genderOptions'),
    [allConfig?.genderOptions, localizeOptions]
  );

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      ...jobPostFilter,
    }));
  }, [jobPostFilter, reset]);

  const cityId = useWatch({
    control,
    name: 'cityId',
  });

  const districtId = useWatch({
    control,
    name: 'districtId',
  });

  const { districtOptions, wardOptions } = useJobPostSearchLocationOptions({
    cityId: cityId ?? '',
    districtId: districtId ?? '',
    getValues,
    reset,
  });

  const handleChangeShowFilter = () => {
    setShowAdvanceFilter((current) => !current);
  };

  const handleSaveKeywordLocalStorage = (kw: string | null | undefined) => {
    try {
      if (kw) {
        const keywordListStr = localStorage.getItem('project_search_history');
        if (
          keywordListStr !== null &&
          keywordListStr !== undefined &&
          keywordListStr !== ''
        ) {
          const keywordList = JSON.parse(keywordListStr);
          if (!keywordList.includes(kw)) {
            if (keywordList.length >= 5) {
              localStorage.setItem(
                'project_search_history',
                JSON.stringify([
                  kw,
                  ...keywordList.slice(0, keywordList.length - 1),
                ])
              );
            } else {
              localStorage.setItem(
                'project_search_history',
                JSON.stringify([kw, ...keywordList])
              );
            }
          }
        } else {
          localStorage.setItem('project_search_history', JSON.stringify([kw]));
        }
      }
    } catch {
      // localStorage access may fail in private browsing
    }
  };

  const handleFilter = (data: Partial<JobPostFilter>) => {

    handleSaveKeywordLocalStorage(data?.kw);

      dispatch(searchJobPost(data as JobPostFilter));

  };

  const handleReset = () => {
    dispatch(resetSearchJobPostFilter());
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFilter)}>
      <Card sx={{ p: 3, boxShadow: 0, backgroundColor: 'primary.main' }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 6,
              lg: 4,
              xl: 4
            }}>
            <InputBaseSearchHomeCustom
              name="kw"
              placeholder={t('jobSearch.searchPlaceholder')}
              control={control}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2,
              xl: 2
            }}>
            <SingleSelectSearchCustom
              name="careerId"
              placeholder={t('jobSearch.allCareers')}
              control={control}
              options={allConfig?.careerOptions || []}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
              lg: 2,
              xl: 2
            }}>
            <SingleSelectSearchCustom
              name="cityId"
              placeholder={t('jobSearch.allCities')}
              control={control}
              options={allConfig?.cityOptions || []}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 4,
              xl: 4
            }}>
            <Stack
              spacing={2}
              direction={{
                xs: 'column',
                sm: 'row',
                md: 'row',
                lg: 'row',
                xl: 'row',
              }}
              justifyContent={{ sm: 'flex-end', lg: 'center' }}
            >
              <Button
                variant="contained"
                color="info"
                sx={{ py: 1, whiteSpace: 'nowrap' }}
                type="submit"
              >
                {t('jobSearch.searchButton')}
              </Button>
              <Button
                variant="contained"
                sx={{ py: 1, color: 'white', whiteSpace: 'nowrap' }}
                startIcon={
                  showAdvanceFilter ? <FilterAltOffIcon /> : <FilterAltIcon />
                }
                color="secondary"
                onClick={handleChangeShowFilter}
              >
                {t('jobSearch.advancedFilter')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
      {showAdvanceFilter ? (
        <JobPostSearchAdvancedFilters
          t={t}
          control={control}
          cityId={cityId ?? ''}
          districtId={districtId ?? ''}
          districtOptions={districtOptions}
          wardOptions={wardOptions}
          localizedJobTypeOptions={localizedJobTypeOptions}
          localizedTypeOfWorkplaceOptions={localizedTypeOfWorkplaceOptions}
          localizedPositionOptions={localizedPositionOptions}
          localizedExperienceOptions={localizedExperienceOptions}
          localizedGenderOptions={localizedGenderOptions}
          onReset={handleReset}
          onToggleAdvancedFilter={handleChangeShowFilter}
        />
      ) : null}
    </Box>
  );
};

export default JobPostSearch;


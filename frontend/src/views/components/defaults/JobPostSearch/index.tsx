import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Box, Button, Card, IconButton, Stack, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import InputBaseSearchHomeCustom from '../../../../components/Common/Controls/InputBaseSearchHomeCustom';
import SingleSelectSearchCustom from '../../../../components/Common/Controls/SingleSelectSearchCustom';
import formatAmount from '../../../../utils/funcUtils';
import { PaginatedResponse } from '@/types/api';
import commonService from '../../../../services/commonService';
import {
  resetSearchJobPostFilter,
  searchJobPost,
  JobPostFilter,
} from '../../../../redux/filterSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useAppStore';
import { useConfig } from '@/hooks/useConfig';
import { SelectOption } from '../../../../types/models';

const JobPostSearch = () => {
  const { t } = useTranslation(['public', 'common']);
  const dispatch = useAppDispatch();
  const { allConfig } = useConfig();
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const [showAdvanceFilter, setShowAdvanceFilter] = React.useState(false);
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);
  const [wardOptions, setWardOptions] = React.useState<SelectOption[]>([]);
  const prevCityIdRef = React.useRef<string | number | null>(null);
  const prevDistrictIdRef = React.useRef<string | number | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm({
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

  React.useEffect(() => {
    const loadDistricts = async () => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        setDistrictOptions(resData.data?.map(d => ({ id: d.id, name: d.name })) || []);
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== cityId) {
          setValue('districtId', '');
          setValue('wardId', '');
        }
      } catch (error) {
        setDistrictOptions([]);
      }
    };

    if (cityId) {
      loadDistricts();
    } else {
      setDistrictOptions([]);
      if (prevCityIdRef.current !== null) {
        setValue('districtId', '');
        setValue('wardId', '');
      }
    }
    prevCityIdRef.current = cityId || null;
  }, [cityId, setValue]);

  React.useEffect(() => {
    const loadWards = async () => {
      try {
        const resData = await commonService.getWardsByDistrictId(districtId);
        setWardOptions(resData.data?.map(w => ({ id: w.id, name: w.name })) || []);
      } catch (error) {
        setWardOptions([]);
      }
    };

    if (districtId) {
      loadWards();
    } else {
      setWardOptions([]);
      if (prevDistrictIdRef.current !== null) {
        setValue('wardId', '');
      }
    }
    prevDistrictIdRef.current = districtId || null;
  }, [districtId, setValue]);

  const handleChangeShowFilter = () => {
    setShowAdvanceFilter(!showAdvanceFilter);
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

  const handleFilter = (data: Partial<JobPostFilter> & Record<string, unknown>) => {

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

      <Card
        sx={{
          p: 2,
          boxShadow: 3,
          mt: -1,
          display: showAdvanceFilter ? 'block' : 'none',
        }}
      >
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 1,
              xl: 1
            }}>
            <Typography
              variant="subtitle2"
              sx={{ pt: 1, fontSize: 14 }}
              color="GrayText"
            >
              {t('jobSearch.advancedFilter')}
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 2,
              xl: 2
            }}>
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
              xl: 2
            }}>
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
              xl: 2
            }}>
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
              xl: 2
            }}>
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
              xl: 2
            }}>
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
              xl: 2
            }}>
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
              xl: 2
            }}>
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
              xl: 1
            }}>
            <Stack
              direction="row"
              justifyContent={{ xs: 'flex-end', lg: 'center', xl: 'center' }}
            >
              <IconButton
                color="primary"
                aria-label="reset"
                onClick={handleReset}
              >
                <DeleteForeverIcon color="secondary" />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="clear"
                onClick={handleChangeShowFilter}
              >
                <ClearIcon color="error" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default JobPostSearch;

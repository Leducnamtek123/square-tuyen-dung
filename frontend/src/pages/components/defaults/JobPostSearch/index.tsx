import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Card, IconButton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import InputBaseSearchHomeCustom from '../../../../components/controls/InputBaseSearchHomeCustom';
import SingleSelectSearchCustom from '../../../../components/controls/SingleSelectSearchCustom';
import {
  resetSearchJobPostFilter,
  searchJobPost,
} from '../../../../redux/filterSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useAppStore';

const JobPostSearch = () => {
  const { t } = useTranslation('public');
  const dispatch = useAppDispatch();
  const { allConfig } = useAppSelector((state) => state.config);
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const [showAdvanceFilter, setShowAdvanceFilter] = React.useState(false);
  const { control, handleSubmit, reset } = useForm();
  const localizedJobTypeOptions = React.useMemo(
    () =>
      ((allConfig?.jobTypeOptions || []) as any[]).map((option) => ({
        ...option,
        name:
          t(`jobSearch.jobTypeOptions.${option.id}`, { defaultValue: '' }) ||
          option.name,
      })),
    [allConfig?.jobTypeOptions, t]
  );
  const localizedTypeOfWorkplaceOptions = React.useMemo(
    () =>
      ((allConfig?.typeOfWorkplaceOptions || []) as any[]).map((option) => ({
        ...option,
        name:
          t(`jobSearch.workplaceOptions.${option.id}`, { defaultValue: '' }) ||
          option.name,
      })),
    [allConfig?.typeOfWorkplaceOptions, t]
  );

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      ...jobPostFilter,
    }));
  }, [jobPostFilter, reset]);

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
    } catch (error) {
      console.error('Loi khi set kw vao local storage: ', error);
    }
  };

  const handleFilter = (data: any) => {

    handleSaveKeywordLocalStorage(data?.kw);

    dispatch(searchJobPost(data));

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
              lg: 3,
              xl: 3
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
              lg: 3,
              xl: 3
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
                sx={{ py: 1 }}
                type="submit"
              >
                {t('jobSearch.searchButton')}
              </Button>
              <Button
                variant="contained"
                sx={{ py: 1, color: 'white' }}
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
              options={allConfig?.positionOptions || []}
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
              options={allConfig?.experienceOptions || []}
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
              options={allConfig?.genderOptions || []}
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



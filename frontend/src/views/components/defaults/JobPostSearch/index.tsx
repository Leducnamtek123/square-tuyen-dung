'use client';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Box, Button, Card, Chip, Stack } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import SearchIcon from '@mui/icons-material/Search';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import InputBaseSearchHomeCustom from '@/components/Common/Controls/InputBaseSearchHomeCustom';
import SingleSelectSearchCustom from '@/components/Common/Controls/SingleSelectSearchCustom';
import FormPopup from '@/components/Common/Controls/FormPopup';
import {
  resetSearchJobPostFilter,
  searchJobPost,
  JobPostFilter,
} from '@/redux/filterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { ROLES_NAME, ROUTES } from '@/configs/constants';
import { useConfig } from '@/hooks/useConfig';
import { SelectOption } from '@/types/models';
import type { JobPostSearchFormValues } from './types';
import { useJobPostSearchLocationOptions } from './useJobPostSearchLocationOptions';
import JobPostSearchAdvancedFilters from './JobPostSearchAdvancedFilters';
import JobPostNotificationForm, {
  getDefaultFrequency,
  type JobPostNotificationFormValues,
} from '@/views/components/jobSeekers/JobPostNotificationForm';
import jobPostNotificationService from '@/services/jobPostNotificationService';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import {
  PROJECT_SEARCH_HISTORY_STORAGE_KEY,
  LEGACY_PROJECT_SEARCH_HISTORY_STORAGE_KEY,
  readVersionedJson,
  writeVersionedJson,
} from '@/utils/storageKeys';

const JobPostSearch = () => {
  const { t } = useTranslation(['public', 'common']);
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { allConfig } = useConfig();
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const [showAdvanceFilter, setShowAdvanceFilter] = React.useState(false);
  const [openSaveAlert, setOpenSaveAlert] = React.useState(false);
  const [saveAlertValues, setSaveAlertValues] = React.useState<Partial<JobPostNotificationFormValues> | null>(null);
  const { control, handleSubmit, reset, getValues, setValue } = useForm<JobPostSearchFormValues>({
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

  const positionId = useWatch({
    control,
    name: 'positionId',
  });

  const experienceId = useWatch({
    control,
    name: 'experienceId',
  });

  const jobTypeId = useWatch({
    control,
    name: 'jobTypeId',
  });

  const typeOfWorkplaceId = useWatch({
    control,
    name: 'typeOfWorkplaceId',
  });

  const genderId = useWatch({
    control,
    name: 'genderId',
  });

  const wardId = useWatch({
    control,
    name: 'wardId',
  });

  const activeAdvancedFilterCount = React.useMemo(() => {
    let count = 0;
    if (districtId) count++;
    if (wardId) count++;
    if (positionId) count++;
    if (experienceId) count++;
    if (jobTypeId) count++;
    if (typeOfWorkplaceId) count++;
    if (genderId) count++;
    return count;
  }, [districtId, wardId, positionId, experienceId, jobTypeId, typeOfWorkplaceId, genderId]);

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
        const keywordList =
          readVersionedJson<string[]>(PROJECT_SEARCH_HISTORY_STORAGE_KEY, [
            LEGACY_PROJECT_SEARCH_HISTORY_STORAGE_KEY,
          ]) ?? [];
        if (!keywordList.includes(kw)) {
          const nextKeywords =
            keywordList.length >= 5
              ? [kw, ...keywordList.slice(0, keywordList.length - 1)]
              : [kw, ...keywordList];
          writeVersionedJson(PROJECT_SEARCH_HISTORY_STORAGE_KEY, nextKeywords);
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

  const handleOpenSaveAlert = () => {
    if (!isAuthenticated || currentUser?.roleName !== ROLES_NAME.JOB_SEEKER) {
      push(`/${ROUTES.AUTH.LOGIN}`);
      return;
    }
    const values = getValues();
    setSaveAlertValues({
      jobName: values.kw || t('jobSearch.savedAlert.defaultName'),
      career: Number(values.careerId) || 0,
      city: Number(values.cityId) || 0,
      position: values.positionId ? Number(values.positionId) : null,
      experience: values.experienceId ? Number(values.experienceId) : null,
      salary: null,
      frequency: getDefaultFrequency(allConfig?.frequencyNotificationOptions),
    });
    setOpenSaveAlert(true);
  };

  const handleSaveAlert = async (data: JobPostNotificationFormValues) => {
    try {
      await jobPostNotificationService.addJobPostNotification({
        jobName: data.jobName,
        frequency: Number(data.frequency),
        career: Number(data.career),
        city: Number(data.city),
        position: data.position ?? null,
        experience: data.experience ?? null,
        salary: data.salary ?? null,
      });
      toastMessages.success(t('jobSearch.savedAlert.success'));
      setOpenSaveAlert(false);
    } catch (error) {
      errorHandling(error);
    }
  };

  const handleReset = () => {
    dispatch(resetSearchJobPostFilter());
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFilter)}>
      <Card
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          boxShadow: '0 10px 28px rgba(15, 57, 127, 0.08)',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 6,
              lg: 4,
              xl: 4,
            }}
          >
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
              xl: 2,
            }}
          >
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
              xl: 2,
            }}
          >
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
              xl: 4,
            }}
          >
            <Stack
              spacing={1.5}
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
                startIcon={<SearchIcon />}
                sx={{
                  whiteSpace: 'nowrap',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: 'center',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  boxShadow: '0 2px 8px -1px rgba(37,99,235,0.3)',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                    boxShadow: '0 4px 14px -2px rgba(37,99,235,0.4)',
                  },
                }}
                type="submit"
              >
                {t('jobSearch.searchButton')}
              </Button>
              <Button
                variant="outlined"
                sx={{
                  whiteSpace: 'nowrap',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: 'center',
                  borderRadius: '10px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                  },
                }}
                startIcon={<BookmarkAddIcon sx={{ color: '#2563eb' }} />}
                onClick={handleOpenSaveAlert}
              >
                {t('jobSearch.saveSearch')}
              </Button>
              <Button
                variant="outlined"
                sx={{
                  whiteSpace: 'nowrap',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: 'center',
                  borderRadius: '10px',
                  borderColor: activeAdvancedFilterCount > 0 ? '#2563eb' : '#cbd5e1',
                  backgroundColor: activeAdvancedFilterCount > 0 ? '#eff6ff' : '#ffffff',
                  color: activeAdvancedFilterCount > 0 ? '#2563eb' : '#0f172a',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: '#dbeafe',
                  },
                  transition: 'all 0.15s ease-in-out',
                }}
                startIcon={<TuneRoundedIcon sx={{ color: activeAdvancedFilterCount > 0 ? '#2563eb' : '#0f172a' }} />}
                onClick={handleChangeShowFilter}
              >
                {t('jobSearch.advancedFilter')}
                {activeAdvancedFilterCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.75,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      lineHeight: 1.4,
                    }}
                  >
                    {activeAdvancedFilterCount}
                  </Box>
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* ── Active Filters Chips Bar ────────────────────────────────────────── */}
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
            Đang lọc:
          </Box>

          {districtId && (
            <Chip
              size="small"
              label={`Quận/Huyện: ${districtOptions.find((d) => String(d.id) === String(districtId))?.name || districtId}`}
              onDelete={() => {
                setValue('districtId', '');
                setValue('wardId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {wardId && (
            <Chip
              size="small"
              label={`Phường/Xã: ${wardOptions.find((w) => String(w.id) === String(wardId))?.name || wardId}`}
              onDelete={() => {
                setValue('wardId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {positionId && (
            <Chip
              size="small"
              label={`Cấp bậc: ${localizedPositionOptions.find((p) => String(p.id) === String(positionId))?.name || positionId}`}
              onDelete={() => {
                setValue('positionId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {experienceId && (
            <Chip
              size="small"
              label={`Kinh nghiệm: ${localizedExperienceOptions.find((e) => String(e.id) === String(experienceId))?.name || experienceId}`}
              onDelete={() => {
                setValue('experienceId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {jobTypeId && (
            <Chip
              size="small"
              label={`Hình thức: ${localizedJobTypeOptions.find((j) => String(j.id) === String(jobTypeId))?.name || jobTypeId}`}
              onDelete={() => {
                setValue('jobTypeId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {typeOfWorkplaceId && (
            <Chip
              size="small"
              label={`Nơi làm việc: ${localizedTypeOfWorkplaceOptions.find((w) => String(w.id) === String(typeOfWorkplaceId))?.name || typeOfWorkplaceId}`}
              onDelete={() => {
                setValue('typeOfWorkplaceId', '');
                handleSubmit(handleFilter)();
              }}
              sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          )}

          {genderId && (
            <Chip
              size="small"
              label={`Giới tính: ${localizedGenderOptions.find((g) => String(g.id) === String(genderId))?.name || genderId}`}
              onDelete={() => {
                setValue('genderId', '');
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
            Xóa tất cả
          </Button>
        </Box>
      )}

      {/* ── Advanced Filters Drawer ────────────────────────────────────────── */}
      <JobPostSearchAdvancedFilters
        open={showAdvanceFilter}
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
        onApply={handleSubmit(handleFilter)}
        activeFilterCount={activeAdvancedFilterCount}
      />

      <FormPopup
        title={t('jobSearch.saveSearch')}
        openPopup={openSaveAlert}
        setOpenPopup={setOpenSaveAlert}
        buttonText={t('jobSearch.saveSearch')}
        buttonIcon={null}
      >
        <JobPostNotificationForm
          handleAddOrUpdate={handleSaveAlert}
          editData={null}
          initialValues={saveAlertValues}
        />
      </FormPopup>
    </Box>
  );
};

export default JobPostSearch;

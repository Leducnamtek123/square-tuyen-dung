'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Stack } from '@mui/material';
import { resetSearchResume, searchResume } from '../../../../redux/filterSlice';
import type { ResumeFilter } from '../../../../redux/filterSlice';
import { useConfig } from '@/hooks/useConfig';
import {
  useGlobalFilter,
  GlobalFilterBar,
  GlobalFilterDrawer,
  ActiveFilterChips,
  candidateFilterConfig,
} from '../../../../components/Common/Filters';

export interface ProfileSearchValues {
  kw: string;
  cityId: string | number;
  careerId: string | number;
  experienceId: string | number;
  positionId: string | number;
  academicLevelId: string | number;
  typeOfWorkplaceId: string | number;
  jobTypeId: string | number;
  genderId: string | number;
  maritalStatusId: string | number;
  page?: number;
  pageSize?: number;
}

export const useProfileSearch = () => {
  const { t } = useTranslation(['employer', 'common']);
  const dispatch = useDispatch();
  const { allConfig } = useConfig();
  const { resumeFilter } = useAppSelector((state) => state.filter);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { control, reset, handleSubmit } = useForm<ProfileSearchValues>({
    defaultValues: resumeFilter as ProfileSearchValues,
  });

  useEffect(() => {
    reset(resumeFilter as ProfileSearchValues);
  }, [resumeFilter, reset]);

  const handleFilter = (data: ProfileSearchValues) => {
    dispatch(searchResume({ ...data, page: 1, pageSize: 6 } as ResumeFilter));
  };

  const handleReset = () => {
    dispatch(resetSearchResume());
  };

  const activeFilterCount = Object.keys(resumeFilter).filter((key) => {
    const ignoredKeys = ['page', 'pageSize', 'kw', 'cityId'];
    if (ignoredKeys.includes(key)) return false;
    const val = (resumeFilter as any)[key];
    return val !== undefined && val !== '' && val !== null;
  }).length;

  return {
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    t,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
  };
};

export const ProfileSearchBar: React.FC<any> = (props) => (
  <GlobalFilterBar
    control={props.control}
    handleSubmit={props.handleSubmit}
    handleSearchSubmit={(data) => props.handleFilter?.(data)}
    cityOptions={props.allConfig?.cityOptions || []}
    searchPlaceholder={props.t ? props.t('employer:profileSearch.placeholder.enterkeywords') : 'Nhập từ khóa...'}
    cityPlaceholder={props.t ? props.t('employer:profileSearch.placeholder.selectcityprovince') : 'Chọn tỉnh thành'}
    onOpenFilterDrawer={props.onOpenFilterDrawer}
    activeFilterCount={props.activeFilterCount}
  />
);

export const ProfileFilterDrawer: React.FC<any> = (props) => (
  <GlobalFilterDrawer
    open={props.open}
    onClose={props.onClose}
    config={candidateFilterConfig}
    control={props.control}
    allConfig={props.allConfig}
    handleReset={props.handleReset}
    handleSubmit={props.handleSubmit}
    handleApply={(data) => props.handleFilter?.(data)}
  />
);

export const ProfileSearch: React.FC = () => {
  const { t } = useTranslation(['employer', 'common']);
  const dispatch = useDispatch();
  const { allConfig } = useConfig();
  const { resumeFilter } = useAppSelector((state) => state.filter);

  const {
    appliedValues,
    draftValues,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    activeTags,
    handleApply,
    handleReset,
    handleRemoveTag,
  } = useGlobalFilter<ProfileSearchValues>({
    config: candidateFilterConfig,
    initialAppliedValues: resumeFilter as ProfileSearchValues,
    allConfig,
    onApply: (nextValues) => {
      dispatch(searchResume({ ...nextValues, page: 1, pageSize: 6 } as ResumeFilter));
    },
    onReset: () => {
      dispatch(resetSearchResume());
    },
  });

  const { control, reset, handleSubmit } = useForm<ProfileSearchValues>({
    defaultValues: draftValues,
  });

  useEffect(() => {
    reset(draftValues);
  }, [draftValues, reset]);

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {/* Primary Filter Search Bar */}
      <GlobalFilterBar
        control={control}
        handleSubmit={handleSubmit}
        handleSearchSubmit={(data) => handleApply(data)}
        cityOptions={allConfig?.cityOptions || []}
        searchPlaceholder={t('employer:profileSearch.placeholder.enterkeywords')}
        cityPlaceholder={t('employer:profileSearch.placeholder.selectcityprovince')}
        onOpenFilterDrawer={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Active Filter Chips Display */}
      <ActiveFilterChips
        tags={activeTags}
        onRemoveTag={handleRemoveTag}
        onClearAll={handleReset}
      />

      {/* Advanced Filter Drawer */}
      <GlobalFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        config={candidateFilterConfig}
        control={control}
        allConfig={allConfig}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        handleApply={(data) => handleApply(data)}
      />
    </Stack>
  );
};

export default ProfileSearch;
